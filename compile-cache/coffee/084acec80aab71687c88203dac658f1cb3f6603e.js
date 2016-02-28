(function() {
  var CharacterRegexpUtil, JapaneseWrapManager, UnicodeUtil;

  UnicodeUtil = require("./unicode-util");

  CharacterRegexpUtil = require("./character-regexp-util");

  module.exports = JapaneseWrapManager = (function() {
    JapaneseWrapManager.characterClasses = require("./character-classes");

    function JapaneseWrapManager() {
      var configName, configNameList, name, _i, _len;
      this.setupCharRegexp();
      configNameList = ['characterWidth.greekAndCoptic', 'characterWidth.cyrillic', 'lineBreakingRule.halfwidthKatakana', 'lineBreakingRule.ideographicSpaceAsWihteSpace'];
      for (_i = 0, _len = configNameList.length; _i < _len; _i++) {
        name = configNameList[_i];
        configName = 'japanese-wrap.' + name;
        atom.config.observe(configName, (function(_this) {
          return function(newValue) {
            return _this.setupCharRegexp();
          };
        })(this));
      }
      this.lineBreakingRuleJapanese = atom.config.get('japanese-wrap.lineBreakingRule.japanese');
      atom.config.observe('japanese-wrap.lineBreakingRule.japanese', (function(_this) {
        return function(newValue) {
          return _this.lineBreakingRuleJapanese = newValue;
        };
      })(this));
    }

    JapaneseWrapManager.prototype.setupCharRegexp = function() {
      var cyrillic_size, greek_size, halfWidthCharList, hankaku, notEndingCharList, notStartingCharList;
      if (atom.config.get('japanese-wrap.lineBreakingRule.ideographicSpaceAsWihteSpace')) {
        this.whitespaceCharRegexp = /\s/;
      } else {
        this.whitespaceCharRegexp = /[\t\n\v\f\r \u00a0\u2000-\u200b\u2028\u2029]/;
      }
      hankaku = atom.config.get('japanese-wrap.lineBreakingRule.halfwidthKatakana');
      greek_size = atom.config.get('japanese-wrap.characterWidth.greekAndCoptic');
      cyrillic_size = atom.config.get('japanese-wrap.characterWidth.cyrillic');
      this.wordCharRegexp = CharacterRegexpUtil.string2regexp(JapaneseWrapManager.characterClasses["Western characters"]);
      notStartingCharList = [JapaneseWrapManager.characterClasses["Closing brackets"], JapaneseWrapManager.characterClasses["Hyphens"], JapaneseWrapManager.characterClasses["Dividing punctuation marks"], JapaneseWrapManager.characterClasses["Middle dots"], JapaneseWrapManager.characterClasses["Full stops"], JapaneseWrapManager.characterClasses["Commas"], JapaneseWrapManager.characterClasses["Iteration marks"], JapaneseWrapManager.characterClasses["Prolonged sound mark"], JapaneseWrapManager.characterClasses["Small kana"], CharacterRegexpUtil.range2string(UnicodeUtil.lowSurrogateRange)];
      if (hankaku) {
        notStartingCharList.push(JapaneseWrapManager.characterClasses["Closing brackets HANKAKU"], JapaneseWrapManager.characterClasses["Middle dots HANKAKU"], JapaneseWrapManager.characterClasses["Full stops HANKAKU"], JapaneseWrapManager.characterClasses["Commas HANKAKU"], JapaneseWrapManager.characterClasses["Prolonged sound mark HANKAKU"], JapaneseWrapManager.characterClasses["Small kana HANKAKU"]);
      }
      this.notStartingCharRexgep = CharacterRegexpUtil.string2regexp.apply(CharacterRegexpUtil, notStartingCharList);
      notEndingCharList = [JapaneseWrapManager.characterClasses["Opening brackets"], CharacterRegexpUtil.range2string(UnicodeUtil.highSurrogateRange)];
      if (hankaku) {
        notEndingCharList.push(JapaneseWrapManager.characterClasses["Opening brackets HANKAKU"]);
      }
      this.notEndingCharRegexp = CharacterRegexpUtil.string2regexp.apply(CharacterRegexpUtil, notEndingCharList);
      this.zeroWidthCharRegexp = CharacterRegexpUtil.string2regexp("\\u200B-\\u200F", CharacterRegexpUtil.range2string(UnicodeUtil.lowSurrogateRange), "\\uFEFF", CharacterRegexpUtil.range2string.apply(CharacterRegexpUtil, UnicodeUtil.getRangeListByName("Combining")), "゙゚");
      halfWidthCharList = [CharacterRegexpUtil.range2string.apply(CharacterRegexpUtil, UnicodeUtil.getRangeListByName("Latin")), "\\u2000-\\u200A", "\\u2122", "\\uFF61-\\uFFDC"];
      if (greek_size === 1) {
        halfWidthCharList.push(CharacterRegexpUtil.range2string.apply(CharacterRegexpUtil, UnicodeUtil.getRangeListByName("Greek")));
      }
      if (cyrillic_size === 1) {
        halfWidthCharList.push(CharacterRegexpUtil.range2string.apply(CharacterRegexpUtil, UnicodeUtil.getRangeListByName("Cyrillic")));
      }
      return this.halfWidthCharRegexp = CharacterRegexpUtil.string2regexp.apply(CharacterRegexpUtil, halfWidthCharList);
    };

    JapaneseWrapManager.prototype.overwriteFindWrapColumn = function(displayBuffer) {
      var firstTokenizedLine, tokenizedLineClass;
      firstTokenizedLine = displayBuffer.tokenizedBuffer.tokenizedLineForRow(0);
      if (firstTokenizedLine == null) {
        console.log("displayBuffer has no line.");
        return;
      }
      tokenizedLineClass = firstTokenizedLine.__proto__;
      if (tokenizedLineClass.japaneseWrapManager == null) {
        tokenizedLineClass.japaneseWrapManager = this;
        tokenizedLineClass.originalFindWrapColumn = tokenizedLineClass.findWrapColumn;
        return tokenizedLineClass.findWrapColumn = function(maxColumn) {
          if (!((this.text.length * 2) > maxColumn)) {
            return;
          }
          return this.japaneseWrapManager.findJapaneseWrapColumn(this.text, maxColumn);
        };
      }
    };

    JapaneseWrapManager.prototype.restoreFindWrapColumn = function(displayBuffer) {
      var firstTokenizedLine, tokenizedLineClass;
      firstTokenizedLine = displayBuffer.tokenizedBuffer.tokenizedLineForRow(0);
      if (firstTokenizedLine == null) {
        console.log("displayBuffer has no line.");
        return;
      }
      tokenizedLineClass = firstTokenizedLine.__proto__;
      if (tokenizedLineClass.japaneseWrapManager != null) {
        tokenizedLineClass.findWrapColumn = tokenizedLineClass.originalFindWrapColumn;
        tokenizedLineClass.originalFindWrapColumn = void 0;
        return tokenizedLineClass.japaneseWrapManager = void 0;
      }
    };

    JapaneseWrapManager.prototype.findJapaneseWrapColumn = function(line, softWrapColumn) {
      var column, cutable, size, wrapColumn, _i, _j, _k, _ref, _ref1;
      if (!(softWrapColumn != null) || softWrapColumn < 1) {
        return;
      }
      size = 0;
      for (wrapColumn = _i = 0, _ref = line.length; 0 <= _ref ? _i < _ref : _i > _ref; wrapColumn = 0 <= _ref ? ++_i : --_i) {
        if (this.zeroWidthCharRegexp.test(line[wrapColumn])) {
          continue;
        } else if (this.halfWidthCharRegexp.test(line[wrapColumn])) {
          size = size + 1;
        } else {
          size = size + 2;
        }
        if (size > softWrapColumn) {
          if (this.lineBreakingRuleJapanese) {
            column = this.searchBackwardNotEndingColumn(line, wrapColumn);
            if (column != null) {
              return column;
            }
            column = this.searchForwardWhitespaceCutableColumn(line, wrapColumn);
            if (column == null) {
              cutable = false;
            } else if (column === wrapColumn) {
              cutable = true;
            } else {
              return column;
            }
            return this.searchBackwardCutableColumn(line, wrapColumn, cutable, this.wordCharRegexp.test(line[wrapColumn]));
          } else {
            if (this.wordCharRegexp.test(line[wrapColumn])) {
              for (column = _j = wrapColumn; wrapColumn <= 0 ? _j <= 0 : _j >= 0; column = wrapColumn <= 0 ? ++_j : --_j) {
                if (!this.wordCharRegexp.test(line[column])) {
                  return column + 1;
                }
              }
              return wrapColumn;
            } else {
              for (column = _k = wrapColumn, _ref1 = line.length; wrapColumn <= _ref1 ? _k <= _ref1 : _k >= _ref1; column = wrapColumn <= _ref1 ? ++_k : --_k) {
                if (!this.whitespaceCharRegexp.test(line[column])) {
                  return column;
                }
              }
              return line.length;
            }
          }
        }
      }
    };

    JapaneseWrapManager.prototype.searchBackwardNotEndingColumn = function(line, wrapColumn) {
      var column, foundNotEndingColumn, _i, _ref;
      foundNotEndingColumn = null;
      for (column = _i = _ref = wrapColumn - 1; _ref <= 0 ? _i <= 0 : _i >= 0; column = _ref <= 0 ? ++_i : --_i) {
        if (this.whitespaceCharRegexp.test(line[column])) {
          continue;
        } else if (this.notEndingCharRegexp.test(line[column])) {
          foundNotEndingColumn = column;
        } else {
          return foundNotEndingColumn;
        }
      }
    };

    JapaneseWrapManager.prototype.searchForwardWhitespaceCutableColumn = function(line, wrapColumn) {
      var column, _i, _ref;
      for (column = _i = wrapColumn, _ref = line.length; wrapColumn <= _ref ? _i < _ref : _i > _ref; column = wrapColumn <= _ref ? ++_i : --_i) {
        if (!this.whitespaceCharRegexp.test(line[column])) {
          if (this.notStartingCharRexgep.test(line[column])) {
            return null;
          } else {
            return column;
          }
        }
      }
      return line.length;
    };

    JapaneseWrapManager.prototype.searchBackwardCutableColumn = function(line, wrapColumn, cutable, preWord) {
      var column, preColumn, _i, _ref;
      for (column = _i = _ref = wrapColumn - 1; _ref <= 0 ? _i <= 0 : _i >= 0; column = _ref <= 0 ? ++_i : --_i) {
        if (this.whitespaceCharRegexp.test(line[column])) {
          if (cutable || preWord) {
            preColumn = this.searchBackwardNotEndingColumn(line, column);
            if (preColumn != null) {
              preColumn;
            } else {
              return column + 1;
            }
          }
        } else if (this.notEndingCharRegexp.test(line[column])) {
          cutable = true;
          if (this.wordCharRegexp.test(line[column])) {
            preWord = true;
          } else {
            preWord = false;
          }
        } else if (this.notStartingCharRexgep.test(line[column])) {
          if (cutable || preWord) {
            return column + 1;
          } else {
            cutable = false;
            if (this.wordCharRegexp.test(line[column])) {
              preWord = true;
            } else {
              preWord = false;
            }
          }
        } else if (this.wordCharRegexp.test(line[column])) {
          if ((!preWord) && cutable) {
            return column + 1;
          } else {
            preWord = true;
          }
        } else {
          if (cutable || preWord) {
            return column + 1;
          } else {
            cutable = true;
            preWord = false;
          }
        }
      }
      return wrapColumn;
    };

    return JapaneseWrapManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qYXBhbmVzZS13cmFwL2xpYi9qYXBhbmVzZS13cmFwLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVIsQ0FEdEIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLG1CQUFDLENBQUEsZ0JBQUQsR0FBb0IsT0FBQSxDQUFRLHFCQUFSLENBQXBCLENBQUE7O0FBRWEsSUFBQSw2QkFBQSxHQUFBO0FBQ1gsVUFBQSwwQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUVBLGNBQUEsR0FBaUIsQ0FLZiwrQkFMZSxFQU1mLHlCQU5lLEVBUWYsb0NBUmUsRUFTZiwrQ0FUZSxDQUZqQixDQUFBO0FBYUEsV0FBQSxxREFBQTtrQ0FBQTtBQUNFLFFBQUEsVUFBQSxHQUFhLGdCQUFBLEdBQW1CLElBQWhDLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixVQUFwQixFQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsUUFBRCxHQUFBO21CQUM5QixLQUFDLENBQUEsZUFBRCxDQUFBLEVBRDhCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEMsQ0FEQSxDQURGO0FBQUEsT0FiQTtBQUFBLE1BaUJBLElBQUMsQ0FBQSx3QkFBRCxHQUNJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5Q0FBaEIsQ0FsQkosQ0FBQTtBQUFBLE1BbUJBLElB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

//# sourceURL=/Users/igawataiichi/.atom/packages/japanese-wrap/lib/japanese-wrap-manager.coffee
