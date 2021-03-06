(function() {
  var UnicodeUtil,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  UnicodeUtil = require('../lib/unicode-util');

  describe("UnicodeUtil", function() {
    describe("UnicodeUtil.getBlockName()", function() {
      return it("BlockName", function() {
        expect(UnicodeUtil.getBlockName("a")).toEqual("C0 Controls and Basic Latin");
        expect(UnicodeUtil.getBlockName("α")).toEqual("Greek and Coptic");
        expect(UnicodeUtil.getBlockName("д")).toEqual("Cyrillic");
        expect(UnicodeUtil.getBlockName("あ")).toEqual("Hiragana");
        expect(UnicodeUtil.getBlockName("ア")).toEqual("Katakana");
        expect(UnicodeUtil.getBlockName("一")).toEqual("CJK Unified Ideographs");
        expect(UnicodeUtil.getBlockName("ｱ")).toEqual("Halfwidth and Fullwidth Forms");
        expect(UnicodeUtil.getBlockName("Ａ")).toEqual("Halfwidth and Fullwidth Forms");
        return expect(UnicodeUtil.getBlockName("𠮷")).toEqual("CJK Unified Ideographs Extension B");
      });
    });
    describe("UnicodeUtil.getRangeListByName()", function() {
      it("Latin", function() {
        var c, ok_count, r, rangeList, test_chars, _i, _j, _len, _len1, _ref;
        rangeList = UnicodeUtil.getRangeListByName("Latin");
        test_chars = ["a", "B", "À", "Đ", "ƒ"];
        ok_count = 0;
        for (_i = 0, _len = rangeList.length; _i < _len; _i++) {
          r = rangeList[_i];
          for (_j = 0, _len1 = test_chars.length; _j < _len1; _j++) {
            c = test_chars[_j];
            if (_ref = c.charCodeAt(), __indexOf.call(r, _ref) >= 0) {
              ok_count += 1;
            }
          }
        }
        return expect(ok_count).toEqual(test_chars.length);
      });
      it("Greek", function() {
        var c, ok_count, r, rangeList, test_chars, _i, _j, _len, _len1, _ref;
        rangeList = UnicodeUtil.getRangeListByName("Greek");
        test_chars = ["α", "Β", "ὰ"];
        ok_count = 0;
        for (_i = 0, _len = rangeList.length; _i < _len; _i++) {
          r = rangeList[_i];
          for (_j = 0, _len1 = test_chars.length; _j < _len1; _j++) {
            c = test_chars[_j];
            if (_ref = c.charCodeAt(), __indexOf.call(r, _ref) >= 0) {
              ok_count += 1;
            }
          }
        }
        return expect(ok_count).toEqual(test_chars.length);
      });
      return it("CJK", function() {
        var c, charCode, charCodeHigh, charCodeLow, ok_count, r, rangeList, test_chars, _i, _j, _len, _len1;
        rangeList = UnicodeUtil.getRangeListByName("CJK");
        test_chars = ["漢", "寝", "𠮷"];
        ok_count = 0;
        for (_i = 0, _len = rangeList.length; _i < _len; _i++) {
          r = rangeList[_i];
          for (_j = 0, _len1 = test_chars.length; _j < _len1; _j++) {
            c = test_chars[_j];
            charCode = c.charCodeAt();
            if (__indexOf.call(UnicodeUtil.highSurrogateRange, charCode) >= 0) {
              charCodeHigh = charCode;
              charCodeLow = c.charCodeAt(1);
              if (__indexOf.call(UnicodeUtil.lowSurrogateRange, charCodeLow) >= 0) {
                charCode = 0x10000 + (charCodeHigh - 0xD800) * 0x400 + (charCodeLow - 0xDC00);
              }
            }
            if (__indexOf.call(r, charCode) >= 0) {
              ok_count += 1;
            }
          }
        }
        return expect(ok_count).toEqual(test_chars.length);
      });
    });
    return describe("UnicodeUtil.unicodeCharCodeAt()", function() {
      var text;
      it("nonesurrogate", function() {
        var text;
        text = "aB漢";
        expect(UnicodeUtil.unicodeCharCodeAt(text)).toEqual(text.charCodeAt());
        expect(UnicodeUtil.unicodeCharCodeAt(text, 0)).toEqual(text.charCodeAt(0));
        expect(UnicodeUtil.unicodeCharCodeAt(text, 1)).toEqual(text.charCodeAt(1));
        return expect(UnicodeUtil.unicodeCharCodeAt(text, 2)).toEqual(text.charCodeAt(2));
      });
      it("surrogate", function() {
        var text;
        text = "𠮷田";
        expect(UnicodeUtil.unicodeCharCodeAt(text)).toEqual(0x10000 + (text.charCodeAt(0) - 0xD800) * 0x400 + (text.charCodeAt(1) - 0xDC00));
        expect(UnicodeUtil.unicodeCharCodeAt(text, 0)).toEqual(0x10000 + (text.charCodeAt(0) - 0xD800) * 0x400 + (text.charCodeAt(1) - 0xDC00));
        return expect(UnicodeUtil.unicodeCharCodeAt(text, 1)).toEqual(text.charCodeAt(2));
      });
      text = "𠮷田𠮷田𠮷田𠮷田𠮷田";
      expect(UnicodeUtil.unicodeCharCodeAt(text), 4).toEqual(0x10000 + (text.charCodeAt(6) - 0xD800) * 0x400 + (text.charCodeAt(7) - 0xDC00));
      expect(UnicodeUtil.unicodeCharCodeAt(text, 5)).toEqual(text.charCodeAt(8));
      return expect(UnicodeUtil.unicodeCharCodeAt(text, 7)).toEqual(text.charCodeAt(11));
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qYXBhbmVzZS13cmFwL3NwZWMvdW5pY29kZS11dGlsLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FBZCxDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLElBQUEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTthQUNyQyxFQUFBLENBQUcsV0FBSCxFQUFnQixTQUFBLEdBQUE7QUFDZCxRQUFBLE1BQUEsQ0FBTyxXQUFXLENBQUMsWUFBWixDQUF5QixHQUF6QixDQUFQLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsNkJBQTlDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLFdBQVcsQ0FBQyxZQUFaLENBQXlCLEdBQXpCLENBQVAsQ0FBcUMsQ0FBQyxPQUF0QyxDQUE4QyxrQkFBOUMsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sV0FBVyxDQUFDLFlBQVosQ0FBeUIsR0FBekIsQ0FBUCxDQUFxQyxDQUFDLE9BQXRDLENBQThDLFVBQTlDLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLFdBQVcsQ0FBQyxZQUFaLENBQXlCLEdBQXpCLENBQVAsQ0FBcUMsQ0FBQyxPQUF0QyxDQUE4QyxVQUE5QyxDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxXQUFXLENBQUMsWUFBWixDQUF5QixHQUF6QixDQUFQLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsVUFBOUMsQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLENBQU8sV0FBVyxDQUFDLFlBQVosQ0FBeUIsR0FBekIsQ0FBUCxDQUFx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

//# sourceURL=/Users/igawataiichi/.atom/packages/japanese-wrap/spec/unicode-util-spec.coffee
