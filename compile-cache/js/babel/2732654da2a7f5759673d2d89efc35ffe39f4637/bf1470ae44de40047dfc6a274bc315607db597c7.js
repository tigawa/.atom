Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _sbConfigFile = require('sb-config-file');

var _sbConfigFile2 = _interopRequireDefault(_sbConfigFile);

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _atom = require('atom');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let ToggleProviders = class ToggleProviders {

  constructor(action, providers) {
    this.action = action;
    this.config = null;
    this.emitter = new _atom.Emitter();
    this.providers = providers;
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
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
  getItems() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const disabled = yield (yield _this2.getConfig()).get('disabled');
      if (_this2.action === 'disable') {
        return _this2.providers.filter(function (name) {
          return !disabled.includes(name);
        });
      }
      return disabled;
    })();
  }
  process(name) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const config = yield _this3.getConfig();
      const disabled = yield config.get('disabled');
      if (_this3.action === 'disable') {
        disabled.push(name);
        _this3.emitter.emit('did-disable', name);
      } else {
        const index = disabled.indexOf(name);
        if (index !== -1) {
          disabled.splice(index, 1);
        }
      }
      yield _this3.config.set('disabled', disabled);
    })();
  }
  show() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const selectListView = new _atomSelectList2.default({
        items: yield _this4.getItems(),
        emptyMessage: 'No matches found',
        filterKeyForItem: function (item) {
          return item;
        },
        elementForItem: function (item) {
          const li = document.createElement('li');
          li.textContent = item;
          return li;
        },
        didConfirmSelection: function (item) {
          _this4.process(item).catch(function (e) {
            return console.error('[Linter] Unable to process toggle:', e);
          }).then(function () {
            return _this4.dispose();
          });
        },
        didCancelSelection: function () {
          _this4.dispose();
        }
      });
      const panel = atom.workspace.addModalPanel({ item: selectListView });

      selectListView.focus();
      _this4.subscriptions.add(new _atom.Disposable(function () {
        panel.destroy();
      }));
    })();
  }
  onDidDispose(callback) {
    return this.emitter.on('did-dispose', callback);
  }
  onDidDisable(callback) {
    return this.emitter.on('did-disable', callback);
  }
  dispose() {
    this.emitter.emit('did-dispose');
    this.subscriptions.dispose();
  }
};
exports.default = ToggleProviders;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvZ2dsZS12aWV3LmpzIl0sIm5hbWVzIjpbIlRvZ2dsZVByb3ZpZGVycyIsImNvbnN0cnVjdG9yIiwiYWN0aW9uIiwicHJvdmlkZXJzIiwiY29uZmlnIiwiZW1pdHRlciIsInN1YnNjcmlwdGlvbnMiLCJhZGQiLCJnZXRDb25maWciLCJnZXRJdGVtcyIsImRpc2FibGVkIiwiZ2V0IiwiZmlsdGVyIiwiaW5jbHVkZXMiLCJuYW1lIiwicHJvY2VzcyIsInB1c2giLCJlbWl0IiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwic2V0Iiwic2hvdyIsInNlbGVjdExpc3RWaWV3IiwiaXRlbXMiLCJlbXB0eU1lc3NhZ2UiLCJmaWx0ZXJLZXlGb3JJdGVtIiwiaXRlbSIsImVsZW1lbnRGb3JJdGVtIiwibGkiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsImRpZENvbmZpcm1TZWxlY3Rpb24iLCJjYXRjaCIsImNvbnNvbGUiLCJlcnJvciIsImUiLCJ0aGVuIiwiZGlzcG9zZSIsImRpZENhbmNlbFNlbGVjdGlvbiIsInBhbmVsIiwiYXRvbSIsIndvcmtzcGFjZSIsImFkZE1vZGFsUGFuZWwiLCJmb2N1cyIsImRlc3Ryb3kiLCJvbkRpZERpc3Bvc2UiLCJjYWxsYmFjayIsIm9uIiwib25EaWREaXNhYmxlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7O0lBSXFCQSxlLEdBQU4sTUFBTUEsZUFBTixDQUFzQjs7QUFPbkNDLGNBQVlDLE1BQVosRUFBa0NDLFNBQWxDLEVBQTREO0FBQzFELFNBQUtELE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtFLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLG1CQUFmO0FBQ0EsU0FBS0YsU0FBTCxHQUFpQkEsU0FBakI7QUFDQSxTQUFLRyxhQUFMLEdBQXFCLCtCQUFyQjs7QUFFQSxTQUFLQSxhQUFMLENBQW1CQyxHQUFuQixDQUF1QixLQUFL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aEIsRUFBK0JELFFBQS9CLENBQVA7QUFDRDtBQUNEVCxZQUFVO0FBQ1IsU0FBS2xDLE9BQUwsQ0FBYVksSUFBYixDQUFrQixhQUFsQjtBQUNBLFNBQUtYLGFBQUwsQ0FBbUJpQyxPQUFuQjtBQUNEO0FBNUVrQyxDO2tCQUFoQnZDLGUiLCJmaWxlIjoidG9nZ2xlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgQ29uZmlnRmlsZSBmcm9tICdzYi1jb25maWctZmlsZSdcbmltcG9ydCBTZWxlY3RMaXN0VmlldyBmcm9tICdhdG9tLXNlbGVjdC1saXN0J1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBnZXRDb25maWdGaWxlIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG50eXBlIFRvZ2dsZUFjdGlvbiA9ICdlbmFibGUnIHwgJ2Rpc2FibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvZ2dsZVByb3ZpZGVycyB7XG4gIGFjdGlvbjogVG9nZ2xlQWN0aW9uO1xuICBjb25maWc6IENvbmZpZ0ZpbGU7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIHByb3ZpZGVyczogQXJyYXk8c3RyaW5nPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihhY3Rpb246IFRvZ2dsZUFjdGlvbiwgcHJvdmlkZXJzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgdGhpcy5hY3Rpb24gPSBhY3Rpb25cbiAgICB0aGlzLmNvbmZpZyA9IG51bGxcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5wcm92aWRlcnMgPSBwcm92aWRlcnNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICBhc3luYyBnZXRDb25maWcoKTogUHJvbWlzZTxDb25maWdGaWxlPiB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZykge1xuICAgICAgdGhpcy5jb25maWcgPSBhd2FpdCBnZXRDb25maWdGaWxlKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnXG4gIH1cbiAgYXN5bmMgZ2V0SXRlbXMoKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gICAgY29uc3QgZGlzYWJsZWQgPSBhd2FpdCAoYXdhaXQgdGhpcy5nZXRDb25maWcoKSkuZ2V0KCdkaXNhYmxlZCcpXG4gICAgaWYgKHRoaXMuYWN0aW9uID09PSAnZGlzYWJsZScpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVycy5maWx0ZXIobmFtZSA9PiAhZGlzYWJsZWQuaW5jbHVkZXMobmFtZSkpXG4gICAgfVxuICAgIHJldHVybiBkaXNhYmxlZFxuICB9XG4gIGFzeW5jIHByb2Nlc3MobmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgdGhpcy5nZXRDb25maWcoKVxuICAgIGNvbnN0IGRpc2FibGVkOiBBcnJheTxzdHJpbmc+ID0gYXdhaXQgY29uZmlnLmdldCgnZGlzYWJsZWQnKVxuICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2Rpc2FibGUnKSB7XG4gICAgICBkaXNhYmxlZC5wdXNoKG5hbWUpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRpc2FibGUnLCBuYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IGRpc2FibGVkLmluZGV4T2YobmFtZSlcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgZGlzYWJsZWQuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCB0aGlzLmNvbmZpZy5zZXQoJ2Rpc2FibGVkJywgZGlzYWJsZWQpXG4gIH1cbiAgYXN5bmMgc2hvdygpIHtcbiAgICBjb25zdCBzZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtczogYXdhaXQgdGhpcy5nZXRJdGVtcygpLFxuICAgICAgZW1wdHlNZXNzYWdlOiAnTm8gbWF0Y2hlcyBmb3VuZCcsXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBpdGVtID0+IGl0ZW0sXG4gICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW0pID0+IHtcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgIGxpLnRleHRDb250ZW50ID0gaXRlbVxuICAgICAgICByZXR1cm4gbGlcbiAgICAgIH0sXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbSkgPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3MoaXRlbSkuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKCdbTGludGVyXSBVbmFibGUgdG8gcHJvY2VzcyB0b2dnbGU6JywgZSkpLnRoZW4oKCkgPT4gdGhpcy5kaXNwb3NlKCkpXG4gICAgICB9LFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcG9zZSgpXG4gICAgICB9LFxuICAgIH0pXG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogc2VsZWN0TGlzdFZpZXcgfSlcblxuICAgIHNlbGVjdExpc3RWaWV3LmZvY3VzKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgcGFuZWwuZGVzdHJveSgpXG4gICAgfSkpXG4gIH1cbiAgb25EaWREaXNwb3NlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kaXNwb3NlJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWREaXNhYmxlKGNhbGxiYWNrOiAoKG5hbWU6IHN0cmluZykgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kaXNhYmxlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRpc3Bvc2UnKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19