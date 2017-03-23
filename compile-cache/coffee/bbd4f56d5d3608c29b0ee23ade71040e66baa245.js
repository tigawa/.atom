(function() {
  var CompositeDisposable, Entry, fs, path, settings;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

  settings = require('./settings');

  path = null;

  Entry = (function() {
    function Entry(editor, point, URI) {
      this.point = point;
      this.URI = URI;
      this.destroyed = false;
      if (!editor.isAlive()) {
        return;
      }
      this.editor = editor;
      this.subscriptions = new CompositeDisposable;
      this.marker = this.editor.markBufferPosition(this.point);
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function(arg) {
          var newHeadBufferPosition;
          newHeadBufferPosition = arg.newHeadBufferPosition;
          return _this.point = newHeadBufferPosition;
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.unSubscribe();
        };
      })(this)));
    }

    Entry.prototype.unSubscribe = function() {
      var ref;
      this.subscriptions.dispose();
      return ref = {}, this.editor = ref.editor, this.subscriptions = ref.subscriptions, ref;
    };

    Entry.prototype.destroy = function() {
      var ref, ref1;
      if (this.editor != null) {
        this.unSubscribe();
      }
      this.destroyed = true;
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return ref1 = {}, this.point = ref1.point, this.URI = ref1.URI, this.marker = ref1.marker, ref1;
    };

    Entry.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    Entry.prototype.isValid = function() {
      var ref;
      if (this.isDestroyed()) {
        return false;
      }
      if (settings.get('excludeClosedBuffer')) {
        return ((ref = this.editor) != null ? ref.isAlive() : void 0) && fs.existsSync(this.URI);
      } else {
        return fs.existsSync(this.URI);
      }
    };

    Entry.prototype.isAtSameRow = function(otherEntry) {
      if ((otherEntry.point != null) && (this.point != null)) {
        return (otherEntry.URI === this.URI) && (otherEntry.point.row === this.point.row);
      } else {
        return false;
      }
    };

    Entry.prototype.inspect = function() {
      var s;
      if (path == null) {
        path = require('path');
      }
      s = this.point + ", " + (path.basename(this.URI));
      if (!this.isValid()) {
        s += ' [invalid]';
      }
      return s;
    };

    return Entry;

  })();

  module.exports = Entry;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvZW50cnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsSUFBQSxHQUFPOztFQUtEO0lBQ1MsZUFBQyxNQUFELEVBQVMsS0FBVCxFQUFpQixHQUFqQjtNQUFTLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLE1BQUQ7TUFDNUIsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUEsQ0FBYyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixJQUFDLENBQUEsS0FBNUI7TUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ3JDLGNBQUE7VUFEdUMsd0JBQUQ7aUJBQ3RDLEtBQUMsQ0FBQSxLQUFELEdBQVM7UUFENEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQW5CO01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3RDLEtBQUMsQ0FBQSxXQUFELENBQUE7UUFEc0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQW5CO0lBVlc7O29CQWFiLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO2FBQ0EsTUFBNEIsRUFBNUIsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBLGFBQVgsRUFBQTtJQUZXOztvQkFJYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFrQixtQkFBbEI7UUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBQUE7O01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTs7V0FDTixDQUFFLE9BQVQsQ0FBQTs7YUFDQSxPQUEwQixFQUExQixFQUFDLElBQUMsQ0FBQSxhQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsV0FBQSxHQUFWLEVBQWUsSUFBQyxDQUFBLGNBQUEsTUFBaEIsRUFBQTtJQUpPOztvQkFNVCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQTtJQURVOztvQkFHYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFnQixJQUFDLENBQUEsV0FBRCxDQUFBLENBQWhCO0FBQUEsZUFBTyxNQUFQOztNQUVBLElBQUcsUUFBUSxDQUFDLEdBQVQsQ0FBYSxxQkFBYixDQUFIO2lEQUNTLENBQUUsT0FBVCxDQUFBLFdBQUEsSUFBdUIsRUFBRSxDQUFDLFVBQUgsQ0FBYyxJQUFDLENBQUEsR0FBZixFQUR6QjtPQUFBLE1BQUE7ZUFHRSxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUMsQ0FBQSxHQUFmLEVBSEY7O0lBSE87O29CQVFULFdBQUEsR0FBYSxTQUFDLFVBQUQ7TUFDWCxJQUFHLDBCQUFBLElBQXNCLG9CQUF6QjtlQUNFLENBQUMsVUFBVSxDQUFDLEdBQVgsS0FBa0IsSUFBQyxDQUFBLEdBQXBCLENBQUEsSUFBNkIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQWpCLEtBQXdCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBaEMsRUFEL0I7T0FBQSxNQUFBO2VBR0UsTUFIRjs7SUFEVzs7b0JBTWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBOztRQUFBLE9BQVEsT0FBQSxDQUFRLE1BQVI7O01BQ1IsQ0FBQSxHQUFPLElBQUMsQ0FBQSxLQUFGLEdBQVEsSUFBUixHQUFXLENBQUMsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFDLENBQUEsR0FBZixDQUFEO01BQ2pCLElBQUEsQ0FBeUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF6QjtRQUFBLENBQUEsSUFBSyxhQUFMOzthQUNBO0lBSk87Ozs7OztFQU1YLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdkRqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xucGF0aCA9IG51bGxcblxuIyBXcmFwcGVyIGZvciBQb2ludCBvciBNYXJrZXIuXG4jICBGb3IgYWxpdmUgZWRpdG9yLCB1c2UgTWFya2VyIHRvIHRyYWNrIHVwIHRvIGRhdGUgcG9zaXRpb24uXG4jICBGb3IgZGVzdHJveWVkIGVkaXRvciwgdXNlIFBvaW50LlxuY2xhc3MgRW50cnlcbiAgY29uc3RydWN0b3I6IChlZGl0b3IsIEBwb2ludCwgQFVSSSkgLT5cbiAgICBAZGVzdHJveWVkID0gZmFsc2VcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvci5pc0FsaXZlKClcblxuICAgIEBlZGl0b3IgPSBlZGl0b3JcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQG1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKEBwb2ludClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1hcmtlci5vbkRpZENoYW5nZSAoe25ld0hlYWRCdWZmZXJQb3NpdGlvbn0pID0+XG4gICAgICBAcG9pbnQgPSBuZXdIZWFkQnVmZmVyUG9zaXRpb25cblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQHVuU3Vic2NyaWJlKClcblxuICB1blN1YnNjcmliZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB7QGVkaXRvciwgQHN1YnNjcmlwdGlvbnN9ID0ge31cblxuICBkZXN0cm95OiAtPlxuICAgIEB1blN1YnNjcmliZSgpIGlmIEBlZGl0b3I/XG4gICAgQGRlc3Ryb3llZCA9IHRydWVcbiAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICB7QHBvaW50LCBAVVJJLCBAbWFya2VyfSA9IHt9XG5cbiAgaXNEZXN0cm95ZWQ6IC0+XG4gICAgQGRlc3Ryb3llZFxuXG4gIGlzVmFsaWQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEBpc0Rlc3Ryb3llZCgpXG5cbiAgICBpZiBzZXR0aW5ncy5nZXQoJ2V4Y2x1ZGVDbG9zZWRCdWZmZXInKVxuICAgICAgQGVkaXRvcj8uaXNBbGl2ZSgpIGFuZCBmcy5leGlzdHNTeW5jKEBVUkkpXG4gICAgZWxzZVxuICAgICAgZnMuZXhpc3RzU3luYyhAVVJJKVxuXG4gIGlzQXRTYW1lUm93OiAob3RoZXJFbnRyeSkgLT5cbiAgICBpZiBvdGhlckVudHJ5LnBvaW50PyBhbmQgQHBvaW50P1xuICAgICAgKG90aGVyRW50cnkuVVJJIGlzIEBVUkkpIGFuZCAob3RoZXJFbnRyeS5wb2ludC5yb3cgaXMgQHBvaW50LnJvdylcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGluc3BlY3Q6IC0+XG4gICAgcGF0aCA/PSByZXF1aXJlICdwYXRoJ1xuICAgIHMgPSBcIiN7QHBvaW50fSwgI3twYXRoLmJhc2VuYW1lKEBVUkkpfVwiXG4gICAgcyArPSAnIFtpbnZhbGlkXScgdW5sZXNzIEBpc1ZhbGlkKClcbiAgICBzXG5cbm1vZHVsZS5leHBvcnRzID0gRW50cnlcbiJdfQ==
