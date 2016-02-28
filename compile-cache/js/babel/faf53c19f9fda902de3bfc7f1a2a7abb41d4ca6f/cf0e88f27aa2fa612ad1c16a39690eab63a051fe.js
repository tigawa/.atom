'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CompositeDisposable = undefined;
var ProjectsListView = undefined;
var Projects = undefined;
var SaveDialog = undefined;
var DB = undefined;

var ProjectManager = (function () {
  function ProjectManager() {
    _classCallCheck(this, ProjectManager);
  }

  _createClass(ProjectManager, null, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      CompositeDisposable = require('atom').CompositeDisposable;
      this.disposables = new CompositeDisposable();

      this.disposables.add(atom.commands.add('atom-workspace', {
        'project-manager:list-projects': function projectManagerListProjects() {
          ProjectsListView = require('./projects-list-view');
          var projectsListView = new ProjectsListView();
          projectsListView.toggle();
        },

        'project-manager:save-project': function projectManagerSaveProject() {
          SaveDialog = require('./save-dialog');
          var saveDialog = new SaveDialog();
          saveDialog.attach();
        },

        'project-manager:edit-projects': function projectManagerEditProjects() {
          DB = require('./db');
          var db = new DB();
          atom.workspace.open(db.file());
        }
      }));

      atom.project.onDidChangePaths(function () {
        return _this.updatePaths();
      });
      this.loadProject();
    }
  }, {
    key: 'loadProject',
    value: function loadProject() {
      var _this2 = this;

      Projects = require('./projects');
      this.projects = new Projects();
      this.projects.getCurrent(function (project) {
        if (project) {
          _this2.project = project;
          _this2.project.load();
        }
      });
    }
  }, {
    key: 'updatePaths',
    value: function updatePaths() {
      var paths = atom.project.getPaths();
      if (this.project && paths.length) {
        this.project.set('paths', paths);
      }
    }
  }, {
    key: 'provideProjects',
    value: function provideProjects() {
      Projects = require('./projects');
      return {
        projects: new Projects()
      };
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.disposables.dispose();
    }
  }, {
    key: 'config',
    get: function get() {
      return {
        showPath: {
          type: 'boolean',
          'default': true
        },
        closeCurrent: {
          type: 'boolean',
          'default': false,
          description: 'Closes the current window after opening another project'
        },
        environmentSpecificProjects: {
          type: 'boolean',
          'default': false
        },
        sortBy: {
          type: 'string',
          description: 'Default sorting is the order in which the projects are',
          'default': 'default',
          'enum': ['default', 'title', 'group']
        }
      };
    }
  }]);

  return ProjectManager;
})();

