Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignalElement = undefined;

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MESSAGE_IDLE = 'Idle';

let SignalElement = exports.SignalElement = class SignalElement extends HTMLElement {

  // $FlowIgnore: Flow has invalid typing of createdCallback
  createdCallback() {
    this.update([], []);
    this.classList.add('inline-block');
    this.classList.add('loading-spinner-tiny');
  }
  update(titles, history) {
    this.setBusy(!!titles.length);
    const tooltipMessage = [];
    if (history.length) {
      tooltipMessage.push('<strong>History:</strong>', history.map(function (item) {
        return `${(0, _escapeHtml2.default)(item.title)} ( duration: ${item.duration} )`;
      }).join('<br>'));
    }
    if (titles.length) {
      tooltipMessage.push('<strong>Current:</strong>', titles.map(_escapeHtml2.default).join('<br>'));
    }
    if (tooltipMessage.length) {
      this.setTooltip(tooltipMessage.join('<br>'));
    } else {
      this.setTooltip(MESSAGE_IDLE);
    }
  }
  setBusy(busy) {
    if (busy) {
      this.classList.add('busy');
      this.classList.remove('idle');
      this.activatedLast = Date.now();
      clearTimeout(this.deactivateTimer);
    } else {
      // The logic below makes sure that busy signal is shown for at least 1 second
      const timeNow = Date.now();
      const timeThen = this.activatedLast || 0;
      const timeDifference = timeNow - timeThen;
      if (timeDifference < 1000) {
        this.deactivateTimer = setTimeout(() => this.setBusy(false), timeDifference + 100);
      } else {
        this.classList.add('idle');
        this.classList.remove('busy');
      }
    }
  }
  setTooltip(title) {
    if (this.tooltip) {
      this.tooltip.dispose();
    }
    this.tooltip = atom.tooltips.add(this, {
      title: `<div style="text-align: left;">${title}</div>`
    });
  }
  dispose() {
    this.tooltip.dispose();
  }
};


const element = document.registerElement('busy-signal', {
  prototype: SignalElement.prototype
});

