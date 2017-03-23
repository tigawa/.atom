Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _validate = require('./validate');

let UIRegistry = class UIRegistry {

  constructor() {
    this.providers = new Set();
    this.subscriptions = new _atom.CompositeDisposable();
  }
  add(ui) {
    if (!this.providers.has(ui) && (0, _validate.ui)(ui)) {
      this.subscriptions.add(ui);
      this.providers.add(ui);
    }
  }
  delete(provider) {
    if (this.providers.has(provider)) {
      provider.dispose();
      this.providers.delete(provider);
    }
  }
  render(messages) {
    this.providers.forEach(function (provider) {
      provider.render(messages);
    });
  }
  didBeginLinting(linter, filePath = null) {
    this.providers.forEach(function (provider) {
      provider.didBeginLinting(linter, filePath);
    });
  }
  didFinishLinting(linter, filePath = null) {
    this.providers.forEach(function (provider) {
      provider.didFinishLinting(linter, filePath);
    });
  }
  dispose() {
    this.providers.clear();
    this.subscriptions.dispose();
  }
};
exports.default = UIRegistry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbIlVJUmVnaXN0cnkiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVycyIsIlNldCIsInN1YnNjcmlwdGlvbnMiLCJhZGQiLCJ1aSIsImhhcyIsImRlbGV0ZSIsInByb3ZpZGVyIiwiZGlzcG9zZSIsInJlbmRlciIsIm1lc3NhZ2VzIiwiZm9yRWFjaCIsImRpZEJlZ2luTGludGluZyIsImxpbnRlciIsImZpbGVQYXRoIiwiZGlkRmluaXNoTGludGluZyIsImNsZWFyIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztBQUNBOztJQUdxQkEsVSxHQUFOLE1BQU1BLFVBQU4sQ0FBaUI7O0FBSTlCQyxnQkFBYztBQUNaLFNBQUtDLFNBQUwsR0FBaUIsSUFBSUMsR0FBSixFQUFqQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsK0JBQXJCO0FBQ0Q7QUFDREMsTUFBSUMsRUFBSixFQUFZO0FBQ1YsUUFBSSxDQUFDLEtBQUtKLFNBQUwsQ0FBZUssR0FBZixDQUFtQkQsRUFBbkIsQ0FBRCxJQUEyQixrQkFBV0EsRUFBWCxDQUEvQixFQUErQztBQUM3QyxXQUFLRixhQUFMLENBQW1CQyxHQUFuQixDQUF1QkMsRUFBdkI7QUFDQSxXQUFLSixTQUFMLENBQWVHLEdBQWYsQ0FBbUJDLEVBQW5CO0FBQ0Q7QUFDRjtBQUNERSxTQUFPQyxRQUFQLEVBQXFCO0FBQ25CLFFBQUksS0FBS1AsU0FBTCxDQUFlSyxHQUFmLENBQW1CRSxRQUFuQixDQUFKLEVBQWtDO0FBQ2hDQSxlQUFTQyxPQUFUO0FBQ0EsV0FBS1IsU0FBTCxDQUFlTSxNQUFmLENBQXNCQyxRQUF0QjtBQUNEO0FBQ0Y7QUFDREUsU0FBT0MsUUFBUCxFQUFnQztBQUM5QixTQUFLVixTQUFMLENBQWVXLE9BQWYsQ0FBdUIsVUFBU0osUUFBVCxFQUFtQjtBQUN4Q0EsZUFBU0UsTUFBVCxDQUFnQkMsUUFBaEI7QUFDRCxLQUZEO0FBR0Q7QUFDREUsa0JBQWdCQyxNQUFoQixFQUFnQ0MsV0FBb0IsSUFBcEQsRUFBMEQ7QUFDeEQsU0FBS2QsU0FBTCxDQUFlVyxPQUFmLENBQXVCLFVBQVNKLFFBQVQsRUFBbUI7QUFDeENBLGVBQVNLLGVBQVQsQ0FBeUJDLE1BQXpCLEVBQWlDQyxRQUFqQztBQUNELEtBRkQ7QUFHRDtBQUNEQyxtQkFBaUJGLE1BQWpCLEVBQWlDQyxXQUFvQixJQUFyRCxFQUEyRDtBQUN6RCxTQUFLZCxTQUFMLENBQWVXLE9BQWYsQ0FBdUIsVUFBU0osUUFBVCxFQUFtQjtBQUN4Q0EsZUFBU1EsZ0JBQVQsQ0FBMEJGLE1BQTFCLEVBQWtDQyxRQUFsQztBQUNELEtBRkQ7QUFHRDtBQUNETixZQUFVO0FBQ1IsU0FBS1IsU0FBTCxDQUFlZ0IsS0FBZjtBQUNBLFNBQUtkLGFBQUwsQ0FBbUJNLE9BQW5CO0FBQ0Q7QUF0QzZCLEM7a0JBQVhWLFUiLCJmaWxlIjoidWktcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IHVpIGFzIHZhbGlkYXRlVUkgfSBmcm9tICcuL3ZhbGlkYXRlJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXIsIFVJLCBNZXNzYWdlc1BhdGNoIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVUlSZWdpc3RyeSB7XG4gIHByb3ZpZGVyczogU2V0PFVJPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb3ZpZGVycyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgfVxuICBhZGQodWk6IFVJKSB7XG4gICAgaWYgKCF0aGlzLnByb3ZpZGVycy5oYXModWkpICYmIHZhbGlkYXRlVUkodWkpKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHVpKVxuICAgICAgdGhpcy5wcm92aWRlcnMuYWRkKHVpKVxuICAgIH1cbiAgfVxuICBkZWxldGUocHJvdmlkZXI6IFVJKSB7XG4gICAgaWYgKHRoaXMucHJvdmlkZXJzLmhhcyhwcm92aWRlcikpIHtcbiAgICAgIHByb3ZpZGVyLmRpc3Bvc2UoKVxuICAgICAgdGhpcy5wcm92aWRlcnMuZGVsZXRlKHByb3ZpZGVyKVxuICAgIH1cbiAgfVxuICByZW5kZXIobWVzc2FnZXM6IE1lc3NhZ2VzUGF0Y2gpIHtcbiAgICB0aGlzLnByb3ZpZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG4gICAgICBwcm92aWRlci5yZW5kZXIobWVzc2FnZXMpXG4gICAgfSlcbiAgfVxuICBkaWRCZWdpbkxpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nID0gbnVsbCkge1xuICAgIHRoaXMucHJvdmlkZXJzLmZvckVhY2goZnVuY3Rpb24ocHJvdmlkZXIpIHtcbiAgICAgIHByb3ZpZGVyLmRpZEJlZ2luTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICAgIH0pXG4gIH1cbiAgZGlkRmluaXNoTGludGluZyhsaW50ZXI6IExpbnRlciwgZmlsZVBhdGg6ID9zdHJpbmcgPSBudWxsKSB7XG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlcikge1xuICAgICAgcHJvdmlkZXIuZGlkRmluaXNoTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICAgIH0pXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnByb3ZpZGVycy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=