(function() {
  var CompositeDisposable, FuzzyProvider, RefCountedTokenList, UnicodeLetters, fuzzaldrin,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fuzzaldrin = require('fuzzaldrin');

  CompositeDisposable = require('atom').CompositeDisposable;

  RefCountedTokenList = require('./ref-counted-token-list');

  UnicodeLetters = require('./unicode-helpers').UnicodeLetters;

  module.exports = FuzzyProvider = (function() {
    FuzzyProvider.prototype.deferBuildWordListInterval = 300;

    FuzzyProvider.prototype.updateBuildWordListTimeout = null;

    FuzzyProvider.prototype.updateCurrentEditorTimeout = null;

    FuzzyProvider.prototype.wordRegex = null;

    FuzzyProvider.prototype.tokenList = new RefCountedTokenList();

    FuzzyProvider.prototype.currentEditorSubscriptions = null;

    FuzzyProvider.prototype.editor = null;

    FuzzyProvider.prototype.buffer = null;

    FuzzyProvider.prototype.selector = '*';

    FuzzyProvider.prototype.inclusionPriority = 0;

    FuzzyProvider.prototype.suggestionPriority = 0;

    function FuzzyProvider() {
      this.dispose = __bind(this.dispose, this);
      this.findSuggestionsForWord = __bind(this.findSuggestionsForWord, this);
      this.buildWordList = __bind(this.buildWordList, this);
      this.bufferDidChange = __bind(this.bufferDidChange, this);
      this.bufferWillChange = __bind(this.bufferWillChange, this);
      this.bufferSaved = __bind(this.bufferSaved, this);
      this.getSuggestions = __bind(this.getSuggestions, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.debouncedUpdateCurrentEditor = __bind(this.debouncedUpdateCurrentEditor, this);
      var builtinProviderBlacklist;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', (function(_this) {
        return function(enableExtendedUnicodeSupport) {
          if (enableExtendedUnicodeSupport) {
            return _this.wordRegex = new RegExp("[" + UnicodeLetters + "\\d_]+[" + UnicodeLetters + "\\d_-]*", 'g');
          } else {
            return _this.wordRegex = /\b\w+[\w-]*\b/g;
          }
        };
      })(this)));
      this.debouncedBuildWordList();
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.debouncedUpdateCurrentEditor));
      builtinProviderBlacklist = atom.config.get('autocomplete-plus.builtinProviderBlacklist');
      if ((builtinProviderBlacklist != null) && builtinProviderBlacklist.length) {
        this.disableForSelector = builtinProviderBlacklist;
      }
    }

    FuzzyProvider.prototype.debouncedUpdateCurrentEditor = function(currentPaneItem) {
      clearTimeout(this.updateBuildWordListTimeout);
      clearTimeout(this.updateCurrentEditorTimeout);
      return this.updateCurrentEditorTimeout = setTimeout((function(_this) {
        return function() {
          return _this.updateCurrentEditor(currentPaneItem);
        };
      })(this), this.deferBuildWordListInterval);
    };

    FuzzyProvider.prototype.updateCurrentEditor = function(currentPaneItem) {
      var _ref;
      if (currentPaneItem == null) {
        return;
      }
      if (currentPaneItem === this.editor) {
        return;
      }
      if ((_ref = this.currentEditorSubscriptions) != null) {
        _ref.dispose();
      }
      this.editor = null;
      this.buffer = null;
      if (!this.paneItemIsValid(currentPaneItem)) {
        return;
      }
      this.editor = currentPaneItem;
      this.buffer = this.editor.getBuffer();
      this.currentEditorSubscriptions = new CompositeDisposable;
      this.currentEditorSubscriptions.add(this.buffer.onDidSave(this.bufferSaved));
      this.currentEditorSubscriptions.add(this.buffer.onWillChange(this.bufferWillChange));
      this.currentEditorSubscriptions.add(this.buffer.onDidChange(this.bufferDidChange));
      return this.buildWordList();
    };

    FuzzyProvider.prototype.paneItemIsValid = function(paneItem) {
      if (typeof atom.workspace.isTextEditor === "function") {
        return atom.workspace.isTextEditor(paneItem);
      } else {
        if (paneItem == null) {
          return false;
        }
        return paneItem.getText != null;
      }
    };

    FuzzyProvider.prototype.getSuggestions = function(_arg) {
      var editor, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, prefix = _arg.prefix, scopeDescriptor = _arg.scopeDescriptor;
      if (editor == null) {
        return;
      }
      if (!prefix.trim().length) {
        return;
      }
      suggestions = this.findSuggestionsForWord(prefix, scopeDescriptor);
      if (!(suggestions != null ? suggestions.length : void 0)) {
        return;
      }
      return suggestions;
    };

    FuzzyProvider.prototype.bufferSaved = function() {
      return this.buildWordList();
    };

    FuzzyProvider.prototype.bufferWillChange = function(_arg) {
      var oldLines, oldRange;
      oldRange = _arg.oldRange;
      oldLines = this.editor.getTextInBufferRange([[oldRange.start.row, 0], [oldRange.end.row, Infinity]]);
      return this.removeWordsForText(oldLines);
    };

    FuzzyProvider.prototype.bufferDidChange = function(_arg) {
      var newLines, newRange;
      newRange = _arg.newRange;
      newLines = this.editor.getTextInBufferRange([[newRange.start.row, 0], [newRange.end.row, Infinity]]);
      return this.addWordsForText(newLines);
    };

    FuzzyProvider.prototype.debouncedBuildWordList = function() {
      clearTimeout(this.updateBuildWordListTimeout);
      return this.updateBuildWordListTimeout = setTimeout((function(_this) {
        return function() {
          return _this.buildWordList();
        };
      })(this), this.deferBuildWordListInterval);
    };

    FuzzyProvider.prototype.buildWordList = function() {
      var editor, editors, _i, _len, _results;
      if (this.editor == null) {
        return;
      }
      this.tokenList.clear();
      if (atom.config.get('autocomplete-plus.includeCompletionsFromAllBuffers')) {
        editors = atom.workspace.getTextEditors();
      } else {
        editors = [this.editor];
      }
      _results = [];
      for (_i = 0, _len = editors.length; _i < _len; _i++) {
        editor = editors[_i];
        _results.push(this.addWordsForText(editor.getText()));
      }
      return _results;
    };

    FuzzyProvider.prototype.addWordsForText = function(text) {
      var match, matches, minimumWordLength, _i, _len, _results;
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      matches = text.match(this.wordRegex);
      if (matches == null) {
        return;
      }
      _results = [];
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        match = matches[_i];
        if ((minimumWordLength && match.length >= minimumWordLength) || !minimumWordLength) {
          _results.push(this.tokenList.addToken(match));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    FuzzyProvider.prototype.removeWordsForText = function(text) {
      var match, matches, _i, _len, _results;
      matches = text.match(this.wordRegex);
      if (matches == null) {
        return;
      }
      _results = [];
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        match = matches[_i];
        _results.push(this.tokenList.removeToken(match));
      }
      return _results;
    };

    FuzzyProvider.prototype.findSuggestionsForWord = function(prefix, scopeDescriptor) {
      var results, tokens, word, words, _i, _len;
      if (!(this.tokenList.getLength() && (this.editor != null))) {
        return;
      }
      tokens = this.tokenList.getTokens();
      tokens = tokens.concat(this.getCompletionsForCursorScope(scopeDescriptor));
      words = atom.config.get('autocomplete-plus.strictMatching') ? tokens.filter(function(word) {
        return (word != null ? word.indexOf(prefix) : void 0) === 0;
      }) : fuzzaldrin.filter(tokens, prefix);
      results = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        if (!(word !== prefix)) {
          continue;
        }
        if (!(word && prefix && prefix[0].toLowerCase() === word[0].toLowerCase())) {
          continue;
        }
        results.push({
          text: word,
          replacementPrefix: prefix
        });
      }
      return results;
    };

    FuzzyProvider.prototype.settingsForScopeDescriptor = function(scopeDescriptor, keyPath) {
      return atom.config.getAll(keyPath, {
        scope: scopeDescriptor
      });
    };

    FuzzyProvider.prototype.getCompletionsForCursorScope = function(scopeDescriptor) {
      var completion, completions, resultCompletions, seen, value, _i, _j, _len, _len1;
      completions = this.settingsForScopeDescriptor(scopeDescriptor, 'editor.completions');
      seen = {};
      resultCompletions = [];
      for (_i = 0, _len = completions.length; _i < _len; _i++) {
        value = completions[_i].value;
        if (Array.isArray(value)) {
          for (_j = 0, _len1 = value.length; _j < _len1; _j++) {
            completion = value[_j];
            if (!seen[completion]) {
              resultCompletions.push(completion);
              seen[completion] = true;
            }
          }
        }
      }
      return resultCompletions;
    };

    FuzzyProvider.prototype.dispose = function() {
      var _ref;
      clearTimeout(this.updateBuildWordListTimeout);
      clearTimeout(this.updateCurrentEditorTimeout);
      if ((_ref = this.currentEditorSubscriptions) != null) {
        _ref.dispose();
      }
      return this.subscriptions.dispose();
    };

    return FuzzyProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvZnV6enktcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1GQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBOztBQUFBLEVBQ0Msc0JBQXdCLE9BQUEsQ0FBUSxNQUFSLEVBQXhCLG1CQURELENBQUE7O0FBQUEsRUFFQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsMEJBQVIsQ0FGdEIsQ0FBQTs7QUFBQSxFQUdDLGlCQUFrQixPQUFBLENBQVEsbUJBQVIsRUFBbEIsY0FIRCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDRCQUFBLDBCQUFBLEdBQTRCLEdBQTVCLENBQUE7O0FBQUEsNEJBQ0EsMEJBQUEsR0FBNEIsSUFENUIsQ0FBQTs7QUFBQSw0QkFFQSwwQkFBQSxHQUE0QixJQUY1QixDQUFBOztBQUFBLDRCQUdBLFNBQUEsR0FBVyxJQUhYLENBQUE7O0FBQUEsNEJBSUEsU0FBQSxHQUFlLElBQUEsbUJBQUEsQ0FBQSxDQUpmLENBQUE7O0FBQUEsNEJBS0EsMEJBQUEsR0FBNEIsSUFMNUIsQ0FBQTs7QUFBQSw0QkFNQSxNQUFBLEdBQVEsSUFOUixDQUFBOztBQUFBLDRCQU9BLE1BQUEsR0FBUSxJQVBSLENBQUE7O0FBQUEsNEJBU0EsUUFBQSxHQUFVLEdBVFYsQ0FBQTs7QUFBQSw0QkFVQSxpQkFBQSxHQUFtQixDQVZuQixDQUFBOztBQUFBLDRCQVdBLGtCQUFBLEdBQW9CLENBWHBCLENBQUE7O0FBYWEsSUFBQSx1QkFBQSxHQUFBO0FBQ1gsK0NBQUEsQ0FBQTtBQUFBLDZFQUFBLENBQUE7QUFBQSwyREFBQSxDQUFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/fuzzy-provider.coffee
