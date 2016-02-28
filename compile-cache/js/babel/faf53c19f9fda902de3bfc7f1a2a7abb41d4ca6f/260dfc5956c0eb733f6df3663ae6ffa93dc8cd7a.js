Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _scopeHelpers = require('./scope-helpers');

var _fuzzaldrin = require('fuzzaldrin');

var _fuzzaldrin2 = _interopRequireDefault(_fuzzaldrin);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

"use babel";

var EMPTY_ARRAY = [];

var Symbol = (function () {
  function Symbol(text, scopes) {
    _classCallCheck(this, Symbol);

    this.text = text;
    this.scopeChain = (0, _scopeHelpers.buildScopeChainString)(scopes);
  }

  _createClass(Symbol, [{
    key: 'matchingTypeForConfig',
    value: function matchingTypeForConfig(config) {
      var matchingType = null;
      var highestTypePriority = -1;
      for (var type of Object.keys(config)) {
        var _config$type = config[type];
        var selectors = _config$type.selectors;
        var typePriority = _config$type.typePriority;

        if (selectors == null) continue;
        if (typePriority == null) typePriority = 0;
        if (typePriority > highestTypePriority && (0, _scopeHelpers.selectorsMatchScopeChain)(selectors, this.scopeChain)) {
          matchingType = type;
          highestTypePriority = typePriority;
        }
      }

      return matchingType;
    }
  }]);

  return Symbol;
})();

