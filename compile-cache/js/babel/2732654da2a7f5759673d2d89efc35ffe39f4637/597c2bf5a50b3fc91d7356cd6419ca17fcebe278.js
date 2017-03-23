Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  activate() {
    this.intentions = new _main2.default();
    this.intentions.activate();
  },
  deactivate() {
    this.intentions.dispose();
  },
  consumeListIntentions(provider) {
    const providers = [].concat(provider);
    providers.forEach(entry => {
      this.intentions.consumeListProvider(entry);
    });
    return new _atom.Disposable(() => {
      providers.forEach(entry => {
        this.intentions.deleteListProvider(entry);
      });
    });
  },
  consumeHighlightIntentions(provider) {
    const providers = [].concat(provider);
    providers.forEach(entry => {
      this.intentions.consumeHighlightProvider(entry);
    });
    return new _atom.Disposable(() => {
      providers.forEach(entry => {
        this.intentions.deleteHighlightProvider(entry);
      });
    });
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImFjdGl2YXRlIiwiaW50ZW50aW9ucyIsImRlYWN0aXZhdGUiLCJkaXNwb3NlIiwiY29uc3VtZUxpc3RJbnRlbnRpb25zIiwicHJvdmlkZXIiLCJwcm92aWRlcnMiLCJjb25jYXQiLCJmb3JFYWNoIiwiZW50cnkiLCJjb25zdW1lTGlzdFByb3ZpZGVyIiwiZGVsZXRlTGlzdFByb3ZpZGVyIiwiY29uc3VtZUhpZ2hsaWdodEludGVudGlvbnMiLCJjb25zdW1lSGlnaGxpZ2h0UHJvdmlkZXIiLCJkZWxldGVIaWdobGlnaHRQcm92aWRlciJdLCJtYXBwaW5ncyI6Ijs7OztBQUVBOztBQUNBOzs7Ozs7a0JBR2U7QUFDYkEsYUFBVztBQUNULFNBQUtDLFVBQUwsR0FBa0Isb0JBQWxCO0FBQ0EsU0FBS0EsVUFBTCxDQUFnQkQsUUFBaEI7QUFDRCxHQUpZO0FBS2JFLGVBQWE7QUFDWCxTQUFLRCxVQUFMLENBQWdCRSxPQUFoQjtBQUNELEdBUFk7QUFRYkMsd0JBQXNCQyxRQUF0QixFQUFvRTtBQUNsRSxVQUFNQyxZQUFZLEdBQUdDLE1BQUgsQ0FBVUYsUUFBVixDQUFsQjtBQUNBQyxjQUFVRSxPQUFWLENBQWtCQyxTQUFTO0FBQ3pCLFdBQUtSLFVBQUwsQ0FBZ0JTLG1CQUFoQixDQUFvQ0QsS0FBcEM7QUFDRCxLQUZEO0FBR0EsV0FBTyxxQkFBZSxNQUFNO0FBQzFCSCxnQkFBVUUsT0FBVixDQUFrQkMsU0FBUztBQUN6QixhQUFLUixVQUFMLENBQWdCVSxrQkFBaEIsQ0FBbUNGLEtBQW5DO0FBQ0QsT0FGRDtBQUdELEtBSk0sQ0FBUDtBQUtELEdBbEJZO0FBbUJiRyw2QkFBMkJQLFFBQTNCLEVBQW1GO0FBQ2pGLFVBQU1DLFlBQVksR0FBR0MsTUFBSCxDQUFVRixRQUFWLENBQWxCO0FBQ0FDLGNBQVVFLE9BQVYsQ0FBa0JDLFNBQVM7QUFDekIsV0FBS1IsVUFBTCxDQUFnQlksd0JBQWhCLENBQXlDSixLQUF6QztBQUNELEtBRkQ7QUFHQSxXQUFPLHFCQUFlLE1BQU07QUFDMUJILGdCQUFVRSxPQUFWLENBQWtCQyxTQUFTO0FBQ3pCLGFBQUtSLFVBQUwsQ0FBZ0JhLHVCQUFoQixDQUF3Q0wsS0FBeEM7QUFDRCxPQUZEO0FBR0QsS0FKTSxDQUFQO0FBS0Q7QUE3QlksQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IEludGVudGlvbnMgZnJvbSAnLi9tYWluJ1xuaW1wb3J0IHR5cGUgeyBMaXN0UHJvdmlkZXIsIEhpZ2hsaWdodFByb3ZpZGVyIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmludGVudGlvbnMgPSBuZXcgSW50ZW50aW9ucygpXG4gICAgdGhpcy5pbnRlbnRpb25zLmFjdGl2YXRlKClcbiAgfSxcbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmludGVudGlvbnMuZGlzcG9zZSgpXG4gIH0sXG4gIGNvbnN1bWVMaXN0SW50ZW50aW9ucyhwcm92aWRlcjogTGlzdFByb3ZpZGVyIHwgQXJyYXk8TGlzdFByb3ZpZGVyPikge1xuICAgIGNvbnN0IHByb3ZpZGVycyA9IFtdLmNvbmNhdChwcm92aWRlcilcbiAgICBwcm92aWRlcnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICB0aGlzLmludGVudGlvbnMuY29uc3VtZUxpc3RQcm92aWRlcihlbnRyeSlcbiAgICB9KVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBwcm92aWRlcnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgIHRoaXMuaW50ZW50aW9ucy5kZWxldGVMaXN0UHJvdmlkZXIoZW50cnkpXG4gICAgICB9KVxuICAgIH0pXG4gIH0sXG4gIGNvbnN1bWVIaWdobGlnaHRJbnRlbnRpb25zKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlciB8IEFycmF5PEhpZ2hsaWdodFByb3ZpZGVyPikge1xuICAgIGNvbnN0IHByb3ZpZGVycyA9IFtdLmNvbmNhdChwcm92aWRlcilcbiAgICBwcm92aWRlcnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICB0aGlzLmludGVudGlvbnMuY29uc3VtZUhpZ2hsaWdodFByb3ZpZGVyKGVudHJ5KVxuICAgIH0pXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHByb3ZpZGVycy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgdGhpcy5pbnRlbnRpb25zLmRlbGV0ZUhpZ2hsaWdodFByb3ZpZGVyKGVudHJ5KVxuICAgICAgfSlcbiAgICB9KVxuICB9LFxufVxuIl19