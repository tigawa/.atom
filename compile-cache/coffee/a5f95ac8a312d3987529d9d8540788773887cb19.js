(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    positionHistory: [],
    positionFuture: [],
    wasrewinding: false,
    rewinding: false,
    wasforwarding: false,
    forwarding: false,
    editorSubscription: null,
    activate: function() {
      var ed, pane, pos;
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(activeEd) {
          return activeEd.onDidChangeCursorPosition(function(event) {
            var activePane, lastEd, lastPane, lastPos, _ref;
            activePane = atom.workspace.getActivePane();
            if (_this.rewinding === false && _this.forwarding === false) {
              if (_this.positionHistory.length) {
                _ref = _this.positionHistory.slice(-1)[0], lastPane = _ref.pane, lastEd = _ref.editor, lastPos = _ref.position;
                if (activePane === lastPane && activeEd === lastEd && Math.abs(lastPos.serialize()[0] - event.newBufferPosition.serialize()[0]) < 3) {
                  return;
                }
              }
              _this.positionHistory.push({
                pane: activePane,
                editor: activeEd,
                position: event.newBufferPosition
              });
              _this.positionFuture = [];
              _this.wasrewinding = false;
              _this.wasforwarding = false;
            }
            _this.rewinding = false;
            return _this.forwarding = false;
          });
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidDestroyPane((function(_this) {
        return function(event) {
          var pos;
          _this.positionHistory = (function() {
            var _i, _len, _ref, _results;
            _ref = this.positionHistory;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              pos = _ref[_i];
              if (pos.pane !== event.pane) {
                _results.push(pos);
              }
            }
            return _results;
          }).call(_this);
          return _this.positionFuture = (function() {
            var _i, _len, _ref, _results;
            _ref = this.positionFuture;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              pos = _ref[_i];
              if (pos.pane !== event.pane) {
                _results.push(pos);
              }
            }
            return _results;
          }).call(_this);
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidDestroyPaneItem((function(_this) {
        return function(event) {
          var pos;
          _this.positionHistory = (function() {
            var _i, _len, _ref, _results;
            _ref = this.positionHistory;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              pos = _ref[_i];
              if (pos.editor !== event.item) {
                _results.push(pos);
              }
            }
            return _results;
          }).call(_this);
          return _this.positionFuture = (function() {
            var _i, _len, _ref, _results;
            _ref = this.positionFuture;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              pos = _ref[_i];
              if (pos.editor !== event.item) {
                _results.push(pos);
              }
            }
            return _results;
          }).call(_this);
        };
      })(this)));
      ed = atom.workspace.getActiveTextEditor();
      pane = atom.workspace.getActivePane();
      if ((pane != null) && (ed != null)) {
        pos = ed.getCursorBufferPosition();
        this.positionHistory.push({
          pane: pane,
          editor: ed,
          position: pos
        });
      }
      return this.disposables.add(atom.commands.add('atom-workspace', {
        'last-cursor-position:previous': (function(_this) {
          return function() {
            return _this.previous();
          };
        })(this),
        'last-cursor-position:next': (function(_this) {
          return function() {
            return _this.next();
          };
        })(this)
      }));
    },
    previous: function() {
      var foundeditor, pos, temp;
      if (this.wasforwarding || this.wasrewinding === false) {
        temp = this.positionHistory.pop();
        if (temp != null) {
          this.positionFuture.push(temp);
        }
      }
      pos = this.positionHistory.pop();
      if (pos != null) {
        this.positionFuture.push(pos);
        this.rewinding = true;
        this.wasrewinding = true;
        this.wasforwarding = false;
        foundeditor = true;
        if (pos.pane !== atom.workspace.getActivePane()) {
          pos.pane.activate();
        }
        if (pos.editor !== atom.workspace.getActiveTextEditor()) {
          atom.workspace.getActivePane().activateItem(pos.editor);
        }
        atom.workspace.getActiveTextEditor().setCursorBufferPosition(pos.position, {
          autoscroll: false
        });
        return atom.workspace.getActiveTextEditor().scrollToCursorPosition({
          center: true
        });
      }
    },
    next: function() {
      var foundeditor, pos, temp;
      if (this.wasrewinding || this.wasforwarding === false) {
        temp = this.positionFuture.pop();
        if (temp != null) {
          this.positionHistory.push(temp);
        }
      }
      pos = this.positionFuture.pop();
      if (pos != null) {
        this.positionHistory.push(pos);
        this.forwarding = true;
        this.wasforwarding = true;
        this.wasrewinding = false;
        foundeditor = true;
        if (pos.pane !== atom.workspace.getActivePane) {
          pos.pane.activate();
        }
        if (pos.editor !== atom.workspace.getActiveTextEditor()) {
          atom.workspace.getActivePane().activateItem(pos.editor);
        }
        atom.workspace.getActiveTextEditor().setCursorBufferPosition(pos.position, {
          autoscroll: false
        });
        return atom.workspace.getActiveTextEditor().scrollToCursorPosition({
          center: true
        });
      }
    },
    deactivate: function() {
      return this.disposables.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9sYXN0LWN1cnNvci1wb3NpdGlvbi9saWIvbGFzdC1jdXJzb3ItcG9zaXRpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNHO0FBQUEsSUFBQSxlQUFBLEVBQWlCLEVBQWpCO0FBQUEsSUFDQSxjQUFBLEVBQWdCLEVBRGhCO0FBQUEsSUFFQSxZQUFBLEVBQWMsS0FGZDtBQUFBLElBR0EsU0FBQSxFQUFXLEtBSFg7QUFBQSxJQUlBLGFBQUEsRUFBYyxLQUpkO0FBQUEsSUFLQSxVQUFBLEVBQVksS0FMWjtBQUFBLElBTUEsa0JBQUEsRUFBb0IsSUFOcEI7QUFBQSxJQVFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUCxVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUFmLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFFBQUQsR0FBQTtpQkFHaEQsUUFBUSxDQUFDLHlCQUFULENBQW1DLFNBQUMsS0FBRCxHQUFBO0FBRWhDLGdCQUFBLDJDQUFBO0FBQUEsWUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBYixDQUFBO0FBRUEsWUFBQSxJQUFHLEtBQUMsQ0FBQSxTQUFELEtBQWMsS0FBZCxJQUF3QixLQUFDLENBQUEsVUFBRCxLQUFlLEtBQTFDO0FBQ0csY0FBQSxJQUFHLEtB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

//# sourceURL=/Users/igawataiichi/.atom/packages/last-cursor-position/lib/last-cursor-position.coffee
