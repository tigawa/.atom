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

            result.paths[i] = result.paths[i].replace('~', _os2['default'].homedir());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9kYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVzQixNQUFNOztzQkFDWCxRQUFROzs7O2tCQUNWLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztrQkFDUixJQUFJOzs7OzhCQUNMLGlCQUFpQjs7OztBQVAvQixXQUFXLENBQUM7O0lBU1MsRUFBRTtBQUNWLFdBRFEsRUFBRSxHQUN5Qjs7O1FBQWxDLFNBQVMseURBQUMsSUFBSTtRQUFFLFdBQVcseURBQUMsSUFBSTs7MEJBRHpCLEVBQUU7O0FBRW5CLFFBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzVDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQzs7QUFFN0Isb0JBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxVQUFDLE1BQU0sRUFBSztBQUNqQyxVQUFJLE1BQU0sRUFBRTtBQUNWLGNBQUssZUFBZSxFQUFFLENBQUM7T0FDeEIsTUFBTTtBQUNMLGNBQUssU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQ3BCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O2VBWmtCLEVBQUU7O1dBa0JQLDBCQUFtQztVQUFsQyxTQUFTLHlEQUFDLElBQUk7VUFBRSxXQUFXLHlEQUFDLElBQUk7O0FBQzdDLFVBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0tBQ2hDOzs7V0FFRyxjQUFDLFFBQVEsRUFBRTs7O0FBQ2IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUN2QixZQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbEIsWUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUksT0FBTyxHQUFHLElBQUksQ0FBQztBQUNuQixZQUFJLE1B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QVEsQ0FBQyxPQUFLLElBQUksRUFBRSxDQUFDLEFBQUUsQ0FBQztBQUMvRCxnQkFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ3BFLG1CQUFLLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7V0FDckM7U0FDRixNQUFNO0FBQ0wsMEJBQUcsU0FBUyxDQUFDLE9BQUssSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFO21CQUFNLFFBQVEsQ0FBQyxFQUFFLENBQUM7V0FBQSxDQUFDLENBQUM7U0FDckQ7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRVEsbUJBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRTtBQUM1QiwwQkFBSyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLFVBQUksUUFBUSxFQUFFO0FBQ1osZ0JBQVEsRUFBRSxDQUFDO09BQ1o7S0FDRjs7O1dBRVksdUJBQUMsT0FBTyxFQUFlO1VBQWIsTUFBTSx5REFBQyxJQUFJOztBQUNoQyxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7QUFDbkMsY0FBTSxFQUFFLE1BQU07QUFDZCxtQkFBVyxFQUFFLElBQUk7T0FDbEIsQ0FBQyxDQUFDO0tBQ0o7OztTQXJMOEIsZUFBRztBQUNoQyxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7S0FDdkU7OztTQWhCa0IsRUFBRTs7O3FCQUFGLEVBQUUiLCJmaWxlIjoiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL2RiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ1NPTiBmcm9tICdzZWFzb24nO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERCIHtcbiAgY29uc3RydWN0b3Ioc2VhcmNoS2V5PW51bGwsIHNlYXJjaFZhbHVlPW51bGwpIHtcbiAgICB0aGlzLnNldFNlYXJjaFF1ZXJ5KHNlYXJjaEtleSwgc2VhcmNoVmFsdWUpO1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICBmcy5leGlzdHModGhpcy5maWxlKCksIChleGlzdHMpID0+IHtcbiAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlUHJvamVjdHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud3JpdGVGaWxlKHt9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBlbnZpcm9ubWVudFNwZWNpZmljUHJvamVjdHMoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLmVudmlyb25tZW50U3BlY2lmaWNQcm9qZWN0cycpO1xuICB9XG5cbiAgc2V0U2VhcmNoUXVlcnkoc2VhcmNoS2V5PW51bGwsIHNlYXJjaFZhbHVlPW51bGwpIHtcbiAgICB0aGlzLnNlYXJjaEtleSA9IHNlYXJjaEtleTtcbiAgICB0aGlzLnNlYXJjaFZhbHVlID0gc2VhcmNoVmFsdWU7XG4gIH1cblxuICBmaW5kKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZWFkRmlsZShyZXN1bHRzID0+IHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgbGV0IHByb2plY3RzID0gW107XG4gICAgICBsZXQgcHJvamVjdCA9IG51bGw7XG4gICAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IG51bGw7XG4gICAgICBsZXQga2V5O1xuXG4gICAgICBmb3IgKGtleSBpbiByZXN1bHRzKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdHNba2V5XTtcbiAgICAgICAgdGVtcGxhdGUgPSByZXN1bHQudGVtcGxhdGUgfHwgbnVsbDtcbiAgICAgICAgcmVzdWx0Ll9pZCA9IGtleTtcblxuICAgICAgICBpZiAodGVtcGxhdGUgJiYgcmVzdWx0c1t0ZW1wbGF0ZV0gIT09IG51bGwpIHtcbiAgICAgICAgICByZXN1bHQgPSBfLmRlZXBFeHRlbmQocmVzdWx0LCByZXN1bHRzW3RlbXBsYXRlXSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpIGluIHJlc3VsdC5wYXRocykge1xuICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LnBhdGhzW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0LnBhdGhzW2ldID0gcmVzdWx0LnBhdGhzW2ldLnJlcGxhY2UoJ34nLCBvcy5ob21lZGlyKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvamVjdHMucHVzaChyZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zZWFyY2hLZXkgJiYgdGhpcy5zZWFyY2hWYWx1ZSkge1xuICAgICAgICBmb3IgKGtleSBpbiBwcm9qZWN0cykge1xuICAgICAgICAgIHByb2plY3QgPSBwcm9qZWN0c1trZXldO1xuICAgICAgICAgIGlmIChfLmlzRXF1YWwocHJvamVjdFt0aGlzLnNlYXJjaEtleV0sIHRoaXMuc2VhcmNoVmFsdWUpKSB7XG4gICAgICAgICAgICBmb3VuZCA9IHByb2plY3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3VuZCA9IHByb2plY3RzO1xuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhmb3VuZCk7XG4gICAgfSk7XG4gIH1cblxuICBhZGQocHJvcHMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZWFkRmlsZShwcm9qZWN0cyA9PiB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMuZ2VuZXJhdGVJRChwcm9wcy50aXRsZSk7XG4gICAgICBwcm9qZWN0c1tpZF0gPSBwcm9wcztcblxuICAgICAgdGhpcy53cml0ZUZpbGUocHJvamVjdHMsICgpID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoYCR7cHJvcHMudGl0bGV9IGhhcyBiZWVuIGFkZGVkYCk7XG4gICAgICAgIGNhbGxiYWNrKGlkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlKHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcy5faWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgcHJvamVjdCA9IG51bGw7XG4gICAgbGV0IGtleTtcbiAgICB0aGlzLnJlYWRGaWxlKHByb2plY3RzID0+IHtcbiAgICAgIGZvciAoa2V5IGluIHByb2plY3RzKSB7XG4gICAgICAgIHByb2plY3QgPSBwcm9qZWN0c1trZXldO1xuICAgICAgICBpZiAoa2V5ID09PSBwcm9wcy5faWQpIHtcbiAgICAgICAgICBkZWxldGUocHJvcHMuX2lkKTtcbiAgICAgICAgICBwcm9qZWN0c1trZXldID0gcHJvcHM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndyaXRlRmlsZShwcm9qZWN0cyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkZWxldGUoaWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZWFkRmlsZShwcm9qZWN0cyA9PiB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gcHJvamVjdHMpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gaWQpIHtcbiAgICAgICAgICBkZWxldGUocHJvamVjdHNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy53cml0ZUZpbGUocHJvamVjdHMsICgpID0+IHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBvblVwZGF0ZShjYWxsYmFjaykge1xuICAgIHRoaXMuZW1pdHRlci5vbignZGItdXBkYXRlZCcsICgpID0+IHtcbiAgICAgIHRoaXMuZmluZChjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBvYnNlcnZlUHJvamVjdHMoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVdhdGNoZXIpIHtcbiAgICAgIHRoaXMuZmlsZVdhdGNoZXIuY2xvc2UoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5maWxlV2F0Y2hlciA9IGZzLndhdGNoKHRoaXMuZmlsZSgpLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkYi11cGRhdGVkJyk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbGV0IHVybCA9ICdodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2Jsb2IvbWFzdGVyL2RvY3MvJztcbiAgICAgIHVybCArPSAnYnVpbGQtaW5zdHJ1Y3Rpb25zL2xpbnV4Lm1kI3R5cGVlcnJvci11bmFibGUtdG8td2F0Y2gtcGF0aCc7XG4gICAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy5maWxlKCkpO1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYDxiPlByb2plY3QgTWFuYWdlcjwvYj48YnI+Q291bGQgbm90IHdhdGNoIGNoYW5nZXNcbiAgICAgICAgdG8gJHtmaWxlbmFtZX0uIE1ha2Ugc3VyZSB5b3UgaGF2ZSBwZXJtaXNzaW9ucyB0byAke3RoaXMuZmlsZSgpfS5cbiAgICAgICAgT24gbGludXggdGhlcmUgY2FuIGJlIHByb2JsZW1zIHdpdGggd2F0Y2ggc2l6ZXMuXG4gICAgICAgIFNlZSA8YSBocmVmPScke3VybH0nPiB0aGlzIGRvY3VtZW50PC9hPiBmb3IgbW9yZSBpbmZvLj5gO1xuICAgICAgdGhpcy5ub3RpZnlGYWlsdXJlKGVycm9yTWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlRmlsZSgpIHtcbiAgICBmcy5leGlzdHModGhpcy5maWxlKHRydWUpLCAoZXhpc3RzKSA9PiB7XG4gICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICB0aGlzLndyaXRlRmlsZSh7fSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZW5lcmF0ZUlEKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXFxzKy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIGZpbGUoKSB7XG4gICAgbGV0IGZpbGVuYW1lID0gJ3Byb2plY3RzLmNzb24nO1xuICAgIGNvbnN0IGZpbGVkaXIgPSBhdG9tLmdldENvbmZpZ0RpclBhdGgoKTtcblxuICAgIGlmICh0aGlzLmVudmlyb25tZW50U3BlY2lmaWNQcm9qZWN0cykge1xuICAgICAgbGV0IGhvc3RuYW1lID0gb3MuaG9zdG5hbWUoKS5zcGxpdCgnLicpLnNoaWZ0KCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGZpbGVuYW1lID0gYHByb2plY3RzLiR7aG9zdG5hbWV9LmNzb25gO1xuICAgIH1cblxuICAgIHJldHVybiBgJHtmaWxlZGlyfS8ke2ZpbGVuYW1lfWA7XG4gIH1cblxuICByZWFkRmlsZShjYWxsYmFjaykge1xuICAgIGZzLmV4aXN0cyh0aGlzLmZpbGUoKSwgKGV4aXN0cykgPT4ge1xuICAgICAgaWYgKGV4aXN0cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBwcm9qZWN0cyA9IENTT04ucmVhZEZpbGVTeW5jKHRoaXMuZmlsZSgpKSB8fCB7fTtcbiAgICAgICAgICBjYWxsYmFjayhwcm9qZWN0cyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBGYWlsZWQgdG8gbG9hZCAke3BhdGguYmFzZW5hbWUodGhpcy5maWxlKCkpfWA7XG4gICAgICAgICAgY29uc3QgZGV0YWlsID0gZXJyb3IubG9jYXRpb24gIT0gbnVsbCA/IGVycm9yLnN0YWNrIDogZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICB0aGlzLm5vdGlmeUZhaWx1cmUobWVzc2FnZSwgZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnMud3JpdGVGaWxlKHRoaXMuZmlsZSgpLCAne30nLCAoKSA9PiBjYWxsYmFjayh7fSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgd3JpdGVGaWxlKHByb2plY3RzLCBjYWxsYmFjaykge1xuICAgIENTT04ud3JpdGVGaWxlU3luYyh0aGlzLmZpbGUoKSwgcHJvamVjdHMpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBub3RpZnlGYWlsdXJlKG1lc3NhZ2UsIGRldGFpbD1udWxsKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UsIHtcbiAgICAgIGRldGFpbDogZGV0YWlsLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICB9KTtcbiAgfVxufVxuIl19
//# sourceURL=/Users/igawataiichi/.atom/packages/project-manager/lib/db.js
