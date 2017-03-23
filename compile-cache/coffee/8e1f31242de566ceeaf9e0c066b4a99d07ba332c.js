(function() {
  var ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, RENDERERS, SPEC_MODE, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = [], CompositeDisposable = ref[0], Emitter = ref[1];

  ref1 = require('atom-utils'), registerOrUpdateElement = ref1.registerOrUpdateElement, EventsDelegation = ref1.EventsDelegation;

  SPEC_MODE = atom.inSpecMode();

  RENDERERS = {
    'background': require('./renderers/background'),
    'outline': require('./renderers/outline'),
    'underline': require('./renderers/underline'),
    'dot': require('./renderers/dot'),
    'square-dot': require('./renderers/square-dot')
  };

  ColorMarkerElement = (function(superClass) {
    extend(ColorMarkerElement, superClass);

    function ColorMarkerElement() {
      return ColorMarkerElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorMarkerElement);

    ColorMarkerElement.prototype.renderer = new RENDERERS.background;

    ColorMarkerElement.prototype.createdCallback = function() {
      var ref2;
      if (Emitter == null) {
        ref2 = require('atom'), CompositeDisposable = ref2.CompositeDisposable, Emitter = ref2.Emitter;
      }
      this.emitter = new Emitter;
      return this.released = true;
    };

    ColorMarkerElement.prototype.attachedCallback = function() {};

    ColorMarkerElement.prototype.detachedCallback = function() {};

    ColorMarkerElement.prototype.onDidRelease = function(callback) {
      return this.emitter.on('did-release', callback);
    };

    ColorMarkerElement.prototype.setContainer = function(bufferElement1) {
      this.bufferElement = bufferElement1;
    };

    ColorMarkerElement.prototype.getModel = function() {
      return this.colorMarker;
    };

    ColorMarkerElement.prototype.setModel = function(colorMarker1) {
      var ref2;
      this.colorMarker = colorMarker1;
      if (!this.released) {
        return;
      }
      if (CompositeDisposable == null) {
        ref2 = require('atom'), CompositeDisposable = ref2.CompositeDisposable, Emitter = ref2.Emitter;
      }
      this.released = false;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.colorMarker.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.release();
        };
      })(this)));
      this.subscriptions.add(this.colorMarker.marker.onDidChange((function(_this) {
        return function(data) {
          var isValid;
          isValid = data.isValid;
          if (isValid) {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          } else {
            return _this.release();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (!_this.bufferElement.useNativeDecorations()) {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this, {
        click: (function(_this) {
          return function(e) {
            var colorBuffer;
            colorBuffer = _this.colorMarker.colorBuffer;
            if (colorBuffer == null) {
              return;
            }
            return colorBuffer.selectColorMarkerAndOpenPicker(_this.colorMarker);
          };
        })(this)
      }));
      return this.render();
    };

    ColorMarkerElement.prototype.destroy = function() {
      var ref2, ref3;
      if ((ref2 = this.parentNode) != null) {
        ref2.removeChild(this);
      }
      if ((ref3 = this.subscriptions) != null) {
        ref3.dispose();
      }
      return this.clear();
    };

    ColorMarkerElement.prototype.render = function() {
      var bufferElement, cls, colorMarker, i, k, len, ref2, ref3, region, regions, renderer, style, v;
      if (!((this.colorMarker != null) && (this.colorMarker.color != null) && (this.renderer != null))) {
        return;
      }
      ref2 = this, colorMarker = ref2.colorMarker, renderer = ref2.renderer, bufferElement = ref2.bufferElement;
      if (bufferElement.editor.isDestroyed()) {
        return;
      }
      this.innerHTML = '';
      ref3 = renderer.render(colorMarker), style = ref3.style, regions = ref3.regions, cls = ref3["class"];
      regions = (regions || []).filter(function(r) {
        return r != null;
      });
      if ((regions != null ? regions.some(function(r) {
        return r != null ? r.invalid : void 0;
      }) : void 0) && !SPEC_MODE) {
        return bufferElement.requestMarkerUpdate([this]);
      }
      for (i = 0, len = regions.length; i < len; i++) {
        region = regions[i];
        this.appendChild(region);
      }
      if (cls != null) {
        this.className = cls;
      } else {
        this.className = '';
      }
      if (style != null) {
        for (k in style) {
          v = style[k];
          this.style[k] = v;
        }
      } else {
        this.style.cssText = '';
      }
      return this.lastMarkerScreenRange = colorMarker.getScreenRange();
    };

    ColorMarkerElement.prototype.checkScreenRange = function() {
      if (!((this.colorMarker != null) && (this.lastMarkerScreenRange != null))) {
        return;
      }
      if (!this.lastMarkerScreenRange.isEqual(this.colorMarker.getScreenRange())) {
        return this.render();
      }
    };

    ColorMarkerElement.prototype.isReleased = function() {
      return this.released;
    };

    ColorMarkerElement.prototype.release = function(dispatchEvent) {
      var marker;
      if (dispatchEvent == null) {
        dispatchEvent = true;
      }
      if (this.released) {
        return;
      }
      this.subscriptions.dispose();
      marker = this.colorMarker;
      this.clear();
      if (dispatchEvent) {
        return this.emitter.emit('did-release', {
          marker: marker,
          view: this
        });
      }
    };

    ColorMarkerElement.prototype.clear = function() {
      this.subscriptions = null;
      this.colorMarker = null;
      this.released = true;
      this.innerHTML = '';
      this.className = '';
      return this.style.cssText = '';
    };

    return ColorMarkerElement;

  })(HTMLElement);

  module.exports = ColorMarkerElement = registerOrUpdateElement('pigments-color-marker', ColorMarkerElement.prototype);

  ColorMarkerElement.isNativeDecorationType = function(type) {
    return type === 'gutter' || type === 'native-background' || type === 'native-outline' || type === 'native-underline' || type === 'native-dot' || type === 'native-square-dot';
  };

  ColorMarkerElement.setMarkerType = function(markerType) {
    if (ColorMarkerElement.isNativeDecorationType(markerType)) {
      return;
    }
    if (RENDERERS[markerType] == null) {
      return;
    }
    this.prototype.rendererType = markerType;
    return this.prototype.renderer = new RENDERERS[markerType];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItbWFya2VyLWVsZW1lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0SEFBQTtJQUFBOzs7RUFBQSxNQUFpQyxFQUFqQyxFQUFDLDRCQUFELEVBQXNCOztFQUV0QixPQUE4QyxPQUFBLENBQVEsWUFBUixDQUE5QyxFQUFDLHNEQUFELEVBQTBCOztFQUUxQixTQUFBLEdBQVksSUFBSSxDQUFDLFVBQUwsQ0FBQTs7RUFDWixTQUFBLEdBQ0U7SUFBQSxZQUFBLEVBQWMsT0FBQSxDQUFRLHdCQUFSLENBQWQ7SUFDQSxTQUFBLEVBQVcsT0FBQSxDQUFRLHFCQUFSLENBRFg7SUFFQSxXQUFBLEVBQWEsT0FBQSxDQUFRLHVCQUFSLENBRmI7SUFHQSxLQUFBLEVBQU8sT0FBQSxDQUFRLGlCQUFSLENBSFA7SUFJQSxZQUFBLEVBQWMsT0FBQSxDQUFRLHdCQUFSLENBSmQ7OztFQU1JOzs7Ozs7O0lBQ0osZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsa0JBQTdCOztpQ0FFQSxRQUFBLEdBQVUsSUFBSSxTQUFTLENBQUM7O2lDQUV4QixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsSUFBdUQsZUFBdkQ7UUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDhDQUFELEVBQXNCLHVCQUF0Qjs7TUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7YUFDZixJQUFDLENBQUEsUUFBRCxHQUFZO0lBSkc7O2lDQU1qQixnQkFBQSxHQUFrQixTQUFBLEdBQUE7O2lDQUVsQixnQkFBQSxHQUFrQixTQUFBLEdBQUE7O2lDQUVsQixZQUFBLEdBQWMsU0FBQyxRQUFEO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixRQUEzQjtJQURZOztpQ0FHZCxZ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W11cblxue3JlZ2lzdGVyT3JVcGRhdGVFbGVtZW50LCBFdmVudHNEZWxlZ2F0aW9ufSA9IHJlcXVpcmUgJ2F0b20tdXRpbHMnXG5cblNQRUNfTU9ERSA9IGF0b20uaW5TcGVjTW9kZSgpXG5SRU5ERVJFUlMgPVxuICAnYmFja2dyb3VuZCc6IHJlcXVpcmUgJy4vcmVuZGVyZXJzL2JhY2tncm91bmQnXG4gICdvdXRsaW5lJzogcmVxdWlyZSAnLi9yZW5kZXJlcnMvb3V0bGluZSdcbiAgJ3VuZGVybGluZSc6IHJlcXVpcmUgJy4vcmVuZGVyZXJzL3VuZGVybGluZSdcbiAgJ2RvdCc6IHJlcXVpcmUgJy4vcmVuZGVyZXJzL2RvdCdcbiAgJ3NxdWFyZS1kb3QnOiByZXF1aXJlICcuL3JlbmRlcmVycy9zcXVhcmUtZG90J1xuXG5jbGFzcyBDb2xvck1hcmtlckVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudFxuICBFdmVudHNEZWxlZ2F0aW9uLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgcmVuZGVyZXI6IG5ldyBSRU5ERVJFUlMuYmFja2dyb3VuZFxuXG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJyB1bmxlc3MgRW1pdHRlcj9cblxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAcmVsZWFzZWQgPSB0cnVlXG5cbiAgYXR0YWNoZWRDYWxsYmFjazogLT5cblxuICBkZXRhY2hlZENhbGxiYWNrOiAtPlxuXG4gIG9uRGlkUmVsZWFzZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtcmVsZWFzZScsIGNhbGxiYWNrXG5cbiAgc2V0Q29udGFpbmVyOiAoQGJ1ZmZlckVsZW1lbnQpIC0+XG5cbiAgZ2V0TW9kZWw6IC0+IEBjb2xvck1hcmtlclxuXG4gIHNldE1vZGVsOiAoQGNvbG9yTWFya2VyKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHJlbGVhc2VkXG4gICAge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbScgdW5sZXNzIENvbXBvc2l0ZURpc3Bvc2FibGU/XG5cbiAgICBAcmVsZWFzZWQgPSBmYWxzZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yTWFya2VyLm1hcmtlci5vbkRpZERlc3Ryb3kgPT4gQHJlbGVhc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAY29sb3JNYXJrZXIubWFya2VyLm9uRGlkQ2hhbmdlIChkYXRhKSA9PlxuICAgICAge2lzVmFsaWR9ID0gZGF0YVxuICAgICAgaWYgaXNWYWxpZCB0aGVuIEBidWZmZXJFbGVtZW50LnJlcXVlc3RNYXJrZXJVcGRhdGUoW3RoaXNdKSBlbHNlIEByZWxlYXNlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5tYXJrZXJUeXBlJywgKHR5cGUpID0+XG4gICAgICBAYnVmZmVyRWxlbWVudC5yZXF1ZXN0TWFya2VyVXBkYXRlKFt0aGlzXSkgdW5sZXNzIEBidWZmZXJFbGVtZW50LnVzZU5hdGl2ZURlY29yYXRpb25zKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAc3Vic2NyaWJlVG8gdGhpcyxcbiAgICAgIGNsaWNrOiAoZSkgPT5cbiAgICAgICAgY29sb3JCdWZmZXIgPSBAY29sb3JNYXJrZXIuY29sb3JCdWZmZXJcblxuICAgICAgICByZXR1cm4gdW5sZXNzIGNvbG9yQnVmZmVyP1xuXG4gICAgICAgIGNvbG9yQnVmZmVyLnNlbGVjdENvbG9yTWFya2VyQW5kT3BlblBpY2tlcihAY29sb3JNYXJrZXIpXG5cbiAgICBAcmVuZGVyKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBwYXJlbnROb2RlPy5yZW1vdmVDaGlsZCh0aGlzKVxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAY2xlYXIoKVxuXG4gIHJlbmRlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBjb2xvck1hcmtlcj8gYW5kIEBjb2xvck1hcmtlci5jb2xvcj8gYW5kIEByZW5kZXJlcj9cblxuICAgIHtjb2xvck1hcmtlciwgcmVuZGVyZXIsIGJ1ZmZlckVsZW1lbnR9ID0gdGhpc1xuXG4gICAgcmV0dXJuIGlmIGJ1ZmZlckVsZW1lbnQuZWRpdG9yLmlzRGVzdHJveWVkKClcbiAgICBAaW5uZXJIVE1MID0gJydcbiAgICB7c3R5bGUsIHJlZ2lvbnMsIGNsYXNzOiBjbHN9ID0gcmVuZGVyZXIucmVuZGVyKGNvbG9yTWFya2VyKVxuXG4gICAgcmVnaW9ucyA9IChyZWdpb25zIG9yIFtdKS5maWx0ZXIgKHIpIC0+IHI/XG5cbiAgICBpZiByZWdpb25zPy5zb21lKChyKSAtPiByPy5pbnZhbGlkKSBhbmQgIVNQRUNfTU9ERVxuICAgICAgcmV0dXJuIGJ1ZmZlckVsZW1lbnQucmVxdWVzdE1hcmtlclVwZGF0ZShbdGhpc10pXG5cbiAgICBAYXBwZW5kQ2hpbGQocmVnaW9uKSBmb3IgcmVnaW9uIGluIHJlZ2lvbnNcbiAgICBpZiBjbHM/XG4gICAgICBAY2xhc3NOYW1lID0gY2xzXG4gICAgZWxzZVxuICAgICAgQGNsYXNzTmFtZSA9ICcnXG5cbiAgICBpZiBzdHlsZT9cbiAgICAgIEBzdHlsZVtrXSA9IHYgZm9yIGssdiBvZiBzdHlsZVxuICAgIGVsc2VcbiAgICAgIEBzdHlsZS5jc3NUZXh0ID0gJydcblxuICAgIEBsYXN0TWFya2VyU2NyZWVuUmFuZ2UgPSBjb2xvck1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgY2hlY2tTY3JlZW5SYW5nZTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBjb2xvck1hcmtlcj8gYW5kIEBsYXN0TWFya2VyU2NyZWVuUmFuZ2U/XG4gICAgdW5sZXNzIEBsYXN0TWFya2VyU2NyZWVuUmFuZ2UuaXNFcXVhbChAY29sb3JNYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKSlcbiAgICAgIEByZW5kZXIoKVxuXG4gIGlzUmVsZWFzZWQ6IC0+IEByZWxlYXNlZFxuXG4gIHJlbGVhc2U6IChkaXNwYXRjaEV2ZW50PXRydWUpIC0+XG4gICAgcmV0dXJuIGlmIEByZWxlYXNlZFxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIG1hcmtlciA9IEBjb2xvck1hcmtlclxuICAgIEBjbGVhcigpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLXJlbGVhc2UnLCB7bWFya2VyLCB2aWV3OiB0aGlzfSkgaWYgZGlzcGF0Y2hFdmVudFxuXG4gIGNsZWFyOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIEBjb2xvck1hcmtlciA9IG51bGxcbiAgICBAcmVsZWFzZWQgPSB0cnVlXG4gICAgQGlubmVySFRNTCA9ICcnXG4gICAgQGNsYXNzTmFtZSA9ICcnXG4gICAgQHN0eWxlLmNzc1RleHQgPSAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5Db2xvck1hcmtlckVsZW1lbnQgPVxucmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnQgJ3BpZ21lbnRzLWNvbG9yLW1hcmtlcicsIENvbG9yTWFya2VyRWxlbWVudC5wcm90b3R5cGVcblxuQ29sb3JNYXJrZXJFbGVtZW50LmlzTmF0aXZlRGVjb3JhdGlvblR5cGUgPSAodHlwZSkgLT5cbiAgdHlwZSBpbiBbXG4gICAgJ2d1dHRlcidcbiAgICAnbmF0aXZlLWJhY2tncm91bmQnXG4gICAgJ25hdGl2ZS1vdXRsaW5lJ1xuICAgICduYXRpdmUtdW5kZXJsaW5lJ1xuICAgICduYXRpdmUtZG90J1xuICAgICduYXRpdmUtc3F1YXJlLWRvdCdcbiAgXVxuXG5Db2xvck1hcmtlckVsZW1lbnQuc2V0TWFya2VyVHlwZSA9IChtYXJrZXJUeXBlKSAtPlxuICByZXR1cm4gaWYgQ29sb3JNYXJrZXJFbGVtZW50LmlzTmF0aXZlRGVjb3JhdGlvblR5cGUobWFya2VyVHlwZSlcbiAgcmV0dXJuIHVubGVzcyBSRU5ERVJFUlNbbWFya2VyVHlwZV0/XG5cbiAgQHByb3RvdHlwZS5yZW5kZXJlclR5cGUgPSBtYXJrZXJUeXBlXG4gIEBwcm90b3R5cGUucmVuZGVyZXIgPSBuZXcgUkVOREVSRVJTW21hcmtlclR5cGVdXG4iXX0=