exports['default'] = ProjectManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7O0FBRVosSUFBSSxtQkFBbUIsWUFBQSxDQUFDO0FBQ3hCLElBQUksZ0JBQWdCLFlBQUEsQ0FBQztBQUNyQixJQUFJLFFBQVEsWUFBQSxDQUFDO0FBQ2IsSUFBSSxVQUFVLFlBQUEsQ0FBQztBQUNmLElBQUksRUFBRSxZQUFBLENBQUM7O0lBRWMsY0FBYztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0EwQmxCLG9CQUFHOzs7QUFDaEIseUJBQW1CLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQixDQUFDO0FBQzFELFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUU3QyxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN2RCx1Q0FBK0IsRUFBRSxzQ0FBTTtBQUNyQywwQkFBZ0IsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNuRCxjQUFJLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztBQUM5QywwQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzQjs7QUFFRCxzQ0FBOEIsRUFBRSxxQ0FBTTtBQUNwQyxvQkFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN0QyxjQUFJLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQ2xDLG9CQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDckI7O0FBRUQsdUNBQStCLEVBQUUsc0NBQU07QUFDckMsWUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyQixjQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ2xCLGNBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ2hDO09BQ0YsQ0FBQyxDQUFDLENBQUM7O0FBRUosVUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztlQUFNLE1BQUssV0FBVyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1dBRWlCLHVCQUFHOzs7QUFDbkIsY0FBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDL0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDbEMsWUFBSSxPQUFPLEVBQUU7QUFDWCxpQkFBSyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLGlCQUFLLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNyQjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFaUIsdUJBQUc7QUFDbkIsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNwQyxVQUFJLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNoQyxZQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDbEM7S0FDRjs7O1dBRXFCLDJCQUFHO0FBQ3ZCLGNBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDakMsYUFBTztBQUNMLGdCQUFRLEVBQUUsSUFBSSxRQUFRLEVBQUU7T0FDekIsQ0FBQztLQUNIOzs7V0FFZ0Isc0JBQUc7QUFDbEIsVUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM1Qjs7O1NBL0VnQixlQUFHO0FBQ2xCLGFBQU87QUFDTCxnQkFBUSxFQUFFO0FBQ1IsY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxJQUFJO1NBQ2Q7QUFDRCxvQkFBWSxFQUFFO0FBQ1osY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxLQUFLO0FBQ2QscUJBQVcsRUFBRSx5REFBeUQ7U0FDdkU7QUFDRCxtQ0FBMkIsRUFBRTtBQUMzQixjQUFJLEVBQUUsU0FBUztBQUNmLHFCQUFTLEtBQUs7U0FDZjtBQUNELGNBQU0sRUFBRTtBQUNOLGNBQUksRUFBRSxRQUFRO0FBQ2QscUJBQVcsRUFBRSx3REFBd0Q7QUFDckUscUJBQVMsU0FBUztBQUNsQixrQkFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO1NBQ3BDO09BQ0YsQ0FBQztLQUNIOzs7U0F4QmtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxubGV0IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5sZXQgUHJvamVjdHNMaXN0VmlldztcbmxldCBQcm9qZWN0cztcbmxldCBTYXZlRGlhbG9nO1xubGV0IERCO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9qZWN0TWFuYWdlciB7XG5cbiAgc3RhdGljIGdldCBjb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNob3dQYXRoOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGNsb3NlQ3VycmVudDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Nsb3NlcyB0aGUgY3VycmVudCB3aW5kb3cgYWZ0ZXIgb3BlbmluZyBhbm90aGVyIHByb2plY3QnXG4gICAgICB9LFxuICAgICAgZW52aXJvbm1lbnRTcGVjaWZpY1Byb2plY3RzOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIH0sXG4gICAgICBzb3J0Qnk6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGVmYXVsdCBzb3J0aW5nIGlzIHRoZSBvcmRlciBpbiB3aGljaCB0aGUgcHJvamVjdHMgYXJlJyxcbiAgICAgICAgZGVmYXVsdDogJ2RlZmF1bHQnLFxuICAgICAgICBlbnVtOiBbJ2RlZmF1bHQnLCAndGl0bGUnLCAnZ3JvdXAnXVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgYWN0aXZhdGUoKSB7XG4gICAgQ29tcG9zaXRlRGlzcG9zYWJsZSA9IHJlcXVpcmUoJ2F0b20nKS5Db21wb3NpdGVEaXNwb3NhYmxlO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ3Byb2plY3QtbWFuYWdlcjpsaXN0LXByb2plY3RzJzogKCkgPT4ge1xuICAgICAgICBQcm9qZWN0c0xpc3RWaWV3ID0gcmVxdWlyZSgnLi9wcm9qZWN0cy1saXN0LXZpZXcnKTtcbiAgICAgICAgbGV0IHByb2plY3RzTGlzdFZpZXcgPSBuZXcgUHJvamVjdHNMaXN0VmlldygpO1xuICAgICAgICBwcm9qZWN0c0xpc3RWaWV3LnRvZ2dsZSgpO1xuICAgICAgfSxcblxuICAgICAgJ3Byb2plY3QtbWFuYWdlcjpzYXZlLXByb2plY3QnOiAoKSA9PiB7XG4gICAgICAgIFNhdmVEaWFsb2cgPSByZXF1aXJlKCcuL3NhdmUtZGlhbG9nJyk7XG4gICAgICAgIGxldCBzYXZlRGlhbG9nID0gbmV3IFNhdmVEaWFsb2coKTtcbiAgICAgICAgc2F2ZURpYWxvZy5hdHRhY2goKTtcbiAgICAgIH0sXG5cbiAgICAgICdwcm9qZWN0LW1hbmFnZXI6ZWRpdC1wcm9qZWN0cyc6ICgpID0+IHtcbiAgICAgICAgREIgPSByZXF1aXJlKCcuL2RiJyk7XG4gICAgICAgIGxldCBkYiA9IG5ldyBEQigpO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGRiLmZpbGUoKSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gdGhpcy51cGRhdGVQYXRocygpKTtcbiAgICB0aGlzLmxvYWRQcm9qZWN0KCk7XG4gIH1cblxuICBzdGF0aWMgbG9hZFByb2plY3QoKSB7XG4gICAgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzJyk7XG4gICAgdGhpcy5wcm9qZWN0cyA9IG5ldyBQcm9qZWN0cygpO1xuICAgIHRoaXMucHJvamVjdHMuZ2V0Q3VycmVudChwcm9qZWN0ID0+IHtcbiAgICAgIGlmIChwcm9qZWN0KSB7XG4gICAgICAgIHRoaXMucHJvamVjdCA9IHByb2plY3Q7XG4gICAgICAgIHRoaXMucHJvamVjdC5sb2FkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgdXBkYXRlUGF0aHMoKSB7XG4gICAgbGV0IHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgaWYgKHRoaXMucHJvamVjdCAmJiBwYXRocy5sZW5ndGgpIHtcbiAgICAgIHRoaXMucHJvamVjdC5zZXQoJ3BhdGhzJywgcGF0aHMpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBwcm92aWRlUHJvamVjdHMoKSB7XG4gICAgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2plY3RzOiBuZXcgUHJvamVjdHMoKVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19
//# sourceURL=/Users/igawataiichi/.atom/packages/project-manager/lib/project-manager.js
