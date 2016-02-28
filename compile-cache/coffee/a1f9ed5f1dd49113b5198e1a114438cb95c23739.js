(function() {
  var KeymapManager, NodeTypeText, buildIMECompositionEvent, buildTextInputEvent, path, temp, triggerAutocompletion, waitForAutocomplete, _ref;

  _ref = require('./spec-helper'), triggerAutocompletion = _ref.triggerAutocompletion, waitForAutocomplete = _ref.waitForAutocomplete, buildIMECompositionEvent = _ref.buildIMECompositionEvent, buildTextInputEvent = _ref.buildTextInputEvent;

  KeymapManager = require('atom').KeymapManager;

  temp = require('temp').track();

  path = require('path');

  NodeTypeText = 3;

  describe('Autocomplete Manager', function() {
    var autocompleteManager, completionDelay, editor, editorView, gutterWidth, mainModule, pixelLeftForBufferPosition, requiresGutter, workspaceElement, _ref1;
    _ref1 = [], workspaceElement = _ref1[0], completionDelay = _ref1[1], editorView = _ref1[2], editor = _ref1[3], mainModule = _ref1[4], autocompleteManager = _ref1[5], mainModule = _ref1[6], gutterWidth = _ref1[7];
    beforeEach(function() {
      gutterWidth = null;
      return runs(function() {
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('editor.fontSize', '16');
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);
        atom.config.set('autocomplete-plus.maxVisibleSuggestions', 10);
        return atom.config.set('autocomplete-plus.consumeSuffix', true);
      });
    });
    describe("when an external provider is registered", function() {
      var provider;
      provider = [][0];
      beforeEach(function() {
        waitsForPromise(function() {
          return Promise.all([
            atom.workspace.open('').then(function(e) {
              editor = e;
              return editorView = atom.views.getView(editor);
            }), atom.packages.activatePackage('autocomplete-plus').then(function(a) {
              return mainModule = a.mainModule;
            })
          ]);
        });
        waitsFor(function() {
          return mainModule.autocompleteManager;
        });
        return runs(function() {
          provider = {
            selector: '*',
            inclusionPriority: 2,
            excludeLowerPriority: true,
            getSuggestions: function(_arg) {
              var list, prefix, text, _i, _len, _results;
              prefix = _arg.prefix;
              list = ['ab', 'abc', 'abcd', 'abcde'];
              _results = [];
              for (_i = 0, _len = list.length; _i < _len; _i++) {
                text = list[_i];
                _results.push({
                  text: text
                });
              }
              return _results;
            }
          };
          return mainModule.consumeProvider(provider);
        });
      });
      it("calls the provider's onDidInsertSuggestion method when it exists", function() {
        provider.onDidInsertSuggestion = jasmine.createSpy();
        triggerAutocompletion(editor, true, 'a');
        return runs(function() {
          var suggestion, suggestionListView, triggerPosition, _ref2;
          suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
          expect(provider.onDidInsertSuggestion).toHaveBeenCalled();
          _ref2 = provider.onDidInsertSuggestion.mostRecentCall.args[0], editor = _ref2.editor, triggerPosition = _ref2.triggerPosition, suggestion = _ref2.suggestion;
          expect(editor).toBe(editor);
          expect(triggerPosition).toEqual([0, 1]);
          return expect(suggestion.text).toBe('ab');
        });
      });
      it('closes the suggestion list when saving', function() {
        var directory;
        directory = temp.mkdirSync();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('a');
        waitForAutocomplete();
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          editor.saveAs(path.join(directory, 'spec', 'tmp', 'issue-11.js'));
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
      it('does not show suggestions after a word has been confirmed', function() {
        var c, _i, _len, _ref2;
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        _ref2 = 'red';
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          c = _ref2[_i];
          editor.insertText(c);
        }
        waitForAutocomplete();
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
      it('works after closing one of the copied tabs', function() {
        atom.workspace.paneForItem(editor).splitRight({
          copyActiveItem: true
        });
        atom.workspace.getActivePane().destroy();
        editor.insertNewline();
        editor.insertText('f');
        waitForAutocomplete();
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });
      it('closes the suggestion list when entering an empty string (e.g. carriage return)', function() {
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('a');
        waitForAutocomplete();
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          editor.insertText('\r');
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
      it('it refocuses the editor after pressing enter', function() {
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('a');
        waitForAutocomplete();
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          editor.insertText('\n');
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          return expect(editorView).toHaveFocus();
        });
      });
      it('it hides the suggestion list when the user keeps typing', function() {
        spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
          var prefix, t, _i, _len, _ref2, _results;
          prefix = _arg.prefix;
          _ref2 = ['acd', 'ade'];
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            t = _ref2[_i];
            if (t.startsWith(prefix)) {
              _results.push({
                text: t
              });
            }
          }
          return _results;
        });
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.moveToBottom();
        editor.insertText('a');
        waitForAutocomplete();
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          editor.insertText('b');
          return waitForAutocomplete();
        });
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
      it('does not show the suggestion list when pasting', function() {
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('red');
        waitForAutocomplete();
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
      it('only shows for the editor that currently has focus', function() {
        var editor2, editorView2;
        editor2 = atom.workspace.paneForItem(editor).splitRight({
          copyActiveItem: true
        }).getActiveItem();
        editorView2 = atom.views.getView(editor2);
        editorView.focus();
        expect(editorView).toHaveFocus();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        expect(editorView2).not.toHaveFocus();
        expect(editorView2.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('r');
        expect(editorView).toHaveFocus();
        expect(editorView2).not.toHaveFocus();
        waitForAutocomplete();
        return runs(function() {
          expect(editorView).toHaveFocus();
          expect(editorView2).not.toHaveFocus();
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editorView2.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          expect(editorView).toHaveFocus();
          expect(editorView2).not.toHaveFocus();
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          return expect(editorView2.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
      it('does not display empty suggestions', function() {
        spyOn(provider, 'getSuggestions').andCallFake(function() {
          var list, text, _i, _len, _results;
          list = ['ab', '', 'abcd', null];
          _results = [];
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            text = list[_i];
            _results.push({
              text: text
            });
          }
          return _results;
        });
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('a');
        waitForAutocomplete();
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          return expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(2);
        });
      });
      describe('when the fileBlacklist option is set', function() {
        beforeEach(function() {
          atom.config.set('autocomplete-plus.fileBlacklist', ['.*', '*.md']);
          return editor.getBuffer().setPath('blacklisted.md');
        });
        it('does not show suggestions when working with files that match the blacklist', function() {
          editor.insertText('a');
          waitForAutocomplete();
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('caches the blacklist result', function() {
          spyOn(path, 'basename').andCallThrough();
          editor.insertText('a');
          waitForAutocomplete();
          runs(function() {
            editor.insertText('b');
            return waitForAutocomplete();
          });
          runs(function() {
            editor.insertText('c');
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return expect(path.basename.callCount).toBe(1);
          });
        });
        return it('shows suggestions when the path is changed to not match the blacklist', function() {
          editor.insertText('a');
          waitForAutocomplete();
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:cancel');
            editor.getBuffer().setPath('not-blackslisted.txt');
            editor.insertText('a');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:cancel');
            editor.getBuffer().setPath('blackslisted.md');
            editor.insertText('a');
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
      describe("when filterSuggestions option is true", function() {
        beforeEach(function() {
          provider = {
            selector: '*',
            filterSuggestions: true,
            inclusionPriority: 3,
            excludeLowerPriority: true,
            getSuggestions: function(_arg) {
              var list, prefix, text, _i, _len, _results;
              prefix = _arg.prefix;
              list = ['ab', 'abc', 'abcd', 'abcde'];
              _results = [];
              for (_i = 0, _len = list.length; _i < _len; _i++) {
                text = list[_i];
                _results.push({
                  text: text
                });
              }
              return _results;
            }
          };
          return mainModule.consumeProvider(provider);
        });
        return it('does not display empty suggestions', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function() {
            var list, text, _i, _len, _results;
            list = ['ab', '', 'abcd', null];
            _results = [];
            for (_i = 0, _len = list.length; _i < _len; _i++) {
              text = list[_i];
              _results.push({
                text: text
              });
            }
            return _results;
          });
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.insertText('a');
          waitForAutocomplete();
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(2);
          });
        });
      });
      describe("when the type option has a space in it", function() {
        return it('does not display empty suggestions', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [
              {
                text: 'ab',
                type: 'local function'
              }, {
                text: 'abc',
                type: ' another ~ function   '
              }
            ];
          });
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.insertText('a');
          waitForAutocomplete();
          return runs(function() {
            var items;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items).toHaveLength(2);
            expect(items[0].querySelector('.icon').className).toBe('icon local function');
            return expect(items[1].querySelector('.icon').className).toBe('icon another ~ function');
          });
        });
      });
      describe("when the className option has a space in it", function() {
        return it('does not display empty suggestions', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [
              {
                text: 'ab',
                className: 'local function'
              }, {
                text: 'abc',
                className: ' another  ~ function   '
              }
            ];
          });
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.insertText('a');
          waitForAutocomplete();
          return runs(function() {
            var items;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0].className).toBe('selected local function');
            return expect(items[1].className).toBe('another ~ function');
          });
        });
      });
      describe('when multiple cursors are defined', function() {
        it('autocompletes word when there is only a prefix', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [
              {
                text: 'shift'
              }
            ];
          });
          editor.getBuffer().insert([0, 0], 's:extra:s');
          editor.setSelectedBufferRanges([[[0, 1], [0, 1]], [[0, 9], [0, 9]]]);
          triggerAutocompletion(editor, false, 'h');
          waits(completionDelay);
          return runs(function() {
            autocompleteManager = mainModule.autocompleteManager;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
            expect(editor.lineTextForBufferRow(0)).toBe('shift:extra:shift');
            expect(editor.getCursorBufferPosition()).toEqual([0, 17]);
            expect(editor.getLastSelection().getBufferRange()).toEqual({
              start: {
                row: 0,
                column: 17
              },
              end: {
                row: 0,
                column: 17
              }
            });
            return expect(editor.getSelections().length).toEqual(2);
          });
        });
        return it('cancels the autocomplete when text differs between cursors', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [];
          });
          editor.getBuffer().insert([0, 0], 's:extra:a');
          editor.setCursorBufferPosition([0, 1]);
          editor.addCursorAtBufferPosition([0, 9]);
          triggerAutocompletion(editor, false, 'h');
          waits(completionDelay);
          return runs(function() {
            autocompleteManager = mainModule.autocompleteManager;
            editorView = atom.views.getView(editor);
            atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
            expect(editor.lineTextForBufferRow(0)).toBe('sh:extra:ah');
            expect(editor.getSelections().length).toEqual(2);
            expect(editor.getSelections()[0].getBufferRange()).toEqual([[0, 2], [0, 2]]);
            expect(editor.getSelections()[1].getBufferRange()).toEqual([[0, 11], [0, 11]]);
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
      describe("suppression for editorView classes", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.suppressActivationForEditorClasses', ['vim-mode.command-mode', 'vim-mode . visual-mode', ' vim-mode.operator-pending-mode ', ' ']);
        });
        it('should show the suggestion list when the suppression list does not match', function() {
          runs(function() {
            editorView.classList.add('vim-mode');
            return editorView.classList.add('insert-mode');
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return triggerAutocompletion(editor);
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
        it('should not show the suggestion list when the suppression list does match', function() {
          runs(function() {
            editorView.classList.add('vim-mode');
            return editorView.classList.add('command-mode');
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return triggerAutocompletion(editor);
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('should not show the suggestion list when the suppression list does match', function() {
          runs(function() {
            editorView.classList.add('vim-mode');
            return editorView.classList.add('operator-pending-mode');
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return triggerAutocompletion(editor);
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('should not show the suggestion list when the suppression list does match', function() {
          runs(function() {
            editorView.classList.add('vim-mode');
            return editorView.classList.add('visual-mode');
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return triggerAutocompletion(editor);
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('should show the suggestion list when the suppression list does not match', function() {
          runs(function() {
            editorView.classList.add('vim-mode');
            return editorView.classList.add('some-unforeseen-mode');
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return triggerAutocompletion(editor);
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
        return it('should show the suggestion list when the suppression list does not match', function() {
          runs(function() {
            return editorView.classList.add('command-mode');
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return triggerAutocompletion(editor);
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
      });
      describe("prefix passed to getSuggestions", function() {
        var prefix;
        prefix = null;
        beforeEach(function() {
          editor.setText('var something = abc');
          editor.setCursorBufferPosition([0, 10000]);
          return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
            prefix = options.prefix;
            return [];
          });
        });
        it("calls with word prefix", function() {
          editor.insertText('d');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe('abcd');
          });
        });
        it("calls with word prefix after punctuation", function() {
          editor.insertText('d.okyea');
          editor.insertText('h');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe('okyeah');
          });
        });
        it("calls with word prefix containing a dash", function() {
          editor.insertText('-okyea');
          editor.insertText('h');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe('abc-okyeah');
          });
        });
        it("calls with space character", function() {
          editor.insertText(' ');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe(' ');
          });
        });
        it("calls with non-word prefix", function() {
          editor.insertText(':');
          editor.insertText(':');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe('::');
          });
        });
        it("calls with non-word bracket", function() {
          editor.insertText('[');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe('[');
          });
        });
        it("calls with dot prefix", function() {
          editor.insertText('.');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe('.');
          });
        });
        it("calls with prefix after non \\b word break", function() {
          editor.insertText('=""');
          editor.insertText(' ');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe(' ');
          });
        });
        return it("calls with prefix after non \\b word break", function() {
          editor.insertText('?');
          editor.insertText(' ');
          waitForAutocomplete();
          return runs(function() {
            return expect(prefix).toBe(' ');
          });
        });
      });
      describe("when the character entered is not at the cursor position", function() {
        beforeEach(function() {
          editor.setText('some text ok');
          return editor.setCursorBufferPosition([0, 7]);
        });
        return it("does not show the suggestion list", function() {
          var buffer;
          buffer = editor.getBuffer();
          buffer.setTextInRange([[0, 0], [0, 0]], "s");
          waitForAutocomplete();
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
      describe("when number of suggestions > maxVisibleSuggestions", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.maxVisibleSuggestions', 2);
        });
        it("scrolls the list always showing the selected item", function() {
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            var itemHeight, scroller, suggestionList;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
            expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(4);
            suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            scroller = suggestionList.querySelector('.suggestion-list-scroller');
            expect(scroller.scrollTop).toBe(0);
            atom.commands.dispatch(suggestionList, 'core:move-down');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(0);
            atom.commands.dispatch(suggestionList, 'core:move-down');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight);
            atom.commands.dispatch(suggestionList, 'core:move-down');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight * 2);
            atom.commands.dispatch(suggestionList, 'core:move-down');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(0);
            atom.commands.dispatch(suggestionList, 'core:move-up');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight * 2);
            atom.commands.dispatch(suggestionList, 'core:move-up');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight * 2);
            atom.commands.dispatch(suggestionList, 'core:move-up');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight);
            atom.commands.dispatch(suggestionList, 'core:move-up');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
            return expect(scroller.scrollTop).toBe(0);
          });
        });
        it("pages up and down when core:page-up and core:page-down are used", function() {
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            var itemHeight, scroller, suggestionList;
            itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
            suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            scroller = suggestionList.querySelector('.suggestion-list-scroller');
            expect(scroller.scrollTop).toBe(0);
            atom.commands.dispatch(suggestionList, 'core:page-down');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
            atom.commands.dispatch(suggestionList, 'core:page-down');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
            atom.commands.dispatch(suggestionList, 'core:page-down');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight * 2);
            atom.commands.dispatch(suggestionList, 'core:page-up');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
            atom.commands.dispatch(suggestionList, 'core:page-up');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
            atom.commands.dispatch(suggestionList, 'core:page-up');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
            return expect(scroller.scrollTop).toBe(0);
          });
        });
        it("moves to the top and bottom when core:move-to-top and core:move-to-bottom are used", function() {
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            var itemHeight, scroller, suggestionList;
            itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
            suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            scroller = suggestionList.querySelector('.suggestion-list-scroller');
            expect(scroller.scrollTop).toBe(0);
            atom.commands.dispatch(suggestionList, 'core:move-to-bottom');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight * 2);
            atom.commands.dispatch(suggestionList, 'core:move-to-bottom');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(itemHeight * 2);
            atom.commands.dispatch(suggestionList, 'core:move-to-top');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
            expect(scroller.scrollTop).toBe(0);
            atom.commands.dispatch(suggestionList, 'core:move-to-top');
            expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
            return expect(scroller.scrollTop).toBe(0);
          });
        });
        describe("when a suggestion description is not specified", function() {
          return it("only shows the maxVisibleSuggestions in the suggestion popup", function() {
            triggerAutocompletion(editor, true, 'a');
            return runs(function() {
              var itemHeight, suggestionList;
              expect(editorView.querySelector('.autocomplete-plus')).toExist();
              itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
              expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(4);
              suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              expect(suggestionList.offsetHeight).toBe(2 * itemHeight);
              return expect(suggestionList.querySelector('.suggestion-list-scroller').style['max-height']).toBe("" + (2 * itemHeight) + "px");
            });
          });
        });
        return describe("when a suggestion description is specified", function() {
          it("shows the maxVisibleSuggestions in the suggestion popup, but with extra height for the description", function() {
            spyOn(provider, 'getSuggestions').andCallFake(function() {
              var list, text, _i, _len, _results;
              list = ['ab', 'abc', 'abcd', 'abcde'];
              _results = [];
              for (_i = 0, _len = list.length; _i < _len; _i++) {
                text = list[_i];
                _results.push({
                  text: text,
                  description: "" + text + " yeah ok"
                });
              }
              return _results;
            });
            triggerAutocompletion(editor, true, 'a');
            return runs(function() {
              var descriptionHeight, itemHeight, suggestionList;
              expect(editorView.querySelector('.autocomplete-plus')).toExist();
              itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
              expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(4);
              suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              descriptionHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus .suggestion-description')).height);
              expect(suggestionList.offsetHeight).toBe(2 * itemHeight + descriptionHeight);
              return expect(suggestionList.querySelector('.suggestion-list-scroller').style['max-height']).toBe("" + (2 * itemHeight) + "px");
            });
          });
          return it("adjusts the width when the description changes", function() {
            var listWidth;
            listWidth = null;
            spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
              var item, list, prefix, _i, _len, _results;
              prefix = _arg.prefix;
              list = [
                {
                  text: 'ab',
                  description: 'mmmmmmmmmmmmmmmmmmmmmmmmmm'
                }, {
                  text: 'abc',
                  description: 'mmmmmmmmmmmmmmmmmmmmmm'
                }, {
                  text: 'abcd',
                  description: 'mmmmmmmmmmmmmmmmmm'
                }, {
                  text: 'abcde',
                  description: 'mmmmmmmmmmmmmm'
                }
              ];
              _results = [];
              for (_i = 0, _len = list.length; _i < _len; _i++) {
                item = list[_i];
                if (item.text.startsWith(prefix)) {
                  _results.push(item);
                }
              }
              return _results;
            });
            triggerAutocompletion(editor, true, 'a');
            runs(function() {
              var suggestionList;
              suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              expect(suggestionList).toExist();
              listWidth = parseInt(suggestionList.style.width);
              expect(listWidth).toBeGreaterThan(0);
              editor.insertText('b');
              editor.insertText('c');
              return waitForAutocomplete();
            });
            return runs(function() {
              var newWidth, suggestionList;
              suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              expect(suggestionList).toExist();
              newWidth = parseInt(suggestionList.style.width);
              expect(newWidth).toBeGreaterThan(0);
              return expect(newWidth).toBeLessThan(listWidth);
            });
          });
        });
      });
      describe("when useCoreMovementCommands is toggled", function() {
        var suggestionList;
        suggestionList = [][0];
        beforeEach(function() {
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          });
        });
        return it("binds to custom commands when unset, and binds back to core commands when set", function() {
          atom.commands.dispatch(suggestionList, 'core:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
          atom.config.set('autocomplete-plus.useCoreMovementCommands', false);
          atom.commands.dispatch(suggestionList, 'core:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
          atom.config.set('autocomplete-plus.useCoreMovementCommands', true);
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'core:move-down');
          return expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
        });
      });
      describe("when useCoreMovementCommands is false", function() {
        var suggestionList;
        suggestionList = [][0];
        beforeEach(function() {
          atom.config.set('autocomplete-plus.useCoreMovementCommands', false);
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          });
        });
        return it("responds to all the custom movement commands and to no core commands", function() {
          atom.commands.dispatch(suggestionList, 'core:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:page-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).not.toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:page-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-to-bottom');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
          atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-to-top');
          return expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
        });
      });
      describe("when match.snippet is used", function() {
        beforeEach(function() {
          return spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var list, prefix, snippet, _i, _len, _results;
            prefix = _arg.prefix;
            list = ['method(${1:something})', 'method2(${1:something})', 'method3(${1:something})'];
            _results = [];
            for (_i = 0, _len = list.length; _i < _len; _i++) {
              snippet = list[_i];
              _results.push({
                snippet: snippet,
                replacementPrefix: prefix
              });
            }
            return _results;
          });
        });
        return describe("when the snippets package is enabled", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.packages.activatePackage('snippets');
            });
          });
          it("displays the snippet without the `${1:}` in its own class", function() {
            triggerAutocompletion(editor, true, 'm');
            return runs(function() {
              var wordElement, wordElements;
              wordElement = editorView.querySelector('.autocomplete-plus span.word');
              expect(wordElement.textContent).toBe('method(something)');
              expect(wordElement.querySelector('.snippet-completion').textContent).toBe('something');
              wordElements = editorView.querySelectorAll('.autocomplete-plus span.word');
              return expect(wordElements).toHaveLength(3);
            });
          });
          return it("accepts the snippet when autocomplete-plus:confirm is triggered", function() {
            triggerAutocompletion(editor, true, 'm');
            return runs(function() {
              var suggestionListView;
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              return expect(editor.getSelectedText()).toBe('something');
            });
          });
        });
      });
      describe("when the matched prefix is highlighted", function() {
        it('highlights the prefix of the word in the suggestion list', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var prefix;
            prefix = _arg.prefix;
            return [
              {
                text: 'items',
                replacementPrefix: prefix
              }
            ];
          });
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('i');
          editor.insertText('e');
          editor.insertText('m');
          waitForAutocomplete();
          return runs(function() {
            var word;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            word = editorView.querySelector('.autocomplete-plus li span.word');
            expect(word.childNodes).toHaveLength(5);
            expect(word.childNodes[0]).toHaveClass('character-match');
            expect(word.childNodes[1].nodeType).toBe(NodeTypeText);
            expect(word.childNodes[2]).toHaveClass('character-match');
            expect(word.childNodes[3]).toHaveClass('character-match');
            return expect(word.childNodes[4].nodeType).toBe(NodeTypeText);
          });
        });
        it('highlights repeated characters in the prefix', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var prefix;
            prefix = _arg.prefix;
            return [
              {
                text: 'apply',
                replacementPrefix: prefix
              }
            ];
          });
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('a');
          editor.insertText('p');
          editor.insertText('p');
          waitForAutocomplete();
          return runs(function() {
            var word;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            word = editorView.querySelector('.autocomplete-plus li span.word');
            expect(word.childNodes).toHaveLength(4);
            expect(word.childNodes[0]).toHaveClass('character-match');
            expect(word.childNodes[1]).toHaveClass('character-match');
            expect(word.childNodes[2]).toHaveClass('character-match');
            expect(word.childNodes[3].nodeType).toBe(3);
            return expect(word.childNodes[3].textContent).toBe('ly');
          });
        });
        return describe("when the prefix does not match the word", function() {
          it("does not render any character-match spans", function() {
            spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
              var prefix;
              prefix = _arg.prefix;
              return [
                {
                  text: 'omgnope',
                  replacementPrefix: prefix
                }
              ];
            });
            editor.moveToBottom();
            editor.insertText('x');
            editor.insertText('y');
            editor.insertText('z');
            waitForAutocomplete();
            return runs(function() {
              var characterMatches, text;
              expect(editorView.querySelector('.autocomplete-plus')).toExist();
              characterMatches = editorView.querySelectorAll('.autocomplete-plus li span.word .character-match');
              text = editorView.querySelector('.autocomplete-plus li span.word').textContent;
              expect(characterMatches).toHaveLength(0);
              return expect(text).toBe('omgnope');
            });
          });
          return describe("when the snippets package is enabled", function() {
            beforeEach(function() {
              return waitsForPromise(function() {
                return atom.packages.activatePackage('snippets');
              });
            });
            it("does not highlight the snippet html; ref issue 301", function() {
              spyOn(provider, 'getSuggestions').andCallFake(function() {
                return [
                  {
                    snippet: 'ab(${1:c})c'
                  }
                ];
              });
              editor.moveToBottom();
              editor.insertText('c');
              waitForAutocomplete();
              return runs(function() {
                var charMatch, word;
                word = editorView.querySelector('.autocomplete-plus li span.word');
                charMatch = editorView.querySelector('.autocomplete-plus li span.word .character-match');
                expect(word.textContent).toBe('ab(c)c');
                expect(charMatch.textContent).toBe('c');
                return expect(charMatch.parentNode).toHaveClass('snippet-completion');
              });
            });
            return it("does not highlight the snippet html when highlight beginning of the word", function() {
              spyOn(provider, 'getSuggestions').andCallFake(function() {
                return [
                  {
                    snippet: 'abcde(${1:e}, ${1:f})f'
                  }
                ];
              });
              editor.moveToBottom();
              editor.insertText('c');
              editor.insertText('e');
              editor.insertText('f');
              waitForAutocomplete();
              return runs(function() {
                var charMatches, word;
                word = editorView.querySelector('.autocomplete-plus li span.word');
                expect(word.textContent).toBe('abcde(e, f)f');
                charMatches = editorView.querySelectorAll('.autocomplete-plus li span.word .character-match');
                expect(charMatches[0].textContent).toBe('c');
                expect(charMatches[0].parentNode).toHaveClass('word');
                expect(charMatches[1].textContent).toBe('e');
                expect(charMatches[1].parentNode).toHaveClass('word');
                expect(charMatches[2].textContent).toBe('f');
                return expect(charMatches[2].parentNode).toHaveClass('snippet-completion');
              });
            });
          });
        });
      });
      describe("when a replacementPrefix is not specified", function() {
        beforeEach(function() {
          return spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [
              {
                text: 'something'
              }
            ];
          });
        });
        it("replaces with the default input prefix", function() {
          editor.insertText('abc');
          triggerAutocompletion(editor, false, 'm');
          expect(editor.getText()).toBe('abcm');
          return runs(function() {
            var suggestionListView;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            return expect(editor.getText()).toBe('something');
          });
        });
        return it("does not replace non-word prefixes with the chosen suggestion", function() {
          editor.insertText('abc');
          editor.insertText('.');
          waitForAutocomplete();
          expect(editor.getText()).toBe('abc.');
          return runs(function() {
            var suggestionListView;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            return expect(editor.getText()).toBe('abc.something');
          });
        });
      });
      describe("when autocomplete-plus.suggestionListFollows is 'Cursor'", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.suggestionListFollows', 'Cursor');
        });
        return it("places the suggestion list at the cursor", function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(options) {
            return [
              {
                text: 'ab',
                leftLabel: 'void'
              }, {
                text: 'abc',
                leftLabel: 'void'
              }
            ];
          });
          editor.insertText('omghey ab');
          triggerAutocompletion(editor, false, 'c');
          return runs(function() {
            var overlayElement, suggestionList;
            overlayElement = editorView.querySelector('.autocomplete-plus');
            expect(overlayElement).toExist();
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 10]));
            suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            return expect(suggestionList.style['margin-left']).toBeFalsy();
          });
        });
      });
      describe("when autocomplete-plus.suggestionListFollows is 'Word'", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.suggestionListFollows', 'Word');
        });
        it("opens to the correct position, and correctly closes on cancel", function() {
          editor.insertText('xxxxxxxxxxx ab');
          triggerAutocompletion(editor, false, 'c');
          return runs(function() {
            var overlayElement;
            overlayElement = editorView.querySelector('.autocomplete-plus');
            expect(overlayElement).toExist();
            return expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 12]));
          });
        });
        it("displays the suggestion list taking into account the passed back replacementPrefix", function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(options) {
            return [
              {
                text: '::before',
                replacementPrefix: '::',
                leftLabel: 'void'
              }
            ];
          });
          editor.insertText('xxxxxxxxxxx ab:');
          triggerAutocompletion(editor, false, ':');
          return runs(function() {
            var overlayElement;
            overlayElement = editorView.querySelector('.autocomplete-plus');
            expect(overlayElement).toExist();
            return expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
          });
        });
        it("displays the suggestion list with a negative margin to align the prefix with the word-container", function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(options) {
            return [
              {
                text: 'ab',
                leftLabel: 'void'
              }, {
                text: 'abc',
                leftLabel: 'void'
              }
            ];
          });
          editor.insertText('omghey ab');
          triggerAutocompletion(editor, false, 'c');
          return runs(function() {
            var marginLeft, suggestionList, wordContainer;
            suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            wordContainer = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list .word-container');
            marginLeft = parseInt(suggestionList.style['margin-left']);
            return expect(Math.abs(wordContainer.offsetLeft + marginLeft)).toBeLessThan(2);
          });
        });
        it("keeps the suggestion list planted at the beginning of the prefix when typing", function() {
          var overlayElement;
          overlayElement = null;
          editor.insertText('xxxxxxxxxx xx');
          editor.insertText(' ');
          waitForAutocomplete();
          runs(function() {
            overlayElement = editorView.querySelector('.autocomplete-plus');
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
            editor.insertText('a');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
            editor.insertText('b');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
            editor.backspace();
            editor.backspace();
            return waitForAutocomplete();
          });
          runs(function() {
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
            editor.backspace();
            return waitForAutocomplete();
          });
          runs(function() {
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 11]));
            editor.insertText(' ');
            editor.insertText('a');
            editor.insertText('b');
            editor.insertText('c');
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
          });
        });
        return it("when broken by a non-word character, the suggestion list is positioned at the beginning of the new word", function() {
          var overlayElement;
          overlayElement = null;
          editor.insertText('xxxxxxxxxxx');
          editor.insertText(' abc');
          editor.insertText('d');
          waitForAutocomplete();
          runs(function() {
            var left;
            overlayElement = editorView.querySelector('.autocomplete-plus');
            left = editorView.pixelPositionForBufferPosition([0, 12]).left;
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 12]));
            editor.insertText(' ');
            editor.insertText('a');
            editor.insertText('b');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 17]));
            editor.backspace();
            editor.backspace();
            editor.backspace();
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 12]));
          });
        });
      });
      describe('accepting suggestions', function() {
        beforeEach(function() {
          editor.setText('ok then ');
          return editor.setCursorBufferPosition([0, 20]);
        });
        it('hides the suggestions list when a suggestion is confirmed', function() {
          triggerAutocompletion(editor, false, 'a');
          return runs(function() {
            var suggestionListView;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        describe("when the replacementPrefix is empty", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function() {
              return [
                {
                  text: 'someMethod()',
                  replacementPrefix: ''
                }
              ];
            });
          });
          return it("will insert the text without replacing anything", function() {
            editor.insertText('a');
            triggerAutocompletion(editor, false, '.');
            return runs(function() {
              var suggestionListView;
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              return expect(editor.getText()).toBe('ok then a.someMethod()');
            });
          });
        });
        describe('when tab is used to accept suggestions', function() {
          beforeEach(function() {
            return atom.config.set('autocomplete-plus.confirmCompletion', 'tab');
          });
          it('inserts the word and moves the cursor to the end of the word', function() {
            triggerAutocompletion(editor, false, 'a');
            return runs(function() {
              var bufferPosition, key;
              key = atom.keymaps.constructor.buildKeydownEvent('tab', {
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              expect(editor.getText()).toBe('ok then ab');
              bufferPosition = editor.getCursorBufferPosition();
              expect(bufferPosition.row).toEqual(0);
              return expect(bufferPosition.column).toEqual(10);
            });
          });
          return it('does not insert the word when enter completion not enabled', function() {
            triggerAutocompletion(editor, false, 'a');
            return runs(function() {
              var key;
              key = atom.keymaps.constructor.buildKeydownEvent('enter', {
                keyCode: 13,
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              return expect(editor.getText()).toBe('ok then a\n');
            });
          });
        });
        describe('when enter is used to accept suggestions', function() {
          beforeEach(function() {
            return atom.config.set('autocomplete-plus.confirmCompletion', 'enter');
          });
          it('inserts the word and moves the cursor to the end of the word', function() {
            triggerAutocompletion(editor, false, 'a');
            return runs(function() {
              var bufferPosition, key;
              key = atom.keymaps.constructor.buildKeydownEvent('enter', {
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              expect(editor.getText()).toBe('ok then ab');
              bufferPosition = editor.getCursorBufferPosition();
              expect(bufferPosition.row).toEqual(0);
              return expect(bufferPosition.column).toEqual(10);
            });
          });
          return it('does not insert the word when tab completion not enabled', function() {
            triggerAutocompletion(editor, false, 'a');
            return runs(function() {
              var key;
              key = atom.keymaps.constructor.buildKeydownEvent('tab', {
                keyCode: 13,
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              return expect(editor.getText()).toBe('ok then a ');
            });
          });
        });
        describe("when a suffix of the replacement matches the text after the cursor", function() {
          it('overwrites that existing text with the replacement', function() {
            spyOn(provider, 'getSuggestions').andCallFake(function() {
              return [
                {
                  text: 'oneomgtwo',
                  replacementPrefix: 'one'
                }
              ];
            });
            editor.setText('ontwothree');
            editor.setCursorBufferPosition([0, 2]);
            triggerAutocompletion(editor, false, 'e');
            return runs(function() {
              var suggestionListView;
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              return expect(editor.getText()).toBe('oneomgtwothree');
            });
          });
          it('does not overwrite any text if the "consumeSuffix" setting is disabled', function() {
            spyOn(provider, 'getSuggestions').andCallFake(function() {
              return [
                {
                  text: 'oneomgtwo',
                  replacementPrefix: 'one'
                }
              ];
            });
            atom.config.set('autocomplete-plus.consumeSuffix', false);
            editor.setText('ontwothree');
            editor.setCursorBufferPosition([0, 2]);
            triggerAutocompletion(editor, false, 'e');
            return runs(function() {
              var suggestionListView;
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              return expect(editor.getText()).toBe('oneomgtwotwothree');
            });
          });
          return it('does not overwrite non-word characters', function() {
            spyOn(provider, 'getSuggestions').andCallFake(function() {
              return [
                {
                  text: 'oneomgtwo()',
                  replacementPrefix: 'one'
                }
              ];
            });
            editor.setText('(on)three');
            editor.setCursorBufferPosition([0, 3]);
            triggerAutocompletion(editor, false, 'e');
            return runs(function() {
              var suggestionListView;
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              return expect(editor.getText()).toBe('(oneomgtwo())three');
            });
          });
        });
        return describe("when the cursor suffix does not match the replacement", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function() {
              return [
                {
                  text: 'oneomgTwo',
                  replacementPrefix: 'one'
                }
              ];
            });
          });
          return it('replaces the suffix with the replacement', function() {
            editor.setText('ontwothree');
            editor.setCursorBufferPosition([0, 2]);
            triggerAutocompletion(editor, false, 'e');
            return runs(function() {
              var suggestionListView;
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              return expect(editor.getText()).toBe('oneomgTwotwothree');
            });
          });
        });
      });
      describe('when auto-activation is disabled', function() {
        var options;
        options = [][0];
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', false);
        });
        it('does not show suggestions after a delay', function() {
          triggerAutocompletion(editor);
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('shows suggestions when explicitly triggered', function() {
          triggerAutocompletion(editor);
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
        it("stays open when typing", function() {
          triggerAutocompletion(editor, false, 'a');
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            editor.insertText('b');
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
        it('accepts the suggestion if there is one', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(options) {
            return [
              {
                text: 'omgok'
              }
            ];
          });
          triggerAutocompletion(editor);
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return expect(editor.getText()).toBe('omgok');
          });
        });
        it('does not accept the suggestion if the event detail is activatedManually: false', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(options) {
            return [
              {
                text: 'omgok'
              }
            ];
          });
          triggerAutocompletion(editor);
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:activate', {
              activatedManually: false
            });
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
        it('does not accept the suggestion if auto-confirm single suggestion is disabled', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(options) {
            return [
              {
                text: 'omgok'
              }
            ];
          });
          triggerAutocompletion(editor);
          runs(function() {
            atom.config.set('autocomplete-plus.enableAutoConfirmSingleSuggestion', false);
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
        it('includes the correct value for activatedManually when explicitly triggered', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(o) {
            options = o;
            return [
              {
                text: 'omgok'
              }, {
                text: 'ahgok'
              }
            ];
          });
          triggerAutocompletion(editor);
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            expect(options).toBeDefined();
            return expect(options.activatedManually).toBe(true);
          });
        });
        return it('does not auto-accept a single suggestion when filtering', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var list, prefix, t, _i, _len, _results;
            prefix = _arg.prefix;
            list = [];
            if ('a'.indexOf(prefix) === 0) {
              list.push('a');
            }
            if ('abc'.indexOf(prefix) === 0) {
              list.push('abc');
            }
            _results = [];
            for (_i = 0, _len = list.length; _i < _len; _i++) {
              t = list[_i];
              _results.push({
                text: t
              });
            }
            return _results;
          });
          editor.insertText('a');
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
          waitForAutocomplete();
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(2);
            editor.insertText('b');
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(1);
          });
        });
      });
      describe("when the replacementPrefix doesnt match the actual prefix", function() {
        describe("when snippets are not used", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function() {
              return [
                {
                  text: 'something',
                  replacementPrefix: 'bcm'
                }
              ];
            });
          });
          return it("only replaces the suggestion at cursors whos prefix matches the replacementPrefix", function() {
            editor.setText("abc abc\ndef");
            editor.setCursorBufferPosition([0, 3]);
            editor.addCursorAtBufferPosition([0, 7]);
            editor.addCursorAtBufferPosition([1, 3]);
            triggerAutocompletion(editor, false, 'm');
            return runs(function() {
              var suggestionListView;
              expect(editorView.querySelector('.autocomplete-plus')).toExist();
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              return expect(editor.getText()).toBe("asomething asomething\ndefm");
            });
          });
        });
        return describe("when snippets are used", function() {
          beforeEach(function() {
            spyOn(provider, 'getSuggestions').andCallFake(function() {
              return [
                {
                  snippet: 'ok(${1:omg})',
                  replacementPrefix: 'bcm'
                }
              ];
            });
            return waitsForPromise(function() {
              return atom.packages.activatePackage('snippets');
            });
          });
          return it("only replaces the suggestion at cursors whos prefix matches the replacementPrefix", function() {
            editor.setText("abc abc\ndef");
            editor.setCursorBufferPosition([0, 3]);
            editor.addCursorAtBufferPosition([0, 7]);
            editor.addCursorAtBufferPosition([1, 3]);
            triggerAutocompletion(editor, false, 'm');
            return runs(function() {
              var suggestionListView;
              expect(editorView.querySelector('.autocomplete-plus')).toExist();
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              return expect(editor.getText()).toBe("aok(omg) aok(omg)\ndefm");
            });
          });
        });
      });
      describe('select-previous event', function() {
        it('selects the previous item in the list', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [
              {
                text: 'ab'
              }, {
                text: 'abc'
              }, {
                text: 'abcd'
              }
            ];
          });
          triggerAutocompletion(editor, false, 'a');
          return runs(function() {
            var items;
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).toHaveClass('selected');
            expect(items[1]).not.toHaveClass('selected');
            expect(items[2]).not.toHaveClass('selected');
            atom.commands.dispatch(editorView, 'core:move-up');
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).not.toHaveClass('selected');
            expect(items[1]).not.toHaveClass('selected');
            return expect(items[2]).toHaveClass('selected');
          });
        });
        it('closes the autocomplete when up arrow pressed when only one item displayed', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var prefix;
            prefix = _arg.prefix;
            return [
              {
                text: 'quicksort'
              }, {
                text: 'quack'
              }
            ].filter(function(val) {
              return val.text.startsWith(prefix);
            });
          });
          editor.insertText('q');
          editor.insertText('u');
          waitForAutocomplete();
          runs(function() {
            var autocomplete;
            atom.commands.dispatch(editorView, 'core:move-up');
            advanceClock(1);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            expect(autocomplete).toExist();
            editor.insertText('a');
            return waitForAutocomplete();
          });
          return runs(function() {
            var autocomplete;
            autocomplete = editorView.querySelector('.autocomplete-plus');
            expect(autocomplete).toExist();
            atom.commands.dispatch(editorView, 'core:move-up');
            advanceClock(1);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).not.toExist();
          });
        });
        return it('does not close the autocomplete when up arrow pressed with multiple items displayed but triggered on one item', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var prefix;
            prefix = _arg.prefix;
            return [
              {
                text: 'quicksort'
              }, {
                text: 'quack'
              }
            ].filter(function(val) {
              return val.text.startsWith(prefix);
            });
          });
          editor.insertText('q');
          editor.insertText('u');
          editor.insertText('a');
          waitForAutocomplete();
          runs(function() {
            editor.backspace();
            return waitForAutocomplete();
          });
          return runs(function() {
            var autocomplete;
            autocomplete = editorView.querySelector('.autocomplete-plus');
            expect(autocomplete).toExist();
            atom.commands.dispatch(editorView, 'core:move-up');
            advanceClock(1);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).toExist();
          });
        });
      });
      describe('select-next event', function() {
        it('selects the next item in the list', function() {
          triggerAutocompletion(editor, false, 'a');
          return runs(function() {
            var items;
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).toHaveClass('selected');
            expect(items[1]).not.toHaveClass('selected');
            expect(items[2]).not.toHaveClass('selected');
            atom.commands.dispatch(editorView, 'core:move-down');
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).not.toHaveClass('selected');
            expect(items[1]).toHaveClass('selected');
            return expect(items[2]).not.toHaveClass('selected');
          });
        });
        return it('wraps to the first item when triggered at the end of the list', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [
              {
                text: 'ab'
              }, {
                text: 'abc'
              }, {
                text: 'abcd'
              }
            ];
          });
          triggerAutocompletion(editor, false, 'a');
          return runs(function() {
            var items, suggestionListView;
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).toHaveClass('selected');
            expect(items[1]).not.toHaveClass('selected');
            expect(items[2]).not.toHaveClass('selected');
            suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            items = editorView.querySelectorAll('.autocomplete-plus li');
            atom.commands.dispatch(suggestionListView, 'core:move-down');
            expect(items[1]).toHaveClass('selected');
            atom.commands.dispatch(suggestionListView, 'core:move-down');
            expect(items[2]).toHaveClass('selected');
            atom.commands.dispatch(suggestionListView, 'core:move-down');
            return expect(items[0]).toHaveClass('selected');
          });
        });
      });
      describe("label rendering", function() {
        describe("when no labels are specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok'
                }
              ];
            });
          });
          return it("displays the text in the suggestion", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var iconContainer, leftLabel, rightLabel;
              iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
              leftLabel = editorView.querySelector('.autocomplete-plus li .right-label');
              rightLabel = editorView.querySelector('.autocomplete-plus li .right-label');
              expect(iconContainer.childNodes).toHaveLength(0);
              expect(leftLabel.childNodes).toHaveLength(0);
              return expect(rightLabel.childNodes).toHaveLength(0);
            });
          });
        });
        describe("when `type` is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  type: 'omg'
                }
              ];
            });
          });
          return it("displays an icon in the icon-container", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var icon;
              icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon');
              return expect(icon.textContent).toBe('o');
            });
          });
        });
        describe("when the `type` specified has a default icon", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  type: 'snippet'
                }
              ];
            });
          });
          return it("displays the default icon in the icon-container", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var icon;
              icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon i');
              return expect(icon).toHaveClass('icon-move-right');
            });
          });
        });
        describe("when `type` is an empty string", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  type: ''
                }
              ];
            });
          });
          return it("does not display an icon in the icon-container", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var iconContainer;
              iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
              return expect(iconContainer.childNodes).toHaveLength(0);
            });
          });
        });
        describe("when `iconHTML` is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  iconHTML: '<i class="omg"></i>'
                }
              ];
            });
          });
          return it("displays an icon in the icon-container", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var icon;
              icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon .omg');
              return expect(icon).toExist();
            });
          });
        });
        describe("when `iconHTML` is false", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  type: 'something',
                  iconHTML: false
                }
              ];
            });
          });
          return it("does not display an icon in the icon-container", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var iconContainer;
              iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
              return expect(iconContainer.childNodes).toHaveLength(0);
            });
          });
        });
        describe("when `iconHTML` is not a string and a `type` is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  type: 'something',
                  iconHTML: true
                }
              ];
            });
          });
          return it("displays the default icon in the icon-container", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var icon;
              icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon');
              return expect(icon.textContent).toBe('s');
            });
          });
        });
        describe("when `iconHTML` is not a string and no type is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  iconHTML: true
                }
              ];
            });
          });
          return it("it does not display an icon", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var iconContainer;
              iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
              return expect(iconContainer.childNodes).toHaveLength(0);
            });
          });
        });
        describe("when `rightLabel` is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  rightLabel: '<i class="something">sometext</i>'
                }
              ];
            });
          });
          return it("displays the text in the suggestion", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var label;
              label = editorView.querySelector('.autocomplete-plus li .right-label');
              return expect(label).toHaveText('<i class="something">sometext</i>');
            });
          });
        });
        describe("when `rightLabelHTML` is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  rightLabelHTML: '<i class="something">sometext</i>'
                }
              ];
            });
          });
          return it("displays the text in the suggestion", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var label;
              label = editorView.querySelector('.autocomplete-plus li .right-label .something');
              return expect(label).toHaveText('sometext');
            });
          });
        });
        describe("when `leftLabel` is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  leftLabel: '<i class="something">sometext</i>'
                }
              ];
            });
          });
          return it("displays the text in the suggestion", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var label;
              label = editorView.querySelector('.autocomplete-plus li .left-label');
              return expect(label).toHaveText('<i class="something">sometext</i>');
            });
          });
        });
        return describe("when `leftLabelHTML` is specified", function() {
          beforeEach(function() {
            return spyOn(provider, 'getSuggestions').andCallFake(function(options) {
              return [
                {
                  text: 'ok',
                  leftLabelHTML: '<i class="something">sometext</i>'
                }
              ];
            });
          });
          return it("displays the text in the suggestion", function() {
            triggerAutocompletion(editor);
            return runs(function() {
              var label;
              label = editorView.querySelector('.autocomplete-plus li .left-label .something');
              return expect(label).toHaveText('sometext');
            });
          });
        });
      });
      return describe('when clicking in the suggestion list', function() {
        beforeEach(function() {
          return spyOn(provider, 'getSuggestions').andCallFake(function() {
            var list, text, _i, _len, _results;
            list = ['ab', 'abc', 'abcd', 'abcde'];
            _results = [];
            for (_i = 0, _len = list.length; _i < _len; _i++) {
              text = list[_i];
              _results.push({
                text: text,
                description: "" + text + " yeah ok"
              });
            }
            return _results;
          });
        });
        it('will select the item and confirm the selection', function() {
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            var item, mouse;
            item = editorView.querySelectorAll('.autocomplete-plus li')[1];
            mouse = document.createEvent('MouseEvents');
            mouse.initMouseEvent('mousedown', true, true, window);
            item.dispatchEvent(mouse);
            mouse = document.createEvent('MouseEvents');
            mouse.initMouseEvent('mouseup', true, true, window);
            item.dispatchEvent(mouse);
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return expect(editor.getBuffer().getLastLine()).toEqual(item.textContent.trim());
          });
        });
        return it('will not close the list when the description is clicked', function() {
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            var description, mouse;
            description = editorView.querySelector('.autocomplete-plus .suggestion-description-content');
            mouse = document.createEvent('MouseEvents');
            mouse.initMouseEvent('mousedown', true, true, window);
            description.dispatchEvent(mouse);
            mouse = document.createEvent('MouseEvents');
            mouse.initMouseEvent('mouseup', true, true, window);
            description.dispatchEvent(mouse);
            return expect(editorView.querySelector('.autocomplete-plus')).toExist();
          });
        });
      });
    });
    describe('when opening a file without a path', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-text');
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            return mainModule = a.mainModule;
          });
        });
        waitsFor(function() {
          var _ref2;
          return (_ref2 = mainModule.autocompleteManager) != null ? _ref2.ready : void 0;
        });
        return runs(function() {
          autocompleteManager = mainModule.autocompleteManager;
          spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
          return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
        });
      });
      return describe("when strict matching is used", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.strictMatching', true);
        });
        return it('using strict matching does not cause issues when typing', function() {
          runs(function() {
            editor.moveToBottom();
            editor.insertText('h');
            editor.insertText('e');
            editor.insertText('l');
            editor.insertText('l');
            editor.insertText('o');
            return advanceClock(completionDelay + 1000);
          });
          return waitsFor(function() {
            return autocompleteManager.findSuggestions.calls.length === 1;
          });
        });
      });
    });
    describe('when opening a javascript file', function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', true);
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.js').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            return mainModule = a.mainModule;
          });
        });
        waitsFor(function() {
          return autocompleteManager = mainModule.autocompleteManager;
        });
        return runs(function() {
          return advanceClock(autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
        });
      });
      describe('when the built-in provider is disabled', function() {
        return it('should not show the suggestion list', function() {
          atom.config.set('autocomplete-plus.enableBuiltinProvider', false);
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          triggerAutocompletion(editor);
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
      describe('when the buffer changes', function() {
        it('should show the suggestion list when suggestions are found', function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          triggerAutocompletion(editor);
          return runs(function() {
            var index, item, suggestions, _i, _len, _ref2, _results;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            suggestions = ['function', 'if', 'left', 'shift'];
            _ref2 = editorView.querySelectorAll('.autocomplete-plus li span.word');
            _results = [];
            for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
              item = _ref2[index];
              _results.push(expect(item.innerText).toEqual(suggestions[index]));
            }
            return _results;
          });
        });
        it('should not show the suggestion list when no suggestions are found', function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('x');
          waitForAutocomplete();
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('shows the suggestion list on backspace if allowed', function() {
          runs(function() {
            atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', true);
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('f');
            editor.insertText('u');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            editor.insertText('\r');
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return expect(editor.lineTextForBufferRow(13)).toBe('f');
          });
        });
        it('does not shows the suggestion list on backspace if disallowed', function() {
          runs(function() {
            atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', false);
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('f');
            editor.insertText('u');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            editor.insertText('\r');
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return expect(editor.lineTextForBufferRow(13)).toBe('f');
          });
        });
        it("keeps the suggestion list open when it's already open on backspace", function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('u');
          waitForAutocomplete();
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return expect(editor.lineTextForBufferRow(13)).toBe('f');
          });
        });
        it("does not open the suggestion on backspace when it's closed", function() {
          atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', false);
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.setCursorBufferPosition([2, 39]);
          runs(function() {
            var key;
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('should not update the suggestion list while composition is in progress', function() {
          var activeElement;
          triggerAutocompletion(editor);
          activeElement = editorView.rootElement.querySelector('input');
          runs(function() {
            spyOn(autocompleteManager.suggestionList, 'changeItems').andCallThrough();
            expect(autocompleteManager.suggestionList.changeItems).not.toHaveBeenCalled();
            activeElement.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: activeElement
            }));
            activeElement.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: '~',
              target: activeElement
            }));
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(autocompleteManager.suggestionList.changeItems).toHaveBeenCalledWith(null);
            activeElement.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: activeElement
            }));
            activeElement.dispatchEvent(buildTextInputEvent({
              data: 'ã',
              target: activeElement
            }));
            return expect(editor.lineTextForBufferRow(13)).toBe('fã');
          });
        });
        return it('does not show the suggestion list when it is triggered then no longer needed', function() {
          runs(function() {
            editor.moveToBottom();
            editor.insertText('f');
            editor.insertText('u');
            editor.insertText('\r');
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
      return describe('.cancel()', function() {
        return it('unbinds autocomplete event handlers for move-up and move-down', function() {
          triggerAutocompletion(editor, false);
          autocompleteManager.hideSuggestionList();
          editorView = atom.views.getView(editor);
          atom.commands.dispatch(editorView, 'core:move-down');
          expect(editor.getCursorBufferPosition().row).toBe(1);
          atom.commands.dispatch(editorView, 'core:move-up');
          return expect(editor.getCursorBufferPosition().row).toBe(0);
        });
      });
    });
    describe('when a long completion exists', function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', true);
        });
        waitsForPromise(function() {
          return atom.workspace.open('samplelong.js').then(function(e) {
            return editor = e;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            return mainModule = a.mainModule;
          });
        });
        return waitsFor(function() {
          return autocompleteManager = mainModule.autocompleteManager;
        });
      });
      return it('sets the width of the view to be wide enough to contain the longest completion without scrolling', function() {
        editor.moveToBottom();
        editor.insertNewline();
        editor.insertText('t');
        waitForAutocomplete();
        return runs(function() {
          var suggestionListView;
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          return expect(suggestionListView.scrollWidth).toBe(suggestionListView.offsetWidth);
        });
      });
    });
    requiresGutter = function() {
      var _ref2;
      return ((_ref2 = editorView.component) != null ? _ref2.overlayManager : void 0) != null;
    };
    return pixelLeftForBufferPosition = function(bufferPosition) {
      var left;
      if (gutterWidth == null) {
        gutterWidth = editorView.shadowRoot.querySelector('.gutter').offsetWidth;
      }
      left = editorView.pixelPositionForBufferPosition(bufferPosition).left;
      left += editorView.offsetLeft;
      if (requiresGutter()) {
        left = gutterWidth + left;
      }
      return "" + (Math.round(left)) + "px";
    };
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLWludGVncmF0aW9uLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdJQUFBOztBQUFBLEVBQUEsT0FBOEYsT0FBQSxDQUFRLGVBQVIsQ0FBOUYsRUFBQyw2QkFBQSxxQkFBRCxFQUF3QiwyQkFBQSxtQkFBeEIsRUFBNkMsZ0NBQUEsd0JBQTdDLEVBQXVFLDJCQUFBLG1CQUF2RSxDQUFBOztBQUFBLEVBQ0MsZ0JBQWlCLE9BQUEsQ0FBUSxNQUFSLEVBQWpCLGFBREQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsS0FBaEIsQ0FBQSxDQUZQLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLENBTGYsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSxzSkFBQTtBQUFBLElBQUEsUUFBb0gsRUFBcEgsRUFBQywyQkFBRCxFQUFtQiwwQkFBbkIsRUFBb0MscUJBQXBDLEVBQWdELGlCQUFoRCxFQUF3RCxxQkFBeEQsRUFBb0UsOEJBQXBFLEVBQXlGLHFCQUF6RixFQUFxRyxzQkFBckcsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsV0FBQSxHQUFjLElBQWQsQ0FBQTthQUNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFFSCxRQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsRUFBMEQsSUFBMUQsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFJ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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/autocomplete-manager-integration-spec.coffee
