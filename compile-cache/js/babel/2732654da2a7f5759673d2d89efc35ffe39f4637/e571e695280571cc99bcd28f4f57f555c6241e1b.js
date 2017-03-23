'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.editComponent = editComponent;
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideProjects = provideProjects;

var _mobx = require('mobx');

var _atom = require('atom');

var _Manager = require('./Manager');

var _Manager2 = _interopRequireDefault(_Manager);

var _viewUri = require('./views/view-uri');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let disposables = null;
let projectsListView = null;
let FileStore = null;

function editComponent() {
  const EditView = require('./views/EditView');

  return new EditView({ project: _Manager2.default.activeProject });
}

function activate() {
  disposables = new _atom.CompositeDisposable();

  disposables.add(atom.workspace.addOpener(uri => {
    if (uri === _viewUri.EDIT_URI || uri === _viewUri.SAVE_URI) {
      return editComponent();
    }

    return null;
  }));

  disposables.add(atom.commands.add('atom-workspace', {
    'project-manager:list-projects': () => {
      if (!this.projectsListView) {
        const ProjectsListView = require('./views/projects-list-view');

        projectsListView = new ProjectsListView();
      }

      projectsListView.toggle();
    },
    'project-manager:edit-projects': () => {
      if (!FileStore) {
        FileStore = require('./stores/FileStore');
      }

      atom.workspace.open(FileStore.getPath());
    },
    'project-manager:save-project': () => {
      atom.workspace.open(_viewUri.SAVE_URI);
    },
    'project-manager:edit-project': () => {
      atom.workspace.open(_viewUri.EDIT_URI);
    },
    'project-manager:update-projects': () => {
      _Manager2.default.fetchProjects();
    }
  }));
}

function deactivate() {
  disposables.dispose();
}

