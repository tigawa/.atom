
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var Beautifier, Uncrustify, cfg, expandHomeDir, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('../beautifier');

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  _ = require('lodash');

  module.exports = Uncrustify = (function(_super) {
    __extends(Uncrustify, _super);

    function Uncrustify() {
      return Uncrustify.__super__.constructor.apply(this, arguments);
    }

    Uncrustify.prototype.name = "Uncrustify";

    Uncrustify.prototype.options = {
      Apex: true,
      C: true,
      "C++": true,
      "C#": true,
      "Objective-C": true,
      D: true,
      Pawn: true,
      Vala: true,
      Java: true,
      Arduino: true
    };

    Uncrustify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var basePath, configPath, editor;
        configPath = options.configPath;
        if (!configPath) {
          return cfg(options, function(error, cPath) {
            if (error) {
              throw error;
            }
            return resolve(cPath);
          });
        } else {
          editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            basePath = path.dirname(editor.getPath());
            configPath = path.resolve(basePath, configPath);
            return resolve(configPath);
          } else {
            return reject(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
          }
        }
      }).then((function(_this) {
        return function(configPath) {
          var lang, outputFile;
          configPath = expandHomeDir(configPath);
          lang = "C";
          switch (language) {
            case "Apex":
              lang = "Apex";
              break;
            case "C":
              lang = "C";
              break;
            case "C++":
              lang = "CPP";
              break;
            case "C#":
              lang = "CS";
              break;
            case "Objective-C":
            case "Objective-C++":
              lang = "OC+";
              break;
            case "D":
              lang = "D";
              break;
            case "Pawn":
              lang = "PAWN";
              break;
            case "Vala":
              lang = "VALA";
              break;
            case "Java":
              lang = "JAVA";
              break;
            case "Arduino":
              lang = "CPP";
          }
          return _this.run("uncrustify", ["-c", configPath, "-f", _this.tempFile("input", text), "-o", outputFile = _this.tempFile("output", text), "-l", lang], {
            help: {
              link: "http://sourceforge.net/projects/uncrustify/"
            }
          }).then(function() {
            return _this.readFile(outputFile);
          });
        };
      })(this));
    };

    return Uncrustify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy91bmNydXN0aWZ5L2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxpQkFBUixDQVBoQixDQUFBOztBQUFBLEVBUUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBUkosQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxJQUFBLEdBQU0sWUFBTixDQUFBOztBQUFBLHlCQUNBLE9BQUEsR0FBUztBQUFBLE1BQ1AsSUFBQSxFQUFNLElBREM7QUFBQSxNQUVQLENBQUEsRUFBRyxJQUZJO0FBQUEsTUFHUCxLQUFBLEVBQU8sSUFIQTtBQUFBLE1BSVAsSUFBQSxFQUFNLElBSkM7QUFBQSxNQUtQLGFBQUEsRUFBZSxJQUxSO0FBQUEsTUFNUCxDQUFBLEVBQUcsSUFOSTtBQUFBLE1BT1AsSUFBQSxFQUFNLElBUEM7QUFBQSxNQVFQLElBQUEsRUFBTSxJQVJDO0FBQUEsTUFTUCxJQUFBLEVBQU0sSUFUQztBQUFBLE1BVVAsT0FBQSxFQUFTLElBVkY7S0FEVCxDQUFBOztBQUFBLHlCQWNBLFFBQUEsR0FBVSxTQUFD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

//# sourceURL=/Users/igawataiichi/.atom/packages/atom-beautify/src/beautifiers/uncrustify/index.coffee
