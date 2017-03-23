(function() {
  var CompositeDisposable, CoveringView, SideView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  CoveringView = require('./covering-view').CoveringView;

  SideView = (function(superClass) {
    extend(SideView, superClass);

    function SideView() {
      return SideView.__super__.constructor.apply(this, arguments);
    }

    SideView.content = function(side, editor) {
      return this.div({
        "class": "side " + (side.klass()) + " " + side.position + " ui-site-" + (side.site())
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'controls'
          }, function() {
            _this.label({
              "class": 'text-highlight'
            }, side.ref);
            _this.span({
              "class": 'text-subtle'
            }, "// " + (side.description()));
            return _this.span({
              "class": 'pull-right'
            }, function() {
              _this.button({
                "class": 'btn btn-xs inline-block-tight revert',
                click: 'revert',
                outlet: 'revertBtn'
              }, 'Revert');
              return _this.button({
                "class": 'btn btn-xs inline-block-tight',
                click: 'useMe',
                outlet: 'useMeBtn'
              }, 'Use Me');
            });
          });
        };
      })(this));
    };

    SideView.prototype.initialize = function(side1, editor) {
      this.side = side1;
      this.subs = new CompositeDisposable;
      this.decoration = null;
      SideView.__super__.initialize.call(this, editor);
      this.detectDirty();
      this.prependKeystroke(this.side.eventName(), this.useMeBtn);
      return this.prependKeystroke('merge-conflicts:revert-current', this.revertBtn);
    };

    SideView.prototype.attached = function() {
      SideView.__super__.attached.apply(this, arguments);
      this.decorate();
      return this.subs.add(this.side.conflict.onDidResolveConflict((function(_this) {
        return function() {
          _this.deleteMarker(_this.side.refBannerMarker);
          if (!_this.side.wasChosen()) {
            _this.deleteMarker(_this.side.marker);
          }
          _this.remove();
          return _this.cleanup();
        };
      })(this)));
    };

    SideView.prototype.cleanup = function() {
      SideView.__super__.cleanup.apply(this, arguments);
      return this.subs.dispose();
    };

    SideView.prototype.cover = function() {
      return this.side.refBannerMarker;
    };

    SideView.prototype.decorate = function() {
      var args, ref;
      if ((ref = this.decoration) != null) {
        ref.destroy();
      }
      if (this.side.conflict.isResolved() && !this.side.wasChosen()) {
        return;
      }
      args = {
        type: 'line',
        "class": this.side.lineClass()
      };
      return this.decoration = this.editor.decorateMarker(this.side.marker, args);
    };

    SideView.prototype.conflict = function() {
      return this.side.conflict;
    };

    SideView.prototype.isDirty = function() {
      return this.side.isDirty;
    };

    SideView.prototype.includesCursor = function(cursor) {
      var h, m, p, ref, t;
      m = this.side.marker;
      ref = [m.getHeadBufferPosition(), m.getTailBufferPosition()], h = ref[0], t = ref[1];
      p = cursor.getBufferPosition();
      return t.isLessThanOrEqual(p) && h.isGreaterThanOrEqual(p);
    };

    SideView.prototype.useMe = function() {
      this.editor.transact((function(_this) {
        return function() {
          return _this.side.resolve();
        };
      })(this));
      return this.decorate();
    };

    SideView.prototype.revert = function() {
      this.editor.setTextInBufferRange(this.side.marker.getBufferRange(), this.side.originalText);
      return this.decorate();
    };

    SideView.prototype.detectDirty = function() {
      var currentText;
      currentText = this.editor.getTextInBufferRange(this.side.marker.getBufferRange());
      this.side.isDirty = currentText !== this.side.originalText;
      this.decorate();
      this.removeClass('dirty');
      if (this.side.isDirty) {
        return this.addClass('dirty');
      }
    };

    SideView.prototype.toString = function() {
      return "{SideView of: " + this.side + "}";
    };

    return SideView;

  })(CoveringView);

  module.exports = {
    SideView: SideView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvc2lkZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkNBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN2QixlQUFnQixPQUFBLENBQVEsaUJBQVI7O0VBRVg7Ozs7Ozs7SUFFSixRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRCxFQUFPLE1BQVA7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFBLEdBQU8sQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFBLENBQUQsQ0FBUCxHQUFxQixHQUFyQixHQUF3QixJQUFJLENBQUMsUUFBN0IsR0FBc0MsV0FBdEMsR0FBZ0QsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQUQsQ0FBdkQ7T0FBTCxFQUE0RSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzFFLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQVA7V0FBTCxFQUF3QixTQUFBO1lBQ3RCLEtBQUMsQ0FBQSxLQUFELENBQU87Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO2FBQVAsRUFBZ0MsSUFBSSxDQUFDLEdBQXJDO1lBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDthQUFOLEVBQTRCLEtBQUEsR0FBSyxDQUFDLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBRCxDQUFqQzttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2FBQU4sRUFBMkIsU0FBQTtjQUN6QixLQUFDLENBQUEsTUFBRCxDQUFRO2dCQUFBLENBQUEsS0FBQSxDQUFB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ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntDb3ZlcmluZ1ZpZXd9ID0gcmVxdWlyZSAnLi9jb3ZlcmluZy12aWV3J1xuXG5jbGFzcyBTaWRlVmlldyBleHRlbmRzIENvdmVyaW5nVmlld1xuXG4gIEBjb250ZW50OiAoc2lkZSwgZWRpdG9yKSAtPlxuICAgIEBkaXYgY2xhc3M6IFwic2lkZSAje3NpZGUua2xhc3MoKX0gI3tzaWRlLnBvc2l0aW9ufSB1aS1zaXRlLSN7c2lkZS5zaXRlKCl9XCIsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnY29udHJvbHMnLCA9PlxuICAgICAgICBAbGFiZWwgY2xhc3M6ICd0ZXh0LWhpZ2hsaWdodCcsIHNpZGUucmVmXG4gICAgICAgIEBzcGFuIGNsYXNzOiAndGV4dC1zdWJ0bGUnLCBcIi8vICN7c2lkZS5kZXNjcmlwdGlvbigpfVwiXG4gICAgICAgIEBzcGFuIGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4teHMgaW5saW5lLWJsb2NrLXRpZ2h0IHJldmVydCcsIGNsaWNrOiAncmV2ZXJ0Jywgb3V0bGV0OiAncmV2ZXJ0QnRuJywgJ1JldmVydCdcbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi14cyBpbmxpbmUtYmxvY2stdGlnaHQnLCBjbGljazogJ3VzZU1lJywgb3V0bGV0OiAndXNlTWVCdG4nLCAnVXNlIE1lJ1xuXG4gIGluaXRpYWxpemU6IChAc2lkZSwgZWRpdG9yKSAtPlxuICAgIEBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGVjb3JhdGlvbiA9IG51bGxcblxuICAgIHN1cGVyIGVkaXRvclxuXG4gICAgQGRldGVjdERpcnR5KClcbiAgICBAcHJlcGVuZEtleXN0cm9rZSBAc2lkZS5ldmVudE5hbWUoKSwgQHVzZU1lQnRuXG4gICAgQHByZXBlbmRLZXlzdHJva2UgJ21lcmdlLWNvbmZsaWN0czpyZXZlcnQtY3VycmVudCcsIEByZXZlcnRCdG5cblxuICBhdHRhY2hlZDogLT5cbiAgICBzdXBlclxuXG4gICAgQGRlY29yYXRlKClcbiAgICBAc3Vicy5hZGQgQHNpZGUuY29uZmxpY3Qub25EaWRSZXNvbHZlQ29uZmxpY3QgPT5cbiAgICAgIEBkZWxldGVNYXJrZXIgQHNpZGUucmVmQmFubmVyTWFya2VyXG4gICAgICBAZGVsZXRlTWFya2VyIEBzaWRlLm1hcmtlciB1bmxlc3MgQHNpZGUud2FzQ2hvc2VuKClcbiAgICAgIEByZW1vdmUoKVxuICAgICAgQGNsZWFudXAoKVxuXG4gIGNsZWFudXA6IC0+XG4gICAgc3VwZXJcbiAgICBAc3Vicy5kaXNwb3NlKClcblxuICBjb3ZlcjogLT4gQHNpZGUucmVmQmFubmVyTWFya2VyXG5cbiAgZGVjb3JhdGU6IC0+XG4gICAgQGRlY29yYXRpb24/LmRlc3Ryb3koKVxuXG4gICAgcmV0dXJuIGlmIEBzaWRlLmNvbmZsaWN0LmlzUmVzb2x2ZWQoKSAmJiAhQHNpZGUud2FzQ2hvc2VuKClcblxuICAgIGFyZ3MgPVxuICAgICAgdHlwZTogJ2xpbmUnXG4gICAgICBjbGFzczogQHNpZGUubGluZUNsYXNzKClcbiAgICBAZGVjb3JhdGlvbiA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoQHNpZGUubWFya2VyLCBhcmdzKVxuXG4gIGNvbmZsaWN0OiAtPiBAc2lkZS5jb25mbGljdFxuXG4gIGlzRGlydHk6IC0+IEBzaWRlLmlzRGlydHlcblxuICBpbmNsdWRlc0N1cnNvcjogKGN1cnNvcikgLT5cbiAgICBtID0gQHNpZGUubWFya2VyXG4gICAgW2gsIHRdID0gW20uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCksIG0uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKCldXG4gICAgcCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgdC5pc0xlc3NUaGFuT3JFcXVhbChwKSBhbmQgaC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwKVxuXG4gIHVzZU1lOiAtPlxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIEBzaWRlLnJlc29sdmUoKVxuICAgIEBkZWNvcmF0ZSgpXG5cbiAgcmV2ZXJ0OiAtPlxuICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UgQHNpZGUubWFya2VyLmdldEJ1ZmZlclJhbmdlKCksIEBzaWRlLm9yaWdpbmFsVGV4dFxuICAgIEBkZWNvcmF0ZSgpXG5cbiAgZGV0ZWN0RGlydHk6IC0+XG4gICAgY3VycmVudFRleHQgPSBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlIEBzaWRlLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgQHNpZGUuaXNEaXJ0eSA9IGN1cnJlbnRUZXh0IGlzbnQgQHNpZGUub3JpZ2luYWxUZXh0XG5cbiAgICBAZGVjb3JhdGUoKVxuXG4gICAgQHJlbW92ZUNsYXNzICdkaXJ0eSdcbiAgICBAYWRkQ2xhc3MgJ2RpcnR5JyBpZiBAc2lkZS5pc0RpcnR5XG5cbiAgdG9TdHJpbmc6IC0+IFwie1NpZGVWaWV3IG9mOiAje0BzaWRlfX1cIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIFNpZGVWaWV3OiBTaWRlVmlld1xuIl19
