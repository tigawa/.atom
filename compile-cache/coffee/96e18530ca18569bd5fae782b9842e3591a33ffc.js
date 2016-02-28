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
      }
    },
    activate: function() {
      var scopeEmbedded;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
      scopeEmbedded = 'source.js.embedded.html';
      this.scopes = ['source.js', 'source.js.jsx', 'source.js-semantic'];
      this.subscriptions.add(atom.config.observe('linter-jshint.lintInlineJavaScript', (function(_this) {
        return function(lintInlineJavaScript) {
          if (lintInlineJavaScript) {
            if (__indexOf.call(_this.scopes, scopeEmbedded) < 0) {
              return _this.scopes.push(scopeEmbedded);
            }
          } else {
            if (__indexOf.call(_this.scopes, scopeEmbedded) >= 0) {
              return _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQXJCLEVBQTJCLGNBQTNCLEVBQTJDLFFBQTNDLEVBQXFELEtBQXJELEVBQTRELFFBQTVELENBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxrQ0FGYjtPQURGO0FBQUEsTUFJQSxvQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxnRUFGYjtPQUxGO0FBQUEsTUFRQSwrQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx5REFGYjtPQVRGO0tBREY7QUFBQSxJQWNBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw4QkFBcEIsRUFDakIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsY0FBRCxHQUFBO2lCQUNFLEtBQUMsQ0FBQSxjQUFELEdBQWtCLGVBRHBCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEaUIsQ0FBbkIsQ0FEQSxDQUFBO0FBQUEsTUFJQSxhQUFBLEdBQWdCLHlCQUpoQixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsV0FBRCxFQUFjLGVBQWQsRUFBK0Isb0JBQS9CLENBTFYsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixvQ0FBcEIsRUFDakIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsb0JBQUQsR0FBQTtBQUNFLFVBQUEsSUFBRyxvQkFBSDtBQUNFLFlBQUEsSUFBbUMsZUFBaUIsS0FBQyxDQUFBLE1BQWxCLEVBQUEsYUFBQSxLQUFuQztxQkFBQSxLQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxhQUFiLEVBQUE7YUFERjtXQUFBLE1BQUE7QUFHRSxZQUFBLElBQXFELGVBQWlCLEtBQUMsQ0FBQSxNQUFsQixFQUFBLGFBQUEsTUFBckQ7cUJBQUEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLGFBQWhCLENBQWYsRUFBK0MsQ0FBL0MsRUFBQTthQUhGO1dBREY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURpQixDQUFuQixDQU5BLENBQUE7YUFZQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLCtDQUFwQixFQUNqQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQywrQkFBRCxHQUFBO2lCQUNFLEtBQUMsQ0FBQSwrQkFBRCxHQUFtQyxnQ0FEckM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURpQixDQUFuQixFQWJRO0lBQUEsQ0FkVjtBQUFBLElBK0JBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURVO0lBQUEsQ0EvQlo7QUFBQSxJQWtDQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSwyQkFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSLENBQVYsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRFgsQ0FBQTthQUVBLFFBQUEsR0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLGFBQUEsRUFBZSxJQUFDLENBQUEsTUFEaEI7QUFBQSxRQUVBLEtBQUEsRUFBTyxNQUZQO0FBQUEsUUFHQSxTQUFBLEVBQVcsSUFIWDtBQUFBLFFBSUEsSUFBQSxFQUFNLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxVQUFELEdBQUE7QUFDSixnQkFBQSwwQkFBQTtBQUFBLFlBQUEsUUFBQSxHQUFXLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBWCxDQUFBO0FBQ0EsWUFBQSxJQUFHLEtBQUMsQ0FBQSwrQkFBRCxJQUFxQyxDQUFBLE9BQVcsQ0FBQyxJQUFSLENBQWEsUUFBYixFQUF1QixXQUF2QixDQUE1QztBQUNFLHFCQUFPLEVBQVAsQ0FERjthQURBO0FBQUEsWUFJQSxJQUFBLEdBQU8sVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUpQLENBQUE7QUFBQSxZQUtBLFVBQUEsR0FBYSxDQUFDLFlBQUQsRUFBZSxRQUFmLEVBQXlCLFlBQXpCLEVBQXVDLFFBQXZDLENBTGIsQ0FBQTtBQU1BLFlBQUEsSUFBRyxVQUFVLENBQUMsVUFBWCxDQUFBLENBQXVCLENBQUMsU0FBUyxDQUFDLE9BQWxDLENBQTBDLFdBQTFDLENBQUEsS0FBNEQsQ0FBQSxDQUE1RCxJQUFtRSxlQUE2QixLQUFDLENBQUEsTUFBOUIsRUFBQSx5QkFBQSxNQUF0RTtBQUNFLGNBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsV0FBaEIsRUFBNkIsUUFBN0IsQ0FBQSxDQURGO2FBTkE7QUFBQSxZQVFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEdBQWhCLENBUkEsQ0FBQTtBQVNBLG1CQUFPLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQUMsQ0FBQSxjQUFsQixFQUFrQyxVQUFsQyxFQUE4QztBQUFBLGNBQUMsS0FBQSxFQUFPLElBQVI7YUFBOUMsQ0FBNEQsQ0FBQyxJQUE3RCxDQUFrRSxTQUFDLE1BQUQsR0FBQTtBQUN2RSxjQUFBLElBQUEsQ0FBQSxNQUFhLENBQUMsTUFBZDtBQUNFLHVCQUFPLEVBQVAsQ0FERjtlQUFBO0FBQUEsY0FFQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFYLENBQWtCLENBQUMsTUFGNUIsQ0FBQTtBQUFBLGNBR0EsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxLQUFELEdBQUE7dUJBQVcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUF2QjtjQUFBLENBQWQsQ0FIVCxDQUFBO0FBSUEscUJBQU8sTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEtBQUQsR0FBQTtBQUNoQixvQkFBQSxpQ0FBQTtBQUFBLGdCQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FBZCxDQUFBO0FBQUEsZ0JBQ0EsVUFBQSxHQUFhLENBQUMsS0FBSyxDQUFDLElBQU4sR0FBYSxDQUFkLEVBQWlCLEtBQUssQ0FBQyxTQUFOLEdBQWtCLENBQW5DLENBRGIsQ0FBQTtBQUFBLGdCQUVBLFFBQUEsR0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFOLEdBQWEsQ0FBZCxFQUFpQixLQUFLLENBQUMsU0FBdkIsQ0FGWCxDQUFBO0FBQUEsZ0JBR0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBWCxDQUFrQixDQUFsQixFQUFxQixDQUFyQixDQUhQLENBQUE7QUFJQSx1QkFBTztBQUFBLGtCQUNMLElBQUEsRUFBUyxJQUFBLEtBQVEsR0FBWCxHQUFvQixPQUFwQixHQUFvQyxJQUFBLEtBQVEsR0FBWCxHQUFvQixTQUFwQixHQUFtQyxNQURyRTtBQUFBLGtCQUVMLElBQUEsRUFBTSxFQUFBLEdBQUcsS0FBSyxDQUFDLElBQVQsR0FBYyxLQUFkLEdBQW1CLEtBQUssQ0FBQyxNQUYxQjtBQUFBLGtCQUdMLFVBQUEsUUFISztBQUFBLGtCQUlMLEtBQUEsRUFBTyxDQUFDLFVBQUQsRUFBYSxRQUFiLENBSkY7aUJBQVAsQ0FMZ0I7Y0FBQSxDQUFYLENBQVAsQ0FMdUU7WUFBQSxDQUFsRSxDQUFQLENBVkk7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpOO1FBSlc7SUFBQSxDQWxDZjtHQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/linter-jshint/lib/main.coffee
