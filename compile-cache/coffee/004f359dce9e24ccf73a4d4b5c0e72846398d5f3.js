(function() {
  var CompositeDisposable, HtmlPreviewView, url;

  url = require('url');

  CompositeDisposable = require('atom').CompositeDisposable;

  HtmlPreviewView = require('./atom-html-preview-view');

  module.exports = {
    config: {
      triggerOnSave: {
        type: 'boolean',
        description: 'Watch will trigger on save.',
        "default": false
      },
      preserveWhiteSpaces: {
        type: 'boolean',
        description: 'Preserve white spaces and line endings.',
        "default": false
      },
      fileEndings: {
        type: 'array',
        title: 'Preserve file endings',
        description: 'File endings to preserve',
        "default": ["c", "h"],
        items: {
          type: 'string'
        }
      },
      enableMathJax: {
        type: 'boolean',
        description: 'Enable MathJax inline rendering \\f$ \\pi \\f$',
        "default": false
      }
    },
    htmlPreviewView: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.subscriptions.add(editor.onDidSave(function() {
            if ((typeof htmlPreviewView !== "undefined" && htmlPreviewView !== null) && htmlPreviewView instanceof HtmlPreviewView) {
              return htmlPreviewView.renderHTML();
            }
          }));
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-html-preview:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      return atom.workspace.addOpener(function(uriToOpen) {
        var error, host, pathname, protocol, _ref;
        try {
          _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        } catch (_error) {
          error = _error;
          return;
        }
        if (protocol !== 'html-preview:') {
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
          this.htmlPreviewView = new HtmlPreviewView({
            editorId: pathname.substring(1)
          });
        } else {
          this.htmlPreviewView = new HtmlPreviewView({
            filePath: pathname
          });
        }
        return htmlPreviewView;
      });
    },
    toggle: function() {
      var editor, previewPane, previousActivePane, uri;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      uri = "html-preview://editor/" + editor.id;
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return;
      }
      previousActivePane = atom.workspace.getActivePane();
      return atom.workspace.open(uri, {
        split: 'right',
        searchAllPanes: true
      }).done(function(htmlPreviewView) {
        if (htmlPreviewView instanceof HtmlPreviewView) {
          htmlPreviewView.renderHTML();
          return previousActivePane.activate();
        }
      });
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdG9tLWh0bWwtcHJldmlldy9saWIvYXRvbS1odG1sLXByZXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBOztBQUFBLEVBQUEsR0FBQSxHQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxlQUFBLEdBQXdCLE9BQUEsQ0FBUSwwQkFBUixDQUh4QixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxXQUFBLEVBQWEsNkJBRGI7QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BREY7QUFBQSxNQUlBLG1CQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxXQUFBLEVBQWEseUNBRGI7QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BTEY7QUFBQSxNQVFBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLEtBQUEsRUFBTyx1QkFEUDtBQUFBLFFBRUEsV0FBQSxFQUFhLDBCQUZiO0FBQUEsUUFHQSxTQUFBLEVBQVMsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUhUO0FBQUEsUUFJQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBTEY7T0FURjtBQUFBLE1BZUEsYUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsV0FBQSxFQUFhLGdEQURiO0FBQUEsUUFFQSxTQUFBLEVBQVMs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

//# sourceURL=/Users/igawataiichi/.atom/packages/atom-html-preview/lib/atom-html-preview.coffee
