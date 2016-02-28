(function() {
  var buildIMECompositionEvent, buildTextInputEvent, triggerAutocompletion, _ref;

  _ref = require('./spec-helper'), triggerAutocompletion = _ref.triggerAutocompletion, buildIMECompositionEvent = _ref.buildIMECompositionEvent, buildTextInputEvent = _ref.buildTextInputEvent;

  describe('FuzzyProvider', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, _ref1;
    _ref1 = [], completionDelay = _ref1[0], editorView = _ref1[1], editor = _ref1[2], mainModule = _ref1[3], autocompleteManager = _ref1[4];
    beforeEach(function() {
      var workspaceElement;
      atom.config.set('autocomplete-plus.enableAutoActivation', true);
      atom.config.set('autocomplete-plus.defaultProvider', 'Fuzzy');
      completionDelay = 100;
      atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
      completionDelay += 100;
      workspaceElement = atom.views.getView(atom.workspace);
      return jasmine.attachToDOM(workspaceElement);
    });
    return describe('when auto-activation is enabled', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return Promise.all([
            atom.packages.activatePackage("language-javascript"), atom.workspace.open('sample.js').then(function(e) {
              return editor = e;
            }), atom.packages.activatePackage('autocomplete-plus').then(function(a) {
              return mainModule = a.mainModule;
            })
          ]);
        });
        return runs(function() {
          autocompleteManager = mainModule.autocompleteManager;
          advanceClock(mainModule.autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
          return editorView = atom.views.getView(editor);
        });
      });
      it('adds words to the wordlist after they have been written', function() {
        var provider;
        editor.moveToBottom();
        editor.moveToBeginningOfLine();
        provider = autocompleteManager.providerManager.defaultProvider;
        expect(provider.tokenList.getToken('somethingNew')).toBeUndefined();
        editor.insertText('somethingNew');
        return expect(provider.tokenList.getToken('somethingNew')).toBe('somethingNew');
      });
      it('removes words that are no longer in the buffer', function() {
        var provider;
        editor.moveToBottom();
        editor.moveToBeginningOfLine();
        provider = autocompleteManager.providerManager.defaultProvider;
        expect(provider.tokenList.getToken('somethingNew')).toBeUndefined();
        editor.insertText('somethingNew');
        expect(provider.tokenList.getToken('somethingNew')).toBe('somethingNew');
        editor.backspace();
        expect(provider.tokenList.getToken('somethingNew')).toBe(void 0);
        return expect(provider.tokenList.getToken('somethingNe')).toBe('somethingNe');
      });
      it("adds completions from editor.completions", function() {
        var bufferPosition, prefix, provider, results, scopeDescriptor;
        provider = autocompleteManager.providerManager.defaultProvider;
        atom.config.set('editor.completions', ['abcd', 'abcde', 'abcdef'], {
          scopeSelector: '.source.js'
        });
        editor.moveToBottom();
        editor.insertText('ab');
        bufferPosition = editor.getLastCursor().getBufferPosition();
        scopeDescriptor = editor.getRootScopeDescriptor();
        prefix = 'ab';
        results = provider.getSuggestions({
          editor: editor,
          bufferPosition: bufferPosition,
          scopeDescriptor: scopeDescriptor,
          prefix: prefix
        });
        return expect(results[0].text).toBe('abcd');
      });
      it("adds completions from settings", function() {
        var bufferPosition, prefix, provider, results, scopeDescriptor;
        provider = autocompleteManager.providerManager.defaultProvider;
        atom.config.set('editor.completions', {
          builtin: {
            suggestions: ['nope']
          }
        }, {
          scopeSelector: '.source.js'
        });
        editor.moveToBottom();
        editor.insertText('ab');
        bufferPosition = editor.getLastCursor().getBufferPosition();
        scopeDescriptor = editor.getRootScopeDescriptor();
        prefix = 'ab';
        results = provider.getSuggestions({
          editor: editor,
          bufferPosition: bufferPosition,
          scopeDescriptor: scopeDescriptor,
          prefix: prefix
        });
        return expect(results).toBeUndefined();
      });
      xit('adds words to the wordlist with unicode characters', function() {
        var provider;
        provider = autocompleteManager.providerManager.defaultProvider;
        expect(provider.tokenList.indexOf('somēthingNew')).toEqual(-1);
        editor.insertText('somēthingNew');
        editor.insertText(' ');
        return expect(provider.tokenList.indexOf('somēthingNew')).not.toEqual(-1);
      });
      return xit('removes words from the wordlist when they no longer exist in any open buffers', function() {
        var provider, _i;
        provider = autocompleteManager.providerManager.defaultProvider;
        expect(provider.tokenList.indexOf('bogos')).toEqual(-1);
        editor.insertText('bogos = 1');
        editor.insertText(' ');
        expect(provider.tokenList.indexOf('bogos')).not.toEqual(-1);
        expect(provider.tokenList.indexOf('bogus')).toEqual(-1);
        for (_i = 1; _i <= 7; _i++) {
          editor.backspace();
        }
        editor.insertText('us = 1');
        editor.insertText(' ');
        expect(provider.tokenList.indexOf('bogus')).not.toEqual(-1);
        return expect(provider.tokenList.indexOf('bogos')).toEqual(-1);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2Z1enp5LXByb3ZpZGVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBOztBQUFBLEVBQUEsT0FBeUUsT0FBQSxDQUFRLGVBQVIsQ0FBekUsRUFBQyw2QkFBQSxxQkFBRCxFQUF3QixnQ0FBQSx3QkFBeEIsRUFBa0QsMkJBQUEsbUJBQWxELENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSwyRUFBQTtBQUFBLElBQUEsUUFBeUUsRUFBekUsRUFBQywwQkFBRCxFQUFrQixxQkFBbEIsRUFBOEIsaUJBQTlCLEVBQXNDLHFCQUF0QyxFQUFrRCw4QkFBbEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUVULFVBQUEsZ0JBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsRUFBMEQsSUFBMUQsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUNBQWhCLEVBQXFELE9BQXJELENBREEsQ0FBQTtBQUFBLE1BSUEsZUFBQSxHQUFrQixHQUpsQixDQUFBO0FBQUEsTUFLQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLEVBQXlELGVBQXpELENBTEEsQ0FBQTtBQUFBLE1BTUEsZUFBQSxJQUFtQixHQU5uQixDQUFBO0FBQUEsTUFRQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBUm5CLENBQUE7YUFTQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsRUFYUztJ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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/fuzzy-provider-spec.coffee
