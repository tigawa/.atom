Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _typeHelpers = require('./type-helpers');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _selectorKit = require('selector-kit');

var _stable = require('stable');

var _stable2 = _interopRequireDefault(_stable);

var _scopeHelpers = require('./scope-helpers');

var _privateSymbols = require('./private-symbols');

// Deferred requires
'use babel';

var SymbolProvider = require('./symbol-provider');
var FuzzyProvider = require('./fuzzy-provider');
var grim = require('grim');
var ProviderMetadata = require('./provider-metadata');

var ProviderManager = (function () {
  function ProviderManager() {
    var _this = this;

    _classCallCheck(this, ProviderManager);

    this.defaultProvider = null;
    this.defaultProviderRegistration = null;
    this.providers = null;
    this.store = null;
    this.subscriptions = null;
    this.globalBlacklist = null;
    this.applicableProviders = this.applicableProviders.bind(this);
    this.toggleDefaultProvider = this.toggleDefaultProvider.bind(this);
    this.setGlobalBlacklist = this.setGlobalBlacklist.bind(this);
    this.metadataForProvider = this.metadataForProvider.bind(this);
    this.apiVersionForProvider = this.apiVersionForProvider.bind(this);
    this.addProvider = this.addProvider.bind(this);
    this.removeProvider = this.removeProvider.bind(this);
    this.registerProvider = this.registerProvider.bind(this);
    this.subscriptions = new _atom.CompositeDisposable();
    this.globalBlacklist = new _atom.CompositeDisposable();
    this.subscriptions.add(this.globalBlacklist);
    this.providers = [];
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableBuiltinProvider', function (value) {
      return _this.toggleDefaultProvider(value);
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.scopeBlacklist', function (value) {
      return _this.setGlobalBlacklist(value);
    }));
  }

  _createClass(ProviderManager, [{
    key: 'dispose',
    value: function dispose() {
      this.toggleDefaultProvider(false);
      if (this.subscriptions && this.subscriptions.dispose) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      this.globalBlacklist = null;
      this.providers = null;
    }
  }, {
    key: 'applicableProviders',
    value: function applicableProviders(editor, scopeDescriptor) {
      var providers = this.filterProvidersByEditor(this.providers, editor);
      providers = this.filterProvidersByScopeDescriptor(providers, scopeDescriptor);
      providers = this.sortProviders(providers, scopeDescriptor);
      providers = this.filterProvidersByExcludeLowerPriority(providers);
      return this.removeMetadata(providers);
    }
  }, {
    key: 'filterProvidersByScopeDescriptor',
    value: function filterProvidersByScopeDescriptor(providers, scopeDescriptor) {
      var scopeChain = scopeChainForScopeDescriptor(scopeDescriptor);
      if (!scopeChain) {
        return [];
      }
      if (this.globalBlacklistSelectors != null && (0, _scopeHelpers.selectorsMatchScopeChain)(this.globalBlacklistSelectors, scopeChain)) {
        return [];
      }

      var matchingProviders = [];
      var disableDefaultProvider = false;
      var defaultProviderMetadata = null;
      for (var i = 0; i < providers.length; i++) {
        var providerMetadata = providers[i];
        var provider = providerMetadata.provider;

        if (provider === this.defaultProvider) {
          defaultProviderMetadata = providerMetadata;
        }
        if (providerMetadata.matchesScopeChain(scopeChain)) {
          matchingProviders.push(providerMetadata);
          if (providerMetadata.shouldDisableDefaultProvider(scopeChain)) {
            disableDefaultProvider = true;
          }
        }
      }

      if (disableDefaultProvider) {
        var index = matchingProviders.indexOf(defaultProviderMetadata);
        if (index > -1) {
          matchingProviders.splice(index, 1);
        }
      }
      return matchingProviders;
    }
  }, {
    key: 'sortProviders',
    value: function sortProviders(providers, scopeDescriptor) {
      var scopeChain = scopeChainForScopeDescriptor(scopeDescriptor);
      return (0, _stable2['default'])(providers, function (providerA, providerB) {
        var priorityA = providerA.provider.suggestionPriority != null ? providerA.provider.suggestionPriority : 1;
        var priorityB = providerB.provider.suggestionPriority != null ? providerB.provider.suggestionPriority : 1;
        var difference = priorityB - priorityA;
        if (difference === 0) {
          var specificityA = providerA.getSpecificity(scopeChain);
          var specificityB = providerB.getSpecificity(scopeChain);
          difference = specificityB - specificityA;
        }
        return difference;
      });
    }
  }, {
    key: 'filterProvidersByEditor',
    value: function filterProvidersByEditor(providers, editor) {
      return providers.filter(function (providerMetadata) {
        return providerMetadata.matchesEditor(editor);
      });
    }
  }, {
    key: 'filterProvidersByExcludeLowerPriority',
    value: function filterProvidersByExcludeLowerPriority(providers) {
      var lowestAllowedPriority = 0;
      for (var i = 0; i < providers.length; i++) {
        var providerMetadata = providers[i];
        var provider = providerMetadata.provider;

        if (provider.excludeLowerPriority) {
          lowestAllowedPriority = Math.max(lowestAllowedPriority, provider.inclusionPriority != null ? provider.inclusionPriority : 0);
        }
      }
      return providers.filter(function (providerMetadata) {
        return (providerMetadata.provider.inclusionPriority != null ? providerMetadata.provider.inclusionPriority : 0) >= lowestAllowedPriority;
      }).map(function (providerMetadata) {
        return providerMetadata;
      });
    }
  }, {
    key: 'removeMetadata',
    value: function removeMetadata(providers) {
      return providers.map(function (providerMetadata) {
        return providerMetadata.provider;
      });
    }
  }, {
    key: 'toggleDefaultProvider',
    value: function toggleDefaultProvider(enabled) {
      if (enabled == null) {
        return;
      }

      if (enabled) {
        if (this.defaultProvider != null || this.defaultProviderRegistration != null) {
          return;
        }
        if (atom.config.get('autocomplete-plus.defaultProvider') === 'Symbol') {
          this.defaultProvider = new SymbolProvider();
        } else {
          this.defaultProvider = new FuzzyProvider();
        }
        this.defaultProviderRegistration = this.registerProvider(this.defaultProvider);
      } else {
        if (this.defaultProviderRegistration) {
          this.defaultProviderRegistration.dispose();
        }
        if (this.defaultProvider) {
          this.defaultProvider.dispose();
        }
        this.defaultProviderRegistration = null;
        this.defaultProvider = null;
      }
    }
  }, {
    key: 'setGlobalBlacklist',
    value: function setGlobalBlacklist(globalBlacklist) {
      this.globalBlacklistSelectors = null;
      if (globalBlacklist && globalBlacklist.length) {
        this.globalBlacklistSelectors = _selectorKit.Selector.create(globalBlacklist);
      }
    }
  }, {
    key: 'isValidProvider',
    value: function isValidProvider(provider, apiVersion) {
      // TODO API: Check based on the apiVersion
      if (_semver2['default'].satisfies(apiVersion, '>=2.0.0')) {
        return provider != null && (0, _typeHelpers.isFunction)(provider.getSuggestions) && ((0, _typeHelpers.isString)(provider.selector) && !!provider.selector.length || (0, _typeHelpers.isString)(provider.scopeSelector) && !!provider.scopeSelector.length);
      } else {
        return provider != null && (0, _typeHelpers.isFunction)(provider.requestHandler) && (0, _typeHelpers.isString)(provider.selector) && !!provider.selector.length;
      }
    }
  }, {
    key: 'metadataForProvider',
    value: function metadataForProvider(provider) {
      for (var i = 0; i < this.providers.length; i++) {
        var providerMetadata = this.providers[i];
        if (providerMetadata.provider === provider) {
          return providerMetadata;
        }
      }
      return null;
    }
  }, {
    key: 'apiVersionForProvider',
    value: function apiVersionForProvider(provider) {
      if (this.metadataForProvider(provider) && this.metadataForProvider(provider).apiVersion) {
        return this.metadataForProvider(provider).apiVersion;
      }
    }
  }, {
    key: 'isProviderRegistered',
    value: function isProviderRegistered(provider) {
      return this.metadataForProvider(provider) != null;
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      var apiVersion = arguments.length <= 1 || arguments[1] === undefined ? '3.0.0' : arguments[1];

      if (this.isProviderRegistered(provider)) {
        return;
      }
      this.providers.push(new ProviderMetadata(provider, apiVersion));
      if (provider.dispose != null) {
        return this.subscriptions.add(provider);
      }
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      if (!this.providers) {
        return;
      }
      for (var i = 0; i < this.providers.length; i++) {
        var providerMetadata = this.providers[i];
        if (providerMetadata.provider === provider) {
          this.providers.splice(i, 1);
          break;
        }
      }
      if (provider.dispose != null) {
        if (this.subscriptions) {
          this.subscriptions.remove(provider);
        }
      }
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider(provider) {
      var _this2 = this;

      var apiVersion = arguments.length <= 1 || arguments[1] === undefined ? '3.0.0' : arguments[1];

      if (provider == null) {
        return;
      }

      provider[_privateSymbols.API_VERSION] = apiVersion;

      var apiIs200 = _semver2['default'].satisfies(apiVersion, '>=2.0.0');
      var apiIs300 = _semver2['default'].satisfies(apiVersion, '>=3.0.0');

      if (apiIs200) {
        if (provider.id != null && provider !== this.defaultProvider) {
          grim.deprecate('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\ncontains an `id` property.\nAn `id` attribute on your provider is no longer necessary.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API');
        }
        if (provider.requestHandler != null) {
          if (typeof grim === 'undefined' || grim === null) {
            grim = require('grim');
          }
          grim.deprecate('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\ncontains a `requestHandler` property.\n`requestHandler` has been renamed to `getSuggestions`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API');
        }
        if (provider.blacklist != null) {
          if (typeof grim === 'undefined' || grim === null) {
            grim = require('grim');
          }
          grim.deprecate('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\ncontains a `blacklist` property.\n`blacklist` has been renamed to `disableForScopeSelector`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API');
        }
      }

      if (apiIs300) {
        if (provider.selector != null) {
          throw new Error('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\nspecifies `selector` instead of the `scopeSelector` attribute.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API.');
        }

        if (provider.disableForSelector != null) {
          throw new Error('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\nspecifies `disableForSelector` instead of the `disableForScopeSelector`\nattribute.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API.');
        }
      }

      if (!this.isValidProvider(provider, apiVersion)) {
        console.warn('Provider ' + provider.constructor.name + ' is not valid', provider);
        return new _atom.Disposable();
      }

      if (this.isProviderRegistered(provider)) {
        return;
      }

      this.addProvider(provider, apiVersion);

      var disposable = new _atom.Disposable(function () {
        _this2.removeProvider(provider);
      });

      // When the provider is disposed, remove its registration
      var originalDispose = provider.dispose;
      if (originalDispose) {
        provider.dispose = function () {
          originalDispose.call(provider);
          disposable.dispose();
        };
      }

      return disposable;
    }
  }]);

  return ProviderManager;
})();

