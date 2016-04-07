(function() {
  var Entry, History, settings, _;

  _ = require('underscore-plus');

  Entry = require('./entry');

  settings = require('./settings');

  History = (function() {
    function History() {
      this.init();
    }

    History.prototype.init = function() {
      this.index = 0;
      return this.entries = [];
    };

    History.prototype.clear = function() {
      var e, _i, _len, _ref;
      _ref = this.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e.destroy();
      }
      return this.init();
    };

    History.prototype.destroy = function() {
      var e, _i, _len, _ref, _ref1;
      _ref = this.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e.destroy();
      }
      return _ref1 = {}, this.index = _ref1.index, this.entries = _ref1.entries, _ref1;
    };

    History.prototype.isIndexAtHead = function() {
      return this.index === this.entries.length;
    };

    History.prototype.findIndex = function(direction, URI) {
      var entry, index, indexes, start, _i, _len, _ref;
      if (URI == null) {
        URI = null;
      }
      _ref = (function() {
        var _i, _j, _ref, _results, _results1;
        switch (direction) {
          case 'next':
            return [
              start = this.index + 1, (function() {
                _results = [];
                for (var _i = start, _ref = this.entries.length - 1; start <= _ref ? _i <= _ref : _i >= _ref; start <= _ref ? _i++ : _i--){ _results.push(_i); }
                return _results;
              }).apply(this)
            ];
          case 'prev':
            return [
              start = this.index - 1, (function() {
                _results1 = [];
                for (var _j = start; start <= 0 ? _j <= 0 : _j >= 0; start <= 0 ? _j++ : _j--){ _results1.push(_j); }
                return _results1;
              }).apply(this)
            ];
        }
      }).call(this), start = _ref[0], indexes = _ref[1];
      if (!((0 <= start && start <= (this.entries.length - 1)))) {
        return null;
      }
      for (_i = 0, _len = indexes.length; _i < _len; _i++) {
        index = indexes[_i];
        entry = this.entries[index];
        if (!entry.isValid()) {
          continue;
        }
        if (URI != null) {
          if (entry.URI === URI) {
            return index;
          }
        } else {
          return index;
        }
      }
    };

    History.prototype.get = function(direction, _arg) {
      var URI, index;
      URI = (_arg != null ? _arg : {}).URI;
      index = this.findIndex(direction, URI);
      if (index != null) {
        return this.entries[this.index = index];
      }
    };

    History.prototype.add = function(_arg, _arg1) {
      var URI, e, editor, newEntry, point, setIndexToHead, _i, _len, _ref;
      editor = _arg.editor, point = _arg.point, URI = _arg.URI;
      setIndexToHead = (_arg1 != null ? _arg1 : {}).setIndexToHead;
      newEntry = new Entry(editor, point, URI);
      _ref = this.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        if (e.isAtSameRow(newEntry)) {
          e.destroy();
        }
      }
      this.entries.push(newEntry);
      if (setIndexToHead != null ? setIndexToHead : true) {
        this.removeEntries();
        return this.index = this.entries.length;
      }
    };

    History.prototype.removeEntries = function() {
      var e, removeCount, removed, _i, _j, _len, _len1, _ref, _results;
      _ref = this.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        if (!e.isValid()) {
          e.destroy();
        }
      }
      this.entries = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = this.entries;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          e = _ref1[_j];
          if (e.isValid()) {
            _results.push(e);
          }
        }
        return _results;
      }).call(this);
      removeCount = this.entries.length - settings.get('max');
      if (removeCount > 0) {
        removed = this.entries.splice(0, removeCount);
        _results = [];
        for (_j = 0, _len1 = removed.length; _j < _len1; _j++) {
          e = removed[_j];
          _results.push(e.destroy());
        }
        return _results;
      }
    };

    History.prototype.inspect = function(msg) {
      var ary, e, i, s;
      ary = (function() {
        var _i, _len, _ref, _results;
        _ref = this.entries;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          e = _ref[i];
          s = i === this.index ? "> " : "  ";
          _results.push("" + s + i + ": " + (e.inspect()));
        }
        return _results;
      }).call(this);
      if (this.index === this.entries.length) {
        ary.push("> " + this.index + ":");
      }
      return ary.join("\n");
    };

    return History;

  })();

  module.exports = History;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvaGlzdG9yeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkJBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQURSLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FGWCxDQUFBOztBQUFBLEVBSU07QUFDUyxJQUFBLGlCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSxzQkFHQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBQVQsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FGUDtJQUFBLENBSE4sQ0FBQTs7QUFBQSxzQkFPQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsVUFBQSxpQkFBQTtBQUFBO0FBQUEsV0FBQSwyQ0FBQTtxQkFBQTtBQUFBLFFBQUEsQ0FBQyxDQUFDLE9BQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxPQUFBO2FBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUZLO0lBQUEsQ0FQUCxDQUFBOztBQUFBLHNCQVdBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHdCQUFBO0FBQUE7QUFBQSxXQUFBLDJDQUFBO3FCQUFBO0FBQUEsUUFBQSxDQUFDLENBQUMsT0FBRixDQUFBLENBQUEsQ0FBQTtBQUFBLE9BQUE7YUFDQSxRQUFxQixFQUFyQixFQUFDLElBQUMsQ0FBQSxjQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsZ0JBQUEsT0FBVixF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

//# sourceURL=/Users/igawataiichi/.atom/packages/cursor-history/lib/history.coffee
