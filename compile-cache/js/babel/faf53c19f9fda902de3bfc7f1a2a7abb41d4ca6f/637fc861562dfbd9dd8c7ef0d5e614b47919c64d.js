Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _projects = require('./projects');

var _projects2 = _interopRequireDefault(_projects);

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var ProjectsListView = (function (_SelectListView) {
  _inherits(ProjectsListView, _SelectListView);

  function ProjectsListView() {
    _classCallCheck(this, ProjectsListView);

    _get(Object.getPrototypeOf(ProjectsListView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProjectsListView, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(ProjectsListView.prototype), 'initialize', this).call(this);
      this.addClass('project-manager');
      this.projects = new _projects2['default']();
    }
  }, {
    key: 'activate',
    value: function activate() {
      // return new ProjectListView();
    }
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      var input = this.filterEditorView.getText();
      var inputArr = input.split(':');
      var isFilterKey = _underscorePlus2['default'].contains(this.possibleFilterKeys, inputArr[0]);
      var filter = this.defaultFilterKey;

      if (inputArr.length > 1 && isFilterKey) {
        filter = inputArr[0];
      }

      return filter;
    }
  }, {
    key: 'getFilterQuery',
    value: function getFilterQuery() {
      var input = this.filterEditorView.getText();
      var inputArr = input.split(':');
      var filter = input;

      if (inputArr.length > 1) {
        filter = inputArr[1];
      }

      return filter;
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage(itemCount, filteredItemCount) {
      if (itemCount === 0) {
        return 'No projects saved yet';
      } else {
        _get(Object.getPrototypeOf(ProjectsListView.prototype), 'getEmptyMessage', this).call(this, itemCount, filteredItemCount);
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var _this = this;

      if (this.panel && this.panel.isVisible()) {
        this.close();
      } else {
        this.projects.getAll(function (projects) {
          return _this.show(projects);
        });
      }
    }
  }, {
    key: 'show',
    value: function show(projects) {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({ item: this });
      }

      this.panel.show();

      var items = [];
      var project = undefined;
      for (project of projects) {
        var data = project.props;
        data.pathMissing = false;
        try {
          var stats = _fs2['default'].statSync(project.props.paths[0]);
          data.pathStats = stats;
        } catch (e) {
          data.pathMissing = true;
        }

        items.push(data);
      }

      items = this.sortItems(items);
      this.setItems(items);
      this.focusFilterEditor();
    }
  }, {
    key: 'confirmed',
    value: function confirmed(props) {
      if (props && !props.pathMissing) {
        var project = new _project2['default'](props);
        project.open();
        this.close();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.panel) {
        this.panel.emitter.emit('did-destroy');
      }

      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      this.close();
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(_ref) {
      var _id = _ref._id;
      var title = _ref.title;
      var group = _ref.group;
      var icon = _ref.icon;
      var devMode = _ref.devMode;
      var paths = _ref.paths;
      var pathMissing = _ref.pathMissing;

      var showPath = this.showPath;

      return (0, _atomSpacePenViews.$$)(function () {
        var _this2 = this;

        this.li({ 'class': 'two-lines' }, { 'data-project-id': _id, 'data-path-missing': pathMissing }, function () {
          _this2.div({ 'class': 'primary-line' }, function () {
            if (devMode) {
              _this2.span({ 'class': 'project-manager-devmode' });
            }

            _this2.div({ 'class': 'icon ' + icon }, function () {
              _this2.span(title);
              if (group != null) {
                _this2.span({ 'class': 'project-manager-list-group' }, group);
              }
            });
          });
          _this2.div({ 'class': 'secondary-line' }, function () {
            if (pathMissing) {
              _this2.div({ 'class': 'icon icon-alert' }, 'Path is not available');
            } else if (showPath) {
              var path = undefined;
              for (path of paths) {
                _this2.div({ 'class': 'no-icon' }, path);
              }
            }
          });
        });
      });
    }
  }, {
    key: 'sortItems',
    value: function sortItems(items) {
      var key = this.sortBy;
      if (key !== 'default') {
        items.sort(function (a, b) {
          a = (a[key] || '￿').toUpperCase();
          b = (b[key] || '￿').toUpperCase();

          return a > b ? 1 : -1;
        });
      }

      return items;
    }
  }, {
    key: 'possibleFilterKeys',
    get: function get() {
      return ['title', 'group', 'template'];
    }
  }, {
    key: 'defaultFilterKey',
    get: function get() {
      return 'title';
    }
  }, {
    key: 'sortBy',
    get: function get() {
      return atom.config.get('project-manager.sortBy');
    }
  }, {
    key: 'showPath',
    get: function get() {
      return atom.config.get('project-manager.showPath');
    }
  }]);

  return ProjectsListView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = ProjectsListView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0cy1saXN0LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7aUNBRWlDLHNCQUFzQjs7OEJBQ3pDLGlCQUFpQjs7Ozt3QkFDVixZQUFZOzs7O3VCQUNiLFdBQVc7Ozs7a0JBQ2hCLElBQUk7Ozs7QUFObkIsV0FBVyxDQUFDOztJQVFTLGdCQUFnQjtZQUFoQixnQkFBZ0I7O1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzsrQkFBaEIsZ0JBQWdCOzs7ZUFBaEIsZ0JBQWdCOztXQUN6QixzQkFBRztBQUNYLGlDQUZpQixnQkFBZ0IsNENBRWQ7QUFDbkIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQztLQUNoQzs7O1dBRU8sb0JBQUc7O0tBRVY7OztXQWtCVyx3QkFBRztBQUNiLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QyxVQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFVBQU0sV0FBVyxHQUFHLDRCQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDOztBQUVuQyxVQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFdBQVcsRUFBRTtBQUN0QyxjQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3RCOztBQUVELGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztXQUVhLDBCQUFHO0FBQ2YsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9B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Ly5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvcHJvamVjdHMtbGlzdC12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7U2VsZWN0TGlzdFZpZXcsICQkfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuaW1wb3J0IFByb2plY3RzIGZyb20gJy4vcHJvamVjdHMnO1xuaW1wb3J0IFByb2plY3QgZnJvbSAnLi9wcm9qZWN0JztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2plY3RzTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0VmlldyB7XG4gIGluaXRpYWxpemUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMuYWRkQ2xhc3MoJ3Byb2plY3QtbWFuYWdlcicpO1xuICAgIHRoaXMucHJvamVjdHMgPSBuZXcgUHJvamVjdHMoKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIC8vIHJldHVybiBuZXcgUHJvamVjdExpc3RWaWV3KCk7XG4gIH1cblxuICBnZXQgcG9zc2libGVGaWx0ZXJLZXlzKCkge1xuICAgIHJldHVybiBbJ3RpdGxlJywgJ2dyb3VwJywgJ3RlbXBsYXRlJ107XG4gIH1cblxuICBnZXQgZGVmYXVsdEZpbHRlcktleSgpIHtcbiAgICByZXR1cm4gJ3RpdGxlJztcbiAgfVxuXG4gIGdldCBzb3J0QnkoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLnNvcnRCeScpO1xuICB9XG5cbiAgZ2V0IHNob3dQYXRoKCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5zaG93UGF0aCcpO1xuICB9XG5cbiAgZ2V0RmlsdGVyS2V5KCkge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5maWx0ZXJFZGl0b3JWaWV3LmdldFRleHQoKTtcbiAgICBjb25zdCBpbnB1dEFyciA9IGlucHV0LnNwbGl0KCc6Jyk7XG4gICAgY29uc3QgaXNGaWx0ZXJLZXkgPSBfLmNvbnRhaW5zKHRoaXMucG9zc2libGVGaWx0ZXJLZXlzLCBpbnB1dEFyclswXSk7XG4gICAgbGV0IGZpbHRlciA9IHRoaXMuZGVmYXVsdEZpbHRlcktleTtcblxuICAgIGlmIChpbnB1dEFyci5sZW5ndGggPiAxICYmIGlzRmlsdGVyS2V5KSB7XG4gICAgICBmaWx0ZXIgPSBpbnB1dEFyclswXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsdGVyO1xuICB9XG5cbiAgZ2V0RmlsdGVyUXVlcnkoKSB7XG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmZpbHRlckVkaXRvclZpZXcuZ2V0VGV4dCgpO1xuICAgIGNvbnN0IGlucHV0QXJyID0gaW5wdXQuc3BsaXQoJzonKTtcbiAgICBsZXQgZmlsdGVyID0gaW5wdXQ7XG5cbiAgICBpZiAoaW5wdXRBcnIubGVuZ3RoID4gMSkge1xuICAgICAgZmlsdGVyID0gaW5wdXRBcnJbMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbHRlcjtcbiAgfVxuXG4gIGdldEVtcHR5TWVzc2FnZShpdGVtQ291bnQsIGZpbHRlcmVkSXRlbUNvdW50KSB7XG4gICAgaWYgKGl0ZW1Db3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuICdObyBwcm9qZWN0cyBzYXZlZCB5ZXQnO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5nZXRFbXB0eU1lc3NhZ2UoaXRlbUNvdW50LCBmaWx0ZXJlZEl0ZW1Db3VudCk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLnBhbmVsICYmIHRoaXMucGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9qZWN0cy5nZXRBbGwoKHByb2plY3RzKSA9PiB0aGlzLnNob3cocHJvamVjdHMpKTtcbiAgICB9XG4gIH1cblxuICBzaG93KHByb2plY3RzKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgPT0gbnVsbCkge1xuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe2l0ZW06IHRoaXN9KTtcbiAgICB9XG5cbiAgICB0aGlzLnBhbmVsLnNob3coKTtcblxuICAgIGxldCBpdGVtcyA9IFtdO1xuICAgIGxldCBwcm9qZWN0O1xuICAgIGZvciAocHJvamVjdCBvZiBwcm9qZWN0cykge1xuICAgICAgbGV0IGRhdGEgPSBwcm9qZWN0LnByb3BzO1xuICAgICAgZGF0YS5wYXRoTWlzc2luZyA9IGZhbHNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IHN0YXRzID0gZnMuc3RhdFN5bmMocHJvamVjdC5wcm9wcy5wYXRoc1swXSk7XG4gICAgICAgIGRhdGEucGF0aFN0YXRzID0gc3RhdHM7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRhdGEucGF0aE1pc3NpbmcgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpdGVtcy5wdXNoKGRhdGEpO1xuICAgIH1cblxuICAgIGl0ZW1zID0gdGhpcy5zb3J0SXRlbXMoaXRlbXMpO1xuICAgIHRoaXMuc2V0SXRlbXMoaXRlbXMpO1xuICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgfVxuXG4gIGNvbmZpcm1lZChwcm9wcykge1xuICAgIGlmIChwcm9wcyAmJiAhcHJvcHMucGF0aE1pc3NpbmcpIHtcbiAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgUHJvamVjdChwcm9wcyk7XG4gICAgICBwcm9qZWN0Lm9wZW4oKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95Jyk7XG4gICAgfVxuXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gIH1cblxuICBjYW5jZWxsZWQoKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgdmlld0Zvckl0ZW0oe19pZCwgdGl0bGUsIGdyb3VwLCBpY29uLCBkZXZNb2RlLCBwYXRocywgcGF0aE1pc3Npbmd9KSB7XG4gICAgbGV0IHNob3dQYXRoID0gdGhpcy5zaG93UGF0aDtcblxuICAgIHJldHVybiAkJChmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubGkoe2NsYXNzOiAndHdvLWxpbmVzJ30sXG4gICAgICB7J2RhdGEtcHJvamVjdC1pZCc6IF9pZCwgJ2RhdGEtcGF0aC1taXNzaW5nJzogcGF0aE1pc3Npbmd9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGl2KHtjbGFzczogJ3ByaW1hcnktbGluZSd9LCAoKSA9PiB7XG4gICAgICAgICAgaWYgKGRldk1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc3Bhbih7Y2xhc3M6ICdwcm9qZWN0LW1hbmFnZXItZGV2bW9kZSd9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmRpdih7Y2xhc3M6IGBpY29uICR7aWNvbn1gfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zcGFuKHRpdGxlKTtcbiAgICAgICAgICAgIGlmIChncm91cCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3Bhbih7Y2xhc3M6ICdwcm9qZWN0LW1hbmFnZXItbGlzdC1ncm91cCd9LCBncm91cCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRpdih7Y2xhc3M6ICdzZWNvbmRhcnktbGluZSd9LCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHBhdGhNaXNzaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmRpdih7Y2xhc3M6ICdpY29uIGljb24tYWxlcnQnfSwgJ1BhdGggaXMgbm90IGF2YWlsYWJsZScpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc2hvd1BhdGgpIHtcbiAgICAgICAgICAgIGxldCBwYXRoO1xuICAgICAgICAgICAgZm9yIChwYXRoIG9mIHBhdGhzKSB7XG4gICAgICAgICAgICAgIHRoaXMuZGl2KHtjbGFzczogJ25vLWljb24nfSwgcGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc29ydEl0ZW1zKGl0ZW1zKSB7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5zb3J0Qnk7XG4gICAgaWYgKGtleSAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgICBpdGVtcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGEgPSAoYVtrZXldIHx8ICdcXHVmZmZmJykudG9VcHBlckNhc2UoKTtcbiAgICAgICAgYiA9IChiW2tleV0gfHwgJ1xcdWZmZmYnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgIHJldHVybiBhID4gYiA/IDEgOiAtMTtcbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG59XG4iXX0=
//# sourceURL=/Users/igawataiichi/.atom/packages/project-manager/lib/projects-list-view.js
