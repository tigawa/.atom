
/* global
atom
jasmine describe xdescribe beforeEach afterEach it runs expect waitsFor
waitsForPromise
 */

(function() {
  var $, NUM_ALPHA_TEST_WORDS, NUM_CAMEL_SPECIFIC_MATCHES, NUM_CAMEL_WORDS, NUM_COLLAPSIBLE_WORDS, NUM_ENGLISH_TEXT, NUM_TOTAL_WORDS, getDecorationsArrayFromAllEditors, hasCommand, path;

  path = require('path');

  $ = require('space-pen').$;

  NUM_ALPHA_TEST_WORDS = 26 * 3;

  NUM_ENGLISH_TEXT = 8 - 2;

  NUM_COLLAPSIBLE_WORDS = 19;

  NUM_CAMEL_WORDS = 3;

  NUM_TOTAL_WORDS = NUM_ALPHA_TEST_WORDS + NUM_ENGLISH_TEXT + NUM_COLLAPSIBLE_WORDS + NUM_CAMEL_WORDS;

  NUM_CAMEL_SPECIFIC_MATCHES = 4 + 5 + 3;

  getDecorationsArrayFromAllEditors = function() {
    var decorations;
    decorations = [];
    atom.workspace.observeTextEditors(function(editor) {
      var currentTextEditorElement;
      currentTextEditorElement = atom.views.getView(editor);
      if ($(currentTextEditorElement).is(':not(:visible)')) {
        return;
      }
      return decorations = decorations.concat(editor.getOverlayDecorations());
    });
    return decorations;
  };

  hasCommand = function(element, name) {
    var command, commands, found, _i, _len;
    commands = atom.commands.findCommands({
      target: element
    });
    for (_i = 0, _len = commands.length; _i < _len; _i++) {
      command = commands[_i];
      if (command.name === name) {
        found = true;
      }
    }
    return found;
  };

  describe("Jumpy", function() {
    var jumpyPromise, statusBarPromise, textEditor, textEditorElement, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], textEditorElement = _ref[1], textEditor = _ref[2], jumpyPromise = _ref[3], statusBarPromise = _ref[4];
    beforeEach(function() {
      atom.project.setPaths([path.join(__dirname, 'fixtures')]);
      workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.style.height = "5000px";
      workspaceElement.style.width = "5000px";
      jumpyPromise = atom.packages.activatePackage('jumpy');
      statusBarPromise = atom.packages.activatePackage('status-bar');
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.workspace.open('test_text.md');
      });
      runs(function() {
        textEditor = atom.workspace.getActiveTextEditor();
        textEditorElement = atom.views.getView(textEditor);
        textEditor.setCursorBufferPosition([1, 1]);
        return atom.commands.dispatch(textEditorElement, 'jumpy:toggle');
      });
      waitsForPromise(function() {
        return jumpyPromise;
      });
      return waitsForPromise(function() {
        return statusBarPromise;
      });
    });
    afterEach(function() {
      return atom.commands.dispatch(textEditorElement, 'jumpy:clear');
    });
    describe('activate', function() {
      return it('creates the commands', function() {
        expect(hasCommand(workspaceElement, 'jumpy:toggle')).toBeTruthy();
        expect(hasCommand(workspaceElement, 'jumpy:reset')).toBeTruthy();
        return expect(hasCommand(workspaceElement, 'jumpy:clear')).toBeTruthy();
      });
    });
    describe('deactivate', function() {
      beforeEach(function() {
        return atom.packages.deactivatePackage('jumpy');
      });
      return it('destroys the commands', function() {
        expect(hasCommand(workspaceElement, 'jumpy:toggle')).toBeFalsy();
        expect(hasCommand(workspaceElement, 'jumpy:reset')).toBeFalsy();
        return expect(hasCommand(workspaceElement, 'jumpy:clear')).toBeFalsy();
      });
    });
    describe("when the jumpy:toggle event is triggered", function() {
      it("draws correct labels", function() {
        var decorations;
        decorations = textEditor.getOverlayDecorations();
        expect(decorations.length).toBe(NUM_TOTAL_WORDS + NUM_CAMEL_SPECIFIC_MATCHES);
        expect(decorations[0].getProperties().item.textContent).toBe('aa');
        expect(decorations[1].getProperties().item.textContent).toBe('ab');
        expect(decorations[82].getProperties().item.textContent).toBe('de');
        return expect(decorations[83].getProperties().item.textContent).toBe('df');
      });
      it("clears beacon effect", function() {
        return expect(textEditorElement.querySelectorAll('cursors .cursor.beacon').length).toBe(0);
      });
      return it("only uses jumpy keymaps", function() {
        return expect(atom.keymaps.keyBindings.length).toBe((26 * 2) + 5 + 1);
      });
    });
    describe("when the jumpy:clear event is triggered", function() {
      return it("clears labels", function() {
        atom.commands.dispatch(workspaceElement, 'jumpy:clear');
        expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
        return expect(textEditor.getOverlayDecorations()).toHaveLength(0);
      });
    });
    describe("when the jumpy:toggle event is triggered and a click event is fired", function() {
      return it("jumpy is cleared", function() {
        textEditorElement.dispatchEvent(new Event('click'));
        return expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
      });
    });
    xdescribe("when the jumpy:toggle event is triggered and a scroll event is fired", function() {
      return it("jumpy is cleared", function() {
        expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
        expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
        expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
        return expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
      });
    });
    describe("when the jumpy:toggle event is triggered and hotkeys are entered", function() {
      return it("jumpy is cleared", function() {
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        atom.commands.dispatch(workspaceElement, 'jumpy:c');
        expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
        return expect(textEditor.getOverlayDecorations()).toHaveLength(0);
      });
    });
    describe("when the jumpy:toggle event is triggered and invalid hotkeys are entered", function() {
      return it("does nothing", function() {
        var cursorPosition;
        atom.commands.dispatch(workspaceElement, 'jumpy:z');
        atom.commands.dispatch(workspaceElement, 'jumpy:z');
        cursorPosition = textEditor.getCursorBufferPosition();
        expect(cursorPosition.row).toBe(1);
        return expect(cursorPosition.column).toBe(1);
      });
    });
    describe("when the jumpy:toggle event is triggered and hotkeys are entered", function() {
      it("jumps the cursor", function() {
        var cursorPosition;
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        atom.commands.dispatch(workspaceElement, 'jumpy:c');
        cursorPosition = textEditor.getCursorBufferPosition();
        expect(cursorPosition.row).toBe(0);
        expect(cursorPosition.column).toBe(6);
        return expect(textEditor.getSelectedText()).toBe('');
      });
      it("clears jumpy mode", function() {
        expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBeTruthy();
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        atom.commands.dispatch(workspaceElement, 'jumpy:c');
        return expect(textEditorElement.classList.contains('jumpy-jump-mode')).not.toBeTruthy();
      });
      return it("jumps the cursor in folded regions", function() {
        var cursorPosition;
        textEditor.setCursorBufferPosition([23, 20]);
        textEditor.foldCurrentRow();
        atom.commands.dispatch(workspaceElement, 'jumpy:toggle');
        atom.commands.dispatch(workspaceElement, 'jumpy:d');
        atom.commands.dispatch(workspaceElement, 'jumpy:i');
        cursorPosition = textEditor.getCursorScreenPosition();
        expect(cursorPosition.row).toBe(23);
        expect(cursorPosition.column).toBe(2);
        atom.commands.dispatch(workspaceElement, 'jumpy:toggle');
        atom.commands.dispatch(workspaceElement, 'jumpy:d');
        atom.commands.dispatch(workspaceElement, 'jumpy:h');
        cursorPosition = textEditor.getCursorScreenPosition();
        expect(cursorPosition.row).toBe(22);
        return expect(cursorPosition.column).toBe(0);
      });
    });
    describe("when the jumpy:toggle event is triggered and hotkeys are entered in succession", function() {
      return it("jumps the cursor twice", function() {
        var cursorPosition;
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        atom.commands.dispatch(workspaceElement, 'jumpy:c');
        atom.commands.dispatch(workspaceElement, 'jumpy:toggle');
        atom.commands.dispatch(workspaceElement, 'jumpy:b');
        atom.commands.dispatch(workspaceElement, 'jumpy:e');
        cursorPosition = textEditor.getCursorBufferPosition();
        expect(cursorPosition.row).toBe(6);
        return expect(cursorPosition.column).toBe(12);
      });
    });
    describe("when the jumpy:toggle event is triggered and hotkeys are entered", function() {
      it("the beacon animation class is added", function() {
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        atom.commands.dispatch(workspaceElement, 'jumpy:c');
        return expect(textEditorElement.shadowRoot.querySelectorAll('.beacon').length).toBe(1);
      });
      return it("the beacon animation class is removed", function() {
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        waitsFor(function() {
          return function() {
            return atom.commands.dispatch(workspaceElement, 'jumpy:c');
          };
        });
        return runs(function() {
          return expect(textEditorElement.shadowRoot.querySelectorAll('.beacon').length).toBe(0);
        });
      });
    });
    describe("when the jumpy:toggle event is triggered", function() {
      return it("updates the status bar", function() {
        return expect(document.querySelector('#status-bar-jumpy .status').innerHTML).toBe('Jump Mode!');
      });
    });
    describe("when the jumpy:clear event is triggered", function() {
      return it("clears the status bar", function() {
        atom.commands.dispatch(workspaceElement, 'jumpy:clear');
        return expect(document.querySelector('#status-bar-jumpy').innerHTML).toBe('');
      });
    });
    describe("when the jumpy:a event is triggered", function() {
      it("updates the status bar with a", function() {
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        return expect(document.querySelector('#status-bar-jumpy .status').innerHTML).toBe('a');
      });
      return it("removes all labels that don't begin with a", function() {
        var decorations, relevantDecorations;
        atom.commands.dispatch(workspaceElement, 'jumpy:a');
        decorations = textEditor.getOverlayDecorations();
        relevantDecorations = decorations.filter(function(d) {
          return !d.getProperties().item.classList.contains('irrelevant');
        });
        return expect(relevantDecorations).toHaveLength(26);
      });
    });
    describe("when the jumpy:reset event is triggered", function() {
      return it("clears first entered key and lets a new jump take place", function() {
        var cursorPosition;
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        atom.commands.dispatch(textEditorElement, 'jumpy:reset');
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        atom.commands.dispatch(textEditorElement, 'jumpy:e');
        cursorPosition = textEditor.getCursorBufferPosition();
        expect(cursorPosition.row).toBe(0);
        return expect(cursorPosition.column).toBe(12);
      });
    });
    describe("when the jumpy:reset event is triggered", function() {
      it("updates the status bar", function() {
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        atom.commands.dispatch(textEditorElement, 'jumpy:reset');
        return expect(document.querySelector('#status-bar-jumpy .status').innerHTML).toBe('Jump Mode!');
      });
      return it("resets all labels even those that don't begin with a", function() {
        var decorations, relevantDecorations;
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        atom.commands.dispatch(textEditorElement, 'jumpy:reset');
        decorations = textEditor.getOverlayDecorations();
        relevantDecorations = decorations.filter(function(d) {
          return !d.getProperties().item.classList.contains('irrelevant');
        });
        return expect(relevantDecorations).toHaveLength(NUM_TOTAL_WORDS + NUM_CAMEL_SPECIFIC_MATCHES);
      });
    });
    describe("when the a text selection has begun before a jumpy:toggle event is triggered", function() {
      return it("keeps the selection for subsequent jumps", function() {
        atom.commands.dispatch(textEditorElement, 'jumpy:clear');
        atom.commands.dispatch(textEditorElement, 'jumpy:toggle');
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        textEditor.selectRight();
        textEditor.selectRight();
        atom.commands.dispatch(textEditorElement, 'jumpy:toggle');
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        atom.commands.dispatch(textEditorElement, 'jumpy:e');
        return expect(textEditor.getSelections()[0].getText()).toBe('aa ab ac ad ');
      });
    });
    describe("when a character is entered that no label has a match for", function() {
      it("displays a status bar error message", function() {
        atom.commands.dispatch(textEditorElement, 'jumpy:z');
        expect(document.querySelector('#status-bar-jumpy').classList.contains('no-match')).toBeTruthy();
        return expect(document.querySelector('#status-bar-jumpy .status').innerHTML === 'No match!').toBeTruthy();
      });
      it("eventually clears the status bar error message", function() {
        atom.commands.dispatch(textEditorElement, 'jumpy:toggle');
        atom.commands.dispatch(textEditorElement, 'jumpy:z');
        atom.commands.dispatch(textEditorElement, 'jumpy:a');
        expect(document.querySelector('#status-bar-jumpy').classList.contains('no-match')).toBeFalsy();
        return expect(document.querySelector('#status-bar-jumpy .status').innerHTML === 'a').toBeTruthy();
      });
      it("does not jump", function() {
        var cursorPosition;
        atom.commands.dispatch(textEditorElement, 'jumpy:z');
        cursorPosition = textEditor.getCursorBufferPosition();
        expect(cursorPosition.row).toBe(1);
        return expect(cursorPosition.column).toBe(1);
      });
      return it("leaves the labels up", function() {
        var decorations, relevantDecorations;
        atom.commands.dispatch(textEditorElement, 'jumpy:z');
        decorations = textEditor.getOverlayDecorations();
        relevantDecorations = decorations.filter(function(d) {
          return !d.getProperties().item.classList.contains('irrelevant');
        });
        return expect(relevantDecorations.length > 0).toBeTruthy();
      });
    });
    describe("when toggle is called with a split tab", function() {
      return it("continues to label consecutively", function() {
        var decorations, expectedTotalNumberWith2Panes, pane;
        pane = atom.workspace.paneForItem(textEditor);
        pane.splitRight({
          copyActiveItem: true
        });
        atom.commands.dispatch(workspaceElement, 'jumpy:toggle');
        decorations = getDecorationsArrayFromAllEditors();
        expectedTotalNumberWith2Panes = (NUM_TOTAL_WORDS + NUM_CAMEL_SPECIFIC_MATCHES) * 2;
        expect(decorations).toHaveLength(expectedTotalNumberWith2Panes);
        expect(decorations[0].getProperties().item.textContent).toBe('aa');
        expect(decorations[1].getProperties().item.textContent).toBe('ab');
        expect(decorations[116].getProperties().item.textContent).toBe('em');
        expect(decorations[117].getProperties().item.textContent).toBe('en');
        expect(decorations[118].getProperties().item.textContent).toBe('eo');
        return expect(decorations[119].getProperties().item.textContent).toBe('ep');
      });
    });
    describe("when toggle is called with 2 tabs open in same pane", function() {
      return it("continues to label consecutively", function() {
        waitsForPromise(function() {
          return atom.workspace.open('test_text2.md', {
            activatePane: true
          });
        });
        return runs(function() {
          var currentTextEditor, currentTextEditorElement, decorations, expectedTotalNumberWith2TabsOpenInOnePane;
          currentTextEditor = atom.workspace.getActiveTextEditor();
          currentTextEditorElement = atom.views.getView(currentTextEditor);
          atom.commands.dispatch(currentTextEditorElement, 'jumpy:toggle');
          decorations = getDecorationsArrayFromAllEditors();
          expectedTotalNumberWith2TabsOpenInOnePane = NUM_TOTAL_WORDS + NUM_CAMEL_SPECIFIC_MATCHES + 3;
          return expect(decorations).toHaveLength(expectedTotalNumberWith2TabsOpenInOnePane);
        });
      });
    });
    describe("when a jump mode is enabled", function() {
      var activationPromise;
      activationPromise = [];
      beforeEach(function() {
        return activationPromise = atom.packages.activatePackage('find-and-replace');
      });
      return it("clears when a find-and-replace mini pane is opened", function() {
        atom.commands.dispatch(textEditorElement, 'find-and-replace:show');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
          expect(textEditor.getOverlayDecorations()).toHaveLength(0);
          return expect(workspaceElement.querySelectorAll('.find-and-replace')).toHaveLength(1);
        });
      });
    });
    return describe("when a jump mode is enabled", function() {
      var activationPromise;
      activationPromise = [];
      beforeEach(function() {
        return activationPromise = atom.packages.activatePackage('fuzzy-finder');
      });
      return it("clears when a fuzzy-finder mini pane is opened", function() {
        atom.commands.dispatch(textEditorElement, 'fuzzy-finder:toggle-file-finder');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          atom.commands.dispatch(textEditorElement, 'fuzzy-finder:toggle-file-finder');
          expect(textEditorElement.classList.contains('jumpy-jump-mode')).toBe(false);
          expect(textEditor.getOverlayDecorations()).toHaveLength(0);
          return expect(workspaceElement.querySelectorAll('.fuzzy-finder')).toHaveLength(1);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qdW1weS9zcGVjL2p1bXB5LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7OztHQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEsbUxBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUMsSUFBSyxPQUFBLENBQVEsV0FBUixFQUFMLENBTkQsQ0FBQTs7QUFBQSxFQVNBLG9CQUFBLEdBQXVCLEVBQUEsR0FBSyxDQVQ1QixDQUFBOztBQUFBLEVBVUEsZ0JBQUEsR0FBbUIsQ0FBQSxHQUFJLENBVnZCLENBQUE7O0FBQUEsRUFXQSxxQkFBQSxHQUF3QixFQVh4QixDQUFBOztBQUFBLEVBWUEsZUFBQSxHQUFrQixDQVpsQixDQUFBOztBQUFBLEVBYUEsZUFBQSxHQUNJLG9CQUFBLEdBQ0EsZ0JBREEsR0FFQSxxQkFGQSxHQUdBLGVBakJKLENBQUE7O0FBQUEsRUFtQkEsMEJBQUEsR0FBNkIsQ0FBQSxHQUFJLENBQUosR0FBUSxDQW5CckMsQ0FBQTs7QUFBQSxFQXFCQSxpQ0FBQSxHQUFvQyxTQUFBLEdBQUE7QUFDaEMsUUFBQSxXQUFBO0FBQUEsSUFBQSxXQUFBLEdBQWMsRUFBZCxDQUFBO0FBQUEsSUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRCxHQUFBO0FBQzlCLFVBQUEsd0JBQUE7QUFBQSxNQUFBLHdCQUFBLEdBQTJCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQUEzQixDQUFBO0FBQ0EsTUFBQSxJQUFVLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLEVBQTVCLENBQStCLGdCQUEvQixDQUFWO0FBQUEsY0FBQSxDQUFBO09BREE7YUFHQSxX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

//# sourceURL=/Users/igawataiichi/.atom/packages/jumpy/spec/jumpy-spec.coffee
