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
    var i, originalRange, ref, ref1, row, rows, toggledTask;
    originalRange = selection.getBufferRange();
    rows = selection.getBufferRowRange();
    for (row = i = ref = rows[0], ref1 = rows[1]; ref <= ref1 ? i <= ref1 : i >= ref1; row = ref <= ref1 ? ++i : --i) {
      selection.cursor.setBufferPosition([row, 0]);
      selection.selectToEndOfLine();
      toggledTask = toggleTask(selection.getText());
      selection.insertText(toggledTask);
    }
    return selection.setBufferRange(originalRange);
  };

  toggleTask = function(taskText) {
    var REGEX;
    REGEX = /([\-\*] )(\[[ x]\])/;
    return taskText.replace(REGEX, function(_, taskPrefix, taskStatus) {
      if (taskStatus === "[ ]") {
        return taskPrefix + "[x]";
      } else {
        return taskPrefix + "[ ]";
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2dnbGUtbWFya2Rvd24tdGFzay9saWIvdG9nZ2xlLW1hcmtkb3duLXRhc2suY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGtCQUFBLEdBQ2Y7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO2FBQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQ2pCO1FBQUEsNkJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CO09BRGlCLENBQW5CO0lBRlEsQ0FGVjtJQU9BLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQVBaO0lBVUEsTUFBQSxFQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBRyxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVo7ZUFDRSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNkLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixTQUFDLFNBQUQ7cUJBQzdCLGVBQUEsQ0FBZ0IsU0FBaEI7WUFENkIsQ0FBL0I7VUFEYztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEIsRUFERjs7SUFETSxDQVZSOzs7RUFnQkYsZUFBQSxHQUFrQixTQUFDLFNBQUQ7QUFDaEIsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsU0FBUyxDQUFDLGNBQVYsQ0FBQTtJQUVoQixJQUFBLEdBQU8sU0FBUyxDQUFDLGlCQUFWLENBQUE7QUFDUCxTQUFXLDJHQUFYO01BQ0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBbUMsQ0FBQyxHQUFELEVBQU0sQ0FBTixDQUFuQztNQUNBLFNBQVMsQ0FBQyxpQkFBVixDQUFBO01BRUEsV0FBQSxHQUFjLFVBQUEsQ0FBVyxTQUFTLENBQUMsT0FBVixDQUFBLENBQVg7TUFDZCxTQUFTLENBQUMsVUFBVixDQUFxQixXQUFyQjtBQUxGO1dBT0EsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsYUFBekI7RUFYZ0I7O0VBYWxCLFVBQUEsR0FBYSxTQUFDLFFBQUQ7QUFDWCxRQUFBO0lBQUEsS0FBQSxHQUFRO1dBU1IsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsU0FBQyxDQUFELEVBQUksVUFBSixFQUFnQixVQUFoQjtNQUN0QixJQUFHLFVBQUEsS0FBYyxLQUFqQjtlQUNLLFVBQUQsR0FBWSxNQURoQjtPQUFBLE1BQUE7ZUFHSyxVQUFELEdBQVksTUFIaEI7O0lBRHNCLENBQXhCO0VBVlc7QUFoQ2IiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvZ2dsZU1hcmtkb3duVGFzayA9XG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ3RvZ2dsZS1tYXJrZG93bi10YXNrOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICAgIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICAgIHRvZ2dsZVNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbnRvZ2dsZVNlbGVjdGlvbiA9IChzZWxlY3Rpb24pIC0+XG4gIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIHJvd3MgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICBmb3Igcm93IGluIFtyb3dzWzBdLi5yb3dzWzFdXVxuICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgMF0pXG4gICAgc2VsZWN0aW9uLnNlbGVjdFRvRW5kT2ZMaW5lKClcblxuICAgIHRvZ2dsZWRUYXNrID0gdG9nZ2xlVGFzayhzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRvZ2dsZWRUYXNrKVxuXG4gIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShvcmlnaW5hbFJhbmdlKVxuXG50b2dnbGVUYXNrID0gKHRhc2tUZXh0KSAtPlxuICBSRUdFWCA9IC8vL1xuICAgIChbXFwtXFwqXVxcICkgIyB0YXNrIHByZWZpeDogJy0gJyBvciAnKiAnXG4gICAgKCAgICAgICAgICAjIHN0YXJ0IGNhcHR1cmUgZ3JvdXAgZm9yIHRhc2sgc3RhdHVzXG4gICAgICBcXFsgICAgICAgIyB0YXNrIHN0YXR1cyBiZWdpbnMgd2l0aCBhbiBvcGVuIGJyYWNrZXQ6ICdbJ1xuICAgICAgW1xcIHhdICAgICMgdGFzayBzdGF0dXMgYnJhY2tldHMgY29udGFpbiBhIHNpbmdsZSBlbXB0eSBzcGFjZSBvciBhbiAneCdcbiAgICAgIFxcXSAgICAgICAjIHRhc2sgc3RhdHVzIGVuZHMgd2l0aCBhIGNsb3NpbmcgYnJhY2tldDogJ10nXG4gICAgKSAgICAgICAgICAjIGVuZCBjYXB0dXJlIGdyb3VwIGZvciB0YXNrIHN0YXR1c1xuICAvLy9cblxuICB0YXNrVGV4dC5yZXBsYWNlIFJFR0VYLCAoXywgdGFza1ByZWZpeCwgdGFza1N0YXR1cykgLT5cbiAgICBpZiB0YXNrU3RhdHVzID09IFwiWyBdXCJcbiAgICAgIFwiI3t0YXNrUHJlZml4fVt4XVwiXG4gICAgZWxzZVxuICAgICAgXCIje3Rhc2tQcmVmaXh9WyBdXCJcbiJdfQ==
