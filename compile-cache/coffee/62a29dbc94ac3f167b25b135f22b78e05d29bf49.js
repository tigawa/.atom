(function() {
  var CompositeDisposable, Disposable, FuzzyProvider, ProviderManager, ProviderMetadata, Selector, SymbolProvider, grim, isFunction, isString, scopeChainForScopeDescriptor, selectorsMatchScopeChain, semver, stableSort, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('./type-helpers'), isFunction = _ref1.isFunction, isString = _ref1.isString;

  semver = require('semver');

  Selector = require('selector-kit').Selector;

  stableSort = require('stable');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  SymbolProvider = null;

  FuzzyProvider = null;

  grim = null;

  ProviderMetadata = null;

  module.exports = ProviderManager = (function() {
    ProviderManager.prototype.defaultProvider = null;

    ProviderManager.prototype.defaultProviderRegistration = null;

    ProviderManager.prototype.providers = null;

    ProviderManager.prototype.store = null;

    ProviderManager.prototype.subscriptions = null;

    ProviderManager.prototype.globalBlacklist = null;

    function ProviderManager() {
      this.registerProvider = __bind(this.registerProvider, this);
      this.removeProvider = __bind(this.removeProvider, this);
      this.addProvider = __bind(this.addProvider, this);
      this.apiVersionForProvider = __bind(this.apiVersionForProvider, this);
      this.metadataForProvider = __bind(this.metadataForProvider, this);
      this.setGlobalBlacklist = __bind(this.setGlobalBlacklist, this);
      this.toggleDefaultProvider = __bind(this.toggleDefaultProvider, this);
      this.providersForScopeDescriptor = __bind(this.providersForScopeDescriptor, this);
      this.subscriptions = new CompositeDisposable;
      this.globalBlacklist = new CompositeDisposable;
      this.subscriptions.add(this.globalBlacklist);
      this.providers = [];
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableBuiltinProvider', (function(_this) {
        return function(value) {
          return _this.toggleDefaultProvider(value);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.scopeBlacklist', (function(_this) {
        return function(value) {
          return _this.setGlobalBlacklist(value);
        };
      })(this)));
    }

    ProviderManager.prototype.dispose = function() {
      var _ref2;
      this.toggleDefaultProvider(false);
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      this.subscriptions = null;
      this.globalBlacklist = null;
      return this.providers = null;
    };

    ProviderManager.prototype.providersForScopeDescriptor = function(scopeDescriptor) {
      var disableDefaultProvider, index, lowestIncludedPriority, matchingProviders, provider, providerMetadata, scopeChain, _i, _len, _ref2, _ref3;
      scopeChain = scopeChainForScopeDescriptor(scopeDescriptor);
      if (!scopeChain) {
        return [];
      }
      if ((this.globalBlacklistSelectors != null) && selectorsMatchScopeChain(this.globalBlacklistSelectors, scopeChain)) {
        return [];
      }
      matchingProviders = [];
      disableDefaultProvider = false;
      lowestIncludedPriority = 0;
      _ref2 = this.providers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        providerMetadata = _ref2[_i];
        provider = providerMetadata.provider;
        if (providerMetadata.matchesScopeChain(scopeChain)) {
          matchingProviders.push(provider);
          if (provider.excludeLowerPriority) {
            lowestIncludedPriority = Math.max(lowestIncludedPriority, (_ref3 = provider.inclusionPriority) != null ? _ref3 : 0);
          }
          if (providerMetadata.shouldDisableDefaultProvider(scopeChain)) {
            disableDefaultProvider = true;
          }
        }
      }
      if (disableDefaultProvider) {
        index = matchingProviders.indexOf(this.defaultProvider);
        if (index > -1) {
          matchingProviders.splice(index, 1);
        }
      }
      matchingProviders = (function() {
        var _j, _len1, _ref4, _results;
        _results = [];
        for (_j = 0, _len1 = matchingProviders.length; _j < _len1; _j++) {
          provider = matchingProviders[_j];
          if (((_ref4 = provider.inclusionPriority) != null ? _ref4 : 0) >= lowestIncludedPriority) {
            _results.push(provider);
          }
        }
        return _results;
      })();
      return stableSort(matchingProviders, (function(_this) {
        return function(providerA, providerB) {
          var difference, specificityA, specificityB, _ref4, _ref5;
          difference = ((_ref4 = providerB.suggestionPriority) != null ? _ref4 : 1) - ((_ref5 = providerA.suggestionPriority) != null ? _ref5 : 1);
          if (difference === 0) {
            specificityA = _this.metadataForProvider(providerA).getSpecificity(scopeChain);
            specificityB = _this.metadataForProvider(providerB).getSpecificity(scopeChain);
            difference = specificityB - specificityA;
          }
          return difference;
        };
      })(this));
    };

    ProviderManager.prototype.toggleDefaultProvider = function(enabled) {
      var _ref2, _ref3;
      if (enabled == null) {
        return;
      }
      if (enabled) {
        if ((this.defaultProvider != null) || (this.defaultProviderRegistration != null)) {
          return;
        }
        if (atom.config.get('autocomplete-plus.defaultProvider') === 'Symbol') {
          if (SymbolProvider == null) {
            SymbolProvider = require('./symbol-provider');
          }
          this.defaultProvider = new SymbolProvider();
        } else {
          if (FuzzyProvider == null) {
            FuzzyProvider = require('./fuzzy-provider');
          }
          this.defaultProvider = new FuzzyProvider();
        }
        return this.defaultProviderRegistration = this.registerProvider(this.defaultProvider);
      } else {
        if ((_ref2 = this.defaultProviderRegistration) != null) {
          _ref2.dispose();
        }
        if ((_ref3 = this.defaultProvider) != null) {
          _ref3.dispose();
        }
        this.defaultProviderRegistration = null;
        return this.defaultProvider = null;
      }
    };

    ProviderManager.prototype.setGlobalBlacklist = function(globalBlacklist) {
      this.globalBlacklistSelectors = null;
      if (globalBlacklist != null ? globalBlacklist.length : void 0) {
        return this.globalBlacklistSelectors = Selector.create(globalBlacklist);
      }
    };

    ProviderManager.prototype.isValidProvider = function(provider, apiVersion) {
      if (semver.satisfies(apiVersion, '>=2.0.0')) {
        return (provider != null) && isFunction(provider.getSuggestions) && isString(provider.selector) && !!provider.selector.length;
      } else {
        return (provider != null) && isFunction(provider.requestHandler) && isString(provider.selector) && !!provider.selector.length;
      }
    };

    ProviderManager.prototype.metadataForProvider = function(provider) {
      var providerMetadata, _i, _len, _ref2;
      _ref2 = this.providers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        providerMetadata = _ref2[_i];
        if (providerMetadata.provider === provider) {
          return providerMetadata;
        }
      }
      return null;
    };

    ProviderManager.prototype.apiVersionForProvider = function(provider) {
      var _ref2;
      return (_ref2 = this.metadataForProvider(provider)) != null ? _ref2.apiVersion : void 0;
    };

    ProviderManager.prototype.isProviderRegistered = function(provider) {
      return this.metadataForProvider(provider) != null;
    };

    ProviderManager.prototype.addProvider = function(provider, apiVersion) {
      if (apiVersion == null) {
        apiVersion = '2.0.0';
      }
      if (this.isProviderRegistered(provider)) {
        return;
      }
      if (ProviderMetadata == null) {
        ProviderMetadata = require('./provider-metadata');
      }
      this.providers.push(new ProviderMetadata(provider, apiVersion));
      if (provider.dispose != null) {
        return this.subscriptions.add(provider);
      }
    };

    ProviderManager.prototype.removeProvider = function(provider) {
      var i, providerMetadata, _i, _len, _ref2, _ref3;
      if (!this.providers) {
        return;
      }
      _ref2 = this.providers;
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        providerMetadata = _ref2[i];
        if (providerMetadata.provider === provider) {
          this.providers.splice(i, 1);
          break;
        }
      }
      if (provider.dispose != null) {
        return (_ref3 = this.subscriptions) != null ? _ref3.remove(provider) : void 0;
      }
    };

    ProviderManager.prototype.registerProvider = function(provider, apiVersion) {
      var apiIs20, disposable, originalDispose;
      if (apiVersion == null) {
        apiVersion = '2.0.0';
      }
      if (provider == null) {
        return;
      }
      apiIs20 = semver.satisfies(apiVersion, '>=2.0.0');
      if (apiIs20) {
        if ((provider.id != null) && provider !== this.defaultProvider) {
          if (grim == null) {
            grim = require('grim');
          }
          grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\ncontains an `id` property.\nAn `id` attribute on your provider is no longer necessary.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
        }
        if (provider.requestHandler != null) {
          if (grim == null) {
            grim = require('grim');
          }
          grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\ncontains a `requestHandler` property.\n`requestHandler` has been renamed to `getSuggestions`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
        }
        if (provider.blacklist != null) {
          if (grim == null) {
            grim = require('grim');
          }
          grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\ncontains a `blacklist` property.\n`blacklist` has been renamed to `disableForSelector`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
        }
      }
      if (!this.isValidProvider(provider, apiVersion)) {
        console.warn("Provider " + provider.constructor.name + " is not valid", provider);
        return new Disposable();
      }
      if (this.isProviderRegistered(provider)) {
        return;
      }
      this.addProvider(provider, apiVersion);
      disposable = new Disposable((function(_this) {
        return function() {
          return _this.removeProvider(provider);
        };
      })(this));
      if (originalDispose = provider.dispose) {
        provider.dispose = function() {
          originalDispose.call(provider);
          return disposable.dispose();
        };
      }
      return disposable;
    };

    return ProviderManager;

  })();

  scopeChainForScopeDescriptor = function(scopeDescriptor) {
    var json, scopeChain, type;
    type = typeof scopeDescriptor;
    if (type === 'string') {
      return scopeDescriptor;
    } else if (type === 'object' && ((scopeDescriptor != null ? scopeDescriptor.getScopeChain : void 0) != null)) {
      scopeChain = scopeDescriptor.getScopeChain();
      if ((scopeChain != null) && (scopeChain.replace == null)) {
        json = JSON.stringify(scopeDescriptor);
        console.log(scopeDescriptor, json);
        throw new Error("01: ScopeChain is not correct type: " + type + "; " + json);
      }
      return scopeChain;
    } else {
      json = JSON.stringify(scopeDescriptor);
      console.log(scopeDescriptor, json);
      throw new Error("02: ScopeChain is not correct type: " + type + "; " + json);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvcHJvdmlkZXItbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ09BQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFBdEIsQ0FBQTs7QUFBQSxFQUNBLFFBQXlCLE9BQUEsQ0FBUSxnQkFBUixDQUF6QixFQUFDLG1CQUFBLFVBQUQsRUFBYSxpQkFBQSxRQURiLENBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FGVCxDQUFBOztBQUFBLEVBR0MsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBSEQsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsUUFBUixDQUpiLENBQUE7O0FBQUEsRUFNQywyQkFBNEIsT0FBQSxDQUFRLGlCQUFSLEVBQTVCLHdCQU5ELENBQUE7O0FBQUEsRUFTQSxjQUFBLEdBQWlCLElBVGpCLENBQUE7O0FBQUEsRUFVQSxhQUFBLEdBQWlCLElBVmpCLENBQUE7O0FBQUEsRUFXQSxJQUFBLEdBQU8sSUFYUCxDQUFBOztBQUFBLEVBWUEsZ0JBQUEsR0FBbUIsSUFabkIsQ0FBQTs7QUFBQSxFQWNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw4QkFBQSxlQUFBLEdBQWlCLElBQWpCLENBQUE7O0FBQUEsOEJBQ0EsMkJBQUEsR0FBNkIsSUFEN0IsQ0FBQTs7QUFBQSw4QkFFQSxTQUFBLEdBQVcsSUFGWCxDQUFBOztBQUFBLDhCQUdBLEtBQUEsR0FBTyxJQUhQLENBQUE7O0FBQUEsOEJBSUEsYUFBQSxHQUFlLElBSmYsQ0FBQTs7QUFBQSw4QkFL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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/provider-manager.coffee
