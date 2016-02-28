(function() {
  var SymbolGenView;

  SymbolGenView = require('./symbol-gen-view');

  module.exports = {
    symbolGenView: null,
    activate: function(state) {
      return this.symbolGenView = new SymbolGenView(state.symbolGenViewState);
    },
    deactivate: function() {
      return this.symbolGenView.destroy();
    },
    serialize: function() {
      return {
        symbolGenViewState: this.symbolGenView.serialize()
      };
    },
    consumeStatusBar: function(statusBar) {
      return this.symbolGenView.consumeStatusBar(statusBar);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zeW1ib2wtZ2VuL2xpYi9zeW1ib2wtZ2VuLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxhQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FBYyxLQUFLLENBQUMsa0JBQXBCLEVBRGI7SUFBQSxDQUZWO0FBQUEsSUFLQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsRUFEVTtJQUFBLENBTFo7QUFBQSxJQVFBLFNBQUEsRUFBVyxTQUFBLEdBQUE7YUFDVDtBQUFBLFFBQUEsa0JBQUEsRUFBb0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQUEsQ0FBcEI7UUFEUztJQUFBLENBUlg7QUFBQSxJQVdBLGdCQUFBLEVBQWtCLFNBQUMsU0FBRCxHQUFBO2FBQ2hCLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsU0FBaEMsRUFEZ0I7SUFBQSxDQVhsQjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/symbol-gen/lib/symbol-gen.coffee