var SymbolStore = (function () {
  function SymbolStore(wordRegex) {
    _classCallCheck(this, SymbolStore);

    this.wordRegex = wordRegex;
    this.linesByBuffer = new Map();
  }

  _createClass(SymbolStore, [{
    key: 'clear',
    value: function clear(buffer) {
      if (buffer) {
        this.linesByBuffer['delete'](buffer);
      } else {
        this.linesByBuffer.clear();
      }
    }
  }, {
    key: 'symbolsForConfig',
    value: function symbolsForConfig(config, buffers, prefix, wordUnderCursor, cursorBufferRow, numberOfCursors) {
      this.prefixCache = _fuzzaldrinPlus2['default'].prepQuery(prefix);

      var firstLetter = prefix[0].toLowerCase();
      var symbolsByWord = new Map();
      var wordOccurrences = new Map();
      for (var bufferLines of this.linesForBuffers(buffers)) {
        var symbolBufferRow = 0;
        for (var lineSymbolsByLetter of bufferLines) {
          var symbols = lineSymbolsByLetter.get(firstLetter) || EMPTY_ARRAY;
          for (var symbol of symbols) {
            wordOccurrences.set(symbol.text, (wordOccurrences.get(symbol.text) || 0) + 1);

            var symbolForWord = symbolsByWord.get(symbol.text);
            if (symbolForWord != null) {
              symbolForWord.localityScore = Math.max(this.getLocalityScore(cursorBufferRow, symbolBufferRow), symbolForWord.localityScore);
            } else if (wordUnderCursor === symbol.text && wordOccurrences.get(symbol.text) <= numberOfCursors) {
              continue;
            } else {
              var _scoreSymbol = this.scoreSymbol(prefix, symbol, cursorBufferRow, symbolBufferRow);

              var score = _scoreSymbol.score;
              var localityScore = _scoreSymbol.localityScore;

              if (score > 0) {
                var type = symbol.matchingTypeForConfig(config);
                if (type != null) {
                  symbol = { text: symbol.text, type: type, replacementPrefix: prefix };
                  symbolsByWord.set(symbol.text, { symbol: symbol, score: score, localityScore: localityScore });
                }
              }
            }
          }

          symbolBufferRow++;
        }
      }

      var suggestions = [];
      for (var type of Object.keys(config)) {
        var symbols = config[type].suggestions || EMPTY_ARRAY;
        for (var symbol of symbols) {
          var _scoreSymbol2 = this.scoreSymbol(prefix, symbol, cursorBufferRow, Number.MAX_VALUE);

          var score = _scoreSymbol2.score;

          if (score > 0) {
            symbol.replacementPrefix = prefix;
            suggestions.push({ symbol: symbol, score: score });
          }
        }
      }

      return Array.from(symbolsByWord.values()).concat(suggestions);
    }
  }, {
    key: 'recomputeSymbolsForEditorInBufferRange',
    value: function recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent) {
      var _linesForBuffer;

      var newEnd = start.row + newExtent.row;
      var newLines = [];
      for (var bufferRow = start.row; bufferRow <= newEnd; bufferRow++) {
        var tokenizedLine = editor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(bufferRow);
        if (tokenizedLine == null) continue;

        var symbolsByLetter = new Map();
        var tokenIterator = tokenizedLine.getTokenIterator();
        while (tokenIterator.next()) {
          var wordsWithinToken = tokenIterator.getText().match(this.wordRegex) || EMPTY_ARRAY;
          for (var wordWithinToken of wordsWithinToken) {
            var symbol = new Symbol(wordWithinToken, tokenIterator.getScopes());
            var firstLetter = symbol.text[0].toLowerCase();
            if (!symbolsByLetter.has(firstLetter)) symbolsByLetter.set(firstLetter, []);
            symbolsByLetter.get(firstLetter).push(symbol);
          }
        }

        newLines.push(symbolsByLetter);
      }

      (_linesForBuffer = this.linesForBuffer(editor.getBuffer())).splice.apply(_linesForBuffer, [start.row, oldExtent.row + 1].concat(newLines));
    }
  }, {
    key: 'linesForBuffers',
    value: function linesForBuffers(buffers) {
      var _this = this;

      buffers = buffers || Array.from(this.linesByBuffer.keys());
      return buffers.map(function (buffer) {
        return _this.linesForBuffer(buffer);
      });
    }
  }, {
    key: 'linesForBuffer',
    value: function linesForBuffer(buffer) {
      if (!this.linesByBuffer.has(buffer)) {
        this.linesByBuffer.set(buffer, []);
      }

      return this.linesByBuffer.get(buffer);
    }
  }, {
    key: 'setUseAlternateScoring',
    value: function setUseAlternateScoring(useAlternateScoring) {
      this.useAlternateScoring = useAlternateScoring;
    }
  }, {
    key: 'setUseLocalityBonus',
    value: function setUseLocalityBonus(useLocalityBonus) {
      this.useLocalityBonus = useLocalityBonus;
    }
  }, {
    key: 'setUseStrictMatching',
    value: function setUseStrictMatching(useStrictMatching) {
      this.useStrictMatching = useStrictMatching;
    }
  }, {
    key: 'scoreSymbol',
    value: function scoreSymbol(prefix, symbol, cursorBufferRow, symbolBufferRow) {
      var text = symbol.text || symbol.snippet;
      if (this.useStrictMatching) {
        return this.strictMatchScore(prefix, text);
      } else {
        return this.fuzzyMatchScore(prefix, text, cursorBufferRow, symbolBufferRow);
      }
    }
  }, {
    key: 'strictMatchScore',
    value: function strictMatchScore(prefix, text) {
      return {
        score: text.indexOf(prefix) === 0 ? 1 : 0,
        localityScore: 1
      };
    }
  }, {
    key: 'fuzzyMatchScore',
    value: function fuzzyMatchScore(prefix, text, cursorBufferRow, symbolBufferRow) {
      if (text == null || prefix[0].toLowerCase() !== text[0].toLowerCase()) {
        return { score: 0, localityScore: 0 };
      }

      var fuzzaldrinProvider = this.useAlternateScoring ? _fuzzaldrinPlus2['default'] : _fuzzaldrin2['default'];
      var score = fuzzaldrinProvider.score(text, prefix, this.prefixCache);
      var localityScore = this.getLocalityScore(cursorBufferRow, symbolBufferRow);
      return { score: score, localityScore: localityScore };
    }
  }, {
    key: 'getLocalityScore',
    value: function getLocalityScore(cursorBufferRow, symbolBufferRow) {
      if (!this.useLocalityBonus) {
        return 1;
      }

      var rowDifference = Math.abs(symbolBufferRow - cursorBufferRow);
      if (this.useAlternateScoring) {
        // Between 1 and 1 + strength. (here between 1.0 and 2.0)
        // Avoid a pow and a branching max.
        // 25 is the number of row where the bonus is 3/4 faded away.
        // strength is the factor in front of fade*fade. Here it is 1.0
        var fade = 25.0 / (25.0 + rowDifference);
        return 1.0 + fade * fade;
      } else {
        // Will be between 1 and ~2.75
        return 1 + Math.max(-Math.pow(.2 * rowDifference - 3, 3) / 25 + .5, 0);
      }
    }
  }]);

  return SymbolStore;
})();

