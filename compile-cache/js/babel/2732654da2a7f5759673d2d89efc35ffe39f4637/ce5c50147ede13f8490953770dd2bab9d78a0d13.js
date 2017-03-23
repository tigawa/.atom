Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sbReactTable = require('sb-react-table');

var _sbReactTable2 = _interopRequireDefault(_sbReactTable);

var _reactResizableBox = require('react-resizable-box');

var _reactResizableBox2 = _interopRequireDefault(_reactResizableBox);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let PanelComponent = class PanelComponent extends _react2.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      messages: [],
      visibility: false,
      tempHeight: null
    }, this.onClick = (e, row) => {
      if (process.platform === 'darwin' ? e.metaKey : e.ctrlKey) {
        if (e.shiftKey) {
          (0, _helpers.openExternally)(row);
        } else {
          (0, _helpers.visitMessage)(row, true);
        }
      } else {
        (0, _helpers.visitMessage)(row);
      }
    }, this.onResize = (direction, size) => {
      this.setState({ tempHeight: size.height });
    }, this.onResizeStop = (direction, size) => {
      this.props.delegate.updatePanelHeight(size.height);
    }, _temp;
  }

  componentDidMount() {
    this.props.delegate.onDidChangeMessages(messages => {
      this.setState({ messages });
    });
    this.props.delegate.onDidChangeVisibility(visibility => {
      this.setState({ visibility });
    });
    this.props.delegate.onDidChangePanelConfig(() => {
      this.setState({ tempHeight: null });
    });
    this.setState({ messages: this.props.delegate.filteredMessages, visibility: this.props.delegate.visibility });
  }

  render() {
    const { delegate } = this.props;
    const columns = [{ key: 'severity', label: 'Severity', sortable: true }, { key: 'linterName', label: 'Provider', sortable: true }, { key: 'excerpt', label: 'Description' }, { key: 'line', label: 'Line', sortable: true, onClick: this.onClick }];
    if (delegate.panelRepresents === 'Entire Project') {
      columns.push({ key: 'file', label: 'File', sortable: true, onClick: this.onClick });
    }

    let height;
    const customStyle = { overflowY: 'scroll' };
    if (this.state.tempHeight) {
      height = this.state.tempHeight;
    } else if (delegate.panelTakesMinimumHeight) {
      height = 'auto';
      customStyle.maxHeight = delegate.panelHeight;
    } else {
      height = delegate.panelHeight;
    }
    delegate.setPanelVisibility(this.state.visibility && (!delegate.panelTakesMinimumHeight || !!this.state.messages.length));

    return _react2.default.createElement(
      _reactResizableBox2.default,
      { isResizable: { top: true }, onResize: this.onResize, onResizeStop: this.onResizeStop, height: height, width: 'auto', customStyle: customStyle },
      _react2.default.createElement(
        'div',
        { id: 'linter-panel', tabIndex: '-1' },
        _react2.default.createElement(_sbReactTable2.default, {
          rows: this.state.messages,
          columns: columns,

          initialSort: [{ column: 'severity', type: 'desc' }, { column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }],
          sort: _helpers.sortMessages,
          rowKey: i => i.key,

          renderHeaderColumn: i => i.label,
          renderBodyColumn: PanelComponent.renderRowColumn,

          style: { width: '100%' },
          className: 'linter'
        })
      )
    );
  }
  static renderRowColumn(row, column) {
    const range = (0, _helpers.$range)(row);

    switch (column) {
      case 'file':
        return (0, _helpers.getPathOfMessage)(row);
      case 'line':
        return range ? `${range.start.row + 1}:${range.start.column + 1}` : '';
      case 'excerpt':
        if (row.version === 1) {
          if (row.html) {
            return _react2.default.createElement('span', { dangerouslySetInnerHTML: { __html: row.html } });
          }
          return row.text || '';
        }
        return row.excerpt;
      case 'severity':
        return _helpers.severityNames[row.severity];
      default:
        return row[column];
    }
  }
};
exports.default = PanelComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudC5qcyJdLCJuYW1lcyI6WyJQYW5lbENvbXBvbmVudCIsIkNvbXBvbmVudCIsInN0YXRlIiwibWVzc2FnZXMiLCJ2aXNpYmlsaXR5IiwidGVtcEhlaWdodCIsIm9uQ2xpY2siLCJlIiwicm93IiwicHJvY2VzcyIsInBsYXRmb3JtIiwibWV0YUtleSIsImN0cmxLZXkiLCJzaGlmdEtleSIsIm9uUmVzaXplIiwiZGlyZWN0aW9uIiwic2l6ZSIsInNldFN0YXRlIiwiaGVpZ2h0Iiwib25SZXNpemVTdG9wIiwicHJvcHMiLCJkZWxlZ2F0ZSIsInVwZGF0ZVBhbmVsSGVpZ2h0IiwiY29tcG9uZW50RGlkTW91bnQiLCJvbkRpZENoYW5nZU1lc3NhZ2VzIiwib25EaWRDaGFuZ2VWaXNpYmlsaXR5Iiwib25EaWRDaGFuZ2VQYW5lbENvbmZpZyIsImZpbHRlcmVkTWVzc2FnZXMiLCJyZW5kZXIiLCJjb2x1bW5zIiwia2V5IiwibGFiZWwiLCJzb3J0YWJsZSIsInBhbmVsUmVwcmVzZW50cyIsInB1c2giLCJjdXN0b21TdHlsZSIsIm92ZXJmbG93WSIsInBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0IiwibWF4SGVpZ2h0IiwicGFuZWxIZWlnaHQiLCJzZXRQYW5lbFZpc2liaWxpdHkiLCJsZW5ndGgiLCJ0b3AiLCJjb2x1bW4iLCJ0eXBlIiwiaSIsInJlbmRlclJvd0NvbHVtbiIsIndpZHRoIiwicmFuZ2UiLCJzdGFydCIsInZlcnNpb24iLCJodG1sIiwiX19odG1sIiwidGV4dCIsImV4Y2VycHQiLCJzZXZlcml0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztJQUlxQkEsYyxHQUFOLE1BQU1BLGNBQU4sU0FBNkIsZ0JBQU1DLFNBQW5DLENBQTZDO0FBQUE7QUFBQTs7QUFBQSx3Q0FJMURDLEtBSjBELEdBUXREO0FBQ0ZDLGdCQUFVLEVBRFI7QUFFRkMsa0JBQVksS0FGVjtBQUdGQyxrQkFBWTtBQUhWLEtBUnNE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WU4sTUFBWixHQUFxQixDQUFFLEVBQXpELEdBQTZELEVBQXBFO0FBQ0YsV0FBSyxTQUFMO0FBQ0UsWUFBSW5DLElBQUkwQyxPQUFKLEtBQWdCLENBQXBCLEVBQXVCO0FBQ3JCLGNBQUkxQyxJQUFJMkMsSUFBUixFQUFjO0FBQ1osbUJBQU8sd0NBQU0seUJBQXlCLEVBQUVDLFFBQVE1QyxJQUFJMkMsSUFBZCxFQUEvQixHQUFQO0FBQ0Q7QUFDRCxpQkFBTzNDLElBQUk2QyxJQUFKLElBQVksRUFBbkI7QUFDRDtBQUNELGVBQU83QyxJQUFJOEMsT0FBWDtBQUNGLFdBQUssVUFBTDtBQUNFLGVBQU8sdUJBQWM5QyxJQUFJK0MsUUFBbEIsQ0FBUDtBQUNGO0FBQ0UsZUFBTy9DLElBQUltQyxNQUFKLENBQVA7QUFoQko7QUFrQkQ7QUE1R3lELEM7a0JBQXZDM0MsYyIsImZpbGUiOiJjb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RUYWJsZSBmcm9tICdzYi1yZWFjdC10YWJsZSdcbmltcG9ydCBSZXNpemFibGVCb3ggZnJvbSAncmVhY3QtcmVzaXphYmxlLWJveCdcbmltcG9ydCB7ICRyYW5nZSwgc2V2ZXJpdHlOYW1lcywgc29ydE1lc3NhZ2VzLCB2aXNpdE1lc3NhZ2UsIG9wZW5FeHRlcm5hbGx5LCBnZXRQYXRoT2ZNZXNzYWdlIH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFuZWxDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIGRlbGVnYXRlOiBEZWxlZ2F0ZSxcbiAgfTtcbiAgc3RhdGU6IHtcbiAgICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4sXG4gICAgdmlzaWJpbGl0eTogYm9vbGVhbixcbiAgICB0ZW1wSGVpZ2h0OiA/bnVtYmVyLFxuICB9ID0ge1xuICAgIG1lc3NhZ2VzOiBbXSxcbiAgICB2aXNpYmlsaXR5OiBmYWxzZSxcbiAgICB0ZW1wSGVpZ2h0OiBudWxsLFxuICB9O1xuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uRGlkQ2hhbmdlTWVzc2FnZXMoKG1lc3NhZ2VzKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZXMgfSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25EaWRDaGFuZ2VWaXNpYmlsaXR5KCh2aXNpYmlsaXR5KSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgdmlzaWJpbGl0eSB9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vbkRpZENoYW5nZVBhbmVsQ29uZmlnKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0ZW1wSGVpZ2h0OiBudWxsIH0pXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZXM6IHRoaXMucHJvcHMuZGVsZWdhdGUuZmlsdGVyZWRNZXNzYWdlcywgdmlzaWJpbGl0eTogdGhpcy5wcm9wcy5kZWxlZ2F0ZS52aXNpYmlsaXR5IH0pXG4gIH1cbiAgb25DbGljayA9IChlOiBNb3VzZUV2ZW50LCByb3c6IExpbnRlck1lc3NhZ2UpID0+IHtcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpIHtcbiAgICAgIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgIG9wZW5FeHRlcm5hbGx5KHJvdylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpc2l0TWVzc2FnZShyb3csIHRydWUpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZpc2l0TWVzc2FnZShyb3cpXG4gICAgfVxuICB9XG4gIG9uUmVzaXplID0gKGRpcmVjdGlvbjogJ3RvcCcsIHNpemU6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB0ZW1wSGVpZ2h0OiBzaXplLmhlaWdodCB9KVxuICB9XG4gIG9uUmVzaXplU3RvcCA9IChkaXJlY3Rpb246ICd0b3AnLCBzaXplOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0pID0+IHtcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLnVwZGF0ZVBhbmVsSGVpZ2h0KHNpemUuaGVpZ2h0KVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGRlbGVnYXRlIH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgIHsga2V5OiAnc2V2ZXJpdHknLCBsYWJlbDogJ1NldmVyaXR5Jywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIHsga2V5OiAnbGludGVyTmFtZScsIGxhYmVsOiAnUHJvdmlkZXInLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgeyBrZXk6ICdleGNlcnB0JywgbGFiZWw6ICdEZXNjcmlwdGlvbicgfSxcbiAgICAgIHsga2V5OiAnbGluZScsIGxhYmVsOiAnTGluZScsIHNvcnRhYmxlOiB0cnVlLCBvbkNsaWNrOiB0aGlzLm9uQ2xpY2sgfSxcbiAgICBdXG4gICAgaWYgKGRlbGVnYXRlLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0VudGlyZSBQcm9qZWN0Jykge1xuICAgICAgY29sdW1ucy5wdXNoKHsga2V5OiAnZmlsZScsIGxhYmVsOiAnRmlsZScsIHNvcnRhYmxlOiB0cnVlLCBvbkNsaWNrOiB0aGlzLm9uQ2xpY2sgfSlcbiAgICB9XG5cbiAgICBsZXQgaGVpZ2h0XG4gICAgY29uc3QgY3VzdG9tU3R5bGU6IE9iamVjdCA9IHsgb3ZlcmZsb3dZOiAnc2Nyb2xsJyB9XG4gICAgaWYgKHRoaXMuc3RhdGUudGVtcEhlaWdodCkge1xuICAgICAgaGVpZ2h0ID0gdGhpcy5zdGF0ZS50ZW1wSGVpZ2h0XG4gICAgfSBlbHNlIGlmIChkZWxlZ2F0ZS5wYW5lbFRha2VzTWluaW11bUhlaWdodCkge1xuICAgICAgaGVpZ2h0ID0gJ2F1dG8nXG4gICAgICBjdXN0b21TdHlsZS5tYXhIZWlnaHQgPSBkZWxlZ2F0ZS5wYW5lbEhlaWdodFxuICAgIH0gZWxzZSB7XG4gICAgICBoZWlnaHQgPSBkZWxlZ2F0ZS5wYW5lbEhlaWdodFxuICAgIH1cbiAgICBkZWxlZ2F0ZS5zZXRQYW5lbFZpc2liaWxpdHkodGhpcy5zdGF0ZS52aXNpYmlsaXR5ICYmICghZGVsZWdhdGUucGFuZWxUYWtlc01pbmltdW1IZWlnaHQgfHwgISF0aGlzLnN0YXRlLm1lc3NhZ2VzLmxlbmd0aCkpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPFJlc2l6YWJsZUJveCBpc1Jlc2l6YWJsZT17eyB0b3A6IHRydWUgfX0gb25SZXNpemU9e3RoaXMub25SZXNpemV9IG9uUmVzaXplU3RvcD17dGhpcy5vblJlc2l6ZVN0b3B9IGhlaWdodD17aGVpZ2h0fSB3aWR0aD1cImF1dG9cIiBjdXN0b21TdHlsZT17Y3VzdG9tU3R5bGV9PlxuICAgICAgICA8ZGl2IGlkPVwibGludGVyLXBhbmVsXCIgdGFiSW5kZXg9XCItMVwiPlxuICAgICAgICAgIDxSZWFjdFRhYmxlXG4gICAgICAgICAgICByb3dzPXt0aGlzLnN0YXRlLm1lc3NhZ2VzfVxuICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cblxuICAgICAgICAgICAgaW5pdGlhbFNvcnQ9e1t7IGNvbHVtbjogJ3NldmVyaXR5JywgdHlwZTogJ2Rlc2MnIH0sIHsgY29sdW1uOiAnZmlsZScsIHR5cGU6ICdhc2MnIH0sIHsgY29sdW1uOiAnbGluZScsIHR5cGU6ICdhc2MnIH1dfVxuICAgICAgICAgICAgc29ydD17c29ydE1lc3NhZ2VzfVxuICAgICAgICAgICAgcm93S2V5PXtpID0+IGkua2V5fVxuXG4gICAgICAgICAgICByZW5kZXJIZWFkZXJDb2x1bW49e2kgPT4gaS5sYWJlbH1cbiAgICAgICAgICAgIHJlbmRlckJvZHlDb2x1bW49e1BhbmVsQ29tcG9uZW50LnJlbmRlclJvd0NvbHVtbn1cblxuICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJyB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPSdsaW50ZXInXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1Jlc2l6YWJsZUJveD5cbiAgICApXG4gIH1cbiAgc3RhdGljIHJlbmRlclJvd0NvbHVtbihyb3c6IExpbnRlck1lc3NhZ2UsIGNvbHVtbjogc3RyaW5nKTogc3RyaW5nIHwgT2JqZWN0IHtcbiAgICBjb25zdCByYW5nZSA9ICRyYW5nZShyb3cpXG5cbiAgICBzd2l0Y2ggKGNvbHVtbikge1xuICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgIHJldHVybiBnZXRQYXRoT2ZNZXNzYWdlKHJvdylcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gcmFuZ2UgPyBgJHtyYW5nZS5zdGFydC5yb3cgKyAxfToke3JhbmdlLnN0YXJ0LmNvbHVtbiArIDF9YCA6ICcnXG4gICAgICBjYXNlICdleGNlcnB0JzpcbiAgICAgICAgaWYgKHJvdy52ZXJzaW9uID09PSAxKSB7XG4gICAgICAgICAgaWYgKHJvdy5odG1sKSB7XG4gICAgICAgICAgICByZXR1cm4gPHNwYW4gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiByb3cuaHRtbCB9fSAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcm93LnRleHQgfHwgJydcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93LmV4Y2VycHRcbiAgICAgIGNhc2UgJ3NldmVyaXR5JzpcbiAgICAgICAgcmV0dXJuIHNldmVyaXR5TmFtZXNbcm93LnNldmVyaXR5XVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHJvd1tjb2x1bW5dXG4gICAgfVxuICB9XG59XG4iXX0=