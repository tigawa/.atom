(function() {
  var CompositeDisposable, ScrollView, ShowTodoView, TextBuffer, TextEditorView, TodoOptions, TodoTable, deprecatedTextEditor, fs, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, TextBuffer = ref.TextBuffer;

  ref1 = require('atom-space-pen-views'), ScrollView = ref1.ScrollView, TextEditorView = ref1.TextEditorView;

  path = require('path');

  fs = require('fs-plus');

  TodoTable = require('./todo-table-view');

  TodoOptions = require('./todo-options-view');

  deprecatedTextEditor = function(params) {
    var TextEditor;
    if (atom.workspace.buildTextEditor != null) {
      return atom.workspace.buildTextEditor(params);
    } else {
      TextEditor = require('atom').TextEditor;
      return new TextEditor(params);
    }
  };

  module.exports = ShowTodoView = (function(superClass) {
    extend(ShowTodoView, superClass);

    ShowTodoView.content = function(collection, filterBuffer) {
      var filterEditor;
      filterEditor = deprecatedTextEditor({
        mini: true,
        tabLength: 2,
        softTabs: true,
        softWrapped: false,
        buffer: filterBuffer,
        placeholderText: 'Search Todos'
      });
      return this.div({
        "class": 'show-todo-preview',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'input-block'
          }, function() {
            _this.div({
              "class": 'input-block-item input-block-item--flex'
            }, function() {
              return _this.subview('filterEditorView', new TextEditorView({
                editor: filterEditor
              }));
            });
            return _this.div({
              "class": 'input-block-item'
            }, function() {
              return _this.div({
                "class": 'btn-group'
              }, function() {
                _this.button({
                  outlet: 'scopeButton',
                  "class": 'btn'
                });
                _this.button({
                  outlet: 'optionsButton',
                  "class": 'btn icon-gear'
                });
                _this.button({
                  outlet: 'saveAsButton',
                  "class": 'btn icon-cloud-download'
                });
                return _this.button({
                  outlet: 'refreshButton',
                  "class": 'btn icon-sync'
                });
              });
            });
          });
          _this.div({
            "class": 'input-block todo-info-block'
          }, function() {
            return _this.div({
              "class": 'input-block-item'
            }, function() {
              return _this.span({
                outlet: 'todoInfo'
              });
            });
          });
          _this.div({
            outlet: 'optionsView'
          });
          _this.div({
            outlet: 'todoLoading',
            "class": 'todo-loading'
          }, function() {
            _this.div({
              "class": 'markdown-spinner'
            });
            return _this.h5({
              outlet: 'searchCount',
              "class": 'text-center'
            }, "Loading Todos...");
          });
          return _this.subview('todoTable', new TodoTable(collection));
        };
      })(this));
    };

    function ShowTodoView(collection1, uri) {
      this.collection = collection1;
      this.uri = uri;
      this.toggleOptions = bind(this.toggleOptions, this);
      this.setScopeButtonState = bind(this.setScopeButtonState, this);
      this.toggleSearchScope = bind(this.toggleSearchScope, this);
      this.saveAs = bind(this.saveAs, this);
      this.stopLoading = bind(this.stopLoading, this);
      this.startLoading = bind(this.startLoading, this);
      ShowTodoView.__super__.constructor.call(this, this.collection, this.filterBuffer = new TextBuffer);
    }

    ShowTodoView.prototype.initialize = function() {
      this.disposables = new CompositeDisposable;
      this.handleEvents();
      this.collection.search();
      this.setScopeButtonState(this.collection.getSearchScope());
      this.notificationOptions = {
        detail: 'Atom todo-show package',
        dismissable: true,
        icon: this.getIconName()
      };
      this.checkDeprecation();
      this.disposables.add(atom.tooltips.add(this.scopeButton, {
        title: "What to Search"
      }));
      this.disposables.add(atom.tooltips.add(this.optionsButton, {
        title: "Show Todo Options"
      }));
      this.disposables.add(atom.tooltips.add(this.saveAsButton, {
        title: "Save Todos to File"
      }));
      return this.disposables.add(atom.tooltips.add(this.refreshButton, {
        title: "Refresh Todos"
      }));
    };

    ShowTodoView.prototype.handleEvents = function() {
      var pane;
      this.disposables.add(atom.commands.add(this.element, {
        'core:save-as': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.saveAs();
          };
        })(this),
        'core:refresh': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.collection.search();
          };
        })(this)
      }));
      pane = atom.workspace.getActivePane();
      if (atom.config.get('todo-show.rememberViewSize')) {
        this.restorePaneFlex(pane);
      }
      this.disposables.add(pane.observeFlexScale((function(_this) {
        return function(flexScale) {
          return _this.savePaneFlex(flexScale);
        };
      })(this)));
      this.disposables.add(this.collection.onDidStartSearch(this.startLoading));
      this.disposables.add(this.collection.onDidFinishSearch(this.stopLoading));
      this.disposables.add(this.collection.onDidFailSearch((function(_this) {
        return function(err) {
          _this.searchCount.text("Search Failed");
          if (err) {
            console.error(err);
          }
          if (err) {
            return _this.showError(err);
          }
        };
      })(this)));
      this.disposables.add(this.collection.onDidChangeSearchScope((function(_this) {
        return function(scope) {
          _this.setScopeButtonState(scope);
          return _this.collection.search();
        };
      })(this)));
      this.disposables.add(this.collection.onDidSearchPaths((function(_this) {
        return function(nPaths) {
          return _this.searchCount.text(nPaths + " paths searched...");
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          if (_this.collection.setActiveProject(item != null ? typeof item.getPath === "function" ? item.getPath() : void 0 : void 0) || ((item != null ? item.constructor.name : void 0) === 'TextEditor' && _this.collection.scope === 'active')) {
            return _this.collection.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidAddTextEditor((function(_this) {
        return function(arg) {
          var textEditor;
          textEditor = arg.textEditor;
          if (_this.collection.scope === 'open') {
            return _this.collection.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidDestroyPaneItem((function(_this) {
        return function(arg) {
          var item;
          item = arg.item;
          if (_this.collection.scope === 'open') {
            return _this.collection.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.disposables.add(editor.onDidSave(function() {
            return _this.collection.search();
          }));
        };
      })(this)));
      this.filterEditorView.getModel().onDidStopChanging((function(_this) {
        return function() {
          if (_this.firstTimeFilter) {
            _this.filter();
          }
          return _this.firstTimeFilter = true;
        };
      })(this));
      this.scopeButton.on('click', this.toggleSearchScope);
      this.optionsButton.on('click', this.toggleOptions);
      this.saveAsButton.on('click', this.saveAs);
      return this.refreshButton.on('click', (function(_this) {
        return function() {
          return _this.collection.search();
        };
      })(this));
    };

    ShowTodoView.prototype.destroy = function() {
      this.collection.cancelSearch();
      this.disposables.dispose();
      return this.detach();
    };

    ShowTodoView.prototype.savePaneFlex = function(flex) {
      return localStorage.setItem('todo-show.flex', flex);
    };

    ShowTodoView.prototype.restorePaneFlex = function(pane) {
      var flex;
      flex = localStorage.getItem('todo-show.flex');
      if (flex) {
        return pane.setFlexScale(parseFloat(flex));
      }
    };

    ShowTodoView.prototype.getTitle = function() {
      return "Todo Show";
    };

    ShowTodoView.prototype.getIconName = function() {
      return "checklist";
    };

    ShowTodoView.prototype.getURI = function() {
      return this.uri;
    };

    ShowTodoView.prototype.getProjectName = function() {
      return this.collection.getActiveProjectName();
    };

    ShowTodoView.prototype.getProjectPath = function() {
      return this.collection.getActiveProject();
    };

    ShowTodoView.prototype.getTodos = function() {
      return this.collection.getTodos();
    };

    ShowTodoView.prototype.getTodosCount = function() {
      return this.collection.getTodosCount();
    };

    ShowTodoView.prototype.isSearching = function() {
      return this.collection.getState();
    };

    ShowTodoView.prototype.startLoading = function() {
      this.todoLoading.show();
      return this.updateInfo();
    };

    ShowTodoView.prototype.stopLoading = function() {
      this.todoLoading.hide();
      return this.updateInfo();
    };

    ShowTodoView.prototype.updateInfo = function() {
      return this.todoInfo.html((this.getInfoText()) + " " + (this.getScopeText()));
    };

    ShowTodoView.prototype.getInfoText = function() {
      var count;
      if (this.isSearching()) {
        return "Found ... results";
      }
      switch (count = this.getTodosCount()) {
        case 1:
          return "Found " + count + " result";
        default:
          return "Found " + count + " results";
      }
    };

    ShowTodoView.prototype.getScopeText = function() {
      switch (this.collection.scope) {
        case 'active':
          return "in active file";
        case 'open':
          return "in open files";
        case 'project':
          return "in project <code>" + (this.getProjectName()) + "</code>";
        default:
          return "in workspace";
      }
    };

    ShowTodoView.prototype.showError = function(message) {
      if (message == null) {
        message = '';
      }
      return atom.notifications.addError(message.toString(), this.notificationOptions);
    };

    ShowTodoView.prototype.showWarning = function(message) {
      if (message == null) {
        message = '';
      }
      return atom.notifications.addWarning(message.toString(), this.notificationOptions);
    };

    ShowTodoView.prototype.saveAs = function() {
      var filePath, outputFilePath, projectPath;
      if (this.isSearching()) {
        return;
      }
      filePath = (this.getProjectName() || 'todos') + ".md";
      if (projectPath = this.getProjectPath()) {
        filePath = path.join(projectPath, filePath);
      }
      if (outputFilePath = atom.showSaveDialogSync(filePath.toLowerCase())) {
        fs.writeFileSync(outputFilePath, this.collection.getMarkdown());
        return atom.workspace.open(outputFilePath);
      }
    };

    ShowTodoView.prototype.toggleSearchScope = function() {
      var scope;
      scope = this.collection.toggleSearchScope();
      return this.setScopeButtonState(scope);
    };

    ShowTodoView.prototype.setScopeButtonState = function(state) {
      switch (state) {
        case 'workspace':
          return this.scopeButton.text('Workspace');
        case 'project':
          return this.scopeButton.text('Project');
        case 'open':
          return this.scopeButton.text('Open Files');
        case 'active':
          return this.scopeButton.text('Active File');
      }
    };

    ShowTodoView.prototype.toggleOptions = function() {
      if (!this.todoOptions) {
        this.optionsView.hide();
        this.todoOptions = new TodoOptions(this.collection);
        this.optionsView.html(this.todoOptions);
      }
      return this.optionsView.slideToggle();
    };

    ShowTodoView.prototype.filter = function() {
      return this.collection.filterTodos(this.filterBuffer.getText());
    };

    ShowTodoView.prototype.checkDeprecation = function() {
      if (atom.config.get('todo-show.findTheseRegexes')) {
        return this.showWarning('Deprecation Warning:\n\n`findTheseRegexes` config is deprecated, please use `findTheseTodos` and `findUsingRegex` for custom behaviour.\nSee https://github.com/mrodalgaard/atom-todo-show#config for more information.');
      }
    };

    return ShowTodoView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG8tdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRJQUFBO0lBQUE7Ozs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDZDQUFELEVBQXNCOztFQUN0QixPQUErQixPQUFBLENBQVEsc0JBQVIsQ0FBL0IsRUFBQyw0QkFBRCxFQUFhOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsU0FBQSxHQUFZLE9BQUEsQ0FBUSxtQkFBUjs7RUFDWixXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUVkLG9CQUFBLEdBQXVCLFNBQUMsTUFBRDtBQUNyQixRQUFBO0lBQUEsSUFBRyxzQ0FBSDthQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUErQixNQUEvQixFQURGO0tBQUEsTUFBQTtNQUdFLFVBQUEsR0FBYSxPQUFBLENBQVEsTUFBUixDQUFlLENBQUM7YUFDekIsSUFBQSxVQUFBLENBQVcsTUFBWCxFQUpOOztFQURxQjs7RUFPdkIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ0osWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLFVBQUQsRUFBYSxZQUFiO0FBQ1IsVUFBQTtNQUFBLFlBQUEsR0FBZSxvQkFBQSxDQUNiO1FBQUEsSUFBQSxFQUFNLElBQU47UUFDQSxTQUFBLEVBQVcsQ0FEWDtRQUVBLFFBQUEsRUFBVSxJQUZWO1FBR0EsV0FBQSxFQUFhLEtBSGI7UUFJQSxNQUFBLEVBQVEsWUFKUjtRQUtBLGVBQUEsRUFBaUIsY0FMakI7T0FEYTthQVNmLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1CQUFQO1FBQTRCLFFBQUEsRUFBVSxDQUFD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LENBQWtCLFdBQWxCO0FBRHhCLGFBRU8sU0FGUDtpQkFFc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFNBQWxCO0FBRnRCLGFBR08sTUFIUDtpQkFHbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFlBQWxCO0FBSG5CLGFBSU8sUUFKUDtpQkFJcUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLGFBQWxCO0FBSnJCO0lBRG1COzsyQkFPckIsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFBLENBQU8sSUFBQyxDQUFBLFdBQVI7UUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBQTtRQUNBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsV0FBQSxDQUFZLElBQUMsQ0FBQSxVQUFiO1FBQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixJQUFDLENBQUEsV0FBbkIsRUFIRjs7YUFJQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBQTtJQUxhOzsyQkFPZixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUF3QixJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQSxDQUF4QjtJQURNOzsyQkFHUixnQkFBQSxHQUFrQixTQUFBO01BQ2hCLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUFIO2VBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSx5TkFBYixFQURGOztJQURnQjs7OztLQXBNTztBQWhCM0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gPSByZXF1aXJlICdhdG9tJ1xue1Njcm9sbFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5cblRvZG9UYWJsZSA9IHJlcXVpcmUgJy4vdG9kby10YWJsZS12aWV3J1xuVG9kb09wdGlvbnMgPSByZXF1aXJlICcuL3RvZG8tb3B0aW9ucy12aWV3J1xuXG5kZXByZWNhdGVkVGV4dEVkaXRvciA9IChwYXJhbXMpIC0+XG4gIGlmIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcj9cbiAgICBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IocGFyYW1zKVxuICBlbHNlXG4gICAgVGV4dEVkaXRvciA9IHJlcXVpcmUoJ2F0b20nKS5UZXh0RWRpdG9yXG4gICAgbmV3IFRleHRFZGl0b3IocGFyYW1zKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTaG93VG9kb1ZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG4gIEBjb250ZW50OiAoY29sbGVjdGlvbiwgZmlsdGVyQnVmZmVyKSAtPlxuICAgIGZpbHRlckVkaXRvciA9IGRlcHJlY2F0ZWRUZXh0RWRpdG9yKFxuICAgICAgbWluaTogdHJ1ZVxuICAgICAgdGFiTGVuZ3RoOiAyXG4gICAgICBzb2Z0VGFiczogdHJ1ZVxuICAgICAgc29mdFdyYXBwZWQ6IGZhbHNlXG4gICAgICBidWZmZXI6IGZpbHRlckJ1ZmZlclxuICAgICAgcGxhY2Vob2xkZXJUZXh0OiAnU2VhcmNoIFRvZG9zJ1xuICAgIClcblxuICAgIEBkaXYgY2xhc3M6ICdzaG93LXRvZG8tcHJldmlldycsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdpbnB1dC1ibG9jaycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdpbnB1dC1ibG9jay1pdGVtIGlucHV0LWJsb2NrLWl0ZW0tLWZsZXgnLCA9PlxuICAgICAgICAgIEBzdWJ2aWV3ICdmaWx0ZXJFZGl0b3JWaWV3JywgbmV3IFRleHRFZGl0b3JWaWV3KGVkaXRvcjogZmlsdGVyRWRpdG9yKVxuICAgICAgICBAZGl2IGNsYXNzOiAnaW5wdXQtYmxvY2staXRlbScsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCcsID0+XG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ3Njb3BlQnV0dG9uJywgY2xhc3M6ICdidG4nXG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ29wdGlvbnNCdXR0b24nLCBjbGFzczogJ2J0biBpY29uLWdlYXInXG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ3NhdmVBc0J1dHRvbicsIGNsYXNzOiAnYnRuIGljb24tY2xvdWQtZG93bmxvYWQnXG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ3JlZnJlc2hCdXR0b24nLCBjbGFzczogJ2J0biBpY29uLXN5bmMnXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdpbnB1dC1ibG9jayB0b2RvLWluZm8tYmxvY2snLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnaW5wdXQtYmxvY2staXRlbScsID0+XG4gICAgICAgICAgQHNwYW4gb3V0bGV0OiAndG9kb0luZm8nXG5cbiAgICAgIEBkaXYgb3V0bGV0OiAnb3B0aW9uc1ZpZXcnXG5cbiAgICAgIEBkaXYgb3V0bGV0OiAndG9kb0xvYWRpbmcnLCBjbGFzczogJ3RvZG8tbG9hZGluZycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdtYXJrZG93bi1zcGlubmVyJ1xuICAgICAgICBAaDUgb3V0bGV0OiAnc2VhcmNoQ291bnQnLCBjbGFzczogJ3RleHQtY2VudGVyJywgXCJMb2FkaW5nIFRvZG9zLi4uXCJcblxuICAgICAgQHN1YnZpZXcgJ3RvZG9UYWJsZScsIG5ldyBUb2RvVGFibGUoY29sbGVjdGlvbilcblxuICBjb25zdHJ1Y3RvcjogKEBjb2xsZWN0aW9uLCBAdXJpKSAtPlxuICAgIHN1cGVyIEBjb2xsZWN0aW9uLCBAZmlsdGVyQnVmZmVyID0gbmV3IFRleHRCdWZmZXJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGhhbmRsZUV2ZW50cygpXG4gICAgQGNvbGxlY3Rpb24uc2VhcmNoKClcbiAgICBAc2V0U2NvcGVCdXR0b25TdGF0ZShAY29sbGVjdGlvbi5nZXRTZWFyY2hTY29wZSgpKVxuXG4gICAgQG5vdGlmaWNhdGlvbk9wdGlvbnMgPVxuICAgICAgZGV0YWlsOiAnQXRvbSB0b2RvLXNob3cgcGFja2FnZSdcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBpY29uOiBAZ2V0SWNvbk5hbWUoKVxuXG4gICAgQGNoZWNrRGVwcmVjYXRpb24oKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAc2NvcGVCdXR0b24sIHRpdGxlOiBcIldoYXQgdG8gU2VhcmNoXCJcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBvcHRpb25zQnV0dG9uLCB0aXRsZTogXCJTaG93IFRvZG8gT3B0aW9uc1wiXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAc2F2ZUFzQnV0dG9uLCB0aXRsZTogXCJTYXZlIFRvZG9zIHRvIEZpbGVcIlxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHJlZnJlc2hCdXR0b24sIHRpdGxlOiBcIlJlZnJlc2ggVG9kb3NcIlxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgQHNhdmVBcygpXG4gICAgICAnY29yZTpyZWZyZXNoJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBAY29sbGVjdGlvbi5zZWFyY2goKVxuXG4gICAgIyBQZXJzaXN0IHBhbmUgc2l6ZSBieSBzYXZpbmcgdG8gbG9jYWwgc3RvcmFnZVxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBAcmVzdG9yZVBhbmVGbGV4KHBhbmUpIGlmIGF0b20uY29uZmlnLmdldCgndG9kby1zaG93LnJlbWVtYmVyVmlld1NpemUnKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgcGFuZS5vYnNlcnZlRmxleFNjYWxlIChmbGV4U2NhbGUpID0+XG4gICAgICBAc2F2ZVBhbmVGbGV4KGZsZXhTY2FsZSlcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGNvbGxlY3Rpb24ub25EaWRTdGFydFNlYXJjaCBAc3RhcnRMb2FkaW5nXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZEZpbmlzaFNlYXJjaCBAc3RvcExvYWRpbmdcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBjb2xsZWN0aW9uLm9uRGlkRmFpbFNlYXJjaCAoZXJyKSA9PlxuICAgICAgQHNlYXJjaENvdW50LnRleHQgXCJTZWFyY2ggRmFpbGVkXCJcbiAgICAgIGNvbnNvbGUuZXJyb3IgZXJyIGlmIGVyclxuICAgICAgQHNob3dFcnJvciBlcnIgaWYgZXJyXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBjb2xsZWN0aW9uLm9uRGlkQ2hhbmdlU2VhcmNoU2NvcGUgKHNjb3BlKSA9PlxuICAgICAgQHNldFNjb3BlQnV0dG9uU3RhdGUoc2NvcGUpXG4gICAgICBAY29sbGVjdGlvbi5zZWFyY2goKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZFNlYXJjaFBhdGhzIChuUGF0aHMpID0+XG4gICAgICBAc2VhcmNoQ291bnQudGV4dCBcIiN7blBhdGhzfSBwYXRocyBzZWFyY2hlZC4uLlwiXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBpZiBAY29sbGVjdGlvbi5zZXRBY3RpdmVQcm9qZWN0KGl0ZW0/LmdldFBhdGg/KCkpIG9yXG4gICAgICAoaXRlbT8uY29uc3RydWN0b3IubmFtZSBpcyAnVGV4dEVkaXRvcicgYW5kIEBjb2xsZWN0aW9uLnNjb3BlIGlzICdhY3RpdmUnKVxuICAgICAgICBAY29sbGVjdGlvbi5zZWFyY2goKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZEFkZFRleHRFZGl0b3IgKHt0ZXh0RWRpdG9yfSkgPT5cbiAgICAgIEBjb2xsZWN0aW9uLnNlYXJjaCgpIGlmIEBjb2xsZWN0aW9uLnNjb3BlIGlzICdvcGVuJ1xuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZERlc3Ryb3lQYW5lSXRlbSAoe2l0ZW19KSA9PlxuICAgICAgQGNvbGxlY3Rpb24uc2VhcmNoKCkgaWYgQGNvbGxlY3Rpb24uc2NvcGUgaXMgJ29wZW4nXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBlZGl0b3Iub25EaWRTYXZlID0+IEBjb2xsZWN0aW9uLnNlYXJjaCgpXG5cbiAgICBAZmlsdGVyRWRpdG9yVmlldy5nZXRNb2RlbCgpLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBAZmlsdGVyKCkgaWYgQGZpcnN0VGltZUZpbHRlclxuICAgICAgQGZpcnN0VGltZUZpbHRlciA9IHRydWVcblxuICAgIEBzY29wZUJ1dHRvbi5vbiAnY2xpY2snLCBAdG9nZ2xlU2VhcmNoU2NvcGVcbiAgICBAb3B0aW9uc0J1dHRvbi5vbiAnY2xpY2snLCBAdG9nZ2xlT3B0aW9uc1xuICAgIEBzYXZlQXNCdXR0b24ub24gJ2NsaWNrJywgQHNhdmVBc1xuICAgIEByZWZyZXNoQnV0dG9uLm9uICdjbGljaycsID0+IEBjb2xsZWN0aW9uLnNlYXJjaCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAY29sbGVjdGlvbi5jYW5jZWxTZWFyY2goKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAZGV0YWNoKClcblxuICBzYXZlUGFuZUZsZXg6IChmbGV4KSAtPlxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtICd0b2RvLXNob3cuZmxleCcsIGZsZXhcblxuICByZXN0b3JlUGFuZUZsZXg6IChwYW5lKSAtPlxuICAgIGZsZXggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSAndG9kby1zaG93LmZsZXgnXG4gICAgcGFuZS5zZXRGbGV4U2NhbGUgcGFyc2VGbG9hdChmbGV4KSBpZiBmbGV4XG5cbiAgZ2V0VGl0bGU6IC0+IFwiVG9kbyBTaG93XCJcbiAgZ2V0SWNvbk5hbWU6IC0+IFwiY2hlY2tsaXN0XCJcbiAgZ2V0VVJJOiAtPiBAdXJpXG4gIGdldFByb2plY3ROYW1lOiAtPiBAY29sbGVjdGlvbi5nZXRBY3RpdmVQcm9qZWN0TmFtZSgpXG4gIGdldFByb2plY3RQYXRoOiAtPiBAY29sbGVjdGlvbi5nZXRBY3RpdmVQcm9qZWN0KClcbiAgZ2V0VG9kb3M6IC0+IEBjb2xsZWN0aW9uLmdldFRvZG9zKClcbiAgZ2V0VG9kb3NDb3VudDogLT4gQGNvbGxlY3Rpb24uZ2V0VG9kb3NDb3VudCgpXG4gIGlzU2VhcmNoaW5nOiAtPiBAY29sbGVjdGlvbi5nZXRTdGF0ZSgpXG5cbiAgc3RhcnRMb2FkaW5nOiA9PlxuICAgIEB0b2RvTG9hZGluZy5zaG93KClcbiAgICBAdXBkYXRlSW5mbygpXG5cbiAgc3RvcExvYWRpbmc6ID0+XG4gICAgQHRvZG9Mb2FkaW5nLmhpZGUoKVxuICAgIEB1cGRhdGVJbmZvKClcblxuICB1cGRhdGVJbmZvOiAtPlxuICAgIEB0b2RvSW5mby5odG1sKFwiI3tAZ2V0SW5mb1RleHQoKX0gI3tAZ2V0U2NvcGVUZXh0KCl9XCIpXG5cbiAgZ2V0SW5mb1RleHQ6IC0+XG4gICAgcmV0dXJuIFwiRm91bmQgLi4uIHJlc3VsdHNcIiBpZiBAaXNTZWFyY2hpbmcoKVxuICAgIHN3aXRjaCBjb3VudCA9IEBnZXRUb2Rvc0NvdW50KClcbiAgICAgIHdoZW4gMSB0aGVuIFwiRm91bmQgI3tjb3VudH0gcmVzdWx0XCJcbiAgICAgIGVsc2UgXCJGb3VuZCAje2NvdW50fSByZXN1bHRzXCJcblxuICBnZXRTY29wZVRleHQ6IC0+XG4gICAgIyBUT0RPOiBBbHNvIHNob3cgbnVtYmVyIG9mIGZpbGVzXG5cbiAgICBzd2l0Y2ggQGNvbGxlY3Rpb24uc2NvcGVcbiAgICAgIHdoZW4gJ2FjdGl2ZSdcbiAgICAgICAgXCJpbiBhY3RpdmUgZmlsZVwiXG4gICAgICB3aGVuICdvcGVuJ1xuICAgICAgICBcImluIG9wZW4gZmlsZXNcIlxuICAgICAgd2hlbiAncHJvamVjdCdcbiAgICAgICAgXCJpbiBwcm9qZWN0IDxjb2RlPiN7QGdldFByb2plY3ROYW1lKCl9PC9jb2RlPlwiXG4gICAgICBlbHNlXG4gICAgICAgIFwiaW4gd29ya3NwYWNlXCJcblxuICBzaG93RXJyb3I6IChtZXNzYWdlID0gJycpIC0+XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIG1lc3NhZ2UudG9TdHJpbmcoKSwgQG5vdGlmaWNhdGlvbk9wdGlvbnNcblxuICBzaG93V2FybmluZzogKG1lc3NhZ2UgPSAnJykgLT5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBtZXNzYWdlLnRvU3RyaW5nKCksIEBub3RpZmljYXRpb25PcHRpb25zXG5cbiAgc2F2ZUFzOiA9PlxuICAgIHJldHVybiBpZiBAaXNTZWFyY2hpbmcoKVxuXG4gICAgZmlsZVBhdGggPSBcIiN7QGdldFByb2plY3ROYW1lKCkgb3IgJ3RvZG9zJ30ubWRcIlxuICAgIGlmIHByb2plY3RQYXRoID0gQGdldFByb2plY3RQYXRoKClcbiAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBmaWxlUGF0aClcblxuICAgIGlmIG91dHB1dEZpbGVQYXRoID0gYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMoZmlsZVBhdGgudG9Mb3dlckNhc2UoKSlcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0RmlsZVBhdGgsIEBjb2xsZWN0aW9uLmdldE1hcmtkb3duKCkpXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKG91dHB1dEZpbGVQYXRoKVxuXG4gIHRvZ2dsZVNlYXJjaFNjb3BlOiA9PlxuICAgIHNjb3BlID0gQGNvbGxlY3Rpb24udG9nZ2xlU2VhcmNoU2NvcGUoKVxuICAgIEBzZXRTY29wZUJ1dHRvblN0YXRlKHNjb3BlKVxuXG4gIHNldFNjb3BlQnV0dG9uU3RhdGU6IChzdGF0ZSkgPT5cbiAgICBzd2l0Y2ggc3RhdGVcbiAgICAgIHdoZW4gJ3dvcmtzcGFjZScgdGhlbiBAc2NvcGVCdXR0b24udGV4dCAnV29ya3NwYWNlJ1xuICAgICAgd2hlbiAncHJvamVjdCcgdGhlbiBAc2NvcGVCdXR0b24udGV4dCAnUHJvamVjdCdcbiAgICAgIHdoZW4gJ29wZW4nIHRoZW4gQHNjb3BlQnV0dG9uLnRleHQgJ09wZW4gRmlsZXMnXG4gICAgICB3aGVuICdhY3RpdmUnIHRoZW4gQHNjb3BlQnV0dG9uLnRleHQgJ0FjdGl2ZSBGaWxlJ1xuXG4gIHRvZ2dsZU9wdGlvbnM6ID0+XG4gICAgdW5sZXNzIEB0b2RvT3B0aW9uc1xuICAgICAgQG9wdGlvbnNWaWV3LmhpZGUoKVxuICAgICAgQHRvZG9PcHRpb25zID0gbmV3IFRvZG9PcHRpb25zKEBjb2xsZWN0aW9uKVxuICAgICAgQG9wdGlvbnNWaWV3Lmh0bWwgQHRvZG9PcHRpb25zXG4gICAgQG9wdGlvbnNWaWV3LnNsaWRlVG9nZ2xlKClcblxuICBmaWx0ZXI6IC0+XG4gICAgQGNvbGxlY3Rpb24uZmlsdGVyVG9kb3MgQGZpbHRlckJ1ZmZlci5nZXRUZXh0KClcblxuICBjaGVja0RlcHJlY2F0aW9uOiAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgndG9kby1zaG93LmZpbmRUaGVzZVJlZ2V4ZXMnKVxuICAgICAgQHNob3dXYXJuaW5nICcnJ1xuICAgICAgRGVwcmVjYXRpb24gV2FybmluZzpcXG5cbiAgICAgIGBmaW5kVGhlc2VSZWdleGVzYCBjb25maWcgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBgZmluZFRoZXNlVG9kb3NgIGFuZCBgZmluZFVzaW5nUmVnZXhgIGZvciBjdXN0b20gYmVoYXZpb3VyLlxuICAgICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tcm9kYWxnYWFyZC9hdG9tLXRvZG8tc2hvdyNjb25maWcgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICAnJydcbiJdfQ==
