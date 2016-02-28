(function() {
  var AutocompleteManager, CompositeDisposable, Disposable, Point, ProviderManager, Range, SuggestionList, SuggestionListElement, UnicodeLetters, fuzzaldrin, fuzzaldrinPlus, grim, minimatch, path, semver, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  path = require('path');

  semver = require('semver');

  fuzzaldrin = require('fuzzaldrin');

  fuzzaldrinPlus = require('fuzzaldrin-plus');

  ProviderManager = require('./provider-manager');

  SuggestionList = require('./suggestion-list');

  SuggestionListElement = require('./suggestion-list-element');

  UnicodeLetters = require('./unicode-helpers').UnicodeLetters;

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

    AutocompleteManager.prototype.prefixRegex = null;

    AutocompleteManager.prototype.wordPrefixRegex = null;

    function AutocompleteManager() {
      this.dispose = __bind(this.dispose, this);
      this.showOrHideSuggestionListForBufferChange = __bind(this.showOrHideSuggestionListForBufferChange, this);
      this.showOrHideSuggestionListForBufferChanges = __bind(this.showOrHideSuggestionListForBufferChanges, this);
      this.toggleActivationForBufferChange = __bind(this.toggleActivationForBufferChange, this);
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
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', (function(_this) {
        return function(enableExtendedUnicodeSupport) {
          if (enableExtendedUnicodeSupport) {
            _this.prefixRegex = new RegExp("(['\"~`!@#\\$%^&*\\(\\)\\{\\}\\[\\]=\+,/\\?>])?(([" + UnicodeLetters + "\\d_]+[" + UnicodeLetters + "\\d_-]*)|([.:;[{(< ]+))$");
            return _this.wordPrefixRegex = new RegExp("^[" + UnicodeLetters + "\\d_]+[" + UnicodeLetters + "\\d_-]*$");
          } else {
            _this.prefixRegex = /(\b|['"~`!@#\$%^&*\(\)\{\}\[\]=\+,/\?>])((\w+[\w-]*)|([.:;[{(< ]+))$/;
            return _this.wordPrefixRegex = /^\w+[\w-]*$/;
          }
        };
      })(this)));
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
      if (typeof this.buffer.onDidChangeText === "function") {
        this.editorSubscriptions.add(this.buffer.onDidChange(this.toggleActivationForBufferChange));
        this.editorSubscriptions.add(this.buffer.onDidChangeText(this.showOrHideSuggestionListForBufferChanges));
      } else {
        this.editorSubscriptions.add(this.buffer.onDidChange(this.showOrHideSuggestionListForBufferChange));
      }
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
      if (!(textChanged || this.shouldActivate)) {
        return this.requestHideSuggestionList();
      }
    };

    AutocompleteManager.prototype.bufferSaved = function() {
      if (!this.autosaveEnabled) {
        return this.hideSuggestionList();
      }
    };

    AutocompleteManager.prototype.toggleActivationForBufferChange = function(_arg) {
      var newRange, newText, oldRange, oldText;
      newText = _arg.newText, newRange = _arg.newRange, oldText = _arg.oldText, oldRange = _arg.oldRange;
      if (this.disposed) {
        return;
      }
      if (this.shouldActivate) {
        return;
      }
      if (this.compositionInProgress) {
        return this.hideSuggestionList();
      }
      if (this.autoActivationEnabled || this.suggestionList.isActive()) {
        if (newText.length > 0) {
          this.shouldActivate = newText === ' ' || newText.trim().length === 1 || __indexOf.call(this.bracketMatcherPairs, newText) >= 0;
        } else if (oldText.length > 0) {
          this.shouldActivate = (this.backspaceTriggersAutocomplete || this.suggestionList.isActive()) && (oldText === ' ' || oldText.trim().length === 1 || __indexOf.call(this.bracketMatcherPairs, oldText) >= 0);
        }
        if (this.shouldActivate && this.shouldSuppressActivationForEditorClasses()) {
          return this.shouldActivate = false;
        }
      }
    };

    AutocompleteManager.prototype.showOrHideSuggestionListForBufferChanges = function(_arg) {
      var changeOccurredNearLastCursor, changes, lastCursorPosition;
      changes = _arg.changes;
      lastCursorPosition = this.editor.getLastCursor().getBufferPosition();
      changeOccurredNearLastCursor = changes.some(function(_arg1) {
        var newExtent, newRange, start;
        start = _arg1.start, newExtent = _arg1.newExtent;
        newRange = new Range(start, start.traverse(newExtent));
        return newRange.containsPoint(lastCursorPosition);
      });
      if (this.shouldActivate && changeOccurredNearLastCursor) {
        this.cancelHideSuggestionListRequest();
        this.requestNewSuggestions();
      } else {
        this.cancelNewSuggestionsRequest();
        this.hideSuggestionList();
      }
      return this.shouldActivate = false;
    };

    AutocompleteManager.prototype.showOrHideSuggestionListForBufferChange = function(_arg) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvYXV0b2NvbXBsZXRlLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJNQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxPQUFtRCxPQUFBLENBQVEsTUFBUixDQUFuRCxFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixFQUFlLDJCQUFBLG1CQUFmLEVBQW9DLGtCQUFBLFVBQXBDLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUhiLENBQUE7O0FBQUEsRUFJQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxpQkFBUixDQUpqQixDQUFBOztBQUFBLEVBTUEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FObEIsQ0FBQTs7QUFBQSxFQU9BLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBUGpCLENBQUE7O0FBQUEsRUFRQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsMkJBQVIsQ0FSeEIsQ0FBQTs7QUFBQSxFQVNDLGlCQUFrQixPQUFBLENBQVEsbUJBQVIsRUFBbEIsY0FURCxDQUFBOztBQUFBLEVBWUEsU0FBQSxHQUFZLElBWlosQ0FBQTs7QUFBQSxFQWFBLElBQUEsR0FBTyxJQWJQLENBQUE7O0FBQUEsRUFlQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsZUFBQSxHQUFpQixLQUFqQixDQUFBOztBQUFBLGtDQUNBLDZCQUFBLEdBQStCLElBRC9CLENBQUE7O0FBQUEsa0NBRUEsa0NBQUEsR0FB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/autocomplete-manager.coffee
