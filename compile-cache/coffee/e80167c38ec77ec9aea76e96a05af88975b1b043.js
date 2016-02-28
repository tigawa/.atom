(function() {
  var AutocompleteManager, CompositeDisposable, Disposable, ProviderManager, Range, SuggestionList, SuggestionListElement, fuzzaldrin, fuzzaldrinPlus, grim, minimatch, path, semver, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  path = require('path');

  semver = require('semver');

  fuzzaldrin = require('fuzzaldrin');

  fuzzaldrinPlus = require('fuzzaldrin-plus');

  ProviderManager = require('./provider-manager');

  SuggestionList = require('./suggestion-list');

  SuggestionListElement = require('./suggestion-list-element');

  minimatch = null;

  grim = null;

  module.exports = AutocompleteManager = (function() {
    AutocompleteManager.prototype.autosaveEnabled = false;

    AutocompleteManager.prototype.backspaceTriggersAutocomplete = true;

    AutocompleteManager.prototype.autoConfirmSingleSuggestionEnabled = true;

    AutocompleteManager.prototype.bracketMatcherPairs = ['()', '[]', '{}', '""', "''", '``', "“”", '‘’', "«»", "‹›"];

    AutocompleteManager.prototype.buffer = null;

    AutocompleteManager.prototype.compositionInProgress = false;

    AutocompleteManager.prototype.disposed = false;

    AutocompleteManager.prototype.editor = null;

    AutocompleteManager.prototype.editorSubscriptions = null;

    AutocompleteManager.prototype.editorView = null;

    AutocompleteManager.prototype.providerManager = null;

    AutocompleteManager.prototype.ready = false;

    AutocompleteManager.prototype.subscriptions = null;

    AutocompleteManager.prototype.suggestionDelay = 50;

    AutocompleteManager.prototype.suggestionList = null;

    AutocompleteManager.prototype.suppressForClasses = [];

    AutocompleteManager.prototype.shouldDisplaySuggestions = false;

    AutocompleteManager.prototype.prefixRegex = /(\b|['"~`!@#\$%^&*\(\)\{\}\[\]=\+,/\?>])((\w+[\w-]*)|([.:;[{(< ]+))$/;

    AutocompleteManager.prototype.wordPrefixRegex = /^\w+[\w-]*$/;

    function AutocompleteManager() {
      this.dispose = __bind(this.dispose, this);
      this.bufferChanged = __bind(this.bufferChanged, this);
      this.bufferSaved = __bind(this.bufferSaved, this);
      this.cursorMoved = __bind(this.cursorMoved, this);
      this.requestNewSuggestions = __bind(this.requestNewSuggestions, this);
      this.isCurrentFileBlackListed = __bind(this.isCurrentFileBlackListed, this);
      this.replaceTextWithMatch = __bind(this.replaceTextWithMatch, this);
      this.hideSuggestionList = __bind(this.hideSuggestionList, this);
      this.confirm = __bind(this.confirm, this);
      this.displaySuggestions = __bind(this.displaySuggestions, this);
      this.getSuggestionsFromProviders = __bind(this.getSuggestionsFromProviders, this);
      this.findSuggestions = __bind(this.findSuggestions, this);
      this.handleCommands = __bind(this.handleCommands, this);
      this.handleEvents = __bind(this.handleEvents, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.subscriptions = new CompositeDisposable;
      this.providerManager = new ProviderManager;
      this.suggestionList = new SuggestionList;
      this.subscriptions.add(this.providerManager);
      this.subscriptions.add(atom.views.addViewProvider(SuggestionList, function(model) {
        return new SuggestionListElement().initialize(model);
      }));
      this.handleEvents();
      this.handleCommands();
      this.subscriptions.add(this.suggestionList);
      this.ready = true;
    }

    AutocompleteManager.prototype.setSnippetsManager = function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    };

    AutocompleteManager.prototype.updateCurrentEditor = function(currentPaneItem) {
      var compositionEnd, compositionStart, _ref1;
      if ((currentPaneItem == null) || currentPaneItem === this.editor) {
        return;
      }
      if ((_ref1 = this.editorSubscriptions) != null) {
        _ref1.dispose();
      }
      this.editorSubscriptions = null;
      this.editor = null;
      this.editorView = null;
      this.buffer = null;
      this.isCurrentFileBlackListedCache = null;
      if (!this.paneItemIsValid(currentPaneItem)) {
        return;
      }
      this.editor = currentPaneItem;
      this.editorView = atom.views.getView(this.editor);
      this.buffer = this.editor.getBuffer();
      this.editorSubscriptions = new CompositeDisposable;
      this.editorSubscriptions.add(this.buffer.onDidSave(this.bufferSaved));
      this.editorSubscriptions.add(this.buffer.onDidChange(this.bufferChanged));
      compositionStart = (function(_this) {
        return function() {
          return _this.compositionInProgress = true;
        };
      })(this);
      compositionEnd = (function(_this) {
        return function() {
          return _this.compositionInProgress = false;
        };
      })(this);
      this.editorView.addEventListener('compositionstart', compositionStart);
      this.editorView.addEventListener('compositionend', compositionEnd);
      this.editorSubscriptions.add(new Disposable(function() {
        var _ref2, _ref3;
        if ((_ref2 = this.editorView) != null) {
          _ref2.removeEventListener('compositionstart', compositionStart);
        }
        return (_ref3 = this.editorView) != null ? _ref3.removeEventListener('compositionend', compositionEnd) : void 0;
      }));
      this.editorSubscriptions.add(this.editor.onDidChangeCursorPosition(this.cursorMoved));
      return this.editorSubscriptions.add(this.editor.onDidChangePath((function(_this) {
        return function() {
          return _this.isCurrentFileBlackListedCache = null;
        };
      })(this)));
    };

    AutocompleteManager.prototype.paneItemIsValid = function(paneItem) {
      if (typeof atom.workspace.isTextEditor === "function") {
        return atom.workspace.isTextEditor(paneItem);
      } else {
        if (paneItem == null) {
          return false;
        }
        return paneItem.getText != null;
      }
    };

    AutocompleteManager.prototype.handleEvents = function() {
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
      this.subscriptions.add(atom.config.observe('autosave.enabled', (function(_this) {
        return function(value) {
          return _this.autosaveEnabled = value;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.backspaceTriggersAutocomplete', (function(_this) {
        return function(value) {
          return _this.backspaceTriggersAutocomplete = value;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function(value) {
          return _this.autoActivationEnabled = value;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableAutoConfirmSingleSuggestion', (function(_this) {
        return function(value) {
          return _this.autoConfirmSingleSuggestionEnabled = value;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.consumeSuffix', (function(_this) {
        return function(value) {
          return _this.consumeSuffix = value;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.useAlternateScoring', (function(_this) {
        return function(value) {
          return _this.useAlternateScoring = value;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.fileBlacklist', (function(_this) {
        return function(value) {
          _this.fileBlacklist = value != null ? value.map(function(s) {
            return s.trim();
          }) : void 0;
          return _this.isCurrentFileBlackListedCache = null;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.suppressActivationForEditorClasses', (function(_this) {
        return function(value) {
          var className, classes, selector, _i, _len;
          _this.suppressForClasses = [];
          for (_i = 0, _len = value.length; _i < _len; _i++) {
            selector = value[_i];
            classes = (function() {
              var _j, _len1, _ref1, _results;
              _ref1 = selector.trim().split('.');
              _results = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                className = _ref1[_j];
                if (className.trim()) {
                  _results.push(className.trim());
                }
              }
              return _results;
            })();
            if (classes.length) {
              _this.suppressForClasses.push(classes);
            }
          }
        };
      })(this)));
      this.subscriptions.add(this.suggestionList.onDidConfirm(this.confirm));
      return this.subscriptions.add(this.suggestionList.onDidCancel(this.hideSuggestionList));
    };

    AutocompleteManager.prototype.handleCommands = function() {
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'autocomplete-plus:activate': (function(_this) {
          return function(event) {
            var _ref1, _ref2;
            _this.shouldDisplaySuggestions = true;
            return _this.findSuggestions((_ref1 = (_ref2 = event.detail) != null ? _ref2.activatedManually : void 0) != null ? _ref1 : true);
          };
        })(this)
      }));
    };

    AutocompleteManager.prototype.findSuggestions = function(activatedManually) {
      var bufferPosition, cursor, prefix, scopeDescriptor;
      if (this.disposed) {
        return;
      }
      if (!((this.providerManager != null) && (this.editor != null) && (this.buffer != null))) {
        return;
      }
      if (this.isCurrentFileBlackListed()) {
        return;
      }
      cursor = this.editor.getLastCursor();
      if (cursor == null) {
        return;
      }
      bufferPosition = cursor.getBufferPosition();
      scopeDescriptor = cursor.getScopeDescriptor();
      prefix = this.getPrefix(this.editor, bufferPosition);
      return this.getSuggestionsFromProviders({
        editor: this.editor,
        bufferPosition: bufferPosition,
        scopeDescriptor: scopeDescriptor,
        prefix: prefix,
        activatedManually: activatedManually
      });
    };

    AutocompleteManager.prototype.getSuggestionsFromProviders = function(options) {
      var providerPromises, providers, suggestionsPromise;
      providers = this.providerManager.providersForScopeDescriptor(options.scopeDescriptor);
      providerPromises = [];
      providers.forEach((function(_this) {
        return function(provider) {
          var apiIs20, apiVersion, getSuggestions, upgradedOptions;
          apiVersion = _this.providerManager.apiVersionForProvider(provider);
          apiIs20 = semver.satisfies(apiVersion, '>=2.0.0');
          if (apiIs20) {
            getSuggestions = provider.getSuggestions.bind(provider);
            upgradedOptions = options;
          } else {
            getSuggestions = provider.requestHandler.bind(provider);
            upgradedOptions = {
              editor: options.editor,
              prefix: options.prefix,
              bufferPosition: options.bufferPosition,
              position: options.bufferPosition,
              scope: options.scopeDescriptor,
              scopeChain: options.scopeDescriptor.getScopeChain(),
              buffer: options.editor.getBuffer(),
              cursor: options.editor.getLastCursor()
            };
          }
          return providerPromises.push(Promise.resolve(getSuggestions(upgradedOptions)).then(function(providerSuggestions) {
            var hasDeprecations, hasEmpty, suggestion, _i, _len;
            if (providerSuggestions == null) {
              return;
            }
            hasDeprecations = false;
            if (apiIs20 && providerSuggestions.length) {
              hasDeprecations = _this.deprecateForSuggestion(provider, providerSuggestions[0]);
            }
            if (hasDeprecations || !apiIs20) {
              providerSuggestions = providerSuggestions.map(function(suggestion) {
                var newSuggestion, _ref1, _ref2;
                newSuggestion = {
                  text: (_ref1 = suggestion.text) != null ? _ref1 : suggestion.word,
                  snippet: suggestion.snippet,
                  replacementPrefix: (_ref2 = suggestion.replacementPrefix) != null ? _ref2 : suggestion.prefix,
                  className: suggestion.className,
                  type: suggestion.type
                };
                if ((newSuggestion.rightLabelHTML == null) && suggestion.renderLabelAsHtml) {
                  newSuggestion.rightLabelHTML = suggestion.label;
                }
                if ((newSuggestion.rightLabel == null) && !suggestion.renderLabelAsHtml) {
                  newSuggestion.rightLabel = suggestion.label;
                }
                return newSuggestion;
              });
            }
            hasEmpty = false;
            for (_i = 0, _len = providerSuggestions.length; _i < _len; _i++) {
              suggestion = providerSuggestions[_i];
              if (!(suggestion.snippet || suggestion.text)) {
                hasEmpty = true;
              }
              if (suggestion.replacementPrefix == null) {
                suggestion.replacementPrefix = _this.getDefaultReplacementPrefix(options.prefix);
              }
              suggestion.provider = provider;
            }
            if (hasEmpty) {
              providerSuggestions = (function() {
                var _j, _len1, _results;
                _results = [];
                for (_j = 0, _len1 = providerSuggestions.length; _j < _len1; _j++) {
                  suggestion = providerSuggestions[_j];
                  if (suggestion.snippet || suggestion.text) {
                    _results.push(suggestion);
                  }
                }
                return _results;
              })();
            }
            if (provider.filterSuggestions) {
              providerSuggestions = _this.filterSuggestions(providerSuggestions, options);
            }
            return providerSuggestions;
          }));
        };
      })(this));
      if (!(providerPromises != null ? providerPromises.length : void 0)) {
        return;
      }
      return this.currentSuggestionsPromise = suggestionsPromise = Promise.all(providerPromises).then(this.mergeSuggestionsFromProviders).then((function(_this) {
        return function(suggestions) {
          if (_this.currentSuggestionsPromise !== suggestionsPromise) {
            return;
          }
          if (options.activatedManually && _this.shouldDisplaySuggestions && _this.autoConfirmSingleSuggestionEnabled && suggestions.length === 1) {
            return _this.confirm(suggestions[0]);
          } else {
            return _this.displaySuggestions(suggestions, options);
          }
        };
      })(this));
    };

    AutocompleteManager.prototype.filterSuggestions = function(suggestions, _arg) {
      var firstCharIsMatch, fuzzaldrinProvider, i, prefix, prefixIsEmpty, results, score, suggestion, suggestionPrefix, text, _i, _len, _ref1;
      prefix = _arg.prefix;
      results = [];
      fuzzaldrinProvider = this.useAlternateScoring ? fuzzaldrinPlus : fuzzaldrin;
      for (i = _i = 0, _len = suggestions.length; _i < _len; i = ++_i) {
        suggestion = suggestions[i];
        suggestion.sortScore = Math.max(-i / 10 + 3, 0) + 1;
        suggestion.score = null;
        text = suggestion.snippet || suggestion.text;
        suggestionPrefix = (_ref1 = suggestion.replacementPrefix) != null ? _ref1 : prefix;
        prefixIsEmpty = !suggestionPrefix || suggestionPrefix === ' ';
        firstCharIsMatch = !prefixIsEmpty && suggestionPrefix[0].toLowerCase() === text[0].toLowerCase();
        if (prefixIsEmpty) {
          results.push(suggestion);
        }
        if (firstCharIsMatch && (score = fuzzaldrinProvider.score(text, suggestionPrefix)) > 0) {
          suggestion.score = score * suggestion.sortScore;
          results.push(suggestion);
        }
      }
      results.sort(this.reverseSortOnScoreComparator);
      return results;
    };

    AutocompleteManager.prototype.reverseSortOnScoreComparator = function(a, b) {
      var _ref1, _ref2;
      return ((_ref1 = b.score) != null ? _ref1 : b.sortScore) - ((_ref2 = a.score) != null ? _ref2 : a.sortScore);
    };

    AutocompleteManager.prototype.mergeSuggestionsFromProviders = function(providerSuggestions) {
      return providerSuggestions.reduce(function(suggestions, providerSuggestions) {
        if (providerSuggestions != null ? providerSuggestions.length : void 0) {
          suggestions = suggestions.concat(providerSuggestions);
        }
        return suggestions;
      }, []);
    };

    AutocompleteManager.prototype.deprecateForSuggestion = function(provider, suggestion) {
      var hasDeprecations;
      hasDeprecations = false;
      if (suggestion.word != null) {
        hasDeprecations = true;
        if (grim == null) {
          grim = require('grim');
        }
        grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\nreturns suggestions with a `word` attribute.\nThe `word` attribute is now `text`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
      }
      if (suggestion.prefix != null) {
        hasDeprecations = true;
        if (grim == null) {
          grim = require('grim');
        }
        grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\nreturns suggestions with a `prefix` attribute.\nThe `prefix` attribute is now `replacementPrefix` and is optional.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
      }
      if (suggestion.label != null) {
        hasDeprecations = true;
        if (grim == null) {
          grim = require('grim');
        }
        grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\nreturns suggestions with a `label` attribute.\nThe `label` attribute is now `rightLabel` or `rightLabelHTML`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
      }
      if (suggestion.onWillConfirm != null) {
        hasDeprecations = true;
        if (grim == null) {
          grim = require('grim');
        }
        grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\nreturns suggestions with a `onWillConfirm` callback.\nThe `onWillConfirm` callback is no longer supported.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
      }
      if (suggestion.onDidConfirm != null) {
        hasDeprecations = true;
        if (grim == null) {
          grim = require('grim');
        }
        grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\nreturns suggestions with a `onDidConfirm` callback.\nThe `onDidConfirm` callback is now a `onDidInsertSuggestion` callback on the provider itself.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API");
      }
      return hasDeprecations;
    };

    AutocompleteManager.prototype.displaySuggestions = function(suggestions, options) {
      suggestions = this.getUniqueSuggestions(suggestions);
      if (this.shouldDisplaySuggestions && suggestions.length) {
        return this.showSuggestionList(suggestions, options);
      } else {
        return this.hideSuggestionList();
      }
    };

    AutocompleteManager.prototype.getUniqueSuggestions = function(suggestions) {
      var result, seen, suggestion, val, _i, _len;
      seen = {};
      result = [];
      for (_i = 0, _len = suggestions.length; _i < _len; _i++) {
        suggestion = suggestions[_i];
        val = suggestion.text + suggestion.snippet;
        if (!seen[val]) {
          result.push(suggestion);
          seen[val] = true;
        }
      }
      return result;
    };

    AutocompleteManager.prototype.getPrefix = function(editor, bufferPosition) {
      var line, _ref1;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((_ref1 = this.prefixRegex.exec(line)) != null ? _ref1[2] : void 0) || '';
    };

    AutocompleteManager.prototype.getDefaultReplacementPrefix = function(prefix) {
      if (this.wordPrefixRegex.test(prefix)) {
        return prefix;
      } else {
        return '';
      }
    };

    AutocompleteManager.prototype.confirm = function(suggestion) {
      var apiIs20, apiVersion, triggerPosition, _base, _ref1;
      if (!((this.editor != null) && (suggestion != null) && !this.disposed)) {
        return;
      }
      apiVersion = this.providerManager.apiVersionForProvider(suggestion.provider);
      apiIs20 = semver.satisfies(apiVersion, '>=2.0.0');
      triggerPosition = this.editor.getLastCursor().getBufferPosition();
      if (typeof suggestion.onWillConfirm === "function") {
        suggestion.onWillConfirm();
      }
      if ((_ref1 = this.editor.getSelections()) != null) {
        _ref1.forEach(function(selection) {
          return selection != null ? selection.clear() : void 0;
        });
      }
      this.hideSuggestionList();
      this.replaceTextWithMatch(suggestion);
      if (apiIs20) {
        return typeof (_base = suggestion.provider).onDidInsertSuggestion === "function" ? _base.onDidInsertSuggestion({
          editor: this.editor,
          suggestion: suggestion,
          triggerPosition: triggerPosition
        }) : void 0;
      } else {
        return typeof suggestion.onDidConfirm === "function" ? suggestion.onDidConfirm() : void 0;
      }
    };

    AutocompleteManager.prototype.showSuggestionList = function(suggestions, options) {
      if (this.disposed) {
        return;
      }
      this.suggestionList.changeItems(suggestions);
      return this.suggestionList.show(this.editor, options);
    };

    AutocompleteManager.prototype.hideSuggestionList = function() {
      if (this.disposed) {
        return;
      }
      this.suggestionList.changeItems(null);
      this.suggestionList.hide();
      return this.shouldDisplaySuggestions = false;
    };

    AutocompleteManager.prototype.requestHideSuggestionList = function(command) {
      this.hideTimeout = setTimeout(this.hideSuggestionList, 0);
      return this.shouldDisplaySuggestions = false;
    };

    AutocompleteManager.prototype.cancelHideSuggestionListRequest = function() {
      return clearTimeout(this.hideTimeout);
    };

    AutocompleteManager.prototype.replaceTextWithMatch = function(suggestion) {
      var cursors, newSelectedBufferRanges;
      if (this.editor == null) {
        return;
      }
      newSelectedBufferRanges = [];
      cursors = this.editor.getCursors();
      if (cursors == null) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var beginningPosition, cursor, endPosition, suffix, _i, _len, _ref1;
          for (_i = 0, _len = cursors.length; _i < _len; _i++) {
            cursor = cursors[_i];
            endPosition = cursor.getBufferPosition();
            beginningPosition = [endPosition.row, endPosition.column - suggestion.replacementPrefix.length];
            if (_this.editor.getTextInBufferRange([beginningPosition, endPosition]) === suggestion.replacementPrefix) {
              suffix = _this.consumeSuffix ? _this.getSuffix(_this.editor, endPosition, suggestion) : '';
              if (suffix.length) {
                cursor.moveRight(suffix.length);
              }
              cursor.selection.selectLeft(suggestion.replacementPrefix.length + suffix.length);
              if ((suggestion.snippet != null) && (_this.snippetsManager != null)) {
                _this.snippetsManager.insertSnippet(suggestion.snippet, _this.editor, cursor);
              } else {
                cursor.selection.insertText((_ref1 = suggestion.text) != null ? _ref1 : suggestion.snippet, {
                  autoIndentNewline: _this.editor.shouldAutoIndent(),
                  autoDecreaseIndent: _this.editor.shouldAutoIndent()
                });
              }
            }
          }
        };
      })(this));
    };

    AutocompleteManager.prototype.getSuffix = function(editor, bufferPosition, suggestion) {
      var endOfLineText, endPosition, nonWordCharacters, suffix, _ref1;
      suffix = (_ref1 = suggestion.snippet) != null ? _ref1 : suggestion.text;
      endPosition = [bufferPosition.row, bufferPosition.column + suffix.length];
      endOfLineText = editor.getTextInBufferRange([bufferPosition, endPosition]);
      nonWordCharacters = new Set(atom.config.get('editor.nonWordCharacters').split(''));
      while (suffix) {
        if (endOfLineText.startsWith(suffix) && !nonWordCharacters.has(suffix[0])) {
          break;
        }
        suffix = suffix.slice(1);
      }
      return suffix;
    };

    AutocompleteManager.prototype.isCurrentFileBlackListed = function() {
      var blacklistGlob, fileName, _i, _len, _ref1;
      if (this.isCurrentFileBlackListedCache != null) {
        return this.isCurrentFileBlackListedCache;
      }
      if ((this.fileBlacklist == null) || this.fileBlacklist.length === 0) {
        this.isCurrentFileBlackListedCache = false;
        return this.isCurrentFileBlackListedCache;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      fileName = path.basename(this.buffer.getPath());
      _ref1 = this.fileBlacklist;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        blacklistGlob = _ref1[_i];
        if (minimatch(fileName, blacklistGlob)) {
          this.isCurrentFileBlackListedCache = true;
          return this.isCurrentFileBlackListedCache;
        }
      }
      return this.isCurrentFileBlackListedCache = false;
    };

    AutocompleteManager.prototype.requestNewSuggestions = function() {
      var delay;
      delay = atom.config.get('autocomplete-plus.autoActivationDelay');
      clearTimeout(this.delayTimeout);
      if (this.suggestionList.isActive()) {
        delay = this.suggestionDelay;
      }
      this.delayTimeout = setTimeout(this.findSuggestions, delay);
      return this.shouldDisplaySuggestions = true;
    };

    AutocompleteManager.prototype.cancelNewSuggestionsRequest = function() {
      clearTimeout(this.delayTimeout);
      return this.shouldDisplaySuggestions = false;
    };

    AutocompleteManager.prototype.cursorMoved = function(_arg) {
      var textChanged;
      textChanged = _arg.textChanged;
      if (!textChanged) {
        return this.requestHideSuggestionList();
      }
    };

    AutocompleteManager.prototype.bufferSaved = function() {
      if (!this.autosaveEnabled) {
        return this.hideSuggestionList();
      }
    };

    AutocompleteManager.prototype.bufferChanged = function(_arg) {
      var cursorPositions, newRange, newText, oldRange, oldText, shouldActivate;
      newText = _arg.newText, newRange = _arg.newRange, oldText = _arg.oldText, oldRange = _arg.oldRange;
      if (this.disposed) {
        return;
      }
      if (this.compositionInProgress) {
        return this.hideSuggestionList();
      }
      shouldActivate = false;
      cursorPositions = this.editor.getCursorBufferPositions();
      if (this.autoActivationEnabled || this.suggestionList.isActive()) {
        if (newText.length > 0) {
          shouldActivate = (cursorPositions.some(function(position) {
            return newRange.containsPoint(position);
          })) && (newText === ' ' || newText.trim().length === 1 || __indexOf.call(this.bracketMatcherPairs, newText) >= 0);
        } else if (oldText.length > 0) {
          shouldActivate = (this.backspaceTriggersAutocomplete || this.suggestionList.isActive()) && (cursorPositions.some(function(position) {
            return newRange.containsPoint(position);
          })) && (oldText === ' ' || oldText.trim().length === 1 || __indexOf.call(this.bracketMatcherPairs, oldText) >= 0);
        }
        if (shouldActivate && this.shouldSuppressActivationForEditorClasses()) {
          shouldActivate = false;
        }
      }
      if (shouldActivate) {
        this.cancelHideSuggestionListRequest();
        return this.requestNewSuggestions();
      } else {
        this.cancelNewSuggestionsRequest();
        return this.hideSuggestionList();
      }
    };

    AutocompleteManager.prototype.shouldSuppressActivationForEditorClasses = function() {
      var className, classNames, containsCount, _i, _j, _len, _len1, _ref1;
      _ref1 = this.suppressForClasses;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        classNames = _ref1[_i];
        containsCount = 0;
        for (_j = 0, _len1 = classNames.length; _j < _len1; _j++) {
          className = classNames[_j];
          if (this.editorView.classList.contains(className)) {
            containsCount += 1;
          }
        }
        if (containsCount === classNames.length) {
          return true;
        }
      }
      return false;
    };

    AutocompleteManager.prototype.dispose = function() {
      var _ref1, _ref2;
      this.hideSuggestionList();
      this.disposed = true;
      this.ready = false;
      if ((_ref1 = this.editorSubscriptions) != null) {
        _ref1.dispose();
      }
      this.editorSubscriptions = null;
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      this.subscriptions = null;
      this.suggestionList = null;
      return this.providerManager = null;
    };

    return AutocompleteManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvYXV0b2NvbXBsZXRlLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9MQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxPQUE0QyxPQUFBLENBQVEsTUFBUixDQUE1QyxFQUFDLGFBQUEsS0FBRCxFQUFRLDJCQUFBLG1CQUFSLEVBQTZCLGtCQUFBLFVBQTdCLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUhiLENBQUE7O0FBQUEsRUFJQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxpQkFBUixDQUpqQixDQUFBOztBQUFBLEVBTUEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FObEIsQ0FBQTs7QUFBQSxFQU9BLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBUGpCLENBQUE7O0FBQUEsRUFRQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsMkJBQVIsQ0FSeEIsQ0FBQTs7QUFBQSxFQVdBLFNBQUEsR0FBWSxJQVhaLENBQUE7O0FBQUEsRUFZQSxJQUFBLEdBQU8sSUFaUCxDQUFBOztBQUFBLEVBY0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGtDQUFBLGVBQUEsR0FBaUIsS0FBakIsQ0FBQTs7QUFBQSxrQ0FDQSw2QkFBQSxHQUErQixJQUQvQixDQUFBOztBQUFBLGtDQUVBLGtDQUFBLEdBQW9DLElBRnBDLENBQUE7O0FBQUEsa0NBR0EsbUJBQUEsR0FBcUIsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/autocomplete-manager.coffee
