(function() {
  var BaseSide, OurSide, Side, TheirSide,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Side = (function() {
    function Side(originalText, ref, marker, refBannerMarker, position) {
      this.originalText = originalText;
      this.ref = ref;
      this.marker = marker;
      this.refBannerMarker = refBannerMarker;
      this.position = position;
      this.conflict = null;
      this.isDirty = false;
      this.followingMarker = null;
    }

    Side.prototype.resolve = function() {
      return this.conflict.resolveAs(this);
    };

    Side.prototype.wasChosen = function() {
      return this.conflict.resolution === this;
    };

    Side.prototype.lineClass = function() {
      if (this.wasChosen()) {
        return 'conflict-resolved';
      } else if (this.isDirty) {
        return 'conflict-dirty';
      } else {
        return "conflict-" + (this.klass());
      }
    };

    Side.prototype.markers = function() {
      return [this.marker, this.refBannerMarker];
    };

    Side.prototype.toString = function() {
      var chosenMark, dirtyMark, text;
      text = this.originalText.replace(/[\n\r]/, ' ');
      if (text.length > 20) {
        text = text.slice(0, 18) + "...";
      }
      dirtyMark = this.isDirty ? ' dirty' : '';
      chosenMark = this.wasChosen() ? ' chosen' : '';
      return "[" + (this.klass()) + ": " + text + " :" + dirtyMark + chosenMark + "]";
    };

    return Side;

  })();

  OurSide = (function(superClass) {
    extend(OurSide, superClass);

    function OurSide() {
      return OurSide.__super__.constructor.apply(this, arguments);
    }

    OurSide.prototype.site = function() {
      return 1;
    };

    OurSide.prototype.klass = function() {
      return 'ours';
    };

    OurSide.prototype.description = function() {
      return 'our changes';
    };

    OurSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-ours';
    };

    return OurSide;

  })(Side);

  TheirSide = (function(superClass) {
    extend(TheirSide, superClass);

    function TheirSide() {
      return TheirSide.__super__.constructor.apply(this, arguments);
    }

    TheirSide.prototype.site = function() {
      return 2;
    };

    TheirSide.prototype.klass = function() {
      return 'theirs';
    };

    TheirSide.prototype.description = function() {
      return 'their changes';
    };

    TheirSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-theirs';
    };

    return TheirSide;

  })(Side);

  BaseSide = (function(superClass) {
    extend(BaseSide, superClass);

    function BaseSide() {
      return BaseSide.__super__.constructor.apply(this, arguments);
    }

    BaseSide.prototype.site = function() {
      return 3;
    };

    BaseSide.prototype.klass = function() {
      return 'base';
    };

    BaseSide.prototype.description = function() {
      return 'merged base';
    };

    BaseSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-base';
    };

    return BaseSide;

  })(Side);

  module.exports = {
    Side: Side,
    OurSide: OurSide,
    TheirSide: TheirSide,
    BaseSide: BaseSide
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3NpZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrQ0FBQTtJQUFBOzs7RUFBTTtJQUNTLGNBQUMsWUFBRCxFQUFnQixHQUFoQixFQUFzQixNQUF0QixFQUErQixlQUEvQixFQUFpRCxRQUFqRDtNQUFDLElBQUMsQ0FBQSxlQUFEO01BQWUsSUFBQyxDQUFBLE1BQUQ7TUFBTSxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxrQkFBRDtNQUFrQixJQUFDLENBQUEsV0FBRDtNQUM1RCxJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBSFI7O21CQUtiLE9BQUEsR0FBUyxTQUFBO2FBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLElBQXBCO0lBQUg7O21CQUVULFNBQUEsR0FBVyxTQUFBO2FBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFWLEtBQXdCO0lBQTNCOzttQkFFWCxTQUFBLEdBQVcsU0FBQTtNQUNULElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFIO2VBQ0Usb0JBREY7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLE9BQUo7ZUFDSCxpQkFERztPQUFBLE1BQUE7ZUFHSCxXQUFBLEdBQVcsQ0FBQyxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUQsRUFIUjs7SUFISTs7bUJBUVgsT0FBQSxHQUFTLFNBQUE7YUFBRyxDQUFDLElBQUMsQ0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGVBQVg7SUFBSDs7bUJBRVQsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFzQixRQUF0QixFQUFnQyxHQUFoQztNQUNQLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxFQUFqQjtRQUNFLElBQUEsR0FBTyxJQUFLLGFBQUwsR0FBYyxNQUR2Qjs7TUFFQSxTQUFBLEdBQWUsSUFBQyxDQUFBLE9BQUosR0FBaUIsUUFBakIsR0FBK0I7TUFDM0MsVUFBQSxHQUFnQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQUgsR0FBcUIsU0FBckIsR0FBb0M7YUFDakQsR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFELENBQUgsR0FBYSxJQUFiLEdBQWlCLElBQWpCLEdBQXNCLElBQXRCLEdBQTBCLFNBQTFCLEdBQXNDLFVBQXRDLEdBQWlEO0lBTnpDOzs7Ozs7RUFTTjs7Ozs7OztzQkFFSixJQUFBLEdBQU0sU0FBQTthQUFHO0lBQUg7O3NCQUVOLEtBQUEsR0FBTyxTQUFBO2FBQUc7SUFBSDs7c0JBRVAsV0FBQSxHQUFhLFNBQUE7YUFBRztJQUFIOztzQkFFYixTQUFBLEdBQVcsU0FBQTthQUFHO0lBQUg7Ozs7S0FSUzs7RUFVaEI7Ozs7Ozs7d0JBRUosSUFBQSxHQUFNLFNBQUE7YUFBRztJQUFIOzt3QkFFTixLQUFBLEdBQU8sU0FBQTthQUFHO0lBQUg7O3dCQUVQLFdBQUEsR0FBYSxTQUFBO2FBQUc7SUFBSDs7d0JBRWIsU0FBQSxHQUFXLFNBQUE7YUFBRztJQUFIOzs7O0tBUlc7O0VBVWxCOzs7Ozs7O3VCQUVKLElBQUEsR0FBTSxTQUFBO2FBQUc7SUFBSDs7dUJBRU4sS0FBQSxHQUFPLFNBQUE7YUFBRztJQUFIOzt1QkFFUCxXQUFBLEdBQWEsU0FBQTthQUFHO0lBQUg7O3VCQUViLFNBQUEsR0FBVyxTQUFBO2FBQUc7SUFBSDs7OztLQVJVOztFQVV2QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsSUFBQSxFQUFNLElBQU47SUFDQSxPQUFBLEVBQVMsT0FEVDtJQUVBLFNBQUEsRUFBVyxTQUZYO0lBR0EsUUFBQSxFQUFVLFFBSFY7O0FBNURGIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU2lkZVxuICBjb25zdHJ1Y3RvcjogKEBvcmlnaW5hbFRleHQsIEByZWYsIEBtYXJrZXIsIEByZWZCYW5uZXJNYXJrZXIsIEBwb3NpdGlvbikgLT5cbiAgICBAY29uZmxpY3QgPSBudWxsXG4gICAgQGlzRGlydHkgPSBmYWxzZVxuICAgIEBmb2xsb3dpbmdNYXJrZXIgPSBudWxsXG5cbiAgcmVzb2x2ZTogLT4gQGNvbmZsaWN0LnJlc29sdmVBcyB0aGlzXG5cbiAgd2FzQ2hvc2VuOiAtPiBAY29uZmxpY3QucmVzb2x1dGlvbiBpcyB0aGlzXG5cbiAgbGluZUNsYXNzOiAtPlxuICAgIGlmIEB3YXNDaG9zZW4oKVxuICAgICAgJ2NvbmZsaWN0LXJlc29sdmVkJ1xuICAgIGVsc2UgaWYgQGlzRGlydHlcbiAgICAgICdjb25mbGljdC1kaXJ0eSdcbiAgICBlbHNlXG4gICAgICBcImNvbmZsaWN0LSN7QGtsYXNzKCl9XCJcblxuICBtYXJrZXJzOiAtPiBbQG1hcmtlciwgQHJlZkJhbm5lck1hcmtlcl1cblxuICB0b1N0cmluZzogLT5cbiAgICB0ZXh0ID0gQG9yaWdpbmFsVGV4dC5yZXBsYWNlKC9bXFxuXFxyXS8sICcgJylcbiAgICBpZiB0ZXh0Lmxlbmd0aCA+IDIwXG4gICAgICB0ZXh0ID0gdGV4dFswLi4xN10gKyBcIi4uLlwiXG4gICAgZGlydHlNYXJrID0gaWYgQGlzRGlydHkgdGhlbiAnIGRpcnR5JyBlbHNlICcnXG4gICAgY2hvc2VuTWFyayA9IGlmIEB3YXNDaG9zZW4oKSB0aGVuICcgY2hvc2VuJyBlbHNlICcnXG4gICAgXCJbI3tAa2xhc3MoKX06ICN7dGV4dH0gOiN7ZGlydHlNYXJrfSN7Y2hvc2VuTWFya31dXCJcblxuXG5jbGFzcyBPdXJTaWRlIGV4dGVuZHMgU2lkZVxuXG4gIHNpdGU6IC0+IDFcblxuICBrbGFzczogLT4gJ291cnMnXG5cbiAgZGVzY3JpcHRpb246IC0+ICdvdXIgY2hhbmdlcydcblxuICBldmVudE5hbWU6IC0+ICdtZXJnZS1jb25mbGljdHM6YWNjZXB0LW91cnMnXG5cbmNsYXNzIFRoZWlyU2lkZSBleHRlbmRzIFNpZGVcblxuICBzaXRlOiAtPiAyXG5cbiAga2xhc3M6IC0+ICd0aGVpcnMnXG5cbiAgZGVzY3JpcHRpb246IC0+ICd0aGVpciBjaGFuZ2VzJ1xuXG4gIGV2ZW50TmFtZTogLT4gJ21lcmdlLWNvbmZsaWN0czphY2NlcHQtdGhlaXJzJ1xuXG5jbGFzcyBCYXNlU2lkZSBleHRlbmRzIFNpZGVcblxuICBzaXRlOiAtPiAzXG5cbiAga2xhc3M6IC0+ICdiYXNlJ1xuXG4gIGRlc2NyaXB0aW9uOiAtPiAnbWVyZ2VkIGJhc2UnXG5cbiAgZXZlbnROYW1lOiAtPiAnbWVyZ2UtY29uZmxpY3RzOmFjY2VwdC1iYXNlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIFNpZGU6IFNpZGVcbiAgT3VyU2lkZTogT3VyU2lkZVxuICBUaGVpclNpZGU6IFRoZWlyU2lkZVxuICBCYXNlU2lkZTogQmFzZVNpZGVcbiJdfQ==
