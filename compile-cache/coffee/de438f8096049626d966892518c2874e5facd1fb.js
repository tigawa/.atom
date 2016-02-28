(function() {
  var CompositeDisposable, Selector, SymbolProvider, SymbolStore, fuzzaldrin, fuzzaldrinPlus, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  fuzzaldrin = require('fuzzaldrin');

  fuzzaldrinPlus = require('fuzzaldrin-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  Selector = require('selector-kit').Selector;

  SymbolStore = require('./symbol-store');

  module.exports = SymbolProvider = (function() {
    SymbolProvider.prototype.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;

    SymbolProvider.prototype.beginningOfLineWordRegex = /^\w*[a-zA-Z_-]+\w*\b/g;

    SymbolProvider.prototype.endOfLineWordRegex = /\b\w*[a-zA-Z_-]+\w*$/g;

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
      this.buildSymbolList = __bind(this.buildSymbolList, this);
      this.buildWordListOnNextTick = __bind(this.buildWordListOnNextTick, this);
      this.getSuggestions = __bind(this.getSuggestions, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.watchEditor = __bind(this.watchEditor, this);
      this.dispose = __bind(this.dispose, this);
      this.watchedBuffers = new WeakMap;
      this.symbolStore = new SymbolStore(this.wordRegex);
      this.subscriptions = new CompositeDisposable;
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
          _this.useAlternateScoring = useAlternateScoring;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.useLocalityBonus', (function(_this) {
        return function(useLocalityBonus) {
          _this.useLocalityBonus = useLocalityBonus;
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
        bufferSubscriptions.add(buffer.onWillChange((function(_this) {
          return function(_arg) {
            var editors, newRange, oldRange;
            oldRange = _arg.oldRange, newRange = _arg.newRange;
            editors = _this.watchedBuffers.get(buffer);
            if (editors && editors.length && (editor = editors[0])) {
              _this.symbolStore.removeTokensInBufferRange(editor, oldRange);
              return _this.symbolStore.adjustBufferRows(editor, oldRange, newRange);
            }
          };
        })(this)));
        bufferSubscriptions.add(buffer.onDidChange((function(_this) {
          return function(_arg) {
            var editors, newRange;
            newRange = _arg.newRange;
            editors = _this.watchedBuffers.get(buffer);
            if (editors && editors.length && (editor = editors[0])) {
              return _this.symbolStore.addTokensInBufferRange(editor, newRange);
            }
          };
        })(this)));
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
      var options, suggestions, type, _base, _ref;
      for (type in config) {
        options = config[type];
        if ((_base = this.config)[type] == null) {
          _base[type] = {};
        }
        if (options.selector != null) {
          this.config[type].selectors = Selector.create(options.selector);
        }
        this.config[type].typePriority = (_ref = options.typePriority) != null ? _ref : 1;
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
      var buffer, bufferPosition, cursor, editor, numberOfWordsMatchingPrefix, prefix, symbolList, word, wordUnderCursor, words, _i, _j, _len, _len1, _ref, _ref1;
      prefix = (_ref = options.prefix) != null ? _ref.trim() : void 0;
      if (!((prefix != null ? prefix.length : void 0) && (prefix != null ? prefix.length : void 0) >= this.minimumWordLength)) {
        return;
      }
      if (!this.symbolStore.getLength()) {
        return;
      }
      this.buildConfigIfScopeChanged(options);
      editor = options.editor, prefix = options.prefix, bufferPosition = options.bufferPosition;
      numberOfWordsMatchingPrefix = 1;
      wordUnderCursor = this.wordAtBufferPosition(editor, bufferPosition);
      _ref1 = editor.getCursors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cursor = _ref1[_i];
        if (cursor === editor.getLastCursor()) {
          continue;
        }
        word = this.wordAtBufferPosition(editor, cursor.getBufferPosition());
        if (word === wordUnderCursor) {
          numberOfWordsMatchingPrefix += 1;
        }
      }
      buffer = this.includeCompletionsFromAllBuffers ? null : this.editor.getBuffer();
      symbolList = this.symbolStore.symbolsForConfig(this.config, buffer, wordUnderCursor, numberOfWordsMatchingPrefix);
      words = atom.config.get("autocomplete-plus.strictMatching") ? symbolList.filter(function(match) {
        var _ref2;
        return ((_ref2 = match.text) != null ? _ref2.indexOf(options.prefix) : void 0) === 0;
      }) : this.fuzzyFilter(symbolList, this.editor.getBuffer(), options);
      for (_j = 0, _len1 = words.length; _j < _len1; _j++) {
        word = words[_j];
        word.replacementPrefix = options.prefix;
      }
      return words;
    };

    SymbolProvider.prototype.wordAtBufferPosition = function(editor, bufferPosition) {
      var lineFromPosition, lineToPosition, prefix, suffix, _ref, _ref1;
      lineToPosition = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      prefix = ((_ref = lineToPosition.match(this.endOfLineWordRegex)) != null ? _ref[0] : void 0) || '';
      lineFromPosition = editor.getTextInRange([bufferPosition, [bufferPosition.row, Infinity]]);
      suffix = ((_ref1 = lineFromPosition.match(this.beginningOfLineWordRegex)) != null ? _ref1[0] : void 0) || '';
      return prefix + suffix;
    };

    SymbolProvider.prototype.fuzzyFilter = function(symbolList, buffer, _arg) {
      var bufferPosition, candidates, fuzzaldrinProvider, index, prefix, prefixCache, results, score, symbol, text, _i, _j, _len, _len1, _ref;
      bufferPosition = _arg.bufferPosition, prefix = _arg.prefix;
      candidates = [];
      if (this.useAlternateScoring) {
        fuzzaldrinProvider = fuzzaldrinPlus;
        prefixCache = fuzzaldrinPlus.prepQuery(prefix);
      } else {
        fuzzaldrinProvider = fuzzaldrin;
        prefixCache = null;
      }
      for (_i = 0, _len = symbolList.length; _i < _len; _i++) {
        symbol = symbolList[_i];
        text = symbol.snippet || symbol.text;
        if (!(text && prefix[0].toLowerCase() === text[0].toLowerCase())) {
          continue;
        }
        score = fuzzaldrinProvider.score(text, prefix, prefixCache);
        if (this.useLocalityBonus) {
          score *= this.getLocalityScore(bufferPosition, typeof symbol.bufferRowsForBuffer === "function" ? symbol.bufferRowsForBuffer(buffer) : void 0);
        }
        if (score > 0) {
          candidates.push({
            symbol: symbol,
            score: score
          });
        }
      }
      candidates.sort(this.symbolSortReverseIterator);
      results = [];
      for (index = _j = 0, _len1 = candidates.length; _j < _len1; index = ++_j) {
        _ref = candidates[index], symbol = _ref.symbol, score = _ref.score;
        if (index === 20) {
          break;
        }
        results.push(symbol);
      }
      return results;
    };

    SymbolProvider.prototype.symbolSortReverseIterator = function(a, b) {
      return b.score - a.score;
    };

    SymbolProvider.prototype.getLocalityScore = function(bufferPosition, bufferRowsContainingSymbol) {
      var bufferRow, locality, rowDifference, _i, _len;
      if (bufferRowsContainingSymbol != null) {
        rowDifference = Number.MAX_VALUE;
        for (_i = 0, _len = bufferRowsContainingSymbol.length; _i < _len; _i++) {
          bufferRow = bufferRowsContainingSymbol[_i];
          rowDifference = Math.min(rowDifference, bufferRow - bufferPosition.row);
        }
        locality = this.computeLocalityModifier(rowDifference);
        return locality;
      } else {
        return 1;
      }
    };

    SymbolProvider.prototype.computeLocalityModifier = function(rowDifference) {
      var fade;
      rowDifference = Math.abs(rowDifference);
      if (this.useAlternateScoring) {
        fade = 25.0 / (25.0 + rowDifference);
        return 1.0 + fade * fade;
      } else {
        return 1 + Math.max(-Math.pow(.2 * rowDifference - 3, 3) / 25 + .5, 0);
      }
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
          return _this.buildSymbolList(editor);
        };
      })(this));
    };

    SymbolProvider.prototype.buildSymbolList = function(editor) {
      if (!(editor != null ? editor.isAlive() : void 0)) {
        return;
      }
      this.symbolStore.clear(editor.getBuffer());
      return this.symbolStore.addTokensInBufferRange(editor, editor.getBuffer().getRange());
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3ltYm9sLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUVBO0FBQUEsTUFBQSx5RkFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FEYixDQUFBOztBQUFBLEVBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsaUJBQVIsQ0FGakIsQ0FBQTs7QUFBQSxFQUdDLHNCQUF3QixPQUFBLENBQVEsTUFBUixFQUF4QixtQkFIRCxDQUFBOztBQUFBLEVBSUMsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBSkQsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FMZCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDZCQUFBLFNBQUEsR0FBVyx3QkFBWCxDQUFBOztBQUFBLDZCQUNBLHdCQUFBLEdBQTBCLHVCQUQxQixDQUFBOztBQUFBLDZCQUVBLGtCQUFBLEdBQW9CLHVCQUZwQixDQUFBOztBQUFBLDZCQUdBLFdBQUEsR0FBYSxJQUhiLENBQUE7O0FBQUEsNkJBSUEsTUFBQSxHQUFRLElBSlIsQ0FBQTs7QUFBQSw2QkFLQSxNQUFBLEdBQVEsSUFMUixDQUFBOztBQUFBLDZCQU1BLGlCQUFBLEdBQW1CLEdBTm5CLENBQUE7O0FBQUEsNkJBUUEsUUFBQSxHQUFVLEdBUlYsQ0FBQTs7QUFBQSw2QkFTQSxpQkFBQSxHQUFtQixDQVRuQixDQUFBOztBQUFBLDZCQVVBLGtCQUFBLEdBQW9CLENBVnBCLENBQUE7O0FBQUEsNkJBWUEsY0FBQSxHQUFnQixJQVpoQixDQUFBOztBQUFBLDZCQWNBLE1BQUEsR0FBUSxJQWRSLENBQUE7O0FBQUEsNkJBZUEsYUFBQSxHQUNFO0FBQUEsTUFBQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLFFBQUEsRUFBVSwrQ0FBVjtBQUFBLFFBQ0EsWUFBQSxFQUFjLENBRGQ7T0FERjtBQUFBLE1BR0EsVUFBQSxFQUNFO0FBQUEsUUFBQSxRQUFBLEVBQVUsZ0JBQVY7QUFBQSxRQUNBLFlBQUEsRUFBYyxDQURkO09BSkY7QUFBQSxNQU1BLFFBQUEsRUFDRTtBQUFBLFFBQUEsUUFBQSxFQUFVLFdBQVY7QUFBQSxRQUNBLFlBQUEsRUFBYyxDQURkO09BUEY7QUFBQSxNQVNBLEVBQUEsRUFDRTtBQUFBLFFBQUEsUUFBQSxFQUFVLFNBQVY7QUFBQSxRQUNBLFlBQUEsRUFBYyxDQURkO09BVkY7S0FoQkYsQ0FBQTs7QUE2QmEsSUFBQSx3QkFBQSxHQUFBO0FBQ1gsK0RBQUEsQ0FBQTtBQUFBLCtFQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsdUVBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixHQUFBLENBQUEsT0FBbEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxXQUFBLENBQVksSUFBQyxDQUFBLFNBQWIsQ0FEbkIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHFDQUFwQixFQUEyRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxpQkFBRixHQUFBO0FBQXNCLFVBQXJCLEtBQUMsQ0FBQSxvQkFBQSxpQkFBb0IsQ0FBdEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzRCxDQUFuQixDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isb0RBQXBCLEVBQTBFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFFLGdDQUFGLEdBQUE7QUFBcUMsVUFBcEMsS0FBQyxDQUFBLG1DQUFBLGdDQUFtQyxDQUFyQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFFLENBQW5CLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix1Q0FBcEIsRUFBNkQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsbUJBQUYsR0FBQTtBQUF3QixVQUF2QixLQUFDLENBQUEsc0JBQUEsbUJBQXNCLENBQXhCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0QsQ0FBbkIsQ0FMQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLG9DQUFwQixFQUEwRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxnQkFBRixHQUFBO0FBQXFCLFVBQXBCLEtBQUMsQ0FBQSxtQkFBQSxnQkFBbUIsQ0FBckI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRCxDQUFuQixDQU5BLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFmLENBQXFDLElBQUMsQ0FBQSxtQkFBdEMsQ0FBbkIsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxJQUFDLENBQUEsV0FBbkMsQ0FBbkIsQ0FSQSxDQURXO0lBQUEsQ0E3QmI7O0FBQUEsNkJBd0NBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURPO0lBQUEsQ0F4Q1QsQ0FBQTs7QUFBQSw2QkEyQ0EsV0FBQSxHQUFhLFNBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSwrREFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxtQkFBQSxHQUFzQixHQUFBLENBQUEsbUJBRHRCLENBQUE7QUFBQSxNQUVBLG1CQUFtQixDQUFDLEdBQXBCLENBQXdCLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBckIsQ0FBbUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDekQsS0FBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBRHlEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsQ0FBeEIsQ0FGQSxDQUFBO0FBQUEsTUFJQSxtQkFBbUIsQ0FBQyxHQUFwQixDQUF3QixNQUFNLENBQUMsWUFBUCxDQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzFDLGNBQUEsY0FBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixNQUF2QixDQUFSLENBQUE7QUFBQSxVQUNBLE9BQUEsR0FBVSxLQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBcEIsQ0FEVixDQUFBO0FBRUEsVUFBQSxJQUE0QixLQUFBLEdBQVEsQ0FBQSxDQUFwQztBQUFBLFlBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxLQUFmLEVBQXNCLENBQXRCLENBQUEsQ0FBQTtXQUZBO2lCQUdBLG1CQUFtQixDQUFDLE9BQXBCLENBQUEsRUFKMEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQUF4QixDQUpBLENBQUE7QUFVQSxNQUFBLElBQUcsYUFBQSxHQUFnQixJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCLENBQW5CO2VBQ0UsYUFBYSxDQUFDLElBQWQsQ0FBbUIsTUFBbkIsRUFERjtPQUFBLE1BQUE7QUFHRSxRQUFBLG1CQUFBLEdBQXNCLEdBQUEsQ0FBQSxtQkFBdEIsQ0FBQTtBQUFBLFFBQ0EsbUJBQW1CLENBQUMsR0FBcEIsQ0FBd0IsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLElBQUQsR0FBQTtBQUMxQyxnQkFBQSwyQkFBQTtBQUFBLFlBRDRDLGdCQUFBLFVBQVUsZ0JBQUEsUUFDdEQsQ0FBQTtBQUFBLFlBQUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEIsQ0FBVixDQUFBO0FBQ0EsWUFBQSxJQUFHLE9BQUEsSUFBWSxPQUFPLENBQUMsTUFBcEIsSUFBK0IsQ0FBQSxNQUFBLEdBQVMsT0FBUSxDQUFBLENBQUEsQ0FBakIsQ0FBbEM7QUFDRSxjQUFBLEtBQUMsQ0FBQSxXQUFXLENBQUMseUJBQWIsQ0FBdUMsTUFBdkMsRUFBK0MsUUFBL0MsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsTUFBOUIsRUFBc0MsUUFBdEMsRUFBZ0QsUUFBaEQsRUFGRjthQUYwQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQXhCLENBREEsQ0FBQTtBQUFBLFFBT0EsbUJBQW1CLENBQUMsR0FBcEIsQ0FBd0IsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLElBQUQsR0FBQTtBQUN6QyxnQkFBQSxpQkFBQTtBQUFBLFlBRDJDLFdBQUQsS0FBQyxRQUMzQyxDQUFBO0FBQUEsWUFBQSxPQUFBLEdBQVUsS0FBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixDQUFvQixNQUFwQixDQUFWLENBQUE7QUFDQSxZQUFBLElBQUcsT0FBQSxJQUFZLE9BQU8sQ0FBQyxNQUFwQixJQUErQixDQUFBLE1BQUEsR0FBUyxPQUFRLENBQUEsQ0FBQSxDQUFqQixDQUFsQztxQkFDRSxLQUFDLENBQUEsV0FBVyxDQUFDLHNCQUFiLENBQW9DLE1BQXBDLEVBQTRDLFFBQTVDLEVBREY7YUFGeUM7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixDQUF4QixDQVBBLENBQUE7QUFBQSxRQVlBLG1CQUFtQixDQUFDLEdBQXBCLENBQXdCLE1BQU0sQ0FBQyxZQUFQLENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQzFDLFlBQUEsS0FBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQW1CLE1BQW5CLENBQUEsQ0FBQTtBQUFBLFlBQ0EsbUJBQW1CLENBQUMsT0FBcEIsQ0FBQSxDQURBLENBQUE7bUJBRUEsS0FBQyxDQUFBLGNBQWMsQ0FBQyxRQUFELENBQWYsQ0FBdUIsTUFBdkIsRUFIMEM7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQUF4QixDQVpBLENBQUE7QUFBQSxRQWlCQSxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCLEVBQTRCLENBQUMsTUFBRCxDQUE1QixDQWpCQSxDQUFBO2VBa0JBLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixFQXJCRjtPQVhXO0lBQUEsQ0EzQ2IsQ0FBQTs7QUFBQSw2QkE2RUEsZ0JBQUEsR0FBa0IsU0FBQyxNQUFELEdBQUE7YUFDaEIsSUFBQyxDQUFBLHFCQUFELENBQXVCLE1BQXZCLENBQUEsR0FBaUMsQ0FBQSxFQURqQjtJQUFBLENBN0VsQixDQUFBOztBQUFBLDZCQWdGQSxnQkFBQSxHQUFrQixTQUFDLE1BQUQsR0FBQTthQUNoQix3Q0FEZ0I7SUFBQSxDQWhGbEIsQ0FBQTs7QUFBQSw2QkFtRkEscUJBQUEsR0FBdUIsU0FBQyxNQUFELEdBQUE7QUFDckIsVUFBQSxPQUFBO0FBQUEsTUFBQSxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBcEIsQ0FBYjtlQUNFLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE1BQWhCLEVBREY7T0FBQSxNQUFBO2VBR0UsQ0FBQSxFQUhGO09BRHFCO0lBQUEsQ0FuRnZCLENBQUE7O0FBQUEsNkJBeUZBLG1CQUFBLEdBQXFCLFNBQUMsZUFBRCxHQUFBO0FBQ25CLE1BQUEsSUFBYyx1QkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUFVLGVBQUEsS0FBbUIsSUFBQyxDQUFBLE1BQTlCO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFGVixDQUFBO0FBR0EsTUFBQSxJQUE2QixJQUFDLENBQUEsZUFBRCxDQUFpQixlQUFqQixDQUE3QjtlQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsZ0JBQVY7T0FKbUI7SUFBQSxDQXpGckIsQ0FBQTs7QUFBQSw2QkErRkEseUJBQUEsR0FBMkIsU0FBQyxJQUFELEdBQUE7QUFDekIsVUFBQSx1QkFBQTtBQUFBLE1BRDJCLGNBQUEsUUFBUSx1QkFBQSxlQUNuQyxDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLHFCQUFELENBQXVCLElBQUMsQ0FBQSxxQkFBeEIsRUFBK0MsZUFBL0MsQ0FBUDtBQUNFLFFBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxlQUFiLENBQUEsQ0FBQTtlQUNBLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixnQkFGM0I7T0FEeUI7SUFBQSxDQS9GM0IsQ0FBQTs7QUFBQSw2QkFvR0EsV0FBQSxHQUFhLFNBQUMsZUFBRCxHQUFBO0FBQ1gsVUFBQSxpRkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFWLENBQUE7QUFBQSxNQUNBLGlCQUFBLEdBQW9CLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixlQUE1QixFQUE2QyxvQkFBN0MsQ0FEcEIsQ0FBQTtBQUFBLE1BRUEsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLDBCQUFELENBQTRCLGVBQTVCLEVBQTZDLHNCQUE3QyxDQUZuQixDQUFBO0FBQUEsTUFNQSxnQkFBZ0IsQ0FBQyxPQUFqQixDQUFBLENBTkEsQ0FBQTtBQVFBLFdBQUEsd0RBQUEsR0FBQTtBQUNFLFFBREcsOEJBQUEsS0FDSCxDQUFBO0FBQUEsUUFBQSxJQUFnQyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FBQSxJQUF5QixLQUFLLENBQUMsTUFBL0Q7QUFBQSxVQUFBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUF0QixDQUFBLENBQUE7U0FERjtBQUFBLE9BUkE7QUFBQSxNQVdBLGdCQUFBLEdBQW1CLEtBWG5CLENBQUE7QUFZQSxXQUFBLHlEQUFBLEdBQUE7QUFDRSxRQURHLDZCQUFBLEtBQ0gsQ0FBQTtBQUFBLFFBQUEsSUFBRyxDQUFBLEtBQVMsQ0FBQyxPQUFOLENBQWMsS0FBZCxDQUFKLElBQTZCLE1BQUEsQ0FBQSxLQUFBLEtBQWdCLFFBQWhEO0FBQ0UsVUFBQSxJQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQixDQUFBLENBQUE7QUFBQSxVQUNBLGdCQUFBLEdBQW1CLElBRG5CLENBREY7U0FERjtBQUFBLE9BWkE7QUFpQkEsTUFBQSxJQUFBLENBQUEsZ0JBQUE7ZUFBQSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsYUFBakIsRUFBQTtPQWxCVztJQUFBLENBcEdiLENBQUE7O0FBQUEsNkJBd0hBLG9CQUFBLEdBQXNCLFNBQUMsV0FBRCxHQUFBO0FBQ3BCLFVBQUEsaUJBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQWU7YUFBQSxrREFBQTt1Q0FBQTtBQUFBLHdCQUFBO0FBQUEsWUFBQyxJQUFBLEVBQU0sVUFBUDtBQUFBLFlBQW1CLElBQUEsRUFBTSxTQUF6QjtZQUFBLENBQUE7QUFBQTs7VUFBZixDQUFBOzthQUNPLENBQUMsVUFBVztBQUFBLFVBQUMsV0FBQSxFQUFhLEVBQWQ7O09BRG5CO2FBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBaEIsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQTVCLENBQW1DLFdBQW5DLEVBSFY7SUFBQSxDQXhIdEIsQ0FBQTs7QUFBQSw2QkE2SEEsY0FBQSxHQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFVBQUEsdUNBQUE7QUFBQSxXQUFBLGNBQUE7K0JBQUE7O2VBQ1UsQ0FBQSxJQUFBLElBQVM7U0FBakI7QUFDQSxRQUFBLElBQStELHdCQUEvRDtBQUFBLFVBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFBLENBQUssQ0FBQyxTQUFkLEdBQTBCLFFBQVEsQ0FBQyxNQUFULENBQWdCLE9BQU8sQ0FBQyxRQUF4QixDQUExQixDQUFBO1NBREE7QUFBQSxRQUVBLElBQUMsQ0FBQSxNQUFPLENBQUEsSUFBQSxDQUFLLENBQUMsWUFBZCxrREFBb0QsQ0FGcEQsQ0FBQTtBQUFBLFFBR0EsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFBLENBQUssQ0FBQyxTQUFkLEdBQTBCLElBQUMsQ0FBQSxTQUgzQixDQUFBO0FBQUEsUUFLQSxXQUFBLEdBQWMsSUFBQyxDQUFBLDZCQUFELENBQStCLE9BQU8sQ0FBQyxXQUF2QyxFQUFvRCxJQUFwRCxDQUxkLENBQUE7QUFNQSxRQUFBLElBQTJDLHFCQUFBLElBQWlCLFdBQVcsQ0FBQyxNQUF4RTtBQUFBLFVBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFBLENBQUssQ0FBQyxXQUFkLEdBQTRCLFdBQTVCLENBQUE7U0FQRjtBQUFBLE9BRGM7SUFBQSxDQTdIaEIsQ0FBQTs7QUFBQSw2QkF3SUEsNkJBQUEsR0FBK0IsU0FBQyxXQUFELEVBQWMsSUFBZCxHQUFBO0FBQzdCLFVBQUEsMENBQUE7QUFBQSxNQUFBLElBQUcscUJBQUEsSUFBaUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxXQUFkLENBQXBCO0FBQ0UsUUFBQSxvQkFBQSxHQUF1QixFQUF2QixDQUFBO0FBQ0EsYUFBQSxrREFBQTt1Q0FBQTtBQUNFLFVBQUEsSUFBRyxNQUFBLENBQUEsVUFBQSxLQUFxQixRQUF4QjtBQUNFLFlBQUEsb0JBQW9CLENBQUMsSUFBckIsQ0FBMEI7QUFBQSxjQUFDLElBQUEsRUFBTSxVQUFQO0FBQUEsY0FBbUIsTUFBQSxJQUFuQjthQUExQixDQUFBLENBREY7V0FBQSxNQUVLLElBQUcsTUFBQSxDQUFBLFdBQW1CLENBQUEsQ0FBQSxDQUFuQixLQUF5QixRQUF6QixJQUFzQyxDQUFDLHlCQUFBLElBQW9CLDRCQUFyQixDQUF6QztBQUNILFlBQUEsVUFBQSxHQUFhLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBUixDQUFiLENBQUE7O2NBQ0EsVUFBVSxDQUFDLE9BQVE7YUFEbkI7QUFBQSxZQUVBLG9CQUFvQixDQUFDLElBQXJCLENBQTBCLFVBQTFCLENBRkEsQ0FERztXQUhQO0FBQUEsU0FEQTtlQVFBLHFCQVRGO09BQUEsTUFBQTtlQVdFLEtBWEY7T0FENkI7SUFBQSxDQXhJL0IsQ0FBQTs7QUFBQSw2QkFzSkEsWUFBQSxHQUFjLFNBQUMsVUFBRCxHQUFBO2FBQWdCLFVBQVUsQ0FBQyxLQUEzQjtJQUFBLENBdEpkLENBQUE7O0FBQUEsNkJBd0pBLGVBQUEsR0FBaUIsU0FBQyxRQUFELEdBQUE7QUFFZixNQUFBLElBQUcsTUFBQSxDQUFBLElBQVcsQ0FBQyxTQUFTLENBQUMsWUFBdEIsS0FBc0MsVUFBekM7ZUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FBNEIsUUFBNUIsRUFERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQW9CLGdCQUFwQjtBQUFBLGlCQUFPLEtBQVAsQ0FBQTtTQUFBO2VBRUEseUJBTEY7T0FGZTtJQUFBLENBeEpqQixDQUFBOztBQWlLQTtBQUFBOztPQWpLQTs7QUFBQSw2QkFxS0EsY0FBQSxHQUFnQixTQUFDLE9BQUQsR0FBQTtBQUNkLFVBQUEsdUpBQUE7QUFBQSxNQUFBLE1BQUEseUNBQXVCLENBQUUsSUFBaEIsQ0FBQSxVQUFULENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxtQkFBYyxNQUFNLENBQUUsZ0JBQVIsc0JBQW1CLE1BQU0sQ0FBRSxnQkFBUixJQUFrQixJQUFDLENBQUEsaUJBQXBELENBQUE7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUVBLE1BQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxXQUFXLENBQUMsU0FBYixDQUFBLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FGQTtBQUFBLE1BSUEsSUFBQyxDQUFBLHlCQUFELENBQTJCLE9BQTNCLENBSkEsQ0FBQTtBQUFBLE1BTUMsaUJBQUEsTUFBRCxFQUFTLGlCQUFBLE1BQVQsRUFBaUIseUJBQUEsY0FOakIsQ0FBQTtBQUFBLE1BT0EsMkJBQUEsR0FBOEIsQ0FQOUIsQ0FBQTtBQUFBLE1BUUEsZUFBQSxHQUFrQixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsY0FBOUIsQ0FSbEIsQ0FBQTtBQVNBO0FBQUEsV0FBQSw0Q0FBQTsyQkFBQTtBQUNFLFFBQUEsSUFBWSxNQUFBLEtBQVUsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUF0QjtBQUFBLG1CQUFBO1NBQUE7QUFBQSxRQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBOUIsQ0FEUCxDQUFBO0FBRUEsUUFBQSxJQUFvQyxJQUFBLEtBQVEsZUFBNUM7QUFBQSxVQUFBLDJCQUFBLElBQStCLENBQS9CLENBQUE7U0FIRjtBQUFBLE9BVEE7QUFBQSxNQWNBLE1BQUEsR0FBWSxJQUFDLENBQUEsZ0NBQUosR0FBMEMsSUFBMUMsR0FBb0QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FkN0QsQ0FBQTtBQUFBLE1BZUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQS9CLEVBQXVDLE1BQXZDLEVBQStDLGVBQS9DLEVBQWdFLDJCQUFoRSxDQWZiLENBQUE7QUFBQSxNQWlCQSxLQUFBLEdBQ0ssSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUFILEdBQ0UsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsU0FBQyxLQUFELEdBQUE7QUFBVyxZQUFBLEtBQUE7b0RBQVUsQ0FBRSxPQUFaLENBQW9CLE9BQU8sQ0FBQyxNQUE1QixXQUFBLEtBQXVDLEVBQWxEO01BQUEsQ0FBbEIsQ0FERixHQUdFLElBQUMsQ0FBQSxXQUFELENBQWEsVUFBYixFQUF5QixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUF6QixFQUE4QyxPQUE5QyxDQXJCSixDQUFBO0FBdUJBLFdBQUEsOENBQUE7eUJBQUE7QUFDRSxRQUFBLElBQUksQ0FBQyxpQkFBTCxHQUF5QixPQUFPLENBQUMsTUFBakMsQ0FERjtBQUFBLE9BdkJBO0FBMEJBLGFBQU8sS0FBUCxDQTNCYztJQUFBLENBcktoQixDQUFBOztBQUFBLDZCQWtNQSxvQkFBQSxHQUFzQixTQUFDLE1BQUQsRUFBUyxjQUFULEdBQUE7QUFDcEIsVUFBQSw2REFBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEIsQ0FBakIsQ0FBQTtBQUFBLE1BQ0EsTUFBQSx5RUFBb0QsQ0FBQSxDQUFBLFdBQTNDLElBQWlELEVBRDFELENBQUE7QUFBQSxNQUVBLGdCQUFBLEdBQW1CLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsY0FBRCxFQUFpQixDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixRQUFyQixDQUFqQixDQUF0QixDQUZuQixDQUFBO0FBQUEsTUFHQSxNQUFBLG1GQUE0RCxDQUFBLENBQUEsV0FBbkQsSUFBeUQsRUFIbEUsQ0FBQTthQUlBLE1BQUEsR0FBUyxPQUxXO0lBQUEsQ0FsTXRCLENBQUE7O0FBQUEsNkJBeU1BLFdBQUEsR0FBYSxTQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLElBQXJCLEdBQUE7QUFFWCxVQUFBLG1JQUFBO0FBQUEsTUFGaUMsc0JBQUEsZ0JBQWdCLGNBQUEsTUFFakQsQ0FBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLEVBQWIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsbUJBQUo7QUFDRSxRQUFBLGtCQUFBLEdBQXFCLGNBQXJCLENBQUE7QUFBQSxRQUdBLFdBQUEsR0FBYyxjQUFjLENBQUMsU0FBZixDQUF5QixNQUF6QixDQUhkLENBREY7T0FBQSxNQUFBO0FBTUUsUUFBQSxrQkFBQSxHQUFxQixVQUFyQixDQUFBO0FBQUEsUUFDQSxXQUFBLEdBQWMsSUFEZCxDQU5GO09BRkE7QUFXQSxXQUFBLGlEQUFBO2dDQUFBO0FBQ0UsUUFBQSxJQUFBLEdBQVEsTUFBTSxDQUFDLE9BQVAsSUFBa0IsTUFBTSxDQUFDLElBQWpDLENBQUE7QUFDQSxRQUFBLElBQUEsQ0FBQSxDQUFnQixJQUFBLElBQVMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVYsQ0FBQSxDQUFBLEtBQTJCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFSLENBQUEsQ0FBcEQsQ0FBQTtBQUFBLG1CQUFBO1NBREE7QUFBQSxRQUVBLEtBQUEsR0FBUSxrQkFBa0IsQ0FBQyxLQUFuQixDQUF5QixJQUF6QixFQUErQixNQUEvQixFQUF1QyxXQUF2QyxDQUZSLENBQUE7QUFHQSxRQUFBLElBQUcsSUFBQyxDQUFBLGdCQUFKO0FBQTBCLFVBQUEsS0FBQSxJQUFTLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixjQUFsQixxREFBa0MsTUFBTSxDQUFDLG9CQUFxQixnQkFBOUQsQ0FBVCxDQUExQjtTQUhBO0FBSUEsUUFBQSxJQUFvQyxLQUFBLEdBQVEsQ0FBNUM7QUFBQSxVQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCO0FBQUEsWUFBQyxRQUFBLE1BQUQ7QUFBQSxZQUFTLE9BQUEsS0FBVDtXQUFoQixDQUFBLENBQUE7U0FMRjtBQUFBLE9BWEE7QUFBQSxNQWtCQSxVQUFVLENBQUMsSUFBWCxDQUFnQixJQUFDLENBQUEseUJBQWpCLENBbEJBLENBQUE7QUFBQSxNQW9CQSxPQUFBLEdBQVUsRUFwQlYsQ0FBQTtBQXFCQSxXQUFBLG1FQUFBLEdBQUE7QUFDRSxrQ0FERyxjQUFBLFFBQVEsYUFBQSxLQUNYLENBQUE7QUFBQSxRQUFBLElBQVMsS0FBQSxLQUFTLEVBQWxCO0FBQUEsZ0JBQUE7U0FBQTtBQUFBLFFBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFiLENBREEsQ0FERjtBQUFBLE9BckJBO2FBd0JBLFFBMUJXO0lBQUEsQ0F6TWIsQ0FBQTs7QUFBQSw2QkFxT0EseUJBQUEsR0FBMkIsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO2FBQVUsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFDLENBQUMsTUFBdEI7SUFBQSxDQXJPM0IsQ0FBQTs7QUFBQSw2QkF1T0EsZ0JBQUEsR0FBa0IsU0FBQyxjQUFELEVBQWlCLDBCQUFqQixHQUFBO0FBQ2hCLFVBQUEsNENBQUE7QUFBQSxNQUFBLElBQUcsa0NBQUg7QUFDRSxRQUFBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLFNBQXZCLENBQUE7QUFDQSxhQUFBLGlFQUFBO3FEQUFBO0FBQUEsVUFBQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxHQUFMLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQVksY0FBYyxDQUFDLEdBQW5ELENBQWhCLENBQUE7QUFBQSxTQURBO0FBQUEsUUFFQSxRQUFBLEdBQVcsSUFBQyxDQUFBLHVCQUFELENBQXlCLGFBQXpCLENBRlgsQ0FBQTtlQUdBLFNBSkY7T0FBQSxNQUFBO2VBTUUsRUFORjtPQURnQjtJQUFBLENBdk9sQixDQUFBOztBQUFBLDZCQWdQQSx1QkFBQSxHQUF5QixTQUFDLGFBQUQsR0FBQTtBQUN2QixVQUFBLElBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxhQUFULENBQWhCLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQyxDQUFBLG1CQUFKO0FBS0UsUUFBQSxJQUFBLEdBQU8sSUFBQSxHQUFPLENBQUMsSUFBQSxHQUFPLGFBQVIsQ0FBZCxDQUFBO2VBQ0EsR0FBQSxHQUFNLElBQUEsR0FBTyxLQU5mO09BQUEsTUFBQTtlQVNFLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsSUFBSyxDQUFDLEdBQUwsQ0FBUyxFQUFBLEdBQUssYUFBTCxHQUFxQixDQUE5QixFQUFpQyxDQUFqQyxDQUFELEdBQXVDLEVBQXZDLEdBQTRDLEVBQXJELEVBQXlELENBQXpELEVBVE47T0FGdUI7SUFBQSxDQWhQekIsQ0FBQTs7QUFBQSw2QkE2UEEsMEJBQUEsR0FBNEIsU0FBQyxlQUFELEVBQWtCLE9BQWxCLEdBQUE7YUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLENBQW1CLE9BQW5CLEVBQTRCO0FBQUEsUUFBQSxLQUFBLEVBQU8sZUFBUDtPQUE1QixFQUQwQjtJQUFBLENBN1A1QixDQUFBOztBQWdRQTtBQUFBOztPQWhRQTs7QUFBQSw2QkFvUUEsdUJBQUEsR0FBeUIsU0FBQyxNQUFELEdBQUE7YUFDdkIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSLEVBRHVCO0lBQUEsQ0FwUXpCLENBQUE7O0FBQUEsNkJBdVFBLGVBQUEsR0FBaUIsU0FBQyxNQUFELEdBQUE7QUFDZixNQUFBLElBQUEsQ0FBQSxrQkFBYyxNQUFNLENBQUUsT0FBUixDQUFBLFdBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQW1CLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBbkIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxzQkFBYixDQUFvQyxNQUFwQyxFQUE0QyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsUUFBbkIsQ0FBQSxDQUE1QyxFQUhlO0lBQUEsQ0F2UWpCLENBQUE7O0FBQUEsNkJBNlFBLHFCQUFBLEdBQXVCLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNyQixVQUFBLGtDQUFBO0FBQUEsTUFBQSxJQUFlLENBQUEsS0FBSyxDQUFwQjtBQUFBLGVBQU8sSUFBUCxDQUFBO09BQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxDQUFvQixXQUFBLElBQU8sV0FBM0IsQ0FBQTtBQUFBLGVBQU8sS0FBUCxDQUFBO09BREE7QUFBQSxNQUdBLE1BQUEsR0FBUyxDQUFDLENBQUMsY0FBRixDQUFBLENBSFQsQ0FBQTtBQUFBLE1BSUEsTUFBQSxHQUFTLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FKVCxDQUFBO0FBTUEsTUFBQSxJQUFnQixNQUFNLENBQUMsTUFBUCxLQUFtQixNQUFNLENBQUMsTUFBMUM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQU5BO0FBUUEsV0FBQSxxREFBQTswQkFBQTtBQUNFLFFBQUEsSUFBZ0IsS0FBQSxLQUFXLE1BQU8sQ0FBQSxDQUFBLENBQWxDO0FBQUEsaUJBQU8sS0FBUCxDQUFBO1NBREY7QUFBQSxPQVJBO2FBVUEsS0FYcUI7SUFBQSxDQTdRdkIsQ0FBQTs7MEJBQUE7O01BVEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/symbol-provider.coffee
