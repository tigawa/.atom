Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _atom = require('atom');

var _sbEventKit = require('sb-event-kit');

var _tooltip = require('../tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var _helpers = require('../helpers');

var _helpers2 = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Editor = class Editor {

  constructor(textEditor) {
    this.tooltip = null;
    this.emitter = new _sbEventKit.Emitter();
    this.markers = new Map();
    this.messages = new Set();
    this.textEditor = textEditor;
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.showTooltip', showTooltip => {
      this.showTooltip = showTooltip;
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.showProviderName', showProviderName => {
      this.showProviderName = showProviderName;
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.showDecorations', showDecorations => {
      const notInitial = typeof this.showDecorations !== 'undefined';
      this.showDecorations = showDecorations;
      if (notInitial) {
        this.updateGutter();
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.gutterPosition', gutterPosition => {
      const notInitial = typeof this.gutterPosition !== 'undefined';
      this.gutterPosition = gutterPosition;
      if (notInitial) {
        this.updateGutter();
      }
    }));
    this.subscriptions.add(textEditor.onDidDestroy(() => {
      this.dispose();
    }));

    let tooltipSubscription;
    this.subscriptions.add(atom.config.observe('linter-ui-default.tooltipFollows', tooltipFollows => {
      if (tooltipSubscription) {
        tooltipSubscription.dispose();
      }
      tooltipSubscription = tooltipFollows === 'Mouse' ? this.listenForMouseMovement() : this.listenForKeyboardMovement();
      this.removeTooltip();
    }));
    this.subscriptions.add(function () {
      tooltipSubscription.dispose();
    });
    this.updateGutter();
    this.listenForCurrentLine();
  }
  listenForCurrentLine() {
    this.subscriptions.add(this.textEditor.observeCursors(cursor => {
      let marker;
      let lastRange;
      let lastEmpty;
      const handlePositionChange = ({ start, end }) => {
        const gutter = this.gutter;
        if (!gutter) return;
        // We need that Range.fromObject hack below because when we focus index 0 on multi-line selection
        // end.column is the column of the last line but making a range out of two and then accesing
        // the end seems to fix it (black magic?)
        const currentRange = _atom.Range.fromObject([start, end]);
        const linesRange = _atom.Range.fromObject([[start.row, 0], [end.row, Infinity]]);
        const currentEmpty = currentRange.isEmpty();

        // NOTE: Atom does not paint gutter if multi-line and last line has zero index
        if (start.row !== end.row && currentRange.end.column === 0) {
          linesRange.end.row--;
        }
        if (lastRange && lastRange.isEqual(linesRange) && currentEmpty === lastEmpty) return;
        if (marker) marker.destroy();
        lastRange = linesRange;
        lastEmpty = currentEmpty;

        marker = this.textEditor.markBufferRange(linesRange, {
          invalidate: 'never'
        });
        const item = document.createElement('span');
        item.className = `line-number cursor-line linter-cursor-line ${currentEmpty ? 'cursor-line-no-selection' : ''}`;
        gutter.decorateMarker(marker, {
          item,
          class: 'linter-row'
        });
      };

      const cursorMarker = cursor.getMarker();
      const subscriptions = new _sbEventKit.CompositeDisposable();
      subscriptions.add(cursorMarker.onDidChange(({ newHeadBufferPosition, newTailBufferPosition }) => {
        handlePositionChange({ start: newHeadBufferPosition, end: newTailBufferPosition });
      }));
      subscriptions.add(cursor.onDidDestroy(() => {
        this.subscriptions.delete(subscriptions);
        subscriptions.dispose();
      }));
      subscriptions.add(function () {
        if (marker) marker.destroy();
      });
      this.subscriptions.add(subscriptions);
      handlePositionChange(cursorMarker.getBufferRange());
    }));
  }
  listenForMouseMovement() {
    const editorElement = atom.views.getView(this.textEditor);
    return (0, _disposableEvent2.default)(editorElement, 'mousemove', (0, _sbDebounce2.default)(e => {
      if (!editorElement.component || !(0, _helpers2.hasParent)(e.target, 'div.line')) {
        return;
      }
      const tooltip = this.tooltip;
      if (tooltip && (0, _helpers2.mouseEventNearPosition)(e, editorElement, tooltip.marker.getStartScreenPosition(), tooltip.element.offsetWidth, tooltip.element.offsetHeight)) {
        return;
      }
      // NOTE: Ignore if file is too big
      if (this.textEditor.largeFileMode) {
        this.removeTooltip();
        return;
      }
      const cursorPosition = (0, _helpers2.getBufferPositionFromMouseEvent)(e, this.textEditor, editorElement);
      this.cursorPosition = cursorPosition;
      if (cursorPosition) {
        this.updateTooltip(this.cursorPosition);
      } else {
        this.removeTooltip();
      }
    }, 200, true));
  }
  listenForKeyboardMovement() {
    return this.textEditor.onDidChangeCursorPosition((0, _sbDebounce2.default)(({ newBufferPosition }) => {
      this.cursorPosition = newBufferPosition;
      this.updateTooltip(newBufferPosition);
    }, 60));
  }
  updateGutter() {
    this.removeGutter();
    if (!this.showDecorations) {
      this.gutter = null;
      return;
    }
    const priority = this.gutterPosition === 'Left' ? -100 : 100;
    this.gutter = this.textEditor.addGutter({
      name: 'linter-ui-default',
      priority
    });
    this.markers.forEach((marker, message) => {
      this.decorateMarker(message, marker, 'gutter');
    });
  }
  removeGutter() {
    if (this.gutter) {
      try {
        this.gutter.destroy();
      } catch (_) {
        /* This throws when the text editor is disposed */
      }
    }
  }
  updateTooltip(position) {
    if (!position || this.tooltip && this.tooltip.isValid(position, this.messages)) {
      return;
    }
    this.removeTooltip();
    if (!this.showTooltip) {
      return;
    }

    const messages = (0, _helpers.filterMessagesByRangeOrPoint)(this.messages, this.textEditor.getPath(), position);
    if (!messages.length) {
      return;
    }

    this.tooltip = new _tooltip2.default(messages, position, this.textEditor);
    this.tooltip.onDidDestroy(() => {
      this.tooltip = null;
    });
  }
  removeTooltip() {
    if (this.tooltip) {
      this.tooltip.marker.destroy();
    }
  }
  apply(added, removed) {
    const textBuffer = this.textEditor.getBuffer();

    for (let i = 0, length = removed.length; i < length; i++) {
      const message = removed[i];
      const marker = this.markers.get(message);
      if (marker) {
        marker.destroy();
      }
      this.messages.delete(message);
      this.markers.delete(message);
    }

    for (let i = 0, length = added.length; i < length; i++) {
      const message = added[i];
      const markerRange = (0, _helpers.$range)(message);
      if (!markerRange) {
        // Only for backward compatibility
        continue;
      }
      const marker = textBuffer.markRange(markerRange, {
        invalidate: 'never'
      });
      this.markers.set(message, marker);
      this.messages.add(message);
      marker.onDidChange(({ oldHeadPosition, newHeadPosition, isValid }) => {
        if (!isValid || newHeadPosition.row === 0 && oldHeadPosition.row !== 0) {
          return;
        }
        if (message.version === 1) {
          message.range = marker.previousEventState.range;
        } else {
          message.location.position = marker.previousEventState.range;
        }
      });
      this.decorateMarker(message, marker);
    }

    this.updateTooltip(this.cursorPosition);
  }
  decorateMarker(message, marker, paint = 'both') {
    if (paint === 'both' || paint === 'editor') {
      this.textEditor.decorateMarker(marker, {
        type: 'highlight',
        class: `linter-highlight linter-${message.severity}`
      });
    }

    const gutter = this.gutter;
    if (gutter && (paint === 'both' || paint === 'gutter')) {
      const element = document.createElement('span');
      element.className = `linter-gutter linter-highlight linter-${message.severity} icon icon-${message.icon || 'primitive-dot'}`;
      gutter.decorateMarker(marker, {
        class: 'linter-row',
        item: element
      });
    }
  }
  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback);
  }
  dispose() {
    this.emitter.emit('did-destroy');
    this.subscriptions.dispose();
    this.removeGutter();
    this.removeTooltip();
  }
};
exports.default = Editor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkVkaXRvciIsImNvbnN0cnVjdG9yIiwidGV4dEVkaXRvciIsInRvb2x0aXAiLCJlbWl0dGVyIiwibWFya2VycyIsIk1hcCIsIm1lc3NhZ2VzIiwiU2V0Iiwic3Vic2NyaXB0aW9ucyIsImFkZCIsImF0b20iLCJjb25maWciLCJvYnNlcnZlIiwic2hvd1Rvb2x0aXAiLCJzaG93UHJvdmlkZXJOYW1lIiwic2hvd0RlY29yYXRpb25zIiwibm90SW5pdGlhbCIsInVwZGF0ZUd1dHRlciIsImd1dHRlclBvc2l0aW9uIiwib25EaWREZXN0cm95IiwiZGlzcG9zZSIsInRvb2x0aXBTdWJzY3JpcHRpb24iLCJ0b29sdGlwRm9sbG93cyIsImxpc3RlbkZvck1vdXNlTW92ZW1lbnQiLCJsaXN0ZW5Gb3JLZXlib2FyZE1vdmVtZW50IiwicmVtb3ZlVG9vbHRpcCIsImxpc3RlbkZvckN1cnJlbnRMaW5lIiwib2JzZXJ2ZUN1cnNvcnMiLCJjdXJzb3IiLCJtYXJrZXIiLCJsYXN0UmFuZ2UiLCJsYXN0RW1wdHkiLCJoYW5kbGVQb3NpdGlvbkNoYW5nZSIsInN0YXJ0IiwiZW5kIiwiZ3V0dGVyIiwiY3VycmVudFJhbmdlIiwiZnJvbU9iamVjdCIsImxpbmVzUmFuZ2UiLCJyb3ciLCJJbmZpbml0eSIsImN1cnJlbnRFbXB0eSIsImlzRW1wdHkiLCJjb2x1bW4iLCJpc0VxdWFsIiwiZGVzdHJveSIsIm1hcmtCdWZmZXJSYW5nZSIsImludmFsaWRhdGUiLCJpdGVtIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwiZGVjb3JhdGVNYXJrZXIiLCJjbGFzcyIsImN1cnNvck1hcmtlciIsImdldE1hcmtlciIsIm9uRGlkQ2hhbmdlIiwibmV3SGVhZEJ1ZmZlclBvc2l0aW9uIiwibmV3VGFpbEJ1ZmZlclBvc2l0aW9uIiwiZGVsZXRlIiwiZ2V0QnVmZmVyUmFuZ2UiLCJlZGl0b3JFbGVtZW50Iiwidmlld3MiLCJnZXRWaWV3IiwiZSIsImNvbXBvbmVudCIsInRhcmdldCIsImdldFN0YXJ0U2NyZWVuUG9zaXRpb24iLCJlbGVtZW50Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJsYXJnZUZpbGVNb2RlIiwiY3Vyc29yUG9zaXRpb24iLCJ1cGRhdGVUb29sdGlwIiwib25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiIsIm5ld0J1ZmZlclBvc2l0aW9uIiwicmVtb3ZlR3V0dGVyIiwicHJpb3JpdHkiLCJhZGRHdXR0ZXIiLCJuYW1lIiwiZm9yRWFjaCIsIm1lc3NhZ2UiLCJfIiwicG9zaXRpb24iLCJpc1ZhbGlkIiwiZ2V0UGF0aCIsImxlbmd0aCIsImFwcGx5IiwiYWRkZWQiLCJyZW1vdmVkIiwidGV4dEJ1ZmZlciIsImdldEJ1ZmZlciIsImkiLCJnZXQiLCJtYXJrZXJSYW5nZSIsIm1hcmtSYW5nZSIsInNldCIsIm9sZEhlYWRQb3NpdGlvbiIsIm5ld0hlYWRQb3NpdGlvbiIsInZlcnNpb24iLCJyYW5nZSIsInByZXZpb3VzRXZlbnRTdGF0ZSIsImxvY2F0aW9uIiwicGFpbnQiLCJ0eXBlIiwic2V2ZXJpdHkiLCJpY29uIiwiY2FsbGJhY2siLCJvbiIsImVtaXQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUdBOzs7O0FBQ0E7O0FBQ0E7Ozs7SUFHcUJBLE0sR0FBTixNQUFNQSxNQUFOLENBQWE7O0FBYzFCQyxjQUFZQyxVQUFaLEVBQW9DO0FBQ2xDLFNBQUtDLE9BQUwsR0FBZSxJQUFmO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLHlCQUFmO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLElBQUlDLEdBQUosRUFBZjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsSUFBSUMsR0FBSixFQUFoQjtBQUNBLFNBQUtOLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0EsU0FBS08sYUFBTCxHQUFxQixxQ0FBckI7O0FBRUEsU0FBS0EsYUFBTCxDQUFtQkMsR0FBbkIsQ0FBdUIsS0FBS04sT0FBNUI7QUFDQSxTQUFL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d0IsUUFBUztBQUZkLE9BQXZDO0FBSUQ7O0FBRUQsVUFBTXRFLFNBQVMsS0FBS0EsTUFBcEI7QUFDQSxRQUFJQSxXQUFXb0UsVUFBVSxNQUFWLElBQW9CQSxVQUFVLFFBQXpDLENBQUosRUFBd0Q7QUFDdEQsWUFBTW5DLFVBQVVuQixTQUFTQyxhQUFULENBQXVCLE1BQXZCLENBQWhCO0FBQ0FrQixjQUFRakIsU0FBUixHQUFxQix5Q0FBd0M4QixRQUFRd0IsUUFBUyxjQUFheEIsUUFBUXlCLElBQVIsSUFBZ0IsZUFBZ0IsRUFBM0g7QUFDQXZFLGFBQU9pQixjQUFQLENBQXNCdkIsTUFBdEIsRUFBOEI7QUFDNUJ3QixlQUFPLFlBRHFCO0FBRTVCTCxjQUFNb0I7QUFGc0IsT0FBOUI7QUFJRDtBQUNGO0FBQ0RqRCxlQUFhd0YsUUFBYixFQUE2QztBQUMzQyxXQUFPLEtBQUt4RyxPQUFMLENBQWF5RyxFQUFiLENBQWdCLGFBQWhCLEVBQStCRCxRQUEvQixDQUFQO0FBQ0Q7QUFDRHZGLFlBQVU7QUFDUixTQUFLakIsT0FBTCxDQUFhMEcsSUFBYixDQUFrQixhQUFsQjtBQUNBLFNBQUtyRyxhQUFMLENBQW1CWSxPQUFuQjtBQUNBLFNBQUt3RCxZQUFMO0FBQ0EsU0FBS25ELGFBQUw7QUFDRDtBQWhReUIsQztrQkFBUDFCLE0iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnc2ItZGVib3VuY2UnXG5pbXBvcnQgZGlzcG9zYWJsZUV2ZW50IGZyb20gJ2Rpc3Bvc2FibGUtZXZlbnQnXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyLCBEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yLCBCdWZmZXJNYXJrZXIsIFRleHRFZGl0b3JHdXR0ZXIsIFBvaW50IH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vdG9vbHRpcCdcbmltcG9ydCB7ICRyYW5nZSwgZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgeyBoYXNQYXJlbnQsIG1vdXNlRXZlbnROZWFyUG9zaXRpb24sIGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yIHtcbiAgZ3V0dGVyOiA/VGV4dEVkaXRvckd1dHRlcjtcbiAgdG9vbHRpcDogP1Rvb2x0aXA7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1hcmtlcnM6IE1hcDxMaW50ZXJNZXNzYWdlLCBCdWZmZXJNYXJrZXI+O1xuICBtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+O1xuICB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yO1xuICBzaG93VG9vbHRpcDogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY3Vyc29yUG9zaXRpb246ID9Qb2ludDtcbiAgZ3V0dGVyUG9zaXRpb246IGJvb2xlYW47XG4gIHNob3dEZWNvcmF0aW9uczogYm9vbGVhbjtcbiAgc2hvd1Byb3ZpZGVyTmFtZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gICAgdGhpcy50b29sdGlwID0gbnVsbFxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1hcmtlcnMgPSBuZXcgTWFwKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IFNldCgpXG4gICAgdGhpcy50ZXh0RWRpdG9yID0gdGV4dEVkaXRvclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1Rvb2x0aXAnLCAoc2hvd1Rvb2x0aXApID0+IHtcbiAgICAgIHRoaXMuc2hvd1Rvb2x0aXAgPSBzaG93VG9vbHRpcFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1Byb3ZpZGVyTmFtZScsIChzaG93UHJvdmlkZXJOYW1lKSA9PiB7XG4gICAgICB0aGlzLnNob3dQcm92aWRlck5hbWUgPSBzaG93UHJvdmlkZXJOYW1lXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93RGVjb3JhdGlvbnMnLCAoc2hvd0RlY29yYXRpb25zKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMuc2hvd0RlY29yYXRpb25zICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zaG93RGVjb3JhdGlvbnMgPSBzaG93RGVjb3JhdGlvbnNcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlR3V0dGVyKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0Lmd1dHRlclBvc2l0aW9uJywgKGd1dHRlclBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMuZ3V0dGVyUG9zaXRpb24gIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLmd1dHRlclBvc2l0aW9uID0gZ3V0dGVyUG9zaXRpb25cbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlR3V0dGVyKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGlzcG9zZSgpXG4gICAgfSkpXG5cbiAgICBsZXQgdG9vbHRpcFN1YnNjcmlwdGlvblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQudG9vbHRpcEZvbGxvd3MnLCAodG9vbHRpcEZvbGxvd3MpID0+IHtcbiAgICAgIGlmICh0b29sdGlwU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uID0gdG9vbHRpcEZvbGxvd3MgPT09ICdNb3VzZScgPyB0aGlzLmxpc3RlbkZvck1vdXNlTW92ZW1lbnQoKSA6IHRoaXMubGlzdGVuRm9yS2V5Ym9hcmRNb3ZlbWVudCgpXG4gICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGVHdXR0ZXIoKVxuICAgIHRoaXMubGlzdGVuRm9yQ3VycmVudExpbmUoKVxuICB9XG4gIGxpc3RlbkZvckN1cnJlbnRMaW5lKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy50ZXh0RWRpdG9yLm9ic2VydmVDdXJzb3JzKChjdXJzb3IpID0+IHtcbiAgICAgIGxldCBtYXJrZXJcbiAgICAgIGxldCBsYXN0UmFuZ2VcbiAgICAgIGxldCBsYXN0RW1wdHlcbiAgICAgIGNvbnN0IGhhbmRsZVBvc2l0aW9uQ2hhbmdlID0gKHsgc3RhcnQsIGVuZCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGd1dHRlciA9IHRoaXMuZ3V0dGVyXG4gICAgICAgIGlmICghZ3V0dGVyKSByZXR1cm5cbiAgICAgICAgLy8gV2UgbmVlZCB0aGF0IFJhbmdlLmZyb21PYmplY3QgaGFjayBiZWxvdyBiZWNhdXNlIHdoZW4gd2UgZm9jdXMgaW5kZXggMCBvbiBtdWx0aS1saW5lIHNlbGVjdGlvblxuICAgICAgICAvLyBlbmQuY29sdW1uIGlzIHRoZSBjb2x1bW4gb2YgdGhlIGxhc3QgbGluZSBidXQgbWFraW5nIGEgcmFuZ2Ugb3V0IG9mIHR3byBhbmQgdGhlbiBhY2Nlc2luZ1xuICAgICAgICAvLyB0aGUgZW5kIHNlZW1zIHRvIGZpeCBpdCAoYmxhY2sgbWFnaWM/KVxuICAgICAgICBjb25zdCBjdXJyZW50UmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KFtzdGFydCwgZW5kXSlcbiAgICAgICAgY29uc3QgbGluZXNSYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoW1tzdGFydC5yb3csIDBdLCBbZW5kLnJvdywgSW5maW5pdHldXSlcbiAgICAgICAgY29uc3QgY3VycmVudEVtcHR5ID0gY3VycmVudFJhbmdlLmlzRW1wdHkoKVxuXG4gICAgICAgIC8vIE5PVEU6IEF0b20gZG9lcyBub3QgcGFpbnQgZ3V0dGVyIGlmIG11bHRpLWxpbmUgYW5kIGxhc3QgbGluZSBoYXMgemVybyBpbmRleFxuICAgICAgICBpZiAoc3RhcnQucm93ICE9PSBlbmQucm93ICYmIGN1cnJlbnRSYW5nZS5lbmQuY29sdW1uID09PSAwKSB7XG4gICAgICAgICAgbGluZXNSYW5nZS5lbmQucm93LS1cbiAgICAgICAgfVxuICAgICAgICBpZiAobGFzdFJhbmdlICYmIGxhc3RSYW5nZS5pc0VxdWFsKGxpbmVzUmFuZ2UpICYmIGN1cnJlbnRFbXB0eSA9PT0gbGFzdEVtcHR5KSByZXR1cm5cbiAgICAgICAgaWYgKG1hcmtlcikgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgICBsYXN0UmFuZ2UgPSBsaW5lc1JhbmdlXG4gICAgICAgIGxhc3RFbXB0eSA9IGN1cnJlbnRFbXB0eVxuXG4gICAgICAgIG1hcmtlciA9IHRoaXMudGV4dEVkaXRvci5tYXJrQnVmZmVyUmFuZ2UobGluZXNSYW5nZSwge1xuICAgICAgICAgIGludmFsaWRhdGU6ICduZXZlcicsXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgaXRlbS5jbGFzc05hbWUgPSBgbGluZS1udW1iZXIgY3Vyc29yLWxpbmUgbGludGVyLWN1cnNvci1saW5lICR7Y3VycmVudEVtcHR5ID8gJ2N1cnNvci1saW5lLW5vLXNlbGVjdGlvbicgOiAnJ31gXG4gICAgICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICBpdGVtLFxuICAgICAgICAgIGNsYXNzOiAnbGludGVyLXJvdycsXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnNvck1hcmtlciA9IGN1cnNvci5nZXRNYXJrZXIoKVxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGN1cnNvck1hcmtlci5vbkRpZENoYW5nZSgoeyBuZXdIZWFkQnVmZmVyUG9zaXRpb24sIG5ld1RhaWxCdWZmZXJQb3NpdGlvbiB9KSA9PiB7XG4gICAgICAgIGhhbmRsZVBvc2l0aW9uQ2hhbmdlKHsgc3RhcnQ6IG5ld0hlYWRCdWZmZXJQb3NpdGlvbiwgZW5kOiBuZXdUYWlsQnVmZmVyUG9zaXRpb24gfSlcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoY3Vyc29yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kZWxldGUoc3Vic2NyaXB0aW9ucylcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChtYXJrZXIpIG1hcmtlci5kZXN0cm95KClcbiAgICAgIH0pXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbnMpXG4gICAgICBoYW5kbGVQb3NpdGlvbkNoYW5nZShjdXJzb3JNYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICB9KSlcbiAgfVxuICBsaXN0ZW5Gb3JNb3VzZU1vdmVtZW50KCkge1xuICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy50ZXh0RWRpdG9yKVxuICAgIHJldHVybiBkaXNwb3NhYmxlRXZlbnQoZWRpdG9yRWxlbWVudCwgJ21vdXNlbW92ZScsIGRlYm91bmNlKChlKSA9PiB7XG4gICAgICBpZiAoIWVkaXRvckVsZW1lbnQuY29tcG9uZW50IHx8ICFoYXNQYXJlbnQoZS50YXJnZXQsICdkaXYubGluZScpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgdG9vbHRpcCA9IHRoaXMudG9vbHRpcFxuICAgICAgaWYgKHRvb2x0aXAgJiYgbW91c2VFdmVudE5lYXJQb3NpdGlvbihlLCBlZGl0b3JFbGVtZW50LCB0b29sdGlwLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCksIHRvb2x0aXAuZWxlbWVudC5vZmZzZXRXaWR0aCwgdG9vbHRpcC5lbGVtZW50Lm9mZnNldEhlaWdodCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBOT1RFOiBJZ25vcmUgaWYgZmlsZSBpcyB0b28gYmlnXG4gICAgICBpZiAodGhpcy50ZXh0RWRpdG9yLmxhcmdlRmlsZU1vZGUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQoZSwgdGhpcy50ZXh0RWRpdG9yLCBlZGl0b3JFbGVtZW50KVxuICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IGN1cnNvclBvc2l0aW9uXG4gICAgICBpZiAoY3Vyc29yUG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy51cGRhdGVUb29sdGlwKHRoaXMuY3Vyc29yUG9zaXRpb24pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0sIDIwMCwgdHJ1ZSkpXG4gIH1cbiAgbGlzdGVuRm9yS2V5Ym9hcmRNb3ZlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZGVib3VuY2UoKHsgbmV3QnVmZmVyUG9zaXRpb24gfSkgPT4ge1xuICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IG5ld0J1ZmZlclBvc2l0aW9uXG4gICAgICB0aGlzLnVwZGF0ZVRvb2x0aXAobmV3QnVmZmVyUG9zaXRpb24pXG4gICAgfSwgNjApKVxuICB9XG4gIHVwZGF0ZUd1dHRlcigpIHtcbiAgICB0aGlzLnJlbW92ZUd1dHRlcigpXG4gICAgaWYgKCF0aGlzLnNob3dEZWNvcmF0aW9ucykge1xuICAgICAgdGhpcy5ndXR0ZXIgPSBudWxsXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmd1dHRlclBvc2l0aW9uID09PSAnTGVmdCcgPyAtMTAwIDogMTAwXG4gICAgdGhpcy5ndXR0ZXIgPSB0aGlzLnRleHRFZGl0b3IuYWRkR3V0dGVyKHtcbiAgICAgIG5hbWU6ICdsaW50ZXItdWktZGVmYXVsdCcsXG4gICAgICBwcmlvcml0eSxcbiAgICB9KVxuICAgIHRoaXMubWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIG1lc3NhZ2UpID0+IHtcbiAgICAgIHRoaXMuZGVjb3JhdGVNYXJrZXIobWVzc2FnZSwgbWFya2VyLCAnZ3V0dGVyJylcbiAgICB9KVxuICB9XG4gIHJlbW92ZUd1dHRlcigpIHtcbiAgICBpZiAodGhpcy5ndXR0ZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZ3V0dGVyLmRlc3Ryb3koKVxuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAvKiBUaGlzIHRocm93cyB3aGVuIHRoZSB0ZXh0IGVkaXRvciBpcyBkaXNwb3NlZCAqL1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB1cGRhdGVUb29sdGlwKHBvc2l0aW9uOiA/UG9pbnQpIHtcbiAgICBpZiAoIXBvc2l0aW9uIHx8ICh0aGlzLnRvb2x0aXAgJiYgdGhpcy50b29sdGlwLmlzVmFsaWQocG9zaXRpb24sIHRoaXMubWVzc2FnZXMpKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgaWYgKCF0aGlzLnNob3dUb29sdGlwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQodGhpcy5tZXNzYWdlcywgdGhpcy50ZXh0RWRpdG9yLmdldFBhdGgoKSwgcG9zaXRpb24pXG4gICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMudG9vbHRpcCA9IG5ldyBUb29sdGlwKG1lc3NhZ2VzLCBwb3NpdGlvbiwgdGhpcy50ZXh0RWRpdG9yKVxuICAgIHRoaXMudG9vbHRpcC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy50b29sdGlwID0gbnVsbFxuICAgIH0pXG4gIH1cbiAgcmVtb3ZlVG9vbHRpcCgpIHtcbiAgICBpZiAodGhpcy50b29sdGlwKSB7XG4gICAgICB0aGlzLnRvb2x0aXAubWFya2VyLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuICBhcHBseShhZGRlZDogQXJyYXk8TGludGVyTWVzc2FnZT4sIHJlbW92ZWQ6IEFycmF5PExpbnRlck1lc3NhZ2U+KSB7XG4gICAgY29uc3QgdGV4dEJ1ZmZlciA9IHRoaXMudGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJlbW92ZWQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSByZW1vdmVkW2ldXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm1hcmtlcnMuZ2V0KG1lc3NhZ2UpXG4gICAgICBpZiAobWFya2VyKSB7XG4gICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAgIH1cbiAgICAgIHRoaXMubWVzc2FnZXMuZGVsZXRlKG1lc3NhZ2UpXG4gICAgICB0aGlzLm1hcmtlcnMuZGVsZXRlKG1lc3NhZ2UpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGFkZGVkLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYWRkZWRbaV1cbiAgICAgIGNvbnN0IG1hcmtlclJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgICBpZiAoIW1hcmtlclJhbmdlKSB7XG4gICAgICAgIC8vIE9ubHkgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRleHRCdWZmZXIubWFya1JhbmdlKG1hcmtlclJhbmdlLCB7XG4gICAgICAgIGludmFsaWRhdGU6ICduZXZlcicsXG4gICAgICB9KVxuICAgICAgdGhpcy5tYXJrZXJzLnNldChtZXNzYWdlLCBtYXJrZXIpXG4gICAgICB0aGlzLm1lc3NhZ2VzLmFkZChtZXNzYWdlKVxuICAgICAgbWFya2VyLm9uRGlkQ2hhbmdlKCh7IG9sZEhlYWRQb3NpdGlvbiwgbmV3SGVhZFBvc2l0aW9uLCBpc1ZhbGlkIH0pID0+IHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkIHx8IChuZXdIZWFkUG9zaXRpb24ucm93ID09PSAwICYmIG9sZEhlYWRQb3NpdGlvbi5yb3cgIT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMSkge1xuICAgICAgICAgIG1lc3NhZ2UucmFuZ2UgPSBtYXJrZXIucHJldmlvdXNFdmVudFN0YXRlLnJhbmdlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiA9IG1hcmtlci5wcmV2aW91c0V2ZW50U3RhdGUucmFuZ2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuZGVjb3JhdGVNYXJrZXIobWVzc2FnZSwgbWFya2VyKVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlVG9vbHRpcCh0aGlzLmN1cnNvclBvc2l0aW9uKVxuICB9XG4gIGRlY29yYXRlTWFya2VyKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UsIG1hcmtlcjogT2JqZWN0LCBwYWludDogJ2d1dHRlcicgfCAnZWRpdG9yJyB8ICdib3RoJyA9ICdib3RoJykge1xuICAgIGlmIChwYWludCA9PT0gJ2JvdGgnIHx8IHBhaW50ID09PSAnZWRpdG9yJykge1xuICAgICAgdGhpcy50ZXh0RWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6IGBsaW50ZXItaGlnaGxpZ2h0IGxpbnRlci0ke21lc3NhZ2Uuc2V2ZXJpdHl9YCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgZ3V0dGVyID0gdGhpcy5ndXR0ZXJcbiAgICBpZiAoZ3V0dGVyICYmIChwYWludCA9PT0gJ2JvdGgnIHx8IHBhaW50ID09PSAnZ3V0dGVyJykpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gYGxpbnRlci1ndXR0ZXIgbGludGVyLWhpZ2hsaWdodCBsaW50ZXItJHttZXNzYWdlLnNldmVyaXR5fSBpY29uIGljb24tJHttZXNzYWdlLmljb24gfHwgJ3ByaW1pdGl2ZS1kb3QnfWBcbiAgICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgY2xhc3M6ICdsaW50ZXItcm93JyxcbiAgICAgICAgaXRlbTogZWxlbWVudCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5yZW1vdmVHdXR0ZXIoKVxuICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gIH1cbn1cbiJdfQ==