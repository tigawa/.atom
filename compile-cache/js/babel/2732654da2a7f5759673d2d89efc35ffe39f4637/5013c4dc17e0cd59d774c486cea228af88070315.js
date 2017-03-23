'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Conflict = undefined;

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _side = require('./side');

var _navigator = require('./navigator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Public: Model an individual conflict parsed from git's automatic conflict resolution output.
let Conflict = exports.Conflict = class Conflict {

  /*
   * Private: Initialize a new Conflict with its constituent Sides, Navigator, and the MergeState
   * it belongs to.
   *
   * ours [Side] the lines of this conflict that the current user contributed (by our best guess).
   * theirs [Side] the lines of this conflict that another contributor created.
   * base [Side] the lines of merge base of this conflict. Optional.
   * navigator [Navigator] maintains references to surrounding Conflicts in the original file.
   * state [MergeState] repository-wide information about the current merge.
   */
  constructor(ours, theirs, base, navigator, merge) {
    this.ours = ours;
    this.theirs = theirs;
    this.base = base;
    this.navigator = navigator;
    this.merge = merge;

    this.emitter = new _atom.Emitter();

    // Populate back-references
    this.ours.conflict = this;
    this.theirs.conflict = this;
    if (this.base) {
      this.base.conflict = this;
    }
    this.navigator.conflict = this;

    // Begin unresolved
    this.resolution = null;
  }

  /*
   * Public: Has this conflict been resolved in any way?
   *
   * Return [Boolean]
   */
  isResolved() {
    return this.resolution !== null;
  }

  /*
   * Public: Attach an event handler to be notified when this conflict is resolved.
   *
   * callback [Function]
   */
  onDidResolveConflict(callback) {
    return this.emitter.on('resolve-conflict', callback);
  }

  /*
   * Public: Specify which Side is to be kept. Note that either side may have been modified by the
   * user prior to resolution. Notify any subscribers.
   *
   * side [Side] our changes or their changes.
   */
  resolveAs(side) {
    this.resolution = side;
    this.emitter.emit('resolve-conflict');
  }

  /*
   * Public: Locate the position that the editor should scroll to in order to make this conflict
   * visible.
   *
   * Return [Point] buffer coordinates
   */
  scrollTarget() {
    return this.ours.marker.getTailBufferPosition();
  }

  /*
   * Public: Audit all Marker instances owned by subobjects within this Conflict.
   *
   * Return [Array<Marker>]
   */
  markers() {
    const ms = [this.ours.markers(), this.theirs.markers(), this.navigator.markers()];
    if (this.baseSide) {
      ms.push(this.baseSide.markers());
    }
    return _underscorePlus2.default.flatten(ms, true);
  }

  /*
   * Public: Console-friendly identification of this conflict.
   *
   * Return [String] that distinguishes this conflict from others.
   */
  toString() {
    return `[conflict: ${this.ours} ${this.theirs}]`;
  }

  /*
   * Public: Parse any conflict markers in a TextEditor's buffer and return a Conflict that contains
   * markers corresponding to each.
   *
   * merge [MergeState] Repository-wide state of the merge.
   * editor [TextEditor] The editor to search.
   * return [Array<Conflict>] A (possibly empty) collection of parsed Conflicts.
   */
  static all(merge, editor) {
    const conflicts = [];
    let lastRow = -1;

    editor.getBuffer().scan(CONFLICT_START_REGEX, m => {
      conflictStartRow = m.range.start.row;
      if (conflictStartRow < lastRow) {
        // Match within an already-parsed conflict.
        return;
      }

      const visitor = new ConflictVisitor(merge, editor);

      try {
        lastRow = parseConflict(merge, editor, conflictStartRow, visitor);
        const conflict = visitor.conflict();

        if (conflicts.length > 0) {
          conflict.navigator.linkToPrevious(conflicts[conflicts.length - 1]);
        }
        conflicts.push(conflict);
      } catch (e) {
        if (!e.parserState) throw e;

        if (!atom.inSpecMode()) {
          console.error(`Unable to parse conflict: ${e.message}\n${e.stack}`);
        }
      }
    });

    return conflicts;
  }
};

// Regular expression that matches the beginning of a potential conflict.

const CONFLICT_START_REGEX = /^<{7} (.+)\r?\n/g;

// Side positions.
const TOP = 'top';
const BASE = 'base';
const BOTTOM = 'bottom';

// Options used to initialize markers.
const options = {
  persistent: false,
  invalidate: 'never'
};

/*
 * Private: conflict parser visitor that ignores all events.
 */
let NoopVisitor = class NoopVisitor {

  visitOurSide(position, bannerRow, textRowStart, textRowEnd) {}

  visitBaseSide(position, bannerRow, textRowStart, textRowEnd) {}

  visitSeparator(sepRowStart, sepRowEnd) {}

  visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {}

};

/*
 * Private: conflict parser visitor that marks each buffer range and assembles a Conflict from the
 * pieces.
 */

let ConflictVisitor = class ConflictVisitor {

  /*
   * merge - [MergeState] passed to each instantiated Side.
   * editor - [TextEditor] displaying the conflicting text.
   */
  constructor(merge, editor) {
    this.merge = merge;
    this.editor = editor;
    this.previousSide = null;

    this.ourSide = null;
    this.baseSide = null;
    this.navigator = null;
  }

  /*
   * position - [String] one of TOP or BOTTOM.
   * bannerRow - [Integer] of the buffer row that contains our side's banner.
   * textRowStart - [Integer] of the first buffer row that contain this side's text.
   * textRowEnd - [Integer] of the first buffer row beyond the extend of this side's text.
   */
  visitOurSide(position, bannerRow, textRowStart, textRowEnd) {
    this.ourSide = this.markSide(position, _side.OurSide, bannerRow, textRowStart, textRowEnd);
  }

  /*
   * bannerRow - [Integer] the buffer row that contains our side's banner.
   * textRowStart - [Integer] first buffer row that contain this side's text.
   * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
   */
  visitBaseSide(bannerRow, textRowStart, textRowEnd) {
    this.baseSide = this.markSide(BASE, _side.BaseSide, bannerRow, textRowStart, textRowEnd);
  }

  /*
   * sepRowStart - [Integer] buffer row that contains the "=======" separator.
   * sepRowEnd - [Integer] the buffer row after the separator.
   */
  visitSeparator(sepRowStart, sepRowEnd) {
    const marker = this.editor.markBufferRange([[sepRowStart, 0], [sepRowEnd, 0]], options);
    this.previousSide.followingMarker = marker;

    this.navigator = new _navigator.Navigator(marker);
    this.previousSide = this.navigator;
  }

  /*
   * position - [String] Always BASE; accepted for consistency.
   * bannerRow - [Integer] the buffer row that contains our side's banner.
   * textRowStart - [Integer] first buffer row that contain this side's text.
   * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
   */
  visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {
    this.theirSide = this.markSide(position, _side.TheirSide, bannerRow, textRowStart, textRowEnd);
  }

  markSide(position, sideKlass, bannerRow, textRowStart, textRowEnd) {
    const description = this.sideDescription(bannerRow);

    const bannerMarker = this.editor.markBufferRange([[bannerRow, 0], [bannerRow + 1, 0]], options);

    if (this.previousSide) {
      this.previousSide.followingMarker = bannerMarker;
    }

    const textRange = [[textRowStart, 0], [textRowEnd, 0]];
    const textMarker = this.editor.markBufferRange(textRange, options);
    const text = this.editor.getTextInBufferRange(textRange);

    const side = new sideKlass(text, description, textMarker, bannerMarker, position);
    this.previousSide = side;
    return side;
  }

  /*
   * Parse the banner description for the current side from a banner row.
   */
  sideDescription(bannerRow) {
    return this.editor.lineTextForBufferRow(bannerRow).match(/^[<|>]{7} (.*)$/)[1];
  }

  conflict() {
    this.previousSide.followingMarker = this.previousSide.refBannerMarker;

    return new Conflict(this.ourSide, this.theirSide, this.baseSide, this.navigator, this.merge);
  }

};

/*
 * Private: parseConflict discovers git conflict markers in a corpus of text and constructs Conflict
 * instances that mark the correct lines.
 *
 * Returns [Integer] the buffer row after the final <<<<<< boundary.
 */

const parseConflict = function (merge, editor, row, visitor) {
  let lastBoundary = null;

  // Visit a side that begins with a banner and description as its first line.
  const visitHeaderSide = (position, visitMethod) => {
    const sideRowStart = row;
    row += 1;
    advanceToBoundary('|=');
    const sideRowEnd = row;

    visitor[visitMethod](position, sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit the base side from diff3 output, if one is present, then visit the separator.
  const visitBaseAndSeparator = () => {
    if (lastBoundary === '|') {
      visitBaseSide();
    }

    visitSeparator();
  };

  // Visit a base side from diff3 output.
  const visitBaseSide = () => {
    const sideRowStart = row;
    row += 1;

    let b = advanceToBoundary('<=');
    while (b === '<') {
      // Embedded recursive conflict within a base side, caused by a criss-cross merge.
      // Advance beyond it without marking anything.
      row = parseConflict(merge, editor, row, new NoopVisitor());
      b = advanceToBoundary('<=');
    }

    const sideRowEnd = row;

    visitor.visitBaseSide(sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit a "========" separator.
  const visitSeparator = () => {
    const sepRowStart = row;
    row += 1;
    const sepRowEnd = row;

    visitor.visitSeparator(sepRowStart, sepRowEnd);
  };

  // Vidie a side with a banner and description as its last line.
  const visitFooterSide = (position, visitMethod) => {
    const sideRowStart = row;
    const b = advanceToBoundary('>');
    row += 1;
    sideRowEnd = row;

    visitor[visitMethod](position, sideRowEnd - 1, sideRowStart, sideRowEnd - 1);
  };

  // Determine if the current row is a side boundary.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundary
  //   detected.
  //
  // Returns the matching boundaryKinds character, or `null` if none match.
  const isAtBoundary = (boundaryKinds = '<|=>') => {
    const line = editor.lineTextForBufferRow(row);
    for (b of boundaryKinds) {
      if (line.startsWith(b.repeat(7))) {
        return b;
      }
    }
    return null;
  };

  // Increment the current row until the current line matches one of the provided boundary kinds,
  // or until there are no more lines in the editor.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundaries
  //   that halt the progression.
  //
  // Returns the matching boundaryKinds character, or 'null' if there are no matches to the end of
  // the editor.
  const advanceToBoundary = (boundaryKinds = '<|=>') => {
    let b = isAtBoundary(boundaryKinds);
    while (b === null) {
      row += 1;
      if (row > editor.getLastBufferRow()) {
        const e = new Error('Unterminated conflict side');
        e.parserState = true;
        throw e;
      }
      b = isAtBoundary(boundaryKinds);
    }

    lastBoundary = b;
    return b;
  };

  if (!merge.isRebase) {
    visitHeaderSide(TOP, 'visitOurSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitTheirSide');
  } else {
    visitHeaderSide(TOP, 'visitTheirSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitOurSide');
  }

  return row;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZsaWN0LmpzIl0sIm5hbWVzIjpbIkNvbmZsaWN0IiwiY29uc3RydWN0b3IiLCJvdXJzIiwidGhlaXJzIiwiYmFzZSIsIm5hdmlnYXRvciIsIm1lcmdlIiwiZW1pdHRlciIsImNvbmZsaWN0IiwicmVzb2x1dGlvbiIsImlzUmVzb2x2ZWQiLCJvbkRpZFJlc29sdmVDb25mbGljdCIsImNhbGxiYWNrIiwib24iLCJyZXNvbHZlQXMiLCJzaWRlIiwiZW1pdCIsInNjcm9sbFRhcmdldCIsIm1hcmtlciIsImdldFRhaWxCdWZmZXJQb3NpdGlvbiIsIm1hcmtlcnMiLCJtcyIsImJhc2VTaWRlIiwicHVzaCIsImZsYXR0ZW4iLCJ0b1N0cmluZyIsImFsbCIsImVkaXRvciIsImNvbmZsaWN0cyIsImxhc3RSb3ciLCJnZXRCdWZmZXIiLCJzY2FuIiwiQ09ORkxJQ1RfU1RBUlRfUkVHRVgiLCJtIiwiY29uZmxpY3RTdGFydFJvdyIsInJhbmdlIiwic3RhcnQiLCJyb3ciLCJ2aXNpdG9yIiwiQ29uZmxpY3RWaXNpdG9yIiwicGFyc2VDb25mbGljdCIsImxlbmd0aCIsImxpbmtUb1ByZXZpb3VzIiwiZSIsInBhcnNlclN0YXRlIiwiYXRvbSIsImluU3BlY01vZGUiLCJjb25zb2xlIiwiZXJyb3IiLCJtZXNzYWdlIiwic3RhY2siLCJUT1AiLCJCQVNFIiwiQk9UVE9NIiwib3B0aW9ucyIsInBlcnNpc3RlbnQiLCJpbnZhbGlkYXRlIiwiTm9vcFZpc2l0b3IiLCJ2aXNpdE91clNpZGUiLCJwb3NpdGlvbiIsImJhbm5lclJvdyIsInRleHRSb3dTdGFydCIsInRleHRSb3dFbmQiLCJ2aXNpdEJhc2VTaWRlIiwidmlzaXRTZXBhcmF0b3IiLCJzZXBSb3dTdGFydCIsInNlcFJvd0VuZCIsInZpc2l0VGhlaXJTaWRlIiwicHJldmlvdXNTaWRlIiwib3VyU2lkZSIsIm1hcmtTaWRlIiwibWFya0J1ZmZlclJhbmdlIiwiZm9sbG93aW5nTWFya2VyIiwidGhlaXJTaWRlIiwic2lkZUtsYXNzIiwiZGVzY3JpcHRpb24iLCJzaWRlRGVzY3JpcHRpb24iLCJiYW5uZXJNYXJrZXIiLCJ0ZXh0UmFuZ2UiLCJ0ZXh0TWFya2VyIiwidGV4dCIsImdldFRleHRJbkJ1ZmZlclJhbmdlIiwibGluZVRleHRGb3JCdWZmZXJSb3ciLCJtYXRjaCIsInJlZkJhbm5lck1hcmtlciIsImxhc3RCb3VuZGFyeSIsInZpc2l0SGVhZGVyU2lkZSIsInZpc2l0TWV0aG9kIiwic2lkZVJvd1N0YXJ0IiwiYWR2YW5jZVRvQm91bmRhcnkiLCJzaWRlUm93RW5kIiwidmlzaXRCYXNlQW5kU2VwYXJhdG9yIiwiYiIsInZpc2l0Rm9vdGVyU2lkZSIsImlzQXRCb3VuZGFyeSIsImJvdW5kYXJ5S2luZHMiLCJsaW5lIiwic3RhcnRzV2l0aCIsInJlcGVhdCIsImdldExhc3RCdWZmZXJSb3ciLCJFcnJvciIsImlzUmViYXNlIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQUVBOztBQUNBOzs7O0FBRUE7O0FBQ0E7Ozs7QUFFQTtJQUNhQSxRLFdBQUFBLFEsR0FBTixNQUFNQSxRQUFOLENBQWU7O0FBRXBCOzs7Ozs7Ozs7O0FBVUFDLGNBQWFDLElBQWIsRUFBbUJDLE1BQW5CLEVBQTJCQyxJQUEzQixFQUFpQ0MsU0FBakMsRUFBNENDLEtBQTVDLEVBQW1EO0FBQ2pELFNBQUtKLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhQSxLQUFiOztBQUVBLFNBQUtDLE9BQUwsR0FBZSxtQkFBZjs7QUFFQTtBQUNBLFNBQUtMLElBQUwsQ0FBVU0sUUFBVixHQUFxQixJQUFyQjtBQUNBLFNBQUtMLE1BQUwsQ0FBWUssUUFBWixHQUF1QixJQUF2QjtBQUNBLFFBQUksS0FBS0osSUFBVCxFQUFlO0FBQ2IsV0FBS0EsSUFBTCxDQUFVSSxRQUFWLEdBQXFCLElBQXJCO0FB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QUFQO0FBQ0QsQ0E5R0QiLCJmaWxlIjoiY29uZmxpY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnXG5cbmltcG9ydCB7U2lkZSwgT3VyU2lkZSwgVGhlaXJTaWRlLCBCYXNlU2lkZX0gZnJvbSAnLi9zaWRlJ1xuaW1wb3J0IHtOYXZpZ2F0b3J9IGZyb20gJy4vbmF2aWdhdG9yJ1xuXG4vLyBQdWJsaWM6IE1vZGVsIGFuIGluZGl2aWR1YWwgY29uZmxpY3QgcGFyc2VkIGZyb20gZ2l0J3MgYXV0b21hdGljIGNvbmZsaWN0IHJlc29sdXRpb24gb3V0cHV0LlxuZXhwb3J0IGNsYXNzIENvbmZsaWN0IHtcblxuICAvKlxuICAgKiBQcml2YXRlOiBJbml0aWFsaXplIGEgbmV3IENvbmZsaWN0IHdpdGggaXRzIGNvbnN0aXR1ZW50IFNpZGVzLCBOYXZpZ2F0b3IsIGFuZCB0aGUgTWVyZ2VTdGF0ZVxuICAgKiBpdCBiZWxvbmdzIHRvLlxuICAgKlxuICAgKiBvdXJzIFtTaWRlXSB0aGUgbGluZXMgb2YgdGhpcyBjb25mbGljdCB0aGF0IHRoZSBjdXJyZW50IHVzZXIgY29udHJpYnV0ZWQgKGJ5IG91ciBiZXN0IGd1ZXNzKS5cbiAgICogdGhlaXJzIFtTaWRlXSB0aGUgbGluZXMgb2YgdGhpcyBjb25mbGljdCB0aGF0IGFub3RoZXIgY29udHJpYnV0b3IgY3JlYXRlZC5cbiAgICogYmFzZSBbU2lkZV0gdGhlIGxpbmVzIG9mIG1lcmdlIGJhc2Ugb2YgdGhpcyBjb25mbGljdC4gT3B0aW9uYWwuXG4gICAqIG5hdmlnYXRvciBbTmF2aWdhdG9yXSBtYWludGFpbnMgcmVmZXJlbmNlcyB0byBzdXJyb3VuZGluZyBDb25mbGljdHMgaW4gdGhlIG9yaWdpbmFsIGZpbGUuXG4gICAqIHN0YXRlIFtNZXJnZVN0YXRlXSByZXBvc2l0b3J5LXdpZGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgbWVyZ2UuXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3VycywgdGhlaXJzLCBiYXNlLCBuYXZpZ2F0b3IsIG1lcmdlKSB7XG4gICAgdGhpcy5vdXJzID0gb3Vyc1xuICAgIHRoaXMudGhlaXJzID0gdGhlaXJzXG4gICAgdGhpcy5iYXNlID0gYmFzZVxuICAgIHRoaXMubmF2aWdhdG9yID0gbmF2aWdhdG9yXG4gICAgdGhpcy5tZXJnZSA9IG1lcmdlXG5cbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG5cbiAgICAvLyBQb3B1bGF0ZSBiYWNrLXJlZmVyZW5jZXNcbiAgICB0aGlzLm91cnMuY29uZmxpY3QgPSB0aGlzXG4gICAgdGhpcy50aGVpcnMuY29uZmxpY3QgPSB0aGlzXG4gICAgaWYgKHRoaXMuYmFzZSkge1xuICAgICAgdGhpcy5iYXNlLmNvbmZsaWN0ID0gdGhpc1xuICAgIH1cbiAgICB0aGlzLm5hdmlnYXRvci5jb25mbGljdCA9IHRoaXNcblxuICAgIC8vIEJlZ2luIHVucmVzb2x2ZWRcbiAgICB0aGlzLnJlc29sdXRpb24gPSBudWxsXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IEhhcyB0aGlzIGNvbmZsaWN0IGJlZW4gcmVzb2x2ZWQgaW4gYW55IHdheT9cbiAgICpcbiAgICogUmV0dXJuIFtCb29sZWFuXVxuICAgKi9cbiAgaXNSZXNvbHZlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHV0aW9uICE9PSBudWxsXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIHRvIGJlIG5vdGlmaWVkIHdoZW4gdGhpcyBjb25mbGljdCBpcyByZXNvbHZlZC5cbiAgICpcbiAgICogY2FsbGJhY2sgW0Z1bmN0aW9uXVxuICAgKi9cbiAgb25EaWRSZXNvbHZlQ29uZmxpY3QgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbigncmVzb2x2ZS1jb25mbGljdCcsIGNhbGxiYWNrKVxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBTcGVjaWZ5IHdoaWNoIFNpZGUgaXMgdG8gYmUga2VwdC4gTm90ZSB0aGF0IGVpdGhlciBzaWRlIG1heSBoYXZlIGJlZW4gbW9kaWZpZWQgYnkgdGhlXG4gICAqIHVzZXIgcHJpb3IgdG8gcmVzb2x1dGlvbi4gTm90aWZ5IGFueSBzdWJzY3JpYmVycy5cbiAgICpcbiAgICogc2lkZSBbU2lkZV0gb3VyIGNoYW5nZXMgb3IgdGhlaXIgY2hhbmdlcy5cbiAgICovXG4gIHJlc29sdmVBcyAoc2lkZSkge1xuICAgIHRoaXMucmVzb2x1dGlvbiA9IHNpZGVcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgncmVzb2x2ZS1jb25mbGljdCcpXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IExvY2F0ZSB0aGUgcG9zaXRpb24gdGhhdCB0aGUgZWRpdG9yIHNob3VsZCBzY3JvbGwgdG8gaW4gb3JkZXIgdG8gbWFrZSB0aGlzIGNvbmZsaWN0XG4gICAqIHZpc2libGUuXG4gICAqXG4gICAqIFJldHVybiBbUG9pbnRdIGJ1ZmZlciBjb29yZGluYXRlc1xuICAgKi9cbiAgc2Nyb2xsVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5vdXJzLm1hcmtlci5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBBdWRpdCBhbGwgTWFya2VyIGluc3RhbmNlcyBvd25lZCBieSBzdWJvYmplY3RzIHdpdGhpbiB0aGlzIENvbmZsaWN0LlxuICAgKlxuICAgKiBSZXR1cm4gW0FycmF5PE1hcmtlcj5dXG4gICAqL1xuICBtYXJrZXJzICgpIHtcbiAgICBjb25zdCBtcyA9IFt0aGlzLm91cnMubWFya2VycygpLCB0aGlzLnRoZWlycy5tYXJrZXJzKCksIHRoaXMubmF2aWdhdG9yLm1hcmtlcnMoKV1cbiAgICBpZiAodGhpcy5iYXNlU2lkZSkge1xuICAgICAgbXMucHVzaCh0aGlzLmJhc2VTaWRlLm1hcmtlcnMoKSlcbiAgICB9XG4gICAgcmV0dXJuIF8uZmxhdHRlbihtcywgdHJ1ZSlcbiAgfVxuXG4gIC8qXG4gICAqIFB1YmxpYzogQ29uc29sZS1mcmllbmRseSBpZGVudGlmaWNhdGlvbiBvZiB0aGlzIGNvbmZsaWN0LlxuICAgKlxuICAgKiBSZXR1cm4gW1N0cmluZ10gdGhhdCBkaXN0aW5ndWlzaGVzIHRoaXMgY29uZmxpY3QgZnJvbSBvdGhlcnMuXG4gICAqL1xuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIGBbY29uZmxpY3Q6ICR7dGhpcy5vdXJzfSAke3RoaXMudGhlaXJzfV1gXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IFBhcnNlIGFueSBjb25mbGljdCBtYXJrZXJzIGluIGEgVGV4dEVkaXRvcidzIGJ1ZmZlciBhbmQgcmV0dXJuIGEgQ29uZmxpY3QgdGhhdCBjb250YWluc1xuICAgKiBtYXJrZXJzIGNvcnJlc3BvbmRpbmcgdG8gZWFjaC5cbiAgICpcbiAgICogbWVyZ2UgW01lcmdlU3RhdGVdIFJlcG9zaXRvcnktd2lkZSBzdGF0ZSBvZiB0aGUgbWVyZ2UuXG4gICAqIGVkaXRvciBbVGV4dEVkaXRvcl0gVGhlIGVkaXRvciB0byBzZWFyY2guXG4gICAqIHJldHVybiBbQXJyYXk8Q29uZmxpY3Q+XSBBIChwb3NzaWJseSBlbXB0eSkgY29sbGVjdGlvbiBvZiBwYXJzZWQgQ29uZmxpY3RzLlxuICAgKi9cbiAgc3RhdGljIGFsbCAobWVyZ2UsIGVkaXRvcikge1xuICAgIGNvbnN0IGNvbmZsaWN0cyA9IFtdXG4gICAgbGV0IGxhc3RSb3cgPSAtMVxuXG4gICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNjYW4oQ09ORkxJQ1RfU1RBUlRfUkVHRVgsIChtKSA9PiB7XG4gICAgICBjb25mbGljdFN0YXJ0Um93ID0gbS5yYW5nZS5zdGFydC5yb3dcbiAgICAgIGlmIChjb25mbGljdFN0YXJ0Um93IDwgbGFzdFJvdykge1xuICAgICAgICAvLyBNYXRjaCB3aXRoaW4gYW4gYWxyZWFkeS1wYXJzZWQgY29uZmxpY3QuXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCB2aXNpdG9yID0gbmV3IENvbmZsaWN0VmlzaXRvcihtZXJnZSwgZWRpdG9yKVxuXG4gICAgICB0cnkge1xuICAgICAgICBsYXN0Um93ID0gcGFyc2VDb25mbGljdChtZXJnZSwgZWRpdG9yLCBjb25mbGljdFN0YXJ0Um93LCB2aXNpdG9yKVxuICAgICAgICBjb25zdCBjb25mbGljdCA9IHZpc2l0b3IuY29uZmxpY3QoKVxuXG4gICAgICAgIGlmIChjb25mbGljdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbmZsaWN0Lm5hdmlnYXRvci5saW5rVG9QcmV2aW91cyhjb25mbGljdHNbY29uZmxpY3RzLmxlbmd0aCAtIDFdKVxuICAgICAgICB9XG4gICAgICAgIGNvbmZsaWN0cy5wdXNoKGNvbmZsaWN0KVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoIWUucGFyc2VyU3RhdGUpIHRocm93IGVcblxuICAgICAgICBpZiAoIWF0b20uaW5TcGVjTW9kZSgpKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgVW5hYmxlIHRvIHBhcnNlIGNvbmZsaWN0OiAke2UubWVzc2FnZX1cXG4ke2Uuc3RhY2t9YClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gY29uZmxpY3RzXG4gIH1cbn1cblxuLy8gUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgYmVnaW5uaW5nIG9mIGEgcG90ZW50aWFsIGNvbmZsaWN0LlxuY29uc3QgQ09ORkxJQ1RfU1RBUlRfUkVHRVggPSAvXjx7N30gKC4rKVxccj9cXG4vZ1xuXG4vLyBTaWRlIHBvc2l0aW9ucy5cbmNvbnN0IFRPUCA9ICd0b3AnXG5jb25zdCBCQVNFID0gJ2Jhc2UnXG5jb25zdCBCT1RUT00gPSAnYm90dG9tJ1xuXG4vLyBPcHRpb25zIHVzZWQgdG8gaW5pdGlhbGl6ZSBtYXJrZXJzLlxuY29uc3Qgb3B0aW9ucyA9IHtcbiAgcGVyc2lzdGVudDogZmFsc2UsXG4gIGludmFsaWRhdGU6ICduZXZlcidcbn1cblxuLypcbiAqIFByaXZhdGU6IGNvbmZsaWN0IHBhcnNlciB2aXNpdG9yIHRoYXQgaWdub3JlcyBhbGwgZXZlbnRzLlxuICovXG5jbGFzcyBOb29wVmlzaXRvciB7XG5cbiAgdmlzaXRPdXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHsgfVxuXG4gIHZpc2l0QmFzZVNpZGUgKHBvc2l0aW9uLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkgeyB9XG5cbiAgdmlzaXRTZXBhcmF0b3IgKHNlcFJvd1N0YXJ0LCBzZXBSb3dFbmQpIHsgfVxuXG4gIHZpc2l0VGhlaXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHsgfVxuXG59XG5cbi8qXG4gKiBQcml2YXRlOiBjb25mbGljdCBwYXJzZXIgdmlzaXRvciB0aGF0IG1hcmtzIGVhY2ggYnVmZmVyIHJhbmdlIGFuZCBhc3NlbWJsZXMgYSBDb25mbGljdCBmcm9tIHRoZVxuICogcGllY2VzLlxuICovXG5jbGFzcyBDb25mbGljdFZpc2l0b3Ige1xuXG4gIC8qXG4gICAqIG1lcmdlIC0gW01lcmdlU3RhdGVdIHBhc3NlZCB0byBlYWNoIGluc3RhbnRpYXRlZCBTaWRlLlxuICAgKiBlZGl0b3IgLSBbVGV4dEVkaXRvcl0gZGlzcGxheWluZyB0aGUgY29uZmxpY3RpbmcgdGV4dC5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChtZXJnZSwgZWRpdG9yKSB7XG4gICAgdGhpcy5tZXJnZSA9IG1lcmdlXG4gICAgdGhpcy5lZGl0b3IgPSBlZGl0b3JcbiAgICB0aGlzLnByZXZpb3VzU2lkZSA9IG51bGxcblxuICAgIHRoaXMub3VyU2lkZSA9IG51bGxcbiAgICB0aGlzLmJhc2VTaWRlID0gbnVsbFxuICAgIHRoaXMubmF2aWdhdG9yID0gbnVsbFxuICB9XG5cbiAgLypcbiAgICogcG9zaXRpb24gLSBbU3RyaW5nXSBvbmUgb2YgVE9QIG9yIEJPVFRPTS5cbiAgICogYmFubmVyUm93IC0gW0ludGVnZXJdIG9mIHRoZSBidWZmZXIgcm93IHRoYXQgY29udGFpbnMgb3VyIHNpZGUncyBiYW5uZXIuXG4gICAqIHRleHRSb3dTdGFydCAtIFtJbnRlZ2VyXSBvZiB0aGUgZmlyc3QgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW4gdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICogdGV4dFJvd0VuZCAtIFtJbnRlZ2VyXSBvZiB0aGUgZmlyc3QgYnVmZmVyIHJvdyBiZXlvbmQgdGhlIGV4dGVuZCBvZiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKi9cbiAgdmlzaXRPdXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHtcbiAgICB0aGlzLm91clNpZGUgPSB0aGlzLm1hcmtTaWRlKHBvc2l0aW9uLCBPdXJTaWRlLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZClcbiAgfVxuXG4gIC8qXG4gICAqIGJhbm5lclJvdyAtIFtJbnRlZ2VyXSB0aGUgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW5zIG91ciBzaWRlJ3MgYmFubmVyLlxuICAgKiB0ZXh0Um93U3RhcnQgLSBbSW50ZWdlcl0gZmlyc3QgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW4gdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICogdGV4dFJvd0VuZCAtIFtJbnRlZ2VyXSBmaXJzdCBidWZmZXIgcm93IGJleW9uZCB0aGUgZXh0ZW5kIG9mIHRoaXMgc2lkZSdzIHRleHQuXG4gICAqL1xuICB2aXNpdEJhc2VTaWRlIChiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkge1xuICAgIHRoaXMuYmFzZVNpZGUgPSB0aGlzLm1hcmtTaWRlKEJBU0UsIEJhc2VTaWRlLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZClcbiAgfVxuXG4gIC8qXG4gICAqIHNlcFJvd1N0YXJ0IC0gW0ludGVnZXJdIGJ1ZmZlciByb3cgdGhhdCBjb250YWlucyB0aGUgXCI9PT09PT09XCIgc2VwYXJhdG9yLlxuICAgKiBzZXBSb3dFbmQgLSBbSW50ZWdlcl0gdGhlIGJ1ZmZlciByb3cgYWZ0ZXIgdGhlIHNlcGFyYXRvci5cbiAgICovXG4gIHZpc2l0U2VwYXJhdG9yIChzZXBSb3dTdGFydCwgc2VwUm93RW5kKSB7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbc2VwUm93U3RhcnQsIDBdLCBbc2VwUm93RW5kLCAwXV0sIG9wdGlvbnMpXG4gICAgdGhpcy5wcmV2aW91c1NpZGUuZm9sbG93aW5nTWFya2VyID0gbWFya2VyXG5cbiAgICB0aGlzLm5hdmlnYXRvciA9IG5ldyBOYXZpZ2F0b3IobWFya2VyKVxuICAgIHRoaXMucHJldmlvdXNTaWRlID0gdGhpcy5uYXZpZ2F0b3JcbiAgfVxuXG4gIC8qXG4gICAqIHBvc2l0aW9uIC0gW1N0cmluZ10gQWx3YXlzIEJBU0U7IGFjY2VwdGVkIGZvciBjb25zaXN0ZW5jeS5cbiAgICogYmFubmVyUm93IC0gW0ludGVnZXJdIHRoZSBidWZmZXIgcm93IHRoYXQgY29udGFpbnMgb3VyIHNpZGUncyBiYW5uZXIuXG4gICAqIHRleHRSb3dTdGFydCAtIFtJbnRlZ2VyXSBmaXJzdCBidWZmZXIgcm93IHRoYXQgY29udGFpbiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKiB0ZXh0Um93RW5kIC0gW0ludGVnZXJdIGZpcnN0IGJ1ZmZlciByb3cgYmV5b25kIHRoZSBleHRlbmQgb2YgdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICovXG4gIHZpc2l0VGhlaXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHtcbiAgICB0aGlzLnRoZWlyU2lkZSA9IHRoaXMubWFya1NpZGUocG9zaXRpb24sIFRoZWlyU2lkZSwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpXG4gIH1cblxuICBtYXJrU2lkZSAocG9zaXRpb24sIHNpZGVLbGFzcywgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHRoaXMuc2lkZURlc2NyaXB0aW9uKGJhbm5lclJvdylcblxuICAgIGNvbnN0IGJhbm5lck1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW2Jhbm5lclJvdywgMF0sIFtiYW5uZXJSb3cgKyAxLCAwXV0sIG9wdGlvbnMpXG5cbiAgICBpZiAodGhpcy5wcmV2aW91c1NpZGUpIHtcbiAgICAgIHRoaXMucHJldmlvdXNTaWRlLmZvbGxvd2luZ01hcmtlciA9IGJhbm5lck1hcmtlclxuICAgIH1cblxuICAgIGNvbnN0IHRleHRSYW5nZSA9IFtbdGV4dFJvd1N0YXJ0LCAwXSwgW3RleHRSb3dFbmQsIDBdXVxuICAgIGNvbnN0IHRleHRNYXJrZXIgPSB0aGlzLmVkaXRvci5tYXJrQnVmZmVyUmFuZ2UodGV4dFJhbmdlLCBvcHRpb25zKVxuICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZSh0ZXh0UmFuZ2UpXG5cbiAgICBjb25zdCBzaWRlID0gbmV3IHNpZGVLbGFzcyh0ZXh0LCBkZXNjcmlwdGlvbiwgdGV4dE1hcmtlciwgYmFubmVyTWFya2VyLCBwb3NpdGlvbilcbiAgICB0aGlzLnByZXZpb3VzU2lkZSA9IHNpZGVcbiAgICByZXR1cm4gc2lkZVxuICB9XG5cbiAgLypcbiAgICogUGFyc2UgdGhlIGJhbm5lciBkZXNjcmlwdGlvbiBmb3IgdGhlIGN1cnJlbnQgc2lkZSBmcm9tIGEgYmFubmVyIHJvdy5cbiAgICovXG4gIHNpZGVEZXNjcmlwdGlvbiAoYmFubmVyUm93KSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGJhbm5lclJvdykubWF0Y2goL15bPHw+XXs3fSAoLiopJC8pWzFdXG4gIH1cblxuICBjb25mbGljdCAoKSB7XG4gICAgdGhpcy5wcmV2aW91c1NpZGUuZm9sbG93aW5nTWFya2VyID0gdGhpcy5wcmV2aW91c1NpZGUucmVmQmFubmVyTWFya2VyXG5cbiAgICByZXR1cm4gbmV3IENvbmZsaWN0KHRoaXMub3VyU2lkZSwgdGhpcy50aGVpclNpZGUsIHRoaXMuYmFzZVNpZGUsIHRoaXMubmF2aWdhdG9yLCB0aGlzLm1lcmdlKVxuICB9XG5cbn1cblxuLypcbiAqIFByaXZhdGU6IHBhcnNlQ29uZmxpY3QgZGlzY292ZXJzIGdpdCBjb25mbGljdCBtYXJrZXJzIGluIGEgY29ycHVzIG9mIHRleHQgYW5kIGNvbnN0cnVjdHMgQ29uZmxpY3RcbiAqIGluc3RhbmNlcyB0aGF0IG1hcmsgdGhlIGNvcnJlY3QgbGluZXMuXG4gKlxuICogUmV0dXJucyBbSW50ZWdlcl0gdGhlIGJ1ZmZlciByb3cgYWZ0ZXIgdGhlIGZpbmFsIDw8PDw8PCBib3VuZGFyeS5cbiAqL1xuY29uc3QgcGFyc2VDb25mbGljdCA9IGZ1bmN0aW9uIChtZXJnZSwgZWRpdG9yLCByb3csIHZpc2l0b3IpIHtcbiAgbGV0IGxhc3RCb3VuZGFyeSA9IG51bGxcblxuICAvLyBWaXNpdCBhIHNpZGUgdGhhdCBiZWdpbnMgd2l0aCBhIGJhbm5lciBhbmQgZGVzY3JpcHRpb24gYXMgaXRzIGZpcnN0IGxpbmUuXG4gIGNvbnN0IHZpc2l0SGVhZGVyU2lkZSA9IChwb3NpdGlvbiwgdmlzaXRNZXRob2QpID0+IHtcbiAgICBjb25zdCBzaWRlUm93U3RhcnQgPSByb3dcbiAgICByb3cgKz0gMVxuICAgIGFkdmFuY2VUb0JvdW5kYXJ5KCd8PScpXG4gICAgY29uc3Qgc2lkZVJvd0VuZCA9IHJvd1xuXG4gICAgdmlzaXRvclt2aXNpdE1ldGhvZF0ocG9zaXRpb24sIHNpZGVSb3dTdGFydCwgc2lkZVJvd1N0YXJ0ICsgMSwgc2lkZVJvd0VuZClcbiAgfVxuXG4gIC8vIFZpc2l0IHRoZSBiYXNlIHNpZGUgZnJvbSBkaWZmMyBvdXRwdXQsIGlmIG9uZSBpcyBwcmVzZW50LCB0aGVuIHZpc2l0IHRoZSBzZXBhcmF0b3IuXG4gIGNvbnN0IHZpc2l0QmFzZUFuZFNlcGFyYXRvciA9ICgpID0+IHtcbiAgICBpZiAobGFzdEJvdW5kYXJ5ID09PSAnfCcpIHtcbiAgICAgIHZpc2l0QmFzZVNpZGUoKVxuICAgIH1cblxuICAgIHZpc2l0U2VwYXJhdG9yKClcbiAgfVxuXG4gIC8vIFZpc2l0IGEgYmFzZSBzaWRlIGZyb20gZGlmZjMgb3V0cHV0LlxuICBjb25zdCB2aXNpdEJhc2VTaWRlID0gKCkgPT4ge1xuICAgIGNvbnN0IHNpZGVSb3dTdGFydCA9IHJvd1xuICAgIHJvdyArPSAxXG5cbiAgICBsZXQgYiA9IGFkdmFuY2VUb0JvdW5kYXJ5KCc8PScpXG4gICAgd2hpbGUgKGIgPT09ICc8Jykge1xuICAgICAgLy8gRW1iZWRkZWQgcmVjdXJzaXZlIGNvbmZsaWN0IHdpdGhpbiBhIGJhc2Ugc2lkZSwgY2F1c2VkIGJ5IGEgY3Jpc3MtY3Jvc3MgbWVyZ2UuXG4gICAgICAvLyBBZHZhbmNlIGJleW9uZCBpdCB3aXRob3V0IG1hcmtpbmcgYW55dGhpbmcuXG4gICAgICByb3cgPSBwYXJzZUNvbmZsaWN0KG1lcmdlLCBlZGl0b3IsIHJvdywgbmV3IE5vb3BWaXNpdG9yKCkpXG4gICAgICBiID0gYWR2YW5jZVRvQm91bmRhcnkoJzw9JylcbiAgICB9XG5cbiAgICBjb25zdCBzaWRlUm93RW5kID0gcm93XG5cbiAgICB2aXNpdG9yLnZpc2l0QmFzZVNpZGUoc2lkZVJvd1N0YXJ0LCBzaWRlUm93U3RhcnQgKyAxLCBzaWRlUm93RW5kKVxuICB9XG5cbiAgLy8gVmlzaXQgYSBcIj09PT09PT09XCIgc2VwYXJhdG9yLlxuICBjb25zdCB2aXNpdFNlcGFyYXRvciA9ICgpID0+IHtcbiAgICBjb25zdCBzZXBSb3dTdGFydCA9IHJvd1xuICAgIHJvdyArPSAxXG4gICAgY29uc3Qgc2VwUm93RW5kID0gcm93XG5cbiAgICB2aXNpdG9yLnZpc2l0U2VwYXJhdG9yKHNlcFJvd1N0YXJ0LCBzZXBSb3dFbmQpXG4gIH1cblxuICAvLyBWaWRpZSBhIHNpZGUgd2l0aCBhIGJhbm5lciBhbmQgZGVzY3JpcHRpb24gYXMgaXRzIGxhc3QgbGluZS5cbiAgY29uc3QgdmlzaXRGb290ZXJTaWRlID0gKHBvc2l0aW9uLCB2aXNpdE1ldGhvZCkgPT4ge1xuICAgIGNvbnN0IHNpZGVSb3dTdGFydCA9IHJvd1xuICAgIGNvbnN0IGIgPSBhZHZhbmNlVG9Cb3VuZGFyeSgnPicpXG4gICAgcm93ICs9IDFcbiAgICBzaWRlUm93RW5kID0gcm93XG5cbiAgICB2aXNpdG9yW3Zpc2l0TWV0aG9kXShwb3NpdGlvbiwgc2lkZVJvd0VuZCAtIDEsIHNpZGVSb3dTdGFydCwgc2lkZVJvd0VuZCAtIDEpXG4gIH1cblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGN1cnJlbnQgcm93IGlzIGEgc2lkZSBib3VuZGFyeS5cbiAgLy9cbiAgLy8gYm91bmRhcnlLaW5kcyAtIFtTdHJpbmddIGFueSBjb21iaW5hdGlvbiBvZiA8LCB8LCA9LCBvciA+IHRvIGxpbWl0IHRoZSBraW5kcyBvZiBib3VuZGFyeVxuICAvLyAgIGRldGVjdGVkLlxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSBtYXRjaGluZyBib3VuZGFyeUtpbmRzIGNoYXJhY3Rlciwgb3IgYG51bGxgIGlmIG5vbmUgbWF0Y2guXG4gIGNvbnN0IGlzQXRCb3VuZGFyeSA9IChib3VuZGFyeUtpbmRzID0gJzx8PT4nKSA9PiB7XG4gICAgY29uc3QgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpXG4gICAgZm9yIChiIG9mIGJvdW5kYXJ5S2luZHMpIHtcbiAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoYi5yZXBlYXQoNykpKSB7XG4gICAgICAgIHJldHVybiBiXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBJbmNyZW1lbnQgdGhlIGN1cnJlbnQgcm93IHVudGlsIHRoZSBjdXJyZW50IGxpbmUgbWF0Y2hlcyBvbmUgb2YgdGhlIHByb3ZpZGVkIGJvdW5kYXJ5IGtpbmRzLFxuICAvLyBvciB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBsaW5lcyBpbiB0aGUgZWRpdG9yLlxuICAvL1xuICAvLyBib3VuZGFyeUtpbmRzIC0gW1N0cmluZ10gYW55IGNvbWJpbmF0aW9uIG9mIDwsIHwsID0sIG9yID4gdG8gbGltaXQgdGhlIGtpbmRzIG9mIGJvdW5kYXJpZXNcbiAgLy8gICB0aGF0IGhhbHQgdGhlIHByb2dyZXNzaW9uLlxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSBtYXRjaGluZyBib3VuZGFyeUtpbmRzIGNoYXJhY3Rlciwgb3IgJ251bGwnIGlmIHRoZXJlIGFyZSBubyBtYXRjaGVzIHRvIHRoZSBlbmQgb2ZcbiAgLy8gdGhlIGVkaXRvci5cbiAgY29uc3QgYWR2YW5jZVRvQm91bmRhcnkgPSAoYm91bmRhcnlLaW5kcyA9ICc8fD0+JykgPT4ge1xuICAgIGxldCBiID0gaXNBdEJvdW5kYXJ5KGJvdW5kYXJ5S2luZHMpXG4gICAgd2hpbGUgKGIgPT09IG51bGwpIHtcbiAgICAgIHJvdyArPSAxXG4gICAgICBpZiAocm93ID4gZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSkge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdVbnRlcm1pbmF0ZWQgY29uZmxpY3Qgc2lkZScpXG4gICAgICAgIGUucGFyc2VyU3RhdGUgPSB0cnVlXG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIGIgPSBpc0F0Qm91bmRhcnkoYm91bmRhcnlLaW5kcylcbiAgICB9XG5cbiAgICBsYXN0Qm91bmRhcnkgPSBiXG4gICAgcmV0dXJuIGJcbiAgfVxuXG4gIGlmICghbWVyZ2UuaXNSZWJhc2UpIHtcbiAgICB2aXNpdEhlYWRlclNpZGUoVE9QLCAndmlzaXRPdXJTaWRlJylcbiAgICB2aXNpdEJhc2VBbmRTZXBhcmF0b3IoKVxuICAgIHZpc2l0Rm9vdGVyU2lkZShCT1RUT00sICd2aXNpdFRoZWlyU2lkZScpXG4gIH0gZWxzZSB7XG4gICAgdmlzaXRIZWFkZXJTaWRlKFRPUCwgJ3Zpc2l0VGhlaXJTaWRlJylcbiAgICB2aXNpdEJhc2VBbmRTZXBhcmF0b3IoKVxuICAgIHZpc2l0Rm9vdGVyU2lkZShCT1RUT00sICd2aXNpdE91clNpZGUnKVxuICB9XG5cbiAgcmV0dXJuIHJvd1xufVxuIl19