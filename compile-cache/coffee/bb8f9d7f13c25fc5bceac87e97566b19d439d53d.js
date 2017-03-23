(function() {
  var $, $$$, AtomHtmlPreviewView, CompositeDisposable, Disposable, ScrollView, fs, os, path, ref, ref1, scrollInjectScript,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, ScrollView = ref1.ScrollView;

  path = require('path');

  os = require('os');

  scrollInjectScript = "<script>\n(function () {\n  var scriptTag = document.scripts[document.scripts.length - 1];\n  document.addEventListener('DOMContentLoaded',()=>{\n    var elem = document.createElement(\"span\")\n    try {\n      // Scroll to this current script tag\n      elem.style.width = 100\n      // Center the scrollY\n      elem.style.height = \"20vh\"\n      elem.style.marginTop = \"-20vh\"\n      elem.style.marginLeft = -100\n      elem.style.display = \"block\"\n      var par = scriptTag.parentNode\n      par.insertBefore(elem, scriptTag)\n      elem.scrollIntoView()\n    } catch (error) {}\n    try { elem.remove() } catch (error) {}\n    try { scriptTag.remove() } catch (error) {}\n  }, false)\n})();\n</script>";

  module.exports = AtomHtmlPreviewView = (function(superClass) {
    extend(AtomHtmlPreviewView, superClass);

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

    function AtomHtmlPreviewView(arg) {
      var filePath, handles;
      this.editorId = arg.editorId, filePath = arg.filePath;
      this.handleEvents = bind(this.handleEvents, this);
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
          var ref2, ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.trigger('title-changed');
            }
            return _this.handleEvents();
          } else {
            return (ref2 = atom.workspace) != null ? (ref3 = ref2.paneForItem(_this)) != null ? ref3.destroyItem(_this) : void 0 : void 0;
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
      var editor, i, len, ref2, ref3;
      ref2 = atom.workspace.getTextEditors();
      for (i = 0, len = ref2.length; i < len; i++) {
        editor = ref2[i];
        if (((ref3 = editor.id) != null ? ref3.toString() : void 0) === editorId.toString()) {
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
      var column, editorText, error, fileEnding, findTagBefore, firstSelection, lastTagRE, offset, out, outPath, ref2, row, tagIndex, tagRE;
      outPath = path.resolve(path.join(os.tmpdir(), this.editor.getTitle() + ".html"));
      out = "";
      fileEnding = this.editor.getTitle().split(".").pop();
      if (atom.config.get("atom-html-preview.enableMathJax")) {
        out += "<script type=\"text/x-mathjax-config\">\nMathJax.Hub.Config({\ntex2jax: {inlineMath: [['\\\\f$','\\\\f$']]},\nmenuSettings: {zoom: 'Click'}\n});\n</script>\n<script type=\"text/javascript\"\nsrc=\"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML\">\n</script>";
      }
      if (atom.config.get("atom-html-preview.preserveWhiteSpaces") && indexOf.call(atom.config.get("atom-html-preview.fileEndings"), fileEnding) >= 0) {
        out += "<style type=\"text/css\">\nbody { white-space: pre; }\n</style>";
      } else {
        out += "<base href=\"" + this.getPath() + "\">";
      }
      editorText = this.editor.getText();
      firstSelection = this.editor.getSelections()[0];
      ref2 = firstSelection.getBufferRange().start, row = ref2.row, column = ref2.column;
      if (atom.config.get("atom-html-preview.scrollToCursor")) {
        try {
          offset = this._getOffset(editorText, row, column);
          tagRE = /<((\/[\$\w\-])|br|input|link)\/?>/.source;
          lastTagRE = RegExp(tagRE + "(?![\\s\\S]*" + tagRE + ")", "i");
          findTagBefore = function(beforeIndex) {
            var matchedClosingTag;
            matchedClosingTag = editorText.slice(0, beforeIndex).match(lastTagRE);
            if (matchedClosingTag) {
              return matchedClosingTag.index + matchedClosingTag[0].length;
            } else {
              return -1;
            }
          };
          tagIndex = findTagBefore(offset);
          if (tagIndex > -1) {
            editorText = (editorText.slice(0, tagIndex)) + "\n" + scrollInjectScript + "\n" + (editorText.slice(tagIndex));
          }
        } catch (error1) {
          error = error1;
          return -1;
        }
      }
      out += editorText;
      this.tmpPath = outPath;
      return fs.writeFile(outPath, out, (function(_this) {
        return function() {
          try {
            return _this.renderHTMLCode();
          } catch (error1) {
            error = error1;
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
        webview.setAttribute("style", "height: 100%");
        this.webview = webview;
        this.append($(webview));
      }
      this.webview.src = this.tmpPath;
      try {
        this.find('.show-error').hide();
        this.find('.show-loading').hide();
        this.webview.reload();
      } catch (error1) {
        error = error1;
        null;
      }
      return atom.commands.dispatch('atom-html-preview', 'html-changed');
    };

    AtomHtmlPreviewView.prototype._getOffset = function(text, row, column) {
      var line_re, match, match_index, offset;
      if (column == null) {
        column = 0;
      }
      line_re = /\n/g;
      match_index = null;
      while (row--) {
        if (match = line_re.exec(text)) {
          match_index = match.index;
        } else {
          return -1;
        }
      }
      offset = match_index + column;
      if (offset < text.length) {
        return offset;
      } else {
        return -1;
      }
    };

    AtomHtmlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return (this.editor.getTitle()) + " Preview";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdG9tLWh0bWwtcHJldmlldy9saWIvYXRvbS1odG1sLXByZXZpZXctdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFIQUFBO0lBQUE7Ozs7O0VBQUEsRUFBQSxHQUF3QixPQUFBLENBQVEsSUFBUjs7RUFDeEIsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFDdEIsT0FBd0IsT0FBQSxDQUFRLHNCQUFSLENBQXhCLEVBQUMsVUFBRCxFQUFJLGNBQUosRUFBUzs7RUFDVCxJQUFBLEdBQXdCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQXdCLE9BQUEsQ0FBUSxJQUFSOztFQUV4QixrQkFBQSxHQUFxQjs7RUF5QnJCLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUIsbUJBQXZCOztrQ0FFQSxTQUFBLEdBQXNCOztrQ0FDdEIsZ0JBQUEsR0FBc0IsU0FBQTthQUFPLElBQUEsVUFBQSxDQUFBO0lBQVA7O2tDQUN0QixtQkFBQSxHQUFzQixTQUFBO2FBQU8sSUFBQSxVQUFBLENBQUE7SUFBUDs7SUFFdEIsbUJBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFEO2FBQ1IsSUFBQSxtQkFBQSxDQUFvQixLQUFwQjtJQURROztJQUdkLG1CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1Q0FBUDtRQUFnRCxRQUFBLEVBQVUsQ0FBQyxDQUEzRDtPQUFMLEVBQW1FLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNqRSxjQUFBO1VBQUEsS0FBQSxHQUFRO1VBQ1IsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxD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TSxDQUFDLFFBQVIsQ0FBQSxDQUFELENBQUEsR0FBb0IsV0FEeEI7T0FBQSxNQUFBO2VBR0UsZUFIRjs7SUFEUTs7a0NBTVYsTUFBQSxHQUFRLFNBQUE7YUFDTix3QkFBQSxHQUF5QixJQUFDLENBQUE7SUFEcEI7O2tDQUdSLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBRyxtQkFBSDtlQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLEVBREY7O0lBRE87O2tDQUlULFNBQUEsR0FBVyxTQUFDLE1BQUQ7QUFDVCxVQUFBO01BQUEsY0FBQSxvQkFBaUIsTUFBTSxDQUFFO2FBRXpCLElBQUMsQ0FBQSxJQUFELENBQU0sYUFBTixDQUNBLENBQUMsSUFERCxDQUNNLEdBQUEsQ0FBSSxTQUFBO1FBQ1IsSUFBQyxDQUFBLEVBQUQsQ0FBSSx3QkFBSjtRQUNBLElBQXNCLHNCQUF0QjtpQkFBQSxJQUFDLENBQUEsRUFBRCxDQUFJLGNBQUosRUFBQTs7TUFGUSxDQUFKLENBRE4sQ0FJQSxDQUFDLElBSkQsQ0FBQTtJQUhTOztrQ0FTWCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTixDQUFzQixDQUFDLElBQXZCLENBQUE7SUFEVzs7OztLQXpQbUI7QUFoQ2xDIiwic291cmNlc0NvbnRlbnQiOlsiZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG57Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyQsICQkJCwgU2Nyb2xsVmlld30gID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xub3MgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnb3MnXG5cbnNjcm9sbEluamVjdFNjcmlwdCA9IFwiXCJcIlxuPHNjcmlwdD5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBzY3JpcHRUYWcgPSBkb2N1bWVudC5zY3JpcHRzW2RvY3VtZW50LnNjcmlwdHMubGVuZ3RoIC0gMV07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCgpPT57XG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKVxuICAgIHRyeSB7XG4gICAgICAvLyBTY3JvbGwgdG8gdGhpcyBjdXJyZW50IHNjcmlwdCB0YWdcbiAgICAgIGVsZW0uc3R5bGUud2lkdGggPSAxMDBcbiAgICAgIC8vIENlbnRlciB0aGUgc2Nyb2xsWVxuICAgICAgZWxlbS5zdHlsZS5oZWlnaHQgPSBcIjIwdmhcIlxuICAgICAgZWxlbS5zdHlsZS5tYXJnaW5Ub3AgPSBcIi0yMHZoXCJcbiAgICAgIGVsZW0uc3R5bGUubWFyZ2luTGVmdCA9IC0xMDBcbiAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIlxuICAgICAgdmFyIHBhciA9IHNjcmlwdFRhZy5wYXJlbnROb2RlXG4gICAgICBwYXIuaW5zZXJ0QmVmb3JlKGVsZW0sIHNjcmlwdFRhZylcbiAgICAgIGVsZW0uc2Nyb2xsSW50b1ZpZXcoKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIHRyeSB7IGVsZW0ucmVtb3ZlKCkgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgdHJ5IHsgc2NyaXB0VGFnLnJlbW92ZSgpIH0gY2F0Y2ggKGVycm9yKSB7fVxuICB9LCBmYWxzZSlcbn0pKCk7XG48L3NjcmlwdD5cblwiXCJcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBBdG9tSHRtbFByZXZpZXdWaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuICBhdG9tLmRlc2VyaWFsaXplcnMuYWRkKHRoaXMpXG5cbiAgZWRpdG9yU3ViICAgICAgICAgICA6IG51bGxcbiAgb25EaWRDaGFuZ2VUaXRsZSAgICA6IC0+IG5ldyBEaXNwb3NhYmxlKClcbiAgb25EaWRDaGFuZ2VNb2RpZmllZCA6IC0+IG5ldyBEaXNwb3NhYmxlKClcblxuICBAZGVzZXJpYWxpemU6IChzdGF0ZSkgLT5cbiAgICBuZXcgQXRvbUh0bWxQcmV2aWV3VmlldyhzdGF0ZSlcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnYXRvbS1odG1sLXByZXZpZXcgbmF0aXZlLWtleS1iaW5kaW5ncycsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIHN0eWxlID0gJ3otaW5kZXg6IDI7IHBhZGRpbmc6IDJlbTsnXG4gICAgICBAZGl2IGNsYXNzOiAnc2hvdy1lcnJvcicsIHN0eWxlOiBzdHlsZVxuICAgICAgQGRpdiBjbGFzczogJ3Nob3ctbG9hZGluZycsIHN0eWxlOiBzdHlsZSwgXCJMb2FkaW5nIEhUTUxcIlxuXG4gIGNvbnN0cnVjdG9yOiAoe0BlZGl0b3JJZCwgZmlsZVBhdGh9KSAtPlxuICAgIHN1cGVyXG5cbiAgICBpZiBAZWRpdG9ySWQ/XG4gICAgICBAcmVzb2x2ZUVkaXRvcihAZWRpdG9ySWQpXG4gICAgICBAdG1wUGF0aCA9IEBnZXRQYXRoKCkgIyBhZnRlciByZXNvbHZlRWRpdG9yXG4gICAgZWxzZVxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2U/XG4gICAgICAgIEBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoKVxuICAgICAgZWxzZVxuICAgICAgICAjIEBzdWJzY3JpYmUgYXRvbS5wYWNrYWdlcy5vbmNlICdhY3RpdmF0ZWQnLCA9PlxuICAgICAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlID0+XG4gICAgICAgICAgQHN1YnNjcmliZVRvRmlsZVBhdGgoZmlsZVBhdGgpXG5cbiAgICAjIERpc2FibGUgcG9pbnRlci1ldmVudHMgd2hpbGUgcmVzaXppbmdcbiAgICBoYW5kbGVzID0gJChcImF0b20tcGFuZS1yZXNpemUtaGFuZGxlXCIpXG4gICAgaGFuZGxlcy5vbiAnbW91c2Vkb3duJywgPT4gQG9uU3RhcnRlZFJlc2l6ZSgpXG5cbiAgb25TdGFydGVkUmVzaXplOiAtPlxuICAgIEBjc3MgJ3BvaW50ZXItZXZlbnRzJzogJ25vbmUnXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIEBvblN0b3BwZWRSZXNpemluZy5iaW5kIHRoaXNcblxuICBvblN0b3BwZWRSZXNpemluZzogLT5cbiAgICBAY3NzICdwb2ludGVyLWV2ZW50cyc6ICdhbGwnXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIEBvblN0b3BwZWRSZXNpemluZ1xuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBkZXNlcmlhbGl6ZXIgOiAnQXRvbUh0bWxQcmV2aWV3VmlldydcbiAgICBmaWxlUGF0aCAgICAgOiBAZ2V0UGF0aCgpXG4gICAgZWRpdG9ySWQgICAgIDogQGVkaXRvcklkXG5cbiAgZGVzdHJveTogLT5cbiAgICAjIEB1bnN1YnNjcmliZSgpXG4gICAgaWYgZWRpdG9yU3ViP1xuICAgICAgQGVkaXRvclN1Yi5kaXNwb3NlKClcblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoOiAoZmlsZVBhdGgpIC0+XG4gICAgQHRyaWdnZXIgJ3RpdGxlLWNoYW5nZWQnXG4gICAgQGhhbmRsZUV2ZW50cygpXG4gICAgQHJlbmRlckhUTUwoKVxuXG4gIHJlc29sdmVFZGl0b3I6IChlZGl0b3JJZCkgLT5cbiAgICByZXNvbHZlID0gPT5cbiAgICAgIEBlZGl0b3IgPSBAZWRpdG9yRm9ySWQoZWRpdG9ySWQpXG5cbiAgICAgIGlmIEBlZGl0b3I/XG4gICAgICAgIEB0cmlnZ2VyICd0aXRsZS1jaGFuZ2VkJyBpZiBAZWRpdG9yP1xuICAgICAgICBAaGFuZGxlRXZlbnRzKClcbiAgICAgIGVsc2VcbiAgICAgICAgIyBUaGUgZWRpdG9yIHRoaXMgcHJldmlldyB3YXMgY3JlYXRlZCBmb3IgaGFzIGJlZW4gY2xvc2VkIHNvIGNsb3NlXG4gICAgICAgICMgdGhpcyBwcmV2aWV3IHNpbmNlIGEgcHJldmlldyBjYW5ub3QgYmUgcmVuZGVyZWQgd2l0aG91dCBhbiBlZGl0b3JcbiAgICAgICAgYXRvbS53b3Jrc3BhY2U/LnBhbmVGb3JJdGVtKHRoaXMpPy5kZXN0cm95SXRlbSh0aGlzKVxuXG4gICAgaWYgYXRvbS53b3Jrc3BhY2U/XG4gICAgICByZXNvbHZlKClcbiAgICBlbHNlXG4gICAgICAjIEBzdWJzY3JpYmUgYXRvbS5wYWNrYWdlcy5vbmNlICdhY3RpdmF0ZWQnLCA9PlxuICAgICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSA9PlxuICAgICAgICByZXNvbHZlKClcbiAgICAgICAgQHJlbmRlckhUTUwoKVxuXG4gIGVkaXRvckZvcklkOiAoZWRpdG9ySWQpIC0+XG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICByZXR1cm4gZWRpdG9yIGlmIGVkaXRvci5pZD8udG9TdHJpbmcoKSBpcyBlZGl0b3JJZC50b1N0cmluZygpXG4gICAgbnVsbFxuXG4gIGhhbmRsZUV2ZW50czogPT5cbiAgICBjb250ZXh0TWVudUNsaWVudFggPSAwXG4gICAgY29udGV4dE1lbnVDbGllbnRZID0gMFxuXG4gICAgQG9uICdjb250ZXh0bWVudScsIChldmVudCkgLT5cbiAgICAgIGNvbnRleHRNZW51Q2xpZW50WSA9IGV2ZW50LmNsaWVudFlcbiAgICAgIGNvbnRleHRNZW51Q2xpZW50WCA9IGV2ZW50LmNsaWVudFhcblxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ2F0b20taHRtbC1wcmV2aWV3Om9wZW4tZGV2dG9vbHMnOiA9PlxuICAgICAgICBAd2Vidmlldy5vcGVuRGV2VG9vbHMoKVxuICAgICAgJ2F0b20taHRtbC1wcmV2aWV3Omluc3BlY3QnOiA9PlxuICAgICAgICBAd2Vidmlldy5pbnNwZWN0RWxlbWVudChjb250ZXh0TWVudUNsaWVudFgsIGNvbnRleHRNZW51Q2xpZW50WSlcbiAgICAgICdhdG9tLWh0bWwtcHJldmlldzpwcmludCc6ID0+XG4gICAgICAgIEB3ZWJ2aWV3LnByaW50KClcblxuXG4gICAgY2hhbmdlSGFuZGxlciA9ID0+XG4gICAgICBAcmVuZGVySFRNTCgpXG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShAZ2V0VVJJKCkpXG4gICAgICBpZiBwYW5lPyBhbmQgcGFuZSBpc250IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbSh0aGlzKVxuXG4gICAgQGVkaXRvclN1YiA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBpZiBAZWRpdG9yP1xuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1odG1sLXByZXZpZXcudHJpZ2dlck9uU2F2ZVwiKVxuICAgICAgICBAZWRpdG9yU3ViLmFkZCBAZWRpdG9yLm9uRGlkU2F2ZSBjaGFuZ2VIYW5kbGVyXG4gICAgICBlbHNlXG4gICAgICAgIEBlZGl0b3JTdWIuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgY2hhbmdlSGFuZGxlclxuICAgICAgQGVkaXRvclN1Yi5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVBhdGggPT4gQHRyaWdnZXIgJ3RpdGxlLWNoYW5nZWQnXG5cbiAgcmVuZGVySFRNTDogLT5cbiAgICBAc2hvd0xvYWRpbmcoKVxuICAgIGlmIEBlZGl0b3I/XG4gICAgICBpZiBub3QgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1odG1sLXByZXZpZXcudHJpZ2dlck9uU2F2ZVwiKSAmJiBAZWRpdG9yLmdldFBhdGgoKT9cbiAgICAgICAgQHNhdmUoQHJlbmRlckhUTUxDb2RlKVxuICAgICAgZWxzZVxuICAgICAgICBAcmVuZGVySFRNTENvZGUoKVxuXG4gIHNhdmU6IChjYWxsYmFjaykgLT5cbiAgICAjIFRlbXAgZmlsZSBwYXRoXG4gICAgb3V0UGF0aCA9IHBhdGgucmVzb2x2ZSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIEBlZGl0b3IuZ2V0VGl0bGUoKSArIFwiLmh0bWxcIilcbiAgICBvdXQgPSBcIlwiXG4gICAgZmlsZUVuZGluZyA9IEBlZGl0b3IuZ2V0VGl0bGUoKS5zcGxpdChcIi5cIikucG9wKClcblxuICAgIGlmIGF0b20uY29uZmlnLmdldChcImF0b20taHRtbC1wcmV2aWV3LmVuYWJsZU1hdGhKYXhcIilcbiAgICAgIG91dCArPSBcIlwiXCJcbiAgICAgIDxzY3JpcHQgdHlwZT1cInRleHQveC1tYXRoamF4LWNvbmZpZ1wiPlxuICAgICAgTWF0aEpheC5IdWIuQ29uZmlnKHtcbiAgICAgIHRleDJqYXg6IHtpbmxpbmVNYXRoOiBbWydcXFxcXFxcXGYkJywnXFxcXFxcXFxmJCddXX0sXG4gICAgICBtZW51U2V0dGluZ3M6IHt6b29tOiAnQ2xpY2snfVxuICAgICAgfSk7XG4gICAgICA8L3NjcmlwdD5cbiAgICAgIDxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiXG4gICAgICBzcmM9XCJodHRwOi8vY2RuLm1hdGhqYXgub3JnL21hdGhqYXgvbGF0ZXN0L01hdGhKYXguanM/Y29uZmlnPVRlWC1BTVMtTU1MX0hUTUxvck1NTFwiPlxuICAgICAgPC9zY3JpcHQ+XG4gICAgICBcIlwiXCJcblxuICAgIGlmIGF0b20uY29uZmlnLmdldChcImF0b20taHRtbC1wcmV2aWV3LnByZXNlcnZlV2hpdGVTcGFjZXNcIikgYW5kIGZpbGVFbmRpbmcgaW4gYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1odG1sLXByZXZpZXcuZmlsZUVuZGluZ3NcIilcbiAgICAgICMgRW5jbG9zZSBpbiA8cHJlPiBzdGF0ZW1lbnQgdG8gcHJlc2VydmUgd2hpdGVzcGFjZXNcbiAgICAgIG91dCArPSBcIlwiXCJcbiAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgIGJvZHkgeyB3aGl0ZS1zcGFjZTogcHJlOyB9XG4gICAgICA8L3N0eWxlPlxuICAgICAgXCJcIlwiXG4gICAgZWxzZVxuICAgICAgIyBBZGQgYmFzZSB0YWc7IGFsbG93IHJlbGF0aXZlIGxpbmtzIHRvIHdvcmsgZGVzcGl0ZSBiZWluZyBsb2FkZWRcbiAgICAgICMgYXMgdGhlIHNyYyBvZiBhbiB3ZWJ2aWV3XG4gICAgICBvdXQgKz0gXCI8YmFzZSBocmVmPVxcXCJcIiArIEBnZXRQYXRoKCkgKyBcIlxcXCI+XCJcblxuICAgICMgU2Nyb2xsIGludG8gdmlld1xuICAgIGVkaXRvclRleHQgPSBAZWRpdG9yLmdldFRleHQoKVxuICAgIGZpcnN0U2VsZWN0aW9uID0gdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpWzBdXG4gICAgeyByb3csIGNvbHVtbiB9ID0gZmlyc3RTZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1odG1sLXByZXZpZXcuc2Nyb2xsVG9DdXJzb3JcIilcbiAgICAgIHRyeVxuICAgICAgICBvZmZzZXQgPSBAX2dldE9mZnNldChlZGl0b3JUZXh0LCByb3csIGNvbHVtbilcblxuICAgICAgICB0YWdSRSA9IC88KChcXC9bXFwkXFx3XFwtXSl8YnJ8aW5wdXR8bGluaylcXC8/Pi8uc291cmNlXG4gICAgICAgIGxhc3RUYWdSRT0gLy8vI3t0YWdSRX0oPyFbXFxzXFxTXSoje3RhZ1JFfSkvLy9pXG4gICAgICAgIGZpbmRUYWdCZWZvcmUgPSAoYmVmb3JlSW5kZXgpIC0+XG4gICAgICAgICAgI3NhbXBsZSA9IGVkaXRvclRleHQuc2xpY2Uoc3RhcnRJbmRleCwgc3RhcnRJbmRleCArIDMwMClcbiAgICAgICAgICBtYXRjaGVkQ2xvc2luZ1RhZyA9IGVkaXRvclRleHQuc2xpY2UoMCwgYmVmb3JlSW5kZXgpLm1hdGNoKGxhc3RUYWdSRSlcbiAgICAgICAgICBpZiBtYXRjaGVkQ2xvc2luZ1RhZ1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZWRDbG9zaW5nVGFnLmluZGV4ICsgbWF0Y2hlZENsb3NpbmdUYWdbMF0ubGVuZ3RoXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIC0xXG5cbiAgICAgICAgdGFnSW5kZXggPSBmaW5kVGFnQmVmb3JlKG9mZnNldClcbiAgICAgICAgaWYgdGFnSW5kZXggPiAtMVxuICAgICAgICAgIGVkaXRvclRleHQgPSBcIlwiXCJcbiAgICAgICAgICAje2VkaXRvclRleHQuc2xpY2UoMCwgdGFnSW5kZXgpfVxuICAgICAgICAgICN7c2Nyb2xsSW5qZWN0U2NyaXB0fVxuICAgICAgICAgICN7ZWRpdG9yVGV4dC5zbGljZSh0YWdJbmRleCl9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJldHVybiAtMVxuXG4gICAgb3V0ICs9IGVkaXRvclRleHRcblxuICAgIEB0bXBQYXRoID0gb3V0UGF0aFxuICAgIGZzLndyaXRlRmlsZSBvdXRQYXRoLCBvdXQsID0+XG4gICAgICB0cnlcbiAgICAgICAgQHJlbmRlckhUTUxDb2RlKClcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIEBzaG93RXJyb3IgZXJyb3JcblxuICByZW5kZXJIVE1MQ29kZTogKCkgLT5cbiAgICB1bmxlc3MgQHdlYnZpZXc/XG4gICAgICB3ZWJ2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIndlYnZpZXdcIilcbiAgICAgICMgRml4IGZyb20gQGt3YWFrIChodHRwczovL2dpdGh1Yi5jb20vd2ViQm94aW8vYXRvbS1odG1sLXByZXZpZXcvaXNzdWVzLzEvI2lzc3VlY29tbWVudC00OTYzOTE2MilcbiAgICAgICMgQWxsb3dzIGZvciB0aGUgdXNlIG9mIHJlbGF0aXZlIHJlc291cmNlcyAoc2NyaXB0cywgc3R5bGVzKVxuICAgICAgd2Vidmlldy5zZXRBdHRyaWJ1dGUoXCJzYW5kYm94XCIsIFwiYWxsb3ctc2NyaXB0cyBhbGxvdy1zYW1lLW9yaWdpblwiKVxuICAgICAgd2Vidmlldy5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImhlaWdodDogMTAwJVwiKVxuICAgICAgQHdlYnZpZXcgPSB3ZWJ2aWV3XG4gICAgICBAYXBwZW5kICQgd2Vidmlld1xuXG4gICAgQHdlYnZpZXcuc3JjID0gQHRtcFBhdGhcbiAgICB0cnlcbiAgICAgIEBmaW5kKCcuc2hvdy1lcnJvcicpLmhpZGUoKVxuICAgICAgQGZpbmQoJy5zaG93LWxvYWRpbmcnKS5oaWRlKClcbiAgICAgIEB3ZWJ2aWV3LnJlbG9hZCgpXG5cbiAgICBjYXRjaCBlcnJvclxuICAgICAgbnVsbFxuXG4gICAgIyBAdHJpZ2dlcignYXRvbS1odG1sLXByZXZpZXc6aHRtbC1jaGFuZ2VkJylcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoICdhdG9tLWh0bWwtcHJldmlldycsICdodG1sLWNoYW5nZWQnXG5cbiAgIyBHZXQgdGhlIG9mZnNldCBvZiBhIGZpbGUgYXQgYSBzcGVjaWZpYyBQb2ludCBpbiB0aGUgZmlsZVxuICBfZ2V0T2Zmc2V0OiAodGV4dCwgcm93LCBjb2x1bW49MCkgLT5cbiAgICBsaW5lX3JlID0gL1xcbi9nXG4gICAgbWF0Y2hfaW5kZXggPSBudWxsXG4gICAgd2hpbGUgcm93LS1cbiAgICAgIGlmIG1hdGNoID0gbGluZV9yZS5leGVjKHRleHQpXG4gICAgICAgIG1hdGNoX2luZGV4ID0gbWF0Y2guaW5kZXhcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgb2Zmc2V0ID0gbWF0Y2hfaW5kZXggKyBjb2x1bW5cbiAgICByZXR1cm4gaWYgb2Zmc2V0IDwgdGV4dC5sZW5ndGggdGhlbiBvZmZzZXQgZWxzZSAtMVxuXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgaWYgQGVkaXRvcj9cbiAgICAgIFwiI3tAZWRpdG9yLmdldFRpdGxlKCl9IFByZXZpZXdcIlxuICAgIGVsc2VcbiAgICAgIFwiSFRNTCBQcmV2aWV3XCJcblxuICBnZXRVUkk6IC0+XG4gICAgXCJodG1sLXByZXZpZXc6Ly9lZGl0b3IvI3tAZWRpdG9ySWR9XCJcblxuICBnZXRQYXRoOiAtPlxuICAgIGlmIEBlZGl0b3I/XG4gICAgICBAZWRpdG9yLmdldFBhdGgoKVxuXG4gIHNob3dFcnJvcjogKHJlc3VsdCkgLT5cbiAgICBmYWlsdXJlTWVzc2FnZSA9IHJlc3VsdD8ubWVzc2FnZVxuXG4gICAgQGZpbmQoJy5zaG93LWVycm9yJylcbiAgICAuaHRtbCAkJCQgLT5cbiAgICAgIEBoMiAnUHJldmlld2luZyBIVE1MIEZhaWxlZCdcbiAgICAgIEBoMyBmYWlsdXJlTWVzc2FnZSBpZiBmYWlsdXJlTWVzc2FnZT9cbiAgICAuc2hvdygpXG5cbiAgc2hvd0xvYWRpbmc6IC0+XG4gICAgQGZpbmQoJy5zaG93LWxvYWRpbmcnKS5zaG93KClcbiJdfQ==
