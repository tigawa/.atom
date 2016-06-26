(function() {
  var MarkdownPreviewView, fs, isMarkdownPreviewView, renderer, url,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  fs = require('fs-plus');

  MarkdownPreviewView = null;

  renderer = null;

  isMarkdownPreviewView = function(object) {
    if (MarkdownPreviewView == null) {
      MarkdownPreviewView = require('./markdown-preview-view');
    }
    return object instanceof MarkdownPreviewView;
  };

  module.exports = {
    activate: function() {
      var previewFile;
      if (parseFloat(atom.getVersion()) < 1.7) {
        atom.deserializers.add({
          name: 'MarkdownPreviewView',
          deserialize: module.exports.createMarkdownPreviewView.bind(module.exports)
        });
      }
      atom.commands.add('atom-workspace', {
        'markdown-preview:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'markdown-preview:copy-html': (function(_this) {
          return function() {
            return _this.copyHtml();
          };
        })(this),
        'markdown-preview:toggle-break-on-single-newline': function() {
          var keyPath;
          keyPath = 'markdown-preview.breakOnSingleNewline';
          return atom.config.set(keyPath, !atom.config.get(keyPath));
        }
      });
      previewFile = this.previewFile.bind(this);
      atom.commands.add('.tree-view .file .name[data-name$=\\.markdown]', 'markdown-preview:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'markdown-preview:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mdown]', 'markdown-preview:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkd]', 'markdown-preview:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkdown]', 'markdown-preview:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.ron]', 'markdown-preview:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.txt]', 'markdown-preview:preview-file', previewFile);
      return atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var error, host, pathname, protocol, _ref;
          try {
            _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
          } catch (_error) {
            error = _error;
            return;
          }
          if (protocol !== 'markdown-preview:') {
            return;
          }
          try {
            if (pathname) {
              pathname = decodeURI(pathname);
            }
          } catch (_error) {
            error = _error;
            return;
          }
          if (host === 'editor') {
            return _this.createMarkdownPreviewView({
              editorId: pathname.substring(1)
            });
          } else {
            return _this.createMarkdownPreviewView({
              filePath: pathname
            });
          }
        };
      })(this));
    },
    createMarkdownPreviewView: function(state) {
      if (state.editorId || fs.isFileSync(state.filePath)) {
        if (MarkdownPreviewView == null) {
          MarkdownPreviewView = require('./markdown-preview-view');
        }
        return new MarkdownPreviewView(state);
      }
    },
    toggle: function() {
      var editor, grammars, _ref, _ref1;
      if (isMarkdownPreviewView(atom.workspace.getActivePaneItem())) {
        atom.workspace.destroyActivePaneItem();
        return;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      grammars = (_ref = atom.config.get('markdown-preview.grammars')) != null ? _ref : [];
      if (_ref1 = editor.getGrammar().scopeName, __indexOf.call(grammars, _ref1) < 0) {
        return;
      }
      if (!this.removePreviewForEditor(editor)) {
        return this.addPreviewForEditor(editor);
      }
    },
    uriForEditor: function(editor) {
      return "markdown-preview://editor/" + editor.id;
    },
    removePreviewForEditor: function(editor) {
      var previewPane, uri;
      uri = this.uriForEditor(editor);
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane != null) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return true;
      } else {
        return false;
      }
    },
    addPreviewForEditor: function(editor) {
      var options, previousActivePane, uri;
      uri = this.uriForEditor(editor);
      previousActivePane = atom.workspace.getActivePane();
      options = {
        searchAllPanes: true
      };
      if (atom.config.get('markdown-preview.openPreviewInSplitPane')) {
        options.split = 'right';
      }
      return atom.workspace.open(uri, options).then(function(markdownPreviewView) {
        if (isMarkdownPreviewView(markdownPreviewView)) {
          return previousActivePane.activate();
        }
      });
    },
    previewFile: function(_arg) {
      var editor, filePath, target, _i, _len, _ref;
      target = _arg.target;
      filePath = target.dataset.path;
      if (!filePath) {
        return;
      }
      _ref = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        editor = _ref[_i];
        if (!(editor.getPath() === filePath)) {
          continue;
        }
        this.addPreviewForEditor(editor);
        return;
      }
      return atom.workspace.open("markdown-preview://" + (encodeURI(filePath)), {
        searchAllPanes: true
      });
    },
    copyHtml: function() {
      var editor, text;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      if (renderer == null) {
        renderer = require('./renderer');
      }
      text = editor.getSelectedText() || editor.getText();
      return renderer.toHTML(text, editor.getPath(), editor.getGrammar(), function(error, html) {
        if (error) {
          return console.warn('Copying Markdown as HTML failed', error);
        } else {
          return atom.clipboard.write(html);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2REFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFHQSxtQkFBQSxHQUFzQixJQUh0QixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLElBSlgsQ0FBQTs7QUFBQSxFQU1BLHFCQUFBLEdBQXdCLFNBQUMsTUFBRCxHQUFBOztNQUN0QixzQkFBdUIsT0FBQSxDQUFRLHlCQUFSO0tBQXZCO1dBQ0EsTUFBQSxZQUFrQixvQkFGSTtFQUFBLENBTnhCLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFHLFVBQUEsQ0FBVyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQVgsQ0FBQSxHQUFnQyxHQUFuQztBQUNFLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0scUJBQU47QUFBQSxVQUNBLFdBQUEsRUFBYSxNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLElBQXpDLENBQThDLE1BQU0sQ0FBQyxPQUFyRCxDQURiO1NBREYsQ0FBQSxDQURGO09BQUE7QUFBQSxNQUtBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDRTtBQUFBLFFBQUEseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdB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

//# sourceURL=/Users/igawataiichi/.atom/packages/markdown-preview/lib/main.coffee
