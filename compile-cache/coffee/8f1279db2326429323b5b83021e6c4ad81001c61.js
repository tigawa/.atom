(function() {
  var RefCountedTokenList, Symbol, SymbolStore, binaryIndexOf, getObjectLength, selectorsMatchScopeChain,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  RefCountedTokenList = require('./ref-counted-token-list');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Symbol = (function() {
    Symbol.prototype.count = 0;

    Symbol.prototype.metadataByPath = null;

    Symbol.prototype.cachedConfig = null;

    Symbol.prototype.type = null;

    function Symbol(text) {
      this.text = text;
      this.metadataByPath = new Map;
    }

    Symbol.prototype.getCount = function() {
      return this.count;
    };

    Symbol.prototype.bufferRowsForBuffer = function(buffer) {
      var _ref;
      return (_ref = this.metadataByPath.get(buffer)) != null ? _ref.bufferRows : void 0;
    };

    Symbol.prototype.countForBuffer = function(buffer) {
      var bufferCount, metadata, scopeChain, scopeCount, _ref;
      metadata = this.metadataByPath.get(buffer);
      bufferCount = 0;
      if (metadata != null) {
        _ref = metadata.scopeChains;
        for (scopeChain in _ref) {
          scopeCount = _ref[scopeChain];
          bufferCount += scopeCount;
        }
      }
      return bufferCount;
    };

    Symbol.prototype.clearForBuffer = function(buffer) {
      var bufferCount;
      bufferCount = this.countForBuffer(buffer);
      if (bufferCount > 0) {
        this.count -= bufferCount;
        return delete this.metadataByPath.get(buffer);
      }
    };

    Symbol.prototype.adjustBufferRows = function(buffer, adjustmentStartRow, adjustmentDelta) {
      var bufferRows, index, length, _ref;
      bufferRows = (_ref = this.metadataByPath.get(buffer)) != null ? _ref.bufferRows : void 0;
      if (bufferRows == null) {
        return;
      }
      index = binaryIndexOf(bufferRows, adjustmentStartRow);
      length = bufferRows.length;
      while (index < length) {
        bufferRows[index] += adjustmentDelta;
        index++;
      }
    };

    Symbol.prototype.addInstance = function(buffer, bufferRow, scopeChain) {
      var metadata;
      metadata = this.metadataByPath.get(buffer);
      if (metadata == null) {
        if (metadata == null) {
          metadata = {};
        }
        this.metadataByPath.set(buffer, metadata);
      }
      this.addBufferRow(buffer, bufferRow);
      if (metadata.scopeChains == null) {
        metadata.scopeChains = {};
      }
      if (metadata.scopeChains[scopeChain] == null) {
        this.type = null;
        metadata.scopeChains[scopeChain] = 0;
      }
      metadata.scopeChains[scopeChain] += 1;
      return this.count += 1;
    };

    Symbol.prototype.removeInstance = function(buffer, bufferRow, scopeChain) {
      var metadata;
      if (!(metadata = this.metadataByPath.get(buffer))) {
        return;
      }
      this.removeBufferRow(buffer, bufferRow);
      if (metadata.scopeChains[scopeChain] != null) {
        this.count -= 1;
        metadata.scopeChains[scopeChain] -= 1;
        if (metadata.scopeChains[scopeChain] === 0) {
          delete metadata.scopeChains[scopeChain];
          this.type = null;
        }
        if (getObjectLength(metadata.scopeChains) === 0) {
          return this.metadataByPath["delete"](buffer);
        }
      }
    };

    Symbol.prototype.addBufferRow = function(buffer, row) {
      var bufferRows, index, metadata;
      metadata = this.metadataByPath.get(buffer);
      if (metadata.bufferRows == null) {
        metadata.bufferRows = [];
      }
      bufferRows = metadata.bufferRows;
      index = binaryIndexOf(bufferRows, row);
      return bufferRows.splice(index, 0, row);
    };

    Symbol.prototype.removeBufferRow = function(buffer, row) {
      var bufferRows, index, metadata;
      metadata = this.metadataByPath.get(buffer);
      bufferRows = metadata.bufferRows;
      if (!bufferRows) {
        return;
      }
      index = binaryIndexOf(bufferRows, row);
      if (bufferRows[index] === row) {
        return bufferRows.splice(index, 1);
      }
    };

    Symbol.prototype.isEqualToWord = function(word) {
      return this.text === word;
    };

    Symbol.prototype.instancesForWord = function(word) {
      if (this.text === word) {
        return this.count;
      } else {
        return 0;
      }
    };

    Symbol.prototype.appliesToConfig = function(config, buffer) {
      var options, type, typePriority, _i, _len, _ref;
      if (this.cachedConfig !== config) {
        this.type = null;
      }
      if (this.type == null) {
        typePriority = 0;
        _ref = Object.keys(config);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          options = config[type];
          if (options.selectors == null) {
            continue;
          }
          this.metadataByPath.forEach((function(_this) {
            return function(_arg) {
              var scopeChain, scopeChains, _j, _len1, _ref1;
              scopeChains = _arg.scopeChains;
              _ref1 = Object.keys(scopeChains);
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                scopeChain = _ref1[_j];
                if ((!_this.type || options.typePriority > typePriority) && selectorsMatchScopeChain(options.selectors, scopeChain)) {
                  _this.type = type;
                  typePriority = options.typePriority;
                }
              }
            };
          })(this));
        }
        this.cachedConfig = config;
      }
      if (buffer != null) {
        return (this.type != null) && this.countForBuffer(buffer) > 0;
      } else {
        return this.type != null;
      }
    };

    return Symbol;

  })();

  module.exports = SymbolStore = (function() {
    SymbolStore.prototype.count = 0;

    function SymbolStore(wordRegex) {
      this.wordRegex = wordRegex;
      this.removeSymbol = __bind(this.removeSymbol, this);
      this.removeToken = __bind(this.removeToken, this);
      this.addToken = __bind(this.addToken, this);
      this.clear();
    }

    SymbolStore.prototype.clear = function(buffer) {
      var symbol, symbolKey, _ref;
      if (buffer != null) {
        _ref = this.symbolMap;
        for (symbolKey in _ref) {
          symbol = _ref[symbolKey];
          symbol.clearForBuffer(buffer);
          if (symbol.getCount() === 0) {
            delete this.symbolMap[symbolKey];
          }
        }
      } else {
        this.symbolMap = {};
      }
    };

    SymbolStore.prototype.getLength = function() {
      return this.count;
    };

    SymbolStore.prototype.getSymbol = function(symbolKey) {
      symbolKey = this.getKey(symbolKey);
      return this.symbolMap[symbolKey];
    };

    SymbolStore.prototype.symbolsForConfig = function(config, buffer, wordUnderCursor, numberOfCursors) {
      var options, symbol, symbolKey, symbols, type, _i, _len, _ref;
      symbols = [];
      _ref = Object.keys(this.symbolMap);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        symbolKey = _ref[_i];
        symbol = this.symbolMap[symbolKey];
        if (symbol.appliesToConfig(config, buffer) && (!symbol.isEqualToWord(wordUnderCursor) || symbol.instancesForWord(wordUnderCursor) > numberOfCursors)) {
          symbols.push(symbol);
        }
      }
      for (type in config) {
        options = config[type];
        if (options.suggestions) {
          symbols = symbols.concat(options.suggestions);
        }
      }
      return symbols;
    };

    SymbolStore.prototype.adjustBufferRows = function(editor, oldRange, newRange) {
      var adjustmentDelta, adjustmentStartRow, key, symbol, _ref;
      adjustmentStartRow = oldRange.end.row + 1;
      adjustmentDelta = newRange.getRowCount() - oldRange.getRowCount();
      if (adjustmentDelta === 0) {
        return;
      }
      _ref = this.symbolMap;
      for (key in _ref) {
        symbol = _ref[key];
        symbol.adjustBufferRows(editor.getBuffer(), adjustmentStartRow, adjustmentDelta);
      }
    };

    SymbolStore.prototype.addToken = function(text, scopeChain, buffer, bufferRow) {
      var matches, symbolText, _i, _len;
      matches = text.match(this.wordRegex);
      if (matches != null) {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          symbolText = matches[_i];
          this.addSymbol(symbolText, buffer, bufferRow, scopeChain);
        }
      }
    };

    SymbolStore.prototype.removeToken = function(text, scopeChain, buffer, bufferRow) {
      var matches, symbolText, _i, _len;
      matches = text.match(this.wordRegex);
      if (matches != null) {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          symbolText = matches[_i];
          this.removeSymbol(symbolText, buffer, bufferRow, scopeChain);
        }
      }
    };

    SymbolStore.prototype.addTokensInBufferRange = function(editor, bufferRange) {
      return this.operateOnTokensInBufferRange(editor, bufferRange, this.addToken);
    };

    SymbolStore.prototype.removeTokensInBufferRange = function(editor, bufferRange) {
      return this.operateOnTokensInBufferRange(editor, bufferRange, this.removeToken);
    };

    SymbolStore.prototype.operateOnTokensInBufferRange = function(editor, bufferRange, operatorFunc) {
      var bufferRow, iterator, token, tokenizedLine, tokenizedLines, useTokenIterator, _i, _j, _len, _ref, _ref1, _ref2;
      tokenizedLines = this.getTokenizedLines(editor);
      useTokenIterator = null;
      for (bufferRow = _i = _ref = bufferRange.start.row, _ref1 = bufferRange.end.row; _i <= _ref1; bufferRow = _i += 1) {
        tokenizedLine = tokenizedLines[bufferRow];
        if (tokenizedLine == null) {
          continue;
        }
        if (useTokenIterator == null) {
          useTokenIterator = typeof tokenizedLine.getTokenIterator === 'function';
        }
        if (useTokenIterator) {
          iterator = typeof tokenizedLine.getTokenIterator === "function" ? tokenizedLine.getTokenIterator() : void 0;
          while (iterator.next()) {
            operatorFunc(iterator.getText(), this.buildScopeChainString(iterator.getScopes()), editor.getBuffer(), bufferRow);
          }
        } else {
          _ref2 = tokenizedLine.tokens;
          for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
            token = _ref2[_j];
            operatorFunc(token.value, this.buildScopeChainString(token.scopes), editor.getBuffer(), bufferRow);
          }
        }
      }
    };


    /*
    Private Methods
     */

    SymbolStore.prototype.addSymbol = function(symbolText, buffer, bufferRow, scopeChain) {
      var symbol, symbolKey;
      symbolKey = this.getKey(symbolText);
      symbol = this.symbolMap[symbolKey];
      if (symbol == null) {
        this.symbolMap[symbolKey] = symbol = new Symbol(symbolText);
        this.count += 1;
      }
      return symbol.addInstance(buffer, bufferRow, scopeChain);
    };

    SymbolStore.prototype.removeSymbol = function(symbolText, buffer, bufferRow, scopeChain) {
      var symbol, symbolKey;
      symbolKey = this.getKey(symbolText);
      symbol = this.symbolMap[symbolKey];
      if (symbol != null) {
        symbol.removeInstance(buffer, bufferRow, scopeChain);
        if (symbol.getCount() === 0) {
          delete this.symbolMap[symbolKey];
          return this.count -= 1;
        }
      }
    };

    SymbolStore.prototype.getTokenizedLines = function(editor) {
      return editor.displayBuffer.tokenizedBuffer.tokenizedLines;
    };

    SymbolStore.prototype.buildScopeChainString = function(scopes) {
      return '.' + scopes.join(' .');
    };

    SymbolStore.prototype.getKey = function(value) {
      return value + '$$';
    };

    return SymbolStore;

  })();

  getObjectLength = function(object) {
    var count, k, v;
    count = 0;
    for (k in object) {
      v = object[k];
      count += 1;
    }
    return count;
  };

  binaryIndexOf = function(array, searchElement) {
    var currentElement, currentIndex, maxIndex, minIndex;
    minIndex = 0;
    maxIndex = array.length - 1;
    while (minIndex <= maxIndex) {
      currentIndex = (minIndex + maxIndex) / 2 | 0;
      currentElement = array[currentIndex];
      if (currentElement < searchElement) {
        minIndex = currentIndex + 1;
      } else if (currentElement > searchElement) {
        maxIndex = currentIndex - 1;
      } else {
        return currentIndex;
      }
    }
    return minIndex;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3ltYm9sLXN0b3JlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrR0FBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDBCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFDQywyQkFBNEIsT0FBQSxDQUFRLGlCQUFSLEVBQTVCLHdCQURELENBQUE7O0FBQUEsRUFHTTtBQUNKLHFCQUFBLEtBQUEsR0FBTyxDQUFQLENBQUE7O0FBQUEscUJBQ0EsY0FBQSxHQUFnQixJQURoQixDQUFBOztBQUFBLHFCQUVBLFlBQUEsR0FBYyxJQUZkLENBQUE7O0FBQUEscUJBSUEsSUFBQSxHQUFNLElBSk4sQ0FBQTs7QUFNYSxJQUFBLGdCQUFFLElBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLE9BQUEsSUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixHQUFBLENBQUEsR0FBbEIsQ0FEVztJQUFBLENBTmI7O0FBQUEscUJBU0EsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxNQUFKO0lBQUEsQ0FUVixDQUFBOztBQUFBLHFCQVdBLG1CQUFBLEdBQXFCLFNBQUMsTUFBRCxHQUFBO0FBQ25CLFVBQUEsSUFBQTtvRUFBMkIsQ0FBRSxvQkFEVjtJQUFBLENBWHJCLENBQUE7O0FBQUEscUJBY0EsY0FBQSxHQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFVBQUEsbURBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsV0FBQSxHQUFjLENBRGQsQ0FBQTtBQUVBLE1BQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/symbol-store.coffee
