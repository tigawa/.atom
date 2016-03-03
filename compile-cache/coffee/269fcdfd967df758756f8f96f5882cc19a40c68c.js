(function() {
  var $, $$, Emitter, ScrollView, TreeNode, TreeView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$ = _ref.$$, View = _ref.View, ScrollView = _ref.ScrollView;

  Emitter = require('event-kit').Emitter;

  module.exports = {
    TreeNode: TreeNode = (function(_super) {
      __extends(TreeNode, _super);

      function TreeNode() {
        this.dblClickItem = __bind(this.dblClickItem, this);
        this.clickItem = __bind(this.clickItem, this);
        return TreeNode.__super__.constructor.apply(this, arguments);
      }

      TreeNode.content = function(_arg) {
        var children, icon, label;
        label = _arg.label, icon = _arg.icon, children = _arg.children;
        if (children) {
          return this.li({
            "class": 'list-nested-item list-selectable-item'
          }, (function(_this) {
            return function() {
              _this.div({
                "class": 'list-item'
              }, function() {
                return _this.span({
                  "class": "icon " + icon
                }, label);
              });
              return _this.ul({
                "class": 'list-tree'
              }, function() {
                var child, _i, _len, _results;
                _results = [];
                for (_i = 0, _len = children.length; _i < _len; _i++) {
                  child = children[_i];
                  _results.push(_this.subview('child', new TreeNode(child)));
                }
                return _results;
              });
            };
          })(this));
        } else {
          return this.li({
            "class": 'list-item list-selectable-item'
          }, (function(_this) {
            return function() {
              return _this.span({
                "class": "icon " + icon
              }, label);
            };
          })(this));
        }
      };

      TreeNode.prototype.initialize = function(item) {
        this.emitter = new Emitter;
        this.item = item;
        this.item.view = this;
        this.on('dblclick', this.dblClickItem);
        return this.on('click', this.clickItem);
      };

      TreeNode.prototype.setCollapsed = function() {
        if (this.item.children) {
          return this.toggleClass('collapsed');
        }
      };

      TreeNode.prototype.setSelected = function() {
        return this.addClass('selected');
      };

      TreeNode.prototype.onDblClick = function(callback) {
        var child, _i, _len, _ref1, _results;
        this.emitter.on('on-dbl-click', callback);
        if (this.item.children) {
          _ref1 = this.item.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            _results.push(child.view.onDblClick(callback));
          }
          return _results;
        }
      };

      TreeNode.prototype.onSelect = function(callback) {
        var child, _i, _len, _ref1, _results;
        this.emitter.on('on-select', callback);
        if (this.item.children) {
          _ref1 = this.item.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            _results.push(child.view.onSelect(callback));
          }
          return _results;
        }
      };

      TreeNode.prototype.clickItem = function(event) {
        var $target, left, right, selected, width;
        if (this.item.children) {
          selected = this.hasClass('selected');
          this.removeClass('selected');
          $target = this.find('.list-item:first');
          left = $target.position().left;
          right = $target.children('span').position().left;
          width = right - left;
          if (event.offsetX <= width) {
            this.toggleClass('collapsed');
          }
          if (selected) {
            this.addClass('selected');
          }
          if (event.offsetX <= width) {
            return false;
          }
        }
        this.emitter.emit('on-select', {
          node: this,
          item: this.item
        });
        return false;
      };

      TreeNode.prototype.dblClickItem = function(event) {
        this.emitter.emit('on-dbl-click', {
          node: this,
          item: this.item
        });
        return false;
      };

      return TreeNode;

    })(View),
    TreeView: TreeView = (function(_super) {
      __extends(TreeView, _super);

      function TreeView() {
        this.sortByRow = __bind(this.sortByRow, this);
        this.sortByName = __bind(this.sortByName, this);
        this.toggleTypeVisible = __bind(this.toggleTypeVisible, this);
        this.traversal = __bind(this.traversal, this);
        this.onSelect = __bind(this.onSelect, this);
        return TreeView.__super__.constructor.apply(this, arguments);
      }

      TreeView.content = function() {
        return this.div({
          "class": '-tree-view-'
        }, (function(_this) {
          return function() {
            return _this.ul({
              "class": 'list-tree has-collapsable-children',
              outlet: 'root'
            });
          };
        })(this));
      };

      TreeView.prototype.initialize = function() {
        TreeView.__super__.initialize.apply(this, arguments);
        return this.emitter = new Emitter;
      };

      TreeView.prototype.deactivate = function() {
        return this.remove();
      };

      TreeView.prototype.onSelect = function(callback) {
        return this.emitter.on('on-select', callback);
      };

      TreeView.prototype.setRoot = function(root, ignoreRoot) {
        if (ignoreRoot == null) {
          ignoreRoot = true;
        }
        this.rootNode = new TreeNode(root);
        this.rootNode.onDblClick((function(_this) {
          return function(_arg) {
            var item, node;
            node = _arg.node, item = _arg.item;
            return node.setCollapsed();
          };
        })(this));
        this.rootNode.onSelect((function(_this) {
          return function(_arg) {
            var item, node;
            node = _arg.node, item = _arg.item;
            _this.clearSelect();
            node.setSelected();
            return _this.emitter.emit('on-select', {
              node: node,
              item: item
            });
          };
        })(this));
        this.root.empty();
        return this.root.append($$(function() {
          return this.div((function(_this) {
            return function() {
              var child, _i, _len, _ref1, _results;
              if (ignoreRoot) {
                _ref1 = root.children;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  child = _ref1[_i];
                  _results.push(_this.subview('child', child.view));
                }
                return _results;
              } else {
                return _this.subview('root', root.view);
              }
            };
          })(this));
        }));
      };

      TreeView.prototype.traversal = function(root, doing) {
        var child, _i, _len, _ref1, _results;
        doing(root.item);
        if (root.item.children) {
          _ref1 = root.item.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            _results.push(this.traversal(child.view, doing));
          }
          return _results;
        }
      };

      TreeView.prototype.toggleTypeVisible = function(type) {
        return this.traversal(this.rootNode, (function(_this) {
          return function(item) {
            if (item.type === type) {
              return item.view.toggle();
            }
          };
        })(this));
      };

      TreeView.prototype.sortByName = function(ascending) {
        if (ascending == null) {
          ascending = true;
        }
        this.traversal(this.rootNode, (function(_this) {
          return function(item) {
            var _ref1;
            return (_ref1 = item.children) != null ? _ref1.sort(function(a, b) {
              if (ascending) {
                return a.name.localeCompare(b.name);
              } else {
                return b.name.localeCompare(a.name);
              }
            }) : void 0;
          };
        })(this));
        return this.setRoot(this.rootNode.item);
      };

      TreeView.prototype.sortByRow = function(ascending) {
        if (ascending == null) {
          ascending = true;
        }
        this.traversal(this.rootNode, (function(_this) {
          return function(item) {
            var _ref1;
            return (_ref1 = item.children) != null ? _ref1.sort(function(a, b) {
              if (ascending) {
                return a.position.row - b.position.row;
              } else {
                return b.position.row - a.position.row;
              }
            }) : void 0;
          };
        })(this));
        return this.setRoot(this.rootNode.item);
      };

      TreeView.prototype.clearSelect = function() {
        return $('.list-selectable-item').removeClass('selected');
      };

      TreeView.prototype.select = function(item) {
        this.clearSelect();
        return item != null ? item.view.setSelected() : void 0;
      };

      return TreeView;

    })(ScrollView)
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvdHJlZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwREFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFVBQUEsRUFBSixFQUFRLFlBQUEsSUFBUixFQUFjLGtCQUFBLFVBQWQsQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFdBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQWdCO0FBQ2QsaUNBQUEsQ0FBQTs7Ozs7O09BQUE7O0FBQUEsTUFBQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsWUFBQSxxQkFBQTtBQUFBLFFBRFUsYUFBQSxPQUFPLFlBQUEsTUFBTSxnQkFBQSxRQUN2QixDQUFBO0FBQUEsUUFBQSxJQUFHLFFBQUg7aUJBQ0UsSUFBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsT0FBQSxFQUFPLHVDQUFQO1dBQUosRUFBb0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTttQkFBQSxTQUFBLEdBQUE7QUFDbEQsY0FBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLFdBQVA7ZUFBTCxFQUF5QixTQUFBLEdBQUE7dUJBQ3ZCLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxrQkFBQSxPQUFBLEVBQVEsT0FBQSxHQUFPLElBQWY7aUJBQU4sRUFBNkIsS0FBN0IsRUFEdUI7Y0FBQSxDQUF6QixDQUFBLENBQUE7cUJBRUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLGdCQUFBLE9BQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/symbols-tree-view/lib/tree-view.coffee
