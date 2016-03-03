(function() {
  var $, Point, Range, SymbolsContextMenu, SymbolsTreeView, TagGenerator, TagParser, TreeView, View, jQuery, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, jQuery = _ref1.jQuery, View = _ref1.View;

  TreeView = require('./tree-view').TreeView;

  TagGenerator = require('./tag-generator');

  TagParser = require('./tag-parser');

  SymbolsContextMenu = require('./symbols-context-menu');

  module.exports = SymbolsTreeView = (function(_super) {
    __extends(SymbolsTreeView, _super);

    function SymbolsTreeView() {
      return SymbolsTreeView.__super__.constructor.apply(this, arguments);
    }

    SymbolsTreeView.content = function() {
      return this.div({
        "class": 'symbols-tree-view tool-panel focusable-panel'
      });
    };

    SymbolsTreeView.prototype.initialize = function() {
      this.treeView = new TreeView;
      this.append(this.treeView);
      this.cachedStatus = {};
      this.contextMenu = new SymbolsContextMenu;
      this.autoHideTypes = atom.config.get('symbols-tree-view.zAutoHideTypes');
      this.treeView.onSelect((function(_this) {
        return function(_arg) {
          var bottom, desiredScrollCenter, desiredScrollTop, done, editor, from, height, item, left, node, screenPosition, screenRange, step, to, top, width, _ref2;
          node = _arg.node, item = _arg.item;
          if (item.position.row >= 0 && (editor = atom.workspace.getActiveTextEditor())) {
            screenPosition = editor.screenPositionForBufferPosition(item.position);
            screenRange = new Range(screenPosition, screenPosition);
            _ref2 = editor.pixelRectForScreenRange(screenRange), top = _ref2.top, left = _ref2.left, height = _ref2.height, width = _ref2.width;
            bottom = top + height;
            desiredScrollCenter = top + height / 2;
            if (!((editor.getScrollTop() < desiredScrollCenter && desiredScrollCenter < editor.getScrollBottom()))) {
              desiredScrollTop = desiredScrollCenter - editor.getHeight() / 2;
            }
            from = {
              top: editor.getScrollTop()
            };
            to = {
              top: desiredScrollTop
            };
            step = function(now) {
              return editor.setScrollTop(now);
            };
            done = function() {
              editor.scrollToBufferPosition(item.position, {
                center: true
              });
              editor.setCursorBufferPosition(item.position);
              return editor.moveToFirstCharacterOfLine();
            };
            return jQuery(from).animate(to, {
              duration: _this.animationDuration,
              step: step,
              done: done
            });
          }
        };
      })(this));
      atom.config.observe('symbols-tree-view.scrollAnimation', (function(_this) {
        return function(enabled) {
          return _this.animationDuration = enabled ? 300 : 0;
        };
      })(this));
      this.minimalWidth = 5;
      this.originalWidth = 200;
      return atom.config.observe('symbols-tree-view.autoHide', (function(_this) {
        return function(autoHide) {
          if (!autoHide) {
            return _this.width(_this.originalWidth);
          } else {
            return _this.width(_this.minimalWidth);
          }
        };
      })(this));
    };

    SymbolsTreeView.prototype.getEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    SymbolsTreeView.prototype.getScopeName = function() {
      var _ref2, _ref3;
      return (_ref2 = atom.workspace.getActiveTextEditor()) != null ? (_ref3 = _ref2.getGrammar()) != null ? _ref3.scopeName : void 0 : void 0;
    };

    SymbolsTreeView.prototype.populate = function() {
      var editor, filePath;
      if (!(editor = this.getEditor())) {
        return this.hide();
      } else {
        filePath = editor.getPath();
        this.generateTags(filePath);
        this.show();
        this.onEditorSave = editor.onDidSave((function(_this) {
          return function(state) {
            filePath = editor.getPath();
            return _this.generateTags(filePath);
          };
        })(this));
        return this.onChangeRow = editor.onDidChangeCursorPosition((function(_this) {
          return function(_arg) {
            var newBufferPosition, oldBufferPosition;
            oldBufferPosition = _arg.oldBufferPosition, newBufferPosition = _arg.newBufferPosition;
            if (oldBufferPosition.row !== newBufferPosition.row) {
              return _this.focusCurrentCursorTag();
            }
          };
        })(this));
      }
    };

    SymbolsTreeView.prototype.focusCurrentCursorTag = function() {
      var editor, row, tag;
      if (editor = this.getEditor()) {
        row = editor.getCursorBufferPosition().row;
        tag = this.parser.getNearestTag(row);
        return this.treeView.select(tag);
      }
    };

    SymbolsTreeView.prototype.focusClickedTag = function(editor, text) {
      var t, tag;
      console.log("clicked: " + text);
      if (editor = this.getEditor()) {
        tag = ((function() {
          var _i, _len, _ref2, _results;
          _ref2 = this.parser.tags;
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            t = _ref2[_i];
            if (t.name === text) {
              _results.push(t);
            }
          }
          return _results;
        }).call(this))[0];
        this.treeView.select(tag);
        return jQuery('.list-item.list-selectable-item.selected').click();
      }
    };

    SymbolsTreeView.prototype.updateContextMenu = function(types) {
      var editor, toggleSortByName, toggleTypeVisible, type, visible, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5;
      this.contextMenu.clear();
      editor = (_ref2 = this.getEditor()) != null ? _ref2.id : void 0;
      toggleTypeVisible = (function(_this) {
        return function(type) {
          _this.treeView.toggleTypeVisible(type);
          return _this.nowTypeStatus[type] = !_this.nowTypeStatus[type];
        };
      })(this);
      toggleSortByName = (function(_this) {
        return function() {
          var type, visible, _ref3;
          _this.nowSortStatus[0] = !_this.nowSortStatus[0];
          if (_this.nowSortStatus[0]) {
            _this.treeView.sortByName();
          } else {
            _this.treeView.sortByRow();
          }
          _ref3 = _this.nowTypeStatus;
          for (type in _ref3) {
            visible = _ref3[type];
            if (!visible) {
              _this.treeView.toggleTypeVisible(type);
            }
          }
          return _this.focusCurrentCursorTag();
        };
      })(this);
      if (this.cachedStatus[editor]) {
        _ref3 = this.cachedStatus[editor], this.nowTypeStatus = _ref3.nowTypeStatus, this.nowSortStatus = _ref3.nowSortStatus;
        _ref4 = this.nowTypeStatus;
        for (type in _ref4) {
          visible = _ref4[type];
          if (!visible) {
            this.treeView.toggleTypeVisible(type);
          }
        }
        if (this.nowSortStatus[0]) {
          this.treeView.sortByName();
        }
      } else {
        this.cachedStatus[editor] = {
          nowTypeStatus: {},
          nowSortStatus: [false]
        };
        for (_i = 0, _len = types.length; _i < _len; _i++) {
          type = types[_i];
          this.cachedStatus[editor].nowTypeStatus[type] = true;
        }
        this.sortByNameScopes = atom.config.get('symbols-tree-view.sortByNameScopes');
        if (this.sortByNameScopes.indexOf(this.getScopeName()) !== -1) {
          this.cachedStatus[editor].nowSortStatus[0] = true;
        }
        _ref5 = this.cachedStatus[editor], this.nowTypeStatus = _ref5.nowTypeStatus, this.nowSortStatus = _ref5.nowSortStatus;
      }
      for (_j = 0, _len1 = types.length; _j < _len1; _j++) {
        type = types[_j];
        this.contextMenu.addMenu(type, this.nowTypeStatus[type], toggleTypeVisible);
      }
      this.contextMenu.addSeparator();
      return this.contextMenu.addMenu('sort by name', this.nowSortStatus[0], toggleSortByName);
    };

    SymbolsTreeView.prototype.generateTags = function(filePath) {
      return new TagGenerator(filePath, this.getScopeName()).generate().done((function(_this) {
        return function(tags) {
          var root, type, types, _i, _len, _ref2, _results;
          _this.parser = new TagParser(tags, _this.getScopeName());
          _ref2 = _this.parser.parse(), root = _ref2.root, types = _ref2.types;
          _this.treeView.setRoot(root);
          _this.updateContextMenu(types);
          _this.focusCurrentCursorTag();
          if (_this.autoHideTypes) {
            _results = [];
            for (_i = 0, _len = types.length; _i < _len; _i++) {
              type = types[_i];
              if (_this.autoHideTypes.indexOf(type) !== -1) {
                _this.treeView.toggleTypeVisible(type);
                _results.push(_this.contextMenu.toggle(type));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      })(this));
    };

    SymbolsTreeView.prototype.serialize = function() {};

    SymbolsTreeView.prototype.destroy = function() {
      return this.element.remove();
    };

    SymbolsTreeView.prototype.attach = function() {
      if (atom.config.get('tree-view.showOnRightSide')) {
        this.panel = atom.workspace.addLeftPanel({
          item: this
        });
      } else {
        this.panel = atom.workspace.addRightPanel({
          item: this
        });
      }
      this.contextMenu.attach();
      return this.contextMenu.hide();
    };

    SymbolsTreeView.prototype.attached = function() {
      this.onChangeEditor = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          _this.removeEventForEditor();
          return _this.populate();
        };
      })(this));
      this.onChangeAutoHide = atom.config.observe('symbols-tree-view.autoHide', (function(_this) {
        return function(autoHide) {
          if (!autoHide) {
            return _this.off('mouseenter mouseleave');
          } else {
            _this.mouseenter(function(event) {
              _this.stop();
              return _this.animate({
                width: _this.originalWidth
              }, {
                duration: _this.animationDuration
              });
            });
            return _this.mouseleave(function(event) {
              _this.stop();
              if (atom.config.get('tree-view.showOnRightSide')) {
                if (event.offsetX > 0) {
                  return _this.animate({
                    width: _this.minimalWidth
                  }, {
                    duration: _this.animationDuration
                  });
                }
              } else {
                if (event.offsetX <= 0) {
                  return _this.animate({
                    width: _this.minimalWidth
                  }, {
                    duration: _this.animationDuration
                  });
                }
              }
            });
          }
        };
      })(this));
      return this.on("contextmenu", (function(_this) {
        return function(event) {
          var left;
          left = event.pageX;
          if (left + _this.contextMenu.width() > atom.getSize().width) {
            left = left - _this.contextMenu.width();
          }
          _this.contextMenu.css({
            left: left,
            top: event.pageY
          });
          _this.contextMenu.show();
          return false;
        };
      })(this));
    };

    SymbolsTreeView.prototype.removeEventForEditor = function() {
      var _ref2, _ref3;
      if ((_ref2 = this.onEditorSave) != null) {
        _ref2.dispose();
      }
      return (_ref3 = this.onChangeRow) != null ? _ref3.dispose() : void 0;
    };

    SymbolsTreeView.prototype.detached = function() {
      var _ref2, _ref3;
      if ((_ref2 = this.onChangeEditor) != null) {
        _ref2.dispose();
      }
      if ((_ref3 = this.onChangeAutoHide) != null) {
        _ref3.dispose();
      }
      this.removeEventForEditor();
      return this.off("contextmenu");
    };

    SymbolsTreeView.prototype.remove = function() {
      SymbolsTreeView.__super__.remove.apply(this, arguments);
      return this.panel.destroy();
    };

    SymbolsTreeView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.remove();
      } else {
        this.populate();
        return this.attach();
      }
    };

    SymbolsTreeView.prototype.showView = function() {
      if (!this.hasParent()) {
        this.populate();
        return this.attach();
      }
    };

    SymbolsTreeView.prototype.hideView = function() {
      if (this.hasParent()) {
        return this.remove();
      }
    };

    return SymbolsTreeView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvc3ltYm9scy10cmVlLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixDQUFBOztBQUFBLEVBQ0EsUUFBb0IsT0FBQSxDQUFRLHNCQUFSLENBQXBCLEVBQUMsVUFBQSxDQUFELEVBQUksZUFBQSxNQUFKLEVBQVksYUFBQSxJQURaLENBQUE7O0FBQUEsRUFFQyxXQUFZLE9BQUEsQ0FBUSxhQUFSLEVBQVosUUFGRCxDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUhmLENBQUE7O0FBQUEsRUFJQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FKWixDQUFBOztBQUFBLEVBS0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSLENBTHJCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNRO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sOENBQVA7T0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDhCQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBQSxDQUFBLFFBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsUUFBVCxDQURBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FB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

//# sourceURL=/Users/igawataiichi/.atom/packages/symbols-tree-view/lib/symbols-tree-view.coffee
