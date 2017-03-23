(function() {
  var $, CompositeDisposable, InputView;

  $ = require('atom-space-pen-views').$;

  CompositeDisposable = require('atom').CompositeDisposable;

  InputView = require('./input-view');

  module.exports = {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9pbmNyZW1lbnRhbC1zZWFyY2gvbGliL2lzZWFyY2guY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQUFELENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQUhaLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxTQUFBLEVBQVcsSUFBWDtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSxrQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxHQUFBLENBQUEsbUJBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsNEJBQXBDLEVBQWtFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBYSxTQUFiLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRSxDQUFoQixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLDZCQUFwQyxFQUFtRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxXQUFELENBQWEsVUFBYixFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkUsQ0FBaEIsQ0FGQSxDQUFBO0FBQUEsTUFJQSxrQkFBQSxHQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDbkIsY0FBQSwwQkFBQTtBQUFBLFVBRHFCLFNBQUQsS0FBQyxNQUNyQixDQUFBO0FBQUEsVUFBQSxZQUFBLEdBQWUsTUFBTSxDQUFDLE9BQVAsS0FBa0Isa0JBQWxCLElBQXlDLE1BQU0sQ0FBQyxZQUFQLENBQW9CLE1BQXBCLENBQXhELENBQUE7QUFDQSxVQUFBLElBQUEsQ0FBQSxZQUFBOzBEQUNZLENBQUUsVUFBVSxDQUFDLElBQXZCLENBQUEsV0FERjtXQUZtQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSnJCLENBQUE7YUFTQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNkO0FBQUEsUUFBQSxhQUFBLEVBQWUsa0JBQWY7QUFBQSxRQUNBLFlBQUEsRUFBYyxrQkFEZDtPQURjLENBQWhCLEVBVlE7SUFBQSxDQUZWO0FBQUEsSUFnQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsSUFBQTs7WUFBVSxDQUFFLE9BQVosQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUZIO0lBQUEsQ0FoQlo7QUFBQSxJQXVCQSxXQUFBLEVBQWEsU0FBQyxTQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLFNBQW5CLEVBSFc7SUFBQSxDQXZCYjtBQUFBLElBNEJBLFdBQUEsRUFBYSxTQUFBLEdBQUE7QUFDWCxNQUFBLElBQVUsc0JBQVY7QUFBQSxjQUFBLENBQUE7T0FBQTthQUVBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsU0FBQSxDQUFBLEVBSE47SUFBQSxDQTVCYjtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/incremental-search/lib/isearch.coffee
