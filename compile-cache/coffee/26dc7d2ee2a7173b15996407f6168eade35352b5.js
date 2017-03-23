(function() {
  var CompositeDisposable, ResolverView, View, handleErr,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('space-pen').View;

  handleErr = require('./error-view').handleErr;

  ResolverView = (function(superClass) {
    extend(ResolverView, superClass);

    function ResolverView() {
      return ResolverView.__super__.constructor.apply(this, arguments);
    }

    ResolverView.content = function(editor, state, pkg) {
      var resolveText;
      resolveText = state.context.resolveText;
      return this.div({
        "class": 'overlay from-top resolver'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block text-highlight'
          }, "We're done here");
          _this.div({
            "class": 'block'
          }, function() {
            _this.div({
              "class": 'block text-info'
            }, function() {
              return _this.text("You've dealt with all of the conflicts in this file.");
            });
            return _this.div({
              "class": 'block text-info'
            }, function() {
              _this.span({
                outlet: 'actionText'
              }, "Save and " + resolveText);
              return _this.text(' this file?');
            });
          });
          _this.div({
            "class": 'pull-left'
          }, function() {
            return _this.button({
              "class": 'btn btn-primary',
              click: 'dismiss'
            }, 'Maybe Later');
          });
          return _this.div({
            "class": 'pull-right'
          }, function() {
            return _this.button({
              "class": 'btn btn-primary',
              click: 'resolve'
            }, resolveText);
          });
        };
      })(this));
    };

    ResolverView.prototype.initialize = function(editor1, state1, pkg1) {
      this.editor = editor1;
      this.state = state1;
      this.pkg = pkg1;
      this.subs = new CompositeDisposable();
      this.refresh();
      this.subs.add(this.editor.onDidSave((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      return this.subs.add(atom.commands.add(this.element, 'merge-conflicts:quit', (function(_this) {
        return function() {
          return _this.dismiss();
        };
      })(this)));
    };

    ResolverView.prototype.detached = function() {
      return this.subs.dispose();
    };

    ResolverView.prototype.getModel = function() {
      return null;
    };

    ResolverView.prototype.relativePath = function() {
      return this.state.relativize(this.editor.getURI());
    };

    ResolverView.prototype.refresh = function() {
      return this.state.context.isResolvedFile(this.relativePath()).then((function(_this) {
        return function(resolved) {
          var modified, needsResolve, needsSaved, resolveText;
          modified = _this.editor.isModified();
          needsSaved = modified;
          needsResolve = modified || !resolved;
          if (!(needsSaved || needsResolve)) {
            _this.hide('fast', function() {
              return _this.remove();
            });
            _this.pkg.didResolveFile({
              file: _this.editor.getURI()
            });
            return;
          }
          resolveText = _this.state.context.resolveText;
          if (needsSaved) {
            return _this.actionText.text("Save and " + (resolveText.toLowerCase()));
          } else if (needsResolve) {
            return _this.actionText.text(resolveText);
          }
        };
      })(this))["catch"](handleErr);
    };

    ResolverView.prototype.resolve = function() {
      return Promise.resolve(this.editor.save()).then((function(_this) {
        return function() {
          return _this.state.context.resolveFile(_this.relativePath()).then(function() {
            return _this.refresh();
          })["catch"](handleErr);
        };
      })(this));
    };

    ResolverView.prototype.dismiss = function() {
      return this.hide('fast', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
    };

    return ResolverView;

  })(View);

  module.exports = {
    ResolverView: ResolverView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvcmVzb2x2ZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDdkIsT0FBUSxPQUFBLENBQVEsV0FBUjs7RUFFUixZQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUVSOzs7Ozs7O0lBRUosWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLEdBQWhCO0FBQ1IsVUFBQTtNQUFBLFdBQUEsR0FBYyxLQUFLLENBQUMsT0FBTyxDQUFDO2FBQzVCLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDJCQUFQO09BQUwsRUFBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3ZDLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUFQO1dBQUwsRUFBb0MsaUJBQXBDO1VBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUE7WUFDbkIsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7YUFBTCxFQUErQixTQUFBO3FCQUM3QixLQUFDLENBQUEsSUFBRCxDQUFNLHNEQUFOO1lBRDZCLENBQS9CO21CQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGlCQUFQO2FBQUwsRUFBK0IsU0FBQTtjQUM3QixLQUFDLENBQUEsSUFBRCxDQUFNO2dCQUFBLE1BQUEsRUFBUSxZQUFSO2VBQU4sRUFBNEIsV0FBQSxHQUFZLFdBQXhDO3FCQUNBLEtBQUMsQ0FBQSxJ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O21CQUNILEtBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixXQUFqQixFQURHOztRQWREO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBaUJBLEVBQUMsS0FBRCxFQWpCQSxDQWlCTyxTQWpCUDtJQURPOzsyQkFvQlQsT0FBQSxHQUFTLFNBQUE7YUFFUCxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQSxDQUFoQixDQUErQixDQUFDLElBQWhDLENBQXFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDbkMsS0FBQyxDQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBZixDQUEyQixLQUFDLENBQUEsWUFBRCxDQUFBLENBQTNCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQTttQkFDSixLQUFDLENBQUEsT0FBRCxDQUFBO1VBREksQ0FETixDQUdBLEVBQUMsS0FBRCxFQUhBLENBR08sU0FIUDtRQURtQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckM7SUFGTzs7MkJBUVQsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO0lBRE87Ozs7S0E1RGdCOztFQStEM0IsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFlBQUEsRUFBYyxZQUFkOztBQXJFRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57Vmlld30gPSByZXF1aXJlICdzcGFjZS1wZW4nXG5cbntoYW5kbGVFcnJ9ID0gcmVxdWlyZSAnLi9lcnJvci12aWV3J1xuXG5jbGFzcyBSZXNvbHZlclZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgQGNvbnRlbnQ6IChlZGl0b3IsIHN0YXRlLCBwa2cpIC0+XG4gICAgcmVzb2x2ZVRleHQgPSBzdGF0ZS5jb250ZXh0LnJlc29sdmVUZXh0XG4gICAgQGRpdiBjbGFzczogJ292ZXJsYXkgZnJvbS10b3AgcmVzb2x2ZXInLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrIHRleHQtaGlnaGxpZ2h0JywgXCJXZSdyZSBkb25lIGhlcmVcIlxuICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrIHRleHQtaW5mbycsID0+XG4gICAgICAgICAgQHRleHQgXCJZb3UndmUgZGVhbHQgd2l0aCBhbGwgb2YgdGhlIGNvbmZsaWN0cyBpbiB0aGlzIGZpbGUuXCJcbiAgICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrIHRleHQtaW5mbycsID0+XG4gICAgICAgICAgQHNwYW4gb3V0bGV0OiAnYWN0aW9uVGV4dCcsIFwiU2F2ZSBhbmQgI3tyZXNvbHZlVGV4dH1cIlxuICAgICAgICAgIEB0ZXh0ICcgdGhpcyBmaWxlPydcbiAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLWxlZnQnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1wcmltYXJ5JywgY2xpY2s6ICdkaXNtaXNzJywgJ01heWJlIExhdGVyJ1xuICAgICAgQGRpdiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1wcmltYXJ5JywgY2xpY2s6ICdyZXNvbHZlJywgcmVzb2x2ZVRleHRcblxuICBpbml0aWFsaXplOiAoQGVkaXRvciwgQHN0YXRlLCBAcGtnKSAtPlxuICAgIEBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQHJlZnJlc2goKVxuICAgIEBzdWJzLmFkZCBAZWRpdG9yLm9uRGlkU2F2ZSA9PiBAcmVmcmVzaCgpXG5cbiAgICBAc3Vicy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsICdtZXJnZS1jb25mbGljdHM6cXVpdCcsID0+IEBkaXNtaXNzKClcblxuICBkZXRhY2hlZDogLT4gQHN1YnMuZGlzcG9zZSgpXG5cbiAgZ2V0TW9kZWw6IC0+IG51bGxcblxuICByZWxhdGl2ZVBhdGg6IC0+XG4gICAgQHN0YXRlLnJlbGF0aXZpemUgQGVkaXRvci5nZXRVUkkoKVxuXG4gIHJlZnJlc2g6IC0+XG4gICAgQHN0YXRlLmNvbnRleHQuaXNSZXNvbHZlZEZpbGUgQHJlbGF0aXZlUGF0aCgpXG4gICAgLnRoZW4gKHJlc29sdmVkKSA9PlxuICAgICAgbW9kaWZpZWQgPSBAZWRpdG9yLmlzTW9kaWZpZWQoKVxuXG4gICAgICBuZWVkc1NhdmVkID0gbW9kaWZpZWRcbiAgICAgIG5lZWRzUmVzb2x2ZSA9IG1vZGlmaWVkIG9yIG5vdCByZXNvbHZlZFxuXG4gICAgICB1bmxlc3MgbmVlZHNTYXZlZCBvciBuZWVkc1Jlc29sdmVcbiAgICAgICAgQGhpZGUgJ2Zhc3QnLCA9PiBAcmVtb3ZlKClcbiAgICAgICAgQHBrZy5kaWRSZXNvbHZlRmlsZSBmaWxlOiBAZWRpdG9yLmdldFVSSSgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICByZXNvbHZlVGV4dCA9IEBzdGF0ZS5jb250ZXh0LnJlc29sdmVUZXh0XG4gICAgICBpZiBuZWVkc1NhdmVkXG4gICAgICAgIEBhY3Rpb25UZXh0LnRleHQgXCJTYXZlIGFuZCAje3Jlc29sdmVUZXh0LnRvTG93ZXJDYXNlKCl9XCJcbiAgICAgIGVsc2UgaWYgbmVlZHNSZXNvbHZlXG4gICAgICAgIEBhY3Rpb25UZXh0LnRleHQgcmVzb2x2ZVRleHRcbiAgICAuY2F0Y2ggaGFuZGxlRXJyXG5cbiAgcmVzb2x2ZTogLT5cbiAgICAjIFN1cG9ydCBhc3luYyBzYXZlIGltcGxlbWVudGF0aW9ucy5cbiAgICBQcm9taXNlLnJlc29sdmUoQGVkaXRvci5zYXZlKCkpLnRoZW4gPT5cbiAgICAgIEBzdGF0ZS5jb250ZXh0LnJlc29sdmVGaWxlIEByZWxhdGl2ZVBhdGgoKVxuICAgICAgLnRoZW4gPT5cbiAgICAgICAgQHJlZnJlc2goKVxuICAgICAgLmNhdGNoIGhhbmRsZUVyclxuXG4gIGRpc21pc3M6IC0+XG4gICAgQGhpZGUgJ2Zhc3QnLCA9PiBAcmVtb3ZlKClcblxubW9kdWxlLmV4cG9ydHMgPVxuICBSZXNvbHZlclZpZXc6IFJlc29sdmVyVmlld1xuIl19
