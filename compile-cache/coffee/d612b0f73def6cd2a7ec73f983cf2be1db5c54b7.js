(function() {
  var CompositeDisposable, ToggleMarkdownTask, toggleSelection, toggleTask;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ToggleMarkdownTask = {
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'toggle-markdown-task:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    toggle: function() {
      var editor;
      if (editor = atom.workspace.getActiveTextEditor()) {
        return editor.transact((function(_this) {
          return function() {
            return editor.getSelections().forEach(function(selection) {
              return toggleSelection(selection);
            });
          };
        })(this));
      }
    }
  };

  toggleSelection = function(selection) {
    var originalRange, row, rows, toggledTask, _i, _ref, _ref1;
    originalRange = selection.getBufferRange();
    rows = selection.getBufferRowRange();
    for (row = _i = _ref = rows[0], _ref1 = rows[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
      selection.cursor.setBufferPosition([row, 0]);
      selection.selectToEndOfLine();
      toggledTask = toggleTask(selection.getText());
      selection.insertText(toggledTask);
    }
    return selection.setBufferRange(originalRange);
  };

  toggleTask = function(taskText) {
    if (taskText.search(/\- \[ \]/) !== -1) {
      return taskText.replace(/\- \[ \]/, "- [x]");
    } else if (taskText.search(/\- \[x\]/) !== -1) {
      return taskText.replace(/\- \[x\]/, "- [ ]");
    } else {
      return taskText;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2dnbGUtbWFya2Rvd24tdGFzay9saWIvdG9nZ2xlLW1hcmtkb3duLXRhc2suY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9FQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixrQkFBQSxHQUNmO0FBQUEsSUFBQSxhQUFBLEVBQWUsSUFBZjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUNqQjtBQUFBLFFBQUEsNkJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0I7T0FEaUIsQ0FBbkIsRUFGUTtJQUFBLENBRlY7QUFBQSxJQU9BLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURVO0lBQUEsQ0FQWjtBQUFBLElBVUEsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEsTUFBQTtBQUFBLE1BQUEsSUFBRyxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVo7ZUFDRSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDZCxNQUFNLENBQUMsYUFBUCxDQUFBLENBQXNCLENBQUMsT0FBdkIsQ0FBK0IsU0FBQyxTQUFELEdBQUE7cUJBQzdCLGVBQUEsQ0FBZ0IsU0FBaEIsRUFENkI7WUFBQSxDQUEvQixFQURjO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEIsRUFERjtPQURNO0lBQUEsQ0FWUjtHQUhGLENBQUE7O0FBQUEsRUFtQkEsZUFBQSxHQUFrQixTQUFDLFNBQUQsR0FBQTtBQUNoQixRQUFBLHNEQUFBO0FBQUEsSUFBQSxhQUFBLEdBQWdCLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLElBRUEsSUFBQSxHQUFPLFNBQVMsQ0FBQyxpQkFBVixDQUFBLENBRlAsQ0FBQTtBQUdBLFNBQVcsd0hBQVgsR0FBQTtBQUNFLE1BQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBbUMsQ0FBQyxHQUFELEVBQU0sQ0FBTixDQUFuQyxDQUFBLENBQUE7QUFBQSxNQUNBLFNBQVMsQ0FBQyxpQkFBVixDQUFBLENBREEsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLFVBQUEsQ0FBVyxTQUFTLENBQUMsT0FBVixDQUFBLENBQVgsQ0FIZCxDQUFBO0FBQUEsTUFJQSxTQUFTLENBQUMsVUFBVixDQUFxQixXQUFyQixDQUpBLENBREY7QUFBQSxLQUhBO1dBVUEsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsYUFBekIsRUFYZ0I7RUFBQSxDQW5CbEIsQ0FBQTs7QUFBQSxFQWdDQSxVQUFBLEdBQWEsU0FBQyxRQUFELEdBQUE7QUFDWCxJQUFBLElBQUcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsVUFBaEIsQ0FBQSxLQUErQixDQUFBLENBQWxDO2FBQ0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsVUFBakIsRUFBNkIsT0FBN0IsRUFERjtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsTUFBVCxDQUFnQixVQUFoQixDQUFBLEtBQStCLENBQUEsQ0FBbEM7YUFDSCxRQUFRLENBQUMsT0FBVCxDQUFpQixVQUFqQixFQUE2QixPQUE3QixFQURHO0tBQUEsTUFBQTthQUdILFNBSEc7S0FITTtFQUFBLENBaENiLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/toggle-markdown-task/lib/toggle-markdown-task.coffee