function provideProjects() {
  return {
    getProjects: callback => {
      (0, _mobx.autorun)(() => {
        callback(_Manager2.default.projects);
      });
    },
    getProject: callback => {
      (0, _mobx.autorun)(() => {
        callback(_Manager2.default.activeProject);
      });
    },
    saveProject: project => {
      _Manager2.default.saveProject(project);
    },
    openProject: project => {
      _Manager2.default.open(project);
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2plY3QtbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJlZGl0Q29tcG9uZW50IiwiYWN0aXZhdGUiLCJkZWFjdGl2YXRlIiwicHJvdmlkZVByb2plY3RzIiwiZGlzcG9zYWJsZXMiLCJwcm9qZWN0c0xpc3RWaWV3IiwiRmlsZVN0b3JlIiwiRWRpdFZpZXciLCJyZXF1aXJlIiwicHJvamVjdCIsImFjdGl2ZVByb2plY3QiLCJhZGQiLCJhdG9tIiwid29ya3NwYWNlIiwiYWRkT3BlbmVyIiwidXJpIiwiY29tbWFuZHMiLCJQcm9qZWN0c0xpc3RWaWV3IiwidG9nZ2xlIiwib3BlbiIsImdldFBhdGgiLCJmZXRjaFByb2plY3RzIiwiZGlzcG9zZSIsImdldFByb2plY3RzIiwiY2FsbGJhY2siLCJwcm9qZWN0cyIsImdldFByb2plY3QiLCJzYXZlUHJvamVjdCIsIm9wZW5Qcm9qZWN0Il0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7UUFXZ0JBLGEsR0FBQUEsYTtRQU1BQyxRLEdBQUFBLFE7UUF3Q0FDLFUsR0FBQUEsVTtRQUlBQyxlLEdBQUFBLGU7O0FBM0RoQjs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBRUEsSUFBSUMsY0FBYyxJQUFsQjtBQUNBLElBQUlDLG1CQUFtQixJQUF2QjtBQUNBLElBQUlDLFlBQVksSUFBaEI7O0FBRU8sU0FBU04sYUFBVCxHQUF5QjtBQUM5QixRQUFNTyxXQUFXQyxRQUFRLGtCQUFSLENBQWpCOztBQUVBLFNBQU8sSUFBSUQsUUFBSixDQUFhLEVBQUVFLFNBQVMsa0JBQVFDLGFBQW5CLEVBQWIsQ0FBUDtBQUNEOztBQUVNLFNBQVNULFFBQVQsR0FBb0I7QUFDekJHLGdCQUFjLCtCQUFkOztBQUVBQSxjQUFZTyxHQUFaLENBQWdCQyxLQUFLQyxTQUFMLENBQWVDLFNBQWYsQ0FBMEJDLEdBQUQsSUFBUztBQUNoRCxRQUFJQSw2QkFBb0JBLHlCQUF4QixFQUEwQztBQUN4QyxhQUFPZixlQUFQO0FBQ0Q7O0FBRUQsV0FBTyxJQUFQO0FBQ0QsR0FOZSxDQUFoQjs7QUFRQUksY0FBWU8sR0FBWixDQUFnQkMsS0FBS0ksUUFBTCxDQUFjTCxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztBQUNsRCxxQ0FBaUMsTUFBTTtBQUNyQyxVQUFJLENBQUMsS0FBS04sZ0JBQVYsRUFBNEI7QUFDMUIsY0FBTVksbUJBQW1CVCxRQUFRLDRCQUFSLENBQXpCOztBQUVBSCwyQkFBbUIsSUFBSVksZ0JBQUosRUFBbkI7QUFDRDs7QUFFRFosdUJBQWlCYSxNQUFqQjtBQUNELEtBVGlEO0FBVWxELHFDQUFpQyxNQUFNO0FBQ3JDLFVBQUksQ0FBQ1osU0FBTCxFQUFnQjtBQUNkQSxvQkFBWUUsUUFBUSxvQkFBUixDQUFaO0FBQ0Q7O0FBRURJLFdBQUtDLFNBQUwsQ0FBZU0sSUFBZixDQUFvQmIsVUFBVWMsT0FBVixFQUFwQjtBQUNELEtBaEJpRDtBQWlCbEQsb0NBQWdDLE1BQU07QUFDcENSLFdBQUtDLFNBQUwsQ0FBZU0sSUFBZjtBQUNELEtBbkJpRDtBQW9CbEQsb0NBQWdDLE1BQU07QUFDcENQLFdBQUtDLFNBQUwsQ0FBZU0sSUFBZjtBQUNELEtBdEJpRDtBQXVCbEQsdUNBQW1DLE1BQU07QUFDdkMsd0JBQVFFLGFBQVI7QUFDRDtBQXpCaUQsR0FBcEMsQ0FBaEI7QUEyQkQ7O0FBRU0sU0FBU25CLFVBQVQsR0FBc0I7QUFDM0JFLGNBQVlrQixPQUFaO0FBQ0Q7O0FBRU0sU0FBU25CLGVBQVQsR0FBMkI7QUFDaEMsU0FBTztBQUNMb0IsaUJBQWNDLFFBQUQsSUFBYztBQUN6Qix5QkFBUSxNQUFNO0FBQ1pBLGlCQUFTLGtCQUFRQyxRQUFqQjtBQUNELE9BRkQ7QUFHRCxLQUxJO0FBTUxDLGdCQUFhRixRQUFELElBQWM7QUFDeEIseUJBQVEsTUFBTTtBQUNaQSxpQkFBUyxrQkFBUWQsYUFBakI7QUFDRCxPQUZEO0FBR0QsS0FWSTtBQVdMaUIsaUJBQWNsQixPQUFELElBQWE7QUFDeEIsd0JBQVFrQixXQUFSLENBQW9CbEIsT0FBcEI7QUFDRCxLQWJJO0FBY0xtQixpQkFBY25CLE9BQUQsSUFBYTtBQUN4Qix3QkFBUVUsSUFBUixDQUFhVixPQUFiO0FBQ0Q7QUFoQkksR0FBUDtBQWtCRCIsImZpbGUiOiJwcm9qZWN0LW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgYXV0b3J1biB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9NYW5hZ2VyJztcbmltcG9ydCB7IFNBVkVfVVJJLCBFRElUX1VSSSB9IGZyb20gJy4vdmlld3Mvdmlldy11cmknO1xuXG5sZXQgZGlzcG9zYWJsZXMgPSBudWxsO1xubGV0IHByb2plY3RzTGlzdFZpZXcgPSBudWxsO1xubGV0IEZpbGVTdG9yZSA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBlZGl0Q29tcG9uZW50KCkge1xuICBjb25zdCBFZGl0VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvRWRpdFZpZXcnKTtcblxuICByZXR1cm4gbmV3IEVkaXRWaWV3KHsgcHJvamVjdDogbWFuYWdlci5hY3RpdmVQcm9qZWN0IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICBkaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKCh1cmkpID0+IHtcbiAgICBpZiAodXJpID09PSBFRElUX1VSSSB8fCB1cmkgPT09IFNBVkVfVVJJKSB7XG4gICAgICByZXR1cm4gZWRpdENvbXBvbmVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9KSk7XG5cbiAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAncHJvamVjdC1tYW5hZ2VyOmxpc3QtcHJvamVjdHMnOiAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvamVjdHNMaXN0Vmlldykge1xuICAgICAgICBjb25zdCBQcm9qZWN0c0xpc3RWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9wcm9qZWN0cy1saXN0LXZpZXcnKTtcblxuICAgICAgICBwcm9qZWN0c0xpc3RWaWV3ID0gbmV3IFByb2plY3RzTGlzdFZpZXcoKTtcbiAgICAgIH1cblxuICAgICAgcHJvamVjdHNMaXN0Vmlldy50b2dnbGUoKTtcbiAgICB9LFxuICAgICdwcm9qZWN0LW1hbmFnZXI6ZWRpdC1wcm9qZWN0cyc6ICgpID0+IHtcbiAgICAgIGlmICghRmlsZVN0b3JlKSB7XG4gICAgICAgIEZpbGVTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL0ZpbGVTdG9yZScpO1xuICAgICAgfVxuXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKEZpbGVTdG9yZS5nZXRQYXRoKCkpO1xuICAgIH0sXG4gICAgJ3Byb2plY3QtbWFuYWdlcjpzYXZlLXByb2plY3QnOiAoKSA9PiB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKFNBVkVfVVJJKTtcbiAgICB9LFxuICAgICdwcm9qZWN0LW1hbmFnZXI6ZWRpdC1wcm9qZWN0JzogKCkgPT4ge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihFRElUX1VSSSk7XG4gICAgfSxcbiAgICAncHJvamVjdC1tYW5hZ2VyOnVwZGF0ZS1wcm9qZWN0cyc6ICgpID0+IHtcbiAgICAgIG1hbmFnZXIuZmV0Y2hQcm9qZWN0cygpO1xuICAgIH0sXG4gIH0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVQcm9qZWN0cygpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRQcm9qZWN0czogKGNhbGxiYWNrKSA9PiB7XG4gICAgICBhdXRvcnVuKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sobWFuYWdlci5wcm9qZWN0cyk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldFByb2plY3Q6IChjYWxsYmFjaykgPT4ge1xuICAgICAgYXV0b3J1bigoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKG1hbmFnZXIuYWN0aXZlUHJvamVjdCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNhdmVQcm9qZWN0OiAocHJvamVjdCkgPT4ge1xuICAgICAgbWFuYWdlci5zYXZlUHJvamVjdChwcm9qZWN0KTtcbiAgICB9LFxuICAgIG9wZW5Qcm9qZWN0OiAocHJvamVjdCkgPT4ge1xuICAgICAgbWFuYWdlci5vcGVuKHByb2plY3QpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=