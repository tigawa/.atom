(function() {
  var CompositeDisposable, MinimapBookmarksBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = MinimapBookmarksBinding = (function() {
    function MinimapBookmarksBinding(minimap) {
      this.minimap = minimap;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.minimap.getTextEditor();
      this.decorationsByMarkerId = {};
      this.decorationSubscriptionsByMarkerId = {};
      this.subscriptions.add(this.editor.displayBuffer.onDidCreateMarker((function(_this) {
        return function(marker) {
          if (marker.matchesProperties({
            "class": 'bookmark'
          })) {
            return _this.handleMarker(marker);
          }
        };
      })(this)));
      this.editor.displayBuffer.findMarkers({
        "class": 'bookmark'
      }).forEach((function(_this) {
        return function(marker) {
          return _this.handleMarker(marker);
        };
      })(this));
    }

    MinimapBookmarksBinding.prototype.handleMarker = function(marker) {
      var decoration, id;
      id = marker.id;
      decoration = this.minimap.decorateMarker(marker, {
        type: 'line',
        "class": 'bookmark',
        plugin: 'bookmarks'
      });
      this.decorationsByMarkerId[id] = decoration;
      return this.decorationSubscriptionsByMarkerId[id] = decoration.onDidDestroy((function(_this) {
        return function() {
          _this.decorationSubscriptionsByMarkerId[id].dispose();
          delete _this.decorationsByMarkerId[id];
          return delete _this.decorationSubscriptionsByMarkerId[id];
        };
      })(this));
    };

    MinimapBookmarksBinding.prototype.destroy = function() {
      var decoration, id, _ref;
      _ref = this.decorationsByMarkerId;
      for (id in _ref) {
        decoration = _ref[id];
        this.decorationSubscriptionsByMarkerId[id].dispose();
        decoration.destroy();
        delete this.decorationsByMarkerId[id];
        delete this.decorationSubscriptionsByMarkerId[id];
      }
      return this.subscriptions.dispose();
    };

    return MinimapBookmarksBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWJvb2ttYXJrcy9saWIvbWluaW1hcC1ib29rbWFya3MtYmluZGluZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNENBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLGlDQUFFLE9BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQUEsQ0FEVixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEscUJBQUQsR0FBeUIsRUFGekIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGlDQUFELEdBQXFDLEVBSHJDLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxpQkFBdEIsQ0FBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ3pELFVBQUEsSUFBRyxNQUFNLENBQUMsaUJBQVAsQ0FBeUI7QUFBQSxZQUFBLE9BQUEsRUFBTyxVQUFQO1dBQXpCLENBQUg7bUJBQ0UsS0FBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBREY7V0FEeUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QyxDQUFuQixDQUxBLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQXRCLENBQWtDO0FBQUEsUUFBQSxPQUFBLEVBQU8sVUFBUDtPQUFsQyxDQUFvRCxDQUFDLE9BQXJELENBQTZELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDM0QsS0FBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBRDJEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0QsQ0FUQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSxzQ0FhQSxZQUFBLEdBQWMsU0FBQyxNQUFELEdBQUE7QUFDWixVQUFBLGNBQUE7QUFBQSxNQUFDLEtBQU0sT0FBTixFQUFELENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0M7QUFBQSxRQUFBLElBQUEsRUFBTSxNQUFOO0FBQUEsUUFBYyxPQUFBLEVBQU8sVUFBckI7QUFBQSxRQUFpQyxNQUFBLEVBQVEsV0FBekM7T0FBaEMsQ0FEYixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEscUJBQXNCLENBQUEsRUFBQSxDQUF2QixHQUE2QixVQUY3QixDQUFBO2FBR0EsSUFBQyxDQUFBLGlDQUFrQyxDQUFBLEVBQUEsQ0FBbkMsR0FBeUMsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUMvRCxVQUFBLEtBQUMsQ0FBQSxpQ0FBa0MsQ0FBQSxFQUFBLENBQUcsQ0FBQyxPQUF2QyxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFBLEtBQVEsQ0FBQSxxQkFBc0IsQ0FBQSxFQUFBLENBRjlCLENBQUE7aUJBR0EsTUFBQSxDQUFBLEtBQVEsQ0FBQSxpQ0FBa0MsQ0FBQSxFQUFBLEVBSnFCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFKN0I7SUFBQSxDQWJkLENBQUE7O0FBQUEsc0NBdUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLG9CQUFBO0FBQUE7QUFBQSxXQUFBLFVBQUE7OEJBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSxpQ0FBa0MsQ0FBQSxFQUFBLENBQUcsQ0FBQyxPQUF2QyxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQURBLENBQUE7QUFBQSxRQUdBLE1BQUEsQ0FBQSxJQUFRLENBQUEscUJBQXNCLENBQUEsRUFBQSxDQUg5QixDQUFBO0FBQUEsUUFJQSxNQUFBLENBQUEsSUFBUSxDQUFBLGlDQUFrQyxDQUFBLEVBQUEsQ0FKMUMsQ0FERjtBQUFBLE9BQUE7YUFPQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQVJPO0lBQUEsQ0F2QlQsQ0FBQTs7bUNBQUE7O01BSkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/minimap-bookmarks/lib/minimap-bookmarks-binding.coffee
