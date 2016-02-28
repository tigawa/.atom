(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    autocompleteManager: null,
    subscriptions: null,
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      return this.requireAutocompleteManagerAsync();
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.subscriptions) != null) {
        _ref.dispose();
      }
      this.subscriptions = null;
      return this.autocompleteManager = null;
    },
    requireAutocompleteManagerAsync: function(callback) {
      if (this.autocompleteManager != null) {
        return typeof callback === "function" ? callback(this.autocompleteManager) : void 0;
      } else {
        return setImmediate((function(_this) {
          return function() {
            var autocompleteManager;
            autocompleteManager = _this.getAutocompleteManager();
            return typeof callback === "function" ? callback(autocompleteManager) : void 0;
          };
        })(this));
      }
    },
    getAutocompleteManager: function() {
      var AutocompleteManager;
      if (this.autocompleteManager == null) {
        AutocompleteManager = require('./autocomplete-manager');
        this.autocompleteManager = new AutocompleteManager();
        this.subscriptions.add(this.autocompleteManager);
      }
      return this.autocompleteManager;
    },
    consumeSnippets: function(snippetsManager) {
      return this.requireAutocompleteManagerAsync(function(autocompleteManager) {
        return autocompleteManager.setSnippetsManager(snippetsManager);
      });
    },

    /*
    Section: Provider API
     */
    consumeProviderLegacy: function(service) {
      if ((service != null ? service.provider : void 0) == null) {
        return;
      }
      return this.consumeProvider([service.provider], '1.0.0');
    },
    consumeProvidersLegacy: function(service) {
      return this.consumeProvider(service != null ? service.providers : void 0, '1.1.0');
    },
    consumeProvider: function(providers, apiVersion) {
      var registrations;
      if (apiVersion == null) {
        apiVersion = '2.0.0';
      }
      if ((providers != null) && !Array.isArray(providers)) {
        providers = [providers];
      }
      if (!((providers != null ? providers.length : void 0) > 0)) {
        return;
      }
      registrations = new CompositeDisposable;
      this.requireAutocompleteManagerAsync(function(autocompleteManager) {
        var provider, _i, _len;
        for (_i = 0, _len = providers.length; _i < _len; _i++) {
          provider = providers[_i];
          registrations.add(autocompleteManager.providerManager.registerProvider(provider, apiVersion));
        }
      });
      return registrations;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLG1CQUFBLEVBQXFCLElBQXJCO0FBQUEsSUFDQSxhQUFBLEVBQWUsSUFEZjtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO2FBQ0EsSUFBQyxDQUFBLCtCQUFELENBQUEsRUFGUTtJQUFBLENBSlY7QUFBQSxJQVNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixVQUFBLElBQUE7O1lBQWMsQ0FBRSxPQUFoQixDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBRGpCLENBQUE7YUFFQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FIYjtJQUFBLENBVFo7QUFBQSxJQWNBLCtCQUFBLEVBQWlDLFNBQUMsUUFBRCxHQUFBO0FBQy9CLE1BQUEsSUFBRyxnQ0FBSDtnREFDRSxTQUFVLElBQUMsQ0FBQSw4QkFEYjtPQUFBLE1BQUE7ZUFHRSxZQUFBLENBQWEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDWCxnQkFBQSxtQkFBQTtBQUFBLFlBQUEsbUJBQUEsR0FBc0IsS0FBQyxDQUFBLHNCQUFELENBQUEsQ0FBdEIsQ0FBQTtvREFDQSxTQUFVLDhCQUZDO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixFQUhGO09BRCtCO0lBQUEsQ0FkakM7QUFBQSxJQXNCQSxzQkFBQSxFQUF3QixTQUFBLEdBQUE7QUFDdEIsVUFBQSxtQkFBQTtBQUFBLE1BQUEsSUFBTyxnQ0FBUDtBQUNFLFFBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBQXRCLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQUEsQ0FEM0IsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxtQkFBcEIsQ0FGQSxDQURGO09BQUE7YUFJQSxJQUFDLENBQUEsb0JBTHFCO0lBQUEsQ0F0QnhCO0FBQUEsSUE2QkEsZUFBQSxFQUFpQixTQUFDLGVBQUQsR0FBQTthQUNmLElBQUMsQ0FBQSwrQkFBRCxDQUFpQyxTQUFDLG1CQUFELEdBQUE7ZUFDL0IsbUJBQW1CLENBQUMsa0JBQXBCLENBQXVDLGVBQXZDLEVBRCtCO01BQUEsQ0FBakMsRUFEZTtJQUFBLENBN0JqQjtBQWlDQTtBQUFBOztPQWpDQTtBQUFBLElBdUNBLHFCQUFBLEVBQXVCLFNBQUMsT0FBRCxHQUFBO0FBRXJCLE1BQUEsSUFBYyxxREFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQyxPQUFPLENBQUMsUUFBVCxDQUFqQixFQUFxQyxPQUFyQyxFQUhxQjtJQUFBLENBdkN2QjtBQUFBLElBOENBLHNCQUFBLEVBQXdCLFNBQUMsT0FBRCxHQUFBO2FBRXRCLElBQUMsQ0FBQSxlQUFELG1CQUFpQixPQUFPLENBQUUsa0JBQTFCLEVBQXFDLE9BQXJDLEVBRnNCO0lBQUEsQ0E5Q3hCO0FBQUEsSUFvREEsZUFBQSxFQUFpQixTQUFDLFNBQUQsRUFBWSxVQUFaLEdBQUE7QUFDZixVQUFBLGFBQUE7O1FBRDJCLGFBQVc7T0FDdEM7QUFBQSxNQUFBLElBQTJCLG1CQUFBLElBQWUsQ0FBQSxLQUFTLENBQUMsT0FBTixDQUFjLFNBQWQsQ0FBOUM7QUFBQSxRQUFBLFNBQUEsR0FBWSxDQUFDLFNBQUQsQ0FBWixDQUFBO09BQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxzQkFBYyxTQUFTLENBQUUsZ0JBQVgsR0FBb0IsQ0FBbEMsQ0FBQTtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxhQUFBLEdBQWdCLEdBQUEsQ0FBQSxtQkFGaEIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLCtCQUFELENBQWlDLFNBQUMsbUJBQUQsR0FBQTtBQUMvQixZQUFBLGtCQUFBO0FBQUEsYUFBQSxnREFBQTttQ0FBQTtBQUNFLFVBQUEsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsbUJBQW1CLENBQUMsZUFBZSxDQUFDLGdCQUFwQyxDQUFxRCxRQUFyRCxFQUErRCxVQUEvRCxDQUFsQixDQUFBLENBREY7QUFBQSxTQUQrQjtNQUFBLENBQWpDLENBSEEsQ0FBQTthQU9BLGNBUmU7SUFBQSxDQXBEakI7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/main.coffee
