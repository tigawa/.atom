
/* global
atom
jasmine describe xdescribe beforeEach it runs waitsForPromise
 */

(function() {
  var NUM_ALPHA_TEST_WORDS, NUM_CAMEL_SPECIFIC_MATCHES, NUM_CAMEL_WORDS, NUM_COLLAPSIBLE_WORDS, NUM_ENGLISH_TEXT, NUM_TOTAL_WORDS, path;

  path = require('path');

  NUM_ALPHA_TEST_WORDS = 26 * 3;

  NUM_ENGLISH_TEXT = 8 - 2;

  NUM_COLLAPSIBLE_WORDS = 19;

  NUM_CAMEL_WORDS = 3;

  NUM_TOTAL_WORDS = NUM_ALPHA_TEST_WORDS + NUM_ENGLISH_TEXT + NUM_COLLAPSIBLE_WORDS + NUM_CAMEL_WORDS;

  NUM_CAMEL_SPECIFIC_MATCHES = 4 + 5 + 3;

  describe("Jumpy", function() {
    var jumpyPromise, textEditor, textEditorElement, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], textEditorElement = _ref[1], textEditor = _ref[2], jumpyPromise = _ref[3];
    beforeEach(function() {
      atom.project.setPaths([path.join(__dirname, 'fixtures')]);
      workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.style.height = "5000px";
      workspaceElement.style.width = "5000px";
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        atom.workspace.open('test_text.MD');
        return atom.workspace.open('test_text.MD');
      });
      runs(function() {
        textEditor = atom.workspace.getActiveTextEditor();
        textEditorElement = atom.views.getView(textEditor);
        jumpyPromise = atom.packages.activatePackage('jumpy');
        textEditor.setCursorBufferPosition([1, 1]);
        return atom.commands.dispatch(textEditorElement, 'jumpy:toggle');
      });
      return waitsForPromise(function() {
        return jumpyPromise;
      });
    });
    return xdescribe("when jumpy jumps to another pane", function() {
      it("focuses the new pane", function() {});
      return it("does not move cursor of original pane", function() {});
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qdW1weS9zcGVjL2p1bXB5LW11bHRpLXBhbmUtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOzs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLGlJQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSlAsQ0FBQTs7QUFBQSxFQU1BLG9CQUFBLEdBQXVCLEVBQUEsR0FBSyxDQU41QixDQUFBOztBQUFBLEVBT0EsZ0JBQUEsR0FBbUIsQ0FBQSxHQUFJLENBUHZCLENBQUE7O0FBQUEsRUFRQSxxQkFBQSxHQUF3QixFQVJ4QixDQUFBOztBQUFBLEVBU0EsZUFBQSxHQUFrQixDQVRsQixDQUFBOztBQUFBLEVBVUEsZUFBQSxHQUNJLG9CQUFBLEdBQ0EsZ0JBREEsR0FFQSxxQkFGQSxHQUdBLGVBZEosQ0FBQTs7QUFBQSxFQWdCQSwwQkFBQSxHQUE2QixDQUFBLEdBQUksQ0FBSixHQUFRLENBaEJyQyxDQUFBOztBQUFBLEVBa0JBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUEsR0FBQTtBQUNkLFFBQUEsbUVBQUE7QUFBQSxJQUFBLE9BQWtFLEVBQWxFLEVBQUMsMEJBQUQsRUFBbUIsMkJBQW5CLEVBQXNDLG9CQUF0QyxFQUFrRCxzQkFBbEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQXNCLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLFVBQXJCLENBQUQsQ0FBdEIsQ0FBQSxDQUFBO0FBQUEsTUFFQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBRm5CLENBQUE7QUFBQSxNQUtBLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUF2QixHQUFnQyxRQUxoQyxDQUFBO0FBQUEsTUFNQSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBdkIsR0FBK0IsUUFOL0IsQ0FBQTtBQUFBLE1BT0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLENBUEEsQ0FBQTtBQUFBLE1BVUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7QUFDWixRQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixjQUFwQixDQUFBLENBQUE7ZUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsY0FBcEIsRUFGWTtNQUFBLENBQWhCLENBVkEsQ0FBQTtBQUFBLE1BY0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNELFFBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFiLENBQUE7QUFBQSxRQUNBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixVQUFuQixDQURwQixDQUFBO0FBQUEsUUFFQSxZQUFBLEdBQWUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLE9BQTlCLENBRmYsQ0FBQTtBQUFBLFFBR0EsVUFBVSxDQUFDLHVCQUFYLENBQW1DLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBbkMsQ0FIQSxDQUFBO2VBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGlCQUF2QixFQUEwQyxjQUExQyxFQUxDO01BQUEsQ0FBTCxDQWRBLENBQUE7YUFzQkEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDWixhQURZO01BQUEsQ0FBaEIsRUF2Qk87SUFBQSxDQUFYLENBRkEsQ0FBQTtXQThCQSxTQUFBLENBQVUsa0NBQVYsRUFBOEMsU0FBQSxHQUFBO0FBQzFDLE1BQUEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQSxDQUEzQixDQUFBLENBQUE7YUFDQSxFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQSxHQUFBLENBQTVDLEVBRjBDO0lBQUEsQ0FBOUMsRUEvQmM7RUFBQSxDQUFsQixDQWxCQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/jumpy/spec/jumpy-multi-pane-spec.coffee
