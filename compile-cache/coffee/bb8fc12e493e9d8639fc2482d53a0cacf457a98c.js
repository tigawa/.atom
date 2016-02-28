(function() {
  var Point, buildIMECompositionEvent, buildTextInputEvent, suggestionForWord, suggestionsForPrefix, triggerAutocompletion, _ref;

  Point = require('atom').Point;

  _ref = require('./spec-helper'), triggerAutocompletion = _ref.triggerAutocompletion, buildIMECompositionEvent = _ref.buildIMECompositionEvent, buildTextInputEvent = _ref.buildTextInputEvent;

  suggestionForWord = function(suggestionList, word) {
    return suggestionList.getSymbol(word);
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
    var autocompleteManager, completionDelay, editor, editorView, mainModule, provider, _ref1;
    _ref1 = [], completionDelay = _ref1[0], editorView = _ref1[1], editor = _ref1[2], mainModule = _ref1[3], autocompleteManager = _ref1[4], provider = _ref1[5];
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
      return expect(suggestionForWord(provider.symbolStore, 'quicksort')).toBeTruthy();
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
      expect(suggestionsForPrefix(provider, editor, 'qu')).not.toContain('qu');
      editor.insertText(' qu');
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
      editor.moveToBeginningOfLine();
      editor.insertText('qu');
      expect(suggestionsForPrefix(provider, editor, 'qu')).not.toContain('qu');
      return expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('quicksort');
    });
    it("correctly tracks the buffer row associated with symbols as they change", function() {
      var suggestion;
      editor.setText('');
      advanceClock(provider.changeUpdateDelay);
      editor.setText('function abc(){}\nfunction abc(){}');
      advanceClock(provider.changeUpdateDelay);
      suggestion = suggestionForWord(provider.symbolStore, 'abc');
      expect(suggestion.bufferRowsForBuffer(editor.getBuffer())).toEqual([0, 1]);
      editor.setCursorBufferPosition([2, 100]);
      editor.insertText('\n\nfunction omg(){}; function omg(){}');
      advanceClock(provider.changeUpdateDelay);
      suggestion = suggestionForWord(provider.symbolStore, 'omg');
      expect(suggestion.bufferRowsForBuffer(editor.getBuffer())).toEqual([3, 3]);
      editor.selectLeft(16);
      editor.backspace();
      advanceClock(provider.changeUpdateDelay);
      suggestion = suggestionForWord(provider.symbolStore, 'omg');
      expect(suggestion.bufferRowsForBuffer(editor.getBuffer())).toEqual([3]);
      editor.insertText('\nfunction omg(){}');
      advanceClock(provider.changeUpdateDelay);
      suggestion = suggestionForWord(provider.symbolStore, 'omg');
      expect(suggestion.bufferRowsForBuffer(editor.getBuffer())).toEqual([3, 4]);
      editor.setText('');
      advanceClock(provider.changeUpdateDelay);
      expect(suggestionForWord(provider.symbolStore, 'abc')).toBeUndefined();
      expect(suggestionForWord(provider.symbolStore, 'omg')).toBeUndefined();
      editor.setText('function abc(){}\nfunction abc(){}');
      editor.setCursorBufferPosition([0, 0]);
      editor.insertText('\n');
      editor.setCursorBufferPosition([2, 100]);
      editor.insertText('\nfunction abc(){}');
      advanceClock(provider.changeUpdateDelay);
      suggestion = suggestionForWord(provider.symbolStore, 'abc');
      return expect(suggestion.bufferRowsForBuffer(editor.getBuffer())).toContain(3);
    });
    it("does not output suggestions from the other buffer", function() {
      var coffeeEditor, results, _ref2;
      _ref2 = [], results = _ref2[0], coffeeEditor = _ref2[1];
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
        return expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
      });
    });
    describe("when multiple editors track the same buffer", function() {
      var leftPane, rightEditor, rightPane, _ref2;
      _ref2 = [], leftPane = _ref2[0], rightPane = _ref2[1], rightEditor = _ref2[2];
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
        expect(suggestionsForPrefix(provider, rightEditor, 'anew')).toContain('aNewFunction');
        editor.moveToBottom();
        editor.moveToBeginningOfLine();
        expect(suggestionsForPrefix(provider, editor, 'somenew')).not.toContain('someNewFunction');
        editor.insertText('function someNewFunction(){};');
        return expect(suggestionsForPrefix(provider, editor, 'somenew')).toContain('someNewFunction');
      });
      return it("stops watching editors and removes content from symbol store as they are destroyed", function() {
        var buffer;
        expect(suggestionForWord(provider.symbolStore, 'quicksort')).toBeTruthy();
        buffer = editor.getBuffer();
        editor.destroy();
        expect(provider.isWatchingBuffer(buffer)).toBe(true);
        expect(provider.isWatchingEditor(editor)).toBe(false);
        expect(provider.isWatchingEditor(rightEditor)).toBe(true);
        expect(suggestionForWord(provider.symbolStore, 'quicksort')).toBeTruthy();
        expect(suggestionForWord(provider.symbolStore, 'aNewFunction')).toBeFalsy();
        rightEditor.insertText('function aNewFunction(){};');
        expect(suggestionForWord(provider.symbolStore, 'aNewFunction')).toBeTruthy();
        rightPane.destroy();
        expect(provider.isWatchingBuffer(buffer)).toBe(false);
        expect(provider.isWatchingEditor(editor)).toBe(false);
        expect(provider.isWatchingEditor(rightEditor)).toBe(false);
        expect(suggestionForWord(provider.symbolStore, 'quicksort')).toBeFalsy();
        return expect(suggestionForWord(provider.symbolStore, 'aNewFunction')).toBeFalsy();
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
        suggestions = suggestionsForPrefix(provider, editor, 'in', {
          raw: true
        });
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].text).toBe('in-a-string');
        expect(suggestions[0].type).toBe('instring');
        editor.setCursorBufferPosition([1, Infinity]);
        editor.insertText(' ');
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
    return xit('adds words to the wordlist with unicode characters', function() {
      expect(provider.symbolStore.indexOf('somēthingNew')).toBeFalsy();
      editor.insertText('somēthingNew');
      editor.insertText(' ');
      return expect(provider.symbolStore.indexOf('somēthingNew')).toBeTruthy();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3N5bWJvbC1wcm92aWRlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwSEFBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFDQSxPQUF5RSxPQUFBLENBQVEsZUFBUixDQUF6RSxFQUFDLDZCQUFBLHFCQUFELEVBQXdCLGdDQUFBLHdCQUF4QixFQUFrRCwyQkFBQSxtQkFEbEQsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLFNBQUMsY0FBRCxFQUFpQixJQUFqQixHQUFBO1dBQ2xCLGNBQWMsQ0FBQyxTQUFmLENBQXlCLElBQXpCLEVBRGtCO0VBQUEsQ0FIcEIsQ0FBQTs7QUFBQSxFQU1BLG9CQUFBLEdBQXVCLFNBQUMsUUFBRCxFQUFXLE1BQVgsRUFBbUIsTUFBbkIsRUFBMkIsT0FBM0IsR0FBQTtBQUNyQixRQUFBLHFFQUFBO0FBQUEsSUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWpCLENBQUE7QUFBQSxJQUNBLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFzQixDQUFDLGtCQUF2QixDQUFBLENBRGxCLENBQUE7QUFBQSxJQUVBLFdBQUEsR0FBYyxRQUFRLENBQUMsY0FBVCxDQUF3QjtBQUFBLE1BQUMsUUFBQSxNQUFEO0FBQUEsTUFBUyxnQkFBQSxjQUFUO0FBQUEsTUFBeUIsUUFBQSxNQUF6QjtBQUFBLE1BQWlDLGlCQUFBLGVBQWpDO0tBQXhCLENBRmQsQ0FBQTtBQUdBLElBQUEsc0JBQUcsT0FBTyxDQUFFLFlBQVo7YUFDRSxZQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsSUFBRyxXQUFIO0FBQXFC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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/symbol-provider-spec.coffee
