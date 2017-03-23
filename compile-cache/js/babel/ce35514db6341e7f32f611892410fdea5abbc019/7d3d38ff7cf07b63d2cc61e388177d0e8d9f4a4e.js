Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

'use babel';

var DB = (function () {
  function DB() {
    var _this = this;

    var searchKey = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var searchValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, DB);

    this.setSearchQuery(searchKey, searchValue);
    this.emitter = new _atom.Emitter();

    _fs2['default'].exists(this.file(), function (exists) {
      if (exists) {
        _this.observeProjects();
      } else {
        _this.writeFile({});
      }
    });
  }

  _createClass(DB, [{
    key: 'setSearchQuery',
    value: function setSearchQuery() {
      var searchKey = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var searchValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.searchKey = searchKey;
      this.searchValue = searchValue;
    }
  }, {
    key: 'find',
    value: function find(callback) {
      var _this2 = this;

      this.readFile(function (results) {
        var found = false;
        var projects = [];
        var project = null;
        var result = null;
        var template = null;
        var key = undefined;

        for (key in results) {
          result = results[key];
          template = result.template || null;
          result._id = key;

          if (template && results[template] !== null) {
            result = _underscorePlus2['default'].deepExtend(result, results[template]);
          }

          for (var i in result.paths) {
            if (typeof result.paths[i] !== 'string') {
              continue;
            }

            if (result.paths[i].charAt(0) === '~') {
              result.paths[i] = result.paths[i].replace('~', _os2['default'].homedir());
            }
          }

          projects.push(result);
        }

        if (_this2.searchKey && _this2.searchValue) {
          for (key in projects) {
            project = projects[key];
            if (_underscorePlus2['default'].isEqual(project[_this2.searchKey], _this2.searchValue)) {
              found = project;
            }
          }
        } else {
          found = projects;
        }

        callback(found);
      });
    }
  }, {
    key: 'add',
    value: function add(props, callback) {
      var _this3 = this;

      this.readFile(function (projects) {
        var id = _this3.generateID(props.title);
        projects[id] = props;

        _this3.writeFile(projects, function () {
          atom.notifications.addSuccess(props.title + ' has been added');
          callback(id);
        });
      });
    }
  }, {
    key: 'update',
    value: function update(props) {
      var _this4 = this;

      if (!props._id) {
        return false;
      }

      var project = null;
      var key = undefined;
      this.readFile(function (projects) {
        for (key in projects) {
          project = projects[key];
          if (key === props._id) {
            delete props._id;
            projects[key] = props;
          }

          _this4.writeFile(projects);
        }
      });
    }
  }, {
    key: 'delete',
    value: function _delete(id, callback) {
      var _this5 = this;

      this.readFile(function (projects) {
        for (var key in projects) {
          if (key === id) {
            delete projects[key];
          }
        }

        _this5.writeFile(projects, function () {
          if (callback) {
            callback();
          }
        });
      });
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(callback) {
      var _this6 = this;

      this.emitter.on('db-updated', function () {
        _this6.find(callback);
      });
    }
  }, {
    key: 'observeProjects',
    value: function observeProjects() {
      var _this7 = this;

      if (this.fileWatcher) {
        this.fileWatcher.close();
      }

      try {
        this.fileWatcher = _fs2['default'].watch(this.file(), function () {
          _this7.emitter.emit('db-updated');
        });
      } catch (error) {
        var url = 'https://github.com/atom/atom/blob/master/docs/';
        url += 'build-instructions/linux.md#typeerror-unable-to-watch-path';
        var filename = _path2['default'].basename(this.file());
        var errorMessage = '<b>Project Manager</b><br>Could not watch changes\n        to ' + filename + '. Make sure you have permissions to ' + this.file() + '.\n        On linux there can be problems with watch sizes.\n        See <a href=\'' + url + '\'> this document</a> for more info.>';
        this.notifyFailure(errorMessage);
      }
    }
  }, {
    key: 'updateFile',
    value: function updateFile() {
      var _this8 = this;

      _fs2['default'].exists(this.file(true), function (exists) {
        if (!exists) {
          _this8.writeFile({});
        }
      });
    }
  }, {
    key: 'generateID',
    value: function generateID(string) {
      return string.replace(/\s+/g, '').toLowerCase();
    }
  }, {
    key: 'file',
    value: function file() {
      var filename = 'projects.cson';
      var filedir = atom.getConfigDirPath();

      if (this.environmentSpecificProjects) {
        var hostname = _os2['default'].hostname().split('.').shift().toLowerCase();
        filename = 'projects.' + hostname + '.cson';
      }

      return filedir + '/' + filename;
    }
  }, {
    key: 'readFile',
    value: function readFile(callback) {
      var _this9 = this;

      _fs2['default'].exists(this.file(), function (exists) {
        if (exists) {
          try {
            var projects = _season2['default'].readFileSync(_this9.file()) || {};
            callback(projects);
          } catch (error) {
            var message = 'Failed to load ' + _path2['default'].basename(_this9.file());
            var detail = error.location != null ? error.stack : error.message;
            _this9.notifyFailure(message, detail);
          }
        } else {
          _fs2['default'].writeFile(_this9.file(), '{}', function () {
            return callback({});
          });
        }
      });
    }
  }, {
    key: 'writeFile',
    value: function writeFile(projects, callback) {
      _season2['default'].writeFileSync(this.file(), projects);
      if (callback) {
        callback();
      }
    }
  }, {
    key: 'notifyFailure',
    value: function notifyFailure(message) {
      var detail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      atom.notifications.addError(message, {
        detail: detail,
        dismissable: true
      });
    }
  }, {
    key: 'environmentSpecificProjects',
    get: function get() {
      return atom.config.get('project-manager.environmentSpecificProjects');
    }
  }]);

  return DB;
})();

