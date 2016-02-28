(function() {
  module.exports = {
    provider: null,
    activate: function() {},
    deactivate: function() {
      return this.provider = null;
    },
    provide: function() {
      var SnippetsProvider;
      if (this.provider == null) {
        SnippetsProvider = require('./snippets-provider');
        this.provider = new SnippetsProvider();
        if (this.snippets != null) {
          this.provider.setSnippetsSource(this.snippets);
        }
      }
      return this.provider;
    },
    consumeSnippets: function(snippets) {
      var _ref;
      this.snippets = snippets;
      return (_ref = this.provider) != null ? _ref.setSnippetsSource(this.snippets) : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc25pcHBldHMvbGliL2F1dG9jb21wbGV0ZS1zbmlwcGV0cy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLElBQVY7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFBLEdBQUEsQ0FGVjtBQUFBLElBSUEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxRQUFELEdBQVksS0FERjtJQUFBLENBSlo7QUFBQSxJQU9BLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxJQUFPLHFCQUFQO0FBQ0UsUUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FBbkIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxnQkFBQSxDQUFBLENBRGhCLENBQUE7QUFFQSxRQUFBLElBQTBDLHFCQUExQztBQUFBLFVBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBVixDQUE0QixJQUFDLENBQUEsUUFBN0IsQ0FBQSxDQUFBO1NBSEY7T0FBQTthQUtBLElBQUMsQ0FBQSxTQU5NO0lBQUEsQ0FQVDtBQUFBLElBZUEsZUFBQSxFQUFpQixTQUFFLFFBQUYsR0FBQTtBQUNmLFVBQUEsSUFBQTtBQUFBLE1BRGdCLElBQUMsQ0FBQSxXQUFBLFFBQ2pCLENBQUE7a0RBQVMsQ0FBRSxpQkFBWCxDQUE2QixJQUFDLENBQUEsUUFBOUIsV0FEZTtJQUFBLENBZmpCO0dBREYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-snippets/lib/autocomplete-snippets.coffee
