(function() {
  var waitForAutocomplete;

  waitForAutocomplete = require('./spec-helper').waitForAutocomplete;

  describe('Async providers', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, registration, _ref;
    _ref = [], completionDelay = _ref[0], editorView = _ref[1], editor = _ref[2], mainModule = _ref[3], autocompleteManager = _ref[4], registration = _ref[5];
    beforeEach(function() {
      runs(function() {
        var workspaceElement;
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('editor.fontSize', '16');
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
      return waitsFor(function() {
        return autocompleteManager = mainModule.autocompleteManager;
      });
    });
    afterEach(function() {
      return registration != null ? registration.dispose() : void 0;
    });
    describe('when an async provider is registered', function() {
      beforeEach(function() {
        var testAsyncProvider;
        testAsyncProvider = {
          getSuggestions: function(options) {
            return new Promise(function(resolve) {
              return setTimeout(function() {
                return resolve([
                  {
                    text: 'asyncProvided',
                    replacementPrefix: 'asyncProvided',
                    rightLabel: 'asyncProvided'
                  }
                ]);
              }, 10);
            });
          },
          selector: '.source.js'
        };
        return registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testAsyncProvider);
      });
      return it('should provide completions when a provider returns a promise that results in an array of suggestions', function() {
        editor.moveToBottom();
        editor.insertText('o');
        waitForAutocomplete();
        return runs(function() {
          var suggestionListView;
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          return expect(suggestionListView.querySelector('li .right-label')).toHaveText('asyncProvided');
        });
      });
    });
    return describe('when a provider takes a long time to provide suggestions', function() {
      beforeEach(function() {
        var testAsyncProvider;
        testAsyncProvider = {
          selector: '.source.js',
          getSuggestions: function(options) {
            return new Promise(function(resolve) {
              return setTimeout(function() {
                return resolve([
                  {
                    text: 'asyncProvided',
                    replacementPrefix: 'asyncProvided',
                    rightLabel: 'asyncProvided'
                  }
                ]);
              }, 1000);
            });
          }
        };
        return registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testAsyncProvider);
      });
      return it('does not show the suggestion list when it is triggered then no longer needed', function() {
        runs(function() {
          editorView = atom.views.getView(editor);
          editor.moveToBottom();
          editor.insertText('o');
          return advanceClock(autocompleteManager.suggestionDelay * 2);
        });
        waits(0);
        runs(function() {
          editor.insertText('\r');
          waitForAutocomplete();
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          return advanceClock(1000);
        });
        waits(0);
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLWFzeW5jLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxlQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsd0ZBQUE7QUFBQSxJQUFBLE9BQXVGLEVBQXZGLEVBQUMseUJBQUQsRUFBa0Isb0JBQWxCLEVBQThCLGdCQUE5QixFQUFzQyxvQkFBdEMsRUFBa0QsNkJBQWxELEVBQXVFLHNCQUF2RSxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBRUgsWUFBQSxnQkFBQTtBQUFBLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixFQUEwRCxJQUExRCxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQkFBaEIsRUFBbUMsSUFBbkMsQ0FEQSxDQUFBO0FBQUEsUUFJQSxlQUFBLEdBQWtCLEdBSmxCLENBQUE7QUFBQSxRQUtBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsRUFBeUQsZUFBekQsQ0FMQSxDQUFBO0FBQUEsUUFNQSxlQUFBLElBQW1CLEdBTm5CLENBQUE7QUFBQSxRQVFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FSbkIsQ0FBQTtlQVNBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFw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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/autocomplete-manager-async-spec.coffee
