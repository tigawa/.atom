(function() {
  var $$, BaseFinderView, SelectListView, fs, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  fs = require('fs');

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  module.exports = BaseFinderView = (function(_super) {
    __extends(BaseFinderView, _super);

    function BaseFinderView() {
      return BaseFinderView.__super__.constructor.apply(this, arguments);
    }

    BaseFinderView.prototype.displayFiles = [];

    BaseFinderView.prototype.initialize = function() {
      BaseFinderView.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      return atom.commands.add(this.element, {
        'pane:split-left': (function(_this) {
          return function() {
            return _this.splitOpenPath(function(pane, item) {
              return pane.splitLeft({
                items: [item]
              });
            });
          };
        })(this),
        'pane:split-right': (function(_this) {
          return function() {
            return _this.splitOpenPath(function(pane, item) {
              return pane.splitRight({
                items: [item]
              });
            });
          };
        })(this),
        'pane:split-down': (function(_this) {
          return function() {
            return _this.splitOpenPath(function(pane, item) {
              return pane.splitDown({
                items: [item]
              });
            });
          };
        })(this),
        'pane:split-up': (function(_this) {
          return function() {
            return _this.splitOpenPath(function(pane, item) {
              return pane.splitUp({
                items: [item]
              });
            });
          };
        })(this)
      });
    };

    BaseFinderView.prototype.destroy = function() {
      var _ref1;
      this.cancel();
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    BaseFinderView.prototype.viewForItem = function(item) {
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div(path.basename(item), {
              "class": "primary-line file icon icon-file-text"
            });
            return _this.div(atom.project.relativize(item), {
              "class": 'secondary-line path no-icon'
            });
          };
        })(this));
      });
    };

    BaseFinderView.prototype.confirmed = function(item) {
      return atom.workspace.open(item);
    };

    BaseFinderView.prototype.toggle = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.panel) != null ? _ref1.isVisible() : void 0) {
        return this.cancel();
      } else {
        this.populate();
        if (((_ref2 = this.displayFiles) != null ? _ref2.length : void 0) > 0) {
          return this.show();
        }
      }
    };

    BaseFinderView.prototype.show = function() {
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    BaseFinderView.prototype.splitOpenPath = function(fn) {
      var filePath, pane, _ref1;
      filePath = (_ref1 = this.getSelectedItem()) != null ? _ref1 : {};
      if (!filePath) {
        return;
      }
      if (pane = atom.workspace.getActivePane()) {
        return atom.project.open(filePath).done((function(_this) {
          return function(editor) {
            return fn(pane, editor);
          };
        })(this));
      } else {
        return atom.workspace.open(filePath);
      }
    };

    BaseFinderView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    BaseFinderView.prototype.cancelled = function() {
      return this.hide();
    };

    return BaseFinderView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy10cmFuc3BvcnRlci9saWIvYmFzZS1maW5kZXItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsT0FBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsVUFBQSxFQUFELEVBQUssc0JBQUEsY0FGTCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw2QkFBQSxZQUFBLEdBQWMsRUFBZCxDQUFBOztBQUFBLDZCQUVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGtCQUFWLENBREEsQ0FBQTthQUdBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFDRTtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQ2pCLEtBQUMsQ0FBQSxhQUFELENBQWUsU0FBQyxJQUFELEVBQU8sSUFBUCxHQUFBO3FCQUFnQixJQUFJLENBQUMsU0FBTCxDQUFlO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLENBQUMsSUFBRCxDQUFQO2VBQWYsRUFBaEI7WUFBQSxDQUFmLEVBRGlCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7QUFBQSxRQUVBLGtCQUFBLEVB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

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-transporter/lib/base-finder-view.coffee
