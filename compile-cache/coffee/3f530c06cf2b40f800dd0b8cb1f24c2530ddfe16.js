(function() {
  var waitForAutocomplete;

  waitForAutocomplete = require('./spec-helper').waitForAutocomplete;

  describe('Autocomplete', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, _ref;
    _ref = [], completionDelay = _ref[0], editorView = _ref[1], editor = _ref[2], autocompleteManager = _ref[3], mainModule = _ref[4];
    beforeEach(function() {
      runs(function() {
        var workspaceElement;
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('autocomplete-plus.fileBlacklist', ['.*', '*.md']);
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
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
      runs(function() {
        return autocompleteManager = mainModule.autocompleteManager;
      });
      return runs(function() {
        editorView = atom.views.getView(editor);
        return advanceClock(mainModule.autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
      });
    });
    describe('@activate()', function() {
      return it('activates autocomplete and initializes AutocompleteManager', function() {
        return runs(function() {
          expect(autocompleteManager).toBeDefined();
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
    return describe('@deactivate()', function() {
      return it('removes all autocomplete views', function() {
        return runs(function() {
          var buffer;
          buffer = editor.getBuffer();
          editor.moveToBottom();
          editor.insertText('A');
          waitForAutocomplete();
          return runs(function() {
            editorView = editorView;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            atom.packages.deactivatePackage('autocomplete-plus');
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL21haW4tc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLGVBQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLDBFQUFBO0FBQUEsSUFBQSxPQUF5RSxFQUF6RSxFQUFDLHlCQUFELEVBQWtCLG9CQUFsQixFQUE4QixnQkFBOUIsRUFBc0MsNkJBQXRDLEVBQTJELG9CQUEzRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBRUgsWUFBQSxnQkFBQTtBQUFBLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixFQUEwRCxJQUExRCxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsRUFBbUQsQ0FBQyxJQUFELEVBQU8sTUFBUCxDQUFuRCxDQURBLENBQUE7QUFBQSxRQUlBLGVBQUEsR0FBa0IsR0FKbEIsQ0FBQTtBQUFBLFFBS0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixFQUF5RCxlQUF6RCxDQUxBLENBQUE7QUFBQSxRQU1BLGVBQUEsSUFBbUIsR0FObkIsQ0FBQTtBQUFBLFFBUUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQVJuQixDQUFBO2VBU0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLEVBWEc7TUFBQSxDQUFM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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/main-spec.coffee
