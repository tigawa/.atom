(function() {
  var SnippetsProvider, ascendingPrefixComparator, firstCharsEqual;

  module.exports = SnippetsProvider = (function() {
    SnippetsProvider.prototype.selector = '*';

    SnippetsProvider.prototype.disableForSelector = '.comment, .string';

    SnippetsProvider.prototype.inclusionPriority = 1;

    SnippetsProvider.prototype.suggestionPriority = 2;

    SnippetsProvider.prototype.filterSuggestions = true;

    function SnippetsProvider() {
      this.showIcon = atom.config.get('autocomplete-plus.defaultProvider') === 'Symbol';
      this.snippetsSource = {
        snippetsForScopes: function(scopeDescriptor) {
          return atom.config.get('snippets', {
            scope: scopeDescriptor
          });
        }
      };
    }

    SnippetsProvider.prototype.setSnippetsSource = function(snippetsSource) {
      if (typeof (snippetsSource != null ? snippetsSource.snippetsForScopes : void 0) === "function") {
        return this.snippetsSource = snippetsSource;
      }
    };

    SnippetsProvider.prototype.getSuggestions = function(_arg) {
      var prefix, scopeDescriptor, scopeSnippets;
      scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      if (!(prefix != null ? prefix.length : void 0)) {
        return;
      }
      scopeSnippets = this.snippetsSource.snippetsForScopes(scopeDescriptor);
      return this.findSuggestionsForPrefix(scopeSnippets, prefix);
    };

    SnippetsProvider.prototype.findSuggestionsForPrefix = function(snippets, prefix) {
      var snippet, snippetPrefix, suggestions;
      if (snippets == null) {
        return [];
      }
      suggestions = [];
      for (snippetPrefix in snippets) {
        snippet = snippets[snippetPrefix];
        if (!(snippet && snippetPrefix && prefix && firstCharsEqual(snippetPrefix, prefix))) {
          continue;
        }
        suggestions.push({
          iconHTML: this.showIcon ? void 0 : false,
          type: 'snippet',
          text: snippet.prefix,
          replacementPrefix: prefix,
          rightLabel: snippet.name,
          description: snippet.description,
          descriptionMoreURL: snippet.descriptionMoreURL
        });
      }
      suggestions.sort(ascendingPrefixComparator);
      return suggestions;
    };

    SnippetsProvider.prototype.onDidInsertSuggestion = function(_arg) {
      var editor;
      editor = _arg.editor;
      return atom.commands.dispatch(atom.views.getView(editor), 'snippets:expand');
    };

    return SnippetsProvider;

  })();

  ascendingPrefixComparator = function(a, b) {
    return a.text.localeCompare(b.text);
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc25pcHBldHMvbGliL3NuaXBwZXRzLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0REFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQkFBQSxRQUFBLEdBQVUsR0FBVixDQUFBOztBQUFBLCtCQUNBLGtCQUFBLEdBQW9CLG1CQURwQixDQUFBOztBQUFBLCtCQUVBLGlCQUFBLEdBQW1CLENBRm5CLENBQUE7O0FBQUEsK0JBR0Esa0JBQUEsR0FBb0IsQ0FIcEIsQ0FBQTs7QUFBQSwrQkFLQSxpQkFBQSxHQUFtQixJQUxuQixDQUFBOztBQU9hLElBQUEsMEJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUNBQWhCLENBQUEsS0FBd0QsUUFBcEUsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsR0FDRTtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsU0FBQyxlQUFELEdBQUE7aUJBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixVQUFoQixFQUE0QjtBQUFBLFlBQUMsS0FBQSxFQUFPLGVBQVI7V0FBNUIsRUFEaUI7UUFBQSxDQUFuQjtPQUZGLENBRFc7SUFBQSxDQVBiOztBQUFBLCtCQWFBLGlCQUFBLEdBQW1CLFNBQUMsY0FBRCxHQUFBO0FBQ2pCLE1BQUEsSUFBRyxNQUFBLENBQUEsMEJBQU8sY0FBYyxDQUFFLDJCQUF2QixLQUE0QyxVQUEvQztlQUNFLElBQUMsQ0FBQSxjQUFELEdBQWtCLGVBRHBCO09BRGlCO0lBQUEsQ0FibkIsQ0FBQTs7QUFBQSwrQkFpQkEsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLFVBQUEsc0NBQUE7QUFBQSxNQURnQix1QkFBQSxpQkFBaUIsY0FBQSxNQUNqQyxDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsa0JBQWMsTUFBTSxDQUFFLGdCQUF0QjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsaUJBQWhCLENBQWtDLGVBQWxDLENBRGhCLENBQUE7YUFFQSxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsYUFBMUIsRUFBeUMsTUFBekMsRUFIYztJQUFBLENBakJoQixDQUFBOztBQUFBLCtCQXNCQSx3QkFBQSxHQUEwQixTQUFDLFFBQUQsRUFBVyxNQUFYLEdBQUE7QUFDeEIsVUFBQSxtQ0FBQTtBQUFBLE1BQUEsSUFBaUIsZ0JBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FBQTtBQUFBLE1BRUEsV0FBQSxHQUFjLEVBRmQsQ0FBQTtBQUdBLFdBQUEseUJBQUE7MENBQUE7QUFDRSxRQUFBLElBQUEsQ0FBQSxDQUFnQixPQUFBLElBQVksYUFBWixJQUE4QixNQUE5QixJQUF5QyxlQUFBLENBQWdCLGFBQWhCLEVBQStCLE1BQS9CLENBQXpELENBQUE7QUFBQSxtQkFBQTtTQUFBO0FBQUEsUUFDQSxXQUFXLENBQUMsSUFBWixDQUNFO0FBQUEsVUFBQSxRQUFBLEVBQWEsSUFBQyxDQUFBLFFBQUosR0FBa0IsTUFBbEIsR0FBaUMsS0FBM0M7QUFBQSxVQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsVUFFQSxJQUFBLEVBQU0sT0FBTyxDQUFDLE1BRmQ7QUFBQSxVQUdBLGlCQUFBLEVBQW1CLE1BSG5CO0FBQUEsVUFJQSxVQUFBLEVBQVksT0FBTyxDQUFDLElBSnBCO0FBQUEsVUFLQSxXQUFBLEVBQWEsT0FBTyxDQUFDLFdBTHJCO0FBQUEsVUFNQSxrQkFBQSxFQUFvQixPQUFPLENBQUMsa0JBTjVCO1NBREYsQ0FEQSxDQURGO0FBQUEsT0FIQTtBQUFBLE1BY0EsV0FBVyxDQUFDLElBQVosQ0FBaUIseUJBQWpCLENBZEEsQ0FBQTthQWVBLFlBaEJ3QjtJQUFBLENBdEIxQixDQUFBOztBQUFBLCtCQXdDQSxxQkFBQSxHQUF1QixTQUFDLElBQUQsR0FBQTtBQUNyQixVQUFBLE1BQUE7QUFBQSxNQUR1QixTQUFELEtBQUMsTUFDdkIsQ0FBQTthQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBdkIsRUFBbUQsaUJBQW5ELEVBRHFCO0lBQUEsQ0F4Q3ZCLENBQUE7OzRCQUFBOztNQUZGLENBQUE7O0FBQUEsRUE2Q0EseUJBQUEsR0FBNEIsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO1dBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFQLENBQXFCLENBQUMsQ0FBQyxJQUF2QixFQUFWO0VBQUEsQ0E3QzVCLENBQUE7O0FBQUEsRUErQ0EsZUFBQSxHQUFrQixTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7V0FDaEIsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEtBQXlCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFSLENBQUEsRUFEVDtFQUFBLENBL0NsQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-snippets/lib/snippets-provider.coffee
