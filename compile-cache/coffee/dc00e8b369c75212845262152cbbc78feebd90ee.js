(function() {
  var CompositeDisposable, Entry, fs, path, settings;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

  settings = require('./settings');

  path = null;

  Entry = (function() {
    function Entry(editor, point, URI) {
      this.point = point;
      this.URI = URI;
      this.destroyed = false;
      if (!editor.isAlive()) {
        return;
      }
      this.editor = editor;
      this.subscriptions = new CompositeDisposable;
      this.marker = this.editor.markBufferPosition(this.point, {
        invalidate: 'never',
        persistent: false
      });
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function(_arg) {
          var newHeadBufferPosition;
          newHeadBufferPosition = _arg.newHeadBufferPosition;
          return _this.point = newHeadBufferPosition;
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.unSubscribe();
        };
      })(this)));
    }

    Entry.prototype.unSubscribe = function() {
      var _ref;
      this.subscriptions.dispose();
      return _ref = {}, this.editor = _ref.editor, this.subscriptions = _ref.subscriptions, _ref;
    };

    Entry.prototype.destroy = function() {
      var _ref, _ref1;
      if (this.editor != null) {
        this.unSubscribe();
      }
      this.destroyed = true;
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      return _ref1 = {}, this.point = _ref1.point, this.URI = _ref1.URI, this.marker = _ref1.marker, _ref1;
    };

    Entry.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    Entry.prototype.setURI = function(URI) {
      this.URI = URI;
    };

    Entry.prototype.isValid = function() {
      var _ref;
      if (this.isDestroyed()) {
        return false;
      }
      if (settings.get('excludeClosedBuffer')) {
        return ((_ref = this.editor) != null ? _ref.isAlive() : void 0) && fs.existsSync(this.URI);
      } else {
        return fs.existsSync(this.URI);
      }
    };

    Entry.prototype.isAtSameRow = function(_arg) {
      var URI, point;
      URI = _arg.URI, point = _arg.point;
      if ((point != null) && (this.point != null)) {
        return (URI === this.URI) && (point.row === this.point.row);
      } else {
        return false;
      }
    };

    Entry.prototype.inspect = function() {
      var s;
      if (path == null) {
        path = require('path');
      }
      s = "" + this.point + ", " + (path.basename(this.URI));
      if (!this.isValid()) {
        s += ' [invalid]';
      }
      return s;
    };

    return Entry;

  })();

  module.exports = Entry;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvZW50cnkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQVcsT0FBQSxDQUFRLElBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxJQUhQLENBQUE7O0FBQUEsRUFRTTtBQUNTLElBQUEsZUFBQyxNQUFELEVBQVUsS0FBVixFQUFrQixHQUFsQixHQUFBO0FBQ1gsTUFEb0IsSUFBQyxDQUFBLFFBQUEsS0FDckIsQ0FBQTtBQUFBLE1BRDRCLElBQUMsQ0FBQSxNQUFBLEdBQzdCLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FBYixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxPQUFQLENBQUEsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFHQSxJQUFDLENBQUEsTUFBRCxHQUFVLE1BSFYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUpqQixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsSUFBQyxDQUFBLEtBQTVCLEVBQ1I7QUFBQSxRQUFBLFVBQUEsRUFBWSxPQUFaO0FBQUEsUUFDQSxVQUFBLEVBQVksS0FEWjtPQURRLENBTFYsQ0FBQTtBQUFBLE1BU0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxN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

//# sourceURL=/Users/igawataiichi/.atom/packages/cursor-history/lib/entry.coffee
