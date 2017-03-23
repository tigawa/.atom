(function() {
  var CompositeDisposable, MinimapBookmarksBinding, requirePackages;

  CompositeDisposable = require('atom').CompositeDisposable;

  requirePackages = require('atom-utils').requirePackages;

  MinimapBookmarksBinding = null;

  module.exports = {
    active: false,
    isActive: function() {
      return this.active;
    },
    bindings: {},
    activate: function(state) {},
    consumeMinimapServiceV1: function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('bookmarks', this);
    },
    deactivate: function() {
      var ref;
      if ((ref = this.minimap) != null) {
        ref.unregisterPlugin('bookmarks');
      }
      return this.minimap = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      return requirePackages('bookmarks').then((function(_this) {
        return function(arg) {
          var bookmarks;
          bookmarks = arg[0];
          _this.subscriptions = new CompositeDisposable;
          _this.active = true;
          return _this.minimapsSubscription = _this.minimap.observeMinimaps(function(minimap) {
            var binding, subscription;
            if (MinimapBookmarksBinding == null) {
              MinimapBookmarksBinding = require('./minimap-bookmarks-binding');
            }
            binding = new MinimapBookmarksBinding(minimap, bookmarks);
            _this.bindings[minimap.id] = binding;
            return _this.subscriptions.add(subscription = minimap.onDidDestroy(function() {
              binding.destroy();
              _this.subscriptions.remove(subscription);
              subscription.dispose();
              return delete _this.bindings[minimap.id];
            }));
          });
        };
      })(this));
    },
    deactivatePlugin: function() {
      var binding, id, ref;
      if (!this.active) {
        return;
      }
      ref = this.bindings;
      for (id in ref) {
        binding = ref[id];
        binding.destroy();
      }
      this.bindings = {};
      this.active = false;
      this.minimapsSubscription.dispose();
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWJvb2ttYXJrcy9saWIvbWluaW1hcC1ib29rbWFya3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3ZCLGtCQUFtQixPQUFBLENBQVEsWUFBUjs7RUFFcEIsdUJBQUEsR0FBMEI7O0VBRTFCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsS0FBUjtJQUVBLFFBQUEsRUFBVSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FGVjtJQUlBLFFBQUEsRUFBVSxFQUpWO0lBTUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBLENBTlY7SUFRQSx1QkFBQSxFQUF5QixTQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsVUFBRDthQUN4QixJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsRUFBcUMsSUFBckM7SUFEdUIsQ0FSekI7SUFXQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQVEsQ0FBRSxnQkFBVixDQUEyQixXQUEzQjs7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXO0lBRkQsQ0FYWjtJQWVBLGNBQUEsRUFBZ0IsU0FBQTtNQUNkLElBQVUsSUFBQyxDQUFBLE1BQVg7QUFBQSxlQUFBOzthQUVBLGVBQUEsQ0FBZ0IsV0FBaEIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNoQyxjQUFBO1VBRGtDLFlBQUQ7VUFDakMsS0FBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtVQUNyQixLQUFDLENBQUEsTUFBRCxHQUFVO2lCQUVWLEtBQUMsQ0FBQSxvQkFBRCxHQUF3QixLQUFDLENBQUEsT0FBTyxDQUFDLGVBQVQsQ0FBeUIsU0FBQyxPQUFEO0FBQy9DLGdCQUFBOztjQUFBLDBCQUEyQixPQUFBLENBQVEsNkJBQVI7O1lBQzNCLE9BQUEsR0FBYyxJQUFBLHVCQUFBLENBQXdCLE9BQXhCLEVBQWlDLFNBQWpDO1lBQ2QsS0FBQyxDQUFBLFFBQVMsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFWLEdBQXdCO21CQUV4QixLQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsWUFBQSxHQUFlLE9BQU8sQ0FBQyxZQUFSLENBQXFCLFNBQUE7Y0FDckQsT0FBTyxDQUFDLE9BQVIsQ0FBQTtjQUNBLEtBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixZQUF0QjtjQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7cUJBQ0EsT0FBTyxLQUFDLENBQUEsUUFBUyxDQUFBLE9BQU8sQ0FBQyxFQUFSO1lBSm9DLENBQXJCLENBQWxDO1VBTCtDLENBQXpCO1FBSlE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO0lBSGMsQ0FmaEI7SUFpQ0EsZ0JBQUEsRUFBa0IsU0FBQTtBQUNoQixVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxNQUFmO0FBQUEsZUFBQTs7QUFFQTtBQUFBLFdBQUEsU0FBQTs7UUFBQSxPQUFPLENBQUMsT0FBUixDQUFBO0FBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxPQUF0QixDQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFQZ0IsQ0FqQ2xCOztBQU5GIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntyZXF1aXJlUGFja2FnZXN9ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxuTWluaW1hcEJvb2ttYXJrc0JpbmRpbmcgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZlOiBmYWxzZVxuXG4gIGlzQWN0aXZlOiAtPiBAYWN0aXZlXG5cbiAgYmluZGluZ3M6IHt9XG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cblxuICBjb25zdW1lTWluaW1hcFNlcnZpY2VWMTogKEBtaW5pbWFwKSAtPlxuICAgIEBtaW5pbWFwLnJlZ2lzdGVyUGx1Z2luICdib29rbWFya3MnLCB0aGlzXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAbWluaW1hcD8udW5yZWdpc3RlclBsdWdpbiAnYm9va21hcmtzJ1xuICAgIEBtaW5pbWFwID0gbnVsbFxuXG4gIGFjdGl2YXRlUGx1Z2luOiAtPlxuICAgIHJldHVybiBpZiBAYWN0aXZlXG5cbiAgICByZXF1aXJlUGFja2FnZXMoJ2Jvb2ttYXJrcycpLnRoZW4gKFtib29rbWFya3NdKSA9PlxuICAgICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgQGFjdGl2ZSA9IHRydWVcblxuICAgICAgQG1pbmltYXBzU3Vic2NyaXB0aW9uID0gQG1pbmltYXAub2JzZXJ2ZU1pbmltYXBzIChtaW5pbWFwKSA9PlxuICAgICAgICBNaW5pbWFwQm9va21hcmtzQmluZGluZyA/PSByZXF1aXJlICcuL21pbmltYXAtYm9va21hcmtzLWJpbmRpbmcnXG4gICAgICAgIGJpbmRpbmcgPSBuZXcgTWluaW1hcEJvb2ttYXJrc0JpbmRpbmcobWluaW1hcCwgYm9va21hcmtzKVxuICAgICAgICBAYmluZGluZ3NbbWluaW1hcC5pZF0gPSBiaW5kaW5nXG5cbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIHN1YnNjcmlwdGlvbiA9IG1pbmltYXAub25EaWREZXN0cm95ID0+XG4gICAgICAgICAgYmluZGluZy5kZXN0cm95KClcbiAgICAgICAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3Vic2NyaXB0aW9uKVxuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgICBkZWxldGUgQGJpbmRpbmdzW21pbmltYXAuaWRdXG5cbiAgZGVhY3RpdmF0ZVBsdWdpbjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVcblxuICAgIGJpbmRpbmcuZGVzdHJveSgpIGZvciBpZCxiaW5kaW5nIG9mIEBiaW5kaW5nc1xuICAgIEBiaW5kaW5ncyA9IHt9XG4gICAgQGFjdGl2ZSA9IGZhbHNlXG4gICAgQG1pbmltYXBzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuIl19
