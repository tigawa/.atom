(function() {
  var CompositeDisposable, Range, Selector, SymbolProvider, SymbolStore, TextBuffer, UnicodeLetters, bufferSupportsStopChanging, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('atom'), TextBuffer = _ref.TextBuffer, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable;

  Selector = require('selector-kit').Selector;

  UnicodeLetters = require('./unicode-helpers').UnicodeLetters;

  SymbolStore = require('./symbol-store');

  bufferSupportsStopChanging = function() {
    return typeof TextBuffer.prototype.onDidChangeText === "function";
  };

  module.exports = SymbolProvider = (function() {
    SymbolProvider.prototype.wordRegex = null;

    SymbolProvider.prototype.beginningOfLineWordRegex = null;

    SymbolProvider.prototype.endOfLineWordRegex = null;

    SymbolProvider.prototype.symbolStore = null;

    SymbolProvider.prototype.editor = null;

    SymbolProvider.prototype.buffer = null;

    SymbolProvider.prototype.changeUpdateDelay = 300;

    SymbolProvider.prototype.selector = '*';

    SymbolProvider.prototype.inclusionPriority = 0;

    SymbolProvider.prototype.suggestionPriority = 0;

    SymbolProvider.prototype.watchedBuffers = null;

    SymbolProvider.prototype.config = null;

    SymbolProvider.prototype.defaultConfig = {
      "class": {
        selector: '.class.name, .inherited-class, .instance.type',
        typePriority: 4
      },
      "function": {
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

    function SymbolProvider() {
      this.buildWordListOnNextTick = __bind(this.buildWordListOnNextTick, this);
      this.getSuggestions = __bind(this.getSuggestions, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.watchEditor = __bind(this.watchEditor, this);
      this.dispose = __bind(this.dispose, this);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', (function(_this) {
        return function(enableExtendedUnicodeSupport) {
          if (enableExtendedUnicodeSupport) {
            _this.wordRegex = new RegExp("[" + UnicodeLetters + "\\d_]*[" + UnicodeLetters + "}_-]+[" + UnicodeLetters + "}\\d_]*(?=[^" + UnicodeLetters + "\\d_]|$)", 'g');
            _this.beginningOfLineWordRegex = new RegExp("^[" + UnicodeLetters + "\\d_]*[" + UnicodeLetters + "_-]+[" + UnicodeLetters + "\\d_]*(?=[^" + UnicodeLetters + "\\d_]|$)", 'g');
            _this.endOfLineWordRegex = new RegExp("[" + UnicodeLetters + "\\d_]*[" + UnicodeLetters + "_-]+[" + UnicodeLetters + "\\d_]*$", 'g');
          } else {
            _this.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;
            _this.beginningOfLineWordRegex = /^\w*[a-zA-Z_-]+\w*\b/g;
            _this.endOfLineWordRegex = /\b\w*[a-zA-Z_-]+\w*$/g;
          }
          return _this.symbolStore = new SymbolStore(_this.wordRegex);
        };
      })(this)));
      this.watchedBuffers = new WeakMap;
      this.subscriptions.add(atom.config.observe('autocomplete-plus.minimumWordLength', (function(_this) {
        return function(minimumWordLength) {
          _this.minimumWordLength = minimumWordLength;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.includeCompletionsFromAllBuffers', (function(_this) {
        return function(includeCompletionsFromAllBuffers) {
          _this.includeCompletionsFromAllBuffers = includeCompletionsFromAllBuffers;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.useAlternateScoring', (function(_this) {
        return function(useAlternateScoring) {
          return _this.symbolStore.setUseAlternateScoring(useAlternateScoring);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.useLocalityBonus', (function(_this) {
        return function(useLocalityBonus) {
          return _this.symbolStore.setUseLocalityBonus(useLocalityBonus);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.strictMatching', (function(_this) {
        return function(useStrictMatching) {
          return _this.symbolStore.setUseStrictMatching(useStrictMatching);
        };
      })(this)));
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
      this.subscriptions.add(atom.workspace.observeTextEditors(this.watchEditor));
    }

    SymbolProvider.prototype.dispose = function() {
      return this.subscriptions.dispose();
    };

    SymbolProvider.prototype.watchEditor = function(editor) {
      var buffer, bufferEditors, bufferSubscriptions, editorSubscriptions;
      buffer = editor.getBuffer();
      editorSubscriptions = new CompositeDisposable;
      editorSubscriptions.add(editor.displayBuffer.onDidTokenize((function(_this) {
        return function() {
          return _this.buildWordListOnNextTick(editor);
        };
      })(this)));
      editorSubscriptions.add(editor.onDidDestroy((function(_this) {
        return function() {
          var editors, index;
          index = _this.getWatchedEditorIndex(editor);
          editors = _this.watchedBuffers.get(editor.getBuffer());
          if (index > -1) {
            editors.splice(index, 1);
          }
          return editorSubscriptions.dispose();
        };
      })(this)));
      if (bufferEditors = this.watchedBuffers.get(buffer)) {
        return bufferEditors.push(editor);
      } else {
        bufferSubscriptions = new CompositeDisposable;
        if (bufferSupportsStopChanging()) {
          bufferSubscriptions.add(buffer.onDidStopChanging((function(_this) {
            return function(_arg) {
              var changes, editors, newExtent, oldExtent, start, _i, _len, _ref1, _results;
              changes = _arg.changes;
              editors = _this.watchedBuffers.get(buffer);
              if (editors && editors.length && (editor = editors[0])) {
                _results = [];
                for (_i = 0, _len = changes.length; _i < _len; _i++) {
                  _ref1 = changes[_i], start = _ref1.start, oldExtent = _ref1.oldExtent, newExtent = _ref1.newExtent;
                  _results.push(_this.symbolStore.recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent));
                }
                return _results;
              }
            };
          })(this)));
        } else {
          bufferSubscriptions.add(buffer.onDidChange((function(_this) {
            return function(_arg) {
              var editors, newExtent, newRange, oldExtent, oldRange, start;
              oldRange = _arg.oldRange, newRange = _arg.newRange;
              editors = _this.watchedBuffers.get(buffer);
              if (editors && editors.length && (editor = editors[0])) {
                start = oldRange.start;
                oldExtent = oldRange.getExtent();
                newExtent = newRange.getExtent();
                return _this.symbolStore.recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent);
              }
            };
          })(this)));
        }
        bufferSubscriptions.add(buffer.onDidDestroy((function(_this) {
          return function() {
            _this.symbolStore.clear(buffer);
            bufferSubscriptions.dispose();
            return _this.watchedBuffers["delete"](buffer);
          };
        })(this)));
        this.watchedBuffers.set(buffer, [editor]);
        return this.buildWordListOnNextTick(editor);
      }
    };

    SymbolProvider.prototype.isWatchingEditor = function(editor) {
      return this.getWatchedEditorIndex(editor) > -1;
    };

    SymbolProvider.prototype.isWatchingBuffer = function(buffer) {
      return this.watchedBuffers.get(buffer) != null;
    };

    SymbolProvider.prototype.getWatchedEditorIndex = function(editor) {
      var editors;
      if (editors = this.watchedBuffers.get(editor.getBuffer())) {
        return editors.indexOf(editor);
      } else {
        return -1;
      }
    };

    SymbolProvider.prototype.updateCurrentEditor = function(currentPaneItem) {
      if (currentPaneItem == null) {
        return;
      }
      if (currentPaneItem === this.editor) {
        return;
      }
      this.editor = null;
      if (this.paneItemIsValid(currentPaneItem)) {
        return this.editor = currentPaneItem;
      }
    };

    SymbolProvider.prototype.buildConfigIfScopeChanged = function(_arg) {
      var editor, scopeDescriptor;
      editor = _arg.editor, scopeDescriptor = _arg.scopeDescriptor;
      if (!this.scopeDescriptorsEqual(this.configScopeDescriptor, scopeDescriptor)) {
        this.buildConfig(scopeDescriptor);
        return this.configScopeDescriptor = scopeDescriptor;
      }
    };

    SymbolProvider.prototype.buildConfig = function(scopeDescriptor) {
      var addedConfigEntry, allConfigEntries, legacyCompletions, value, _i, _j, _len, _len1;
      this.config = {};
      legacyCompletions = this.settingsForScopeDescriptor(scopeDescriptor, 'editor.completions');
      allConfigEntries = this.settingsForScopeDescriptor(scopeDescriptor, 'autocomplete.symbols');
      allConfigEntries.reverse();
      for (_i = 0, _len = legacyCompletions.length; _i < _len; _i++) {
        value = legacyCompletions[_i].value;
        if (Array.isArray(value) && value.length) {
          this.addLegacyConfigEntry(value);
        }
      }
      addedConfigEntry = false;
      for (_j = 0, _len1 = allConfigEntries.length; _j < _len1; _j++) {
        value = allConfigEntries[_j].value;
        if (!Array.isArray(value) && typeof value === 'object') {
          this.addConfigEntry(value);
          addedConfigEntry = true;
        }
      }
      if (!addedConfigEntry) {
        return this.addConfigEntry(this.defaultConfig);
      }
    };

    SymbolProvider.prototype.addLegacyConfigEntry = function(suggestions) {
      var suggestion, _base;
      suggestions = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = suggestions.length; _i < _len; _i++) {
          suggestion = suggestions[_i];
          _results.push({
            text: suggestion,
            type: 'builtin'
          });
        }
        return _results;
      })();
      if ((_base = this.config).builtin == null) {
        _base.builtin = {
          suggestions: []
        };
      }
      return this.config.builtin.suggestions = this.config.builtin.suggestions.concat(suggestions);
    };

    SymbolProvider.prototype.addConfigEntry = function(config) {
      var options, suggestions, type, _base, _ref1;
      for (type in config) {
        options = config[type];
        if ((_base = this.config)[type] == null) {
          _base[type] = {};
        }
        if (options.selector != null) {
          this.config[type].selectors = Selector.create(options.selector);
        }
        this.config[type].typePriority = (_ref1 = options.typePriority) != null ? _ref1 : 1;
        this.config[type].wordRegex = this.wordRegex;
        suggestions = this.sanitizeSuggestionsFromConfig(options.suggestions, type);
        if ((suggestions != null) && suggestions.length) {
          this.config[type].suggestions = suggestions;
        }
      }
    };

    SymbolProvider.prototype.sanitizeSuggestionsFromConfig = function(suggestions, type) {
      var sanitizedSuggestions, suggestion, _i, _len;
      if ((suggestions != null) && Array.isArray(suggestions)) {
        sanitizedSuggestions = [];
        for (_i = 0, _len = suggestions.length; _i < _len; _i++) {
          suggestion = suggestions[_i];
          if (typeof suggestion === 'string') {
            sanitizedSuggestions.push({
              text: suggestion,
              type: type
            });
          } else if (typeof suggestions[0] === 'object' && ((suggestion.text != null) || (suggestion.snippet != null))) {
            suggestion = _.clone(suggestion);
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
    };

    SymbolProvider.prototype.uniqueFilter = function(completion) {
      return completion.text;
    };

    SymbolProvider.prototype.paneItemIsValid = function(paneItem) {
      if (typeof atom.workspace.isTextEditor === "function") {
        return atom.workspace.isTextEditor(paneItem);
      } else {
        if (paneItem == null) {
          return false;
        }
        return paneItem.getText != null;
      }
    };


    /*
    Section: Suggesting Completions
     */

    SymbolProvider.prototype.getSuggestions = function(options) {
      var bufferPosition, buffers, cursor, editor, numberOfWordsMatchingPrefix, prefix, symbolList, word, wordUnderCursor, _i, _len, _ref1, _ref2;
      prefix = (_ref1 = options.prefix) != null ? _ref1.trim() : void 0;
      if (!((prefix != null ? prefix.length : void 0) && (prefix != null ? prefix.length : void 0) >= this.minimumWordLength)) {
        return;
      }
      this.buildConfigIfScopeChanged(options);
      editor = options.editor, prefix = options.prefix, bufferPosition = options.bufferPosition;
      numberOfWordsMatchingPrefix = 1;
      wordUnderCursor = this.wordAtBufferPosition(editor, bufferPosition);
      _ref2 = editor.getCursors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cursor = _ref2[_i];
        if (cursor === editor.getLastCursor()) {
          continue;
        }
        word = this.wordAtBufferPosition(editor, cursor.getBufferPosition());
        if (word === wordUnderCursor) {
          numberOfWordsMatchingPrefix += 1;
        }
      }
      buffers = this.includeCompletionsFromAllBuffers ? null : [this.editor.getBuffer()];
      symbolList = this.symbolStore.symbolsForConfig(this.config, buffers, prefix, wordUnderCursor, bufferPosition.row, numberOfWordsMatchingPrefix);
      symbolList.sort(function(a, b) {
        return (b.score * b.localityScore) - (a.score * a.localityScore);
      });
      return symbolList.slice(0, 20).map(function(a) {
        return a.symbol;
      });
    };

    SymbolProvider.prototype.wordAtBufferPosition = function(editor, bufferPosition) {
      var lineFromPosition, lineToPosition, prefix, suffix, _ref1, _ref2;
      lineToPosition = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      prefix = ((_ref1 = lineToPosition.match(this.endOfLineWordRegex)) != null ? _ref1[0] : void 0) || '';
      lineFromPosition = editor.getTextInRange([bufferPosition, [bufferPosition.row, Infinity]]);
      suffix = ((_ref2 = lineFromPosition.match(this.beginningOfLineWordRegex)) != null ? _ref2[0] : void 0) || '';
      return prefix + suffix;
    };

    SymbolProvider.prototype.settingsForScopeDescriptor = function(scopeDescriptor, keyPath) {
      return atom.config.getAll(keyPath, {
        scope: scopeDescriptor
      });
    };


    /*
    Section: Word List Building
     */

    SymbolProvider.prototype.buildWordListOnNextTick = function(editor) {
      return _.defer((function(_this) {
        return function() {
          var newExtent, oldExtent, start;
          if (!(editor != null ? editor.isAlive() : void 0)) {
            return;
          }
          start = {
            row: 0,
            column: 0
          };
          oldExtent = {
            row: 0,
            column: 0
          };
          newExtent = editor.getBuffer().getRange().getExtent();
          return _this.symbolStore.recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent);
        };
      })(this));
    };

    SymbolProvider.prototype.scopeDescriptorsEqual = function(a, b) {
      var arrayA, arrayB, i, scope, _i, _len;
      if (a === b) {
        return true;
      }
      if (!((a != null) && (b != null))) {
        return false;
      }
      arrayA = a.getScopesArray();
      arrayB = b.getScopesArray();
      if (arrayA.length !== arrayB.length) {
        return false;
      }
      for (i = _i = 0, _len = arrayA.length; _i < _len; i = ++_i) {
        scope = arrayA[i];
        if (scope !== arrayB[i]) {
          return false;
        }
      }
      return true;
    };

    return SymbolProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3ltYm9sLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUVBO0FBQUEsTUFBQSxrSUFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUE0QyxPQUFBLENBQVEsTUFBUixDQUE1QyxFQUFDLGtCQUFBLFVBQUQsRUFBYSxhQUFBLEtBQWIsRUFBb0IsMkJBQUEsbUJBRHBCLENBQUE7O0FBQUEsRUFFQyxXQUFZLE9BQUEsQ0FBUSxjQUFSLEVBQVosUUFGRCxDQUFBOztBQUFBLEVBR0MsaUJBQWtCLE9BQUEsQ0FBUSxtQkFBUixFQUFsQixjQUhELENBQUE7O0FBQUEsRUFJQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBSmQsQ0FBQTs7QUFBQSxFQU9BLDBCQUFBLEdBQTZCLFNBQUEsR0FBQTtXQUFHLE1BQUEsQ0FBQSxVQUFpQixDQUFBLFNBQUUsQ0FBQSxlQUFuQixLQUFzQyxXQUF6QztFQUFBLENBUDdCLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osNkJBQUEsU0FBQSxHQUFXLElBQVgsQ0FBQTs7QUFBQSw2QkFDQSx3QkFBQSxHQUEwQixJQUQxQixDQUFBOztBQUFBLDZCQUVBLGtCQUFBLEdBQW9CLElBRnBCLENBQUE7O0FBQUEsNkJBR0EsV0FBQSxHQUFhLElBSGIsQ0FBQTs7QUFBQSw2QkFJQSxNQUFBLEdBQVEsSUFKUixDQUFBOztBQUFBLDZCQUtBLE1BQUEsR0FBUSxJQUxSLENBQUE7O0FBQUEsNkJBTUEsaUJBQUEsR0FBbUIsR0FObkIsQ0FBQTs7QUFBQSw2QkFRQSxRQUFBLEdBQVUsR0FSVixDQUFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/symbol-provider.coffee
