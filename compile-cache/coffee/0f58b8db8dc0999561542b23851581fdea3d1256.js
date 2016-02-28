(function() {
  var RefCountedTokenList;

  module.exports = RefCountedTokenList = (function() {
    function RefCountedTokenList() {
      this.clear();
    }

    RefCountedTokenList.prototype.clear = function() {
      this.references = {};
      return this.tokens = [];
    };

    RefCountedTokenList.prototype.getLength = function() {
      return this.tokens.length;
    };

    RefCountedTokenList.prototype.getTokens = function() {
      return this.tokens;
    };

    RefCountedTokenList.prototype.getTokenWrappers = function() {
      var key, tokenWrapper, _ref, _results;
      _ref = this.references;
      _results = [];
      for (key in _ref) {
        tokenWrapper = _ref[key];
        _results.push(tokenWrapper);
      }
      return _results;
    };

    RefCountedTokenList.prototype.getToken = function(tokenKey) {
      var _ref;
      return (_ref = this.getTokenWrapper(tokenKey)) != null ? _ref.token : void 0;
    };

    RefCountedTokenList.prototype.getTokenWrapper = function(tokenKey) {
      tokenKey = this.getTokenKey(tokenKey);
      return this.references[tokenKey];
    };

    RefCountedTokenList.prototype.refCountForToken = function(tokenKey) {
      var _ref, _ref1;
      tokenKey = this.getTokenKey(tokenKey);
      return (_ref = (_ref1 = this.references[tokenKey]) != null ? _ref1.count : void 0) != null ? _ref : 0;
    };

    RefCountedTokenList.prototype.addToken = function(token, tokenKey) {
      tokenKey = this.getTokenKey(token, tokenKey);
      return this.updateRefCount(tokenKey, token, 1);
    };

    RefCountedTokenList.prototype.removeToken = function(token, tokenKey) {
      tokenKey = this.getTokenKey(token, tokenKey);
      if (this.references[tokenKey] != null) {
        token = this.references[tokenKey].token;
        this.updateRefCount(tokenKey, token, -1);
        return true;
      } else {
        return false;
      }
    };


    /*
    Private Methods
     */

    RefCountedTokenList.prototype.updateRefCount = function(tokenKey, token, increment) {
      var _base, _ref;
      if (increment > 0 && (this.references[tokenKey] == null)) {
        if ((_base = this.references)[tokenKey] == null) {
          _base[tokenKey] = {
            tokenKey: tokenKey,
            token: token,
            count: 0
          };
        }
        this.addTokenToList(token);
      }
      if (this.references[tokenKey] != null) {
        this.references[tokenKey].count += increment;
      }
      if (((_ref = this.references[tokenKey]) != null ? _ref.count : void 0) <= 0) {
        delete this.references[tokenKey];
        return this.removeTokenFromList(token);
      }
    };

    RefCountedTokenList.prototype.addTokenToList = function(token) {
      return this.tokens.push(token);
    };

    RefCountedTokenList.prototype.removeTokenFromList = function(token) {
      var index;
      index = this.tokens.indexOf(token);
      if (index > -1) {
        return this.tokens.splice(index, 1);
      }
    };

    RefCountedTokenList.prototype.getTokenKey = function(token, tokenKey) {
      return (tokenKey != null ? tokenKey : token) + '$$';
    };

    return RefCountedTokenList;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvcmVmLWNvdW50ZWQtdG9rZW4tbGlzdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSw2QkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FEVztJQUFBLENBQWI7O0FBQUEsa0NBR0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFkLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLEdBRkw7SUFBQSxDQUhQLENBQUE7O0FBQUEsa0NBT0EsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBWDtJQUFBLENBUFgsQ0FBQTs7QUFBQSxrQ0FTQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLE9BQUo7SUFBQSxDQVRYLENBQUE7O0FBQUEsa0NBV0EsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsaUNBQUE7QUFBQztBQUFBO1dBQUEsV0FBQTtpQ0FBQTtBQUFBLHNCQUFBLGFBQUEsQ0FBQTtBQUFBO3NCQURlO0lBQUEsQ0FYbEIsQ0FBQTs7QUFBQSxrQ0FjQSxRQUFBLEdBQVUsU0FBQyxRQUFELEdBQUE7QUFDUixVQUFBLElBQUE7bUVBQTBCLENBQUUsZUFEcEI7SUFBQSxDQWRWLENBQUE7O0FBQUEsa0NBaUJBLGVBQUEsR0FBaUIsU0FBQyxRQUFELEdBQUE7QUFDZixNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBRCxDQUFhLFFBQWIsQ0FBWCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVcsQ0FBQSxRQUFBLEVBRkc7SUFBQSxDQWpCakIsQ0FBQTs7QUFBQSxrQ0FxQkEsZ0JBQUEsR0FBa0IsU0FBQyxRQUFELEdBQUE7QUFDaEIsVUFBQSxXQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxRQUFiLENBQVgsQ0FBQTswR0FDK0IsRUFGZjtJQUFBLENBckJsQixDQUFBOztBQUFBLGtDQXlCQSxRQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsUUFBUixHQUFBO0FBQ1IsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiLEVBQW9CLFFBQXBCLENBQVgsQ0FBQTthQUNBLElBQUMsQ0FBQSxjQUFELENBQWdCLFFBQWhCLEVBQTBCLEtBQTFCLEVBQWlDLENBQWpDLEVBRlE7SUFBQSxDQXpCVixDQUFBOztBQUFBLGtDQStCQSxXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsUUFBUixHQUFBO0FBQ1gsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiLEVBQW9CLFFBQXBCLENBQVgsQ0FBQTtBQUNBLE1BQUEsSUFBRyxpQ0FBSDtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxVQUFXLENBQUEsUUFBQSxDQUFTLENBQUMsS0FBOUIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsUUFBaEIsRUFBMEIsS0FBMUIsRUFBaUMsQ0FBQSxDQUFqQyxDQURBLENBQUE7ZUFFQSxLQUhGO09BQUEsTUFBQTtlQUtFLE1BTEY7T0FGVztJQUFBLENBL0JiLENBQUE7O0FBd0NBO0FBQUE7O09BeENBOztBQUFBLGtDQTRDQSxjQUFBLEdBQWdCLFNBQUMsUUFBRCxFQUFXLEtBQVgsRUFBa0IsU0FBbEIsR0FBQTtBQUNkLFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBRyxTQUFBLEdBQVksQ0FBWixJQUFzQixtQ0FBekI7O2VBQ2MsQ0FBQSxRQUFBLElBQWE7QUFBQSxZQUFDLFVBQUEsUUFBRDtBQUFBLFlBQVcsT0FBQSxLQUFYO0FBQUEsWUFBa0IsS0FBQSxFQUFPLENBQXpCOztTQUF6QjtBQUFBLFFBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsQ0FEQSxDQURGO09BQUE7QUFJQSxNQUFBLElBQTRDLGlDQUE1QztBQUFBLFFBQUEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxRQUFBLENBQVMsQ0FBQyxLQUF0QixJQUErQixTQUEvQixDQUFBO09BSkE7QUFNQSxNQUFBLHNEQUF3QixDQUFFLGVBQXZCLElBQWdDLENBQW5DO0FBQ0UsUUFBQSxNQUFBLENBQUEsSUFBUSxDQUFBLFVBQVcsQ0FBQSxRQUFBLENBQW5CLENBQUE7ZUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsS0FBckIsRUFGRjtPQVBjO0lBQUEsQ0E1Q2hCLENBQUE7O0FBQUEsa0NBdURBLGNBQUEsR0FBZ0IsU0FBQyxLQUFELEdBQUE7YUFDZCxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxLQUFiLEVBRGM7SUFBQSxDQXZEaEIsQ0FBQTs7QUFBQSxrQ0EwREEsbUJBQUEsR0FBcUIsU0FBQyxLQUFELEdBQUE7QUFDbkIsVUFBQSxLQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLEtBQWhCLENBQVIsQ0FBQTtBQUNBLE1BQUEsSUFBNEIsS0FBQSxHQUFRLENBQUEsQ0FBcEM7ZUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxLQUFmLEVBQXNCLENBQXRCLEVBQUE7T0FGbUI7SUFBQSxDQTFEckIsQ0FBQTs7QUFBQSxrQ0E4REEsV0FBQSxHQUFhLFNBQUMsS0FBRCxFQUFRLFFBQVIsR0FBQTthQUVYLG9CQUFDLFdBQVcsS0FBWixDQUFBLEdBQXFCLEtBRlY7SUFBQSxDQTlEYixDQUFBOzsrQkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/ref-counted-token-list.coffee
