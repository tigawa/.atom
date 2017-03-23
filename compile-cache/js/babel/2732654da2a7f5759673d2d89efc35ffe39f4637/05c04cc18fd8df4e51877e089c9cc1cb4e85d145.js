'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _desc, _value, _class, _descriptor, _descriptor2;

var _mobx = require('mobx');

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _underscorePlus = require('underscore-plus');

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

let FileStore = (_class = class FileStore {

  constructor() {
    _initDefineProp(this, 'data', _descriptor, this);

    _initDefineProp(this, 'fetching', _descriptor2, this);

    this.templates = [];

    _fs2.default.exists(FileStore.getPath(), exists => {
      if (exists) {
        this.observeFile();
      } else {
        this.store([]);
        this.observeFile();
      }
    });
  }

  static getPath() {
    const filedir = atom.getConfigDirPath();
    const envSettings = atom.config.get('project-manager.environmentSpecificProjects');
    let filename = 'projects.cson';

    if (envSettings) {
      const hostname = _os2.default.hostname().split('.').shift().toLowerCase();
      filename = `projects.${hostname}.cson`;
    }

    return `${filedir}/${filename}`;
  }

  fetch() {
    this.fetching = true;
    _season2.default.readFile(FileStore.getPath(), (err, data) => {
      (0, _mobx.transaction)(() => {
        let results = [];
        if (err) {
          FileStore.handleError(err);
        }
        if (!err && data !== null) {
          results = data;
        }

        this.data.clear();
        this.templates = [];

        // Support for old structure.
        if (Array.isArray(results) === false) {
          results = Object.keys(results).map(k => results[k]);
        }

        // Make sure we have an array.
        if (Array.isArray(results) === false) {
          results = [];
        }

        (0, _underscorePlus.each)(results, res => {
          let result = res;
          const templateName = result.template || null;

          if (templateName) {
            const template = results.filter(props => props.title === templateName);

            if (template.length) {
              result = (0, _underscorePlus.deepExtend)({}, template[0], result);
            }
          }

          if (FileStore.isProject(result)) {
            result.source = 'file';

            this.data.push(result);
          } else {
            this.templates.push(result);
          }
        }, this);

        this.fetching = false;
      });
    });
  }

  static handleError(err) {
    switch (err.name) {
      case 'SyntaxError':
        {
          atom.notifications.addError('There is a syntax error in your projects file. Run **Project Manager: Edit Projects** to open and fix the issue.', {
            detail: err.message,
            description: `Line: ${err.location.first_line} Row: ${err.location.first_column}`,
            dismissable: true
          });
          break;
        }

      default:
        {
          // No default.
        }
    }
  }

  static isProject(settings) {
    if (typeof settings.paths === 'undefined') {
      return false;
    }

    if (settings.paths.length === 0) {
      return false;
    }

    return true;
  }

  store(projects) {
    const store = projects.concat(this.templates);
    try {
      _season2.default.writeFileSync(FileStore.getPath(), store);
    } catch (e) {
      // console.log(e);
    }
  }

  observeFile() {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }

    try {
      this.fileWatcher = _fs2.default.watch(FileStore.getPath(), () => {
        this.fetch();
      });
    } catch (error) {
      // console.log(error);
    }
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'data', [_mobx.observable], {
  enumerable: true,
  initializer: function () {
    return (0, _mobx.asFlat)([]);
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'fetching', [_mobx.observable], {
  enumerable: true,
  initializer: function () {
    return false;
  }
}), _applyDecoratedDescriptor(_class.prototype, 'fetch', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'fetch'), _class.prototype)), _class);
exports.default = FileStore;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVTdG9yZS5qcyJdLCJuYW1lcyI6WyJGaWxlU3RvcmUiLCJjb25zdHJ1Y3RvciIsInRlbXBsYXRlcyIsImV4aXN0cyIsImdldFBhdGgiLCJvYnNlcnZlRmlsZSIsInN0b3JlIiwiZmlsZWRpciIsImF0b20iLCJnZXRDb25maWdEaXJQYXRoIiwiZW52U2V0dGluZ3MiLCJjb25maWciLCJnZXQiLCJmaWxlbmFtZSIsImhvc3RuYW1lIiwic3BsaXQiLCJzaGlmdCIsInRvTG93ZXJDYXNlIiwiZmV0Y2giLCJmZXRjaGluZyIsInJlYWRGaWxlIiwiZXJyIiwiZGF0YSIsInJlc3VsdHMiLCJoYW5kbGVFcnJvciIsImNsZWFyIiwiQXJyYXkiLCJpc0FycmF5IiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsImsiLCJyZXMiLCJyZXN1bHQiLCJ0ZW1wbGF0ZU5hbWUiLCJ0ZW1wbGF0ZSIsImZpbHRlciIsInByb3BzIiwidGl0bGUiLCJsZW5ndGgiLCJpc1Byb2plY3QiLCJzb3VyY2UiLCJwdXNoIiwibmFtZSIsIm5vdGlmaWNhdGlvbnMiLCJhZGRFcnJvciIsImRldGFpbCIsIm1lc3NhZ2UiLCJkZXNjcmlwdGlvbiIsImxvY2F0aW9uIiwiZmlyc3RfbGluZSIsImZpcnN0X2NvbHVtbiIsImRpc21pc3NhYmxlIiwic2V0dGluZ3MiLCJwYXRocyIsInByb2plY3RzIiwiY29uY2F0Iiwid3JpdGVGaWxlU3luYyIsImUiLCJmaWxlV2F0Y2hlciIsImNsb3NlIiwid2F0Y2giLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQUVBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVxQkEsUyxhQUFOLE1BQU1BLFNBQU4sQ0FBZ0I7O0FBSzdCQyxnQkFBYztBQUFBOztBQUFBOztBQUFBLFNBRmRDLFNBRWMsR0FGRixFQUVFOztBQUNaLGlCQUFHQyxNQUFILENBQVVILFVB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UTdCLElBQUk0QixRQUFKLENBQWFFLFlBQWEsRUFGOEQ7QUFHOUlDLHlCQUFhO0FBSGlJLFdBQWhKO0FBS0E7QUFDRDs7QUFFRDtBQUFTO0FBQ1A7QUFDRDtBQVpIO0FBY0Q7O0FBRUQsU0FBT1osU0FBUCxDQUFpQmEsUUFBakIsRUFBMkI7QUFDekIsUUFBSSxPQUFPQSxTQUFTQyxLQUFoQixLQUEwQixXQUE5QixFQUEyQztBQUN6QyxhQUFPLEtBQVA7QUFDRDs7QUFFRCxRQUFJRCxTQUFTQyxLQUFULENBQWVmLE1BQWYsS0FBMEIsQ0FBOUIsRUFBaUM7QUFDL0IsYUFBTyxLQUFQO0FBQ0Q7O0FBRUQsV0FBTyxJQUFQO0FBQ0Q7O0FBRURqQyxRQUFNaUQsUUFBTixFQUFnQjtBQUNkLFVBQU1qRCxRQUFRaUQsU0FBU0MsTUFBVCxDQUFnQixLQUFLdEQsU0FBckIsQ0FBZDtBQUNBLFFBQUk7QUFDRix1QkFBS3VELGFBQUwsQ0FBbUJ6RCxVQUFVSSxPQUFWLEVBQW5CLEVBQXdDRSxLQUF4QztBQUNELEtBRkQsQ0FFRSxPQUFPb0QsQ0FBUCxFQUFVO0FBQ1Y7QUFDRDtBQUNGOztBQUVEckQsZ0JBQWM7QUFDWixRQUFJLEtBQUtzRCxXQUFULEVBQXNCO0FBQ3BCLFdBQUtBLFdBQUwsQ0FBaUJDLEtBQWpCO0FBQ0Q7O0FBRUQsUUFBSTtBQUNGLFdBQUtELFdBQUwsR0FBbUIsYUFBR0UsS0FBSCxDQUFTN0QsVUFBVUksT0FBVixFQUFULEVBQThCLE1BQU07QUFDckQsYUFBS2MsS0FBTDtBQUNELE9BRmtCLENBQW5CO0FBR0QsS0FKRCxDQUlFLE9BQU80QyxLQUFQLEVBQWM7QUFDZDtBQUNEO0FBQ0Y7QUFsSTRCLEM7OztXQUNWLGtCQUFPLEVBQVAsQzs7Ozs7V0FDSSxLOzs7a0JBRko5RCxTIiwiZmlsZSI6IkZpbGVTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBvYnNlcnZhYmxlLCBhY3Rpb24sIGFzRmxhdCwgdHJhbnNhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCBDU09OIGZyb20gJ3NlYXNvbic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCB7IGRlZXBFeHRlbmQsIGVhY2ggfSBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWxlU3RvcmUge1xuICBAb2JzZXJ2YWJsZSBkYXRhID0gYXNGbGF0KFtdKTtcbiAgQG9ic2VydmFibGUgZmV0Y2hpbmcgPSBmYWxzZTtcbiAgdGVtcGxhdGVzID0gW107XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgZnMuZXhpc3RzKEZpbGVTdG9yZS5nZXRQYXRoKCksIChleGlzdHMpID0+IHtcbiAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlRmlsZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdG9yZShbXSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZUZpbGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRQYXRoKCkge1xuICAgIGNvbnN0IGZpbGVkaXIgPSBhdG9tLmdldENvbmZpZ0RpclBhdGgoKTtcbiAgICBjb25zdCBlbnZTZXR0aW5ncyA9IGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLmVudmlyb25tZW50U3BlY2lmaWNQcm9qZWN0cycpO1xuICAgIGxldCBmaWxlbmFtZSA9ICdwcm9qZWN0cy5jc29uJztcblxuICAgIGlmIChlbnZTZXR0aW5ncykge1xuICAgICAgY29uc3QgaG9zdG5hbWUgPSBvcy5ob3N0bmFtZSgpLnNwbGl0KCcuJykuc2hpZnQoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgZmlsZW5hbWUgPSBgcHJvamVjdHMuJHtob3N0bmFtZX0uY3NvbmA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke2ZpbGVkaXJ9LyR7ZmlsZW5hbWV9YDtcbiAgfVxuXG4gIEBhY3Rpb24gZmV0Y2goKSB7XG4gICAgdGhpcy5mZXRjaGluZyA9IHRydWU7XG4gICAgQ1NPTi5yZWFkRmlsZShGaWxlU3RvcmUuZ2V0UGF0aCgpLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICB0cmFuc2FjdGlvbigoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzID0gW107XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBGaWxlU3RvcmUuaGFuZGxlRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVyciAmJiBkYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVzdWx0cyA9IGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRhdGEuY2xlYXIoKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZXMgPSBbXTtcblxuICAgICAgICAvLyBTdXBwb3J0IGZvciBvbGQgc3RydWN0dXJlLlxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHRzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXN1bHRzID0gT2JqZWN0LmtleXMocmVzdWx0cykubWFwKGsgPT4gcmVzdWx0c1trXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhbiBhcnJheS5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0cykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgZWFjaChyZXN1bHRzLCAocmVzKSA9PiB7XG4gICAgICAgICAgbGV0IHJlc3VsdCA9IHJlcztcbiAgICAgICAgICBjb25zdCB0ZW1wbGF0ZU5hbWUgPSByZXN1bHQudGVtcGxhdGUgfHwgbnVsbDtcblxuICAgICAgICAgIGlmICh0ZW1wbGF0ZU5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gcmVzdWx0cy5maWx0ZXIocHJvcHMgPT4gcHJvcHMudGl0bGUgPT09IHRlbXBsYXRlTmFtZSk7XG5cbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZGVlcEV4dGVuZCh7fSwgdGVtcGxhdGVbMF0sIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKEZpbGVTdG9yZS5pc1Byb2plY3QocmVzdWx0KSkge1xuICAgICAgICAgICAgcmVzdWx0LnNvdXJjZSA9ICdmaWxlJztcblxuICAgICAgICAgICAgdGhpcy5kYXRhLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZXMucHVzaChyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5mZXRjaGluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgaGFuZGxlRXJyb3IoZXJyKSB7XG4gICAgc3dpdGNoIChlcnIubmFtZSkge1xuICAgICAgY2FzZSAnU3ludGF4RXJyb3InOiB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignVGhlcmUgaXMgYSBzeW50YXggZXJyb3IgaW4geW91ciBwcm9qZWN0cyBmaWxlLiBSdW4gKipQcm9qZWN0IE1hbmFnZXI6IEVkaXQgUHJvamVjdHMqKiB0byBvcGVuIGFuZCBmaXggdGhlIGlzc3VlLicsIHtcbiAgICAgICAgICBkZXRhaWw6IGVyci5tZXNzYWdlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBgTGluZTogJHtlcnIubG9jYXRpb24uZmlyc3RfbGluZX0gUm93OiAke2Vyci5sb2NhdGlvbi5maXJzdF9jb2x1bW59YCxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIC8vIE5vIGRlZmF1bHQuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzUHJvamVjdChzZXR0aW5ncykge1xuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MucGF0aHMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHNldHRpbmdzLnBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc3RvcmUocHJvamVjdHMpIHtcbiAgICBjb25zdCBzdG9yZSA9IHByb2plY3RzLmNvbmNhdCh0aGlzLnRlbXBsYXRlcyk7XG4gICAgdHJ5IHtcbiAgICAgIENTT04ud3JpdGVGaWxlU3luYyhGaWxlU3RvcmUuZ2V0UGF0aCgpLCBzdG9yZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gY29uc29sZS5sb2coZSk7XG4gICAgfVxuICB9XG5cbiAgb2JzZXJ2ZUZpbGUoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVdhdGNoZXIpIHtcbiAgICAgIHRoaXMuZmlsZVdhdGNoZXIuY2xvc2UoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5maWxlV2F0Y2hlciA9IGZzLndhdGNoKEZpbGVTdG9yZS5nZXRQYXRoKCksICgpID0+IHtcbiAgICAgICAgdGhpcy5mZXRjaCgpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==