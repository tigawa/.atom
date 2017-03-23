Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _viewList = require('./view-list');

var _viewList2 = _interopRequireDefault(_viewList);

var _providersList = require('./providers-list');

var _providersList2 = _interopRequireDefault(_providersList);

var _providersHighlight = require('./providers-highlight');

var _providersHighlight2 = _interopRequireDefault(_providersHighlight);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let Intentions = class Intentions {
  constructor() {
    var _this = this;

    this.active = null;
    this.commands = new _commands2.default();
    this.providersList = new _providersList2.default();
    this.providersHighlight = new _providersHighlight2.default();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.providersList);
    this.subscriptions.add(this.providersHighlight);

    this.commands.onListShow((() => {
      var _ref = _asyncToGenerator(function* (textEditor) {
        const results = yield _this.providersList.trigger(textEditor);
        if (!results.length) {
          return false;
        }

        const listView = new _viewList2.default();
        const subscriptions = new _atom.CompositeDisposable();

        listView.activate(textEditor, results);
        listView.onDidSelect(function (intention) {
          intention.selected();
          subscriptions.dispose();
        });

        subscriptions.add(listView);
        subscriptions.add(new _atom.Disposable(function () {
          if (_this.active === subscriptions) {
            _this.active = null;
          }
        }));
        subscriptions.add(_this.commands.onListMove(function (movement) {
          listView.move(movement);
        }));
        subscriptions.add(_this.commands.onListConfirm(function () {
          listView.select();
        }));
        subscriptions.add(_this.commands.onListHide(function () {
          subscriptions.dispose();
        }));
        _this.active = subscriptions;
        return true;
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());
    this.commands.onHighlightsShow((() => {
      var _ref2 = _asyncToGenerator(function* (textEditor) {
        const results = yield _this.providersHighlight.trigger(textEditor);
        if (!results.length) {
          return false;
        }

        const painted = _this.providersHighlight.paint(textEditor, results);
        const subscriptions = new _atom.CompositeDisposable();

        subscriptions.add(new _atom.Disposable(function () {
          if (_this.active === subscriptions) {
            _this.active = null;
          }
        }));
        subscriptions.add(_this.commands.onHighlightsHide(function () {
          subscriptions.dispose();
        }));
        subscriptions.add(painted);
        _this.active = subscriptions;

        return true;
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })());
  }
  activate() {
    this.commands.activate();
  }
  consumeListProvider(provider) {
    this.providersList.addProvider(provider);
  }
  deleteListProvider(provider) {
    this.providersList.deleteProvider(provider);
  }
  consumeHighlightProvider(provider) {
    this.providersHighlight.addProvider(provider);
  }
  deleteHighlightProvider(provider) {
    this.providersHighlight.deleteProvider(provider);
  }
  dispose() {
    this.subscriptions.dispose();
    if (this.active) {
      this.active.dispose();
    }
  }
};
exports.default = Intentions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiSW50ZW50aW9ucyIsImNvbnN0cnVjdG9yIiwiYWN0aXZlIiwiY29tbWFuZHMiLCJwcm92aWRlcnNMaXN0IiwicHJvdmlkZXJzSGlnaGxpZ2h0Iiwic3Vic2NyaXB0aW9ucyIsImFkZCIsIm9uTGlzdFNob3ciLCJ0ZXh0RWRpdG9yIiwicmVzdWx0cyIsInRyaWdnZXIiLCJsZW5ndGgiLCJsaXN0VmlldyIsImFjdGl2YXRlIiwib25EaWRTZWxlY3QiLCJpbnRlbnRpb24iLCJzZWxlY3RlZCIsImRpc3Bvc2UiLCJvbkxpc3RNb3ZlIiwibW92ZW1lbnQiLCJtb3ZlIiwib25MaXN0Q29uZmlybSIsInNlbGVjdCIsIm9uTGlzdEhpZGUiLCJvbkhpZ2hsaWdodHNTaG93IiwicGFpbnRlZCIsInBhaW50Iiwib25IaWdobGlnaHRzSGlkZSIsImNvbnN1bWVMaXN0UHJvdmlkZXIiLCJwcm92aWRlciIsImFkZFByb3ZpZGVyIiwiZGVsZXRlTGlzdFByb3ZpZGVyIiwiZGVsZXRlUHJvdmlkZXIiLCJjb25zdW1lSGlnaGxpZ2h0UHJvdmlkZXIiLCJkZWxldGVIaWdobGlnaHRQcm92aWRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFHcUJBLFUsR0FBTixNQUFNQSxVQUFOLENBQWlCO0FBTTlCQyxnQkFBYztBQUFBOztBQUNaLFNBQUtDLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQix3QkFBaEI7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLDZCQUFyQjtBQUNBLFNBQUtDLGtCQUFMLEdBQTBCLGtDQUExQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsK0JBQXJCOztBQUVBLFNBQUtBLGFBQUwsQ0FBbUJDLEdBQW5CLENBQXVCLEtBQUtKLFFBQTVCO0FBQ0EsU0FBS0csYUFBTCxDQUFtQkMsR0FBbkIsQ0FBdUIsS0FBS0gsYUFBNUI7QUFDQSxTQUFLRSxhQUFM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V0FBeEIsQ0FBb0NELFFBQXBDO0FBQ0Q7QUFDREssMEJBQXdCTCxRQUF4QixFQUFxRDtBQUNuRCxTQUFLekIsa0JBQUwsQ0FBd0I0QixjQUF4QixDQUF1Q0gsUUFBdkM7QUFDRDtBQUNEWixZQUFVO0FBQ1IsU0FBS1osYUFBTCxDQUFtQlksT0FBbkI7QUFDQSxRQUFJLEtBQUtoQixNQUFULEVBQWlCO0FBQ2YsV0FBS0EsTUFBTCxDQUFZZ0IsT0FBWjtBQUNEO0FBQ0Y7QUE3RjZCLEM7a0JBQVhsQixVIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vY29tbWFuZHMnXG5pbXBvcnQgTGlzdFZpZXcgZnJvbSAnLi92aWV3LWxpc3QnXG5pbXBvcnQgUHJvdmlkZXJzTGlzdCBmcm9tICcuL3Byb3ZpZGVycy1saXN0J1xuaW1wb3J0IFByb3ZpZGVyc0hpZ2hsaWdodCBmcm9tICcuL3Byb3ZpZGVycy1oaWdobGlnaHQnXG5pbXBvcnQgdHlwZSB7IExpc3RQcm92aWRlciwgSGlnaGxpZ2h0UHJvdmlkZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlbnRpb25zIHtcbiAgYWN0aXZlOiA/RGlzcG9zYWJsZTtcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuICBwcm92aWRlcnNMaXN0OiBQcm92aWRlcnNMaXN0O1xuICBwcm92aWRlcnNIaWdobGlnaHQ6IFByb3ZpZGVyc0hpZ2hsaWdodDtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgdGhpcy5wcm92aWRlcnNMaXN0ID0gbmV3IFByb3ZpZGVyc0xpc3QoKVxuICAgIHRoaXMucHJvdmlkZXJzSGlnaGxpZ2h0ID0gbmV3IFByb3ZpZGVyc0hpZ2hsaWdodCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5wcm92aWRlcnNMaXN0KVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5wcm92aWRlcnNIaWdobGlnaHQpXG5cbiAgICB0aGlzLmNvbW1hbmRzLm9uTGlzdFNob3coYXN5bmMgdGV4dEVkaXRvciA9PiB7XG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5wcm92aWRlcnNMaXN0LnRyaWdnZXIodGV4dEVkaXRvcilcbiAgICAgIGlmICghcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxpc3RWaWV3ID0gbmV3IExpc3RWaWV3KClcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgIGxpc3RWaWV3LmFjdGl2YXRlKHRleHRFZGl0b3IsIHJlc3VsdHMpXG4gICAgICBsaXN0Vmlldy5vbkRpZFNlbGVjdChmdW5jdGlvbihpbnRlbnRpb24pIHtcbiAgICAgICAgaW50ZW50aW9uLnNlbGVjdGVkKClcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH0pXG5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGxpc3RWaWV3KVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmUgPT09IHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGxcbiAgICAgICAgfVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzLm9uTGlzdE1vdmUoZnVuY3Rpb24obW92ZW1lbnQpIHtcbiAgICAgICAgbGlzdFZpZXcubW92ZShtb3ZlbWVudClcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5jb21tYW5kcy5vbkxpc3RDb25maXJtKGZ1bmN0aW9uKCkge1xuICAgICAgICBsaXN0Vmlldy5zZWxlY3QoKVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzLm9uTGlzdEhpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICB9KSlcbiAgICAgIHRoaXMuYWN0aXZlID0gc3Vic2NyaXB0aW9uc1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25IaWdobGlnaHRzU2hvdyhhc3luYyB0ZXh0RWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLnByb3ZpZGVyc0hpZ2hsaWdodC50cmlnZ2VyKHRleHRFZGl0b3IpXG4gICAgICBpZiAoIXJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwYWludGVkID0gdGhpcy5wcm92aWRlcnNIaWdobGlnaHQucGFpbnQodGV4dEVkaXRvciwgcmVzdWx0cylcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgICAgIH1cbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5jb21tYW5kcy5vbkhpZ2hsaWdodHNIaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChwYWludGVkKVxuICAgICAgdGhpcy5hY3RpdmUgPSBzdWJzY3JpcHRpb25zXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgfVxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmNvbW1hbmRzLmFjdGl2YXRlKClcbiAgfVxuICBjb25zdW1lTGlzdFByb3ZpZGVyKHByb3ZpZGVyOiBMaXN0UHJvdmlkZXIpIHtcbiAgICB0aGlzLnByb3ZpZGVyc0xpc3QuYWRkUHJvdmlkZXIocHJvdmlkZXIpXG4gIH1cbiAgZGVsZXRlTGlzdFByb3ZpZGVyKHByb3ZpZGVyOiBMaXN0UHJvdmlkZXIpIHtcbiAgICB0aGlzLnByb3ZpZGVyc0xpc3QuZGVsZXRlUHJvdmlkZXIocHJvdmlkZXIpXG4gIH1cbiAgY29uc3VtZUhpZ2hsaWdodFByb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcikge1xuICAgIHRoaXMucHJvdmlkZXJzSGlnaGxpZ2h0LmFkZFByb3ZpZGVyKHByb3ZpZGVyKVxuICB9XG4gIGRlbGV0ZUhpZ2hsaWdodFByb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcikge1xuICAgIHRoaXMucHJvdmlkZXJzSGlnaGxpZ2h0LmRlbGV0ZVByb3ZpZGVyKHByb3ZpZGVyKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5hY3RpdmUuZGlzcG9zZSgpXG4gICAgfVxuICB9XG59XG4iXX0=