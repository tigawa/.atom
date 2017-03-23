(function() {
  var $, CompositeDisposable, Conflict, ConflictedEditor, Emitter, NavigationView, ResolverView, SideView, _, ref;

  $ = require('space-pen').$;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Conflict = require('./conflict').Conflict;

  SideView = require('./view/side-view').SideView;

  NavigationView = require('./view/navigation-view').NavigationView;

  ResolverView = require('./view/resolver-view').ResolverView;

  ConflictedEditor = (function() {
    function ConflictedEditor(state, pkg, editor) {
      this.state = state;
      this.pkg = pkg;
      this.editor = editor;
      this.subs = new CompositeDisposable;
      this.coveringViews = [];
      this.conflicts = [];
    }

    ConflictedEditor.prototype.mark = function() {
      var c, cv, i, j, len, len1, ref1, ref2;
      this.conflicts = Conflict.all(this.state, this.editor);
      this.coveringViews = [];
      ref1 = this.conflicts;
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        this.coveringViews.push(new SideView(c.ours, this.editor));
        if (c.base != null) {
          this.coveringViews.push(new SideView(c.base, this.editor));
        }
        this.coveringViews.push(new NavigationView(c.navigator, this.editor));
        this.coveringViews.push(new SideView(c.theirs, this.editor));
        this.subs.add(c.onDidResolveConflict((function(_this) {
          return function() {
            var resolvedCount, unresolved, v;
            unresolved = (function() {
              var j, len1, ref2, results;
              ref2 = this.coveringViews;
              results = [];
              for (j = 0, len1 = ref2.length; j < len1; j++) {
                v = ref2[j];
                if (!v.conflict().isResolved()) {
                  results.push(v);
                }
              }
              return results;
            }).call(_this);
            resolvedCount = _this.conflicts.length - Math.floor(unresolved.length / 3);
            return _this.pkg.didResolveConflict({
              file: _this.editor.getPath(),
              total: _this.conflicts.length,
              resolved: resolvedCount,
              source: _this
            });
          };
        })(this)));
      }
      if (this.conflicts.length > 0) {
        atom.views.getView(this.editor).classList.add('conflicted');
        ref2 = this.coveringViews;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          cv = ref2[j];
          cv.decorate();
        }
        this.installEvents();
        return this.focusConflict(this.conflicts[0]);
      } else {
        this.pkg.didResolveConflict({
          file: this.editor.getPath(),
          total: 1,
          resolved: 1,
          source: this
        });
        return this.conflictsResolved();
      }
    };

    ConflictedEditor.prototype.installEvents = function() {
      this.subs.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.detectDirty();
        };
      })(this)));
      this.subs.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
      this.subs.add(atom.commands.add('atom-text-editor', {
        'merge-conflicts:accept-current': (function(_this) {
          return function() {
            return _this.acceptCurrent();
          };
        })(this),
        'merge-conflicts:accept-ours': (function(_this) {
          return function() {
            return _this.acceptOurs();
          };
        })(this),
        'merge-conflicts:accept-theirs': (function(_this) {
          return function() {
            return _this.acceptTheirs();
          };
        })(this),
        'merge-conflicts:ours-then-theirs': (function(_this) {
          return function() {
            return _this.acceptOursThenTheirs();
          };
        })(this),
        'merge-conflicts:theirs-then-ours': (function(_this) {
          return function() {
            return _this.acceptTheirsThenOurs();
          };
        })(this),
        'merge-conflicts:next-unresolved': (function(_this) {
          return function() {
            return _this.nextUnresolved();
          };
        })(this),
        'merge-conflicts:previous-unresolved': (function(_this) {
          return function() {
            return _this.previousUnresolved();
          };
        })(this),
        'merge-conflicts:revert-current': (function(_this) {
          return function() {
            return _this.revertCurrent();
          };
        })(this)
      }));
      this.subs.add(this.pkg.onDidResolveConflict((function(_this) {
        return function(arg) {
          var file, resolved, total;
          total = arg.total, resolved = arg.resolved, file = arg.file;
          if (file === _this.editor.getPath() && total === resolved) {
            return _this.conflictsResolved();
          }
        };
      })(this)));
      this.subs.add(this.pkg.onDidCompleteConflictResolution((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
      return this.subs.add(this.pkg.onDidQuitConflictResolution((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
    };

    ConflictedEditor.prototype.cleanup = function() {
      var c, i, j, k, len, len1, len2, m, ref1, ref2, ref3, v;
      if (this.editor != null) {
        atom.views.getView(this.editor).classList.remove('conflicted');
      }
      ref1 = this.conflicts;
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        ref2 = c.markers();
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          m = ref2[j];
          m.destroy();
        }
      }
      ref3 = this.coveringViews;
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        v = ref3[k];
        v.remove();
      }
      return this.subs.dispose();
    };

    ConflictedEditor.prototype.conflictsResolved = function() {
      return atom.workspace.addTopPanel({
        item: new ResolverView(this.editor, this.state, this.pkg)
      });
    };

    ConflictedEditor.prototype.detectDirty = function() {
      var c, i, j, k, len, len1, len2, potentials, ref1, ref2, ref3, results, v;
      potentials = [];
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        ref2 = this.coveringViews;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          v = ref2[j];
          if (v.includesCursor(c)) {
            potentials.push(v);
          }
        }
      }
      ref3 = _.uniq(potentials);
      results = [];
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        v = ref3[k];
        results.push(v.detectDirty());
      }
      return results;
    };

    ConflictedEditor.prototype.acceptCurrent = function() {
      var duplicates, i, len, seen, side, sides;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      sides = this.active();
      duplicates = [];
      seen = {};
      for (i = 0, len = sides.length; i < len; i++) {
        side = sides[i];
        if (side.conflict in seen) {
          duplicates.push(side);
          duplicates.push(seen[side.conflict]);
        }
        seen[side.conflict] = side;
      }
      sides = _.difference(sides, duplicates);
      return this.editor.transact(function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = sides.length; j < len1; j++) {
          side = sides[j];
          results.push(side.resolve());
        }
        return results;
      });
    };

    ConflictedEditor.prototype.acceptOurs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(side.conflict.ours.resolve());
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.acceptTheirs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(side.conflict.theirs.resolve());
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.acceptOursThenTheirs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(_this.combineSides(side.conflict.ours, side.conflict.theirs));
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.acceptTheirsThenOurs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(_this.combineSides(side.conflict.theirs, side.conflict.ours));
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.nextUnresolved = function() {
      var c, final, firstAfter, i, lastCursor, len, n, orderedCursors, p, pos, ref1, target;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      final = _.last(this.active());
      if (final != null) {
        n = final.conflict.navigator.nextUnresolved();
        if (n != null) {
          return this.focusConflict(n);
        }
      } else {
        orderedCursors = _.sortBy(this.editor.getCursors(), function(c) {
          return c.getBufferPosition().row;
        });
        lastCursor = _.last(orderedCursors);
        if (lastCursor == null) {
          return;
        }
        pos = lastCursor.getBufferPosition();
        firstAfter = null;
        ref1 = this.conflicts;
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          p = c.ours.marker.getBufferRange().start;
          if (p.isGreaterThanOrEqual(pos) && (firstAfter == null)) {
            firstAfter = c;
          }
        }
        if (firstAfter == null) {
          return;
        }
        if (firstAfter.isResolved()) {
          target = firstAfter.navigator.nextUnresolved();
        } else {
          target = firstAfter;
        }
        if (target == null) {
          return;
        }
        return this.focusConflict(target);
      }
    };

    ConflictedEditor.prototype.previousUnresolved = function() {
      var c, firstCursor, i, initial, lastBefore, len, orderedCursors, p, pos, ref1, target;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      initial = _.first(this.active());
      if (initial != null) {
        p = initial.conflict.navigator.previousUnresolved();
        if (p != null) {
          return this.focusConflict(p);
        }
      } else {
        orderedCursors = _.sortBy(this.editor.getCursors(), function(c) {
          return c.getBufferPosition().row;
        });
        firstCursor = _.first(orderedCursors);
        if (firstCursor == null) {
          return;
        }
        pos = firstCursor.getBufferPosition();
        lastBefore = null;
        ref1 = this.conflicts;
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          p = c.ours.marker.getBufferRange().start;
          if (p.isLessThanOrEqual(pos)) {
            lastBefore = c;
          }
        }
        if (lastBefore == null) {
          return;
        }
        if (lastBefore.isResolved()) {
          target = lastBefore.navigator.previousUnresolved();
        } else {
          target = lastBefore;
        }
        if (target == null) {
          return;
        }
        return this.focusConflict(target);
      }
    };

    ConflictedEditor.prototype.revertCurrent = function() {
      var i, len, ref1, results, side, view;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      ref1 = this.active();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        side = ref1[i];
        results.push((function() {
          var j, len1, ref2, results1;
          ref2 = this.coveringViews;
          results1 = [];
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            view = ref2[j];
            if (view.conflict() === side.conflict) {
              if (view.isDirty()) {
                results1.push(view.revert());
              } else {
                results1.push(void 0);
              }
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    ConflictedEditor.prototype.active = function() {
      var c, i, j, len, len1, matching, p, positions, ref1;
      positions = (function() {
        var i, len, ref1, results;
        ref1 = this.editor.getCursors();
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          results.push(c.getBufferPosition());
        }
        return results;
      }).call(this);
      matching = [];
      ref1 = this.conflicts;
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        for (j = 0, len1 = positions.length; j < len1; j++) {
          p = positions[j];
          if (c.ours.marker.getBufferRange().containsPoint(p)) {
            matching.push(c.ours);
          }
          if (c.theirs.marker.getBufferRange().containsPoint(p)) {
            matching.push(c.theirs);
          }
        }
      }
      return matching;
    };

    ConflictedEditor.prototype.combineSides = function(first, second) {
      var e, insertPoint, text;
      text = this.editor.getTextInBufferRange(second.marker.getBufferRange());
      e = first.marker.getBufferRange().end;
      insertPoint = this.editor.setTextInBufferRange([e, e], text).end;
      first.marker.setHeadBufferPosition(insertPoint);
      first.followingMarker.setTailBufferPosition(insertPoint);
      return first.resolve();
    };

    ConflictedEditor.prototype.focusConflict = function(conflict) {
      var st;
      st = conflict.ours.marker.getBufferRange().start;
      this.editor.scrollToBufferPosition(st, {
        center: true
      });
      return this.editor.setCursorBufferPosition(st, {
        autoscroll: false
      });
    };

    return ConflictedEditor;

  })();

  module.exports = {
    ConflictedEditor: ConflictedEditor
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL2NvbmZsaWN0ZWQtZWRpdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsSUFBSyxPQUFBLENBQVEsV0FBUjs7RUFDTixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMscUJBQUQsRUFBVTs7RUFFVCxXQUFZLE9BQUEsQ0FBUSxZQUFSOztFQUVaLFdBQVksT0FBQSxDQUFRLGtCQUFSOztFQUNaLGlCQUFrQixPQUFBLENBQVEsd0JBQVI7O0VBQ2xCLGVBQWdCLE9BQUEsQ0FBUSxzQkFBUjs7RUFJWDtJQVNTLDBCQUFDLEtBQUQsRUFBUyxHQUFULEVBQWUsTUFBZjtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLE1BQUQ7TUFBTSxJQUFDLENBQUEsU0FBRDtNQUMxQixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUk7TUFDWixJQUFDLENBQUEsYUFBRCxHQUFpQjtNQUNqQixJQUFDLENBQUEsU0FBRCxHQUFhO0lBSEY7OytCQVliLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsS0FBZCxFQUFxQixJQUFDLENBQUEsTUFBdEI7TUFFYixJQUFDLENBQUEsYUFBRCxHQUFpQjtBQUNqQjtBQUFBLFdBQUEsc0NBQUE7O1FBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQXdCLElBQUEsUUFBQSxDQUFTLENBQUMsQ0FBQyxJQUFYLEVBQWlCLElBQUMsQ0FBQSxNQUFsQixDQUF4QjtRQUNBLElBQXFELGNBQXJEO1VBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQXdCLElBQUEsUUFBQSxD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ID0gcmVxdWlyZSAnc3BhY2UtcGVuJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntDb25mbGljdH0gPSByZXF1aXJlICcuL2NvbmZsaWN0J1xuXG57U2lkZVZpZXd9ID0gcmVxdWlyZSAnLi92aWV3L3NpZGUtdmlldydcbntOYXZpZ2F0aW9uVmlld30gPSByZXF1aXJlICcuL3ZpZXcvbmF2aWdhdGlvbi12aWV3J1xue1Jlc29sdmVyVmlld30gPSByZXF1aXJlICcuL3ZpZXcvcmVzb2x2ZXItdmlldydcblxuIyBQdWJsaWM6IE1lZGlhdGUgY29uZmxpY3QtcmVsYXRlZCBkZWNvcmF0aW9ucyBhbmQgZXZlbnRzIG9uIGJlaGFsZiBvZiBhIHNwZWNpZmljIFRleHRFZGl0b3IuXG4jXG5jbGFzcyBDb25mbGljdGVkRWRpdG9yXG5cbiAgIyBQdWJsaWM6IEluc3RhbnRpYXRlIGEgbmV3IENvbmZsaWN0ZWRFZGl0b3IgdG8gbWFuYWdlIHRoZSBkZWNvcmF0aW9ucyBhbmQgZXZlbnRzIG9mIGEgc3BlY2lmaWNcbiAgIyBUZXh0RWRpdG9yLlxuICAjXG4gICMgc3RhdGUgW01lcmdlU3RhdGVdIC0gTWVyZ2Utd2lkZSBjb25mbGljdCBzdGF0ZS5cbiAgIyBwa2cgW0VtaXR0ZXJdIC0gVGhlIHBhY2thZ2Ugb2JqZWN0IGNvbnRhaW5pbmcgZXZlbnQgZGlzcGF0Y2ggYW5kIHN1YnNjcmlwdGlvbiBtZXRob2RzLlxuICAjIGVkaXRvciBbVGV4dEVkaXRvcl0gLSBBbiBlZGl0b3IgY29udGFpbmluZyB0ZXh0IHRoYXQsIHByZXN1bWFibHksIGluY2x1ZGVzIGNvbmZsaWN0IG1hcmtlcnMuXG4gICNcbiAgY29uc3RydWN0b3I6IChAc3RhdGUsIEBwa2csIEBlZGl0b3IpIC0+XG4gICAgQHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBjb3ZlcmluZ1ZpZXdzID0gW11cbiAgICBAY29uZmxpY3RzID0gW11cblxuICAjIFB1YmxpYzogTG9jYXRlIENvbmZsaWN0cyB3aXRoaW4gdGhpcyBzcGVjaWZpYyBUZXh0RWRpdG9yLlxuICAjXG4gICMgSW5zdGFsbCBhIHBhaXIgb2YgU2lkZVZpZXdzIGFuZCBhIE5hdmlnYXRpb25WaWV3IGZvciBlYWNoIENvbmZsaWN0IGRpc2NvdmVyZWQgd2l0aGluIHRoZVxuICAjIGVkaXRvcidzIHRleHQuIFN1YnNjcmliZSB0byBwYWNrYWdlIGV2ZW50cyByZWxhdGVkIHRvIHJlbGV2YW50IENvbmZsaWN0cyBhbmQgYnJvYWRjYXN0XG4gICMgcGVyLWVkaXRvciBwcm9ncmVzcyBldmVudHMgYXMgdGhleSBhcmUgcmVzb2x2ZWQuIEluc3RhbGwgQXRvbSBjb21tYW5kcyByZWxhdGVkIHRvIGNvbmZsaWN0XG4gICMgbmF2aWdhdGlvbiBhbmQgcmVzb2x1dGlvbi5cbiAgI1xuICBtYXJrOiAtPlxuICAgIEBjb25mbGljdHMgPSBDb25mbGljdC5hbGwoQHN0YXRlLCBAZWRpdG9yKVxuXG4gICAgQGNvdmVyaW5nVmlld3MgPSBbXVxuICAgIGZvciBjIGluIEBjb25mbGljdHNcbiAgICAgIEBjb3ZlcmluZ1ZpZXdzLnB1c2ggbmV3IFNpZGVWaWV3KGMub3VycywgQGVkaXRvcilcbiAgICAgIEBjb3ZlcmluZ1ZpZXdzLnB1c2ggbmV3IFNpZGVWaWV3KGMuYmFzZSwgQGVkaXRvcikgaWYgYy5iYXNlP1xuICAgICAgQGNvdmVyaW5nVmlld3MucHVzaCBuZXcgTmF2aWdhdGlvblZpZXcoYy5uYXZpZ2F0b3IsIEBlZGl0b3IpXG4gICAgICBAY292ZXJpbmdWaWV3cy5wdXNoIG5ldyBTaWRlVmlldyhjLnRoZWlycywgQGVkaXRvcilcblxuICAgICAgQHN1YnMuYWRkIGMub25EaWRSZXNvbHZlQ29uZmxpY3QgPT5cbiAgICAgICAgdW5yZXNvbHZlZCA9ICh2IGZvciB2IGluIEBjb3ZlcmluZ1ZpZXdzIHdoZW4gbm90IHYuY29uZmxpY3QoKS5pc1Jlc29sdmVkKCkpXG4gICAgICAgIHJlc29sdmVkQ291bnQgPSBAY29uZmxpY3RzLmxlbmd0aCAtIE1hdGguZmxvb3IodW5yZXNvbHZlZC5sZW5ndGggLyAzKVxuICAgICAgICBAcGtnLmRpZFJlc29sdmVDb25mbGljdFxuICAgICAgICAgIGZpbGU6IEBlZGl0b3IuZ2V0UGF0aCgpLFxuICAgICAgICAgIHRvdGFsOiBAY29uZmxpY3RzLmxlbmd0aCwgcmVzb2x2ZWQ6IHJlc29sdmVkQ291bnQsXG4gICAgICAgICAgc291cmNlOiB0aGlzXG5cbiAgICBpZiBAY29uZmxpY3RzLmxlbmd0aCA+IDBcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKS5jbGFzc0xpc3QuYWRkICdjb25mbGljdGVkJ1xuXG4gICAgICBjdi5kZWNvcmF0ZSgpIGZvciBjdiBpbiBAY292ZXJpbmdWaWV3c1xuICAgICAgQGluc3RhbGxFdmVudHMoKVxuICAgICAgQGZvY3VzQ29uZmxpY3QgQGNvbmZsaWN0c1swXVxuICAgIGVsc2VcbiAgICAgIEBwa2cuZGlkUmVzb2x2ZUNvbmZsaWN0XG4gICAgICAgIGZpbGU6IEBlZGl0b3IuZ2V0UGF0aCgpLFxuICAgICAgICB0b3RhbDogMSwgcmVzb2x2ZWQ6IDEsXG4gICAgICAgIHNvdXJjZTogdGhpc1xuICAgICAgQGNvbmZsaWN0c1Jlc29sdmVkKClcblxuICAjIFByaXZhdGU6IEluc3RhbGwgQXRvbSBjb21tYW5kcyByZWxhdGVkIHRvIENvbmZsaWN0IHJlc29sdXRpb24gYW5kIG5hdmlnYXRpb24gb24gdGhlIFRleHRFZGl0b3IuXG4gICNcbiAgIyBMaXN0ZW4gZm9yIHBhY2thZ2UtZ2xvYmFsIGV2ZW50cyB0aGF0IHJlbGF0ZSB0byB0aGUgbG9jYWwgQ29uZmxpY3RzIGFuZCBkaXNwYXRjaCB0aGVtXG4gICMgYXBwcm9wcmlhdGVseS5cbiAgI1xuICBpbnN0YWxsRXZlbnRzOiAtPlxuICAgIEBzdWJzLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nID0+IEBkZXRlY3REaXJ0eSgpXG4gICAgQHN1YnMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ID0+IEBjbGVhbnVwKClcblxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbWVyZ2UtY29uZmxpY3RzOmFjY2VwdC1jdXJyZW50JzogPT4gQGFjY2VwdEN1cnJlbnQoKSxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6YWNjZXB0LW91cnMnOiA9PiBAYWNjZXB0T3VycygpLFxuICAgICAgJ21lcmdlLWNvbmZsaWN0czphY2NlcHQtdGhlaXJzJzogPT4gQGFjY2VwdFRoZWlycygpLFxuICAgICAgJ21lcmdlLWNvbmZsaWN0czpvdXJzLXRoZW4tdGhlaXJzJzogPT4gQGFjY2VwdE91cnNUaGVuVGhlaXJzKCksXG4gICAgICAnbWVyZ2UtY29uZmxpY3RzOnRoZWlycy10aGVuLW91cnMnOiA9PiBAYWNjZXB0VGhlaXJzVGhlbk91cnMoKSxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6bmV4dC11bnJlc29sdmVkJzogPT4gQG5leHRVbnJlc29sdmVkKCksXG4gICAgICAnbWVyZ2UtY29uZmxpY3RzOnByZXZpb3VzLXVucmVzb2x2ZWQnOiA9PiBAcHJldmlvdXNVbnJlc29sdmVkKCksXG4gICAgICAnbWVyZ2UtY29uZmxpY3RzOnJldmVydC1jdXJyZW50JzogPT4gQHJldmVydEN1cnJlbnQoKVxuXG4gICAgQHN1YnMuYWRkIEBwa2cub25EaWRSZXNvbHZlQ29uZmxpY3QgKHt0b3RhbCwgcmVzb2x2ZWQsIGZpbGV9KSA9PlxuICAgICAgaWYgZmlsZSBpcyBAZWRpdG9yLmdldFBhdGgoKSBhbmQgdG90YWwgaXMgcmVzb2x2ZWRcbiAgICAgICAgQGNvbmZsaWN0c1Jlc29sdmVkKClcblxuICAgIEBzdWJzLmFkZCBAcGtnLm9uRGlkQ29tcGxldGVDb25mbGljdFJlc29sdXRpb24gPT4gQGNsZWFudXAoKVxuICAgIEBzdWJzLmFkZCBAcGtnLm9uRGlkUXVpdENvbmZsaWN0UmVzb2x1dGlvbiA9PiBAY2xlYW51cCgpXG5cbiAgIyBQcml2YXRlOiBVbmRvIGFueSBjaGFuZ2VzIGRvbmUgdG8gdGhlIHVuZGVybHlpbmcgVGV4dEVkaXRvci5cbiAgI1xuICBjbGVhbnVwOiAtPlxuICAgIGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKS5jbGFzc0xpc3QucmVtb3ZlICdjb25mbGljdGVkJyBpZiBAZWRpdG9yP1xuXG4gICAgZm9yIGMgaW4gQGNvbmZsaWN0c1xuICAgICAgbS5kZXN0cm95KCkgZm9yIG0gaW4gYy5tYXJrZXJzKClcblxuICAgIHYucmVtb3ZlKCkgZm9yIHYgaW4gQGNvdmVyaW5nVmlld3NcblxuICAgIEBzdWJzLmRpc3Bvc2UoKVxuXG4gICMgUHJpdmF0ZTogRXZlbnQgaGFuZGxlciBpbnZva2VkIHdoZW4gYWxsIGNvbmZsaWN0cyBpbiB0aGlzIGZpbGUgaGF2ZSBiZWVuIHJlc29sdmVkLlxuICAjXG4gIGNvbmZsaWN0c1Jlc29sdmVkOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmFkZFRvcFBhbmVsIGl0ZW06IG5ldyBSZXNvbHZlclZpZXcoQGVkaXRvciwgQHN0YXRlLCBAcGtnKVxuXG4gIGRldGVjdERpcnR5OiAtPlxuICAgICMgT25seSBkZXRlY3QgZGlydHkgcmVnaW9ucyB3aXRoaW4gQ292ZXJpbmdWaWV3cyB0aGF0IGhhdmUgYSBjdXJzb3Igd2l0aGluIHRoZW0uXG4gICAgcG90ZW50aWFscyA9IFtdXG4gICAgZm9yIGMgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIGZvciB2IGluIEBjb3ZlcmluZ1ZpZXdzXG4gICAgICAgIHBvdGVudGlhbHMucHVzaCh2KSBpZiB2LmluY2x1ZGVzQ3Vyc29yKGMpXG5cbiAgICB2LmRldGVjdERpcnR5KCkgZm9yIHYgaW4gXy51bmlxKHBvdGVudGlhbHMpXG5cbiAgIyBQcml2YXRlOiBDb21tYW5kIHRoYXQgYWNjZXB0cyBlYWNoIHNpZGUgb2YgYSBjb25mbGljdCB0aGF0IGNvbnRhaW5zIGEgY3Vyc29yLlxuICAjXG4gICMgQ29uZmxpY3RzIHdpdGggY3Vyc29ycyBpbiBib3RoIHNpZGVzIHdpbGwgYmUgaWdub3JlZC5cbiAgI1xuICBhY2NlcHRDdXJyZW50OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvciBpcyBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICAgIHNpZGVzID0gQGFjdGl2ZSgpXG5cbiAgICAjIERvIG5vdGhpbmcgaWYgeW91IGhhdmUgY3Vyc29ycyBpbiAqYm90aCogc2lkZXMgb2YgYSBzaW5nbGUgY29uZmxpY3QuXG4gICAgZHVwbGljYXRlcyA9IFtdXG4gICAgc2VlbiA9IHt9XG4gICAgZm9yIHNpZGUgaW4gc2lkZXNcbiAgICAgIGlmIHNpZGUuY29uZmxpY3Qgb2Ygc2VlblxuICAgICAgICBkdXBsaWNhdGVzLnB1c2ggc2lkZVxuICAgICAgICBkdXBsaWNhdGVzLnB1c2ggc2VlbltzaWRlLmNvbmZsaWN0XVxuICAgICAgc2VlbltzaWRlLmNvbmZsaWN0XSA9IHNpZGVcbiAgICBzaWRlcyA9IF8uZGlmZmVyZW5jZSBzaWRlcywgZHVwbGljYXRlc1xuXG4gICAgQGVkaXRvci50cmFuc2FjdCAtPlxuICAgICAgc2lkZS5yZXNvbHZlKCkgZm9yIHNpZGUgaW4gc2lkZXNcblxuICAjIFByaXZhdGU6IENvbW1hbmQgdGhhdCBhY2NlcHRzIHRoZSBcIm91cnNcIiBzaWRlIG9mIHRoZSBhY3RpdmUgY29uZmxpY3QuXG4gICNcbiAgYWNjZXB0T3VyczogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IgaXMgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgc2lkZS5jb25mbGljdC5vdXJzLnJlc29sdmUoKSBmb3Igc2lkZSBpbiBAYWN0aXZlKClcblxuICAjIFByaXZhdGU6IENvbW1hbmQgdGhhdCBhY2NlcHRzIHRoZSBcInRoZWlyc1wiIHNpZGUgb2YgdGhlIGFjdGl2ZSBjb25mbGljdC5cbiAgI1xuICBhY2NlcHRUaGVpcnM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yIGlzIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIHNpZGUuY29uZmxpY3QudGhlaXJzLnJlc29sdmUoKSBmb3Igc2lkZSBpbiBAYWN0aXZlKClcblxuICAjIFByaXZhdGU6IENvbW1hbmQgdGhhdCB1c2VzIGEgY29tcG9zaXRlIHJlc29sdXRpb24gb2YgdGhlIFwib3Vyc1wiIHNpZGUgZm9sbG93ZWQgYnkgdGhlIFwidGhlaXJzXCJcbiAgIyBzaWRlIG9mIHRoZSBhY3RpdmUgY29uZmxpY3QuXG4gICNcbiAgYWNjZXB0T3Vyc1RoZW5UaGVpcnM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yIGlzIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzaWRlIGluIEBhY3RpdmUoKVxuICAgICAgICBAY29tYmluZVNpZGVzIHNpZGUuY29uZmxpY3Qub3Vycywgc2lkZS5jb25mbGljdC50aGVpcnNcblxuICAjIFByaXZhdGU6IENvbW1hbmQgdGhhdCB1c2VzIGEgY29tcG9zaXRlIHJlc29sdXRpb24gb2YgdGhlIFwidGhlaXJzXCIgc2lkZSBmb2xsb3dlZCBieSB0aGUgXCJvdXJzXCJcbiAgIyBzaWRlIG9mIHRoZSBhY3RpdmUgY29uZmxpY3QuXG4gICNcbiAgYWNjZXB0VGhlaXJzVGhlbk91cnM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yIGlzIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzaWRlIGluIEBhY3RpdmUoKVxuICAgICAgICBAY29tYmluZVNpZGVzIHNpZGUuY29uZmxpY3QudGhlaXJzLCBzaWRlLmNvbmZsaWN0Lm91cnNcblxuICAjIFByaXZhdGU6IENvbW1hbmQgdGhhdCBuYXZpZ2F0ZXMgdG8gdGhlIG5leHQgdW5yZXNvbHZlZCBjb25mbGljdCBpbiB0aGUgZWRpdG9yLlxuICAjXG4gICMgSWYgdGhlIGN1cnNvciBpcyBvbiBvciBhZnRlciB0aGUgZmluYWwgdW5yZXNvbHZlZCBjb25mbGljdCBpbiB0aGUgZWRpdG9yLCBub3RoaW5nIGhhcHBlbnMuXG4gICNcbiAgbmV4dFVucmVzb2x2ZWQ6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yIGlzIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGZpbmFsID0gXy5sYXN0IEBhY3RpdmUoKVxuICAgIGlmIGZpbmFsP1xuICAgICAgbiA9IGZpbmFsLmNvbmZsaWN0Lm5hdmlnYXRvci5uZXh0VW5yZXNvbHZlZCgpXG4gICAgICBAZm9jdXNDb25mbGljdChuKSBpZiBuP1xuICAgIGVsc2VcbiAgICAgIG9yZGVyZWRDdXJzb3JzID0gXy5zb3J0QnkgQGVkaXRvci5nZXRDdXJzb3JzKCksIChjKSAtPlxuICAgICAgICBjLmdldEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICBsYXN0Q3Vyc29yID0gXy5sYXN0IG9yZGVyZWRDdXJzb3JzXG4gICAgICByZXR1cm4gdW5sZXNzIGxhc3RDdXJzb3I/XG5cbiAgICAgIHBvcyA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgZmlyc3RBZnRlciA9IG51bGxcbiAgICAgIGZvciBjIGluIEBjb25mbGljdHNcbiAgICAgICAgcCA9IGMub3Vycy5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgICBpZiBwLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvcykgYW5kIG5vdCBmaXJzdEFmdGVyP1xuICAgICAgICAgIGZpcnN0QWZ0ZXIgPSBjXG4gICAgICByZXR1cm4gdW5sZXNzIGZpcnN0QWZ0ZXI/XG5cbiAgICAgIGlmIGZpcnN0QWZ0ZXIuaXNSZXNvbHZlZCgpXG4gICAgICAgIHRhcmdldCA9IGZpcnN0QWZ0ZXIubmF2aWdhdG9yLm5leHRVbnJlc29sdmVkKClcbiAgICAgIGVsc2VcbiAgICAgICAgdGFyZ2V0ID0gZmlyc3RBZnRlclxuICAgICAgcmV0dXJuIHVubGVzcyB0YXJnZXQ/XG5cbiAgICAgIEBmb2N1c0NvbmZsaWN0IHRhcmdldFxuXG4gICMgUHJpdmF0ZTogQ29tbWFuZCB0aGF0IG5hdmlnYXRlcyB0byB0aGUgcHJldmlvdXMgdW5yZXNvbHZlZCBjb25mbGljdCBpbiB0aGUgZWRpdG9yLlxuICAjXG4gICMgSWYgdGhlIGN1cnNvciBpcyBvbiBvciBiZWZvcmUgdGhlIGZpcnN0IHVucmVzb2x2ZWQgY29uZmxpY3QgaW4gdGhlIGVkaXRvciwgbm90aGluZyBoYXBwZW5zLlxuICAjXG4gIHByZXZpb3VzVW5yZXNvbHZlZDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IgaXMgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaW5pdGlhbCA9IF8uZmlyc3QgQGFjdGl2ZSgpXG4gICAgaWYgaW5pdGlhbD9cbiAgICAgIHAgPSBpbml0aWFsLmNvbmZsaWN0Lm5hdmlnYXRvci5wcmV2aW91c1VucmVzb2x2ZWQoKVxuICAgICAgQGZvY3VzQ29uZmxpY3QocCkgaWYgcD9cbiAgICBlbHNlXG4gICAgICBvcmRlcmVkQ3Vyc29ycyA9IF8uc29ydEJ5IEBlZGl0b3IuZ2V0Q3Vyc29ycygpLCAoYykgLT5cbiAgICAgICAgYy5nZXRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgICAgZmlyc3RDdXJzb3IgPSBfLmZpcnN0IG9yZGVyZWRDdXJzb3JzXG4gICAgICByZXR1cm4gdW5sZXNzIGZpcnN0Q3Vyc29yP1xuXG4gICAgICBwb3MgPSBmaXJzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBsYXN0QmVmb3JlID0gbnVsbFxuICAgICAgZm9yIGMgaW4gQGNvbmZsaWN0c1xuICAgICAgICBwID0gYy5vdXJzLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICAgIGlmIHAuaXNMZXNzVGhhbk9yRXF1YWwgcG9zXG4gICAgICAgICAgbGFzdEJlZm9yZSA9IGNcbiAgICAgIHJldHVybiB1bmxlc3MgbGFzdEJlZm9yZT9cblxuICAgICAgaWYgbGFzdEJlZm9yZS5pc1Jlc29sdmVkKClcbiAgICAgICAgdGFyZ2V0ID0gbGFzdEJlZm9yZS5uYXZpZ2F0b3IucHJldmlvdXNVbnJlc29sdmVkKClcbiAgICAgIGVsc2VcbiAgICAgICAgdGFyZ2V0ID0gbGFzdEJlZm9yZVxuICAgICAgcmV0dXJuIHVubGVzcyB0YXJnZXQ/XG5cbiAgICAgIEBmb2N1c0NvbmZsaWN0IHRhcmdldFxuXG4gICMgUHJpdmF0ZTogUmV2ZXJ0IG1hbnVhbCBlZGl0cyB0byB0aGUgY3VycmVudCBzaWRlIG9mIHRoZSBhY3RpdmUgY29uZmxpY3QuXG4gICNcbiAgcmV2ZXJ0Q3VycmVudDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IgaXMgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgZm9yIHNpZGUgaW4gQGFjdGl2ZSgpXG4gICAgICBmb3IgdmlldyBpbiBAY292ZXJpbmdWaWV3cyB3aGVuIHZpZXcuY29uZmxpY3QoKSBpcyBzaWRlLmNvbmZsaWN0XG4gICAgICAgIHZpZXcucmV2ZXJ0KCkgaWYgdmlldy5pc0RpcnR5KClcblxuICAjIFByaXZhdGU6IENvbGxlY3QgYSBsaXN0IG9mIGVhY2ggU2lkZSBvZiBhbnkgQ29uZmxpY3Qgd2l0aGluIHRoZSBlZGl0b3IgdGhhdCBjb250YWlucyBhIGN1cnNvci5cbiAgI1xuICAjIFJldHVybnMgW0FycmF5PFNpZGU+XVxuICAjXG4gIGFjdGl2ZTogLT5cbiAgICBwb3NpdGlvbnMgPSAoYy5nZXRCdWZmZXJQb3NpdGlvbigpIGZvciBjIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpKVxuICAgIG1hdGNoaW5nID0gW11cbiAgICBmb3IgYyBpbiBAY29uZmxpY3RzXG4gICAgICBmb3IgcCBpbiBwb3NpdGlvbnNcbiAgICAgICAgaWYgYy5vdXJzLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLmNvbnRhaW5zUG9pbnQgcFxuICAgICAgICAgIG1hdGNoaW5nLnB1c2ggYy5vdXJzXG4gICAgICAgIGlmIGMudGhlaXJzLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLmNvbnRhaW5zUG9pbnQgcFxuICAgICAgICAgIG1hdGNoaW5nLnB1c2ggYy50aGVpcnNcbiAgICBtYXRjaGluZ1xuXG4gICMgUHJpdmF0ZTogUmVzb2x2ZSBhIGNvbmZsaWN0IGJ5IGNvbWJpbmluZyBpdHMgdHdvIFNpZGVzIGluIGEgc3BlY2lmaWMgb3JkZXIuXG4gICNcbiAgIyBmaXJzdCBbU2lkZV0gVGhlIFNpZGUgdGhhdCBzaG91bGQgb2NjdXIgZmlyc3QgaW4gdGhlIHJlc29sdmVkIHRleHQuXG4gICMgc2Vjb25kIFtTaWRlXSBUaGUgU2lkZSBiZWxvbmdpbmcgdG8gdGhlIHNhbWUgQ29uZmxpY3QgdGhhdCBzaG91bGQgb2NjdXIgc2Vjb25kIGluIHRoZSByZXNvbHZlZFxuICAjICAgdGV4dC5cbiAgI1xuICBjb21iaW5lU2lkZXM6IChmaXJzdCwgc2Vjb25kKSAtPlxuICAgIHRleHQgPSBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlIHNlY29uZC5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGUgPSBmaXJzdC5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICBpbnNlcnRQb2ludCA9IEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW2UsIGVdLCB0ZXh0KS5lbmRcbiAgICBmaXJzdC5tYXJrZXIuc2V0SGVhZEJ1ZmZlclBvc2l0aW9uIGluc2VydFBvaW50XG4gICAgZmlyc3QuZm9sbG93aW5nTWFya2VyLnNldFRhaWxCdWZmZXJQb3NpdGlvbiBpbnNlcnRQb2ludFxuICAgIGZpcnN0LnJlc29sdmUoKVxuXG4gICMgUHJpdmF0ZTogU2Nyb2xsIHRoZSBlZGl0b3IgYW5kIHBsYWNlIHRoZSBjdXJzb3IgYXQgdGhlIGJlZ2lubmluZyBvZiBhIG1hcmtlZCBjb25mbGljdC5cbiAgI1xuICAjIGNvbmZsaWN0IFtDb25mbGljdF0gQW55IGNvbmZsaWN0IHdpdGhpbiB0aGUgY3VycmVudCBlZGl0b3IuXG4gICNcbiAgZm9jdXNDb25mbGljdDogKGNvbmZsaWN0KSAtPlxuICAgIHN0ID0gY29uZmxpY3Qub3Vycy5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgIEBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbiBzdCwgY2VudGVyOiB0cnVlXG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBzdCwgYXV0b3Njcm9sbDogZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPVxuICBDb25mbGljdGVkRWRpdG9yOiBDb25mbGljdGVkRWRpdG9yXG4iXX0=
