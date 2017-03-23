(function() {
  var $, CompositeDisposable, ConflictedEditor, MergeConflictsView, MergeState, ResolverView, View, _, handleErr, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('space-pen'), $ = ref.$, View = ref.View;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('underscore-plus');

  MergeState = require('../merge-state').MergeState;

  ConflictedEditor = require('../conflicted-editor').ConflictedEditor;

  ResolverView = require('./resolver-view').ResolverView;

  handleErr = require('./error-view').handleErr;

  MergeConflictsView = (function(superClass) {
    extend(MergeConflictsView, superClass);

    function MergeConflictsView() {
      return MergeConflictsView.__super__.constructor.apply(this, arguments);
    }

    MergeConflictsView.instance = null;

    MergeConflictsView.contextApis = [];

    MergeConflictsView.content = function(state, pkg) {
      return this.div({
        "class": 'merge-conflicts tool-panel panel-bottom padded clearfix'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.text('Conflicts');
            _this.span({
              "class": 'pull-right icon icon-fold',
              click: 'minimize'
            }, 'Hide');
            return _this.span({
              "class": 'pull-right icon icon-unfold',
              click: 'restore'
            }, 'Show');
          });
          return _this.div({
            outlet: 'body'
          }, function() {
            _this.div({
              "class": 'conflict-list'
            }, function() {
              return _this.ul({
                "class": 'block list-group',
                outlet: 'pathList'
              }, function() {
                var i, len, message, p, ref1, ref2, results;
                ref1 = state.conflicts;
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                  ref2 = ref1[i], p = ref2.path, message = ref2.message;
                  results.push(_this.li({
                    click: 'navigate',
                    "data-path": p,
                    "class": 'list-item navigate'
                  }, function() {
                    _this.span({
                      "class": 'inline-block icon icon-diff-modified status-modified path'
                    }, p);
                    return _this.div({
                      "class": 'pull-right'
                    }, function() {
                      _this.button({
                        click: 'resolveFile',
                        "class": 'btn btn-xs btn-success inline-block-tight stage-ready',
                        style: 'display: none'
                      }, state.context.resolveText);
                      _this.span({
                        "class": 'inline-block text-subtle'
                      }, message);
                      _this.progress({
                        "class": 'inline-block',
                        max: 100,
                        value: 0
                      });
                      return _this.span({
                        "class": 'inline-block icon icon-dash staged'
                      });
                    });
                  }));
                }
                return results;
              });
            });
            return _this.div({
              "class": 'footer block pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-sm',
                click: 'quit'
              }, 'Quit');
            });
          });
        };
      })(this));
    };

    MergeConflictsView.prototype.initialize = function(state1, pkg1) {
      this.state = state1;
      this.pkg = pkg1;
      this.subs = new CompositeDisposable;
      this.subs.add(this.pkg.onDidResolveConflict((function(_this) {
        return function(event) {
          var found, i, len, li, listElement, p, progress, ref1;
          p = _this.state.relativize(event.file);
          found = false;
          ref1 = _this.pathList.children();
          for (i = 0, len = ref1.length; i < len; i++) {
            listElement = ref1[i];
            li = $(listElement);
            if (li.data('path') === p) {
              found = true;
              progress = li.find('progress')[0];
              progress.max = event.total;
              progress.value = event.resolved;
              if (event.total === event.resolved) {
                li.find('.stage-ready').show();
              }
            }
          }
          if (!found) {
            return console.error("Unrecognized conflict path: " + p);
          }
        };
      })(this)));
      this.subs.add(this.pkg.onDidResolveFile((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      return this.subs.add(atom.commands.add(this.element, {
        'merge-conflicts:entire-file-ours': this.sideResolver('ours'),
        'merge-conflicts:entire-file-theirs': this.sideResolver('theirs')
      }));
    };

    MergeConflictsView.prototype.navigate = function(event, element) {
      var fullPath, repoPath;
      repoPath = element.find(".path").text();
      fullPath = this.state.join(repoPath);
      return atom.workspace.open(fullPath);
    };

    MergeConflictsView.prototype.minimize = function() {
      this.addClass('minimized');
      return this.body.hide('fast');
    };

    MergeConflictsView.prototype.restore = function() {
      this.removeClass('minimized');
      return this.body.show('fast');
    };

    MergeConflictsView.prototype.quit = function() {
      this.pkg.didQuitConflictResolution();
      this.finish();
      return this.state.context.quit(this.state.isRebase);
    };

    MergeConflictsView.prototype.refresh = function() {
      return this.state.reread()["catch"](handleErr).then((function(_this) {
        return function() {
          var i, icon, item, len, p, ref1;
          ref1 = _this.pathList.find('li');
          for (i = 0, len = ref1.length; i < len; i++) {
            item = ref1[i];
            p = $(item).data('path');
            icon = $(item).find('.staged');
            icon.removeClass('icon-dash icon-check text-success');
            if (_.contains(_this.state.conflictPaths(), p)) {
              icon.addClass('icon-dash');
            } else {
              icon.addClass('icon-check text-success');
              _this.pathList.find("li[data-path='" + p + "'] .stage-ready").hide();
            }
          }
          if (!_this.state.isEmpty()) {
            return;
          }
          _this.pkg.didCompleteConflictResolution();
          _this.finish();
          return _this.state.context.complete(_this.state.isRebase);
        };
      })(this));
    };

    MergeConflictsView.prototype.finish = function() {
      this.subs.dispose();
      return this.hide('fast', (function(_this) {
        return function() {
          MergeConflictsView.instance = null;
          return _this.remove();
        };
      })(this));
    };

    MergeConflictsView.prototype.sideResolver = function(side) {
      return (function(_this) {
        return function(event) {
          var p;
          p = $(event.target).closest('li').data('path');
          return _this.state.context.checkoutSide(side, p).then(function() {
            var full;
            full = _this.state.join(p);
            _this.pkg.didResolveConflict({
              file: full,
              total: 1,
              resolved: 1
            });
            return atom.workspace.open(p);
          })["catch"](function(err) {
            return handleErr(err);
          });
        };
      })(this);
    };

    MergeConflictsView.prototype.resolveFile = function(event, element) {
      var e, filePath, i, len, ref1, repoPath;
      repoPath = element.closest('li').data('path');
      filePath = this.state.join(repoPath);
      ref1 = atom.workspace.getTextEditors();
      for (i = 0, len = ref1.length; i < len; i++) {
        e = ref1[i];
        if (e.getPath() === filePath) {
          e.save();
        }
      }
      return this.state.context.resolveFile(repoPath).then((function(_this) {
        return function() {
          return _this.pkg.didResolveFile({
            file: filePath
          });
        };
      })(this))["catch"](function(err) {
        return handleErr(err);
      });
    };

    MergeConflictsView.registerContextApi = function(contextApi) {
      return this.contextApis.push(contextApi);
    };

    MergeConflictsView.showForContext = function(context, pkg) {
      if (this.instance) {
        this.instance.finish();
      }
      return MergeState.read(context).then((function(_this) {
        return function(state) {
          if (state.isEmpty()) {
            return;
          }
          return _this.openForState(state, pkg);
        };
      })(this))["catch"](handleErr);
    };

    MergeConflictsView.hideForContext = function(context) {
      if (!this.instance) {
        return;
      }
      if (this.instance.state.context !== context) {
        return;
      }
      return this.instance.finish();
    };

    MergeConflictsView.detect = function(pkg) {
      if (this.instance != null) {
        return;
      }
      return Promise.all(this.contextApis.map((function(_this) {
        return function(contextApi) {
          return contextApi.getContext();
        };
      })(this))).then((function(_this) {
        return function(contexts) {
          return Promise.all(_.filter(contexts, Boolean).sort(function(context1, context2) {
            return context2.priority - context1.priority;
          }).map(function(context) {
            return MergeState.read(context);
          }));
        };
      })(this)).then((function(_this) {
        return function(states) {
          var state;
          state = states.find(function(state) {
            return !state.isEmpty();
          });
          if (state == null) {
            atom.notifications.addInfo("Nothing to Merge", {
              detail: "No conflicts here!",
              dismissable: true
            });
            return;
          }
          return _this.openForState(state, pkg);
        };
      })(this))["catch"](handleErr);
    };

    MergeConflictsView.openForState = function(state, pkg) {
      var view;
      view = new MergeConflictsView(state, pkg);
      this.instance = view;
      atom.workspace.addBottomPanel({
        item: view
      });
      return this.instance.subs.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.markConflictsIn(state, editor, pkg);
        };
      })(this)));
    };

    MergeConflictsView.markConflictsIn = function(state, editor, pkg) {
      var e, fullPath, repoPath;
      if (state.isEmpty()) {
        return;
      }
      fullPath = editor.getPath();
      repoPath = state.relativize(fullPath);
      if (repoPath == null) {
        return;
      }
      if (!_.contains(state.conflictPaths(), repoPath)) {
        return;
      }
      e = new ConflictedEditor(state, pkg, editor);
      return e.mark();
    };

    return MergeConflictsView;

  })(View);

  module.exports = {
    MergeConflictsView: MergeConflictsView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvbWVyZ2UtY29uZmxpY3RzLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwrR0FBQTtJQUFBOzs7RUFBQSxNQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxTQUFELEVBQUk7O0VBQ0gsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVILGFBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLG1CQUFvQixPQUFBLENBQVEsc0JBQVI7O0VBRXBCLGVBQWdCLE9BQUEsQ0FBUSxpQkFBUjs7RUFDaEIsWUFBYSxPQUFBLENBQVEsY0FBUjs7RUFFUjs7Ozs7OztJQUVKLGtCQUFDLENBQUEsUUFBRCxHQUFXOztJQUNYLGtCQUFDLENBQUEsV0FBRCxHQUFjOztJQUVkLGtCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsS0FBRCxFQUFRLEdBQVI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx5REFBUDtPQUFMLEVBQXVFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNyRSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO1dBQUwsRUFBNkIsU0FBQTtZQUMzQixLQUFDLENBQUEsSUFBRCxDQUFNLFdBQU47WUFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTywyQkFBUDtjQUFvQyxLQUFBLEVBQU8sVUFBM0M7YUFBTixFQUE2RCxNQUE3RDttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw2QkFBUDtjQUFzQyxLQUFBLEVBQU8sU0FBN0M7YUFBTixFQUE4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T0FBUCxDQUFBO01BQ1gsUUFBQSxHQUFXLEtBQUssQ0FBQyxVQUFOLENBQWlCLFFBQWpCO01BQ1gsSUFBYyxnQkFBZDtBQUFBLGVBQUE7O01BRUEsSUFBQSxDQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsS0FBSyxDQUFDLGFBQU4sQ0FBQSxDQUFYLEVBQWtDLFFBQWxDLENBQWQ7QUFBQSxlQUFBOztNQUVBLENBQUEsR0FBUSxJQUFBLGdCQUFBLENBQWlCLEtBQWpCLEVBQXdCLEdBQXhCLEVBQTZCLE1BQTdCO2FBQ1IsQ0FBQyxDQUFDLElBQUYsQ0FBQTtJQVZnQjs7OztLQWxLYTs7RUErS2pDLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7O0FBMUxGIiwic291cmNlc0NvbnRlbnQiOlsieyQsIFZpZXd9ID0gcmVxdWlyZSAnc3BhY2UtcGVuJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntNZXJnZVN0YXRlfSA9IHJlcXVpcmUgJy4uL21lcmdlLXN0YXRlJ1xue0NvbmZsaWN0ZWRFZGl0b3J9ID0gcmVxdWlyZSAnLi4vY29uZmxpY3RlZC1lZGl0b3InXG5cbntSZXNvbHZlclZpZXd9ID0gcmVxdWlyZSAnLi9yZXNvbHZlci12aWV3J1xue2hhbmRsZUVycn0gPSByZXF1aXJlICcuL2Vycm9yLXZpZXcnXG5cbmNsYXNzIE1lcmdlQ29uZmxpY3RzVmlldyBleHRlbmRzIFZpZXdcblxuICBAaW5zdGFuY2U6IG51bGxcbiAgQGNvbnRleHRBcGlzOiBbXVxuXG4gIEBjb250ZW50OiAoc3RhdGUsIHBrZykgLT5cbiAgICBAZGl2IGNsYXNzOiAnbWVyZ2UtY29uZmxpY3RzIHRvb2wtcGFuZWwgcGFuZWwtYm90dG9tIHBhZGRlZCBjbGVhcmZpeCcsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncGFuZWwtaGVhZGluZycsID0+XG4gICAgICAgIEB0ZXh0ICdDb25mbGljdHMnXG4gICAgICAgIEBzcGFuIGNsYXNzOiAncHVsbC1yaWdodCBpY29uIGljb24tZm9sZCcsIGNsaWNrOiAnbWluaW1pemUnLCAnSGlkZSdcbiAgICAgICAgQHNwYW4gY2xhc3M6ICdwdWxsLXJpZ2h0IGljb24gaWNvbi11bmZvbGQnLCBjbGljazogJ3Jlc3RvcmUnLCAnU2hvdydcbiAgICAgIEBkaXYgb3V0bGV0OiAnYm9keScsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb25mbGljdC1saXN0JywgPT5cbiAgICAgICAgICBAdWwgY2xhc3M6ICdibG9jayBsaXN0LWdyb3VwJywgb3V0bGV0OiAncGF0aExpc3QnLCA9PlxuICAgICAgICAgICAgZm9yIHtwYXRoOiBwLCBtZXNzYWdlfSBpbiBzdGF0ZS5jb25mbGljdHNcbiAgICAgICAgICAgICAgQGxpIGNsaWNrOiAnbmF2aWdhdGUnLCBcImRhdGEtcGF0aFwiOiBwLCBjbGFzczogJ2xpc3QtaXRlbSBuYXZpZ2F0ZScsID0+XG4gICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6ICdpbmxpbmUtYmxvY2sgaWNvbiBpY29uLWRpZmYtbW9kaWZpZWQgc3RhdHVzLW1vZGlmaWVkIHBhdGgnLCBwXG4gICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgICAgICAgICAgQGJ1dHRvbiBjbGljazogJ3Jlc29sdmVGaWxlJywgY2xhc3M6ICdidG4gYnRuLXhzIGJ0bi1zdWNjZXNzIGlubGluZS1ibG9jay10aWdodCBzdGFnZS1yZWFkeScsIHN0eWxlOiAnZGlzcGxheTogbm9uZScsIHN0YXRlLmNvbnRleHQucmVzb2x2ZVRleHRcbiAgICAgICAgICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaW5saW5lLWJsb2NrIHRleHQtc3VidGxlJywgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgQHByb2dyZXNzIGNsYXNzOiAnaW5saW5lLWJsb2NrJywgbWF4OiAxMDAsIHZhbHVlOiAwXG4gICAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczogJ2lubGluZS1ibG9jayBpY29uIGljb24tZGFzaCBzdGFnZWQnXG4gICAgICAgIEBkaXYgY2xhc3M6ICdmb290ZXIgYmxvY2sgcHVsbC1yaWdodCcsID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tc20nLCBjbGljazogJ3F1aXQnLCAnUXVpdCdcblxuICBpbml0aWFsaXplOiAoQHN0YXRlLCBAcGtnKSAtPlxuICAgIEBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBzdWJzLmFkZCBAcGtnLm9uRGlkUmVzb2x2ZUNvbmZsaWN0IChldmVudCkgPT5cbiAgICAgIHAgPSBAc3RhdGUucmVsYXRpdml6ZSBldmVudC5maWxlXG4gICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICBmb3IgbGlzdEVsZW1lbnQgaW4gQHBhdGhMaXN0LmNoaWxkcmVuKClcbiAgICAgICAgbGkgPSAkKGxpc3RFbGVtZW50KVxuICAgICAgICBpZiBsaS5kYXRhKCdwYXRoJykgaXMgcFxuICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuXG4gICAgICAgICAgcHJvZ3Jlc3MgPSBsaS5maW5kKCdwcm9ncmVzcycpWzBdXG4gICAgICAgICAgcHJvZ3Jlc3MubWF4ID0gZXZlbnQudG90YWxcbiAgICAgICAgICBwcm9ncmVzcy52YWx1ZSA9IGV2ZW50LnJlc29sdmVkXG5cbiAgICAgICAgICBsaS5maW5kKCcuc3RhZ2UtcmVhZHknKS5zaG93KCkgaWYgZXZlbnQudG90YWwgaXMgZXZlbnQucmVzb2x2ZWRcblxuICAgICAgdW5sZXNzIGZvdW5kXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgXCJVbnJlY29nbml6ZWQgY29uZmxpY3QgcGF0aDogI3twfVwiXG5cbiAgICBAc3Vicy5hZGQgQHBrZy5vbkRpZFJlc29sdmVGaWxlID0+IEByZWZyZXNoKClcblxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6ZW50aXJlLWZpbGUtb3Vycyc6IEBzaWRlUmVzb2x2ZXIoJ291cnMnKSxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6ZW50aXJlLWZpbGUtdGhlaXJzJzogQHNpZGVSZXNvbHZlcigndGhlaXJzJylcblxuICBuYXZpZ2F0ZTogKGV2ZW50LCBlbGVtZW50KSAtPlxuICAgIHJlcG9QYXRoID0gZWxlbWVudC5maW5kKFwiLnBhdGhcIikudGV4dCgpXG4gICAgZnVsbFBhdGggPSBAc3RhdGUuam9pbiByZXBvUGF0aFxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZnVsbFBhdGgpXG5cbiAgbWluaW1pemU6IC0+XG4gICAgQGFkZENsYXNzICdtaW5pbWl6ZWQnXG4gICAgQGJvZHkuaGlkZSAnZmFzdCdcblxuICByZXN0b3JlOiAtPlxuICAgIEByZW1vdmVDbGFzcyAnbWluaW1pemVkJ1xuICAgIEBib2R5LnNob3cgJ2Zhc3QnXG5cbiAgcXVpdDogLT5cbiAgICBAcGtnLmRpZFF1aXRDb25mbGljdFJlc29sdXRpb24oKVxuICAgIEBmaW5pc2goKVxuICAgIEBzdGF0ZS5jb250ZXh0LnF1aXQoQHN0YXRlLmlzUmViYXNlKVxuXG4gIHJlZnJlc2g6IC0+XG4gICAgQHN0YXRlLnJlcmVhZCgpLmNhdGNoKGhhbmRsZUVycikudGhlbiA9PlxuICAgICAgIyBBbnkgZmlsZXMgdGhhdCB3ZXJlIHByZXNlbnQsIGJ1dCBhcmVuJ3QgdGhlcmUgYW55IG1vcmUsIGhhdmUgYmVlbiByZXNvbHZlZC5cbiAgICAgIGZvciBpdGVtIGluIEBwYXRoTGlzdC5maW5kKCdsaScpXG4gICAgICAgIHAgPSAkKGl0ZW0pLmRhdGEoJ3BhdGgnKVxuICAgICAgICBpY29uID0gJChpdGVtKS5maW5kKCcuc3RhZ2VkJylcbiAgICAgICAgaWNvbi5yZW1vdmVDbGFzcyAnaWNvbi1kYXNoIGljb24tY2hlY2sgdGV4dC1zdWNjZXNzJ1xuICAgICAgICBpZiBfLmNvbnRhaW5zIEBzdGF0ZS5jb25mbGljdFBhdGhzKCksIHBcbiAgICAgICAgICBpY29uLmFkZENsYXNzICdpY29uLWRhc2gnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpY29uLmFkZENsYXNzICdpY29uLWNoZWNrIHRleHQtc3VjY2VzcydcbiAgICAgICAgICBAcGF0aExpc3QuZmluZChcImxpW2RhdGEtcGF0aD0nI3twfSddIC5zdGFnZS1yZWFkeVwiKS5oaWRlKClcblxuICAgICAgcmV0dXJuIHVubGVzcyBAc3RhdGUuaXNFbXB0eSgpXG4gICAgICBAcGtnLmRpZENvbXBsZXRlQ29uZmxpY3RSZXNvbHV0aW9uKClcbiAgICAgIEBmaW5pc2goKVxuICAgICAgQHN0YXRlLmNvbnRleHQuY29tcGxldGUoQHN0YXRlLmlzUmViYXNlKVxuXG4gIGZpbmlzaDogLT5cbiAgICBAc3Vicy5kaXNwb3NlKClcbiAgICBAaGlkZSAnZmFzdCcsID0+XG4gICAgICBNZXJnZUNvbmZsaWN0c1ZpZXcuaW5zdGFuY2UgPSBudWxsXG4gICAgICBAcmVtb3ZlKClcblxuICBzaWRlUmVzb2x2ZXI6IChzaWRlKSAtPlxuICAgIChldmVudCkgPT5cbiAgICAgIHAgPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnbGknKS5kYXRhKCdwYXRoJylcbiAgICAgIEBzdGF0ZS5jb250ZXh0LmNoZWNrb3V0U2lkZShzaWRlLCBwKVxuICAgICAgLnRoZW4gPT5cbiAgICAgICAgZnVsbCA9IEBzdGF0ZS5qb2luIHBcbiAgICAgICAgQHBrZy5kaWRSZXNvbHZlQ29uZmxpY3QgZmlsZTogZnVsbCwgdG90YWw6IDEsIHJlc29sdmVkOiAxXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gcFxuICAgICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICAgIGhhbmRsZUVycihlcnIpXG5cbiAgcmVzb2x2ZUZpbGU6IChldmVudCwgZWxlbWVudCkgLT5cbiAgICByZXBvUGF0aCA9IGVsZW1lbnQuY2xvc2VzdCgnbGknKS5kYXRhKCdwYXRoJylcbiAgICBmaWxlUGF0aCA9IEBzdGF0ZS5qb2luIHJlcG9QYXRoXG5cbiAgICBmb3IgZSBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICBlLnNhdmUoKSBpZiBlLmdldFBhdGgoKSBpcyBmaWxlUGF0aFxuXG4gICAgQHN0YXRlLmNvbnRleHQucmVzb2x2ZUZpbGUocmVwb1BhdGgpXG4gICAgLnRoZW4gPT5cbiAgICAgIEBwa2cuZGlkUmVzb2x2ZUZpbGUgZmlsZTogZmlsZVBhdGhcbiAgICAuY2F0Y2ggKGVycikgLT5cbiAgICAgIGhhbmRsZUVycihlcnIpXG5cbiAgQHJlZ2lzdGVyQ29udGV4dEFwaTogKGNvbnRleHRBcGkpIC0+XG4gICAgQGNvbnRleHRBcGlzLnB1c2goY29udGV4dEFwaSlcblxuICBAc2hvd0ZvckNvbnRleHQ6IChjb250ZXh0LCBwa2cpIC0+XG4gICAgaWYgQGluc3RhbmNlXG4gICAgICBAaW5zdGFuY2UuZmluaXNoKClcbiAgICBNZXJnZVN0YXRlLnJlYWQoY29udGV4dCkudGhlbiAoc3RhdGUpID0+XG4gICAgICByZXR1cm4gaWYgc3RhdGUuaXNFbXB0eSgpXG4gICAgICBAb3BlbkZvclN0YXRlKHN0YXRlLCBwa2cpXG4gICAgLmNhdGNoIGhhbmRsZUVyclxuXG4gIEBoaWRlRm9yQ29udGV4dDogKGNvbnRleHQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaW5zdGFuY2VcbiAgICByZXR1cm4gdW5sZXNzIEBpbnN0YW5jZS5zdGF0ZS5jb250ZXh0ID09IGNvbnRleHRcbiAgICBAaW5zdGFuY2UuZmluaXNoKClcblxuICBAZGV0ZWN0OiAocGtnKSAtPlxuICAgIHJldHVybiBpZiBAaW5zdGFuY2U/XG5cbiAgICBQcm9taXNlLmFsbChAY29udGV4dEFwaXMubWFwIChjb250ZXh0QXBpKSA9PiBjb250ZXh0QXBpLmdldENvbnRleHQoKSlcbiAgICAudGhlbiAoY29udGV4dHMpID0+XG4gICAgICAjIGZpbHRlciBvdXQgbnVsbHMgYW5kIHRha2UgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgY29udGV4dC5cbiAgICAgIFByb21pc2UuYWxsKFxuICAgICAgICBfLmZpbHRlcihjb250ZXh0cywgQm9vbGVhbilcbiAgICAgICAgLnNvcnQgKGNvbnRleHQxLCBjb250ZXh0MikgPT4gY29udGV4dDIucHJpb3JpdHkgLSBjb250ZXh0MS5wcmlvcml0eVxuICAgICAgICAubWFwIChjb250ZXh0KSA9PiBNZXJnZVN0YXRlLnJlYWQgY29udGV4dFxuICAgICAgKVxuICAgIC50aGVuIChzdGF0ZXMpID0+XG4gICAgICBzdGF0ZSA9IHN0YXRlcy5maW5kIChzdGF0ZSkgLT4gbm90IHN0YXRlLmlzRW1wdHkoKVxuICAgICAgdW5sZXNzIHN0YXRlP1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIk5vdGhpbmcgdG8gTWVyZ2VcIixcbiAgICAgICAgICBkZXRhaWw6IFwiTm8gY29uZmxpY3RzIGhlcmUhXCIsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgcmV0dXJuXG4gICAgICBAb3BlbkZvclN0YXRlKHN0YXRlLCBwa2cpXG4gICAgLmNhdGNoIGhhbmRsZUVyclxuXG4gIEBvcGVuRm9yU3RhdGU6IChzdGF0ZSwgcGtnKSAtPlxuICAgIHZpZXcgPSBuZXcgTWVyZ2VDb25mbGljdHNWaWV3KHN0YXRlLCBwa2cpXG4gICAgQGluc3RhbmNlID0gdmlld1xuICAgIGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsIGl0ZW06IHZpZXdcblxuICAgIEBpbnN0YW5jZS5zdWJzLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBtYXJrQ29uZmxpY3RzSW4gc3RhdGUsIGVkaXRvciwgcGtnXG5cbiAgQG1hcmtDb25mbGljdHNJbjogKHN0YXRlLCBlZGl0b3IsIHBrZykgLT5cbiAgICByZXR1cm4gaWYgc3RhdGUuaXNFbXB0eSgpXG5cbiAgICBmdWxsUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICByZXBvUGF0aCA9IHN0YXRlLnJlbGF0aXZpemUgZnVsbFBhdGhcbiAgICByZXR1cm4gdW5sZXNzIHJlcG9QYXRoP1xuXG4gICAgcmV0dXJuIHVubGVzcyBfLmNvbnRhaW5zIHN0YXRlLmNvbmZsaWN0UGF0aHMoKSwgcmVwb1BhdGhcblxuICAgIGUgPSBuZXcgQ29uZmxpY3RlZEVkaXRvcihzdGF0ZSwgcGtnLCBlZGl0b3IpXG4gICAgZS5tYXJrKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIE1lcmdlQ29uZmxpY3RzVmlldzogTWVyZ2VDb25mbGljdHNWaWV3XG4iXX0=
