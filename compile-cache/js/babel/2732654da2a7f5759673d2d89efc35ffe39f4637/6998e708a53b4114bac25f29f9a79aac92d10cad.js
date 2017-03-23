Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _sbEventKit = require('sb-event-kit');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// NOTE:
// We don't *need* to add the intentions:hide command
// But we're doing it anyway because it helps us keep the code clean
// And can also be used by any other package to fully control this package

// List of core commands we allow during the list, everything else closes it
const CORE_COMMANDS = new Set(['core:move-up', 'core:move-down', 'core:page-up', 'core:page-down', 'core:move-to-top', 'core:move-to-bottom']);

let Commands = class Commands {

  constructor() {
    this.active = null;
    this.emitter = new _sbEventKit.Emitter();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }
  activate() {
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'intentions:show': e => {
        if (this.active && this.active.type === 'list') {
          return;
        }
        this.processListShow();

        if (!e.originalEvent || e.originalEvent.type !== 'keydown') {
          return;
        }

        setImmediate(() => {
          let matched = true;
          const subscriptions = new _sbEventKit.CompositeDisposable();

          subscriptions.add(atom.keymaps.onDidMatchBinding(function ({ binding }) {
            matched = matched && CORE_COMMANDS.has(binding.command);
          }));
          subscriptions.add((0, _disposableEvent2.default)(document.body, 'keyup', () => {
            if (matched) {
              return;
            }
            subscriptions.dispose();
            this.subscriptions.remove(subscriptions);
            this.processListHide();
          }));
          this.subscriptions.add(subscriptions);
        });
      },
      'intentions:hide': () => {
        this.processListHide();
      },
      'intentions:highlight': e => {
        if (this.active && this.active.type === 'highlight') {
          return;
        }
        this.processHighlightsShow();

        if (!e.originalEvent || e.originalEvent.type !== 'keydown') {
          return;
        }
        const keyCode = e.originalEvent.keyCode;
        const subscriptions = (0, _disposableEvent2.default)(document.body, 'keyup', upE => {
          if (upE.keyCode !== keyCode) {
            return;
          }
          subscriptions.dispose();
          this.subscriptions.remove(subscriptions);
          this.processHighlightsHide();
        });
        this.subscriptions.add(subscriptions);
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor.intentions-list:not([mini])', {
      'intentions:confirm': (0, _helpers.stoppingEvent)(() => {
        this.processListConfirm();
      }),
      'core:move-up': (0, _helpers.stoppingEvent)(() => {
        this.processListMove('up');
      }),
      'core:move-down': (0, _helpers.stoppingEvent)(() => {
        this.processListMove('down');
      }),
      'core:page-up': (0, _helpers.stoppingEvent)(() => {
        this.processListMove('page-up');
      }),
      'core:page-down': (0, _helpers.stoppingEvent)(() => {
        this.processListMove('page-down');
      }),
      'core:move-to-top': (0, _helpers.stoppingEvent)(() => {
        this.processListMove('move-to-top');
      }),
      'core:move-to-bottom': (0, _helpers.stoppingEvent)(() => {
        this.processListMove('move-to-bottom');
      })
    }));
  }
  processListShow() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.active) {
        switch (_this.active.type) {
          case 'list':
            throw new Error('Already active');
          case 'highlight':
            _this.processHighlightsHide();
            break;
          default:
        }
      }
      const editor = atom.workspace.getActiveTextEditor();
      const editorElement = atom.views.getView(editor);
      const subscriptions = new _sbEventKit.CompositeDisposable();

      if (!(yield _this.shouldListShow(editor))) {
        return;
      }
      _this.active = { type: 'list', subscriptions };
      subscriptions.add(new _sbEventKit.Disposable(function () {
        if (_this.active && _this.active.type === 'list' && _this.active.subscriptions === subscriptions) {
          _this.processListHide();
          _this.active = null;
        }
        editorElement.classList.remove('intentions-list');
      }));
      subscriptions.add((0, _disposableEvent2.default)(document.body, 'mouseup', function () {
        subscriptions.dispose();
      }));
      editorElement.classList.add('intentions-list');
    })();
  }
  processListHide() {
    if (!this.active || this.active.type !== 'list') {
      return;
    }
    const subscriptions = this.active.subscriptions;
    this.active = null;
    subscriptions.dispose();
    this.emitter.emit('list-hide');
  }
  processListMove(movement) {
    if (!this.active || this.active.type !== 'list') {
      return;
    }
    this.emitter.emit('list-move', movement);
  }
  processListConfirm() {
    if (!this.active || this.active.type !== 'list') {
      return;
    }
    this.emitter.emit('list-confirm');
  }
  processHighlightsShow() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (_this2.active) {
        switch (_this2.active.type) {
          case 'highlight':
            throw new Error('Already active');
          case 'list':
            _this2.processListHide();
            break;
          default:
        }
      }
      const editor = atom.workspace.getActiveTextEditor();
      const editorElement = atom.views.getView(editor);
      const subscriptions = new _sbEventKit.CompositeDisposable();
      const shouldProcess = yield _this2.shouldHighlightsShow(editor);

      if (!shouldProcess) {
        return;
      }
      _this2.active = { type: 'highlight', subscriptions };
      subscriptions.add(new _sbEventKit.Disposable(function () {
        if (_this2.active && _this2.active.type === 'highlight' && _this2.active.subscriptions === subscriptions) {
          _this2.processHighlightsHide();
        }
        editorElement.classList.remove('intentions-highlights');
      }));
      editorElement.classList.add('intentions-highlights');
    })();
  }
  processHighlightsHide() {
    if (!this.active || this.active.type !== 'highlight') {
      return;
    }
    const subscriptions = this.active.subscriptions;
    this.active = null;
    subscriptions.dispose();
    this.emitter.emit('highlights-hide');
  }
  shouldListShow(editor) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const event = { show: false, editor };
      yield _this3.emitter.emit('list-show', event);
      return event.show;
    })();
  }
  shouldHighlightsShow(editor) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const event = { show: false, editor };
      yield _this4.emitter.emit('highlights-show', event);
      return event.show;
    })();
  }
  onListShow(callback) {
    return this.emitter.on('list-show', function (event) {
      return callback(event.editor).then(function (result) {
        event.show = !!result;
      });
    });
  }
  onListHide(callback) {
    return this.emitter.on('list-hide', callback);
  }
  onListMove(callback) {
    return this.emitter.on('list-move', callback);
  }
  onListConfirm(callback) {
    return this.emitter.on('list-confirm', callback);
  }
  onHighlightsShow(callback) {
    return this.emitter.on('highlights-show', function (event) {
      return callback(event.editor).then(function (result) {
        event.show = !!result;
      });
    });
  }
  onHighlightsHide(callback) {
    return this.emitter.on('highlights-hide', callback);
  }
  dispose() {
    this.subscriptions.dispose();
    if (this.active) {
      this.active.subscriptions.dispose();
    }
  }
};
exports.default = Commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1hbmRzLmpzIl0sIm5hbWVzIjpbIkNPUkVfQ09NTUFORFMiLCJTZXQiLCJDb21tYW5kcyIsImNvbnN0cnVjdG9yIiwiYWN0aXZlIiwiZW1pdHRlciIsInN1YnNjcmlwdGlvbnMiLCJhZGQiLCJhY3RpdmF0ZSIsImF0b20iLCJjb21tYW5kcyIsImUiLCJ0eXBlIiwicHJvY2Vzc0xpc3RTaG93Iiwib3JpZ2luYWxFdmVudCIsInNldEltbWVkaWF0ZSIsIm1hdGNoZWQiLCJrZXltYXBzIiwib25EaWRNYXRjaEJpbmRpbmciLCJiaW5kaW5nIiwiaGFzIiwiY29tbWFuZCIsImRvY3VtZW50IiwiYm9keSIsImRpc3Bvc2UiLCJyZW1vdmUiLCJwcm9jZXNzTGlzdEhpZGUiLCJwcm9jZXNzSGlnaGxpZ2h0c1Nob3ciLCJrZXlDb2RlIiwidXBFIiwicHJvY2Vzc0hpZ2hsaWdodHNIaWRlIiwicHJvY2Vzc0xpc3RDb25maXJtIiwicHJvY2Vzc0xpc3RNb3ZlIiwiRXJyb3IiLCJlZGl0b3IiLCJ3b3Jrc3BhY2UiLCJnZXRBY3RpdmVUZXh0RWRpdG9yIiwiZWRpdG9yRWxlbWVudCIsInZpZXdzIiwiZ2V0VmlldyIsInNob3VsZExpc3RTaG93IiwiY2xhc3NMaXN0IiwiZW1pdCIsIm1vdmVtZW50Iiwic2hvdWxkUHJvY2VzcyIsInNob3VsZEhpZ2hsaWdodHNTaG93IiwiZXZlbnQiLCJzaG93Iiwib25MaXN0U2hvdyIsImNhbGxiYWNrIiwib24iLCJ0aGVuIiwicmVzdWx0Iiwib25MaXN0SGlkZSIsIm9uTGlzdE1vdmUiLCJvbkxpc3RDb25maXJtIiwib25IaWdobGlnaHRzU2hvdyIsIm9uSGlnaGxpZ2h0c0hpZGUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7Ozs7QUFDQTs7QUFHQTs7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFNQSxnQkFBZ0IsSUFBSUMsR0FBSixDQUFRLENBQUMsY0FBRCxFQUFpQixnQkFBakIsRUFBbUMsY0FBbkMsRUFB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O0FBQ0Q7QUFDRE0sZ0JBQWNOLFFBQWQsRUFBcUM7QUFDbkMsV0FBTyxLQUFLNUMsT0FBTCxDQUFhNkMsRUFBYixDQUFnQixjQUFoQixFQUFnQ0QsUUFBaEMsQ0FBUDtBQUNEO0FBQ0RPLG1CQUFpQlAsUUFBakIsRUFBdUU7QUFDckUsV0FBTyxLQUFLNUMsT0FBTCxDQUFhNkMsRUFBYixDQUFnQixpQkFBaEIsRUFBbUMsVUFBU0osS0FBVCxFQUFnQjtBQUN4RCxhQUFPRyxTQUFTSCxNQUFNWixNQUFmLEVBQXVCaUIsSUFBdkIsQ0FBNEIsVUFBU0MsTUFBVCxFQUFpQjtBQUNsRE4sY0FBTUMsSUFBTixHQUFhLENBQUMsQ0FBQ0ssTUFBZjtBQUNELE9BRk0sQ0FBUDtBQUdELEtBSk0sQ0FBUDtBQUtEO0FBQ0RLLG1CQUFpQlIsUUFBakIsRUFBd0M7QUFDdEMsV0FBTyxLQUFLNUMsT0FBTCxDQUFhNkMsRUFBYixDQUFnQixpQkFBaEIsRUFBbUNELFFBQW5DLENBQVA7QUFDRDtBQUNEekIsWUFBVTtBQUNSLFNBQUtsQixhQUFMLENBQW1Ca0IsT0FBbkI7QUFDQSxRQUFJLEtBQUtwQixNQUFULEVBQWlCO0FBQ2YsV0FBS0EsTUFBTCxDQUFZRSxhQUFaLENBQTBCa0IsT0FBMUI7QUFDRDtBQUNGO0FBL04yQixDO2tCQUFUdEIsUSIsImZpbGUiOiJjb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBkaXNwb3NhYmxlRXZlbnQgZnJvbSAnZGlzcG9zYWJsZS1ldmVudCdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgeyBzdG9wcGluZ0V2ZW50IH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaXN0TW92ZW1lbnQgfSBmcm9tICcuL3R5cGVzJ1xuXG4vLyBOT1RFOlxuLy8gV2UgZG9uJ3QgKm5lZWQqIHRvIGFkZCB0aGUgaW50ZW50aW9uczpoaWRlIGNvbW1hbmRcbi8vIEJ1dCB3ZSdyZSBkb2luZyBpdCBhbnl3YXkgYmVjYXVzZSBpdCBoZWxwcyB1cyBrZWVwIHRoZSBjb2RlIGNsZWFuXG4vLyBBbmQgY2FuIGFsc28gYmUgdXNlZCBieSBhbnkgb3RoZXIgcGFja2FnZSB0byBmdWxseSBjb250cm9sIHRoaXMgcGFja2FnZVxuXG4vLyBMaXN0IG9mIGNvcmUgY29tbWFuZHMgd2UgYWxsb3cgZHVyaW5nIHRoZSBsaXN0LCBldmVyeXRoaW5nIGVsc2UgY2xvc2VzIGl0XG5jb25zdCBDT1JFX0NPTU1BTkRTID0gbmV3IFNldChbJ2NvcmU6bW92ZS11cCcsICdjb3JlOm1vdmUtZG93bicsICdjb3JlOnBhZ2UtdXAnLCAnY29yZTpwYWdlLWRvd24nLCAnY29yZTptb3ZlLXRvLXRvcCcsICdjb3JlOm1vdmUtdG8tYm90dG9tJ10pXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRzIHtcbiAgYWN0aXZlOiA/e1xuICAgIHR5cGU6ICdsaXN0JyB8ICdoaWdobGlnaHQnLFxuICAgIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIH07XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICB9XG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCB7XG4gICAgICAnaW50ZW50aW9uczpzaG93JzogKGUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlLnR5cGUgPT09ICdsaXN0Jykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvY2Vzc0xpc3RTaG93KClcblxuICAgICAgICBpZiAoIWUub3JpZ2luYWxFdmVudCB8fCBlLm9yaWdpbmFsRXZlbnQudHlwZSAhPT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgIGxldCBtYXRjaGVkID0gdHJ1ZVxuICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgICAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmtleW1hcHMub25EaWRNYXRjaEJpbmRpbmcoZnVuY3Rpb24oeyBiaW5kaW5nIH0pIHtcbiAgICAgICAgICAgIG1hdGNoZWQgPSBtYXRjaGVkICYmIENPUkVfQ09NTUFORFMuaGFzKGJpbmRpbmcuY29tbWFuZClcbiAgICAgICAgICB9KSlcbiAgICAgICAgICBzdWJzY3JpcHRpb25zLmFkZChkaXNwb3NhYmxlRXZlbnQoZG9jdW1lbnQuYm9keSwgJ2tleXVwJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG1hdGNoZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZShzdWJzY3JpcHRpb25zKVxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzTGlzdEhpZGUoKVxuICAgICAgICAgIH0pKVxuICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9ucylcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICAnaW50ZW50aW9uczpoaWRlJzogKCkgPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICB9LFxuICAgICAgJ2ludGVudGlvbnM6aGlnaGxpZ2h0JzogKGUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlLnR5cGUgPT09ICdoaWdobGlnaHQnKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9jZXNzSGlnaGxpZ2h0c1Nob3coKVxuXG4gICAgICAgIGlmICghZS5vcmlnaW5hbEV2ZW50IHx8IGUub3JpZ2luYWxFdmVudC50eXBlICE9PSAna2V5ZG93bicpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXlDb2RlID0gZS5vcmlnaW5hbEV2ZW50LmtleUNvZGVcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IGRpc3Bvc2FibGVFdmVudChkb2N1bWVudC5ib2R5LCAna2V5dXAnLCB1cEUgPT4ge1xuICAgICAgICAgIGlmICh1cEUua2V5Q29kZSAhPT0ga2V5Q29kZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZShzdWJzY3JpcHRpb25zKVxuICAgICAgICAgIHRoaXMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb25zKVxuICAgICAgfSxcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yLmludGVudGlvbnMtbGlzdDpub3QoW21pbmldKScsIHtcbiAgICAgICdpbnRlbnRpb25zOmNvbmZpcm0nOiBzdG9wcGluZ0V2ZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGlzdENvbmZpcm0oKVxuICAgICAgfSksXG4gICAgICAnY29yZTptb3ZlLXVwJzogc3RvcHBpbmdFdmVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xpc3RNb3ZlKCd1cCcpXG4gICAgICB9KSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6IHN0b3BwaW5nRXZlbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NMaXN0TW92ZSgnZG93bicpXG4gICAgICB9KSxcbiAgICAgICdjb3JlOnBhZ2UtdXAnOiBzdG9wcGluZ0V2ZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGlzdE1vdmUoJ3BhZ2UtdXAnKVxuICAgICAgfSksXG4gICAgICAnY29yZTpwYWdlLWRvd24nOiBzdG9wcGluZ0V2ZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGlzdE1vdmUoJ3BhZ2UtZG93bicpXG4gICAgICB9KSxcbiAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogc3RvcHBpbmdFdmVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xpc3RNb3ZlKCdtb3ZlLXRvLXRvcCcpXG4gICAgICB9KSxcbiAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogc3RvcHBpbmdFdmVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xpc3RNb3ZlKCdtb3ZlLXRvLWJvdHRvbScpXG4gICAgICB9KSxcbiAgICB9KSlcbiAgfVxuICBhc3luYyBwcm9jZXNzTGlzdFNob3coKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMuYWN0aXZlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbGlzdCc6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbHJlYWR5IGFjdGl2ZScpXG4gICAgICAgIGNhc2UgJ2hpZ2hsaWdodCc6XG4gICAgICAgICAgdGhpcy5wcm9jZXNzSGlnaGxpZ2h0c0hpZGUoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuc2hvdWxkTGlzdFNob3coZWRpdG9yKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuYWN0aXZlID0geyB0eXBlOiAnbGlzdCcsIHN1YnNjcmlwdGlvbnMgfVxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZS50eXBlID09PSAnbGlzdCcgJiYgdGhpcy5hY3RpdmUuc3Vic2NyaXB0aW9ucyA9PT0gc3Vic2NyaXB0aW9ucykge1xuICAgICAgICB0aGlzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbFxuICAgICAgfVxuICAgICAgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbnRlbnRpb25zLWxpc3QnKVxuICAgIH0pKVxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpc3Bvc2FibGVFdmVudChkb2N1bWVudC5ib2R5LCAnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9KSlcbiAgICBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ludGVudGlvbnMtbGlzdCcpXG4gIH1cbiAgcHJvY2Vzc0xpc3RIaWRlKCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUgfHwgdGhpcy5hY3RpdmUudHlwZSAhPT0gJ2xpc3QnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuYWN0aXZlLnN1YnNjcmlwdGlvbnNcbiAgICB0aGlzLmFjdGl2ZSA9IG51bGxcbiAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdsaXN0LWhpZGUnKVxuICB9XG4gIHByb2Nlc3NMaXN0TW92ZShtb3ZlbWVudDogTGlzdE1vdmVtZW50KSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSB8fCB0aGlzLmFjdGl2ZS50eXBlICE9PSAnbGlzdCcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnbGlzdC1tb3ZlJywgbW92ZW1lbnQpXG4gIH1cbiAgcHJvY2Vzc0xpc3RDb25maXJtKCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUgfHwgdGhpcy5hY3RpdmUudHlwZSAhPT0gJ2xpc3QnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2xpc3QtY29uZmlybScpXG4gIH1cbiAgYXN5bmMgcHJvY2Vzc0hpZ2hsaWdodHNTaG93KCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgc3dpdGNoICh0aGlzLmFjdGl2ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2hpZ2hsaWdodCc6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbHJlYWR5IGFjdGl2ZScpXG4gICAgICAgIGNhc2UgJ2xpc3QnOlxuICAgICAgICAgIHRoaXMucHJvY2Vzc0xpc3RIaWRlKClcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBjb25zdCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGNvbnN0IHNob3VsZFByb2Nlc3MgPSBhd2FpdCB0aGlzLnNob3VsZEhpZ2hsaWdodHNTaG93KGVkaXRvcilcblxuICAgIGlmICghc2hvdWxkUHJvY2Vzcykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuYWN0aXZlID0geyB0eXBlOiAnaGlnaGxpZ2h0Jywgc3Vic2NyaXB0aW9ucyB9XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlLnR5cGUgPT09ICdoaWdobGlnaHQnICYmIHRoaXMuYWN0aXZlLnN1YnNjcmlwdGlvbnMgPT09IHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzSGlnaGxpZ2h0c0hpZGUoKVxuICAgICAgfVxuICAgICAgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbnRlbnRpb25zLWhpZ2hsaWdodHMnKVxuICAgIH0pKVxuICAgIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaW50ZW50aW9ucy1oaWdobGlnaHRzJylcbiAgfVxuICBwcm9jZXNzSGlnaGxpZ2h0c0hpZGUoKSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSB8fCB0aGlzLmFjdGl2ZS50eXBlICE9PSAnaGlnaGxpZ2h0Jykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLmFjdGl2ZS5zdWJzY3JpcHRpb25zXG4gICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnaGlnaGxpZ2h0cy1oaWRlJylcbiAgfVxuICBhc3luYyBzaG91bGRMaXN0U2hvdyhlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBldmVudCA9IHsgc2hvdzogZmFsc2UsIGVkaXRvciB9XG4gICAgYXdhaXQgdGhpcy5lbWl0dGVyLmVtaXQoJ2xpc3Qtc2hvdycsIGV2ZW50KVxuICAgIHJldHVybiBldmVudC5zaG93XG4gIH1cbiAgYXN5bmMgc2hvdWxkSGlnaGxpZ2h0c1Nob3coZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZXZlbnQgPSB7IHNob3c6IGZhbHNlLCBlZGl0b3IgfVxuICAgIGF3YWl0IHRoaXMuZW1pdHRlci5lbWl0KCdoaWdobGlnaHRzLXNob3cnLCBldmVudClcbiAgICByZXR1cm4gZXZlbnQuc2hvd1xuICB9XG4gIG9uTGlzdFNob3coY2FsbGJhY2s6ICgoZWRpdG9yOiBUZXh0RWRpdG9yKSA9PiBQcm9taXNlPGJvb2xlYW4+KSkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2xpc3Qtc2hvdycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXZlbnQuZWRpdG9yKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBldmVudC5zaG93ID0gISFyZXN1bHRcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBvbkxpc3RIaWRlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2xpc3QtaGlkZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uTGlzdE1vdmUoY2FsbGJhY2s6ICgobW92ZW1lbnQ6IExpc3RNb3ZlbWVudCkgPT4gYW55KSkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2xpc3QtbW92ZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uTGlzdENvbmZpcm0oY2FsbGJhY2s6ICgoKSA9PiBhbnkpKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignbGlzdC1jb25maXJtJywgY2FsbGJhY2spXG4gIH1cbiAgb25IaWdobGlnaHRzU2hvdyhjYWxsYmFjazogKChlZGl0b3I6IFRleHRFZGl0b3IpID0+IFByb21pc2U8Ym9vbGVhbj4pKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignaGlnaGxpZ2h0cy1zaG93JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhldmVudC5lZGl0b3IpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGV2ZW50LnNob3cgPSAhIXJlc3VsdFxuICAgICAgfSlcbiAgICB9KVxuICB9XG4gIG9uSGlnaGxpZ2h0c0hpZGUoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignaGlnaGxpZ2h0cy1oaWRlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmFjdGl2ZS5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgfVxufVxuIl19