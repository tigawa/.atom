(function() {
  var $, $$$, AtomHtmlPreviewView, CompositeDisposable, Disposable, ScrollView, fs, os, path, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, $$$ = _ref1.$$$, ScrollView = _ref1.ScrollView;

  path = require('path');

  os = require('os');

  module.exports = AtomHtmlPreviewView = (function(_super) {
    __extends(AtomHtmlPreviewView, _super);

    atom.deserializers.add(AtomHtmlPreviewView);

    AtomHtmlPreviewView.prototype.editorSub = null;

    AtomHtmlPreviewView.prototype.onDidChangeTitle = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.prototype.onDidChangeModified = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.deserialize = function(state) {
      return new AtomHtmlPreviewView(state);
    };

    AtomHtmlPreviewView.content = function() {
      return this.div({
        "class": 'atom-html-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          var style;
          style = 'z-index: 2; padding: 2em;';
          _this.div({
            "class": 'show-error',
            style: style
          });
          return _this.div({
            "class": 'show-loading',
            style: style
          }, "Loading HTML");
        };
      })(this));
    };

    function AtomHtmlPreviewView(_arg) {
      var filePath, handles;
      this.editorId = _arg.editorId, filePath = _arg.filePath;
      this.handleEvents = __bind(this.handleEvents, this);
      AtomHtmlPreviewView.__super__.constructor.apply(this, arguments);
      if (this.editorId != null) {
        this.resolveEditor(this.editorId);
        this.tmpPath = this.getPath();
      } else {
        if (atom.workspace != null) {
          this.subscribeToFilePath(filePath);
        } else {
          atom.packages.onDidActivatePackage((function(_this) {
            return function() {
              return _this.subscribeToFilePath(filePath);
            };
          })(this));
        }
      }
      handles = $("atom-pane-resize-handle");
      handles.on('mousedown', (function(_this) {
        return function() {
          return _this.onStartedResize();
        };
      })(this));
    }

    AtomHtmlPreviewView.prototype.onStartedResize = function() {
      this.css({
        'pointer-events': 'none'
      });
      return document.addEventListener('mouseup', this.onStoppedResizing.bind(this));
    };

    AtomHtmlPreviewView.prototype.onStoppedResizing = function() {
      this.css({
        'pointer-events': 'all'
      });
      return document.removeEventListener('mouseup', this.onStoppedResizing);
    };

    AtomHtmlPreviewView.prototype.serialize = function() {
      return {
        deserializer: 'AtomHtmlPreviewView',
        filePath: this.getPath(),
        editorId: this.editorId
      };
    };

    AtomHtmlPreviewView.prototype.destroy = function() {
      if (typeof editorSub !== "undefined" && editorSub !== null) {
        return this.editorSub.dispose();
      }
    };

    AtomHtmlPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.trigger('title-changed');
      this.handleEvents();
      return this.renderHTML();
    };

    AtomHtmlPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var _ref2, _ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.trigger('title-changed');
            }
            return _this.handleEvents();
          } else {
            return (_ref2 = atom.workspace) != null ? (_ref3 = _ref2.paneForItem(_this)) != null ? _ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return atom.packages.onDidActivatePackage((function(_this) {
          return function() {
            resolve();
            return _this.renderHTML();
          };
        })(this));
      }
    };

    AtomHtmlPreviewView.prototype.editorForId = function(editorId) {
      var editor, _i, _len, _ref2, _ref3;
      _ref2 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        editor = _ref2[_i];
        if (((_ref3 = editor.id) != null ? _ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    AtomHtmlPreviewView.prototype.handleEvents = function() {
      var changeHandler, contextMenuClientX, contextMenuClientY;
      contextMenuClientX = 0;
      contextMenuClientY = 0;
      this.on('contextmenu', function(event) {
        contextMenuClientY = event.clientY;
        return contextMenuClientX = event.clientX;
      });
      atom.commands.add(this.element, {
        'atom-html-preview:open-devtools': (function(_this) {
          return function() {
            return _this.webview.openDevTools();
          };
        })(this),
        'atom-html-preview:inspect': (function(_this) {
          return function() {
            return _this.webview.inspectElement(contextMenuClientX, contextMenuClientY);
          };
        })(this),
        'atom-html-preview:print': (function(_this) {
          return function() {
            return _this.webview.print();
          };
        })(this)
      });
      changeHandler = (function(_this) {
        return function() {
          var pane;
          _this.renderHTML();
          pane = atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      this.editorSub = new CompositeDisposable;
      if (this.editor != null) {
        if (atom.config.get("atom-html-preview.triggerOnSave")) {
          this.editorSub.add(this.editor.onDidSave(changeHandler));
        } else {
          this.editorSub.add(this.editor.onDidStopChanging(changeHandler));
        }
        return this.editorSub.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.trigger('title-changed');
          };
        })(this)));
      }
    };

    AtomHtmlPreviewView.prototype.renderHTML = function() {
      this.showLoading();
      if (this.editor != null) {
        if (!atom.config.get("atom-html-preview.triggerOnSave") && (this.editor.getPath() != null)) {
          return this.save(this.renderHTMLCode);
        } else {
          return this.renderHTMLCode();
        }
      }
    };

    AtomHtmlPreviewView.prototype.save = function(callback) {
      var fileEnding, out, outPath;
      outPath = path.resolve(path.join(os.tmpdir(), this.editor.getTitle() + ".html"));
      out = "";
      fileEnding = this.editor.getTitle().split(".").pop();
      if (atom.config.get("atom-html-preview.enableMathJax")) {
        out += "<script type=\"text/x-mathjax-config\">\nMathJax.Hub.Config({\ntex2jax: {inlineMath: [['\\\\f$','\\\\f$']]},\nmenuSettings: {zoom: 'Click'}\n});\n</script>\n<script type=\"text/javascript\"\nsrc=\"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML\">\n</script>";
      }
      if (atom.config.get("atom-html-preview.preserveWhiteSpaces") && __indexOf.call(atom.config.get("atom-html-preview.fileEndings"), fileEnding) >= 0) {
        out += "<style type=\"text/css\">\nbody { white-space: pre; }\n</style>";
      } else {
        out += "<base href=\"" + this.getPath() + "\">";
      }
      out += this.editor.getText();
      this.tmpPath = outPath;
      return fs.writeFile(outPath, out, (function(_this) {
        return function() {
          var error;
          try {
            return _this.renderHTMLCode();
          } catch (_error) {
            error = _error;
            return _this.showError(error);
          }
        };
      })(this));
    };

    AtomHtmlPreviewView.prototype.renderHTMLCode = function() {
      var error, webview;
      if (this.webview == null) {
        webview = document.createElement("webview");
        webview.setAttribute("sandbox", "allow-scripts allow-same-origin");
        this.webview = webview;
        this.append($(webview));
      }
      this.webview.src = this.tmpPath;
      try {
        this.find('.show-error').hide();
        this.find('.show-loading').hide();
        this.webview.reload();
      } catch (_error) {
        error = _error;
        null;
      }
      return atom.commands.dispatch('atom-html-preview', 'html-changed');
    };

    AtomHtmlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return "" + (this.editor.getTitle()) + " Preview";
      } else {
        return "HTML Preview";
      }
    };

    AtomHtmlPreviewView.prototype.getURI = function() {
      return "html-preview://editor/" + this.editorId;
    };

    AtomHtmlPreviewView.prototype.getPath = function() {
      if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    AtomHtmlPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.find('.show-error').html($$$(function() {
        this.h2('Previewing HTML Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      })).show();
    };

    AtomHtmlPreviewView.prototype.showLoading = function() {
      return this.find('.show-loading').show();
    };

    return AtomHtmlPreviewView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdG9tLWh0bWwtcHJldmlldy9saWIvYXRvbS1odG1sLXByZXZpZXctdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUdBQUE7SUFBQTs7O3lKQUFBOztBQUFBLEVBQUEsRUFBQSxHQUF3QixPQUFBLENBQVEsSUFBUixDQUF4QixDQUFBOztBQUFBLEVBQ0EsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixrQkFBQSxVQUR0QixDQUFBOztBQUFBLEVBRUEsUUFBd0IsT0FBQSxDQUFRLHNCQUFSLENBQXhCLEVBQUMsVUFBQSxDQUFELEVBQUksWUFBQSxHQUFKLEVBQVMsbUJBQUEsVUFGVCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUF3QixPQUFBLENBQVEsTUFBUixDQUh4QixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUF3QixPQUFBLENBQVEsSUFBUixDQUp4QixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDBDQUFBLENBQUE7O0FBQUEsSUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQXVCLG1CQUF2QixDQUFBLENBQUE7O0FBQUEsa0NBRUEsU0FBQSxHQUFzQixJQUZ0QixDQUFBOztBQUFBLGtDQUdBLGdCQUFBLEdBQXNCLFNBQUEsR0FBQTthQUFPLElBQUEsVUFBQSxDQUFBLEVBQVA7SUFBQSxDQUh0QixDQUFBOztBQUFBLGtDQUlBLG1CQUFBLEdBQXNCLFNBQUEsR0FBQTthQUFPLElBQUEsVUFBQSxDQUFBLEVBQVA7SUFBQSxDQUp0QixDQUFBOztBQUFBLElBTUEsbUJBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFBLG1CQUFBLENBQW9C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

//# sourceURL=/Users/igawataiichi/.atom/packages/atom-html-preview/lib/atom-html-preview-view.coffee
