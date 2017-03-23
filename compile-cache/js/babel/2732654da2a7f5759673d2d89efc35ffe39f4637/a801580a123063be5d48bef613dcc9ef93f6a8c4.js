Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _disposify = require('disposify');

var _disposify2 = _interopRequireDefault(_disposify);

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let BusySignal = class BusySignal {

  constructor() {
    this.element = new _element2.default();
    this.registry = new _registry2.default();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.element);
    this.subscriptions.add(this.registry);

    this.registry.onDidUpdate(() => {
      this.element.update(this.registry.getActiveTitles(), this.registry.getOldTitles());
    });
  }
  attach(statusBar) {
    this.subscriptions.add((0, _disposify2.default)(statusBar.addRightTile({
      item: this.element,
      priority: 500
    })));
  }
  dispose() {
    this.subscriptions.dispose();
  }
};
exports.default = BusySignal;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiQnVzeVNpZ25hbCIsImNvbnN0cnVjdG9yIiwiZWxlbWVudCIsInJlZ2lzdHJ5Iiwic3Vic2NyaXB0aW9ucyIsImFkZCIsIm9uRGlkVXBkYXRlIiwidXBkYXRlIiwiZ2V0QWN0aXZlVGl0bGVzIiwiZ2V0T2xkVGl0bGVzIiwiYXR0YWNoIiwic3RhdHVzQmFyIiwiYWRkUmlnaHRUaWxlIiwiaXRlbSIsInByaW9yaXR5IiwiZGlzcG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztJQUVxQkEsVSxHQUFOLE1BQU1BLFVBQU4sQ0FBaUI7O0FBSzlCQyxnQkFBYztBQUNaLFNBQUtDLE9BQUwsR0FBZSx1QkFBZjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0Isd0JBQWhCO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQiwrQkFBckI7O0FBRUEsU0FBS0EsYUFBTCxDQUFtQkMsR0FBbkIsQ0FBdUIsS0FBS0gsT0FBNUI7QUFDQSxTQUFLRSxhQUFMLENBQW1CQyxHQUFuQixDQUF1QixLQUFLRixRQUE1Qjs7QUFFQSxTQUFLQSxRQUFMLENBQWNHLFdBQWQsQ0FBMEIsTUFBTTtBQUM5QixXQUFLSixPQUFMLENBQWFLLE1BQWIsQ0FBb0IsS0FBS0osUUFBTCxDQUFjSyxlQUFkLEVBQXBCLEVBQXFELEtBQUtMLFFBQUwsQ0FBY00sWUFBZCxFQUFyRDtBQUNELEtBRkQ7QUFHRDtBQUNEQyxTQUFPQyxTQUFQLEVBQTBCO0FBQ3hCLFNBQUtQLGFBQUwsQ0FBbUJDLEdBQW5CLENBQXVCLHlCQUFVTSxVQUFVQyxZQUFWLENBQXVCO0FBQ3REQyxZQUFNLEtBQUtYLE9BRDJDO0FBRXREWSxnQkFBVTtBQUY0QyxLQUF2QixDQUFWLENBQXZCO0FBSUQ7QUFDREMsWUFBVTtBQUNSLFNBQUtYLGFBQUwsQ0FBbUJXLE9BQW5CO0FBQ0Q7QUF6QjZCLEM7a0JBQVhmLFUiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IGRpc3Bvc2lmeSBmcm9tICdkaXNwb3NpZnknXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuL2VsZW1lbnQnXG5pbXBvcnQgUmVnaXN0cnkgZnJvbSAnLi9yZWdpc3RyeSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVzeVNpZ25hbCB7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIHJlZ2lzdHJ5OiBSZWdpc3RyeTtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBuZXcgRWxlbWVudCgpXG4gICAgdGhpcy5yZWdpc3RyeSA9IG5ldyBSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVsZW1lbnQpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5KVxuXG4gICAgdGhpcy5yZWdpc3RyeS5vbkRpZFVwZGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMucmVnaXN0cnkuZ2V0QWN0aXZlVGl0bGVzKCksIHRoaXMucmVnaXN0cnkuZ2V0T2xkVGl0bGVzKCkpXG4gICAgfSlcbiAgfVxuICBhdHRhY2goc3RhdHVzQmFyOiBPYmplY3QpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGRpc3Bvc2lmeShzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMuZWxlbWVudCxcbiAgICAgIHByaW9yaXR5OiA1MDAsXG4gICAgfSkpKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=