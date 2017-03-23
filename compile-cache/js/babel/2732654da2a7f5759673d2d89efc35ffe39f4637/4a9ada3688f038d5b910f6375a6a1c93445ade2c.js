'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _atom = require('atom');

var _selectorKit = require('selector-kit');

var _unicodeHelpers = require('./unicode-helpers');

var _symbolStore = require('./symbol-store');

var _symbolStore2 = _interopRequireDefault(_symbolStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let SymbolProvider = class SymbolProvider {
  constructor() {
    this.defaults();
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', enableExtendedUnicodeSupport => {
      if (enableExtendedUnicodeSupport) {
        this.wordRegex = new RegExp(`[${_unicodeHelpers.UnicodeLetters}\\d_]*[${_unicodeHelpers.UnicodeLetters}}_-]+[${_unicodeHelpers.UnicodeLetters}}\\d_]*(?=[^${_unicodeHelpers.UnicodeLetters}\\d_]|$)`, 'g');
        this.beginningOfLineWordRegex = new RegExp(`^[${_unicodeHelpers.UnicodeLetters}\\d_]*[${_unicodeHelpers.UnicodeLetters}_-]+[${_unicodeHelpers.UnicodeLetters}\\d_]*(?=[^${_unicodeHelpers.UnicodeLetters}\\d_]|$)`, 'g');
        this.endOfLineWordRegex = new RegExp(`[${_unicodeHelpers.UnicodeLetters}\\d_]*[${_unicodeHelpers.UnicodeLetters}_-]+[${_unicodeHelpers.UnicodeLetters}\\d_]*$`, 'g');
      } else {
        this.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;
        this.beginningOfLineWordRegex = /^\w*[a-zA-Z_-]+\w*\b/g;
        this.endOfLineWordRegex = /\b\w*[a-zA-Z_-]+\w*$/g;
      }

      this.symbolStore = new _symbolStore2.default(this.wordRegex);
      return this.symbolStore;
    }));
    this.watchedBuffers = new WeakMap();

    this.subscriptions.add(atom.config.observe('autocomplete-plus.minimumWordLength', minimumWordLength => {
      this.minimumWordLength = minimumWordLength;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.includeCompletionsFromAllBuffers', includeCompletionsFromAllBuffers => {
      this.includeCompletionsFromAllBuffers = includeCompletionsFromAllBuffers;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.useAlternateScoring', useAlternateScoring => {
      this.symbolStore.setUseAlternateScoring(useAlternateScoring);
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.useLocalityBonus', useLocalityBonus => {
      this.symbolStore.setUseLocalityBonus(useLocalityBonus);
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.strictMatching', useStrictMatching => {
      this.symbolStore.setUseStrictMatching(useStrictMatching);
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem(e => {
      this.updateCurrentEditor(e);
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors(e => {
      this.watchEditor(e);
    }));
  }

  defaults() {
    this.wordRegex = null;
    this.beginningOfLineWordRegex = null;
    this.endOfLineWordRegex = null;
    this.symbolStore = null;
    this.editor = null;
    this.buffer = null;
    this.changeUpdateDelay = 300;

    this.textEditorSelectors = new Set(['atom-pane > .item-views > atom-text-editor']);
    this.scopeSelector = '*';
    this.inclusionPriority = 0;
    this.suggestionPriority = 0;

    this.watchedBuffers = null;

    this.config = null;
    this.defaultConfig = {
      class: {
        selector: '.class.name, .inherited-class, .instance.type',
        typePriority: 4
      },
      function: {
        selector: '.function.name',
        typePriority: 3
      },
      variable: {
        selector: '.variable',
        typePriority: 2
      },
      '': {
        selector: '.source',
        typePriority: 1
      }
    };
  }

  dispose() {
    return this.subscriptions.dispose();
  }

  addTextEditorSelector(selector) {
    this.textEditorSelectors.add(selector);
    return new _atom.Disposable(() => this.textEditorSelectors.delete(selector));
  }

  getTextEditorSelector() {
    return Array.from(this.textEditorSelectors).join(', ');
  }

  watchEditor(editor) {
    let bufferEditors;
    const buffer = editor.getBuffer();
    const editorSubscriptions = new _atom.CompositeDisposable();
    editorSubscriptions.add(editor.onDidTokenize(() => {
      return this.buildWordListOnNextTick(editor);
    }));
    editorSubscriptions.add(editor.onDidDestroy(() => {
      const index = this.getWatchedEditorIndex(editor);
      const editors = this.watchedBuffers.get(editor.getBuffer());
      if (index > -1) {
        editors.splice(index, 1);
      }
      return editorSubscriptions.dispose();
    }));

    bufferEditors = this.watchedBuffers.get(buffer);
    if (bufferEditors) {
      bufferEditors.push(editor);
    } else {
      const bufferSubscriptions = new _atom.CompositeDisposable();
      bufferSubscriptions.add(buffer.onDidStopChanging(({ changes }) => {
        let editors = this.watchedBuffers.get(buffer);
        if (!editors) {
          editors = [];
        }
        if (editors && editors.length > 0 && editors[0] && !editors[0].largeFileMode) {
          for (const _ref of changes) {
            const { start, oldExtent, newExtent } = _ref;

            this.symbolStore.recomputeSymbolsForEditorInBufferRange(editors[0], start, oldExtent, newExtent);
          }
        }
      }));
      bufferSubscriptions.add(buffer.onDidDestroy(() => {
        this.symbolStore.clear(buffer);
        bufferSubscriptions.dispose();
        return this.watchedBuffers.delete(buffer);
      }));

      this.watchedBuffers.set(buffer, [editor]);
      this.buildWordListOnNextTick(editor);
    }
  }

  isWatchingEditor(editor) {
    return this.getWatchedEditorIndex(editor) > -1;
  }

  isWatchingBuffer(buffer) {
    return this.watchedBuffers.get(buffer) != null;
  }

  getWatchedEditorIndex(editor) {
    const editors = this.watchedBuffers.get(editor.getBuffer());
    if (editors) {
      return editors.indexOf(editor);
    } else {
      return -1;
    }
  }

  updateCurrentEditor(currentPaneItem) {
    if (currentPaneItem == null) {
      return;
    }
    if (currentPaneItem === this.editor) {
      return;
    }
    this.editor = null;
    if (this.paneItemIsValid(currentPaneItem)) {
      this.editor = currentPaneItem;
      return this.editor;
    }
  }

  buildConfigIfScopeChanged({ editor, scopeDescriptor }) {
    if (!this.scopeDescriptorsEqual(this.configScopeDescriptor, scopeDescriptor)) {
      this.buildConfig(scopeDescriptor);
      this.configScopeDescriptor = scopeDescriptor;
      return this.configScopeDescriptor;
    }
  }

  buildConfig(scopeDescriptor) {
    this.config = {};
    const legacyCompletions = this.settingsForScopeDescriptor(scopeDescriptor, 'editor.completions');
    const allConfigEntries = this.settingsForScopeDescriptor(scopeDescriptor, 'autocomplete.symbols');

    // Config entries are reverse sorted in order of specificity. We want most
    // specific to win; this simplifies the loop.
    allConfigEntries.reverse();

    for (let i = 0; i < legacyCompletions.length; i++) {
      const { value } = legacyCompletions[i];
      if (Array.isArray(value) && value.length) {
        this.addLegacyConfigEntry(value);
      }
    }

    let addedConfigEntry = false;
    for (let j = 0; j < allConfigEntries.length; j++) {
      const { value } = allConfigEntries[j];
      if (!Array.isArray(value) && typeof value === 'object') {
        this.addConfigEntry(value);
        addedConfigEntry = true;
      }
    }

    if (!addedConfigEntry) {
      return this.addConfigEntry(this.defaultConfig);
    }
  }

  addLegacyConfigEntry(suggestions) {
    suggestions = suggestions.map(suggestion => ({ text: suggestion, type: 'builtin' }));
    if (this.config.builtin == null) {
      this.config.builtin = { suggestions: [] };
    }
    this.config.builtin.suggestions = this.config.builtin.suggestions.concat(suggestions);
    return this.config.builtin.suggestions;
  }

  addConfigEntry(config) {
    for (const type in config) {
      const options = config[type];
      if (this.config[type] == null) {
        this.config[type] = {};
      }
      if (options.selector != null) {
        this.config[type].selectors = _selectorKit.Selector.create(options.selector);
      }
      this.config[type].typePriority = options.typePriority != null ? options.typePriority : 1;
      this.config[type].wordRegex = this.wordRegex;

      const suggestions = this.sanitizeSuggestionsFromConfig(options.suggestions, type);
      if (suggestions != null && suggestions.length) {
        this.config[type].suggestions = suggestions;
      }
    }
  }

  sanitizeSuggestionsFromConfig(suggestions, type) {
    if (suggestions != null && Array.isArray(suggestions)) {
      const sanitizedSuggestions = [];
      for (let i = 0; i < suggestions.length; i++) {
        let suggestion = suggestions[i];
        if (typeof suggestion === 'string') {
          sanitizedSuggestions.push({ text: suggestion, type });
        } else if (typeof suggestions[0] === 'object' && (suggestion.text != null || suggestion.snippet != null)) {
          suggestion = _underscorePlus2.default.clone(suggestion);
          if (suggestion.type == null) {
            suggestion.type = type;
          }
          sanitizedSuggestions.push(suggestion);
        }
      }
      return sanitizedSuggestions;
    } else {
      return null;
    }
  }

  uniqueFilter(completion) {
    return completion.text;
  }

  paneItemIsValid(paneItem) {
    // TODO: remove conditional when `isTextEditor` is shipped.
    if (typeof atom.workspace.isTextEditor === 'function') {
      return atom.workspace.isTextEditor(paneItem);
    } else {
      if (paneItem == null) {
        return false;
      }
      // Should we disqualify TextEditors with the Grammar text.plain.null-grammar?
      return paneItem.getText != null;
    }
  }

  /*
  Section: Suggesting Completions
  */

  getSuggestions(options) {
    if (!options.prefix) {
      return;
    }

    if (options.prefix.trim().length < this.minimumWordLength) {
      return;
    }

    this.buildConfigIfScopeChanged(options);
    const editor = options.editor;
    const bufferPosition = options.bufferPosition;
    const prefix = options.prefix;

    let numberOfWordsMatchingPrefix = 1;
    const wordUnderCursor = this.wordAtBufferPosition(editor, bufferPosition);
    const iterable = editor.getCursors();
    for (let i = 0; i < iterable.length; i++) {
      const cursor = iterable[i];
      if (cursor === editor.getLastCursor()) {
        continue;
      }
      const word = this.wordAtBufferPosition(editor, cursor.getBufferPosition());
      if (word === wordUnderCursor) {
        numberOfWordsMatchingPrefix += 1;
      }
    }

    const buffers = this.includeCompletionsFromAllBuffers ? null : [this.editor.getBuffer()];
    const symbolList = this.symbolStore.symbolsForConfig(this.config, buffers, prefix, wordUnderCursor, bufferPosition.row, numberOfWordsMatchingPrefix);

    symbolList.sort((a, b) => b.score * b.localityScore - a.score * a.localityScore);
    return symbolList.slice(0, 20).map(a => a.symbol);
  }

  wordAtBufferPosition(editor, bufferPosition) {
    const lineToPosition = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    let prefix = lineToPosition.match(this.endOfLineWordRegex);
    if (prefix) {
      prefix = prefix[0];
    } else {
      prefix = '';
    }

    const lineFromPosition = editor.getTextInRange([bufferPosition, [bufferPosition.row, Infinity]]);
    let suffix = lineFromPosition.match(this.beginningOfLineWordRegex);
    if (suffix) {
      suffix = suffix[0];
    } else {
      suffix = '';
    }

    return prefix + suffix;
  }

  settingsForScopeDescriptor(scopeDescriptor, keyPath) {
    return atom.config.getAll(keyPath, { scope: scopeDescriptor });
  }

  /*
  Section: Word List Building
  */

  buildWordListOnNextTick(editor) {
    return _underscorePlus2.default.defer(() => {
      if (editor && editor.isAlive() && !editor.largeFileMode) {
        const start = { row: 0, column: 0 };
        const oldExtent = { row: 0, column: 0 };
        const newExtent = editor.getBuffer().getRange().getExtent();
        return this.symbolStore.recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent);
      }
    });
  }

  // FIXME: this should go in the core ScopeDescriptor class
  scopeDescriptorsEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (a == null || b == null) {
      return false;
    }

    const arrayA = a.getScopesArray();
    const arrayB = b.getScopesArray();

    if (arrayA.length !== arrayB.length) {
      return false;
    }

    for (let i = 0; i < arrayA.length; i++) {
      const scope = arrayA[i];
      if (scope !== arrayB[i]) {
        return false;
      }
    }
    return true;
  }
};
exports.default = SymbolProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5bWJvbC1wcm92aWRlci5qcyJdLCJuYW1lcyI6WyJTeW1ib2xQcm92aWRlciIsImNvbnN0cnVjdG9yIiwiZGVmYXVsdHMiLCJzdWJzY3JpcHRpb25zIiwiYWRkIiwiYXRvbSIsImNvbmZpZyIsIm9ic2VydmUiLCJlbmFibGVFeHRlbmRlZFVuaWNvZGVTdXBwb3J0Iiwid29yZFJlZ2V4IiwiUmVnRXhwIiwiYmVnaW5uaW5nT2ZMaW5lV29yZFJlZ2V4IiwiZW5kT2ZMaW5lV29yZFJlZ2V4Iiwic3ltYm9sU3RvcmUiLCJ3YXRjaGVkQnVmZmVycyIsIldlYWtNYXAiLCJtaW5pbXVtV29yZExlbmd0aCIsImluY2x1ZGVDb21wbGV0aW9uc0Zyb21BbGxCdWZmZXJzIiwidXNlQWx0ZXJuYXRlU2NvcmluZyIsInNldFVzZUFsdGVybmF0ZVNjb3JpbmciLCJ1c2VMb2NhbGl0eUJvbnVzIiwic2V0VXNlTG9jYWxpdHlCb251cyIsInVzZVN0cmljdE1hdGNoaW5nIiwic2V0VXNlU3RyaWN0TWF0Y2hpbmciLCJ3b3Jrc3BhY2UiLCJvYnNlcnZlQWN0aXZlUGFuZUl0ZW0iLCJlIiwidXBkYXRlQ3VycmVudEVkaXRvciIsIm9ic2VydmVUZXh0RWRpdG9ycyIsIndhdGNoRWRpdG9yIiwiZWRpdG9yIiwiYnVmZmVyIiwiY2hhbmdlVXBkYXRlRGVsYXkiLCJ0ZXh0RWRpdG9yU2VsZWN0b3JzIiwiU2V0Iiwic2NvcGVTZWxlY3RvciIsImluY2x1c2lvblByaW9yaXR5Iiwic3VnZ2VzdGlvblByaW9yaXR5IiwiZGVmYXVsdENvbmZpZyIsImNsYXNzIiwic2VsZWN0b3IiLCJ0eXBlUHJpb3JpdHkiLCJmdW5jdGlvbiIsInZhcmlhYmxlIiwiZGlzcG9zZSIsImFkZFRleHRFZGl0b3JTZWxlY3RvciIsImRlbGV0ZSIsImdldFRleHRFZGl0b3JTZWxlY3RvciIsIkFycmF5IiwiZnJvbSIsImpvaW4iLCJidWZmZXJFZGl0b3JzIiwiZ2V0QnVmZmVyIiwiZWRpdG9yU3Vic2NyaXB0aW9ucyIsIm9uRGlkVG9rZW5pemUiLCJidWlsZFdvcmRMaXN0T25OZXh0VGljayIsIm9uRGlkRGVzdHJveSIsImluZGV4IiwiZ2V0V2F0Y2hlZEVkaXRvckluZGV4IiwiZWRpdG9ycyIsImdldCIsInNwbGljZSIsInB1c2giLCJidWZmZXJTdWJzY3JpcHRpb25zIiwib25EaWRTdG9wQ2hhbmdpbmciLCJjaGFuZ2VzIiwibGVuZ3RoIiwibGFyZ2VGaWxlTW9kZSIsInN0YXJ0Iiwib2xkRXh0ZW50IiwibmV3RXh0ZW50IiwicmVjb21wdXRlU3ltYm9sc0ZvckVkaXRvckluQnVmZmVyUmFuZ2UiLCJjbGVhciIsInNldCIsImlzV2F0Y2hpbmdFZGl0b3IiLCJpc1dhdGNoaW5nQnVmZmVyIiwiaW5kZXhPZiIsImN1cnJlbnRQYW5lSXRlbSIsInBhbmVJdGVtSXNWYWxpZCIsImJ1aWxkQ29uZmlnSWZTY29wZUNoYW5nZWQiLCJzY29wZURlc2NyaXB0b3IiLCJzY29wZURlc2NyaXB0b3JzRXF1YWwiLCJjb25maWdTY29wZURlc2NyaXB0b3IiLCJidWlsZENvbmZpZyIsImxlZ2FjeUNvbXBsZXRpb25zIiwic2V0dGluZ3NGb3JTY29wZURlc2NyaXB0b3IiLCJhbGxDb25maWdFbnRyaWVzIiwicmV2ZXJzZSIsImkiLCJ2YWx1ZSIsImlzQXJyYXkiLCJhZGRMZWdhY3lDb25maWdFbnRyeSIsImFkZGVkQ29uZmlnRW50cnkiLCJqIiwiYWRkQ29uZmlnRW50cnkiLCJzdWdnZXN0aW9ucyIsIm1hcCIsInN1Z2dlc3Rpb24iLCJ0ZXh0IiwidHlwZSIsImJ1aWx0aW4iLCJjb25jYXQiLCJvcHRpb25zIiwic2VsZWN0b3JzIiwiY3JlYXRlIiwic2FuaXRpemVTdWdnZXN0aW9uc0Zyb21Db25maWciLCJzYW5pdGl6ZWRTdWdnZXN0aW9ucyIsInNuaXBwZXQiLCJjbG9uZSIsInVuaXF1ZUZpbHRlciIsImNvbXBsZXRpb24iLCJwYW5lSXRlbSIsImlzVGV4dEVkaXRvciIsImdldFRleHQiLCJnZXRTdWdnZXN0aW9ucyIsInByZWZpeCIsInRyaW0iLCJidWZmZXJQb3NpdGlvbiIsIm51bWJlck9mV29yZHNNYXRjaGluZ1ByZWZpeCIsIndvcmRVbmRlckN1cnNvciIsIndvcmRBdEJ1ZmZlclBvc2l0aW9uIiwiaXRlcmFibGUiLCJnZXRDdXJzb3JzIiwiY3Vyc29yIiwiZ2V0TGFzdEN1cnNvciIsIndvcmQiLCJnZXRCdWZmZXJQb3NpdGlvbiIsImJ1ZmZlcnMiLCJzeW1ib2xMaXN0Iiwic3ltYm9sc0ZvckNvbmZpZyIsInJvdyIsInNvcnQiLCJhIiwiYiIsInNjb3JlIiwibG9jYWxpdHlTY29yZSIsInNsaWNlIiwic3ltYm9sIiwibGluZVRvUG9zaXRpb24iLCJnZXRUZXh0SW5SYW5nZSIsIm1hdGNoIiwibGluZUZyb21Qb3NpdGlvbiIsIkluZmluaXR5Iiwic3VmZml4Iiwia2V5UGF0aCIsImdldEFsbCIsInNjb3BlIiwiZGVmZXIiLCJpc0FsaXZlIiwiY29sdW1uIiwiZ2V0UmFuZ2UiLCJnZXRFeHRlbnQiLCJhcnJheUEiLCJnZXRTY29wZXNBcnJheSIsImFycmF5QiJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFFQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7SUFFcUJBLGMsR0FBTixNQUFNQSxjQUFOLENBQXFCO0FBQ2xDQyxnQkFBZTtBQUNiLFNBQUtDLFFBQUw7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLCtCQUFyQjtBQUNBLFNBQUtBLGFBQUwsQ0FBbUJDLEdBQW5CLENBQXVCQyxLQUFLQyxNQUFMLENBQVlDLE9BQVosQ0FBb0IsZ0RBQXBCLEVBQXNFQyxnQ0FBZ0M7QUFDM0gsVUFBSUEsNEJBQUosRUFBa0M7QUFDaEMsYUFBS0MsU0FBTCxHQUFpQixJQUFJQyxNQUFKLENBQVksSUFBRCw4QkFBbUIsVUFBbkIsOEJBQTJDLFNBQTNDLDhCQUFrRSxlQUFsRSw4QkFBK0YsVUFBMUcsRUFBcUgsR0FBckgsQ0FBakI7QUFDQSxhQUFLQyx3QkFBTCxHQUFnQyxJQUFJRCxNQUFKLENBQVksS0FBRCw4QkFBb0IsVUFBcEIs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QixFQUEwQkMsQ0FBMUIsRUFBNkI7QUFDM0IsUUFBSUQsTUFBTUMsQ0FBVixFQUFhO0FBQUUsYUFBTyxJQUFQO0FBQWE7QUFDNUIsUUFBS0QsS0FBSyxJQUFOLElBQWdCQyxLQUFLLElBQXpCLEVBQWdDO0FBQUUsYUFBTyxLQUFQO0FBQWM7O0FBRWhELFVBQU1tQixTQUFTcEIsRUFBRXFCLGNBQUYsRUFBZjtBQUNBLFVBQU1DLFNBQVNyQixFQUFFb0IsY0FBRixFQUFmOztBQUVBLFFBQUlELE9BQU90RixNQUFQLEtBQWtCd0YsT0FBT3hGLE1BQTdCLEVBQXFDO0FBQUUsYUFBTyxLQUFQO0FBQWM7O0FBRXJELFNBQUssSUFBSXNCLElBQUksQ0FBYixFQUFnQkEsSUFBSWdFLE9BQU90RixNQUEzQixFQUFtQ3NCLEdBQW5DLEVBQXdDO0FBQ3RDLFlBQU0wRCxRQUFRTSxPQUFPaEUsQ0FBUCxDQUFkO0FBQ0EsVUFBSTBELFVBQVVRLE9BQU9sRSxDQUFQLENBQWQsRUFBeUI7QUFBRSxlQUFPLEtBQVA7QUFBYztBQUMxQztBQUNELFdBQU8sSUFBUDtBQUNEO0FBdlZpQyxDO2tCQUFmeEYsYyIsImZpbGUiOiJzeW1ib2wtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IFNlbGVjdG9yIH0gZnJvbSAnc2VsZWN0b3Ita2l0J1xuaW1wb3J0IHsgVW5pY29kZUxldHRlcnMgfSBmcm9tICcuL3VuaWNvZGUtaGVscGVycydcbmltcG9ydCBTeW1ib2xTdG9yZSBmcm9tICcuL3N5bWJvbC1zdG9yZSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ltYm9sUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5kZWZhdWx0cygpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCcsIGVuYWJsZUV4dGVuZGVkVW5pY29kZVN1cHBvcnQgPT4ge1xuICAgICAgaWYgKGVuYWJsZUV4dGVuZGVkVW5pY29kZVN1cHBvcnQpIHtcbiAgICAgICAgdGhpcy53b3JkUmVnZXggPSBuZXcgUmVnRXhwKGBbJHtVbmljb2RlTGV0dGVyc31cXFxcZF9dKlske1VuaWNvZGVMZXR0ZXJzfX1fLV0rWyR7VW5pY29kZUxldHRlcnN9fVxcXFxkX10qKD89W14ke1VuaWNvZGVMZXR0ZXJzfVxcXFxkX118JClgLCAnZycpXG4gICAgICAgIHRoaXMuYmVnaW5uaW5nT2ZMaW5lV29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChgXlske1VuaWNvZGVMZXR0ZXJzfVxcXFxkX10qWyR7VW5pY29kZUxldHRlcnN9Xy1dK1ske1VuaWNvZGVMZXR0ZXJzfVxcXFxkX10qKD89W14ke1VuaWNvZGVMZXR0ZXJzfVxcXFxkX118JClgLCAnZycpXG4gICAgICAgIHRoaXMuZW5kT2ZMaW5lV29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChgWyR7VW5pY29kZUxldHRlcnN9XFxcXGRfXSpbJHtVbmljb2RlTGV0dGVyc31fLV0rWyR7VW5pY29kZUxldHRlcnN9XFxcXGRfXSokYCwgJ2cnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53b3JkUmVnZXggPSAvXFxiXFx3KlthLXpBLVpfLV0rXFx3KlxcYi9nXG4gICAgICAgIHRoaXMuYmVnaW5uaW5nT2ZMaW5lV29yZFJlZ2V4ID0gL15cXHcqW2EtekEtWl8tXStcXHcqXFxiL2dcbiAgICAgICAgdGhpcy5lbmRPZkxpbmVXb3JkUmVnZXggPSAvXFxiXFx3KlthLXpBLVpfLV0rXFx3KiQvZ1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN5bWJvbFN0b3JlID0gbmV3IFN5bWJvbFN0b3JlKHRoaXMud29yZFJlZ2V4KVxuICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sU3RvcmVcbiAgICB9KSlcbiAgICB0aGlzLndhdGNoZWRCdWZmZXJzID0gbmV3IFdlYWtNYXAoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy5taW5pbXVtV29yZExlbmd0aCcsIChtaW5pbXVtV29yZExlbmd0aCkgPT4ge1xuICAgICAgdGhpcy5taW5pbXVtV29yZExlbmd0aCA9IG1pbmltdW1Xb3JkTGVuZ3RoXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy5pbmNsdWRlQ29tcGxldGlvbnNGcm9tQWxsQnVmZmVycycsIChpbmNsdWRlQ29tcGxldGlvbnNGcm9tQWxsQnVmZmVycykgPT4ge1xuICAgICAgdGhpcy5pbmNsdWRlQ29tcGxldGlvbnNGcm9tQWxsQnVmZmVycyA9IGluY2x1ZGVDb21wbGV0aW9uc0Zyb21BbGxCdWZmZXJzXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy51c2VBbHRlcm5hdGVTY29yaW5nJywgKHVzZUFsdGVybmF0ZVNjb3JpbmcpID0+IHtcbiAgICAgIHRoaXMuc3ltYm9sU3RvcmUuc2V0VXNlQWx0ZXJuYXRlU2NvcmluZyh1c2VBbHRlcm5hdGVTY29yaW5nKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMudXNlTG9jYWxpdHlCb251cycsICh1c2VMb2NhbGl0eUJvbnVzKSA9PiB7XG4gICAgICB0aGlzLnN5bWJvbFN0b3JlLnNldFVzZUxvY2FsaXR5Qm9udXModXNlTG9jYWxpdHlCb251cylcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLnN0cmljdE1hdGNoaW5nJywgKHVzZVN0cmljdE1hdGNoaW5nKSA9PiB7XG4gICAgICB0aGlzLnN5bWJvbFN0b3JlLnNldFVzZVN0cmljdE1hdGNoaW5nKHVzZVN0cmljdE1hdGNoaW5nKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKChlKSA9PiB7IHRoaXMudXBkYXRlQ3VycmVudEVkaXRvcihlKSB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZSkgPT4geyB0aGlzLndhdGNoRWRpdG9yKGUpIH0pKVxuICB9XG5cbiAgZGVmYXVsdHMgKCkge1xuICAgIHRoaXMud29yZFJlZ2V4ID0gbnVsbFxuICAgIHRoaXMuYmVnaW5uaW5nT2ZMaW5lV29yZFJlZ2V4ID0gbnVsbFxuICAgIHRoaXMuZW5kT2ZMaW5lV29yZFJlZ2V4ID0gbnVsbFxuICAgIHRoaXMuc3ltYm9sU3RvcmUgPSBudWxsXG4gICAgdGhpcy5lZGl0b3IgPSBudWxsXG4gICAgdGhpcy5idWZmZXIgPSBudWxsXG4gICAgdGhpcy5jaGFuZ2VVcGRhdGVEZWxheSA9IDMwMFxuXG4gICAgdGhpcy50ZXh0RWRpdG9yU2VsZWN0b3JzID0gbmV3IFNldChbJ2F0b20tcGFuZSA+IC5pdGVtLXZpZXdzID4gYXRvbS10ZXh0LWVkaXRvciddKVxuICAgIHRoaXMuc2NvcGVTZWxlY3RvciA9ICcqJ1xuICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSAwXG4gICAgdGhpcy5zdWdnZXN0aW9uUHJpb3JpdHkgPSAwXG5cbiAgICB0aGlzLndhdGNoZWRCdWZmZXJzID0gbnVsbFxuXG4gICAgdGhpcy5jb25maWcgPSBudWxsXG4gICAgdGhpcy5kZWZhdWx0Q29uZmlnID0ge1xuICAgICAgY2xhc3M6IHtcbiAgICAgICAgc2VsZWN0b3I6ICcuY2xhc3MubmFtZSwgLmluaGVyaXRlZC1jbGFzcywgLmluc3RhbmNlLnR5cGUnLFxuICAgICAgICB0eXBlUHJpb3JpdHk6IDRcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbjoge1xuICAgICAgICBzZWxlY3RvcjogJy5mdW5jdGlvbi5uYW1lJyxcbiAgICAgICAgdHlwZVByaW9yaXR5OiAzXG4gICAgICB9LFxuICAgICAgdmFyaWFibGU6IHtcbiAgICAgICAgc2VsZWN0b3I6ICcudmFyaWFibGUnLFxuICAgICAgICB0eXBlUHJpb3JpdHk6IDJcbiAgICAgIH0sXG4gICAgICAnJzoge1xuICAgICAgICBzZWxlY3RvcjogJy5zb3VyY2UnLFxuICAgICAgICB0eXBlUHJpb3JpdHk6IDFcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkaXNwb3NlICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG5cbiAgYWRkVGV4dEVkaXRvclNlbGVjdG9yIChzZWxlY3Rvcikge1xuICAgIHRoaXMudGV4dEVkaXRvclNlbGVjdG9ycy5hZGQoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMudGV4dEVkaXRvclNlbGVjdG9ycy5kZWxldGUoc2VsZWN0b3IpKVxuICB9XG5cbiAgZ2V0VGV4dEVkaXRvclNlbGVjdG9yICgpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnRleHRFZGl0b3JTZWxlY3RvcnMpLmpvaW4oJywgJylcbiAgfVxuXG4gIHdhdGNoRWRpdG9yIChlZGl0b3IpIHtcbiAgICBsZXQgYnVmZmVyRWRpdG9yc1xuICAgIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkVG9rZW5pemUoKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYnVpbGRXb3JkTGlzdE9uTmV4dFRpY2soZWRpdG9yKVxuICAgIH0pKVxuICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldFdhdGNoZWRFZGl0b3JJbmRleChlZGl0b3IpXG4gICAgICBjb25zdCBlZGl0b3JzID0gdGhpcy53YXRjaGVkQnVmZmVycy5nZXQoZWRpdG9yLmdldEJ1ZmZlcigpKVxuICAgICAgaWYgKGluZGV4ID4gLTEpIHsgZWRpdG9ycy5zcGxpY2UoaW5kZXgsIDEpIH1cbiAgICAgIHJldHVybiBlZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH0pKVxuXG4gICAgYnVmZmVyRWRpdG9ycyA9IHRoaXMud2F0Y2hlZEJ1ZmZlcnMuZ2V0KGJ1ZmZlcilcbiAgICBpZiAoYnVmZmVyRWRpdG9ycykge1xuICAgICAgYnVmZmVyRWRpdG9ycy5wdXNoKGVkaXRvcilcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYnVmZmVyU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuYWRkKGJ1ZmZlci5vbkRpZFN0b3BDaGFuZ2luZygoe2NoYW5nZXN9KSA9PiB7XG4gICAgICAgIGxldCBlZGl0b3JzID0gdGhpcy53YXRjaGVkQnVmZmVycy5nZXQoYnVmZmVyKVxuICAgICAgICBpZiAoIWVkaXRvcnMpIHtcbiAgICAgICAgICBlZGl0b3JzID0gW11cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRpdG9ycyAmJiBlZGl0b3JzLmxlbmd0aCA+IDAgJiYgZWRpdG9yc1swXSAmJiAhZWRpdG9yc1swXS5sYXJnZUZpbGVNb2RlKSB7XG4gICAgICAgICAgZm9yIChjb25zdCB7c3RhcnQsIG9sZEV4dGVudCwgbmV3RXh0ZW50fSBvZiBjaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLnN5bWJvbFN0b3JlLnJlY29tcHV0ZVN5bWJvbHNGb3JFZGl0b3JJbkJ1ZmZlclJhbmdlKGVkaXRvcnNbMF0sIHN0YXJ0LCBvbGRFeHRlbnQsIG5ld0V4dGVudClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKVxuICAgICAgYnVmZmVyU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc3ltYm9sU3RvcmUuY2xlYXIoYnVmZmVyKVxuICAgICAgICBidWZmZXJTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgICByZXR1cm4gdGhpcy53YXRjaGVkQnVmZmVycy5kZWxldGUoYnVmZmVyKVxuICAgICAgfSkpXG5cbiAgICAgIHRoaXMud2F0Y2hlZEJ1ZmZlcnMuc2V0KGJ1ZmZlciwgW2VkaXRvcl0pXG4gICAgICB0aGlzLmJ1aWxkV29yZExpc3RPbk5leHRUaWNrKGVkaXRvcilcbiAgICB9XG4gIH1cblxuICBpc1dhdGNoaW5nRWRpdG9yIChlZGl0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXYXRjaGVkRWRpdG9ySW5kZXgoZWRpdG9yKSA+IC0xXG4gIH1cblxuICBpc1dhdGNoaW5nQnVmZmVyIChidWZmZXIpIHtcbiAgICByZXR1cm4gKHRoaXMud2F0Y2hlZEJ1ZmZlcnMuZ2V0KGJ1ZmZlcikgIT0gbnVsbClcbiAgfVxuXG4gIGdldFdhdGNoZWRFZGl0b3JJbmRleCAoZWRpdG9yKSB7XG4gICAgY29uc3QgZWRpdG9ycyA9IHRoaXMud2F0Y2hlZEJ1ZmZlcnMuZ2V0KGVkaXRvci5nZXRCdWZmZXIoKSlcbiAgICBpZiAoZWRpdG9ycykge1xuICAgICAgcmV0dXJuIGVkaXRvcnMuaW5kZXhPZihlZGl0b3IpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUN1cnJlbnRFZGl0b3IgKGN1cnJlbnRQYW5lSXRlbSkge1xuICAgIGlmIChjdXJyZW50UGFuZUl0ZW0gPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIGlmIChjdXJyZW50UGFuZUl0ZW0gPT09IHRoaXMuZWRpdG9yKSB7IHJldHVybiB9XG4gICAgdGhpcy5lZGl0b3IgPSBudWxsXG4gICAgaWYgKHRoaXMucGFuZUl0ZW1Jc1ZhbGlkKGN1cnJlbnRQYW5lSXRlbSkpIHtcbiAgICAgIHRoaXMuZWRpdG9yID0gY3VycmVudFBhbmVJdGVtXG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3JcbiAgICB9XG4gIH1cblxuICBidWlsZENvbmZpZ0lmU2NvcGVDaGFuZ2VkICh7ZWRpdG9yLCBzY29wZURlc2NyaXB0b3J9KSB7XG4gICAgaWYgKCF0aGlzLnNjb3BlRGVzY3JpcHRvcnNFcXVhbCh0aGlzLmNvbmZpZ1Njb3BlRGVzY3JpcHRvciwgc2NvcGVEZXNjcmlwdG9yKSkge1xuICAgICAgdGhpcy5idWlsZENvbmZpZyhzY29wZURlc2NyaXB0b3IpXG4gICAgICB0aGlzLmNvbmZpZ1Njb3BlRGVzY3JpcHRvciA9IHNjb3BlRGVzY3JpcHRvclxuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnU2NvcGVEZXNjcmlwdG9yXG4gICAgfVxuICB9XG5cbiAgYnVpbGRDb25maWcgKHNjb3BlRGVzY3JpcHRvcikge1xuICAgIHRoaXMuY29uZmlnID0ge31cbiAgICBjb25zdCBsZWdhY3lDb21wbGV0aW9ucyA9IHRoaXMuc2V0dGluZ3NGb3JTY29wZURlc2NyaXB0b3Ioc2NvcGVEZXNjcmlwdG9yLCAnZWRpdG9yLmNvbXBsZXRpb25zJylcbiAgICBjb25zdCBhbGxDb25maWdFbnRyaWVzID0gdGhpcy5zZXR0aW5nc0ZvclNjb3BlRGVzY3JpcHRvcihzY29wZURlc2NyaXB0b3IsICdhdXRvY29tcGxldGUuc3ltYm9scycpXG5cbiAgICAvLyBDb25maWcgZW50cmllcyBhcmUgcmV2ZXJzZSBzb3J0ZWQgaW4gb3JkZXIgb2Ygc3BlY2lmaWNpdHkuIFdlIHdhbnQgbW9zdFxuICAgIC8vIHNwZWNpZmljIHRvIHdpbjsgdGhpcyBzaW1wbGlmaWVzIHRoZSBsb29wLlxuICAgIGFsbENvbmZpZ0VudHJpZXMucmV2ZXJzZSgpXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlZ2FjeUNvbXBsZXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB7IHZhbHVlIH0gPSBsZWdhY3lDb21wbGV0aW9uc1tpXVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmFkZExlZ2FjeUNvbmZpZ0VudHJ5KHZhbHVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBhZGRlZENvbmZpZ0VudHJ5ID0gZmFsc2VcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGFsbENvbmZpZ0VudHJpZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IGFsbENvbmZpZ0VudHJpZXNbal1cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLmFkZENvbmZpZ0VudHJ5KHZhbHVlKVxuICAgICAgICBhZGRlZENvbmZpZ0VudHJ5ID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghYWRkZWRDb25maWdFbnRyeSkgeyByZXR1cm4gdGhpcy5hZGRDb25maWdFbnRyeSh0aGlzLmRlZmF1bHRDb25maWcpIH1cbiAgfVxuXG4gIGFkZExlZ2FjeUNvbmZpZ0VudHJ5IChzdWdnZXN0aW9ucykge1xuICAgIHN1Z2dlc3Rpb25zID0gKHN1Z2dlc3Rpb25zLm1hcCgoc3VnZ2VzdGlvbikgPT4gKHt0ZXh0OiBzdWdnZXN0aW9uLCB0eXBlOiAnYnVpbHRpbid9KSkpXG4gICAgaWYgKHRoaXMuY29uZmlnLmJ1aWx0aW4gPT0gbnVsbCkge1xuICAgICAgdGhpcy5jb25maWcuYnVpbHRpbiA9IHtzdWdnZXN0aW9uczogW119XG4gICAgfVxuICAgIHRoaXMuY29uZmlnLmJ1aWx0aW4uc3VnZ2VzdGlvbnMgPSB0aGlzLmNvbmZpZy5idWlsdGluLnN1Z2dlc3Rpb25zLmNvbmNhdChzdWdnZXN0aW9ucylcbiAgICByZXR1cm4gdGhpcy5jb25maWcuYnVpbHRpbi5zdWdnZXN0aW9uc1xuICB9XG5cbiAgYWRkQ29uZmlnRW50cnkgKGNvbmZpZykge1xuICAgIGZvciAoY29uc3QgdHlwZSBpbiBjb25maWcpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb25maWdbdHlwZV1cbiAgICAgIGlmICh0aGlzLmNvbmZpZ1t0eXBlXSA9PSBudWxsKSB7IHRoaXMuY29uZmlnW3R5cGVdID0ge30gfVxuICAgICAgaWYgKG9wdGlvbnMuc2VsZWN0b3IgIT0gbnVsbCkgeyB0aGlzLmNvbmZpZ1t0eXBlXS5zZWxlY3RvcnMgPSBTZWxlY3Rvci5jcmVhdGUob3B0aW9ucy5zZWxlY3RvcikgfVxuICAgICAgdGhpcy5jb25maWdbdHlwZV0udHlwZVByaW9yaXR5ID0gb3B0aW9ucy50eXBlUHJpb3JpdHkgIT0gbnVsbCA/IG9wdGlvbnMudHlwZVByaW9yaXR5IDogMVxuICAgICAgdGhpcy5jb25maWdbdHlwZV0ud29yZFJlZ2V4ID0gdGhpcy53b3JkUmVnZXhcblxuICAgICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSB0aGlzLnNhbml0aXplU3VnZ2VzdGlvbnNGcm9tQ29uZmlnKG9wdGlvbnMuc3VnZ2VzdGlvbnMsIHR5cGUpXG4gICAgICBpZiAoKHN1Z2dlc3Rpb25zICE9IG51bGwpICYmIHN1Z2dlc3Rpb25zLmxlbmd0aCkgeyB0aGlzLmNvbmZpZ1t0eXBlXS5zdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zIH1cbiAgICB9XG4gIH1cblxuICBzYW5pdGl6ZVN1Z2dlc3Rpb25zRnJvbUNvbmZpZyAoc3VnZ2VzdGlvbnMsIHR5cGUpIHtcbiAgICBpZiAoKHN1Z2dlc3Rpb25zICE9IG51bGwpICYmIEFycmF5LmlzQXJyYXkoc3VnZ2VzdGlvbnMpKSB7XG4gICAgICBjb25zdCBzYW5pdGl6ZWRTdWdnZXN0aW9ucyA9IFtdXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1Z2dlc3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBzdWdnZXN0aW9uID0gc3VnZ2VzdGlvbnNbaV1cbiAgICAgICAgaWYgKHR5cGVvZiBzdWdnZXN0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHNhbml0aXplZFN1Z2dlc3Rpb25zLnB1c2goe3RleHQ6IHN1Z2dlc3Rpb24sIHR5cGV9KVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ29iamVjdCcgJiYgKChzdWdnZXN0aW9uLnRleHQgIT0gbnVsbCkgfHwgKHN1Z2dlc3Rpb24uc25pcHBldCAhPSBudWxsKSkpIHtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gXy5jbG9uZShzdWdnZXN0aW9uKVxuICAgICAgICAgIGlmIChzdWdnZXN0aW9uLnR5cGUgPT0gbnVsbCkgeyBzdWdnZXN0aW9uLnR5cGUgPSB0eXBlIH1cbiAgICAgICAgICBzYW5pdGl6ZWRTdWdnZXN0aW9ucy5wdXNoKHN1Z2dlc3Rpb24pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzYW5pdGl6ZWRTdWdnZXN0aW9uc1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIHVuaXF1ZUZpbHRlciAoY29tcGxldGlvbikgeyByZXR1cm4gY29tcGxldGlvbi50ZXh0IH1cblxuICBwYW5lSXRlbUlzVmFsaWQgKHBhbmVJdGVtKSB7XG4gICAgLy8gVE9ETzogcmVtb3ZlIGNvbmRpdGlvbmFsIHdoZW4gYGlzVGV4dEVkaXRvcmAgaXMgc2hpcHBlZC5cbiAgICBpZiAodHlwZW9mIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihwYW5lSXRlbSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBhbmVJdGVtID09IG51bGwpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgIC8vIFNob3VsZCB3ZSBkaXNxdWFsaWZ5IFRleHRFZGl0b3JzIHdpdGggdGhlIEdyYW1tYXIgdGV4dC5wbGFpbi5udWxsLWdyYW1tYXI/XG4gICAgICByZXR1cm4gKHBhbmVJdGVtLmdldFRleHQgIT0gbnVsbClcbiAgICB9XG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBTdWdnZXN0aW5nIENvbXBsZXRpb25zXG4gICovXG5cbiAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMucHJlZml4KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5wcmVmaXgudHJpbSgpLmxlbmd0aCA8IHRoaXMubWluaW11bVdvcmRMZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuYnVpbGRDb25maWdJZlNjb3BlQ2hhbmdlZChvcHRpb25zKVxuICAgIGNvbnN0IGVkaXRvciA9IG9wdGlvbnMuZWRpdG9yXG4gICAgY29uc3QgYnVmZmVyUG9zaXRpb24gPSBvcHRpb25zLmJ1ZmZlclBvc2l0aW9uXG4gICAgY29uc3QgcHJlZml4ID0gb3B0aW9ucy5wcmVmaXhcblxuICAgIGxldCBudW1iZXJPZldvcmRzTWF0Y2hpbmdQcmVmaXggPSAxXG4gICAgY29uc3Qgd29yZFVuZGVyQ3Vyc29yID0gdGhpcy53b3JkQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgIGNvbnN0IGl0ZXJhYmxlID0gZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGN1cnNvciA9IGl0ZXJhYmxlW2ldXG4gICAgICBpZiAoY3Vyc29yID09PSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpKSB7IGNvbnRpbnVlIH1cbiAgICAgIGNvbnN0IHdvcmQgPSB0aGlzLndvcmRBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBpZiAod29yZCA9PT0gd29yZFVuZGVyQ3Vyc29yKSB7IG51bWJlck9mV29yZHNNYXRjaGluZ1ByZWZpeCArPSAxIH1cbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXJzID0gdGhpcy5pbmNsdWRlQ29tcGxldGlvbnNGcm9tQWxsQnVmZmVycyA/IG51bGwgOiBbdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCldXG4gICAgY29uc3Qgc3ltYm9sTGlzdCA9IHRoaXMuc3ltYm9sU3RvcmUuc3ltYm9sc0ZvckNvbmZpZyhcbiAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgYnVmZmVycyxcbiAgICAgIHByZWZpeCxcbiAgICAgIHdvcmRVbmRlckN1cnNvcixcbiAgICAgIGJ1ZmZlclBvc2l0aW9uLnJvdyxcbiAgICAgIG51bWJlck9mV29yZHNNYXRjaGluZ1ByZWZpeFxuICAgIClcblxuICAgIHN5bWJvbExpc3Quc29ydCgoYSwgYikgPT4gKGIuc2NvcmUgKiBiLmxvY2FsaXR5U2NvcmUpIC0gKGEuc2NvcmUgKiBhLmxvY2FsaXR5U2NvcmUpKVxuICAgIHJldHVybiBzeW1ib2xMaXN0LnNsaWNlKDAsIDIwKS5tYXAoYSA9PiBhLnN5bWJvbClcbiAgfVxuXG4gIHdvcmRBdEJ1ZmZlclBvc2l0aW9uIChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSB7XG4gICAgY29uc3QgbGluZVRvUG9zaXRpb24gPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgbGV0IHByZWZpeCA9IGxpbmVUb1Bvc2l0aW9uLm1hdGNoKHRoaXMuZW5kT2ZMaW5lV29yZFJlZ2V4KVxuICAgIGlmIChwcmVmaXgpIHtcbiAgICAgIHByZWZpeCA9IHByZWZpeFswXVxuICAgIH0gZWxzZSB7XG4gICAgICBwcmVmaXggPSAnJ1xuICAgIH1cblxuICAgIGNvbnN0IGxpbmVGcm9tUG9zaXRpb24gPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW2J1ZmZlclBvc2l0aW9uLCBbYnVmZmVyUG9zaXRpb24ucm93LCBJbmZpbml0eV1dKVxuICAgIGxldCBzdWZmaXggPSBsaW5lRnJvbVBvc2l0aW9uLm1hdGNoKHRoaXMuYmVnaW5uaW5nT2ZMaW5lV29yZFJlZ2V4KVxuICAgIGlmIChzdWZmaXgpIHtcbiAgICAgIHN1ZmZpeCA9IHN1ZmZpeFswXVxuICAgIH0gZWxzZSB7XG4gICAgICBzdWZmaXggPSAnJ1xuICAgIH1cblxuICAgIHJldHVybiBwcmVmaXggKyBzdWZmaXhcbiAgfVxuXG4gIHNldHRpbmdzRm9yU2NvcGVEZXNjcmlwdG9yIChzY29wZURlc2NyaXB0b3IsIGtleVBhdGgpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0QWxsKGtleVBhdGgsIHtzY29wZTogc2NvcGVEZXNjcmlwdG9yfSlcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFdvcmQgTGlzdCBCdWlsZGluZ1xuICAqL1xuXG4gIGJ1aWxkV29yZExpc3RPbk5leHRUaWNrIChlZGl0b3IpIHtcbiAgICByZXR1cm4gXy5kZWZlcigoKSA9PiB7XG4gICAgICBpZiAoZWRpdG9yICYmIGVkaXRvci5pc0FsaXZlKCkgJiYgIWVkaXRvci5sYXJnZUZpbGVNb2RlKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0ge3JvdzogMCwgY29sdW1uOiAwfVxuICAgICAgICBjb25zdCBvbGRFeHRlbnQgPSB7cm93OiAwLCBjb2x1bW46IDB9XG4gICAgICAgIGNvbnN0IG5ld0V4dGVudCA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRSYW5nZSgpLmdldEV4dGVudCgpXG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbFN0b3JlLnJlY29tcHV0ZVN5bWJvbHNGb3JFZGl0b3JJbkJ1ZmZlclJhbmdlKGVkaXRvciwgc3RhcnQsIG9sZEV4dGVudCwgbmV3RXh0ZW50KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvLyBGSVhNRTogdGhpcyBzaG91bGQgZ28gaW4gdGhlIGNvcmUgU2NvcGVEZXNjcmlwdG9yIGNsYXNzXG4gIHNjb3BlRGVzY3JpcHRvcnNFcXVhbCAoYSwgYikge1xuICAgIGlmIChhID09PSBiKSB7IHJldHVybiB0cnVlIH1cbiAgICBpZiAoKGEgPT0gbnVsbCkgfHwgKGIgPT0gbnVsbCkpIHsgcmV0dXJuIGZhbHNlIH1cblxuICAgIGNvbnN0IGFycmF5QSA9IGEuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIGNvbnN0IGFycmF5QiA9IGIuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgaWYgKGFycmF5QS5sZW5ndGggIT09IGFycmF5Qi5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlBLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBzY29wZSA9IGFycmF5QVtpXVxuICAgICAgaWYgKHNjb3BlICE9PSBhcnJheUJbaV0pIHsgcmV0dXJuIGZhbHNlIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuIl19