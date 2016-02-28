(function() {
  var JapaneseWrap, JapaneseWrapManager;

  JapaneseWrapManager = require('../lib/japanese-wrap-manager');

  JapaneseWrap = require('../lib/japanese-wrap');

  describe("JapaneseWrapManager", function() {
    var jwm;
    jwm = void 0;
    beforeEach(function() {
      var name, subname, subvalue, value, _ref, _results;
      jwm = new JapaneseWrapManager;
      _ref = JapaneseWrap["config"];
      _results = [];
      for (name in _ref) {
        value = _ref[name];
        if (value["type"] === "object") {
          _results.push((function() {
            var _ref1, _results1;
            _ref1 = value["properties"];
            _results1 = [];
            for (subname in _ref1) {
              subvalue = _ref1[subname];
              _results1.push(atom.config.set("japanese-wrap." + name + "." + subname, subvalue["default"]));
            }
            return _results1;
          })());
        } else {
          _results.push(atom.config.set("japanese-wrap." + name, value["default"]));
        }
      }
      return _results;
    });
    describe("JapaneseWrapManager#findeWrapcolumn()", function() {
      it("Engrish", function() {
        var text;
        text = "All your package are belong to us.";
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 13)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 14)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 15)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 16)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 17)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 18)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 19)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 20)).toEqual(21);
        return expect(jwm.findJapaneseWrapColumn(text, 80)).toEqual(void 0);
      });
      it("日本語", function() {
        var text;
        text = "君達のパッケージは、全てGitHubがいただいた。";
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 13)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 14)).toEqual(7);
        expect(jwm.findJapaneseWrapColumn(text, 15)).toEqual(7);
        expect(jwm.findJapaneseWrapColumn(text, 16)).toEqual(8);
        expect(jwm.findJapaneseWrapColumn(text, 17)).toEqual(8);
        expect(jwm.findJapaneseWrapColumn(text, 18)).toEqual(8);
        expect(jwm.findJapaneseWrapColumn(text, 19)).toEqual(8);
        expect(jwm.findJapaneseWrapColumn(text, 20)).toEqual(10);
        expect(jwm.findJapaneseWrapColumn(text, 21)).toEqual(10);
        expect(jwm.findJapaneseWrapColumn(text, 22)).toEqual(11);
        expect(jwm.findJapaneseWrapColumn(text, 23)).toEqual(11);
        expect(jwm.findJapaneseWrapColumn(text, 24)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 25)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 26)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 27)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 28)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 29)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 30)).toEqual(18);
        expect(jwm.findJapaneseWrapColumn(text, 31)).toEqual(18);
        expect(jwm.findJapaneseWrapColumn(text, 32)).toEqual(19);
        return expect(jwm.findJapaneseWrapColumn(text, 80)).toEqual(void 0);
      });
      it("1倍幅サロゲートペア", function() {
        var text;
        text = "𠮷田の𠮷は土に口です。";
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(3);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(3);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(7);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(7);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(8);
        expect(jwm.findJapaneseWrapColumn(text, 13)).toEqual(8);
        return expect(jwm.findJapaneseWrapColumn(text, 80)).toEqual(void 0);
      });
      it("行頭禁止", function() {
        var char, list, _i, _j, _k, _len, _len1, _len2, _results;
        list = ["、", "。", "，", "．", "：", "；", "］", "）", "｝", "！", "？", "」", "〜", "ァ"];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          char = list[_i];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(1);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(1);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 8)).toEqual(4);
        }
        list = [".", ",", ":", ";", "]", ")", "}", "!", "?"];
        for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
          char = list[_j];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4);
        }
        list = ["､", "｡", "｣", "･", "ｰ", "ｧ"];
        _results = [];
        for (_k = 0, _len2 = list.length; _k < _len2; _k++) {
          char = list[_k];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(1);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          _results.push(expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4));
        }
        return _results;
      });
      it("行末禁止", function() {
        var char, list, _i, _j, _k, _len, _len1, _len2, _results;
        list = ["［", "（", "｛", "「"];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          char = list[_i];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 8)).toEqual(4);
        }
        list = ["[", "(", "{"];
        for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
          char = list[_j];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4);
        }
        list = ["｢"];
        _results = [];
        for (_k = 0, _len2 = list.length; _k < _len2; _k++) {
          char = list[_k];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(2);
          _results.push(expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4));
        }
        return _results;
      });
      it("複雑な組み合わせ: 空白の後の行頭禁止", function() {
        var text;
        text = "前文  」空白の後の行頭禁止";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(6);
        return expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(7);
      });
      it("複雑な組み合わせ: 行末禁止の後の空白", function() {
        var text;
        text = "前文「  行末禁止の後の空白";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(6);
        return expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(7);
      });
      it("複雑な組み合わせ: 囲まれた空白", function() {
        var text;
        text = "前文「    」囲まれた空白";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(2);
        return expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(8);
      });
      it("複雑な組み合わせ: 囲まれた単語", function() {
        var text;
        text = "前文「word」囲まれた単語";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(2);
        return expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(8);
      });
      it("複雑な組み合わせ: 始まり括弧の連続", function() {
        var text;
        text = "前文「「「「始まり括弧の連続";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 13)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 14)).toEqual(7);
        return expect(jwm.findJapaneseWrapColumn(text, 15)).toEqual(7);
      });
      it("複雑な組み合わせ: 終わり括弧の連続", function() {
        var text;
        text = "前文」」」」括弧の連続";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 13)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 14)).toEqual(7);
        return expect(jwm.findJapaneseWrapColumn(text, 15)).toEqual(7);
      });
      it("複雑な組み合わせ: 括弧の連続", function() {
        var text;
        text = "前文「」「」括弧の連続";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 7)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 9)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 14)).toEqual(7);
        return expect(jwm.findJapaneseWrapColumn(text, 15)).toEqual(7);
      });
      return it("強制切断", function() {
        var text;
        text = "abcdefghijklmnopqrstvwxyz0123456789";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(3);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(6);
        text = "「「「「「「「「「「「「「「「「「「";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(3);
        text = "」」」」」」」」」」」」」」」」」」」";
        expect(jwm.findJapaneseWrapColumn(text, 2)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 3)).toEqual(1);
        expect(jwm.findJapaneseWrapColumn(text, 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn(text, 5)).toEqual(2);
        return expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(3);
      });
    });
    describe("japanese-wrap.lineBreakingRule.ideographicSpaceAsWihteSpace", function() {
      it("default", function() {
        var text;
        text = "あいう　　あいう";
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(3);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(5);
        return expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(6);
      });
      it("true", function() {
        var text;
        atom.config.set('japanese-wrap.lineBreakingRule.ideographicSpaceAsWihteSpace', true);
        text = "あいう　　あいう";
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(5);
        return expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(6);
      });
      return it("false", function() {
        var text;
        atom.config.set('japanese-wrap.lineBreakingRule.ideographicSpaceAsWihteSpace', false);
        text = "あいう　　あいう";
        expect(jwm.findJapaneseWrapColumn(text, 6)).toEqual(3);
        expect(jwm.findJapaneseWrapColumn(text, 8)).toEqual(4);
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(5);
        return expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(6);
      });
    });
    describe("japanese-wrap.lineBreakingRule.halfwidthKatakana", function() {
      it("default", function() {
        var char, list, _i, _j, _len, _len1, _results;
        list = ["､", "｡", "｣", "･", "ｰ", "ｧ"];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          char = list[_i];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(1);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4);
        }
        list = ["｢"];
        _results = [];
        for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
          char = list[_j];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(2);
          _results.push(expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4));
        }
        return _results;
      });
      it("true", function() {
        var char, list, _i, _j, _len, _len1, _results;
        atom.config.set('japanese-wrap.lineBreakingRule.halfwidthKatakana', true);
        list = ["､", "｡", "｣", "･", "ｰ", "ｧ"];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          char = list[_i];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(1);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4);
        }
        list = ["｢"];
        _results = [];
        for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
          char = list[_j];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(2);
          _results.push(expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4));
        }
        return _results;
      });
      return it("false", function() {
        var char, list, _i, _j, _len, _len1, _results;
        atom.config.set('japanese-wrap.lineBreakingRule.halfwidthKatakana', false);
        list = ["､", "｡", "｣", "･", "ｰ", "ｧ"];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          char = list[_i];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4);
        }
        list = ["｢"];
        _results = [];
        for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
          char = list[_j];
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 4)).toEqual(2);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 5)).toEqual(3);
          expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 6)).toEqual(3);
          _results.push(expect(jwm.findJapaneseWrapColumn("前文" + char + "後文", 7)).toEqual(4));
        }
        return _results;
      });
    });
    describe("japanese-wrap.characterWidth.greekAndCoptic", function() {
      it("default", function() {
        expect(jwm.findJapaneseWrapColumn("前文α後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文α後文", 7)).toEqual(3);
      });
      it("0", function() {
        atom.config.set('japanese-wrap.characterWidth.greekAndCoptic', 0);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文α後文", 7)).toEqual(3);
      });
      it("1", function() {
        atom.config.set('japanese-wrap.characterWidth.greekAndCoptic', 1);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 5)).toEqual(3);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文α後文", 7)).toEqual(4);
      });
      it("2", function() {
        atom.config.set('japanese-wrap.characterWidth.greekAndCoptic', 2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文α後文", 7)).toEqual(3);
      });
      return it("3", function() {
        atom.config.set('japanese-wrap.characterWidth.greekAndCoptic', 3);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文α後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文α後文", 7)).toEqual(3);
      });
    });
    describe("japanese-wrap.characterWidth.cyrillic", function() {
      it("default", function() {
        expect(jwm.findJapaneseWrapColumn("前文д後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文д後文", 7)).toEqual(3);
      });
      it("0", function() {
        atom.config.set('japanese-wrap.characterWidth.cyrillic', 0);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文д後文", 7)).toEqual(3);
      });
      it("1", function() {
        atom.config.set('japanese-wrap.characterWidth.cyrillic', 1);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 5)).toEqual(3);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文д後文", 7)).toEqual(4);
      });
      it("2", function() {
        atom.config.set('japanese-wrap.characterWidth.cyrillic', 2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文д後文", 7)).toEqual(3);
      });
      return it("3", function() {
        atom.config.set('japanese-wrap.characterWidth.cyrillic', 3);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 4)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 5)).toEqual(2);
        expect(jwm.findJapaneseWrapColumn("前文д後文", 6)).toEqual(3);
        return expect(jwm.findJapaneseWrapColumn("前文д後文", 7)).toEqual(3);
      });
    });
    describe("japanese-wrap.lineBreakingRule.japanese", function() {
      it("Engrish not lbrj", function() {
        var text;
        atom.config.set('japanese-wrap.lineBreakingRule.japanese', false);
        text = "All your package are belong to us.";
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 13)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 14)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 15)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 16)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 17)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 18)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 19)).toEqual(17);
        expect(jwm.findJapaneseWrapColumn(text, 20)).toEqual(21);
        return expect(jwm.findJapaneseWrapColumn(text, 80)).toEqual(void 0);
      });
      return it("日本語 not lbrj", function() {
        var text;
        atom.config.set('japanese-wrap.lineBreakingRule.japanese', false);
        text = "君達のパッケージは、全てGitHubがいただいた。";
        expect(jwm.findJapaneseWrapColumn(text, 10)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 11)).toEqual(5);
        expect(jwm.findJapaneseWrapColumn(text, 12)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 13)).toEqual(6);
        expect(jwm.findJapaneseWrapColumn(text, 14)).toEqual(7);
        expect(jwm.findJapaneseWrapColumn(text, 15)).toEqual(7);
        expect(jwm.findJapaneseWrapColumn(text, 16)).toEqual(8);
        expect(jwm.findJapaneseWrapColumn(text, 17)).toEqual(8);
        expect(jwm.findJapaneseWrapColumn(text, 18)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 19)).toEqual(9);
        expect(jwm.findJapaneseWrapColumn(text, 20)).toEqual(10);
        expect(jwm.findJapaneseWrapColumn(text, 21)).toEqual(10);
        expect(jwm.findJapaneseWrapColumn(text, 22)).toEqual(11);
        expect(jwm.findJapaneseWrapColumn(text, 23)).toEqual(11);
        expect(jwm.findJapaneseWrapColumn(text, 24)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 25)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 26)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 27)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 28)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 29)).toEqual(12);
        expect(jwm.findJapaneseWrapColumn(text, 30)).toEqual(18);
        expect(jwm.findJapaneseWrapColumn(text, 31)).toEqual(18);
        expect(jwm.findJapaneseWrapColumn(text, 32)).toEqual(19);
        return expect(jwm.findJapaneseWrapColumn(text, 80)).toEqual(void 0);
      });
    });
    return describe("issues 5", function() {
      it("  ・", function() {
        var text;
        text = "  ・";
        expect(jwm.findJapaneseWrapColumn(text, -1)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0.9)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, null)).toEqual(void 0);
        return expect(jwm.findJapaneseWrapColumn(text, void 0)).toEqual(void 0);
      });
      it("  」", function() {
        var text;
        text = "  ・";
        expect(jwm.findJapaneseWrapColumn(text, -1)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0.9)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, null)).toEqual(void 0);
        return expect(jwm.findJapaneseWrapColumn(text, void 0)).toEqual(void 0);
      });
      it("\t・", function() {
        var text;
        text = "\t・";
        expect(jwm.findJapaneseWrapColumn(text, -1)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0.9)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, null)).toEqual(void 0);
        return expect(jwm.findJapaneseWrapColumn(text, void 0)).toEqual(void 0);
      });
      it("  ・ not lprj", function() {
        var text;
        atom.config.set('japanese-wrap.lineBreakingRule.japanese', false);
        text = "  ・";
        expect(jwm.findJapaneseWrapColumn(text, -1)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0.9)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, null)).toEqual(void 0);
        return expect(jwm.findJapaneseWrapColumn(text, void 0)).toEqual(void 0);
      });
      it("  」 not lprj", function() {
        var text;
        atom.config.set('japanese-wrap.lineBreakingRule.japanese', false);
        text = "  ・";
        expect(jwm.findJapaneseWrapColumn(text, -1)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0.9)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, null)).toEqual(void 0);
        return expect(jwm.findJapaneseWrapColumn(text, void 0)).toEqual(void 0);
      });
      return it("\t・ not lprj", function() {
        var text;
        atom.config.set('japanese-wrap.lineBreakingRule.japanese', false);
        text = "\t・";
        expect(jwm.findJapaneseWrapColumn(text, -1)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, 0.9)).toEqual(void 0);
        expect(jwm.findJapaneseWrapColumn(text, null)).toEqual(void 0);
        return expect(jwm.findJapaneseWrapColumn(text, void 0)).toEqual(void 0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qYXBhbmVzZS13cmFwL3NwZWMvamFwYW5lc2Utd3JhcC1tYW5hZ2VyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDhCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsUUFBQSxHQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sTUFBTixDQUFBO0FBQUEsSUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSw4Q0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLEdBQUEsQ0FBQSxtQkFBTixDQUFBO0FBR0E7QUFBQTtXQUFBLFlBQUE7MkJBQUE7QUFDRSxRQUFBLElBQUcsS0FBTSxDQUFBLE1BQUEsQ0FBTixLQUFpQixRQUFwQjs7O0FBQ0U7QUFBQTtpQkFBQSxnQkFBQTt3Q0FBQTtBQUNFLDZCQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQkFBQSxHQUFtQixJQUFuQixHQUEwQixHQUExQixHQUFnQyxPQUFoRCxFQUNJLFFBQVMsQ0FBQSxTQUFBLENBRGIsRUFBQSxDQURGO0FBQUE7O2dCQURGO1NBQUEsTUFBQTt3QkFLRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0JBQUEsR0FBbUIsSUFBbkMsRUFBeUMsS0FBTSxDQUFBLFNBQUEsQ0FBL0MsR0FMRjtTQURGO0FBQUE7c0JBSlM7SUFBQSxDQUFYLENBREEsQ0FBQTtBQUFBLElBY0EsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUEsR0FBQTtB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

//# sourceURL=/Users/igawataiichi/.atom/packages/japanese-wrap/spec/japanese-wrap-manager-spec.coffee
