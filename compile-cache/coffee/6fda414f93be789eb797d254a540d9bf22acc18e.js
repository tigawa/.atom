(function() {
  var path;

  path = require('path');

  describe('Autocomplete Snippets', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, pathsMain, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], completionDelay = _ref[1], editor = _ref[2], editorView = _ref[3], pathsMain = _ref[4], autocompleteMain = _ref[5], autocompleteManager = _ref[6];
    beforeEach(function() {
      runs(function() {
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);
        autocompleteMain = atom.packages.loadPackage('autocomplete-plus').mainModule;
        spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
        pathsMain = atom.packages.loadPackage('autocomplete-paths').mainModule;
        return spyOn(pathsMain, 'provide').andCallThrough();
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
        return atom.packages.activatePackage('autocomplete-plus');
      });
      waitsFor(function() {
        var _ref1;
        return (_ref1 = autocompleteMain.autocompleteManager) != null ? _ref1.ready : void 0;
      });
      runs(function() {
        autocompleteManager = autocompleteMain.autocompleteManager;
        spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
        spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
        spyOn(autocompleteManager, 'showSuggestionList').andCallThrough();
        return spyOn(autocompleteManager, 'hideSuggestionList').andCallThrough();
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-paths');
      });
      waitsFor(function() {
        return pathsMain.provide.calls.length === 1;
      });
      return waitsFor(function() {
        return autocompleteMain.consumeProvider.calls.length === 1;
      });
    });
    afterEach(function() {
      jasmine.unspy(autocompleteMain, 'consumeProvider');
      jasmine.unspy(pathsMain, 'provide');
      jasmine.unspy(autocompleteManager, 'findSuggestions');
      jasmine.unspy(autocompleteManager, 'displaySuggestions');
      jasmine.unspy(autocompleteManager, 'showSuggestionList');
      return jasmine.unspy(autocompleteManager, 'hideSuggestionList');
    });
    return describe('when autocomplete-plus is enabled', function() {
      it('shows autocompletions when typing ./', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('.');
          editor.insertText('/');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editorView.querySelector('.autocomplete-plus span.word')).toHaveText('linkeddir/');
          return expect(editorView.querySelector('.autocomplete-plus span.completion-label')).toHaveText('Dir');
        });
      });
      it('does not crash when typing an invalid folder', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('./sample.js');
          editor.insertText('/');
          return advanceClock(completionDelay);
        });
        return waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
      });
      it('does not crash when autocompleting symlinked paths', function() {
        runs(function() {
          var c, _i, _len, _ref1;
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          _ref1 = './linkedir';
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            c = _ref1[_i];
            editor.insertText(c);
          }
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 2;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return advanceClock(completionDelay + 1000);
        });
      });
      return it('allows relative path completion without ./', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('linkeddir');
          editor.insertText('/');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editorView.querySelector('.autocomplete-plus span.word')).toHaveText('.gitkeep');
          return expect(editorView.querySelector('.autocomplete-plus span.completion-label')).toHaveText('File');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvc3BlYy9hdXRvY29tcGxldGUtcGF0aHMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsSUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLFFBQUEsNkdBQUE7QUFBQSxJQUFBLE9BQTRHLEVBQTVHLEVBQUMsMEJBQUQsRUFBbUIseUJBQW5CLEVBQW9DLGdCQUFwQyxFQUE0QyxvQkFBNUMsRUFBd0QsbUJBQXhELEVBQW1FLDBCQUFuRSxFQUFxRiw2QkFBckYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUVILFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixFQUEwRCxJQUExRCxDQUFBLENBQUE7QUFBQSxRQUVBLGVBQUEsR0FBa0IsR0FGbEIsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixFQUF5RCxlQUF6RCxDQUhBLENBQUE7QUFBQSxRQUlBLGVBQUEsSUFBbUIsR0FKbkIsQ0FBQTtBQUFBLFFBS0EsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUxuQixDQUFBO0FBQUEsUUFNQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsQ0FOQSxDQUFBO0FBQUEsUUFPQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsbUJBQTFCLENBQThDLENB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-paths/spec/autocomplete-paths-spec.coffee
