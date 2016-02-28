(function() {
  var EscapeCharacterRegex, cachedMatchesBySelector, getCachedMatch, parseScopeChain, selectorForScopeChain, selectorsMatchScopeChain, setCachedMatch, slick;

  slick = require('atom-slick');

  EscapeCharacterRegex = /[-!"#$%&'*+,/:;=?@|^~()<>{}[\]]/g;

  cachedMatchesBySelector = new WeakMap;

  getCachedMatch = function(selector, scopeChain) {
    var cachedMatchesByScopeChain;
    if (cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector)) {
      return cachedMatchesByScopeChain[scopeChain];
    }
  };

  setCachedMatch = function(selector, scopeChain, match) {
    var cachedMatchesByScopeChain;
    if (!(cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector))) {
      cachedMatchesByScopeChain = {};
      cachedMatchesBySelector.set(selector, cachedMatchesByScopeChain);
    }
    return cachedMatchesByScopeChain[scopeChain] = match;
  };

  parseScopeChain = function(scopeChain) {
    var scope, _i, _len, _ref, _ref1, _results;
    scopeChain = scopeChain.replace(EscapeCharacterRegex, function(match) {
      return "\\" + match[0];
    });
    _ref1 = (_ref = slick.parse(scopeChain)[0]) != null ? _ref : [];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      scope = _ref1[_i];
      _results.push(scope);
    }
    return _results;
  };

  selectorForScopeChain = function(selectors, scopeChain) {
    var cachedMatch, scopes, selector, _i, _len;
    for (_i = 0, _len = selectors.length; _i < _len; _i++) {
      selector = selectors[_i];
      cachedMatch = getCachedMatch(selector, scopeChain);
      if (cachedMatch != null) {
        if (cachedMatch) {
          return selector;
        } else {
          continue;
        }
      } else {
        scopes = parseScopeChain(scopeChain);
        while (scopes.length > 0) {
          if (selector.matches(scopes)) {
            setCachedMatch(selector, scopeChain, true);
            return selector;
          }
          scopes.pop();
        }
        setCachedMatch(selector, scopeChain, false);
      }
    }
    return null;
  };

  selectorsMatchScopeChain = function(selectors, scopeChain) {
    return selectorForScopeChain(selectors, scopeChain) != null;
  };

  module.exports = {
    parseScopeChain: parseScopeChain,
    selectorsMatchScopeChain: selectorsMatchScopeChain,
    selectorForScopeChain: selectorForScopeChain
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc2NvcGUtaGVscGVycy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0pBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFlBQVIsQ0FBUixDQUFBOztBQUFBLEVBRUEsb0JBQUEsR0FBdUIsa0NBRnZCLENBQUE7O0FBQUEsRUFJQSx1QkFBQSxHQUEwQixHQUFBLENBQUEsT0FKMUIsQ0FBQTs7QUFBQSxFQU1BLGNBQUEsR0FBaUIsU0FBQyxRQUFELEVBQVcsVUFBWCxHQUFBO0FBQ2YsUUFBQSx5QkFBQTtBQUFBLElBQUEsSUFBRyx5QkFBQSxHQUE0Qix1QkFBdUIsQ0FBQyxHQUF4QixDQUE0QixRQUE1QixDQUEvQjtBQUNFLGFBQU8seUJBQTBCLENBQUEsVUFBQSxDQUFqQyxDQURGO0tBRGU7RUFBQSxDQU5qQixDQUFBOztBQUFBLEVBVUEsY0FBQSxHQUFpQixTQUFDLFFBQUQsRUFBVyxVQUFYLEVBQXVCLEtBQXZCLEdBQUE7QUFDZixRQUFBLHlCQUFBO0FBQUEsSUFBQSxJQUFBLENBQUEsQ0FBTyx5QkFBQSxHQUE0Qix1QkFBdUIsQ0FBQyxHQUF4QixDQUE0QixRQUE1QixDQUE1QixDQUFQO0FBQ0UsTUFBQSx5QkFBQSxHQUE0QixFQUE1QixDQUFBO0FBQUEsTUFDQSx1QkFBdUIsQ0FBQyxHQUF4QixDQUE0QixRQUE1QixFQUFzQyx5QkFBdEMsQ0FEQSxDQURGO0tBQUE7V0FHQSx5QkFBMEIsQ0FBQSxVQUFBLENBQTFCLEdBQXdDLE1BSnpCO0VBQUEsQ0FWakIsQ0FBQTs7QUFBQSxFQWdCQSxlQUFBLEdBQWtCLFNBQUMsVUFBRCxHQUFBO0FBQ2hCLFFBQUEsc0NBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxVQUFVLENBQUMsT0FBWCxDQUFtQixvQkFBbkIsRUFBeUMsU0FBQyxLQUFELEdBQUE7YUFBWSxJQUFBLEdBQUksS0FBTSxDQUFBLENBQUEsRUFBdEI7SUFBQSxDQUF6QyxDQUFiLENBQUE7QUFDQTtBQUFBO1NBQUEsNENBQUE7d0JBQUE7QUFBQSxvQkFBQSxNQUFBLENBQUE7QUFBQTtvQkFGZ0I7RUFBQSxDQWhCbEIsQ0FBQTs7QUFBQSxFQW9CQSxxQkFBQSxHQUF3QixTQUFDLFNBQUQsRUFBWSxVQUFaLEdBQUE7QUFDdEIsUUFBQSx1Q0FBQTtBQUFBLFNBQUEsZ0RBQUE7K0JBQUE7QUFDRSxNQUFBLFdBQUEsR0FBYyxjQUFBLENBQWUsUUFBZixFQUF5QixVQUF6QixDQUFkLENBQUE7QUFDQSxNQUFBLElBQUcsbUJBQUg7QUFDRSxRQUFBLElBQUcsV0FBSDtBQUNFLGlCQUFPLFFBQVAsQ0FERjtTQUFBLE1BQUE7QUFHRSxtQkFIRjtTQURGO09BQUEsTUFBQTtBQU1FLFFBQUEsTUFBQSxHQUFTLGVBQUEsQ0FBZ0IsVUFBaEIsQ0FBVCxDQUFBO0FBQ0EsZUFBTSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUF0QixHQUFBO0FBQ0UsVUFBQSxJQUFHLFFBQVEsQ0FBQyxPQUFULENBQWlCLE1BQWpCLENBQUg7QUFDRSxZQUFBLGNBQUEsQ0FBZSxRQUFmLEVBQXlCLFVBQXpCLEVBQXFDLElBQXJDLENBQUEsQ0FBQTtBQUNBLG1CQUFPLFFBQVAsQ0FGRjtXQUFBO0FBQUEsVUFHQSxNQUFNLENBQUMsR0FBUCxDQUFBLENBSEEsQ0FERjtRQUFBLENBREE7QUFBQSxRQU1BLGNBQUEsQ0FBZSxRQUFmLEVBQXlCLFVBQXpCLEVBQXFDLEtBQXJDLENBTkEsQ0FORjtPQUZGO0FBQUEsS0FBQTtXQWdCQSxLQWpCc0I7RUFBQSxDQXBCeEIsQ0FBQTs7QUFBQSxFQXVDQSx3QkFBQSxHQUEyQixTQUFDLFNBQUQsRUFBWSxVQUFaLEdBQUE7V0FDekIscURBRHlCO0VBQUEsQ0F2QzNCLENBQUE7O0FBQUEsRUEwQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFDLGlCQUFBLGVBQUQ7QUFBQSxJQUFrQiwwQkFBQSx3QkFBbEI7QUFBQSxJQUE0Qyx1QkFBQSxxQkFBNUM7R0ExQ2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/scope-helpers.coffee
