(function() {
  var CodeView, CompositeDisposable, ItemView, ShowTodoView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('atom-space-pen-views').View;

  ItemView = (function(superClass) {
    extend(ItemView, superClass);

    function ItemView() {
      return ItemView.__super__.constructor.apply(this, arguments);
    }

    ItemView.content = function(item) {
      return this.span({
        "class": 'badge badge-large',
        'data-id': item
      }, item);
    };

    return ItemView;

  })(View);

  CodeView = (function(superClass) {
    extend(CodeView, superClass);

    function CodeView() {
      return CodeView.__super__.constructor.apply(this, arguments);
    }

    CodeView.content = function(item) {
      return this.code(item);
    };

    return CodeView;

  })(View);

  module.exports = ShowTodoView = (function(superClass) {
    extend(ShowTodoView, superClass);

    function ShowTodoView() {
      this.updateShowInTable = bind(this.updateShowInTable, this);
      return ShowTodoView.__super__.constructor.apply(this, arguments);
    }

    ShowTodoView.content = function() {
      return this.div({
        outlet: 'todoOptions',
        "class": 'todo-options'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('On Table');
            return _this.div({
              outlet: 'itemsOnTable',
              "class": 'block items-on-table'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Off Table');
            return _this.div({
              outlet: 'itemsOffTable',
              "class": 'block items-off-table'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Find Todos');
            return _this.div({
              outlet: 'findTodoDiv'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Find Regex');
            return _this.div({
              outlet: 'findRegexDiv'
            });
          });
          _this.div({
            "class": 'option'
          }, function() {
            _this.h2('Ignore Paths');
            return _this.div({
              outlet: 'ignorePathDiv'
            });
          });
          return _this.div({
            "class": 'option'
          }, function() {
            _this.h2('');
            return _this.div({
              "class": 'btn-group'
            }, function() {
              _this.button({
                outlet: 'configButton',
                "class": 'btn'
              }, "Go to Config");
              return _this.button({
                outlet: 'closeButton',
                "class": 'btn'
              }, "Close Options");
            });
          });
        };
      })(this));
    };

    ShowTodoView.prototype.initialize = function(collection) {
      this.collection = collection;
      this.disposables = new CompositeDisposable;
      this.handleEvents();
      return this.updateUI();
    };

    ShowTodoView.prototype.handleEvents = function() {
      this.configButton.on('click', function() {
        return atom.workspace.open('atom://config/packages/todo-show');
      });
      return this.closeButton.on('click', (function(_this) {
        return function() {
          return _this.parent().slideToggle();
        };
      })(this));
    };

    ShowTodoView.prototype.detach = function() {
      return this.disposables.dispose();
    };

    ShowTodoView.prototype.updateShowInTable = function() {
      var showInTable;
      showInTable = this.sortable.toArray();
      return atom.config.set('todo-show.showInTable', showInTable);
    };

    ShowTodoView.prototype.updateUI = function() {
      var Sortable, i, item, j, k, len, len1, len2, path, ref, ref1, ref2, regex, results, tableItems, todo, todos;
      tableItems = atom.config.get('todo-show.showInTable');
      ref = this.collection.getAvailableTableItems();
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (tableItems.indexOf(item) === -1) {
          this.itemsOffTable.append(new ItemView(item));
        } else {
          this.itemsOnTable.append(new ItemView(item));
        }
      }
      Sortable = require('sortablejs');
      this.sortable = Sortable.create(this.itemsOnTable.context, {
        group: 'tableItems',
        ghostClass: 'ghost',
        onSort: this.updateShowInTable
      });
      Sortable.create(this.itemsOffTable.context, {
        group: 'tableItems',
        ghostClass: 'ghost'
      });
      ref1 = todos = atom.config.get('todo-show.findTheseTodos');
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        todo = ref1[j];
        this.findTodoDiv.append(new CodeView(todo));
      }
      regex = atom.config.get('todo-show.findUsingRegex');
      this.findRegexDiv.append(new CodeView(regex.replace('${TODOS}', todos.join('|'))));
      ref2 = atom.config.get('todo-show.ignoreThesePaths');
      results = [];
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        path = ref2[k];
        results.push(this.ignorePathDiv.append(new CodeView(path)));
      }
      return results;
    };

    return ShowTodoView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG8tb3B0aW9ucy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkRBQUE7SUFBQTs7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDdkIsT0FBUSxPQUFBLENBQVEsc0JBQVI7O0VBRUg7Ozs7Ozs7SUFDSixRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRDthQUNSLElBQUMsQ0FBQSxJQUFELENBQU07UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1CQUFQO1FBQTRCLFNBQUEsRUFBVyxJQUF2QztPQUFOLEVBQW1ELElBQW5EO0lBRFE7Ozs7S0FEVzs7RUFJakI7Ozs7Ozs7SUFDSixRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRDthQUNSLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtJQURROzs7O0tBRFc7O0VBSXZCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7O0lBQ0osWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLE1BQUEsRUFBUSxhQUFSO1FBQXVCLENBQUEsS0FBQSxDQUFBLEVBQU8sY0FBOUI7T0FBTCxFQUFtRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDakQsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtXQUFMLEVBQXNCLFNBQUE7WUFDcEIsS0FBQyxDQUFBLEVBQUQsQ0FBSSxVQUFKO21CQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxNQUFBLEVBQVEsY0FBUjtjQUF3QixDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUEvQjthQUFMO1VBRm9CLENBQXRCO1VBSUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFB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b250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuY2xhc3MgSXRlbVZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoaXRlbSkgLT5cbiAgICBAc3BhbiBjbGFzczogJ2JhZGdlIGJhZGdlLWxhcmdlJywgJ2RhdGEtaWQnOiBpdGVtLCBpdGVtXG5cbmNsYXNzIENvZGVWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKGl0ZW0pIC0+XG4gICAgQGNvZGUgaXRlbVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTaG93VG9kb1ZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgb3V0bGV0OiAndG9kb09wdGlvbnMnLCBjbGFzczogJ3RvZG8tb3B0aW9ucycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnb3B0aW9uJywgPT5cbiAgICAgICAgQGgyICdPbiBUYWJsZSdcbiAgICAgICAgQGRpdiBvdXRsZXQ6ICdpdGVtc09uVGFibGUnLCBjbGFzczogJ2Jsb2NrIGl0ZW1zLW9uLXRhYmxlJ1xuXG4gICAgICBAZGl2IGNsYXNzOiAnb3B0aW9uJywgPT5cbiAgICAgICAgQGgyICdPZmYgVGFibGUnXG4gICAgICAgIEBkaXYgb3V0bGV0OiAnaXRlbXNPZmZUYWJsZScsIGNsYXNzOiAnYmxvY2sgaXRlbXMtb2ZmLXRhYmxlJ1xuXG4gICAgICBAZGl2IGNsYXNzOiAnb3B0aW9uJywgPT5cbiAgICAgICAgQGgyICdGaW5kIFRvZG9zJ1xuICAgICAgICBAZGl2IG91dGxldDogJ2ZpbmRUb2RvRGl2J1xuXG4gICAgICBAZGl2IGNsYXNzOiAnb3B0aW9uJywgPT5cbiAgICAgICAgQGgyICdGaW5kIFJlZ2V4J1xuICAgICAgICBAZGl2IG91dGxldDogJ2ZpbmRSZWdleERpdidcblxuICAgICAgQGRpdiBjbGFzczogJ29wdGlvbicsID0+XG4gICAgICAgIEBoMiAnSWdub3JlIFBhdGhzJ1xuICAgICAgICBAZGl2IG91dGxldDogJ2lnbm9yZVBhdGhEaXYnXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdvcHRpb24nLCA9PlxuICAgICAgICBAaDIgJydcbiAgICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCcsID0+XG4gICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdjb25maWdCdXR0b24nLCBjbGFzczogJ2J0bicsIFwiR28gdG8gQ29uZmlnXCJcbiAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2Nsb3NlQnV0dG9uJywgY2xhc3M6ICdidG4nLCBcIkNsb3NlIE9wdGlvbnNcIlxuXG4gIGluaXRpYWxpemU6IChAY29sbGVjdGlvbikgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEB1cGRhdGVVSSgpXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIEBjb25maWdCdXR0b24ub24gJ2NsaWNrJywgLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gJ2F0b206Ly9jb25maWcvcGFja2FnZXMvdG9kby1zaG93J1xuICAgIEBjbG9zZUJ1dHRvbi5vbiAnY2xpY2snLCA9PiBAcGFyZW50KCkuc2xpZGVUb2dnbGUoKVxuXG4gIGRldGFjaDogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgdXBkYXRlU2hvd0luVGFibGU6ID0+XG4gICAgc2hvd0luVGFibGUgPSBAc29ydGFibGUudG9BcnJheSgpXG4gICAgYXRvbS5jb25maWcuc2V0KCd0b2RvLXNob3cuc2hvd0luVGFibGUnLCBzaG93SW5UYWJsZSlcblxuICB1cGRhdGVVSTogLT5cbiAgICB0YWJsZUl0ZW1zID0gYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuc2hvd0luVGFibGUnKVxuICAgIGZvciBpdGVtIGluIEBjb2xsZWN0aW9uLmdldEF2YWlsYWJsZVRhYmxlSXRlbXMoKVxuICAgICAgaWYgdGFibGVJdGVtcy5pbmRleE9mKGl0ZW0pIGlzIC0xXG4gICAgICAgIEBpdGVtc09mZlRhYmxlLmFwcGVuZCBuZXcgSXRlbVZpZXcoaXRlbSlcbiAgICAgIGVsc2VcbiAgICAgICAgQGl0ZW1zT25UYWJsZS5hcHBlbmQgbmV3IEl0ZW1WaWV3KGl0ZW0pXG5cbiAgICBTb3J0YWJsZSA9IHJlcXVpcmUgJ3NvcnRhYmxlanMnXG5cbiAgICBAc29ydGFibGUgPSBTb3J0YWJsZS5jcmVhdGUoXG4gICAgICBAaXRlbXNPblRhYmxlLmNvbnRleHRcbiAgICAgIGdyb3VwOiAndGFibGVJdGVtcydcbiAgICAgIGdob3N0Q2xhc3M6ICdnaG9zdCdcbiAgICAgIG9uU29ydDogQHVwZGF0ZVNob3dJblRhYmxlXG4gICAgKVxuXG4gICAgU29ydGFibGUuY3JlYXRlKFxuICAgICAgQGl0ZW1zT2ZmVGFibGUuY29udGV4dFxuICAgICAgZ3JvdXA6ICd0YWJsZUl0ZW1zJ1xuICAgICAgZ2hvc3RDbGFzczogJ2dob3N0J1xuICAgIClcblxuICAgIGZvciB0b2RvIGluIHRvZG9zID0gYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuZmluZFRoZXNlVG9kb3MnKVxuICAgICAgQGZpbmRUb2RvRGl2LmFwcGVuZCBuZXcgQ29kZVZpZXcodG9kbylcblxuICAgIHJlZ2V4ID0gYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuZmluZFVzaW5nUmVnZXgnKVxuICAgIEBmaW5kUmVnZXhEaXYuYXBwZW5kIG5ldyBDb2RlVmlldyhyZWdleC5yZXBsYWNlKCcke1RPRE9TfScsIHRvZG9zLmpvaW4oJ3wnKSkpXG5cbiAgICBmb3IgcGF0aCBpbiBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5pZ25vcmVUaGVzZVBhdGhzJylcbiAgICAgIEBpZ25vcmVQYXRoRGl2LmFwcGVuZCBuZXcgQ29kZVZpZXcocGF0aClcbiJdfQ==
