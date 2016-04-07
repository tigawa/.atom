(function() {
  var Point, addCustomMatchers, dispatchCommand, getEditor, _;

  _ = require('underscore-plus');

  Point = require('atom').Point;

  getEditor = function() {
    return atom.workspace.getActiveTextEditor();
  };

  dispatchCommand = function(element, command) {
    atom.commands.dispatch(element, command);
    return advanceClock(100);
  };

  addCustomMatchers = function(spec) {
    return spec.addMatchers({
      toBeEqualEntry: function(expected) {
        return (this.actual.URI === expected.URI) && (Point.fromObject(this.actual.point).isEqual(Point.fromObject(expected.point)));
      }
    });
  };

  describe("cursor-history", function() {
    var editor, editorElement, getEntries, main, pathSample1, pathSample2, workspaceElement, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], main = _ref[2], pathSample1 = _ref[3], pathSample2 = _ref[4], workspaceElement = _ref[5];
    getEntries = function(which) {
      var entries;
      if (which == null) {
        which = null;
      }
      entries = main.history.entries;
      switch (which) {
        case 'last':
          return _.last(entries);
        case 'first':
          return _.first(entries);
        default:
          return entries;
      }
    };
    beforeEach(function() {
      addCustomMatchers(this);
      spyOn(_._, "now").andCallFake(function() {
        return window.now;
      });
      atom.commands.add('atom-workspace', {
        'test:move-down-2': function() {
          return getEditor().moveDown(2);
        },
        'test:move-down-5': function() {
          return getEditor().moveDown(5);
        },
        'test:move-up-2': function() {
          return getEditor().moveUp(2);
        },
        'test:move-up-5': function() {
          return getEditor().moveUp(5);
        }
      });
      pathSample1 = atom.project.resolvePath("sample-1.coffee");
      pathSample2 = atom.project.resolvePath("sample-2.coffee");
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.packages.activatePackage('cursor-history').then(function(pack) {
          return main = pack.mainModule;
        });
      });
      return waitsForPromise(function() {
        return atom.workspace.open(pathSample1).then(function(e) {
          editor = e;
          return editorElement = atom.views.getView(e);
        });
      });
    });
    describe("initial state of history entries", function() {
      it("is empty", function() {
        return expect(getEntries()).toHaveLength(0);
      });
      return it("index is 0", function() {
        return expect(main.history.index).toBe(0);
      });
    });
    describe("history saving", function() {
      describe("cursor moved", function() {
        it("save history when cursor moved over 4 line by default", function() {
          editor.setCursorBufferPosition([0, 5]);
          dispatchCommand(editorElement, 'test:move-down-5');
          expect(getEntries()).toHaveLength(1);
          expect(getEntries('first')).toBeEqualEntry({
            point: [0, 5],
            URI: pathSample1
          });
          return expect(getEntries('first')).toBeEqualEntry({
            point: [0, 5],
            URI: pathSample1
          });
        });
        it("can save multiple entry", function() {
          var e1, e2, e3, entries;
          dispatchCommand(editorElement, 'test:move-down-5');
          dispatchCommand(editorElement, 'test:move-down-5');
          dispatchCommand(editorElement, 'test:move-down-5');
          entries = getEntries();
          expect(entries).toHaveLength(3);
          e1 = entries[0], e2 = entries[1], e3 = entries[2];
          expect(e1).toBeEqualEntry({
            point: [0, 0],
            URI: pathSample1
          });
          expect(e2).toBeEqualEntry({
            point: [5, 0],
            URI: pathSample1
          });
          return expect(e3).toBeEqualEntry({
            point: [10, 0],
            URI: pathSample1
          });
        });
        it("wont save history if line delta of move is less than 4 line", function() {
          dispatchCommand(editorElement, 'core:move-down');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          return expect(getEntries()).toHaveLength(0);
        });
        return it("remove older entry if its row is same as new entry", function() {
          var e1, e2, e3, entries;
          dispatchCommand(editorElement, 'test:move-down-5');
          dispatchCommand(editorElement, 'test:move-down-5');
          dispatchCommand(editorElement, 'test:move-up-5');
          entries = getEntries();
          expect(entries).toHaveLength(3);
          e1 = entries[0], e2 = entries[1], e3 = entries[2];
          expect(e1).toBeEqualEntry({
            point: [0, 0],
            URI: pathSample1
          });
          expect(e2).toBeEqualEntry({
            point: [5, 0],
            URI: pathSample1
          });
          expect(e3).toBeEqualEntry({
            point: [10, 0],
            URI: pathSample1
          });
          expect(editor.getCursorBufferPosition()).toEqual([5, 0]);
          editor.setCursorBufferPosition([5, 5]);
          expect(editor.getCursorBufferPosition()).toEqual([5, 5]);
          dispatchCommand(editorElement, 'test:move-up-5');
          entries = getEntries();
          expect(entries).toHaveLength(3);
          e1 = entries[0], e2 = entries[1], e3 = entries[2];
          expect(e1).toBeEqualEntry({
            point: [0, 0],
            URI: pathSample1
          });
          expect(e2).toBeEqualEntry({
            point: [10, 0],
            URI: pathSample1
          });
          return expect(e3).toBeEqualEntry({
            point: [5, 5],
            URI: pathSample1
          });
        });
      });
      xit("save history when mouseclick", function() {});
      return describe("rowDeltaToRemember settings", function() {
        beforeEach(function() {
          return atom.config.set('cursor-history.rowDeltaToRemember', 1);
        });
        return describe("when set to 1", function() {
          return it("save history when cursor move over 1 line", function() {
            editor.setCursorBufferPosition([0, 5]);
            dispatchCommand(editorElement, 'test:move-down-2');
            expect(editor.getCursorBufferPosition()).toEqual([2, 5]);
            expect(getEntries()).toHaveLength(1);
            expect(getEntries('first')).toBeEqualEntry({
              point: [0, 5],
              URI: pathSample1
            });
            dispatchCommand(editorElement, 'test:move-down-2');
            expect(editor.getCursorBufferPosition()).toEqual([4, 5]);
            expect(getEntries()).toHaveLength(2);
            return expect(getEntries('last')).toBeEqualEntry({
              point: [2, 5],
              URI: pathSample1
            });
          });
        });
      });
    });
    return describe("go/back history with next/prev commands", function() {
      var isInitialState;
      isInitialState = function() {
        expect(getEntries()).toHaveLength(0);
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      };
      beforeEach(function() {
        return isInitialState();
      });
      describe("when history is empty", function() {
        it("do nothing with next", function() {
          dispatchCommand(editorElement, 'cursor-history:next');
          return isInitialState();
        });
        it("do nothing with prev", function() {
          dispatchCommand(editorElement, 'cursor-history:prev');
          return isInitialState();
        });
        it("do nothing with next-within-editor", function() {
          dispatchCommand(editorElement, 'cursor-history:next-within-editor');
          return isInitialState();
        });
        return it("do nothing with prev-within-editor", function() {
          dispatchCommand(editorElement, 'cursor-history:prev-within-editor');
          return isInitialState();
        });
      });
      describe("when history is not empty", function() {
        var e0, e1, e2, e3, editor2, editorElement2, isEntry, runCommand, _ref1;
        _ref1 = [], e0 = _ref1[0], e1 = _ref1[1], e2 = _ref1[2], e3 = _ref1[3], editor2 = _ref1[4], editorElement2 = _ref1[5];
        beforeEach(function() {
          runs(function() {
            dispatchCommand(editorElement, 'test:move-down-5');
            return dispatchCommand(editorElement, 'test:move-down-5');
          });
          waitsForPromise(function() {
            return atom.workspace.open(pathSample2).then(function(e) {
              editor2 = e;
              return editorElement2 = atom.views.getView(e);
            });
          });
          return runs(function() {
            var entries;
            dispatchCommand(editorElement2, 'test:move-down-5');
            dispatchCommand(editorElement2, 'test:move-down-5');
            entries = getEntries();
            expect(entries).toHaveLength(4);
            expect(main.history.index).toBe(4);
            e0 = entries[0], e1 = entries[1], e2 = entries[2], e3 = entries[3];
            expect(getEditor().getURI()).toBe(pathSample2);
            return expect(getEditor().getCursorBufferPosition()).toEqual([10, 0]);
          });
        });
        runCommand = function(command, fn) {
          runs(function() {
            spyOn(main, "land").andCallThrough();
            return atom.commands.dispatch(workspaceElement, command);
          });
          waitsFor(function() {
            return main.land.callCount === 1;
          });
          runs(function() {
            return fn();
          });
          return runs(function() {
            return jasmine.unspy(main, 'land');
          });
        };
        isEntry = function(index) {
          var entry;
          expect(main.history.index).toBe(index);
          entry = getEntries()[index];
          expect(getEditor().getCursorBufferPosition()).toEqual(entry.point);
          return expect(getEditor().getURI()).toBe(entry.URI);
        };
        describe("cursor-history:prev", function() {
          it("visit prev entry of cursor history", function() {
            runCommand('cursor-history:prev', function() {
              return isEntry(3);
            });
            runCommand('cursor-history:prev', function() {
              return isEntry(2);
            });
            runCommand('cursor-history:prev', function() {
              return isEntry(1);
            });
            return runCommand('cursor-history:prev', function() {
              return isEntry(0);
            });
          });
          return it("save last position if index is at head(=length of entries)", function() {
            expect(getEntries()).toHaveLength(4);
            runCommand('cursor-history:prev', function() {
              return isEntry(3);
            });
            return runs(function() {
              expect(getEntries()).toHaveLength(5);
              return expect(getEntries('last')).toBeEqualEntry({
                point: [10, 0],
                URI: pathSample2
              });
            });
          });
        });
        describe("cursor-history:next", function() {
          return it("visit next entry of cursor history", function() {
            main.history.index = 0;
            runCommand('cursor-history:next', function() {
              return isEntry(1);
            });
            runCommand('cursor-history:next', function() {
              return isEntry(2);
            });
            return runCommand('cursor-history:next', function() {
              return isEntry(3);
            });
          });
        });
        describe("cursor-history:prev-within-editor", function() {
          return it("visit prev entry of history within same editor", function() {
            runCommand('cursor-history:prev-within-editor', function() {
              return isEntry(3);
            });
            runCommand('cursor-history:prev-within-editor', function() {
              return isEntry(2);
            });
            return runs(function() {
              atom.commands.dispatch(workspaceElement, 'cursor-history:prev-within-editor');
              return isEntry(2);
            });
          });
        });
        describe("cursor-history:next-within-editor", function() {
          return it("visit next entry of history within same editor", function() {
            main.history.index = 0;
            waitsForPromise(function() {
              return atom.workspace.open(pathSample1);
            });
            runCommand('cursor-history:next-within-editor', function() {
              return isEntry(1);
            });
            return runs(function() {
              atom.commands.dispatch(workspaceElement, 'cursor-history:next-within-editor');
              return isEntry(1);
            });
          });
        });
        return describe("when editor is destroyed", function() {
          var getValidEntries;
          getValidEntries = function() {
            var e, _i, _len, _ref2, _results;
            _ref2 = getEntries();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              e = _ref2[_i];
              if (e.isValid()) {
                _results.push(e);
              }
            }
            return _results;
          };
          beforeEach(function() {
            expect(getEditor().getURI()).toBe(pathSample2);
            runs(function() {
              return editor2.destroy();
            });
            return runs(function() {
              expect(editor2.isAlive()).toBe(false);
              expect(getEditor().getURI()).toBe(pathSample1);
              return expect(getValidEntries()).toHaveLength(4);
            });
          });
          it("still can reopen and visit entry for once destroyed editor", function() {
            runCommand('cursor-history:prev', function() {
              return isEntry(3);
            });
            runCommand('cursor-history:prev', function() {
              return isEntry(2);
            });
            runCommand('cursor-history:prev', function() {
              return isEntry(1);
            });
            runCommand('cursor-history:prev', function() {
              return isEntry(0);
            });
            runCommand('cursor-history:next', function() {
              return isEntry(1);
            });
            runCommand('cursor-history:next', function() {
              return isEntry(2);
            });
            return runCommand('cursor-history:next', function() {
              return isEntry(3);
            });
          });
          return describe("excludeClosedBuffer setting is true", function() {
            beforeEach(function() {
              return atom.config.set('cursor-history.excludeClosedBuffer', true);
            });
            it("skip entry for destroyed editor", function() {
              expect(getValidEntries()).toHaveLength(2);
              runCommand('cursor-history:prev', function() {
                return isEntry(1);
              });
              return runs(function() {
                expect(getEntries()).toHaveLength(5);
                return expect(getValidEntries()).toHaveLength(3);
              });
            });
            return it("remove dstroyed entry from history when new entry is added", function() {
              expect(getValidEntries()).toHaveLength(2);
              expect(getEntries()).toHaveLength(4);
              dispatchCommand(editorElement, 'test:move-down-5');
              expect(editor.getCursorBufferPosition()).toEqual([15, 0]);
              expect(getEntries('last')).toBeEqualEntry({
                point: [10, 0],
                URI: pathSample1
              });
              expect(getValidEntries()).toHaveLength(3);
              return expect(getEntries()).toHaveLength(3);
            });
          });
        });
      });
      return describe("ignoreCommands setting", function() {
        var editor2, editorElement2, _ref1;
        _ref1 = [], editor2 = _ref1[0], editorElement2 = _ref1[1];
        beforeEach(function() {
          editor.setCursorBufferPosition([1, 2]);
          expect(getEntries()).toHaveLength(0);
          expect(editorElement.hasFocus()).toBe(true);
          return atom.commands.add(editorElement, {
            'test:open-sample2': function() {
              return atom.workspace.open(pathSample2).then(function(e) {
                editor2 = e;
                return editorElement2 = atom.views.getView(e);
              });
            }
          });
        });
        describe("ignoreCommands is empty", function() {
          return it("save cursor position to history when editor lost focus", function() {
            atom.config.set('cursor-history.ignoreCommands', []);
            runs(function() {
              return atom.commands.dispatch(editorElement, 'test:open-sample2');
            });
            spyOn(main, "checkLocationChange").andCallThrough();
            waitsFor(function() {
              return main.checkLocationChange.callCount === 1;
            });
            jasmine.useRealClock();
            waitsFor(function() {
              return editorElement2.hasFocus() === true;
            });
            return runs(function() {
              expect(getEntries()).toHaveLength(1);
              return expect(getEntries('last')).toBeEqualEntry({
                point: [1, 2],
                URI: pathSample1
              });
            });
          });
        });
        return describe("ignoreCommands is set and match command name", function() {
          return it("won't save cursor position to history when editor lost focus", function() {
            atom.config.set('cursor-history.ignoreCommands', ["test:open-sample2"]);
            spyOn(main, "getLocation").andCallThrough();
            runs(function() {
              return atom.commands.dispatch(editorElement, 'test:open-sample2');
            });
            waitsFor(function() {
              return (editorElement2 != null ? editorElement2.hasFocus() : void 0) === true;
            });
            return runs(function() {
              return expect(main.getLocation.callCount).toBe(0);
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9zcGVjL2N1cnNvci1oaXN0b3J5LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FERCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLFNBQUEsR0FBQTtXQUNWLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxFQURVO0VBQUEsQ0FIWixDQUFBOztBQUFBLEVBTUEsZUFBQSxHQUFrQixTQUFDLE9BQUQsRUFBVSxPQUFWLEdBQUE7QUFDaEIsSUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsT0FBdkIsRUFBZ0MsT0FBaEMsQ0FBQSxDQUFBO1dBQ0EsWUFBQSxDQUFhLEdBQWIsRUFGZ0I7RUFBQSxDQU5sQixDQUFBOztBQUFBLEVBVUEsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEdBQUE7V0FDbEIsSUFBSSxDQUFDLFdBQUwsQ0FDRTtBQUFBLE1BQUEsY0FBQSxFQUFnQixTQUFDLFFBQUQsR0FBQTtlQUNkLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLEtBQWUsUUFBUSxDQUFDLEdBQXpCLENBQUEsSUFBa0MsQ0FBQyxLQUFLLENBQUMsVUFBTixDQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQXpCLENBQStCLENBQUMsT0FBaEMsQ0FBd0MsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsUUFBUSxDQUFDLEtBQTFCLENBQXhDLENBQUQsRUFEcEI7TUFBQSxDQUFoQjtLQURGLEVBRGtCO0VBQUEsQ0FWcEIsQ0FBQTs7QUFBQSxFQWVBLFFBQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/cursor-history/spec/cursor-history-spec.coffee
