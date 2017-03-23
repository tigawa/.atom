'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _scopeHelpers = require('./scope-helpers');

var _fuzzaldrin = require('fuzzaldrin');

var _fuzzaldrin2 = _interopRequireDefault(_fuzzaldrin);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _underscorePlus = require('underscore-plus');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EMPTY_ARRAY = [];

let Symbol = class Symbol {
  constructor(text, scopes) {
    this.text = text;
    this.scopeChain = (0, _scopeHelpers.buildScopeChainString)(scopes);
  }

  matchingTypeForConfig(config) {
    let matchingType = null;
    let highestTypePriority = -1;
    for (const type of Object.keys(config)) {
      let { selectors, typePriority } = config[type];
      if (selectors == null) continue;
      if (typePriority == null) typePriority = 0;
      if (typePriority > highestTypePriority && (0, _scopeHelpers.selectorsMatchScopeChain)(selectors, this.scopeChain)) {
        matchingType = type;
        highestTypePriority = typePriority;
      }
    }

    return matchingType;
  }
};
let SymbolStore = class SymbolStore {
  constructor(wordRegex) {
    this.wordRegex = wordRegex;
    this.linesByBuffer = new Map();
  }

  clear(buffer) {
    if (buffer) {
      this.linesByBuffer.delete(buffer);
    } else {
      this.linesByBuffer.clear();
    }
  }

  symbolsForConfig(config, buffers, prefix, wordUnderCursor, cursorBufferRow, numberOfCursors) {
    this.prefixCache = _fuzzaldrinPlus2.default.prepareQuery(prefix);

    const firstLetter = prefix[0].toLowerCase();
    const symbolsByWord = new Map();
    const wordOccurrences = new Map();
    const builtinSymbolsByWord = new Set();

    const suggestions = [];
    for (const type of Object.keys(config)) {
      const symbols = config[type].suggestions || EMPTY_ARRAY;
      for (const symbol of symbols) {
        const { score } = this.scoreSymbol(prefix, symbol, cursorBufferRow, Number.MAX_VALUE);
        if (score > 0) {
          symbol.replacementPrefix = prefix;
          suggestions.push({ symbol, score });
          if (symbol.text) {
            builtinSymbolsByWord.add(symbol.text);
          } else if (symbol.snippet) {
            builtinSymbolsByWord.add(symbol.snippet);
          }
        }
      }
    }

    for (const bufferLines of this.linesForBuffers(buffers)) {
      let symbolBufferRow = 0;
      for (const lineSymbolsByLetter of bufferLines) {
        const symbols = lineSymbolsByLetter.get(firstLetter) || EMPTY_ARRAY;
        for (let symbol of symbols) {
          wordOccurrences.set(symbol.text, (wordOccurrences.get(symbol.text) || 0) + 1);

          const symbolForWord = symbolsByWord.get(symbol.text);
          if (symbolForWord != null) {
            symbolForWord.localityScore = Math.max(this.getLocalityScore(cursorBufferRow, symbolBufferRow), symbolForWord.localityScore);
          } else if (wordUnderCursor === symbol.text && wordOccurrences.get(symbol.text) <= numberOfCursors) {
            continue;
          } else {
            const { score, localityScore } = this.scoreSymbol(prefix, symbol, cursorBufferRow, symbolBufferRow);
            if (score > 0) {
              const type = symbol.matchingTypeForConfig(config);
              if (type != null) {
                symbol = { text: symbol.text, type, replacementPrefix: prefix };
                if (!builtinSymbolsByWord.has(symbol.text)) {
                  symbolsByWord.set(symbol.text, { symbol, score, localityScore });
                }
              }
            }
          }
        }

        symbolBufferRow++;
      }
    }

    return Array.from(symbolsByWord.values()).concat(suggestions);
  }

  recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent) {
    const newEnd = start.row + newExtent.row;
    const newLines = [];
    // TODO: Remove this conditional once atom/ns-use-display-layers reaches stable and editor.tokenizedBuffer is available
    const tokenizedBuffer = editor.tokenizedBuffer ? editor.tokenizedBuffer : editor.displayBuffer.tokenizedBuffer;

    for (let bufferRow = start.row; bufferRow <= newEnd; bufferRow++) {
      const tokenizedLine = tokenizedBuffer.tokenizedLineForRow(bufferRow);
      if (tokenizedLine == null) continue;

      const symbolsByLetter = new Map();
      const tokenIterator = tokenizedLine.getTokenIterator();
      while (tokenIterator.next()) {
        const wordsWithinToken = tokenIterator.getText().match(this.wordRegex) || EMPTY_ARRAY;
        for (const wordWithinToken of wordsWithinToken) {
          const symbol = new Symbol(wordWithinToken, tokenIterator.getScopes());
          const firstLetter = symbol.text[0].toLowerCase();
          if (!symbolsByLetter.has(firstLetter)) symbolsByLetter.set(firstLetter, []);
          symbolsByLetter.get(firstLetter).push(symbol);
        }
      }

      newLines.push(symbolsByLetter);
    }

    const bufferLines = this.linesForBuffer(editor.getBuffer());
    (0, _underscorePlus.spliceWithArray)(bufferLines, start.row, oldExtent.row + 1, newLines);
  }

  linesForBuffers(buffers) {
    buffers = buffers || Array.from(this.linesByBuffer.keys());
    return buffers.map(buffer => this.linesForBuffer(buffer));
  }

  linesForBuffer(buffer) {
    if (!this.linesByBuffer.has(buffer)) {
      this.linesByBuffer.set(buffer, []);
    }

    return this.linesByBuffer.get(buffer);
  }

  setUseAlternateScoring(useAlternateScoring) {
    this.useAlternateScoring = useAlternateScoring;
  }

  setUseLocalityBonus(useLocalityBonus) {
    this.useLocalityBonus = useLocalityBonus;
  }

  setUseStrictMatching(useStrictMatching) {
    this.useStrictMatching = useStrictMatching;
  }

  scoreSymbol(prefix, symbol, cursorBufferRow, symbolBufferRow) {
    const text = symbol.text || symbol.snippet;
    if (this.useStrictMatching) {
      return this.strictMatchScore(prefix, text);
    } else {
      return this.fuzzyMatchScore(prefix, text, cursorBufferRow, symbolBufferRow);
    }
  }

  strictMatchScore(prefix, text) {
    return {
      score: text.indexOf(prefix) === 0 ? 1 : 0,
      localityScore: 1
    };
  }

  fuzzyMatchScore(prefix, text, cursorBufferRow, symbolBufferRow) {
    if (text == null || prefix[0].toLowerCase() !== text[0].toLowerCase()) {
      return { score: 0, localityScore: 0 };
    }

    const fuzzaldrinProvider = this.useAlternateScoring ? _fuzzaldrinPlus2.default : _fuzzaldrin2.default;
    const score = fuzzaldrinProvider.score(text, prefix, { preparedQuery: this.prefixCache });
    const localityScore = this.getLocalityScore(cursorBufferRow, symbolBufferRow);
    return { score, localityScore };
  }

  getLocalityScore(cursorBufferRow, symbolBufferRow) {
    if (!this.useLocalityBonus) {
      return 1;
    }

    const rowDifference = Math.abs(symbolBufferRow - cursorBufferRow);
    if (this.useAlternateScoring) {
      // Between 1 and 1 + strength. (here between 1.0 and 2.0)
      // Avoid a pow and a branching max.
      // 25 is the number of row where the bonus is 3/4 faded away.
      // strength is the factor in front of fade*fade. Here it is 1.0
      const fade = 25.0 / (25.0 + rowDifference);
      return 1.0 + fade * fade;
    } else {
      // Will be between 1 and ~2.75
      return 1 + Math.max(-Math.pow(0.2 * rowDifference - 3, 3) / 25 + 0.5, 0);
    }
  }
};
exports.default = SymbolStore;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5bWJvbC1zdG9yZS5qcyJdLCJuYW1lcyI6WyJFTVBUWV9BUlJBWSIsIlN5bWJvbCIsImNvbnN0cnVjdG9yIiwidGV4dCIsInNjb3BlcyIsInNjb3BlQ2hhaW4iLCJtYXRjaGluZ1R5cGVGb3JDb25maWciLCJjb25maWciLCJtYXRjaGluZ1R5cGUiLCJoaWdoZXN0VHlwZVByaW9yaXR5IiwidHlwZSIsIk9iamVjdCIsImtleXMiLCJzZWxlY3RvcnMiLCJ0eXBlUHJpb3JpdHkiLCJTeW1ib2xTdG9yZSIsIndvcmRSZWdleCIsImxpbmVzQnlCdWZmZXIiLCJNYXAiLCJjbGVhciIsImJ1ZmZlciIsImRlbGV0ZSIsInN5bWJvbHNGb3JDb25maWciLCJidWZmZXJzIiwicHJlZml4Iiwid29yZFVuZGVyQ3Vyc29yIiwiY3Vyc29yQnVmZmVyUm93IiwibnVtYmVyT2ZDdXJzb3JzIiwicHJlZml4Q2FjaGUiLCJwcmVwYXJlUXVlcnkiLCJmaXJzdExldHRlciIsInRvTG93ZXJDYXNlIiwic3ltYm9sc0J5V29yZCIsIndvcmRPY2N1cnJlbmNlcyIsImJ1aWx0aW5TeW1ib2xzQnlXb3JkIiwiU2V0Iiwic3VnZ2VzdGlvbnMiLCJzeW1ib2xzIiwic3ltYm9sIiwic2NvcmUiLCJzY29yZVN5bWJvbCIsIk51bWJlciIsIk1BWF9WQUxVRSIsInJlcGxhY2VtZW50UHJlZml4IiwicHVzaCIsImFkZCIsInNuaXBwZXQiLCJidWZmZXJMaW5lcyIsImxpbmVzRm9yQnVmZmVycyIsInN5bWJvbEJ1ZmZlclJvdyIsImxpbmVTeW1ib2xzQnlMZXR0ZXIiLCJnZXQiLCJzZXQiLCJzeW1ib2xGb3JXb3JkIiwibG9jYWxpdHlTY29yZSIsIk1hdGgiLCJtYXgiLCJnZXRMb2NhbGl0eVNjb3JlIiwiaGFzIiwiQXJyYXkiLCJmcm9tIiwidmFsdWVzIiwiY29uY2F0IiwicmVjb21wdXRlU3ltYm9sc0ZvckVkaXRvckluQnVmZmVyUmFuZ2UiLCJlZGl0b3IiLCJzdGFydCIsIm9sZEV4dGVudCIsIm5ld0V4dGVudCIsIm5ld0VuZCIsInJvdyIsIm5ld0xpbmVzIiwidG9rZW5pemVkQnVmZmVyIiwiZGlzcGxheUJ1ZmZlciIsImJ1ZmZlclJvdyIsInRva2VuaXplZExpbmUiLCJ0b2tlbml6ZWRMaW5lRm9yUm93Iiwic3ltYm9sc0J5TGV0dGVyIiwidG9rZW5JdGVyYXRvciIsImdldFRva2VuSXRlcmF0b3IiLCJuZXh0Iiwid29yZHNXaXRoaW5Ub2tlbiIsImdldFRleHQiLCJtYXRjaCIsIndvcmRXaXRoaW5Ub2tlbiIsImdldFNjb3BlcyIsImxpbmVzRm9yQnVmZmVyIiwiZ2V0QnVmZmVyIiwibWFwIiwic2V0VXNlQWx0ZXJuYXRlU2NvcmluZyIsInVzZUFsdGVybmF0ZVNjb3JpbmciLCJzZXRVc2VMb2NhbGl0eUJvbnVzIiwidXNlTG9jYWxpdHlCb251cyIsInNldFVzZVN0cmljdE1hdGNoaW5nIiwidXNlU3RyaWN0TWF0Y2hpbmciLCJzdHJpY3RNYXRjaFNjb3JlIiwiZnV6enlNYXRjaFNjb3JlIiwiaW5kZXhPZiIsImZ1enphbGRyaW5Qcm92aWRlciIsInByZXBhcmVkUXVlcnkiLCJyb3dEaWZmZXJlbmNlIiwiYWJzIiwiZmFkZSIsInBvdyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFJQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFMQSxNQUFNQSxjQUFjLEVBQXBCOztJQU9NQyxNLEdBQU4sTUFBTUEsTUFBTixDQUFhO0FBQ1hDLGNBQWFDLElBQWIsRUFBbUJDLE1BQW5CLEVBQTJCO0FBQ3pCLFNBQUtELElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtFLFVBQUwsR0FBa0IseUNBQXNCRCxNQUF0QixDQUFsQjtBQUNEOztBQUVERSx3QkFBdUJDLE1BQXZCLEVBQStCO0FBQzdCLFFBQUlDLGVBQWUsSUFBbkI7QUFDQSxRQUFJQyxzQkFBc0IsQ0FBQyxDQUEzQjtBQUNBLFNBQUssTUFBTUMsSUFBWCxJQUFtQkMsT0FBT0MsSUFBUCxDQUFZTCxNQUFaLENBQW5CLEVBQXdDO0FBQ3RDLFVB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NUMsS0FBSzZDLEdBQUwsQ0FBU25ELGtCQUFrQnZCLGVBQTNCLENBQXRCO0FBQ0EsUUFBSSxLQUFLK0QsbUJBQVQsRUFBOEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFNWSxPQUFPLFFBQVEsT0FBT0YsYUFBZixDQUFiO0FBQ0EsYUFBTyxNQUFNRSxPQUFPQSxJQUFwQjtBQUNELEtBUEQsTUFPTztBQUNMO0FBQ0EsYUFBTyxJQUFJOUMsS0FBS0MsR0FBTCxDQUFTLENBQUNELEtBQUsrQyxHQUFMLENBQVMsTUFBTUgsYUFBTixHQUFzQixDQUEvQixFQUFrQyxDQUFsQyxDQUFELEdBQXdDLEVBQXhDLEdBQTZDLEdBQXRELEVBQTJELENBQTNELENBQVg7QUFDRDtBQUNGO0FBN0s4QixDO2tCQUFacEYsVyIsImZpbGUiOiJzeW1ib2wtc3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBFTVBUWV9BUlJBWSA9IFtdXG5cbmltcG9ydCB7c2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluLCBidWlsZFNjb3BlQ2hhaW5TdHJpbmd9IGZyb20gJy4vc2NvcGUtaGVscGVycydcbmltcG9ydCBmdXp6YWxkcmluIGZyb20gJ2Z1enphbGRyaW4nXG5pbXBvcnQgZnV6emFsZHJpblBsdXMgZnJvbSAnZnV6emFsZHJpbi1wbHVzJ1xuaW1wb3J0IHtzcGxpY2VXaXRoQXJyYXl9IGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcblxuY2xhc3MgU3ltYm9sIHtcbiAgY29uc3RydWN0b3IgKHRleHQsIHNjb3Blcykge1xuICAgIHRoaXMudGV4dCA9IHRleHRcbiAgICB0aGlzLnNjb3BlQ2hhaW4gPSBidWlsZFNjb3BlQ2hhaW5TdHJpbmcoc2NvcGVzKVxuICB9XG5cbiAgbWF0Y2hpbmdUeXBlRm9yQ29uZmlnIChjb25maWcpIHtcbiAgICBsZXQgbWF0Y2hpbmdUeXBlID0gbnVsbFxuICAgIGxldCBoaWdoZXN0VHlwZVByaW9yaXR5ID0gLTFcbiAgICBmb3IgKGNvbnN0IHR5cGUgb2YgT2JqZWN0LmtleXMoY29uZmlnKSkge1xuICAgICAgbGV0IHtzZWxlY3RvcnMsIHR5cGVQcmlvcml0eX0gPSBjb25maWdbdHlwZV1cbiAgICAgIGlmIChzZWxlY3RvcnMgPT0gbnVsbCkgY29udGludWVcbiAgICAgIGlmICh0eXBlUHJpb3JpdHkgPT0gbnVsbCkgdHlwZVByaW9yaXR5ID0gMFxuICAgICAgaWYgKHR5cGVQcmlvcml0eSA+IGhpZ2hlc3RUeXBlUHJpb3JpdHkgJiYgc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKHNlbGVjdG9ycywgdGhpcy5zY29wZUNoYWluKSkge1xuICAgICAgICBtYXRjaGluZ1R5cGUgPSB0eXBlXG4gICAgICAgIGhpZ2hlc3RUeXBlUHJpb3JpdHkgPSB0eXBlUHJpb3JpdHlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hpbmdUeXBlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ltYm9sU3RvcmUge1xuICBjb25zdHJ1Y3RvciAod29yZFJlZ2V4KSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSB3b3JkUmVnZXhcbiAgICB0aGlzLmxpbmVzQnlCdWZmZXIgPSBuZXcgTWFwKClcbiAgfVxuXG4gIGNsZWFyIChidWZmZXIpIHtcbiAgICBpZiAoYnVmZmVyKSB7XG4gICAgICB0aGlzLmxpbmVzQnlCdWZmZXIuZGVsZXRlKGJ1ZmZlcilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saW5lc0J5QnVmZmVyLmNsZWFyKClcbiAgICB9XG4gIH1cblxuICBzeW1ib2xzRm9yQ29uZmlnIChjb25maWcsIGJ1ZmZlcnMsIHByZWZpeCwgd29yZFVuZGVyQ3Vyc29yLCBjdXJzb3JCdWZmZXJSb3csIG51bWJlck9mQ3Vyc29ycykge1xuICAgIHRoaXMucHJlZml4Q2FjaGUgPSBmdXp6YWxkcmluUGx1cy5wcmVwYXJlUXVlcnkocHJlZml4KVxuXG4gICAgY29uc3QgZmlyc3RMZXR0ZXIgPSBwcmVmaXhbMF0udG9Mb3dlckNhc2UoKVxuICAgIGNvbnN0IHN5bWJvbHNCeVdvcmQgPSBuZXcgTWFwKClcbiAgICBjb25zdCB3b3JkT2NjdXJyZW5jZXMgPSBuZXcgTWFwKClcbiAgICBjb25zdCBidWlsdGluU3ltYm9sc0J5V29yZCA9IG5ldyBTZXQoKVxuXG4gICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSBbXVxuICAgIGZvciAoY29uc3QgdHlwZSBvZiBPYmplY3Qua2V5cyhjb25maWcpKSB7XG4gICAgICBjb25zdCBzeW1ib2xzID0gY29uZmlnW3R5cGVdLnN1Z2dlc3Rpb25zIHx8IEVNUFRZX0FSUkFZXG4gICAgICBmb3IgKGNvbnN0IHN5bWJvbCBvZiBzeW1ib2xzKSB7XG4gICAgICAgIGNvbnN0IHtzY29yZX0gPSB0aGlzLnNjb3JlU3ltYm9sKHByZWZpeCwgc3ltYm9sLCBjdXJzb3JCdWZmZXJSb3csIE51bWJlci5NQVhfVkFMVUUpXG4gICAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgICBzeW1ib2wucmVwbGFjZW1lbnRQcmVmaXggPSBwcmVmaXhcbiAgICAgICAgICBzdWdnZXN0aW9ucy5wdXNoKHtzeW1ib2wsIHNjb3JlfSlcbiAgICAgICAgICBpZiAoc3ltYm9sLnRleHQpIHtcbiAgICAgICAgICAgIGJ1aWx0aW5TeW1ib2xzQnlXb3JkLmFkZChzeW1ib2wudGV4dClcbiAgICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbC5zbmlwcGV0KSB7XG4gICAgICAgICAgICBidWlsdGluU3ltYm9sc0J5V29yZC5hZGQoc3ltYm9sLnNuaXBwZXQpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBidWZmZXJMaW5lcyBvZiB0aGlzLmxpbmVzRm9yQnVmZmVycyhidWZmZXJzKSkge1xuICAgICAgbGV0IHN5bWJvbEJ1ZmZlclJvdyA9IDBcbiAgICAgIGZvciAoY29uc3QgbGluZVN5bWJvbHNCeUxldHRlciBvZiBidWZmZXJMaW5lcykge1xuICAgICAgICBjb25zdCBzeW1ib2xzID0gbGluZVN5bWJvbHNCeUxldHRlci5nZXQoZmlyc3RMZXR0ZXIpIHx8IEVNUFRZX0FSUkFZXG4gICAgICAgIGZvciAobGV0IHN5bWJvbCBvZiBzeW1ib2xzKSB7XG4gICAgICAgICAgd29yZE9jY3VycmVuY2VzLnNldChzeW1ib2wudGV4dCwgKHdvcmRPY2N1cnJlbmNlcy5nZXQoc3ltYm9sLnRleHQpIHx8IDApICsgMSlcblxuICAgICAgICAgIGNvbnN0IHN5bWJvbEZvcldvcmQgPSBzeW1ib2xzQnlXb3JkLmdldChzeW1ib2wudGV4dClcbiAgICAgICAgICBpZiAoc3ltYm9sRm9yV29yZCAhPSBudWxsKSB7XG4gICAgICAgICAgICBzeW1ib2xGb3JXb3JkLmxvY2FsaXR5U2NvcmUgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgdGhpcy5nZXRMb2NhbGl0eVNjb3JlKGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KSxcbiAgICAgICAgICAgICAgc3ltYm9sRm9yV29yZC5sb2NhbGl0eVNjb3JlXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSBlbHNlIGlmICh3b3JkVW5kZXJDdXJzb3IgPT09IHN5bWJvbC50ZXh0ICYmIHdvcmRPY2N1cnJlbmNlcy5nZXQoc3ltYm9sLnRleHQpIDw9IG51bWJlck9mQ3Vyc29ycykge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qge3Njb3JlLCBsb2NhbGl0eVNjb3JlfSA9IHRoaXMuc2NvcmVTeW1ib2wocHJlZml4LCBzeW1ib2wsIGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KVxuICAgICAgICAgICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICAgICAgICBjb25zdCB0eXBlID0gc3ltYm9sLm1hdGNoaW5nVHlwZUZvckNvbmZpZyhjb25maWcpXG4gICAgICAgICAgICAgIGlmICh0eXBlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzeW1ib2wgPSB7dGV4dDogc3ltYm9sLnRleHQsIHR5cGUsIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXh9XG4gICAgICAgICAgICAgICAgaWYgKCFidWlsdGluU3ltYm9sc0J5V29yZC5oYXMoc3ltYm9sLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICBzeW1ib2xzQnlXb3JkLnNldChzeW1ib2wudGV4dCwge3N5bWJvbCwgc2NvcmUsIGxvY2FsaXR5U2NvcmV9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN5bWJvbEJ1ZmZlclJvdysrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIEFycmF5LmZyb20oc3ltYm9sc0J5V29yZC52YWx1ZXMoKSkuY29uY2F0KHN1Z2dlc3Rpb25zKVxuICB9XG5cbiAgcmVjb21wdXRlU3ltYm9sc0ZvckVkaXRvckluQnVmZmVyUmFuZ2UgKGVkaXRvciwgc3RhcnQsIG9sZEV4dGVudCwgbmV3RXh0ZW50KSB7XG4gICAgY29uc3QgbmV3RW5kID0gc3RhcnQucm93ICsgbmV3RXh0ZW50LnJvd1xuICAgIGNvbnN0IG5ld0xpbmVzID0gW11cbiAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBjb25kaXRpb25hbCBvbmNlIGF0b20vbnMtdXNlLWRpc3BsYXktbGF5ZXJzIHJlYWNoZXMgc3RhYmxlIGFuZCBlZGl0b3IudG9rZW5pemVkQnVmZmVyIGlzIGF2YWlsYWJsZVxuICAgIGNvbnN0IHRva2VuaXplZEJ1ZmZlciA9IGVkaXRvci50b2tlbml6ZWRCdWZmZXIgPyBlZGl0b3IudG9rZW5pemVkQnVmZmVyIDogZWRpdG9yLmRpc3BsYXlCdWZmZXIudG9rZW5pemVkQnVmZmVyXG5cbiAgICBmb3IgKGxldCBidWZmZXJSb3cgPSBzdGFydC5yb3c7IGJ1ZmZlclJvdyA8PSBuZXdFbmQ7IGJ1ZmZlclJvdysrKSB7XG4gICAgICBjb25zdCB0b2tlbml6ZWRMaW5lID0gdG9rZW5pemVkQnVmZmVyLnRva2VuaXplZExpbmVGb3JSb3coYnVmZmVyUm93KVxuICAgICAgaWYgKHRva2VuaXplZExpbmUgPT0gbnVsbCkgY29udGludWVcblxuICAgICAgY29uc3Qgc3ltYm9sc0J5TGV0dGVyID0gbmV3IE1hcCgpXG4gICAgICBjb25zdCB0b2tlbkl0ZXJhdG9yID0gdG9rZW5pemVkTGluZS5nZXRUb2tlbkl0ZXJhdG9yKClcbiAgICAgIHdoaWxlICh0b2tlbkl0ZXJhdG9yLm5leHQoKSkge1xuICAgICAgICBjb25zdCB3b3Jkc1dpdGhpblRva2VuID0gdG9rZW5JdGVyYXRvci5nZXRUZXh0KCkubWF0Y2godGhpcy53b3JkUmVnZXgpIHx8IEVNUFRZX0FSUkFZXG4gICAgICAgIGZvciAoY29uc3Qgd29yZFdpdGhpblRva2VuIG9mIHdvcmRzV2l0aGluVG9rZW4pIHtcbiAgICAgICAgICBjb25zdCBzeW1ib2wgPSBuZXcgU3ltYm9sKHdvcmRXaXRoaW5Ub2tlbiwgdG9rZW5JdGVyYXRvci5nZXRTY29wZXMoKSlcbiAgICAgICAgICBjb25zdCBmaXJzdExldHRlciA9IHN5bWJvbC50ZXh0WzBdLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBpZiAoIXN5bWJvbHNCeUxldHRlci5oYXMoZmlyc3RMZXR0ZXIpKSBzeW1ib2xzQnlMZXR0ZXIuc2V0KGZpcnN0TGV0dGVyLCBbXSlcbiAgICAgICAgICBzeW1ib2xzQnlMZXR0ZXIuZ2V0KGZpcnN0TGV0dGVyKS5wdXNoKHN5bWJvbClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXdMaW5lcy5wdXNoKHN5bWJvbHNCeUxldHRlcilcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXJMaW5lcyA9IHRoaXMubGluZXNGb3JCdWZmZXIoZWRpdG9yLmdldEJ1ZmZlcigpKVxuICAgIHNwbGljZVdpdGhBcnJheShidWZmZXJMaW5lcywgc3RhcnQucm93LCBvbGRFeHRlbnQucm93ICsgMSwgbmV3TGluZXMpXG4gIH1cblxuICBsaW5lc0ZvckJ1ZmZlcnMgKGJ1ZmZlcnMpIHtcbiAgICBidWZmZXJzID0gYnVmZmVycyB8fCBBcnJheS5mcm9tKHRoaXMubGluZXNCeUJ1ZmZlci5rZXlzKCkpXG4gICAgcmV0dXJuIGJ1ZmZlcnMubWFwKGJ1ZmZlciA9PiB0aGlzLmxpbmVzRm9yQnVmZmVyKGJ1ZmZlcikpXG4gIH1cblxuICBsaW5lc0ZvckJ1ZmZlciAoYnVmZmVyKSB7XG4gICAgaWYgKCF0aGlzLmxpbmVzQnlCdWZmZXIuaGFzKGJ1ZmZlcikpIHtcbiAgICAgIHRoaXMubGluZXNCeUJ1ZmZlci5zZXQoYnVmZmVyLCBbXSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5saW5lc0J5QnVmZmVyLmdldChidWZmZXIpXG4gIH1cblxuICBzZXRVc2VBbHRlcm5hdGVTY29yaW5nICh1c2VBbHRlcm5hdGVTY29yaW5nKSB7XG4gICAgdGhpcy51c2VBbHRlcm5hdGVTY29yaW5nID0gdXNlQWx0ZXJuYXRlU2NvcmluZ1xuICB9XG5cbiAgc2V0VXNlTG9jYWxpdHlCb251cyAodXNlTG9jYWxpdHlCb251cykge1xuICAgIHRoaXMudXNlTG9jYWxpdHlCb251cyA9IHVzZUxvY2FsaXR5Qm9udXNcbiAgfVxuXG4gIHNldFVzZVN0cmljdE1hdGNoaW5nICh1c2VTdHJpY3RNYXRjaGluZykge1xuICAgIHRoaXMudXNlU3RyaWN0TWF0Y2hpbmcgPSB1c2VTdHJpY3RNYXRjaGluZ1xuICB9XG5cbiAgc2NvcmVTeW1ib2wgKHByZWZpeCwgc3ltYm9sLCBjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdykge1xuICAgIGNvbnN0IHRleHQgPSBzeW1ib2wudGV4dCB8fCBzeW1ib2wuc25pcHBldFxuICAgIGlmICh0aGlzLnVzZVN0cmljdE1hdGNoaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdHJpY3RNYXRjaFNjb3JlKHByZWZpeCwgdGV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZnV6enlNYXRjaFNjb3JlKHByZWZpeCwgdGV4dCwgY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpXG4gICAgfVxuICB9XG5cbiAgc3RyaWN0TWF0Y2hTY29yZSAocHJlZml4LCB0ZXh0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3JlOiB0ZXh0LmluZGV4T2YocHJlZml4KSA9PT0gMCA/IDEgOiAwLFxuICAgICAgbG9jYWxpdHlTY29yZTogMVxuICAgIH1cbiAgfVxuXG4gIGZ1enp5TWF0Y2hTY29yZSAocHJlZml4LCB0ZXh0LCBjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdykge1xuICAgIGlmICh0ZXh0ID09IG51bGwgfHwgcHJlZml4WzBdLnRvTG93ZXJDYXNlKCkgIT09IHRleHRbMF0udG9Mb3dlckNhc2UoKSkge1xuICAgICAgcmV0dXJuIHtzY29yZTogMCwgbG9jYWxpdHlTY29yZTogMH1cbiAgICB9XG5cbiAgICBjb25zdCBmdXp6YWxkcmluUHJvdmlkZXIgPSB0aGlzLnVzZUFsdGVybmF0ZVNjb3JpbmcgPyBmdXp6YWxkcmluUGx1cyA6IGZ1enphbGRyaW5cbiAgICBjb25zdCBzY29yZSA9IGZ1enphbGRyaW5Qcm92aWRlci5zY29yZSh0ZXh0LCBwcmVmaXgsIHsgcHJlcGFyZWRRdWVyeTogdGhpcy5wcmVmaXhDYWNoZSB9KVxuICAgIGNvbnN0IGxvY2FsaXR5U2NvcmUgPSB0aGlzLmdldExvY2FsaXR5U2NvcmUoY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpXG4gICAgcmV0dXJuIHtzY29yZSwgbG9jYWxpdHlTY29yZX1cbiAgfVxuXG4gIGdldExvY2FsaXR5U2NvcmUgKGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KSB7XG4gICAgaWYgKCF0aGlzLnVzZUxvY2FsaXR5Qm9udXMpIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgY29uc3Qgcm93RGlmZmVyZW5jZSA9IE1hdGguYWJzKHN5bWJvbEJ1ZmZlclJvdyAtIGN1cnNvckJ1ZmZlclJvdylcbiAgICBpZiAodGhpcy51c2VBbHRlcm5hdGVTY29yaW5nKSB7XG4gICAgICAvLyBCZXR3ZWVuIDEgYW5kIDEgKyBzdHJlbmd0aC4gKGhlcmUgYmV0d2VlbiAxLjAgYW5kIDIuMClcbiAgICAgIC8vIEF2b2lkIGEgcG93IGFuZCBhIGJyYW5jaGluZyBtYXguXG4gICAgICAvLyAyNSBpcyB0aGUgbnVtYmVyIG9mIHJvdyB3aGVyZSB0aGUgYm9udXMgaXMgMy80IGZhZGVkIGF3YXkuXG4gICAgICAvLyBzdHJlbmd0aCBpcyB0aGUgZmFjdG9yIGluIGZyb250IG9mIGZhZGUqZmFkZS4gSGVyZSBpdCBpcyAxLjBcbiAgICAgIGNvbnN0IGZhZGUgPSAyNS4wIC8gKDI1LjAgKyByb3dEaWZmZXJlbmNlKVxuICAgICAgcmV0dXJuIDEuMCArIGZhZGUgKiBmYWRlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdpbGwgYmUgYmV0d2VlbiAxIGFuZCB+Mi43NVxuICAgICAgcmV0dXJuIDEgKyBNYXRoLm1heCgtTWF0aC5wb3coMC4yICogcm93RGlmZmVyZW5jZSAtIDMsIDMpIC8gMjUgKyAwLjUsIDApXG4gICAgfVxuICB9XG59XG4iXX0=