exports['default'] = DB;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9kYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVzQixNQUFNOztzQkFDWCxRQUFROzs7O2tCQUNWLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztrQkFDUixJQUFJOzs7OzhCQUNMLGlCQUFpQjs7OztBQVAvQixXQUFXLENBQUM7O0lBU1MsRUFBRTtBQUNWLFdBRFEsRUFBRSxHQUN5Qjs7O1FBQWxDLFNBQVMseURBQUMsSUFBSTtRQUFFLFdBQVcseURBQUMsSUFBSTs7MEJBRHpCLEVBQUU7O0FBRW5CLFFBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzVDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQzs7QUFFN0Isb0JBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxVQUFDLE1BQU0sRUFBSztBQUNqQyxVQUFJLE1BQU0sRUFBRTtBQUNWLGNBQUssZUFBZSxFQUFFLENBQUM7T0FDeEIsTUFBTTtBQUNMLGNBQUssU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQ3BCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O2VBWmtCLEVBQUU7O1dBa0JQLDBCQUFtQztVQUFsQyxTQUFTLHlEQUFDLElBQUk7VUFBRSxXQUFXLHlEQUFDLElBQUk7O0FBQzdDLFVBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0tBQ2hDOzs7V0FFRyxjQUFDLFFBQVEsRUFBRTs7O0FBQ2IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUN2QixZQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbEIsWUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUksT0FBTyxHQUFHLElBQUksQ0FBQztBQUNuQixZQUFJLE1B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Q3BELG9CQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7V0FDcEIsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNkLGdCQUFNLE9BQU8sdUJBQXFCLGtCQUFLLFFBQVEsQ0FBQyxPQUFLLElBQUksRUFBRSxDQUFDLEFBQUUsQ0FBQztBQUMvRCxnQkFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ3BFLG1CQUFLLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7V0FDckM7U0FDRixNQUFNO0FBQ0wsMEJBQUcsU0FBUyxDQUFDLE9BQUssSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFO21CQUFNLFFBQVEsQ0FBQyxFQUFFLENBQUM7V0FBQSxDQUFDLENBQUM7U0FDckQ7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRVEsbUJBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRTtBQUM1QiwwQkFBSyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLFVBQUksUUFBUSxFQUFFO0FBQ1osZ0JBQVEsRUFBRSxDQUFDO09BQ1o7S0FDRjs7O1dBRVksdUJBQUMsT0FBTyxFQUFlO1VBQWIsTUFBTSx5REFBQyxJQUFJOztBQUNoQyxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7QUFDbkMsY0FBTSxFQUFFLE1BQU07QUFDZCxtQkFBVyxFQUFFLElBQUk7T0FDbEIsQ0FBQyxDQUFDO0tBQ0o7OztTQXZMOEIsZUFBRztBQUNoQyxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7S0FDdkU7OztTQWhCa0IsRUFBRTs7O3FCQUFGLEVBQUUiLCJmaWxlIjoiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL2RiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ1NPTiBmcm9tICdzZWFzb24nO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERCIHtcbiAgY29uc3RydWN0b3Ioc2VhcmNoS2V5PW51bGwsIHNlYXJjaFZhbHVlPW51bGwpIHtcbiAgICB0aGlzLnNldFNlYXJjaFF1ZXJ5KHNlYXJjaEtleSwgc2VhcmNoVmFsdWUpO1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICBmcy5leGlzdHModGhpcy5maWxlKCksIChleGlzdHMpID0+IHtcbiAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlUHJvamVjdHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud3JpdGVGaWxlKHt9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBlbnZpcm9ubWVudFNwZWNpZmljUHJvamVjdHMoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLmVudmlyb25tZW50U3BlY2lmaWNQcm9qZWN0cycpO1xuICB9XG5cbiAgc2V0U2VhcmNoUXVlcnkoc2VhcmNoS2V5PW51bGwsIHNlYXJjaFZhbHVlPW51bGwpIHtcbiAgICB0aGlzLnNlYXJjaEtleSA9IHNlYXJjaEtleTtcbiAgICB0aGlzLnNlYXJjaFZhbHVlID0gc2VhcmNoVmFsdWU7XG4gIH1cblxuICBmaW5kKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZWFkRmlsZShyZXN1bHRzID0+IHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgbGV0IHByb2plY3RzID0gW107XG4gICAgICBsZXQgcHJvamVjdCA9IG51bGw7XG4gICAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IG51bGw7XG4gICAgICBsZXQga2V5O1xuXG4gICAgICBmb3IgKGtleSBpbiByZXN1bHRzKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdHNba2V5XTtcbiAgICAgICAgdGVtcGxhdGUgPSByZXN1bHQudGVtcGxhdGUgfHwgbnVsbDtcbiAgICAgICAgcmVzdWx0Ll9pZCA9IGtleTtcblxuICAgICAgICBpZiAodGVtcGxhdGUgJiYgcmVzdWx0c1t0ZW1wbGF0ZV0gIT09IG51bGwpIHtcbiAgICAgICAgICByZXN1bHQgPSBfLmRlZXBFeHRlbmQocmVzdWx0LCByZXN1bHRzW3RlbXBsYXRlXSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpIGluIHJlc3VsdC5wYXRocykge1xuICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LnBhdGhzW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3VsdC5wYXRoc1tpXS5jaGFyQXQoMCkgPT09ICd+Jykge1xuICAgICAgICAgICAgcmVzdWx0LnBhdGhzW2ldID0gcmVzdWx0LnBhdGhzW2ldLnJlcGxhY2UoJ34nLCBvcy5ob21lZGlyKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb2plY3RzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc2VhcmNoS2V5ICYmIHRoaXMuc2VhcmNoVmFsdWUpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gcHJvamVjdHMpIHtcbiAgICAgICAgICBwcm9qZWN0ID0gcHJvamVjdHNba2V5XTtcbiAgICAgICAgICBpZiAoXy5pc0VxdWFsKHByb2plY3RbdGhpcy5zZWFyY2hLZXldLCB0aGlzLnNlYXJjaFZhbHVlKSkge1xuICAgICAgICAgICAgZm91bmQgPSBwcm9qZWN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmQgPSBwcm9qZWN0cztcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZm91bmQpO1xuICAgIH0pO1xuICB9XG5cbiAgYWRkKHByb3BzLCBjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocHJvamVjdHMgPT4ge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSUQocHJvcHMudGl0bGUpO1xuICAgICAgcHJvamVjdHNbaWRdID0gcHJvcHM7XG5cbiAgICAgIHRoaXMud3JpdGVGaWxlKHByb2plY3RzLCAoKSA9PiB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGAke3Byb3BzLnRpdGxlfSBoYXMgYmVlbiBhZGRlZGApO1xuICAgICAgICBjYWxsYmFjayhpZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZShwcm9wcykge1xuICAgIGlmICghcHJvcHMuX2lkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHByb2plY3QgPSBudWxsO1xuICAgIGxldCBrZXk7XG4gICAgdGhpcy5yZWFkRmlsZShwcm9qZWN0cyA9PiB7XG4gICAgICBmb3IgKGtleSBpbiBwcm9qZWN0cykge1xuICAgICAgICBwcm9qZWN0ID0gcHJvamVjdHNba2V5XTtcbiAgICAgICAgaWYgKGtleSA9PT0gcHJvcHMuX2lkKSB7XG4gICAgICAgICAgZGVsZXRlKHByb3BzLl9pZCk7XG4gICAgICAgICAgcHJvamVjdHNba2V5XSA9IHByb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53cml0ZUZpbGUocHJvamVjdHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlKGlkLCBjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocHJvamVjdHMgPT4ge1xuICAgICAgZm9yIChsZXQga2V5IGluIHByb2plY3RzKSB7XG4gICAgICAgIGlmIChrZXkgPT09IGlkKSB7XG4gICAgICAgICAgZGVsZXRlKHByb2plY3RzW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMud3JpdGVGaWxlKHByb2plY3RzLCAoKSA9PiB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgb25VcGRhdGUoY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ2RiLXVwZGF0ZWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmZpbmQoY2FsbGJhY2spO1xuICAgIH0pO1xuICB9XG5cbiAgb2JzZXJ2ZVByb2plY3RzKCkge1xuICAgIGlmICh0aGlzLmZpbGVXYXRjaGVyKSB7XG4gICAgICB0aGlzLmZpbGVXYXRjaGVyLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZmlsZVdhdGNoZXIgPSBmcy53YXRjaCh0aGlzLmZpbGUoKSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGItdXBkYXRlZCcpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxldCB1cmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL21hc3Rlci9kb2NzLyc7XG4gICAgICB1cmwgKz0gJ2J1aWxkLWluc3RydWN0aW9ucy9saW51eC5tZCN0eXBlZXJyb3ItdW5hYmxlLXRvLXdhdGNoLXBhdGgnO1xuICAgICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMuZmlsZSgpKTtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGA8Yj5Qcm9qZWN0IE1hbmFnZXI8L2I+PGJyPkNvdWxkIG5vdCB3YXRjaCBjaGFuZ2VzXG4gICAgICAgIHRvICR7ZmlsZW5hbWV9LiBNYWtlIHN1cmUgeW91IGhhdmUgcGVybWlzc2lvbnMgdG8gJHt0aGlzLmZpbGUoKX0uXG4gICAgICAgIE9uIGxpbnV4IHRoZXJlIGNhbiBiZSBwcm9ibGVtcyB3aXRoIHdhdGNoIHNpemVzLlxuICAgICAgICBTZWUgPGEgaHJlZj0nJHt1cmx9Jz4gdGhpcyBkb2N1bWVudDwvYT4gZm9yIG1vcmUgaW5mby4+YDtcbiAgICAgIHRoaXMubm90aWZ5RmFpbHVyZShlcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUZpbGUoKSB7XG4gICAgZnMuZXhpc3RzKHRoaXMuZmlsZSh0cnVlKSwgKGV4aXN0cykgPT4ge1xuICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgdGhpcy53cml0ZUZpbGUoe30pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2VuZXJhdGVJRChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1xccysvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICBmaWxlKCkge1xuICAgIGxldCBmaWxlbmFtZSA9ICdwcm9qZWN0cy5jc29uJztcbiAgICBjb25zdCBmaWxlZGlyID0gYXRvbS5nZXRDb25maWdEaXJQYXRoKCk7XG5cbiAgICBpZiAodGhpcy5lbnZpcm9ubWVudFNwZWNpZmljUHJvamVjdHMpIHtcbiAgICAgIGxldCBob3N0bmFtZSA9IG9zLmhvc3RuYW1lKCkuc3BsaXQoJy4nKS5zaGlmdCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBmaWxlbmFtZSA9IGBwcm9qZWN0cy4ke2hvc3RuYW1lfS5jc29uYDtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7ZmlsZWRpcn0vJHtmaWxlbmFtZX1gO1xuICB9XG5cbiAgcmVhZEZpbGUoY2FsbGJhY2spIHtcbiAgICBmcy5leGlzdHModGhpcy5maWxlKCksIChleGlzdHMpID0+IHtcbiAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgcHJvamVjdHMgPSBDU09OLnJlYWRGaWxlU3luYyh0aGlzLmZpbGUoKSkgfHwge307XG4gICAgICAgICAgY2FsbGJhY2socHJvamVjdHMpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgRmFpbGVkIHRvIGxvYWQgJHtwYXRoLmJhc2VuYW1lKHRoaXMuZmlsZSgpKX1gO1xuICAgICAgICAgIGNvbnN0IGRldGFpbCA9IGVycm9yLmxvY2F0aW9uICE9IG51bGwgPyBlcnJvci5zdGFjayA6IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgdGhpcy5ub3RpZnlGYWlsdXJlKG1lc3NhZ2UsIGRldGFpbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLndyaXRlRmlsZSh0aGlzLmZpbGUoKSwgJ3t9JywgKCkgPT4gY2FsbGJhY2soe30pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHdyaXRlRmlsZShwcm9qZWN0cywgY2FsbGJhY2spIHtcbiAgICBDU09OLndyaXRlRmlsZVN5bmModGhpcy5maWxlKCksIHByb2plY3RzKTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgbm90aWZ5RmFpbHVyZShtZXNzYWdlLCBkZXRhaWw9bnVsbCkge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7XG4gICAgICBkZXRhaWw6IGRldGFpbCxcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==