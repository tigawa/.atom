Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _sbEventKit = require('sb-event-kit');

var _delegate = require('./delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Panel = class Panel {

  constructor() {
    const element = document.createElement('div');
    const panel = atom.workspace.addBottomPanel({
      item: element,
      visible: true,
      priority: 500
    });
    this.delegate = new _delegate2.default(panel);
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    _reactDom2.default.render(_react2.default.createElement(_component2.default, { delegate: this.delegate }), element);
    this.subscriptions.add(function () {
      panel.destroy();
    });
    this.subscriptions.add(this.delegate);
  }
  update(messages) {
    this.delegate.update(messages);
  }
  dispose() {
    this.subscriptions.dispose();
  }
};
exports.default = Panel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlBhbmVsIiwiY29uc3RydWN0b3IiLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicGFuZWwiLCJhdG9tIiwid29ya3NwYWNlIiwiYWRkQm90dG9tUGFuZWwiLCJpdGVtIiwidmlzaWJsZSIsInByaW9yaXR5IiwiZGVsZWdhdGUiLCJzdWJzY3JpcHRpb25zIiwicmVuZGVyIiwiYWRkIiwiZGVzdHJveSIsInVwZGF0ZSIsIm1lc3NhZ2VzIiwiZGlzcG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7Ozs7O0lBR3FCQSxLLEdBQU4sTUFBTUEsS0FBTixDQUFZOztBQUl6QkMsZ0JBQWM7QUFDWixVQUFNQyxVQUFVQyxTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQWhCO0FBQ0EsVUFBTUMsUUFBUUMsS0FBS0MsU0FBTCxDQUFlQyxjQUFmLENBQThCO0FBQzFDQyxZQUFNUCxPQURvQztBQUUxQ1EsZUFBUyxJQUZpQztBQUcxQ0MsZ0JBQVU7QUFIZ0MsS0FBOUIsQ0FBZDtBQUtBLFNBQUtDLFFBQUwsR0FBZ0IsdUJBQWFQLEtBQWIsQ0FBaEI7QUFDQSxTQUFLUSxhQUFMLEdBQXFCLHFDQUFyQjs7QUFFQSx1QkFBU0MsTUFBVCxDQUFnQixxREFBVyxVQUFVLEtBQUtGLFFBQTFCLEdBQWhCLEVBQXdEVixPQUF4RDtBQUNBLFNBQUtXLGFBQUwsQ0FBbUJFLEdBQW5CLENBQXVCLFlBQVc7QUFDaENWLFlBQU1XLE9BQU47QUFDRCxLQUZEO0FBR0EsU0FBS0gsYUFBTCxDQUFtQkUsR0FBbkIsQ0FBdUIsS0FBS0gsUUFBNUI7QUFDRDtBQUNESyxTQUFPQyxRQUFQLEVBQTZDO0FBQzNDLFNBQUtOLFFBQUwsQ0FBY0ssTUFBZCxDQUFxQkMsUUFBckI7QUFDRDtBQUNEQyxZQUFVO0FBQ1IsU0FBS04sYUFBTCxDQUFtQk0sT0FBbkI7QUFDRDtBQXpCd0IsQztrQkFBTm5CLEsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcblxuaW1wb3J0IERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50J1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhbmVsIHtcbiAgZGVsZWdhdGU6IERlbGVnYXRlO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoe1xuICAgICAgaXRlbTogZWxlbWVudCxcbiAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICBwcmlvcml0eTogNTAwLFxuICAgIH0pXG4gICAgdGhpcy5kZWxlZ2F0ZSA9IG5ldyBEZWxlZ2F0ZShwYW5lbClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBSZWFjdERPTS5yZW5kZXIoPENvbXBvbmVudCBkZWxlZ2F0ZT17dGhpcy5kZWxlZ2F0ZX0gLz4sIGVsZW1lbnQpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChmdW5jdGlvbigpIHtcbiAgICAgIHBhbmVsLmRlc3Ryb3koKVxuICAgIH0pXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmRlbGVnYXRlKVxuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pOiB2b2lkIHtcbiAgICB0aGlzLmRlbGVnYXRlLnVwZGF0ZShtZXNzYWdlcylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19