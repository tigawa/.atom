Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _sbEventKit = require('sb-event-kit');

let TooltipDelegate = class TooltipDelegate {

  constructor() {
    this.emitter = new _sbEventKit.Emitter();
    this.expanded = false;
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.showProviderName', showProviderName => {
      const shouldUpdate = typeof this.showProviderName !== 'undefined';
      this.showProviderName = showProviderName;
      if (shouldUpdate) {
        this.emitter.emit('should-update');
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:expand-tooltip': event => {
        if (this.expanded) {
          return;
        }
        this.expanded = true;
        this.emitter.emit('should-expand');

        // If bound to a key, collapse when that key is released, just like old times
        if (event.originalEvent && event.originalEvent.isTrusted) {
          document.body.addEventListener('keyup', function eventListener() {
            document.body.removeEventListener('keyup', eventListener);
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'linter-ui-default:collapse-tooltip');
          });
        }
      },
      'linter-ui-default:collapse-tooltip': () => {
        this.expanded = false;
        this.emitter.emit('should-collapse');
      }
    }));
  }
  onShouldUpdate(callback) {
    return this.emitter.on('should-update', callback);
  }
  onShouldExpand(callback) {
    return this.emitter.on('should-expand', callback);
  }
  onShouldCollapse(callback) {
    return this.emitter.on('should-collapse', callback);
  }
  dispose() {
    this.emitter.dispose();
  }
};
exports.default = TooltipDelegate;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlbGVnYXRlLmpzIl0sIm5hbWVzIjpbIlRvb2x0aXBEZWxlZ2F0ZSIsImNvbnN0cnVjdG9yIiwiZW1pdHRlciIsImV4cGFuZGVkIiwic3Vic2NyaXB0aW9ucyIsImFkZCIsImF0b20iLCJjb25maWciLCJvYnNlcnZlIiwic2hvd1Byb3ZpZGVyTmFtZSIsInNob3VsZFVwZGF0ZSIsImVtaXQiLCJjb21tYW5kcyIsImV2ZW50Iiwib3JpZ2luYWxFdmVudCIsImlzVHJ1c3RlZCIsImRvY3VtZW50IiwiYm9keSIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRpc3BhdGNoIiwidmlld3MiLCJnZXRWaWV3Iiwid29ya3NwYWNlIiwib25TaG91bGRVcGRhdGUiLCJjYWxsYmFjayIsIm9uIiwib25TaG91bGRFeHBhbmQiLCJvblNob3VsZENvbGxhcHNlIiwiZGlzcG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7SUFHcUJBLGUsR0FBTixNQUFNQSxlQUFOLENBQXNCOztBQU1uQ0MsZ0JBQWM7QUFDWixTQUFLQyxPQUFMLEdBQWUseUJBQWY7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixxQ0FBckI7O0FBRUEsU0FBS0EsYUFBTCxDQUFtQkMsR0FBbkIsQ0FBdUIsS0FBS0gsT0FBNUI7QUFDQSxTQUFLRSxhQUFMLENBQW1CQyxHQUFuQixDQUF1QkMsS0FBS0MsTUFBTCxDQUFZQyxPQUFaLENBQW9CLG9DQUFwQixFQUEyREMsZ0JBQUQsSUFBc0I7QUFDckcsWUFBTUMsZUFBZSxPQUFPLEtBQUtELGdCQUFaLEtBQWlDLFdBQXREO0FBQ0EsV0FBS0EsZ0JBQUwsR0FBd0JBLGdCQUF4QjtBQUNBLFVBQUlDLFlBQUosRUFBa0I7QUFDaEIsYUFBS1IsT0FBTCxDQUFhUyxJQUFiLENBQWtCLGVBQWxCO0FBQ0Q7QUFDRixLQU5zQixDQUF2QjtBQU9BLFNBQUtQLGFBQUwsQ0FBbUJDLEdBQW5CLENBQXVCQyxLQUFLTSxRQUFMLENBQWNQLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQ3pELDBDQUFxQ1EsS0FBRCxJQUFXO0FBQzdDLFlBQUksS0FBS1YsUUFBVCxFQUFtQjtBQUNqQjtBQUNEO0FBQ0QsYUFBS0EsUUFBTCxHQUFnQixJQUFoQjtBQUNBLGFBQUtELE9BQUwsQ0FBYVMsSUFBYixDQUFrQixlQUFsQjs7QUFFQTtBQUNBLFlBQUlFLE1BQU1DLGFBQU4sSUFBdUJELE1BQU1DLGFBQU4sQ0FBb0JDLFNBQS9DLEVBQTBEO0FBQ3hEQyxtQkFBU0MsSUFBVCxDQUFjQyxnQkFBZCxDQUErQixPQUEvQixFQUF3QyxTQUFTQyxhQUFULEdBQXlCO0FBQy9ESCxxQkFBU0MsSUFBVCxDQUFjRyxtQkFBZCxDQUFrQyxPQUFsQyxFQUEyQ0QsYUFBM0M7QUFDQWIsaUJBQUtNLFFBQUwsQ0FBY1MsUUFBZCxDQUF1QmYsS0FBS2dCLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQmpCLEtBQUtrQixTQUF4QixDQUF2QixFQUEyRCxvQ0FBM0Q7QUFDRCxXQUhEO0FBSUQ7QUFDRixPQWZ3RDtBQWdCekQsNENBQXNDLE1BQU07QUFDMUMsYUFBS3JCLFFBQUwsR0FBZ0IsS0FBaEI7QUFDQSxhQUFLRCxPQUFMLENBQWFTLElBQWIsQ0FBa0IsaUJBQWxCO0FBQ0Q7QUFuQndELEtBQXBDLENBQXZCO0FBcUJEO0FBQ0RjLGlCQUFlQyxRQUFmLEVBQWtEO0FBQ2hELFdBQU8sS0FBS3hCLE9BQUwsQ0FBYXlCLEVBQWIsQ0FBZ0IsZUFBaEIsRUFBaUNELFFBQWpDLENBQVA7QUFDRDtBQUNERSxpQkFBZUYsUUFBZixFQUFrRDtBQUNoRCxXQUFPLEtBQUt4QixPQUFMLENBQWF5QixFQUFiLENBQWdCLGVBQWhCLEVBQWlDRCxRQUFqQyxDQUFQO0FBQ0Q7QUFDREcsbUJBQWlCSCxRQUFqQixFQUFvRDtBQUNsRCxXQUFPLEtBQUt4QixPQUFMLENBQWF5QixFQUFiLENBQWdCLGlCQUFoQixFQUFtQ0QsUUFBbkMsQ0FBUDtBQUNEO0FBQ0RJLFlBQVU7QUFDUixTQUFLNUIsT0FBTCxDQUFhNEIsT0FBYjtBQUNEO0FBcERrQyxDO2tCQUFoQjlCLGUiLCJmaWxlIjoiZGVsZWdhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IHR5cGUgeyBEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb29sdGlwRGVsZWdhdGUge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBleHBhbmRlZDogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgc2hvd1Byb3ZpZGVyTmFtZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5leHBhbmRlZCA9IGZhbHNlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93UHJvdmlkZXJOYW1lJywgKHNob3dQcm92aWRlck5hbWUpID0+IHtcbiAgICAgIGNvbnN0IHNob3VsZFVwZGF0ZSA9IHR5cGVvZiB0aGlzLnNob3dQcm92aWRlck5hbWUgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnNob3dQcm92aWRlck5hbWUgPSBzaG93UHJvdmlkZXJOYW1lXG4gICAgICBpZiAoc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtdXBkYXRlJylcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpleHBhbmQtdG9vbHRpcCc6IChldmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5leHBhbmRlZCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwYW5kZWQgPSB0cnVlXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtZXhwYW5kJylcblxuICAgICAgICAvLyBJZiBib3VuZCB0byBhIGtleSwgY29sbGFwc2Ugd2hlbiB0aGF0IGtleSBpcyByZWxlYXNlZCwganVzdCBsaWtlIG9sZCB0aW1lc1xuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LmlzVHJ1c3RlZCkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiBldmVudExpc3RlbmVyKCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50TGlzdGVuZXIpXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdsaW50ZXItdWktZGVmYXVsdDpjb2xsYXBzZS10b29sdGlwJylcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmNvbGxhcHNlLXRvb2x0aXAnOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWNvbGxhcHNlJylcbiAgICAgIH0sXG4gICAgfSkpXG4gIH1cbiAgb25TaG91bGRVcGRhdGUoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLXVwZGF0ZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uU2hvdWxkRXhwYW5kKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC1leHBhbmQnLCBjYWxsYmFjaylcbiAgfVxuICBvblNob3VsZENvbGxhcHNlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC1jb2xsYXBzZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=