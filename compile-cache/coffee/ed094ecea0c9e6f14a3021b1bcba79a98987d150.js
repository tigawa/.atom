(function() {
  var CompositeDisposable, FuzzyProvider, RefCountedTokenList, fuzzaldrin,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fuzzaldrin = require('fuzzaldrin');

  CompositeDisposable = require('atom').CompositeDisposable;

  RefCountedTokenList = require('./ref-counted-token-list');

  module.exports = FuzzyProvider = (function() {
    FuzzyProvider.prototype.deferBuildWordListInterval = 300;

    FuzzyProvider.prototype.updateBuildWordListTimeout = null;

    FuzzyProvider.prototype.updateCurrentEditorTimeout = null;

    FuzzyProvider.prototype.wordRegex = /\b\w+[\w-]*\b/g;

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
      this.debouncedBuildWordList();
      this.subscriptions = new CompositeDisposable;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvZnV6enktcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1FQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBOztBQUFBLEVBQ0Msc0JBQXdCLE9BQUEsQ0FBUSxNQUFSLEVBQXhCLG1CQURELENBQUE7O0FBQUEsRUFFQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsMEJBQVIsQ0FGdEIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw0QkFBQSwwQkFBQSxHQUE0QixHQUE1QixDQUFBOztBQUFBLDRCQUNBLDBCQUFBLEdBQTRCLElBRDVCLENBQUE7O0FBQUEsNEJBRUEsMEJBQUEsR0FBNEIsSUFGNUIsQ0FBQTs7QUFBQSw0QkFHQSxTQUFBLEdBQVcsZ0JBSFgsQ0FBQTs7QUFBQSw0QkFJQSxTQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFBLENBSmYsQ0FBQTs7QUFBQSw0QkFLQSwwQkFBQSxHQUE0QixJQUw1QixDQUFBOztBQUFBLDRCQU1BLE1BQUEsR0FBUSxJQU5SLENBQUE7O0FBQUEsNEJBT0EsTUFBQSxHQUFRLElBUFIsQ0FBQTs7QUFBQSw0QkFTQSxRQUFBLEdBQVUsR0FUVixDQUFBOztBQUFBLDRCQVVBLGlCQUFBLEdBQW1CLENBVm5CLENBQUE7O0FBQUEsNEJBV0Esa0JBQUEsR0FBb0IsQ0FYcEIsQ0FBQTs7QUFhYSxJQUFBLHVCQUFBLEdBQUE7QUFDWCwrQ0FBQSxDQUFBO0FBQUEsNkVBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/fuzzy-provider.coffee
