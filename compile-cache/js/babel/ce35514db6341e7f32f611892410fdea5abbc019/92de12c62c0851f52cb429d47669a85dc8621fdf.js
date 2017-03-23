Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _unicodeHelpers = require('./unicode-helpers');

var _suggestionListElement = require('./suggestion-list-element');

var _suggestionListElement2 = _interopRequireDefault(_suggestionListElement);

'use babel';

var SuggestionList = (function () {
  function SuggestionList() {
    var _this = this;

    _classCallCheck(this, SuggestionList);

    this.wordPrefixRegex = null;
    this.cancel = this.cancel.bind(this);
    this.confirm = this.confirm.bind(this);
    this.confirmSelection = this.confirmSelection.bind(this);
    this.confirmSelectionIfNonDefault = this.confirmSelectionIfNonDefault.bind(this);
    this.show = this.show.bind(this);
    this.showAtBeginningOfPrefix = this.showAtBeginningOfPrefix.bind(this);
    this.showAtCursorPosition = this.showAtCursorPosition.bind(this);
    this.hide = this.hide.bind(this);
    this.destroyOverlay = this.destroyOverlay.bind(this);
    this.activeEditor = null;
    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor.autocomplete-active', {
      'autocomplete-plus:confirm': this.confirmSelection,
      'autocomplete-plus:confirmIfNonDefault': this.confirmSelectionIfNonDefault,
      'autocomplete-plus:cancel': this.cancel
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', function (enableExtendedUnicodeSupport) {
      if (enableExtendedUnicodeSupport) {
        _this.wordPrefixRegex = new RegExp('^[' + _unicodeHelpers.UnicodeLetters + '\\d_-]');
      } else {
        _this.wordPrefixRegex = /^[\w-]/;
      }
      return _this.wordPrefixRegex;
    }));
  }

  _createClass(SuggestionList, [{
    key: 'addBindings',
    value: function addBindings(editor) {
      var _this2 = this;

      if (this.bindings && this.bindings.dispose) {
        this.bindings.dispose();
      }
      this.bindings = new _atom.CompositeDisposable();

      var completionKey = atom.config.get('autocomplete-plus.confirmCompletion') || '';

      var keys = {};
      if (completionKey.indexOf('tab') > -1) {
        keys['tab'] = 'autocomplete-plus:confirm';
      }
      if (completionKey.indexOf('enter') > -1) {
        if (completionKey.indexOf('always') > -1) {
          keys['enter'] = 'autocomplete-plus:confirmIfNonDefault';
        } else {
          keys['enter'] = 'autocomplete-plus:confirm';
        }
      }

      this.bindings.add(atom.keymaps.add('atom-text-editor.autocomplete-active', { 'atom-text-editor.autocomplete-active': keys }));

      var useCoreMovementCommands = atom.config.get('autocomplete-plus.useCoreMovementCommands');
      var commandNamespace = useCoreMovementCommands ? 'core' : 'autocomplete-plus';

      var commands = {};
      commands[commandNamespace + ':move-up'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectPrevious();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':move-down'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectNext();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':page-up'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectPageUp();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':page-down'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectPageDown();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':move-to-top'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectTop();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':move-to-bottom'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectBottom();
          return event.stopImmediatePropagation();
        }
      };

      this.bindings.add(atom.commands.add(atom.views.getView(editor), commands));

      return this.bindings.add(atom.config.onDidChange('autocomplete-plus.useCoreMovementCommands', function () {
        return _this2.addBindings(editor);
      }));
    }

    /*
    Section: Event Triggers
    */

  }, {
    key: 'cancel',
    value: function cancel() {
      return this.emitter.emit('did-cancel');
    }
  }, {
    key: 'confirm',
    value: function confirm(match) {
      return this.emitter.emit('did-confirm', match);
    }
  }, {
    key: 'confirmSelection',
    value: function confirmSelection() {
      return this.emitter.emit('did-confirm-selection');
    }
  }, {
    key: 'confirmSelectionIfNonDefault',
    value: function confirmSelectionIfNonDefault(event) {
      return this.emitter.emit('did-confirm-selection-if-non-default', event);
    }
  }, {
    key: 'selectNext',
    value: function selectNext() {
      return this.emitter.emit('did-select-next');
    }
  }, {
    key: 'selectPrevious',
    value: function selectPrevious() {
      return this.emitter.emit('did-select-previous');
    }
  }, {
    key: 'selectPageUp',
    value: function selectPageUp() {
      return this.emitter.emit('did-select-page-up');
    }
  }, {
    key: 'selectPageDown',
    value: function selectPageDown() {
      return this.emitter.emit('did-select-page-down');
    }
  }, {
    key: 'selectTop',
    value: function selectTop() {
      return this.emitter.emit('did-select-top');
    }
  }, {
    key: 'selectBottom',
    value: function selectBottom() {
      return this.emitter.emit('did-select-bottom');
    }

    /*
    Section: Events
    */

  }, {
    key: 'onDidConfirmSelection',
    value: function onDidConfirmSelection(fn) {
      return this.emitter.on('did-confirm-selection', fn);
    }
  }, {
    key: 'onDidconfirmSelectionIfNonDefault',
    value: function onDidconfirmSelectionIfNonDefault(fn) {
      return this.emitter.on('did-confirm-selection-if-non-default', fn);
    }
  }, {
    key: 'onDidConfirm',
    value: function onDidConfirm(fn) {
      return this.emitter.on('did-confirm', fn);
    }
  }, {
    key: 'onDidSelectNext',
    value: function onDidSelectNext(fn) {
      return this.emitter.on('did-select-next', fn);
    }
  }, {
    key: 'onDidSelectPrevious',
    value: function onDidSelectPrevious(fn) {
      return this.emitter.on('did-select-previous', fn);
    }
  }, {
    key: 'onDidSelectPageUp',
    value: function onDidSelectPageUp(fn) {
      return this.emitter.on('did-select-page-up', fn);
    }
  }, {
    key: 'onDidSelectPageDown',
    value: function onDidSelectPageDown(fn) {
      return this.emitter.on('did-select-page-down', fn);
    }
  }, {
    key: 'onDidSelectTop',
    value: function onDidSelectTop(fn) {
      return this.emitter.on('did-select-top', fn);
    }
  }, {
    key: 'onDidSelectBottom',
    value: function onDidSelectBottom(fn) {
      return this.emitter.on('did-select-bottom', fn);
    }
  }, {
    key: 'onDidCancel',
    value: function onDidCancel(fn) {
      return this.emitter.on('did-cancel', fn);
    }
  }, {
    key: 'onDidDispose',
    value: function onDidDispose(fn) {
      return this.emitter.on('did-dispose', fn);
    }
  }, {
    key: 'onDidChangeItems',
    value: function onDidChangeItems(fn) {
      return this.emitter.on('did-change-items', fn);
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.activeEditor != null;
    }
  }, {
    key: 'show',
    value: function show(editor, options) {
      if (atom.config.get('autocomplete-plus.suggestionListFollows') === 'Cursor') {
        return this.showAtCursorPosition(editor, options);
      } else {
        var prefix = options.prefix;

        var followRawPrefix = false;
        for (var i = 0; i < this.items.length; i++) {
          var item = this.items[i];
          if (item.replacementPrefix != null) {
            prefix = item.replacementPrefix.trim();
            followRawPrefix = true;
            break;
          }
        }
        return this.showAtBeginningOfPrefix(editor, prefix, followRawPrefix);
      }
    }
  }, {
    key: 'showAtBeginningOfPrefix',
    value: function showAtBeginningOfPrefix(editor, prefix) {
      var _this3 = this;

      var followRawPrefix = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var bufferPosition = undefined;
      if (editor) {
        bufferPosition = editor.getCursorBufferPosition();
        if (followRawPrefix || this.wordPrefixRegex.test(prefix)) {
          bufferPosition = bufferPosition.translate([0, -prefix.length]);
        }
      }

      if (this.activeEditor === editor) {
        if (!bufferPosition.isEqual(this.displayBufferPosition)) {
          this.displayBufferPosition = bufferPosition;
          if (this.suggestionMarker) {
            this.suggestionMarker.setBufferRange([bufferPosition, bufferPosition]);
          }
        }
      } else {
        this.destroyOverlay();
        if (editor) {
          this.activeEditor = editor;
          this.displayBufferPosition = bufferPosition;
          var marker = this.suggestionMarker = editor.markBufferRange([bufferPosition, bufferPosition]);
          this.overlayDecoration = editor.decorateMarker(marker, { type: 'overlay', item: this.suggestionListElement, position: 'tail', 'class': 'autocomplete-plus' });
          var editorElement = atom.views.getView(this.activeEditor);
          if (editorElement && editorElement.classList) {
            editorElement.classList.add('autocomplete-active');
          }

          process.nextTick(function () {
            _this3.suggestionListElement.didAttach();
          });
          this.addBindings(editor);
        }
      }
    }
  }, {
    key: 'showAtCursorPosition',
    value: function showAtCursorPosition(editor) {
      var _this4 = this;

      this.destroyOverlay();

      if (this.activeEditor === editor || editor == null) {
        return;
      }
      var marker = undefined;
      if (editor.getLastCursor()) {
        marker = editor.getLastCursor().getMarker();
      }
      if (marker) {
        this.activeEditor = editor;
        var editorElement = atom.views.getView(this.activeEditor);
        if (editorElement && editorElement.classList) {
          editorElement.classList.add('autocomplete-active');
        }

        this.overlayDecoration = editor.decorateMarker(marker, { type: 'overlay', item: this.suggestionListElement, 'class': 'autocomplete-plus' });
        process.nextTick(function () {
          _this4.suggestionListElement.didAttach();
        });
        return this.addBindings(editor);
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.destroyOverlay();
      if (this.activeEditor === null) {
        return;
      }

      if (this.bindings && this.bindings.dispose) {
        this.bindings.dispose();
      }

      this.activeEditor = null;
      return this.activeEditor;
    }
  }, {
    key: 'destroyOverlay',
    value: function destroyOverlay() {
      if (this.suggestionMarker && this.suggestionMarker.destroy) {
        this.suggestionMarker.destroy();
      } else if (this.overlayDecoration && this.overlayDecoration.destroy) {
        this.overlayDecoration.destroy();
      }
      var editorElement = atom.views.getView(this.activeEditor);
      if (editorElement && editorElement.classList) {
        editorElement.classList.remove('autocomplete-active');
      }
      this.suggestionMarker = undefined;
      this.overlayDecoration = undefined;
      return this.overlayDecoration;
    }
  }, {
    key: 'changeItems',
    value: function changeItems(items) {
      this.items = items;
      return this.emitter.emit('did-change-items', this.items);
    }

    // Public: Clean up, stop listening to events
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }

      if (this.bindings && this.bindings.dispose) {
        this.bindings.dispose();
      }
      this.emitter.emit('did-dispose');
      return this.emitter.dispose();
    }
  }, {
    key: 'suggestionListElement',
    get: function get() {
      if (!this._suggestionListElement) {
        this._suggestionListElement = new _suggestionListElement2['default'](this);
      }

      return this._suggestionListElement;
    }
  }]);

  return SuggestionList;
})();

