Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let MessageElement = class MessageElement extends _react2.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      description: '',
      descriptionShow: false
    }, this.descriptionLoading = false, _temp;
  }

  componentDidMount() {
    this.props.delegate.onShouldUpdate(() => {
      this.setState({});
    });
    this.props.delegate.onShouldExpand(() => {
      if (!this.state.descriptionShow) {
        this.toggleDescription();
      }
    });
    this.props.delegate.onShouldCollapse(() => {
      if (this.state.descriptionShow) {
        this.toggleDescription();
      }
    });
  }
  toggleDescription(result = null) {
    const newStatus = !this.state.descriptionShow;
    const description = this.state.description || this.props.message.description;

    if (!newStatus && !result) {
      this.setState({ descriptionShow: false });
      return;
    }
    if (typeof description === 'string' || result) {
      const descriptionToUse = (0, _marked2.default)(result || description);
      this.setState({ descriptionShow: true, description: descriptionToUse });
    } else if (typeof description === 'function') {
      this.setState({ descriptionShow: true });
      if (this.descriptionLoading) {
        return;
      }
      this.descriptionLoading = true;
      new Promise(function (resolve) {
        resolve(description());
      }).then(response => {
        if (typeof response !== 'string') {
          throw new Error(`Expected result to be string, got: ${typeof response}`);
        }
        this.toggleDescription(response);
      }).catch(error => {
        console.log('[Linter] Error getting descriptions', error);
        this.descriptionLoading = false;
        if (this.state.descriptionShow) {
          this.toggleDescription();
        }
      });
    } else {
      console.error('[Linter] Invalid description detected, expected string or function but got:', typeof description);
    }
  }
  render() {
    const { message, delegate } = this.props;

    return _react2.default.createElement(
      'linter-message',
      { 'class': message.severity },
      message.description && _react2.default.createElement(
        'a',
        { href: '#', onClick: () => this.toggleDescription() },
        _react2.default.createElement('span', { className: `icon linter-icon icon-${this.state.descriptionShow ? 'chevron-down' : 'chevron-right'}` })
      ),
      _react2.default.createElement(
        'linter-excerpt',
        null,
        delegate.showProviderName ? `${message.linterName}: ` : '',
        message.excerpt
      ),
      ' ',
      message.reference && message.reference.file && _react2.default.createElement(
        'a',
        { href: '#', onClick: () => (0, _helpers.visitMessage)(message, true) },
        _react2.default.createElement('span', { className: 'icon linter-icon icon-alignment-aligned-to' })
      ),
      _react2.default.createElement(
        'a',
        { href: '#', onClick: () => (0, _helpers.openExternally)(message) },
        _react2.default.createElement('span', { className: 'icon linter-icon icon-link' })
      ),
      this.state.descriptionShow && _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: this.state.description || 'Loading...' }, 'class': 'linter-line' })
    );
  }
};
exports.default = MessageElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lc3NhZ2UuanMiXSwibmFtZXMiOlsiTWVzc2FnZUVsZW1lbnQiLCJDb21wb25lbnQiLCJzdGF0ZSIsImRlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb25TaG93IiwiZGVzY3JpcHRpb25Mb2FkaW5nIiwiY29tcG9uZW50RGlkTW91bnQiLCJwcm9wcyIsImRlbGVnYXRlIiwib25TaG91bGRVcGRhdGUiLCJzZXRTdGF0ZSIsIm9uU2hvdWxkRXhwYW5kIiwidG9nZ2xlRGVzY3JpcHRpb24iLCJvblNob3VsZENvbGxhcHNlIiwicmVzdWx0IiwibmV3U3RhdHVzIiwibWVzc2FnZSIsImRlc2NyaXB0aW9uVG9Vc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRoZW4iLCJyZXNwb25zZSIsIkVycm9yIiwiY2F0Y2giLCJlcnJvciIsImNvbnNvbGUiLCJsb2ciLCJyZW5kZXIiLCJzZXZlcml0eSIsInNob3dQcm92aWRlck5hbWUiLCJsaW50ZXJOYW1lIiwiZXhjZXJwdCIsInJlZmVyZW5jZSIsImZpbGUiLCJfX2h0bWwiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUVBOzs7O0lBSXFCQSxjLEdBQU4sTUFBTUEsY0FBTixTQUE2QixnQkFBTUMsU0FBbkMsQ0FBNkM7QUFBQTtBQUFBOztBQUFBLHdDQUsxREMsS0FMMEQsR0FRdEQ7QUFDRkMsbUJBQWEsRUFEWDtBQUVGQyx1QkFBaUI7QUFGZixLQVJzRCxPQVkxREMsa0JBWjBELEdBWTVCLEtBWjRCO0FBQUE7O0FBYzFEQyxzQkFBb0I7QUFDbEIsU0FBS0MsS0FBTCxDQUFXQyxRQUFYLENBQW9CQyxjQUFwQixDQUFtQyxNQUFNO0FBQ3ZDLFdBQUtDLFFBQUwsQ0FBYyxFQUFkO0FBQ0QsS0FGRDtBQUdBLFNBQUtILEtBQUwsQ0FBV0MsUUFBWCxDQUFvQkcsY0FBcEIsQ0FBbUMsTUFBTTtBQUN2QyxVQUFJLENBQUMsS0FBS1QsS0FBTCxDQUFXRSxlQUFoQixFQUFpQztBQUMvQixhQUFLUSxpQkFBTDtBQUNE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QWYsQ0FBM0I7QUFDRSxnREFBTSxXQUFVLDRCQUFoQjtBQURGLE9BZk07QUFrQkosV0FBS2QsS0FBTCxDQUFXRSxlQUFYLElBQ0EsdUNBQUsseUJBQXlCLEVBQUU4QixRQUFRLEtBQUtoQyxLQUFMLENBQVdDLFdBQVgsSUFBMEIsWUFBcEMsRUFBOUIsRUFBa0YsU0FBTSxhQUF4RjtBQW5CSSxLQUFSO0FBc0JEO0FBekZ5RCxDO2tCQUF2Q0gsYyIsImZpbGUiOiJtZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnXG5cbmltcG9ydCB7IHZpc2l0TWVzc2FnZSwgb3BlbkV4dGVybmFsbHkgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgVG9vbHRpcERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZUVsZW1lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIG1lc3NhZ2U6IE1lc3NhZ2UsXG4gICAgZGVsZWdhdGU6IFRvb2x0aXBEZWxlZ2F0ZSxcbiAgfTtcbiAgc3RhdGU6IHtcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uU2hvdzogYm9vbGVhbixcbiAgfSA9IHtcbiAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgZGVzY3JpcHRpb25TaG93OiBmYWxzZSxcbiAgfTtcbiAgZGVzY3JpcHRpb25Mb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZFVwZGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZEV4cGFuZCgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuZGVzY3JpcHRpb25TaG93KSB7XG4gICAgICAgIHRoaXMudG9nZ2xlRGVzY3JpcHRpb24oKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZENvbGxhcHNlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmRlc2NyaXB0aW9uU2hvdykge1xuICAgICAgICB0aGlzLnRvZ2dsZURlc2NyaXB0aW9uKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHRvZ2dsZURlc2NyaXB0aW9uKHJlc3VsdDogP3N0cmluZyA9IG51bGwpIHtcbiAgICBjb25zdCBuZXdTdGF0dXMgPSAhdGhpcy5zdGF0ZS5kZXNjcmlwdGlvblNob3dcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHRoaXMuc3RhdGUuZGVzY3JpcHRpb24gfHwgdGhpcy5wcm9wcy5tZXNzYWdlLmRlc2NyaXB0aW9uXG5cbiAgICBpZiAoIW5ld1N0YXR1cyAmJiAhcmVzdWx0KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZGVzY3JpcHRpb25TaG93OiBmYWxzZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGVzY3JpcHRpb24gPT09ICdzdHJpbmcnIHx8IHJlc3VsdCkge1xuICAgICAgY29uc3QgZGVzY3JpcHRpb25Ub1VzZSA9IG1hcmtlZChyZXN1bHQgfHwgZGVzY3JpcHRpb24pXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZGVzY3JpcHRpb25TaG93OiB0cnVlLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25Ub1VzZSB9KVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlc2NyaXB0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZGVzY3JpcHRpb25TaG93OiB0cnVlIH0pXG4gICAgICBpZiAodGhpcy5kZXNjcmlwdGlvbkxvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLmRlc2NyaXB0aW9uTG9hZGluZyA9IHRydWVcbiAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHsgcmVzb2x2ZShkZXNjcmlwdGlvbigpKSB9KVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCByZXN1bHQgdG8gYmUgc3RyaW5nLCBnb3Q6ICR7dHlwZW9mIHJlc3BvbnNlfWApXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudG9nZ2xlRGVzY3JpcHRpb24ocmVzcG9uc2UpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW0xpbnRlcl0gRXJyb3IgZ2V0dGluZyBkZXNjcmlwdGlvbnMnLCBlcnJvcilcbiAgICAgICAgICB0aGlzLmRlc2NyaXB0aW9uTG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVzY3JpcHRpb25TaG93KSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZURlc2NyaXB0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tMaW50ZXJdIEludmFsaWQgZGVzY3JpcHRpb24gZGV0ZWN0ZWQsIGV4cGVjdGVkIHN0cmluZyBvciBmdW5jdGlvbiBidXQgZ290OicsIHR5cGVvZiBkZXNjcmlwdGlvbilcbiAgICB9XG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgZGVsZWdhdGUgfSA9IHRoaXMucHJvcHNcblxuICAgIHJldHVybiAoPGxpbnRlci1tZXNzYWdlIGNsYXNzPXttZXNzYWdlLnNldmVyaXR5fT5cbiAgICAgIHsgbWVzc2FnZS5kZXNjcmlwdGlvbiAmJiAoXG4gICAgICAgIDxhIGhyZWY9XCIjXCIgb25DbGljaz17KCkgPT4gdGhpcy50b2dnbGVEZXNjcmlwdGlvbigpfT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BpY29uIGxpbnRlci1pY29uIGljb24tJHt0aGlzLnN0YXRlLmRlc2NyaXB0aW9uU2hvdyA/ICdjaGV2cm9uLWRvd24nIDogJ2NoZXZyb24tcmlnaHQnfWB9Pjwvc3Bhbj5cbiAgICAgICAgPC9hPlxuICAgICAgKX1cbiAgICAgIDxsaW50ZXItZXhjZXJwdD5cbiAgICAgICAgeyBkZWxlZ2F0ZS5zaG93UHJvdmlkZXJOYW1lID8gYCR7bWVzc2FnZS5saW50ZXJOYW1lfTogYCA6ICcnIH1cbiAgICAgICAgeyBtZXNzYWdlLmV4Y2VycHQgfVxuICAgICAgPC9saW50ZXItZXhjZXJwdD57JyAnfVxuICAgICAgeyBtZXNzYWdlLnJlZmVyZW5jZSAmJiBtZXNzYWdlLnJlZmVyZW5jZS5maWxlICYmIChcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXsoKSA9PiB2aXNpdE1lc3NhZ2UobWVzc2FnZSwgdHJ1ZSl9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gbGludGVyLWljb24gaWNvbi1hbGlnbm1lbnQtYWxpZ25lZC10b1wiPjwvc3Bhbj5cbiAgICAgICAgPC9hPlxuICAgICAgKX1cbiAgICAgIDxhIGhyZWY9XCIjXCIgb25DbGljaz17KCkgPT4gb3BlbkV4dGVybmFsbHkobWVzc2FnZSl9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGxpbnRlci1pY29uIGljb24tbGlua1wiPjwvc3Bhbj5cbiAgICAgIDwvYT5cbiAgICAgIHsgdGhpcy5zdGF0ZS5kZXNjcmlwdGlvblNob3cgJiYgKFxuICAgICAgICA8ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogdGhpcy5zdGF0ZS5kZXNjcmlwdGlvbiB8fCAnTG9hZGluZy4uLicgfX0gY2xhc3M9XCJsaW50ZXItbGluZVwiPjwvZGl2PlxuICAgICAgKSB9XG4gICAgPC9saW50ZXItbWVzc2FnZT4pXG4gIH1cbn1cbiJdfQ==