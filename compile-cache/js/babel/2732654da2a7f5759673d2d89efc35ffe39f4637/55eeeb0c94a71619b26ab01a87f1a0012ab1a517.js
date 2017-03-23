'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _fuzzaldrin = require('fuzzaldrin');

var _fuzzaldrin2 = _interopRequireDefault(_fuzzaldrin);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _providerManager = require('./provider-manager');

var _providerManager2 = _interopRequireDefault(_providerManager);

var _suggestionList = require('./suggestion-list');

var _suggestionList2 = _interopRequireDefault(_suggestionList);

var _unicodeHelpers = require('./unicode-helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Deferred requires
let minimatch = null;
let grim = null;

let AutocompleteManager = class AutocompleteManager {
  constructor() {
    this.autosaveEnabled = false;
    this.backspaceTriggersAutocomplete = true;
    this.autoConfirmSingleSuggestionEnabled = true;
    this.bracketMatcherPairs = ['()', '[]', '{}', '""', "''", '``', '“”', '‘’', '«»', '‹›'];
    this.buffer = null;
    this.compositionInProgress = false;
    this.disposed = false;
    this.editor = null;
    this.editorSubscriptions = null;
    this.editorView = null;
    this.providerManager = null;
    this.ready = false;
    this.subscriptions = null;
    this.suggestionDelay = 50;
    this.suggestionList = null;
    this.suppressForClasses = [];
    this.shouldDisplaySuggestions = false;
    this.prefixRegex = null;
    this.wordPrefixRegex = null;
    this.updateCurrentEditor = this.updateCurrentEditor.bind(this);
    this.handleCommands = this.handleCommands.bind(this);
    this.findSuggestions = this.findSuggestions.bind(this);
    this.getSuggestionsFromProviders = this.getSuggestionsFromProviders.bind(this);
    this.displaySuggestions = this.displaySuggestions.bind(this);
    this.hideSuggestionList = this.hideSuggestionList.bind(this);

    this.toggleActivationForBufferChange = this.toggleActivationForBufferChange.bind(this);
    this.showOrHideSuggestionListForBufferChanges = this.showOrHideSuggestionListForBufferChanges.bind(this);
    this.showOrHideSuggestionListForBufferChange = this.showOrHideSuggestionListForBufferChange.bind(this);
    this.subscriptions = new _atom.CompositeDisposable();
    this.providerManager = new _providerManager2.default();
    this.suggestionList = new _suggestionList2.default();

    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', enableExtendedUnicodeSupport => {
      if (enableExtendedUnicodeSupport) {
        this.prefixRegex = new RegExp(`(['"~\`!@#\\$%^&*\\(\\)\\{\\}\\[\\]=+,/\\?>])?(([${_unicodeHelpers.UnicodeLetters}\\d_]+[${_unicodeHelpers.UnicodeLetters}\\d_-]*)|([.:;[{(< ]+))$`);
        this.wordPrefixRegex = new RegExp(`^[${_unicodeHelpers.UnicodeLetters}\\d_]+[${_unicodeHelpers.UnicodeLetters}\\d_-]*$`);
      } else {
        this.prefixRegex = /(\b|['"~`!@#$%^&*(){}[\]=+,/?>])((\w+[\w-]*)|([.:;[{(< ]+))$/;
        this.wordPrefixRegex = /^\w+[\w-]*$/;
      }
    }));
    this.subscriptions.add(this.providerManager);
    this.handleEvents();
    this.handleCommands();
    this.subscriptions.add(this.suggestionList); // We're adding this last so it is disposed after events
    this.ready = true;
  }

  setSnippetsManager(snippetsManager) {
    this.snippetsManager = snippetsManager;
  }

  updateCurrentEditor(currentEditor) {
    if (currentEditor == null || currentEditor === this.editor) {
      return;
    }
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }
    this.editorSubscriptions = null;

    // Stop tracking editor + buffer
    this.editor = null;
    this.editorView = null;
    this.buffer = null;
    this.isCurrentFileBlackListedCache = null;

    if (!this.editorIsValid(currentEditor)) {
      return;
    }

    // Track the new editor, editorView, and buffer
    this.editor = currentEditor;
    this.editorView = atom.views.getView(this.editor);
    this.buffer = this.editor.getBuffer();

    this.editorSubscriptions = new _atom.CompositeDisposable();

    // Subscribe to buffer events:
    this.editorSubscriptions.add(this.buffer.onDidSave(e => {
      this.bufferSaved(e);
    }));
    if (typeof this.buffer.onDidChangeText === 'function') {
      this.editorSubscriptions.add(this.buffer.onDidChange(this.toggleActivationForBufferChange));
      this.editorSubscriptions.add(this.buffer.onDidChangeText(this.showOrHideSuggestionListForBufferChanges));
    } else {
      // TODO: Remove this after `TextBuffer.prototype.onDidChangeText` lands on Atom stable.
      this.editorSubscriptions.add(this.buffer.onDidChange(this.showOrHideSuggestionListForBufferChange));
    }

    // Watch IME Events To Allow IME To Function Without The Suggestion List Showing
    const compositionStart = () => {
      this.compositionInProgress = true;
    };
    const compositionEnd = () => {
      this.compositionInProgress = false;
    };

    this.editorView.addEventListener('compositionstart', compositionStart);
    this.editorView.addEventListener('compositionend', compositionEnd);
    this.editorSubscriptions.add(new _atom.Disposable(() => {
      if (this.editorView) {
        this.editorView.removeEventListener('compositionstart', compositionStart);
        this.editorView.removeEventListener('compositionend', compositionEnd);
      }
    }));

    // Subscribe to editor events:
    // Close the overlay when the cursor moved without changing any text
    this.editorSubscriptions.add(this.editor.onDidChangeCursorPosition(e => {
      this.cursorMoved(e);
    }));
    return this.editorSubscriptions.add(this.editor.onDidChangePath(() => {
      this.isCurrentFileBlackListedCache = null;
    }));
  }

  editorIsValid(editor) {
    // TODO: remove conditional when `isTextEditor` is shipped.
    if (typeof atom.workspace.isTextEditor === 'function') {
      return atom.workspace.isTextEditor(editor);
    } else {
      if (editor == null) {
        return false;
      }
      // Should we disqualify TextEditors with the Grammar text.plain.null-grammar?
      return editor.getText != null;
    }
  }

  handleEvents() {
    this.subscriptions.add(atom.textEditors.observe(editor => {
      const view = atom.views.getView(editor);
      if (view === document.activeElement.closest('atom-text-editor')) {
        this.updateCurrentEditor(editor);
      }
      view.addEventListener('focus', element => {
        this.updateCurrentEditor(editor);
      });
    }));

    // Watch config values
    this.subscriptions.add(atom.config.observe('autosave.enabled', value => {
      this.autosaveEnabled = value;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.backspaceTriggersAutocomplete', value => {
      this.backspaceTriggersAutocomplete = value;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableAutoActivation', value => {
      this.autoActivationEnabled = value;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableAutoConfirmSingleSuggestion', value => {
      this.autoConfirmSingleSuggestionEnabled = value;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.consumeSuffix', value => {
      this.consumeSuffix = value;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.useAlternateScoring', value => {
      this.useAlternateScoring = value;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.fileBlacklist', value => {
      if (value) {
        this.fileBlacklist = value.map(s => {
          return s.trim();
        });
      }
      this.isCurrentFileBlackListedCache = null;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.suppressActivationForEditorClasses', value => {
      this.suppressForClasses = [];
      for (let i = 0; i < value.length; i++) {
        const selector = value[i];
        const classes = selector.trim().split('.').filter(className => className.trim()).map(className => className.trim());
        if (classes.length) {
          this.suppressForClasses.push(classes);
        }
      }
    }));

    // Handle events from suggestion list
    this.subscriptions.add(this.suggestionList.onDidConfirm(e => {
      this.confirm(e);
    }));
    this.subscriptions.add(this.suggestionList.onDidCancel(this.hideSuggestionList));
  }

  handleCommands() {
    return this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'autocomplete-plus:activate': event => {
        this.shouldDisplaySuggestions = true;
        let activatedManually = true;
        if (event.detail && event.detail.activatedManually !== null && typeof event.detail.activatedManually !== 'undefined') {
          activatedManually = event.detail.activatedManually;
        }
        this.findSuggestions(activatedManually);
      }
    }));
  }

  // Private: Finds suggestions for the current prefix, sets the list items,
  // positions the overlay and shows it
  findSuggestions(activatedManually) {
    if (this.disposed) {
      return;
    }
    if (this.providerManager == null || this.editor == null || this.buffer == null) {
      return;
    }
    if (this.isCurrentFileBlackListed()) {
      return;
    }
    const cursor = this.editor.getLastCursor();
    if (cursor == null) {
      return;
    }

    const bufferPosition = cursor.getBufferPosition();
    const scopeDescriptor = cursor.getScopeDescriptor();
    const prefix = this.getPrefix(this.editor, bufferPosition);

    return this.getSuggestionsFromProviders({ editor: this.editor, bufferPosition, scopeDescriptor, prefix, activatedManually });
  }

  getSuggestionsFromProviders(options) {
    let suggestionsPromise;
    const providers = this.providerManager.applicableProviders(options.editor, options.scopeDescriptor);

    const providerPromises = [];
    providers.forEach(provider => {
      const apiVersion = this.providerManager.apiVersionForProvider(provider);
      const apiIs20 = _semver2.default.satisfies(apiVersion, '>=2.0.0');

      // TODO API: remove upgrading when 1.0 support is removed
      let getSuggestions;
      let upgradedOptions;
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

      return providerPromises.push(Promise.resolve(getSuggestions(upgradedOptions)).then(providerSuggestions => {
        if (providerSuggestions == null) {
          return;
        }

        // TODO API: remove upgrading when 1.0 support is removed
        let hasDeprecations = false;
        if (apiIs20 && providerSuggestions.length) {
          hasDeprecations = this.deprecateForSuggestion(provider, providerSuggestions[0]);
        }

        if (hasDeprecations || !apiIs20) {
          providerSuggestions = providerSuggestions.map(suggestion => {
            const newSuggestion = {
              text: suggestion.text != null ? suggestion.text : suggestion.word,
              snippet: suggestion.snippet,
              replacementPrefix: suggestion.replacementPrefix != null ? suggestion.replacementPrefix : suggestion.prefix,
              className: suggestion.className,
              type: suggestion.type
            };
            if (newSuggestion.rightLabelHTML == null && suggestion.renderLabelAsHtml) {
              newSuggestion.rightLabelHTML = suggestion.label;
            }
            if (newSuggestion.rightLabel == null && !suggestion.renderLabelAsHtml) {
              newSuggestion.rightLabel = suggestion.label;
            }
            return newSuggestion;
          });
        }

        let hasEmpty = false; // Optimization: only create another array when there are empty items
        for (let i = 0; i < providerSuggestions.length; i++) {
          const suggestion = providerSuggestions[i];
          if (!suggestion.snippet && !suggestion.text) {
            hasEmpty = true;
          }
          if (suggestion.replacementPrefix == null) {
            suggestion.replacementPrefix = this.getDefaultReplacementPrefix(options.prefix);
          }
          suggestion.provider = provider;
        }

        if (hasEmpty) {
          const res = [];
          for (const s of providerSuggestions) {
            if (s.snippet || s.text) {
              res.push(s);
            }
          }
          providerSuggestions = res;
        }

        if (provider.filterSuggestions) {
          providerSuggestions = this.filterSuggestions(providerSuggestions, options);
        }
        return providerSuggestions;
      }));
    });

    if (!providerPromises || !providerPromises.length) {
      return;
    }

    suggestionsPromise = Promise.all(providerPromises);
    this.currentSuggestionsPromise = suggestionsPromise;
    return this.currentSuggestionsPromise.then(this.mergeSuggestionsFromProviders).then(suggestions => {
      if (this.currentSuggestionsPromise !== suggestionsPromise) {
        return;
      }
      if (options.activatedManually && this.shouldDisplaySuggestions && this.autoConfirmSingleSuggestionEnabled && suggestions.length === 1) {
        // When there is one suggestion in manual mode, just confirm it
        return this.confirm(suggestions[0]);
      } else {
        return this.displaySuggestions(suggestions, options);
      }
    });
  }

  filterSuggestions(suggestions, { prefix }) {
    const results = [];
    const fuzzaldrinProvider = this.useAlternateScoring ? _fuzzaldrinPlus2.default : _fuzzaldrin2.default;
    for (let i = 0; i < suggestions.length; i++) {
      // sortScore mostly preserves in the original sorting. The function is
      // chosen such that suggestions with a very high match score can break out.
      let score;
      const suggestion = suggestions[i];
      suggestion.sortScore = Math.max(-i / 10 + 3, 0) + 1;
      suggestion.score = null;

      const text = suggestion.snippet || suggestion.text;
      const suggestionPrefix = suggestion.replacementPrefix != null ? suggestion.replacementPrefix : prefix;
      const prefixIsEmpty = !suggestionPrefix || suggestionPrefix === ' ';
      const firstCharIsMatch = !prefixIsEmpty && suggestionPrefix[0].toLowerCase() === text[0].toLowerCase();

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
  }

  reverseSortOnScoreComparator(a, b) {
    let bscore = b.score;
    if (!bscore) {
      bscore = b.sortScore;
    }
    let ascore = a.score;
    if (!ascore) {
      ascore = b.sortScore;
    }
    return bscore - ascore;
  }

  // providerSuggestions - array of arrays of suggestions provided by all called providers
  mergeSuggestionsFromProviders(providerSuggestions) {
    return providerSuggestions.reduce((suggestions, providerSuggestions) => {
      if (providerSuggestions && providerSuggestions.length) {
        suggestions = suggestions.concat(providerSuggestions);
      }

      return suggestions;
    }, []);
  }

  deprecateForSuggestion(provider, suggestion) {
    let hasDeprecations = false;
    if (suggestion.word != null) {
      hasDeprecations = true;
      if (typeof grim === 'undefined' || grim === null) {
        grim = require('grim');
      }
      grim.deprecate(`Autocomplete provider '${provider.constructor.name}(${provider.id})'
returns suggestions with a \`word\` attribute.
The \`word\` attribute is now \`text\`.
See https://github.com/atom/autocomplete-plus/wiki/Provider-API`);
    }
    if (suggestion.prefix != null) {
      hasDeprecations = true;
      if (typeof grim === 'undefined' || grim === null) {
        grim = require('grim');
      }
      grim.deprecate(`Autocomplete provider '${provider.constructor.name}(${provider.id})'
returns suggestions with a \`prefix\` attribute.
The \`prefix\` attribute is now \`replacementPrefix\` and is optional.
See https://github.com/atom/autocomplete-plus/wiki/Provider-API`);
    }
    if (suggestion.label != null) {
      hasDeprecations = true;
      if (typeof grim === 'undefined' || grim === null) {
        grim = require('grim');
      }
      grim.deprecate(`Autocomplete provider '${provider.constructor.name}(${provider.id})'
returns suggestions with a \`label\` attribute.
The \`label\` attribute is now \`rightLabel\` or \`rightLabelHTML\`.
See https://github.com/atom/autocomplete-plus/wiki/Provider-API`);
    }
    if (suggestion.onWillConfirm != null) {
      hasDeprecations = true;
      if (typeof grim === 'undefined' || grim === null) {
        grim = require('grim');
      }
      grim.deprecate(`Autocomplete provider '${provider.constructor.name}(${provider.id})'
returns suggestions with a \`onWillConfirm\` callback.
The \`onWillConfirm\` callback is no longer supported.
See https://github.com/atom/autocomplete-plus/wiki/Provider-API`);
    }
    if (suggestion.onDidConfirm != null) {
      hasDeprecations = true;
      if (typeof grim === 'undefined' || grim === null) {
        grim = require('grim');
      }
      grim.deprecate(`Autocomplete provider '${provider.constructor.name}(${provider.id})'
returns suggestions with a \`onDidConfirm\` callback.
The \`onDidConfirm\` callback is now a \`onDidInsertSuggestion\` callback on the provider itself.
See https://github.com/atom/autocomplete-plus/wiki/Provider-API`);
    }
    return hasDeprecations;
  }

  displaySuggestions(suggestions, options) {
    suggestions = this.getUniqueSuggestions(suggestions);

    if (this.shouldDisplaySuggestions && suggestions.length) {
      return this.showSuggestionList(suggestions, options);
    } else {
      return this.hideSuggestionList();
    }
  }

  getUniqueSuggestions(suggestions) {
    const seen = {};
    const result = [];
    for (let i = 0; i < suggestions.length; i++) {
      const suggestion = suggestions[i];
      const val = suggestion.text + suggestion.snippet;
      if (!seen[val]) {
        result.push(suggestion);
        seen[val] = true;
      }
    }
    return result;
  }

  getPrefix(editor, bufferPosition) {
    const line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    const prefix = this.prefixRegex.exec(line);
    if (!prefix || !prefix[2]) {
      return '';
    }
    return prefix[2];
  }

  getDefaultReplacementPrefix(prefix) {
    if (this.wordPrefixRegex.test(prefix)) {
      return prefix;
    } else {
      return '';
    }
  }

  // Private: Gets called when the user successfully confirms a suggestion
  //
  // match - An {Object} representing the confirmed suggestion
  confirm(suggestion) {
    if (this.editor == null || suggestion == null || !!this.disposed) {
      return;
    }

    const apiVersion = this.providerManager.apiVersionForProvider(suggestion.provider);
    const apiIs20 = _semver2.default.satisfies(apiVersion, '>=2.0.0');
    const triggerPosition = this.editor.getLastCursor().getBufferPosition();

    // TODO API: Remove as this is no longer used
    if (suggestion.onWillConfirm) {
      suggestion.onWillConfirm();
    }

    const selections = this.editor.getSelections();
    if (selections && selections.length) {
      for (const s of selections) {
        if (s && s.clear) {
          s.clear();
        }
      }
    }

    this.hideSuggestionList();

    this.replaceTextWithMatch(suggestion);

    // TODO API: Remove when we remove the 1.0 API
    if (apiIs20) {
      if (suggestion.provider && suggestion.provider.onDidInsertSuggestion) {
        suggestion.provider.onDidInsertSuggestion({ editor: this.editor, suggestion, triggerPosition });
      }
    } else {
      if (suggestion.onDidConfirm) {
        suggestion.onDidConfirm();
      }
    }
  }

  showSuggestionList(suggestions, options) {
    if (this.disposed) {
      return;
    }
    this.suggestionList.changeItems(suggestions);
    return this.suggestionList.show(this.editor, options);
  }

  hideSuggestionList() {
    if (this.disposed) {
      return;
    }
    this.suggestionList.changeItems(null);
    this.suggestionList.hide();
    this.shouldDisplaySuggestions = false;
  }

  requestHideSuggestionList(command) {
    this.hideTimeout = setTimeout(this.hideSuggestionList, 0);
    this.shouldDisplaySuggestions = false;
  }

  cancelHideSuggestionListRequest() {
    return clearTimeout(this.hideTimeout);
  }

  // Private: Replaces the current prefix with the given match.
  //
  // match - The match to replace the current prefix with
  replaceTextWithMatch(suggestion) {
    if (this.editor == null) {
      return;
    }

    const cursors = this.editor.getCursors();
    if (cursors == null) {
      return;
    }

    return this.editor.transact(() => {
      for (let i = 0; i < cursors.length; i++) {
        const cursor = cursors[i];
        const endPosition = cursor.getBufferPosition();
        const beginningPosition = [endPosition.row, endPosition.column - suggestion.replacementPrefix.length];

        if (this.editor.getTextInBufferRange([beginningPosition, endPosition]) === suggestion.replacementPrefix) {
          const suffix = this.consumeSuffix ? this.getSuffix(this.editor, endPosition, suggestion) : '';
          if (suffix.length) {
            cursor.moveRight(suffix.length);
          }
          cursor.selection.selectLeft(suggestion.replacementPrefix.length + suffix.length);

          if (suggestion.snippet != null && this.snippetsManager != null) {
            this.snippetsManager.insertSnippet(suggestion.snippet, this.editor, cursor);
          } else {
            cursor.selection.insertText(suggestion.text != null ? suggestion.text : suggestion.snippet, {
              autoIndentNewline: this.editor.shouldAutoIndent(),
              autoDecreaseIndent: this.editor.shouldAutoIndent()
            });
          }
        }
      }
    });
  }

  getSuffix(editor, bufferPosition, suggestion) {
    // This just chews through the suggestion and tries to match the suggestion
    // substring with the lineText starting at the cursor. There is probably a
    // more efficient way to do this.
    let suffix = suggestion.snippet != null ? suggestion.snippet : suggestion.text;
    const endPosition = [bufferPosition.row, bufferPosition.column + suffix.length];
    const endOfLineText = editor.getTextInBufferRange([bufferPosition, endPosition]);
    const nonWordCharacters = new Set(atom.config.get('editor.nonWordCharacters').split(''));
    while (suffix) {
      if (endOfLineText.startsWith(suffix) && !nonWordCharacters.has(suffix[0])) {
        break;
      }
      suffix = suffix.slice(1);
    }
    return suffix;
  }

  // Private: Checks whether the current file is blacklisted.
  //
  // Returns {Boolean} that defines whether the current file is blacklisted
  isCurrentFileBlackListed() {
    // minimatch is slow. Not necessary to do this computation on every request for suggestions
    let left;
    if (this.isCurrentFileBlackListedCache != null) {
      return this.isCurrentFileBlackListedCache;
    }

    if (this.fileBlacklist == null || this.fileBlacklist.length === 0) {
      this.isCurrentFileBlackListedCache = false;
      return this.isCurrentFileBlackListedCache;
    }

    if (typeof minimatch === 'undefined' || minimatch === null) {
      minimatch = require('minimatch');
    }
    const fileName = _path2.default.basename((left = this.buffer.getPath()) != null ? left : '');
    for (let i = 0; i < this.fileBlacklist.length; i++) {
      const blacklistGlob = this.fileBlacklist[i];
      if (minimatch(fileName, blacklistGlob)) {
        this.isCurrentFileBlackListedCache = true;
        return this.isCurrentFileBlackListedCache;
      }
    }

    this.isCurrentFileBlackListedCache = false;
    return this.isCurrentFileBlackListedCache;
  }

  // Private: Gets called when the content has been modified
  requestNewSuggestions() {
    let delay = atom.config.get('autocomplete-plus.autoActivationDelay');
    clearTimeout(this.delayTimeout);
    if (this.suggestionList.isActive()) {
      delay = this.suggestionDelay;
    }
    this.delayTimeout = setTimeout(this.findSuggestions, delay);
    this.shouldDisplaySuggestions = true;
  }

  cancelNewSuggestionsRequest() {
    clearTimeout(this.delayTimeout);
    this.shouldDisplaySuggestions = false;
  }

  // Private: Gets called when the cursor has moved. Cancels the autocompletion if
  // the text has not been changed.
  //
  // data - An {Object} containing information on why the cursor has been moved
  cursorMoved({ textChanged }) {
    // The delay is a workaround for the backspace case. The way atom implements
    // backspace is to select left 1 char, then delete. This results in a
    // cursorMoved event with textChanged == false. So we delay, and if the
    // bufferChanged handler decides to show suggestions, it will cancel the
    // hideSuggestionList request. If there is no bufferChanged event,
    // suggestionList will be hidden.
    if (!textChanged && !this.shouldActivate) {
      return this.requestHideSuggestionList();
    }
  }

  // Private: Gets called when the user saves the document. Cancels the
  // autocompletion.
  bufferSaved() {
    if (!this.autosaveEnabled) {
      return this.hideSuggestionList();
    }
  }

  toggleActivationForBufferChange({ newText, newRange, oldText, oldRange }) {
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
        // Activate on space, a non-whitespace character, or a bracket-matcher pair.
        if (newText === ' ' || newText.trim().length === 1) {
          this.shouldActivate = true;
        }

        if (newText.length === 2) {
          for (const pair of this.bracketMatcherPairs) {
            if (newText === pair) {
              this.shouldActivate = true;
            }
          }
        }
      } else if (oldText.length > 0) {
        // Suggestion list must be either active or backspaceTriggersAutocomplete must be true for activation to occur.
        // Activate on removal of a space, a non-whitespace character, or a bracket-matcher pair.
        if (this.backspaceTriggersAutocomplete || this.suggestionList.isActive()) {
          if (oldText.length > 0 && (this.backspaceTriggersAutocomplete || this.suggestionList.isActive())) {
            if (oldText === ' ' || oldText.trim().length === 1) {
              this.shouldActivate = true;
            }

            if (oldText.length === 2) {
              for (const pair of this.bracketMatcherPairs) {
                if (oldText === pair) {
                  this.shouldActivate = true;
                }
              }
            }
          }
        }
      }

      if (this.shouldActivate && this.shouldSuppressActivationForEditorClasses()) {
        this.shouldActivate = false;
      }
    }
  }

  showOrHideSuggestionListForBufferChanges({ changes }) {
    const lastCursorPosition = this.editor.getLastCursor().getBufferPosition();
    const changeOccurredNearLastCursor = changes.some(({ start, newExtent }) => {
      const newRange = new _atom.Range(start, start.traverse(newExtent));
      return newRange.containsPoint(lastCursorPosition);
    });

    if (this.shouldActivate && changeOccurredNearLastCursor) {
      this.cancelHideSuggestionListRequest();
      this.requestNewSuggestions();
    } else {
      this.cancelNewSuggestionsRequest();
      this.hideSuggestionList();
    }

    this.shouldActivate = false;
  }

  showOrHideSuggestionListForBufferChange({ newText, newRange, oldText, oldRange }) {
    if (this.disposed) {
      return;
    }
    if (this.compositionInProgress) {
      return this.hideSuggestionList();
    }
    let shouldActivate = false;
    const cursorPositions = this.editor.getCursorBufferPositions();

    if (this.autoActivationEnabled || this.suggestionList.isActive()) {
      // Activate on space, a non-whitespace character, or a bracket-matcher pair.
      if (newText.length > 0) {
        if (cursorPositions.some(position => {
          return newRange.containsPoint(position);
        })) {
          if (newText === ' ' || newText.trim().length === 1) {
            shouldActivate = true;
          }
          if (newText.length === 2) {
            for (const pair of this.bracketMatcherPairs) {
              if (newText === pair) {
                shouldActivate = true;
              }
            }
          }
        }
        // Suggestion list must be either active or backspaceTriggersAutocomplete must be true for activation to occur.
        // Activate on removal of a space, a non-whitespace character, or a bracket-matcher pair.
      } else if (oldText.length > 0) {
        if ((this.backspaceTriggersAutocomplete || this.suggestionList.isActive()) && cursorPositions.some(position => {
          return newRange.containsPoint(position);
        })) {
          if (oldText === ' ' || oldText.trim().length === 1) {
            shouldActivate = true;
          }
          if (oldText.length === 2) {
            for (const pair of this.bracketMatcherPairs) {
              if (oldText === pair) {
                shouldActivate = true;
              }
            }
          }
        }
      }

      if (shouldActivate && this.shouldSuppressActivationForEditorClasses()) {
        shouldActivate = false;
      }
    }

    if (shouldActivate) {
      this.cancelHideSuggestionListRequest();
      this.requestNewSuggestions();
    } else {
      this.cancelNewSuggestionsRequest();
      this.hideSuggestionList();
    }
  }

  shouldSuppressActivationForEditorClasses() {
    for (let i = 0; i < this.suppressForClasses.length; i++) {
      const classNames = this.suppressForClasses[i];
      let containsCount = 0;
      for (let j = 0; j < classNames.length; j++) {
        const className = classNames[j];
        if (this.editorView.classList.contains(className)) {
          containsCount += 1;
        }
      }
      if (containsCount === classNames.length) {
        return true;
      }
    }
    return false;
  }

  // Public: Clean up, stop listening to events
  dispose() {
    this.hideSuggestionList();
    this.disposed = true;
    this.ready = false;
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }
    this.editorSubscriptions = null;
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.suggestionList = null;
    this.providerManager = null;
  }
};
exports.default = AutocompleteManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1dG9jb21wbGV0ZS1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIm1pbmltYXRjaCIsImdyaW0iLCJBdXRvY29tcGxldGVNYW5hZ2VyIiwiY29uc3RydWN0b3IiLCJhdXRvc2F2ZUVuYWJsZWQiLCJiYWNrc3BhY2VUcmlnZ2Vyc0F1dG9jb21wbGV0ZSIsImF1dG9Db25maXJtU2luZ2xlU3VnZ2VzdGlvbkVuYWJsZWQiLCJicmFja2V0TWF0Y2hlclBhaXJzIiwiYnVmZmVyIiwiY29tcG9zaXRpb25JblByb2dyZXNzIiwiZGlzcG9zZWQiLCJlZGl0b3IiLCJlZGl0b3JTdWJzY3JpcHRpb25zIiwiZWRpdG9yVmlldyIsInByb3ZpZGVyTWFuYWdlciIsInJlYWR5Iiwic3Vic2NyaXB0aW9ucyIsInN1Z2dlc3Rpb25EZWxheSIsInN1Z2dlc3Rpb25MaXN0Iiwic3VwcHJlc3NGb3JDbGFzc2VzIiwic2hvdWxkRGlzcGxheVN1Z2dlc3Rpb25zIiwicHJlZml4UmVnZXgiLCJ3b3JkUHJlZml4UmVnZXgiLCJ1cGRhdGVDdXJyZW50RWRpdG9yIiwiYmluZCIsImhhbmRsZUNvbW1hbmRzIiwiZmluZFN1Z2dlc3Rpb25zIiwiZ2V0U3VnZ2VzdGlvbnNGcm9tUHJvdmlkZXJzIiwiZGlzcGxheVN1Z2dlc3Rpb25zIiwiaGlkZVN1Z2dlc3Rpb25MaXN0IiwidG9nZ2xlQWN0aXZhdGlvbkZvckJ1ZmZlckNoYW5nZSIsInNob3dPckhpZGVTdWdnZXN0aW9uTGlzdEZvckJ1ZmZlckNoYW5nZXMiLCJzaG93T3JIaWRlU3VnZ2VzdGlvbkxpc3RGb3JCdWZmZXJDaGFuZ2UiLCJhZGQiLCJhdG9tIiwiY29uZmlnIiwib2JzZXJ2ZSIsImVuYWJsZUV4dGVuZGVkVW5pY29kZVN1cHBvcnQiLCJSZWdFeHAiLCJoYW5kbGVFdmVudHMiLCJzZXRTbmlwcGV0c01hbmFnZXIiLCJzbmlwcGV0c01hbmFnZXIiLCJjdXJyZW50RWRpdG9yIiwiZGlzcG9zZSIsImlzQ3VycmVudEZpbGVCbGFja0xpc3RlZENhY2hlIiwiZWRpdG9ySXNWYWxpZCIsInZpZXdzIiwiZ2V0VmlldyIsImdldEJ1ZmZlciIsIm9uRGlkU2F2ZSIsImUiLCJidWZmZXJTYXZlZCIsIm9uRGlkQ2hhbmdlVGV4dCIsIm9uRGlkQ2hhbmdlIiwiY29tcG9zaXRpb25TdGFydCIsImNvbXBvc2l0aW9uRW5kIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIiwiY3Vyc29yTW92ZWQiLCJvbkRpZENoYW5nZVBhdGgiLCJ3b3Jrc3BhY2UiLCJpc1RleHRFZGl0b3IiLCJnZXRUZXh0IiwidGV4dEVkaXRvcnMiLCJ2aWV3IiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50IiwiY2xvc2VzdCIsImVsZW1lbnQiLCJ2YWx1ZSIsImF1dG9BY3RpdmF0aW9uRW5hYmxlZCIsImNvbnN1bWVTdWZmaXgiLCJ1c2VBbHRlcm5hdGVTY29yaW5nIiwiZmlsZUJsYWNrbGlzdCIsIm1hcCIsInMiLCJ0cmltIiwiaSIsImxlbmd0aCIsInNlbGVjdG9yIiwiY2xhc3NlcyIsInNwbGl0IiwiZmlsdGVyIiwiY2xhc3NOYW1lIiwicHVzaCIsIm9uRGlkQ29uZmlybSIsImNvbmZpcm0iLCJvbkRpZENhbmNlbCIsImNvbW1hbmRzIiwiZXZlbnQiLCJhY3RpdmF0ZWRNYW51YWxseSIsImRldGFpbCIsImlzQ3VycmVudEZpbGVCbGFja0xpc3RlZCIsImN1cnNvciIsImdldExhc3RDdXJzb3IiLCJidWZmZXJQb3NpdGlvbiIsImdldEJ1ZmZlclBvc2l0aW9uIiwic2NvcGVEZXNjcmlwdG9yIiwiZ2V0U2NvcGVEZXNjcmlwdG9yIiwicHJlZml4IiwiZ2V0UHJlZml4Iiwib3B0aW9ucyIsInN1Z2dlc3Rpb25zUHJvbWlzZSIsInByb3ZpZGVycyIsImFwcGxpY2FibGVQcm92aWRlcnMiLCJwcm92aWRlclByb21pc2VzIiwiZm9yRWFjaCIsInByb3ZpZGVyIiwiYXBpVmVyc2lvbiIsImFwaVZlcnNpb25Gb3JQcm92aWRlciIsImFwaUlzMjAiLCJzYXRpc2ZpZXMiLCJnZXRTdWdnZXN0aW9ucyIsInVwZ3JhZGVkT3B0aW9ucyIsInJlcXVlc3RIYW5kbGVyIiwicG9zaXRpb24iLCJzY29wZSIsInNjb3BlQ2hhaW4iLCJnZXRTY29wZUNoYWluIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0aGVuIiwicHJvdmlkZXJTdWdnZXN0aW9ucyIsImhhc0RlcHJlY2F0aW9ucyIsImRlcHJlY2F0ZUZvclN1Z2dlc3Rpb24iLCJzdWdnZXN0aW9uIiwibmV3U3VnZ2VzdGlvbiIsInRleHQiLCJ3b3JkIiwic25pcHBldCIsInJlcGxhY2VtZW50UHJlZml4IiwidHlwZSIsInJpZ2h0TGFiZWxIVE1MIiwicmVuZGVyTGFiZWxBc0h0bWwiLCJsYWJlbCIsInJpZ2h0TGFiZWwiLCJoYXNFbXB0eSIsImdldERlZmF1bHRSZXBsYWNlbWVudFByZWZpeCIsInJlcyIsImZpbHRlclN1Z2dlc3Rpb25zIiwiYWxsIiwiY3VycmVudFN1Z2dlc3Rpb25zUHJvbWlzZSIsIm1lcmdlU3VnZ2VzdGlvbnNGcm9tUHJvdmlkZXJzIiwic3VnZ2VzdGlvbnMiLCJyZXN1bHRzIiwiZnV6emFsZHJpblByb3ZpZGVyIiwic2NvcmUiLCJzb3J0U2NvcmUiLCJNYXRoIiwibWF4Iiwic3VnZ2VzdGlvblByZWZpeCIsInByZWZpeElzRW1wdHkiLCJmaXJzdENoYXJJc01hdGNoIiwidG9Mb3dlckNhc2UiLCJzb3J0IiwicmV2ZXJzZVNvcnRPblNjb3JlQ29tcGFyYXRvciIsImEiLCJiIiwiYnNjb3JlIiwiYXNjb3JlIiwicmVkdWNlIiwiY29uY2F0IiwicmVxdWlyZSIsImRlcHJlY2F0ZSIsIm5hbWUiLCJpZCIsIm9uV2lsbENvbmZpcm0iLCJnZXRVbmlxdWVTdWdnZXN0aW9ucyIsInNob3dTdWdnZXN0aW9uTGlzdCIsInNlZW4iLCJyZXN1bHQiLCJ2YWwiLCJsaW5lIiwiZ2V0VGV4dEluUmFuZ2UiLCJyb3ciLCJleGVjIiwidGVzdCIsInRyaWdnZXJQb3NpdGlvbiIsInNlbGVjdGlvbnMiLCJnZXRTZWxlY3Rpb25zIiwiY2xlYXIiLCJyZXBsYWNlVGV4dFdpdGhNYXRjaCIsIm9uRGlkSW5zZXJ0U3VnZ2VzdGlvbiIsImNoYW5nZUl0ZW1zIiwic2hvdyIsImhpZGUiLCJyZXF1ZXN0SGlkZVN1Z2dlc3Rpb25MaXN0IiwiY29tbWFuZCIsImhpZGVUaW1lb3V0Iiwic2V0VGltZW91dCIsImNhbmNlbEhpZGVTdWdnZXN0aW9uTGlzdFJlcXVlc3QiLCJjbGVhclRpbWVvdXQiLCJjdXJzb3JzIiwiZ2V0Q3Vyc29ycyIsInRyYW5zYWN0IiwiZW5kUG9zaXRpb24iLCJiZWdpbm5pbmdQb3NpdGlvbiIsImNvbHVtbiIsImdldFRleHRJbkJ1ZmZlclJhbmdlIiwic3VmZml4IiwiZ2V0U3VmZml4IiwibW92ZVJpZ2h0Iiwic2VsZWN0aW9uIiwic2VsZWN0TGVmdCIsImluc2VydFNuaXBwZXQiLCJpbnNlcnRUZXh0IiwiYXV0b0luZGVudE5ld2xpbmUiLCJzaG91bGRBdXRvSW5kZW50IiwiYXV0b0RlY3JlYXNlSW5kZW50IiwiZW5kT2ZMaW5lVGV4dCIsIm5vbldvcmRDaGFyYWN0ZXJzIiwiU2V0IiwiZ2V0Iiwic3RhcnRzV2l0aCIsImhhcyIsInNsaWNlIiwibGVmdCIsImZpbGVOYW1lIiwiYmFzZW5hbWUiLCJnZXRQYXRoIiwiYmxhY2tsaXN0R2xvYiIsInJlcXVlc3ROZXdTdWdnZXN0aW9ucyIsImRlbGF5IiwiZGVsYXlUaW1lb3V0IiwiaXNBY3RpdmUiLCJjYW5jZWxOZXdTdWdnZXN0aW9uc1JlcXVlc3QiLCJ0ZXh0Q2hhbmdlZCIsInNob3VsZEFjdGl2YXRlIiwibmV3VGV4dCIsIm5ld1JhbmdlIiwib2xkVGV4dCIsIm9sZFJhbmdlIiwicGFpciIsInNob3VsZFN1cHByZXNzQWN0aXZhdGlvbkZvckVkaXRvckNsYXNzZXMiLCJjaGFuZ2VzIiwibGFzdEN1cnNvclBvc2l0aW9uIiwiY2hhbmdlT2NjdXJyZWROZWFyTGFzdEN1cnNvciIsInNvbWUiLCJzdGFydCIsIm5ld0V4dGVudCIsInRyYXZlcnNlIiwiY29udGFpbnNQb2ludCIsImN1cnNvclBvc2l0aW9ucyIsImdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucyIsImNsYXNzTmFtZXMiLCJjb250YWluc0NvdW50IiwiaiIsImNsYXNzTGlzdCIsImNvbnRhaW5zIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQUVBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7QUFDQSxJQUFJQSxZQUFZLElBQWhCO0FBQ0EsSUFBSUMsT0FBTyxJQUFYOztJQUVxQkMsbUIsR0FBTixNQUFNQSxtQkFBTixDQUEwQjtBQUN2Q0MsZ0JBQWU7QUFDYixTQUFLQyxlQUFMLEdBQXVCLEtBQXZCO0FBQ0EsU0FBS0MsNkJBQUwsR0FBcUMsSUFBckM7QUFDQSxTQUFLQyxrQ0FBTCxHQUEwQyxJQUExQztBQUNBLFNBQUtDLG1CQUFMLEdBQTJCLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLElBQS9CLEVBQXFDLElBQXJDLEVBQTJDLElBQTNDLEVBQWlELElBQWpELEVBQXVELElBQXZELENBQTNCO0FBQ0EsU0FBS0MsTUFBTCxHQUFjLElBQWQ7QUFDQSxTQUFLQyxxQkFBTCxHQUE2QixLQUE3QjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsS0FBaEI7QUFDQSxTQUFLQyxNQUFMLEdBQWMsSUFBZDtBQUNBLFNBQUtDLG1CQUFMLEdBQTJCLElBQTNCO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixJQUFsQjtBQUNBLFNBQUtDLGVBQUwsR0FBdUIsSUFBdkI7QUFDQSxTQUFLQyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixJQUF0QjtBQUNBLFNBQUtDLGtCQUFMLEdBQTBCLEVBQTFCO0FBQ0EsU0FBS0Msd0JBQUwsR0FBZ0MsS0FB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Q0FBakI7QUFBb0I7QUFDMUU7QUFDRCxVQUFJQSxrQkFBa0JELFdBQVd0SyxNQUFqQyxFQUF5QztBQUFFLGVBQU8sSUFBUDtBQUFhO0FBQ3pEO0FBQ0QsV0FBTyxLQUFQO0FBQ0Q7O0FBRUQ7QUFDQXBDLFlBQVc7QUFDVCxTQUFLZCxrQkFBTDtBQUNBLFNBQUtuQixRQUFMLEdBQWdCLElBQWhCO0FBQ0EsU0FBS0ssS0FBTCxHQUFhLEtBQWI7QUFDQSxRQUFJLEtBQUtILG1CQUFULEVBQThCO0FBQzVCLFdBQUtBLG1CQUFMLENBQXlCK0IsT0FBekI7QUFDRDtBQUNELFNBQUsvQixtQkFBTCxHQUEyQixJQUEzQjtBQUNBLFFBQUksS0FBS0ksYUFBVCxFQUF3QjtBQUN0QixXQUFLQSxhQUFMLENBQW1CMkIsT0FBbkI7QUFDRDtBQUNELFNBQUszQixhQUFMLEdBQXFCLElBQXJCO0FBQ0EsU0FBS0UsY0FBTCxHQUFzQixJQUF0QjtBQUNBLFNBQUtKLGVBQUwsR0FBdUIsSUFBdkI7QUFDRDtBQTF1QnNDLEM7a0JBQXBCWixtQiIsImZpbGUiOiJhdXRvY29tcGxldGUtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IFJhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcbmltcG9ydCBmdXp6YWxkcmluIGZyb20gJ2Z1enphbGRyaW4nXG5pbXBvcnQgZnV6emFsZHJpblBsdXMgZnJvbSAnZnV6emFsZHJpbi1wbHVzJ1xuXG5pbXBvcnQgUHJvdmlkZXJNYW5hZ2VyIGZyb20gJy4vcHJvdmlkZXItbWFuYWdlcidcbmltcG9ydCBTdWdnZXN0aW9uTGlzdCBmcm9tICcuL3N1Z2dlc3Rpb24tbGlzdCdcbmltcG9ydCB7IFVuaWNvZGVMZXR0ZXJzIH0gZnJvbSAnLi91bmljb2RlLWhlbHBlcnMnXG5cbi8vIERlZmVycmVkIHJlcXVpcmVzXG5sZXQgbWluaW1hdGNoID0gbnVsbFxubGV0IGdyaW0gPSBudWxsXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1dG9jb21wbGV0ZU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5hdXRvc2F2ZUVuYWJsZWQgPSBmYWxzZVxuICAgIHRoaXMuYmFja3NwYWNlVHJpZ2dlcnNBdXRvY29tcGxldGUgPSB0cnVlXG4gICAgdGhpcy5hdXRvQ29uZmlybVNpbmdsZVN1Z2dlc3Rpb25FbmFibGVkID0gdHJ1ZVxuICAgIHRoaXMuYnJhY2tldE1hdGNoZXJQYWlycyA9IFsnKCknLCAnW10nLCAne30nLCAnXCJcIicsIFwiJydcIiwgJ2BgJywgJ+KAnOKAnScsICfigJjigJknLCAnwqvCuycsICfigLnigLonXVxuICAgIHRoaXMuYnVmZmVyID0gbnVsbFxuICAgIHRoaXMuY29tcG9zaXRpb25JblByb2dyZXNzID0gZmFsc2VcbiAgICB0aGlzLmRpc3Bvc2VkID0gZmFsc2VcbiAgICB0aGlzLmVkaXRvciA9IG51bGxcbiAgICB0aGlzLmVkaXRvclN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgdGhpcy5lZGl0b3JWaWV3ID0gbnVsbFxuICAgIHRoaXMucHJvdmlkZXJNYW5hZ2VyID0gbnVsbFxuICAgIHRoaXMucmVhZHkgPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLnN1Z2dlc3Rpb25EZWxheSA9IDUwXG4gICAgdGhpcy5zdWdnZXN0aW9uTGlzdCA9IG51bGxcbiAgICB0aGlzLnN1cHByZXNzRm9yQ2xhc3NlcyA9IFtdXG4gICAgdGhpcy5zaG91bGREaXNwbGF5U3VnZ2VzdGlvbnMgPSBmYWxzZVxuICAgIHRoaXMucHJlZml4UmVnZXggPSBudWxsXG4gICAgdGhpcy53b3JkUHJlZml4UmVnZXggPSBudWxsXG4gICAgdGhpcy51cGRhdGVDdXJyZW50RWRpdG9yID0gdGhpcy51cGRhdGVDdXJyZW50RWRpdG9yLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUNvbW1hbmRzID0gdGhpcy5oYW5kbGVDb21tYW5kcy5iaW5kKHRoaXMpXG4gICAgdGhpcy5maW5kU3VnZ2VzdGlvbnMgPSB0aGlzLmZpbmRTdWdnZXN0aW9ucy5iaW5kKHRoaXMpXG4gICAgdGhpcy5nZXRTdWdnZXN0aW9uc0Zyb21Qcm92aWRlcnMgPSB0aGlzLmdldFN1Z2dlc3Rpb25zRnJvbVByb3ZpZGVycy5iaW5kKHRoaXMpXG4gICAgdGhpcy5kaXNwbGF5U3VnZ2VzdGlvbnMgPSB0aGlzLmRpc3BsYXlTdWdnZXN0aW9ucy5iaW5kKHRoaXMpXG4gICAgdGhpcy5oaWRlU3VnZ2VzdGlvbkxpc3QgPSB0aGlzLmhpZGVTdWdnZXN0aW9uTGlzdC5iaW5kKHRoaXMpXG5cbiAgICB0aGlzLnRvZ2dsZUFjdGl2YXRpb25Gb3JCdWZmZXJDaGFuZ2UgPSB0aGlzLnRvZ2dsZUFjdGl2YXRpb25Gb3JCdWZmZXJDaGFuZ2UuYmluZCh0aGlzKVxuICAgIHRoaXMuc2hvd09ySGlkZVN1Z2dlc3Rpb25MaXN0Rm9yQnVmZmVyQ2hhbmdlcyA9IHRoaXMuc2hvd09ySGlkZVN1Z2dlc3Rpb25MaXN0Rm9yQnVmZmVyQ2hhbmdlcy5iaW5kKHRoaXMpXG4gICAgdGhpcy5zaG93T3JIaWRlU3VnZ2VzdGlvbkxpc3RGb3JCdWZmZXJDaGFuZ2UgPSB0aGlzLnNob3dPckhpZGVTdWdnZXN0aW9uTGlzdEZvckJ1ZmZlckNoYW5nZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMucHJvdmlkZXJNYW5hZ2VyID0gbmV3IFByb3ZpZGVyTWFuYWdlcigpXG4gICAgdGhpcy5zdWdnZXN0aW9uTGlzdCA9IG5ldyBTdWdnZXN0aW9uTGlzdCgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUV4dGVuZGVkVW5pY29kZVN1cHBvcnQnLCBlbmFibGVFeHRlbmRlZFVuaWNvZGVTdXBwb3J0ID0+IHtcbiAgICAgIGlmIChlbmFibGVFeHRlbmRlZFVuaWNvZGVTdXBwb3J0KSB7XG4gICAgICAgIHRoaXMucHJlZml4UmVnZXggPSBuZXcgUmVnRXhwKGAoWydcIn5cXGAhQCNcXFxcJCVeJipcXFxcKFxcXFwpXFxcXHtcXFxcfVxcXFxbXFxcXF09KywvXFxcXD8+XSk/KChbJHtVbmljb2RlTGV0dGVyc31cXFxcZF9dK1ske1VuaWNvZGVMZXR0ZXJzfVxcXFxkXy1dKil8KFsuOjtbeyg8IF0rKSkkYClcbiAgICAgICAgdGhpcy53b3JkUHJlZml4UmVnZXggPSBuZXcgUmVnRXhwKGBeWyR7VW5pY29kZUxldHRlcnN9XFxcXGRfXStbJHtVbmljb2RlTGV0dGVyc31cXFxcZF8tXSokYClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJlZml4UmVnZXggPSAvKFxcYnxbJ1wifmAhQCMkJV4mKigpe31bXFxdPSssLz8+XSkoKFxcdytbXFx3LV0qKXwoWy46O1t7KDwgXSspKSQvXG4gICAgICAgIHRoaXMud29yZFByZWZpeFJlZ2V4ID0gL15cXHcrW1xcdy1dKiQvXG4gICAgICB9XG4gICAgfVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnByb3ZpZGVyTWFuYWdlcilcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgdGhpcy5oYW5kbGVDb21tYW5kcygpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1Z2dlc3Rpb25MaXN0KSAvLyBXZSdyZSBhZGRpbmcgdGhpcyBsYXN0IHNvIGl0IGlzIGRpc3Bvc2VkIGFmdGVyIGV2ZW50c1xuICAgIHRoaXMucmVhZHkgPSB0cnVlXG4gIH1cblxuICBzZXRTbmlwcGV0c01hbmFnZXIgKHNuaXBwZXRzTWFuYWdlcikge1xuICAgIHRoaXMuc25pcHBldHNNYW5hZ2VyID0gc25pcHBldHNNYW5hZ2VyXG4gIH1cblxuICB1cGRhdGVDdXJyZW50RWRpdG9yIChjdXJyZW50RWRpdG9yKSB7XG4gICAgaWYgKChjdXJyZW50RWRpdG9yID09IG51bGwpIHx8IGN1cnJlbnRFZGl0b3IgPT09IHRoaXMuZWRpdG9yKSB7IHJldHVybiB9XG4gICAgaWYgKHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5lZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLmVkaXRvclN1YnNjcmlwdGlvbnMgPSBudWxsXG5cbiAgICAvLyBTdG9wIHRyYWNraW5nIGVkaXRvciArIGJ1ZmZlclxuICAgIHRoaXMuZWRpdG9yID0gbnVsbFxuICAgIHRoaXMuZWRpdG9yVmlldyA9IG51bGxcbiAgICB0aGlzLmJ1ZmZlciA9IG51bGxcbiAgICB0aGlzLmlzQ3VycmVudEZpbGVCbGFja0xpc3RlZENhY2hlID0gbnVsbFxuXG4gICAgaWYgKCF0aGlzLmVkaXRvcklzVmFsaWQoY3VycmVudEVkaXRvcikpIHsgcmV0dXJuIH1cblxuICAgIC8vIFRyYWNrIHRoZSBuZXcgZWRpdG9yLCBlZGl0b3JWaWV3LCBhbmQgYnVmZmVyXG4gICAgdGhpcy5lZGl0b3IgPSBjdXJyZW50RWRpdG9yXG4gICAgdGhpcy5lZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuZWRpdG9yKVxuICAgIHRoaXMuYnVmZmVyID0gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKClcblxuICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIC8vIFN1YnNjcmliZSB0byBidWZmZXIgZXZlbnRzOlxuICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGhpcy5idWZmZXIub25EaWRTYXZlKChlKSA9PiB7IHRoaXMuYnVmZmVyU2F2ZWQoZSkgfSkpXG4gICAgaWYgKHR5cGVvZiB0aGlzLmJ1ZmZlci5vbkRpZENoYW5nZVRleHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGhpcy5idWZmZXIub25EaWRDaGFuZ2UodGhpcy50b2dnbGVBY3RpdmF0aW9uRm9yQnVmZmVyQ2hhbmdlKSlcbiAgICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGhpcy5idWZmZXIub25EaWRDaGFuZ2VUZXh0KHRoaXMuc2hvd09ySGlkZVN1Z2dlc3Rpb25MaXN0Rm9yQnVmZmVyQ2hhbmdlcykpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGFmdGVyIGBUZXh0QnVmZmVyLnByb3RvdHlwZS5vbkRpZENoYW5nZVRleHRgIGxhbmRzIG9uIEF0b20gc3RhYmxlLlxuICAgICAgdGhpcy5lZGl0b3JTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJ1ZmZlci5vbkRpZENoYW5nZSh0aGlzLnNob3dPckhpZGVTdWdnZXN0aW9uTGlzdEZvckJ1ZmZlckNoYW5nZSkpXG4gICAgfVxuXG4gICAgLy8gV2F0Y2ggSU1FIEV2ZW50cyBUbyBBbGxvdyBJTUUgVG8gRnVuY3Rpb24gV2l0aG91dCBUaGUgU3VnZ2VzdGlvbiBMaXN0IFNob3dpbmdcbiAgICBjb25zdCBjb21wb3NpdGlvblN0YXJ0ID0gKCkgPT4ge1xuICAgICAgdGhpcy5jb21wb3NpdGlvbkluUHJvZ3Jlc3MgPSB0cnVlXG4gICAgfVxuICAgIGNvbnN0IGNvbXBvc2l0aW9uRW5kID0gKCkgPT4ge1xuICAgICAgdGhpcy5jb21wb3NpdGlvbkluUHJvZ3Jlc3MgPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuZWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdjb21wb3NpdGlvbnN0YXJ0JywgY29tcG9zaXRpb25TdGFydClcbiAgICB0aGlzLmVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lcignY29tcG9zaXRpb25lbmQnLCBjb21wb3NpdGlvbkVuZClcbiAgICB0aGlzLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmVkaXRvclZpZXcpIHtcbiAgICAgICAgdGhpcy5lZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBvc2l0aW9uc3RhcnQnLCBjb21wb3NpdGlvblN0YXJ0KVxuICAgICAgICB0aGlzLmVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcG9zaXRpb25lbmQnLCBjb21wb3NpdGlvbkVuZClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIC8vIFN1YnNjcmliZSB0byBlZGl0b3IgZXZlbnRzOlxuICAgIC8vIENsb3NlIHRoZSBvdmVybGF5IHdoZW4gdGhlIGN1cnNvciBtb3ZlZCB3aXRob3V0IGNoYW5naW5nIGFueSB0ZXh0XG4gICAgdGhpcy5lZGl0b3JTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKChlKSA9PiB7IHRoaXMuY3Vyc29yTW92ZWQoZSkgfSkpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lZGl0b3Iub25EaWRDaGFuZ2VQYXRoKCgpID0+IHtcbiAgICAgIHRoaXMuaXNDdXJyZW50RmlsZUJsYWNrTGlzdGVkQ2FjaGUgPSBudWxsXG4gICAgfSkpXG4gIH1cblxuICBlZGl0b3JJc1ZhbGlkIChlZGl0b3IpIHtcbiAgICAvLyBUT0RPOiByZW1vdmUgY29uZGl0aW9uYWwgd2hlbiBgaXNUZXh0RWRpdG9yYCBpcyBzaGlwcGVkLlxuICAgIGlmICh0eXBlb2YgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGVkaXRvcilcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVkaXRvciA9PSBudWxsKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAvLyBTaG91bGQgd2UgZGlzcXVhbGlmeSBUZXh0RWRpdG9ycyB3aXRoIHRoZSBHcmFtbWFyIHRleHQucGxhaW4ubnVsbC1ncmFtbWFyP1xuICAgICAgcmV0dXJuIChlZGl0b3IuZ2V0VGV4dCAhPSBudWxsKVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV2ZW50cyAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnRleHRFZGl0b3JzLm9ic2VydmUoKGVkaXRvcikgPT4ge1xuICAgICAgY29uc3QgdmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICBpZiAodmlldyA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5jbG9zZXN0KCdhdG9tLXRleHQtZWRpdG9yJykpIHtcbiAgICAgICAgdGhpcy51cGRhdGVDdXJyZW50RWRpdG9yKGVkaXRvcilcbiAgICAgIH1cbiAgICAgIHZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoZWxlbWVudCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZUN1cnJlbnRFZGl0b3IoZWRpdG9yKVxuICAgICAgfSlcbiAgICB9KSlcblxuICAgIC8vIFdhdGNoIGNvbmZpZyB2YWx1ZXNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9zYXZlLmVuYWJsZWQnLCAodmFsdWUpID0+IHsgdGhpcy5hdXRvc2F2ZUVuYWJsZWQgPSB2YWx1ZSB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLmJhY2tzcGFjZVRyaWdnZXJzQXV0b2NvbXBsZXRlJywgKHZhbHVlKSA9PiB7IHRoaXMuYmFja3NwYWNlVHJpZ2dlcnNBdXRvY29tcGxldGUgPSB2YWx1ZSB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgKHZhbHVlKSA9PiB7IHRoaXMuYXV0b0FjdGl2YXRpb25FbmFibGVkID0gdmFsdWUgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQ29uZmlybVNpbmdsZVN1Z2dlc3Rpb24nLCAodmFsdWUpID0+IHsgdGhpcy5hdXRvQ29uZmlybVNpbmdsZVN1Z2dlc3Rpb25FbmFibGVkID0gdmFsdWUgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy5jb25zdW1lU3VmZml4JywgKHZhbHVlKSA9PiB7IHRoaXMuY29uc3VtZVN1ZmZpeCA9IHZhbHVlIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMudXNlQWx0ZXJuYXRlU2NvcmluZycsICh2YWx1ZSkgPT4geyB0aGlzLnVzZUFsdGVybmF0ZVNjb3JpbmcgPSB2YWx1ZSB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLmZpbGVCbGFja2xpc3QnLCAodmFsdWUpID0+IHtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmZpbGVCbGFja2xpc3QgPSB2YWx1ZS5tYXAoKHMpID0+IHsgcmV0dXJuIHMudHJpbSgpIH0pXG4gICAgICB9XG4gICAgICB0aGlzLmlzQ3VycmVudEZpbGVCbGFja0xpc3RlZENhY2hlID0gbnVsbFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMuc3VwcHJlc3NBY3RpdmF0aW9uRm9yRWRpdG9yQ2xhc3NlcycsIHZhbHVlID0+IHtcbiAgICAgIHRoaXMuc3VwcHJlc3NGb3JDbGFzc2VzID0gW11cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSB2YWx1ZVtpXVxuICAgICAgICBjb25zdCBjbGFzc2VzID0gKHNlbGVjdG9yLnRyaW0oKS5zcGxpdCgnLicpLmZpbHRlcigoY2xhc3NOYW1lKSA9PiBjbGFzc05hbWUudHJpbSgpKS5tYXAoKGNsYXNzTmFtZSkgPT4gY2xhc3NOYW1lLnRyaW0oKSkpXG4gICAgICAgIGlmIChjbGFzc2VzLmxlbmd0aCkgeyB0aGlzLnN1cHByZXNzRm9yQ2xhc3Nlcy5wdXNoKGNsYXNzZXMpIH1cbiAgICAgIH1cbiAgICB9KSlcblxuICAgIC8vIEhhbmRsZSBldmVudHMgZnJvbSBzdWdnZXN0aW9uIGxpc3RcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3VnZ2VzdGlvbkxpc3Qub25EaWRDb25maXJtKChlKSA9PiB7IHRoaXMuY29uZmlybShlKSB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3VnZ2VzdGlvbkxpc3Qub25EaWRDYW5jZWwodGhpcy5oaWRlU3VnZ2VzdGlvbkxpc3QpKVxuICB9XG5cbiAgaGFuZGxlQ29tbWFuZHMgKCkge1xuICAgIHJldHVybiB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2hvdWxkRGlzcGxheVN1Z2dlc3Rpb25zID0gdHJ1ZVxuICAgICAgICBsZXQgYWN0aXZhdGVkTWFudWFsbHkgPSB0cnVlXG4gICAgICAgIGlmIChldmVudC5kZXRhaWwgJiYgZXZlbnQuZGV0YWlsLmFjdGl2YXRlZE1hbnVhbGx5ICE9PSBudWxsICYmIHR5cGVvZiBldmVudC5kZXRhaWwuYWN0aXZhdGVkTWFudWFsbHkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgYWN0aXZhdGVkTWFudWFsbHkgPSBldmVudC5kZXRhaWwuYWN0aXZhdGVkTWFudWFsbHlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbmRTdWdnZXN0aW9ucyhhY3RpdmF0ZWRNYW51YWxseSlcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8vIFByaXZhdGU6IEZpbmRzIHN1Z2dlc3Rpb25zIGZvciB0aGUgY3VycmVudCBwcmVmaXgsIHNldHMgdGhlIGxpc3QgaXRlbXMsXG4gIC8vIHBvc2l0aW9ucyB0aGUgb3ZlcmxheSBhbmQgc2hvd3MgaXRcbiAgZmluZFN1Z2dlc3Rpb25zIChhY3RpdmF0ZWRNYW51YWxseSkge1xuICAgIGlmICh0aGlzLmRpc3Bvc2VkKSB7IHJldHVybiB9XG4gICAgaWYgKCh0aGlzLnByb3ZpZGVyTWFuYWdlciA9PSBudWxsKSB8fCAodGhpcy5lZGl0b3IgPT0gbnVsbCkgfHwgKHRoaXMuYnVmZmVyID09IG51bGwpKSB7IHJldHVybiB9XG4gICAgaWYgKHRoaXMuaXNDdXJyZW50RmlsZUJsYWNrTGlzdGVkKCkpIHsgcmV0dXJuIH1cbiAgICBjb25zdCBjdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBpZiAoY3Vyc29yID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBzY29wZURlc2NyaXB0b3IgPSBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKClcbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLmdldFByZWZpeCh0aGlzLmVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG5cbiAgICByZXR1cm4gdGhpcy5nZXRTdWdnZXN0aW9uc0Zyb21Qcm92aWRlcnMoe2VkaXRvcjogdGhpcy5lZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeCwgYWN0aXZhdGVkTWFudWFsbHl9KVxuICB9XG5cbiAgZ2V0U3VnZ2VzdGlvbnNGcm9tUHJvdmlkZXJzIChvcHRpb25zKSB7XG4gICAgbGV0IHN1Z2dlc3Rpb25zUHJvbWlzZVxuICAgIGNvbnN0IHByb3ZpZGVycyA9IHRoaXMucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMob3B0aW9ucy5lZGl0b3IsIG9wdGlvbnMuc2NvcGVEZXNjcmlwdG9yKVxuXG4gICAgY29uc3QgcHJvdmlkZXJQcm9taXNlcyA9IFtdXG4gICAgcHJvdmlkZXJzLmZvckVhY2gocHJvdmlkZXIgPT4ge1xuICAgICAgY29uc3QgYXBpVmVyc2lvbiA9IHRoaXMucHJvdmlkZXJNYW5hZ2VyLmFwaVZlcnNpb25Gb3JQcm92aWRlcihwcm92aWRlcilcbiAgICAgIGNvbnN0IGFwaUlzMjAgPSBzZW12ZXIuc2F0aXNmaWVzKGFwaVZlcnNpb24sICc+PTIuMC4wJylcblxuICAgICAgLy8gVE9ETyBBUEk6IHJlbW92ZSB1cGdyYWRpbmcgd2hlbiAxLjAgc3VwcG9ydCBpcyByZW1vdmVkXG4gICAgICBsZXQgZ2V0U3VnZ2VzdGlvbnNcbiAgICAgIGxldCB1cGdyYWRlZE9wdGlvbnNcbiAgICAgIGlmIChhcGlJczIwKSB7XG4gICAgICAgIGdldFN1Z2dlc3Rpb25zID0gcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMuYmluZChwcm92aWRlcilcbiAgICAgICAgdXBncmFkZWRPcHRpb25zID0gb3B0aW9uc1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgPSBwcm92aWRlci5yZXF1ZXN0SGFuZGxlci5iaW5kKHByb3ZpZGVyKVxuICAgICAgICB1cGdyYWRlZE9wdGlvbnMgPSB7XG4gICAgICAgICAgZWRpdG9yOiBvcHRpb25zLmVkaXRvcixcbiAgICAgICAgICBwcmVmaXg6IG9wdGlvbnMucHJlZml4LFxuICAgICAgICAgIGJ1ZmZlclBvc2l0aW9uOiBvcHRpb25zLmJ1ZmZlclBvc2l0aW9uLFxuICAgICAgICAgIHBvc2l0aW9uOiBvcHRpb25zLmJ1ZmZlclBvc2l0aW9uLFxuICAgICAgICAgIHNjb3BlOiBvcHRpb25zLnNjb3BlRGVzY3JpcHRvcixcbiAgICAgICAgICBzY29wZUNoYWluOiBvcHRpb25zLnNjb3BlRGVzY3JpcHRvci5nZXRTY29wZUNoYWluKCksXG4gICAgICAgICAgYnVmZmVyOiBvcHRpb25zLmVkaXRvci5nZXRCdWZmZXIoKSxcbiAgICAgICAgICBjdXJzb3I6IG9wdGlvbnMuZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm92aWRlclByb21pc2VzLnB1c2goUHJvbWlzZS5yZXNvbHZlKGdldFN1Z2dlc3Rpb25zKHVwZ3JhZGVkT3B0aW9ucykpLnRoZW4ocHJvdmlkZXJTdWdnZXN0aW9ucyA9PiB7XG4gICAgICAgIGlmIChwcm92aWRlclN1Z2dlc3Rpb25zID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgICAgICAvLyBUT0RPIEFQSTogcmVtb3ZlIHVwZ3JhZGluZyB3aGVuIDEuMCBzdXBwb3J0IGlzIHJlbW92ZWRcbiAgICAgICAgbGV0IGhhc0RlcHJlY2F0aW9ucyA9IGZhbHNlXG4gICAgICAgIGlmIChhcGlJczIwICYmIHByb3ZpZGVyU3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgaGFzRGVwcmVjYXRpb25zID0gdGhpcy5kZXByZWNhdGVGb3JTdWdnZXN0aW9uKHByb3ZpZGVyLCBwcm92aWRlclN1Z2dlc3Rpb25zWzBdKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc0RlcHJlY2F0aW9ucyB8fCAhYXBpSXMyMCkge1xuICAgICAgICAgIHByb3ZpZGVyU3VnZ2VzdGlvbnMgPSBwcm92aWRlclN1Z2dlc3Rpb25zLm1hcCgoc3VnZ2VzdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3U3VnZ2VzdGlvbiA9IHtcbiAgICAgICAgICAgICAgdGV4dDogc3VnZ2VzdGlvbi50ZXh0ICE9IG51bGwgPyBzdWdnZXN0aW9uLnRleHQgOiBzdWdnZXN0aW9uLndvcmQsXG4gICAgICAgICAgICAgIHNuaXBwZXQ6IHN1Z2dlc3Rpb24uc25pcHBldCxcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXggIT0gbnVsbCA/IHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXggOiBzdWdnZXN0aW9uLnByZWZpeCxcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBzdWdnZXN0aW9uLmNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgdHlwZTogc3VnZ2VzdGlvbi50eXBlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKG5ld1N1Z2dlc3Rpb24ucmlnaHRMYWJlbEhUTUwgPT0gbnVsbCkgJiYgc3VnZ2VzdGlvbi5yZW5kZXJMYWJlbEFzSHRtbCkgeyBuZXdTdWdnZXN0aW9uLnJpZ2h0TGFiZWxIVE1MID0gc3VnZ2VzdGlvbi5sYWJlbCB9XG4gICAgICAgICAgICBpZiAoKG5ld1N1Z2dlc3Rpb24ucmlnaHRMYWJlbCA9PSBudWxsKSAmJiAhc3VnZ2VzdGlvbi5yZW5kZXJMYWJlbEFzSHRtbCkgeyBuZXdTdWdnZXN0aW9uLnJpZ2h0TGFiZWwgPSBzdWdnZXN0aW9uLmxhYmVsIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdTdWdnZXN0aW9uXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoYXNFbXB0eSA9IGZhbHNlIC8vIE9wdGltaXphdGlvbjogb25seSBjcmVhdGUgYW5vdGhlciBhcnJheSB3aGVuIHRoZXJlIGFyZSBlbXB0eSBpdGVtc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3ZpZGVyU3VnZ2VzdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBzdWdnZXN0aW9uID0gcHJvdmlkZXJTdWdnZXN0aW9uc1tpXVxuICAgICAgICAgIGlmICghc3VnZ2VzdGlvbi5zbmlwcGV0ICYmICFzdWdnZXN0aW9uLnRleHQpIHsgaGFzRW1wdHkgPSB0cnVlIH1cbiAgICAgICAgICBpZiAoc3VnZ2VzdGlvbi5yZXBsYWNlbWVudFByZWZpeCA9PSBudWxsKSB7IHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXggPSB0aGlzLmdldERlZmF1bHRSZXBsYWNlbWVudFByZWZpeChvcHRpb25zLnByZWZpeCkgfVxuICAgICAgICAgIHN1Z2dlc3Rpb24ucHJvdmlkZXIgPSBwcm92aWRlclxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc0VtcHR5KSB7XG4gICAgICAgICAgY29uc3QgcmVzID0gW11cbiAgICAgICAgICBmb3IgKGNvbnN0IHMgb2YgcHJvdmlkZXJTdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgaWYgKHMuc25pcHBldCB8fCBzLnRleHQpIHtcbiAgICAgICAgICAgICAgcmVzLnB1c2gocylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvdmlkZXJTdWdnZXN0aW9ucyA9IHJlc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb3ZpZGVyLmZpbHRlclN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgcHJvdmlkZXJTdWdnZXN0aW9ucyA9IHRoaXMuZmlsdGVyU3VnZ2VzdGlvbnMocHJvdmlkZXJTdWdnZXN0aW9ucywgb3B0aW9ucylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvdmlkZXJTdWdnZXN0aW9uc1xuICAgICAgfSkpXG4gICAgfSlcblxuICAgIGlmICghcHJvdmlkZXJQcm9taXNlcyB8fCAhcHJvdmlkZXJQcm9taXNlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHN1Z2dlc3Rpb25zUHJvbWlzZSA9IFByb21pc2UuYWxsKHByb3ZpZGVyUHJvbWlzZXMpXG4gICAgdGhpcy5jdXJyZW50U3VnZ2VzdGlvbnNQcm9taXNlID0gc3VnZ2VzdGlvbnNQcm9taXNlXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFN1Z2dlc3Rpb25zUHJvbWlzZVxuICAgICAgLnRoZW4odGhpcy5tZXJnZVN1Z2dlc3Rpb25zRnJvbVByb3ZpZGVycylcbiAgICAgIC50aGVuKHN1Z2dlc3Rpb25zID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFN1Z2dlc3Rpb25zUHJvbWlzZSAhPT0gc3VnZ2VzdGlvbnNQcm9taXNlKSB7IHJldHVybiB9XG4gICAgICAgIGlmIChvcHRpb25zLmFjdGl2YXRlZE1hbnVhbGx5ICYmIHRoaXMuc2hvdWxkRGlzcGxheVN1Z2dlc3Rpb25zICYmIHRoaXMuYXV0b0NvbmZpcm1TaW5nbGVTdWdnZXN0aW9uRW5hYmxlZCAmJiBzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAvLyBXaGVuIHRoZXJlIGlzIG9uZSBzdWdnZXN0aW9uIGluIG1hbnVhbCBtb2RlLCBqdXN0IGNvbmZpcm0gaXRcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25maXJtKHN1Z2dlc3Rpb25zWzBdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXlTdWdnZXN0aW9ucyhzdWdnZXN0aW9ucywgb3B0aW9ucylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIClcbiAgfVxuXG4gIGZpbHRlclN1Z2dlc3Rpb25zIChzdWdnZXN0aW9ucywge3ByZWZpeH0pIHtcbiAgICBjb25zdCByZXN1bHRzID0gW11cbiAgICBjb25zdCBmdXp6YWxkcmluUHJvdmlkZXIgPSB0aGlzLnVzZUFsdGVybmF0ZVNjb3JpbmcgPyBmdXp6YWxkcmluUGx1cyA6IGZ1enphbGRyaW5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1Z2dlc3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBzb3J0U2NvcmUgbW9zdGx5IHByZXNlcnZlcyBpbiB0aGUgb3JpZ2luYWwgc29ydGluZy4gVGhlIGZ1bmN0aW9uIGlzXG4gICAgICAvLyBjaG9zZW4gc3VjaCB0aGF0IHN1Z2dlc3Rpb25zIHdpdGggYSB2ZXJ5IGhpZ2ggbWF0Y2ggc2NvcmUgY2FuIGJyZWFrIG91dC5cbiAgICAgIGxldCBzY29yZVxuICAgICAgY29uc3Qgc3VnZ2VzdGlvbiA9IHN1Z2dlc3Rpb25zW2ldXG4gICAgICBzdWdnZXN0aW9uLnNvcnRTY29yZSA9IE1hdGgubWF4KCgtaSAvIDEwKSArIDMsIDApICsgMVxuICAgICAgc3VnZ2VzdGlvbi5zY29yZSA9IG51bGxcblxuICAgICAgY29uc3QgdGV4dCA9IChzdWdnZXN0aW9uLnNuaXBwZXQgfHwgc3VnZ2VzdGlvbi50ZXh0KVxuICAgICAgY29uc3Qgc3VnZ2VzdGlvblByZWZpeCA9IHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXggIT0gbnVsbCA/IHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXggOiBwcmVmaXhcbiAgICAgIGNvbnN0IHByZWZpeElzRW1wdHkgPSAhc3VnZ2VzdGlvblByZWZpeCB8fCBzdWdnZXN0aW9uUHJlZml4ID09PSAnICdcbiAgICAgIGNvbnN0IGZpcnN0Q2hhcklzTWF0Y2ggPSAhcHJlZml4SXNFbXB0eSAmJiBzdWdnZXN0aW9uUHJlZml4WzBdLnRvTG93ZXJDYXNlKCkgPT09IHRleHRbMF0udG9Mb3dlckNhc2UoKVxuXG4gICAgICBpZiAocHJlZml4SXNFbXB0eSkge1xuICAgICAgICByZXN1bHRzLnB1c2goc3VnZ2VzdGlvbilcbiAgICAgIH1cbiAgICAgIGlmIChmaXJzdENoYXJJc01hdGNoICYmIChzY29yZSA9IGZ1enphbGRyaW5Qcm92aWRlci5zY29yZSh0ZXh0LCBzdWdnZXN0aW9uUHJlZml4KSkgPiAwKSB7XG4gICAgICAgIHN1Z2dlc3Rpb24uc2NvcmUgPSBzY29yZSAqIHN1Z2dlc3Rpb24uc29ydFNjb3JlXG4gICAgICAgIHJlc3VsdHMucHVzaChzdWdnZXN0aW9uKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VsdHMuc29ydCh0aGlzLnJldmVyc2VTb3J0T25TY29yZUNvbXBhcmF0b3IpXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuXG4gIHJldmVyc2VTb3J0T25TY29yZUNvbXBhcmF0b3IgKGEsIGIpIHtcbiAgICBsZXQgYnNjb3JlID0gYi5zY29yZVxuICAgIGlmICghYnNjb3JlKSB7XG4gICAgICBic2NvcmUgPSBiLnNvcnRTY29yZVxuICAgIH1cbiAgICBsZXQgYXNjb3JlID0gYS5zY29yZVxuICAgIGlmICghYXNjb3JlKSB7XG4gICAgICBhc2NvcmUgPSBiLnNvcnRTY29yZVxuICAgIH1cbiAgICByZXR1cm4gYnNjb3JlIC0gYXNjb3JlXG4gIH1cblxuICAvLyBwcm92aWRlclN1Z2dlc3Rpb25zIC0gYXJyYXkgb2YgYXJyYXlzIG9mIHN1Z2dlc3Rpb25zIHByb3ZpZGVkIGJ5IGFsbCBjYWxsZWQgcHJvdmlkZXJzXG4gIG1lcmdlU3VnZ2VzdGlvbnNGcm9tUHJvdmlkZXJzIChwcm92aWRlclN1Z2dlc3Rpb25zKSB7XG4gICAgcmV0dXJuIHByb3ZpZGVyU3VnZ2VzdGlvbnMucmVkdWNlKChzdWdnZXN0aW9ucywgcHJvdmlkZXJTdWdnZXN0aW9ucykgPT4ge1xuICAgICAgaWYgKHByb3ZpZGVyU3VnZ2VzdGlvbnMgJiYgcHJvdmlkZXJTdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucy5jb25jYXQocHJvdmlkZXJTdWdnZXN0aW9ucylcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG4gICAgfSwgW10pXG4gIH1cblxuICBkZXByZWNhdGVGb3JTdWdnZXN0aW9uIChwcm92aWRlciwgc3VnZ2VzdGlvbikge1xuICAgIGxldCBoYXNEZXByZWNhdGlvbnMgPSBmYWxzZVxuICAgIGlmIChzdWdnZXN0aW9uLndvcmQgIT0gbnVsbCkge1xuICAgICAgaGFzRGVwcmVjYXRpb25zID0gdHJ1ZVxuICAgICAgaWYgKHR5cGVvZiBncmltID09PSAndW5kZWZpbmVkJyB8fCBncmltID09PSBudWxsKSB7IGdyaW0gPSByZXF1aXJlKCdncmltJykgfVxuICAgICAgZ3JpbS5kZXByZWNhdGUoYEF1dG9jb21wbGV0ZSBwcm92aWRlciAnJHtwcm92aWRlci5jb25zdHJ1Y3Rvci5uYW1lfSgke3Byb3ZpZGVyLmlkfSknXG5yZXR1cm5zIHN1Z2dlc3Rpb25zIHdpdGggYSBcXGB3b3JkXFxgIGF0dHJpYnV0ZS5cblRoZSBcXGB3b3JkXFxgIGF0dHJpYnV0ZSBpcyBub3cgXFxgdGV4dFxcYC5cblNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy93aWtpL1Byb3ZpZGVyLUFQSWBcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKHN1Z2dlc3Rpb24ucHJlZml4ICE9IG51bGwpIHtcbiAgICAgIGhhc0RlcHJlY2F0aW9ucyA9IHRydWVcbiAgICAgIGlmICh0eXBlb2YgZ3JpbSA9PT0gJ3VuZGVmaW5lZCcgfHwgZ3JpbSA9PT0gbnVsbCkgeyBncmltID0gcmVxdWlyZSgnZ3JpbScpIH1cbiAgICAgIGdyaW0uZGVwcmVjYXRlKGBBdXRvY29tcGxldGUgcHJvdmlkZXIgJyR7cHJvdmlkZXIuY29uc3RydWN0b3IubmFtZX0oJHtwcm92aWRlci5pZH0pJ1xucmV0dXJucyBzdWdnZXN0aW9ucyB3aXRoIGEgXFxgcHJlZml4XFxgIGF0dHJpYnV0ZS5cblRoZSBcXGBwcmVmaXhcXGAgYXR0cmlidXRlIGlzIG5vdyBcXGByZXBsYWNlbWVudFByZWZpeFxcYCBhbmQgaXMgb3B0aW9uYWwuXG5TZWUgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvd2lraS9Qcm92aWRlci1BUElgXG4gICAgICApXG4gICAgfVxuICAgIGlmIChzdWdnZXN0aW9uLmxhYmVsICE9IG51bGwpIHtcbiAgICAgIGhhc0RlcHJlY2F0aW9ucyA9IHRydWVcbiAgICAgIGlmICh0eXBlb2YgZ3JpbSA9PT0gJ3VuZGVmaW5lZCcgfHwgZ3JpbSA9PT0gbnVsbCkgeyBncmltID0gcmVxdWlyZSgnZ3JpbScpIH1cbiAgICAgIGdyaW0uZGVwcmVjYXRlKGBBdXRvY29tcGxldGUgcHJvdmlkZXIgJyR7cHJvdmlkZXIuY29uc3RydWN0b3IubmFtZX0oJHtwcm92aWRlci5pZH0pJ1xucmV0dXJucyBzdWdnZXN0aW9ucyB3aXRoIGEgXFxgbGFiZWxcXGAgYXR0cmlidXRlLlxuVGhlIFxcYGxhYmVsXFxgIGF0dHJpYnV0ZSBpcyBub3cgXFxgcmlnaHRMYWJlbFxcYCBvciBcXGByaWdodExhYmVsSFRNTFxcYC5cblNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy93aWtpL1Byb3ZpZGVyLUFQSWBcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKHN1Z2dlc3Rpb24ub25XaWxsQ29uZmlybSAhPSBudWxsKSB7XG4gICAgICBoYXNEZXByZWNhdGlvbnMgPSB0cnVlXG4gICAgICBpZiAodHlwZW9mIGdyaW0gPT09ICd1bmRlZmluZWQnIHx8IGdyaW0gPT09IG51bGwpIHsgZ3JpbSA9IHJlcXVpcmUoJ2dyaW0nKSB9XG4gICAgICBncmltLmRlcHJlY2F0ZShgQXV0b2NvbXBsZXRlIHByb3ZpZGVyICcke3Byb3ZpZGVyLmNvbnN0cnVjdG9yLm5hbWV9KCR7cHJvdmlkZXIuaWR9KSdcbnJldHVybnMgc3VnZ2VzdGlvbnMgd2l0aCBhIFxcYG9uV2lsbENvbmZpcm1cXGAgY2FsbGJhY2suXG5UaGUgXFxgb25XaWxsQ29uZmlybVxcYCBjYWxsYmFjayBpcyBubyBsb25nZXIgc3VwcG9ydGVkLlxuU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL3dpa2kvUHJvdmlkZXItQVBJYFxuICAgICAgKVxuICAgIH1cbiAgICBpZiAoc3VnZ2VzdGlvbi5vbkRpZENvbmZpcm0gIT0gbnVsbCkge1xuICAgICAgaGFzRGVwcmVjYXRpb25zID0gdHJ1ZVxuICAgICAgaWYgKHR5cGVvZiBncmltID09PSAndW5kZWZpbmVkJyB8fCBncmltID09PSBudWxsKSB7IGdyaW0gPSByZXF1aXJlKCdncmltJykgfVxuICAgICAgZ3JpbS5kZXByZWNhdGUoYEF1dG9jb21wbGV0ZSBwcm92aWRlciAnJHtwcm92aWRlci5jb25zdHJ1Y3Rvci5uYW1lfSgke3Byb3ZpZGVyLmlkfSknXG5yZXR1cm5zIHN1Z2dlc3Rpb25zIHdpdGggYSBcXGBvbkRpZENvbmZpcm1cXGAgY2FsbGJhY2suXG5UaGUgXFxgb25EaWRDb25maXJtXFxgIGNhbGxiYWNrIGlzIG5vdyBhIFxcYG9uRGlkSW5zZXJ0U3VnZ2VzdGlvblxcYCBjYWxsYmFjayBvbiB0aGUgcHJvdmlkZXIgaXRzZWxmLlxuU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL3dpa2kvUHJvdmlkZXItQVBJYFxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gaGFzRGVwcmVjYXRpb25zXG4gIH1cblxuICBkaXNwbGF5U3VnZ2VzdGlvbnMgKHN1Z2dlc3Rpb25zLCBvcHRpb25zKSB7XG4gICAgc3VnZ2VzdGlvbnMgPSB0aGlzLmdldFVuaXF1ZVN1Z2dlc3Rpb25zKHN1Z2dlc3Rpb25zKVxuXG4gICAgaWYgKHRoaXMuc2hvdWxkRGlzcGxheVN1Z2dlc3Rpb25zICYmIHN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2hvd1N1Z2dlc3Rpb25MaXN0KHN1Z2dlc3Rpb25zLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5oaWRlU3VnZ2VzdGlvbkxpc3QoKVxuICAgIH1cbiAgfVxuXG4gIGdldFVuaXF1ZVN1Z2dlc3Rpb25zIChzdWdnZXN0aW9ucykge1xuICAgIGNvbnN0IHNlZW4gPSB7fVxuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWdnZXN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgc3VnZ2VzdGlvbiA9IHN1Z2dlc3Rpb25zW2ldXG4gICAgICBjb25zdCB2YWwgPSBzdWdnZXN0aW9uLnRleHQgKyBzdWdnZXN0aW9uLnNuaXBwZXRcbiAgICAgIGlmICghc2Vlblt2YWxdKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHN1Z2dlc3Rpb24pXG4gICAgICAgIHNlZW5bdmFsXSA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZ2V0UHJlZml4IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSB7XG4gICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLnByZWZpeFJlZ2V4LmV4ZWMobGluZSlcbiAgICBpZiAoIXByZWZpeCB8fCAhcHJlZml4WzJdKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG4gICAgcmV0dXJuIHByZWZpeFsyXVxuICB9XG5cbiAgZ2V0RGVmYXVsdFJlcGxhY2VtZW50UHJlZml4IChwcmVmaXgpIHtcbiAgICBpZiAodGhpcy53b3JkUHJlZml4UmVnZXgudGVzdChwcmVmaXgpKSB7XG4gICAgICByZXR1cm4gcHJlZml4XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgfVxuXG4gIC8vIFByaXZhdGU6IEdldHMgY2FsbGVkIHdoZW4gdGhlIHVzZXIgc3VjY2Vzc2Z1bGx5IGNvbmZpcm1zIGEgc3VnZ2VzdGlvblxuICAvL1xuICAvLyBtYXRjaCAtIEFuIHtPYmplY3R9IHJlcHJlc2VudGluZyB0aGUgY29uZmlybWVkIHN1Z2dlc3Rpb25cbiAgY29uZmlybSAoc3VnZ2VzdGlvbikge1xuICAgIGlmICgodGhpcy5lZGl0b3IgPT0gbnVsbCkgfHwgKHN1Z2dlc3Rpb24gPT0gbnVsbCkgfHwgISF0aGlzLmRpc3Bvc2VkKSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBhcGlWZXJzaW9uID0gdGhpcy5wcm92aWRlck1hbmFnZXIuYXBpVmVyc2lvbkZvclByb3ZpZGVyKHN1Z2dlc3Rpb24ucHJvdmlkZXIpXG4gICAgY29uc3QgYXBpSXMyMCA9IHNlbXZlci5zYXRpc2ZpZXMoYXBpVmVyc2lvbiwgJz49Mi4wLjAnKVxuICAgIGNvbnN0IHRyaWdnZXJQb3NpdGlvbiA9IHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAvLyBUT0RPIEFQSTogUmVtb3ZlIGFzIHRoaXMgaXMgbm8gbG9uZ2VyIHVzZWRcbiAgICBpZiAoc3VnZ2VzdGlvbi5vbldpbGxDb25maXJtKSB7XG4gICAgICBzdWdnZXN0aW9uLm9uV2lsbENvbmZpcm0oKVxuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGlvbnMgPSB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBpZiAoc2VsZWN0aW9ucyAmJiBzZWxlY3Rpb25zLmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBzIG9mIHNlbGVjdGlvbnMpIHtcbiAgICAgICAgaWYgKHMgJiYgcy5jbGVhcikge1xuICAgICAgICAgIHMuY2xlYXIoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5oaWRlU3VnZ2VzdGlvbkxpc3QoKVxuXG4gICAgdGhpcy5yZXBsYWNlVGV4dFdpdGhNYXRjaChzdWdnZXN0aW9uKVxuXG4gICAgLy8gVE9ETyBBUEk6IFJlbW92ZSB3aGVuIHdlIHJlbW92ZSB0aGUgMS4wIEFQSVxuICAgIGlmIChhcGlJczIwKSB7XG4gICAgICBpZiAoc3VnZ2VzdGlvbi5wcm92aWRlciAmJiBzdWdnZXN0aW9uLnByb3ZpZGVyLm9uRGlkSW5zZXJ0U3VnZ2VzdGlvbikge1xuICAgICAgICBzdWdnZXN0aW9uLnByb3ZpZGVyLm9uRGlkSW5zZXJ0U3VnZ2VzdGlvbih7ZWRpdG9yOiB0aGlzLmVkaXRvciwgc3VnZ2VzdGlvbiwgdHJpZ2dlclBvc2l0aW9ufSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN1Z2dlc3Rpb24ub25EaWRDb25maXJtKSB7XG4gICAgICAgIHN1Z2dlc3Rpb24ub25EaWRDb25maXJtKClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzaG93U3VnZ2VzdGlvbkxpc3QgKHN1Z2dlc3Rpb25zLCBvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMuZGlzcG9zZWQpIHsgcmV0dXJuIH1cbiAgICB0aGlzLnN1Z2dlc3Rpb25MaXN0LmNoYW5nZUl0ZW1zKHN1Z2dlc3Rpb25zKVxuICAgIHJldHVybiB0aGlzLnN1Z2dlc3Rpb25MaXN0LnNob3codGhpcy5lZGl0b3IsIG9wdGlvbnMpXG4gIH1cblxuICBoaWRlU3VnZ2VzdGlvbkxpc3QgKCkge1xuICAgIGlmICh0aGlzLmRpc3Bvc2VkKSB7IHJldHVybiB9XG4gICAgdGhpcy5zdWdnZXN0aW9uTGlzdC5jaGFuZ2VJdGVtcyhudWxsKVxuICAgIHRoaXMuc3VnZ2VzdGlvbkxpc3QuaGlkZSgpXG4gICAgdGhpcy5zaG91bGREaXNwbGF5U3VnZ2VzdGlvbnMgPSBmYWxzZVxuICB9XG5cbiAgcmVxdWVzdEhpZGVTdWdnZXN0aW9uTGlzdCAoY29tbWFuZCkge1xuICAgIHRoaXMuaGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuaGlkZVN1Z2dlc3Rpb25MaXN0LCAwKVxuICAgIHRoaXMuc2hvdWxkRGlzcGxheVN1Z2dlc3Rpb25zID0gZmFsc2VcbiAgfVxuXG4gIGNhbmNlbEhpZGVTdWdnZXN0aW9uTGlzdFJlcXVlc3QgKCkge1xuICAgIHJldHVybiBjbGVhclRpbWVvdXQodGhpcy5oaWRlVGltZW91dClcbiAgfVxuXG4gIC8vIFByaXZhdGU6IFJlcGxhY2VzIHRoZSBjdXJyZW50IHByZWZpeCB3aXRoIHRoZSBnaXZlbiBtYXRjaC5cbiAgLy9cbiAgLy8gbWF0Y2ggLSBUaGUgbWF0Y2ggdG8gcmVwbGFjZSB0aGUgY3VycmVudCBwcmVmaXggd2l0aFxuICByZXBsYWNlVGV4dFdpdGhNYXRjaCAoc3VnZ2VzdGlvbikge1xuICAgIGlmICh0aGlzLmVkaXRvciA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBjdXJzb3JzID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgaWYgKGN1cnNvcnMgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLnRyYW5zYWN0KCgpID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3Vyc29ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjdXJzb3IgPSBjdXJzb3JzW2ldXG4gICAgICAgIGNvbnN0IGVuZFBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgY29uc3QgYmVnaW5uaW5nUG9zaXRpb24gPSBbZW5kUG9zaXRpb24ucm93LCBlbmRQb3NpdGlvbi5jb2x1bW4gLSBzdWdnZXN0aW9uLnJlcGxhY2VtZW50UHJlZml4Lmxlbmd0aF1cblxuICAgICAgICBpZiAodGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW2JlZ2lubmluZ1Bvc2l0aW9uLCBlbmRQb3NpdGlvbl0pID09PSBzdWdnZXN0aW9uLnJlcGxhY2VtZW50UHJlZml4KSB7XG4gICAgICAgICAgY29uc3Qgc3VmZml4ID0gdGhpcy5jb25zdW1lU3VmZml4ID8gdGhpcy5nZXRTdWZmaXgodGhpcy5lZGl0b3IsIGVuZFBvc2l0aW9uLCBzdWdnZXN0aW9uKSA6ICcnXG4gICAgICAgICAgaWYgKHN1ZmZpeC5sZW5ndGgpIHsgY3Vyc29yLm1vdmVSaWdodChzdWZmaXgubGVuZ3RoKSB9XG4gICAgICAgICAgY3Vyc29yLnNlbGVjdGlvbi5zZWxlY3RMZWZ0KHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXgubGVuZ3RoICsgc3VmZml4Lmxlbmd0aClcblxuICAgICAgICAgIGlmICgoc3VnZ2VzdGlvbi5zbmlwcGV0ICE9IG51bGwpICYmICh0aGlzLnNuaXBwZXRzTWFuYWdlciAhPSBudWxsKSkge1xuICAgICAgICAgICAgdGhpcy5zbmlwcGV0c01hbmFnZXIuaW5zZXJ0U25pcHBldChzdWdnZXN0aW9uLnNuaXBwZXQsIHRoaXMuZWRpdG9yLCBjdXJzb3IpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnNvci5zZWxlY3Rpb24uaW5zZXJ0VGV4dChzdWdnZXN0aW9uLnRleHQgIT0gbnVsbCA/IHN1Z2dlc3Rpb24udGV4dCA6IHN1Z2dlc3Rpb24uc25pcHBldCwge1xuICAgICAgICAgICAgICBhdXRvSW5kZW50TmV3bGluZTogdGhpcy5lZGl0b3Iuc2hvdWxkQXV0b0luZGVudCgpLFxuICAgICAgICAgICAgICBhdXRvRGVjcmVhc2VJbmRlbnQ6IHRoaXMuZWRpdG9yLnNob3VsZEF1dG9JbmRlbnQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgKVxuICB9XG5cbiAgZ2V0U3VmZml4IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzdWdnZXN0aW9uKSB7XG4gICAgLy8gVGhpcyBqdXN0IGNoZXdzIHRocm91Z2ggdGhlIHN1Z2dlc3Rpb24gYW5kIHRyaWVzIHRvIG1hdGNoIHRoZSBzdWdnZXN0aW9uXG4gICAgLy8gc3Vic3RyaW5nIHdpdGggdGhlIGxpbmVUZXh0IHN0YXJ0aW5nIGF0IHRoZSBjdXJzb3IuIFRoZXJlIGlzIHByb2JhYmx5IGFcbiAgICAvLyBtb3JlIGVmZmljaWVudCB3YXkgdG8gZG8gdGhpcy5cbiAgICBsZXQgc3VmZml4ID0gKHN1Z2dlc3Rpb24uc25pcHBldCAhPSBudWxsID8gc3VnZ2VzdGlvbi5zbmlwcGV0IDogc3VnZ2VzdGlvbi50ZXh0KVxuICAgIGNvbnN0IGVuZFBvc2l0aW9uID0gW2J1ZmZlclBvc2l0aW9uLnJvdywgYnVmZmVyUG9zaXRpb24uY29sdW1uICsgc3VmZml4Lmxlbmd0aF1cbiAgICBjb25zdCBlbmRPZkxpbmVUZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtidWZmZXJQb3NpdGlvbiwgZW5kUG9zaXRpb25dKVxuICAgIGNvbnN0IG5vbldvcmRDaGFyYWN0ZXJzID0gbmV3IFNldChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5ub25Xb3JkQ2hhcmFjdGVycycpLnNwbGl0KCcnKSlcbiAgICB3aGlsZSAoc3VmZml4KSB7XG4gICAgICBpZiAoZW5kT2ZMaW5lVGV4dC5zdGFydHNXaXRoKHN1ZmZpeCkgJiYgIW5vbldvcmRDaGFyYWN0ZXJzLmhhcyhzdWZmaXhbMF0pKSB7IGJyZWFrIH1cbiAgICAgIHN1ZmZpeCA9IHN1ZmZpeC5zbGljZSgxKVxuICAgIH1cbiAgICByZXR1cm4gc3VmZml4XG4gIH1cblxuICAvLyBQcml2YXRlOiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBmaWxlIGlzIGJsYWNrbGlzdGVkLlxuICAvL1xuICAvLyBSZXR1cm5zIHtCb29sZWFufSB0aGF0IGRlZmluZXMgd2hldGhlciB0aGUgY3VycmVudCBmaWxlIGlzIGJsYWNrbGlzdGVkXG4gIGlzQ3VycmVudEZpbGVCbGFja0xpc3RlZCAoKSB7XG4gICAgLy8gbWluaW1hdGNoIGlzIHNsb3cuIE5vdCBuZWNlc3NhcnkgdG8gZG8gdGhpcyBjb21wdXRhdGlvbiBvbiBldmVyeSByZXF1ZXN0IGZvciBzdWdnZXN0aW9uc1xuICAgIGxldCBsZWZ0XG4gICAgaWYgKHRoaXMuaXNDdXJyZW50RmlsZUJsYWNrTGlzdGVkQ2FjaGUgIT0gbnVsbCkgeyByZXR1cm4gdGhpcy5pc0N1cnJlbnRGaWxlQmxhY2tMaXN0ZWRDYWNoZSB9XG5cbiAgICBpZiAoKHRoaXMuZmlsZUJsYWNrbGlzdCA9PSBudWxsKSB8fCB0aGlzLmZpbGVCbGFja2xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmlzQ3VycmVudEZpbGVCbGFja0xpc3RlZENhY2hlID0gZmFsc2VcbiAgICAgIHJldHVybiB0aGlzLmlzQ3VycmVudEZpbGVCbGFja0xpc3RlZENhY2hlXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtaW5pbWF0Y2ggPT09ICd1bmRlZmluZWQnIHx8IG1pbmltYXRjaCA9PT0gbnVsbCkgeyBtaW5pbWF0Y2ggPSByZXF1aXJlKCdtaW5pbWF0Y2gnKSB9XG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKChsZWZ0ID0gdGhpcy5idWZmZXIuZ2V0UGF0aCgpKSAhPSBudWxsID8gbGVmdCA6ICcnKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5maWxlQmxhY2tsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBibGFja2xpc3RHbG9iID0gdGhpcy5maWxlQmxhY2tsaXN0W2ldXG4gICAgICBpZiAobWluaW1hdGNoKGZpbGVOYW1lLCBibGFja2xpc3RHbG9iKSkge1xuICAgICAgICB0aGlzLmlzQ3VycmVudEZpbGVCbGFja0xpc3RlZENhY2hlID0gdHJ1ZVxuICAgICAgICByZXR1cm4gdGhpcy5pc0N1cnJlbnRGaWxlQmxhY2tMaXN0ZWRDYWNoZVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXNDdXJyZW50RmlsZUJsYWNrTGlzdGVkQ2FjaGUgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzLmlzQ3VycmVudEZpbGVCbGFja0xpc3RlZENhY2hlXG4gIH1cblxuICAvLyBQcml2YXRlOiBHZXRzIGNhbGxlZCB3aGVuIHRoZSBjb250ZW50IGhhcyBiZWVuIG1vZGlmaWVkXG4gIHJlcXVlc3ROZXdTdWdnZXN0aW9ucyAoKSB7XG4gICAgbGV0IGRlbGF5ID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5hdXRvQWN0aXZhdGlvbkRlbGF5JylcbiAgICBjbGVhclRpbWVvdXQodGhpcy5kZWxheVRpbWVvdXQpXG4gICAgaWYgKHRoaXMuc3VnZ2VzdGlvbkxpc3QuaXNBY3RpdmUoKSkgeyBkZWxheSA9IHRoaXMuc3VnZ2VzdGlvbkRlbGF5IH1cbiAgICB0aGlzLmRlbGF5VGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5maW5kU3VnZ2VzdGlvbnMsIGRlbGF5KVxuICAgIHRoaXMuc2hvdWxkRGlzcGxheVN1Z2dlc3Rpb25zID0gdHJ1ZVxuICB9XG5cbiAgY2FuY2VsTmV3U3VnZ2VzdGlvbnNSZXF1ZXN0ICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5kZWxheVRpbWVvdXQpXG4gICAgdGhpcy5zaG91bGREaXNwbGF5U3VnZ2VzdGlvbnMgPSBmYWxzZVxuICB9XG5cbiAgLy8gUHJpdmF0ZTogR2V0cyBjYWxsZWQgd2hlbiB0aGUgY3Vyc29yIGhhcyBtb3ZlZC4gQ2FuY2VscyB0aGUgYXV0b2NvbXBsZXRpb24gaWZcbiAgLy8gdGhlIHRleHQgaGFzIG5vdCBiZWVuIGNoYW5nZWQuXG4gIC8vXG4gIC8vIGRhdGEgLSBBbiB7T2JqZWN0fSBjb250YWluaW5nIGluZm9ybWF0aW9uIG9uIHdoeSB0aGUgY3Vyc29yIGhhcyBiZWVuIG1vdmVkXG4gIGN1cnNvck1vdmVkICh7dGV4dENoYW5nZWR9KSB7XG4gICAgLy8gVGhlIGRlbGF5IGlzIGEgd29ya2Fyb3VuZCBmb3IgdGhlIGJhY2tzcGFjZSBjYXNlLiBUaGUgd2F5IGF0b20gaW1wbGVtZW50c1xuICAgIC8vIGJhY2tzcGFjZSBpcyB0byBzZWxlY3QgbGVmdCAxIGNoYXIsIHRoZW4gZGVsZXRlLiBUaGlzIHJlc3VsdHMgaW4gYVxuICAgIC8vIGN1cnNvck1vdmVkIGV2ZW50IHdpdGggdGV4dENoYW5nZWQgPT0gZmFsc2UuIFNvIHdlIGRlbGF5LCBhbmQgaWYgdGhlXG4gICAgLy8gYnVmZmVyQ2hhbmdlZCBoYW5kbGVyIGRlY2lkZXMgdG8gc2hvdyBzdWdnZXN0aW9ucywgaXQgd2lsbCBjYW5jZWwgdGhlXG4gICAgLy8gaGlkZVN1Z2dlc3Rpb25MaXN0IHJlcXVlc3QuIElmIHRoZXJlIGlzIG5vIGJ1ZmZlckNoYW5nZWQgZXZlbnQsXG4gICAgLy8gc3VnZ2VzdGlvbkxpc3Qgd2lsbCBiZSBoaWRkZW4uXG4gICAgaWYgKCF0ZXh0Q2hhbmdlZCAmJiAhdGhpcy5zaG91bGRBY3RpdmF0ZSkgeyByZXR1cm4gdGhpcy5yZXF1ZXN0SGlkZVN1Z2dlc3Rpb25MaXN0KCkgfVxuICB9XG5cbiAgLy8gUHJpdmF0ZTogR2V0cyBjYWxsZWQgd2hlbiB0aGUgdXNlciBzYXZlcyB0aGUgZG9jdW1lbnQuIENhbmNlbHMgdGhlXG4gIC8vIGF1dG9jb21wbGV0aW9uLlxuICBidWZmZXJTYXZlZCAoKSB7XG4gICAgaWYgKCF0aGlzLmF1dG9zYXZlRW5hYmxlZCkgeyByZXR1cm4gdGhpcy5oaWRlU3VnZ2VzdGlvbkxpc3QoKSB9XG4gIH1cblxuICB0b2dnbGVBY3RpdmF0aW9uRm9yQnVmZmVyQ2hhbmdlICh7bmV3VGV4dCwgbmV3UmFuZ2UsIG9sZFRleHQsIG9sZFJhbmdlfSkge1xuICAgIGlmICh0aGlzLmRpc3Bvc2VkKSB7IHJldHVybiB9XG4gICAgaWYgKHRoaXMuc2hvdWxkQWN0aXZhdGUpIHsgcmV0dXJuIH1cbiAgICBpZiAodGhpcy5jb21wb3NpdGlvbkluUHJvZ3Jlc3MpIHsgcmV0dXJuIHRoaXMuaGlkZVN1Z2dlc3Rpb25MaXN0KCkgfVxuXG4gICAgaWYgKHRoaXMuYXV0b0FjdGl2YXRpb25FbmFibGVkIHx8IHRoaXMuc3VnZ2VzdGlvbkxpc3QuaXNBY3RpdmUoKSkge1xuICAgICAgaWYgKG5ld1RleHQubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBBY3RpdmF0ZSBvbiBzcGFjZSwgYSBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIsIG9yIGEgYnJhY2tldC1tYXRjaGVyIHBhaXIuXG4gICAgICAgIGlmIChuZXdUZXh0ID09PSAnICcgfHwgbmV3VGV4dC50cmltKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgdGhpcy5zaG91bGRBY3RpdmF0ZSA9IHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXdUZXh0Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLmJyYWNrZXRNYXRjaGVyUGFpcnMpIHtcbiAgICAgICAgICAgIGlmIChuZXdUZXh0ID09PSBwYWlyKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvdWxkQWN0aXZhdGUgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG9sZFRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBTdWdnZXN0aW9uIGxpc3QgbXVzdCBiZSBlaXRoZXIgYWN0aXZlIG9yIGJhY2tzcGFjZVRyaWdnZXJzQXV0b2NvbXBsZXRlIG11c3QgYmUgdHJ1ZSBmb3IgYWN0aXZhdGlvbiB0byBvY2N1ci5cbiAgICAgICAgLy8gQWN0aXZhdGUgb24gcmVtb3ZhbCBvZiBhIHNwYWNlLCBhIG5vbi13aGl0ZXNwYWNlIGNoYXJhY3Rlciwgb3IgYSBicmFja2V0LW1hdGNoZXIgcGFpci5cbiAgICAgICAgaWYgKHRoaXMuYmFja3NwYWNlVHJpZ2dlcnNBdXRvY29tcGxldGUgfHwgdGhpcy5zdWdnZXN0aW9uTGlzdC5pc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgaWYgKG9sZFRleHQubGVuZ3RoID4gMCAmJiAodGhpcy5iYWNrc3BhY2VUcmlnZ2Vyc0F1dG9jb21wbGV0ZSB8fCB0aGlzLnN1Z2dlc3Rpb25MaXN0LmlzQWN0aXZlKCkpKSB7XG4gICAgICAgICAgICBpZiAob2xkVGV4dCA9PT0gJyAnIHx8IG9sZFRleHQudHJpbSgpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICB0aGlzLnNob3VsZEFjdGl2YXRlID0gdHJ1ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob2xkVGV4dC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHRoaXMuYnJhY2tldE1hdGNoZXJQYWlycykge1xuICAgICAgICAgICAgICAgIGlmIChvbGRUZXh0ID09PSBwYWlyKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnNob3VsZEFjdGl2YXRlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zaG91bGRBY3RpdmF0ZSAmJiB0aGlzLnNob3VsZFN1cHByZXNzQWN0aXZhdGlvbkZvckVkaXRvckNsYXNzZXMoKSkge1xuICAgICAgICB0aGlzLnNob3VsZEFjdGl2YXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzaG93T3JIaWRlU3VnZ2VzdGlvbkxpc3RGb3JCdWZmZXJDaGFuZ2VzICh7Y2hhbmdlc30pIHtcbiAgICBjb25zdCBsYXN0Q3Vyc29yUG9zaXRpb24gPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGNvbnN0IGNoYW5nZU9jY3VycmVkTmVhckxhc3RDdXJzb3IgPSBjaGFuZ2VzLnNvbWUoKHtzdGFydCwgbmV3RXh0ZW50fSkgPT4ge1xuICAgICAgY29uc3QgbmV3UmFuZ2UgPSBuZXcgUmFuZ2Uoc3RhcnQsIHN0YXJ0LnRyYXZlcnNlKG5ld0V4dGVudCkpXG4gICAgICByZXR1cm4gbmV3UmFuZ2UuY29udGFpbnNQb2ludChsYXN0Q3Vyc29yUG9zaXRpb24pXG4gICAgfSlcblxuICAgIGlmICh0aGlzLnNob3VsZEFjdGl2YXRlICYmIGNoYW5nZU9jY3VycmVkTmVhckxhc3RDdXJzb3IpIHtcbiAgICAgIHRoaXMuY2FuY2VsSGlkZVN1Z2dlc3Rpb25MaXN0UmVxdWVzdCgpXG4gICAgICB0aGlzLnJlcXVlc3ROZXdTdWdnZXN0aW9ucygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FuY2VsTmV3U3VnZ2VzdGlvbnNSZXF1ZXN0KClcbiAgICAgIHRoaXMuaGlkZVN1Z2dlc3Rpb25MaXN0KClcbiAgICB9XG5cbiAgICB0aGlzLnNob3VsZEFjdGl2YXRlID0gZmFsc2VcbiAgfVxuXG4gIHNob3dPckhpZGVTdWdnZXN0aW9uTGlzdEZvckJ1ZmZlckNoYW5nZSAoe25ld1RleHQsIG5ld1JhbmdlLCBvbGRUZXh0LCBvbGRSYW5nZX0pIHtcbiAgICBpZiAodGhpcy5kaXNwb3NlZCkgeyByZXR1cm4gfVxuICAgIGlmICh0aGlzLmNvbXBvc2l0aW9uSW5Qcm9ncmVzcykgeyByZXR1cm4gdGhpcy5oaWRlU3VnZ2VzdGlvbkxpc3QoKSB9XG4gICAgbGV0IHNob3VsZEFjdGl2YXRlID0gZmFsc2VcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbnMgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuXG4gICAgaWYgKHRoaXMuYXV0b0FjdGl2YXRpb25FbmFibGVkIHx8IHRoaXMuc3VnZ2VzdGlvbkxpc3QuaXNBY3RpdmUoKSkge1xuICAgICAgLy8gQWN0aXZhdGUgb24gc3BhY2UsIGEgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyLCBvciBhIGJyYWNrZXQtbWF0Y2hlciBwYWlyLlxuICAgICAgaWYgKG5ld1RleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoY3Vyc29yUG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiB7IHJldHVybiBuZXdSYW5nZS5jb250YWluc1BvaW50KHBvc2l0aW9uKSB9KSkge1xuICAgICAgICAgIGlmIChuZXdUZXh0ID09PSAnICcgfHwgbmV3VGV4dC50cmltKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBzaG91bGRBY3RpdmF0ZSA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5ld1RleHQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5icmFja2V0TWF0Y2hlclBhaXJzKSB7XG4gICAgICAgICAgICAgIGlmIChuZXdUZXh0ID09PSBwYWlyKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkQWN0aXZhdGUgPSB0cnVlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIC8vIFN1Z2dlc3Rpb24gbGlzdCBtdXN0IGJlIGVpdGhlciBhY3RpdmUgb3IgYmFja3NwYWNlVHJpZ2dlcnNBdXRvY29tcGxldGUgbXVzdCBiZSB0cnVlIGZvciBhY3RpdmF0aW9uIHRvIG9jY3VyLlxuICAgICAgLy8gQWN0aXZhdGUgb24gcmVtb3ZhbCBvZiBhIHNwYWNlLCBhIG5vbi13aGl0ZXNwYWNlIGNoYXJhY3Rlciwgb3IgYSBicmFja2V0LW1hdGNoZXIgcGFpci5cbiAgICAgIH0gZWxzZSBpZiAob2xkVGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmICgodGhpcy5iYWNrc3BhY2VUcmlnZ2Vyc0F1dG9jb21wbGV0ZSB8fCB0aGlzLnN1Z2dlc3Rpb25MaXN0LmlzQWN0aXZlKCkpICYmXG4gICAgICAgIChjdXJzb3JQb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IHsgcmV0dXJuIG5ld1JhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pIH0pKSkge1xuICAgICAgICAgIGlmIChvbGRUZXh0ID09PSAnICcgfHwgb2xkVGV4dC50cmltKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBzaG91bGRBY3RpdmF0ZSA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9sZFRleHQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5icmFja2V0TWF0Y2hlclBhaXJzKSB7XG4gICAgICAgICAgICAgIGlmIChvbGRUZXh0ID09PSBwYWlyKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkQWN0aXZhdGUgPSB0cnVlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNob3VsZEFjdGl2YXRlICYmIHRoaXMuc2hvdWxkU3VwcHJlc3NBY3RpdmF0aW9uRm9yRWRpdG9yQ2xhc3NlcygpKSB7IHNob3VsZEFjdGl2YXRlID0gZmFsc2UgfVxuICAgIH1cblxuICAgIGlmIChzaG91bGRBY3RpdmF0ZSkge1xuICAgICAgdGhpcy5jYW5jZWxIaWRlU3VnZ2VzdGlvbkxpc3RSZXF1ZXN0KClcbiAgICAgIHRoaXMucmVxdWVzdE5ld1N1Z2dlc3Rpb25zKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYW5jZWxOZXdTdWdnZXN0aW9uc1JlcXVlc3QoKVxuICAgICAgdGhpcy5oaWRlU3VnZ2VzdGlvbkxpc3QoKVxuICAgIH1cbiAgfVxuXG4gIHNob3VsZFN1cHByZXNzQWN0aXZhdGlvbkZvckVkaXRvckNsYXNzZXMgKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdXBwcmVzc0ZvckNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZXMgPSB0aGlzLnN1cHByZXNzRm9yQ2xhc3Nlc1tpXVxuICAgICAgbGV0IGNvbnRhaW5zQ291bnQgPSAwXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNsYXNzTmFtZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lc1tqXVxuICAgICAgICBpZiAodGhpcy5lZGl0b3JWaWV3LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7IGNvbnRhaW5zQ291bnQgKz0gMSB9XG4gICAgICB9XG4gICAgICBpZiAoY29udGFpbnNDb3VudCA9PT0gY2xhc3NOYW1lcy5sZW5ndGgpIHsgcmV0dXJuIHRydWUgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIFB1YmxpYzogQ2xlYW4gdXAsIHN0b3AgbGlzdGVuaW5nIHRvIGV2ZW50c1xuICBkaXNwb3NlICgpIHtcbiAgICB0aGlzLmhpZGVTdWdnZXN0aW9uTGlzdCgpXG4gICAgdGhpcy5kaXNwb3NlZCA9IHRydWVcbiAgICB0aGlzLnJlYWR5ID0gZmFsc2VcbiAgICBpZiAodGhpcy5lZGl0b3JTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLnN1Z2dlc3Rpb25MaXN0ID0gbnVsbFxuICAgIHRoaXMucHJvdmlkZXJNYW5hZ2VyID0gbnVsbFxuICB9XG59XG4iXX0=