(function() {
  var CompositeDisposable, Emitter, SearchModel, _;

  _ = require('underscore-plus');

  Emitter = require('emissary').Emitter;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = SearchModel = (function() {
    Emitter.includeInto(SearchModel);

    SearchModel.resultClass = 'isearch-result';

    SearchModel.currentClass = 'isearch-current';

    function SearchModel(state) {
      var _ref, _ref1;
      if (state == null) {
        state = {};
      }
      this.editSession = null;
      this.startMarker = null;
      this.markers = [];
      this.currentMarker = null;
      this.currentDecoration = null;
      this.lastPosition = null;
      this.pattern = '';
      this.direction = 'forward';
      this.useRegex = (_ref = state.useRegex) != null ? _ref : false;
      this.caseSensitive = (_ref1 = state.caseSensitive) != null ? _ref1 : false;
      this.valid = false;
      this.history = state.history || [];
      this.subscriptions = null;
    }

    SearchModel.prototype.hasStarted = function() {
      return this.startMarker === !null;
    };

    SearchModel.prototype.activePaneItemChanged = function() {
      if (this.editSession) {
        this.editSession = null;
        this.destroyResultMarkers();
      }
      return this.start;
    };

    SearchModel.prototype.start = function(pattern) {
      var markerAttributes, paneItem, range;
      if (pattern == null) {
        pattern = None;
      }
      this.cleanup();
      this.subscriptions = new CompositeDisposable;
      if (pattern) {
        this.pattern = pattern;
      }
      paneItem = atom.workspace.getActivePaneItem();
      if ((paneItem != null ? typeof paneItem.getBuffer === "function" ? paneItem.getBuffer() : void 0 : void 0) != null) {
        this.editSession = paneItem;
        this.subscriptions.add(this.editSession.getBuffer().onDidStopChanging((function(_this) {
          return function(args) {
            return _this.updateMarkers();
          };
        })(this)));
        markerAttributes = {
          invalidate: 'inside',
          replicate: false,
          persistent: false,
          isCurrent: false
        };
        range = this.editSession.getSelectedBufferRange();
        this.startMarker = this.editSession.markBufferRange(range, markerAttributes);
        return this.updateMarkers();
      }
    };

    SearchModel.prototype.stopSearch = function(pattern) {
      var buffer, func;
      if (pattern && pattern !== this.pattern && this.editSession) {
        this.pattern = pattern;
        buffer = this.editSession.getBuffer();
        func = buffer[this.direction === 'forward' ? 'scan' : 'backwardsScan'];
        func.call(buffer, this.getRegex(), (function(_this) {
          return function(_arg) {
            var range, stop;
            range = _arg.range, stop = _arg.stop;
            _this.editSession.setSelectedBufferRange(range);
            return stop();
          };
        })(this));
      } else {
        this.moveCursorToCurrent();
      }
      return this.cleanup();
    };

    SearchModel.prototype.slurp = function() {
      var cursor, end, scanRange, start, text, _ref;
      cursor = this.editSession.getCursors()[0];
      text = '';
      if (!this.pattern.length) {
        text = this.editSession.getSelectedText();
        if (!text.length) {
          start = cursor.getBufferPosition();
          end = cursor.getNextWordBoundaryBufferPosition();
          if (end) {
            text = this.editSession.getTextInRange([start, end]);
          }
        }
      } else if (this.currentMarker) {
        _ref = this.currentMarker.getBufferRange(), start = _ref.start, end = _ref.end;
        scanRange = [end, this.editSession.getEofBufferPosition()];
        this.editSession.scanInBufferRange(cursor.wordRegExp(), scanRange, (function(_this) {
          return function(_arg) {
            var range, stop, _ref1;
            range = _arg.range, stop = _arg.stop;
            if (!((_ref1 = range.end) != null ? _ref1.isEqual(end) : void 0)) {
              text = _this.editSession.getTextInRange([start, range.end]);
              return stop();
            }
          };
        })(this));
      }
      if (text.length) {
        this.pattern = text;
        return this.updateMarkers();
      }
    };

    SearchModel.prototype.moveCursorToCurrent = function() {
      if (this.lastPosition) {
        return this.editSession.setSelectedBufferRange(this.lastPosition);
      }
    };

    SearchModel.prototype.cancelSearch = function() {
      var _ref, _ref1;
      if (this.startMarker) {
        if ((_ref = this.editSession) != null) {
          if ((_ref1 = _ref.getLastCursor()) != null) {
            _ref1.setBufferPosition(this.startMarker.getHeadBufferPosition());
          }
        }
      }
      return this.cleanup();
    };

    SearchModel.prototype.cleanup = function() {
      var _ref;
      if (!atom.config.get('isearch.keepOptionsAfterSearch')) {
        this.useRegex = false;
        this.caseSensitive = false;
        this.emit('updatedOptions');
      }
      if (this.startMarker) {
        this.startMarker.destroy();
      }
      this.startMarker = null;
      this.lastPosition = null;
      this.destroyResultMarkers();
      if (this.editSession) {
        this.editSession = null;
      }
      if (this.pattern && this.history[this.history.length - 1] !== this.pattern) {
        this.history.push(this.pattern);
      }
      this.pattern = '';
      return (_ref = this.subscriptions) != null ? _ref.dispose() : void 0;
    };

    SearchModel.prototype.updateMarkers = function() {
      var bufferRange, id, marker, markersToRemoveById, updatedMarkers, _i, _len, _ref;
      if ((this.editSession == null) || !this.pattern) {
        this.destroyResultMarkers();
        return;
      }
      this.valid = true;
      bufferRange = [[0, 0], [Infinity, Infinity]];
      updatedMarkers = [];
      markersToRemoveById = {};
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        markersToRemoveById[marker.id] = marker;
      }
      this.editSession.scanInBufferRange(this.getRegex(), bufferRange, (function(_this) {
        return function(_arg) {
          var range;
          range = _arg.range;
          if (marker = _this.findMarker(range)) {
            delete markersToRemoveById[marker.id];
          } else {
            marker = _this.createMarker(range);
          }
          return updatedMarkers.push(marker);
        };
      })(this));
      for (id in markersToRemoveById) {
        marker = markersToRemoveById[id];
        marker.destroy();
      }
      this.markers = updatedMarkers;
      return this.moveToClosestResult();
    };

    SearchModel.prototype.findNext = function() {
      return this.moveToClosestResult(true);
    };

    SearchModel.prototype.moveToClosestResult = function(force) {
      var _ref;
      this.currentMarker = (this.direction === 'forward') && this.findMarkerForward(force) || this.findMarkerBackward(force);
      if ((_ref = this.currentDecoration) != null) {
        _ref.destroy();
      }
      this.currentDecoration = null;
      if (this.currentMarker) {
        this.editSession.scrollToScreenRange(this.currentMarker.getScreenRange());
        this.currentDecoration = this.editSession.decorateMarker(this.currentMarker, {
          type: 'highlight',
          "class": this.constructor.currentClass
        });
        return this.lastPosition = this.currentMarker.getBufferRange();
      }
    };

    SearchModel.prototype.findMarkerForward = function(force) {
      var comp, marker, markerStartPosition, range, start, _i, _len, _ref, _ref1;
      if (!this.markers.length) {
        return null;
      }
      range = this.lastPosition || ((_ref = this.startMarker) != null ? _ref.getScreenRange() : void 0) || this.editSession.getSelection().getBufferRange();
      start = range.start;
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        markerStartPosition = marker.bufferMarker.getStartPosition();
        comp = markerStartPosition.compare(start);
        if (comp > 0 || (comp === 0 && !force)) {
          return marker;
        }
      }
      return this.markers[0];
    };

    SearchModel.prototype.findMarkerBackward = function(force) {
      var comp, marker, markerStartPosition, prev, range, start, _i, _len, _ref, _ref1;
      if (!this.markers.length) {
        return null;
      }
      range = this.lastPosition || ((_ref = this.startMarker) != null ? _ref.getScreenRange() : void 0) || this.editSession.getSelection().getBufferRange();
      start = range.start;
      prev = null;
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        markerStartPosition = marker.bufferMarker.getStartPosition();
        comp = markerStartPosition.compare(start);
        if (comp === 0 && !force) {
          return marker;
        }
        if (comp < 0) {
          prev = marker;
        } else {
          break;
        }
      }
      return prev || this.markers[this.markers.length - 1];
    };

    SearchModel.prototype.destroyResultMarkers = function() {
      var marker, _i, _len, _ref, _ref1;
      this.valid = false;
      _ref1 = (_ref = this.markers) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        marker.destroy();
      }
      this.markers = [];
      this.currentMarker = null;
      return this.currentDecoration = null;
    };

    SearchModel.prototype.update = function(newParams) {
      var currentParams;
      if (newParams == null) {
        newParams = {};
      }
      currentParams = {
        pattern: this.pattern,
        direction: this.direction,
        useRegex: this.useRegex,
        caseSensitive: this.caseSensitive
      };
      _.defaults(newParams, currentParams);
      if (!(this.valid && _.isEqual(newParams, currentParams))) {
        _.extend(this, newParams);
        return this.updateMarkers();
      }
    };

    SearchModel.prototype.getRegex = function() {
      var flags, normalSearchRegex;
      flags = 'g';
      if (!this.caseSensitive) {
        flags += 'i';
      }
      normalSearchRegex = RegExp(_.escapeRegExp(this.pattern), flags);
      if (this.useRegex) {
        try {
          return new RegExp(this.pattern, flags);
        } catch (_error) {
          return normalSearchRegex;
        }
      } else {
        return normalSearchRegex;
      }
    };

    SearchModel.prototype.createMarker = function(range) {
      var decoration, marker, markerAttributes;
      markerAttributes = {
        "class": this.constructor.resultClass,
        invalidate: 'inside',
        replicate: false,
        persistent: false,
        isCurrent: false
      };
      marker = this.editSession.markBufferRange(range, markerAttributes);
      decoration = this.editSession.decorateMarker(marker, {
        type: 'highlight',
        "class": this.constructor.resultClass
      });
      return marker;
    };

    SearchModel.prototype.findMarker = function(range) {
      var attributes;
      attributes = {
        "class": this.constructor.resultClass,
        startPosition: range.start,
        endPosition: range.end
      };
      return _.find(this.editSession.findMarkers(attributes), function(marker) {
        return marker.isValid();
      });
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9pbmNyZW1lbnRhbC1zZWFyY2gvbGliL3NlYXJjaC1tb2RlbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFPQTtBQUFBLE1BQUEsNENBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFFQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBRkQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLFdBQXBCLENBQUEsQ0FBQTs7QUFBQSxJQUVBLFdBQUMsQ0FBQSxXQUFELEdBQWMsZ0JBRmQsQ0FBQTs7QUFBQSxJQUdBLFdBQUMsQ0FBQSxZQUFELEdBQWUsaUJBSGYsQ0FBQTs7QUFLYSxJQUFBLHFCQUFDLEtBQUQsR0FBQTtBQUVYLFVBQUEsV0FBQTs7UUFGWSxRQUFNO09BRWxCO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQWYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUhmLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFWWCxDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQWJqQixDQUFBO0FBQUEsTUFpQkEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBakJyQixDQUFBO0FBQUEsTUF3QkEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUF4QmhCLENBQUE7QUFBQSxNQTZCQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBN0JYLENBQUE7QUFBQSxNQThCQSxJQUFDLENBQUEsU0FBRCxHQUFhLFNBOUJi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

//# sourceURL=/Users/igawataiichi/.atom/packages/incremental-search/lib/search-model.coffee
