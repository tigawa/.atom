'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeStatusBar = consumeStatusBar;

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _atom = require('atom');

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _statusBarItem = require('./status-bar-item');

var _statusBarItem2 = _interopRequireDefault(_statusBarItem);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const LineEndingRegExp = /\r\n|\n|\r/g;

let disposables = null;
let modalPanel = null;
let lineEndingListView = null;

function activate() {
  disposables = new _atom.CompositeDisposable();

  disposables.add(atom.commands.add('atom-text-editor', {
    'line-ending-selector:show': event => {
      if (!modalPanel) {
        lineEndingListView = new _atomSelectList2.default({
          items: [{ name: 'LF', value: '\n' }, { name: 'CRLF', value: '\r\n' }],
          filterKeyForItem: lineEnding => lineEnding.name,
          didConfirmSelection: lineEnding => {
            setLineEnding(atom.workspace.getActivePaneItem(), lineEnding.value);
            modalPanel.hide();
          },
          didCancelSelection: () => {
            modalPanel.hide();
          },
          elementForItem: lineEnding => {
            const element = document.createElement('li');
            element.textContent = lineEnding.name;
            return element;
          }
        });
        modalPanel = atom.workspace.addModalPanel({ item: lineEndingListView });
        disposables.add(new _atom.Disposable(() => {
          lineEndingListView.destroy();
          modalPanel.destroy();
          modalPanel = null;
        }));
      }

      lineEndingListView.reset();
      modalPanel.show();
      lineEndingListView.focus();
    },

    'line-ending-selector:convert-to-LF': event => {
      const editorElement = event.target.closest('atom-text-editor');
      setLineEnding(editorElement.getModel(), '\n');
    },

    'line-ending-selector:convert-to-CRLF': event => {
      const editorElement = event.target.closest('atom-text-editor');
      setLineEnding(editorElement.getModel(), '\r\n');
    }
  }));
}

function deactivate() {
  disposables.dispose();
}

function consumeStatusBar(statusBar) {
  let statusBarItem = new _statusBarItem2.default();
  let currentBufferDisposable = null;

  function updateTile(buffer) {
    let lineEndings = getLineEndings(buffer);
    if (lineEndings.size === 0) {
      let defaultLineEnding = getDefaultLineEnding();
      buffer.setPreferredLineEnding(defaultLineEnding);
      lineEndings = new Set().add(defaultLineEnding);
    }
    statusBarItem.setLineEndings(lineEndings);
  }

  let debouncedUpdateTile = _underscorePlus2.default.debounce(updateTile, 0);

  disposables.add(atom.workspace.observeActivePaneItem(item => {
    if (currentBufferDisposable) currentBufferDisposable.dispose();

    if (item && item.getBuffer) {
      let buffer = item.getBuffer();
      updateTile(buffer);
      currentBufferDisposable = buffer.onDidChange(({ oldText, newText }) => {
        if (!statusBarItem.hasLineEnding('\n')) {
          if (newText.indexOf('\n') >= 0) {
            debouncedUpdateTile(buffer);
          }
        } else if (!statusBarItem.hasLineEnding('\r\n')) {
          if (newText.indexOf('\r\n') >= 0) {
            debouncedUpdateTile(buffer);
          }
        } else if (LineEndingRegExp.test(oldText)) {
          debouncedUpdateTile(buffer);
        }
      });
    } else {
      statusBarItem.setLineEndings(new Set());
      currentBufferDisposable = null;
    }
  }));

  disposables.add(new _atom.Disposable(() => {
    if (currentBufferDisposable) currentBufferDisposable.dispose();
  }));

  statusBarItem.onClick(() => {
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), 'line-ending-selector:show');
  });

  let tile = statusBar.addRightTile({ item: statusBarItem.element, priority: 200 });
  disposables.add(new _atom.Disposable(() => tile.destroy()));
}

