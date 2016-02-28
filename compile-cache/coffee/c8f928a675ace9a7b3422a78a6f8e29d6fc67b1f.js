(function() {
  describe('Issue 11', function() {
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
        return atom.workspace.open('').then(function(e) {
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
    return describe('when an editor with no path is opened', function() {
      return it('does not have issues', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('/');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvc3BlYy9pc3N1ZXMvMTEtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsNkdBQUE7QUFBQSxJQUFBLE9BQTRHLEVBQTVHLEVBQUMsMEJBQUQsRUFBbUIseUJBQW5CLEVBQW9DLGdCQUFwQyxFQUE0QyxvQkFBNUMsRUFBd0QsbUJBQXhELEVBQW1FLDBCQUFuRSxFQUFxRiw2QkFBckYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUVILFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixFQUEwRCxJQUExRCxDQUFBLENBQUE7QUFBQSxRQUVBLGVBQUEsR0FBa0IsR0FGbEIsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixFQUF5RCxlQUF6RCxDQUhBLENBQUE7QUFBQSxRQUlBLGVBQUEsSUFBbUIsR0FKbkIsQ0FBQTtBQUFBLFFBS0EsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUxuQixDQUFBO0FBQUEsUUFNQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsQ0FOQSxDQUFBO0FBQUEsUUFPQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsbUJBQTFCLENBQThDLENBQUMsVUFQbEUsQ0FBQTtBQUFBLFFBUUEsS0FBQSxDQUFNLGdCQUFOLEVBQXdCLGlCQUF4QixDQUEwQyxDQUFDLGNBQTNDLENB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-paths/spec/issues/11-spec.coffee
