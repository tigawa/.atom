(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      enableAutoActivation: {
        title: 'Show Suggestions On Keystroke',
        description: 'Suggestions will show as you type if this preference is enabled. If it is disabled, you can still see suggestions by using the keymapping for autocomplete-plus:activate (shown below).',
        type: 'boolean',
        "default": true,
        order: 1
      },
      autoActivationDelay: {
        title: 'Delay Before Suggestions Are Shown',
        description: 'This prevents suggestions from being shown too frequently. Usually, the default works well. A lower value than the default has performance implications, and is not advised.',
        type: 'integer',
        "default": 100,
        order: 2
      },
      maxVisibleSuggestions: {
        title: 'Maximum Visible Suggestions',
        description: 'The suggestion list will only show this many suggestions.',
        type: 'integer',
        "default": 10,
        minimum: 1,
        order: 3
      },
      confirmCompletion: {
        title: 'Keymap For Confirming A Suggestion',
        description: 'You should use the key(s) indicated here to confirm a suggestion from the suggestion list and have it inserted into the file.',
        type: 'string',
        "default": 'tab and enter',
        "enum": ['tab', 'enter', 'tab and enter'],
        order: 4
      },
      useCoreMovementCommands: {
        title: 'Use Core Movement Commands',
        description: 'Disable this if you want to bind your own keystrokes to move around the suggestion list. You will also need to add definitions to your keymap. See: https://github.com/atom/autocomplete-plus#remapping-movement-commands',
        type: 'boolean',
        "default": true,
        order: 5
      },
      fileBlacklist: {
        title: 'File Blacklist',
        description: 'Suggestions will not be provided for files matching this list, e.g. *.md for Markdown files. To blacklist more than one file extension, use comma as a separator, e.g. *.md, *.txt (both Markdown and text files).',
        type: 'array',
        "default": ['.*'],
        items: {
          type: 'string'
        },
        order: 6
      },
      scopeBlacklist: {
        title: 'Scope Blacklist',
        description: 'Suggestions will not be provided for scopes matching this list. See: https://atom.io/docs/latest/behind-atom-scoped-settings-scopes-and-scope-descriptors',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        },
        order: 7
      },
      includeCompletionsFromAllBuffers: {
        title: 'Include Completions From All Buffers',
        description: 'For grammars with no registered provider(s), the default provider will include completions from all buffers, instead of just the buffer you are currently editing.',
        type: 'boolean',
        "default": true,
        order: 8
      },
      strictMatching: {
        title: 'Use Strict Matching For Built-In Provider',
        description: 'Fuzzy searching is performed if this is disabled; if it is enabled, suggestions must begin with the prefix from the current word.',
        type: 'boolean',
        "default": false,
        order: 9
      },
      minimumWordLength: {
        description: "Only autocomplete when you've typed at least this many characters. Note: May not affect external providers.",
        type: 'integer',
        "default": 3,
        order: 10
      },
      enableBuiltinProvider: {
        title: 'Enable Built-In Provider',
        description: 'The package comes with a built-in provider that will provide suggestions using the words in your current buffer or all open buffers. You will get better suggestions by installing additional autocomplete+ providers. To stop using the built-in provider, disable this option.',
        type: 'boolean',
        "default": true,
        order: 11
      },
      builtinProviderBlacklist: {
        title: 'Built-In Provider Blacklist',
        description: 'Don\'t use the built-in provider for these selector(s).',
        type: 'string',
        "default": '.source.gfm',
        order: 12
      },
      backspaceTriggersAutocomplete: {
        title: 'Allow Backspace To Trigger Autocomplete',
        description: 'If enabled, typing `backspace` will show the suggestion list if suggestions are available. If disabled, suggestions will not be shown while backspacing.',
        type: 'boolean',
        "default": false,
        order: 13
      },
      enableAutoConfirmSingleSuggestion: {
        title: 'Automatically Confirm Single Suggestion',
        description: 'If enabled, automatically insert suggestion on manual activation with autocomplete-plus:activate when there is only one match.',
        type: 'boolean',
        "default": true,
        order: 14
      },
      suggestionListFollows: {
        title: 'Suggestions List Follows',
        description: 'With "Cursor" the suggestion list appears at the cursor\'s position. With "Word" it appears at the beginning of the word that\'s being completed.',
        type: 'string',
        "default": 'Word',
        "enum": ['Word', 'Cursor'],
        order: 15
      },
      defaultProvider: {
        description: 'Using the Symbol provider is experimental. You must reload Atom to use a new provider after changing this option.',
        type: 'string',
        "default": 'Symbol',
        "enum": ['Fuzzy', 'Symbol'],
        order: 16
      },
      suppressActivationForEditorClasses: {
        title: 'Suppress Activation For Editor Classes',
        description: 'Don\'t auto-activate when any of these classes are present in the editor.',
        type: 'array',
        "default": ['vim-mode.command-mode', 'vim-mode.visual-mode', 'vim-mode.operator-pending-mode'],
        items: {
          type: 'string'
        },
        order: 17
      },
      consumeSuffix: {
        title: 'Consume suggestion text following the cursor',
        description: 'Completing a suggestion consumes text following the cursor matching the suffix of the chosen suggestion.',
        type: 'boolean',
        "default": true,
        order: 18
      },
      useAlternateScoring: {
        description: "Prefers runs of consecutive characters, acronyms and start of words. (Experimental)",
        type: 'boolean',
        "default": true,
        order: 19
      },
      useLocalityBonus: {
        description: "Gives words near the cursor position a higher score than those far away",
        type: 'boolean',
        "default": true,
        order: 20
      }
    },
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLCtCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEseUxBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FERjtBQUFBLE1BTUEsbUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLG9DQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsOEtBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsR0FIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FQRjtBQUFBLE1BWUEscUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLDZCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsMkRBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsRUFIVDtBQUFBLFFBSUEsT0FBQSxFQUFTLENBSlQ7QUFBQSxRQUtBLEtBQUEsRUFBTyxDQUxQO09BYkY7QUFBQSxNQW1CQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sb0NBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSwrSEFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLFNBQUEsRUFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/main.coffee
