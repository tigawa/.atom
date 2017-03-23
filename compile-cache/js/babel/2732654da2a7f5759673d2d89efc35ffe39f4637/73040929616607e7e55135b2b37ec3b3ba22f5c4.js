var _lodash = require('lodash.uniq');

var _lodash2 = _interopRequireDefault(_lodash);

var _atom = require('atom');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _uiRegistry = require('./ui-registry');

var _uiRegistry2 = _interopRequireDefault(_uiRegistry);

var _toggleView = require('./toggle-view');

var _toggleView2 = _interopRequireDefault(_toggleView);

var _indieRegistry = require('./indie-registry');

var _indieRegistry2 = _interopRequireDefault(_indieRegistry);

var _linterRegistry = require('./linter-registry');

var _linterRegistry2 = _interopRequireDefault(_linterRegistry);

var _messageRegistry = require('./message-registry');

var _messageRegistry2 = _interopRequireDefault(_messageRegistry);

var _editorRegistry = require('./editor-registry');

var _editorRegistry2 = _interopRequireDefault(_editorRegistry);

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let Linter = class Linter {

  constructor() {
    var _this = this;

    this.commands = new _commands2.default();
    this.registryUI = new _uiRegistry2.default();
    this.registryIndie = new _indieRegistry2.default();
    this.registryEditors = new _editorRegistry2.default();
    this.registryLinters = new _linterRegistry2.default();
    this.registryMessages = new _messageRegistry2.default();

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.registryUI);
    this.subscriptions.add(this.registryIndie);
    this.subscriptions.add(this.registryMessages);
    this.subscriptions.add(this.registryEditors);
    this.subscriptions.add(this.registryLinters);

    this.commands.onShouldLint(() => {
      const editorLinter = this.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorLinter) {
        editorLinter.lint();
      }
    });
    this.commands.onShouldToggleActiveEditor(() => {
      const textEditor = atom.workspace.getActiveTextEditor();
      const editor = this.registryEditors.get(textEditor);
      if (editor) {
        editor.dispose();
      } else if (textEditor) {
        this.registryEditors.createFromTextEditor(textEditor);
      }
    });
    // NOTE: ESLint arrow-parens rule has a bug
    // eslint-disable-next-line arrow-parens
    this.commands.onShouldDebug(_asyncToGenerator(function* () {
      const linters = _this.registryLinters.getLinters();
      const configFile = yield Helpers.getConfigFile();
      const textEditor = atom.workspace.getActiveTextEditor();
      const textEditorScopes = Helpers.getEditorCursorScopes(textEditor);

      const allLinters = linters.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return `  - ${linter.name}`;
      }).join('\n');
      const matchingLinters = linters.filter(function (linter) {
        return Helpers.shouldTriggerLinter(linter, false, textEditorScopes);
      }).sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return `  - ${linter.name}`;
      }).join('\n');
      const humanizedScopes = textEditorScopes.map(function (scope) {
        return `  - ${scope}`;
      }).join('\n');
      const disabledLinters = (yield configFile.get('disabled')).map(function (linter) {
        return `  - ${linter}`;
      }).join('\n');

      atom.notifications.addInfo('Linter Debug Info', {
        detail: [`Platform: ${process.platform}`, `Atom Version: ${atom.getVersion()}`, `Linter Version: ${_package2.default.version}`, `All Linter Providers: \n${allLinters}`, `Matching Linter Providers: \n${matchingLinters}`, `Disabled Linter Providers; \n${disabledLinters}`, `Current File scopes: \n${humanizedScopes}`].join('\n'),
        dismissable: true
      });
    }));
    this.commands.onShouldToggleLinter(action => {
      const toggleView = new _toggleView2.default(action, (0, _lodash2.default)(this.registryLinters.getLinters().map(linter => linter.name)));
      toggleView.onDidDispose(() => {
        this.subscriptions.remove(toggleView);
      });
      toggleView.onDidDisable(name => {
        const linter = this.registryLinters.getLinters().find(entry => entry.name === name);
        if (linter) {
          this.registryMessages.deleteByLinter(linter);
        }
      });
      toggleView.show();
      this.subscriptions.add(toggleView);
    });
    this.registryIndie.observe(indieLinter => {
      indieLinter.onDidDestroy(() => {
        this.registryMessages.deleteByLinter(indieLinter);
      });
    });
    this.registryEditors.observe(editorLinter => {
      editorLinter.onShouldLint(onChange => {
        this.registryLinters.lint({ onChange, editor: editorLinter.getEditor() });
      });
      editorLinter.onDidDestroy(() => {
        this.registryMessages.deleteByBuffer(editorLinter.getEditor().getBuffer());
      });
    });
    this.registryIndie.onDidUpdate(({ linter, messages }) => {
      this.registryMessages.set({ linter, messages, buffer: null });
    });
    this.registryLinters.onDidUpdateMessages(({ linter, messages, buffer }) => {
      this.registryMessages.set({ linter, messages, buffer });
    });
    this.registryLinters.onDidBeginLinting(({ linter, filePath }) => {
      this.registryUI.didBeginLinting(linter, filePath);
    });
    this.registryLinters.onDidFinishLinting(({ linter, filePath }) => {
      this.registryUI.didFinishLinting(linter, filePath);
    });
    this.registryMessages.onDidUpdateMessages(difference => {
      this.registryUI.render(difference);
    });

    this.registryEditors.activate();

    setTimeout(() => {
      // NOTE: Atom triggers this on boot so wait a while
      if (!this.subscriptions.disposed) {
        this.subscriptions.add(atom.project.onDidChangePaths(() => {
          this.commands.lint();
        }));
      }
    }, 100);
  }
  dispose() {
    this.subscriptions.dispose();
  }

  // API methods for providing/consuming services
  addUI(ui) {
    this.registryUI.add(ui);

    const messages = this.registryMessages.messages;
    if (messages.length) {
      ui.render({ added: messages, messages, removed: [] });
    }
  }
  deleteUI(ui) {
    this.registryUI.delete(ui);
  }
  addLinter(linter, legacy = false) {
    this.registryLinters.addLinter(linter, legacy);
  }
  deleteLinter(linter) {
    this.registryLinters.deleteLinter(linter);
    this.registryMessages.deleteByLinter(linter);
  }
};


