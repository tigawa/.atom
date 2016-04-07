(function() {
  var CompositeDisposable, Disposable, Emitter, Flasher, History, ignoreCommands, path, settings, _, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable, Emitter = _ref.Emitter;

  _ = require('underscore-plus');

  path = require('path');

  History = null;

  Flasher = null;

  settings = require('./settings');

  ignoreCommands = ['cursor-history:next', 'cursor-history:prev', 'cursor-history:next-within-editor', 'cursor-history:prev-within-editor', 'cursor-history:clear'];

  module.exports = {
    config: settings.config,
    history: null,
    subscriptions: null,
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      History = require('./history');
      Flasher = require('./flasher');
      this.history = new History;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'cursor-history:next': (function(_this) {
          return function() {
            return _this.jump('next');
          };
        })(this),
        'cursor-history:prev': (function(_this) {
          return function() {
            return _this.jump('prev');
          };
        })(this),
        'cursor-history:next-within-editor': (function(_this) {
          return function() {
            return _this.jump('next', {
              withinEditor: true
            });
          };
        })(this),
        'cursor-history:prev-within-editor': (function(_this) {
          return function() {
            return _this.jump('prev', {
              withinEditor: true
            });
          };
        })(this),
        'cursor-history:clear': (function(_this) {
          return function() {
            return _this.history.clear();
          };
        })(this),
        'cursor-history:toggle-debug': function() {
          return settings.toggle('debug', {
            log: true
          });
        }
      }));
      this.observeMouse();
      this.observeCommands();
      return this.onDidChangeLocation((function(_this) {
        return function(_arg) {
          var newLocation, oldLocation;
          oldLocation = _arg.oldLocation, newLocation = _arg.newLocation;
          if (_this.needRemember(oldLocation.point, newLocation.point)) {
            return _this.saveHistory(oldLocation, {
              subject: "Cursor moved"
            });
          }
        };
      })(this));
    },
    onDidChangeLocation: function(fn) {
      return this.emitter.on('did-change-location', fn);
    },
    deactivate: function() {
      var _ref1;
      this.subscriptions.dispose();
      this.subscriptions = null;
      if ((_ref1 = this.history) != null) {
        _ref1.destroy();
      }
      return this.history = null;
    },
    needRemember: function(oldPoint, newPoint) {
      return Math.abs(oldPoint.row - newPoint.row) > settings.get('rowDeltaToRemember');
    },
    saveHistory: function(location, _arg) {
      var setIndexToHead, subject, _ref1;
      _ref1 = _arg != null ? _arg : {}, subject = _ref1.subject, setIndexToHead = _ref1.setIndexToHead;
      this.history.add(location, {
        setIndexToHead: setIndexToHead
      });
      if (settings.get('debug')) {
        return this.logHistory("" + subject + " [" + location.type + "]");
      }
    },
    observeMouse: function() {
      var handleBubble, handleCapture, locationStack, workspaceElement;
      locationStack = [];
      handleCapture = (function(_this) {
        return function(_arg) {
          var editor, target, _ref1;
          target = _arg.target;
          if ((typeof target.getModel === "function" ? (_ref1 = target.getModel()) != null ? typeof _ref1.getURI === "function" ? _ref1.getURI() : void 0 : void 0 : void 0) == null) {
            return;
          }
          if (!(editor = atom.workspace.getActiveTextEditor())) {
            return;
          }
          return locationStack.push(_this.getLocation('mousedown', editor));
        };
      })(this);
      handleBubble = (function(_this) {
        return function(_arg) {
          var target, _ref1;
          target = _arg.target;
          if ((typeof target.getModel === "function" ? (_ref1 = target.getModel()) != null ? typeof _ref1.getURI === "function" ? _ref1.getURI() : void 0 : void 0 : void 0) == null) {
            return;
          }
          return setTimeout(function() {
            if (locationStack.length) {
              return _this.checkLocationChange(locationStack.pop());
            }
          }, 100);
        };
      })(this);
      workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.addEventListener('mousedown', handleCapture, true);
      workspaceElement.addEventListener('mousedown', handleBubble, false);
      return this.subscriptions.add(new Disposable(function() {
        workspaceElement.removeEventListener('mousedown', handleCapture, true);
        return workspaceElement.removeEventListener('mousedown', handleBubble, false);
      }));
    },
    isIgnoreCommands: function(command) {
      return (__indexOf.call(ignoreCommands, command) >= 0) || (__indexOf.call(settings.get('ignoreCommands'), command) >= 0);
    },
    observeCommands: function() {
      var locationStack, saveLocation, shouldSaveLocation;
      shouldSaveLocation = function(type, target) {
        var _ref1;
        return (__indexOf.call(type, ':') >= 0) && ((typeof target.getModel === "function" ? (_ref1 = target.getModel()) != null ? typeof _ref1.getURI === "function" ? _ref1.getURI() : void 0 : void 0 : void 0) != null);
      };
      locationStack = [];
      saveLocation = _.debounce((function(_this) {
        return function(type, target) {
          if (!shouldSaveLocation(type, target)) {
            return;
          }
          return locationStack.push(_this.getLocation(type, target.getModel()));
        };
      })(this), 100, true);
      this.subscriptions.add(atom.commands.onWillDispatch((function(_this) {
        return function(_arg) {
          var target, type;
          type = _arg.type, target = _arg.target;
          if (_this.isIgnoreCommands(type)) {
            return;
          }
          return saveLocation(type, target);
        };
      })(this)));
      return this.subscriptions.add(atom.commands.onDidDispatch((function(_this) {
        return function(_arg) {
          var target, type;
          type = _arg.type, target = _arg.target;
          if (_this.isIgnoreCommands(type)) {
            return;
          }
          if (locationStack.length === 0) {
            return;
          }
          if (!shouldSaveLocation(type, target)) {
            return;
          }
          return setTimeout(function() {
            if (locationStack.length) {
              return _this.checkLocationChange(locationStack.pop());
            }
          }, 100);
        };
      })(this)));
    },
    checkLocationChange: function(oldLocation) {
      var editor, editorElement, newLocation;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      editorElement = atom.views.getView(editor);
      if (editorElement.hasFocus() && (editor.getURI() === oldLocation.URI)) {
        newLocation = this.getLocation(oldLocation.type, editor);
        return this.emitter.emit('did-change-location', {
          oldLocation: oldLocation,
          newLocation: newLocation
        });
      } else {
        return this.saveHistory(oldLocation, {
          subject: "Save on focus lost"
        });
      }
    },
    jump: function(direction, _arg) {
      var URI, editor, entry, forURI, needToSave, options, point, searchAllPanes, withinEditor;
      withinEditor = (_arg != null ? _arg : {}).withinEditor;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      needToSave = (direction === 'prev') && this.history.isIndexAtHead();
      forURI = withinEditor ? editor.getURI() : null;
      if (!(entry = this.history.get(direction, {
        URI: forURI
      }))) {
        return;
      }
      point = entry.point, URI = entry.URI;
      if (needToSave) {
        this.saveHistory(this.getLocation('prev', editor), {
          setIndexToHead: false,
          subject: "Save head position"
        });
      }
      options = {
        point: point,
        direction: direction,
        log: !needToSave
      };
      if (editor.getURI() === URI) {
        return this.land(editor, options);
      } else {
        searchAllPanes = settings.get('searchAllPanes');
        return atom.workspace.open(URI, {
          searchAllPanes: searchAllPanes
        }).then((function(_this) {
          return function(editor) {
            return _this.land(editor, options);
          };
        })(this));
      }
    },
    land: function(editor, _arg) {
      var direction, log, point;
      point = _arg.point, direction = _arg.direction, log = _arg.log;
      editor.setCursorBufferPosition(point);
      editor.scrollToCursorPosition({
        center: true
      });
      if (settings.get('flashOnLand')) {
        Flasher.flash();
      }
      if (settings.get('debug') && log) {
        return this.logHistory(direction);
      }
    },
    getLocation: function(type, editor) {
      return {
        type: type,
        editor: editor,
        point: editor.getCursorBufferPosition(),
        URI: editor.getURI()
      };
    },
    logHistory: function(msg) {
      var s;
      s = "# cursor-history: " + msg + "\n" + (this.history.inspect());
      return console.log(s, "\n\n");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsbUdBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLE9BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFBdEIsRUFBa0MsZUFBQSxPQUFsQyxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsT0FBQSxHQUFXLElBSlgsQ0FBQTs7QUFBQSxFQUtBLE9BQUEsR0FBVyxJQUxYLENBQUE7O0FBQUEsRUFNQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FOWCxDQUFBOztBQUFBLEVBUUEsY0FBQSxHQUFpQixDQUNmLHFCQURlLEVBRWYscUJBRmUsRUFHZixtQ0FIZSxFQUlmLG1DQUplLEVBS2Ysc0JBTGUsQ0FSakIsQ0FBQTs7QUFBQSxFQWdCQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0FBQUEsSUFDQSxPQUFBLEVBQVMsSUFEVDtBQUFBLElBRUEsYUFBQSxFQUFlLElBRmY7QUFBQSxJQUlBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFXLE9BQUEsQ0FBUSxXQUFSLENBRFgsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFXLE9BQUEsQ0FBUSxXQUFSLENBRlgsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/cursor-history/lib/main.coffee