exports['default'] = SuggestionList;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3N1Z2dlc3Rpb24tbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUU2QyxNQUFNOzs4QkFDcEIsbUJBQW1COztxQ0FDaEIsMkJBQTJCOzs7O0FBSjdELFdBQVcsQ0FBQTs7SUFNVSxjQUFjO0FBQ3JCLFdBRE8sY0FBYyxHQUNsQjs7OzBCQURJLGNBQWM7O0FBRS9CLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFBO0FBQzNCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4RCxRQUFJLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoRixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLFFBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RFLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hFLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMs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T0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzlCOzs7U0E3U3lCLGVBQUc7QUFDM0IsVUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtBQUNoQyxZQUFJLENBQUMsc0JBQXNCLEdBQUcsdUNBQTBCLElBQUksQ0FBQyxDQUFBO09BQzlEOztBQUVELGFBQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFBO0tBQ25DOzs7U0FwQ2tCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3N1Z2dlc3Rpb24tbGlzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgVW5pY29kZUxldHRlcnMgfSBmcm9tICcuL3VuaWNvZGUtaGVscGVycydcbmltcG9ydCBTdWdnZXN0aW9uTGlzdEVsZW1lbnQgZnJvbSAnLi9zdWdnZXN0aW9uLWxpc3QtZWxlbWVudCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3VnZ2VzdGlvbkxpc3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy53b3JkUHJlZml4UmVnZXggPSBudWxsXG4gICAgdGhpcy5jYW5jZWwgPSB0aGlzLmNhbmNlbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5jb25maXJtID0gdGhpcy5jb25maXJtLmJpbmQodGhpcylcbiAgICB0aGlzLmNvbmZpcm1TZWxlY3Rpb24gPSB0aGlzLmNvbmZpcm1TZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgIHRoaXMuY29uZmlybVNlbGVjdGlvbklmTm9uRGVmYXVsdCA9IHRoaXMuY29uZmlybVNlbGVjdGlvbklmTm9uRGVmYXVsdC5iaW5kKHRoaXMpXG4gICAgdGhpcy5zaG93ID0gdGhpcy5zaG93LmJpbmQodGhpcylcbiAgICB0aGlzLnNob3dBdEJlZ2lubmluZ09mUHJlZml4ID0gdGhpcy5zaG93QXRCZWdpbm5pbmdPZlByZWZpeC5iaW5kKHRoaXMpXG4gICAgdGhpcy5zaG93QXRDdXJzb3JQb3NpdGlvbiA9IHRoaXMuc2hvd0F0Q3Vyc29yUG9zaXRpb24uYmluZCh0aGlzKVxuICAgIHRoaXMuaGlkZSA9IHRoaXMuaGlkZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5kZXN0cm95T3ZlcmxheSA9IHRoaXMuZGVzdHJveU92ZXJsYXkuYmluZCh0aGlzKVxuICAgIHRoaXMuYWN0aXZlRWRpdG9yID0gbnVsbFxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvci5hdXRvY29tcGxldGUtYWN0aXZlJywge1xuICAgICAgJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm0nOiB0aGlzLmNvbmZpcm1TZWxlY3Rpb24sXG4gICAgICAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybUlmTm9uRGVmYXVsdCc6IHRoaXMuY29uZmlybVNlbGVjdGlvbklmTm9uRGVmYXVsdCxcbiAgICAgICdhdXRvY29tcGxldGUtcGx1czpjYW5jZWwnOiB0aGlzLmNhbmNlbFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCcsIChlbmFibGVFeHRlbmRlZFVuaWNvZGVTdXBwb3J0KSA9PiB7XG4gICAgICBpZiAoZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCkge1xuICAgICAgICB0aGlzLndvcmRQcmVmaXhSZWdleCA9IG5ldyBSZWdFeHAoYF5bJHtVbmljb2RlTGV0dGVyc31cXFxcZF8tXWApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndvcmRQcmVmaXhSZWdleCA9IC9eW1xcdy1dL1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMud29yZFByZWZpeFJlZ2V4XG4gICAgfSkpXG4gIH1cblxuICBnZXQgc3VnZ2VzdGlvbkxpc3RFbGVtZW50ICgpIHtcbiAgICBpZiAoIXRoaXMuX3N1Z2dlc3Rpb25MaXN0RWxlbWVudCkge1xuICAgICAgdGhpcy5fc3VnZ2VzdGlvbkxpc3RFbGVtZW50ID0gbmV3IFN1Z2dlc3Rpb25MaXN0RWxlbWVudCh0aGlzKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zdWdnZXN0aW9uTGlzdEVsZW1lbnRcbiAgfVxuXG4gIGFkZEJpbmRpbmdzIChlZGl0b3IpIHtcbiAgICBpZiAodGhpcy5iaW5kaW5ncyAmJiB0aGlzLmJpbmRpbmdzLmRpc3Bvc2UpIHtcbiAgICAgIHRoaXMuYmluZGluZ3MuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuYmluZGluZ3MgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBjb25zdCBjb21wbGV0aW9uS2V5ID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5jb25maXJtQ29tcGxldGlvbicpIHx8ICcnXG5cbiAgICBjb25zdCBrZXlzID0ge31cbiAgICBpZiAoY29tcGxldGlvbktleS5pbmRleE9mKCd0YWInKSA+IC0xKSB7IGtleXNbJ3RhYiddID0gJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm0nIH1cbiAgICBpZiAoY29tcGxldGlvbktleS5pbmRleE9mKCdlbnRlcicpID4gLTEpIHtcbiAgICAgIGlmIChjb21wbGV0aW9uS2V5LmluZGV4T2YoJ2Fsd2F5cycpID4gLTEpIHtcbiAgICAgICAga2V5c1snZW50ZXInXSA9ICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtSWZOb25EZWZhdWx0J1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5c1snZW50ZXInXSA9ICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJ1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYmluZGluZ3MuYWRkKGF0b20ua2V5bWFwcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvci5hdXRvY29tcGxldGUtYWN0aXZlJyxcbiAgICAgIHsnYXRvbS10ZXh0LWVkaXRvci5hdXRvY29tcGxldGUtYWN0aXZlJzoga2V5c30pXG4gICAgKVxuXG4gICAgY29uc3QgdXNlQ29yZU1vdmVtZW50Q29tbWFuZHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnVzZUNvcmVNb3ZlbWVudENvbW1hbmRzJylcbiAgICBjb25zdCBjb21tYW5kTmFtZXNwYWNlID0gdXNlQ29yZU1vdmVtZW50Q29tbWFuZHMgPyAnY29yZScgOiAnYXV0b2NvbXBsZXRlLXBsdXMnXG5cbiAgICBjb25zdCBjb21tYW5kcyA9IHt9XG4gICAgY29tbWFuZHNbYCR7Y29tbWFuZE5hbWVzcGFjZX06bW92ZS11cGBdID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSgpICYmIHRoaXMuaXRlbXMgJiYgdGhpcy5pdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0UHJldmlvdXMoKVxuICAgICAgICByZXR1cm4gZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29tbWFuZHNbYCR7Y29tbWFuZE5hbWVzcGFjZX06bW92ZS1kb3duYF0gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkgJiYgdGhpcy5pdGVtcyAmJiB0aGlzLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5zZWxlY3ROZXh0KClcbiAgICAgICAgcmV0dXJuIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbW1hbmRzW2Ake2NvbW1hbmROYW1lc3BhY2V9OnBhZ2UtdXBgXSA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUoKSAmJiB0aGlzLml0ZW1zICYmIHRoaXMuaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnNlbGVjdFBhZ2VVcCgpXG4gICAgICAgIHJldHVybiBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgfVxuICAgIH1cbiAgICBjb21tYW5kc1tgJHtjb21tYW5kTmFtZXNwYWNlfTpwYWdlLWRvd25gXSA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUoKSAmJiB0aGlzLml0ZW1zICYmIHRoaXMuaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnNlbGVjdFBhZ2VEb3duKClcbiAgICAgICAgcmV0dXJuIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbW1hbmRzW2Ake2NvbW1hbmROYW1lc3BhY2V9Om1vdmUtdG8tdG9wYF0gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkgJiYgdGhpcy5pdGVtcyAmJiB0aGlzLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RUb3AoKVxuICAgICAgICByZXR1cm4gZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29tbWFuZHNbYCR7Y29tbWFuZE5hbWVzcGFjZX06bW92ZS10by1ib3R0b21gXSA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUoKSAmJiB0aGlzLml0ZW1zICYmIHRoaXMuaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnNlbGVjdEJvdHRvbSgpXG4gICAgICAgIHJldHVybiBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYmluZGluZ3MuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvciksIGNvbW1hbmRzKVxuICAgIClcblxuICAgIHJldHVybiB0aGlzLmJpbmRpbmdzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdXRvY29tcGxldGUtcGx1cy51c2VDb3JlTW92ZW1lbnRDb21tYW5kcycsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQmluZGluZ3MoZWRpdG9yKVxuICAgICAgfVxuICAgICAgKSlcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IEV2ZW50IFRyaWdnZXJzXG4gICovXG5cbiAgY2FuY2VsICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jYW5jZWwnKVxuICB9XG5cbiAgY29uZmlybSAobWF0Y2gpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jb25maXJtJywgbWF0Y2gpXG4gIH1cblxuICBjb25maXJtU2VsZWN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jb25maXJtLXNlbGVjdGlvbicpXG4gIH1cblxuICBjb25maXJtU2VsZWN0aW9uSWZOb25EZWZhdWx0IChldmVudCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNvbmZpcm0tc2VsZWN0aW9uLWlmLW5vbi1kZWZhdWx0JywgZXZlbnQpXG4gIH1cblxuICBzZWxlY3ROZXh0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1zZWxlY3QtbmV4dCcpXG4gIH1cblxuICBzZWxlY3RQcmV2aW91cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXByZXZpb3VzJylcbiAgfVxuXG4gIHNlbGVjdFBhZ2VVcCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXBhZ2UtdXAnKVxuICB9XG5cbiAgc2VsZWN0UGFnZURvd24gKCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXNlbGVjdC1wYWdlLWRvd24nKVxuICB9XG5cbiAgc2VsZWN0VG9wICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1zZWxlY3QtdG9wJylcbiAgfVxuXG4gIHNlbGVjdEJvdHRvbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LWJvdHRvbScpXG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBFdmVudHNcbiAgKi9cblxuICBvbkRpZENvbmZpcm1TZWxlY3Rpb24gKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNvbmZpcm0tc2VsZWN0aW9uJywgZm4pXG4gIH1cblxuICBvbkRpZGNvbmZpcm1TZWxlY3Rpb25JZk5vbkRlZmF1bHQgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNvbmZpcm0tc2VsZWN0aW9uLWlmLW5vbi1kZWZhdWx0JywgZm4pXG4gIH1cblxuICBvbkRpZENvbmZpcm0gKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNvbmZpcm0nLCBmbilcbiAgfVxuXG4gIG9uRGlkU2VsZWN0TmV4dCAoZm4pIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtc2VsZWN0LW5leHQnLCBmbilcbiAgfVxuXG4gIG9uRGlkU2VsZWN0UHJldmlvdXMgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXNlbGVjdC1wcmV2aW91cycsIGZuKVxuICB9XG5cbiAgb25EaWRTZWxlY3RQYWdlVXAgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXNlbGVjdC1wYWdlLXVwJywgZm4pXG4gIH1cblxuICBvbkRpZFNlbGVjdFBhZ2VEb3duIChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1zZWxlY3QtcGFnZS1kb3duJywgZm4pXG4gIH1cblxuICBvbkRpZFNlbGVjdFRvcCAoZm4pIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXRvcCcsIGZuKVxuICB9XG5cbiAgb25EaWRTZWxlY3RCb3R0b20gKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXNlbGVjdC1ib3R0b20nLCBmbilcbiAgfVxuXG4gIG9uRGlkQ2FuY2VsIChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jYW5jZWwnLCBmbilcbiAgfVxuXG4gIG9uRGlkRGlzcG9zZSAoZm4pIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGlzcG9zZScsIGZuKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VJdGVtcyAoZm4pIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWl0ZW1zJywgZm4pXG4gIH1cblxuICBpc0FjdGl2ZSAoKSB7XG4gICAgcmV0dXJuICh0aGlzLmFjdGl2ZUVkaXRvciAhPSBudWxsKVxuICB9XG5cbiAgc2hvdyAoZWRpdG9yLCBvcHRpb25zKSB7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBsdXMuc3VnZ2VzdGlvbkxpc3RGb2xsb3dzJykgPT09ICdDdXJzb3InKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaG93QXRDdXJzb3JQb3NpdGlvbihlZGl0b3IsIG9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB7IHByZWZpeCB9ID0gb3B0aW9uc1xuICAgICAgbGV0IGZvbGxvd1Jhd1ByZWZpeCA9IGZhbHNlXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbXNbaV1cbiAgICAgICAgaWYgKGl0ZW0ucmVwbGFjZW1lbnRQcmVmaXggIT0gbnVsbCkge1xuICAgICAgICAgIHByZWZpeCA9IGl0ZW0ucmVwbGFjZW1lbnRQcmVmaXgudHJpbSgpXG4gICAgICAgICAgZm9sbG93UmF3UHJlZml4ID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNob3dBdEJlZ2lubmluZ09mUHJlZml4KGVkaXRvciwgcHJlZml4LCBmb2xsb3dSYXdQcmVmaXgpXG4gICAgfVxuICB9XG5cbiAgc2hvd0F0QmVnaW5uaW5nT2ZQcmVmaXggKGVkaXRvciwgcHJlZml4LCBmb2xsb3dSYXdQcmVmaXggPSBmYWxzZSkge1xuICAgIGxldCBidWZmZXJQb3NpdGlvblxuICAgIGlmIChlZGl0b3IpIHtcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIChmb2xsb3dSYXdQcmVmaXggfHwgdGhpcy53b3JkUHJlZml4UmVnZXgudGVzdChwcmVmaXgpKSB7XG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb24udHJhbnNsYXRlKFswLCAtcHJlZml4Lmxlbmd0aF0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWN0aXZlRWRpdG9yID09PSBlZGl0b3IpIHtcbiAgICAgIGlmICghYnVmZmVyUG9zaXRpb24uaXNFcXVhbCh0aGlzLmRpc3BsYXlCdWZmZXJQb3NpdGlvbikpIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5QnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblxuICAgICAgICBpZiAodGhpcy5zdWdnZXN0aW9uTWFya2VyKSB7XG4gICAgICAgICAgdGhpcy5zdWdnZXN0aW9uTWFya2VyLnNldEJ1ZmZlclJhbmdlKFtidWZmZXJQb3NpdGlvbiwgYnVmZmVyUG9zaXRpb25dKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVzdHJveU92ZXJsYXkoKVxuICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICB0aGlzLmFjdGl2ZUVkaXRvciA9IGVkaXRvclxuICAgICAgICB0aGlzLmRpc3BsYXlCdWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uXG4gICAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuc3VnZ2VzdGlvbk1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW2J1ZmZlclBvc2l0aW9uLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ292ZXJsYXknLCBpdGVtOiB0aGlzLnN1Z2dlc3Rpb25MaXN0RWxlbWVudCwgcG9zaXRpb246ICd0YWlsJywgY2xhc3M6ICdhdXRvY29tcGxldGUtcGx1cyd9KVxuICAgICAgICBjb25zdCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuYWN0aXZlRWRpdG9yKVxuICAgICAgICBpZiAoZWRpdG9yRWxlbWVudCAmJiBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdCkge1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYXV0b2NvbXBsZXRlLWFjdGl2ZScpXG4gICAgICAgIH1cblxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHsgdGhpcy5zdWdnZXN0aW9uTGlzdEVsZW1lbnQuZGlkQXR0YWNoKCkgfSlcbiAgICAgICAgdGhpcy5hZGRCaW5kaW5ncyhlZGl0b3IpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2hvd0F0Q3Vyc29yUG9zaXRpb24gKGVkaXRvcikge1xuICAgIHRoaXMuZGVzdHJveU92ZXJsYXkoKVxuXG4gICAgaWYgKHRoaXMuYWN0aXZlRWRpdG9yID09PSBlZGl0b3IgfHwgKGVkaXRvciA9PSBudWxsKSkgeyByZXR1cm4gfVxuICAgIGxldCBtYXJrZXJcbiAgICBpZiAoZWRpdG9yLmdldExhc3RDdXJzb3IoKSkge1xuICAgICAgbWFya2VyID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRNYXJrZXIoKVxuICAgIH1cbiAgICBpZiAobWFya2VyKSB7XG4gICAgICB0aGlzLmFjdGl2ZUVkaXRvciA9IGVkaXRvclxuICAgICAgY29uc3QgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmFjdGl2ZUVkaXRvcilcbiAgICAgIGlmIChlZGl0b3JFbGVtZW50ICYmIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYXV0b2NvbXBsZXRlLWFjdGl2ZScpXG4gICAgICB9XG5cbiAgICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ292ZXJsYXknLCBpdGVtOiB0aGlzLnN1Z2dlc3Rpb25MaXN0RWxlbWVudCwgY2xhc3M6ICdhdXRvY29tcGxldGUtcGx1cyd9KVxuICAgICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7IHRoaXMuc3VnZ2VzdGlvbkxpc3RFbGVtZW50LmRpZEF0dGFjaCgpIH0pXG4gICAgICByZXR1cm4gdGhpcy5hZGRCaW5kaW5ncyhlZGl0b3IpXG4gICAgfVxuICB9XG5cbiAgaGlkZSAoKSB7XG4gICAgdGhpcy5kZXN0cm95T3ZlcmxheSgpXG4gICAgaWYgKHRoaXMuYWN0aXZlRWRpdG9yID09PSBudWxsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5iaW5kaW5ncyAmJiB0aGlzLmJpbmRpbmdzLmRpc3Bvc2UpIHtcbiAgICAgIHRoaXMuYmluZGluZ3MuZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgdGhpcy5hY3RpdmVFZGl0b3IgPSBudWxsXG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlRWRpdG9yXG4gIH1cblxuICBkZXN0cm95T3ZlcmxheSAoKSB7XG4gICAgaWYgKHRoaXMuc3VnZ2VzdGlvbk1hcmtlciAmJiB0aGlzLnN1Z2dlc3Rpb25NYXJrZXIuZGVzdHJveSkge1xuICAgICAgdGhpcy5zdWdnZXN0aW9uTWFya2VyLmRlc3Ryb3koKVxuICAgIH0gZWxzZSBpZiAodGhpcy5vdmVybGF5RGVjb3JhdGlvbiAmJiB0aGlzLm92ZXJsYXlEZWNvcmF0aW9uLmRlc3Ryb3kpIHtcbiAgICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24uZGVzdHJveSgpXG4gICAgfVxuICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5hY3RpdmVFZGl0b3IpXG4gICAgaWYgKGVkaXRvckVsZW1lbnQgJiYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICAgIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYXV0b2NvbXBsZXRlLWFjdGl2ZScpXG4gICAgfVxuICAgIHRoaXMuc3VnZ2VzdGlvbk1hcmtlciA9IHVuZGVmaW5lZFxuICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24gPSB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5vdmVybGF5RGVjb3JhdGlvblxuICB9XG5cbiAgY2hhbmdlSXRlbXMgKGl0ZW1zKSB7XG4gICAgdGhpcy5pdGVtcyA9IGl0ZW1zXG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWl0ZW1zJywgdGhpcy5pdGVtcylcbiAgfVxuXG4gIC8vIFB1YmxpYzogQ2xlYW4gdXAsIHN0b3AgbGlzdGVuaW5nIHRvIGV2ZW50c1xuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYmluZGluZ3MgJiYgdGhpcy5iaW5kaW5ncy5kaXNwb3NlKSB7XG4gICAgICB0aGlzLmJpbmRpbmdzLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRpc3Bvc2UnKVxuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==