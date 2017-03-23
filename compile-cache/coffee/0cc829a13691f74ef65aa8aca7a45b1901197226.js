(function() {
  var CompositeDisposable, Disposable, MinimapGitDiff, MinimapGitDiffBinding, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  MinimapGitDiffBinding = null;

  MinimapGitDiff = (function() {
    MinimapGitDiff.prototype.config = {
      useGutterDecoration: {
        type: 'boolean',
        "default": false,
        description: 'When enabled the gif diffs will be displayed as thin vertical lines on the left side of the minimap.'
      }
    };

    MinimapGitDiff.prototype.pluginActive = false;

    function MinimapGitDiff() {
      this.destroyBindings = bind(this.destroyBindings, this);
      this.createBindings = bind(this.createBindings, this);
      this.activateBinding = bind(this.activateBinding, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapGitDiff.prototype.isActive = function() {
      return this.pluginActive;
    };

    MinimapGitDiff.prototype.activate = function() {
      return this.bindings = new WeakMap;
    };

    MinimapGitDiff.prototype.consumeMinimapServiceV1 = function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('git-diff', this);
    };

    MinimapGitDiff.prototype.deactivate = function() {
      this.destroyBindings();
      return this.minimap = null;
    };

    MinimapGitDiff.prototype.activatePlugin = function() {
      var e;
      if (this.pluginActive) {
        return;
      }
      try {
        this.activateBinding();
        this.pluginActive = true;
        this.subscriptions.add(this.minimap.onDidActivate(this.activateBinding));
        return this.subscriptions.add(this.minimap.onDidDeactivate(this.destroyBindings));
      } catch (error) {
        e = error;
        return console.log(e);
      }
    };

    MinimapGitDiff.prototype.deactivatePlugin = function() {
      if (!this.pluginActive) {
        return;
      }
      this.pluginActive = false;
      this.subscriptions.dispose();
      return this.destroyBindings();
    };

    MinimapGitDiff.prototype.activateBinding = function() {
      if (this.getRepositories().length > 0) {
        this.createBindings();
      }
      return this.subscriptions.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          if (_this.getRepositories().length > 0) {
            return _this.createBindings();
          } else {
            return _this.destroyBindings();
          }
        };
      })(this)));
    };

    MinimapGitDiff.prototype.createBindings = function() {
      MinimapGitDiffBinding || (MinimapGitDiffBinding = require('./minimap-git-diff-binding'));
      return this.subscriptions.add(this.minimap.observeMinimaps((function(_this) {
        return function(o) {
          var binding, editor, minimap, ref1;
          minimap = (ref1 = o.view) != null ? ref1 : o;
          editor = minimap.getTextEditor();
          if (editor == null) {
            return;
          }
          binding = new MinimapGitDiffBinding(minimap);
          return _this.bindings.set(minimap, binding);
        };
      })(this)));
    };

    MinimapGitDiff.prototype.getRepositories = function() {
      return atom.project.getRepositories().filter(function(repo) {
        return repo != null;
      });
    };

    MinimapGitDiff.prototype.destroyBindings = function() {
      if (!((this.minimap != null) && (this.minimap.editorsMinimaps != null))) {
        return;
      }
      return this.minimap.editorsMinimaps.forEach((function(_this) {
        return function(minimap) {
          var ref1;
          if ((ref1 = _this.bindings.get(minimap)) != null) {
            ref1.destroy();
          }
          return _this.bindings["delete"](minimap);
        };
      })(this));
    };

    return MinimapGitDiff;

  })();

  module.exports = new MinimapGitDiff;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWdpdC1kaWZmL2xpYi9taW5pbWFwLWdpdC1kaWZmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkVBQUE7SUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDZDQUFELEVBQXNCOztFQUV0QixxQkFBQSxHQUF3Qjs7RUFFbEI7NkJBRUosTUFBQSxHQUNFO01BQUEsbUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHNHQUZiO09BREY7Ozs2QkFLRixZQUFBLEdBQWM7O0lBQ0Qsd0JBQUE7Ozs7TUFDWCxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO0lBRFY7OzZCQUdiLFFBQUEsR0FBVSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7OzZCQUVWLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJO0lBRFI7OzZCQUdWLHVCQUFBLEdBQXlCLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixVQUF4QixFQUFvQyxJQUFwQztJQUR1Qjs7NkJBR3pCLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLGVBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFGRDs7NkJBSVosY0FBQSxHQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLElBQVUsSUFBQyxDQUFBLFlBQVg7QUFBQSxlQUFBOztBQUVBO1FBQ0UsSUFBQyxDQUFBLGVBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCO1FBRWhCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBdUIsSUFBQyxDQUFBLGVBQXhCLENBQW5CO2VBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxPQUFPLENBQUMsZUFBVCxDQUF5QixJQUFDLENBQUEsZUFBMUIsQ0FBbkIsRUFMRjtPQUFBLGFBQUE7UUFNTTtlQUNKLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWixFQVBGOztJQUhjOzs2QkFZaEIsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFBLENBQWMsSUFBQyxDQUFBLFlBQWY7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO2FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQTtJQUxnQjs7NkJBT2xCLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQXFCLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBa0IsQ0FBQyxNQUFuQixHQUE0QixDQUFqRDtRQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsRUFBQTs7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFFL0MsSUFBRyxLQUFDLENBQUEsZUFBRCxDQUFBLENBQWtCLENBQUMsTUFBbkIsR0FBNEIsQ0FBL0I7bUJBQ0UsS0FBQyxDQUFBLGNBQUQsQ0FBQSxFQURGO1dBQUEsTUFBQTttQkFHRSxLQUFDLENBQUEsZUFBRCxDQUFBLEVBSEY7O1FBRitDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQUFuQjtJQUhlOzs2QkFVakIsY0FBQSxHQUFnQixTQUFBO01BQ2QsMEJBQUEsd0JBQTBCLE9BQUEsQ0FBUSw0QkFBUjthQUUxQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQzFDLGNBQUE7VUFBQSxPQUFBLG9DQUFtQjtVQUNuQixNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBQTtVQUVULElBQWMsY0FBZDtBQUFBLG1CQUFBOztVQUVBLE9BQUEsR0FBYyxJQUFBLHFCQUFBLENBQXNCLE9BQXRCO2lCQUNkLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE9BQWQsRUFBdUIsT0FBdkI7UUFQMEM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLENBQW5CO0lBSGM7OzZCQVloQixlQUFBLEdBQWlCLFNBQUE7YUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBQSxDQUE4QixDQUFDLE1BQS9CLENBQXNDLFNBQUMsSUFBRDtlQUFVO01BQVYsQ0FBdEM7SUFBSDs7NkJBRWpCLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQUEsQ0FBQSxDQUFjLHNCQUFBLElBQWMsc0NBQTVCLENBQUE7QUFBQSxlQUFBOzthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQXpCLENBQWlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO0FBQy9CLGNBQUE7O2dCQUFzQixDQUFFLE9BQXhCLENBQUE7O2lCQUNBLEtBQUMsQ0FBQSxRQUFRLEVBQUMsTUFBRCxFQUFULENBQWlCLE9BQWpCO1FBRitCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQztJQUZlOzs7Ozs7RUFNbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBSTtBQTdFckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5NaW5pbWFwR2l0RGlmZkJpbmRpbmcgPSBudWxsXG5cbmNsYXNzIE1pbmltYXBHaXREaWZmXG5cbiAgY29uZmlnOlxuICAgIHVzZUd1dHRlckRlY29yYXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gZW5hYmxlZCB0aGUgZ2lmIGRpZmZzIHdpbGwgYmUgZGlzcGxheWVkIGFzIHRoaW4gdmVydGljYWwgbGluZXMgb24gdGhlIGxlZnQgc2lkZSBvZiB0aGUgbWluaW1hcC4nXG5cbiAgcGx1Z2luQWN0aXZlOiBmYWxzZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgaXNBY3RpdmU6IC0+IEBwbHVnaW5BY3RpdmVcblxuICBhY3RpdmF0ZTogLT5cbiAgICBAYmluZGluZ3MgPSBuZXcgV2Vha01hcFxuXG4gIGNvbnN1bWVNaW5pbWFwU2VydmljZVYxOiAoQG1pbmltYXApIC0+XG4gICAgQG1pbmltYXAucmVnaXN0ZXJQbHVnaW4gJ2dpdC1kaWZmJywgdGhpc1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRlc3Ryb3lCaW5kaW5ncygpXG4gICAgQG1pbmltYXAgPSBudWxsXG5cbiAgYWN0aXZhdGVQbHVnaW46IC0+XG4gICAgcmV0dXJuIGlmIEBwbHVnaW5BY3RpdmVcblxuICAgIHRyeVxuICAgICAgQGFjdGl2YXRlQmluZGluZygpXG4gICAgICBAcGx1Z2luQWN0aXZlID0gdHJ1ZVxuXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub25EaWRBY3RpdmF0ZSBAYWN0aXZhdGVCaW5kaW5nXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub25EaWREZWFjdGl2YXRlIEBkZXN0cm95QmluZGluZ3NcbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmxvZyBlXG5cbiAgZGVhY3RpdmF0ZVBsdWdpbjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwbHVnaW5BY3RpdmVcblxuICAgIEBwbHVnaW5BY3RpdmUgPSBmYWxzZVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBkZXN0cm95QmluZGluZ3MoKVxuXG4gIGFjdGl2YXRlQmluZGluZzogPT5cbiAgICBAY3JlYXRlQmluZGluZ3MoKSBpZiBAZ2V0UmVwb3NpdG9yaWVzKCkubGVuZ3RoID4gMFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzID0+XG5cbiAgICAgIGlmIEBnZXRSZXBvc2l0b3JpZXMoKS5sZW5ndGggPiAwXG4gICAgICAgIEBjcmVhdGVCaW5kaW5ncygpXG4gICAgICBlbHNlXG4gICAgICAgIEBkZXN0cm95QmluZGluZ3MoKVxuXG4gIGNyZWF0ZUJpbmRpbmdzOiA9PlxuICAgIE1pbmltYXBHaXREaWZmQmluZGluZyB8fD0gcmVxdWlyZSAnLi9taW5pbWFwLWdpdC1kaWZmLWJpbmRpbmcnXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub2JzZXJ2ZU1pbmltYXBzIChvKSA9PlxuICAgICAgbWluaW1hcCA9IG8udmlldyA/IG9cbiAgICAgIGVkaXRvciA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvcigpXG5cbiAgICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuXG4gICAgICBiaW5kaW5nID0gbmV3IE1pbmltYXBHaXREaWZmQmluZGluZyBtaW5pbWFwXG4gICAgICBAYmluZGluZ3Muc2V0KG1pbmltYXAsIGJpbmRpbmcpXG5cbiAgZ2V0UmVwb3NpdG9yaWVzOiAtPiBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyIChyZXBvKSAtPiByZXBvP1xuXG4gIGRlc3Ryb3lCaW5kaW5nczogPT5cbiAgICByZXR1cm4gdW5sZXNzIEBtaW5pbWFwPyBhbmQgQG1pbmltYXAuZWRpdG9yc01pbmltYXBzP1xuICAgIEBtaW5pbWFwLmVkaXRvcnNNaW5pbWFwcy5mb3JFYWNoIChtaW5pbWFwKSA9PlxuICAgICAgQGJpbmRpbmdzLmdldChtaW5pbWFwKT8uZGVzdHJveSgpXG4gICAgICBAYmluZGluZ3MuZGVsZXRlKG1pbmltYXApXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1pbmltYXBHaXREaWZmXG4iXX0=
