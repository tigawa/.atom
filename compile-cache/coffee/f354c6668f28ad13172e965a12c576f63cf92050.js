(function() {
  var CharacterRegexpUtil;

  CharacterRegexpUtil = require('../lib/character-regexp-util');

  describe("CharacterRegexpUtil", function() {
    describe("CharacterRegexpUtil.range2string()", function() {
      it("range", function() {
        var _i, _j, _k, _l, _results, _results1, _results2, _results3;
        expect(CharacterRegexpUtil.range2string((function() {
          _results = [];
          for (_i = 0x20; _i <= 64; _i++){ _results.push(_i); }
          return _results;
        }).apply(this))).toEqual("\\u0020-\\u0040");
        expect(CharacterRegexpUtil.range2string((function() {
          _results1 = [];
          for (_j = 0x300; _j <= 1536; _j++){ _results1.push(_j); }
          return _results1;
        }).apply(this))).toEqual("\\u0300-\\u0600");
        expect(CharacterRegexpUtil.range2string((function() {
          _results2 = [];
          for (_k = 0x4000; _k <= 32768; _k++){ _results2.push(_k); }
          return _results2;
        }).apply(this))).toEqual("\\u4000-\\u8000");
        return expect(CharacterRegexpUtil.range2string((function() {
          _results3 = [];
          for (_l = 0x12AB; _l <= 13517; _l++){ _results3.push(_l); }
          return _results3;
        }).apply(this))).toEqual("\\u12AB-\\u34CD");
      });
      it("over 0x10000", function() {
        var _i, _j, _k, _l, _results, _results1, _results2, _results3;
        expect(CharacterRegexpUtil.range2string((function() {
          _results = [];
          for (_i = 0x10000; _i <= 1114111; _i++){ _results.push(_i); }
          return _results;
        }).apply(this))).toEqual("\\uD800-\\uDBFF");
        expect(CharacterRegexpUtil.range2string((function() {
          _results1 = [];
          for (_j = 0xFF00; _j <= 131072; _j++){ _results1.push(_j); }
          return _results1;
        }).apply(this))).toEqual("\\uFF00-\\uFFFF\\uD800-\\uD840");
        expect(CharacterRegexpUtil.range2string((function() {
          _results2 = [];
          for (_k = 0x20000; _k <= 1048575; _k++){ _results2.push(_k); }
          return _results2;
        }).apply(this))).toEqual("\\uD840-\\uDBBF");
        return expect(CharacterRegexpUtil.range2string((function() {
          _results3 = [];
          for (_l = 0x100000; _l <= 1114111; _l++){ _results3.push(_l); }
          return _results3;
        }).apply(this))).toEqual("\\uDBC0-\\uDBFF");
      });
      return it("ranges", function() {
        var _i, _j, _k, _l, _m, _n, _results, _results1, _results2, _results3, _results4, _results5;
        expect(CharacterRegexpUtil.range2string((function() {
          _results = [];
          for (_i = 0x20; _i <= 64; _i++){ _results.push(_i); }
          return _results;
        }).apply(this), (function() {
          _results1 = [];
          for (_j = 0x300; _j <= 1536; _j++){ _results1.push(_j); }
          return _results1;
        }).apply(this))).toEqual("\\u0020-\\u0040\\u0300-\\u0600");
        return expect(CharacterRegexpUtil.range2string((function() {
          _results2 = [];
          for (_k = 0x20; _k <= 64; _k++){ _results2.push(_k); }
          return _results2;
        }).apply(this), (function() {
          _results3 = [];
          for (_l = 0x300; _l <= 1536; _l++){ _results3.push(_l); }
          return _results3;
        }).apply(this), (function() {
          _results4 = [];
          for (_m = 0x4000; _m <= 32768; _m++){ _results4.push(_m); }
          return _results4;
        }).apply(this), (function() {
          _results5 = [];
          for (_n = 0x10000; _n <= 1114111; _n++){ _results5.push(_n); }
          return _results5;
        }).apply(this))).toEqual("\\u0020-\\u0040\\u0300-\\u0600\\u4000-\\u8000\\uD800-\\uDBFF");
      });
    });
    describe("CharacterRegexpUtil.range2regexp()", function() {
      it("range", function() {
        var _i, _j, _k, _l, _results, _results1, _results2, _results3;
        expect(CharacterRegexpUtil.range2regexp((function() {
          _results = [];
          for (_i = 0x20; _i <= 64; _i++){ _results.push(_i); }
          return _results;
        }).apply(this))).toEqual(/[\u0020-\u0040]/);
        expect(CharacterRegexpUtil.range2regexp((function() {
          _results1 = [];
          for (_j = 0x300; _j <= 1536; _j++){ _results1.push(_j); }
          return _results1;
        }).apply(this))).toEqual(/[\u0300-\u0600]/);
        expect(CharacterRegexpUtil.range2regexp((function() {
          _results2 = [];
          for (_k = 0x4000; _k <= 32768; _k++){ _results2.push(_k); }
          return _results2;
        }).apply(this))).toEqual(/[\u4000-\u8000]/);
        return expect(CharacterRegexpUtil.range2regexp((function() {
          _results3 = [];
          for (_l = 0x12AB; _l <= 13517; _l++){ _results3.push(_l); }
          return _results3;
        }).apply(this))).toEqual(/[\u12AB-\u34CD]/);
      });
      it("over 0x10000", function() {
        var _i, _results;
        return expect(CharacterRegexpUtil.range2regexp((function() {
          _results = [];
          for (_i = 0x10000; _i <= 1114111; _i++){ _results.push(_i); }
          return _results;
        }).apply(this))).toEqual(/[\uD800-\uDBFF]/);
      });
      return it("ranges", function() {
        var _i, _j, _results, _results1;
        return expect(CharacterRegexpUtil.range2regexp((function() {
          _results = [];
          for (_i = 0x20; _i <= 64; _i++){ _results.push(_i); }
          return _results;
        }).apply(this), (function() {
          _results1 = [];
          for (_j = 0x300; _j <= 1536; _j++){ _results1.push(_j); }
          return _results1;
        }).apply(this))).toEqual(/[\u0020-\u0040\u0300-\u0600]/);
      });
    });
    describe("CharacterRegexpUtil.string2regexp()", function() {
      it("single char", function() {
        expect(CharacterRegexpUtil.string2regexp("a")).toEqual(/[a]/);
        return expect(CharacterRegexpUtil.string2regexp("あ")).toEqual(/[あ]/);
      });
      it("word", function() {
        expect(CharacterRegexpUtil.string2regexp("abc")).toEqual(/[abc]/);
        return expect(CharacterRegexpUtil.string2regexp("あア亜")).toEqual(/[あア亜]/);
      });
      it("char range", function() {
        return expect(CharacterRegexpUtil.string2regexp("a-z")).toEqual(/[a-z]/);
      });
      it("unicode range", function() {
        expect(CharacterRegexpUtil.string2regexp("\\u0020-\\u0040")).toEqual(/[\u0020-\u0040]/);
        expect(CharacterRegexpUtil.string2regexp("\\u0300-\\u0600")).toEqual(/[\u0300-\u0600]/);
        return expect(CharacterRegexpUtil.string2regexp("\\u4000-\\u8000")).toEqual(/[\u4000-\u8000]/);
      });
      it("complex", function() {
        expect(CharacterRegexpUtil.string2regexp("\\u0020-\\u0040abc")).toEqual(/[\u0020-\u0040abc]/);
        return expect(CharacterRegexpUtil.string2regexp("\\u0020-\\u0040a-cあ")).toEqual(/[\u0020-\u0040a-cあ]/);
      });
      return it("multi", function() {
        expect(CharacterRegexpUtil.string2regexp("a", "b")).toEqual(/[ab]/);
        return expect(CharacterRegexpUtil.string2regexp("\\u0020-\\u0040", "a-c", "あ")).toEqual(/[\u0020-\u0040a-cあ]/);
      });
    });
    describe("CharacterRegexpUtil.combineRegexp()", function() {
      it("single", function() {
        expect(CharacterRegexpUtil.combineRegexp(/あ/)).toEqual(/[あ]/);
        expect(CharacterRegexpUtil.combineRegexp(/[あア亜]/)).toEqual(/[あア亜]/);
        return expect(CharacterRegexpUtil.combineRegexp(/[\u0020-\u0040]/)).toEqual(/[\u0020-\u0040]/);
      });
      return it("multi", function() {
        expect(CharacterRegexpUtil.combineRegexp(/a/, /[bc]/)).toEqual(/[abc]/);
        return expect(CharacterRegexpUtil.combineRegexp(/[\u0020-\u0040]/, /[a-c]/, /[あ]/)).toEqual(/[\u0020-\u0040a-cあ]/);
      });
    });
    describe("CharacterRegexpUtil.code2uchar()", function() {
      it("code < 0x1000", function() {
        expect(CharacterRegexpUtil.code2uchar(0x2)).toEqual("\\u0002");
        expect(CharacterRegexpUtil.code2uchar(0x20)).toEqual("\\u0020");
        expect(CharacterRegexpUtil.code2uchar(0x200)).toEqual("\\u0200");
        return expect(CharacterRegexpUtil.code2uchar(0x2000)).toEqual("\\u2000");
      });
      it("code >= 0x1000", function() {
        expect(CharacterRegexpUtil.code2uchar(0x10000)).toEqual("\\uD800");
        expect(CharacterRegexpUtil.code2uchar(0x10001)).toEqual("\\uD800");
        expect(CharacterRegexpUtil.code2uchar(0x10399)).toEqual("\\uD800");
        expect(CharacterRegexpUtil.code2uchar(0x10400)).toEqual("\\uD801");
        expect(CharacterRegexpUtil.code2uchar(0x12000)).toEqual("\\uD808");
        expect(CharacterRegexpUtil.code2uchar(0x102000)).toEqual("\\uDBC8");
        return expect(CharacterRegexpUtil.code2uchar(0x10FFFF)).toEqual("\\uDBFF");
      });
      return it("no code", function() {
        expect(CharacterRegexpUtil.code2uchar(NaN)).toEqual("");
        expect(CharacterRegexpUtil.code2uchar(-1)).toEqual("");
        return expect(CharacterRegexpUtil.code2uchar(0x110000)).toEqual("");
      });
    });
    describe("CharacterRegexpUtil.char2uchar()", function() {
      it("code < 0x1000", function() {
        expect(CharacterRegexpUtil.char2uchar(" ")).toEqual("\\u0020");
        expect(CharacterRegexpUtil.char2uchar("あ")).toEqual("\\u3042");
        return expect(CharacterRegexpUtil.char2uchar("ｱ")).toEqual("\\uFF71");
      });
      return it("code >= 0x1000", function() {
        return expect(CharacterRegexpUtil.char2uchar("𠮷")).toEqual("\\uD842");
      });
    });
    return describe("CharacterRegexpUtil.escapeAscii()", function() {
      it("single", function() {
        expect(CharacterRegexpUtil.escapeAscii("a")).toEqual("\\u0061");
        expect(CharacterRegexpUtil.escapeAscii("A")).toEqual("\\u0041");
        expect(CharacterRegexpUtil.escapeAscii(" ")).toEqual("\\u0020");
        expect(CharacterRegexpUtil.escapeAscii("!")).toEqual("\\u0021");
        expect(CharacterRegexpUtil.escapeAscii("\\")).toEqual("\\u005C");
        return expect(CharacterRegexpUtil.escapeAscii("*")).toEqual("\\u002A");
      });
      return it("word", function() {
        return expect(CharacterRegexpUtil.escapeAscii("aA ")).toEqual("\\u0061\\u0041\\u0020");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qYXBhbmVzZS13cmFwL3NwZWMvY2hhcmFjdGVyLXJlZ2V4cC11dGlsLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDhCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLElBQUEsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUEsR0FBQTtBQUM3QyxNQUFBLEVBQUEsQ0FBRyxPQUFILEVBQVksU0FBQSxHQUFBO0FBQ1YsWUFBQSx5REFBQTtBQUFBLFFBQUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFlBQXBCLENBQWlDOzs7O3NCQUFqQyxDQUFQLENBQXNELENBQ2xELE9BREosQ0FDWSxpQkFEWixDQUFBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQzs7OztzQkFBakMsQ0FBUCxDQUF3RCxDQUNwRCxPQURKLENBQ1ksaUJBRFosQ0FGQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsWUFBcEIsQ0FBaUM7Ozs7c0JBQWpDLENBQVAsQ0FBMEQsQ0FDdEQsT0FESixDQUNZLGlCQURaLENBSkEsQ0FBQTtlQU1BLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQzs7OztzQkFBakMsQ0FBUCxDQUEwRCxDQUN0RCxPQURKLENBQ1ksaUJBRFosRUFQVTtNQUFBLENBQVosQ0FBQSxDQUFBO0FBQUEsTUFTQSxFQUFBLENBQUcsY0FBSCxFQUFtQixTQUFBLEdBQUE7QUFDakIsWUFBQSx5REFBQTtBQUFBLFFBQUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFlBQXBCLENBQWlDOzs7O3NCQUFqQyxDQUFQLENBQTZELENBQ3pELE9BREosQ0FDWSxpQkFEWixDQUFBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQzs7OztzQkFBakMsQ0FBUCxDQUEyRCxDQUN2RCxPQURKLENBQ1ksZ0NBRFosQ0FGQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsWUFBcEIsQ0FBaUM7Ozs7c0JBQWpDLENBQVAsQ0FBNEQsQ0FDeEQsT0FESixDQUNZLGlCQURaLENBSkEsQ0FBQTtlQU1BLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQzs7OztzQkFBakMsQ0FBUCxDQUE4RCxDQUMxRCxPQURKLENBQ1ksaUJBRFosRUFQaUI7TUFBQSxDQUFuQixDQVRBLENBQUE7YUFrQkEsRUFBQSxDQUFHLFFBQUgsRUFBYSxTQUFBLEdBQUE7QUFDWCxZQUFBLHVGQUFBO0FBQUEsUUFBQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsWUFBcEIsQ0FDSDs7OztzQkFERyxFQUVIOzs7O3NCQUZHLENBQVAsQ0FFb0IsQ0FDWixPQUhSLENBR2dCLGdDQUhoQixDQUFBLENBQUE7ZUFJQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsWUFBcEIsQ0FDSDs7OztzQkFERyxFQUVIOzs7O3NCQUZHLEVBR0g7Ozs7c0JBSEcsRUFJSDs7OztzQkFKRyxDQUFQLENBSXlCLENBQ2pCLE9BTFIsQ0FLZ0IsOERBTGhCLEVBTFc7TUFBQSxDQUFiLEVBbkI2QztJQUFBLENBQS9DLENBQUEsQ0FBQTtBQUFBLElBK0JBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsTUFBQSxFQUFBLENBQUcsT0FBSCxFQUFZLFNBQUEsR0FBQTtBQUNWLFlBQUEseURBQUE7QUFBQSxRQUFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQzs7OztzQkFBakMsQ0FBUCxDQUFzRCxDQUNsRCxPQURKLENBQ1ksaUJBRFosQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsWUFBcEIsQ0FBaUM7Ozs7c0JBQWpDLENBQVAsQ0FBd0QsQ0FDcEQsT0FESixDQUNZLGlCQURaLENBRkEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFlBQXBCLENBQWlDOzs7O3NCQUFqQyxDQUFQLENBQTBELENBQ3RELE9BREosQ0FDWSxpQkFEWixDQUpBLENBQUE7ZUFNQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsWUFBcEIsQ0FBaUM7Ozs7c0JBQWpDLENBQVAsQ0FBMEQsQ0FDdEQsT0FESixDQUNZLGlCQURaLEVBUFU7TUFBQSxDQUFaLENBQUEsQ0FBQTtBQUFBLE1BU0EsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFlBQUEsWUFBQTtlQUFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQzs7OztzQkFBakMsQ0FBUCxDQUE2RCxDQUN6RCxPQURKLENBQ1ksaUJBRFosRUFEaUI7TUFBQSxDQUFuQixDQVRBLENBQUE7YUFZQSxFQUFBLENBQUcsUUFBSCxFQUFhLFNBQUEsR0FBQTtBQUNYLFlBQUEsMkJBQUE7ZUFBQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsWUFBcEIsQ0FDSDs7OztzQkFERyxFQUVIOzs7O3NCQUZHLENBQVAsQ0FFb0IsQ0FDWixPQUhSLENBR2dCLDhCQUhoQixFQURXO01BQUEsQ0FBYixFQWI2QztJQUFBLENBQS9DLENBL0JBLENBQUE7QUFBQSxJQWtEQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLE1BQUEsRUFBQSxDQUFHLGFBQUgsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFFBQUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLGFBQXBCLENBQWtDLEdBQWxDLENBQVAsQ0FBOEMsQ0FDMUMsT0FESixDQUNZLEtBRFosQ0FBQSxDQUFBO2VBRUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLGFBQXBCLENBQWtDLEdBQWxDLENBQVAsQ0FBOEMsQ0FDMUMsT0FESixDQUNZLEtBRFosRUFIZ0I7TUFBQSxDQUFsQixDQUFBLENBQUE7QUFBQSxNQUtBLEVBQUEsQ0FBRyxNQUFILEVBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MsS0FBbEMsQ0FBUCxDQUFnRCxDQUM1QyxPQURKLENBQ1ksT0FEWixDQUFBLENBQUE7ZUFFQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MsS0FBbEMsQ0FBUCxDQUFnRCxDQUM1QyxPQURKLENBQ1ksT0FEWixFQUhTO01BQUEsQ0FBWCxDQUxBLENBQUE7QUFBQSxNQVVBLEVBQUEsQ0FBRyxZQUFILEVBQWlCLFNBQUEsR0FBQTtlQUNmLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxhQUFwQixDQUFrQyxLQUFsQyxDQUFQLENBQWdELENBQzVDLE9BREosQ0FDWSxPQURaLEVBRGU7TUFBQSxDQUFqQixDQVZBLENBQUE7QUFBQSxNQWFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTtBQUNsQixRQUFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxhQUFwQixDQUFrQyxpQkFBbEMsQ0FBUCxDQUE0RCxDQUN4RCxPQURKLENBQ1ksaUJBRFosQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MsaUJBQWxDLENBQVAsQ0FBNEQsQ0FDeEQsT0FESixDQUNZLGlCQURaLENBRkEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxhQUFwQixDQUFrQyxpQkFBbEMsQ0FBUCxDQUE0RCxDQUN4RCxPQURKLENBQ1ksaUJBRFosRUFMa0I7TUFBQSxDQUFwQixDQWJBLENBQUE7QUFBQSxNQW9CQSxFQUFBLENBQUcsU0FBSCxFQUFjLFNBQUEsR0FBQTtBQUNaLFFBQUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLGFBQXBCLENBQWtDLG9CQUFsQyxDQUFQLENBQStELENBQzNELE9BREosQ0FDWSxvQkFEWixDQUFBLENBQUE7ZUFFQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MscUJBQWxDLENBQVAsQ0FBZ0UsQ0FDNUQsT0FESixDQUNZLHFCQURaLEVBSFk7TUFBQSxDQUFkLENBcEJBLENBQUE7YUF5QkEsRUFBQSxDQUFHLE9BQUgsRUFBWSxTQUFBLEdBQUE7QUFDVixRQUFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxhQUFwQixDQUFrQyxHQUFsQyxFQUF1QyxHQUF2QyxDQUFQLENBQW1ELENBQy9DLE9BREosQ0FDWSxNQURaLENBQUEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxhQUFwQixDQUFrQyxpQkFBbEMsRUFBcUQsS0FBckQsRUFBNEQsR0FBNUQsQ0FBUCxDQUF3RSxDQUNwRSxPQURKLENBQ1kscUJBRFosRUFIVTtNQUFBLENBQVosRUExQjhDO0lBQUEsQ0FBaEQsQ0FsREEsQ0FBQTtBQUFBLElBa0ZBLFFBQUEsQ0FBUyxxQ0FBVCxFQUFnRCxTQUFBLEdBQUE7QUFDOUMsTUFBQSxFQUFBLENBQUcsUUFBSCxFQUFhLFNBQUEsR0FBQTtBQUNYLFFBQUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLGFBQXBCLENBQWtDLEdBQWxDLENBQVAsQ0FBOEMsQ0FDMUMsT0FESixDQUNZLEtBRFosQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MsT0FBbEMsQ0FBUCxDQUFrRCxDQUM5QyxPQURKLENBQ1ksT0FEWixDQUZBLENBQUE7ZUFJQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MsaUJBQWxDLENBQVAsQ0FBNEQsQ0FDeEQsT0FESixDQUNZLGlCQURaLEVBTFc7TUFBQSxDQUFiLENBQUEsQ0FBQTthQU9BLEVBQUEsQ0FBRyxPQUFILEVBQVksU0FBQSxHQUFBO0FBQ1YsUUFBQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MsR0FBbEMsRUFBdUMsTUFBdkMsQ0FBUCxDQUFzRCxDQUNsRCxPQURKLENBQ1ksT0FEWixDQUFBLENBQUE7ZUFFQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsYUFBcEIsQ0FBa0MsaUJBQWxDLEVBQXFELE9BQXJELEVBQThELEtBQTlELENBQVAsQ0FBNEUsQ0FDeEUsT0FESixDQUNZLHFCQURaLEVBSFU7TUFBQSxDQUFaLEVBUjhDO0lBQUEsQ0FBaEQsQ0FsRkEsQ0FBQTtBQUFBLElBZ0dBLFFBQUEsQ0FBUyxrQ0FBVCxFQUE2QyxTQUFBLEdBQUE7QUFDM0MsTUFBQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsVUFBcEIsQ0FBK0IsR0FBL0IsQ0FBUCxDQUEyQyxDQUN2QyxPQURKLENBQ1ksU0FEWixDQUFBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxVQUFwQixDQUErQixJQUEvQixDQUFQLENBQTRDLENBQ3hDLE9BREosQ0FDWSxTQURaLENBRkEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLEtBQS9CLENBQVAsQ0FBNkMsQ0FDekMsT0FESixDQUNZLFNBRFosQ0FKQSxDQUFBO2VBTUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLE1BQS9CLENBQVAsQ0FBOEMsQ0FDMUMsT0FESixDQUNZLFNBRFosRUFQa0I7TUFBQSxDQUFwQixDQUFBLENBQUE7QUFBQSxNQVNBLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsVUFBcEIsQ0FBK0IsT0FBL0IsQ0FBUCxDQUErQyxDQUMzQyxPQURKLENBQ1ksU0FEWixDQUFBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxVQUFwQixDQUErQixPQUEvQixDQUFQLENBQStDLENBQzNDLE9BREosQ0FDWSxTQURaLENBRkEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLE9BQS9CLENBQVAsQ0FBK0MsQ0FDM0MsT0FESixDQUNZLFNBRFosQ0FKQSxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsVUFBcEIsQ0FBK0IsT0FBL0IsQ0FBUCxDQUErQyxDQUMzQyxPQURKLENBQ1ksU0FEWixDQU5BLENBQUE7QUFBQSxRQVFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxVQUFwQixDQUErQixPQUEvQixDQUFQLENBQStDLENBQzNDLE9BREosQ0FDWSxTQURaLENBUkEsQ0FBQTtBQUFBLFFBVUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLFFBQS9CLENBQVAsQ0FBZ0QsQ0FDNUMsT0FESixDQUNZLFNBRFosQ0FWQSxDQUFBO2VBWUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLFFBQS9CLENBQVAsQ0FBZ0QsQ0FDNUMsT0FESixDQUNZLFNBRFosRUFibUI7TUFBQSxDQUFyQixDQVRBLENBQUE7YUF3QkEsRUFBQSxDQUFHLFNBQUgsRUFBYyxTQUFBLEdBQUE7QUFDWixRQUFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxVQUFwQixDQUErQixHQUEvQixDQUFQLENBQTJDLENBQ3ZDLE9BREosQ0FDWSxFQURaLENBQUEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLENBQUEsQ0FBL0IsQ0FBUCxDQUEwQyxDQUN0QyxPQURKLENBQ1ksRUFEWixDQUZBLENBQUE7ZUFJQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsVUFBcEIsQ0FBK0IsUUFBL0IsQ0FBUCxDQUFnRCxDQUM1QyxPQURKLENBQ1ksRUFEWixFQUxZO01BQUEsQ0FBZCxFQXpCMkM7SUFBQSxDQUE3QyxDQWhHQSxDQUFBO0FBQUEsSUFpSUEsUUFBQSxDQUFTLGtDQUFULEVBQTZDLFNBQUEsR0FBQTtBQUMzQyxNQUFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTtBQUNsQixRQUFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxVQUFwQixDQUErQixHQUEvQixDQUFQLENBQTJDLENBQ3ZDLE9BREosQ0FDWSxTQURaLENBQUEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLEdBQS9CLENBQVAsQ0FBMkMsQ0FDdkMsT0FESixDQUNZLFNBRFosQ0FGQSxDQUFBO2VBSUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFVBQXBCLENBQStCLEdBQS9CLENBQVAsQ0FBMkMsQ0FDdkMsT0FESixDQUNZLFNBRFosRUFMa0I7TUFBQSxDQUFwQixDQUFBLENBQUE7YUFPQSxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQSxHQUFBO2VBQ25CLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxVQUFwQixDQUErQixJQUEvQixDQUFQLENBQTRDLENBQ3hDLE9BREosQ0FDWSxTQURaLEVBRG1CO01BQUEsQ0FBckIsRUFSMkM7SUFBQSxDQUE3QyxDQWpJQSxDQUFBO1dBNklBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsTUFBQSxFQUFBLENBQUcsUUFBSCxFQUFhLFNBQUEsR0FBQTtBQUNYLFFBQUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFdBQXBCLENBQWdDLEdBQWhDLENBQVAsQ0FBNEMsQ0FDeEMsT0FESixDQUNZLFNBRFosQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsR0FBaEMsQ0FBUCxDQUE0QyxDQUN4QyxPQURKLENBQ1ksU0FEWixDQUZBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxXQUFwQixDQUFnQyxHQUFoQyxDQUFQLENBQTRDLENBQ3hDLE9BREosQ0FDWSxTQURaLENBSkEsQ0FBQTtBQUFBLFFBTUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFdBQXBCLENBQWdDLEdBQWhDLENBQVAsQ0FBNEMsQ0FDeEMsT0FESixDQUNZLFNBRFosQ0FOQSxDQUFBO0FBQUEsUUFRQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsSUFBaEMsQ0FBUCxDQUE2QyxDQUN6QyxPQURKLENBQ1ksU0FEWixDQVJBLENBQUE7ZUFVQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsR0FBaEMsQ0FBUCxDQUE0QyxDQUN4QyxPQURKLENBQ1ksU0FEWixFQVhXO01BQUEsQ0FBYixDQUFBLENBQUE7YUFhQSxFQUFBLENBQUcsTUFBSCxFQUFXLFNBQUEsR0FBQTtlQUNULE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxXQUFwQixDQUFnQyxLQUFoQyxDQUFQLENBQThDLENBQzFDLE9BREosQ0FDWSx1QkFEWixFQURTO01BQUEsQ0FBWCxFQWQ0QztJQUFBLENBQTlDLEVBOUk4QjtFQUFBLENBQWhDLENBRkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/japanese-wrap/spec/character-regexp-util-spec.coffee
