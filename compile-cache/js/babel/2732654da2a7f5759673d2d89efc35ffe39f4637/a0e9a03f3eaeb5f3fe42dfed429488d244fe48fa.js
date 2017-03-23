Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _sbEventKit = require('sb-event-kit');

var _helpers = require('./helpers');

let Commands = class Commands {

  constructor() {
    this.emitter = new _sbEventKit.Emitter();
    this.messages = [];
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:next': () => this.move(true, true),
      'linter-ui-default:previous': () => this.move(false, true),
      'linter-ui-default:next-error': () => this.move(true, true, 'error'),
      'linter-ui-default:previous-error': () => this.move(false, true, 'error'),
      'linter-ui-default:next-warning': () => this.move(true, true, 'warning'),
      'linter-ui-default:previous-warning': () => this.move(false, true, 'warning'),
      'linter-ui-default:next-info': () => this.move(true, true, 'info'),
      'linter-ui-default:previous-info': () => this.move(false, true, 'info'),

      'linter-ui-default:next-in-current-file': () => this.move(true, false),
      'linter-ui-default:previous-in-current-file': () => this.move(false, false),
      'linter-ui-default:next-error-in-current-file': () => this.move(true, false, 'error'),
      'linter-ui-default:previous-error-in-current-file': () => this.move(false, false, 'error'),
      'linter-ui-default:next-warning-in-current-file': () => this.move(true, false, 'warning'),
      'linter-ui-default:previous-warning-in-current-file': () => this.move(false, false, 'warning'),
      'linter-ui-default:next-info-in-current-file': () => this.move(true, false, 'info'),
      'linter-ui-default:previous-info-in-current-file': () => this.move(false, false, 'info'),

      'linter-ui-default:toggle-panel': () => this.togglePanel(),

      // NOTE: Add no-ops here so they are recognized by commands registry
      // Real commands are registered when tooltip is shown inside tooltip's delegate
      'linter-ui-default:expand-tooltip': function () {},
      'linter-ui-default:collapse-tooltip': function () {}
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'linter-ui-default:apply-all-solutions': () => this.applyAllSolutions()
    }));
    this.subscriptions.add(atom.commands.add('#linter-panel', {
      'core:copy': () => {
        const selection = document.getSelection();
        if (selection) {
          atom.clipboard.write(selection.toString());
        }
      }
    }));
  }
  togglePanel() {
    atom.config.set('linter-ui-default.showPanel', !atom.config.get('linter-ui-default.showPanel'));
  }
  // NOTE: Apply solutions from bottom to top, so they don't invalidate each other
  applyAllSolutions() {
    const textEditor = atom.workspace.getActiveTextEditor();
    const messages = (0, _helpers.sortMessages)([{ column: 'line', type: 'desc' }], (0, _helpers.filterMessages)(this.messages, textEditor.getPath()));
    messages.forEach(function (message) {
      if (message.version === 1 && message.fix) {
        (0, _helpers.applySolution)(textEditor, 1, message.fix);
      } else if (message.version === 2 && message.solutions && message.solutions.length) {
        (0, _helpers.applySolution)(textEditor, 2, (0, _helpers.sortSolutions)(message.solutions)[0]);
      }
    });
  }
  move(forward, globally, severity = null) {
    const currentEditor = atom.workspace.getActiveTextEditor();
    const currentFile = currentEditor && currentEditor.getPath() || NaN;
    // NOTE: ^ Setting default to NaN so it won't match empty file paths in messages
    const messages = (0, _helpers.sortMessages)([{ column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }], (0, _helpers.filterMessages)(this.messages, globally ? null : currentFile, severity));
    const expectedValue = forward ? -1 : 1;

    if (!currentEditor) {
      const message = forward ? messages[0] : messages[messages.length - 1];
      if (message) {
        (0, _helpers.visitMessage)(message);
      }
      return;
    }
    const currentPosition = currentEditor.getCursorBufferPosition();

    // NOTE: Iterate bottom to top to find the previous message
    // Because if we search top to bottom when sorted, first item will always
    // be the smallest
    if (!forward) {
      messages.reverse();
    }

    let found;
    let currentFileEncountered = false;
    for (let i = 0, length = messages.length; i < length; i++) {
      const message = messages[i];
      const messageFile = (0, _helpers.$file)(message);
      const messageRange = (0, _helpers.$range)(message);

      if (!currentFileEncountered && messageFile === currentFile) {
        currentFileEncountered = true;
      }
      if (messageFile && messageRange) {
        if (currentFileEncountered && messageFile !== currentFile) {
          found = message;
          break;
        } else if (messageFile === currentFile && currentPosition.compare(messageRange.start) === expectedValue) {
          found = message;
          break;
        }
      }
    }

    if (!found && messages.length) {
      // Reset back to first or last depending on direction
      found = messages[0];
    }

    if (found) {
      (0, _helpers.visitMessage)(found);
    }
  }
  update(messages) {
    this.messages = messages;
  }
  dispose() {
    this.subscriptions.dispose();
  }
};
exports.default = Commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1hbmRzLmpzIl0sIm5hbWVzIjpbIkNvbW1hbmRzIiwiY29uc3RydWN0b3IiLCJlbWl0dGVyIiwibWVzc2FnZXMiLCJzdWJzY3JpcHRpb25zIiwiYWRkIiwiYXRvbSIsImNvbW1hbmRzIiwibW92ZSIsInRvZ2dsZVBhbmVsIiwiYXBwbHlBbGxTb2x1dGlvbnMiLCJzZWxlY3Rpb24iLCJkb2N1bWVudCIsImdldFNlbGVjdGlvbiIsImNsaXBib2FyZCIsIndyaXRlIiwidG9TdHJpbmciLCJjb25maWciLCJzZXQiLCJnZXQiLCJ0ZXh0RWRpdG9yIiwid29ya3NwYWNlIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsImNvbHVtbiIsInR5cGUiLCJnZXRQYXRoIiwiZm9yRWFjaCIsIm1lc3NhZ2UiLCJ2ZXJzaW9uIiwiZml4Iiwic29sdXRpb25zIiwibGVuZ3RoIiwiZm9yd2FyZCIsImdsb2JhbGx5Iiwic2V2ZXJpdHkiLCJjdXJyZW50RWRpdG9yIiwiY3VycmVudEZpbGUiLCJOYU4iLCJleHBlY3RlZFZhbHVlIiwiY3VycmVudFBvc2l0aW9uIiwiZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24iLCJyZXZlcnNlIiwiZm91bmQiLCJjdXJyZW50RmlsZUVuY291bnRlcmVkIiwiaSIsIm1lc3NhZ2VGaWxlIiwibWVzc2FnZVJhbmdlIiwiY29tcGFyZSIsInN0YXJ0IiwidXBkYXRlIiwiZGlzcG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFFQTs7SUFHcUJBLFEsR0FBTixNQUFNQSxRQUFOLENBQWU7O0FBSzVCQyxnQkFBYztBQUNaLFNBQUtDLE9BQUwsR0FBZSx5QkFBZjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLHFDQUFyQjs7QUFFQSxTQUFLQSxhQUFMLENBQW1CQyxHQUFuQixDQUF1QixLQUFLSCxPQUE1QjtBQUNBLFNBQUtFLGFBQUwsQ0FBbUJDLEdBQW5CLENBQXVCQyxLQUFLQyxRQUFMLENBQWNGLEdBQWQs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QUtBLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0Q7QUFDRCtDLFlBQWdCO0FBQ2QsU0FBSzlDLGFBQUwsQ0FBbUI4QyxPQUFuQjtBQUNEO0FBMUgyQixDO2tCQUFUbEQsUSIsImZpbGUiOiJjb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdzYi1ldmVudC1raXQnXG5cbmltcG9ydCB7ICRmaWxlLCAkcmFuZ2UsIHZpc2l0TWVzc2FnZSwgc29ydE1lc3NhZ2VzLCBzb3J0U29sdXRpb25zLCBmaWx0ZXJNZXNzYWdlcywgYXBwbHlTb2x1dGlvbiB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRzIHtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0JzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWVycm9yJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUsICdlcnJvcicpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWVycm9yJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlLCAnZXJyb3InKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LXdhcm5pbmcnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgdHJ1ZSwgJ3dhcm5pbmcnKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy13YXJuaW5nJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlLCAnd2FybmluZycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtaW5mbyc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCB0cnVlLCAnaW5mbycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWluZm8nOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIHRydWUsICdpbmZvJyksXG5cbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCBmYWxzZSksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCBmYWxzZSksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC1lcnJvci1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UsICdlcnJvcicpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWVycm9yLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgZmFsc2UsICdlcnJvcicpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtd2FybmluZy1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UsICd3YXJuaW5nJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtd2FybmluZy1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIGZhbHNlLCAnd2FybmluZycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtaW5mby1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UsICdpbmZvJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtaW5mby1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIGZhbHNlLCAnaW5mbycpLFxuXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6dG9nZ2xlLXBhbmVsJzogKCkgPT4gdGhpcy50b2dnbGVQYW5lbCgpLFxuXG4gICAgICAvLyBOT1RFOiBBZGQgbm8tb3BzIGhlcmUgc28gdGhleSBhcmUgcmVjb2duaXplZCBieSBjb21tYW5kcyByZWdpc3RyeVxuICAgICAgLy8gUmVhbCBjb21tYW5kcyBhcmUgcmVnaXN0ZXJlZCB3aGVuIHRvb2x0aXAgaXMgc2hvd24gaW5zaWRlIHRvb2x0aXAncyBkZWxlZ2F0ZVxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmV4cGFuZC10b29sdGlwJzogZnVuY3Rpb24oKSB7IH0sXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6Y29sbGFwc2UtdG9vbHRpcCc6IGZ1bmN0aW9uKCkgeyB9LFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCB7XG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6YXBwbHktYWxsLXNvbHV0aW9ucyc6ICgpID0+IHRoaXMuYXBwbHlBbGxTb2x1dGlvbnMoKSxcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCcjbGludGVyLXBhbmVsJywge1xuICAgICAgJ2NvcmU6Y29weSc6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKClcbiAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGlvbi50b1N0cmluZygpKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pKVxuICB9XG4gIHRvZ2dsZVBhbmVsKCk6IHZvaWQge1xuICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1BhbmVsJywgIWF0b20uY29uZmlnLmdldCgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1BhbmVsJykpXG4gIH1cbiAgLy8gTk9URTogQXBwbHkgc29sdXRpb25zIGZyb20gYm90dG9tIHRvIHRvcCwgc28gdGhleSBkb24ndCBpbnZhbGlkYXRlIGVhY2ggb3RoZXJcbiAgYXBwbHlBbGxTb2x1dGlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gc29ydE1lc3NhZ2VzKFt7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnZGVzYycgfV0sIGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIHRleHRFZGl0b3IuZ2V0UGF0aCgpKSlcbiAgICBtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDEgJiYgbWVzc2FnZS5maXgpIHtcbiAgICAgICAgYXBwbHlTb2x1dGlvbih0ZXh0RWRpdG9yLCAxLCBtZXNzYWdlLmZpeClcbiAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAyICYmIG1lc3NhZ2Uuc29sdXRpb25zICYmIG1lc3NhZ2Uuc29sdXRpb25zLmxlbmd0aCkge1xuICAgICAgICBhcHBseVNvbHV0aW9uKHRleHRFZGl0b3IsIDIsIHNvcnRTb2x1dGlvbnMobWVzc2FnZS5zb2x1dGlvbnMpWzBdKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgbW92ZShmb3J3YXJkOiBib29sZWFuLCBnbG9iYWxseTogYm9vbGVhbiwgc2V2ZXJpdHk6ID9zdHJpbmcgPSBudWxsKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbnN0IGN1cnJlbnRGaWxlOiBhbnkgPSAoY3VycmVudEVkaXRvciAmJiBjdXJyZW50RWRpdG9yLmdldFBhdGgoKSkgfHwgTmFOXG4gICAgLy8gTk9URTogXiBTZXR0aW5nIGRlZmF1bHQgdG8gTmFOIHNvIGl0IHdvbid0IG1hdGNoIGVtcHR5IGZpbGUgcGF0aHMgaW4gbWVzc2FnZXNcbiAgICBjb25zdCBtZXNzYWdlcyA9IHNvcnRNZXNzYWdlcyhbeyBjb2x1bW46ICdmaWxlJywgdHlwZTogJ2FzYycgfSwgeyBjb2x1bW46ICdsaW5lJywgdHlwZTogJ2FzYycgfV0sIGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIGdsb2JhbGx5ID8gbnVsbCA6IGN1cnJlbnRGaWxlLCBzZXZlcml0eSkpXG4gICAgY29uc3QgZXhwZWN0ZWRWYWx1ZSA9IGZvcndhcmQgPyAtMSA6IDFcblxuICAgIGlmICghY3VycmVudEVkaXRvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGZvcndhcmQgPyBtZXNzYWdlc1swXSA6IG1lc3NhZ2VzW21lc3NhZ2VzLmxlbmd0aCAtIDFdXG4gICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICB2aXNpdE1lc3NhZ2UobWVzc2FnZSlcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSBjdXJyZW50RWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICAgIC8vIE5PVEU6IEl0ZXJhdGUgYm90dG9tIHRvIHRvcCB0byBmaW5kIHRoZSBwcmV2aW91cyBtZXNzYWdlXG4gICAgLy8gQmVjYXVzZSBpZiB3ZSBzZWFyY2ggdG9wIHRvIGJvdHRvbSB3aGVuIHNvcnRlZCwgZmlyc3QgaXRlbSB3aWxsIGFsd2F5c1xuICAgIC8vIGJlIHRoZSBzbWFsbGVzdFxuICAgIGlmICghZm9yd2FyZCkge1xuICAgICAgbWVzc2FnZXMucmV2ZXJzZSgpXG4gICAgfVxuXG4gICAgbGV0IGZvdW5kXG4gICAgbGV0IGN1cnJlbnRGaWxlRW5jb3VudGVyZWQgPSBmYWxzZVxuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldXG4gICAgICBjb25zdCBtZXNzYWdlRmlsZSA9ICRmaWxlKG1lc3NhZ2UpXG4gICAgICBjb25zdCBtZXNzYWdlUmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcblxuICAgICAgaWYgKCFjdXJyZW50RmlsZUVuY291bnRlcmVkICYmIG1lc3NhZ2VGaWxlID09PSBjdXJyZW50RmlsZSkge1xuICAgICAgICBjdXJyZW50RmlsZUVuY291bnRlcmVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG1lc3NhZ2VGaWxlICYmIG1lc3NhZ2VSYW5nZSkge1xuICAgICAgICBpZiAoY3VycmVudEZpbGVFbmNvdW50ZXJlZCAmJiBtZXNzYWdlRmlsZSAhPT0gY3VycmVudEZpbGUpIHtcbiAgICAgICAgICBmb3VuZCA9IG1lc3NhZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2VGaWxlID09PSBjdXJyZW50RmlsZSAmJiBjdXJyZW50UG9zaXRpb24uY29tcGFyZShtZXNzYWdlUmFuZ2Uuc3RhcnQpID09PSBleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgICAgZm91bmQgPSBtZXNzYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZm91bmQgJiYgbWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAvLyBSZXNldCBiYWNrIHRvIGZpcnN0IG9yIGxhc3QgZGVwZW5kaW5nIG9uIGRpcmVjdGlvblxuICAgICAgZm91bmQgPSBtZXNzYWdlc1swXVxuICAgIH1cblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgdmlzaXRNZXNzYWdlKGZvdW5kKVxuICAgIH1cbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+KSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gIH1cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==