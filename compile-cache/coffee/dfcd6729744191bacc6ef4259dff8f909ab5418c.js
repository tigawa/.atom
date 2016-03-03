(function() {
  var CompositeDisposable, MinimapBookmarksBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  MinimapBookmarksBinding = null;

  module.exports = {
    active: false,
    isActive: function() {
      return this.active;
    },
    bindings: {},
    activate: function(state) {},
    consumeMinimapServiceV1: function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('bookmarks', this);
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.minimap) != null) {
        _ref.unregisterPlugin('bookmarks');
      }
      return this.minimap = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      this.subscriptions = new CompositeDisposable;
      this.active = true;
      return this.minimapsSubscription = this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var binding, subscription;
          if (MinimapBookmarksBinding == null) {
            MinimapBookmarksBinding = require('./minimap-bookmarks-binding');
          }
          binding = new MinimapBookmarksBinding(minimap);
          _this.bindings[minimap.id] = binding;
          return _this.subscriptions.add(subscription = minimap.onDidDestroy(function() {
            binding.destroy();
            _this.subscriptions.remove(subscription);
            subscription.dispose();
            return delete _this.bindings[minimap.id];
          }));
        };
      })(this));
    },
    deactivatePlugin: function() {
      var binding, id, _ref;
      if (!this.active) {
        return;
      }
      _ref = this.bindings;
      for (id in _ref) {
        binding = _ref[id];
        binding.destroy();
      }
      this.bindings = {};
      this.active = false;
      this.minimapsSubscription.dispose();
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWJvb2ttYXJrcy9saWIvbWluaW1hcC1ib29rbWFya3MuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRDQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSx1QkFBQSxHQUEwQixJQUYxQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLEtBQVI7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsT0FBSjtJQUFBLENBRlY7QUFBQSxJQUlBLFFBQUEsRUFBVSxFQUpWO0FBQUEsSUFNQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUEsQ0FOVjtBQUFBLElBUUEsdUJBQUEsRUFBeUIsU0FBRSxPQUFGLEdBQUE7QUFDdkIsTUFEd0IsSUFBQyxDQUFBLFVBQUEsT0FDekIsQ0FBQTthQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixXQUF4QixFQUFxQyxJQUFyQyxFQUR1QjtJQUFBLENBUnpCO0FBQUEsSUFXQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBOztZQUFRLENBQUUsZ0JBQVYsQ0FBMkIsV0FBM0I7T0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FGRDtJQUFBLENBWFo7QUFBQSxJQWVBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFGakIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUhWLENBQUE7YUFLQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUMvQyxjQUFBLHFCQUFBOztZQUFBLDBCQUEyQixPQUFBLENBQVEsNkJBQVI7V0FBM0I7QUFBQSxVQUNBLE9BQUEsR0FBYyxJQUFBLHVCQUFBLENBQXdCLE9BQXhCLENBRGQsQ0FBQTtBQUFBLFVBRUEsS0FBQyxDQUFBLFFBQVMsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFWLEdBQXdCLE9BRnhCLENBQUE7aUJBSUEsS0FBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLFlBQUEsR0FBZSxPQUFPLENBQUMsWUFBUixDQUFxQixTQUFBLEdBQUE7QUFDckQsWUFBQSxPQUFPLENBQUMsT0FBUixDQUFBLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLFlBQXRCLENBREEsQ0FBQTtBQUFBLFlBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBQSxDQUZBLENBQUE7bUJBR0EsTUFBQSxDQUFBLEtBQVEsQ0FBQSxRQUFTLENBQUEsT0FBTyxDQUFDLEVBQVIsRUFKb0M7VUFBQSxDQUFyQixDQUFsQyxFQUwrQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLEVBTlY7SUFBQSxDQWZoQjtBQUFBLElBZ0NBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLGlCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLE1BQWY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUVBO0FBQUEsV0FBQSxVQUFBOzJCQUFBO0FBQUEsUUFBQSxPQUFPLENBQUMsT0FBUixDQUFBLENBQUEsQ0FBQTtBQUFBLE9BRkE7QUFBQSxNQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFIWixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBSlYsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLE9BQXRCLENBQUEsQ0FMQSxDQUFBO2FBTUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsRUFQZ0I7SUFBQSxDQWhDbEI7R0FMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/minimap-bookmarks/lib/minimap-bookmarks.coffee
