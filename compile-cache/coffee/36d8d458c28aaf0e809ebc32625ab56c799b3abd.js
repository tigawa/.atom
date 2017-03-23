(function() {
  var Emitter, TodoCollection, TodoModel, TodoRegex, TodosMarkdown, path;

  path = require('path');

  Emitter = require('atom').Emitter;

  TodoModel = require('./todo-model');

  TodosMarkdown = require('./todo-markdown');

  TodoRegex = require('./todo-regex');

  module.exports = TodoCollection = (function() {
    function TodoCollection() {
      this.emitter = new Emitter;
      this.defaultKey = 'Text';
      this.scope = 'workspace';
      this.todos = [];
    }

    TodoCollection.prototype.onDidAddTodo = function(cb) {
      return this.emitter.on('did-add-todo', cb);
    };

    TodoCollection.prototype.onDidRemoveTodo = function(cb) {
      return this.emitter.on('did-remove-todo', cb);
    };

    TodoCollection.prototype.onDidClear = function(cb) {
      return this.emitter.on('did-clear-todos', cb);
    };

    TodoCollection.prototype.onDidStartSearch = function(cb) {
      return this.emitter.on('did-start-search', cb);
    };

    TodoCollection.prototype.onDidSearchPaths = function(cb) {
      return this.emitter.on('did-search-paths', cb);
    };

    TodoCollection.prototype.onDidFinishSearch = function(cb) {
      return this.emitter.on('did-finish-search', cb);
    };

    TodoCollection.prototype.onDidCancelSearch = function(cb) {
      return this.emitter.on('did-cancel-search', cb);
    };

    TodoCollection.prototype.onDidFailSearch = function(cb) {
      return this.emitter.on('did-fail-search', cb);
    };

    TodoCollection.prototype.onDidSortTodos = function(cb) {
      return this.emitter.on('did-sort-todos', cb);
    };

    TodoCollection.prototype.onDidFilterTodos = function(cb) {
      return this.emitter.on('did-filter-todos', cb);
    };

    TodoCollection.prototype.onDidChangeSearchScope = function(cb) {
      return this.emitter.on('did-change-scope', cb);
    };

    TodoCollection.prototype.clear = function() {
      this.cancelSearch();
      this.todos = [];
      return this.emitter.emit('did-clear-todos');
    };

    TodoCollection.prototype.addTodo = function(todo) {
      if (this.alreadyExists(todo)) {
        return;
      }
      this.todos.push(todo);
      return this.emitter.emit('did-add-todo', todo);
    };

    TodoCollection.prototype.getTodos = function() {
      return this.todos;
    };

    TodoCollection.prototype.getTodosCount = function() {
      return this.todos.length;
    };

    TodoCollection.prototype.getState = function() {
      return this.searching;
    };

    TodoCollection.prototype.sortTodos = function(arg) {
      var ref, ref1, sortAsc, sortBy;
      ref = arg != null ? arg : {}, sortBy = ref.sortBy, sortAsc = ref.sortAsc;
      if (sortBy == null) {
        sortBy = this.defaultKey;
      }
      if (((ref1 = this.searches) != null ? ref1[this.searches.length - 1].sortBy : void 0) !== sortBy) {
        if (this.searches == null) {
          this.searches = [];
        }
        this.searches.push({
          sortBy: sortBy,
          sortAsc: sortAsc
        });
      } else {
        this.searches[this.searches.length - 1] = {
          sortBy: sortBy,
          sortAsc: sortAsc
        };
      }
      this.todos = this.todos.sort((function(_this) {
        return function(todoA, todoB) {
          return _this.todoSorter(todoA, todoB, sortBy, sortAsc);
        };
      })(this));
      if (this.filter) {
        return this.filterTodos(this.filter);
      }
      return this.emitter.emit('did-sort-todos', this.todos);
    };

    TodoCollection.prototype.todoSorter = function(todoA, todoB, sortBy, sortAsc) {
      var aVal, bVal, comp, findTheseTodos, ref, ref1, ref2, ref3, search, sortAsc2, sortBy2;
      ref = [sortBy, sortAsc], sortBy2 = ref[0], sortAsc2 = ref[1];
      aVal = todoA.get(sortBy2);
      bVal = todoB.get(sortBy2);
      if (aVal === bVal) {
        if (search = (ref1 = this.searches) != null ? ref1[this.searches.length - 2] : void 0) {
          ref2 = [search.sortBy, search.sortAsc], sortBy2 = ref2[0], sortAsc2 = ref2[1];
        } else {
          sortBy2 = this.defaultKey;
        }
        ref3 = [todoA.get(sortBy2), todoB.get(sortBy2)], aVal = ref3[0], bVal = ref3[1];
      }
      if (sortBy2 === 'Type') {
        findTheseTodos = atom.config.get('todo-show.findTheseTodos');
        comp = findTheseTodos.indexOf(aVal) - findTheseTodos.indexOf(bVal);
      } else if (todoA.keyIsNumber(sortBy2)) {
        comp = parseInt(aVal) - parseInt(bVal);
      } else {
        comp = aVal.localeCompare(bVal);
      }
      if (sortAsc2) {
        return comp;
      } else {
        return -comp;
      }
    };

    TodoCollection.prototype.filterTodos = function(filter) {
      var result;
      if (this.filter = filter) {
        result = this.todos.filter(function(todo) {
          return todo.contains(filter);
        });
      } else {
        result = this.todos;
      }
      return this.emitter.emit('did-filter-todos', result);
    };

    TodoCollection.prototype.getAvailableTableItems = function() {
      return this.availableItems;
    };

    TodoCollection.prototype.setAvailableTableItems = function(availableItems) {
      this.availableItems = availableItems;
    };

    TodoCollection.prototype.getSearchScope = function() {
      return this.scope;
    };

    TodoCollection.prototype.setSearchScope = function(scope) {
      return this.emitter.emit('did-change-scope', this.scope = scope);
    };

    TodoCollection.prototype.toggleSearchScope = function() {
      var scope;
      scope = (function() {
        switch (this.scope) {
          case 'workspace':
            return 'project';
          case 'project':
            return 'open';
          case 'open':
            return 'active';
          default:
            return 'workspace';
        }
      }).call(this);
      this.setSearchScope(scope);
      return scope;
    };

    TodoCollection.prototype.alreadyExists = function(newTodo) {
      var properties;
      properties = ['range', 'path'];
      return this.todos.some(function(todo) {
        return properties.every(function(prop) {
          if (todo[prop] === newTodo[prop]) {
            return true;
          }
        });
      });
    };

    TodoCollection.prototype.fetchRegexItem = function(todoRegex, activeProjectOnly) {
      var options;
      options = {
        paths: this.getSearchPaths(),
        onPathsSearched: (function(_this) {
          return function(nPaths) {
            if (_this.searching) {
              return _this.emitter.emit('did-search-paths', nPaths);
            }
          };
        })(this)
      };
      return atom.workspace.scan(todoRegex.regexp, options, (function(_this) {
        return function(result, error) {
          var i, len, match, ref, results;
          if (error) {
            console.debug(error.message);
          }
          if (!result) {
            return;
          }
          if (activeProjectOnly && !_this.activeProjectHas(result.filePath)) {
            return;
          }
          ref = result.matches;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            match = ref[i];
            results.push(_this.addTodo(new TodoModel({
              all: match.lineText,
              text: match.matchText,
              loc: result.filePath,
              position: match.range,
              regex: todoRegex.regex,
              regexp: todoRegex.regexp
            })));
          }
          return results;
        };
      })(this));
    };

    TodoCollection.prototype.fetchOpenRegexItem = function(todoRegex, activeEditorOnly) {
      var editor, editors, i, len, ref;
      editors = [];
      if (activeEditorOnly) {
        if (editor = (ref = atom.workspace.getPanes()[0]) != null ? ref.getActiveEditor() : void 0) {
          editors = [editor];
        }
      } else {
        editors = atom.workspace.getTextEditors();
      }
      for (i = 0, len = editors.length; i < len; i++) {
        editor = editors[i];
        editor.scan(todoRegex.regexp, (function(_this) {
          return function(match, error) {
            var range;
            if (error) {
              console.debug(error.message);
            }
            if (!match) {
              return;
            }
            range = [[match.range.start.row, match.range.start.column], [match.range.end.row, match.range.end.column]];
            return _this.addTodo(new TodoModel({
              all: match.lineText,
              text: match.matchText,
              loc: editor.getPath(),
              position: range,
              regex: todoRegex.regex,
              regexp: todoRegex.regexp
            }));
          };
        })(this));
      }
      return Promise.resolve();
    };

    TodoCollection.prototype.search = function() {
      var todoRegex;
      this.clear();
      this.searching = true;
      this.emitter.emit('did-start-search');
      todoRegex = new TodoRegex(atom.config.get('todo-show.findUsingRegex'), atom.config.get('todo-show.findTheseTodos'));
      if (todoRegex.error) {
        this.emitter.emit('did-fail-search', "Invalid todo search regex");
        return;
      }
      this.searchPromise = (function() {
        switch (this.scope) {
          case 'open':
            return this.fetchOpenRegexItem(todoRegex, false);
          case 'active':
            return this.fetchOpenRegexItem(todoRegex, true);
          case 'project':
            return this.fetchRegexItem(todoRegex, true);
          default:
            return this.fetchRegexItem(todoRegex);
        }
      }).call(this);
      return this.searchPromise.then((function(_this) {
        return function(result) {
          _this.searching = false;
          if (result === 'cancelled') {
            return _this.emitter.emit('did-cancel-search');
          } else {
            return _this.emitter.emit('did-finish-search');
          }
        };
      })(this))["catch"]((function(_this) {
        return function(reason) {
          _this.searching = false;
          return _this.emitter.emit('did-fail-search', reason);
        };
      })(this));
    };

    TodoCollection.prototype.getSearchPaths = function() {
      var i, ignore, ignores, len, results;
      ignores = atom.config.get('todo-show.ignoreThesePaths');
      if (ignores == null) {
        return ['*'];
      }
      if (Object.prototype.toString.call(ignores) !== '[object Array]') {
        this.emitter.emit('did-fail-search', "ignoreThesePaths must be an array");
        return ['*'];
      }
      results = [];
      for (i = 0, len = ignores.length; i < len; i++) {
        ignore = ignores[i];
        results.push("!" + ignore);
      }
      return results;
    };

    TodoCollection.prototype.activeProjectHas = function(filePath) {
      var project;
      if (filePath == null) {
        filePath = '';
      }
      if (!(project = this.getActiveProject())) {
        return;
      }
      return filePath.indexOf(project) === 0;
    };

    TodoCollection.prototype.getActiveProject = function() {
      var project;
      if (this.activeProject) {
        return this.activeProject;
      }
      if (project = this.getFallbackProject()) {
        return this.activeProject = project;
      }
    };

    TodoCollection.prototype.getFallbackProject = function() {
      var i, item, len, project, ref;
      ref = atom.workspace.getPaneItems();
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (project = this.projectForFile(typeof item.getPath === "function" ? item.getPath() : void 0)) {
          return project;
        }
      }
      if (project = atom.project.getPaths()[0]) {
        return project;
      }
    };

    TodoCollection.prototype.getActiveProjectName = function() {
      var projectName;
      projectName = path.basename(this.getActiveProject());
      if (projectName === 'undefined') {
        return "no active project";
      } else {
        return projectName;
      }
    };

    TodoCollection.prototype.setActiveProject = function(filePath) {
      var lastProject, project;
      lastProject = this.activeProject;
      if (project = this.projectForFile(filePath)) {
        this.activeProject = project;
      }
      if (!lastProject) {
        return false;
      }
      return lastProject !== this.activeProject;
    };

    TodoCollection.prototype.projectForFile = function(filePath) {
      var project;
      if (typeof filePath !== 'string') {
        return;
      }
      if (project = atom.project.relativizePath(filePath)[0]) {
        return project;
      }
    };

    TodoCollection.prototype.getMarkdown = function() {
      var todosMarkdown;
      todosMarkdown = new TodosMarkdown;
      return todosMarkdown.markdown(this.getTodos());
    };

    TodoCollection.prototype.cancelSearch = function() {
      var ref;
      return (ref = this.searchPromise) != null ? typeof ref.cancel === "function" ? ref.cancel() : void 0 : void 0;
    };

    TodoCollection.prototype.getPreviousSearch = function() {
      var sortBy;
      return sortBy = localStorage.getItem('todo-show.previous-sortBy');
    };

    TodoCollection.prototype.setPreviousSearch = function(search) {
      return localStorage.setItem('todo-show.previous-search', search);
    };

    return TodoCollection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG8tY29sbGVjdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUVaLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7RUFDWixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxpQkFBUjs7RUFDaEIsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx3QkFBQTtNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxVQUFELEdBQWM7TUFDZCxJQUFDLENBQUEsS0FBRCxHQUFTO01BQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUpFOzs2QkFNYixZQUFBLEdBQWMsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksY0FBWixFQUE0QixFQUE1QjtJQUFSOzs2QkFDZCxlQUFBLEdBQWlCLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGlCQUFaLEVBQStCLEVBQS9CO0lBQVI7OzZCQUNqQixVQUFBLEdBQVksU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0I7SUFBUjs7NkJBQ1osZ0JBQUEsR0FBa0IsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksa0JBQVosRUFBZ0MsRUFBaEM7SUFBUjs7NkJBQ2xCLGdCQUFBLEdBQWtCLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLEVBQWhDO0lBQVI7OzZCQUNs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QUFBO0FBQ2pCLFVBQUE7YUFBQSxNQUFBLEdBQVMsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsMkJBQXJCO0lBRFE7OzZCQUduQixpQkFBQSxHQUFtQixTQUFDLE1BQUQ7YUFDakIsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsMkJBQXJCLEVBQWtELE1BQWxEO0lBRGlCOzs7OztBQXRQckIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cblRvZG9Nb2RlbCA9IHJlcXVpcmUgJy4vdG9kby1tb2RlbCdcblRvZG9zTWFya2Rvd24gPSByZXF1aXJlICcuL3RvZG8tbWFya2Rvd24nXG5Ub2RvUmVnZXggPSByZXF1aXJlICcuL3RvZG8tcmVnZXgnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFRvZG9Db2xsZWN0aW9uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAZGVmYXVsdEtleSA9ICdUZXh0J1xuICAgIEBzY29wZSA9ICd3b3Jrc3BhY2UnXG4gICAgQHRvZG9zID0gW11cblxuICBvbkRpZEFkZFRvZG86IChjYikgLT4gQGVtaXR0ZXIub24gJ2RpZC1hZGQtdG9kbycsIGNiXG4gIG9uRGlkUmVtb3ZlVG9kbzogKGNiKSAtPiBAZW1pdHRlci5vbiAnZGlkLXJlbW92ZS10b2RvJywgY2JcbiAgb25EaWRDbGVhcjogKGNiKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNsZWFyLXRvZG9zJywgY2JcbiAgb25EaWRTdGFydFNlYXJjaDogKGNiKSAtPiBAZW1pdHRlci5vbiAnZGlkLXN0YXJ0LXNlYXJjaCcsIGNiXG4gIG9uRGlkU2VhcmNoUGF0aHM6IChjYikgLT4gQGVtaXR0ZXIub24gJ2RpZC1zZWFyY2gtcGF0aHMnLCBjYlxuICBvbkRpZEZpbmlzaFNlYXJjaDogKGNiKSAtPiBAZW1pdHRlci5vbiAnZGlkLWZpbmlzaC1zZWFyY2gnLCBjYlxuICBvbkRpZENhbmNlbFNlYXJjaDogKGNiKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNhbmNlbC1zZWFyY2gnLCBjYlxuICBvbkRpZEZhaWxTZWFyY2g6IChjYikgLT4gQGVtaXR0ZXIub24gJ2RpZC1mYWlsLXNlYXJjaCcsIGNiXG4gIG9uRGlkU29ydFRvZG9zOiAoY2IpIC0+IEBlbWl0dGVyLm9uICdkaWQtc29ydC10b2RvcycsIGNiXG4gIG9uRGlkRmlsdGVyVG9kb3M6IChjYikgLT4gQGVtaXR0ZXIub24gJ2RpZC1maWx0ZXItdG9kb3MnLCBjYlxuICBvbkRpZENoYW5nZVNlYXJjaFNjb3BlOiAoY2IpIC0+IEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXNjb3BlJywgY2JcblxuICBjbGVhcjogLT5cbiAgICBAY2FuY2VsU2VhcmNoKClcbiAgICBAdG9kb3MgPSBbXVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jbGVhci10b2RvcydcblxuICBhZGRUb2RvOiAodG9kbykgLT5cbiAgICByZXR1cm4gaWYgQGFscmVhZHlFeGlzdHModG9kbylcbiAgICBAdG9kb3MucHVzaCh0b2RvKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hZGQtdG9kbycsIHRvZG9cblxuICBnZXRUb2RvczogLT4gQHRvZG9zXG4gIGdldFRvZG9zQ291bnQ6IC0+IEB0b2Rvcy5sZW5ndGhcbiAgZ2V0U3RhdGU6IC0+IEBzZWFyY2hpbmdcblxuICBzb3J0VG9kb3M6ICh7c29ydEJ5LCBzb3J0QXNjfSA9IHt9KSAtPlxuICAgIHNvcnRCeSA/PSBAZGVmYXVsdEtleVxuXG4gICAgIyBTYXZlIGhpc3Rvcnkgb2YgbmV3IHNvcnQgZWxlbWVudHNcbiAgICBpZiBAc2VhcmNoZXM/W0BzZWFyY2hlcy5sZW5ndGggLSAxXS5zb3J0QnkgaXNudCBzb3J0QnlcbiAgICAgIEBzZWFyY2hlcyA/PSBbXVxuICAgICAgQHNlYXJjaGVzLnB1c2gge3NvcnRCeSwgc29ydEFzY31cbiAgICBlbHNlXG4gICAgICBAc2VhcmNoZXNbQHNlYXJjaGVzLmxlbmd0aCAtIDFdID0ge3NvcnRCeSwgc29ydEFzY31cblxuICAgIEB0b2RvcyA9IEB0b2Rvcy5zb3J0KCh0b2RvQSwgdG9kb0IpID0+XG4gICAgICBAdG9kb1NvcnRlcih0b2RvQSwgdG9kb0IsIHNvcnRCeSwgc29ydEFzYylcbiAgICApXG5cbiAgICByZXR1cm4gQGZpbHRlclRvZG9zKEBmaWx0ZXIpIGlmIEBmaWx0ZXJcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtc29ydC10b2RvcycsIEB0b2Rvc1xuXG4gIHRvZG9Tb3J0ZXI6ICh0b2RvQSwgdG9kb0IsIHNvcnRCeSwgc29ydEFzYykgLT5cbiAgICBbc29ydEJ5Miwgc29ydEFzYzJdID0gW3NvcnRCeSwgc29ydEFzY11cblxuICAgIGFWYWwgPSB0b2RvQS5nZXQoc29ydEJ5MilcbiAgICBiVmFsID0gdG9kb0IuZ2V0KHNvcnRCeTIpXG5cbiAgICBpZiBhVmFsIGlzIGJWYWxcbiAgICAgICMgVXNlIHByZXZpb3VzIHNvcnRzIHRvIG1ha2UgYSAyLWxldmVsIHN0YWJsZSBzb3J0XG4gICAgICBpZiBzZWFyY2ggPSBAc2VhcmNoZXM/W0BzZWFyY2hlcy5sZW5ndGggLSAyXVxuICAgICAgICBbc29ydEJ5Miwgc29ydEFzYzJdID0gW3NlYXJjaC5zb3J0QnksIHNlYXJjaC5zb3J0QXNjXVxuICAgICAgZWxzZVxuICAgICAgICBzb3J0QnkyID0gQGRlZmF1bHRLZXlcblxuICAgICAgW2FWYWwsIGJWYWxdID0gW3RvZG9BLmdldChzb3J0QnkyKSwgdG9kb0IuZ2V0KHNvcnRCeTIpXVxuXG4gICAgIyBTb3J0IHR5cGUgaW4gdGhlIGRlZmluZWQgb3JkZXIsIGFzIG51bWJlciBvciBub3JtYWwgc3RyaW5nIHNvcnRcbiAgICBpZiBzb3J0QnkyIGlzICdUeXBlJ1xuICAgICAgZmluZFRoZXNlVG9kb3MgPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5maW5kVGhlc2VUb2RvcycpXG4gICAgICBjb21wID0gZmluZFRoZXNlVG9kb3MuaW5kZXhPZihhVmFsKSAtIGZpbmRUaGVzZVRvZG9zLmluZGV4T2YoYlZhbClcbiAgICBlbHNlIGlmIHRvZG9BLmtleUlzTnVtYmVyKHNvcnRCeTIpXG4gICAgICBjb21wID0gcGFyc2VJbnQoYVZhbCkgLSBwYXJzZUludChiVmFsKVxuICAgIGVsc2VcbiAgICAgIGNvbXAgPSBhVmFsLmxvY2FsZUNvbXBhcmUoYlZhbClcbiAgICBpZiBzb3J0QXNjMiB0aGVuIGNvbXAgZWxzZSAtY29tcFxuXG4gIGZpbHRlclRvZG9zOiAoZmlsdGVyKSAtPlxuICAgIGlmIEBmaWx0ZXIgPSBmaWx0ZXJcbiAgICAgIHJlc3VsdCA9IEB0b2Rvcy5maWx0ZXIgKHRvZG8pIC0+XG4gICAgICAgIHRvZG8uY29udGFpbnMoZmlsdGVyKVxuICAgIGVsc2VcbiAgICAgIHJlc3VsdCA9IEB0b2Rvc1xuXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWZpbHRlci10b2RvcycsIHJlc3VsdFxuXG4gIGdldEF2YWlsYWJsZVRhYmxlSXRlbXM6IC0+IEBhdmFpbGFibGVJdGVtc1xuICBzZXRBdmFpbGFibGVUYWJsZUl0ZW1zOiAoQGF2YWlsYWJsZUl0ZW1zKSAtPlxuXG4gIGdldFNlYXJjaFNjb3BlOiAtPiBAc2NvcGVcbiAgc2V0U2VhcmNoU2NvcGU6IChzY29wZSkgLT5cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXNjb3BlJywgQHNjb3BlID0gc2NvcGVcblxuICB0b2dnbGVTZWFyY2hTY29wZTogLT5cbiAgICBzY29wZSA9IHN3aXRjaCBAc2NvcGVcbiAgICAgIHdoZW4gJ3dvcmtzcGFjZScgdGhlbiAncHJvamVjdCdcbiAgICAgIHdoZW4gJ3Byb2plY3QnIHRoZW4gJ29wZW4nXG4gICAgICB3aGVuICdvcGVuJyB0aGVuICdhY3RpdmUnXG4gICAgICBlbHNlICd3b3Jrc3BhY2UnXG4gICAgQHNldFNlYXJjaFNjb3BlKHNjb3BlKVxuICAgIHNjb3BlXG5cbiAgYWxyZWFkeUV4aXN0czogKG5ld1RvZG8pIC0+XG4gICAgcHJvcGVydGllcyA9IFsncmFuZ2UnLCAncGF0aCddXG4gICAgQHRvZG9zLnNvbWUgKHRvZG8pIC0+XG4gICAgICBwcm9wZXJ0aWVzLmV2ZXJ5IChwcm9wKSAtPlxuICAgICAgICB0cnVlIGlmIHRvZG9bcHJvcF0gaXMgbmV3VG9kb1twcm9wXVxuXG4gICMgU2NhbiBwcm9qZWN0IHdvcmtzcGFjZSBmb3IgdGhlIFRvZG9SZWdleCBvYmplY3RcbiAgIyByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHRoZSBzY2FuIGdlbmVyYXRlc1xuICBmZXRjaFJlZ2V4SXRlbTogKHRvZG9SZWdleCwgYWN0aXZlUHJvamVjdE9ubHkpIC0+XG4gICAgb3B0aW9ucyA9XG4gICAgICBwYXRoczogQGdldFNlYXJjaFBhdGhzKClcbiAgICAgIG9uUGF0aHNTZWFyY2hlZDogKG5QYXRocykgPT5cbiAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXNlYXJjaC1wYXRocycsIG5QYXRocyBpZiBAc2VhcmNoaW5nXG5cbiAgICBhdG9tLndvcmtzcGFjZS5zY2FuIHRvZG9SZWdleC5yZWdleHAsIG9wdGlvbnMsIChyZXN1bHQsIGVycm9yKSA9PlxuICAgICAgY29uc29sZS5kZWJ1ZyBlcnJvci5tZXNzYWdlIGlmIGVycm9yXG4gICAgICByZXR1cm4gdW5sZXNzIHJlc3VsdFxuXG4gICAgICByZXR1cm4gaWYgYWN0aXZlUHJvamVjdE9ubHkgYW5kIG5vdCBAYWN0aXZlUHJvamVjdEhhcyhyZXN1bHQuZmlsZVBhdGgpXG5cbiAgICAgIGZvciBtYXRjaCBpbiByZXN1bHQubWF0Y2hlc1xuICAgICAgICBAYWRkVG9kbyBuZXcgVG9kb01vZGVsKFxuICAgICAgICAgIGFsbDogbWF0Y2gubGluZVRleHRcbiAgICAgICAgICB0ZXh0OiBtYXRjaC5tYXRjaFRleHRcbiAgICAgICAgICBsb2M6IHJlc3VsdC5maWxlUGF0aFxuICAgICAgICAgIHBvc2l0aW9uOiBtYXRjaC5yYW5nZVxuICAgICAgICAgIHJlZ2V4OiB0b2RvUmVnZXgucmVnZXhcbiAgICAgICAgICByZWdleHA6IHRvZG9SZWdleC5yZWdleHBcbiAgICAgICAgKVxuXG4gICMgU2NhbiBvcGVuIGZpbGVzIGZvciB0aGUgVG9kb1JlZ2V4IG9iamVjdFxuICBmZXRjaE9wZW5SZWdleEl0ZW06ICh0b2RvUmVnZXgsIGFjdGl2ZUVkaXRvck9ubHkpIC0+XG4gICAgZWRpdG9ycyA9IFtdXG4gICAgaWYgYWN0aXZlRWRpdG9yT25seVxuICAgICAgaWYgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVswXT8uZ2V0QWN0aXZlRWRpdG9yKClcbiAgICAgICAgZWRpdG9ycyA9IFtlZGl0b3JdXG4gICAgZWxzZVxuICAgICAgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcblxuICAgIGZvciBlZGl0b3IgaW4gZWRpdG9yc1xuICAgICAgZWRpdG9yLnNjYW4gdG9kb1JlZ2V4LnJlZ2V4cCwgKG1hdGNoLCBlcnJvcikgPT5cbiAgICAgICAgY29uc29sZS5kZWJ1ZyBlcnJvci5tZXNzYWdlIGlmIGVycm9yXG4gICAgICAgIHJldHVybiB1bmxlc3MgbWF0Y2hcblxuICAgICAgICByYW5nZSA9IFtcbiAgICAgICAgICBbbWF0Y2gucmFuZ2Uuc3RhcnQucm93LCBtYXRjaC5yYW5nZS5zdGFydC5jb2x1bW5dXG4gICAgICAgICAgW21hdGNoLnJhbmdlLmVuZC5yb3csIG1hdGNoLnJhbmdlLmVuZC5jb2x1bW5dXG4gICAgICAgIF1cblxuICAgICAgICBAYWRkVG9kbyBuZXcgVG9kb01vZGVsKFxuICAgICAgICAgIGFsbDogbWF0Y2gubGluZVRleHRcbiAgICAgICAgICB0ZXh0OiBtYXRjaC5tYXRjaFRleHRcbiAgICAgICAgICBsb2M6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICBwb3NpdGlvbjogcmFuZ2VcbiAgICAgICAgICByZWdleDogdG9kb1JlZ2V4LnJlZ2V4XG4gICAgICAgICAgcmVnZXhwOiB0b2RvUmVnZXgucmVnZXhwXG4gICAgICAgIClcblxuICAgICMgTm8gYXN5bmMgb3BlcmF0aW9ucywgc28ganVzdCByZXR1cm4gYSByZXNvbHZlZCBwcm9taXNlXG4gICAgUHJvbWlzZS5yZXNvbHZlKClcblxuICBzZWFyY2g6IC0+XG4gICAgQGNsZWFyKClcbiAgICBAc2VhcmNoaW5nID0gdHJ1ZVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1zdGFydC1zZWFyY2gnXG5cbiAgICB0b2RvUmVnZXggPSBuZXcgVG9kb1JlZ2V4KFxuICAgICAgYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuZmluZFVzaW5nUmVnZXgnKVxuICAgICAgYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuZmluZFRoZXNlVG9kb3MnKVxuICAgIClcblxuICAgIGlmIHRvZG9SZWdleC5lcnJvclxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWZhaWwtc2VhcmNoJywgXCJJbnZhbGlkIHRvZG8gc2VhcmNoIHJlZ2V4XCJcbiAgICAgIHJldHVyblxuXG4gICAgQHNlYXJjaFByb21pc2UgPSBzd2l0Y2ggQHNjb3BlXG4gICAgICB3aGVuICdvcGVuJyB0aGVuIEBmZXRjaE9wZW5SZWdleEl0ZW0odG9kb1JlZ2V4LCBmYWxzZSlcbiAgICAgIHdoZW4gJ2FjdGl2ZScgdGhlbiBAZmV0Y2hPcGVuUmVnZXhJdGVtKHRvZG9SZWdleCwgdHJ1ZSlcbiAgICAgIHdoZW4gJ3Byb2plY3QnIHRoZW4gQGZldGNoUmVnZXhJdGVtKHRvZG9SZWdleCwgdHJ1ZSlcbiAgICAgIGVsc2UgQGZldGNoUmVnZXhJdGVtKHRvZG9SZWdleClcblxuICAgIEBzZWFyY2hQcm9taXNlLnRoZW4gKHJlc3VsdCkgPT5cbiAgICAgIEBzZWFyY2hpbmcgPSBmYWxzZVxuICAgICAgaWYgcmVzdWx0IGlzICdjYW5jZWxsZWQnXG4gICAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jYW5jZWwtc2VhcmNoJ1xuICAgICAgZWxzZVxuICAgICAgICBAZW1pdHRlci5lbWl0ICdkaWQtZmluaXNoLXNlYXJjaCdcbiAgICAuY2F0Y2ggKHJlYXNvbikgPT5cbiAgICAgIEBzZWFyY2hpbmcgPSBmYWxzZVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWZhaWwtc2VhcmNoJywgcmVhc29uXG5cbiAgZ2V0U2VhcmNoUGF0aHM6IC0+XG4gICAgaWdub3JlcyA9IGF0b20uY29uZmlnLmdldCgndG9kby1zaG93Lmlnbm9yZVRoZXNlUGF0aHMnKVxuICAgIHJldHVybiBbJyonXSB1bmxlc3MgaWdub3Jlcz9cbiAgICBpZiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaWdub3JlcykgaXNudCAnW29iamVjdCBBcnJheV0nXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtZmFpbC1zZWFyY2gnLCBcImlnbm9yZVRoZXNlUGF0aHMgbXVzdCBiZSBhbiBhcnJheVwiXG4gICAgICByZXR1cm4gWycqJ11cbiAgICBcIiEje2lnbm9yZX1cIiBmb3IgaWdub3JlIGluIGlnbm9yZXNcblxuICBhY3RpdmVQcm9qZWN0SGFzOiAoZmlsZVBhdGggPSAnJykgLT5cbiAgICByZXR1cm4gdW5sZXNzIHByb2plY3QgPSBAZ2V0QWN0aXZlUHJvamVjdCgpXG4gICAgZmlsZVBhdGguaW5kZXhPZihwcm9qZWN0KSBpcyAwXG5cbiAgZ2V0QWN0aXZlUHJvamVjdDogLT5cbiAgICByZXR1cm4gQGFjdGl2ZVByb2plY3QgaWYgQGFjdGl2ZVByb2plY3RcbiAgICBAYWN0aXZlUHJvamVjdCA9IHByb2plY3QgaWYgcHJvamVjdCA9IEBnZXRGYWxsYmFja1Byb2plY3QoKVxuXG4gIGdldEZhbGxiYWNrUHJvamVjdDogLT5cbiAgICBmb3IgaXRlbSBpbiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKVxuICAgICAgaWYgcHJvamVjdCA9IEBwcm9qZWN0Rm9yRmlsZShpdGVtLmdldFBhdGg/KCkpXG4gICAgICAgIHJldHVybiBwcm9qZWN0XG4gICAgcHJvamVjdCBpZiBwcm9qZWN0ID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cblxuICBnZXRBY3RpdmVQcm9qZWN0TmFtZTogLT5cbiAgICBwcm9qZWN0TmFtZSA9IHBhdGguYmFzZW5hbWUoQGdldEFjdGl2ZVByb2plY3QoKSlcbiAgICBpZiBwcm9qZWN0TmFtZSBpcyAndW5kZWZpbmVkJyB0aGVuIFwibm8gYWN0aXZlIHByb2plY3RcIiBlbHNlIHByb2plY3ROYW1lXG5cbiAgc2V0QWN0aXZlUHJvamVjdDogKGZpbGVQYXRoKSAtPlxuICAgIGxhc3RQcm9qZWN0ID0gQGFjdGl2ZVByb2plY3RcbiAgICBAYWN0aXZlUHJvamVjdCA9IHByb2plY3QgaWYgcHJvamVjdCA9IEBwcm9qZWN0Rm9yRmlsZShmaWxlUGF0aClcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGxhc3RQcm9qZWN0XG4gICAgbGFzdFByb2plY3QgaXNudCBAYWN0aXZlUHJvamVjdFxuXG4gIHByb2plY3RGb3JGaWxlOiAoZmlsZVBhdGgpIC0+XG4gICAgcmV0dXJuIGlmIHR5cGVvZiBmaWxlUGF0aCBpc250ICdzdHJpbmcnXG4gICAgcHJvamVjdCBpZiBwcm9qZWN0ID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxuXG4gIGdldE1hcmtkb3duOiAtPlxuICAgIHRvZG9zTWFya2Rvd24gPSBuZXcgVG9kb3NNYXJrZG93blxuICAgIHRvZG9zTWFya2Rvd24ubWFya2Rvd24gQGdldFRvZG9zKClcblxuICBjYW5jZWxTZWFyY2g6IC0+XG4gICAgQHNlYXJjaFByb21pc2U/LmNhbmNlbD8oKVxuXG4gICMgVE9ETzogUHJldmlvdXMgc2VhcmNoZXMgYXJlIG5vdCBzYXZlZCB5ZXQhXG4gIGdldFByZXZpb3VzU2VhcmNoOiAtPlxuICAgIHNvcnRCeSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtICd0b2RvLXNob3cucHJldmlvdXMtc29ydEJ5J1xuXG4gIHNldFByZXZpb3VzU2VhcmNoOiAoc2VhcmNoKSAtPlxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtICd0b2RvLXNob3cucHJldmlvdXMtc2VhcmNoJywgc2VhcmNoXG4iXX0=