exports.default = element;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQuanMiXSwibmFtZXMiOlsiTUVTU0FHRV9JRExFIiwiU2lnbmFsRWxlbWVudCIsIkhUTUxFbGVtZW50IiwiY3JlYXRlZENhbGxiYWNrIiwidXBkYXRlIiwiY2xhc3NMaXN0IiwiYWRkIiwidGl0bGVzIiwiaGlzdG9yeSIsInNldEJ1c3kiLCJsZW5ndGgiLCJ0b29sdGlwTWVzc2FnZSIsInB1c2giLCJtYXAiLCJpdGVtIiwidGl0bGUiLCJkdXJhdGlvbiIsImpvaW4iLCJzZXRUb29sdGlwIiwiYnVzeSIsInJlbW92ZSIsImFjdGl2YXRlZExhc3QiLCJEYXRlIiwibm93IiwiY2xlYXJUaW1lb3V0IiwiZGVhY3RpdmF0ZVRpbWVyIiwidGltZU5vdyIsInRpbWVUaGVuIiwidGltZURpZmZlcmVuY2UiLCJzZXRUaW1lb3V0IiwidG9vbHRpcCIsImRpc3Bvc2UiLCJhdG9tIiwidG9vbHRpcHMiLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJyZWdpc3RlckVsZW1lbnQiLCJwcm90b3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7Ozs7OztBQUdBLE1BQU1BLGVBQWUsTUFBckI7O0lBRWFDLGEsV0FBQUEsYSxHQUFOLE1BQU1BLGFBQU4sU0FBNEJDLFdBQTVCLENBQXdDOztBQUs3QztBQUNBQyxvQkFBa0I7QUFDaEIsU0FBS0MsTUFBTCxDQUFZLEVBQVosRUFBZ0IsRUFBaEI7QUFDQSxTQUFLQyxTQUFMLENBQWVDLEdBQWYsQ0FBbUIsY0FBbkI7QUFDQSxTQUFLRCxTQUFMLENBQWVDLEdBQWYsQ0FBbUIsc0JBQW5CO0FBQ0Q7QUFDREYsU0FBT0csTUFBUCxFQUE4QkMsT0FBOUIsRUFBbUY7QUFDakYsU0FBS0MsT0FBTCxDQUFhLENBQUMsQ0FBQ0YsT0FBT0csTUFBdEI7QUFDQSxVQUFNQyxpQkFBaUIsRUFBdkI7QUFDQSxRQUFJSCxRQUFRRSxNQUFaLEVBQW9CO0FBQ2xCQyxxQkFBZUMsSUFBZixDQUFvQiwyQkFBcEIsRUFBaURKLFFBQVFLLEdBQVIsQ0FBWSxVQUFTQyxJQUFULEVBQWU7QUFDMUUsZUFBUSxHQUFFLDBCQUFPQSxLQUFLQyxLQUFaLENBQW1CLGdCQUFlRCxLQUFLRSxRQUFTLElBQTFEO0FBQ0QsT0FGZ0QsRUFFOUNDLElBRjhDLENBRXpDLE1BRnlDLENBQWpEO0FBR0Q7QUFDRCxRQUFJVixPQUFPRyxNQUFYLEVBQW1CO0FBQ2pCQyxxQkFBZUMsSUFBZixDQUFvQiwyQkFBcEIsRUFBaURMLE9BQU9NLEdBQVAsdUJBQW1CSSxJQUFuQixDQUF3QixNQUF4QixDQUFqRDtBQUNEO0FBQ0QsUUFBSU4sZUFBZUQsTUFBbkIsRUFBMkI7QUFDekIsV0FBS1EsVUFBTCxDQUFnQlAsZUFBZU0sSUFBZixDQUFvQixNQUFwQixDQUFoQjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUtDLFVBQUwsQ0FBZ0JsQixZQUFoQjtBQUNEO0FBQ0Y7QUFDRFMsVUFBUVUsSUFBUixFQUF1QjtBQUNyQixRQUFJQSxJQUFKLEVBQVU7QUFDUixXQUFLZCxTQUFMLENBQWVDLEdBQWYsQ0FBbUIsTUFBbkI7QUFDQSxXQUFLRCxTQUFMLENBQWVlLE1BQWYsQ0FBc0IsTUFBdEI7QUFDQSxXQUFLQyxhQUFMLEdBQXFCQyxLQUFLQyxHQUFMLEVBQXJCO0FBQ0FDLG1CQUFhLEtBQUtDLGVBQWxCO0FBQ0QsS0FMRCxNQUtPO0FBQ0w7QUFDQSxZQUFNQyxVQUFVSixLQUFLQyxHQUFMLEVBQWhCO0FBQ0EsWUFBTUksV0FBVyxLQUFLTixhQUFMLElBQXNCLENBQXZDO0FBQ0EsWUFBTU8saUJBQWlCRixVQUFVQyxRQUFqQztBQUNBLFVBQUlDLGlCQUFpQixJQUFyQixFQUEyQjtBQUN6QixhQUFLSCxlQUFMLEdBQXVCSSxXQUFXLE1BQU0sS0FBS3BCLE9BQUwsQ0FBYSxLQUFiLENBQWpCLEVBQXNDbUIsaUJBQWlCLEdBQXZELENBQXZCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBS3ZCLFNBQUwsQ0FBZUMsR0FBZixDQUFtQixNQUFuQjtBQUNBLGFBQUtELFNBQUwsQ0FBZWUsTUFBZixDQUFzQixNQUF0QjtBQUNEO0FBQ0Y7QUFDRjtBQUNERixhQUFXSCxLQUFYLEVBQTBCO0FBQ3hCLFFBQUksS0FBS2UsT0FBVCxFQUFrQjtBQUNoQixXQUFLQSxPQUFMLENBQWFDLE9BQWI7QUFDRDtBQUNELFNBQUtELE9BQUwsR0FBZUUsS0FBS0MsUUFBTCxDQUFjM0IsR0FBZCxDQUFrQixJQUFsQixFQUF3QjtBQUNyQ1MsYUFBUSxrQ0FBaUNBLEtBQU07QUFEVixLQUF4QixDQUFmO0FBR0Q7QUFDRGdCLFlBQVU7QUFDUixTQUFLRCxPQUFMLENBQWFDLE9BQWI7QUFDRDtBQXpENEMsQzs7O0FBNEQvQyxNQUFNRyxVQUFVQyxTQUFTQyxlQUFULENBQXlCLGFBQXpCLEVBQXdDO0FBQ3REQyxhQUFXcEMsY0FBY29DO0FBRDZCLENBQXhDLENBQWhCOztrQkFJZUgsTyIsImZpbGUiOiJlbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IGVzY2FwZSBmcm9tICdlc2NhcGUtaHRtbCdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmNvbnN0IE1FU1NBR0VfSURMRSA9ICdJZGxlJ1xuXG5leHBvcnQgY2xhc3MgU2lnbmFsRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgdG9vbHRpcDogRGlzcG9zYWJsZTtcbiAgYWN0aXZhdGVkTGFzdDogP251bWJlcjtcbiAgZGVhY3RpdmF0ZVRpbWVyOiA/bnVtYmVyO1xuXG4gIC8vICRGbG93SWdub3JlOiBGbG93IGhhcyBpbnZhbGlkIHR5cGluZyBvZiBjcmVhdGVkQ2FsbGJhY2tcbiAgY3JlYXRlZENhbGxiYWNrKCkge1xuICAgIHRoaXMudXBkYXRlKFtdLCBbXSlcbiAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycpXG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdsb2FkaW5nLXNwaW5uZXItdGlueScpXG4gIH1cbiAgdXBkYXRlKHRpdGxlczogQXJyYXk8c3RyaW5nPiwgaGlzdG9yeTogQXJyYXk8eyB0aXRsZTogc3RyaW5nLCBkdXJhdGlvbjogc3RyaW5nIH0+KSB7XG4gICAgdGhpcy5zZXRCdXN5KCEhdGl0bGVzLmxlbmd0aClcbiAgICBjb25zdCB0b29sdGlwTWVzc2FnZSA9IFtdXG4gICAgaWYgKGhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICB0b29sdGlwTWVzc2FnZS5wdXNoKCc8c3Ryb25nPkhpc3Rvcnk6PC9zdHJvbmc+JywgaGlzdG9yeS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gYCR7ZXNjYXBlKGl0ZW0udGl0bGUpfSAoIGR1cmF0aW9uOiAke2l0ZW0uZHVyYXRpb259IClgXG4gICAgICB9KS5qb2luKCc8YnI+JykpXG4gICAgfVxuICAgIGlmICh0aXRsZXMubGVuZ3RoKSB7XG4gICAgICB0b29sdGlwTWVzc2FnZS5wdXNoKCc8c3Ryb25nPkN1cnJlbnQ6PC9zdHJvbmc+JywgdGl0bGVzLm1hcChlc2NhcGUpLmpvaW4oJzxicj4nKSlcbiAgICB9XG4gICAgaWYgKHRvb2x0aXBNZXNzYWdlLmxlbmd0aCkge1xuICAgICAgdGhpcy5zZXRUb29sdGlwKHRvb2x0aXBNZXNzYWdlLmpvaW4oJzxicj4nKSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRUb29sdGlwKE1FU1NBR0VfSURMRSlcbiAgICB9XG4gIH1cbiAgc2V0QnVzeShidXN5OiBib29sZWFuKSB7XG4gICAgaWYgKGJ1c3kpIHtcbiAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnYnVzeScpXG4gICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2lkbGUnKVxuICAgICAgdGhpcy5hY3RpdmF0ZWRMYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZGVhY3RpdmF0ZVRpbWVyKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgbG9naWMgYmVsb3cgbWFrZXMgc3VyZSB0aGF0IGJ1c3kgc2lnbmFsIGlzIHNob3duIGZvciBhdCBsZWFzdCAxIHNlY29uZFxuICAgICAgY29uc3QgdGltZU5vdyA9IERhdGUubm93KClcbiAgICAgIGNvbnN0IHRpbWVUaGVuID0gdGhpcy5hY3RpdmF0ZWRMYXN0IHx8IDBcbiAgICAgIGNvbnN0IHRpbWVEaWZmZXJlbmNlID0gdGltZU5vdyAtIHRpbWVUaGVuXG4gICAgICBpZiAodGltZURpZmZlcmVuY2UgPCAxMDAwKSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnNldEJ1c3koZmFsc2UpLCB0aW1lRGlmZmVyZW5jZSArIDEwMClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaWRsZScpXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnYnVzeScpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldFRvb2x0aXAodGl0bGU6IHN0cmluZykge1xuICAgIGlmICh0aGlzLnRvb2x0aXApIHtcbiAgICAgIHRoaXMudG9vbHRpcC5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQodGhpcywge1xuICAgICAgdGl0bGU6IGA8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDtcIj4ke3RpdGxlfTwvZGl2PmAsXG4gICAgfSlcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMudG9vbHRpcC5kaXNwb3NlKClcbiAgfVxufVxuXG5jb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCdidXN5LXNpZ25hbCcsIHtcbiAgcHJvdG90eXBlOiBTaWduYWxFbGVtZW50LnByb3RvdHlwZSxcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IGVsZW1lbnRcbiJdfQ==