(function() {
  var Point, TextBuffer, buildIMECompositionEvent, buildTextInputEvent, suggestionsForPrefix, triggerAutocompletion, waitForBufferToStopChanging, _ref, _ref1;

  _ref = require('atom'), Point = _ref.Point, TextBuffer = _ref.TextBuffer;

  _ref1 = require('./spec-helper'), triggerAutocompletion = _ref1.triggerAutocompletion, buildIMECompositionEvent = _ref1.buildIMECompositionEvent, buildTextInputEvent = _ref1.buildTextInputEvent;

  waitForBufferToStopChanging = function() {
    return advanceClock(TextBuffer.prototype.stoppedChangingDelay);
  };

  suggestionsForPrefix = function(provider, editor, prefix, options) {
    var bufferPosition, scopeDescriptor, sug, suggestions, _i, _len, _results;
    bufferPosition = editor.getCursorBufferPosition();
    scopeDescriptor = editor.getLastCursor().getScopeDescriptor();
    suggestions = provider.getSuggestions({
      editor: editor,
      bufferPosition: bufferPosition,
      prefix: prefix,
      scopeDescriptor: scopeDescriptor
    });
    if (options != null ? options.raw : void 0) {
      return suggestions;
    } else {
      if (suggestions) {
        _results = [];
        for (_i = 0, _len = suggestions.length; _i < _len; _i++) {
          sug = suggestions[_i];
          _results.push(sug.text);
        }
        return _results;
      } else {
        return [];
      }
    }
  };

  describe('SymbolProvider', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, provider, _ref2;
    _ref2 = [], completionDelay = _ref2[0], editorView = _ref2[1], editor = _ref2[2], mainModule = _ref2[3], autocompleteManager = _ref2[4], provider = _ref2[5];
    beforeEach(function() {
      var workspaceElement;
      atom.config.set('autocomplete-plus.enableAutoActivation', true);
      atom.config.set('autocomplete-plus.defaultProvider', 'Symbol');
      completionDelay = 100;
      atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
      completionDelay += 100;
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return Promise.all([
          atom.workspace.open("sample.js").then(function(e) {
            return editor = e;
          }), atom.packages.activatePackage("language-javascript"), atom.packages.activatePackage("autocomplete-plus").then(function(a) {
            return mainModule = a.mainModule;
          })
        ]);
      });
      return runs(function() {
        autocompleteManager = mainModule.autocompleteManager;
        advanceClock(1);
        editorView = atom.views.getView(editor);
        return provider = autocompleteManager.providerManager.defaultProvider;
      });
    });
    it("runs a completion ", function() {
      return expect(suggestionsForPrefix(provider, editor, 'quick')).toContain('quicksort');
    });
    it("adds words to the symbol list after they have been written", function() {
      expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
      editor.insertText('function aNewFunction(){};');
      editor.insertText(' ');
      advanceClock(provider.changeUpdateDelay);
      return expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
    });
    it("adds words after they have been added to a scope that is not a direct match for the selector", function() {
      expect(suggestionsForPrefix(provider, editor, 'some')).not.toContain('somestring');
      editor.insertText('abc = "somestring"');
      editor.insertText(' ');
      advanceClock(provider.changeUpdateDelay);
      return expect(suggestionsForPrefix(provider, editor, 'some')).toContain('somestring');
    });
    it("removes words from the symbol list when they do not exist in the buffer", function() {
      editor.moveToBottom();
      editor.moveToBeginningOfLine();
      expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
      editor.insertText('function aNewFunction(){};');
      editor.moveToEndOfLine();
      advanceClock(provider.changeUpdateDelay);
      expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
      editor.setCursorBufferPosition([13, 21]);
      editor.backspace();
      editor.moveToTop();
      advanceClock(provider.changeUpdateDelay);
      expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunctio');
      return expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
    });
    it("does not return the word under the cursor when there is only a prefix", function() {
      editor.moveToBottom();
      editor.insertText('qu');
      waitForBufferToStopChanging();
      expect(suggestionsForPrefix(provider, editor, 'qu')).not.toContain('qu');
      editor.insertText(' qu');
      waitForBufferToStopChanging();
      return expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('qu');
    });
    it("does not return the word under the cursor when there is a suffix and only one instance of the word", function() {
      editor.moveToBottom();
      editor.insertText('catscats');
      editor.moveToBeginningOfLine();
      editor.insertText('omg');
      expect(suggestionsForPrefix(provider, editor, 'omg')).not.toContain('omg');
      return expect(suggestionsForPrefix(provider, editor, 'omg')).not.toContain('omgcatscats');
    });
    it("does not return the word under the cursors when are multiple cursors", function() {
      editor.moveToBottom();
      editor.setText('\n\n\n');
      editor.setCursorBufferPosition([0, 0]);
      editor.addCursorAtBufferPosition([1, 0]);
      editor.addCursorAtBufferPosition([2, 0]);
      editor.insertText('omg');
      return expect(suggestionsForPrefix(provider, editor, 'omg')).not.toContain('omg');
    });
    it("returns the word under the cursor when there is a suffix and there are multiple instances of the word", function() {
      editor.moveToBottom();
      editor.insertText('icksort');
      waitForBufferToStopChanging();
      editor.moveToBeginningOfLine();
      editor.insertText('qu');
      waitForBufferToStopChanging();
      expect(suggestionsForPrefix(provider, editor, 'qu')).not.toContain('qu');
      return expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('quicksort');
    });
    it("does not output suggestions from the other buffer", function() {
      var coffeeEditor, results, _ref3;
      _ref3 = [], results = _ref3[0], coffeeEditor = _ref3[1];
      waitsForPromise(function() {
        return Promise.all([
          atom.packages.activatePackage("language-coffee-script"), atom.workspace.open("sample.coffee").then(function(e) {
            return coffeeEditor = e;
          })
        ]);
      });
      return runs(function() {
        advanceClock(1);
        return expect(suggestionsForPrefix(provider, coffeeEditor, 'item')).toHaveLength(0);
      });
    });
    describe("when autocomplete-plus.minimumWordLength is > 1", function() {
      beforeEach(function() {
        return atom.config.set('autocomplete-plus.minimumWordLength', 3);
      });
      return it("only returns results when the prefix is at least the min word length", function() {
        editor.insertText('function aNewFunction(){};');
        advanceClock(provider.changeUpdateDelay);
        expect(suggestionsForPrefix(provider, editor, '')).not.toContain('aNewFunction');
        expect(suggestionsForPrefix(provider, editor, 'a')).not.toContain('aNewFunction');
        expect(suggestionsForPrefix(provider, editor, 'an')).not.toContain('aNewFunction');
        expect(suggestionsForPrefix(provider, editor, 'ane')).toContain('aNewFunction');
        return expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
      });
    });
    describe("when autocomplete-plus.minimumWordLength is 0", function() {
      beforeEach(function() {
        return atom.config.set('autocomplete-plus.minimumWordLength', 0);
      });
      return it("only returns results when the prefix is at least the min word length", function() {
        editor.insertText('function aNewFunction(){};');
        advanceClock(provider.changeUpdateDelay);
        expect(suggestionsForPrefix(provider, editor, '')).not.toContain('aNewFunction');
        expect(suggestionsForPrefix(provider, editor, 'a')).toContain('aNewFunction');
        expect(suggestionsForPrefix(provider, editor, 'an')).toContain('aNewFunction');
        expect(suggestionsForPrefix(provider, editor, 'ane')).toContain('aNewFunction');
        return expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
      });
    });
    describe("when the editor's path changes", function() {
      return it("continues to track changes on the new path", function() {
        var buffer;
        buffer = editor.getBuffer();
        expect(provider.isWatchingEditor(editor)).toBe(true);
        expect(provider.isWatchingBuffer(buffer)).toBe(true);
        expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('quicksort');
        buffer.setPath('cats.js');
        expect(provider.isWatchingEditor(editor)).toBe(true);
        expect(provider.isWatchingBuffer(buffer)).toBe(true);
        editor.moveToBottom();
        editor.moveToBeginningOfLine();
        expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('quicksort');
        expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
        editor.insertText('function aNewFunction(){};');
        waitForBufferToStopChanging();
        return expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
      });
    });
    describe("when multiple editors track the same buffer", function() {
      var leftPane, rightEditor, rightPane, _ref3;
      _ref3 = [], leftPane = _ref3[0], rightPane = _ref3[1], rightEditor = _ref3[2];
      beforeEach(function() {
        var pane;
        pane = atom.workspace.paneForItem(editor);
        rightPane = pane.splitRight({
          copyActiveItem: true
        });
        rightEditor = rightPane.getItems()[0];
        expect(provider.isWatchingEditor(editor)).toBe(true);
        return expect(provider.isWatchingEditor(rightEditor)).toBe(true);
      });
      it("watches the both the old and new editor for changes", function() {
        rightEditor.moveToBottom();
        rightEditor.moveToBeginningOfLine();
        expect(suggestionsForPrefix(provider, rightEditor, 'anew')).not.toContain('aNewFunction');
        rightEditor.insertText('function aNewFunction(){};');
        waitForBufferToStopChanging();
        expect(suggestionsForPrefix(provider, rightEditor, 'anew')).toContain('aNewFunction');
        editor.moveToBottom();
        editor.moveToBeginningOfLine();
        expect(suggestionsForPrefix(provider, editor, 'somenew')).not.toContain('someNewFunction');
        editor.insertText('function someNewFunction(){};');
        waitForBufferToStopChanging();
        return expect(suggestionsForPrefix(provider, editor, 'somenew')).toContain('someNewFunction');
      });
      return it("stops watching editors and removes content from symbol store as they are destroyed", function() {
        var buffer;
        expect(suggestionsForPrefix(provider, editor, 'quick')).toContain('quicksort');
        buffer = editor.getBuffer();
        editor.destroy();
        expect(provider.isWatchingBuffer(buffer)).toBe(true);
        expect(provider.isWatchingEditor(editor)).toBe(false);
        expect(provider.isWatchingEditor(rightEditor)).toBe(true);
        expect(suggestionsForPrefix(provider, editor, 'quick')).toContain('quicksort');
        expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
        rightEditor.insertText('function aNewFunction(){};');
        waitForBufferToStopChanging();
        expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
        rightPane.destroy();
        expect(provider.isWatchingBuffer(buffer)).toBe(false);
        expect(provider.isWatchingEditor(editor)).toBe(false);
        expect(provider.isWatchingEditor(rightEditor)).toBe(false);
        expect(suggestionsForPrefix(provider, editor, 'quick')).not.toContain('quicksort');
        return expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
      });
    });
    describe("when includeCompletionsFromAllBuffers is enabled", function() {
      beforeEach(function() {
        atom.config.set('autocomplete-plus.includeCompletionsFromAllBuffers', true);
        waitsForPromise(function() {
          return Promise.all([
            atom.packages.activatePackage("language-coffee-script"), atom.workspace.open("sample.coffee").then(function(e) {
              return editor = e;
            })
          ]);
        });
        return runs(function() {
          return advanceClock(1);
        });
      });
      afterEach(function() {
        return atom.config.set('autocomplete-plus.includeCompletionsFromAllBuffers', false);
      });
      it("outputs unique suggestions", function() {
        var results;
        editor.setCursorBufferPosition([7, 0]);
        results = suggestionsForPrefix(provider, editor, 'qu');
        return expect(results).toHaveLength(1);
      });
      return it("outputs suggestions from the other buffer", function() {
        var results;
        editor.setCursorBufferPosition([7, 0]);
        results = suggestionsForPrefix(provider, editor, 'item');
        return expect(results[0]).toBe('items');
      });
    });
    describe("when the autocomplete.symbols changes between scopes", function() {
      beforeEach(function() {
        var commentConfig, stringConfig;
        editor.setText('// in-a-comment\ninVar = "in-a-string"');
        waitForBufferToStopChanging();
        commentConfig = {
          incomment: {
            selector: '.comment'
          }
        };
        stringConfig = {
          instring: {
            selector: '.string'
          }
        };
        atom.config.set('autocomplete.symbols', commentConfig, {
          scopeSelector: '.source.js .comment'
        });
        return atom.config.set('autocomplete.symbols', stringConfig, {
          scopeSelector: '.source.js .string'
        });
      });
      return it("uses the config for the scope under the cursor", function() {
        var suggestions;
        editor.setCursorBufferPosition([0, 2]);
        suggestions = suggestionsForPrefix(provider, editor, 'in', {
          raw: true
        });
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].text).toBe('in-a-comment');
        expect(suggestions[0].type).toBe('incomment');
        editor.setCursorBufferPosition([1, 20]);
        editor.insertText(' ');
        waitForBufferToStopChanging();
        suggestions = suggestionsForPrefix(provider, editor, 'in', {
          raw: true
        });
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].text).toBe('in-a-string');
        expect(suggestions[0].type).toBe('instring');
        editor.setCursorBufferPosition([1, Infinity]);
        editor.insertText(' ');
        waitForBufferToStopChanging();
        suggestions = suggestionsForPrefix(provider, editor, 'in', {
          raw: true
        });
        expect(suggestions).toHaveLength(3);
        expect(suggestions[0].text).toBe('inVar');
        return expect(suggestions[0].type).toBe('');
      });
    });
    describe("when the config contains a list of suggestion strings", function() {
      beforeEach(function() {
        var commentConfig;
        editor.setText('// abcomment');
        waitForBufferToStopChanging();
        commentConfig = {
          comment: {
            selector: '.comment'
          },
          builtin: {
            suggestions: ['abcd', 'abcde', 'abcdef']
          }
        };
        return atom.config.set('autocomplete.symbols', commentConfig, {
          scopeSelector: '.source.js .comment'
        });
      });
      return it("adds the suggestions to the results", function() {
        var suggestions;
        editor.setCursorBufferPosition([0, 2]);
        suggestions = suggestionsForPrefix(provider, editor, 'ab', {
          raw: true
        });
        expect(suggestions).toHaveLength(4);
        expect(suggestions[0].text).toBe('abcomment');
        expect(suggestions[0].type).toBe('comment');
        expect(suggestions[1].text).toBe('abcd');
        return expect(suggestions[1].type).toBe('builtin');
      });
    });
    describe("when the symbols config contains a list of suggestion objects", function() {
      beforeEach(function() {
        var commentConfig;
        editor.setText('// abcomment');
        waitForBufferToStopChanging();
        commentConfig = {
          comment: {
            selector: '.comment'
          },
          builtin: {
            suggestions: [
              {
                nope: 'nope1',
                rightLabel: 'will not be added to the suggestions'
              }, {
                text: 'abcd',
                rightLabel: 'one',
                type: 'function'
              }, []
            ]
          }
        };
        return atom.config.set('autocomplete.symbols', commentConfig, {
          scopeSelector: '.source.js .comment'
        });
      });
      return it("adds the suggestion objects to the results", function() {
        var suggestions;
        editor.setCursorBufferPosition([0, 2]);
        suggestions = suggestionsForPrefix(provider, editor, 'ab', {
          raw: true
        });
        expect(suggestions).toHaveLength(2);
        expect(suggestions[0].text).toBe('abcomment');
        expect(suggestions[0].type).toBe('comment');
        expect(suggestions[1].text).toBe('abcd');
        expect(suggestions[1].type).toBe('function');
        return expect(suggestions[1].rightLabel).toBe('one');
      });
    });
    describe("when the legacy completions array is used", function() {
      beforeEach(function() {
        editor.setText('// abcomment');
        waitForBufferToStopChanging();
        return atom.config.set('editor.completions', ['abcd', 'abcde', 'abcdef'], {
          scopeSelector: '.source.js .comment'
        });
      });
      return it("uses the config for the scope under the cursor", function() {
        var suggestions;
        editor.setCursorBufferPosition([0, 2]);
        suggestions = suggestionsForPrefix(provider, editor, 'ab', {
          raw: true
        });
        expect(suggestions).toHaveLength(4);
        expect(suggestions[0].text).toBe('abcomment');
        expect(suggestions[0].type).toBe('');
        expect(suggestions[1].text).toBe('abcd');
        return expect(suggestions[1].type).toBe('builtin');
      });
    });
    return it('adds words to the wordlist with unicode characters', function() {
      var suggestions;
      atom.config.set('autocomplete-plus.enableExtendedUnicodeSupport', true);
      suggestions = suggestionsForPrefix(provider, editor, 'somē', {
        raw: true
      });
      expect(suggestions).toHaveLength(0);
      editor.insertText('somēthingNew');
      editor.insertText(' ');
      waitForBufferToStopChanging();
      suggestions = suggestionsForPrefix(provider, editor, 'somē', {
        raw: true
      });
      return expect(suggestions).toHaveLength(1);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3N5bWJvbC1wcm92aWRlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1SkFBQTs7QUFBQSxFQUFBLE9BQXNCLE9BQUEsQ0FBUSxNQUFSLENBQXRCLEVBQUMsYUFBQSxLQUFELEVBQVEsa0JBQUEsVUFBUixDQUFBOztBQUFBLEVBQ0EsUUFBeUUsT0FBQSxDQUFRLGVBQVIsQ0FBekUsRUFBQyw4QkFBQSxxQkFBRCxFQUF3QixpQ0FBQSx3QkFBeEIsRUFBa0QsNEJBQUEsbUJBRGxELENBQUE7O0FBQUEsRUFHQSwyQkFBQSxHQUE4QixTQUFBLEdBQUE7V0FBRyxZQUFBLENBQWEsVUFBVSxDQUFBLFNBQUUsQ0FBQSxvQkFBekIsRUFBSDtFQUFBLENBSDlCLENBQUE7O0FBQUEsRUFLQSxvQkFBQSxHQUF1QixTQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLE1BQW5CLEVBQTJCLE9BQTNCLEdBQUE7QUFDckIsUUFBQSxxRUFBQTtBQUFBLElBQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFqQixDQUFBO0FBQUEsSUFDQSxlQUFBLEdBQWtCLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxrQkFBdkIsQ0FBQSxDQURsQixDQUFBO0FBQUEsSUFFQSxXQUFBLEdBQWMsUUFBUSxDQUFDLGNBQVQsQ0FBd0I7QUFBQSxNQUFDLFFBQUEsTUFBRDtBQUFBLE1BQVMsZ0JBQUEsY0FBVDtBQUFBLE1BQXlCLFFBQUEsTUFBekI7QUFBQSxNQUFpQyxpQkFBQSxlQUFqQztLQUF4QixDQUZkLENBQUE7QUFHQSxJQUFBLHNCQUFHLE9BQU8sQ0FBRSxZQUFaO2FBQ0UsWUFERjtLQUFBLE1BQUE7QUFHRSxN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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/symbol-provider-spec.coffee