exports['default'] = ProviderManager;

var scopeChainForScopeDescriptor = function scopeChainForScopeDescriptor(scopeDescriptor) {
  // TODO: most of this is temp code to understand #308
  var type = typeof scopeDescriptor;
  var hasScopeChain = false;
  if (type === 'object' && scopeDescriptor && scopeDescriptor.getScopeChain) {
    hasScopeChain = true;
  }
  if (type === 'string') {
    return scopeDescriptor;
  } else if (type === 'object' && hasScopeChain) {
    var scopeChain = scopeDescriptor.getScopeChain();
    if (scopeChain != null && scopeChain.replace == null) {
      var json = JSON.stringify(scopeDescriptor);
      console.log(scopeDescriptor, json);
      throw new Error('01: ScopeChain is not correct type: ' + type + '; ' + json);
    }
    return scopeChain;
  } else {
    var json = JSON.stringify(scopeDescriptor);
    console.log(scopeDescriptor, json);
    throw new Error('02: ScopeChain is not correct type: ' + type + '; ' + json);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3Byb3ZpZGVyLW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFZ0QsTUFBTTs7MkJBQ2pCLGdCQUFnQjs7c0JBQ2xDLFFBQVE7Ozs7MkJBQ0YsY0FBYzs7c0JBQ2hCLFFBQVE7Ozs7NEJBRVUsaUJBQWlCOzs4QkFDOUIsbUJBQW1COzs7QUFUL0MsV0FBVyxDQUFBOztBQVlYLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ2pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQy9DLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMxQixJQUFJLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBOztJQUVoQyxlQUFlO0FBQ3RCLFdBRE8sZUFBZSxHQUNuQjs7OzBCQURJLGVBQWU7O0FBRWhDLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0FBQzNCLFFBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUE7QUFDdkMsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDckIsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDakIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7QUFDekIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUE7QUFDM0IsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDOUQsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbEUsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxr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LENBQUcsQ0FBQTtLQUN4RTtBQUNELFdBQU8sVUFBVSxDQUFBO0dBQ2xCLE1BQU07QUFDTCxRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQzVDLFdBQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ2xDLFVBQU0sSUFBSSxLQUFLLDBDQUF3QyxJQUFJLFVBQUssSUFBSSxDQUFHLENBQUE7R0FDeEU7Q0FDRixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3Byb3ZpZGVyLW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGlzRnVuY3Rpb24sIGlzU3RyaW5nIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcbmltcG9ydCB7IFNlbGVjdG9yIH0gZnJvbSAnc2VsZWN0b3Ita2l0J1xuaW1wb3J0IHN0YWJsZVNvcnQgZnJvbSAnc3RhYmxlJ1xuXG5pbXBvcnQgeyBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4gfSBmcm9tICcuL3Njb3BlLWhlbHBlcnMnXG5pbXBvcnQgeyBBUElfVkVSU0lPTiB9IGZyb20gJy4vcHJpdmF0ZS1zeW1ib2xzJ1xuXG4vLyBEZWZlcnJlZCByZXF1aXJlc1xubGV0IFN5bWJvbFByb3ZpZGVyID0gcmVxdWlyZSgnLi9zeW1ib2wtcHJvdmlkZXInKVxubGV0IEZ1enp5UHJvdmlkZXIgPSByZXF1aXJlKCcuL2Z1enp5LXByb3ZpZGVyJylcbmxldCBncmltID0gcmVxdWlyZSgnZ3JpbScpXG5sZXQgUHJvdmlkZXJNZXRhZGF0YSA9IHJlcXVpcmUoJy4vcHJvdmlkZXItbWV0YWRhdGEnKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm92aWRlck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5kZWZhdWx0UHJvdmlkZXIgPSBudWxsXG4gICAgdGhpcy5kZWZhdWx0UHJvdmlkZXJSZWdpc3RyYXRpb24gPSBudWxsXG4gICAgdGhpcy5wcm92aWRlcnMgPSBudWxsXG4gICAgdGhpcy5zdG9yZSA9IG51bGxcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nbG9iYWxCbGFja2xpc3QgPSBudWxsXG4gICAgdGhpcy5hcHBsaWNhYmxlUHJvdmlkZXJzID0gdGhpcy5hcHBsaWNhYmxlUHJvdmlkZXJzLmJpbmQodGhpcylcbiAgICB0aGlzLnRvZ2dsZURlZmF1bHRQcm92aWRlciA9IHRoaXMudG9nZ2xlRGVmYXVsdFByb3ZpZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLnNldEdsb2JhbEJsYWNrbGlzdCA9IHRoaXMuc2V0R2xvYmFsQmxhY2tsaXN0LmJpbmQodGhpcylcbiAgICB0aGlzLm1ldGFkYXRhRm9yUHJvdmlkZXIgPSB0aGlzLm1ldGFkYXRhRm9yUHJvdmlkZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuYXBpVmVyc2lvbkZvclByb3ZpZGVyID0gdGhpcy5hcGlWZXJzaW9uRm9yUHJvdmlkZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuYWRkUHJvdmlkZXIgPSB0aGlzLmFkZFByb3ZpZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLnJlbW92ZVByb3ZpZGVyID0gdGhpcy5yZW1vdmVQcm92aWRlci5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZWdpc3RlclByb3ZpZGVyID0gdGhpcy5yZWdpc3RlclByb3ZpZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5nbG9iYWxCbGFja2xpc3QgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmdsb2JhbEJsYWNrbGlzdClcbiAgICB0aGlzLnByb3ZpZGVycyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVCdWlsdGluUHJvdmlkZXInLCB2YWx1ZSA9PiB0aGlzLnRvZ2dsZURlZmF1bHRQcm92aWRlcih2YWx1ZSkpKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMuc2NvcGVCbGFja2xpc3QnLCB2YWx1ZSA9PiB0aGlzLnNldEdsb2JhbEJsYWNrbGlzdCh2YWx1ZSkpKVxuICB9XG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgdGhpcy50b2dnbGVEZWZhdWx0UHJvdmlkZXIoZmFsc2UpXG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucyAmJiB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5nbG9iYWxCbGFja2xpc3QgPSBudWxsXG4gICAgdGhpcy5wcm92aWRlcnMgPSBudWxsXG4gIH1cblxuICBhcHBsaWNhYmxlUHJvdmlkZXJzIChlZGl0b3IsIHNjb3BlRGVzY3JpcHRvcikge1xuICAgIGxldCBwcm92aWRlcnMgPSB0aGlzLmZpbHRlclByb3ZpZGVyc0J5RWRpdG9yKHRoaXMucHJvdmlkZXJzLCBlZGl0b3IpXG4gICAgcHJvdmlkZXJzID0gdGhpcy5maWx0ZXJQcm92aWRlcnNCeVNjb3BlRGVzY3JpcHRvcihwcm92aWRlcnMsIHNjb3BlRGVzY3JpcHRvcilcbiAgICBwcm92aWRlcnMgPSB0aGlzLnNvcnRQcm92aWRlcnMocHJvdmlkZXJzLCBzY29wZURlc2NyaXB0b3IpXG4gICAgcHJvdmlkZXJzID0gdGhpcy5maWx0ZXJQcm92aWRlcnNCeUV4Y2x1ZGVMb3dlclByaW9yaXR5KHByb3ZpZGVycylcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVNZXRhZGF0YShwcm92aWRlcnMpXG4gIH1cblxuICBmaWx0ZXJQcm92aWRlcnNCeVNjb3BlRGVzY3JpcHRvciAocHJvdmlkZXJzLCBzY29wZURlc2NyaXB0b3IpIHtcbiAgICBjb25zdCBzY29wZUNoYWluID0gc2NvcGVDaGFpbkZvclNjb3BlRGVzY3JpcHRvcihzY29wZURlc2NyaXB0b3IpXG4gICAgaWYgKCFzY29wZUNoYWluKSB7IHJldHVybiBbXSB9XG4gICAgaWYgKCh0aGlzLmdsb2JhbEJsYWNrbGlzdFNlbGVjdG9ycyAhPSBudWxsKSAmJiBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4odGhpcy5nbG9iYWxCbGFja2xpc3RTZWxlY3RvcnMsIHNjb3BlQ2hhaW4pKSB7IHJldHVybiBbXSB9XG5cbiAgICBjb25zdCBtYXRjaGluZ1Byb3ZpZGVycyA9IFtdXG4gICAgbGV0IGRpc2FibGVEZWZhdWx0UHJvdmlkZXIgPSBmYWxzZVxuICAgIGxldCBkZWZhdWx0UHJvdmlkZXJNZXRhZGF0YSA9IG51bGxcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJvdmlkZXJNZXRhZGF0YSA9IHByb3ZpZGVyc1tpXVxuICAgICAgY29uc3Qge3Byb3ZpZGVyfSA9IHByb3ZpZGVyTWV0YWRhdGFcbiAgICAgIGlmIChwcm92aWRlciA9PT0gdGhpcy5kZWZhdWx0UHJvdmlkZXIpIHtcbiAgICAgICAgZGVmYXVsdFByb3ZpZGVyTWV0YWRhdGEgPSBwcm92aWRlck1ldGFkYXRhXG4gICAgICB9XG4gICAgICBpZiAocHJvdmlkZXJNZXRhZGF0YS5tYXRjaGVzU2NvcGVDaGFpbihzY29wZUNoYWluKSkge1xuICAgICAgICBtYXRjaGluZ1Byb3ZpZGVycy5wdXNoKHByb3ZpZGVyTWV0YWRhdGEpXG4gICAgICAgIGlmIChwcm92aWRlck1ldGFkYXRhLnNob3VsZERpc2FibGVEZWZhdWx0UHJvdmlkZXIoc2NvcGVDaGFpbikpIHtcbiAgICAgICAgICBkaXNhYmxlRGVmYXVsdFByb3ZpZGVyID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRpc2FibGVEZWZhdWx0UHJvdmlkZXIpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gbWF0Y2hpbmdQcm92aWRlcnMuaW5kZXhPZihkZWZhdWx0UHJvdmlkZXJNZXRhZGF0YSlcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IG1hdGNoaW5nUHJvdmlkZXJzLnNwbGljZShpbmRleCwgMSkgfVxuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hpbmdQcm92aWRlcnNcbiAgfVxuXG4gIHNvcnRQcm92aWRlcnMgKHByb3ZpZGVycywgc2NvcGVEZXNjcmlwdG9yKSB7XG4gICAgY29uc3Qgc2NvcGVDaGFpbiA9IHNjb3BlQ2hhaW5Gb3JTY29wZURlc2NyaXB0b3Ioc2NvcGVEZXNjcmlwdG9yKVxuICAgIHJldHVybiBzdGFibGVTb3J0KHByb3ZpZGVycywgKHByb3ZpZGVyQSwgcHJvdmlkZXJCKSA9PiB7XG4gICAgICBjb25zdCBwcmlvcml0eUEgPSBwcm92aWRlckEucHJvdmlkZXIuc3VnZ2VzdGlvblByaW9yaXR5ICE9IG51bGwgPyBwcm92aWRlckEucHJvdmlkZXIuc3VnZ2VzdGlvblByaW9yaXR5IDogMVxuICAgICAgY29uc3QgcHJpb3JpdHlCID0gcHJvdmlkZXJCLnByb3ZpZGVyLnN1Z2dlc3Rpb25Qcmlvcml0eSAhPSBudWxsID8gcHJvdmlkZXJCLnByb3ZpZGVyLnN1Z2dlc3Rpb25Qcmlvcml0eSA6IDFcbiAgICAgIGxldCBkaWZmZXJlbmNlID0gcHJpb3JpdHlCIC0gcHJpb3JpdHlBXG4gICAgICBpZiAoZGlmZmVyZW5jZSA9PT0gMCkge1xuICAgICAgICBjb25zdCBzcGVjaWZpY2l0eUEgPSBwcm92aWRlckEuZ2V0U3BlY2lmaWNpdHkoc2NvcGVDaGFpbilcbiAgICAgICAgY29uc3Qgc3BlY2lmaWNpdHlCID0gcHJvdmlkZXJCLmdldFNwZWNpZmljaXR5KHNjb3BlQ2hhaW4pXG4gICAgICAgIGRpZmZlcmVuY2UgPSBzcGVjaWZpY2l0eUIgLSBzcGVjaWZpY2l0eUFcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaWZmZXJlbmNlXG4gICAgfVxuICAgIClcbiAgfVxuXG4gIGZpbHRlclByb3ZpZGVyc0J5RWRpdG9yIChwcm92aWRlcnMsIGVkaXRvcikge1xuICAgIHJldHVybiBwcm92aWRlcnMuZmlsdGVyKHByb3ZpZGVyTWV0YWRhdGEgPT4gcHJvdmlkZXJNZXRhZGF0YS5tYXRjaGVzRWRpdG9yKGVkaXRvcikpXG4gIH1cblxuICBmaWx0ZXJQcm92aWRlcnNCeUV4Y2x1ZGVMb3dlclByaW9yaXR5IChwcm92aWRlcnMpIHtcbiAgICBsZXQgbG93ZXN0QWxsb3dlZFByaW9yaXR5ID0gMFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwcm92aWRlck1ldGFkYXRhID0gcHJvdmlkZXJzW2ldXG4gICAgICBjb25zdCB7cHJvdmlkZXJ9ID0gcHJvdmlkZXJNZXRhZGF0YVxuICAgICAgaWYgKHByb3ZpZGVyLmV4Y2x1ZGVMb3dlclByaW9yaXR5KSB7XG4gICAgICAgIGxvd2VzdEFsbG93ZWRQcmlvcml0eSA9IE1hdGgubWF4KGxvd2VzdEFsbG93ZWRQcmlvcml0eSwgcHJvdmlkZXIuaW5jbHVzaW9uUHJpb3JpdHkgIT0gbnVsbCA/IHByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5IDogMClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHByb3ZpZGVycy5maWx0ZXIoKHByb3ZpZGVyTWV0YWRhdGEpID0+IChwcm92aWRlck1ldGFkYXRhLnByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5ICE9IG51bGwgPyBwcm92aWRlck1ldGFkYXRhLnByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5IDogMCkgPj0gbG93ZXN0QWxsb3dlZFByaW9yaXR5KS5tYXAoKHByb3ZpZGVyTWV0YWRhdGEpID0+IHByb3ZpZGVyTWV0YWRhdGEpXG4gIH1cblxuICByZW1vdmVNZXRhZGF0YSAocHJvdmlkZXJzKSB7XG4gICAgcmV0dXJuIHByb3ZpZGVycy5tYXAocHJvdmlkZXJNZXRhZGF0YSA9PiBwcm92aWRlck1ldGFkYXRhLnByb3ZpZGVyKVxuICB9XG5cbiAgdG9nZ2xlRGVmYXVsdFByb3ZpZGVyIChlbmFibGVkKSB7XG4gICAgaWYgKGVuYWJsZWQgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgIGlmICgodGhpcy5kZWZhdWx0UHJvdmlkZXIgIT0gbnVsbCkgfHwgKHRoaXMuZGVmYXVsdFByb3ZpZGVyUmVnaXN0cmF0aW9uICE9IG51bGwpKSB7IHJldHVybiB9XG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5kZWZhdWx0UHJvdmlkZXInKSA9PT0gJ1N5bWJvbCcpIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0UHJvdmlkZXIgPSBuZXcgU3ltYm9sUHJvdmlkZXIoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0UHJvdmlkZXIgPSBuZXcgRnV6enlQcm92aWRlcigpXG4gICAgICB9XG4gICAgICB0aGlzLmRlZmF1bHRQcm92aWRlclJlZ2lzdHJhdGlvbiA9IHRoaXMucmVnaXN0ZXJQcm92aWRlcih0aGlzLmRlZmF1bHRQcm92aWRlcilcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZGVmYXVsdFByb3ZpZGVyUmVnaXN0cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdFByb3ZpZGVyUmVnaXN0cmF0aW9uLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZGVmYXVsdFByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdFByb3ZpZGVyLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgdGhpcy5kZWZhdWx0UHJvdmlkZXJSZWdpc3RyYXRpb24gPSBudWxsXG4gICAgICB0aGlzLmRlZmF1bHRQcm92aWRlciA9IG51bGxcbiAgICB9XG4gIH1cblxuICBzZXRHbG9iYWxCbGFja2xpc3QgKGdsb2JhbEJsYWNrbGlzdCkge1xuICAgIHRoaXMuZ2xvYmFsQmxhY2tsaXN0U2VsZWN0b3JzID0gbnVsbFxuICAgIGlmIChnbG9iYWxCbGFja2xpc3QgJiYgZ2xvYmFsQmxhY2tsaXN0Lmxlbmd0aCkge1xuICAgICAgdGhpcy5nbG9iYWxCbGFja2xpc3RTZWxlY3RvcnMgPSBTZWxlY3Rvci5jcmVhdGUoZ2xvYmFsQmxhY2tsaXN0KVxuICAgIH1cbiAgfVxuXG4gIGlzVmFsaWRQcm92aWRlciAocHJvdmlkZXIsIGFwaVZlcnNpb24pIHtcbiAgICAvLyBUT0RPIEFQSTogQ2hlY2sgYmFzZWQgb24gdGhlIGFwaVZlcnNpb25cbiAgICBpZiAoc2VtdmVyLnNhdGlzZmllcyhhcGlWZXJzaW9uLCAnPj0yLjAuMCcpKSB7XG4gICAgICByZXR1cm4gKHByb3ZpZGVyICE9IG51bGwpICYmXG4gICAgICBpc0Z1bmN0aW9uKHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKSAmJlxuICAgICAgKChpc1N0cmluZyhwcm92aWRlci5zZWxlY3RvcikgJiYgISFwcm92aWRlci5zZWxlY3Rvci5sZW5ndGgpIHx8XG4gICAgICAgKGlzU3RyaW5nKHByb3ZpZGVyLnNjb3BlU2VsZWN0b3IpICYmICEhcHJvdmlkZXIuc2NvcGVTZWxlY3Rvci5sZW5ndGgpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHByb3ZpZGVyICE9IG51bGwpICYmIGlzRnVuY3Rpb24ocHJvdmlkZXIucmVxdWVzdEhhbmRsZXIpICYmIGlzU3RyaW5nKHByb3ZpZGVyLnNlbGVjdG9yKSAmJiAhIXByb3ZpZGVyLnNlbGVjdG9yLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIG1ldGFkYXRhRm9yUHJvdmlkZXIgKHByb3ZpZGVyKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJvdmlkZXJNZXRhZGF0YSA9IHRoaXMucHJvdmlkZXJzW2ldXG4gICAgICBpZiAocHJvdmlkZXJNZXRhZGF0YS5wcm92aWRlciA9PT0gcHJvdmlkZXIpIHsgcmV0dXJuIHByb3ZpZGVyTWV0YWRhdGEgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgYXBpVmVyc2lvbkZvclByb3ZpZGVyIChwcm92aWRlcikge1xuICAgIGlmICh0aGlzLm1ldGFkYXRhRm9yUHJvdmlkZXIocHJvdmlkZXIpICYmIHRoaXMubWV0YWRhdGFGb3JQcm92aWRlcihwcm92aWRlcikuYXBpVmVyc2lvbikge1xuICAgICAgcmV0dXJuIHRoaXMubWV0YWRhdGFGb3JQcm92aWRlcihwcm92aWRlcikuYXBpVmVyc2lvblxuICAgIH1cbiAgfVxuXG4gIGlzUHJvdmlkZXJSZWdpc3RlcmVkIChwcm92aWRlcikge1xuICAgIHJldHVybiAodGhpcy5tZXRhZGF0YUZvclByb3ZpZGVyKHByb3ZpZGVyKSAhPSBudWxsKVxuICB9XG5cbiAgYWRkUHJvdmlkZXIgKHByb3ZpZGVyLCBhcGlWZXJzaW9uID0gJzMuMC4wJykge1xuICAgIGlmICh0aGlzLmlzUHJvdmlkZXJSZWdpc3RlcmVkKHByb3ZpZGVyKSkgeyByZXR1cm4gfVxuICAgIHRoaXMucHJvdmlkZXJzLnB1c2gobmV3IFByb3ZpZGVyTWV0YWRhdGEocHJvdmlkZXIsIGFwaVZlcnNpb24pKVxuICAgIGlmIChwcm92aWRlci5kaXNwb3NlICE9IG51bGwpIHsgcmV0dXJuIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocHJvdmlkZXIpIH1cbiAgfVxuXG4gIHJlbW92ZVByb3ZpZGVyIChwcm92aWRlcikge1xuICAgIGlmICghdGhpcy5wcm92aWRlcnMpIHsgcmV0dXJuIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwcm92aWRlck1ldGFkYXRhID0gdGhpcy5wcm92aWRlcnNbaV1cbiAgICAgIGlmIChwcm92aWRlck1ldGFkYXRhLnByb3ZpZGVyID09PSBwcm92aWRlcikge1xuICAgICAgICB0aGlzLnByb3ZpZGVycy5zcGxpY2UoaSwgMSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByb3ZpZGVyLmRpc3Bvc2UgIT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHByb3ZpZGVyKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyUHJvdmlkZXIgKHByb3ZpZGVyLCBhcGlWZXJzaW9uID0gJzMuMC4wJykge1xuICAgIGlmIChwcm92aWRlciA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICBwcm92aWRlcltBUElfVkVSU0lPTl0gPSBhcGlWZXJzaW9uXG5cbiAgICBjb25zdCBhcGlJczIwMCA9IHNlbXZlci5zYXRpc2ZpZXMoYXBpVmVyc2lvbiwgJz49Mi4wLjAnKVxuICAgIGNvbnN0IGFwaUlzMzAwID0gc2VtdmVyLnNhdGlzZmllcyhhcGlWZXJzaW9uLCAnPj0zLjAuMCcpXG5cbiAgICBpZiAoYXBpSXMyMDApIHtcbiAgICAgIGlmICgocHJvdmlkZXIuaWQgIT0gbnVsbCkgJiYgcHJvdmlkZXIgIT09IHRoaXMuZGVmYXVsdFByb3ZpZGVyKSB7XG4gICAgICAgIGdyaW0uZGVwcmVjYXRlKGBBdXRvY29tcGxldGUgcHJvdmlkZXIgJyR7cHJvdmlkZXIuY29uc3RydWN0b3IubmFtZX0oJHtwcm92aWRlci5pZH0pJ1xuY29udGFpbnMgYW4gXFxgaWRcXGAgcHJvcGVydHkuXG5BbiBcXGBpZFxcYCBhdHRyaWJ1dGUgb24geW91ciBwcm92aWRlciBpcyBubyBsb25nZXIgbmVjZXNzYXJ5LlxuU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL3dpa2kvUHJvdmlkZXItQVBJYFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBpZiAocHJvdmlkZXIucmVxdWVzdEhhbmRsZXIgIT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIGdyaW0gPT09ICd1bmRlZmluZWQnIHx8IGdyaW0gPT09IG51bGwpIHsgZ3JpbSA9IHJlcXVpcmUoJ2dyaW0nKSB9XG4gICAgICAgIGdyaW0uZGVwcmVjYXRlKGBBdXRvY29tcGxldGUgcHJvdmlkZXIgJyR7cHJvdmlkZXIuY29uc3RydWN0b3IubmFtZX0oJHtwcm92aWRlci5pZH0pJ1xuY29udGFpbnMgYSBcXGByZXF1ZXN0SGFuZGxlclxcYCBwcm9wZXJ0eS5cblxcYHJlcXVlc3RIYW5kbGVyXFxgIGhhcyBiZWVuIHJlbmFtZWQgdG8gXFxgZ2V0U3VnZ2VzdGlvbnNcXGAuXG5TZWUgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvd2lraS9Qcm92aWRlci1BUElgXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlmIChwcm92aWRlci5ibGFja2xpc3QgIT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIGdyaW0gPT09ICd1bmRlZmluZWQnIHx8IGdyaW0gPT09IG51bGwpIHsgZ3JpbSA9IHJlcXVpcmUoJ2dyaW0nKSB9XG4gICAgICAgIGdyaW0uZGVwcmVjYXRlKGBBdXRvY29tcGxldGUgcHJvdmlkZXIgJyR7cHJvdmlkZXIuY29uc3RydWN0b3IubmFtZX0oJHtwcm92aWRlci5pZH0pJ1xuY29udGFpbnMgYSBcXGBibGFja2xpc3RcXGAgcHJvcGVydHkuXG5cXGBibGFja2xpc3RcXGAgaGFzIGJlZW4gcmVuYW1lZCB0byBcXGBkaXNhYmxlRm9yU2NvcGVTZWxlY3RvclxcYC5cblNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy93aWtpL1Byb3ZpZGVyLUFQSWBcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhcGlJczMwMCkge1xuICAgICAgaWYgKHByb3ZpZGVyLnNlbGVjdG9yICE9IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdXRvY29tcGxldGUgcHJvdmlkZXIgJyR7cHJvdmlkZXIuY29uc3RydWN0b3IubmFtZX0oJHtwcm92aWRlci5pZH0pJ1xuc3BlY2lmaWVzIFxcYHNlbGVjdG9yXFxgIGluc3RlYWQgb2YgdGhlIFxcYHNjb3BlU2VsZWN0b3JcXGAgYXR0cmlidXRlLlxuU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL3dpa2kvUHJvdmlkZXItQVBJLmApXG4gICAgICB9XG5cbiAgICAgIGlmIChwcm92aWRlci5kaXNhYmxlRm9yU2VsZWN0b3IgIT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEF1dG9jb21wbGV0ZSBwcm92aWRlciAnJHtwcm92aWRlci5jb25zdHJ1Y3Rvci5uYW1lfSgke3Byb3ZpZGVyLmlkfSknXG5zcGVjaWZpZXMgXFxgZGlzYWJsZUZvclNlbGVjdG9yXFxgIGluc3RlYWQgb2YgdGhlIFxcYGRpc2FibGVGb3JTY29wZVNlbGVjdG9yXFxgXG5hdHRyaWJ1dGUuXG5TZWUgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvd2lraS9Qcm92aWRlci1BUEkuYClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNWYWxpZFByb3ZpZGVyKHByb3ZpZGVyLCBhcGlWZXJzaW9uKSkge1xuICAgICAgY29uc29sZS53YXJuKGBQcm92aWRlciAke3Byb3ZpZGVyLmNvbnN0cnVjdG9yLm5hbWV9IGlzIG5vdCB2YWxpZGAsIHByb3ZpZGVyKVxuICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1Byb3ZpZGVyUmVnaXN0ZXJlZChwcm92aWRlcikpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuYWRkUHJvdmlkZXIocHJvdmlkZXIsIGFwaVZlcnNpb24pXG5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVQcm92aWRlcihwcm92aWRlcilcbiAgICB9KVxuXG4gICAgLy8gV2hlbiB0aGUgcHJvdmlkZXIgaXMgZGlzcG9zZWQsIHJlbW92ZSBpdHMgcmVnaXN0cmF0aW9uXG4gICAgY29uc3Qgb3JpZ2luYWxEaXNwb3NlID0gcHJvdmlkZXIuZGlzcG9zZVxuICAgIGlmIChvcmlnaW5hbERpc3Bvc2UpIHtcbiAgICAgIHByb3ZpZGVyLmRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgICAgIG9yaWdpbmFsRGlzcG9zZS5jYWxsKHByb3ZpZGVyKVxuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaXNwb3NhYmxlXG4gIH1cbn1cblxuY29uc3Qgc2NvcGVDaGFpbkZvclNjb3BlRGVzY3JpcHRvciA9IChzY29wZURlc2NyaXB0b3IpID0+IHtcbiAgLy8gVE9ETzogbW9zdCBvZiB0aGlzIGlzIHRlbXAgY29kZSB0byB1bmRlcnN0YW5kICMzMDhcbiAgY29uc3QgdHlwZSA9IHR5cGVvZiBzY29wZURlc2NyaXB0b3JcbiAgbGV0IGhhc1Njb3BlQ2hhaW4gPSBmYWxzZVxuICBpZiAodHlwZSA9PT0gJ29iamVjdCcgJiYgc2NvcGVEZXNjcmlwdG9yICYmIHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZUNoYWluKSB7XG4gICAgaGFzU2NvcGVDaGFpbiA9IHRydWVcbiAgfVxuICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc2NvcGVEZXNjcmlwdG9yXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcgJiYgaGFzU2NvcGVDaGFpbikge1xuICAgIGNvbnN0IHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG4gICAgaWYgKChzY29wZUNoYWluICE9IG51bGwpICYmIChzY29wZUNoYWluLnJlcGxhY2UgPT0gbnVsbCkpIHtcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShzY29wZURlc2NyaXB0b3IpXG4gICAgICBjb25zb2xlLmxvZyhzY29wZURlc2NyaXB0b3IsIGpzb24pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYDAxOiBTY29wZUNoYWluIGlzIG5vdCBjb3JyZWN0IHR5cGU6ICR7dHlwZX07ICR7anNvbn1gKVxuICAgIH1cbiAgICByZXR1cm4gc2NvcGVDaGFpblxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShzY29wZURlc2NyaXB0b3IpXG4gICAgY29uc29sZS5sb2coc2NvcGVEZXNjcmlwdG9yLCBqc29uKVxuICAgIHRocm93IG5ldyBFcnJvcihgMDI6IFNjb3BlQ2hhaW4gaXMgbm90IGNvcnJlY3QgdHlwZTogJHt0eXBlfTsgJHtqc29ufWApXG4gIH1cbn1cbiJdfQ==