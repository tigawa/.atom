function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

'use babel';

module.exports = {
  config: {
    executablePath: {
      type: 'string',
      'default': _path2['default'].join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint'),
      description: 'Path of the `jshint` node script'
    },
    lintInlineJavaScript: {
      type: 'boolean',
      'default': false,
      description: 'Lint JavaScript inside `<script>` blocks in HTML or PHP files.'
    },
    disableWhenNoJshintrcFileInPath: {
      type: 'boolean',
      'default': false,
      description: 'Disable linter when no `.jshintrc` is found in project.'
    },
    jshintFileName: {
      type: 'string',
      'default': '.jshintrc',
      description: 'jshint file name'
    }
  },

  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-jshint');

    this.scopes = ['source.js', 'source.js-semantic'];
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', function (executablePath) {
      _this.executablePath = executablePath;
    }));
    this.subscriptions.add(atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', function (disableWhenNoJshintrcFileInPath) {
      _this.disableWhenNoJshintrcFileInPath = disableWhenNoJshintrcFileInPath;
    }));

    this.subscriptions.add(atom.config.observe('linter-jshint.jshintFileName', function (jshintFileName) {
      _this.jshintFileName = jshintFileName;
    }));

    var scopeEmbedded = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-jshint.lintInlineJavaScript', function (lintInlineJavaScript) {
      _this.lintInlineJavaScript = lintInlineJavaScript;
      if (lintInlineJavaScript) {
        _this.scopes.push(scopeEmbedded);
      } else if (_this.scopes.indexOf(scopeEmbedded) !== -1) {
        _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    var Reporter = require('jshint-json');

    return {
      name: 'JSHint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var results = [];
        var filePath = textEditor.getPath();
        var fileContents = textEditor.getText();
        var parameters = ['--reporter', Reporter, '--filename', filePath];

        var configFile = yield Helpers.findCachedAsync(_path2['default'].dirname(filePath), _this2.jshintFileName);

        if (configFile) {
          parameters.push('--config', configFile);
        } else if (_this2.disableWhenNoJshintrcFileInPath) {
          return results;
        }

        if (_this2.lintInlineJavaScript && textEditor.getGrammar().scopeName.indexOf('text.html') !== -1) {
          parameters.push('--extract', 'always');
        }
        parameters.push('-');

        var execOpts = { stdin: fileContents, ignoreExitCode: true };
        var result = yield Helpers.execNode(_this2.executablePath, parameters, execOpts);

        if (textEditor.getText() !== fileContents) {
          // File has changed since the lint was triggered, tell Linter not to update
          return null;
        }

        var parsed = undefined;
        try {
          parsed = JSON.parse(result);
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error('[Linter-JSHint]', _, result);
          atom.notifications.addWarning('[Linter-JSHint]', { detail: 'JSHint return an invalid response, check your console for more info' });
          return results;
        }

        Object.keys(parsed.result).forEach(function (entryID) {
          var entry = parsed.result[entryID];

          if (!entry.error.id) {
            return;
          }

          var error = entry.error;
          var errorType = error.code.substr(0, 1);
          var type = 'Info';
          if (errorType === 'E') {
            type = 'Error';
          } else if (errorType === 'W') {
            type = 'Warning';
          }
          var errorLine = error.line > 0 ? error.line - 1 : 0;
          var range = undefined;

          // TODO: Remove workaround of jshint/jshint#2846
          if (error.character === null) {
            range = Helpers.generateRange(textEditor, errorLine);
          } else {
            var character = error.character > 0 ? error.character - 1 : 0;
            var line = errorLine;
            var buffer = textEditor.getBuffer();
            var maxLine = buffer.getLineCount();
            // TODO: Remove workaround of jshint/jshint#2894
            if (errorLine >= maxLine) {
              line = maxLine;
            }
            var maxCharacter = buffer.lineLengthForRow(line);
            // TODO: Remove workaround of jquery/esprima#1457
            if (character > maxCharacter) {
              character = maxCharacter;
            }
            range = Helpers.generateRange(textEditor, line, character);
          }

          results.push({
            type: type,
            text: error.code + ' - ' + error.reason,
            filePath: filePath,
            range: range
          });
        });
        return results;
      })
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUlpQixNQUFNOzs7Ozs7b0JBRWEsTUFBTTs7QUFOMUMsV0FBVyxDQUFDOztBQVFaLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixRQUFNLEVBQUU7QUFDTixrQkFBYyxFQUFFO0FBQ2QsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7QUFDOUUsaUJBQVcsRUFBRSxrQ0FBa0M7S0FDaEQ7QUFDRCx3QkFBb0IsRUFBRTtBQUNwQixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7QUFDZCxpQkFBVyxFQUFFLGdFQUFnRTtLQUM5RTtBQUNELG1DQUErQixFQUFFO0FBQy9CLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztBQUNkLGlCQUFXLEVBQUUseURBQXlEO0tBQ3ZFO0FBQ0Qsa0JBQWMsRUFBRTtBQUNkLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsV0FBVztBQUNwQixpQkFBVyxFQUFFLGtCQUFrQjtLQUNoQztHQUNGOztBQUVELFVBQVEsRUFBQSxvQkFBRzs7O0FBQ1QsV0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUV0RCxRQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDbEQsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFDLGNBQWMsRUFBSztBQUM3RixZQUFLLGNBQWMsR0FBRyxj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QUFDO09BQ2hCLENBQUE7S0FDRixDQUFDO0dBQ0g7Q0FDRixDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vKiBAZmxvdyAqL1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjb25maWc6IHtcbiAgICBleGVjdXRhYmxlUGF0aDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiBQYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ2pzaGludCcsICdiaW4nLCAnanNoaW50JyksXG4gICAgICBkZXNjcmlwdGlvbjogJ1BhdGggb2YgdGhlIGBqc2hpbnRgIG5vZGUgc2NyaXB0JyxcbiAgICB9LFxuICAgIGxpbnRJbmxpbmVKYXZhU2NyaXB0OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTGludCBKYXZhU2NyaXB0IGluc2lkZSBgPHNjcmlwdD5gIGJsb2NrcyBpbiBIVE1MIG9yIFBIUCBmaWxlcy4nLFxuICAgIH0sXG4gICAgZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc2FibGUgbGludGVyIHdoZW4gbm8gYC5qc2hpbnRyY2AgaXMgZm91bmQgaW4gcHJvamVjdC4nLFxuICAgIH0sXG4gICAganNoaW50RmlsZU5hbWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJy5qc2hpbnRyYycsXG4gICAgICBkZXNjcmlwdGlvbjogJ2pzaGludCBmaWxlIG5hbWUnLFxuICAgIH0sXG4gIH0sXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItanNoaW50Jyk7XG5cbiAgICB0aGlzLnNjb3BlcyA9IFsnc291cmNlLmpzJywgJ3NvdXJjZS5qcy1zZW1hbnRpYyddO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmV4ZWN1dGFibGVQYXRoJywgKGV4ZWN1dGFibGVQYXRoKSA9PiB7XG4gICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gZXhlY3V0YWJsZVBhdGg7XG4gICAgfSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGgnLFxuICAgICAgICAoZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCkgPT4ge1xuICAgICAgICAgIHRoaXMuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCA9IGRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGg7XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgICk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQuanNoaW50RmlsZU5hbWUnLCAoanNoaW50RmlsZU5hbWUpID0+IHtcbiAgICAgIHRoaXMuanNoaW50RmlsZU5hbWUgPSBqc2hpbnRGaWxlTmFtZTtcbiAgICB9KSk7XG5cbiAgICBjb25zdCBzY29wZUVtYmVkZGVkID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQubGludElubGluZUphdmFTY3JpcHQnLFxuICAgICAgKGxpbnRJbmxpbmVKYXZhU2NyaXB0KSA9PiB7XG4gICAgICAgIHRoaXMubGludElubGluZUphdmFTY3JpcHQgPSBsaW50SW5saW5lSmF2YVNjcmlwdDtcbiAgICAgICAgaWYgKGxpbnRJbmxpbmVKYXZhU2NyaXB0KSB7XG4gICAgICAgICAgdGhpcy5zY29wZXMucHVzaChzY29wZUVtYmVkZGVkKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNjb3Blcy5pbmRleE9mKHNjb3BlRW1iZWRkZWQpICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuc2NvcGVzLnNwbGljZSh0aGlzLnNjb3Blcy5pbmRleE9mKHNjb3BlRW1iZWRkZWQpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICBjb25zdCBIZWxwZXJzID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKTtcbiAgICBjb25zdCBSZXBvcnRlciA9IHJlcXVpcmUoJ2pzaGludC1qc29uJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0pTSGludCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiB0aGlzLnNjb3BlcyxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICBsaW50OiBhc3luYyAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gWyctLXJlcG9ydGVyJywgUmVwb3J0ZXIsICctLWZpbGVuYW1lJywgZmlsZVBhdGhdO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBhd2FpdCBIZWxwZXJzLmZpbmRDYWNoZWRBc3luYyhcbiAgICAgICAgICBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCB0aGlzLmpzaGludEZpbGVOYW1lLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChjb25maWdGaWxlKSB7XG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWNvbmZpZycsIGNvbmZpZ0ZpbGUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGludElubGluZUphdmFTY3JpcHQgJiZcbiAgICAgICAgICB0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZigndGV4dC5odG1sJykgIT09IC0xXG4gICAgICAgICkge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1leHRyYWN0JywgJ2Fsd2F5cycpO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLScpO1xuXG4gICAgICAgIGNvbnN0IGV4ZWNPcHRzID0geyBzdGRpbjogZmlsZUNvbnRlbnRzLCBpZ25vcmVFeGl0Q29kZTogdHJ1ZSB9O1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBIZWxwZXJzLmV4ZWNOb2RlKFxuICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVBhdGgsIHBhcmFtZXRlcnMsIGV4ZWNPcHRzLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0ZXh0RWRpdG9yLmdldFRleHQoKSAhPT0gZmlsZUNvbnRlbnRzKSB7XG4gICAgICAgICAgLy8gRmlsZSBoYXMgY2hhbmdlZCBzaW5jZSB0aGUgbGludCB3YXMgdHJpZ2dlcmVkLCB0ZWxsIExpbnRlciBub3QgdG8gdXBkYXRlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhcnNlZCA9IEpTT04ucGFyc2UocmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0xpbnRlci1KU0hpbnRdJywgXywgcmVzdWx0KTtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnW0xpbnRlci1KU0hpbnRdJyxcbiAgICAgICAgICAgIHsgZGV0YWlsOiAnSlNIaW50IHJldHVybiBhbiBpbnZhbGlkIHJlc3BvbnNlLCBjaGVjayB5b3VyIGNvbnNvbGUgZm9yIG1vcmUgaW5mbycgfSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXMocGFyc2VkLnJlc3VsdCkuZm9yRWFjaCgoZW50cnlJRCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVudHJ5ID0gcGFyc2VkLnJlc3VsdFtlbnRyeUlEXTtcblxuICAgICAgICAgIGlmICghZW50cnkuZXJyb3IuaWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBlcnJvciA9IGVudHJ5LmVycm9yO1xuICAgICAgICAgIGNvbnN0IGVycm9yVHlwZSA9IGVycm9yLmNvZGUuc3Vic3RyKDAsIDEpO1xuICAgICAgICAgIGxldCB0eXBlID0gJ0luZm8nO1xuICAgICAgICAgIGlmIChlcnJvclR5cGUgPT09ICdFJykge1xuICAgICAgICAgICAgdHlwZSA9ICdFcnJvcic7XG4gICAgICAgICAgfSBlbHNlIGlmIChlcnJvclR5cGUgPT09ICdXJykge1xuICAgICAgICAgICAgdHlwZSA9ICdXYXJuaW5nJztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXJyb3JMaW5lID0gZXJyb3IubGluZSA+IDAgPyBlcnJvci5saW5lIC0gMSA6IDA7XG4gICAgICAgICAgbGV0IHJhbmdlO1xuXG4gICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIHdvcmthcm91bmQgb2YganNoaW50L2pzaGludCMyODQ2XG4gICAgICAgICAgaWYgKGVycm9yLmNoYXJhY3RlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmFuZ2UgPSBIZWxwZXJzLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgZXJyb3JMaW5lKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNoYXJhY3RlciA9IGVycm9yLmNoYXJhY3RlciA+IDAgPyBlcnJvci5jaGFyYWN0ZXIgLSAxIDogMDtcbiAgICAgICAgICAgIGxldCBsaW5lID0gZXJyb3JMaW5lO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKTtcbiAgICAgICAgICAgIGNvbnN0IG1heExpbmUgPSBidWZmZXIuZ2V0TGluZUNvdW50KCk7XG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgd29ya2Fyb3VuZCBvZiBqc2hpbnQvanNoaW50IzI4OTRcbiAgICAgICAgICAgIGlmIChlcnJvckxpbmUgPj0gbWF4TGluZSkge1xuICAgICAgICAgICAgICBsaW5lID0gbWF4TGluZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1heENoYXJhY3RlciA9IGJ1ZmZlci5saW5lTGVuZ3RoRm9yUm93KGxpbmUpO1xuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIHdvcmthcm91bmQgb2YganF1ZXJ5L2VzcHJpbWEjMTQ1N1xuICAgICAgICAgICAgaWYgKGNoYXJhY3RlciA+IG1heENoYXJhY3Rlcikge1xuICAgICAgICAgICAgICBjaGFyYWN0ZXIgPSBtYXhDaGFyYWN0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByYW5nZSA9IEhlbHBlcnMuZ2VuZXJhdGVSYW5nZSh0ZXh0RWRpdG9yLCBsaW5lLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgdGV4dDogYCR7ZXJyb3IuY29kZX0gLSAke2Vycm9yLnJlYXNvbn1gLFxuICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICByYW5nZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==