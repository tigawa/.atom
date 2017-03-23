(function() {
  var TableHeaderView, TodoEmptyView, TodoView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  View = require('atom-space-pen-views').View;

  TableHeaderView = (function(superClass) {
    extend(TableHeaderView, superClass);

    function TableHeaderView() {
      return TableHeaderView.__super__.constructor.apply(this, arguments);
    }

    TableHeaderView.content = function(showInTable, arg) {
      var sortAsc, sortBy;
      if (showInTable == null) {
        showInTable = [];
      }
      sortBy = arg.sortBy, sortAsc = arg.sortAsc;
      return this.tr((function(_this) {
        return function() {
          var i, item, len, results;
          results = [];
          for (i = 0, len = showInTable.length; i < len; i++) {
            item = showInTable[i];
            results.push(_this.th(item, function() {
              if (item === sortBy && sortAsc) {
                _this.div({
                  "class": 'sort-asc icon-triangle-down active'
                });
              } else {
                _this.div({
                  "class": 'sort-asc icon-triangle-down'
                });
              }
              if (item === sortBy && !sortAsc) {
                return _this.div({
                  "class": 'sort-desc icon-triangle-up active'
                });
              } else {
                return _this.div({
                  "class": 'sort-desc icon-triangle-up'
                });
              }
            }));
          }
          return results;
        };
      })(this));
    };

    return TableHeaderView;

  })(View);

  TodoView = (function(superClass) {
    extend(TodoView, superClass);

    function TodoView() {
      this.openPath = bind(this.openPath, this);
      return TodoView.__super__.constructor.apply(this, arguments);
    }

    TodoView.content = function(showInTable, todo) {
      if (showInTable == null) {
        showInTable = [];
      }
      return this.tr((function(_this) {
        return function() {
          var i, item, len, results;
          results = [];
          for (i = 0, len = showInTable.length; i < len; i++) {
            item = showInTable[i];
            results.push(_this.td(function() {
              switch (item) {
                case 'All':
                  return _this.span(todo.all);
                case 'Text':
                  return _this.span(todo.text);
                case 'Type':
                  return _this.i(todo.type);
                case 'Range':
                  return _this.i(todo.range);
                case 'Line':
                  return _this.i(todo.line);
                case 'Regex':
                  return _this.code(todo.regex);
                case 'Path':
                  return _this.a(todo.path);
                case 'File':
                  return _this.a(todo.file);
                case 'Tags':
                  return _this.i(todo.tags);
                case 'Id':
                  return _this.i(todo.id);
                case 'Project':
                  return _this.a(todo.project);
              }
            }));
          }
          return results;
        };
      })(this));
    };

    TodoView.prototype.initialize = function(showInTable, todo1) {
      this.todo = todo1;
      return this.handleEvents();
    };

    TodoView.prototype.destroy = function() {
      return this.detach();
    };

    TodoView.prototype.handleEvents = function() {
      return this.on('click', 'td', this.openPath);
    };

    TodoView.prototype.openPath = function() {
      var position;
      if (!(this.todo && this.todo.loc)) {
        return;
      }
      position = [this.todo.position[0][0], this.todo.position[0][1]];
      return atom.workspace.open(this.todo.loc, {
        split: this.getSplitDirection(),
        pending: atom.config.get('core.allowPendingPaneItems') || false
      }).then(function() {
        var textEditor;
        if (textEditor = atom.workspace.getActiveTextEditor()) {
          textEditor.setCursorBufferPosition(position, {
            autoscroll: false
          });
          return textEditor.scrollToCursorPosition({
            center: true
          });
        }
      });
    };

    TodoView.prototype.getSplitDirection = function() {
      switch (atom.config.get('todo-show.openListInDirection')) {
        case 'up':
          return 'down';
        case 'down':
          return 'up';
        case 'left':
          return 'right';
        default:
          return 'left';
      }
    };

    return TodoView;

  })(View);

  TodoEmptyView = (function(superClass) {
    extend(TodoEmptyView, superClass);

    function TodoEmptyView() {
      return TodoEmptyView.__super__.constructor.apply(this, arguments);
    }

    TodoEmptyView.content = function(showInTable) {
      if (showInTable == null) {
        showInTable = [];
      }
      return this.tr((function(_this) {
        return function() {
          return _this.td({
            colspan: showInTable.length
          }, function() {
            return _this.p("No results...");
          });
        };
      })(this));
    };

    return TodoEmptyView;

  })(View);

  module.exports = {
    TableHeaderView: TableHeaderView,
    TodoView: TodoView,
    TodoEmptyView: TodoEmptyView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3RvZG8taXRlbS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsOENBQUE7SUFBQTs7OztFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSOztFQUVIOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLFdBQUQsRUFBbUIsR0FBbkI7QUFDUixVQUFBOztRQURTLGNBQWM7O01BQUsscUJBQVE7YUFDcEMsSUFBQyxDQUFBLEVBQUQsQ0FBSSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDRixjQUFBO0FBQUE7ZUFBQSw2Q0FBQTs7eUJBQ0UsS0FBQyxDQUFBLEVBQUQsQ0FBSSxJQUFKLEVBQVUsU0FBQTtjQUNSLElBQUcsSUFBQSxLQUFRLE1BQVIsSUFBbUIsT0FBdEI7Z0JBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSztrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9DQUFQO2lCQUFMLEVBREY7ZUFBQSxNQUFBO2dCQUdFLEtBQUMsQ0FBQSxHQUFELENBQUs7a0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw2QkFBUDtpQkFBTCxFQUhGOztjQUlBLElBQUcsSUFBQSxLQUFRLE1BQVIsSUFBbUIsQ0FBSSxPQUExQjt1QkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUNBQVA7aUJBQUwsRUFERjtlQUFBLE1BQUE7dUJBR0UsS0FBQyxDQUFBLEdBQUQsQ0FBSztrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDRCQUFQO2lCQUFMLEVBSEY7O1lBTFEsQ0FBVjtBQURGOztRQURFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFKO0lBRFE7Ozs7S0FEa0I7O0VBY3hCOzs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxX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SUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixDQUFQO0FBQUEsYUFDTyxJQURQO2lCQUNpQjtBQURqQixhQUVPLE1BRlA7aUJBRW1CO0FBRm5CLGFBR08sTUFIUDtpQkFHbUI7QUFIbkI7aUJBSU87QUFKUDtJQURpQjs7OztLQXhDRTs7RUErQ2pCOzs7Ozs7O0lBQ0osYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLFdBQUQ7O1FBQUMsY0FBYzs7YUFDdkIsSUFBQyxDQUFBLEVBQUQsQ0FBSSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0YsS0FBQyxDQUFBLEVBQUQsQ0FBSTtZQUFBLE9BQUEsRUFBUyxXQUFXLENBQUMsTUFBckI7V0FBSixFQUFpQyxTQUFBO21CQUMvQixLQUFDLENBQUEsQ0FBRCxDQUFHLGVBQUg7VUFEK0IsQ0FBakM7UUFERTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBSjtJQURROzs7O0tBRGdCOztFQU01QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLGlCQUFBLGVBQUQ7SUFBa0IsVUFBQSxRQUFsQjtJQUE0QixlQUFBLGFBQTVCOztBQXJFakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuY2xhc3MgVGFibGVIZWFkZXJWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKHNob3dJblRhYmxlID0gW10sIHtzb3J0QnksIHNvcnRBc2N9KSAtPlxuICAgIEB0ciA9PlxuICAgICAgZm9yIGl0ZW0gaW4gc2hvd0luVGFibGVcbiAgICAgICAgQHRoIGl0ZW0sID0+XG4gICAgICAgICAgaWYgaXRlbSBpcyBzb3J0QnkgYW5kIHNvcnRBc2NcbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzb3J0LWFzYyBpY29uLXRyaWFuZ2xlLWRvd24gYWN0aXZlJ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzb3J0LWFzYyBpY29uLXRyaWFuZ2xlLWRvd24nXG4gICAgICAgICAgaWYgaXRlbSBpcyBzb3J0QnkgYW5kIG5vdCBzb3J0QXNjXG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnc29ydC1kZXNjIGljb24tdHJpYW5nbGUtdXAgYWN0aXZlJ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzb3J0LWRlc2MgaWNvbi10cmlhbmdsZS11cCdcblxuY2xhc3MgVG9kb1ZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoc2hvd0luVGFibGUgPSBbXSwgdG9kbykgLT5cbiAgICBAdHIgPT5cbiAgICAgIGZvciBpdGVtIGluIHNob3dJblRhYmxlXG4gICAgICAgIEB0ZCA9PlxuICAgICAgICAgIHN3aXRjaCBpdGVtXG4gICAgICAgICAgICB3aGVuICdBbGwnICAgdGhlbiBAc3BhbiB0b2RvLmFsbFxuICAgICAgICAgICAgd2hlbiAnVGV4dCcgIHRoZW4gQHNwYW4gdG9kby50ZXh0XG4gICAgICAgICAgICB3aGVuICdUeXBlJyAgdGhlbiBAaSB0b2RvLnR5cGVcbiAgICAgICAgICAgIHdoZW4gJ1JhbmdlJyB0aGVuIEBpIHRvZG8ucmFuZ2VcbiAgICAgICAgICAgIHdoZW4gJ0xpbmUnICB0aGVuIEBpIHRvZG8ubGluZVxuICAgICAgICAgICAgd2hlbiAnUmVnZXgnIHRoZW4gQGNvZGUgdG9kby5yZWdleFxuICAgICAgICAgICAgd2hlbiAnUGF0aCcgIHRoZW4gQGEgdG9kby5wYXRoXG4gICAgICAgICAgICB3aGVuICdGaWxlJyAgdGhlbiBAYSB0b2RvLmZpbGVcbiAgICAgICAgICAgIHdoZW4gJ1RhZ3MnICB0aGVuIEBpIHRvZG8udGFnc1xuICAgICAgICAgICAgd2hlbiAnSWQnICAgIHRoZW4gQGkgdG9kby5pZFxuICAgICAgICAgICAgd2hlbiAnUHJvamVjdCcgdGhlbiBAYSB0b2RvLnByb2plY3RcblxuICBpbml0aWFsaXplOiAoc2hvd0luVGFibGUsIEB0b2RvKSAtPlxuICAgIEBoYW5kbGVFdmVudHMoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRldGFjaCgpXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIEBvbiAnY2xpY2snLCAndGQnLCBAb3BlblBhdGhcblxuICBvcGVuUGF0aDogPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0b2RvIGFuZCBAdG9kby5sb2NcbiAgICBwb3NpdGlvbiA9IFtAdG9kby5wb3NpdGlvblswXVswXSwgQHRvZG8ucG9zaXRpb25bMF1bMV1dXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKEB0b2RvLmxvYywge1xuICAgICAgc3BsaXQ6IEBnZXRTcGxpdERpcmVjdGlvbigpXG4gICAgICBwZW5kaW5nOiBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUuYWxsb3dQZW5kaW5nUGFuZUl0ZW1zJykgb3IgZmFsc2VcbiAgICB9KS50aGVuIC0+XG4gICAgICAjIFNldHRpbmcgaW5pdGlhbENvbHVtbi9MaW5lIGRvZXMgbm90IGFsd2F5cyBjZW50ZXIgdmlld1xuICAgICAgaWYgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICB0ZXh0RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvc2l0aW9uLCBhdXRvc2Nyb2xsOiBmYWxzZSlcbiAgICAgICAgdGV4dEVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKGNlbnRlcjogdHJ1ZSlcblxuICBnZXRTcGxpdERpcmVjdGlvbjogLT5cbiAgICBzd2l0Y2ggYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cub3Blbkxpc3RJbkRpcmVjdGlvbicpXG4gICAgICB3aGVuICd1cCcgdGhlbiAnZG93bidcbiAgICAgIHdoZW4gJ2Rvd24nIHRoZW4gJ3VwJ1xuICAgICAgd2hlbiAnbGVmdCcgdGhlbiAncmlnaHQnXG4gICAgICBlbHNlICdsZWZ0J1xuXG5jbGFzcyBUb2RvRW1wdHlWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKHNob3dJblRhYmxlID0gW10pIC0+XG4gICAgQHRyID0+XG4gICAgICBAdGQgY29sc3Bhbjogc2hvd0luVGFibGUubGVuZ3RoLCA9PlxuICAgICAgICBAcCBcIk5vIHJlc3VsdHMuLi5cIlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtUYWJsZUhlYWRlclZpZXcsIFRvZG9WaWV3LCBUb2RvRW1wdHlWaWV3fVxuIl19
