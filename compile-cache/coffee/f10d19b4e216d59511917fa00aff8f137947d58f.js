(function() {
  var CompositeDisposable, Emitter, GitOps, MergeConflictsView, pkgApi, pkgEmitter, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  MergeConflictsView = require('./view/merge-conflicts-view').MergeConflictsView;

  GitOps = require('./git').GitOps;

  pkgEmitter = null;

  pkgApi = null;

  module.exports = {
    activate: function(state) {
      this.subs = new CompositeDisposable;
      this.emitter = new Emitter;
      MergeConflictsView.registerContextApi(GitOps);
      pkgEmitter = {
        onDidResolveConflict: (function(_this) {
          return function(callback) {
            return _this.onDidResolveConflict(callback);
          };
        })(this),
        didResolveConflict: (function(_this) {
          return function(event) {
            return _this.emitter.emit('did-resolve-conflict', event);
          };
        })(this),
        onDidResolveFile: (function(_this) {
          return function(callback) {
            return _this.onDidResolveFile(callback);
          };
        })(this),
        didResolveFile: (function(_this) {
          return function(event) {
            return _this.emitter.emit('did-resolve-file', event);
          };
        })(this),
        onDidQuitConflictResolution: (function(_this) {
          return function(callback) {
            return _this.onDidQuitConflictResolution(callback);
          };
        })(this),
        didQuitConflictResolution: (function(_this) {
          return function() {
            return _this.emitter.emit('did-quit-conflict-resolution');
          };
        })(this),
        onDidCompleteConflictResolution: (function(_this) {
          return function(callback) {
            return _this.onDidCompleteConflictResolution(callback);
          };
        })(this),
        didCompleteConflictResolution: (function(_this) {
          return function() {
            return _this.emitter.emit('did-complete-conflict-resolution');
          };
        })(this)
      };
      return this.subs.add(atom.commands.add('atom-workspace', 'merge-conflicts:detect', function() {
        return MergeConflictsView.detect(pkgEmitter);
      }));
    },
    deactivate: function() {
      this.subs.dispose();
      return this.emitter.dispose();
    },
    config: {
      gitPath: {
        type: 'string',
        "default": '',
        description: 'Absolute path to your git executable.'
      }
    },
    onDidResolveConflict: function(callback) {
      return this.emitter.on('did-resolve-conflict', callback);
    },
    onDidResolveFile: function(callback) {
      return this.emitter.on('did-resolve-file', callback);
    },
    onDidQuitConflictResolution: function(callback) {
      return this.emitter.on('did-quit-conflict-resolution', callback);
    },
    onDidCompleteConflictResolution: function(callback) {
      return this.emitter.on('did-complete-conflict-resolution', callback);
    },
    registerContextApi: function(contextApi) {
      return MergeConflictsView.registerContextApi(contextApi);
    },
    showForContext: function(context) {
      return MergeConflictsView.showForContext(context, pkgEmitter);
    },
    hideForContext: function(context) {
      return MergeConflictsView.hideForContext(context);
    },
    provideApi: function() {
      if (pkgApi === null) {
        pkgApi = Object.freeze({
          registerContextApi: this.registerContextApi,
          showForContext: this.showForContext,
          hideForContext: this.hideForContext,
          onDidResolveConflict: pkgEmitter.onDidResolveConflict,
          onDidResolveFile: pkgEmitter.onDidResolveConflict,
          onDidQuitConflictResolution: pkgEmitter.onDidQuitConflictResolution,
          onDidCompleteConflictResolution: pkgEmitter.onDidCompleteConflictResolution
        });
      }
      return pkgApi;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDZDQUFELEVBQXNCOztFQUVyQixxQkFBc0IsT0FBQSxDQUFRLDZCQUFSOztFQUN0QixTQUFVLE9BQUEsQ0FBUSxPQUFSOztFQUVYLFVBQUEsR0FBYTs7RUFDYixNQUFBLEdBQVM7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUk7TUFDWixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixrQkFBa0IsQ0FBQyxrQkFBbkIsQ0FBc0MsTUFBdEM7TUFFQSxVQUFBLEdBQ0U7UUFBQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFFBQUQ7bUJBQWMsS0FBQyxDQUFBLG9CQUFELENBQXNCLFFBQXRCO1VBQWQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO1FBQ0Esa0JBQUEsRUFBb0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO21CQUFXLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHNCQUFkLEVBQXNDLEtBQXRDO1VBQVg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRHBCO1FBRUEsZ0JBQUEsRUFBa0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxRQUFEO21CQUFjLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixRQUFsQjtVQUFkO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZsQjtRQUdBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO21CQUFXLEtBQUMsQ0FBQSxPQUFP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QSxFQUE2QixVQUFVLENBQUMsMkJBTm5CO1VBT3JCLCtCQUFBLEVBQWlDLFVBQVUsQ0FBQywrQkFQdkI7U0FBZCxFQURYOzthQVVBO0lBWFUsQ0FoRVo7O0FBVkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG57TWVyZ2VDb25mbGljdHNWaWV3fSA9IHJlcXVpcmUgJy4vdmlldy9tZXJnZS1jb25mbGljdHMtdmlldydcbntHaXRPcHN9ID0gcmVxdWlyZSAnLi9naXQnXG5cbnBrZ0VtaXR0ZXIgPSBudWxsO1xucGtnQXBpID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIE1lcmdlQ29uZmxpY3RzVmlldy5yZWdpc3RlckNvbnRleHRBcGkoR2l0T3BzKTtcblxuICAgIHBrZ0VtaXR0ZXIgPVxuICAgICAgb25EaWRSZXNvbHZlQ29uZmxpY3Q6IChjYWxsYmFjaykgPT4gQG9uRGlkUmVzb2x2ZUNvbmZsaWN0KGNhbGxiYWNrKVxuICAgICAgZGlkUmVzb2x2ZUNvbmZsaWN0OiAoZXZlbnQpID0+IEBlbWl0dGVyLmVtaXQgJ2RpZC1yZXNvbHZlLWNvbmZsaWN0JywgZXZlbnRcbiAgICAgIG9uRGlkUmVzb2x2ZUZpbGU6IChjYWxsYmFjaykgPT4gQG9uRGlkUmVzb2x2ZUZpbGUoY2FsbGJhY2spXG4gICAgICBkaWRSZXNvbHZlRmlsZTogKGV2ZW50KSA9PiBAZW1pdHRlci5lbWl0ICdkaWQtcmVzb2x2ZS1maWxlJywgZXZlbnRcbiAgICAgIG9uRGlkUXVpdENvbmZsaWN0UmVzb2x1dGlvbjogKGNhbGxiYWNrKSA9PiBAb25EaWRRdWl0Q29uZmxpY3RSZXNvbHV0aW9uKGNhbGxiYWNrKVxuICAgICAgZGlkUXVpdENvbmZsaWN0UmVzb2x1dGlvbjogPT4gQGVtaXR0ZXIuZW1pdCAnZGlkLXF1aXQtY29uZmxpY3QtcmVzb2x1dGlvbidcbiAgICAgIG9uRGlkQ29tcGxldGVDb25mbGljdFJlc29sdXRpb246IChjYWxsYmFjaykgPT4gQG9uRGlkQ29tcGxldGVDb25mbGljdFJlc29sdXRpb24oY2FsbGJhY2spXG4gICAgICBkaWRDb21wbGV0ZUNvbmZsaWN0UmVzb2x1dGlvbjogPT4gQGVtaXR0ZXIuZW1pdCAnZGlkLWNvbXBsZXRlLWNvbmZsaWN0LXJlc29sdXRpb24nXG5cbiAgICBAc3Vicy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ21lcmdlLWNvbmZsaWN0czpkZXRlY3QnLCAtPlxuICAgICAgTWVyZ2VDb25mbGljdHNWaWV3LmRldGVjdChwa2dFbWl0dGVyKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnMuZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG5cbiAgY29uZmlnOlxuICAgIGdpdFBhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWJzb2x1dGUgcGF0aCB0byB5b3VyIGdpdCBleGVjdXRhYmxlLidcblxuICAjIEludm9rZSBhIGNhbGxiYWNrIGVhY2ggdGltZSB0aGF0IGFuIGluZGl2aWR1YWwgY29uZmxpY3QgaXMgcmVzb2x2ZWQuXG4gICNcbiAgb25EaWRSZXNvbHZlQ29uZmxpY3Q6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXJlc29sdmUtY29uZmxpY3QnLCBjYWxsYmFja1xuXG4gICMgSW52b2tlIGEgY2FsbGJhY2sgZWFjaCB0aW1lIHRoYXQgYSBjb21wbGV0ZWQgZmlsZSBpcyByZXNvbHZlZC5cbiAgI1xuICBvbkRpZFJlc29sdmVGaWxlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1yZXNvbHZlLWZpbGUnLCBjYWxsYmFja1xuXG4gICMgSW52b2tlIGEgY2FsbGJhY2sgaWYgY29uZmxpY3QgcmVzb2x1dGlvbiBpcyBwcmVtYXR1cmVseSBleGl0ZWQsIHdoaWxlIGNvbmZsaWN0cyByZW1haW5cbiAgIyB1bnJlc29sdmVkLlxuICAjXG4gIG9uRGlkUXVpdENvbmZsaWN0UmVzb2x1dGlvbjogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtcXVpdC1jb25mbGljdC1yZXNvbHV0aW9uJywgY2FsbGJhY2tcblxuICAjIEludm9rZSBhIGNhbGxiYWNrIGlmIGNvbmZsaWN0IHJlc29sdXRpb24gaXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseSwgd2l0aCBhbGwgY29uZmxpY3RzIHJlc29sdmVkXG4gICMgYW5kIGFsbCBmaWxlcyByZXNvbHZlZC5cbiAgI1xuICBvbkRpZENvbXBsZXRlQ29uZmxpY3RSZXNvbHV0aW9uOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jb21wbGV0ZS1jb25mbGljdC1yZXNvbHV0aW9uJywgY2FsbGJhY2tcblxuICAjIFJlZ2lzdGVyIGEgcmVwb3NpdG9yeSBjb250ZXh0IHByb3ZpZGVyIHRoYXQgd2lsbCBoYXZlIGZ1bmN0aW9uYWxpdHkgZm9yXG4gICMgcmV0cmlldmluZyBhbmQgcmVzb2x2aW5nIGNvbmZsaWN0cy5cbiAgI1xuICByZWdpc3RlckNvbnRleHRBcGk6IChjb250ZXh0QXBpKSAtPlxuICAgIE1lcmdlQ29uZmxpY3RzVmlldy5yZWdpc3RlckNvbnRleHRBcGkoY29udGV4dEFwaSlcblxuXG4gIHNob3dGb3JDb250ZXh0OiAoY29udGV4dCkgLT5cbiAgICBNZXJnZUNvbmZsaWN0c1ZpZXcuc2hvd0ZvckNvbnRleHQoY29udGV4dCwgcGtnRW1pdHRlcilcblxuICBoaWRlRm9yQ29udGV4dDogKGNvbnRleHQpIC0+XG4gICAgTWVyZ2VDb25mbGljdHNWaWV3LmhpZGVGb3JDb250ZXh0KGNvbnRleHQpXG5cbiAgcHJvdmlkZUFwaTogLT5cbiAgICBpZiAocGtnQXBpID09IG51bGwpXG4gICAgICBwa2dBcGkgPSBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgcmVnaXN0ZXJDb250ZXh0QXBpOiBAcmVnaXN0ZXJDb250ZXh0QXBpLFxuICAgICAgICBzaG93Rm9yQ29udGV4dDogQHNob3dGb3JDb250ZXh0LFxuICAgICAgICBoaWRlRm9yQ29udGV4dDogQGhpZGVGb3JDb250ZXh0LFxuICAgICAgICBvbkRpZFJlc29sdmVDb25mbGljdDogcGtnRW1pdHRlci5vbkRpZFJlc29sdmVDb25mbGljdCxcbiAgICAgICAgb25EaWRSZXNvbHZlRmlsZTogcGtnRW1pdHRlci5vbkRpZFJlc29sdmVDb25mbGljdCxcbiAgICAgICAgb25EaWRRdWl0Q29uZmxpY3RSZXNvbHV0aW9uOiBwa2dFbWl0dGVyLm9uRGlkUXVpdENvbmZsaWN0UmVzb2x1dGlvbixcbiAgICAgICAgb25EaWRDb21wbGV0ZUNvbmZsaWN0UmVzb2x1dGlvbjogcGtnRW1pdHRlci5vbkRpZENvbXBsZXRlQ29uZmxpY3RSZXNvbHV0aW9uLFxuICAgICAgfSlcbiAgICBwa2dBcGlcbiJdfQ==
