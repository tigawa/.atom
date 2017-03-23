'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _desc, _value, _class, _descriptor;

var _mobx = require('mobx');

var _findit = require('findit');

var _findit2 = _interopRequireDefault(_findit);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _untildify = require('untildify');

var _untildify2 = _interopRequireDefault(_untildify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

let GitStore = (_class = class GitStore {

  constructor() {
    _initDefineProp(this, 'data', _descriptor, this);

    const ignoreDirectories = atom.config.get('project-manager.ignoreDirectories');
    this.ignore = ignoreDirectories.replace(/ /g, '').split(',');
  }

  fetch() {
    const projectHome = atom.config.get('core.projectHome');
    const finder = (0, _findit2.default)((0, _untildify2.default)(projectHome));
    this.data.clear();

    finder.on('directory', (dir, stat, stop) => {
      const base = _path2.default.basename(dir);
      const projectPath = _path2.default.dirname(dir);
      const projectName = _path2.default.basename(projectPath);

      if (base === '.git') {
        this.data.push({
          title: projectName,
          paths: [projectPath],
          source: 'git',
          icon: 'icon-repo'
        });
      }

      if (this.ignore.includes(base)) {
        stop();
      }
    });
  }

  empty() {
    this.data.clear();
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'data', [_mobx.observable], {
  enumerable: true,
  initializer: function () {
    return (0, _mobx.asFlat)([]);
  }
}), _applyDecoratedDescriptor(_class.prototype, 'fetch', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'fetch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'empty', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'empty'), _class.prototype)), _class);
exports.default = GitStore;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdpdFN0b3JlLmpzIl0sIm5hbWVzIjpbIkdpdFN0b3JlIiwiY29uc3RydWN0b3IiLCJpZ25vcmVEaXJlY3RvcmllcyIsImF0b20iLCJjb25maWciLCJnZXQiLCJpZ25vcmUiLCJyZXBsYWNlIiwic3BsaXQiLCJmZXRjaCIsInByb2plY3RIb21lIiwiZmluZGVyIiwiZGF0YSIsImNsZWFyIiwib24iLCJkaXIiLCJzdGF0Iiwic3RvcCIsImJhc2UiLCJiYXNlbmFtZSIsInByb2plY3RQYXRoIiwiZGlybmFtZSIsInByb2plY3ROYW1lIiwicHVzaCIsInRpdGxlIiwicGF0aHMiLCJzb3VyY2UiLCJpY29uIiwiaW5jbHVkZXMiLCJlbXB0eSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQUVBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVxQkEsUSxhQUFOLE1BQU1BLFFBQU4sQ0FBZTs7QUFHNUJDLGdCQUFjO0FBQUE7O0FBQ1osVUFBTUMsb0JBQW9CQyxLQUFLQyxNQUFMLENBQVlDLEdBQVosQ0FBZ0IsbUNBQWhCLENBQTFCO0FBQ0EsU0FBS0MsTUFBTCxHQUFjSixrQkFBa0JLLE9BQWxCLENBQTBCLElBQTFCLEVBQWdDLEVBQWhDLEVBQW9DQyxLQUFwQyxDQUEwQyxHQUExQyxDQUFkO0FBQ0Q7O0FBRU9DLFVBQVE7QUFDZCxVQUFNQyxjQUFjUCxLQUFLQyxNQUFMLENBQVlDLEdBQVosQ0FBZ0Isa0JBQWhCLENBQXBCO0FBQ0EsVUFBTU0sU0FBUyxzQkFBTyx5QkFBVUQsV0FBVixDQUFQLENBQWY7QUFDQSxTQUFLRSxJQUFMLENBQVVDLEtBQVY7O0FBRUFGLFdBQU9HLEVBQVAsQ0FBVSxXQUFWLEVBQXVCLENBQUNDLEdBQUQsRUFBTUMsSUFBTixFQUFZQyxJQUFaLEtBQXFCO0FBQzFDLFlBQU1DLE9BQU8sZUFBS0MsUUFBTCxDQUFjSixHQUFkLENBQWI7QUFDQSxZQUFNSyxjQUFjLGVBQUtDLE9BQUwsQ0FBYU4sR0FBYixDQUFwQjtBQUNBLFlBQU1PLGNBQWMsZUFBS0gsUUFBTCxDQUFjQyxXQUFkLENBQXBCOztBQUVBLFVBQUlGLFNBQVMsTUFBYixFQUFxQjtBQUNuQixhQUFLTixJQUFMLENBQVVXLElBQVYsQ0FBZTtBQUNiQyxpQkFBT0YsV0FETTtBQUViRyxpQkFBTyxDQUFDTCxXQUFELENBRk07QUFHYk0sa0JBQVEsS0FISztBQUliQyxnQkFBTTtBQUpPLFNBQWY7QUFNRDs7QUFFRCxVQUFJLEtBQUtyQixNQUFMLENBQVlzQixRQUFaLENBQXFCVixJQUFyQixDQUFKLEVBQWdDO0FBQzlCRDtBQUNEO0FBQ0YsS0FqQkQ7QUFrQkQ7O0FBRU9ZLFVBQVE7QUFDZCxTQUFLakIsSUFBTCxDQUFVQyxLQUFWO0FBQ0Q7QUFuQzJCLEM7OztXQUNULGtCQUFPLEVBQVAsQzs7O2tCQURBYixRIiwiZmlsZSI6IkdpdFN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IG9ic2VydmFibGUsIGFjdGlvbiwgYXNGbGF0IH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgZmluZGl0IGZyb20gJ2ZpbmRpdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1bnRpbGRpZnkgZnJvbSAndW50aWxkaWZ5JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2l0U3RvcmUge1xuICBAb2JzZXJ2YWJsZSBkYXRhID0gYXNGbGF0KFtdKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBpZ25vcmVEaXJlY3RvcmllcyA9IGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLmlnbm9yZURpcmVjdG9yaWVzJyk7XG4gICAgdGhpcy5pZ25vcmUgPSBpZ25vcmVEaXJlY3Rvcmllcy5yZXBsYWNlKC8gL2csICcnKS5zcGxpdCgnLCcpO1xuICB9XG5cbiAgQGFjdGlvbiBmZXRjaCgpIHtcbiAgICBjb25zdCBwcm9qZWN0SG9tZSA9IGF0b20uY29uZmlnLmdldCgnY29yZS5wcm9qZWN0SG9tZScpO1xuICAgIGNvbnN0IGZpbmRlciA9IGZpbmRpdCh1bnRpbGRpZnkocHJvamVjdEhvbWUpKTtcbiAgICB0aGlzLmRhdGEuY2xlYXIoKTtcblxuICAgIGZpbmRlci5vbignZGlyZWN0b3J5JywgKGRpciwgc3RhdCwgc3RvcCkgPT4ge1xuICAgICAgY29uc3QgYmFzZSA9IHBhdGguYmFzZW5hbWUoZGlyKTtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gcGF0aC5kaXJuYW1lKGRpcik7XG4gICAgICBjb25zdCBwcm9qZWN0TmFtZSA9IHBhdGguYmFzZW5hbWUocHJvamVjdFBhdGgpO1xuXG4gICAgICBpZiAoYmFzZSA9PT0gJy5naXQnKSB7XG4gICAgICAgIHRoaXMuZGF0YS5wdXNoKHtcbiAgICAgICAgICB0aXRsZTogcHJvamVjdE5hbWUsXG4gICAgICAgICAgcGF0aHM6IFtwcm9qZWN0UGF0aF0sXG4gICAgICAgICAgc291cmNlOiAnZ2l0JyxcbiAgICAgICAgICBpY29uOiAnaWNvbi1yZXBvJyxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlnbm9yZS5pbmNsdWRlcyhiYXNlKSkge1xuICAgICAgICBzdG9wKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBAYWN0aW9uIGVtcHR5KCkge1xuICAgIHRoaXMuZGF0YS5jbGVhcigpO1xuICB9XG59XG4iXX0=