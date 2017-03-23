(function() {
  describe("toggling markdown task", function() {
    var activationPromise, editor, editorView, toggleMarkdownTask, _ref;
    _ref = [], activationPromise = _ref[0], editor = _ref[1], editorView = _ref[2];
    toggleMarkdownTask = function(callback) {
      atom.commands.dispatch(editorView, "toggle-markdown-task:toggle");
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(callback);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open();
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
        return activationPromise = atom.packages.activatePackage("toggle-markdown-task");
      });
    });
    describe("when the cursor is on a single line", function() {
      it("toggles a task from incomplete to complete", function() {
        editor.setText("- [ ] A\n- [ ] B\n- [ ] C");
        editor.setCursorBufferPosition([1, 0]);
        return toggleMarkdownTask(function() {
          return expect(editor.getText()).toBe("- [ ] A\n- [x] B\n- [ ] C");
        });
      });
      it("toggles a task from complete to incomplete", function() {
        editor.setText("- [ ] A\n- [x] B\n- [ ] C");
        editor.setCursorBufferPosition([1, 0]);
        return toggleMarkdownTask(function() {
          return expect(editor.getText()).toBe("- [ ] A\n- [ ] B\n- [ ] C");
        });
      });
      return it("retains the original cursor position", function() {
        editor.setText("- [ ] A\n- [ ] B\n- [ ] C");
        editor.setCursorBufferPosition([1, 2]);
        return toggleMarkdownTask(function() {
          return expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
        });
      });
    });
    describe("when multiple lines are selected", function() {
      it("toggles completion of the tasks on the selected lines", function() {
        editor.setText("- [ ] A\n- [ ] B\n- [ ] C\n- [ ] D");
        editor.setSelectedBufferRange([[1, 1], [2, 1]]);
        return toggleMarkdownTask(function() {
          return expect(editor.getText()).toBe("- [ ] A\n- [x] B\n- [x] C\n- [ ] D");
        });
      });
      return it("retains the original selection range", function() {
        editor.setText("- [ ] A\n- [ ] B\n- [ ] C\n- [ ] D");
        editor.setSelectedBufferRange([[1, 1], [2, 1]]);
        return toggleMarkdownTask(function() {
          return expect(editor.getSelectedBufferRange()).toEqual([[1, 1], [2, 1]]);
        });
      });
    });
    return describe("when multiple cursors are present", function() {
      return it("toggles completion of the tasks in every cursor's selection range", function() {
        editor.setText("- [ ] A\n- [ ] B\n- [ ] C\n- [ ] D");
        editor.addCursorAtBufferPosition([0, 0]);
        editor.addSelectionForBufferRange([[2, 0], [3, 7]]);
        return toggleMarkdownTask(function() {
          return expect(editor.getText()).toBe("- [x] A\n- [ ] B\n- [x] C\n- [x] D");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2dnbGUtbWFya2Rvd24tdGFzay9zcGVjL3RvZ2dsZS1tYXJrZG93bi10YXNrLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsUUFBQSwrREFBQTtBQUFBLElBQUEsT0FBMEMsRUFBMUMsRUFBQywyQkFBRCxFQUFvQixnQkFBcEIsRUFBNEIsb0JBQTVCLENBQUE7QUFBQSxJQUVBLGtCQUFBLEdBQXFCLFNBQUMsUUFBRCxHQUFBO0FBQ25CLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLFVBQXZCLEVBQW1DLDZCQUFuQyxDQUFBLENBQUE7QUFBQSxNQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsa0JBQUg7TUFBQSxDQUFoQixDQURBLENBQUE7YUFFQSxJQUFBLENBQUssUUFBTCxFQUhtQjtJQUFBLENBRnJCLENBQUE7QUFBQSxJQU9BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsRUFEYztNQUFBLENBQWhCLENBQUEsQ0FBQTthQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsUUFDQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBRGIsQ0FBQTtlQUVBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixzQkFBOUIsRUFIakI7TUFBQSxDQUFMLEVBSlM7SUFBQSxD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

//# sourceURL=/Users/igawataiichi/.atom/packages/toggle-markdown-task/spec/toggle-markdown-task-spec.coffee
