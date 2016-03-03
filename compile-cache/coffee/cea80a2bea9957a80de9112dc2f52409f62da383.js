(function() {
  var $, CompositeDisposable, InputView;

  $ = require('atom-space-pen-views').$;

  CompositeDisposable = require('atom').CompositeDisposable;

  InputView = require('./input-view');

  module.exports = {
    config: {
      keepOptionsAfterSearch: {
        type: 'boolean',
        "default": true
      }
    },
    inputView: null,
    activate: function(state) {
      var handleEditorCancel;
      this.subscriber = new CompositeDisposable;
      this.subscriber.add(atom.commands.add('atom-workspace', 'incremental-search:forward', (function(_this) {
        return function() {
          return _this.findPressed('forward');
        };
      })(this)));
      this.subscriber.add(atom.commands.add('atom-workspace', 'incremental-search:backward', (function(_this) {
        return function() {
          return _this.findPressed('backward');
        };
      })(this)));
      handleEditorCancel = (function(_this) {
        return function(_arg) {
          var isMiniEditor, target, _ref;
          target = _arg.target;
          isMiniEditor = target.tagName === 'ATOM-TEXT-EDITOR' && target.hasAttribute('mini');
          if (!isMiniEditor) {
            return (_ref = _this.inputView) != null ? _ref.inputPanel.hide() : void 0;
          }
        };
      })(this);
      return this.subscriber.add(atom.commands.add('atom-workspace', {
        'core:cancel': handleEditorCancel,
        'core:close': handleEditorCancel
      }));
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.inputView) != null) {
        _ref.destroy();
      }
      return this.inputView = null;
    },
    findPressed: function(direction) {
      this.createViews();
      return this.inputView.trigger(direction);
    },
    createViews: function() {
      if (this.inputView != null) {
        return;
      }
      return this.inputView = new InputView();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9pbmNyZW1lbnRhbC1zZWFyY2gvbGliL2lzZWFyY2guY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQUFELENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQUhaLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLHNCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtPQURGO0tBREY7QUFBQSxJQUtBLFNBQUEsRUFBVyxJQUxYO0FBQUEsSUFPQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLGtCQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEdBQUEsQ0FBQSxtQkFBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyw0QkFBcEMsRUFBa0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxFLENBQWhCLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsNkJBQXBDLEVBQW1FLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRSxDQUFoQixDQUZBLENBQUE7QUFBQSxNQUlBLGtCQUFBLEdBQXFCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUNuQixjQUFBLDBCQUFBO0FBQUEsVUFEcUIsU0FBRCxLQUFDLE1BQ3JCLENBQUE7QUFBQSxVQUFBLFlBQUEsR0FBZSxNQUFNLENBQUMsT0FBUCxLQUFrQixrQkFBbEIsSUFBeUMsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsTUFBcEIsQ0FBeEQsQ0FBQTtBQUNBLFVBQUEsSUFBQSxDQUFBLFlBQUE7MERBQ1ksQ0FBRSxVQUFVLENBQUMsSUFBdkIsQ0FBQSxXQURGO1dBRm1CO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKckIsQ0FBQTthQVNBLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2Q7QUFBQSxRQUFBLGFBQUEsRUFBZSxrQkFBZjtBQUFBLFFBQ0EsWUFBQSxFQUFjLGtCQURkO09BRGMsQ0FBaEIsRUFWUTtJQUFBLENBUFY7QUFBQSxJQXFCQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBOztZQUFVLENBQUUsT0FBWixDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBRkg7SUFBQSxDQXJCWjtBQUFBLElBNEJBLFdBQUEsRUFBYSxTQUFDLFNBQUQsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7YUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsU0FBbkIsRUFIVztJQUFBLENBNUJiO0FBQUEsSUFpQ0EsV0FBQSxFQUFhLFNBQUEsR0FBQTtBQUNYLE1BQUEsSUFBVSxzQkFBVjtBQUFBLGNBQUEsQ0FBQTtPQUFBO2FBRUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxTQUFBLENBQUEsRUFITjtJQUFBLENBakNiO0dBTkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/incremental-search/lib/isearch.coffee
