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

var _underscorePlus = require('underscore-plus');

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

      var bufferLines = this.linesForBuffer(editor.getBuffer());
      (0, _underscorePlus.spliceWithArray)(bufferLines, start.row, oldExtent.row + 1, newLines);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3N5bWJvbC1zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzRCQUk4RCxpQkFBaUI7OzBCQUN4RCxZQUFZOzs7OzhCQUNSLGlCQUFpQjs7Ozs4QkFDZCxpQkFBaUI7O0FBUC9DLFdBQVcsQ0FBQTs7QUFFWCxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUE7O0lBT2hCLE1BQU07QUFDRSxXQURSLE1BQU0sQ0FDRyxJQUFJLEVBQUUsTUFBTSxFQUFFOzBCQUR2QixNQUFNOztBQUVSLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLFFBQUksQ0FBQyxVQUFVLEdBQUcseUNBQXNCLE1BQU0sQ0FBQyxDQUFBO0dBQ2hEOztlQUpHLE1BQU07O1dBTVksK0JBQUMsTUFBTSxFQUFFO0FBQzdCLFVBQUksWUFBWSxHQUFHLElBQUksQ0FBQTtBQUN2QixVQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQzVCLFdBQUssSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTsyQkFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQXZDLFNBQVMsZ0JBQVQsU0FBUztZQUFFLFlBQVksZ0JBQVosWUFBWTs7QUFDNUIsWUFBSSxTQUFTLElBQUksSUFBSSxFQUFFLFNBQVE7QUFDL0IsWUFBSSxZQUFZLElBQUksSUFBSSxFQUFFLFlBQVksR0FBRyxDQUFDLENBQUE7QUFDMUMsWUFBSSxZQUFZLEdBQUcsbUJBQW1CLElBQUksNENBQXlCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDOUYsc0JBQVksR0FBRyxJQUFJLENBQUE7QUFDbkIsNkJBQW1CLEdBQUcsWUFBWSxDQUFBO1NBQ25DO09BQ0Y7O0FBRUQsYUFBTyxZQUFZLENBQUE7S0FDcEI7OztTQXBCRyxNQUFNOzs7SUF1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QU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7T0FDdkU7S0FDRjs7O1NBaktrQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiIvVXNlcnMvaWdhd2F0YWlpY2hpLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL2xpYi9zeW1ib2wtc3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IEVNUFRZX0FSUkFZID0gW11cblxuaW1wb3J0IHtzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4sIGJ1aWxkU2NvcGVDaGFpblN0cmluZ30gZnJvbSAnLi9zY29wZS1oZWxwZXJzJ1xuaW1wb3J0IGZ1enphbGRyaW4gZnJvbSAnZnV6emFsZHJpbidcbmltcG9ydCBmdXp6YWxkcmluUGx1cyBmcm9tICdmdXp6YWxkcmluLXBsdXMnXG5pbXBvcnQge3NwbGljZVdpdGhBcnJheX0gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuXG5jbGFzcyBTeW1ib2wge1xuICBjb25zdHJ1Y3RvciAodGV4dCwgc2NvcGVzKSB7XG4gICAgdGhpcy50ZXh0ID0gdGV4dFxuICAgIHRoaXMuc2NvcGVDaGFpbiA9IGJ1aWxkU2NvcGVDaGFpblN0cmluZyhzY29wZXMpXG4gIH1cblxuICBtYXRjaGluZ1R5cGVGb3JDb25maWcgKGNvbmZpZykge1xuICAgIGxldCBtYXRjaGluZ1R5cGUgPSBudWxsXG4gICAgbGV0IGhpZ2hlc3RUeXBlUHJpb3JpdHkgPSAtMVxuICAgIGZvciAobGV0IHR5cGUgb2YgT2JqZWN0LmtleXMoY29uZmlnKSkge1xuICAgICAgbGV0IHtzZWxlY3RvcnMsIHR5cGVQcmlvcml0eX0gPSBjb25maWdbdHlwZV1cbiAgICAgIGlmIChzZWxlY3RvcnMgPT0gbnVsbCkgY29udGludWVcbiAgICAgIGlmICh0eXBlUHJpb3JpdHkgPT0gbnVsbCkgdHlwZVByaW9yaXR5ID0gMFxuICAgICAgaWYgKHR5cGVQcmlvcml0eSA+IGhpZ2hlc3RUeXBlUHJpb3JpdHkgJiYgc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKHNlbGVjdG9ycywgdGhpcy5zY29wZUNoYWluKSkge1xuICAgICAgICBtYXRjaGluZ1R5cGUgPSB0eXBlXG4gICAgICAgIGhpZ2hlc3RUeXBlUHJpb3JpdHkgPSB0eXBlUHJpb3JpdHlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hpbmdUeXBlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ltYm9sU3RvcmUge1xuICBjb25zdHJ1Y3RvciAod29yZFJlZ2V4KSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSB3b3JkUmVnZXhcbiAgICB0aGlzLmxpbmVzQnlCdWZmZXIgPSBuZXcgTWFwXG4gIH1cblxuICBjbGVhciAoYnVmZmVyKSB7XG4gICAgaWYgKGJ1ZmZlcikge1xuICAgICAgdGhpcy5saW5lc0J5QnVmZmVyLmRlbGV0ZShidWZmZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGluZXNCeUJ1ZmZlci5jbGVhcigpXG4gICAgfVxuICB9XG5cbiAgc3ltYm9sc0ZvckNvbmZpZyAoY29uZmlnLCBidWZmZXJzLCBwcmVmaXgsIHdvcmRVbmRlckN1cnNvciwgY3Vyc29yQnVmZmVyUm93LCBudW1iZXJPZkN1cnNvcnMpIHtcbiAgICB0aGlzLnByZWZpeENhY2hlID0gZnV6emFsZHJpblBsdXMucHJlcFF1ZXJ5KHByZWZpeClcblxuICAgIGxldCBmaXJzdExldHRlciA9IHByZWZpeFswXS50b0xvd2VyQ2FzZSgpXG4gICAgbGV0IHN5bWJvbHNCeVdvcmQgPSBuZXcgTWFwKClcbiAgICBsZXQgd29yZE9jY3VycmVuY2VzID0gbmV3IE1hcCgpXG4gICAgZm9yIChsZXQgYnVmZmVyTGluZXMgb2YgdGhpcy5saW5lc0ZvckJ1ZmZlcnMoYnVmZmVycykpIHtcbiAgICAgIGxldCBzeW1ib2xCdWZmZXJSb3cgPSAwXG4gICAgICBmb3IgKGxldCBsaW5lU3ltYm9sc0J5TGV0dGVyIG9mIGJ1ZmZlckxpbmVzKSB7XG4gICAgICAgIGxldCBzeW1ib2xzID0gbGluZVN5bWJvbHNCeUxldHRlci5nZXQoZmlyc3RMZXR0ZXIpIHx8IEVNUFRZX0FSUkFZXG4gICAgICAgIGZvciAobGV0IHN5bWJvbCBvZiBzeW1ib2xzKSB7XG4gICAgICAgICAgd29yZE9jY3VycmVuY2VzLnNldChzeW1ib2wudGV4dCwgKHdvcmRPY2N1cnJlbmNlcy5nZXQoc3ltYm9sLnRleHQpIHx8IDApICsgMSlcblxuICAgICAgICAgIGxldCBzeW1ib2xGb3JXb3JkID0gc3ltYm9sc0J5V29yZC5nZXQoc3ltYm9sLnRleHQpXG4gICAgICAgICAgaWYgKHN5bWJvbEZvcldvcmQgIT0gbnVsbCkge1xuICAgICAgICAgICAgc3ltYm9sRm9yV29yZC5sb2NhbGl0eVNjb3JlID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgIHRoaXMuZ2V0TG9jYWxpdHlTY29yZShjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdyksXG4gICAgICAgICAgICAgIHN5bWJvbEZvcldvcmQubG9jYWxpdHlTY29yZVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0gZWxzZSBpZiAod29yZFVuZGVyQ3Vyc29yID09PSBzeW1ib2wudGV4dCAmJiB3b3JkT2NjdXJyZW5jZXMuZ2V0KHN5bWJvbC50ZXh0KSA8PSBudW1iZXJPZkN1cnNvcnMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCB7c2NvcmUsIGxvY2FsaXR5U2NvcmV9ID0gdGhpcy5zY29yZVN5bWJvbChwcmVmaXgsIHN5bWJvbCwgY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpXG4gICAgICAgICAgICBpZiAoc2NvcmUgPiAwKSB7XG4gICAgICAgICAgICAgIGxldCB0eXBlID0gc3ltYm9sLm1hdGNoaW5nVHlwZUZvckNvbmZpZyhjb25maWcpXG4gICAgICAgICAgICAgIGlmICh0eXBlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzeW1ib2wgPSB7dGV4dDogc3ltYm9sLnRleHQsIHR5cGUsIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXh9XG4gICAgICAgICAgICAgICAgc3ltYm9sc0J5V29yZC5zZXQoc3ltYm9sLnRleHQsIHtzeW1ib2wsIHNjb3JlLCBsb2NhbGl0eVNjb3JlfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN5bWJvbEJ1ZmZlclJvdysrXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHN1Z2dlc3Rpb25zID0gW11cbiAgICBmb3IgKGxldCB0eXBlIG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGxldCBzeW1ib2xzID0gY29uZmlnW3R5cGVdLnN1Z2dlc3Rpb25zIHx8IEVNUFRZX0FSUkFZXG4gICAgICBmb3IgKGxldCBzeW1ib2wgb2Ygc3ltYm9scykge1xuICAgICAgICBsZXQge3Njb3JlfSA9IHRoaXMuc2NvcmVTeW1ib2wocHJlZml4LCBzeW1ib2wsIGN1cnNvckJ1ZmZlclJvdywgTnVtYmVyLk1BWF9WQUxVRSlcbiAgICAgICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICAgIHN5bWJvbC5yZXBsYWNlbWVudFByZWZpeCA9IHByZWZpeFxuICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2goe3N5bWJvbCwgc2NvcmV9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIEFycmF5LmZyb20oc3ltYm9sc0J5V29yZC52YWx1ZXMoKSkuY29uY2F0KHN1Z2dlc3Rpb25zKVxuICB9XG5cbiAgcmVjb21wdXRlU3ltYm9sc0ZvckVkaXRvckluQnVmZmVyUmFuZ2UgKGVkaXRvciwgc3RhcnQsIG9sZEV4dGVudCwgbmV3RXh0ZW50KSB7XG4gICAgbGV0IG5ld0VuZCA9IHN0YXJ0LnJvdyArIG5ld0V4dGVudC5yb3dcbiAgICBsZXQgbmV3TGluZXMgPSBbXVxuICAgIGZvciAodmFyIGJ1ZmZlclJvdyA9IHN0YXJ0LnJvdzsgYnVmZmVyUm93IDw9IG5ld0VuZDsgYnVmZmVyUm93KyspIHtcbiAgICAgIGxldCB0b2tlbml6ZWRMaW5lID0gZWRpdG9yLmRpc3BsYXlCdWZmZXIudG9rZW5pemVkQnVmZmVyLnRva2VuaXplZExpbmVGb3JSb3coYnVmZmVyUm93KVxuICAgICAgaWYgKHRva2VuaXplZExpbmUgPT0gbnVsbCkgY29udGludWVcblxuICAgICAgbGV0IHN5bWJvbHNCeUxldHRlciA9IG5ldyBNYXBcbiAgICAgIGxldCB0b2tlbkl0ZXJhdG9yID0gdG9rZW5pemVkTGluZS5nZXRUb2tlbkl0ZXJhdG9yKClcbiAgICAgIHdoaWxlICh0b2tlbkl0ZXJhdG9yLm5leHQoKSkge1xuICAgICAgICBsZXQgd29yZHNXaXRoaW5Ub2tlbiA9IHRva2VuSXRlcmF0b3IuZ2V0VGV4dCgpLm1hdGNoKHRoaXMud29yZFJlZ2V4KSB8fCBFTVBUWV9BUlJBWVxuICAgICAgICBmb3IgKGxldCB3b3JkV2l0aGluVG9rZW4gb2Ygd29yZHNXaXRoaW5Ub2tlbikge1xuICAgICAgICAgIGxldCBzeW1ib2wgPSBuZXcgU3ltYm9sKHdvcmRXaXRoaW5Ub2tlbiwgdG9rZW5JdGVyYXRvci5nZXRTY29wZXMoKSlcbiAgICAgICAgICBsZXQgZmlyc3RMZXR0ZXIgPSBzeW1ib2wudGV4dFswXS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgaWYgKCFzeW1ib2xzQnlMZXR0ZXIuaGFzKGZpcnN0TGV0dGVyKSkgc3ltYm9sc0J5TGV0dGVyLnNldChmaXJzdExldHRlciwgW10pXG4gICAgICAgICAgc3ltYm9sc0J5TGV0dGVyLmdldChmaXJzdExldHRlcikucHVzaChzeW1ib2wpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbmV3TGluZXMucHVzaChzeW1ib2xzQnlMZXR0ZXIpXG4gICAgfVxuXG4gICAgbGV0IGJ1ZmZlckxpbmVzID0gdGhpcy5saW5lc0ZvckJ1ZmZlcihlZGl0b3IuZ2V0QnVmZmVyKCkpXG4gICAgc3BsaWNlV2l0aEFycmF5KGJ1ZmZlckxpbmVzLCBzdGFydC5yb3csIG9sZEV4dGVudC5yb3cgKyAxLCBuZXdMaW5lcylcbiAgfVxuXG4gIGxpbmVzRm9yQnVmZmVycyAoYnVmZmVycykge1xuICAgIGJ1ZmZlcnMgPSBidWZmZXJzIHx8IEFycmF5LmZyb20odGhpcy5saW5lc0J5QnVmZmVyLmtleXMoKSlcbiAgICByZXR1cm4gYnVmZmVycy5tYXAoYnVmZmVyID0+IHRoaXMubGluZXNGb3JCdWZmZXIoYnVmZmVyKSlcbiAgfVxuXG4gIGxpbmVzRm9yQnVmZmVyIChidWZmZXIpIHtcbiAgICBpZiAoIXRoaXMubGluZXNCeUJ1ZmZlci5oYXMoYnVmZmVyKSkge1xuICAgICAgdGhpcy5saW5lc0J5QnVmZmVyLnNldChidWZmZXIsIFtdKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxpbmVzQnlCdWZmZXIuZ2V0KGJ1ZmZlcilcbiAgfVxuXG4gIHNldFVzZUFsdGVybmF0ZVNjb3JpbmcgKHVzZUFsdGVybmF0ZVNjb3JpbmcpIHtcbiAgICB0aGlzLnVzZUFsdGVybmF0ZVNjb3JpbmcgPSB1c2VBbHRlcm5hdGVTY29yaW5nXG4gIH1cblxuICBzZXRVc2VMb2NhbGl0eUJvbnVzICh1c2VMb2NhbGl0eUJvbnVzKSB7XG4gICAgdGhpcy51c2VMb2NhbGl0eUJvbnVzID0gdXNlTG9jYWxpdHlCb251c1xuICB9XG5cbiAgc2V0VXNlU3RyaWN0TWF0Y2hpbmcgKHVzZVN0cmljdE1hdGNoaW5nKSB7XG4gICAgdGhpcy51c2VTdHJpY3RNYXRjaGluZyA9IHVzZVN0cmljdE1hdGNoaW5nXG4gIH1cblxuICBzY29yZVN5bWJvbCAocHJlZml4LCBzeW1ib2wsIGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KSB7XG4gICAgbGV0IHRleHQgPSBzeW1ib2wudGV4dCB8fCBzeW1ib2wuc25pcHBldFxuICAgIGlmICh0aGlzLnVzZVN0cmljdE1hdGNoaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdHJpY3RNYXRjaFNjb3JlKHByZWZpeCwgdGV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZnV6enlNYXRjaFNjb3JlKHByZWZpeCwgdGV4dCwgY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpXG4gICAgfVxuICB9XG5cbiAgc3RyaWN0TWF0Y2hTY29yZSAocHJlZml4LCB0ZXh0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3JlOiB0ZXh0LmluZGV4T2YocHJlZml4KSA9PT0gMCA/IDEgOiAwLFxuICAgICAgbG9jYWxpdHlTY29yZTogMVxuICAgIH1cbiAgfVxuXG4gIGZ1enp5TWF0Y2hTY29yZSAocHJlZml4LCB0ZXh0LCBjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdykge1xuICAgIGlmICh0ZXh0ID09IG51bGwgfHwgcHJlZml4WzBdLnRvTG93ZXJDYXNlKCkgIT09IHRleHRbMF0udG9Mb3dlckNhc2UoKSkge1xuICAgICAgcmV0dXJuIHtzY29yZTogMCwgbG9jYWxpdHlTY29yZTogMH1cbiAgICB9XG5cbiAgICBsZXQgZnV6emFsZHJpblByb3ZpZGVyID0gdGhpcy51c2VBbHRlcm5hdGVTY29yaW5nID8gZnV6emFsZHJpblBsdXMgOiBmdXp6YWxkcmluXG4gICAgbGV0IHNjb3JlID0gZnV6emFsZHJpblByb3ZpZGVyLnNjb3JlKHRleHQsIHByZWZpeCwgdGhpcy5wcmVmaXhDYWNoZSlcbiAgICBsZXQgbG9jYWxpdHlTY29yZSA9IHRoaXMuZ2V0TG9jYWxpdHlTY29yZShjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdylcbiAgICByZXR1cm4ge3Njb3JlLCBsb2NhbGl0eVNjb3JlfVxuICB9XG5cbiAgZ2V0TG9jYWxpdHlTY29yZSAoY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpIHtcbiAgICBpZiAoIXRoaXMudXNlTG9jYWxpdHlCb251cykge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBsZXQgcm93RGlmZmVyZW5jZSA9IE1hdGguYWJzKHN5bWJvbEJ1ZmZlclJvdyAtIGN1cnNvckJ1ZmZlclJvdylcbiAgICBpZiAodGhpcy51c2VBbHRlcm5hdGVTY29yaW5nKSB7XG4gICAgICAvLyBCZXR3ZWVuIDEgYW5kIDEgKyBzdHJlbmd0aC4gKGhlcmUgYmV0d2VlbiAxLjAgYW5kIDIuMClcbiAgICAgIC8vIEF2b2lkIGEgcG93IGFuZCBhIGJyYW5jaGluZyBtYXguXG4gICAgICAvLyAyNSBpcyB0aGUgbnVtYmVyIG9mIHJvdyB3aGVyZSB0aGUgYm9udXMgaXMgMy80IGZhZGVkIGF3YXkuXG4gICAgICAvLyBzdHJlbmd0aCBpcyB0aGUgZmFjdG9yIGluIGZyb250IG9mIGZhZGUqZmFkZS4gSGVyZSBpdCBpcyAxLjBcbiAgICAgIGxldCBmYWRlID0gMjUuMCAvICgyNS4wICsgcm93RGlmZmVyZW5jZSlcbiAgICAgIHJldHVybiAxLjAgKyBmYWRlICogZmFkZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXaWxsIGJlIGJldHdlZW4gMSBhbmQgfjIuNzVcbiAgICAgIHJldHVybiAxICsgTWF0aC5tYXgoLU1hdGgucG93KC4yICogcm93RGlmZmVyZW5jZSAtIDMsIDMpIC8gMjUgKyAuNSwgMClcbiAgICB9XG4gIH1cbn1cbiJdfQ==