Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NEWLINE = /\r\n|\n/;
let MESSAGE_NUMBER = 0;

let Message = class Message extends _react2.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      multiLineShow: false
    }, _temp;
  }

  componentDidMount() {
    this.props.delegate.onShouldUpdate(() => {
      this.setState({});
    });
    this.props.delegate.onShouldExpand(() => {
      this.setState({ multiLineShow: true });
    });
    this.props.delegate.onShouldCollapse(() => {
      this.setState({ multiLineShow: false });
    });
  }
  render() {
    return NEWLINE.test(this.props.message.text || '') ? this.renderMultiLine() : this.renderSingleLine();
  }
  renderSingleLine() {
    const { message, delegate } = this.props;

    const number = ++MESSAGE_NUMBER;
    const elementID = `linter-message-${number}`;
    const isElement = message.html && typeof message.html === 'object';
    if (isElement) {
      setImmediate(function () {
        const element = document.getElementById(elementID);
        if (element) {
          // $FlowIgnore: This is an HTML Element :\
          element.appendChild(message.html.cloneNode(true));
        } else {
          console.warn('[Linter] Unable to get element for mounted message', number, message);
        }
      });
    }

    return _react2.default.createElement(
      'linter-message',
      { 'class': message.severity },
      delegate.showProviderName ? `${message.linterName}: ` : '',
      _react2.default.createElement(
        'span',
        { id: elementID, dangerouslySetInnerHTML: !isElement && message.html ? { __html: message.html } : null },
        message.text
      ),
      ' ',
      _react2.default.createElement(
        'a',
        { href: '#', onClick: () => (0, _helpers.openExternally)(message) },
        _react2.default.createElement('span', { className: 'icon icon-link linter-icon' })
      )
    );
  }

  renderMultiLine() {
    const { message, delegate } = this.props;

    const text = message.text ? message.text.split(NEWLINE) : [];
    const chunks = text.map(entry => entry.trim()).map((entry, index) => entry.length && _react2.default.createElement(
      'span',
      { className: index !== 0 && 'linter-line' },
      entry
    )).filter(e => e);

    return _react2.default.createElement(
      'linter-message',
      { 'class': message.severity },
      _react2.default.createElement(
        'a',
        { href: '#', onClick: () => this.setState({ multiLineShow: !this.state.multiLineShow }) },
        _react2.default.createElement('span', { className: `icon linter-icon icon-${this.state.multiLineShow ? 'chevron-down' : 'chevron-right'}` })
      ),
      delegate.showProviderName ? `${message.linterName}: ` : '',
      chunks[0],
      ' ',
      _react2.default.createElement(
        'a',
        { href: '#', onClick: () => (0, _helpers.openExternally)(message) },
        _react2.default.createElement('span', { className: 'icon icon-link linter-icon' })
      ),
      this.state.multiLineShow && chunks.slice(1)
    );
  }
};
exports.default = Message;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lc3NhZ2UtbGVnYWN5LmpzIl0sIm5hbWVzIjpbIk5FV0xJTkUiLCJNRVNTQUdFX05VTUJFUiIsIk1lc3NhZ2UiLCJDb21wb25lbnQiLCJzdGF0ZSIsIm11bHRpTGluZVNob3ciLCJjb21wb25lbnREaWRNb3VudCIsInByb3BzIiwiZGVsZWdhdGUiLCJvblNob3VsZFVwZGF0ZSIsInNldFN0YXRlIiwib25TaG91bGRFeHBhbmQiLCJvblNob3VsZENvbGxhcHNlIiwicmVuZGVyIiwidGVzdCIsIm1lc3NhZ2UiLCJ0ZXh0IiwicmVuZGVyTXVsdGlMaW5lIiwicmVuZGVyU2luZ2xlTGluZSIsIm51bWJlciIsImVsZW1lbnRJRCIsImlzRWxlbWVudCIsImh0bWwiLCJzZXRJbW1lZGlhdGUiLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiY29uc29sZSIsIndhcm4iLCJzZXZlcml0eSIsInNob3dQcm92aWRlck5hbWUiLCJsaW50ZXJOYW1lIiwiX19odG1sIiwic3BsaXQiLCJjaHVua3MiLCJtYXAiLCJlbnRyeSIsInRyaW0iLCJpbmRleCIsImxlbmd0aCIsImZpbHRlciIsImUiLCJzbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBSUEsTUFBTUEsVUFBVSxTQUFoQjtBQUNBLElBQUlDLGlCQUFpQixDQUFyQjs7SUFFcUJDLE8sR0FBTixNQUFNQSxPQUFOLFNBQXNCLGdCQUFNQyxTQUE1QixDQUFzQztBQUFBO0FBQUE7O0FBQUEsd0NBS25EQyxLQUxtRCxHQU8vQztBQUNGQyxxQkFBZTtBQURiLEtBUCtDO0FBQUE7O0FBVW5EQyxzQkFBb0I7QUFDbEIsU0FBS0MsS0FBTCxDQUFXQyxRQUFYLENBQW9CQyxjQUFwQixDQUFtQyxNQUFNO0FBQ3ZDLFdBQUtDLFFBQUwsQ0FBYyxFQUFkO0FBQ0QsS0FGRDtBQUdBLFNBQUtILEtBQUwsQ0FBV0MsUUFBWCxDQUFvQkcsY0FB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QUFRa0IsVUFBVyxJQUFsRCxHQUF3RCxFQUpwRDtBQUtKRyxhQUFPLENBQVAsQ0FMSTtBQU1MLFNBTks7QUFPTjtBQUFBO0FBQUEsVUFBRyxNQUFLLEdBQVIsRUFBWSxTQUFTLE1BQU0sNkJBQWVyQixPQUFmLENBQTNCO0FBQ0UsZ0RBQU0sV0FBVSw0QkFBaEI7QUFERixPQVBNO0FBVUosV0FBS1gsS0FBTCxDQUFXQyxhQUFYLElBQTRCK0IsT0FBT1EsS0FBUCxDQUFhLENBQWI7QUFWeEIsS0FBUjtBQVlEO0FBeEVrRCxDO2tCQUFoQzFDLE8iLCJmaWxlIjoibWVzc2FnZS1sZWdhY3kuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBvcGVuRXh0ZXJuYWxseSB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSBUb29sdGlwRGVsZWdhdGUgZnJvbSAnLi9kZWxlZ2F0ZSdcbmltcG9ydCB0eXBlIHsgTWVzc2FnZUxlZ2FjeSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5jb25zdCBORVdMSU5FID0gL1xcclxcbnxcXG4vXG5sZXQgTUVTU0FHRV9OVU1CRVIgPSAwXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lc3NhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIG1lc3NhZ2U6IE1lc3NhZ2VMZWdhY3ksXG4gICAgZGVsZWdhdGU6IFRvb2x0aXBEZWxlZ2F0ZSxcbiAgfTtcbiAgc3RhdGU6IHtcbiAgICBtdWx0aUxpbmVTaG93OiBib29sZWFuLFxuICB9ID0ge1xuICAgIG11bHRpTGluZVNob3c6IGZhbHNlLFxuICB9O1xuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uU2hvdWxkVXBkYXRlKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe30pXG4gICAgfSlcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uU2hvdWxkRXhwYW5kKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBtdWx0aUxpbmVTaG93OiB0cnVlIH0pXG4gICAgfSlcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uU2hvdWxkQ29sbGFwc2UoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG11bHRpTGluZVNob3c6IGZhbHNlIH0pXG4gICAgfSlcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIE5FV0xJTkUudGVzdCh0aGlzLnByb3BzLm1lc3NhZ2UudGV4dCB8fCAnJykgPyB0aGlzLnJlbmRlck11bHRpTGluZSgpIDogdGhpcy5yZW5kZXJTaW5nbGVMaW5lKClcbiAgfVxuICByZW5kZXJTaW5nbGVMaW5lKCkge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgZGVsZWdhdGUgfSA9IHRoaXMucHJvcHNcblxuICAgIGNvbnN0IG51bWJlciA9ICsrTUVTU0FHRV9OVU1CRVJcbiAgICBjb25zdCBlbGVtZW50SUQgPSBgbGludGVyLW1lc3NhZ2UtJHtudW1iZXJ9YFxuICAgIGNvbnN0IGlzRWxlbWVudCA9IG1lc3NhZ2UuaHRtbCAmJiB0eXBlb2YgbWVzc2FnZS5odG1sID09PSAnb2JqZWN0J1xuICAgIGlmIChpc0VsZW1lbnQpIHtcbiAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJRClcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAvLyAkRmxvd0lnbm9yZTogVGhpcyBpcyBhbiBIVE1MIEVsZW1lbnQgOlxcXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlLmh0bWwuY2xvbmVOb2RlKHRydWUpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUud2FybignW0xpbnRlcl0gVW5hYmxlIHRvIGdldCBlbGVtZW50IGZvciBtb3VudGVkIG1lc3NhZ2UnLCBudW1iZXIsIG1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuICg8bGludGVyLW1lc3NhZ2UgY2xhc3M9e21lc3NhZ2Uuc2V2ZXJpdHl9PlxuICAgICAgeyBkZWxlZ2F0ZS5zaG93UHJvdmlkZXJOYW1lID8gYCR7bWVzc2FnZS5saW50ZXJOYW1lfTogYCA6ICcnIH1cbiAgICAgIDxzcGFuIGlkPXtlbGVtZW50SUR9IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXsgIWlzRWxlbWVudCAmJiBtZXNzYWdlLmh0bWwgPyB7IF9faHRtbDogbWVzc2FnZS5odG1sIH0gOiBudWxsIH0+XG4gICAgICAgIHsgbWVzc2FnZS50ZXh0IH1cbiAgICAgIDwvc3Bhbj5cbiAgICAgIHsnICd9XG4gICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9eygpID0+IG9wZW5FeHRlcm5hbGx5KG1lc3NhZ2UpfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWxpbmsgbGludGVyLWljb25cIj48L3NwYW4+XG4gICAgICA8L2E+XG4gICAgPC9saW50ZXItbWVzc2FnZT4pXG4gIH1cblxuICByZW5kZXJNdWx0aUxpbmUoKSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCBkZWxlZ2F0ZSB9ID0gdGhpcy5wcm9wc1xuXG4gICAgY29uc3QgdGV4dCA9IG1lc3NhZ2UudGV4dCA/IG1lc3NhZ2UudGV4dC5zcGxpdChORVdMSU5FKSA6IFtdXG4gICAgY29uc3QgY2h1bmtzID0gdGV4dC5tYXAoZW50cnkgPT4gZW50cnkudHJpbSgpKS5tYXAoKGVudHJ5LCBpbmRleCkgPT4gZW50cnkubGVuZ3RoICYmIDxzcGFuIGNsYXNzTmFtZT17aW5kZXggIT09IDAgJiYgJ2xpbnRlci1saW5lJ30+e2VudHJ5fTwvc3Bhbj4pLmZpbHRlcihlID0+IGUpXG5cbiAgICByZXR1cm4gKDxsaW50ZXItbWVzc2FnZSBjbGFzcz17bWVzc2FnZS5zZXZlcml0eX0+XG4gICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBtdWx0aUxpbmVTaG93OiAhdGhpcy5zdGF0ZS5tdWx0aUxpbmVTaG93IH0pfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgaWNvbiBsaW50ZXItaWNvbiBpY29uLSR7dGhpcy5zdGF0ZS5tdWx0aUxpbmVTaG93ID8gJ2NoZXZyb24tZG93bicgOiAnY2hldnJvbi1yaWdodCd9YH0+PC9zcGFuPlxuICAgICAgPC9hPlxuICAgICAgeyBkZWxlZ2F0ZS5zaG93UHJvdmlkZXJOYW1lID8gYCR7bWVzc2FnZS5saW50ZXJOYW1lfTogYCA6ICcnIH1cbiAgICAgIHsgY2h1bmtzWzBdIH1cbiAgICAgIHsnICd9XG4gICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9eygpID0+IG9wZW5FeHRlcm5hbGx5KG1lc3NhZ2UpfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWxpbmsgbGludGVyLWljb25cIj48L3NwYW4+XG4gICAgICA8L2E+XG4gICAgICB7IHRoaXMuc3RhdGUubXVsdGlMaW5lU2hvdyAmJiBjaHVua3Muc2xpY2UoMSkgfVxuICAgIDwvbGludGVyLW1lc3NhZ2U+KVxuICB9XG59XG4iXX0=