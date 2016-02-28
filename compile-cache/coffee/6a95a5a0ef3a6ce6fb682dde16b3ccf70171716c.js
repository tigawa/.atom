(function() {
  var waitForAutocomplete;

  waitForAutocomplete = require('./spec-helper').waitForAutocomplete;

  describe('Autocomplete Manager', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, _ref;
    _ref = [], completionDelay = _ref[0], editorView = _ref[1], editor = _ref[2], mainModule = _ref[3], autocompleteManager = _ref[4];
    beforeEach(function() {
      return runs(function() {
        var workspaceElement;
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('editor.fontSize', '16');
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
      });
    });
    return describe('Undo a completion', function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', true);
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.js').then(function(e) {
            return editor = e;
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
          var _ref1;
          return (_ref1 = mainModule.autocompleteManager) != null ? _ref1.ready : void 0;
        });
        return runs(function() {
          autocompleteManager = mainModule.autocompleteManager;
          return advanceClock(autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
        });
      });
      return it('restores the previous state', function() {
        editor.moveToBottom();
        editor.moveToBeginningOfLine();
        editor.insertText('f');
        waitForAutocomplete();
        return runs(function() {
          editorView = atom.views.getView(editor);
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          expect(editor.getBuffer().getLastLine()).toEqual('function');
          editor.undo();
          return expect(editor.getBuffer().getLastLine()).toEqual('f');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLXVuZG8tc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLGVBQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSwwRUFBQTtBQUFBLElBQUEsT0FBeUUsRUFBekUsRUFBQyx5QkFBRCxFQUFrQixvQkFBbEIsRUFBOEIsZ0JBQTlCLEVBQXNDLG9CQUF0QyxFQUFrRCw2QkFBbEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFFSCxZQUFBLGdCQUFBO0FBQUEsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLEVBQTBELElBQTFELENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixFQUFtQyxJQUFuQyxDQURBLENBQUE7QUFBQSxRQUlBLGVBQUEsR0FBa0IsR0FKbEIsQ0FBQTtBQUFBLFFBS0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixFQUF5RCxlQUF6RCxDQUxBLENBQUE7QUFBQSxRQU1BLGVBQUEsSUFBbUIsR0FObkIsQ0FBQTtBQUFBLFFBUUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQVJuQixDQUFBO2VBU0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLEVBWEc7TUFBQSxDQUFMLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQWdCQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLEVBQTBELElBQTFELEVBREc7UUFBQSxDQUFMLENBQUEsQ0FBQTtBQUFBLFFBR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFdBQXBCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsU0FBQyxDQUFELEdBQUE7bUJBQ3ZELE1BQUEsR0FBUyxFQUQ4QztVQUFBLENBQXRDLEVBQUg7UUFBQSxDQUFoQixDQUhBLENBQUE7QUFBQSxRQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixxQkFBOUIsRUFEYztRQUFBLENBQWhCLENBTkEsQ0FBQTtBQUFBLFFBVUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLG1CQUE5QixDQUFrRCxDQUFDLElBQW5ELENBQXdELFNBQUMsQ0FBRCxHQUFBO21CQUN6RSxVQUFBLEdBQWEsQ0FBQyxDQUFDLFdBRDBEO1VBQUEsQ0FBeEQsRUFBSDtRQUFBLENBQWhCLENBVkEsQ0FBQTtBQUFBLFFBYUEsUUFBQSxDQUFTLFNBQUEsR0FBQTtBQUNQLGNBQUEsS0FBQTt5RUFBOEIsQ0FBRSxlQUR6QjtRQUFBLENBQVQsQ0FiQSxDQUFBO2VBZ0JBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLG1CQUFBLEdBQXNCLFVBQVUsQ0FBQyxtQkFBakMsQ0FBQTtpQkFDQSxZQUFBLENBQWEsbUJBQW1CLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQywwQkFBakUsRUFGRztRQUFBLENBQUwsRUFqQlM7TUFBQSxDQUFYLENBQUEsQ0FBQTthQXFCQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQSxHQUFBO0FBR2hDLFFBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FGQSxDQUFBO0FBQUEsUUFJQSxtQkFBQSxDQUFBLENBSkEsQ0FBQTtlQU1BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFFSCxVQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBYixDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsVUFBdkIsRUFBbUMsMkJBQW5DLENBREEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBa0IsQ0FBQyxXQUFuQixDQUFBLENBQVAsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxVQUFqRCxDQUhBLENBQUE7QUFBQSxVQUtBLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FMQSxDQUFBO2lCQU9BLE1BQUEsQ0FBTyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsV0FBbkIsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsR0FBakQsRUFURztRQUFBLENBQUwsRUFUZ0M7TUFBQSxDQUFsQyxFQXRCNEI7SUFBQSxDQUE5QixFQWpCK0I7RUFBQSxDQUFqQyxDQUZBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/autocomplete-manager-undo-spec.coffee
