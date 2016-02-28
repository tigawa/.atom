(function() {
  var MockDeprecation, grim, triggerAutocompletion, waitForAutocomplete, _ref;

  _ref = require('./spec-helper'), waitForAutocomplete = _ref.waitForAutocomplete, triggerAutocompletion = _ref.triggerAutocompletion;

  grim = require('grim');

  MockDeprecation = (function() {
    function MockDeprecation(message) {
      this.message = message;
    }

    MockDeprecation.prototype.getMessage = function() {
      return this.message;
    };

    return MockDeprecation;

  })();

  describe('Provider API Legacy', function() {
    var autocompleteManager, completionDelay, editor, mainModule, registration, testProvider, _ref1;
    _ref1 = [], completionDelay = _ref1[0], editor = _ref1[1], mainModule = _ref1[2], autocompleteManager = _ref1[3], registration = _ref1[4], testProvider = _ref1[5];
    beforeEach(function() {
      runs(function() {
        var deprecations, workspaceElement;
        deprecations = [];
        spyOn(grim, 'deprecate').andCallFake(function(message) {
          return deprecations.push(new MockDeprecation(message));
        });
        spyOn(grim, 'getDeprecationsLength').andCallFake(function() {
          return deprecations.length;
        });
        spyOn(grim, 'getDeprecations').andCallFake(function() {
          return deprecations;
        });
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('editor.fontSize', '16');
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
      });
      waitsForPromise(function() {
        return Promise.all([
          atom.packages.activatePackage('language-javascript'), atom.workspace.open('sample.js').then(function(e) {
            return editor = e;
          }), atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            return mainModule = a.mainModule;
          })
        ]);
      });
      return waitsFor(function() {
        return autocompleteManager = mainModule.autocompleteManager;
      });
    });
    afterEach(function() {
      if ((registration != null ? registration.dispose : void 0) != null) {
        if (registration != null) {
          registration.dispose();
        }
      }
      registration = null;
      if ((testProvider != null ? testProvider.dispose : void 0) != null) {
        if (testProvider != null) {
          testProvider.dispose();
        }
      }
      return testProvider = null;
    });
    describe('Provider with API v1.0 registered as 2.0', function() {
      it("raises deprecations for provider attributes on registration", function() {
        var SampleProvider, deprecation, deprecations, numberDeprecations;
        numberDeprecations = grim.getDeprecationsLength();
        SampleProvider = (function() {
          function SampleProvider() {}

          SampleProvider.prototype.id = 'sample-provider';

          SampleProvider.prototype.selector = '.source.js,.source.coffee';

          SampleProvider.prototype.blacklist = '.comment';

          SampleProvider.prototype.requestHandler = function(options) {
            return [
              {
                word: 'ohai',
                prefix: 'ohai'
              }
            ];
          };

          return SampleProvider;

        })();
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', new SampleProvider);
        expect(grim.getDeprecationsLength() - numberDeprecations).toBe(3);
        deprecations = grim.getDeprecations();
        deprecation = deprecations[deprecations.length - 3];
        expect(deprecation.getMessage()).toContain('`id`');
        expect(deprecation.getMessage()).toContain('SampleProvider');
        deprecation = deprecations[deprecations.length - 2];
        expect(deprecation.getMessage()).toContain('`requestHandler`');
        deprecation = deprecations[deprecations.length - 1];
        return expect(deprecation.getMessage()).toContain('`blacklist`');
      });
      it("raises deprecations when old API parameters are used in the 2.0 API", function() {
        var SampleProvider, numberDeprecations;
        SampleProvider = (function() {
          function SampleProvider() {}

          SampleProvider.prototype.selector = '.source.js,.source.coffee';

          SampleProvider.prototype.getSuggestions = function(options) {
            return [
              {
                word: 'ohai',
                prefix: 'ohai',
                label: '<span style="color: red">ohai</span>',
                renderLabelAsHtml: true,
                className: 'ohai'
              }
            ];
          };

          return SampleProvider;

        })();
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', new SampleProvider);
        numberDeprecations = grim.getDeprecationsLength();
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var deprecation, deprecations;
          expect(grim.getDeprecationsLength() - numberDeprecations).toBe(3);
          deprecations = grim.getDeprecations();
          deprecation = deprecations[deprecations.length - 3];
          expect(deprecation.getMessage()).toContain('`word`');
          expect(deprecation.getMessage()).toContain('SampleProvider');
          deprecation = deprecations[deprecations.length - 2];
          expect(deprecation.getMessage()).toContain('`prefix`');
          deprecation = deprecations[deprecations.length - 1];
          return expect(deprecation.getMessage()).toContain('`label`');
        });
      });
      return it("raises deprecations when hooks are passed via each suggestion", function() {
        var SampleProvider, numberDeprecations;
        SampleProvider = (function() {
          function SampleProvider() {}

          SampleProvider.prototype.selector = '.source.js,.source.coffee';

          SampleProvider.prototype.getSuggestions = function(options) {
            return [
              {
                text: 'ohai',
                replacementPrefix: 'ohai',
                onWillConfirm: function() {},
                onDidConfirm: function() {}
              }
            ];
          };

          return SampleProvider;

        })();
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', new SampleProvider);
        numberDeprecations = grim.getDeprecationsLength();
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var deprecation, deprecations;
          expect(grim.getDeprecationsLength() - numberDeprecations).toBe(2);
          deprecations = grim.getDeprecations();
          deprecation = deprecations[deprecations.length - 2];
          expect(deprecation.getMessage()).toContain('`onWillConfirm`');
          expect(deprecation.getMessage()).toContain('SampleProvider');
          deprecation = deprecations[deprecations.length - 1];
          return expect(deprecation.getMessage()).toContain('`onDidConfirm`');
        });
      });
    });
    describe('Provider API v1.1.0', function() {
      return it('registers the provider specified by {providers: [provider]}', function() {
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        testProvider = {
          selector: '.source.js,.source.coffee',
          requestHandler: function(options) {
            return [
              {
                word: 'ohai',
                prefix: 'ohai'
              }
            ];
          }
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.1.0', {
          providers: [testProvider]
        });
        return expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
      });
    });
    return describe('Provider API v1.0.0', function() {
      var registration1, registration2, registration3, _ref2;
      _ref2 = [], registration1 = _ref2[0], registration2 = _ref2[1], registration3 = _ref2[2];
      afterEach(function() {
        if (registration1 != null) {
          registration1.dispose();
        }
        if (registration2 != null) {
          registration2.dispose();
        }
        return registration3 != null ? registration3.dispose() : void 0;
      });
      it('passes the correct parameters to requestHandler', function() {
        testProvider = {
          selector: '.source.js,.source.coffee',
          requestHandler: function(options) {
            return [
              {
                word: 'ohai',
                prefix: 'ohai'
              }
            ];
          }
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', {
          provider: testProvider
        });
        spyOn(testProvider, 'requestHandler');
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var args;
          args = testProvider.requestHandler.mostRecentCall.args[0];
          expect(args.editor).toBeDefined();
          expect(args.buffer).toBeDefined();
          expect(args.cursor).toBeDefined();
          expect(args.position).toBeDefined();
          expect(args.scope).toBeDefined();
          expect(args.scopeChain).toBeDefined();
          return expect(args.prefix).toBeDefined();
        });
      });
      it('should allow registration of a provider', function() {
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        testProvider = {
          requestHandler: function(options) {
            return [
              {
                word: 'ohai',
                prefix: 'ohai',
                label: '<span style="color: red">ohai</span>',
                renderLabelAsHtml: true,
                className: 'ohai'
              }
            ];
          },
          selector: '.source.js,.source.coffee'
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', {
          provider: testProvider
        });
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(2);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(testProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(testProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.go')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var suggestionListView;
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          expect(suggestionListView.querySelector('li .right-label')).toHaveHtml('<span style="color: red">ohai</span>');
          return expect(suggestionListView.querySelector('li')).toHaveClass('ohai');
        });
      });
      it('should dispose a provider registration correctly', function() {
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        testProvider = {
          requestHandler: function(options) {
            return [
              {
                word: 'ohai',
                prefix: 'ohai'
              }
            ];
          },
          selector: '.source.js,.source.coffee'
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', {
          provider: testProvider
        });
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(2);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(testProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(testProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.go')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        registration.dispose();
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        registration.dispose();
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        return expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      });
      return it('should remove a providers registration if the provider is disposed', function() {
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        testProvider = {
          requestHandler: function(options) {
            return [
              {
                word: 'ohai',
                prefix: 'ohai'
              }
            ];
          },
          selector: '.source.js,.source.coffee',
          dispose: function() {}
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', {
          provider: testProvider
        });
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(2);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(testProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(testProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.go')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        testProvider.dispose();
        expect(autocompleteManager.providerManager.store).toBeDefined();
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee').length).toEqual(1);
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
        return expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3Byb3ZpZGVyLWFwaS1sZWdhY3ktc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUVBQUE7O0FBQUEsRUFBQSxPQUErQyxPQUFBLENBQVEsZUFBUixDQUEvQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLDZCQUFBLHFCQUF0QixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdNO0FBQ1MsSUFBQSx5QkFBRSxPQUFGLEdBQUE7QUFBWSxNQUFYLElBQUMsQ0FBQSxVQUFBLE9BQVUsQ0FBWjtJQUFBLENBQWI7O0FBQUEsOEJBQ0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxRQUFKO0lBQUEsQ0FEWixDQUFBOzsyQkFBQTs7TUFKRixDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLDJGQUFBO0FBQUEsSUFBQSxRQUF5RixFQUF6RixFQUFDLDBCQUFELEVBQWtCLGlCQUFsQixFQUEwQixxQkFBMUIsRUFBc0MsOEJBQXRDLEVBQTJELHVCQUEzRCxFQUF5RSx1QkFBekUsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsOEJBQUE7QUFBQSxRQUFBLFlBQUEsR0FBZSxFQUFmLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxJQUFOLEVBQVksV0FBWixDQUF3QixDQUFDLFdBQXpCLENBQXFDLFNBQUMsT0FBRCxHQUFBO2lCQUNuQyxZQUFZLENBQUMsSUFBYixDQUFzQixJQUFBLGVBQUEsQ0FBZ0IsT0FB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/provider-api-legacy-spec.coffee
