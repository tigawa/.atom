'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _desc, _value, _class, _descriptor, _descriptor2;

var _mobx = require('mobx');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _untildify = require('untildify');

var _untildify2 = _interopRequireDefault(_untildify);

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

let Project = (_class = class Project {
  get title() {
    return this.props.title;
  }

  get paths() {
    return this.props.paths.map(path => (0, _untildify2.default)(path));
  }

  get group() {
    return this.props.group;
  }

  get rootPath() {
    return this.paths[0];
  }

  get settings() {
    return (0, _mobx.toJS)(this.props.settings);
  }

  get source() {
    return this.props.source;
  }

  get lastModified() {
    let mtime = new Date(0);
    if (this.stats) {
      mtime = this.stats.mtime;
    }

    return mtime;
  }

  get isCurrent() {
    const activePath = atom.project.getPaths()[0];

    if (activePath === this.rootPath) {
      return true;
    }

    return false;
  }

  static get defaultProps() {
    return {
      title: '',
      group: '',
      paths: [],
      icon: 'icon-chevron-right',
      settings: {},
      devMode: false,
      template: null,
      source: null
    };
  }

  constructor(props) {
    _initDefineProp(this, 'props', _descriptor, this);

    _initDefineProp(this, 'stats', _descriptor2, this);

    (0, _mobx.extendObservable)(this.props, Project.defaultProps);
    this.updateProps(props);
  }

  updateProps(props) {
    (0, _mobx.extendObservable)(this.props, props);
    this.setFileStats();
  }

  getProps() {
    return (0, _mobx.toJS)(this.props);
  }

  getChangedProps() {
    const props = _objectWithoutProperties(this.getProps(), []);
    const defaults = Project.defaultProps;

    Object.keys(defaults).forEach(key => {
      switch (key) {
        case 'settings':
          {
            if (Object.keys(props[key]).length === 0) {
              delete props[key];
            }
            break;
          }

        default:
          {
            if (props[key] === defaults[key]) {
              delete props[key];
            }
          }
      }
    });

    return props;
  }

  setFileStats() {
    _fs2.default.stat(this.rootPath, (err, stats) => {
      if (!err) {
        this.stats = stats;
      }
    });
  }

  /**
   * Fetch settings that are saved locally with the project
   * if there are any.
   */
  fetchLocalSettings() {
    const file = `${this.rootPath}/project.cson`;
    _season2.default.readFile(file, (err, settings) => {
      if (err) {
        return;
      }

      (0, _mobx.extendObservable)(this.props.settings, settings);
    });
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'props', [_mobx.observable], {
  enumerable: true,
  initializer: function () {
    return {};
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'stats', [_mobx.observable], {
  enumerable: true,
  initializer: function () {
    return null;
  }
}), _applyDecoratedDescriptor(_class.prototype, 'title', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'title'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'paths', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'paths'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'group', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'group'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'rootPath', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'rootPath'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'settings', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'settings'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'source', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'source'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'lastModified', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'lastModified'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'isCurrent', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'isCurrent'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setFileStats', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setFileStats'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'fetchLocalSettings', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'fetchLocalSettings'), _class.prototype)), _class);
exports.default = Project;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2plY3QuanMiXSwibmFtZXMiOlsiUHJvamVjdCIsInRpdGxlIiwicHJvcHMiLCJwYXRocyIsIm1hcCIsInBhdGgiLCJncm91cCIsInJvb3RQYXRoIiwic2V0dGluZ3MiLCJzb3VyY2UiLCJsYXN0TW9kaWZpZWQiLCJtdGltZSIsIkRhdGUiLCJzdGF0cyIsImlzQ3VycmVudCIsImFjdGl2ZVBhdGgiLCJhdG9tIiwicHJvamVjdCIsImdldFBhdGhzIiwiZGVmYXVsdFByb3BzIiwiaWNvbiIsImRldk1vZGUiLCJ0ZW1wbGF0ZSIsImNvbnN0cnVjdG9yIiwidXBkYXRlUHJvcHMiLCJzZXRGaWxlU3RhdHMiLCJnZXRQcm9wcyIsImdldENoYW5nZWRQcm9wcyIsImRlZmF1bHRzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJsZW5ndGgiLCJzdGF0IiwiZXJyIiwiZmV0Y2hMb2NhbFNldHRpbmdzIiwiZmlsZSIsInJlYWRGaWxlIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFcUJBLE8sYUFBTixNQUFNQSxPQUFOLENBQWM7QUFJakIsTUFBSUMsS0FBSixHQUFZO0FBQ3BCLFdBQU8sS0FBS0MsS0FBTCxDQUFXRCxLQUFsQjtBQUNEOztBQUVTLE1BQUlFLEtBQUosR0FBWTtBQUNwQixXQUFPLEtBQUtELEtBQUwsQ0FBV0MsS0FBWCxDQUFpQkMsR0FBakIsQ0FBcUJDLFFBQVEseUJBQVVBLElBQVYsQ0FBN0IsQ0FBUDtBQUNEOztBQUVTLE1BQUlDLEtBQUosR0FBWTtBQUNwQixXQUFPLEtBQUtKLEtBQUwsQ0FBV0ksS0FBbEI7QUFDRDs7QUFFUyxNQUFJQyxRQUFKLEdBQWU7QUFDdkIsV0FBTyxLQUFLSixLQUFMLENBQVcsQ0FBWCxDQUFQO0FBQ0Q7O0FBRVMsTUFBSUssUUFBSixHQUFlO0FBQ3ZCLFdB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ZSwgY29tcHV0ZWQsIGV4dGVuZE9ic2VydmFibGUsIGFjdGlvbiwgdG9KUyB9IGZyb20gJ21vYngnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB1bnRpbGRpZnkgZnJvbSAndW50aWxkaWZ5JztcbmltcG9ydCBDU09OIGZyb20gJ3NlYXNvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2plY3Qge1xuICBAb2JzZXJ2YWJsZSBwcm9wcyA9IHt9XG4gIEBvYnNlcnZhYmxlIHN0YXRzID0gbnVsbDtcblxuICBAY29tcHV0ZWQgZ2V0IHRpdGxlKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnRpdGxlO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBwYXRocygpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5wYXRocy5tYXAocGF0aCA9PiB1bnRpbGRpZnkocGF0aCkpO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBncm91cCgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5ncm91cDtcbiAgfVxuXG4gIEBjb21wdXRlZCBnZXQgcm9vdFBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aHNbMF07XG4gIH1cblxuICBAY29tcHV0ZWQgZ2V0IHNldHRpbmdzKCkge1xuICAgIHJldHVybiB0b0pTKHRoaXMucHJvcHMuc2V0dGluZ3MpO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBzb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuc291cmNlO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCBsYXN0TW9kaWZpZWQoKSB7XG4gICAgbGV0IG10aW1lID0gbmV3IERhdGUoMCk7XG4gICAgaWYgKHRoaXMuc3RhdHMpIHtcbiAgICAgIG10aW1lID0gdGhpcy5zdGF0cy5tdGltZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbXRpbWU7XG4gIH1cblxuICBAY29tcHV0ZWQgZ2V0IGlzQ3VycmVudCgpIHtcbiAgICBjb25zdCBhY3RpdmVQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG5cbiAgICBpZiAoYWN0aXZlUGF0aCA9PT0gdGhpcy5yb290UGF0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIGdldCBkZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIGdyb3VwOiAnJyxcbiAgICAgIHBhdGhzOiBbXSxcbiAgICAgIGljb246ICdpY29uLWNoZXZyb24tcmlnaHQnLFxuICAgICAgc2V0dGluZ3M6IHt9LFxuICAgICAgZGV2TW9kZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZTogbnVsbCxcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBleHRlbmRPYnNlcnZhYmxlKHRoaXMucHJvcHMsIFByb2plY3QuZGVmYXVsdFByb3BzKTtcbiAgICB0aGlzLnVwZGF0ZVByb3BzKHByb3BzKTtcbiAgfVxuXG4gIHVwZGF0ZVByb3BzKHByb3BzKSB7XG4gICAgZXh0ZW5kT2JzZXJ2YWJsZSh0aGlzLnByb3BzLCBwcm9wcyk7XG4gICAgdGhpcy5zZXRGaWxlU3RhdHMoKTtcbiAgfVxuXG4gIGdldFByb3BzKCkge1xuICAgIHJldHVybiB0b0pTKHRoaXMucHJvcHMpO1xuICB9XG5cbiAgZ2V0Q2hhbmdlZFByb3BzKCkge1xuICAgIGNvbnN0IHsgLi4ucHJvcHMgfSA9IHRoaXMuZ2V0UHJvcHMoKTtcbiAgICBjb25zdCBkZWZhdWx0cyA9IFByb2plY3QuZGVmYXVsdFByb3BzO1xuXG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnc2V0dGluZ3MnOiB7XG4gICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHByb3BzW2tleV0pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZGVsZXRlIHByb3BzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGlmIChwcm9wc1trZXldID09PSBkZWZhdWx0c1trZXldKSB7XG4gICAgICAgICAgICBkZWxldGUgcHJvcHNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuXG4gIEBhY3Rpb24gc2V0RmlsZVN0YXRzKCkge1xuICAgIGZzLnN0YXQodGhpcy5yb290UGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIHRoaXMuc3RhdHMgPSBzdGF0cztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBzZXR0aW5ncyB0aGF0IGFyZSBzYXZlZCBsb2NhbGx5IHdpdGggdGhlIHByb2plY3RcbiAgICogaWYgdGhlcmUgYXJlIGFueS5cbiAgICovXG4gIEBhY3Rpb24gZmV0Y2hMb2NhbFNldHRpbmdzKCkge1xuICAgIGNvbnN0IGZpbGUgPSBgJHt0aGlzLnJvb3RQYXRofS9wcm9qZWN0LmNzb25gO1xuICAgIENTT04ucmVhZEZpbGUoZmlsZSwgKGVyciwgc2V0dGluZ3MpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBleHRlbmRPYnNlcnZhYmxlKHRoaXMucHJvcHMuc2V0dGluZ3MsIHNldHRpbmdzKTtcbiAgICB9KTtcbiAgfVxufVxuIl19