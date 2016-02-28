(function() {
  var CompositeDisposable, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  path = require('path');

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        "default": path.join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint'),
        description: 'Path of the `jshint` executable.'
      },
      lintInlineJavaScript: {
        type: 'boolean',
        "default": false,
        description: 'Lint JavaScript inside `<script>` blocks in HTML or PHP files.'
      },
      disableWhenNoJshintrcFileInPath: {
        type: 'boolean',
        "default": false,
        description: 'Disable linter when no `.jshintrc` is found in project.'
      },
      lintJSXFiles: {
        title: 'Lint JSX Files',
        type: 'boolean',
        "default": false
      }
    },
    activate: function() {
      var scopeEmbedded, scopeJSX;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
      this.scopes = ['source.js', 'source.js.jsx', 'source.js-semantic'];
      scopeEmbedded = 'source.js.embedded.html';
      this.subscriptions.add(atom.config.observe('linter-jshint.lintInlineJavaScript', (function(_this) {
        return function(lintInlineJavaScript) {
          if (lintInlineJavaScript) {
            return _this.scopes.push(scopeEmbedded);
          } else {
            if (__indexOf.call(_this.scopes, scopeEmbedded) >= 0) {
              return _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
            }
          }
        };
      })(this)));
      scopeJSX = 'source.js.jsx';
      this.subscriptions.add(atom.config.observe('linter-jshint.lintJSXFiles', (function(_this) {
        return function(lintJSXFiles) {
          if (lintJSXFiles) {
            return _this.scopes.push(scopeJSX);
          } else {
            if (__indexOf.call(_this.scopes, lintJSXFiles) >= 0) {
              return _this.scopes.splice(_this.scopes.indexOf(scopeJSX), 1);
            }
          }
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', (function(_this) {
        return function(disableWhenNoJshintrcFileInPath) {
          return _this.disableWhenNoJshintrcFileInPath = disableWhenNoJshintrcFileInPath;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var helpers, provider, reporter;
      helpers = require('atom-linter');
      reporter = require('jshint-json');
      return provider = {
        name: 'JSHint',
        grammarScopes: this.scopes,
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var filePath, parameters, text;
            filePath = textEditor.getPath();
            if (_this.disableWhenNoJshintrcFileInPath && !helpers.find(filePath, '.jshintrc')) {
              return [];
            }
            text = textEditor.getText();
            parameters = ['--reporter', reporter, '--filename', filePath];
            if (textEditor.getGrammar().scopeName.indexOf('text.html') !== -1 && __indexOf.call(_this.scopes, 'source.js.embedded.html') >= 0) {
              parameters.push('--extract', 'always');
            }
            parameters.push('-');
            return helpers.execNode(_this.executablePath, parameters, {
              stdin: text
            }).then(function(output) {
              if (!output.length) {
                return [];
              }
              output = JSON.parse(output).result;
              output = output.filter(function(entry) {
                return entry.error.id;
              });
              return output.map(function(entry) {
                var error, pointEnd, pointStart, type;
                error = entry.error;
                pointStart = [error.line - 1, error.character - 1];
                pointEnd = [error.line - 1, error.character];
                type = error.code.substr(0, 1);
                return {
                  type: type === 'E' ? 'Error' : type === 'W' ? 'Warning' : 'Info',
                  text: "" + error.code + " - " + error.reason,
                  filePath: filePath,
                  range: [pointStart, pointEnd]
                };
              });
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQXJCLEVBQTJCLGNBQTNCLEVBQTJDLFFBQTNDLEVBQXFELEtBQXJELEVBQTRELFFBQTVELENBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxrQ0FGYjtPQURGO0FBQUEsTUFJQSxvQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxnRUFGYjtPQUxGO0FBQUEsTUFRQSwrQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx5REFGYjtPQVRGO0FBQUEsTUFZQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxnQkFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BYkY7S0FERjtBQUFBLElBa0JBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLHVCQUFBO0FBQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/linter-jshint/lib/main.coffee
