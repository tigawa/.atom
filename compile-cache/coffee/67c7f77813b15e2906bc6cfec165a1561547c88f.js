(function() {
  describe('AutocompleteSnippets', function() {
    var completionDelay, editor, editorView, _ref;
    _ref = [], completionDelay = _ref[0], editor = _ref[1], editorView = _ref[2];
    beforeEach(function() {
      var autocompleteManager, snippetsMainModule, workspaceElement;
      atom.config.set('autocomplete-plus.enableAutoActivation', true);
      completionDelay = 100;
      atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
      completionDelay += 100;
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      snippetsMainModule = null;
      autocompleteManager = null;
      waitsForPromise(function() {
        return Promise.all([
          atom.workspace.open('sample.js').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          }), atom.packages.activatePackage('language-javascript'), atom.packages.activatePackage('autocomplete-snippets'), atom.packages.activatePackage('autocomplete-plus').then(function(pack) {
            return autocompleteManager = pack.mainModule.getAutocompleteManager();
          }), atom.packages.activatePackage('snippets').then(function(_arg) {
            var mainModule;
            mainModule = _arg.mainModule;
            snippetsMainModule = mainModule;
            return snippetsMainModule.loaded = false;
          })
        ]);
      });
      waitsFor('snippets provider to be registered', 1000, function() {
        return (autocompleteManager != null ? autocompleteManager.providerManager.providers.length : void 0) > 0;
      });
      return waitsFor('all snippets to load', 3000, function() {
        return snippetsMainModule.loaded;
      });
    });
    describe('when autocomplete-plus is enabled', function() {
      it('shows autocompletions when there are snippets available', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('D');
          editor.insertText('o');
          return advanceClock(completionDelay);
        });
        waitsFor('autocomplete view to appear', 1000, function() {
          return editorView.querySelector('.autocomplete-plus span.word');
        });
        return runs(function() {
          expect(editorView.querySelector('.autocomplete-plus span.word')).toHaveText('do');
          return expect(editorView.querySelector('.autocomplete-plus span.right-label')).toHaveText('do');
        });
      });
      return it("expands the snippet on confirm", function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('D');
          editor.insertText('o');
          return advanceClock(completionDelay);
        });
        waitsFor('autocomplete view to appear', 1000, function() {
          return editorView.querySelector('.autocomplete-plus');
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return expect(editor.getText()).toContain('} while (true);');
        });
      });
    });
    return describe('when showing suggestions', function() {
      return it('sorts them in alphabetical order', function() {
        var SnippetsProvider, snippets, sp, suggestions, suggestionsText, unorderedPrefixes, x, _i, _len;
        unorderedPrefixes = ["", "dop", "do", "dad", "d"];
        snippets = {};
        for (_i = 0, _len = unorderedPrefixes.length; _i < _len; _i++) {
          x = unorderedPrefixes[_i];
          snippets[x] = {
            prefix: x,
            name: "",
            description: "",
            descriptionMoreURL: ""
          };
        }
        SnippetsProvider = require('../lib/snippets-provider');
        sp = new SnippetsProvider();
        sp.setSnippetsSource({
          snippetsForScopes: function(scope) {
            return snippets;
          }
        });
        suggestions = sp.getSuggestions({
          scopeDescriptor: "",
          prefix: "d"
        });
        suggestionsText = suggestions.map(function(x) {
          return x.text;
        });
        return expect(suggestionsText).toEqual(["d", "dad", "do", "dop"]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc25pcHBldHMvc3BlYy9hdXRvY29tcGxldGUtc25pcHBldHMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtBQUMvQixRQUFBLHlDQUFBO0FBQUEsSUFBQSxPQUF3QyxFQUF4QyxFQUFDLHlCQUFELEVBQWtCLGdCQUFsQixFQUEwQixvQkFBMUIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEseURBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsRUFBMEQsSUFBMUQsQ0FBQSxDQUFBO0FBQUEsTUFDQSxlQUFBLEdBQWtCLEdBRGxCLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsRUFBeUQsZUFBekQsQ0FGQSxDQUFBO0FBQUEsTUFHQSxlQUFBLElBQW1CLEdBSG5CLENBQUE7QUFBQSxNQUtBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FMbkIsQ0FBQTtBQUFBLE1BTUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLENBTkEsQ0FBQTtBQUFBLE1BUUEsa0JBQUEsR0FBcUIsSUFSckIsQ0FBQTtBQUFBLE1BU0EsbUJBQUEsR0FBc0IsSUFUdEIsQ0FBQTtBQUFBLE1BV0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxPQUFPLENBQUMsR0FBUixDQUFZO1VBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFdBQXBCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsU0FB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-snippets/spec/autocomplete-snippets-spec.coffee
