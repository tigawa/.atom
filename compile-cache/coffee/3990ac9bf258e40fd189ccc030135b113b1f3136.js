(function() {
  var CompositeDisposable, Emitter, SuggestionList, UnicodeLetters, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  UnicodeLetters = require('./unicode-helpers').UnicodeLetters;

  module.exports = SuggestionList = (function() {
    SuggestionList.prototype.wordPrefixRegex = null;

    function SuggestionList() {
      this.destroyOverlay = __bind(this.destroyOverlay, this);
      this.hide = __bind(this.hide, this);
      this.showAtCursorPosition = __bind(this.showAtCursorPosition, this);
      this.showAtBeginningOfPrefix = __bind(this.showAtBeginningOfPrefix, this);
      this.show = __bind(this.show, this);
      this.confirmSelection = __bind(this.confirmSelection, this);
      this.confirm = __bind(this.confirm, this);
      this.cancel = __bind(this.cancel, this);
      this.active = false;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor.autocomplete-active', {
        'autocomplete-plus:confirm': this.confirmSelection,
        'autocomplete-plus:cancel': this.cancel
      }));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.useCoreMovementCommands', (function(_this) {
        return function() {
          return _this.bindToMovementCommands();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', (function(_this) {
        return function(enableExtendedUnicodeSupport) {
          if (enableExtendedUnicodeSupport) {
            return _this.wordPrefixRegex = new RegExp("^[" + UnicodeLetters + "\\d_-]");
          } else {
            return _this.wordPrefixRegex = /^[\w-]/;
          }
        };
      })(this)));
    }

    SuggestionList.prototype.bindToMovementCommands = function() {
      var commandNamespace, commands, useCoreMovementCommands, _ref1;
      useCoreMovementCommands = atom.config.get('autocomplete-plus.useCoreMovementCommands');
      commandNamespace = useCoreMovementCommands ? 'core' : 'autocomplete-plus';
      commands = {};
      commands["" + commandNamespace + ":move-up"] = (function(_this) {
        return function(event) {
          var _ref1;
          if (_this.isActive() && ((_ref1 = _this.items) != null ? _ref1.length : void 0) > 1) {
            _this.selectPrevious();
            return event.stopImmediatePropagation();
          }
        };
      })(this);
      commands["" + commandNamespace + ":move-down"] = (function(_this) {
        return function(event) {
          var _ref1;
          if (_this.isActive() && ((_ref1 = _this.items) != null ? _ref1.length : void 0) > 1) {
            _this.selectNext();
            return event.stopImmediatePropagation();
          }
        };
      })(this);
      commands["" + commandNamespace + ":page-up"] = (function(_this) {
        return function(event) {
          var _ref1;
          if (_this.isActive() && ((_ref1 = _this.items) != null ? _ref1.length : void 0) > 1) {
            _this.selectPageUp();
            return event.stopImmediatePropagation();
          }
        };
      })(this);
      commands["" + commandNamespace + ":page-down"] = (function(_this) {
        return function(event) {
          var _ref1;
          if (_this.isActive() && ((_ref1 = _this.items) != null ? _ref1.length : void 0) > 1) {
            _this.selectPageDown();
            return event.stopImmediatePropagation();
          }
        };
      })(this);
      commands["" + commandNamespace + ":move-to-top"] = (function(_this) {
        return function(event) {
          var _ref1;
          if (_this.isActive() && ((_ref1 = _this.items) != null ? _ref1.length : void 0) > 1) {
            _this.selectTop();
            return event.stopImmediatePropagation();
          }
        };
      })(this);
      commands["" + commandNamespace + ":move-to-bottom"] = (function(_this) {
        return function(event) {
          var _ref1;
          if (_this.isActive() && ((_ref1 = _this.items) != null ? _ref1.length : void 0) > 1) {
            _this.selectBottom();
            return event.stopImmediatePropagation();
          }
        };
      })(this);
      if ((_ref1 = this.movementCommandSubscriptions) != null) {
        _ref1.dispose();
      }
      this.movementCommandSubscriptions = new CompositeDisposable;
      return this.movementCommandSubscriptions.add(atom.commands.add('atom-text-editor.autocomplete-active', commands));
    };

    SuggestionList.prototype.addKeyboardInteraction = function() {
      var completionKey, keys;
      this.removeKeyboardInteraction();
      completionKey = atom.config.get('autocomplete-plus.confirmCompletion') || '';
      keys = {};
      if (completionKey.indexOf('tab') > -1) {
        keys['tab'] = 'autocomplete-plus:confirm';
      }
      if (completionKey.indexOf('enter') > -1) {
        keys['enter'] = 'autocomplete-plus:confirm';
      }
      this.keymaps = atom.keymaps.add('atom-text-editor.autocomplete-active', {
        'atom-text-editor.autocomplete-active': keys
      });
      return this.subscriptions.add(this.keymaps);
    };

    SuggestionList.prototype.removeKeyboardInteraction = function() {
      var _ref1;
      if ((_ref1 = this.keymaps) != null) {
        _ref1.dispose();
      }
      this.keymaps = null;
      return this.subscriptions.remove(this.keymaps);
    };


    /*
    Section: Event Triggers
     */

    SuggestionList.prototype.cancel = function() {
      return this.emitter.emit('did-cancel');
    };

    SuggestionList.prototype.confirm = function(match) {
      return this.emitter.emit('did-confirm', match);
    };

    SuggestionList.prototype.confirmSelection = function() {
      return this.emitter.emit('did-confirm-selection');
    };

    SuggestionList.prototype.selectNext = function() {
      return this.emitter.emit('did-select-next');
    };

    SuggestionList.prototype.selectPrevious = function() {
      return this.emitter.emit('did-select-previous');
    };

    SuggestionList.prototype.selectPageUp = function() {
      return this.emitter.emit('did-select-page-up');
    };

    SuggestionList.prototype.selectPageDown = function() {
      return this.emitter.emit('did-select-page-down');
    };

    SuggestionList.prototype.selectTop = function() {
      return this.emitter.emit('did-select-top');
    };

    SuggestionList.prototype.selectBottom = function() {
      return this.emitter.emit('did-select-bottom');
    };


    /*
    Section: Events
     */

    SuggestionList.prototype.onDidConfirmSelection = function(fn) {
      return this.emitter.on('did-confirm-selection', fn);
    };

    SuggestionList.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    SuggestionList.prototype.onDidSelectNext = function(fn) {
      return this.emitter.on('did-select-next', fn);
    };

    SuggestionList.prototype.onDidSelectPrevious = function(fn) {
      return this.emitter.on('did-select-previous', fn);
    };

    SuggestionList.prototype.onDidSelectPageUp = function(fn) {
      return this.emitter.on('did-select-page-up', fn);
    };

    SuggestionList.prototype.onDidSelectPageDown = function(fn) {
      return this.emitter.on('did-select-page-down', fn);
    };

    SuggestionList.prototype.onDidSelectTop = function(fn) {
      return this.emitter.on('did-select-top', fn);
    };

    SuggestionList.prototype.onDidSelectBottom = function(fn) {
      return this.emitter.on('did-select-bottom', fn);
    };

    SuggestionList.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    SuggestionList.prototype.onDidDispose = function(fn) {
      return this.emitter.on('did-dispose', fn);
    };

    SuggestionList.prototype.onDidChangeItems = function(fn) {
      return this.emitter.on('did-change-items', fn);
    };

    SuggestionList.prototype.isActive = function() {
      return this.active;
    };

    SuggestionList.prototype.show = function(editor, options) {
      var followRawPrefix, item, prefix, _i, _len, _ref1;
      if (atom.config.get('autocomplete-plus.suggestionListFollows') === 'Cursor') {
        return this.showAtCursorPosition(editor, options);
      } else {
        prefix = options.prefix;
        followRawPrefix = false;
        _ref1 = this.items;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          item = _ref1[_i];
          if (item.replacementPrefix != null) {
            prefix = item.replacementPrefix.trim();
            followRawPrefix = true;
            break;
          }
        }
        return this.showAtBeginningOfPrefix(editor, prefix, followRawPrefix);
      }
    };

    SuggestionList.prototype.showAtBeginningOfPrefix = function(editor, prefix, followRawPrefix) {
      var bufferPosition, marker, _ref1;
      if (followRawPrefix == null) {
        followRawPrefix = false;
      }
      if (editor == null) {
        return;
      }
      bufferPosition = editor.getCursorBufferPosition();
      if (followRawPrefix || this.wordPrefixRegex.test(prefix)) {
        bufferPosition = bufferPosition.translate([0, -prefix.length]);
      }
      if (this.active) {
        if (!bufferPosition.isEqual(this.displayBufferPosition)) {
          this.displayBufferPosition = bufferPosition;
          return (_ref1 = this.suggestionMarker) != null ? _ref1.setBufferRange([bufferPosition, bufferPosition]) : void 0;
        }
      } else {
        this.destroyOverlay();
        this.displayBufferPosition = bufferPosition;
        marker = this.suggestionMarker = editor.markBufferRange([bufferPosition, bufferPosition]);
        this.overlayDecoration = editor.decorateMarker(marker, {
          type: 'overlay',
          item: this,
          position: 'tail'
        });
        this.addKeyboardInteraction();
        return this.active = true;
      }
    };

    SuggestionList.prototype.showAtCursorPosition = function(editor) {
      var marker, _ref1;
      if (this.active || (editor == null)) {
        return;
      }
      this.destroyOverlay();
      if (marker = (_ref1 = editor.getLastCursor()) != null ? _ref1.getMarker() : void 0) {
        this.overlayDecoration = editor.decorateMarker(marker, {
          type: 'overlay',
          item: this
        });
        this.addKeyboardInteraction();
        return this.active = true;
      }
    };

    SuggestionList.prototype.hide = function() {
      if (!this.active) {
        return;
      }
      this.destroyOverlay();
      this.removeKeyboardInteraction();
      return this.active = false;
    };

    SuggestionList.prototype.destroyOverlay = function() {
      var _ref1;
      if (this.suggestionMarker != null) {
        this.suggestionMarker.destroy();
      } else {
        if ((_ref1 = this.overlayDecoration) != null) {
          _ref1.destroy();
        }
      }
      this.suggestionMarker = void 0;
      return this.overlayDecoration = void 0;
    };

    SuggestionList.prototype.changeItems = function(items) {
      this.items = items;
      return this.emitter.emit('did-change-items', items);
    };

    SuggestionList.prototype.dispose = function() {
      var _ref1;
      this.subscriptions.dispose();
      if ((_ref1 = this.movementCommandSubscriptions) != null) {
        _ref1.dispose();
      }
      this.emitter.emit('did-dispose');
      return this.emitter.dispose();
    };

    return SuggestionList;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3VnZ2VzdGlvbi1saXN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrRUFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFBVixDQUFBOztBQUFBLEVBQ0MsaUJBQWtCLE9BQUEsQ0FBUSxtQkFBUixFQUFsQixjQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osNkJBQUEsZUFBQSxHQUFpQixJQUFqQixDQUFBOztBQUVhLElBQUEsd0JBQUEsR0FBQTtBQUNYLDZEQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEseUVBQUEsQ0FBQTtBQUFBLCtFQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRmpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isc0NBQWxCLEVBQ2pCO0FBQUEsUUFBQSwyQkFBQSxFQUE2QixJQUFDLENBQUEsZ0JBQTlCO0FBQUEsUUFDQSwwQkFBQSxFQUE0QixJQUFDLENBQUEsTUFEN0I7T0FEaUIsQ0FBbkIsQ0FIQSxDQUFBO0FBQUEsTUFNQSxJQUFD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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/suggestion-list.coffee
