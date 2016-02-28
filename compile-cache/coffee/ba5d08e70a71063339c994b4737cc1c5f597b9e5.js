(function() {
  module.exports = {
    provider: null,
    ready: false,
    activate: function() {
      return this.ready = true;
    },
    deactivate: function() {
      return this.provider = null;
    },
    getProvider: function() {
      var PathsProvider;
      if (this.provider != null) {
        return this.provider;
      }
      PathsProvider = require('./paths-provider');
      this.provider = new PathsProvider();
      return this.provider;
    },
    provide: function() {
      return {
        provider: this.getProvider()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL2F1dG9jb21wbGV0ZS1wYXRocy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLElBQVY7QUFBQSxJQUNBLEtBQUEsRUFBTyxLQURQO0FBQUEsSUFHQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUREO0lBQUEsQ0FIVjtBQUFBLElBTUEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxRQUFELEdBQVksS0FERjtJQUFBLENBTlo7QUFBQSxJQVNBLFdBQUEsRUFBYSxTQUFBLEdBQUE7QUFDWCxVQUFBLGFBQUE7QUFBQSxNQUFBLElBQW9CLHFCQUFwQjtBQUFBLGVBQU8sSUFBQyxDQUFBLFFBQVIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQURoQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLGFBQUEsQ0FBQSxDQUZoQixDQUFBO0FBR0EsYUFBTyxJQUFDLENBQUEsUUFBUixDQUpXO0lBQUEsQ0FUYjtBQUFBLElBZUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtBQUNQLGFBQU87QUFBQSxRQUFDLFFBQUEsRUFBVSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQVg7T0FBUCxDQURPO0lBQUEsQ0FmVDtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-paths/lib/autocomplete-paths.coffee
