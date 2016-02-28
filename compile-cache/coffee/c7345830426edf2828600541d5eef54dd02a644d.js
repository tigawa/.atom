(function() {
  var DEFAULT_MAPPINGS, cson, fs, path;

  fs = require('fs');

  path = require('path');

  cson = require('season');

  DEFAULT_MAPPINGS = {
    'script/test': 'script/test',
    'script/cibuild': 'script/cibuild',
    'Makefile': 'make test',
    'test/**/*_test.rb': 'rake test',
    'spec/**/*_spec.rb': 'rake spec',
    'Gruntfile.*': 'grunt test',
    'gulpfile.*': 'gulp test',
    'test/mocha.opts': 'mocha',
    'deft-package.json': 'deft test',
    '*_test.go': 'go test -v .',
    'phpunit.xml': 'phpunit',
    'setup.py': 'python setup.py test',
    'Cargo.toml': 'cargo test',
    'package.json': 'npm test'
  };

  module.exports = {
    readOrInitConfig: function() {
      var fn;
      fn = path.join(atom.config.configDirPath, 'test-status.cson');
      if (fs.existsSync(fn)) {
        return cson.readFileSync(fn);
      } else {
        cson.writeFileSync(fn, DEFAULT_MAPPINGS);
        return DEFAULT_MAPPINGS;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90ZXN0LXN0YXR1cy9saWIvY29uZmlnLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTs7QUFBQSxFQUFBLEVBQUEsR0FBTyxPQUFBLENBQVEsSUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBSFAsQ0FBQTs7QUFBQSxFQU1BLGdCQUFBLEdBQW1CO0FBQUEsSUFDakIsYUFBQSxFQUFxQixhQURKO0FBQUEsSUFFakIsZ0JBQUEsRUFBcUIsZ0JBRko7QUFBQSxJQUlqQixVQUFBLEVBQXFCLFdBSko7QUFBQSxJQU1qQixtQkFBQSxFQUFxQixXQU5KO0FBQUEsSUFPakIsbUJBQUEsRUFBcUIsV0FQSjtBQUFBLElBU2pCLGFBQUEsRUFBcUIsWUFUSjtBQUFBLElBVWpCLFlBQUEsRUFBcUIsV0FWSjtBQUFBLElBV2pCLGlCQUFBLEVBQXFCLE9BWEo7QUFBQSxJQWFqQixtQkFBQSxFQUFxQixXQWJKO0FBQUEsSUFlakIsV0FBQSxFQUFxQixjQWZKO0FBQUEsSUFpQmpCLGFBQUEsRUFBcUIsU0FqQko7QUFBQSxJQW1CakIsVUFBQSxFQUFxQixzQkFuQko7QUFBQSxJQXFCakIsWUFBQSxFQUFxQixZQXJCSjtBQUFBLElBdUJqQixjQUFBLEVBQXFCLFVBdkJKO0dBTm5CLENBQUE7O0FBQUEsRUFnQ0EsTUFBTSxDQUFDLE9BQVAsR0FLRTtBQUFBLElBQUEsZ0JBQUEsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsRUFBQTtBQUFBLE1BQUEsRUFBQSxHQUFLLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUF0QixFQUFxQyxrQkFBckMsQ0FBTCxDQUFBO0FBRUEsTUFBQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsRUFBZCxDQUFIO2VBQ0UsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsRUFBbEIsRUFERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQUksQ0FBQyxhQUFMLENBQW1CLEVBQW5CLEVBQXVCLGdCQUF2QixDQUFBLENBQUE7ZUFDQSxpQkFKRjtPQUhnQjtJQUFBLENBQWxCO0dBckNGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/test-status/lib/config.coffee
