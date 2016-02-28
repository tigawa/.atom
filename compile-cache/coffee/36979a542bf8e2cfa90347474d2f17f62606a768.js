(function() {
  var CompositeDisposable, DialogView, TextEditorView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), View = _ref.View, TextEditorView = _ref.TextEditorView;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = DialogView = (function(_super) {
    __extends(DialogView, _super);

    function DialogView() {
      this.focusTextField = __bind(this.focusTextField, this);
      this.setTargetFile = __bind(this.setTargetFile, this);
      return DialogView.__super__.constructor.apply(this, arguments);
    }

    DialogView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": 'padded rails-transporter'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": "block"
          }, function() {
            _this.label("No target file found. Enter the path for the file to open");
            return _this.subview('fileEditor', new TextEditorView({
              mini: true,
              placeholder: '/path/to/file'
            }));
          });
        };
      })(this));
    };

    DialogView.prototype.initialize = function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add(this.fileEditor.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.openFile();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return typeof _this.panel === "function" ? _this.panel(hide()) : void 0;
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add(this.element, {
        'core:close': (function(_this) {
          return function() {
            var _ref1;
            return (_ref1 = _this.panel) != null ? _ref1.hide() : void 0;
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            var _ref1;
            return (_ref1 = _this.panel) != null ? _ref1.hide() : void 0;
          };
        })(this)
      }));
    };

    DialogView.prototype.destroy = function() {
      var _ref1;
      return (_ref1 = this.subscriptions) != null ? _ref1.dispose() : void 0;
    };

    DialogView.prototype.setPanel = function(panel) {
      this.panel = panel;
      return this.subscriptions.add(this.panel.onDidChangeVisible((function(_this) {
        return function(visible) {
          if (visible) {
            return _this.didShow();
          } else {
            return _this.didHide();
          }
        };
      })(this)));
    };

    DialogView.prototype.didShow = function() {};

    DialogView.prototype.didHide = function() {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return workspaceElement.focus();
    };

    DialogView.prototype.openFile = function() {
      var _ref1;
      atom.workspace.open(this.fileEditor.getText());
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    DialogView.prototype.setTargetFile = function(path) {
      var currentFile, projectPath;
      if (path != null) {
        projectPath = atom.project.relativizePath(path);
      } else {
        currentFile = atom.workspace.getActiveTextEditor().getPath();
        projectPath = atom.project.relativizePath(currentFile);
      }
      return this.fileEditor.setText(projectPath[1]);
    };

    DialogView.prototype.focusTextField = function() {
      return this.fileEditor.focus();
    };

    return DialogView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy10cmFuc3BvcnRlci9saWIvZGlhbG9nLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsWUFBQSxJQUFELEVBQU8sc0JBQUEsY0FBUCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osaUNBQUEsQ0FBQTs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLFFBQUEsRUFBVSxDQUFBLENBQVY7QUFBQSxRQUFjLE9BQUEsRUFBTywwQkFBckI7T0FBTCxFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNwRCxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUEsR0FBQTtBQUNuQixZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sMkRBQVAsQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEsQ0FBZTtBQUFBLGNBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxjQUFZLFdBQUEsRUFBYSxlQUF6QjthQUFmLENBQTNCLEVBRm1CO1VBQUEsQ0FBckIsRUFEb0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHlCQU1BLFVB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

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-transporter/lib/dialog-view.coffee
