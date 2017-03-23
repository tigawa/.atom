Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _sbConfigFile = require('sb-config-file');

var _sbConfigFile2 = _interopRequireDefault(_sbConfigFile);

var _atom = require('atom');

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var _validate = require('./validate');

var Validate = _interopRequireWildcard(_validate);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/* eslint-disable import/no-duplicates */

let LinterRegistry = class LinterRegistry {

  constructor() {
    this.config = null;
    this.emitter = new _atom.Emitter();
    this.linters = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter.lintOnChange', lintOnChange => {
      this.lintOnChange = lintOnChange;
    }));
    this.subscriptions.add(atom.config.observe('core.excludeVcsIgnoredPaths', ignoreVCS => {
      this.ignoreVCS = ignoreVCS;
    }));
    this.subscriptions.add(atom.config.observe('linter.ignoreGlob', ignoreGlob => {
      this.ignoreGlob = ignoreGlob;
    }));
    this.subscriptions.add(atom.config.observe('linter.lintPreviewTabs', lintPreviewTabs => {
      this.lintPreviewTabs = lintPreviewTabs;
    }));
    this.subscriptions.add(this.emitter);
  }
  hasLinter(linter) {
    return this.linters.has(linter);
  }
  addLinter(linter, legacy = false) {
    const version = legacy ? 1 : 2;
    if (!Validate.linter(linter, version)) {
      return;
    }
    linter[_helpers.$activated] = true;
    if (typeof linter[_helpers.$requestLatest] === 'undefined') {
      linter[_helpers.$requestLatest] = 0;
    }
    if (typeof linter[_helpers.$requestLastReceived] === 'undefined') {
      linter[_helpers.$requestLastReceived] = 0;
    }
    linter[_helpers.$version] = version;
    this.linters.add(linter);
  }
  getLinters() {
    return Array.from(this.linters);
  }
  deleteLinter(linter) {
    if (!this.linters.has(linter)) {
      return;
    }
    linter[_helpers.$activated] = false;
    this.linters.delete(linter);
  }
  getConfig() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!_this.config) {
        _this.config = yield (0, _helpers.getConfigFile)();
      }
      return _this.config;
    })();
  }
  lint({ onChange, editor }) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const filePath = editor.getPath();

      if (onChange && !_this2.lintOnChange || // Lint-on-change mismatch
      !filePath || // Not saved anywhere yet
      Helpers.isPathIgnored(editor.getPath(), _this2.ignoreGlob, _this2.ignoreVCS) || // Ignored by VCS or Glob
      !_this2.lintPreviewTabs && atom.workspace.getActivePane().getPendingItem() === editor // Ignore Preview tabs
      ) {
          return false;
        }

      const scopes = Helpers.getEditorCursorScopes(editor);
      const config = yield _this2.getConfig();
      const disabled = yield config.get('disabled');

      const promises = [];
      for (const linter of _this2.linters) {
        if (!Helpers.shouldTriggerLinter(linter, onChange, scopes)) {
          continue;
        }
        if (disabled.includes(linter.name)) {
          continue;
        }
        const number = ++linter[_helpers.$requestLatest];
        const statusBuffer = linter.scope === 'file' ? editor.getBuffer() : null;
        const statusFilePath = linter.scope === 'file' ? filePath : null;

        _this2.emitter.emit('did-begin-linting', { number, linter, filePath: statusFilePath });
        promises.push(new Promise(function (resolve) {
          // $FlowIgnore: Type too complex, duh
          resolve(linter.lint(editor));
        }).then(function (messages) {
          _this2.emitter.emit('did-finish-linting', { number, linter, filePath: statusFilePath });
          if (linter[_helpers.$requestLastReceived] >= number || !linter[_helpers.$activated] || statusBuffer && !statusBuffer.isAlive()) {
            return;
          }
          linter[_helpers.$requestLastReceived] = number;
          if (statusBuffer && !statusBuffer.isAlive()) {
            return;
          }

          if (messages === null) {
            // NOTE: Do NOT update the messages when providers return null
            return;
          }

          let validity = true;
          // NOTE: We are calling it when results are not an array to show a nice notification
          if (atom.inDevMode() || !Array.isArray(messages)) {
            validity = linter[_helpers.$version] === 2 ? Validate.messages(linter.name, messages) : Validate.messagesLegacy(linter.name, messages);
          }
          if (!validity) {
            return;
          }

          if (linter[_helpers.$version] === 2) {
            Helpers.normalizeMessages(linter.name, messages);
          } else {
            Helpers.normalizeMessagesLegacy(linter.name, messages);
          }
          _this2.emitter.emit('did-update-messages', { messages, linter, buffer: statusBuffer });
        }, function (error) {
          _this2.emitter.emit('did-finish-linting', { number, linter, filePath: statusFilePath });
          atom.notifications.addError(`[Linter] Error running ${linter.name}`, {
            detail: 'See console for more info'
          });
          console.error(`[Linter] Error running ${linter.name}`, error);
        }));
      }

      yield Promise.all(promises);
      return true;
    })();
  }
  onDidUpdateMessages(callback) {
    return this.emitter.on('did-update-messages', callback);
  }
  onDidBeginLinting(callback) {
    return this.emitter.on('did-begin-linting', callback);
  }
  onDidFinishLinting(callback) {
    return this.emitter.on('did-finish-linting', callback);
  }
  dispose() {
    this.linters.clear();
    this.subscriptions.dispose();
  }
};
exports.default = LinterRegistry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbnRlci1yZWdpc3RyeS5qcyJdLCJuYW1lcyI6WyJIZWxwZXJzIiwiVmFsaWRhdGUiLCJMaW50ZXJSZWdpc3RyeSIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwiZW1pdHRlciIsImxpbnRlcnMiLCJTZXQiLCJzdWJzY3JpcHRpb25zIiwiYWRkIiwiYXRvbSIsIm9ic2VydmUiLCJsaW50T25DaGFuZ2UiLCJpZ25vcmVWQ1MiLCJpZ25vcmVHbG9iIiwibGludFByZXZpZXdUYWJzIiwiaGFzTGludGVyIiwibGludGVyIiwiaGFzIiwiYWRkTGludGVyIiwibGVnYWN5IiwidmVyc2lvbiIsImdldExpbnRlcnMiLCJBcnJheSIsImZyb20iLCJkZWxldGVMaW50ZXIiLCJkZWxldGUiLCJnZXRDb25maWciLCJsaW50Iiwib25DaGFuZ2UiLCJlZGl0b3IiLCJmaWxlUGF0aCIsImdldFBhdGgiLCJpc1BhdGhJZ25vcmVkIiwid29ya3NwYWNlIiwiZ2V0QWN0aXZlUGFuZSIsImdldFBlbmRpbmdJdGVtIiwic2NvcGVzIiwiZ2V0RWRpdG9yQ3Vyc29yU2NvcGVzIiwiZGlzYWJsZWQiLCJnZXQiLCJwcm9taXNlcyIsInNob3VsZFRyaWdnZXJMaW50ZXIiLCJpbmNsdWRlcyIsIm5hbWUiLCJudW1iZXIiLCJzdGF0dXNCdWZmZXIiLCJzY29wZSIsImdldEJ1ZmZlciIsInN0YXR1c0ZpbGVQYXRoIiwiZW1pdCIsInB1c2giLCJQcm9taXNlIiwicmVzb2x2ZSIsInRoZW4iLCJtZXNzYWdlcyIsImlzQWxpdmUiLCJ2YWxpZGl0eSIsImluRGV2TW9kZSIsImlzQXJyYXkiLCJtZXNzYWdlc0xlZ2FjeSIsIm5vcm1hbGl6ZU1lc3NhZ2VzIiwibm9ybWFsaXplTWVzc2FnZXNMZWdhY3kiLCJidWZmZXIiLCJlcnJvciIsIm5vdGlmaWNhdGlvbnMiLCJhZGRFcnJvciIsImRldGFpbCIsImNvbnNvbGUiLCJhbGwiLCJvbkRpZFVwZGF0ZU1lc3NhZ2VzIiwiY2FsbGJhY2siLCJvbiIsIm9u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QUFmekUsYyIsImZpbGUiOiJsaW50ZXItcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLWR1cGxpY2F0ZXMgKi9cblxuaW1wb3J0IENvbmZpZ0ZpbGUgZnJvbSAnc2ItY29uZmlnLWZpbGUnXG5pbXBvcnQgeyBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCAqIGFzIEhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0ICogYXMgVmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZSdcbmltcG9ydCB7ICR2ZXJzaW9uLCAkYWN0aXZhdGVkLCAkcmVxdWVzdExhdGVzdCwgJHJlcXVlc3RMYXN0UmVjZWl2ZWQsIGdldENvbmZpZ0ZpbGUgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbnRlclJlZ2lzdHJ5IHtcbiAgY29uZmlnOiA/Q29uZmlnRmlsZTtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgbGludGVyczogU2V0PExpbnRlcj47XG4gIGxpbnRPbkNoYW5nZTogYm9vbGVhbjtcbiAgaWdub3JlVkNTOiBib29sZWFuO1xuICBpZ25vcmVHbG9iOiBzdHJpbmc7XG4gIGxpbnRQcmV2aWV3VGFiczogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IG51bGxcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5saW50ZXJzID0gbmV3IFNldCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIubGludE9uQ2hhbmdlJywgKGxpbnRPbkNoYW5nZSkgPT4ge1xuICAgICAgdGhpcy5saW50T25DaGFuZ2UgPSBsaW50T25DaGFuZ2VcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocycsIChpZ25vcmVWQ1MpID0+IHtcbiAgICAgIHRoaXMuaWdub3JlVkNTID0gaWdub3JlVkNTXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuaWdub3JlR2xvYicsIChpZ25vcmVHbG9iKSA9PiB7XG4gICAgICB0aGlzLmlnbm9yZUdsb2IgPSBpZ25vcmVHbG9iXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIubGludFByZXZpZXdUYWJzJywgKGxpbnRQcmV2aWV3VGFicykgPT4ge1xuICAgICAgdGhpcy5saW50UHJldmlld1RhYnMgPSBsaW50UHJldmlld1RhYnNcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICBoYXNMaW50ZXIobGludGVyOiBMaW50ZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5saW50ZXJzLmhhcyhsaW50ZXIpXG4gIH1cbiAgYWRkTGludGVyKGxpbnRlcjogTGludGVyLCBsZWdhY3k6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IHZlcnNpb24gPSBsZWdhY3kgPyAxIDogMlxuICAgIGlmICghVmFsaWRhdGUubGludGVyKGxpbnRlciwgdmVyc2lvbikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsaW50ZXJbJGFjdGl2YXRlZF0gPSB0cnVlXG4gICAgaWYgKHR5cGVvZiBsaW50ZXJbJHJlcXVlc3RMYXRlc3RdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgbGludGVyWyRyZXF1ZXN0TGF0ZXN0XSA9IDBcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsaW50ZXJbJHJlcXVlc3RMYXN0UmVjZWl2ZWRdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgbGludGVyWyRyZXF1ZXN0TGFzdFJlY2VpdmVkXSA9IDBcbiAgICB9XG4gICAgbGludGVyWyR2ZXJzaW9uXSA9IHZlcnNpb25cbiAgICB0aGlzLmxpbnRlcnMuYWRkKGxpbnRlcilcbiAgfVxuICBnZXRMaW50ZXJzKCk6IEFycmF5PExpbnRlcj4ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubGludGVycylcbiAgfVxuICBkZWxldGVMaW50ZXIobGludGVyOiBMaW50ZXIpIHtcbiAgICBpZiAoIXRoaXMubGludGVycy5oYXMobGludGVyKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxpbnRlclskYWN0aXZhdGVkXSA9IGZhbHNlXG4gICAgdGhpcy5saW50ZXJzLmRlbGV0ZShsaW50ZXIpXG4gIH1cbiAgYXN5bmMgZ2V0Q29uZmlnKCk6IFByb21pc2U8Q29uZmlnRmlsZT4ge1xuICAgIGlmICghdGhpcy5jb25maWcpIHtcbiAgICAgIHRoaXMuY29uZmlnID0gYXdhaXQgZ2V0Q29uZmlnRmlsZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbmZpZ1xuICB9XG4gIGFzeW5jIGxpbnQoeyBvbkNoYW5nZSwgZWRpdG9yIH0gOiB7IG9uQ2hhbmdlOiBib29sZWFuLCBlZGl0b3I6IFRleHRFZGl0b3IgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgaWYgKFxuICAgICAgKG9uQ2hhbmdlICYmICF0aGlzLmxpbnRPbkNoYW5nZSkgfHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGludC1vbi1jaGFuZ2UgbWlzbWF0Y2hcbiAgICAgICFmaWxlUGF0aCB8fCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBzYXZlZCBhbnl3aGVyZSB5ZXRcbiAgICAgIEhlbHBlcnMuaXNQYXRoSWdub3JlZChlZGl0b3IuZ2V0UGF0aCgpLCB0aGlzLmlnbm9yZUdsb2IsIHRoaXMuaWdub3JlVkNTKSB8fCAgICAgICAgICAgICAgIC8vIElnbm9yZWQgYnkgVkNTIG9yIEdsb2JcbiAgICAgICghdGhpcy5saW50UHJldmlld1RhYnMgJiYgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldFBlbmRpbmdJdGVtKCkgPT09IGVkaXRvcikgICAgIC8vIElnbm9yZSBQcmV2aWV3IHRhYnNcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHNjb3BlcyA9IEhlbHBlcnMuZ2V0RWRpdG9yQ3Vyc29yU2NvcGVzKGVkaXRvcilcbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCB0aGlzLmdldENvbmZpZygpXG4gICAgY29uc3QgZGlzYWJsZWQgPSBhd2FpdCBjb25maWcuZ2V0KCdkaXNhYmxlZCcpXG5cbiAgICBjb25zdCBwcm9taXNlcyA9IFtdXG4gICAgZm9yIChjb25zdCBsaW50ZXIgb2YgdGhpcy5saW50ZXJzKSB7XG4gICAgICBpZiAoIUhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcihsaW50ZXIsIG9uQ2hhbmdlLCBzY29wZXMpKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAoZGlzYWJsZWQuaW5jbHVkZXMobGludGVyLm5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBjb25zdCBudW1iZXIgPSArK2xpbnRlclskcmVxdWVzdExhdGVzdF1cbiAgICAgIGNvbnN0IHN0YXR1c0J1ZmZlciA9IGxpbnRlci5zY29wZSA9PT0gJ2ZpbGUnID8gZWRpdG9yLmdldEJ1ZmZlcigpIDogbnVsbFxuICAgICAgY29uc3Qgc3RhdHVzRmlsZVBhdGggPSBsaW50ZXIuc2NvcGUgPT09ICdmaWxlJyA/IGZpbGVQYXRoIDogbnVsbFxuXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWJlZ2luLWxpbnRpbmcnLCB7IG51bWJlciwgbGludGVyLCBmaWxlUGF0aDogc3RhdHVzRmlsZVBhdGggfSlcbiAgICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZTogVHlwZSB0b28gY29tcGxleCwgZHVoXG4gICAgICAgIHJlc29sdmUobGludGVyLmxpbnQoZWRpdG9yKSlcbiAgICAgIH0pLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLWxpbnRpbmcnLCB7IG51bWJlciwgbGludGVyLCBmaWxlUGF0aDogc3RhdHVzRmlsZVBhdGggfSlcbiAgICAgICAgaWYgKGxpbnRlclskcmVxdWVzdExhc3RSZWNlaXZlZF0gPj0gbnVtYmVyIHx8ICFsaW50ZXJbJGFjdGl2YXRlZF0gfHwgKHN0YXR1c0J1ZmZlciAmJiAhc3RhdHVzQnVmZmVyLmlzQWxpdmUoKSkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBsaW50ZXJbJHJlcXVlc3RMYXN0UmVjZWl2ZWRdID0gbnVtYmVyXG4gICAgICAgIGlmIChzdGF0dXNCdWZmZXIgJiYgIXN0YXR1c0J1ZmZlci5pc0FsaXZlKCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXNzYWdlcyA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIE5PVEU6IERvIE5PVCB1cGRhdGUgdGhlIG1lc3NhZ2VzIHdoZW4gcHJvdmlkZXJzIHJldHVybiBudWxsXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmFsaWRpdHkgPSB0cnVlXG4gICAgICAgIC8vIE5PVEU6IFdlIGFyZSBjYWxsaW5nIGl0IHdoZW4gcmVzdWx0cyBhcmUgbm90IGFuIGFycmF5IHRvIHNob3cgYSBuaWNlIG5vdGlmaWNhdGlvblxuICAgICAgICBpZiAoYXRvbS5pbkRldk1vZGUoKSB8fCAhQXJyYXkuaXNBcnJheShtZXNzYWdlcykpIHtcbiAgICAgICAgICB2YWxpZGl0eSA9IGxpbnRlclskdmVyc2lvbl0gPT09IDIgPyBWYWxpZGF0ZS5tZXNzYWdlcyhsaW50ZXIubmFtZSwgbWVzc2FnZXMpIDogVmFsaWRhdGUubWVzc2FnZXNMZWdhY3kobGludGVyLm5hbWUsIG1lc3NhZ2VzKVxuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRpdHkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaW50ZXJbJHZlcnNpb25dID09PSAyKSB7XG4gICAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcyhsaW50ZXIubmFtZSwgbWVzc2FnZXMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeShsaW50ZXIubmFtZSwgbWVzc2FnZXMpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUtbWVzc2FnZXMnLCB7IG1lc3NhZ2VzLCBsaW50ZXIsIGJ1ZmZlcjogc3RhdHVzQnVmZmVyIH0pXG4gICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1maW5pc2gtbGludGluZycsIHsgbnVtYmVyLCBsaW50ZXIsIGZpbGVQYXRoOiBzdGF0dXNGaWxlUGF0aCB9KVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFtMaW50ZXJdIEVycm9yIHJ1bm5pbmcgJHtsaW50ZXIubmFtZX1gLCB7XG4gICAgICAgICAgZGV0YWlsOiAnU2VlIGNvbnNvbGUgZm9yIG1vcmUgaW5mbycsXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFtMaW50ZXJdIEVycm9yIHJ1bm5pbmcgJHtsaW50ZXIubmFtZX1gLCBlcnJvcilcbiAgICAgIH0pKVxuICAgIH1cblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgb25EaWRVcGRhdGVNZXNzYWdlcyhjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlLW1lc3NhZ2VzJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRCZWdpbkxpbnRpbmcoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWJlZ2luLWxpbnRpbmcnLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZEZpbmlzaExpbnRpbmcoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWZpbmlzaC1saW50aW5nJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmxpbnRlcnMuY2xlYXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19