'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Manager = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _desc, _value, _class, _descriptor, _descriptor2;

var _mobx = require('mobx');

var _untildify = require('untildify');

var _untildify2 = _interopRequireDefault(_untildify);

var _tildify = require('tildify');

var _tildify2 = _interopRequireDefault(_tildify);

var _atomProjectUtil = require('atom-project-util');

var _atomProjectUtil2 = _interopRequireDefault(_atomProjectUtil);

var _underscorePlus = require('underscore-plus');

var _FileStore = require('./stores/FileStore');

var _FileStore2 = _interopRequireDefault(_FileStore);

var _GitStore = require('./stores/GitStore');

var _GitStore2 = _interopRequireDefault(_GitStore);

var _Settings = require('./Settings');

var _Settings2 = _interopRequireDefault(_Settings);

var _Project = require('./models/Project');

var _Project2 = _interopRequireDefault(_Project);

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

let Manager = exports.Manager = (_class = class Manager {
  get activeProject() {
    if (this.activePaths.length === 0) {
      return null;
    }

    return this.projects.find(project => project.rootPath === this.activePaths[0]);
  }

  constructor() {
    _initDefineProp(this, 'projects', _descriptor, this);

    _initDefineProp(this, 'activePaths', _descriptor2, this);

    this.gitStore = new _GitStore2.default();
    this.fileStore = new _FileStore2.default();
    this.settings = new _Settings2.default();

    this.fetchProjects();

    atom.config.observe('project-manager.includeGitRepositories', include => {
      if (include) {
        this.gitStore.fetch();
      } else {
        this.gitStore.empty();
      }
    });

    (0, _mobx.autorun)(() => {
      (0, _underscorePlus.each)(this.fileStore.data, fileProp => {
        this.addProject(fileProp);
      }, this);
    });

    (0, _mobx.autorun)(() => {
      (0, _underscorePlus.each)(this.gitStore.data, gitProp => {
        this.addProject(gitProp);
      }, this);
    });

    (0, _mobx.autorun)(() => {
      if (this.activeProject) {
        this.settings.load(this.activeProject.settings);
      }
    });

    this.activePaths = atom.project.getPaths();
    atom.project.onDidChangePaths(() => {
      this.activePaths = atom.project.getPaths();
      const activePaths = atom.project.getPaths();

      if (this.activeProject && this.activeProject.rootPath === activePaths[0]) {
        if (this.activeProject.paths.length !== activePaths.length) {
          this.activeProject.updateProps({ paths: activePaths });
          this.saveProjects();
        }
      }
    });
  }

  /**
   * Create or Update a project.
   *
   * Props coming from file goes before any other source.
   */
  addProject(props) {
    const foundProject = this.projects.find(project => {
      const projectRootPath = project.rootPath.toLowerCase();
      const propsRootPath = (0, _untildify2.default)(props.paths[0]).toLowerCase();
      return projectRootPath === propsRootPath;
    });

    if (!foundProject) {
      const newProject = new _Project2.default(props);
      this.projects.push(newProject);
    } else {
      if (foundProject.source === 'file' && props.source === 'file') {
        foundProject.updateProps(props);
      }

      if (props.source === 'file' || typeof props.source === 'undefined') {
        foundProject.updateProps(props);
      }
    }
  }

  fetchProjects() {
    this.fileStore.fetch();

    if (atom.config.get('project-manager.includeGitRepositories')) {
      this.gitStore.fetch();
    }
  }

  static open(project, openInSameWindow = false) {
    if (Manager.isProject(project)) {
      const { devMode } = project.getProps();

      if (openInSameWindow) {
        _atomProjectUtil2.default.switch(project.paths);
      } else {
        atom.open({
          devMode,
          pathsToOpen: project.paths
        });
      }
    }
  }

  saveProject(props) {
    let propsToSave = props;
    if (Manager.isProject(props)) {
      propsToSave = props.getProps();
    }
    this.addProject(_extends({}, propsToSave, { source: 'file' }));
    this.saveProjects();
  }

  saveProjects() {
    const projects = this.projects.filter(project => project.props.source === 'file');

    const arr = (0, _underscorePlus.map)(projects, project => {
      const props = project.getChangedProps();
      delete props.source;

      if (atom.config.get('project-manager.savePathsRelativeToHome')) {
        props.paths = props.paths.map(path => (0, _tildify2.default)(path));
      }

      return props;
    });

    this.fileStore.store(arr);
  }

  static isProject(project) {
    if (project instanceof _Project2.default) {
      return true;
    }

    return false;
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'projects', [_mobx.observable], {
  enumerable: true,
  initializer: function () {
    return [];
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'activePaths', [_mobx.observable], {
  enumerable: true,
  initializer: function () {
    return [];
  }
}), _applyDecoratedDescriptor(_class.prototype, 'activeProject', [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, 'activeProject'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'addProject', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'addProject'), _class.prototype)), _class);


const manager = new Manager();
exports.default = manager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1hbmFnZXIuanMiXSwibmFtZXMiOlsiTWFuYWdlciIsImFjdGl2ZVByb2plY3QiLCJhY3RpdmVQYXRocyIsImxlbmd0aCIsInByb2plY3RzIiwiZmluZCIsInByb2plY3QiLCJyb290UGF0aCIsImNvbnN0cnVjdG9yIiwiZ2l0U3RvcmUiLCJmaWxlU3RvcmUiLCJzZXR0aW5ncyIsImZldGNoUHJvamVjdHMiLCJhdG9tIiwiY29uZmlnIiwib2JzZXJ2ZSIsImluY2x1ZGUiLCJmZXRjaCIsImVtcHR5IiwiZGF0YSIsImZpbGVQcm9wIiwiYWRkUHJvamVjdCIsImdpdFByb3AiLCJsb2FkIiwiZ2V0UGF0aHMiLCJvbkRpZENoYW5nZVBhdGhzIiwicGF0aHMiLCJ1cGRhdGVQcm9wcyIsInNhdmVQcm9qZWN0cyIsInByb3BzIiwiZm91bmRQcm9qZWN0IiwicHJvamVjdFJvb3RQYXRoIiwidG9Mb3dlckNhc2UiLCJwcm9wc1Jvb3RQYXRoIiwibmV3UHJvamVjdCIsInB1c2giLCJzb3VyY2UiLCJnZXQiLCJvcGVuIiwib3BlbkluU2FtZVdpbmRvdyIsImlzUHJvamVjdCIsImRldk1vZGUiLCJnZXRQcm9wcyIsInN3aXRjaCIsInBhdGhzVG9PcGVuIiwic2F2ZVByb2plY3QiLCJwcm9wc1RvU2F2ZSIsImZpbHRlciIsImFyciIsImdldENoYW5nZWRQcm9wcyIsIm1hcCIsInBhdGgiLCJzdG9yZSIsIm1hbmFnZXIiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQUVBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRWFBLE8sV0FBQUEsTyxhQUFOLE1BQU1BLE9BQU4sQ0FBYztBQUlULE1BQUlDLGFBQUosR0FBb0I7QUFDNUIsUUFBSSxLQUFLQyxXQUFMLENBQWlCQyxNQUFqQixLQUE0QixDQUFoQyxFQUFtQztB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QWQ7QUFDQSxhQUFPcEIsTUFBTU8sTUFBYjs7QUFFQSxVQUFJdkIsS0FBS0MsTUFBTCxDQUFZdUIsR0FBWixDQUFnQix5Q0FBaEIsQ0FBSixFQUFnRTtBQUM5RFIsY0FBTUgsS0FBTixHQUFjRyxNQUFNSCxLQUFOLENBQVl3QixHQUFaLENBQWdCQyxRQUFRLHVCQUFRQSxJQUFSLENBQXhCLENBQWQ7QUFDRDs7QUFFRCxhQUFPdEIsS0FBUDtBQUNELEtBVFcsQ0FBWjs7QUFXQSxTQUFLbkIsU0FBTCxDQUFlMEMsS0FBZixDQUFxQkosR0FBckI7QUFDRDs7QUFFRCxTQUFPUixTQUFQLENBQWlCbEMsT0FBakIsRUFBMEI7QUFDeEIsUUFBSUEsb0NBQUosRUFBZ0M7QUFDOUIsYUFBTyxJQUFQO0FBQ0Q7O0FBRUQsV0FBTyxLQUFQO0FBQ0Q7QUE1SWtCLEM7OztXQUNJLEU7Ozs7O1dBQ0csRTs7Ozs7QUE2STVCLE1BQU0rQyxVQUFVLElBQUlyRCxPQUFKLEVBQWhCO2tCQUNlcUQsTyIsImZpbGUiOiJNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IG9ic2VydmFibGUsIGF1dG9ydW4sIGNvbXB1dGVkLCBhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB1bnRpbGRpZnkgZnJvbSAndW50aWxkaWZ5JztcbmltcG9ydCB0aWxkaWZ5IGZyb20gJ3RpbGRpZnknO1xuaW1wb3J0IHByb2plY3RVdGlsIGZyb20gJ2F0b20tcHJvamVjdC11dGlsJztcbmltcG9ydCB7IGVhY2gsIG1hcCB9IGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5pbXBvcnQgRmlsZVN0b3JlIGZyb20gJy4vc3RvcmVzL0ZpbGVTdG9yZSc7XG5pbXBvcnQgR2l0U3RvcmUgZnJvbSAnLi9zdG9yZXMvR2l0U3RvcmUnO1xuaW1wb3J0IFNldHRpbmdzIGZyb20gJy4vU2V0dGluZ3MnO1xuaW1wb3J0IFByb2plY3QgZnJvbSAnLi9tb2RlbHMvUHJvamVjdCc7XG5cbmV4cG9ydCBjbGFzcyBNYW5hZ2VyIHtcbiAgQG9ic2VydmFibGUgcHJvamVjdHMgPSBbXTtcbiAgQG9ic2VydmFibGUgYWN0aXZlUGF0aHMgPSBbXTtcblxuICBAY29tcHV0ZWQgZ2V0IGFjdGl2ZVByb2plY3QoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlUGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9qZWN0cy5maW5kKHByb2plY3QgPT4gcHJvamVjdC5yb290UGF0aCA9PT0gdGhpcy5hY3RpdmVQYXRoc1swXSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmdpdFN0b3JlID0gbmV3IEdpdFN0b3JlKCk7XG4gICAgdGhpcy5maWxlU3RvcmUgPSBuZXcgRmlsZVN0b3JlKCk7XG4gICAgdGhpcy5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xuXG4gICAgdGhpcy5mZXRjaFByb2plY3RzKCk7XG5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdwcm9qZWN0LW1hbmFnZXIuaW5jbHVkZUdpdFJlcG9zaXRvcmllcycsIChpbmNsdWRlKSA9PiB7XG4gICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICB0aGlzLmdpdFN0b3JlLmZldGNoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdpdFN0b3JlLmVtcHR5KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBhdXRvcnVuKCgpID0+IHtcbiAgICAgIGVhY2godGhpcy5maWxlU3RvcmUuZGF0YSwgKGZpbGVQcm9wKSA9PiB7XG4gICAgICAgIHRoaXMuYWRkUHJvamVjdChmaWxlUHJvcCk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9KTtcblxuICAgIGF1dG9ydW4oKCkgPT4ge1xuICAgICAgZWFjaCh0aGlzLmdpdFN0b3JlLmRhdGEsIChnaXRQcm9wKSA9PiB7XG4gICAgICAgIHRoaXMuYWRkUHJvamVjdChnaXRQcm9wKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgYXV0b3J1bigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5hY3RpdmVQcm9qZWN0KSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MubG9hZCh0aGlzLmFjdGl2ZVByb2plY3Quc2V0dGluZ3MpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hY3RpdmVQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZlUGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgICAgIGNvbnN0IGFjdGl2ZVBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG5cbiAgICAgIGlmICh0aGlzLmFjdGl2ZVByb2plY3QgJiYgdGhpcy5hY3RpdmVQcm9qZWN0LnJvb3RQYXRoID09PSBhY3RpdmVQYXRoc1swXSkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVQcm9qZWN0LnBhdGhzLmxlbmd0aCAhPT0gYWN0aXZlUGF0aHMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVQcm9qZWN0LnVwZGF0ZVByb3BzKHsgcGF0aHM6IGFjdGl2ZVBhdGhzIH0pO1xuICAgICAgICAgIHRoaXMuc2F2ZVByb2plY3RzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgb3IgVXBkYXRlIGEgcHJvamVjdC5cbiAgICpcbiAgICogUHJvcHMgY29taW5nIGZyb20gZmlsZSBnb2VzIGJlZm9yZSBhbnkgb3RoZXIgc291cmNlLlxuICAgKi9cbiAgQGFjdGlvbiBhZGRQcm9qZWN0KHByb3BzKSB7XG4gICAgY29uc3QgZm91bmRQcm9qZWN0ID0gdGhpcy5wcm9qZWN0cy5maW5kKChwcm9qZWN0KSA9PiB7XG4gICAgICBjb25zdCBwcm9qZWN0Um9vdFBhdGggPSBwcm9qZWN0LnJvb3RQYXRoLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBwcm9wc1Jvb3RQYXRoID0gdW50aWxkaWZ5KHByb3BzLnBhdGhzWzBdKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgcmV0dXJuIHByb2plY3RSb290UGF0aCA9PT0gcHJvcHNSb290UGF0aDtcbiAgICB9KTtcblxuICAgIGlmICghZm91bmRQcm9qZWN0KSB7XG4gICAgICBjb25zdCBuZXdQcm9qZWN0ID0gbmV3IFByb2plY3QocHJvcHMpO1xuICAgICAgdGhpcy5wcm9qZWN0cy5wdXNoKG5ld1Byb2plY3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZm91bmRQcm9qZWN0LnNvdXJjZSA9PT0gJ2ZpbGUnICYmIHByb3BzLnNvdXJjZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgIGZvdW5kUHJvamVjdC51cGRhdGVQcm9wcyhwcm9wcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9wcy5zb3VyY2UgPT09ICdmaWxlJyB8fCB0eXBlb2YgcHJvcHMuc291cmNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBmb3VuZFByb2plY3QudXBkYXRlUHJvcHMocHJvcHMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZldGNoUHJvamVjdHMoKSB7XG4gICAgdGhpcy5maWxlU3RvcmUuZmV0Y2goKTtcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5pbmNsdWRlR2l0UmVwb3NpdG9yaWVzJykpIHtcbiAgICAgIHRoaXMuZ2l0U3RvcmUuZmV0Y2goKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgb3Blbihwcm9qZWN0LCBvcGVuSW5TYW1lV2luZG93ID0gZmFsc2UpIHtcbiAgICBpZiAoTWFuYWdlci5pc1Byb2plY3QocHJvamVjdCkpIHtcbiAgICAgIGNvbnN0IHsgZGV2TW9kZSB9ID0gcHJvamVjdC5nZXRQcm9wcygpO1xuXG4gICAgICBpZiAob3BlbkluU2FtZVdpbmRvdykge1xuICAgICAgICBwcm9qZWN0VXRpbC5zd2l0Y2gocHJvamVjdC5wYXRocyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm9wZW4oe1xuICAgICAgICAgIGRldk1vZGUsXG4gICAgICAgICAgcGF0aHNUb09wZW46IHByb2plY3QucGF0aHMsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNhdmVQcm9qZWN0KHByb3BzKSB7XG4gICAgbGV0IHByb3BzVG9TYXZlID0gcHJvcHM7XG4gICAgaWYgKE1hbmFnZXIuaXNQcm9qZWN0KHByb3BzKSkge1xuICAgICAgcHJvcHNUb1NhdmUgPSBwcm9wcy5nZXRQcm9wcygpO1xuICAgIH1cbiAgICB0aGlzLmFkZFByb2plY3QoeyAuLi5wcm9wc1RvU2F2ZSwgc291cmNlOiAnZmlsZScgfSk7XG4gICAgdGhpcy5zYXZlUHJvamVjdHMoKTtcbiAgfVxuXG4gIHNhdmVQcm9qZWN0cygpIHtcbiAgICBjb25zdCBwcm9qZWN0cyA9IHRoaXMucHJvamVjdHMuZmlsdGVyKHByb2plY3QgPT4gcHJvamVjdC5wcm9wcy5zb3VyY2UgPT09ICdmaWxlJyk7XG5cbiAgICBjb25zdCBhcnIgPSBtYXAocHJvamVjdHMsIChwcm9qZWN0KSA9PiB7XG4gICAgICBjb25zdCBwcm9wcyA9IHByb2plY3QuZ2V0Q2hhbmdlZFByb3BzKCk7XG4gICAgICBkZWxldGUgcHJvcHMuc291cmNlO1xuXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdwcm9qZWN0LW1hbmFnZXIuc2F2ZVBhdGhzUmVsYXRpdmVUb0hvbWUnKSkge1xuICAgICAgICBwcm9wcy5wYXRocyA9IHByb3BzLnBhdGhzLm1hcChwYXRoID0+IHRpbGRpZnkocGF0aCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSk7XG5cbiAgICB0aGlzLmZpbGVTdG9yZS5zdG9yZShhcnIpO1xuICB9XG5cbiAgc3RhdGljIGlzUHJvamVjdChwcm9qZWN0KSB7XG4gICAgaWYgKHByb2plY3QgaW5zdGFuY2VvZiBQcm9qZWN0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuY29uc3QgbWFuYWdlciA9IG5ldyBNYW5hZ2VyKCk7XG5leHBvcnQgZGVmYXVsdCBtYW5hZ2VyO1xuIl19