(function() {
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
    return describe('when opening a large file', function() {
      return it('provides suggestions in a timely way', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('h');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        runs(function() {
          editor.insertText('t');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 2;
        });
        runs(function() {
          editor.insertText('t');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 3;
        });
        runs(function() {
          editor.insertText('p');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 4;
        });
        runs(function() {
          editor.insertText('s');
          return advanceClock(completionDelay);
        });
        return waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 5;
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvc3BlYy9sYXJnZS1maWxlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsUUFBQSw2R0FBQTtBQUFBLElBQUEsT0FBNEcsRUFBNUcsRUFBQywwQkFBRCxFQUFtQix5QkFBbkIsRUFBb0MsZ0JBQXBDLEVBQTRDLG9CQUE1QyxFQUF3RCxtQkFBeEQsRUFBbUUsMEJBQW5FLEVBQXFGLDZCQUFyRixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBRUgsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLEVBQTBELElBQTFELENBQUEsQ0FBQTtBQUFBLFFBRUEsZUFBQSxHQUFrQixHQUZsQixDQUFBO0FBQUEsUUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLEVBQXlELGVBQXpELENBSEEsQ0FBQTtBQUFBLFFBSUEsZUFBQSxJQUFtQixHQUpuQixDQUFBO0FBQUEsUUFLQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBTG5CLENBQUE7QUFBQSxRQU1BLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQU5BLENBQUE7QUFBQSxRQU9BLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixtQkFBMUIsQ0FBOEMsQ0FBQyxVQVBsRSxDQUFBO0FBQUEsUUFRQSxLQUFBLENBQU0sZ0JBQU4sRUFBd0IsaUJBQXhCLENBQTBDLENBQUMsY0FBM0MsQ0FBQSxDQVJBLENBQUE7QUFBQSxRQVNBLFNBQUEsR0FBWSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsb0JBQTFCLENBQStDLENBQUMsVUFUNUQsQ0FBQTtlQVVBLEtBQUEsQ0FBTSxTQUFOLEVBQWlCLFNBQWpCLENBQTJCLENBQUMsY0FBNUIsQ0FBQSxFQVpHO01BQUEsQ0FBTCxDQUFBLENBQUE7QUFBQSxNQWNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEVBQXBCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsU0FBQyxDQUFELEdBQUE7QUFDM0IsVUFBQSxNQUFBLEdBQVMsQ0FBVCxDQUFBO2lCQUNBLFVBQUEsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsRUFGYztRQUFBLENBQTdCLEVBRGM7TUFBQSxDQUFoQixDQWRBLENBQUE7QUFBQSxNQW1CQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixxQkFBOUIsRUFEYztNQUFBLENBQWhCLENBbkJBLENBQUE7QUFBQSxNQXNCQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixtQkFBOUIsRUFEYztNQUFBLENBQWhCLENBdEJBLENBQUE7QUFBQSxNQXlCQSxRQUFBLENBQVMsU0FBQSxHQUFBO0FBQ1AsWUFBQSxLQUFBOzZFQUFvQyxDQUFFLGVBRC9CO01BQUEsQ0FBVCxDQXpCQSxDQUFBO0FBQUEsTUE0QkEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsbUJBQUEsR0FBc0IsZ0JBQWdCLENBQUMsbUJBQXZDLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxtQkFBTixFQUEyQixpQkFBM0IsQ0FBNkMsQ0FBQyxjQUE5QyxDQUFBLENBREEsQ0FBQTtBQUFBLFFBRUEsS0FBQSxDQUFNLG1CQUFOLEVBQTJCLG9CQUEzQixDQUFnRCxDQUFDLGNBQWpELENBQUEsQ0FGQSxDQUFBO0FBQUEsUUFHQSxLQUFBLENBQU0sbUJBQU4sRUFBMkIsb0JBQTNCLENBQWdELENBQUMsY0FBakQsQ0FBQSxDQUhBLENBQUE7ZUFJQSxLQUFBLENBQU0sbUJBQU4sRUFBMkIsb0JBQTNCLENBQWdELENBQUMsY0FBakQsQ0FBQSxFQUxHO01BQUEsQ0FBTCxDQTVCQSxDQUFBO0FBQUEsTUFtQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsb0JBQTlCLEVBRGM7TUFBQSxDQUFoQixDQW5DQSxDQUFBO0FBQUEsTUFzQ0EsUUFBQSxDQUFTLFNBQUEsR0FBQTtlQUNQLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQXhCLEtBQWtDLEVBRDNCO01BQUEsQ0FBVCxDQXRDQSxDQUFBO2FBeUNBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7ZUFDUCxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQXZDLEtBQWlELEVBRDFDO01BQUEsQ0FBVCxFQTFDUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUErQ0EsU0FBQSxDQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxnQkFBZCxFQUFnQyxpQkFBaEMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsS0FBUixDQUFjLFNBQWQsRUFBeUIsU0FBekIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxPQUFPLENBQUMsS0FBUixDQUFjLG1CQUFkLEVBQW1DLGlCQUFuQyxDQUZBLENBQUE7QUFBQSxNQUdBLE9BQU8sQ0FBQyxLQUFSLENBQWMsbUJBQWQsRUFBbUMsb0JBQW5DLENBSEEsQ0FBQTtBQUFBLE1BSUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxtQkFBZCxFQUFtQyxvQkFBbkMsQ0FKQSxDQUFBO2FBS0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxtQkFBZCxFQUFtQyxvQkFBbkMsRUFOUTtJQUFBLENBQVYsQ0EvQ0EsQ0FBQTtXQXVEQSxRQUFBLENBQVMsMkJBQVQsRUFBc0MsU0FBQSxHQUFBO2FBQ3BDLEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBLEdBQUE7QUFDekMsUUFBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFBLENBQU8sVUFBVSxDQUFDLGFBQVgsQ0FBeUIsb0JBQXpCLENBQVAsQ0FBc0QsQ0FBQyxHQUFHLENBQUMsT0FBM0QsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQUhBLENBQUE7aUJBSUEsWUFBQSxDQUFhLGVBQWIsRUFMRztRQUFBLENBQUwsQ0FBQSxDQUFBO0FBQUEsUUFPQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUNQLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxNQUE3QyxLQUF1RCxFQURoRDtRQUFBLENBQVQsQ0FQQSxDQUFBO0FBQUEsUUFVQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQUFBLENBQUE7aUJBQ0EsWUFBQSxDQUFhLGVBQWIsRUFGRztRQUFBLENBQUwsQ0FWQSxDQUFBO0FBQUEsUUFjQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUNQLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxNQUE3QyxLQUF1RCxFQURoRDtRQUFBLENBQVQsQ0FkQSxDQUFBO0FBQUEsUUFpQkEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FBQSxDQUFBO2lCQUNBLFlBQUEsQ0FBYSxlQUFiLEVBRkc7UUFBQSxDQUFMLENBakJBLENBQUE7QUFBQSxRQXFCQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUNQLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxNQUE3QyxLQUF1RCxFQURoRDtRQUFBLENBQVQsQ0FyQkEsQ0FBQTtBQUFBLFFBd0JBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCLENBQUEsQ0FBQTtpQkFDQSxZQUFBLENBQWEsZUFBYixFQUZHO1FBQUEsQ0FBTCxDQXhCQSxDQUFBO0FBQUEsUUE0QkEsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFDUCxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsTUFBN0MsS0FBdUQsRUFEaEQ7UUFBQSxDQUFULENBNUJBLENBQUE7QUFBQSxRQStCQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQUFBLENBQUE7aUJBQ0EsWUFBQSxDQUFhLGVBQWIsRUFGRztRQUFBLENBQUwsQ0EvQkEsQ0FBQTtlQW1DQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUNQLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxNQUE3QyxLQUF1RCxFQURoRDtRQUFBLENBQVQsRUFwQ3lDO01BQUEsQ0FBM0MsRUFEb0M7SUFBQSxDQUF0QyxFQXhEZ0M7RUFBQSxDQUFsQyxDQUFBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-paths/spec/large-file-spec.coffee
