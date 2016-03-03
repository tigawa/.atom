(function() {
  var SymbolsTreeView;

  SymbolsTreeView = require('./symbols-tree-view');

  module.exports = {
    config: {
      autoToggle: {
        type: 'boolean',
        "default": false,
        description: 'If this option is enabled then symbols-tree-view will auto open when you open files.'
      },
      scrollAnimation: {
        type: 'boolean',
        "default": true,
        description: 'If this option is enabled then when you click the item in symbols-tree it will scroll to the destination gradually.'
      },
      autoHide: {
        type: 'boolean',
        "default": false,
        description: 'If this option is enabled then symbols-tree-view is always hidden unless mouse hover over it.'
      },
      zAutoHideTypes: {
        title: 'AutoHideTypes',
        type: 'string',
        description: 'Here you can specify a list of types that will be hidden by default (ex: "variable class")',
        "default": ''
      },
      sortByNameScopes: {
        type: 'string',
        description: 'Here you can specify a list of scopes that will be sorted by name (ex: "text.html.php")',
        "default": ''
      }
    },
    symbolsTreeView: null,
    activate: function(state) {
      this.symbolsTreeView = new SymbolsTreeView(state.symbolsTreeViewState);
      atom.commands.add('atom-workspace', {
        'symbols-tree-view:toggle': (function(_this) {
          return function() {
            return _this.symbolsTreeView.toggle();
          };
        })(this)
      });
      atom.commands.add('atom-workspace', {
        'symbols-tree-view:show': (function(_this) {
          return function() {
            return _this.symbolsTreeView.showView();
          };
        })(this)
      });
      atom.commands.add('atom-workspace', {
        'symbols-tree-view:hide': (function(_this) {
          return function() {
            return _this.symbolsTreeView.hideView();
          };
        })(this)
      });
      atom.config.observe('tree-view.showOnRightSide', (function(_this) {
        return function(value) {
          if (_this.symbolsTreeView.hasParent()) {
            _this.symbolsTreeView.remove();
            _this.symbolsTreeView.populate();
            return _this.symbolsTreeView.attach();
          }
        };
      })(this));
      return atom.config.observe("symbols-tree-view.autoToggle", (function(_this) {
        return function(enabled) {
          if (enabled) {
            if (!_this.symbolsTreeView.hasParent()) {
              return _this.symbolsTreeView.toggle();
            }
          } else {
            if (_this.symbolsTreeView.hasParent()) {
              return _this.symbolsTreeView.toggle();
            }
          }
        };
      })(this));
    },
    deactivate: function() {
      return this.symbolsTreeView.destroy();
    },
    serialize: function() {
      return {
        symbolsTreeViewState: this.symbolsTreeView.serialize()
      };
    },
    getProvider: function() {
      var view;
      view = this.symbolsTreeView;
      return {
        getSuggestionForWord: (function(_this) {
          return function(textEditor, text, range) {
            return {
              range: range,
              callback: function() {
                return view.focusClickedTag.bind(view)(textEditor, text);
              }
            };
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZUFBQTs7QUFBQSxFQUFBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBQWxCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsc0ZBRmI7T0FERjtBQUFBLE1BSUEsZUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxxSEFGYjtPQUxGO0FBQUEsTUFRQSxRQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLCtGQUZiO09BVEY7QUFBQSxNQVlBLGNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGVBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxXQUFBLEVBQWEsNEZBRmI7QUFBQSxRQUdBLFNBQUEsRUFBUyxFQUhUO09BYkY7QUFBQSxNQWlCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsV0FBQSxFQUFhLHlGQURiO0FBQUEsUUFFQSxTQUFBLEVBQVMsRUFGVDtPQWxCRjtLQURGO0FBQUEsSUF5QkEsZUFBQSxFQUFpQixJQXpCakI7QUFBQSxJQTJCQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7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

//# sourceURL=/Users/igawataiichi/.atom/packages/symbols-tree-view/lib/main.coffee
