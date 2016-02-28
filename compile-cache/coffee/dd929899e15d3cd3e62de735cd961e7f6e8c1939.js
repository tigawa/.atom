(function() {
  var path, resolve, toInt;

  toInt = function(str) {
    return parseInt(str, 10);
  };

  resolve = require('resolve');

  path = require('path');

  module.exports = {
    scopes: ['source.coffee', 'source.litcoffee', 'source.coffee.jsx', 'source.coffee.angular'],
    _resolveCoffeeLint: function(filePath) {
      var e, expected;
      try {
        return path.dirname(resolve.sync('coffeelint/package.json', {
          basedir: path.dirname(filePath)
        }));
      } catch (_error) {
        e = _error;
        expected = "Cannot find module 'coffeelint/package.json'";
        if (e.message.slice(0, expected.length) === expected) {
          return 'coffeelint';
        }
        throw e;
      }
    },
    configImportsModules: function(config) {
      var rconfig, ruleName, _ref;
      for (ruleName in config) {
        rconfig = config[ruleName];
        if (rconfig.module != null) {
          return true;
        }
      }
      return (typeof userConfig !== "undefined" && userConfig !== null ? (_ref = userConfig.coffeelint) != null ? _ref.transforms : void 0 : void 0) != null;
    },
    canImportModules: function(coffeelint) {
      var major, minor, patch, _ref;
      _ref = coffeelint.VERSION.split('.').map(toInt), major = _ref[0], minor = _ref[1], patch = _ref[2];
      if (major > 1) {
        return true;
      }
      if (major === 1 && minor > 9) {
        return true;
      }
      if (major === 1 && minor === 9 && patch >= 5) {
        return true;
      }
      return false;
    },
    isCompatibleWithAtom: function(coffeelint) {
      var major, minor, patch, _ref;
      _ref = coffeelint.VERSION.split('.').map(toInt), major = _ref[0], minor = _ref[1], patch = _ref[2];
      if (major > 1) {
        return true;
      }
      if (major === 1 && minor > 9) {
        return true;
      }
      if (major === 1 && minor === 9 && patch >= 1) {
        return true;
      }
      return false;
    },
    lint: function(filePath, source, scopeName) {
      var coffeeLintPath, coffeelint, config, configFinder, e, isLiterate, major, minor, patch, result, showUpgradeError, _ref;
      isLiterate = scopeName === 'source.litcoffee';
      showUpgradeError = false;
      coffeeLintPath = this._resolveCoffeeLint(filePath);
      coffeelint = require(coffeeLintPath);
      _ref = coffeelint.VERSION.split('.').map(toInt), major = _ref[0], minor = _ref[1], patch = _ref[2];
      if (!this.isCompatibleWithAtom(coffeelint)) {
        coffeeLintPath = 'coffeelint';
        coffeelint = require(coffeeLintPath);
        showUpgradeError = true;
      }
      configFinder = require("" + coffeeLintPath + "/lib/configfinder");
      result = [];
      try {
        config = configFinder.getConfig(filePath);
        if (this.configImportsModules(config) && !this.canImportModules(coffeelint)) {
          showUpgradeError = true;
        } else {
          result = coffeelint.lint(source, config, isLiterate);
        }
      } catch (_error) {
        e = _error;
        console.log(e.message);
        console.log(e.stack);
        result.push({
          lineNumber: 1,
          level: 'error',
          message: "CoffeeLint crashed, see console for error details.",
          rule: 'none'
        });
      }
      if (showUpgradeError) {
        result = [
          {
            lineNumber: 1,
            level: 'error',
            message: "http://git.io/local_upgrade upgrade your project's CoffeeLint",
            rule: 'none'
          }
        ];
      }
      return result;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItY29mZmVlbGludC9saWIvY29yZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFFQTtBQUFBLE1BQUEsb0JBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsU0FBQyxHQUFELEdBQUE7V0FBUyxRQUFBLENBQVMsR0FBVCxFQUFjLEVBQWQsRUFBVDtFQUFBLENBQVIsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQURWLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FPRTtBQUFBLElBQUEsTUFBQSxFQUFRLENBQ04sZUFETSxFQUVOLGtCQUZNLEVBR04sbUJBSE0sRUFJTix1QkFKTSxDQUFSO0FBQUEsSUFPQSxrQkFBQSxFQUFvQixTQUFDLFFBQUQsR0FBQTtBQUNsQixVQUFBLFdBQUE7QUFBQTtBQUNFLGVBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFPLENBQUMsSUFBUixDQUFhLHlCQUFiLEVBQXdDO0FBQUEsVUFDMUQsT0FBQSxFQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQURpRDtTQUF4QyxDQUFiLENBQVAsQ0FERjtPQUFBLGNBQUE7QUFLRSxRQURJLFVBQ0osQ0FBQTtBQUFBLFFBQUEsUUFBQSxHQUFXLDhDQUFYLENBQUE7QUFDQSxRQUFBLElBQUcsQ0FBQyxDQUFDLE9BQVEsMEJBQVYsS0FBaUMsUUFBcEM7QUFDRSxpQkFBTyxZQUFQLENBREY7U0FEQTtBQUdBLGNBQU0sQ0FBTixDQVJGO09BRGtCO0lBQUEsQ0FQcEI7QUFBQSxJQWtCQSxvQkFBQSxFQUFzQixTQUFDLE1BQUQsR0FBQTtBQUNwQixVQUFBLHVCQUFBO0FBQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/linter-coffeelint/lib/core.coffee
