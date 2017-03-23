(function() {
  var CompositeDisposable, ShowTodoView, TodoCollection, TodoIndicatorView;

  CompositeDisposable = require('atom').CompositeDisposable;

  ShowTodoView = require('./todo-view');

  TodoCollection = require('./todo-collection');

  TodoIndicatorView = null;

  module.exports = {
    config: {
      findTheseTodos: {
        description: 'An array of todo types used by the search regex.',
        type: 'array',
        "default": ['TODO', 'FIXME', 'CHANGED', 'XXX', 'IDEA', 'HACK', 'NOTE', 'REVIEW', 'NB', 'BUG', 'QUESTION', 'COMBAK', 'TEMP'],
        items: {
          type: 'string'
        }
      },
      findUsingRegex: {
        description: 'Regex string used to find all your todos. `${TODOS}` is replaced with `FindTheseTodos` from above.',
        type: 'string',
        "default": '/\\b(${TODOS})[:;.,]?\\d*($|\\s.*$|\\(.*$)/g'
      },
      ignoreThesePaths: {
        description: 'Similar to `.gitignore` (remember to use `/` on Mac/Linux and `\\` on Windows for subdirectories).',
        type: 'array',
        "default": ['node_modules', 'vendor', 'bower_components'],
        items: {
          type: 'string'
        }
      },
      showInTable: {
        description: 'An array of properties to show for each todo in table.',
        type: 'array',
        "default": ['Text', 'Type', 'Path']
      },
      sortBy: {
        type: 'string',
        "default": 'Text',
        "enum": ['All', 'Text', 'Type', 'Range', 'Line', 'Regex', 'Path', 'File', 'Tags', 'Id', 'Project']
      },
      sortAscending: {
        type: 'boolean',
        "default": true
      },
      openListInDirection: {
        description: 'Defines where the todo list is shown when opened.',
        type: 'string',
        "default": 'right',
        "enum": ['up', 'right', 'down', 'left', 'ontop']
      },
      rememberViewSize: {
        type: 'boolean',
        "default": true
      },
      saveOutputAs: {
        type: 'string',
        "default": 'List',
        "enum": ['List', 'Table']
      },
      statusBarIndicator: {
        type: 'boolean',
        "default": false
      }
    },
    URI: {
      workspace: 'atom://todo-show/todos',
      project: 'atom://todo-show/project-todos',
      open: 'atom://todo-show/open-todos',
      active: 'atom://todo-show/active-todos'
    },
    activate: function() {
      this.collection = new TodoCollection;
      this.collection.setAvailableTableItems(this.config.sortBy["enum"]);
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.commands.add('atom-workspace', {
        'todo-show:find-in-workspace': (function(_this) {
          return function() {
            return _this.show(_this.URI.workspace);
          };
        })(this),
        'todo-show:find-in-project': (function(_this) {
          return function() {
            return _this.show(_this.URI.project);
          };
        })(this),
        'todo-show:find-in-open-files': (function(_this) {
          return function() {
            return _this.show(_this.URI.open);
          };
        })(this),
        'todo-show:find-in-active-file': (function(_this) {
          return function() {
            return _this.show(_this.URI.active);
          };
        })(this)
      }));
      return this.disposables.add(atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var scope;
          scope = (function() {
            switch (uriToOpen) {
              case this.URI.workspace:
                return 'workspace';
              case this.URI.project:
                return 'project';
              case this.URI.open:
                return 'open';
              case this.URI.active:
                return 'active';
            }
          }).call(_this);
          if (scope) {
            _this.collection.scope = scope;
            return new ShowTodoView(_this.collection, uriToOpen);
          }
        };
      })(this)));
    },
    deactivate: function() {
      var ref;
      this.destroyTodoIndicator();
      return (ref = this.disposables) != null ? ref.dispose() : void 0;
    },
    destroyPaneItem: function() {
      var pane;
      pane = atom.workspace.paneForItem(this.showTodoView);
      if (!pane) {
        return false;
      }
      pane.destroyItem(this.showTodoView);
      if (pane.getItems().length === 0) {
        pane.destroy();
      }
      return true;
    },
    show: function(uri) {
      var direction, prevPane;
      prevPane = atom.workspace.getActivePane();
      direction = atom.config.get('todo-show.openListInDirection');
      if (this.destroyPaneItem()) {
        return;
      }
      switch (direction) {
        case 'down':
          if (prevPane.parent.orientation !== 'vertical') {
            prevPane.splitDown();
          }
          break;
        case 'up':
          if (prevPane.parent.orientation !== 'vertical') {
            prevPane.splitUp();
          }
          break;
        case 'left':
          if (prevPane.parent.orientation !== 'horizontal') {
            prevPane.splitLeft();
          }
      }
      return atom.workspace.open(uri, {
        split: direction
      }).then((function(_this) {
        return function(showTodoView) {
          _this.showTodoView = showTodoView;
          return prevPane.activate();
        };
      })(this));
    },
    consumeStatusBar: function(statusBar) {
      return atom.config.observe('todo-show.statusBarIndicator', (function(_this) {
        return function(newValue) {
          if (newValue) {
            if (TodoIndicatorView == null) {
              TodoIndicatorView = require('./todo-indicator-view');
            }
            if (_this.todoIndicatorView == null) {
              _this.todoIndicatorView = new TodoIndicatorView(_this.collection);
            }
            return _this.statusBarTile = statusBar.addLeftTile({
              item: _this.todoIndicatorView,
              priority: 200
            });
          } else {
            return _this.destroyTodoIndicator();
          }
        };
      })(this));
    },
    destroyTodoIndicator: function() {
      var ref, ref1;
      if ((ref = this.todoIndicatorView) != null) {
        ref.destroy();
      }
      this.todoIndicatorView = null;
      if ((ref1 = this.statusBarTile) != null) {
        ref1.destroy();
      }
      return this.statusBarTile = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxhQUFSOztFQUNmLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUNqQixpQkFBQSxHQUFvQjs7RUFFcEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLGNBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxrREFBYjtRQUNBLElBQUEsRUFBTSxPQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUNQLE1BRE8sRUFFUCxPQUZPLEVBR1AsU0FITyxFQUlQLEtBSk8sRUFLUCxNQUxPLEVBTVAsTUFOTyxFQU9QLE1BUE8sRUFRUCxRQVJPLEVBU1AsSUFUTyxFQVVQLEtBVk8sRUFXUCxVQVhPLEVBWVAsUUFaTyxFQWFQLE1BYk8sQ0FGVDtRQWlCQSxLQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQWxCRjtPQURGO01Bb0JBLGNBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxvR0FBYjtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyw4Q0FGVDtPQXJCRjtNQXdCQSxnQkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLG9HQUFiO1FBQ0EsSUFBQSxFQUFNLE9BRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQ1AsY0FETyxFQUVQLFFBRk8sRUFHUCxrQkFITyxDQUZUO1FBT0EsS0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FSRjtPQXpCRjtNQWtDQSxXQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsd0RBQWI7UUFDQSxJQUFBLEVBQU0sT0FETjtRQUVBLENBQUEs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QUMsQ0FBQSxvQkFBRCxDQUFBLEVBTEY7O1FBRGtEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwRDtJQURnQixDQXhIbEI7SUFpSUEsb0JBQUEsRUFBc0IsU0FBQTtBQUNwQixVQUFBOztXQUFrQixDQUFFLE9BQXBCLENBQUE7O01BQ0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCOztZQUNQLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUpHLENBakl0Qjs7QUFQRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cblNob3dUb2RvVmlldyA9IHJlcXVpcmUgJy4vdG9kby12aWV3J1xuVG9kb0NvbGxlY3Rpb24gPSByZXF1aXJlICcuL3RvZG8tY29sbGVjdGlvbidcblRvZG9JbmRpY2F0b3JWaWV3ID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBmaW5kVGhlc2VUb2RvczpcbiAgICAgIGRlc2NyaXB0aW9uOiAnQW4gYXJyYXkgb2YgdG9kbyB0eXBlcyB1c2VkIGJ5IHRoZSBzZWFyY2ggcmVnZXguJ1xuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW1xuICAgICAgICAnVE9ETydcbiAgICAgICAgJ0ZJWE1FJ1xuICAgICAgICAnQ0hBTkdFRCdcbiAgICAgICAgJ1hYWCdcbiAgICAgICAgJ0lERUEnXG4gICAgICAgICdIQUNLJ1xuICAgICAgICAnTk9URSdcbiAgICAgICAgJ1JFVklFVydcbiAgICAgICAgJ05CJ1xuICAgICAgICAnQlVHJ1xuICAgICAgICAnUVVFU1RJT04nXG4gICAgICAgICdDT01CQUsnXG4gICAgICAgICdURU1QJ1xuICAgICAgXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZmluZFVzaW5nUmVnZXg6XG4gICAgICBkZXNjcmlwdGlvbjogJ1JlZ2V4IHN0cmluZyB1c2VkIHRvIGZpbmQgYWxsIHlvdXIgdG9kb3MuIGAke1RPRE9TfWAgaXMgcmVwbGFjZWQgd2l0aCBgRmluZFRoZXNlVG9kb3NgIGZyb20gYWJvdmUuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcvXFxcXGIoJHtUT0RPU30pWzo7LixdP1xcXFxkKigkfFxcXFxzLiokfFxcXFwoLiokKS9nJ1xuICAgIGlnbm9yZVRoZXNlUGF0aHM6XG4gICAgICBkZXNjcmlwdGlvbjogJ1NpbWlsYXIgdG8gYC5naXRpZ25vcmVgIChyZW1lbWJlciB0byB1c2UgYC9gIG9uIE1hYy9MaW51eCBhbmQgYFxcXFxgIG9uIFdpbmRvd3MgZm9yIHN1YmRpcmVjdG9yaWVzKS4nXG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXG4gICAgICAgICdub2RlX21vZHVsZXMnXG4gICAgICAgICd2ZW5kb3InXG4gICAgICAgICdib3dlcl9jb21wb25lbnRzJ1xuICAgICAgXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgc2hvd0luVGFibGU6XG4gICAgICBkZXNjcmlwdGlvbjogJ0FuIGFycmF5IG9mIHByb3BlcnRpZXMgdG8gc2hvdyBmb3IgZWFjaCB0b2RvIGluIHRhYmxlLidcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFsnVGV4dCcsICdUeXBlJywgJ1BhdGgnXVxuICAgIHNvcnRCeTpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnVGV4dCdcbiAgICAgIGVudW06IFsnQWxsJywgJ1RleHQnLCAnVHlwZScsICdSYW5nZScsICdMaW5lJywgJ1JlZ2V4JywgJ1BhdGgnLCAnRmlsZScsICdUYWdzJywgJ0lkJywgJ1Byb2plY3QnXVxuICAgIHNvcnRBc2NlbmRpbmc6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBvcGVuTGlzdEluRGlyZWN0aW9uOlxuICAgICAgZGVzY3JpcHRpb246ICdEZWZpbmVzIHdoZXJlIHRoZSB0b2RvIGxpc3QgaXMgc2hvd24gd2hlbiBvcGVuZWQuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdyaWdodCdcbiAgICAgIGVudW06IFsndXAnLCAncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ29udG9wJ11cbiAgICByZW1lbWJlclZpZXdTaXplOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgc2F2ZU91dHB1dEFzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdMaXN0J1xuICAgICAgZW51bTogWydMaXN0JywgJ1RhYmxlJ11cbiAgICBzdGF0dXNCYXJJbmRpY2F0b3I6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG5cbiAgVVJJOlxuICAgIHdvcmtzcGFjZTogJ2F0b206Ly90b2RvLXNob3cvdG9kb3MnXG4gICAgcHJvamVjdDogJ2F0b206Ly90b2RvLXNob3cvcHJvamVjdC10b2RvcydcbiAgICBvcGVuOiAnYXRvbTovL3RvZG8tc2hvdy9vcGVuLXRvZG9zJ1xuICAgIGFjdGl2ZTogJ2F0b206Ly90b2RvLXNob3cvYWN0aXZlLXRvZG9zJ1xuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBjb2xsZWN0aW9uID0gbmV3IFRvZG9Db2xsZWN0aW9uXG4gICAgQGNvbGxlY3Rpb24uc2V0QXZhaWxhYmxlVGFibGVJdGVtcyhAY29uZmlnLnNvcnRCeS5lbnVtKVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndG9kby1zaG93OmZpbmQtaW4td29ya3NwYWNlJzogPT4gQHNob3coQFVSSS53b3Jrc3BhY2UpXG4gICAgICAndG9kby1zaG93OmZpbmQtaW4tcHJvamVjdCc6ID0+IEBzaG93KEBVUkkucHJvamVjdClcbiAgICAgICd0b2RvLXNob3c6ZmluZC1pbi1vcGVuLWZpbGVzJzogPT4gQHNob3coQFVSSS5vcGVuKVxuICAgICAgJ3RvZG8tc2hvdzpmaW5kLWluLWFjdGl2ZS1maWxlJzogPT4gQHNob3coQFVSSS5hY3RpdmUpXG5cbiAgICAjIFJlZ2lzdGVyIHRoZSB0b2RvbGlzdCBVUkksIHdoaWNoIHdpbGwgdGhlbiBvcGVuIG91ciBjdXN0b20gdmlld1xuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyICh1cmlUb09wZW4pID0+XG4gICAgICBzY29wZSA9IHN3aXRjaCB1cmlUb09wZW5cbiAgICAgICAgd2hlbiBAVVJJLndvcmtzcGFjZSB0aGVuICd3b3Jrc3BhY2UnXG4gICAgICAgIHdoZW4gQFVSSS5wcm9qZWN0IHRoZW4gJ3Byb2plY3QnXG4gICAgICAgIHdoZW4gQFVSSS5vcGVuIHRoZW4gJ29wZW4nXG4gICAgICAgIHdoZW4gQFVSSS5hY3RpdmUgdGhlbiAnYWN0aXZlJ1xuICAgICAgaWYgc2NvcGVcbiAgICAgICAgQGNvbGxlY3Rpb24uc2NvcGUgPSBzY29wZVxuICAgICAgICBuZXcgU2hvd1RvZG9WaWV3KEBjb2xsZWN0aW9uLCB1cmlUb09wZW4pXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGVzdHJveVRvZG9JbmRpY2F0b3IoKVxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG5cbiAgZGVzdHJveVBhbmVJdGVtOiAtPlxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShAc2hvd1RvZG9WaWV3KVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgcGFuZVxuXG4gICAgcGFuZS5kZXN0cm95SXRlbShAc2hvd1RvZG9WaWV3KVxuICAgICMgSWdub3JlIGNvcmUuZGVzdHJveUVtcHR5UGFuZXMgYW5kIGNsb3NlIGVtcHR5IHBhbmVcbiAgICBwYW5lLmRlc3Ryb3koKSBpZiBwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIGlzIDBcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHNob3c6ICh1cmkpIC0+XG4gICAgcHJldlBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBkaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5vcGVuTGlzdEluRGlyZWN0aW9uJylcblxuICAgIHJldHVybiBpZiBAZGVzdHJveVBhbmVJdGVtKClcblxuICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ2Rvd24nXG4gICAgICAgIHByZXZQYW5lLnNwbGl0RG93bigpIGlmIHByZXZQYW5lLnBhcmVudC5vcmllbnRhdGlvbiBpc250ICd2ZXJ0aWNhbCdcbiAgICAgIHdoZW4gJ3VwJ1xuICAgICAgICBwcmV2UGFuZS5zcGxpdFVwKCkgaWYgcHJldlBhbmUucGFyZW50Lm9yaWVudGF0aW9uIGlzbnQgJ3ZlcnRpY2FsJ1xuICAgICAgd2hlbiAnbGVmdCdcbiAgICAgICAgcHJldlBhbmUuc3BsaXRMZWZ0KCkgaWYgcHJldlBhbmUucGFyZW50Lm9yaWVudGF0aW9uIGlzbnQgJ2hvcml6b250YWwnXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHVyaSwgc3BsaXQ6IGRpcmVjdGlvbikudGhlbiAoQHNob3dUb2RvVmlldykgPT5cbiAgICAgIHByZXZQYW5lLmFjdGl2YXRlKClcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyKSAtPlxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ3RvZG8tc2hvdy5zdGF0dXNCYXJJbmRpY2F0b3InLCAobmV3VmFsdWUpID0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICBUb2RvSW5kaWNhdG9yVmlldyA/PSByZXF1aXJlICcuL3RvZG8taW5kaWNhdG9yLXZpZXcnXG4gICAgICAgIEB0b2RvSW5kaWNhdG9yVmlldyA/PSBuZXcgVG9kb0luZGljYXRvclZpZXcoQGNvbGxlY3Rpb24pXG4gICAgICAgIEBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKGl0ZW06IEB0b2RvSW5kaWNhdG9yVmlldywgcHJpb3JpdHk6IDIwMClcbiAgICAgIGVsc2VcbiAgICAgICAgQGRlc3Ryb3lUb2RvSW5kaWNhdG9yKClcblxuICBkZXN0cm95VG9kb0luZGljYXRvcjogLT5cbiAgICBAdG9kb0luZGljYXRvclZpZXc/LmRlc3Ryb3koKVxuICAgIEB0b2RvSW5kaWNhdG9yVmlldyA9IG51bGxcbiAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgQHN0YXR1c0JhclRpbGUgPSBudWxsXG4iXX0=
