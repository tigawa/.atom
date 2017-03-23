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
    },
    config: {
      tagFile: {
        type: 'string',
        "default": '.tags'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zeW1ib2wtZ2VuL2xpYi9zeW1ib2wtZ2VuLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVI7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FBYyxLQUFLLENBQUMsa0JBQXBCO0lBRGIsQ0FGVjtJQUtBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQUxaO0lBUUEsU0FBQSxFQUFXLFNBQUE7YUFDVDtRQUFBLGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUFBLENBQXBCOztJQURTLENBUlg7SUFXQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQ7YUFDaEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxTQUFoQztJQURnQixDQVhsQjtJQWNBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQURUO09BREY7S0FmRjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIlN5bWJvbEdlblZpZXcgPSByZXF1aXJlICcuL3N5bWJvbC1nZW4tdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzeW1ib2xHZW5WaWV3OiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3ltYm9sR2VuVmlldyA9IG5ldyBTeW1ib2xHZW5WaWV3KHN0YXRlLnN5bWJvbEdlblZpZXdTdGF0ZSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzeW1ib2xHZW5WaWV3LmRlc3Ryb3koKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBzeW1ib2xHZW5WaWV3U3RhdGU6IEBzeW1ib2xHZW5WaWV3LnNlcmlhbGl6ZSgpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBAc3ltYm9sR2VuVmlldy5jb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcilcblxuICBjb25maWc6XG4gICAgdGFnRmlsZTpcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJy50YWdzJ1xuIl19