exports['default'] = SymbolStore;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3N5bWJvbC1zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzRCQUk4RCxpQkFBaUI7OzBCQUN4RCxZQUFZOzs7OzhCQUNSLGlCQUFpQjs7OztBQU41QyxXQUFXLENBQUE7O0FBRVgsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBOztJQU1oQixNQUFNO0FBQ0UsV0FEUixNQUFNLENBQ0csSUFBSSxFQUFFLE1BQU0sRUFBRTswQkFEdkIsTUFBTTs7QUFFUixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsVUFBVSxHQUFHLHlDQUFzQixNQUFNLENBQUMsQ0FBQTtHQUNoRDs7ZUFKRyxNQUFNOztXQU1ZLCtCQUFDLE1BQU0sRUFBRTtBQUM3QixVQUFJLFlBQVksR0FBRyxJQUFJLENBQUE7QUFDdkIsVUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUM1QixXQUFLLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7MkJBQ0osTUFBTSxDQUFDLElBQUksQ0FBQztZQUF2QyxTQUFTLGdCQUFULFNBQVM7WUFBRSxZQUFZLGdCQUFaLFlBQVk7O0FBQzVCLFlBQUksU0FBUyxJQUFJLElBQUksRUFBRSxTQUFRO0FBQy9CLFlBQUksWUFBWSxJQUFJLElBQUksRUFBRSxZQUFZLEdBQUcsQ0FBQyxDQUFBO0FBQzFDLFlBQUksWUFBWSxHQUFHLG1CQUFtQixJQUFJLDRDQUF5QixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzlGLHNCQUFZLEdBQUcsSUFBSSxDQUFBO0FBQ25CLDZCQUFtQixHQUFHLFlBQVksQ0FBQTtTQUNuQztPQUNGOztBQUVELGFBQU8sWUFBWSxDQUFBO0tBQ3BCOzs7U0FwQkcsTUFBTTs7O0lBdUJTLFdBQVc7QUFDbEIs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Q0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtPQUN2RTtLQUNGOzs7U0FoS2tCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3N5bWJvbC1zdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgRU1QVFlfQVJSQVkgPSBbXVxuXG5pbXBvcnQge3NlbGVjdG9yc01hdGNoU2NvcGVDaGFpbiwgYnVpbGRTY29wZUNoYWluU3RyaW5nfSBmcm9tICcuL3Njb3BlLWhlbHBlcnMnXG5pbXBvcnQgZnV6emFsZHJpbiBmcm9tICdmdXp6YWxkcmluJ1xuaW1wb3J0IGZ1enphbGRyaW5QbHVzIGZyb20gJ2Z1enphbGRyaW4tcGx1cydcblxuY2xhc3MgU3ltYm9sIHtcbiAgY29uc3RydWN0b3IgKHRleHQsIHNjb3Blcykge1xuICAgIHRoaXMudGV4dCA9IHRleHRcbiAgICB0aGlzLnNjb3BlQ2hhaW4gPSBidWlsZFNjb3BlQ2hhaW5TdHJpbmcoc2NvcGVzKVxuICB9XG5cbiAgbWF0Y2hpbmdUeXBlRm9yQ29uZmlnIChjb25maWcpIHtcbiAgICBsZXQgbWF0Y2hpbmdUeXBlID0gbnVsbFxuICAgIGxldCBoaWdoZXN0VHlwZVByaW9yaXR5ID0gLTFcbiAgICBmb3IgKGxldCB0eXBlIG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGxldCB7c2VsZWN0b3JzLCB0eXBlUHJpb3JpdHl9ID0gY29uZmlnW3R5cGVdXG4gICAgICBpZiAoc2VsZWN0b3JzID09IG51bGwpIGNvbnRpbnVlXG4gICAgICBpZiAodHlwZVByaW9yaXR5ID09IG51bGwpIHR5cGVQcmlvcml0eSA9IDBcbiAgICAgIGlmICh0eXBlUHJpb3JpdHkgPiBoaWdoZXN0VHlwZVByaW9yaXR5ICYmIHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbihzZWxlY3RvcnMsIHRoaXMuc2NvcGVDaGFpbikpIHtcbiAgICAgICAgbWF0Y2hpbmdUeXBlID0gdHlwZVxuICAgICAgICBoaWdoZXN0VHlwZVByaW9yaXR5ID0gdHlwZVByaW9yaXR5XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoaW5nVHlwZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bWJvbFN0b3JlIHtcbiAgY29uc3RydWN0b3IgKHdvcmRSZWdleCkge1xuICAgIHRoaXMud29yZFJlZ2V4ID0gd29yZFJlZ2V4XG4gICAgdGhpcy5saW5lc0J5QnVmZmVyID0gbmV3IE1hcFxuICB9XG5cbiAgY2xlYXIgKGJ1ZmZlcikge1xuICAgIGlmIChidWZmZXIpIHtcbiAgICAgIHRoaXMubGluZXNCeUJ1ZmZlci5kZWxldGUoYnVmZmVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpbmVzQnlCdWZmZXIuY2xlYXIoKVxuICAgIH1cbiAgfVxuXG4gIHN5bWJvbHNGb3JDb25maWcgKGNvbmZpZywgYnVmZmVycywgcHJlZml4LCB3b3JkVW5kZXJDdXJzb3IsIGN1cnNvckJ1ZmZlclJvdywgbnVtYmVyT2ZDdXJzb3JzKSB7XG4gICAgdGhpcy5wcmVmaXhDYWNoZSA9IGZ1enphbGRyaW5QbHVzLnByZXBRdWVyeShwcmVmaXgpXG5cbiAgICBsZXQgZmlyc3RMZXR0ZXIgPSBwcmVmaXhbMF0udG9Mb3dlckNhc2UoKVxuICAgIGxldCBzeW1ib2xzQnlXb3JkID0gbmV3IE1hcCgpXG4gICAgbGV0IHdvcmRPY2N1cnJlbmNlcyA9IG5ldyBNYXAoKVxuICAgIGZvciAobGV0IGJ1ZmZlckxpbmVzIG9mIHRoaXMubGluZXNGb3JCdWZmZXJzKGJ1ZmZlcnMpKSB7XG4gICAgICBsZXQgc3ltYm9sQnVmZmVyUm93ID0gMFxuICAgICAgZm9yIChsZXQgbGluZVN5bWJvbHNCeUxldHRlciBvZiBidWZmZXJMaW5lcykge1xuICAgICAgICBsZXQgc3ltYm9scyA9IGxpbmVTeW1ib2xzQnlMZXR0ZXIuZ2V0KGZpcnN0TGV0dGVyKSB8fCBFTVBUWV9BUlJBWVxuICAgICAgICBmb3IgKGxldCBzeW1ib2wgb2Ygc3ltYm9scykge1xuICAgICAgICAgIHdvcmRPY2N1cnJlbmNlcy5zZXQoc3ltYm9sLnRleHQsICh3b3JkT2NjdXJyZW5jZXMuZ2V0KHN5bWJvbC50ZXh0KSB8fCAwKSArIDEpXG5cbiAgICAgICAgICBsZXQgc3ltYm9sRm9yV29yZCA9IHN5bWJvbHNCeVdvcmQuZ2V0KHN5bWJvbC50ZXh0KVxuICAgICAgICAgIGlmIChzeW1ib2xGb3JXb3JkICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN5bWJvbEZvcldvcmQubG9jYWxpdHlTY29yZSA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICB0aGlzLmdldExvY2FsaXR5U2NvcmUoY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpLFxuICAgICAgICAgICAgICBzeW1ib2xGb3JXb3JkLmxvY2FsaXR5U2NvcmVcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9IGVsc2UgaWYgKHdvcmRVbmRlckN1cnNvciA9PT0gc3ltYm9sLnRleHQgJiYgd29yZE9jY3VycmVuY2VzLmdldChzeW1ib2wudGV4dCkgPD0gbnVtYmVyT2ZDdXJzb3JzKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQge3Njb3JlLCBsb2NhbGl0eVNjb3JlfSA9IHRoaXMuc2NvcmVTeW1ib2wocHJlZml4LCBzeW1ib2wsIGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KVxuICAgICAgICAgICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICAgICAgICBsZXQgdHlwZSA9IHN5bWJvbC5tYXRjaGluZ1R5cGVGb3JDb25maWcoY29uZmlnKVxuICAgICAgICAgICAgICBpZiAodHlwZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc3ltYm9sID0ge3RleHQ6IHN5bWJvbC50ZXh0LCB0eXBlLCByZXBsYWNlbWVudFByZWZpeDogcHJlZml4fVxuICAgICAgICAgICAgICAgIHN5bWJvbHNCeVdvcmQuc2V0KHN5bWJvbC50ZXh0LCB7c3ltYm9sLCBzY29yZSwgbG9jYWxpdHlTY29yZX0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzeW1ib2xCdWZmZXJSb3crK1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBzdWdnZXN0aW9ucyA9IFtdXG4gICAgZm9yIChsZXQgdHlwZSBvZiBPYmplY3Qua2V5cyhjb25maWcpKSB7XG4gICAgICBsZXQgc3ltYm9scyA9IGNvbmZpZ1t0eXBlXS5zdWdnZXN0aW9ucyB8fCBFTVBUWV9BUlJBWVxuICAgICAgZm9yIChsZXQgc3ltYm9sIG9mIHN5bWJvbHMpIHtcbiAgICAgICAgbGV0IHtzY29yZX0gPSB0aGlzLnNjb3JlU3ltYm9sKHByZWZpeCwgc3ltYm9sLCBjdXJzb3JCdWZmZXJSb3csIE51bWJlci5NQVhfVkFMVUUpXG4gICAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgICBzeW1ib2wucmVwbGFjZW1lbnRQcmVmaXggPSBwcmVmaXhcbiAgICAgICAgICBzdWdnZXN0aW9ucy5wdXNoKHtzeW1ib2wsIHNjb3JlfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBBcnJheS5mcm9tKHN5bWJvbHNCeVdvcmQudmFsdWVzKCkpLmNvbmNhdChzdWdnZXN0aW9ucylcbiAgfVxuXG4gIHJlY29tcHV0ZVN5bWJvbHNGb3JFZGl0b3JJbkJ1ZmZlclJhbmdlIChlZGl0b3IsIHN0YXJ0LCBvbGRFeHRlbnQsIG5ld0V4dGVudCkge1xuICAgIGxldCBuZXdFbmQgPSBzdGFydC5yb3cgKyBuZXdFeHRlbnQucm93XG4gICAgbGV0IG5ld0xpbmVzID0gW11cbiAgICBmb3IgKHZhciBidWZmZXJSb3cgPSBzdGFydC5yb3c7IGJ1ZmZlclJvdyA8PSBuZXdFbmQ7IGJ1ZmZlclJvdysrKSB7XG4gICAgICBsZXQgdG9rZW5pemVkTGluZSA9IGVkaXRvci5kaXNwbGF5QnVmZmVyLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KGJ1ZmZlclJvdylcbiAgICAgIGlmICh0b2tlbml6ZWRMaW5lID09IG51bGwpIGNvbnRpbnVlXG5cbiAgICAgIGxldCBzeW1ib2xzQnlMZXR0ZXIgPSBuZXcgTWFwXG4gICAgICBsZXQgdG9rZW5JdGVyYXRvciA9IHRva2VuaXplZExpbmUuZ2V0VG9rZW5JdGVyYXRvcigpXG4gICAgICB3aGlsZSAodG9rZW5JdGVyYXRvci5uZXh0KCkpIHtcbiAgICAgICAgbGV0IHdvcmRzV2l0aGluVG9rZW4gPSB0b2tlbkl0ZXJhdG9yLmdldFRleHQoKS5tYXRjaCh0aGlzLndvcmRSZWdleCkgfHwgRU1QVFlfQVJSQVlcbiAgICAgICAgZm9yIChsZXQgd29yZFdpdGhpblRva2VuIG9mIHdvcmRzV2l0aGluVG9rZW4pIHtcbiAgICAgICAgICBsZXQgc3ltYm9sID0gbmV3IFN5bWJvbCh3b3JkV2l0aGluVG9rZW4sIHRva2VuSXRlcmF0b3IuZ2V0U2NvcGVzKCkpXG4gICAgICAgICAgbGV0IGZpcnN0TGV0dGVyID0gc3ltYm9sLnRleHRbMF0udG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGlmICghc3ltYm9sc0J5TGV0dGVyLmhhcyhmaXJzdExldHRlcikpIHN5bWJvbHNCeUxldHRlci5zZXQoZmlyc3RMZXR0ZXIsIFtdKVxuICAgICAgICAgIHN5bWJvbHNCeUxldHRlci5nZXQoZmlyc3RMZXR0ZXIpLnB1c2goc3ltYm9sKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5ld0xpbmVzLnB1c2goc3ltYm9sc0J5TGV0dGVyKVxuICAgIH1cblxuICAgIHRoaXMubGluZXNGb3JCdWZmZXIoZWRpdG9yLmdldEJ1ZmZlcigpKS5zcGxpY2Uoc3RhcnQucm93LCBvbGRFeHRlbnQucm93ICsgMSwgLi4ubmV3TGluZXMpXG4gIH1cblxuICBsaW5lc0ZvckJ1ZmZlcnMgKGJ1ZmZlcnMpIHtcbiAgICBidWZmZXJzID0gYnVmZmVycyB8fCBBcnJheS5mcm9tKHRoaXMubGluZXNCeUJ1ZmZlci5rZXlzKCkpXG4gICAgcmV0dXJuIGJ1ZmZlcnMubWFwKGJ1ZmZlciA9PiB0aGlzLmxpbmVzRm9yQnVmZmVyKGJ1ZmZlcikpXG4gIH1cblxuICBsaW5lc0ZvckJ1ZmZlciAoYnVmZmVyKSB7XG4gICAgaWYgKCF0aGlzLmxpbmVzQnlCdWZmZXIuaGFzKGJ1ZmZlcikpIHtcbiAgICAgIHRoaXMubGluZXNCeUJ1ZmZlci5zZXQoYnVmZmVyLCBbXSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5saW5lc0J5QnVmZmVyLmdldChidWZmZXIpXG4gIH1cblxuICBzZXRVc2VBbHRlcm5hdGVTY29yaW5nICh1c2VBbHRlcm5hdGVTY29yaW5nKSB7XG4gICAgdGhpcy51c2VBbHRlcm5hdGVTY29yaW5nID0gdXNlQWx0ZXJuYXRlU2NvcmluZ1xuICB9XG5cbiAgc2V0VXNlTG9jYWxpdHlCb251cyAodXNlTG9jYWxpdHlCb251cykge1xuICAgIHRoaXMudXNlTG9jYWxpdHlCb251cyA9IHVzZUxvY2FsaXR5Qm9udXNcbiAgfVxuXG4gIHNldFVzZVN0cmljdE1hdGNoaW5nICh1c2VTdHJpY3RNYXRjaGluZykge1xuICAgIHRoaXMudXNlU3RyaWN0TWF0Y2hpbmcgPSB1c2VTdHJpY3RNYXRjaGluZ1xuICB9XG5cbiAgc2NvcmVTeW1ib2wgKHByZWZpeCwgc3ltYm9sLCBjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdykge1xuICAgIGxldCB0ZXh0ID0gc3ltYm9sLnRleHQgfHwgc3ltYm9sLnNuaXBwZXRcbiAgICBpZiAodGhpcy51c2VTdHJpY3RNYXRjaGluZykge1xuICAgICAgcmV0dXJuIHRoaXMuc3RyaWN0TWF0Y2hTY29yZShwcmVmaXgsIHRleHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZ1enp5TWF0Y2hTY29yZShwcmVmaXgsIHRleHQsIGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KVxuICAgIH1cbiAgfVxuXG4gIHN0cmljdE1hdGNoU2NvcmUgKHByZWZpeCwgdGV4dCkge1xuICAgIHJldHVybiB7XG4gICAgICBzY29yZTogdGV4dC5pbmRleE9mKHByZWZpeCkgPT09IDAgPyAxIDogMCxcbiAgICAgIGxvY2FsaXR5U2NvcmU6IDFcbiAgICB9XG4gIH1cblxuICBmdXp6eU1hdGNoU2NvcmUgKHByZWZpeCwgdGV4dCwgY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpIHtcbiAgICBpZiAodGV4dCA9PSBudWxsIHx8IHByZWZpeFswXS50b0xvd2VyQ2FzZSgpICE9PSB0ZXh0WzBdLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIHJldHVybiB7c2NvcmU6IDAsIGxvY2FsaXR5U2NvcmU6IDB9XG4gICAgfVxuXG4gICAgbGV0IGZ1enphbGRyaW5Qcm92aWRlciA9IHRoaXMudXNlQWx0ZXJuYXRlU2NvcmluZyA/IGZ1enphbGRyaW5QbHVzIDogZnV6emFsZHJpblxuICAgIGxldCBzY29yZSA9IGZ1enphbGRyaW5Qcm92aWRlci5zY29yZSh0ZXh0LCBwcmVmaXgsIHRoaXMucHJlZml4Q2FjaGUpXG4gICAgbGV0IGxvY2FsaXR5U2NvcmUgPSB0aGlzLmdldExvY2FsaXR5U2NvcmUoY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpXG4gICAgcmV0dXJuIHtzY29yZSwgbG9jYWxpdHlTY29yZX1cbiAgfVxuXG4gIGdldExvY2FsaXR5U2NvcmUgKGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KSB7XG4gICAgaWYgKCF0aGlzLnVzZUxvY2FsaXR5Qm9udXMpIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgbGV0IHJvd0RpZmZlcmVuY2UgPSBNYXRoLmFicyhzeW1ib2xCdWZmZXJSb3cgLSBjdXJzb3JCdWZmZXJSb3cpXG4gICAgaWYgKHRoaXMudXNlQWx0ZXJuYXRlU2NvcmluZykge1xuICAgICAgLy8gQmV0d2VlbiAxIGFuZCAxICsgc3RyZW5ndGguIChoZXJlIGJldHdlZW4gMS4wIGFuZCAyLjApXG4gICAgICAvLyBBdm9pZCBhIHBvdyBhbmQgYSBicmFuY2hpbmcgbWF4LlxuICAgICAgLy8gMjUgaXMgdGhlIG51bWJlciBvZiByb3cgd2hlcmUgdGhlIGJvbnVzIGlzIDMvNCBmYWRlZCBhd2F5LlxuICAgICAgLy8gc3RyZW5ndGggaXMgdGhlIGZhY3RvciBpbiBmcm9udCBvZiBmYWRlKmZhZGUuIEhlcmUgaXQgaXMgMS4wXG4gICAgICBsZXQgZmFkZSA9IDI1LjAgLyAoMjUuMCArIHJvd0RpZmZlcmVuY2UpXG4gICAgICByZXR1cm4gMS4wICsgZmFkZSAqIGZhZGVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2lsbCBiZSBiZXR3ZWVuIDEgYW5kIH4yLjc1XG4gICAgICByZXR1cm4gMSArIE1hdGgubWF4KC1NYXRoLnBvdyguMiAqIHJvd0RpZmZlcmVuY2UgLSAzLCAzKSAvIDI1ICsgLjUsIDApXG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/symbol-store.js