module.exports = Linter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiSGVscGVycyIsIkxpbnRlciIsImNvbnN0cnVjdG9yIiwiY29tbWFuZHMiLCJyZWdpc3RyeVVJIiwicmVnaXN0cnlJbmRpZSIsInJlZ2lzdHJ5RWRpdG9ycyIsInJlZ2lzdHJ5TGludGVycyIsInJlZ2lzdHJ5TWVzc2FnZXMiLCJzdWJzY3JpcHRpb25zIiwiYWRkIiwib25TaG91bGRMaW50IiwiZWRpdG9yTGludGVyIiwiZ2V0IiwiYXRvbSIsIndvcmtzcGFjZSIsImdldEFjdGl2ZVRleHRFZGl0b3IiLCJsaW50Iiwib25TaG91bGRUb2dnbGVBY3RpdmVFZGl0b3IiLCJ0ZXh0RWRpdG9yIiwiZWRpdG9yIiwiZGlzcG9zZSIsImNyZWF0ZUZyb21UZXh0RWRpdG9yIiwib25TaG91bGREZWJ1ZyIsImxpbnRlcnMiLCJnZXRMaW50ZXJzIiwiY29uZmlnRmlsZSIsImdldENvbmZpZ0ZpbGUiLCJ0ZXh0RWRpdG9yU2NvcGVzIiwiZ2V0RWRpdG9yQ3Vyc29yU2NvcGVzIiwiYWxsTGludGVycyIsInNvcnQiLCJhIiwiYiIsIm5hbWUiLCJsb2NhbGVDb21wYXJlIiwibWFwIiwibGludGVyIiwiam9pbiIsIm1hdGNoaW5nTGludGVycyIsImZpbHRlciIsInNob3VsZFRyaWdnZXJMaW50ZXIiLCJodW1hbml6ZWRTY29wZXMiLCJzY29wZSIsImRpc2FibGVkTGludGVycyIsIm5vdGlmaWNhdGlvbnMiLCJhZGRJbmZvIiwiZGV0YWlsIiwicHJvY2VzcyIsInBsYXRmb3JtIiwiZ2V0VmVyc2lvbiIsInZlcnNpb24iLCJkaXNtaXNzYWJsZSIsIm9uU2hvdWxkVG9nZ2xlTGludGVyIiwiYWN0aW9uIiwidG9nZ2xlVmlldyIsIm9uRGlkRGlzcG9zZSIsInJlbW92ZSIsIm9uRGlkRGlzYWJsZSIsImZpbmQiLCJlbnRyeSIsImRlbGV0ZUJ5TGludGVyIiwic2hvdyIsIm9ic2VydmUiLCJpbmRpZUxpbnRlciIsIm9uRGlkRGVzdHJveSIsIm9uQ2hhbmdlIiwiZ2V0RWRpdG9yIiwiZGVsZXRlQnlCdWZmZXIiLCJnZXRCdWZmZXIiLCJvbkRpZFVwZGF0ZSIsIm1lc3NhZ2VzIiwic2V0IiwiYnVmZmVyIiwib25EaWRVcGRhdGVNZXNzYWdlcyIsIm9uRGlkQmVnaW5MaW50aW5nIiwiZmlsZVBhdGgiLCJkaWRCZWdpbkxpbnRpbmciLCJvbkRpZEZpbmlzaExpbnRpbmciLCJkaWRGaW5pc2hMaW50aW5nIiwiZGlmZmVyZW5jZSIsInJlbmRlciIsImFjdGl2YXRlIiwic2V0VGltZW91dCIsImRpc3Bvc2VkIiwicHJvamVjdCIsIm9uRGlkQ2hhbmdlUGF0aHMiLCJhZGRVSSIsInVpIiwibGVuZ3RoIiwiYWRkZWQiLCJyZW1vdmVkIiwiZGVsZXRlVUkiLCJkZWxldGUiLCJhZGRMaW50ZXIiLCJsZWdhY3kiLCJkZWxldGVMaW50ZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFFQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsTzs7Ozs7Ozs7SUFHTkMsTSxHQUFOLE1BQU1BLE1BQU4sQ0FBYTs7QUFTWEMsZ0JBQWM7QUFBQTs7QUFDWixTQUFLQyxRQUFMLEdBQWdCLHdCQUFoQjtBQUNBLFNBQUtDLFVBQUwsR0FBa0IsMEJBQWxCO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQiw2QkFBckI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCLDhCQUF2QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUIsOEJBQXZCO0FBQ0EsU0FBS0MsZ0JBQUwsR0FBd0IsK0JBQXhCOztBQUVBLFNBQUtDLGFBQUwsR0FBcUIsK0JBQXJCOztBQUVBLFNBQUtBLGFBQUwsQ0FBbUJDLEdBQW5CLENBQXVCLEtBQUtQLFFBQTVCO0FBQ0EsU0FBS00sYUFBTCxDQUFtQkMsR0FBbkIsQ0FBdUIsS0FBS04sVUFBNUI7QUFDQSxTQUFLSyxhQUFMLENBQW1CQyxHQUFuQixDQUF1QixLQUFLTCxh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c0JxRCxjQUF0QixDQUFxQ3hCLE1BQXJDO0FBQ0Q7QUF0SlUsQzs7O0FBeUpiNEQsT0FBT0MsT0FBUCxHQUFpQmpHLE1BQWpCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgYXJyYXlVbmlxdWUgZnJvbSAnbG9kYXNoLnVuaXEnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4uL3BhY2thZ2UuanNvbidcbmltcG9ydCBDb21tYW5kcyBmcm9tICcuL2NvbW1hbmRzJ1xuaW1wb3J0IFVJUmVnaXN0cnkgZnJvbSAnLi91aS1yZWdpc3RyeSdcbmltcG9ydCBUb2dnbGVWaWV3IGZyb20gJy4vdG9nZ2xlLXZpZXcnXG5pbXBvcnQgSW5kaWVSZWdpc3RyeSBmcm9tICcuL2luZGllLXJlZ2lzdHJ5J1xuaW1wb3J0IExpbnRlclJlZ2lzdHJ5IGZyb20gJy4vbGludGVyLXJlZ2lzdHJ5J1xuaW1wb3J0IE1lc3NhZ2VSZWdpc3RyeSBmcm9tICcuL21lc3NhZ2UtcmVnaXN0cnknXG5pbXBvcnQgRWRpdG9yc1JlZ2lzdHJ5IGZyb20gJy4vZWRpdG9yLXJlZ2lzdHJ5J1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IFVJLCBMaW50ZXIgYXMgTGludGVyUHJvdmlkZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG5jbGFzcyBMaW50ZXIge1xuICBjb21tYW5kczogQ29tbWFuZHM7XG4gIHJlZ2lzdHJ5VUk6IFVJUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5SW5kaWU6IEluZGllUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5RWRpdG9yczogRWRpdG9yc1JlZ2lzdHJ5O1xuICByZWdpc3RyeUxpbnRlcnM6IExpbnRlclJlZ2lzdHJ5O1xuICByZWdpc3RyeU1lc3NhZ2VzOiBNZXNzYWdlUmVnaXN0cnk7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgdGhpcy5yZWdpc3RyeVVJID0gbmV3IFVJUmVnaXN0cnkoKVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZSA9IG5ldyBJbmRpZVJlZ2lzdHJ5KClcbiAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycyA9IG5ldyBFZGl0b3JzUmVnaXN0cnkoKVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzID0gbmV3IExpbnRlclJlZ2lzdHJ5KClcbiAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMgPSBuZXcgTWVzc2FnZVJlZ2lzdHJ5KClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5jb21tYW5kcylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlVSSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlJbmRpZSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlNZXNzYWdlcylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlFZGl0b3JzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeUxpbnRlcnMpXG5cbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkTGludCgoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3JMaW50ZXIgPSB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5nZXQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgKGVkaXRvckxpbnRlcikge1xuICAgICAgICBlZGl0b3JMaW50ZXIubGludCgpXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkVG9nZ2xlQWN0aXZlRWRpdG9yKCgpID0+IHtcbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IHRoaXMucmVnaXN0cnlFZGl0b3JzLmdldCh0ZXh0RWRpdG9yKVxuICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICBlZGl0b3IuZGlzcG9zZSgpXG4gICAgICB9IGVsc2UgaWYgKHRleHRFZGl0b3IpIHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMuY3JlYXRlRnJvbVRleHRFZGl0b3IodGV4dEVkaXRvcilcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vIE5PVEU6IEVTTGludCBhcnJvdy1wYXJlbnMgcnVsZSBoYXMgYSBidWdcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYXJyb3ctcGFyZW5zXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZERlYnVnKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbnRlcnMgPSB0aGlzLnJlZ2lzdHJ5TGludGVycy5nZXRMaW50ZXJzKClcbiAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBhd2FpdCBIZWxwZXJzLmdldENvbmZpZ0ZpbGUoKVxuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgY29uc3QgdGV4dEVkaXRvclNjb3BlcyA9IEhlbHBlcnMuZ2V0RWRpdG9yQ3Vyc29yU2NvcGVzKHRleHRFZGl0b3IpXG5cbiAgICAgIGNvbnN0IGFsbExpbnRlcnMgPSBsaW50ZXJzXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKVxuICAgICAgICAubWFwKGxpbnRlciA9PiBgICAtICR7bGludGVyLm5hbWV9YCkuam9pbignXFxuJylcbiAgICAgIGNvbnN0IG1hdGNoaW5nTGludGVycyA9IGxpbnRlcnNcbiAgICAgICAgLmZpbHRlcihsaW50ZXIgPT4gSGVscGVycy5zaG91bGRUcmlnZ2VyTGludGVyKGxpbnRlciwgZmFsc2UsIHRleHRFZGl0b3JTY29wZXMpKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSlcbiAgICAgICAgLm1hcChsaW50ZXIgPT4gYCAgLSAke2xpbnRlci5uYW1lfWApLmpvaW4oJ1xcbicpXG4gICAgICBjb25zdCBodW1hbml6ZWRTY29wZXMgPSB0ZXh0RWRpdG9yU2NvcGVzXG4gICAgICAgIC5tYXAoc2NvcGUgPT4gYCAgLSAke3Njb3BlfWApLmpvaW4oJ1xcbicpXG4gICAgICBjb25zdCBkaXNhYmxlZExpbnRlcnMgPSAoYXdhaXQgY29uZmlnRmlsZS5nZXQoJ2Rpc2FibGVkJykpXG4gICAgICAgIC5tYXAobGludGVyID0+IGAgIC0gJHtsaW50ZXJ9YCkuam9pbignXFxuJylcblxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0xpbnRlciBEZWJ1ZyBJbmZvJywge1xuICAgICAgICBkZXRhaWw6IFtcbiAgICAgICAgICBgUGxhdGZvcm06ICR7cHJvY2Vzcy5wbGF0Zm9ybX1gLFxuICAgICAgICAgIGBBdG9tIFZlcnNpb246ICR7YXRvbS5nZXRWZXJzaW9uKCl9YCxcbiAgICAgICAgICBgTGludGVyIFZlcnNpb246ICR7bWFuaWZlc3QudmVyc2lvbn1gLFxuICAgICAgICAgIGBBbGwgTGludGVyIFByb3ZpZGVyczogXFxuJHthbGxMaW50ZXJzfWAsXG4gICAgICAgICAgYE1hdGNoaW5nIExpbnRlciBQcm92aWRlcnM6IFxcbiR7bWF0Y2hpbmdMaW50ZXJzfWAsXG4gICAgICAgICAgYERpc2FibGVkIExpbnRlciBQcm92aWRlcnM7IFxcbiR7ZGlzYWJsZWRMaW50ZXJzfWAsXG4gICAgICAgICAgYEN1cnJlbnQgRmlsZSBzY29wZXM6IFxcbiR7aHVtYW5pemVkU2NvcGVzfWAsXG4gICAgICAgIF0uam9pbignXFxuJyksXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGRUb2dnbGVMaW50ZXIoKGFjdGlvbikgPT4ge1xuICAgICAgY29uc3QgdG9nZ2xlVmlldyA9IG5ldyBUb2dnbGVWaWV3KGFjdGlvbiwgYXJyYXlVbmlxdWUodGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0TGludGVycygpLm1hcChsaW50ZXIgPT4gbGludGVyLm5hbWUpKSlcbiAgICAgIHRvZ2dsZVZpZXcub25EaWREaXNwb3NlKCgpID0+IHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZSh0b2dnbGVWaWV3KVxuICAgICAgfSlcbiAgICAgIHRvZ2dsZVZpZXcub25EaWREaXNhYmxlKChuYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IHRoaXMucmVnaXN0cnlMaW50ZXJzLmdldExpbnRlcnMoKS5maW5kKGVudHJ5ID0+IGVudHJ5Lm5hbWUgPT09IG5hbWUpXG4gICAgICAgIGlmIChsaW50ZXIpIHtcbiAgICAgICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlMaW50ZXIobGludGVyKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdG9nZ2xlVmlldy5zaG93KClcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodG9nZ2xlVmlldylcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZS5vYnNlcnZlKChpbmRpZUxpbnRlcikgPT4ge1xuICAgICAgaW5kaWVMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGluZGllTGludGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzLm9ic2VydmUoKGVkaXRvckxpbnRlcikgPT4ge1xuICAgICAgZWRpdG9yTGludGVyLm9uU2hvdWxkTGludCgob25DaGFuZ2UpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMubGludCh7IG9uQ2hhbmdlLCBlZGl0b3I6IGVkaXRvckxpbnRlci5nZXRFZGl0b3IoKSB9KVxuICAgICAgfSlcbiAgICAgIGVkaXRvckxpbnRlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlCdWZmZXIoZWRpdG9yTGludGVyLmdldEVkaXRvcigpLmdldEJ1ZmZlcigpKVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZS5vbkRpZFVwZGF0ZSgoeyBsaW50ZXIsIG1lc3NhZ2VzIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5zZXQoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXI6IG51bGwgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkVXBkYXRlTWVzc2FnZXMoKHsgbGludGVyLCBtZXNzYWdlcywgYnVmZmVyIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5zZXQoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXIgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkQmVnaW5MaW50aW5nKCh7IGxpbnRlciwgZmlsZVBhdGggfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeVVJLmRpZEJlZ2luTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMub25EaWRGaW5pc2hMaW50aW5nKCh7IGxpbnRlciwgZmlsZVBhdGggfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeVVJLmRpZEZpbmlzaExpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5vbkRpZFVwZGF0ZU1lc3NhZ2VzKChkaWZmZXJlbmNlKSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUkucmVuZGVyKGRpZmZlcmVuY2UpXG4gICAgfSlcblxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzLmFjdGl2YXRlKClcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgLy8gTk9URTogQXRvbSB0cmlnZ2VycyB0aGlzIG9uIGJvb3Qgc28gd2FpdCBhIHdoaWxlXG4gICAgICBpZiAoIXRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlZCkge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmNvbW1hbmRzLmxpbnQoKVxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9LCAxMDApXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cblxuICAvLyBBUEkgbWV0aG9kcyBmb3IgcHJvdmlkaW5nL2NvbnN1bWluZyBzZXJ2aWNlc1xuICBhZGRVSSh1aTogVUkpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5VUkuYWRkKHVpKVxuXG4gICAgY29uc3QgbWVzc2FnZXMgPSB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMubWVzc2FnZXNcbiAgICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICB1aS5yZW5kZXIoeyBhZGRlZDogbWVzc2FnZXMsIG1lc3NhZ2VzLCByZW1vdmVkOiBbXSB9KVxuICAgIH1cbiAgfVxuICBkZWxldGVVSSh1aTogVUkpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5VUkuZGVsZXRlKHVpKVxuICB9XG4gIGFkZExpbnRlcihsaW50ZXI6IExpbnRlclByb3ZpZGVyLCBsZWdhY3k6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmFkZExpbnRlcihsaW50ZXIsIGxlZ2FjeSlcbiAgfVxuICBkZWxldGVMaW50ZXIobGludGVyOiBMaW50ZXJQcm92aWRlcikge1xuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmRlbGV0ZUxpbnRlcihsaW50ZXIpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGxpbnRlcilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExpbnRlclxuIl19