Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _humanizeTime = require('humanize-time');

var _humanizeTime2 = _interopRequireDefault(_humanizeTime);

var _atom = require('atom');

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Registry = class Registry {

  constructor() {
    this.emitter = new _atom.Emitter();
    this.providers = new Set();
    this.itemsActive = [];
    this.itemsHistory = [];
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('busy-signal.itemsToShowInHistory', itemsToShowInHistory => {
      const previousValue = this.itemsToShowInHistory;
      this.itemsToShowInHistory = parseInt(itemsToShowInHistory, 10);
      if (typeof previousValue === 'number') {
        this.emitter.emit('did-update');
      }
    }));
  }
  // Public method
  create() {
    const provider = new _provider2.default();
    provider.onDidAdd(status => {
      this.statusAdd(provider, status);
    });
    provider.onDidRemove(title => {
      this.statusRemove(provider, title);
    });
    provider.onDidClear(() => {
      this.statusClear(provider);
    });
    provider.onDidDispose(() => {
      this.statusClear(provider);
      this.providers.delete(provider);
    });
    this.providers.add(provider);
    return provider;
  }
  statusAdd(provider, status) {
    for (let i = 0; i < this.itemsActive.length; i++) {
      const entry = this.itemsActive[i];
      if (entry.title === status.title && entry.provider === provider) {
        // Item already exists, ignore
        break;
      }
    }

    this.itemsActive.push({
      title: status.title,
      priority: status.priority,
      provider,
      timeAdded: Date.now(),
      timeRemoved: null
    });
    this.emitter.emit('did-update');
  }
  statusRemove(provider, title) {
    for (let i = 0; i < this.itemsActive.length; i++) {
      const entry = this.itemsActive[i];
      if (entry.provider === provider && entry.title === title) {
        this.pushIntoHistory(i, entry);
        this.emitter.emit('did-update');
        break;
      }
    }
  }
  statusClear(provider) {
    let triggerUpdate = false;
    for (let i = 0; i < this.itemsActive.length; i++) {
      const entry = this.itemsActive[i];
      if (entry.provider === provider) {
        this.pushIntoHistory(i, entry);
        triggerUpdate = true;
        i--;
      }
    }
    if (triggerUpdate) {
      this.emitter.emit('did-update');
    }
  }
  pushIntoHistory(index, item) {
    item.timeRemoved = Date.now();
    this.itemsActive.splice(index, 1);
    this.itemsHistory = this.itemsHistory.concat([item]).slice(-1000);
  }
  getActiveTitles() {
    return this.itemsActive.slice().sort(function (a, b) {
      return a.priority - b.priority;
    }).map(i => i.title);
  }
  getOldTitles() {
    const toReturn = [];
    const history = this.itemsHistory;
    const activeTitles = this.getActiveTitles();
    const mergedTogether = history.map(i => i.title).concat(activeTitles);

    for (let i = 0, length = history.length; i < length; i++) {
      const item = history[i];
      if (mergedTogether.lastIndexOf(item.title) === i) {
        toReturn.push({
          title: item.title,
          duration: (0, _humanizeTime2.default)(item.timeRemoved && item.timeRemoved - item.timeAdded)
        });
      }
    }

    return toReturn.slice(-1 * this.itemsToShowInHistory);
  }
  onDidUpdate(callback) {
    return this.emitter.on('did-update', callback);
  }
  dispose() {
    this.subscriptions.dispose();
    for (const provider of this.providers) {
      provider.dispose();
    }
  }
};
exports.default = Registry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbIlJlZ2lzdHJ5IiwiY29uc3RydWN0b3IiLCJlbWl0dGVyIiwicHJvdmlkZXJzIiwiU2V0IiwiaXRlbXNBY3RpdmUiLCJpdGVtc0hpc3RvcnkiLCJzdWJzY3JpcHRpb25zIiwiYWRkIiwiYXRvbSIsImNvbmZpZyIsIm9ic2VydmUiLCJpdGVtc1RvU2hvd0luSGlzdG9yeSIsInByZXZpb3VzVmFsdWUiLCJwYXJzZUludCIsImVtaXQiLCJjcmVhdGUiLCJwcm92aWRlciIsIm9uRGlkQWRkIiwic3RhdHVzIiwic3RhdHVzQWRkIiwib25EaWRSZW1vdmUiLCJ0aXRsZSIsInN0YXR1c1JlbW92ZSIsIm9uRGlkQ2xlYXIiLCJzdGF0dXNDbGVhciIsIm9uRGlkRGlzcG9zZSIsImRlbGV0ZSIsImkiLCJsZW5ndGgiLCJlbnRyeSIsInB1c2giLCJwcmlvcml0eSIsInRpbWVBZGRlZCIsIkRhdGUiLCJub3ciLCJ0aW1lUmVtb3ZlZCIsInB1c2hJbnRvSGlzdG9yeSIsInRyaWdnZXJVcGRhdGUiLCJpbmRleCIsIml0ZW0iLCJzcGxpY2UiLCJjb25jYXQiLCJzbGljZSIsImdldEFjdGl2ZVRpdGxlcyIsInNvcnQiLCJhIiwiYiIsIm1hcCIsImdldE9sZFRpdGxlcyIsInRvUmV0dXJuIiwiaGlzdG9yeSIsImFjdGl2ZVRpdGxlcyIsIm1lcmdlZFRvZ2V0aGVyIiwibGFzdEluZGV4T2YiLCJkdXJhdGlvbiIsIm9uRGlkVXBkYXRlIiwiY2FsbGJhY2siLCJvbiIsImRpc3Bvc2UiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7Ozs7QUFDQTs7QUFHQTs7Ozs7O0lBR3FCQSxRLEdBQU4sTUFBTUEsUUFBTixDQUFlOztBQVE1QkMsZ0JBQWM7QUFDWixTQUFLQyxPQUFMLEdBQWUsbUJBQWY7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLElBQUlDLEdBQUosRUFBakI7QUFDQSxTQUFLQyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsU0FBS0MsWUFBTCxHQUFv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QTdDLEVBQXFERCxHQUFyRCxFQUEwRDtBQUN4RCxZQUFNWSxPQUFPVyxRQUFRdkIsQ0FBUixDQUFiO0FBQ0EsVUFBSXlCLGVBQWVDLFdBQWYsQ0FBMkJkLEtBQUtsQixLQUFoQyxNQUEyQ00sQ0FBL0MsRUFBa0Q7QUFDaERzQixpQkFBU25CLElBQVQsQ0FBYztBQUNaVCxpQkFBT2tCLEtBQUtsQixLQURBO0FBRVppQyxvQkFBVSw0QkFBYWYsS0FBS0osV0FBTCxJQUFvQkksS0FBS0osV0FBTCxHQUFtQkksS0FBS1AsU0FBekQ7QUFGRSxTQUFkO0FBSUQ7QUFDRjs7QUFFRCxXQUFPaUIsU0FBU1AsS0FBVCxDQUFlLENBQUMsQ0FBRCxHQUFLLEtBQUsvQixvQkFBekIsQ0FBUDtBQUNEO0FBQ0Q0QyxjQUFZQyxRQUFaLEVBQTRDO0FBQzFDLFdBQU8sS0FBS3ZELE9BQUwsQ0FBYXdELEVBQWIsQ0FBZ0IsWUFBaEIsRUFBOEJELFFBQTlCLENBQVA7QUFDRDtBQUNERSxZQUFVO0FBQ1IsU0FBS3BELGFBQUwsQ0FBbUJvRCxPQUFuQjtBQUNBLFNBQUssTUFBTTFDLFFBQVgsSUFBdUIsS0FBS2QsU0FBNUIsRUFBdUM7QUFDckNjLGVBQVMwQyxPQUFUO0FBQ0Q7QUFDRjtBQXpIMkIsQztrQkFBVDNELFEiLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgaHVtYW5pemVUaW1lIGZyb20gJ2h1bWFuaXplLXRpbWUnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBQcm92aWRlciBmcm9tICcuL3Byb3ZpZGVyJ1xuaW1wb3J0IHR5cGUgeyBTaWduYWwgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdpc3RyeSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXJcbiAgcHJvdmlkZXJzOiBTZXQ8UHJvdmlkZXI+XG4gIGl0ZW1zQWN0aXZlOiBBcnJheTxTaWduYWw+XG4gIGl0ZW1zSGlzdG9yeTogQXJyYXk8U2lnbmFsPlxuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIGl0ZW1zVG9TaG93SW5IaXN0b3J5OiBudW1iZXJcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5wcm92aWRlcnMgPSBuZXcgU2V0KClcbiAgICB0aGlzLml0ZW1zQWN0aXZlID0gW11cbiAgICB0aGlzLml0ZW1zSGlzdG9yeSA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdidXN5LXNpZ25hbC5pdGVtc1RvU2hvd0luSGlzdG9yeScsIChpdGVtc1RvU2hvd0luSGlzdG9yeSkgPT4ge1xuICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IHRoaXMuaXRlbXNUb1Nob3dJbkhpc3RvcnlcbiAgICAgIHRoaXMuaXRlbXNUb1Nob3dJbkhpc3RvcnkgPSBwYXJzZUludChpdGVtc1RvU2hvd0luSGlzdG9yeSwgMTApXG4gICAgICBpZiAodHlwZW9mIHByZXZpb3VzVmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJylcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuICAvLyBQdWJsaWMgbWV0aG9kXG4gIGNyZWF0ZSgpOiBQcm92aWRlciB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIoKVxuICAgIHByb3ZpZGVyLm9uRGlkQWRkKChzdGF0dXMpID0+IHtcbiAgICAgIHRoaXMuc3RhdHVzQWRkKHByb3ZpZGVyLCBzdGF0dXMpXG4gICAgfSlcbiAgICBwcm92aWRlci5vbkRpZFJlbW92ZSgodGl0bGUpID0+IHtcbiAgICAgIHRoaXMuc3RhdHVzUmVtb3ZlKHByb3ZpZGVyLCB0aXRsZSlcbiAgICB9KVxuICAgIHByb3ZpZGVyLm9uRGlkQ2xlYXIoKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0dXNDbGVhcihwcm92aWRlcilcbiAgICB9KVxuICAgIHByb3ZpZGVyLm9uRGlkRGlzcG9zZSgoKSA9PiB7XG4gICAgICB0aGlzLnN0YXR1c0NsZWFyKHByb3ZpZGVyKVxuICAgICAgdGhpcy5wcm92aWRlcnMuZGVsZXRlKHByb3ZpZGVyKVxuICAgIH0pXG4gICAgdGhpcy5wcm92aWRlcnMuYWRkKHByb3ZpZGVyKVxuICAgIHJldHVybiBwcm92aWRlclxuICB9XG4gIHN0YXR1c0FkZChwcm92aWRlcjogUHJvdmlkZXIsIHN0YXR1czogeyB0aXRsZTogc3RyaW5nLCBwcmlvcml0eTogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXNBY3RpdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5pdGVtc0FjdGl2ZVtpXVxuICAgICAgaWYgKGVudHJ5LnRpdGxlID09PSBzdGF0dXMudGl0bGUgJiYgZW50cnkucHJvdmlkZXIgPT09IHByb3ZpZGVyKSB7XG4gICAgICAgIC8vIEl0ZW0gYWxyZWFkeSBleGlzdHMsIGlnbm9yZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXRlbXNBY3RpdmUucHVzaCh7XG4gICAgICB0aXRsZTogc3RhdHVzLnRpdGxlLFxuICAgICAgcHJpb3JpdHk6IHN0YXR1cy5wcmlvcml0eSxcbiAgICAgIHByb3ZpZGVyLFxuICAgICAgdGltZUFkZGVkOiBEYXRlLm5vdygpLFxuICAgICAgdGltZVJlbW92ZWQ6IG51bGwsXG4gICAgfSlcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZScpXG4gIH1cbiAgc3RhdHVzUmVtb3ZlKHByb3ZpZGVyOiBQcm92aWRlciwgdGl0bGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pdGVtc0FjdGl2ZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLml0ZW1zQWN0aXZlW2ldXG4gICAgICBpZiAoZW50cnkucHJvdmlkZXIgPT09IHByb3ZpZGVyICYmIGVudHJ5LnRpdGxlID09PSB0aXRsZSkge1xuICAgICAgICB0aGlzLnB1c2hJbnRvSGlzdG9yeShpLCBlbnRyeSlcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBzdGF0dXNDbGVhcihwcm92aWRlcjogUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBsZXQgdHJpZ2dlclVwZGF0ZSA9IGZhbHNlXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zQWN0aXZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuaXRlbXNBY3RpdmVbaV1cbiAgICAgIGlmIChlbnRyeS5wcm92aWRlciA9PT0gcHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5wdXNoSW50b0hpc3RvcnkoaSwgZW50cnkpXG4gICAgICAgIHRyaWdnZXJVcGRhdGUgPSB0cnVlXG4gICAgICAgIGktLVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHJpZ2dlclVwZGF0ZSkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnKVxuICAgIH1cbiAgfVxuICBwdXNoSW50b0hpc3RvcnkoaW5kZXg6IG51bWJlciwgaXRlbTogU2lnbmFsKTogdm9pZCB7XG4gICAgaXRlbS50aW1lUmVtb3ZlZCA9IERhdGUubm93KClcbiAgICB0aGlzLml0ZW1zQWN0aXZlLnNwbGljZShpbmRleCwgMSlcbiAgICB0aGlzLml0ZW1zSGlzdG9yeSA9IHRoaXMuaXRlbXNIaXN0b3J5LmNvbmNhdChbaXRlbV0pLnNsaWNlKC0xMDAwKVxuICB9XG4gIGdldEFjdGl2ZVRpdGxlcygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pdGVtc0FjdGl2ZS5zbGljZSgpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5XG4gICAgfSkubWFwKGkgPT4gaS50aXRsZSlcbiAgfVxuICBnZXRPbGRUaXRsZXMoKTogQXJyYXk8eyB0aXRsZTogc3RyaW5nLCBkdXJhdGlvbjogc3RyaW5nIH0+IHtcbiAgICBjb25zdCB0b1JldHVybiA9IFtdXG4gICAgY29uc3QgaGlzdG9yeSA9IHRoaXMuaXRlbXNIaXN0b3J5XG4gICAgY29uc3QgYWN0aXZlVGl0bGVzID0gdGhpcy5nZXRBY3RpdmVUaXRsZXMoKVxuICAgIGNvbnN0IG1lcmdlZFRvZ2V0aGVyID0gaGlzdG9yeS5tYXAoaSA9PiBpLnRpdGxlKS5jb25jYXQoYWN0aXZlVGl0bGVzKVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGhpc3RvcnkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBoaXN0b3J5W2ldXG4gICAgICBpZiAobWVyZ2VkVG9nZXRoZXIubGFzdEluZGV4T2YoaXRlbS50aXRsZSkgPT09IGkpIHtcbiAgICAgICAgdG9SZXR1cm4ucHVzaCh7XG4gICAgICAgICAgdGl0bGU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgZHVyYXRpb246IGh1bWFuaXplVGltZShpdGVtLnRpbWVSZW1vdmVkICYmIGl0ZW0udGltZVJlbW92ZWQgLSBpdGVtLnRpbWVBZGRlZCksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvUmV0dXJuLnNsaWNlKC0xICogdGhpcy5pdGVtc1RvU2hvd0luSGlzdG9yeSlcbiAgfVxuICBvbkRpZFVwZGF0ZShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLnByb3ZpZGVycykge1xuICAgICAgcHJvdmlkZXIuZGlzcG9zZSgpXG4gICAgfVxuICB9XG59XG4iXX0=