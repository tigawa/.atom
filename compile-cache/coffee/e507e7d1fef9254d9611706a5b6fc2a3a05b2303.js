(function() {
  var CharaterRegexpUtil,
    __slice = [].slice;

  module.exports = CharaterRegexpUtil = (function() {
    function CharaterRegexpUtil() {}

    CharaterRegexpUtil.combineRegexp = function() {
      var regexp, regexpList, regexpString, str, _i, _len;
      regexpList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      regexpString = "";
      regexpString += "[";
      for (_i = 0, _len = regexpList.length; _i < _len; _i++) {
        regexp = regexpList[_i];
        str = regexp.source;
        if (str.length === 0) {
          continue;
        }
        if (str.startsWith("[") && str.endsWith("]")) {
          regexpString += str.substr(1, str.length - 2);
        } else {
          regexpString += str;
        }
      }
      regexpString += "]";
      return new RegExp(regexpString);
    };

    CharaterRegexpUtil.string2regexp = function() {
      var regexpString, str, strList, _i, _len;
      strList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      regexpString = "";
      regexpString += "[";
      for (_i = 0, _len = strList.length; _i < _len; _i++) {
        str = strList[_i];
        regexpString += str;
      }
      regexpString += "]";
      return new RegExp(regexpString);
    };

    CharaterRegexpUtil.code2uchar = function(code) {
      var str;
      str = "\\u";
      if (code < 0) {
        return "";
      } else if (code < 0x10) {
        str += "000";
      } else if (code < 0x100) {
        str += "00";
      } else if (code < 0x1000) {
        str += "0";
      } else if (code < 0x10000) {

      } else if (code < 0x110000) {
        code = ((code - 0x10000) >> 10) + 0xD800;
      } else {
        return "";
      }
      str += code.toString(16).toUpperCase();
      return str;
    };

    CharaterRegexpUtil.char2uchar = function(char) {
      return this.code2uchar(char.charCodeAt(0));
    };

    CharaterRegexpUtil.range2string = function() {
      var firstCode, lastCode, range, rangeList, str, _i, _len;
      rangeList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      str = "";
      for (_i = 0, _len = rangeList.length; _i < _len; _i++) {
        range = rangeList[_i];
        firstCode = range[0];
        lastCode = range[range.length - 1];
        if (lastCode < 0x10000 || firstCode >= 0x10000) {
          str += this.code2uchar(firstCode) + "-" + this.code2uchar(lastCode);
        } else {
          str += this.code2uchar(firstCode) + "-" + this.code2uchar(0xFFFF) + this.code2uchar(0x10000) + "-" + this.code2uchar(lastCode);
        }
      }
      return str;
    };

    CharaterRegexpUtil.range2regexp = function() {
      var rangeList;
      rangeList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.string2regexp(this.range2string.apply(this, rangeList));
    };

    CharaterRegexpUtil.escapeAscii = function(str) {
      var escape_str, i, _i, _ref;
      escape_str = "";
      for (i = _i = 0, _ref = str.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        escape_str += this.code2uchar(str.charCodeAt(i));
      }
      return escape_str;
    };

    return CharaterRegexpUtil;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qYXBhbmVzZS13cmFwL2xpYi9jaGFyYWN0ZXItcmVnZXhwLXV0aWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO29DQUVKOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsK0NBQUE7QUFBQSxNQURlLG9FQUNmLENBQUE7QUFBQSxNQUFBLFlBQUEsR0FBZSxFQUFmLENBQUE7QUFBQSxNQUNBLFlBQUEsSUFBZ0IsR0FEaEIsQ0FBQTtBQUVBLFdBQUEsaURBQUE7Z0NBQUE7QUFDRSxRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBYixDQUFBO0FBQ0EsUUFBQSxJQUFHLEdBQUcsQ0FBQyxNQUFKLEtBQWMsQ0FBakI7QUFDRSxtQkFERjtTQURBO0FBR0EsUUFBQSxJQUFHLEdBQUcsQ0FBQyxVQUFKLENBQWUsR0FBZixDQUFBLElBQXdCLEdBQUcsQ0FBQyxRQUFKLENBQWEsR0FBYixDQUEzQjtBQUNFLFVBQUEsWUFBQSxJQUFnQixHQUFHLENBQUMsTUFBSixDQUFXLENBQVgsRUFBYyxHQUFHLENBQUMsTUFBSixHQUFhLENBQTNCLENBQWhCLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxZQUFBLElBQWdCLEdBQWhCLENBSEY7U0FKRjtBQUFBLE9BRkE7QUFBQSxNQVVBLFlBQUEsSUFBZ0IsR0FWaEIsQ0FBQTtBQVdBLGFBQVcsSUFBQSxNQUFBLENBQU8sWUFBUCxDQUFYLENBWmM7SUFBQSxDQUFoQixDQUFBOztBQUFBLElBY0Esa0JBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsb0NBQUE7QUFBQSxN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

//# sourceURL=/Users/igawataiichi/.atom/packages/japanese-wrap/lib/character-regexp-util.coffee
