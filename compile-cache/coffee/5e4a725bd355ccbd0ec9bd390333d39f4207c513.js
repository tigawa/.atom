(function() {
  var $, $$, SymbolsContextMenu, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$ = _ref.$$, View = _ref.View;

  module.exports = SymbolsContextMenu = (function(_super) {
    __extends(SymbolsContextMenu, _super);

    function SymbolsContextMenu() {
      return SymbolsContextMenu.__super__.constructor.apply(this, arguments);
    }

    SymbolsContextMenu.content = function() {
      return this.div({
        "class": 'symbols-context-menu'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'select-list popover-list'
          }, function() {
            _this.input({
              type: 'text',
              "class": 'hidden-input',
              outlet: 'hiddenInput'
            });
            return _this.ol({
              "class": 'list-group mark-active',
              outlet: 'menus'
            });
          });
        };
      })(this));
    };

    SymbolsContextMenu.prototype.initialize = function() {
      return this.hiddenInput.on('focusout', (function(_this) {
        return function() {
          return _this.hide();
        };
      })(this));
    };

    SymbolsContextMenu.prototype.clear = function() {
      return this.menus.empty();
    };

    SymbolsContextMenu.prototype.addMenu = function(name, active, callback) {
      var menu;
      menu = $$(function() {
        return this.li({
          "class": (active ? 'active' : '')
        }, name);
      });
      menu.on('mousedown', (function(_this) {
        return function() {
          menu.toggleClass('active');
          _this.hiddenInput.blur();
          return callback(name);
        };
      })(this));
      return this.menus.append(menu);
    };

    SymbolsContextMenu.prototype.toggle = function(type) {
      var menu, _i, _len, _ref1, _results;
      _ref1 = this.menus.find('li');
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        menu = _ref1[_i];
        if ($(menu).text() === type) {
          _results.push($(menu).toggleClass('active'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SymbolsContextMenu.prototype.addSeparator = function() {
      return this.menus.append($$(function() {
        return this.li({
          "class": 'separator'
        });
      }));
    };

    SymbolsContextMenu.prototype.show = function() {
      if (this.menus.children().length > 0) {
        SymbolsContextMenu.__super__.show.apply(this, arguments);
        return this.hiddenInput.focus();
      }
    };

    SymbolsContextMenu.prototype.attach = function() {
      return atom.views.getView(atom.workspace).appendChild(this.element);
    };

    return SymbolsContextMenu;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvc3ltYm9scy1jb250ZXh0LW1lbnUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFnQixPQUFBLENBQVEsc0JBQVIsQ0FBaEIsRUFBQyxTQUFBLENBQUQsRUFBSSxVQUFBLEVBQUosRUFBUSxZQUFBLElBQVIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sc0JBQVA7T0FBTCxFQUFvQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNsQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sMEJBQVA7V0FBTCxFQUF3QyxTQUFBLEdBQUE7QUFDdEMsWUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPO0FBQUEsY0FBQSxJQUFBLEVBQU0sTUFBTjtBQUFBLGNBQWMsT0FBQSxFQUFPLGNBQXJCO0FBQUEsY0FBcUMsTUFBQSxFQUFRLGFBQTdDO2FBQVAsQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxjQUFBLE9BQUEsRUFBTyx3QkFBUDtBQUFBLGNBQWlDLE1BQUEsRUFBUSxPQUF6QzthQUFKLEVBRnNDO1VBQUEsQ0FBeEMsRUFEa0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLGlDQU1BLFVBQUEsR0FBWSxTQUFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/symbols-tree-view/lib/symbols-context-menu.coffee
