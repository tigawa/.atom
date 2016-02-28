(function() {
  var Path, Rails, fs, specAppPathsReg, specLibPathsReg, supportedPathsReg;

  fs = require('fs');

  Path = require('path');

  supportedPathsReg = function(paths) {
    return new RegExp("^\/(app|lib|" + (paths.join('|')) + ")\/", 'i');
  };

  specLibPathsReg = function(paths) {
    return new RegExp("^\/(" + (paths.join('|')) + ")\/lib\/", 'i');
  };

  specAppPathsReg = function(paths) {
    return new RegExp("^\/(" + (paths.join('|')) + ")\/", 'i');
  };

  module.exports = Rails = (function() {
    function Rails(root, specPaths, specDefault) {
      this.root = root;
      this.specPaths = specPaths;
      this.specDefault = specDefault;
    }

    Rails.prototype.toggleSpecFile = function(file) {
      var relativePath;
      relativePath = file.substring(this.root.length);
      if (!relativePath.match(supportedPathsReg(this.specPaths))) {
        return null;
      }
      if (relativePath.match(/_spec\.rb$/)) {
        return this.getRubyFile(relativePath);
      } else {
        return this.findSpecFile(relativePath);
      }
    };

    Rails.prototype.getRubyFile = function(path) {
      if (path.match(/^\/spec\/views/i)) {
        path = path.replace(/_spec\.rb$/, '');
      } else {
        path = path.replace(/_spec\.rb$/, '.rb');
      }
      path = path.replace(specLibPathsReg(this.specPaths), '/lib/');
      path = path.replace(specAppPathsReg(this.specPaths), '/app/');
      return Path.join(this.root, path);
    };

    Rails.prototype.findSpecFile = function(path) {
      var file, specPath, _i, _len, _ref;
      _ref = this.specPaths;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        specPath = _ref[_i];
        file = this.getSpecFile(path, specPath);
        if (fs.existsSync(file)) {
          return file;
        }
      }
      return this.getSpecFile(path, this.specDefault);
    };

    Rails.prototype.getSpecFile = function(path, specPath) {
      var newPath;
      if (path.match(/\.rb$/)) {
        path = path.replace(/\.rb$/, '_spec.rb');
      } else {
        path = path + '_spec.rb';
      }
      if (path.match(/^\/app\//)) {
        newPath = path.replace(/^\/app\//, "/" + specPath + "/");
      } else {
        newPath = path.replace(/^\/lib\//, "/" + specPath + "/lib/");
      }
      return Path.join(this.root, newPath);
    };

    return Rails;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy1yc3BlYy9saWIvcmFpbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9FQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixTQUFDLEtBQUQsR0FBQTtXQUNkLElBQUEsTUFBQSxDQUFRLGNBQUEsR0FBYSxDQUFDLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxDQUFELENBQWIsR0FBOEIsS0FBdEMsRUFBNEMsR0FBNUMsRUFEYztFQUFBLENBSHBCLENBQUE7O0FBQUEsRUFNQSxlQUFBLEdBQWtCLFNBQUMsS0FBRCxHQUFBO1dBQ1osSUFBQSxNQUFBLENBQVEsTUFBQSxHQUFLLENBQUMsS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLENBQUQsQ0FBTCxHQUFzQixVQUE5QixFQUF5QyxHQUF6QyxFQURZO0VBQUEsQ0FObEIsQ0FBQTs7QUFBQSxFQVNBLGVBQUEsR0FBa0IsU0FBQyxLQUFELEdBQUE7V0FDWixJQUFBLE1BQUEsQ0FBUSxNQUFBLEdBQUssQ0FBQyxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsQ0FBRCxDQUFMLEdBQXNCLEtBQTlCLEVBQW9DLEdBQXBDLEVBRFk7RUFBQSxDQVRsQixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsZUFBRSxJQUFGLEVBQVMsU0FBVCxFQUFxQixXQUFyQixHQUFBO0FBQW1DLE1BQWxDLElBQUMsQ0FBQSxPQUFBLElBQWlDLENBQUE7QUFBQSxNQUEzQixJQUFDLENBQUEsWUFBQSxTQUEwQixDQUFBO0FBQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-rspec/lib/rails.coffee
