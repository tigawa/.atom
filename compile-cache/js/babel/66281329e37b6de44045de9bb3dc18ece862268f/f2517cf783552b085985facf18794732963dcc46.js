function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _helpers = require('./helpers');

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

'use babel';

module.exports = {
  config: {
    lintHtmlFiles: {
      title: 'Lint HTML Files',
      description: 'You should also add `eslint-plugin-html` to your .eslintrc plugins',
      type: 'boolean',
      'default': false
    },
    useGlobalEslint: {
      title: 'Use global ESLint installation',
      description: 'Make sure you have it in your $PATH',
      type: 'boolean',
      'default': false
    },
    showRuleIdInMessage: {
      title: 'Show Rule ID in Messages',
      type: 'boolean',
      'default': true
    },
    disableWhenNoEslintConfig: {
      title: 'Disable when no ESLint config is found (in package.json or .eslintrc)',
      type: 'boolean',
      'default': true
    },
    eslintrcPath: {
      title: '.eslintrc Path',
      description: "It will only be used when there's no config file in project",
      type: 'string',
      'default': ''
    },
    globalNodePath: {
      title: 'Global Node Installation Path',
      description: 'Write the value of `npm get prefix` here',
      type: 'string',
      'default': ''
    },
    eslintRulesDir: {
      title: 'ESLint Rules Dir',
      description: 'Specify a directory for ESLint to load rules from',
      type: 'string',
      'default': ''
    },
    disableEslintIgnore: {
      title: 'Don\'t use .eslintignore files',
      type: 'boolean',
      'default': false
    },
    disableFSCache: {
      title: 'Disable FileSystem Cache',
      description: 'Paths of node_modules, .eslintignore and others are cached',
      type: 'boolean',
      'default': false
    },
    fixOnSave: {
      title: 'Fix errors on save',
      description: 'Have eslint attempt to fix some errors automatically when saving the file.',
      type: 'boolean',
      'default': false
    }
  },
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install();

    this.subscriptions = new _atom.CompositeDisposable();
    this.active = true;
    this.worker = null;
    this.scopes = ['source.js', 'source.jsx', 'source.js.jsx', 'source.babel', 'source.js-semantic'];

    var embeddedScope = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-eslint.lintHtmlFiles', function (lintHtmlFiles) {
      if (lintHtmlFiles) {
        _this.scopes.push(embeddedScope);
      } else {
        if (_this.scopes.indexOf(embeddedScope) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(embeddedScope), 1);
        }
      }
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(function () {
        if (_this.scopes.indexOf(editor.getGrammar().scopeName) !== -1 && atom.config.get('linter-eslint.fixOnSave')) {
          _this.worker.request('job', {
            type: 'fix',
            config: atom.config.get('linter-eslint'),
            filePath: editor.getPath()
          })['catch'](function (response) {
            return atom.notifications.addWarning(response);
          });
        }
      });
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:fix-file': function linterEslintFixFile() {
        var textEditor = atom.workspace.getActiveTextEditor();
        var filePath = textEditor.getPath();

        if (!textEditor || textEditor.isModified()) {
          // Abort for invalid or unsaved text editors
          atom.notifications.addError('Linter-ESLint: Please save before fixing');
          return;
        }

        _this.worker.request('job', {
          type: 'fix',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return atom.notifications.addSuccess(response);
        })['catch'](function (response) {
          return atom.notifications.addWarning(response);
        });
      }
    }));

    var initializeWorker = function initializeWorker() {
      var _spawnWorker = (0, _helpers.spawnWorker)();

      var worker = _spawnWorker.worker;
      var subscription = _spawnWorker.subscription;

      _this.worker = worker;
      _this.subscriptions.add(subscription);
      worker.onDidExit(function () {
        if (_this.active) {
          (0, _helpers.showError)('Worker died unexpectedly', 'Check your console for more ' + 'info. A new worker will be spawned instantly.');
          setTimeout(initializeWorker, 1000);
        }
      });
    };
    initializeWorker();
  },
  deactivate: function deactivate() {
    this.active = false;
    this.subscriptions.dispose();
  },
  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    return {
      name: 'ESLint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        var text = textEditor.getText();
        if (text.length === 0) {
          return Promise.resolve([]);
        }
        var filePath = textEditor.getPath();
        var showRule = atom.config.get('linter-eslint.showRuleIdInMessage');

        return _this2.worker.request('job', {
          contents: text,
          type: 'lint',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return response.map(function (_ref) {
            var message = _ref.message;
            var line = _ref.line;
            var severity = _ref.severity;
            var ruleId = _ref.ruleId;
            var column = _ref.column;
            var fix = _ref.fix;

            var textBuffer = textEditor.getBuffer();
            var linterFix = null;
            if (fix) {
              var fixRange = new _atom.Range(textBuffer.positionForCharacterIndex(fix.range[0]), textBuffer.positionForCharacterIndex(fix.range[1]));
              linterFix = {
                range: fixRange,
                newText: fix.text
              };
            }
            var range = Helpers.rangeFromLineNumber(textEditor, line - 1);
            if (column) {
              range[0][1] = column - 1;
            }
            if (column > range[1][1]) {
              range[1][1] = column - 1;
            }
            var ret = {
              filePath: filePath,
              type: severity === 1 ? 'Warning' : 'Error',
              range: range
            };
            if (showRule) {
              var elName = ruleId ? 'a' : 'span';
              var href = ruleId ? ' href=' + (0, _helpers.ruleURI)(ruleId) : '';
              ret.html = '<' + elName + href + ' class="badge badge-flexible eslint">' + ((ruleId || 'Fatal') + '</' + elName + '> ' + (0, _escapeHtml2['default'])(message));
            } else {
              ret.text = message;
            }
            if (linterFix) {
              ret.fix = linterFix;
            }
            return ret;
          });
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFMkMsTUFBTTs7dUJBQ0QsV0FBVzs7MEJBQ3BDLGFBQWE7Ozs7QUFKcEMsV0FBVyxDQUFBOztBQU1YLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixRQUFNLEVBQUU7QUFDTixpQkFBYSxFQUFFO0FBQ2IsV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBVyxFQUFFLG9FQUFvRTtBQUNqRixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELG1CQUFlLEVBQUU7QUFDZixXQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLGlCQUFXLEVBQUUscUNBQXFDO0FBQ2xELFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsdUJBQW1CLEVBQUU7QUFDbkIsV0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELDZCQUF5QixFQUFFO0FBQ3pCLFdBQUssRUFBRSx1RUFBdUU7QUFDOUUsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxnQkFBWSxFQUFFO0FBQ1osV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLDZEQUE2RDtBQUMxRSxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLEVBQUU7S0FDWjtBQUNELGtCQUFjLEVBQUU7QUFDZCxXQUFLLEVBQUUsK0JBQStCO0FBQ3RDLGlCQUFXLEVBQUUsMENBQTBDO0FBQ3ZELFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsRUFBRTtLQUNaO0FBQ0Qsa0JBQWMsRUFBRTtBQUNkLFdBQUssRUFBRSxrQkFBa0I7QUFDekIsaUJBQVcsRUFBRSxtREFBbUQ7QUFDaEUsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxFQUFFO0tBQ1o7QUFDRCx1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SSwrQ0FDdkIsTUFBTSxJQUFJLE9BQU8sQ0FBQSxVQUFLLE1BQU0sVUFBSyw2QkFBVyxPQUFPLENBQUMsQ0FBRSxDQUFBO2FBQzVELE1BQU07QUFDTCxpQkFBRyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUE7YUFDbkI7QUFDRCxnQkFBSSxTQUFTLEVBQUU7QUFDYixpQkFBRyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUE7YUFDcEI7QUFDRCxtQkFBTyxHQUFHLENBQUE7V0FDWCxDQUFDO1NBQUEsQ0FDSCxDQUFBO09BQ0Y7S0FDRixDQUFBO0dBQ0Y7Q0FDRixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IHNwYXduV29ya2VyLCBzaG93RXJyb3IsIHJ1bGVVUkkgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgZXNjYXBlSFRNTCBmcm9tICdlc2NhcGUtaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbmZpZzoge1xuICAgIGxpbnRIdG1sRmlsZXM6IHtcbiAgICAgIHRpdGxlOiAnTGludCBIVE1MIEZpbGVzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnWW91IHNob3VsZCBhbHNvIGFkZCBgZXNsaW50LXBsdWdpbi1odG1sYCB0byB5b3VyIC5lc2xpbnRyYyBwbHVnaW5zJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICB1c2VHbG9iYWxFc2xpbnQ6IHtcbiAgICAgIHRpdGxlOiAnVXNlIGdsb2JhbCBFU0xpbnQgaW5zdGFsbGF0aW9uJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBzdXJlIHlvdSBoYXZlIGl0IGluIHlvdXIgJFBBVEgnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHNob3dSdWxlSWRJbk1lc3NhZ2U6IHtcbiAgICAgIHRpdGxlOiAnU2hvdyBSdWxlIElEIGluIE1lc3NhZ2VzJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWc6IHtcbiAgICAgIHRpdGxlOiAnRGlzYWJsZSB3aGVuIG5vIEVTTGludCBjb25maWcgaXMgZm91bmQgKGluIHBhY2thZ2UuanNvbiBvciAuZXNsaW50cmMpJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGVzbGludHJjUGF0aDoge1xuICAgICAgdGl0bGU6ICcuZXNsaW50cmMgUGF0aCcsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJdCB3aWxsIG9ubHkgYmUgdXNlZCB3aGVuIHRoZXJlJ3Mgbm8gY29uZmlnIGZpbGUgaW4gcHJvamVjdFwiLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZ2xvYmFsTm9kZVBhdGg6IHtcbiAgICAgIHRpdGxlOiAnR2xvYmFsIE5vZGUgSW5zdGFsbGF0aW9uIFBhdGgnLFxuICAgICAgZGVzY3JpcHRpb246ICdXcml0ZSB0aGUgdmFsdWUgb2YgYG5wbSBnZXQgcHJlZml4YCBoZXJlJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJydcbiAgICB9LFxuICAgIGVzbGludFJ1bGVzRGlyOiB7XG4gICAgICB0aXRsZTogJ0VTTGludCBSdWxlcyBEaXInLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IGEgZGlyZWN0b3J5IGZvciBFU0xpbnQgdG8gbG9hZCBydWxlcyBmcm9tJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJydcbiAgICB9LFxuICAgIGRpc2FibGVFc2xpbnRJZ25vcmU6IHtcbiAgICAgIHRpdGxlOiAnRG9uXFwndCB1c2UgLmVzbGludGlnbm9yZSBmaWxlcycsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGlzYWJsZUZTQ2FjaGU6IHtcbiAgICAgIHRpdGxlOiAnRGlzYWJsZSBGaWxlU3lzdGVtIENhY2hlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUGF0aHMgb2Ygbm9kZV9tb2R1bGVzLCAuZXNsaW50aWdub3JlIGFuZCBvdGhlcnMgYXJlIGNhY2hlZCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZml4T25TYXZlOiB7XG4gICAgICB0aXRsZTogJ0ZpeCBlcnJvcnMgb24gc2F2ZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0hhdmUgZXNsaW50IGF0dGVtcHQgdG8gZml4IHNvbWUgZXJyb3JzIGF1dG9tYXRpY2FsbHkgd2hlbiBzYXZpbmcgdGhlIGZpbGUuJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfVxuICB9LFxuICBhY3RpdmF0ZSgpIHtcbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgIHRoaXMud29ya2VyID0gbnVsbFxuICAgIHRoaXMuc2NvcGVzID0gWydzb3VyY2UuanMnLCAnc291cmNlLmpzeCcsICdzb3VyY2UuanMuanN4JywgJ3NvdXJjZS5iYWJlbCcsICdzb3VyY2UuanMtc2VtYW50aWMnXVxuXG4gICAgY29uc3QgZW1iZWRkZWRTY29wZSA9ICdzb3VyY2UuanMuZW1iZWRkZWQuaHRtbCdcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1lc2xpbnQubGludEh0bWxGaWxlcycsIGxpbnRIdG1sRmlsZXMgPT4ge1xuICAgICAgaWYgKGxpbnRIdG1sRmlsZXMpIHtcbiAgICAgICAgdGhpcy5zY29wZXMucHVzaChlbWJlZGRlZFNjb3BlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuc2NvcGVzLmluZGV4T2YoZW1iZWRkZWRTY29wZSkgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zY29wZXMuc3BsaWNlKHRoaXMuc2NvcGVzLmluZGV4T2YoZW1iZWRkZWRTY29wZSksIDEpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZWRpdG9yKSA9PiB7XG4gICAgICBlZGl0b3Iub25EaWRTYXZlKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc2NvcGVzLmluZGV4T2YoZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpICE9PSAtMSAmJlxuICAgICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50LmZpeE9uU2F2ZScpKSB7XG4gICAgICAgICAgdGhpcy53b3JrZXIucmVxdWVzdCgnam9iJywge1xuICAgICAgICAgICAgdHlwZTogJ2ZpeCcsXG4gICAgICAgICAgICBjb25maWc6IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpLFxuICAgICAgICAgICAgZmlsZVBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICB9KS5jYXRjaCgocmVzcG9uc2UpID0+XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhyZXNwb25zZSlcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdsaW50ZXItZXNsaW50OmZpeC1maWxlJzogKCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcblxuICAgICAgICBpZiAoIXRleHRFZGl0b3IgfHwgdGV4dEVkaXRvci5pc01vZGlmaWVkKCkpIHtcbiAgICAgICAgICAvLyBBYm9ydCBmb3IgaW52YWxpZCBvciB1bnNhdmVkIHRleHQgZWRpdG9yc1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTGludGVyLUVTTGludDogUGxlYXNlIHNhdmUgYmVmb3JlIGZpeGluZycpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmtlci5yZXF1ZXN0KCdqb2InLCB7XG4gICAgICAgICAgdHlwZTogJ2ZpeCcsXG4gICAgICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKSxcbiAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhyZXNwb25zZSlcbiAgICAgICAgKS5jYXRjaCgocmVzcG9uc2UpID0+XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcocmVzcG9uc2UpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIGNvbnN0IGluaXRpYWxpemVXb3JrZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCB7IHdvcmtlciwgc3Vic2NyaXB0aW9uIH0gPSBzcGF3bldvcmtlcigpXG4gICAgICB0aGlzLndvcmtlciA9IHdvcmtlclxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb24pXG4gICAgICB3b3JrZXIub25EaWRFeGl0KCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgICAgc2hvd0Vycm9yKCdXb3JrZXIgZGllZCB1bmV4cGVjdGVkbHknLCAnQ2hlY2sgeW91ciBjb25zb2xlIGZvciBtb3JlICcgK1xuICAgICAgICAgICdpbmZvLiBBIG5ldyB3b3JrZXIgd2lsbCBiZSBzcGF3bmVkIGluc3RhbnRseS4nKVxuICAgICAgICAgIHNldFRpbWVvdXQoaW5pdGlhbGl6ZVdvcmtlciwgMTAwMClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgaW5pdGlhbGl6ZVdvcmtlcigpXG4gIH0sXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfSxcbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICBjb25zdCBIZWxwZXJzID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnRVNMaW50JyxcbiAgICAgIGdyYW1tYXJTY29wZXM6IHRoaXMuc2NvcGVzLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgIGxpbnQ6IHRleHRFZGl0b3IgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGNvbnN0IHNob3dSdWxlID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50LnNob3dSdWxlSWRJbk1lc3NhZ2UnKVxuXG4gICAgICAgIHJldHVybiB0aGlzLndvcmtlci5yZXF1ZXN0KCdqb2InLCB7XG4gICAgICAgICAgY29udGVudHM6IHRleHQsXG4gICAgICAgICAgdHlwZTogJ2xpbnQnLFxuICAgICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+XG4gICAgICAgICAgcmVzcG9uc2UubWFwKCh7IG1lc3NhZ2UsIGxpbmUsIHNldmVyaXR5LCBydWxlSWQsIGNvbHVtbiwgZml4IH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRleHRCdWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICAgICAgICBsZXQgbGludGVyRml4ID0gbnVsbFxuICAgICAgICAgICAgaWYgKGZpeCkge1xuICAgICAgICAgICAgICBjb25zdCBmaXhSYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoZml4LnJhbmdlWzBdKSxcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoZml4LnJhbmdlWzFdKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIGxpbnRlckZpeCA9IHtcbiAgICAgICAgICAgICAgICByYW5nZTogZml4UmFuZ2UsXG4gICAgICAgICAgICAgICAgbmV3VGV4dDogZml4LnRleHRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBIZWxwZXJzLnJhbmdlRnJvbUxpbmVOdW1iZXIodGV4dEVkaXRvciwgbGluZSAtIDEpXG4gICAgICAgICAgICBpZiAoY29sdW1uKSB7XG4gICAgICAgICAgICAgIHJhbmdlWzBdWzFdID0gY29sdW1uIC0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbHVtbiA+IHJhbmdlWzFdWzFdKSB7XG4gICAgICAgICAgICAgIHJhbmdlWzFdWzFdID0gY29sdW1uIC0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmV0ID0ge1xuICAgICAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgdHlwZTogc2V2ZXJpdHkgPT09IDEgPyAnV2FybmluZycgOiAnRXJyb3InLFxuICAgICAgICAgICAgICByYW5nZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3dSdWxlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVsTmFtZSA9IHJ1bGVJZCA/ICdhJyA6ICdzcGFuJ1xuICAgICAgICAgICAgICBjb25zdCBocmVmID0gcnVsZUlkID8gYCBocmVmPSR7cnVsZVVSSShydWxlSWQpfWAgOiAnJ1xuICAgICAgICAgICAgICByZXQuaHRtbCA9IGA8JHtlbE5hbWV9JHtocmVmfSBjbGFzcz1cImJhZGdlIGJhZGdlLWZsZXhpYmxlIGVzbGludFwiPmAgK1xuICAgICAgICAgICAgICAgIGAke3J1bGVJZCB8fCAnRmF0YWwnfTwvJHtlbE5hbWV9PiAke2VzY2FwZUhUTUwobWVzc2FnZSl9YFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0LnRleHQgPSBtZXNzYWdlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGludGVyRml4KSB7XG4gICAgICAgICAgICAgIHJldC5maXggPSBsaW50ZXJGaXhcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXRcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/igawataiichi/.atom/packages/linter-eslint/src/main.js
