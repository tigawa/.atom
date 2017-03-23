(function() {
  var CompositeDisposable, Disposable, Emitter, History, Location, Range, _, closestTextEditor, defaultIgnoreCommands, findEditorForPaneByURI, isTextEditor, path, pointDelta, ref, settings,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable, Emitter = ref.Emitter, Range = ref.Range;

  _ = require('underscore-plus');

  path = require('path');

  History = require('./history');

  settings = require('./settings');

  defaultIgnoreCommands = ['cursor-history:next', 'cursor-history:prev', 'cursor-history:next-within-editor', 'cursor-history:prev-within-editor', 'cursor-history:clear'];

  isTextEditor = function(object) {
    return atom.workspace.isTextEditor(object);
  };

  findEditorForPaneByURI = function(pane, URI) {
    var i, item, len, ref1;
    ref1 = pane.getItems();
    for (i = 0, len = ref1.length; i < len; i++) {
      item = ref1[i];
      if (isTextEditor(item)) {
        if (item.getURI() === URI) {
          return item;
        }
      }
    }
  };

  pointDelta = function(pointA, pointB) {
    if (pointA.isGreaterThan(pointB)) {
      return pointA.traversalFrom(pointB);
    } else {
      return pointB.traversalFrom(pointA);
    }
  };

  closestTextEditor = function(target) {
    var ref1;
    return target != null ? typeof target.closest === "function" ? (ref1 = target.closest('atom-text-editor')) != null ? ref1.getModel() : void 0 : void 0 : void 0;
  };

  Location = (function() {
    function Location(type1, editor1) {
      this.type = type1;
      this.editor = editor1;
      this.point = this.editor.getCursorBufferPosition();
      this.URI = this.editor.getURI();
    }

    return Location;

  })();

  module.exports = {
    config: settings.config,
    history: null,
    subscriptions: null,
    ignoreCommands: null,
    onDidChangeLocation: function(fn) {
      return this.emitter.on('did-change-location', fn);
    },
    onDidUnfocus: function(fn) {
      return this.emitter.on('did-unfocus', fn);
    },
    activate: function() {
      var jump;
      this.subscriptions = new CompositeDisposable;
      this.history = new History;
      this.emitter = new Emitter;
      jump = this.jump.bind(this);
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'cursor-history:next': function() {
          return jump(this.getModel(), 'next');
        },
        'cursor-history:prev': function() {
          return jump(this.getModel(), 'prev');
        },
        'cursor-history:next-within-editor': function() {
          return jump(this.getModel(), 'next', {
            withinEditor: true
          });
        },
        'cursor-history:prev-within-editor': function() {
          return jump(this.getModel(), 'prev', {
            withinEditor: true
          });
        },
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
      this.observeSettings();
      this.onDidChangeLocation((function(_this) {
        return function(arg) {
          var column, newLocation, oldLocation, ref1, row;
          oldLocation = arg.oldLocation, newLocation = arg.newLocation;
          ref1 = pointDelta(oldLocation.point, newLocation.point), row = ref1.row, column = ref1.column;
          if ((row > settings.get('rowDeltaToRemember')) || (row === 0 && column > settings.get('columnDeltaToRemember'))) {
            return _this.saveHistory(oldLocation, {
              subject: "Cursor moved"
            });
          }
        };
      })(this));
      return this.onDidUnfocus((function(_this) {
        return function(arg) {
          var oldLocation;
          oldLocation = arg.oldLocation;
          return _this.saveHistory(oldLocation, {
            subject: "Save on focus lost"
          });
        };
      })(this));
    },
    deactivate: function() {
      var ref1;
      settings.destroy();
      this.subscriptions.dispose();
      this.history.destroy();
      return ref1 = {}, this.history = ref1.history, this.subscriptions = ref1.subscriptions, ref1;
    },
    observeSettings: function() {
      settings.observe('keepSingleEntryPerBuffer', (function(_this) {
        return function(newValue) {
          if (newValue) {
            return _this.history.uniqueByBuffer();
          }
        };
      })(this));
      return settings.observe('ignoreCommands', (function(_this) {
        return function(newValue) {
          return _this.ignoreCommands = defaultIgnoreCommands.concat(newValue);
        };
      })(this));
    },
    saveHistory: function(location, arg) {
      var ref1, setIndexToHead, subject;
      ref1 = arg != null ? arg : {}, subject = ref1.subject, setIndexToHead = ref1.setIndexToHead;
      this.history.add(location, {
        setIndexToHead: setIndexToHead
      });
      if (settings.get('debug')) {
        return this.logHistory(subject + " [" + location.type + "]");
      }
    },
    observeMouse: function() {
      var handleBubble, handleCapture, locationStack, workspaceElement;
      locationStack = [];
      handleCapture = function(event) {
        var editor;
        editor = closestTextEditor(event.target);
        if (editor != null ? editor.getURI() : void 0) {
          return locationStack.push(new Location('mousedown', editor));
        }
      };
      handleBubble = (function(_this) {
        return function(event) {
          var ref1;
          if ((ref1 = closestTextEditor(event.target)) != null ? ref1.getURI() : void 0) {
            return setTimeout(function() {
              var location;
              if (location = locationStack.pop()) {
                return _this.checkLocationChange(location);
              }
            }, 100);
          }
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
    observeCommands: function() {
      var isInterestingCommand, locationStack, trackLocationChange, trackLocationChangeDebounced;
      isInterestingCommand = (function(_this) {
        return function(type) {
          return (indexOf.call(type, ':') >= 0) && (indexOf.call(_this.ignoreCommands, type) < 0);
        };
      })(this);
      this.locationStackForTestSpec = locationStack = [];
      trackLocationChange = function(type, editor) {
        return locationStack.push(new Location(type, editor));
      };
      trackLocationChangeDebounced = _.debounce(trackLocationChange, 100, true);
      this.subscriptions.add(atom.commands.onWillDispatch(function(arg) {
        var editor, target, type;
        type = arg.type, target = arg.target;
        editor = closestTextEditor(target);
        if ((editor != null ? editor.getURI() : void 0) && isInterestingCommand(type)) {
          return trackLocationChangeDebounced(type, editor);
        }
      }));
      return this.subscriptions.add(atom.commands.onDidDispatch((function(_this) {
        return function(arg) {
          var editor, target, type;
          type = arg.type, target = arg.target;
          if (locationStack.length === 0) {
            return;
          }
          editor = closestTextEditor(target);
          if ((editor != null ? editor.getURI() : void 0) && isInterestingCommand(type)) {
            return setTimeout(function() {
              var location;
              if (location = locationStack.pop()) {
                return _this.checkLocationChange(location);
              }
            }, 100);
          }
        };
      })(this)));
    },
    checkLocationChange: function(oldLocation) {
      var editor, newLocation;
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return;
      }
      if (editor.element.hasFocus() && (editor.getURI() === oldLocation.URI)) {
        newLocation = new Location(oldLocation.type, editor);
        return this.emitter.emit('did-change-location', {
          oldLocation: oldLocation,
          newLocation: newLocation
        });
      } else {
        return this.emitter.emit('did-unfocus', {
          oldLocation: oldLocation
        });
      }
    },
    jump: function(editor, direction, arg) {
      var URI, activePane, entry, item, location, needToLog, point, wasAtHead, withinEditor;
      withinEditor = (arg != null ? arg : {}).withinEditor;
      wasAtHead = this.history.isIndexAtHead();
      if (withinEditor) {
        entry = this.history.get(direction, {
          URI: editor.getURI()
        });
      } else {
        entry = this.history.get(direction);
      }
      if (entry == null) {
        return;
      }
      point = entry.point, URI = entry.URI;
      needToLog = true;
      if ((direction === 'prev') && wasAtHead) {
        location = new Location('prev', editor);
        this.saveHistory(location, {
          setIndexToHead: false,
          subject: "Save head position"
        });
        needToLog = false;
      }
      activePane = atom.workspace.getActivePane();
      if (editor.getURI() === URI) {
        return this.land(editor, point, direction, {
          log: needToLog
        });
      } else if (item = findEditorForPaneByURI(activePane, URI)) {
        activePane.activateItem(item);
        return this.land(item, point, direction, {
          forceFlash: true,
          log: needToLog
        });
      } else {
        return atom.workspace.open(URI, {
          searchAllPanes: settings.get('searchAllPanes')
        }).then((function(_this) {
          return function(editor) {
            return _this.land(editor, point, direction, {
              forceFlash: true,
              log: needToLog
            });
          };
        })(this));
      }
    },
    land: function(editor, point, direction, options) {
      var originalRow;
      if (options == null) {
        options = {};
      }
      originalRow = editor.getCursorBufferPosition().row;
      editor.setCursorBufferPosition(point, {
        autoscroll: false
      });
      editor.scrollToCursorPosition({
        center: true
      });
      if (settings.get('flashOnLand')) {
        if (options.forceFlash || (originalRow !== point.row)) {
          this.flash(editor);
        }
      }
      if (settings.get('debug') && options.log) {
        return this.logHistory(direction);
      }
    },
    flashMarker: null,
    flash: function(editor) {
      var cursorPosition, decorationOptions, destroyMarker, disposable, ref1;
      if ((ref1 = this.flashMarker) != null) {
        ref1.destroy();
      }
      cursorPosition = editor.getCursorBufferPosition();
      this.flashMarker = editor.markBufferPosition(cursorPosition);
      decorationOptions = {
        type: 'line',
        "class": 'cursor-history-flash-line'
      };
      editor.decorateMarker(this.flashMarker, decorationOptions);
      destroyMarker = (function(_this) {
        return function() {
          var disposable, ref2;
          if (typeof disposable !== "undefined" && disposable !== null) {
            disposable.destroy();
          }
          disposable = null;
          return (ref2 = _this.flashMarker) != null ? ref2.destroy() : void 0;
        };
      })(this);
      disposable = editor.onDidChangeCursorPosition(destroyMarker);
      return setTimeout(destroyMarker, 1000);
    },
    logHistory: function(msg) {
      var s;
      s = "# cursor-history: " + msg + "\n" + (this.history.inspect());
      return console.log(s, "\n\n");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNMQUFBO0lBQUE7O0VBQUEsTUFBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyw2Q0FBRCxFQUFzQiwyQkFBdEIsRUFBa0MscUJBQWxDLEVBQTJDOztFQUMzQyxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1YsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLHFCQUFBLEdBQXdCLENBQ3RCLHFCQURzQixFQUV0QixxQkFGc0IsRUFHdEIsbUNBSHNCLEVBSXRCLG1DQUpzQixFQUt0QixzQkFMc0I7O0VBUXhCLFlBQUEsR0FBZSxTQUFDLE1BQUQ7V0FDYixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FBNEIsTUFBNUI7RUFEYTs7RUFHZixzQkFBQSxHQUF5QixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ3ZCLFFBQUE7QUFBQTtBQUFBLFNBQUEsc0NBQUE7O1VBQWlDLFlBQUEsQ0FBYSxJQUFiO1FBQy9CLElBQWUsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEtBQWlCLEdBQWhDO0FBQUEsaUJBQU8sS0FBUDs7O0FBREY7RUFEdUI7O0VBSXpCLFVBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxNQUFUO0lBQ1gsSUFBRyxNQUFNLENBQUMsYUFBUCxDQUFxQixNQUFyQixDQUFIO2FBQ0UsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsTUFBckIsRUFERjtLQUFBLE1BQUE7YUFHRSxNQUFNLENBQUMsYUFBUCxDQUFxQixNQUFyQixFQUhGOztFQURXOztFQU1iLGlCQUFBLEdBQW9CLFNBQUMsTUFBRDtBQUNsQixRQUFBOzZIQUFvQyxDQUFFLFFBQXRDLENBQUE7RUFEa0I7O0VBR2Q7SUFDUyxrQkFBQyxLQUFELEVBQVEsT0FBUjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFNBQUQ7TUFDbkIsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUE7TUFDVCxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO0lBRkk7Ozs7OztFQUlmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0lBQ0EsT0FBQSxFQUFTLElBRFQ7SUFFQSxhQUFBLEVBQWUsSUFGZjtJQUdBLGNBQUEsRUFBZ0IsSUFIaEI7SUFLQSxtQkFBQSxFQUFxQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxxQkFBWixFQUFtQyxFQUFuQztJQUFSLENBTHJCO0lBTUEsWUFBQSxFQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUixDQU5kO0lBUUEsUUFBQSxFQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixJQUFBLEdBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsSUFBWDtNQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQ2pCO1FBQUEscUJBQUEsRUFBdUIsU0FBQTtpQkFBRyxJQUFBLENBQUssSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFMLEVBQWtCLE1BQWxCO1FBQUgsQ0FBdkI7UUFDQSxxQkFBQSxFQUF1QixTQUFBO2lCQUFHLElBQUEsQ0FBSyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUwsRUFBa0IsTUFBbEI7UUFBSCxDQUR2QjtRQUVBLG1DQUFBLEVBQXFDLFNBQUE7aUJBQUcsSUFBQSxDQUFLLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBTCxFQUFrQixNQUFsQixFQUEwQjtZQUFBLFlBQUEsRUFBYyxJQUFkO1dBQTFCO1FBQUgsQ0FGckM7UUFHQSxtQ0FBQSxFQUFxQyxTQUFBO2lCQUFHLElBQUEsQ0FBSyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUwsRUFBa0IsTUFBbEIsRUFBMEI7WUFBQSxZQUFBLEVBQWMsSUFBZDtXQUExQjtRQUFILENBSHJDO1FBSUEsc0JBQUEsRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUp4QjtRQUtBLDZCQUFBLEVBQStCLFNBQUE7aUJBQUcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsT0FBaEIsRUFBeUI7WUFBQSxHQUFBLEVBQUssSUFBTDtXQUF6QjtRQUFILENBTC9CO09BRGlCLENBQW5CO01BUUEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxlQUFELENBQUE7TUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBO01BRUEsSUFBQyxDQUFBLG1CQUFELENBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ25CLGNBQUE7VUFEcUIsK0JBQWE7VUFDbEMsT0FBZ0IsVUFBQSxDQUFXLFdBQVcsQ0FBQyxLQUF2QixFQUE4QixXQUFXLENBQUMsS0FBMUMsQ0FBaEIsRUFBQyxjQUFELEVBQU07VUFDTixJQUFHLENBQUMsR0FBQSxHQUFNLFFBQVEsQ0FBQyxHQUFULENBQWEsb0JBQWIsQ0FBUCxDQUFBLElBQThDLENBQUMsR0FBQSxLQUFPLENBQVAsSUFBYSxNQUFBLEdBQVMsUUFBUSxDQUFDLEdBQVQsQ0FBYSx1QkFBYixDQUF2QixDQUFqRDttQkFDRSxLQUFDLENBQUEsV0FBRCxDQUFhLFdBQWIsRUFBMEI7Y0FBQSxPQUFBLEVBQVMsY0FBVDthQUExQixFQURGOztRQUZtQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7YUFLQSxJQUFDLENBQUEsWUFBRCxDQUFjLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ1osY0FBQTtVQURjLGNBQUQ7aUJBQ2IsS0FBQyxDQUFBLFdBQUQsQ0FBYSxXQUFiLEVBQTBCO1lBQUEsT0FBQSxFQUFTLG9CQUFUO1dBQTFCO1FBRFk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7SUF2QlEsQ0FSVjtJQWtDQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxRQUFRLENBQUMsT0FBVCxDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQTthQUNBLE9BQTZCLEVBQTdCLEVBQUMsSUFBQyxDQUFBLGVBQUEsT0FBRixFQUFXLElBQUMsQ0FBQSxxQkFBQSxhQUFaLEVBQUE7SUFKVSxDQWxDWjtJQXdDQSxlQUFBLEVBQWlCLFNBQUE7TUFDZixRQUFRLENBQUMsT0FBVCxDQUFpQiwwQkFBakIsRUFBNkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQ7VUFDM0MsSUFBRyxRQUFIO21CQUNFLEtBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUFBLEVBREY7O1FBRDJDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QzthQUlBLFFBQVEsQ0FBQyxPQUFULENBQWlCLGdCQUFqQixFQUFtQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsUUFBRDtpQkFDakMsS0FBQyxDQUFBLGNBQUQsR0FBa0IscUJBQXFCLENBQUMsTUFBdEIsQ0FBNkIsUUFBN0I7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkM7SUFMZSxDQXhDakI7SUFnREEsV0FBQSxFQUFhLFNBQUMsUUFBRCxFQUFXLEdBQVg7QUFDWCxVQUFBOzJCQURzQixNQUEwQixJQUF6Qix3QkFBUztNQUNoQyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCO1FBQUMsZ0JBQUEsY0FBRDtPQUF2QjtNQUNBLElBQWdELFFBQVEsQ0FBQyxHQUFULENBQWEsT0FBYixDQUFoRDtlQUFBLElBQUMsQ0FBQSxVQUFELENBQWUsT0FBRCxHQUFTLElBQVQsR0FBYSxRQUFRLENBQUMsSUFBdEIsR0FBMkIsR0FBekMsRUFBQTs7SUFGVyxDQWhEYjtJQThEQSxZQUFBLEVBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxhQUFBLEdBQWdCO01BQ2hCLGFBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBQ2QsWUFBQTtRQUFBLE1BQUEsR0FBUyxpQkFBQSxDQUFrQixLQUFLLENBQUMsTUFBeEI7UUFDVCxxQkFBRyxNQUFNLENBQUUsTUFBUixDQUFBLFVBQUg7aUJBQ0UsYUFBYSxDQUFDLElBQWQsQ0FBdUIsSUFBQSxRQUFBLENBQVMsV0FBVCxFQUFzQixNQUF0QixDQUF2QixFQURGOztNQUZjO01BS2hCLFlBQUEsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNiLGNBQUE7VUFBQSwyREFBa0MsQ0FBRSxNQUFqQyxDQUFBLFVBQUg7bUJBQ0UsVUFBQSxDQUFXLFNBQUE7QUFDVCxrQkFBQTtjQUFBLElBQWtDLFFBQUEsR0FBVyxhQUFhLENBQUMsR0FBZCxDQUFBLENBQTdDO3VCQUFBLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixRQUFyQixFQUFBOztZQURTLENBQVgsRUFFRSxHQUZGLEVBREY7O1FBRGE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BTWYsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtNQUNuQixnQkFBZ0IsQ0FBQyxnQkFBakIsQ0FBa0MsV0FBbEMsRUFBK0MsYUFBL0MsRUFBOEQsSUFBOUQ7TUFDQSxnQkFBZ0IsQ0FBQyxnQkFBakIsQ0FBa0MsV0FBbEMsRUFBK0MsWUFBL0MsRUFBNkQsS0FBN0Q7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBdUIsSUFBQSxVQUFBLENBQVcsU0FBQTtRQUNoQyxnQkFBZ0IsQ0FBQyxtQkFBakIsQ0FBcUMsV0FBckMsRUFBa0QsYUFBbEQsRUFBaUUsSUFBakU7ZUFDQSxnQkFBZ0IsQ0FBQyxtQkFBakIsQ0FBcUMsV0FBckMsRUFBa0QsWUFBbEQsRUFBZ0UsS0FBaEU7TUFGZ0MsQ0FBWCxDQUF2QjtJQWpCWSxDQTlEZDtJQW1GQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsb0JBQUEsR0FBdUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQ3JCLENBQUMsYUFBTyxJQUFQLEVBQUEsR0FBQSxNQUFELENBQUEsSUFBa0IsQ0FBQyxhQUFZLEtBQUMsQ0FBQSxjQUFiLEVBQUEsSUFBQSxLQUFEO1FBREc7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BR3ZCLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixhQUFBLEdBQWdCO01BQzVDLG1CQUFBLEdBQXNCLFNBQUMsSUFBRCxFQUFPLE1BQVA7ZUFDcEIsYUFBYSxDQUFDLElBQWQsQ0FBdUIsSUFBQSxRQUFBLENBQVMsSUFBVCxFQUFlLE1BQWYsQ0FBdkI7TUFEb0I7TUFFdEIsNEJBQUEsR0FBK0IsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxtQkFBWCxFQUFnQyxHQUFoQyxFQUFxQyxJQUFyQztNQUUvQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFkLENBQTZCLFNBQUMsR0FBRDtBQUM5QyxZQUFBO1FBRGdELGlCQUFNO1FBQ3RELE1BQUEsR0FBUyxpQkFBQSxDQUFrQixNQUFsQjtRQUNULHNCQUFHLE1BQU0sQ0FBRSxNQUFSLENBQUEsV0FBQSxJQUFxQixvQkFBQSxDQUFxQixJQUFyQixDQUF4QjtpQkFDRSw0QkFBQSxDQUE2QixJQUE3QixFQUFtQyxNQUFuQyxFQURGOztNQUY4QyxDQUE3QixDQUFuQjthQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWQsQ0FBNEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDN0MsY0FBQTtVQUQrQyxpQkFBTTtVQUNyRCxJQUFVLGFBQWEsQ0FBQyxNQUFkLEtBQXdCLENBQWxDO0FBQUEsbUJBQUE7O1VBQ0EsTUFBQSxHQUFTLGlCQUFBLENBQWtCLE1BQWxCO1VBQ1Qsc0JBQUcsTUFBTSxDQUFFLE1BQVIsQ0FBQSxXQUFBLElBQXFCLG9CQUFBLENBQXFCLElBQXJCLENBQXhCO21CQUNFLFVBQUEsQ0FBVyxTQUFBO0FBRVQsa0JBQUE7Y0FBQSxJQUFrQyxRQUFBLEdBQVcsYUFBYSxDQUFDLEdBQWQsQ0FBQSxDQUE3Qzt1QkFBQSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsUUFBckIsRUFBQTs7WUFGUyxDQUFYLEVBR0UsR0FIRixFQURGOztRQUg2QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsQ0FBbkI7SUFkZSxDQW5GakI7SUEwR0EsbUJBQUEsRUFBcUIsU0FBQyxXQUFEO0FBQ25CLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsSUFBQSxDQUFjLE1BQWQ7QUFBQSxlQUFBOztNQUVBLElBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFmLENBQUEsQ0FBQSxJQUE4QixDQUFDLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FBQSxLQUFtQixXQUFXLENBQUMsR0FBaEMsQ0FBakM7UUFFRSxXQUFBLEdBQWtCLElBQUEsUUFBQSxDQUFTLFdBQVcsQ0FBQyxJQUFyQixFQUEyQixNQUEzQjtlQUNsQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxxQkFBZCxFQUFxQztVQUFDLGFBQUEsV0FBRDtVQUFjLGFBQUEsV0FBZDtTQUFyQyxFQUhGO09BQUEsTUFBQTtlQUtFLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQWQsRUFBNkI7VUFBQyxhQUFBLFdBQUQ7U0FBN0IsRUFMRjs7SUFKbUIsQ0ExR3JCO0lBcUhBLElBQUEsRUFBTSxTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLEdBQXBCO0FBQ0osVUFBQTtNQUR5Qiw4QkFBRCxNQUFlO01BQ3ZDLFNBQUEsR0FBWSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQTtNQUNaLElBQUcsWUFBSDtRQUNFLEtBQUEsR0FBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxTQUFiLEVBQXdCO1VBQUEsR0FBQSxFQUFLLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FBTDtTQUF4QixFQURWO09BQUEsTUFBQTtRQUdFLEtBQUEsR0FBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxTQUFiLEVBSFY7O01BS0EsSUFBYyxhQUFkO0FBQUEsZUFBQTs7TUFHQyxtQkFBRCxFQUFRO01BRVIsU0FBQSxHQUFZO01BQ1osSUFBRyxDQUFDLFNBQUEsS0FBYSxNQUFkLENBQUEsSUFBMEIsU0FBN0I7UUFDRSxRQUFBLEdBQWUsSUFBQSxRQUFBLENBQVMsTUFBVCxFQUFpQixNQUFqQjtRQUNmLElBQUMsQ0FBQSxXQUFELENBQWEsUUFBYixFQUF1QjtVQUFBLGNBQUEsRUFBZ0IsS0FBaEI7VUFBdUIsT0FBQSxFQUFTLG9CQUFoQztTQUF2QjtRQUNBLFNBQUEsR0FBWSxNQUhkOztNQUtBLFVBQUEsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTtNQUNiLElBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUFBLEtBQW1CLEdBQXRCO2VBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxNQUFOLEVBQWMsS0FBZCxFQUFxQixTQUFyQixFQUFnQztVQUFBLEdBQUEsRUFBSyxTQUFMO1NBQWhDLEVBREY7T0FBQSxNQUVLLElBQUcsSUFBQSxHQUFPLHNCQUFBLENBQXVCLFVBQXZCLEVBQW1DLEdBQW5DLENBQVY7UUFDSCxVQUFVLENBQUMsWUFBWCxDQUF3QixJQUF4QjtlQUNBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFZLEtBQVosRUFBbUIsU0FBbkIsRUFBOEI7VUFBQSxVQUFBLEVBQVksSUFBWjtVQUFrQixHQUFBLEVBQUssU0FBdkI7U0FBOUIsRUFGRztPQUFBLE1BQUE7ZUFJSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsRUFBeUI7VUFBQSxjQUFBLEVBQWdCLFFBQVEsQ0FBQyxHQUFULENBQWEsZ0JBQWIsQ0FBaEI7U0FBekIsQ0FBd0UsQ0FBQyxJQUF6RSxDQUE4RSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE1BQUQ7bUJBQzVFLEtBQUMsQ0FBQSxJQUFELENBQU0sTUFBTixFQUFjLEtBQWQsRUFBcUIsU0FBckIsRUFBZ0M7Y0FBQSxVQUFBLEVBQVksSUFBWjtjQUFrQixHQUFBLEVBQUssU0FBdkI7YUFBaEM7VUFENEU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlFLEVBSkc7O0lBckJELENBckhOO0lBaUpBLElBQUEsRUFBTSxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLFNBQWhCLEVBQTJCLE9BQTNCO0FBQ0osVUFBQTs7UUFEK0IsVUFBUTs7TUFDdkMsV0FBQSxHQUFjLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUM7TUFDL0MsTUFBTSxDQUFDLHVCQUFQLENBQStCLEtBQS9CLEVBQXNDO1FBQUEsVUFBQSxFQUFZLEtBQVo7T0FBdEM7TUFDQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEI7UUFBQSxNQUFBLEVBQVEsSUFBUjtPQUE5QjtNQUVBLElBQUcsUUFBUSxDQUFDLEdBQVQsQ0FBYSxhQUFiLENBQUg7UUFDRSxJQUFHLE9BQU8sQ0FBQyxVQUFSLElBQXNCLENBQUMsV0FBQSxLQUFpQixLQUFLLENBQUMsR0FBeEIsQ0FBekI7VUFDRSxJQUFDLENBQUEsS0FBRCxDQUFPLE1BQVAsRUFERjtTQURGOztNQUlBLElBQUcsUUFBUSxDQUFDLEdBQVQsQ0FBYSxPQUFiLENBQUEsSUFBMEIsT0FBTyxDQUFDLEdBQXJDO2VBQ0UsSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFaLEVBREY7O0lBVEksQ0FqSk47SUE4SkEsV0FBQSxFQUFhLElBOUpiO0lBK0pBLEtBQUEsRUFBTyxTQUFDLE1BQUQ7QUFDTCxVQUFBOztZQUFZLENBQUUsT0FBZCxDQUFBOztNQUNBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLHVCQUFQLENBQUE7TUFDakIsSUFBQyxDQUFBLFdBQUQsR0FBZSxNQUFNLENBQUMsa0JBQVAsQ0FBMEIsY0FBMUI7TUFDZixpQkFBQSxHQUFvQjtRQUFDLElBQUEsRUFBTSxNQUFQO1FBQWUsQ0FBQSxLQUFBLENBQUEsRUFBTywyQkFBdEI7O01BQ3BCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLElBQUMsQ0FBQSxXQUF2QixFQUFvQyxpQkFBcEM7TUFFQSxhQUFBLEdBQWdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNkLGNBQUE7O1lBQUEsVUFBVSxDQUFFLE9BQVosQ0FBQTs7VUFDQSxVQUFBLEdBQWE7MERBQ0QsQ0FBRSxPQUFkLENBQUE7UUFIYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFLaEIsVUFBQSxHQUFhLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxhQUFqQzthQUViLFVBQUEsQ0FBVyxhQUFYLEVBQTBCLElBQTFCO0lBZEssQ0EvSlA7SUErS0EsVUFBQSxFQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7TUFBQSxDQUFBLEdBQUksb0JBQUEsR0FDZ0IsR0FEaEIsR0FDb0IsSUFEcEIsR0FFSCxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBLENBQUQ7YUFFRCxPQUFPLENBQUMsR0FBUixDQUFZLENBQVosRUFBZSxNQUFmO0lBTFUsQ0EvS1o7O0FBckNGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIEVtaXR0ZXIsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbkhpc3RvcnkgPSByZXF1aXJlICcuL2hpc3RvcnknXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmRlZmF1bHRJZ25vcmVDb21tYW5kcyA9IFtcbiAgJ2N1cnNvci1oaXN0b3J5Om5leHQnLFxuICAnY3Vyc29yLWhpc3Rvcnk6cHJldicsXG4gICdjdXJzb3ItaGlzdG9yeTpuZXh0LXdpdGhpbi1lZGl0b3InLFxuICAnY3Vyc29yLWhpc3Rvcnk6cHJldi13aXRoaW4tZWRpdG9yJyxcbiAgJ2N1cnNvci1oaXN0b3J5OmNsZWFyJyxcbl1cblxuaXNUZXh0RWRpdG9yID0gKG9iamVjdCkgLT5cbiAgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKG9iamVjdClcblxuZmluZEVkaXRvckZvclBhbmVCeVVSSSA9IChwYW5lLCBVUkkpIC0+XG4gIGZvciBpdGVtIGluIHBhbmUuZ2V0SXRlbXMoKSB3aGVuIGlzVGV4dEVkaXRvcihpdGVtKVxuICAgIHJldHVybiBpdGVtIGlmIGl0ZW0uZ2V0VVJJKCkgaXMgVVJJXG5cbnBvaW50RGVsdGEgPSAocG9pbnRBLCBwb2ludEIpIC0+XG4gIGlmIHBvaW50QS5pc0dyZWF0ZXJUaGFuKHBvaW50QilcbiAgICBwb2ludEEudHJhdmVyc2FsRnJvbShwb2ludEIpXG4gIGVsc2VcbiAgICBwb2ludEIudHJhdmVyc2FsRnJvbShwb2ludEEpXG5cbmNsb3Nlc3RUZXh0RWRpdG9yID0gKHRhcmdldCkgLT5cbiAgdGFyZ2V0Py5jbG9zZXN0PygnYXRvbS10ZXh0LWVkaXRvcicpPy5nZXRNb2RlbCgpXG5cbmNsYXNzIExvY2F0aW9uXG4gIGNvbnN0cnVjdG9yOiAoQHR5cGUsIEBlZGl0b3IpIC0+XG4gICAgQHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQFVSSSA9IEBlZGl0b3IuZ2V0VVJJKClcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHNldHRpbmdzLmNvbmZpZ1xuICBoaXN0b3J5OiBudWxsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgaWdub3JlQ29tbWFuZHM6IG51bGxcblxuICBvbkRpZENoYW5nZUxvY2F0aW9uOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWxvY2F0aW9uJywgZm4pXG4gIG9uRGlkVW5mb2N1czogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXVuZm9jdXMnLCBmbilcblxuICBhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGhpc3RvcnkgPSBuZXcgSGlzdG9yeVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIGp1bXAgPSBAanVtcC5iaW5kKHRoaXMpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdjdXJzb3ItaGlzdG9yeTpuZXh0JzogLT4ganVtcChAZ2V0TW9kZWwoKSwgJ25leHQnKVxuICAgICAgJ2N1cnNvci1oaXN0b3J5OnByZXYnOiAtPiBqdW1wKEBnZXRNb2RlbCgpLCAncHJldicpXG4gICAgICAnY3Vyc29yLWhpc3Rvcnk6bmV4dC13aXRoaW4tZWRpdG9yJzogLT4ganVtcChAZ2V0TW9kZWwoKSwgJ25leHQnLCB3aXRoaW5FZGl0b3I6IHRydWUpXG4gICAgICAnY3Vyc29yLWhpc3Rvcnk6cHJldi13aXRoaW4tZWRpdG9yJzogLT4ganVtcChAZ2V0TW9kZWwoKSwgJ3ByZXYnLCB3aXRoaW5FZGl0b3I6IHRydWUpXG4gICAgICAnY3Vyc29yLWhpc3Rvcnk6Y2xlYXInOiA9PiBAaGlzdG9yeS5jbGVhcigpXG4gICAgICAnY3Vyc29yLWhpc3Rvcnk6dG9nZ2xlLWRlYnVnJzogLT4gc2V0dGluZ3MudG9nZ2xlICdkZWJ1ZycsIGxvZzogdHJ1ZVxuXG4gICAgQG9ic2VydmVNb3VzZSgpXG4gICAgQG9ic2VydmVDb21tYW5kcygpXG4gICAgQG9ic2VydmVTZXR0aW5ncygpXG5cbiAgICBAb25EaWRDaGFuZ2VMb2NhdGlvbiAoe29sZExvY2F0aW9uLCBuZXdMb2NhdGlvbn0pID0+XG4gICAgICB7cm93LCBjb2x1bW59ID0gcG9pbnREZWx0YShvbGRMb2NhdGlvbi5wb2ludCwgbmV3TG9jYXRpb24ucG9pbnQpXG4gICAgICBpZiAocm93ID4gc2V0dGluZ3MuZ2V0KCdyb3dEZWx0YVRvUmVtZW1iZXInKSkgb3IgKHJvdyBpcyAwIGFuZCBjb2x1bW4gPiBzZXR0aW5ncy5nZXQoJ2NvbHVtbkRlbHRhVG9SZW1lbWJlcicpKVxuICAgICAgICBAc2F2ZUhpc3Rvcnkob2xkTG9jYXRpb24sIHN1YmplY3Q6IFwiQ3Vyc29yIG1vdmVkXCIpXG5cbiAgICBAb25EaWRVbmZvY3VzICh7b2xkTG9jYXRpb259KSA9PlxuICAgICAgQHNhdmVIaXN0b3J5KG9sZExvY2F0aW9uLCBzdWJqZWN0OiBcIlNhdmUgb24gZm9jdXMgbG9zdFwiKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgc2V0dGluZ3MuZGVzdHJveSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQGhpc3RvcnkuZGVzdHJveSgpXG4gICAge0BoaXN0b3J5LCBAc3Vic2NyaXB0aW9uc30gPSB7fVxuXG4gIG9ic2VydmVTZXR0aW5nczogLT5cbiAgICBzZXR0aW5ncy5vYnNlcnZlICdrZWVwU2luZ2xlRW50cnlQZXJCdWZmZXInLCAobmV3VmFsdWUpID0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICBAaGlzdG9yeS51bmlxdWVCeUJ1ZmZlcigpXG5cbiAgICBzZXR0aW5ncy5vYnNlcnZlICdpZ25vcmVDb21tYW5kcycsIChuZXdWYWx1ZSkgPT5cbiAgICAgIEBpZ25vcmVDb21tYW5kcyA9IGRlZmF1bHRJZ25vcmVDb21tYW5kcy5jb25jYXQobmV3VmFsdWUpXG5cbiAgc2F2ZUhpc3Rvcnk6IChsb2NhdGlvbiwge3N1YmplY3QsIHNldEluZGV4VG9IZWFkfT17fSkgLT5cbiAgICBAaGlzdG9yeS5hZGQobG9jYXRpb24sIHtzZXRJbmRleFRvSGVhZH0pXG4gICAgQGxvZ0hpc3RvcnkoXCIje3N1YmplY3R9IFsje2xvY2F0aW9uLnR5cGV9XVwiKSBpZiBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcblxuICAjIE1vdXNlIGhhbmRsaW5nIGlzIG5vdCBwcmltYWwgcHVycG9zZSBvZiB0aGlzIHBhY2thZ2VcbiAgIyBJIGRvbnQnIHVzZSBtb3VzZSBiYXNpY2FsbHkgd2hpbGUgY29kaW5nLlxuICAjIFNvIHRvIGtlZXAgY29kZWJhc2UgbWluaW1hbCBhbmQgc2ltcGxlLFxuICAjICBJIGRvbid0IHVzZSBlZGl0b3I6Om9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKSB0byB0cmFjayBjdXJzb3IgcG9zaXRpb24gY2hhbmdlXG4gICMgIGNhdXNlZCBieSBtb3VzZSBjbGljay5cbiAgI1xuICAjIFdoZW4gbW91c2UgY2xpY2tlZCwgY3Vyc29yIHBvc2l0aW9uIGlzIHVwZGF0ZWQgYnkgYXRvbSBjb3JlIHVzaW5nIHNldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgIyBUbyB0cmFjayBjdXJzb3IgcG9zaXRpb24gY2hhbmdlIGNhdXNlZCBieSBtb3VzZSBjbGljaywgSSB1c2UgbW91c2Vkb3duIGV2ZW50LlxuICAjICAtIEV2ZW50IGNhcHR1cmUgcGhhc2U6IEN1cnNvciBwb3NpdGlvbiBpcyBub3QgeWV0IGNoYW5nZWQuXG4gICMgIC0gRXZlbnQgYnViYmxpbmcgcGhhc2U6IEN1cnNvciBwb3NpdGlvbiB1cGRhdGVkIHRvIGNsaWNrZWQgcG9zaXRpb24uXG4gIG9ic2VydmVNb3VzZTogLT5cbiAgICBsb2NhdGlvblN0YWNrID0gW11cbiAgICBoYW5kbGVDYXB0dXJlID0gKGV2ZW50KSAtPlxuICAgICAgZWRpdG9yID0gY2xvc2VzdFRleHRFZGl0b3IoZXZlbnQudGFyZ2V0KVxuICAgICAgaWYgZWRpdG9yPy5nZXRVUkkoKVxuICAgICAgICBsb2NhdGlvblN0YWNrLnB1c2gobmV3IExvY2F0aW9uKCdtb3VzZWRvd24nLCBlZGl0b3IpKVxuXG4gICAgaGFuZGxlQnViYmxlID0gKGV2ZW50KSA9PlxuICAgICAgaWYgY2xvc2VzdFRleHRFZGl0b3IoZXZlbnQudGFyZ2V0KT8uZ2V0VVJJKClcbiAgICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgIEBjaGVja0xvY2F0aW9uQ2hhbmdlKGxvY2F0aW9uKSBpZiBsb2NhdGlvbiA9IGxvY2F0aW9uU3RhY2sucG9wKClcbiAgICAgICAgLCAxMDBcblxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgd29ya3NwYWNlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVDYXB0dXJlLCB0cnVlKVxuICAgIHdvcmtzcGFjZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgaGFuZGxlQnViYmxlLCBmYWxzZSlcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgd29ya3NwYWNlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVDYXB0dXJlLCB0cnVlKVxuICAgICAgd29ya3NwYWNlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVCdWJibGUsIGZhbHNlKVxuXG4gIG9ic2VydmVDb21tYW5kczogLT5cbiAgICBpc0ludGVyZXN0aW5nQ29tbWFuZCA9ICh0eXBlKSA9PlxuICAgICAgKCc6JyBpbiB0eXBlKSBhbmQgKHR5cGUgbm90IGluIEBpZ25vcmVDb21tYW5kcylcblxuICAgIEBsb2NhdGlvblN0YWNrRm9yVGVzdFNwZWMgPSBsb2NhdGlvblN0YWNrID0gW11cbiAgICB0cmFja0xvY2F0aW9uQ2hhbmdlID0gKHR5cGUsIGVkaXRvcikgLT5cbiAgICAgIGxvY2F0aW9uU3RhY2sucHVzaChuZXcgTG9jYXRpb24odHlwZSwgZWRpdG9yKSlcbiAgICB0cmFja0xvY2F0aW9uQ2hhbmdlRGVib3VuY2VkID0gXy5kZWJvdW5jZSh0cmFja0xvY2F0aW9uQ2hhbmdlLCAxMDAsIHRydWUpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbldpbGxEaXNwYXRjaCAoe3R5cGUsIHRhcmdldH0pIC0+XG4gICAgICBlZGl0b3IgPSBjbG9zZXN0VGV4dEVkaXRvcih0YXJnZXQpXG4gICAgICBpZiBlZGl0b3I/LmdldFVSSSgpIGFuZCBpc0ludGVyZXN0aW5nQ29tbWFuZCh0eXBlKVxuICAgICAgICB0cmFja0xvY2F0aW9uQ2hhbmdlRGVib3VuY2VkKHR5cGUsIGVkaXRvcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2ggKHt0eXBlLCB0YXJnZXR9KSA9PlxuICAgICAgcmV0dXJuIGlmIGxvY2F0aW9uU3RhY2subGVuZ3RoIGlzIDBcbiAgICAgIGVkaXRvciA9IGNsb3Nlc3RUZXh0RWRpdG9yKHRhcmdldClcbiAgICAgIGlmIGVkaXRvcj8uZ2V0VVJJKCkgYW5kIGlzSW50ZXJlc3RpbmdDb21tYW5kKHR5cGUpXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICAjIFRvIHdhaXQgY3Vyc29yIHBvc2l0aW9uIGlzIHNldCBvbiBmaW5hbCBkZXN0aW5hdGlvbiBpbiBtb3N0IGNhc2UuXG4gICAgICAgICAgQGNoZWNrTG9jYXRpb25DaGFuZ2UobG9jYXRpb24pIGlmIGxvY2F0aW9uID0gbG9jYXRpb25TdGFjay5wb3AoKVxuICAgICAgICAsIDEwMFxuXG4gIGNoZWNrTG9jYXRpb25DaGFuZ2U6IChvbGRMb2NhdGlvbikgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvclxuXG4gICAgaWYgZWRpdG9yLmVsZW1lbnQuaGFzRm9jdXMoKSBhbmQgKGVkaXRvci5nZXRVUkkoKSBpcyBvbGRMb2NhdGlvbi5VUkkpXG4gICAgICAjIE1vdmUgd2l0aGluIHNhbWUgYnVmZmVyLlxuICAgICAgbmV3TG9jYXRpb24gPSBuZXcgTG9jYXRpb24ob2xkTG9jYXRpb24udHlwZSwgZWRpdG9yKVxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1sb2NhdGlvbicsIHtvbGRMb2NhdGlvbiwgbmV3TG9jYXRpb259KVxuICAgIGVsc2VcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC11bmZvY3VzJywge29sZExvY2F0aW9ufSlcblxuICBqdW1wOiAoZWRpdG9yLCBkaXJlY3Rpb24sIHt3aXRoaW5FZGl0b3J9PXt9KSAtPlxuICAgIHdhc0F0SGVhZCA9IEBoaXN0b3J5LmlzSW5kZXhBdEhlYWQoKVxuICAgIGlmIHdpdGhpbkVkaXRvclxuICAgICAgZW50cnkgPSBAaGlzdG9yeS5nZXQoZGlyZWN0aW9uLCBVUkk6IGVkaXRvci5nZXRVUkkoKSlcbiAgICBlbHNlXG4gICAgICBlbnRyeSA9IEBoaXN0b3J5LmdldChkaXJlY3Rpb24pXG5cbiAgICByZXR1cm4gdW5sZXNzIGVudHJ5P1xuICAgICMgRklYTUUsIEV4cGxpY2l0bHkgcHJlc2VydmUgcG9pbnQsIFVSSSBieSBzZXR0aW5nIGluZGVwZW5kZW50IHZhbHVlLFxuICAgICMgc2luY2UgaXRzIG1pZ2h0IGJlIHNldCBudWxsIGlmIGVudHJ5LmlzQXRTYW1lUm93KClcbiAgICB7cG9pbnQsIFVSSX0gPSBlbnRyeVxuXG4gICAgbmVlZFRvTG9nID0gdHJ1ZVxuICAgIGlmIChkaXJlY3Rpb24gaXMgJ3ByZXYnKSBhbmQgd2FzQXRIZWFkXG4gICAgICBsb2NhdGlvbiA9IG5ldyBMb2NhdGlvbigncHJldicsIGVkaXRvcilcbiAgICAgIEBzYXZlSGlzdG9yeShsb2NhdGlvbiwgc2V0SW5kZXhUb0hlYWQ6IGZhbHNlLCBzdWJqZWN0OiBcIlNhdmUgaGVhZCBwb3NpdGlvblwiKVxuICAgICAgbmVlZFRvTG9nID0gZmFsc2VcblxuICAgIGFjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBpZiBlZGl0b3IuZ2V0VVJJKCkgaXMgVVJJXG4gICAgICBAbGFuZChlZGl0b3IsIHBvaW50LCBkaXJlY3Rpb24sIGxvZzogbmVlZFRvTG9nKVxuICAgIGVsc2UgaWYgaXRlbSA9IGZpbmRFZGl0b3JGb3JQYW5lQnlVUkkoYWN0aXZlUGFuZSwgVVJJKVxuICAgICAgYWN0aXZlUGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSlcbiAgICAgIEBsYW5kKGl0ZW0sIHBvaW50LCBkaXJlY3Rpb24sIGZvcmNlRmxhc2g6IHRydWUsIGxvZzogbmVlZFRvTG9nKVxuICAgIGVsc2VcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oVVJJLCBzZWFyY2hBbGxQYW5lczogc2V0dGluZ3MuZ2V0KCdzZWFyY2hBbGxQYW5lcycpKS50aGVuIChlZGl0b3IpID0+XG4gICAgICAgIEBsYW5kKGVkaXRvciwgcG9pbnQsIGRpcmVjdGlvbiwgZm9yY2VGbGFzaDogdHJ1ZSwgbG9nOiBuZWVkVG9Mb2cpXG5cbiAgbGFuZDogKGVkaXRvciwgcG9pbnQsIGRpcmVjdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAgICBvcmlnaW5hbFJvdyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG4gICAgZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oY2VudGVyOiB0cnVlKVxuXG4gICAgaWYgc2V0dGluZ3MuZ2V0KCdmbGFzaE9uTGFuZCcpXG4gICAgICBpZiBvcHRpb25zLmZvcmNlRmxhc2ggb3IgKG9yaWdpbmFsUm93IGlzbnQgcG9pbnQucm93KVxuICAgICAgICBAZmxhc2goZWRpdG9yKVxuXG4gICAgaWYgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpIGFuZCBvcHRpb25zLmxvZ1xuICAgICAgQGxvZ0hpc3RvcnkoZGlyZWN0aW9uKVxuXG5cbiAgZmxhc2hNYXJrZXI6IG51bGxcbiAgZmxhc2g6IChlZGl0b3IpIC0+XG4gICAgQGZsYXNoTWFya2VyPy5kZXN0cm95KClcbiAgICBjdXJzb3JQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQGZsYXNoTWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcbiAgICBkZWNvcmF0aW9uT3B0aW9ucyA9IHt0eXBlOiAnbGluZScsIGNsYXNzOiAnY3Vyc29yLWhpc3RvcnktZmxhc2gtbGluZSd9XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKEBmbGFzaE1hcmtlciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICBkZXN0cm95TWFya2VyID0gPT5cbiAgICAgIGRpc3Bvc2FibGU/LmRlc3Ryb3koKVxuICAgICAgZGlzcG9zYWJsZSA9IG51bGxcbiAgICAgIEBmbGFzaE1hcmtlcj8uZGVzdHJveSgpXG5cbiAgICBkaXNwb3NhYmxlID0gZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZGVzdHJveU1hcmtlcilcbiAgICAjIFtOT1RFXSBhbmltYXRpb24tZHVyYXRpb24gaGFzIHRvIGJlIHNob3J0ZXIgdGhhbiB0aGlzIHZhbHVlKDFzZWMpXG4gICAgc2V0VGltZW91dChkZXN0cm95TWFya2VyLCAxMDAwKVxuXG4gIGxvZ0hpc3Rvcnk6IChtc2cpIC0+XG4gICAgcyA9IFwiXCJcIlxuICAgICMgY3Vyc29yLWhpc3Rvcnk6ICN7bXNnfVxuICAgICN7QGhpc3RvcnkuaW5zcGVjdCgpfVxuICAgIFwiXCJcIlxuICAgIGNvbnNvbGUubG9nIHMsIFwiXFxuXFxuXCJcbiJdfQ==
