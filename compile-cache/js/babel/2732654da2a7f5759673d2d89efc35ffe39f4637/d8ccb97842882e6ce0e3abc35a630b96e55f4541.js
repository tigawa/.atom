Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = greet;

var _coolTrim = require('cool-trim');

var _coolTrim2 = _interopRequireDefault(_coolTrim);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function greet() {
  return atom.notifications.addInfo('Welcome to Linter v2', {
    dismissable: true,
    description: _coolTrim2.default`
      Hi Linter user! 👋

      Linter has been upgraded to v2.

      Packages compatible with v1 will keep working on v2 for a long time.
      If you are a package author, I encourage you to upgrade your package to the Linter v2 API.

      You can read [the announcement post on my blog](http://steelbrain.me/2017/03/13/linter-v2-released.html).
    `
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdyZWV0LXYyLXdlbGNvbWUuanMiXSwibmFtZXMiOlsiZ3JlZXQiLCJhdG9tIiwibm90aWZpY2F0aW9ucyIsImFkZEluZm8iLCJkaXNtaXNzYWJsZSIsImRlc2NyaXB0aW9uIl0sIm1hcHBpbmdzIjoiOzs7a0JBSXdCQSxLOztBQUZ4Qjs7Ozs7O0FBRWUsU0FBU0EsS0FBVCxHQUFpQjtBQUM5QixTQUFPQyxLQUFLQyxhQUFMLENBQW1CQyxPQUFuQixDQUEyQixzQkFBM0IsRUFBbUQ7QUFDeERDLGlCQUFhLElBRDJDO0FBRXhEQyxpQkFBYSxrQkFBUzs7Ozs7Ozs7OztBQUZrQyxHQUFuRCxDQUFQO0FBYUQiLCJmaWxlIjoiZ3JlZXQtdjItd2VsY29tZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBjb29sVHJpbSBmcm9tICdjb29sLXRyaW0nXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdyZWV0KCkge1xuICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1dlbGNvbWUgdG8gTGludGVyIHYyJywge1xuICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgIGRlc2NyaXB0aW9uOiBjb29sVHJpbWBcbiAgICAgIEhpIExpbnRlciB1c2VyISDwn5GLXG5cbiAgICAgIExpbnRlciBoYXMgYmVlbiB1cGdyYWRlZCB0byB2Mi5cblxuICAgICAgUGFja2FnZXMgY29tcGF0aWJsZSB3aXRoIHYxIHdpbGwga2VlcCB3b3JraW5nIG9uIHYyIGZvciBhIGxvbmcgdGltZS5cbiAgICAgIElmIHlvdSBhcmUgYSBwYWNrYWdlIGF1dGhvciwgSSBlbmNvdXJhZ2UgeW91IHRvIHVwZ3JhZGUgeW91ciBwYWNrYWdlIHRvIHRoZSBMaW50ZXIgdjIgQVBJLlxuXG4gICAgICBZb3UgY2FuIHJlYWQgW3RoZSBhbm5vdW5jZW1lbnQgcG9zdCBvbiBteSBibG9nXShodHRwOi8vc3RlZWxicmFpbi5tZS8yMDE3LzAzLzEzL2xpbnRlci12Mi1yZWxlYXNlZC5odG1sKS5cbiAgICBgLFxuICB9KVxufVxuIl19