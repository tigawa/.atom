(function() {
  var ProviderManager, hasDisposable;

  ProviderManager = require('../lib/provider-manager');

  describe('Provider Manager', function() {
    var providerManager, registration, testProvider, _ref;
    _ref = [], providerManager = _ref[0], testProvider = _ref[1], registration = _ref[2];
    beforeEach(function() {
      atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
      providerManager = new ProviderManager();
      return testProvider = {
        getSuggestions: function(options) {
          return [
            {
              text: 'ohai',
              replacementPrefix: 'ohai'
            }
          ];
        },
        selector: '.source.js',
        dispose: function() {}
      };
    });
    afterEach(function() {
      if (registration != null) {
        if (typeof registration.dispose === "function") {
          registration.dispose();
        }
      }
      registration = null;
      if (testProvider != null) {
        if (typeof testProvider.dispose === "function") {
          testProvider.dispose();
        }
      }
      testProvider = null;
      if (providerManager != null) {
        providerManager.dispose();
      }
      return providerManager = null;
    });
    describe('when no providers have been registered, and enableBuiltinProvider is true', function() {
      beforeEach(function() {
        return atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
      });
      it('is constructed correctly', function() {
        expect(providerManager.providers).toBeDefined();
        expect(providerManager.subscriptions).toBeDefined();
        return expect(providerManager.defaultProvider).toBeDefined();
      });
      it('disposes correctly', function() {
        providerManager.dispose();
        expect(providerManager.providers).toBeNull();
        expect(providerManager.subscriptions).toBeNull();
        return expect(providerManager.defaultProvider).toBeNull();
      });
      it('registers the default provider for all scopes', function() {
        expect(providerManager.providersForScopeDescriptor('*').length).toBe(1);
        return expect(providerManager.providersForScopeDescriptor('*')[0]).toBe(providerManager.defaultProvider);
      });
      it('adds providers', function() {
        var apiVersion;
        expect(providerManager.isProviderRegistered(testProvider)).toEqual(false);
        expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(false);
        providerManager.addProvider(testProvider, '2.0.0');
        expect(providerManager.isProviderRegistered(testProvider)).toEqual(true);
        apiVersion = providerManager.apiVersionForProvider(testProvider);
        expect(apiVersion).toEqual('2.0.0');
        return expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(true);
      });
      it('removes providers', function() {
        expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
        expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(false);
        providerManager.addProvider(testProvider);
        expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
        expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(true);
        providerManager.removeProvider(testProvider);
        expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
        return expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(false);
      });
      it('can identify a provider with a missing getSuggestions', function() {
        var bogusProvider;
        bogusProvider = {
          badgetSuggestions: function(options) {},
          selector: '.source.js',
          dispose: function() {}
        };
        expect(providerManager.isValidProvider({}, '2.0.0')).toEqual(false);
        expect(providerManager.isValidProvider(bogusProvider, '2.0.0')).toEqual(false);
        return expect(providerManager.isValidProvider(testProvider, '2.0.0')).toEqual(true);
      });
      it('can identify a provider with an invalid getSuggestions', function() {
        var bogusProvider;
        bogusProvider = {
          getSuggestions: 'yo, this is a bad handler',
          selector: '.source.js',
          dispose: function() {}
        };
        expect(providerManager.isValidProvider({}, '2.0.0')).toEqual(false);
        expect(providerManager.isValidProvider(bogusProvider, '2.0.0')).toEqual(false);
        return expect(providerManager.isValidProvider(testProvider, '2.0.0')).toEqual(true);
      });
      it('can identify a provider with a missing selector', function() {
        var bogusProvider;
        bogusProvider = {
          getSuggestions: function(options) {},
          aSelector: '.source.js',
          dispose: function() {}
        };
        expect(providerManager.isValidProvider(bogusProvider, '2.0.0')).toEqual(false);
        return expect(providerManager.isValidProvider(testProvider, '2.0.0')).toEqual(true);
      });
      it('can identify a provider with an invalid selector', function() {
        var bogusProvider;
        bogusProvider = {
          getSuggestions: function(options) {},
          selector: '',
          dispose: function() {}
        };
        expect(providerManager.isValidProvider(bogusProvider, '2.0.0')).toEqual(false);
        expect(providerManager.isValidProvider(testProvider, '2.0.0')).toEqual(true);
        bogusProvider = {
          getSuggestions: function(options) {},
          selector: false,
          dispose: function() {}
        };
        return expect(providerManager.isValidProvider(bogusProvider, '2.0.0')).toEqual(false);
      });
      it('correctly identifies a 1.0 provider', function() {
        var bogusProvider, legitProvider;
        bogusProvider = {
          selector: '.source.js',
          requestHandler: 'yo, this is a bad handler',
          dispose: function() {}
        };
        expect(providerManager.isValidProvider({}, '1.0.0')).toEqual(false);
        expect(providerManager.isValidProvider(bogusProvider, '1.0.0')).toEqual(false);
        legitProvider = {
          selector: '.source.js',
          requestHandler: function() {},
          dispose: function() {}
        };
        return expect(providerManager.isValidProvider(legitProvider, '1.0.0')).toEqual(true);
      });
      it('registers a valid provider', function() {
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).toBe(-1);
        expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
        registration = providerManager.registerProvider(testProvider);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).not.toBe(-1);
        return expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
      });
      it('removes a registration', function() {
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).toBe(-1);
        expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
        registration = providerManager.registerProvider(testProvider);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).not.toBe(-1);
        expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
        registration.dispose();
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).toBe(-1);
        return expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
      });
      it('does not create duplicate registrations for the same scope', function() {
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).toBe(-1);
        expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
        registration = providerManager.registerProvider(testProvider);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).not.toBe(-1);
        expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
        registration = providerManager.registerProvider(testProvider);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).not.toBe(-1);
        expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
        registration = providerManager.registerProvider(testProvider);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).not.toBe(-1);
        return expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
      });
      it('does not register an invalid provider', function() {
        var bogusProvider;
        bogusProvider = {
          getSuggestions: 'yo, this is a bad handler',
          selector: '.source.js',
          dispose: function() {}
        };
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(bogusProvider)).toBe(-1);
        expect(providerManager.metadataForProvider(bogusProvider)).toBeFalsy();
        registration = providerManager.registerProvider(bogusProvider);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(bogusProvider)).toBe(-1);
        return expect(providerManager.metadataForProvider(bogusProvider)).toBeFalsy();
      });
      return it('registers a provider with a blacklist', function() {
        testProvider = {
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai',
                replacementPrefix: 'ohai'
              }
            ];
          },
          selector: '.source.js',
          disableForSelector: '.source.js .comment',
          dispose: function() {}
        };
        expect(providerManager.isValidProvider(testProvider, '2.0.0')).toEqual(true);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).toBe(-1);
        expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
        registration = providerManager.registerProvider(testProvider);
        expect(providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
        expect(providerManager.providersForScopeDescriptor('.source.js').indexOf(testProvider)).not.toBe(-1);
        return expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
      });
    });
    describe('when no providers have been registered, and enableBuiltinProvider is false', function() {
      beforeEach(function() {
        return atom.config.set('autocomplete-plus.enableBuiltinProvider', false);
      });
      return it('does not register the default provider for all scopes', function() {
        expect(providerManager.providersForScopeDescriptor('*').length).toBe(0);
        expect(providerManager.defaultProvider).toEqual(null);
        return expect(providerManager.defaultProviderRegistration).toEqual(null);
      });
    });
    describe('when providers have been registered', function() {
      var testProvider1, testProvider2, testProvider3, testProvider4, _ref1;
      _ref1 = [], testProvider1 = _ref1[0], testProvider2 = _ref1[1], testProvider3 = _ref1[2], testProvider4 = _ref1[3];
      beforeEach(function() {
        atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
        providerManager = new ProviderManager();
        testProvider1 = {
          selector: '.source.js',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai2',
                replacementPrefix: 'ohai2'
              }
            ];
          },
          dispose: function() {}
        };
        testProvider2 = {
          selector: '.source.js .variable.js',
          disableForSelector: '.source.js .variable.js .comment2',
          providerblacklist: {
            'autocomplete-plus-fuzzyprovider': '.source.js .variable.js .comment3'
          },
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai2',
                replacementPrefix: 'ohai2'
              }
            ];
          },
          dispose: function() {}
        };
        testProvider3 = {
          selector: '*',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai3',
                replacementPrefix: 'ohai3'
              }
            ];
          },
          dispose: function() {}
        };
        testProvider4 = {
          selector: '.source.js .comment',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai4',
                replacementPrefix: 'ohai4'
              }
            ];
          },
          dispose: function() {}
        };
        providerManager.registerProvider(testProvider1);
        providerManager.registerProvider(testProvider2);
        providerManager.registerProvider(testProvider3);
        return providerManager.registerProvider(testProvider4);
      });
      it('returns providers in the correct order for the given scope chain', function() {
        var defaultProvider, providers;
        defaultProvider = providerManager.defaultProvider;
        providers = providerManager.providersForScopeDescriptor('.source.other');
        expect(providers).toHaveLength(2);
        expect(providers[0]).toEqual(testProvider3);
        expect(providers[1]).toEqual(defaultProvider);
        providers = providerManager.providersForScopeDescriptor('.source.js');
        expect(providers).toHaveLength(3);
        expect(providers[0]).toEqual(testProvider1);
        expect(providers[1]).toEqual(testProvider3);
        expect(providers[2]).toEqual(defaultProvider);
        providers = providerManager.providersForScopeDescriptor('.source.js .comment');
        expect(providers).toHaveLength(4);
        expect(providers[0]).toEqual(testProvider4);
        expect(providers[1]).toEqual(testProvider1);
        expect(providers[2]).toEqual(testProvider3);
        expect(providers[3]).toEqual(defaultProvider);
        providers = providerManager.providersForScopeDescriptor('.source.js .variable.js');
        expect(providers).toHaveLength(4);
        expect(providers[0]).toEqual(testProvider2);
        expect(providers[1]).toEqual(testProvider1);
        expect(providers[2]).toEqual(testProvider3);
        expect(providers[3]).toEqual(defaultProvider);
        providers = providerManager.providersForScopeDescriptor('.source.js .other.js');
        expect(providers).toHaveLength(3);
        expect(providers[0]).toEqual(testProvider1);
        expect(providers[1]).toEqual(testProvider3);
        return expect(providers[2]).toEqual(defaultProvider);
      });
      it('does not return providers if the scopeChain exactly matches a global blacklist item', function() {
        expect(providerManager.providersForScopeDescriptor('.source.js .comment')).toHaveLength(4);
        atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.js .comment']);
        return expect(providerManager.providersForScopeDescriptor('.source.js .comment')).toHaveLength(0);
      });
      it('does not return providers if the scopeChain matches a global blacklist item with a wildcard', function() {
        expect(providerManager.providersForScopeDescriptor('.source.js .comment')).toHaveLength(4);
        atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.js *']);
        return expect(providerManager.providersForScopeDescriptor('.source.js .comment')).toHaveLength(0);
      });
      it('does not return providers if the scopeChain matches a global blacklist item with a wildcard one level of depth below the current scope', function() {
        expect(providerManager.providersForScopeDescriptor('.source.js .comment')).toHaveLength(4);
        atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.js *']);
        return expect(providerManager.providersForScopeDescriptor('.source.js .comment .other')).toHaveLength(0);
      });
      it('does return providers if the scopeChain does not match a global blacklist item with a wildcard', function() {
        expect(providerManager.providersForScopeDescriptor('.source.js .comment')).toHaveLength(4);
        atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.coffee *']);
        return expect(providerManager.providersForScopeDescriptor('.source.js .comment')).toHaveLength(4);
      });
      it('filters a provider if the scopeChain matches a provider blacklist item', function() {
        var defaultProvider, providers;
        defaultProvider = providerManager.defaultProvider;
        providers = providerManager.providersForScopeDescriptor('.source.js .variable.js .other.js');
        expect(providers).toHaveLength(4);
        expect(providers[0]).toEqual(testProvider2);
        expect(providers[1]).toEqual(testProvider1);
        expect(providers[2]).toEqual(testProvider3);
        expect(providers[3]).toEqual(defaultProvider);
        providers = providerManager.providersForScopeDescriptor('.source.js .variable.js .comment2.js');
        expect(providers).toHaveLength(3);
        expect(providers[0]).toEqual(testProvider1);
        expect(providers[1]).toEqual(testProvider3);
        return expect(providers[2]).toEqual(defaultProvider);
      });
      return it('filters a provider if the scopeChain matches a provider providerblacklist item', function() {
        var providers;
        providers = providerManager.providersForScopeDescriptor('.source.js .variable.js .other.js');
        expect(providers).toHaveLength(4);
        expect(providers[0]).toEqual(testProvider2);
        expect(providers[1]).toEqual(testProvider1);
        expect(providers[2]).toEqual(testProvider3);
        expect(providers[3]).toEqual(providerManager.defaultProvider);
        providers = providerManager.providersForScopeDescriptor('.source.js .variable.js .comment3.js');
        expect(providers).toHaveLength(3);
        expect(providers[0]).toEqual(testProvider2);
        expect(providers[1]).toEqual(testProvider1);
        return expect(providers[2]).toEqual(testProvider3);
      });
    });
    describe("when inclusion priorities are used", function() {
      var accessoryProvider1, accessoryProvider2, defaultProvider, mainProvider, verySpecificProvider, _ref1;
      _ref1 = [], accessoryProvider1 = _ref1[0], accessoryProvider2 = _ref1[1], verySpecificProvider = _ref1[2], mainProvider = _ref1[3], defaultProvider = _ref1[4];
      beforeEach(function() {
        atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
        providerManager = new ProviderManager();
        defaultProvider = providerManager.defaultProvider;
        accessoryProvider1 = {
          selector: '*',
          inclusionPriority: 2,
          getSuggestions: function(options) {},
          dispose: function() {}
        };
        accessoryProvider2 = {
          selector: '.source.js',
          inclusionPriority: 2,
          excludeLowerPriority: false,
          getSuggestions: function(options) {},
          dispose: function() {}
        };
        verySpecificProvider = {
          selector: '.source.js .comment',
          inclusionPriority: 2,
          excludeLowerPriority: true,
          getSuggestions: function(options) {},
          dispose: function() {}
        };
        mainProvider = {
          selector: '.source.js',
          inclusionPriority: 1,
          excludeLowerPriority: true,
          getSuggestions: function(options) {},
          dispose: function() {}
        };
        providerManager.registerProvider(accessoryProvider1);
        providerManager.registerProvider(accessoryProvider2);
        providerManager.registerProvider(verySpecificProvider);
        return providerManager.registerProvider(mainProvider);
      });
      it('returns the default provider and higher when nothing with a higher proirity is excluding the lower', function() {
        var providers;
        providers = providerManager.providersForScopeDescriptor('.source.coffee');
        expect(providers).toHaveLength(2);
        expect(providers[0]).toEqual(accessoryProvider1);
        return expect(providers[1]).toEqual(defaultProvider);
      });
      it('exclude the lower priority provider, the default, when one with a higher proirity excludes the lower', function() {
        var providers;
        providers = providerManager.providersForScopeDescriptor('.source.js');
        expect(providers).toHaveLength(3);
        expect(providers[0]).toEqual(accessoryProvider2);
        expect(providers[1]).toEqual(mainProvider);
        return expect(providers[2]).toEqual(accessoryProvider1);
      });
      return it('excludes the all lower priority providers when multiple providers of lower priority', function() {
        var providers;
        providers = providerManager.providersForScopeDescriptor('.source.js .comment');
        expect(providers).toHaveLength(3);
        expect(providers[0]).toEqual(verySpecificProvider);
        expect(providers[1]).toEqual(accessoryProvider2);
        return expect(providers[2]).toEqual(accessoryProvider1);
      });
    });
    return describe("when suggestionPriorities are the same", function() {
      var defaultProvider, provider1, provider2, provider3, _ref1;
      _ref1 = [], provider1 = _ref1[0], provider2 = _ref1[1], provider3 = _ref1[2], defaultProvider = _ref1[3];
      beforeEach(function() {
        atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
        providerManager = new ProviderManager();
        defaultProvider = providerManager.defaultProvider;
        provider1 = {
          selector: '*',
          suggestionPriority: 2,
          getSuggestions: function(options) {},
          dispose: function() {}
        };
        provider2 = {
          selector: '.source.js',
          suggestionPriority: 3,
          getSuggestions: function(options) {},
          dispose: function() {}
        };
        provider3 = {
          selector: '.source.js .comment',
          suggestionPriority: 2,
          getSuggestions: function(options) {},
          dispose: function() {}
        };
        providerManager.registerProvider(provider1);
        providerManager.registerProvider(provider2);
        return providerManager.registerProvider(provider3);
      });
      return it('sorts by specificity', function() {
        var providers;
        providers = providerManager.providersForScopeDescriptor('.source.js .comment');
        expect(providers).toHaveLength(4);
        expect(providers[0]).toEqual(provider2);
        expect(providers[1]).toEqual(provider3);
        return expect(providers[2]).toEqual(provider1);
      });
    });
  });

  hasDisposable = function(compositeDisposable, disposable) {
    var _ref, _ref1;
    if ((compositeDisposable != null ? (_ref = compositeDisposable.disposables) != null ? _ref.has : void 0 : void 0) != null) {
      return compositeDisposable.disposables.has(disposable);
    } else if ((compositeDisposable != null ? (_ref1 = compositeDisposable.disposables) != null ? _ref1.indexOf : void 0 : void 0) != null) {
      return compositeDisposable.disposables.indexOf(disposable) > -1;
    } else {
      return false;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3Byb3ZpZGVyLW1hbmFnZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEJBQUE7O0FBQUEsRUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSx5QkFBUixDQUFsQixDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLGlEQUFBO0FBQUEsSUFBQSxPQUFnRCxFQUFoRCxFQUFDLHlCQUFELEVBQWtCLHNCQUFsQixFQUFnQyxzQkFBaEMsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixFQUEyRCxJQUEzRCxDQUFBLENBQUE7QUFBQSxNQUNBLGVBQUEsR0FBc0IsSUFBQSxlQUFBLENBQUEsQ0FEdEIsQ0FBQTthQUVBLFlBQUEsR0FDRTtBQUFBLFFBQUEsY0FBQSxFQUFnQixTQUFDLE9BQUQsR0FBQTtpQkFDZDtZQUFDO0FBQUEsY0FDQyxJQUFBLEVBQU0sTUFEUDtBQUFBLGNBRUMsaUJBQUEsRUFBbUIsTUFGcEI7YUFBRDtZQURjO1FBQUEsQ0FBaEI7QUFBQSxRQUtBLFFBQUEsRUFBVSxZQUxWO0FBQUEsUUFNQSxPQUFBLEVBQVMsU0FBQSxHQUFBLENBTlQ7UUFKTztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFjQSxTQUFBLENBQVUsU0FBQSxHQUFBOzs7VUFDUixZQUFZLENBQUU7O09BQWQ7QUFBQSxNQUNBLFlBQUEsR0FBZSxJQURmLENBQUE7OztVQUVBLFlBQVksQ0FBRTs7T0FGZDtBQUFBLE1BR0EsWUFBQSxHQUFlLElBSGYsQ0FBQTs7UUFJQSxl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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/provider-manager-spec.coffee