function getDefaultLineEnding() {
  switch (atom.config.get('line-ending-selector.defaultLineEnding')) {
    case 'LF':
      return '\n';
    case 'CRLF':
      return '\r\n';
    case 'OS Default':
    default:
      return _helpers2.default.getProcessPlatform() === 'win32' ? '\r\n' : '\n';
  }
}

function getLineEndings(buffer) {
  let result = new Set();
  for (let i = 0; i < buffer.getLineCount() - 1; i++) {
    result.add(buffer.lineEndingForRow(i));
  }
  return result;
}

function setLineEnding(item, lineEnding) {
  if (item && item.getBuffer) {
    let buffer = item.getBuffer();
    buffer.setPreferredLineEnding(lineEnding);
    buffer.setText(buffer.getText().replace(LineEndingRegExp, lineEnding));
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiYWN0aXZhdGUiLCJkZWFjdGl2YXRlIiwiY29uc3VtZVN0YXR1c0JhciIsIkxpbmVFbmRpbmdSZWdFeHAiLCJkaXNwb3NhYmxlcyIsIm1vZGFsUGFuZWwiLCJsaW5lRW5kaW5nTGlzdFZpZXciLCJhZGQiLCJhdG9tIiwiY29tbWFuZHMiLCJldmVudCIsIml0ZW1zIiwibmFtZSIsInZhbHVlIiwiZmlsdGVyS2V5Rm9ySXRlbSIsImxpbmVFbmRpbmciLCJkaWRDb25maXJtU2VsZWN0aW9uIiwic2V0TGluZUVuZGluZyIsIndvcmtzcGFjZSIsImdldEFjdGl2ZVBhbmVJdGVtIiwiaGlkZSIsImRpZENhbmNlbFNlbGVjdGlvbiIsImVsZW1lbnRGb3JJdGVtIiwiZWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiYWRkTW9kYWxQYW5lbCIsIml0ZW0iLCJkZXN0cm95IiwicmVzZXQiLCJzaG93IiwiZm9jdXMiLCJlZGl0b3JFbGVtZW50IiwidGFyZ2V0IiwiY2xvc2VzdCIsImdldE1vZGVsIiwiZGlzcG9zZSIsInN0YXR1c0JhciIsInN0YXR1c0Jhckl0ZW0iLCJjdXJyZW50QnVmZmVyRGlzcG9zYWJsZSIsInVwZGF0ZVRpbGUiLCJidWZmZXIiLCJsaW5lRW5kaW5ncyIsImdldExpbmVFbmRpbmdzIiwic2l6ZSIsImRlZmF1bHRMaW5lRW5kaW5nIiwiZ2V0RGVmYXVsdExpbmVFbmRpbmciLCJzZXRQcmVmZXJyZWRMaW5lRW5kaW5nIiwiU2V0Iiwic2V0TGluZUVuZGluZ3MiLCJkZWJvdW5jZWRVcGRhdGVUaWxlIiwiZGVib3VuY2UiLCJvYnNlcnZlQWN0aXZlUGFuZUl0ZW0iLCJnZXRCdWZmZXIiLCJvbkRpZENoYW5nZSIsIm9sZFRleHQiLCJuZXdUZXh0IiwiaGFzTGluZUVuZGluZyIsImluZGV4T2YiLCJ0ZXN0Iiwib25DbGljayIsImRpc3BhdGNoIiwidmlld3MiLCJnZXRWaWV3IiwidGlsZSIsImFkZFJpZ2h0VGlsZSIsInByaW9yaXR5IiwiY29uZmlnIiwiZ2V0IiwiZ2V0UHJvY2Vzc1BsYXRmb3JtIiwicmVzdWx0IiwiaSIsImdldExpbmVDb3VudCIsImxpbmVFbmRpbmdGb3JSb3ciLCJzZXRUZXh0IiwiZ2V0VGV4dCIsInJlcGxhY2UiXSwibWFwcGluZ3MiOiJBQUFBOzs7OztRLEFBY2dCLFcsQUFBQTtRQStDQSxBLGFBQUEsQTtRLEFBSUEsbUIsQUFBQTs7QUEvRGhCOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLE1BQU0sbUJBQU4sQUFBeUI7O0FBRXpCLElBQUksY0FBSixBQUFrQjtBQUNsQixJQUFJLGFBQUosQUFBaUI7QUFDakIsSUFBSSxxQkFBSixBQUF5Qjs7QUFFbEIsU0FBQSxBQUFTLFdBQVksQUFDMUI7Z0JBQWMsVUFBZCxBQUVBOztjQUFBLEFBQVksU0FBSSxBQUFLLFNBQUwsQUFBYyxJQUFkLEFBQWtCO2lDQUNILEFBQUMsU0FBVSxBQUN0QztVQUFJLENBQUosQUFBSyxZQUFZLEFBQ2Y7O2lCQUNTLENBQUMsRUFBQyxNQUFELEFBQU8sTUFBTSxPQUFkLEFBQUMsQUFBb0IsUUFBTyxFQUFDLE1BQUQsQUFBTyxRQUFRLE9BRFosQUFDL0IsQUFBNEIsQUFBc0IsQUFDekQ7NEJBQWtCLEFBQUMsY0FBZSxXQUZJLEFBRU8sQUFDN0M7K0JBQXFCLEFBQUMsY0FBZSxBQUNuQzswQkFBYyxLQUFBLEFBQUssVUFBbkIsQUFBYyxBQUFlLHFCQUFxQixXQUFsRCxBQUE2RCxBQUM3RDt1QkFBQSxBQUFXLEFBQ1o7QUFOcUMsQUFPdEM7OEJBQW9CLE1BQU0sQUFDeEI7dUJBQUEsQUFBVyxBQUNaO0FBVHFDLEFBVXRDOzBCQUFnQixBQUFDLGNBQWUsQUFDOUI7a0JBQU0sVUFBVSxTQUFBLEFBQVMsY0FBekIsQUFBZ0IsQUFBdUIsQUFDdkM7b0JBQUEsQUFBUSxjQUFjLFdBQXRCLEFBQWlDLEFBQ2pDO21CQUFBLEFBQU8sQUFDUjtBQWRILEFBQXFCLEFB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ZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSAnYXRvbS1zZWxlY3QtbGlzdCdcbmltcG9ydCBTdGF0dXNCYXJJdGVtIGZyb20gJy4vc3RhdHVzLWJhci1pdGVtJ1xuaW1wb3J0IGhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJ1xuXG5jb25zdCBMaW5lRW5kaW5nUmVnRXhwID0gL1xcclxcbnxcXG58XFxyL2dcblxubGV0IGRpc3Bvc2FibGVzID0gbnVsbFxubGV0IG1vZGFsUGFuZWwgPSBudWxsXG5sZXQgbGluZUVuZGluZ0xpc3RWaWV3ID0gbnVsbFxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUgKCkge1xuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgJ2xpbmUtZW5kaW5nLXNlbGVjdG9yOnNob3cnOiAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghbW9kYWxQYW5lbCkge1xuICAgICAgICBsaW5lRW5kaW5nTGlzdFZpZXcgPSBuZXcgU2VsZWN0TGlzdFZpZXcoe1xuICAgICAgICAgIGl0ZW1zOiBbe25hbWU6ICdMRicsIHZhbHVlOiAnXFxuJ30sIHtuYW1lOiAnQ1JMRicsIHZhbHVlOiAnXFxyXFxuJ31dLFxuICAgICAgICAgIGZpbHRlcktleUZvckl0ZW06IChsaW5lRW5kaW5nKSA9PiBsaW5lRW5kaW5nLm5hbWUsXG4gICAgICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogKGxpbmVFbmRpbmcpID0+IHtcbiAgICAgICAgICAgIHNldExpbmVFbmRpbmcoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSwgbGluZUVuZGluZy52YWx1ZSlcbiAgICAgICAgICAgIG1vZGFsUGFuZWwuaGlkZSgpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkaWRDYW5jZWxTZWxlY3Rpb246ICgpID0+IHtcbiAgICAgICAgICAgIG1vZGFsUGFuZWwuaGlkZSgpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBlbGVtZW50Rm9ySXRlbTogKGxpbmVFbmRpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gbGluZUVuZGluZy5uYW1lXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgbW9kYWxQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe2l0ZW06IGxpbmVFbmRpbmdMaXN0Vmlld30pXG4gICAgICAgIGRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgICAgbGluZUVuZGluZ0xpc3RWaWV3LmRlc3Ryb3koKVxuICAgICAgICAgIG1vZGFsUGFuZWwuZGVzdHJveSgpXG4gICAgICAgICAgbW9kYWxQYW5lbCA9IG51bGxcbiAgICAgICAgfSkpXG4gICAgICB9XG5cbiAgICAgIGxpbmVFbmRpbmdMaXN0Vmlldy5yZXNldCgpXG4gICAgICBtb2RhbFBhbmVsLnNob3coKVxuICAgICAgbGluZUVuZGluZ0xpc3RWaWV3LmZvY3VzKClcbiAgICB9LFxuXG4gICAgJ2xpbmUtZW5kaW5nLXNlbGVjdG9yOmNvbnZlcnQtdG8tTEYnOiAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgICBzZXRMaW5lRW5kaW5nKGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKSwgJ1xcbicpXG4gICAgfSxcblxuICAgICdsaW5lLWVuZGluZy1zZWxlY3Rvcjpjb252ZXJ0LXRvLUNSTEYnOiAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgICBzZXRMaW5lRW5kaW5nKGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKSwgJ1xcclxcbicpXG4gICAgfVxuICB9KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUgKCkge1xuICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVTdGF0dXNCYXIgKHN0YXR1c0Jhcikge1xuICBsZXQgc3RhdHVzQmFySXRlbSA9IG5ldyBTdGF0dXNCYXJJdGVtKClcbiAgbGV0IGN1cnJlbnRCdWZmZXJEaXNwb3NhYmxlID0gbnVsbFxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVRpbGUgKGJ1ZmZlcikge1xuICAgIGxldCBsaW5lRW5kaW5ncyA9IGdldExpbmVFbmRpbmdzKGJ1ZmZlcilcbiAgICBpZiAobGluZUVuZGluZ3Muc2l6ZSA9PT0gMCkge1xuICAgICAgbGV0IGRlZmF1bHRMaW5lRW5kaW5nID0gZ2V0RGVmYXVsdExpbmVFbmRpbmcoKVxuICAgICAgYnVmZmVyLnNldFByZWZlcnJlZExpbmVFbmRpbmcoZGVmYXVsdExpbmVFbmRpbmcpXG4gICAgICBsaW5lRW5kaW5ncyA9IG5ldyBTZXQoKS5hZGQoZGVmYXVsdExpbmVFbmRpbmcpXG4gICAgfVxuICAgIHN0YXR1c0Jhckl0ZW0uc2V0TGluZUVuZGluZ3MobGluZUVuZGluZ3MpXG4gIH1cblxuICBsZXQgZGVib3VuY2VkVXBkYXRlVGlsZSA9IF8uZGVib3VuY2UodXBkYXRlVGlsZSwgMClcblxuICBkaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKChpdGVtKSA9PiB7XG4gICAgaWYgKGN1cnJlbnRCdWZmZXJEaXNwb3NhYmxlKSBjdXJyZW50QnVmZmVyRGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgIGlmIChpdGVtICYmIGl0ZW0uZ2V0QnVmZmVyKSB7XG4gICAgICBsZXQgYnVmZmVyID0gaXRlbS5nZXRCdWZmZXIoKVxuICAgICAgdXBkYXRlVGlsZShidWZmZXIpXG4gICAgICBjdXJyZW50QnVmZmVyRGlzcG9zYWJsZSA9IGJ1ZmZlci5vbkRpZENoYW5nZSgoe29sZFRleHQsIG5ld1RleHR9KSA9PiB7XG4gICAgICAgIGlmICghc3RhdHVzQmFySXRlbS5oYXNMaW5lRW5kaW5nKCdcXG4nKSkge1xuICAgICAgICAgIGlmIChuZXdUZXh0LmluZGV4T2YoJ1xcbicpID49IDApIHtcbiAgICAgICAgICAgIGRlYm91bmNlZFVwZGF0ZVRpbGUoYnVmZmVyKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghc3RhdHVzQmFySXRlbS5oYXNMaW5lRW5kaW5nKCdcXHJcXG4nKSkge1xuICAgICAgICAgIGlmIChuZXdUZXh0LmluZGV4T2YoJ1xcclxcbicpID49IDApIHtcbiAgICAgICAgICAgIGRlYm91bmNlZFVwZGF0ZVRpbGUoYnVmZmVyKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChMaW5lRW5kaW5nUmVnRXhwLnRlc3Qob2xkVGV4dCkpIHtcbiAgICAgICAgICBkZWJvdW5jZWRVcGRhdGVUaWxlKGJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdHVzQmFySXRlbS5zZXRMaW5lRW5kaW5ncyhuZXcgU2V0KCkpXG4gICAgICBjdXJyZW50QnVmZmVyRGlzcG9zYWJsZSA9IG51bGxcbiAgICB9XG4gIH0pKVxuXG4gIGRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgaWYgKGN1cnJlbnRCdWZmZXJEaXNwb3NhYmxlKSBjdXJyZW50QnVmZmVyRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgfSkpXG5cbiAgc3RhdHVzQmFySXRlbS5vbkNsaWNrKCgpID0+IHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkpLFxuICAgICAgJ2xpbmUtZW5kaW5nLXNlbGVjdG9yOnNob3cnXG4gICAgKVxuICB9KVxuXG4gIGxldCB0aWxlID0gc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7aXRlbTogc3RhdHVzQmFySXRlbS5lbGVtZW50LCBwcmlvcml0eTogMjAwfSlcbiAgZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRpbGUuZGVzdHJveSgpKSlcbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdExpbmVFbmRpbmcgKCkge1xuICBzd2l0Y2ggKGF0b20uY29uZmlnLmdldCgnbGluZS1lbmRpbmctc2VsZWN0b3IuZGVmYXVsdExpbmVFbmRpbmcnKSkge1xuICAgIGNhc2UgJ0xGJzpcbiAgICAgIHJldHVybiAnXFxuJ1xuICAgIGNhc2UgJ0NSTEYnOlxuICAgICAgcmV0dXJuICdcXHJcXG4nXG4gICAgY2FzZSAnT1MgRGVmYXVsdCc6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAoaGVscGVycy5nZXRQcm9jZXNzUGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykgPyAnXFxyXFxuJyA6ICdcXG4nXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGluZUVuZGluZ3MgKGJ1ZmZlcikge1xuICBsZXQgcmVzdWx0ID0gbmV3IFNldCgpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmZmVyLmdldExpbmVDb3VudCgpIC0gMTsgaSsrKSB7XG4gICAgcmVzdWx0LmFkZChidWZmZXIubGluZUVuZGluZ0ZvclJvdyhpKSlcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHNldExpbmVFbmRpbmcgKGl0ZW0sIGxpbmVFbmRpbmcpIHtcbiAgaWYgKGl0ZW0gJiYgaXRlbS5nZXRCdWZmZXIpIHtcbiAgICBsZXQgYnVmZmVyID0gaXRlbS5nZXRCdWZmZXIoKVxuICAgIGJ1ZmZlci5zZXRQcmVmZXJyZWRMaW5lRW5kaW5nKGxpbmVFbmRpbmcpXG4gICAgYnVmZmVyLnNldFRleHQoYnVmZmVyLmdldFRleHQoKS5yZXBsYWNlKExpbmVFbmRpbmdSZWdFeHAsIGxpbmVFbmRpbmcpKVxuICB9XG59XG4iXX0=