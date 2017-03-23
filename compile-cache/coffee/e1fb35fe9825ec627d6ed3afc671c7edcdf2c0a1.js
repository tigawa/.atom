(function() {
  var CompositeDisposable, MinimapBookmarksBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = MinimapBookmarksBinding = (function() {
    function MinimapBookmarksBinding(minimap, bookmarks) {
      this.minimap = minimap;
      this.bookmarks = bookmarks;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.minimap.getTextEditor();
      this.decorationsByMarkerId = {};
      this.decorationSubscriptionsByMarkerId = {};
      requestAnimationFrame((function(_this) {
        return function() {
          var id, markerLayer, ref;
          id = (ref = _this.bookmarks.serialize()[_this.editor.id]) != null ? ref.markerLayerId : void 0;
          markerLayer = _this.editor.getMarkerLayer(id);
          if (markerLayer != null) {
            _this.subscriptions.add(markerLayer.onDidCreateMarker(function(marker) {
              return _this.handleMarker(marker);
            }));
            return markerLayer.findMarkers().forEach(function(marker) {
              return _this.handleMarker(marker);
            });
          }
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
      var decoration, id, ref;
      ref = this.decorationsByMarkerId;
      for (id in ref) {
        decoration = ref[id];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWJvb2ttYXJrcy9saWIvbWluaW1hcC1ib29rbWFya3MtYmluZGluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGlDQUFDLE9BQUQsRUFBVyxTQUFYO01BQUMsSUFBQyxDQUFBLFVBQUQ7TUFBVSxJQUFDLENBQUEsWUFBRDtNQUN0QixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQUE7TUFDVixJQUFDLENBQUEscUJBQUQsR0FBeUI7TUFDekIsSUFBQyxDQUFBLGlDQUFELEdBQXFDO01BSXJDLHFCQUFBLENBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQVFwQixjQUFBO1VBQUEsRUFBQSxxRUFBdUMsQ0FBRTtVQUN6QyxXQUFBLEdBQWMsS0FBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLEVBQXZCO1VBRWQsSUFBRyxtQkFBSDtZQUNFLEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixXQUFXLENBQUMsaUJBQVosQ0FBOEIsU0FBQyxNQUFEO3FCQUMvQyxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQ7WUFEK0MsQ0FBOUIsQ0FBbkI7bUJBR0EsV0FBVyxDQUFDLFdBQVosQ0FBQSxDQUF5QixDQUFDLE9BQTFCLENBQWtDLFNBQUMsTUFBRDtxQkFBWSxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQ7WUFBWixDQUFsQyxFQUpGOztRQVhvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFSVzs7c0NBeUJiLFlBQUEsR0FBYyxTQUFDLE1BQUQ7QUFDWixVQUFBO01BQUMsS0FBTTtNQUNQLFVBQUEsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0M7UUFBQSxJQUFBLEVBQU0sTUFBTjtRQUFjLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBckI7UUFBaUMsTUFBQSxFQUFRLFdBQXpDO09BQWhDO01BQ2IsSUFBQyxDQUFBLHFCQUFzQixDQUFBLEVBQUEsQ0FBdkIsR0FBNkI7YUFDN0IsSUFBQyxDQUFBLGlDQUFrQyxDQUFBLEVBQUEsQ0FBbkMsR0FBeUMsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQy9ELEtBQUMsQ0FBQSxpQ0FBa0MsQ0FBQSxFQUFBLENBQUcsQ0FBQyxPQUF2QyxDQUFBO1VBRUEsT0FBTyxLQUFDLENBQUEscUJBQXNCLENBQUEsRUFBQTtpQkFDOUIsT0FBTyxLQUFDLENBQUEsaUNBQWtDLENBQUEsRUFBQTtRQUpxQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7SUFKN0I7O3NDQVVkLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtBQUFBO0FBQUEsV0FBQSxTQUFBOztRQUNFLElBQUMsQ0FBQSxpQ0FBa0MsQ0FBQSxFQUFBLENBQUcsQ0FBQyxPQUF2QyxDQUFBO1FBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtRQUVBLE9BQU8sSUFBQyxDQUFBLHFCQUFzQixDQUFBLEVBQUE7UUFDOUIsT0FBTyxJQUFDLENBQUEsaUNBQWtDLENBQUEsRUFBQTtBQUw1QzthQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBUk87Ozs7O0FBdkNYIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWluaW1hcEJvb2ttYXJrc0JpbmRpbmdcbiAgY29uc3RydWN0b3I6IChAbWluaW1hcCwgQGJvb2ttYXJrcykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVkaXRvciA9IEBtaW5pbWFwLmdldFRleHRFZGl0b3IoKVxuICAgIEBkZWNvcmF0aW9uc0J5TWFya2VySWQgPSB7fVxuICAgIEBkZWNvcmF0aW9uU3Vic2NyaXB0aW9uc0J5TWFya2VySWQgPSB7fVxuXG4gICAgIyBXZSBuZWVkIHRvIHdhaXQgdW50aWwgdGhlIGJvb2ttYXJrcyBwYWNrYWdlIGhhZCBjcmVhdGVkIGl0cyBtYXJrZXJcbiAgICAjIGxheWVyIGJlZm9yZSByZXRyaWV2aW5nIGl0cyBpZCBmcm9tIHRoZSBzdGF0ZS5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgICMgQWxzbywgdGFyZ2V0aW5nIHByaXZhdGUgcHJvcGVydGllcyBvbiBhdG9tLnBhY2thZ2VzIGlzIHZlcnkgYnJpdHRsZS5cbiAgICAgICMgRE8gTk9UIERPIFRIQVQhXG4gICAgICAjXG4gICAgICAjIElmIHdlIHJlYWxseSBoYXZlIHRvIGdldCB0aGUgbWFya2VyIGxheWVyIGlkIGZyb20gdGhlXG4gICAgICAjIHN0YXRlICh3aGljaCBjYW4gYWxyZWFkeSBicmVhayBlYXNpbHkpIGl0J3MgYmV0dGVyIHRvIGdldCBpdCBmcm9tIHRoZVxuICAgICAgIyBwYWNrYWdlIGBzZXJpYWxpemVgIG1ldGhvZCBzaW5jZSBpdCdzIGFuIEFQSSB0aGF0IGlzIHB1YmxpYyBhbmQgaXNcbiAgICAgICMgdW5saWtlbHkgdG8gY2hhbmdlIGluIGEgbmVhciBmdXR1cmUuXG4gICAgICBpZCA9IEBib29rbWFya3Muc2VyaWFsaXplKClbQGVkaXRvci5pZF0/Lm1hcmtlckxheWVySWRcbiAgICAgIG1hcmtlckxheWVyID0gQGVkaXRvci5nZXRNYXJrZXJMYXllcihpZClcblxuICAgICAgaWYgbWFya2VyTGF5ZXI/XG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBtYXJrZXJMYXllci5vbkRpZENyZWF0ZU1hcmtlciAobWFya2VyKSA9PlxuICAgICAgICAgIEBoYW5kbGVNYXJrZXIobWFya2VyKVxuXG4gICAgICAgIG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKCkuZm9yRWFjaCAobWFya2VyKSA9PiBAaGFuZGxlTWFya2VyKG1hcmtlcilcblxuICBoYW5kbGVNYXJrZXI6IChtYXJrZXIpIC0+XG4gICAge2lkfSA9IG1hcmtlclxuICAgIGRlY29yYXRpb24gPSBAbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHR5cGU6ICdsaW5lJywgY2xhc3M6ICdib29rbWFyaycsIHBsdWdpbjogJ2Jvb2ttYXJrcycpXG4gICAgQGRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF0gPSBkZWNvcmF0aW9uXG4gICAgQGRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF0gPSBkZWNvcmF0aW9uLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQGRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF0uZGlzcG9zZSgpXG5cbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uU3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdXG5cbiAgZGVzdHJveTogLT5cbiAgICBmb3IgaWQsZGVjb3JhdGlvbiBvZiBAZGVjb3JhdGlvbnNCeU1hcmtlcklkXG4gICAgICBAZGVjb3JhdGlvblN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXS5kaXNwb3NlKClcbiAgICAgIGRlY29yYXRpb24uZGVzdHJveSgpXG5cbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uU3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiJdfQ==
