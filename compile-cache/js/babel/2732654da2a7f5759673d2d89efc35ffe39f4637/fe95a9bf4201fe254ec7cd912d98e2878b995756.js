Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _sbEventKit = require('sb-event-kit');

let BusySignal = class BusySignal {

  constructor() {
    this.executing = new Set();
    this.subscriptions = new _sbEventKit.CompositeDisposable();
  }
  attach(registry) {
    this.provider = registry.create();
    this.update();
  }
  update() {
    const provider = this.provider;
    if (!provider) {
      return;
    }
    provider.clear();
    const fileMap = new Map();

    for (const _ref of this.executing) {
      const { filePath, linter } = _ref;

      let names = fileMap.get(filePath);
      if (!names) {
        fileMap.set(filePath, names = []);
      }
      names.push(linter.name);
    }

    for (const [filePath, names] of fileMap) {
      const path = filePath ? ` on ${atom.project.relativizePath(filePath)[1]}` : '';
      provider.add(`${names.join(', ')}${path}`);
    }
    fileMap.clear();
  }
  getExecuting(linter, filePath) {
    for (const entry of this.executing) {
      if (entry.linter === linter && entry.filePath === filePath) {
        return entry;
      }
    }
    return null;
  }
  didBeginLinting(linter, filePath) {
    if (this.getExecuting(linter, filePath)) {
      return;
    }
    this.executing.add({ linter, filePath });
    this.update();
  }
  didFinishLinting(linter, filePath) {
    const entry = this.getExecuting(linter, filePath);
    if (entry) {
      this.executing.delete(entry);
      this.update();
    }
  }
  dispose() {
    if (this.provider) {
      this.provider.clear();
    }
    this.executing.clear();
    this.subscriptions.dispose();
  }
};
exports.default = BusySignal;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1c3ktc2lnbmFsLmpzIl0sIm5hbWVzIjpbIkJ1c3lTaWduYWwiLCJjb25zdHJ1Y3RvciIsImV4ZWN1dGluZyIsIlNldCIsInN1YnNjcmlwdGlvbnMiLCJhdHRhY2giLCJyZWdpc3RyeSIsInByb3ZpZGVyIiwiY3JlYXRlIiwidXBkYXRlIiwiY2xlYXIiLCJmaWxlTWFwIiwiTWFwIiwiZmlsZVBhdGgiLCJsaW50ZXIiLCJuYW1lcyIsImdldCIsInNldCIsInB1c2giLCJuYW1lIiwicGF0aCIsImF0b20iLCJwcm9qZWN0IiwicmVsYXRpdml6ZVBhdGgiLCJhZGQiLCJqb2luIiwiZ2V0RXhlY3V0aW5nIiwiZW50cnkiLCJkaWRCZWdpbkxpbnRpbmciLCJkaWRGaW5pc2hMaW50aW5nIiwiZGVsZXRlIiwiZGlzcG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7SUFHcUJBLFUsR0FBTixNQUFNQSxVQUFOLENBQWlCOztBQVE5QkMsZ0JBQWM7QUFDWixTQUFLQyxTQUFMLEdBQWlCLElBQUlDLEdBQUosRUFBakI7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLHFDQUFyQjtBQUNEO0FBQ0RDLFNBQU9DLFFBQVAsRUFBeUI7QUFDdkIsU0FBS0MsUUFBTCxHQUFnQkQsU0FBU0UsTUFBVCxFQUFoQjtBQUNBLFNBQUtDLE1BQUw7QUFDRDtBQUNEQSxXQUFTO0FBQ1AsVUFBTUYsV0FBVyxLQUFLQSxRQUF0QjtBQUNBLFFBQUksQ0FBQ0EsUUFBTCxFQUFlO0FBQ2I7QUFDRDtBQUNEQSxhQUFTRyxLQUFUO0FBQ0EsVUFBTUMsVUFBdUMsSUFBSUMsR0FBSixFQUE3Qzs7QUFFQSx1QkFBbUMsS0FBS1YsU0FBeEMsRUFBbUQ7QUFBQSxZQUF4QyxFQUFFVyxRQUFGLEVBQVlDLE1BQVosRUFBd0M7O0FBQ2pELFVBQUlDLFFBQVFKLFFBQVFLLEdBQVIsQ0FBWUgsUUFBWixDQUFaO0FBQ0EsVUFBSSxDQUFDRSxLQUFMLEVBQVk7QUFDVkosZ0JBQVFNLEdBQVIsQ0FBWUosUUFBWixFQUFzQkUsUUFBUSxFQUE5QjtBQUNEO0FBQ0RBLFlBQU1HLElBQU4sQ0FBV0osT0FBT0ssSUFBbEI7QUFDRDs7QUFFRCxTQUFLLE1BQU0sQ0FBQ04sUUFBRCxFQUFXRSxLQUFYLENBQVgsSUFBZ0NKLE9BQWhDLEVBQXlDO0FBQ3ZDLFlBQU1TLE9BQU9QLFdBQVksT0FBTVEsS0FBS0MsT0FBTCxDQUFhQyxjQUFiLENBQTRCVixRQUE1QixFQUFzQyxDQUF0QyxDQUF5QyxFQUEzRCxHQUErRCxFQUE1RTtBQUNBTixlQUFTaUIsR0FBVCxDQUFjLEdBQUVULE1BQU1VLElBQU4sQ0FBVyxJQUFYLENBQWlCLEdBQUVMLElBQUssRUFBeEM7QUFDRDtBQUNEVCxZQUFRRCxLQUFSO0FBQ0Q7QUFDRGdCLGVBQWFaLE1BQWIsRUFBNkJELFFBQTdCLEVBQXlEO0FBQ3ZELFNBQUssTUFBTWMsS0FBWCxJQUFvQixLQUFLekIsU0FBekIsRUFBb0M7QUFDbEMsVUFBSXlCLE1BQU1iLE1BQU4sS0FBaUJBLE1BQWpCLElBQTJCYSxNQUFNZCxRQUFOLEtBQW1CQSxRQUFsRCxFQUE0RDtBQUMxRCxlQUFPYyxLQUFQO0FBQ0Q7QUFDRjtBQUNELFdBQU8sSUFBUDtBQUNEO0FBQ0RDLGtCQUFnQmQsTUFBaEIsRUFBZ0NELFFBQWhDLEVBQW1EO0FBQ2pELFFBQUksS0FBS2EsWUFBTCxDQUFrQlosTUFBbEIsRUFBMEJELFFBQTFCLENBQUosRUFBeUM7QUFDdkM7QUFDRDtBQUNELFNBQUtYLFNBQUwsQ0FBZXNCLEdBQWYsQ0FBbUIsRUFBRVYsTUFBRixFQUFVRCxRQUFWLEVBQW5CO0FBQ0EsU0FBS0osTUFBTDtBQUNEO0FBQ0RvQixtQkFBaUJmLE1BQWpCLEVBQWlDRCxRQUFqQyxFQUFvRDtBQUNsRCxVQUFNYyxRQUFRLEtBQUtELFlBQUwsQ0FBa0JaLE1BQWxCLEVBQTBCRCxRQUExQixDQUFkO0FBQ0EsUUFBSWMsS0FBSixFQUFXO0FBQ1QsV0FBS3pCLFNBQUwsQ0FBZTRCLE1BQWYsQ0FBc0JILEtBQXRCO0FBQ0EsV0FBS2xCLE1BQUw7QUFDRDtBQUNGO0FBQ0RzQixZQUFVO0FBQ1IsUUFBSSxLQUFLeEIsUUFBVCxFQUFtQjtBQUNqQixXQUFLQSxRQUFMLENBQWNHLEtBQWQ7QUFDRDtBQUNELFNBQUtSLFNBQUwsQ0FBZVEsS0FBZjtBQUNBLFNBQUtOLGFBQUwsQ0FBbUIyQixPQUFuQjtBQUNEO0FBbEU2QixDO2tCQUFYL0IsVSIsImZpbGUiOiJidXN5LXNpZ25hbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IExpbnRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1c3lTaWduYWwge1xuICBwcm92aWRlcjogP09iamVjdDtcbiAgZXhlY3V0aW5nOiBTZXQ8e1xuICAgIGxpbnRlcjogTGludGVyLFxuICAgIGZpbGVQYXRoOiA/c3RyaW5nLFxuICB9PjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmV4ZWN1dGluZyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgfVxuICBhdHRhY2gocmVnaXN0cnk6IE9iamVjdCkge1xuICAgIHRoaXMucHJvdmlkZXIgPSByZWdpc3RyeS5jcmVhdGUoKVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuICB1cGRhdGUoKSB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnByb3ZpZGVyXG4gICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHByb3ZpZGVyLmNsZWFyKClcbiAgICBjb25zdCBmaWxlTWFwOiBNYXA8P3N0cmluZywgQXJyYXk8c3RyaW5nPj4gPSBuZXcgTWFwKClcblxuICAgIGZvciAoY29uc3QgeyBmaWxlUGF0aCwgbGludGVyIH0gb2YgdGhpcy5leGVjdXRpbmcpIHtcbiAgICAgIGxldCBuYW1lcyA9IGZpbGVNYXAuZ2V0KGZpbGVQYXRoKVxuICAgICAgaWYgKCFuYW1lcykge1xuICAgICAgICBmaWxlTWFwLnNldChmaWxlUGF0aCwgbmFtZXMgPSBbXSlcbiAgICAgIH1cbiAgICAgIG5hbWVzLnB1c2gobGludGVyLm5hbWUpXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIG5hbWVzXSBvZiBmaWxlTWFwKSB7XG4gICAgICBjb25zdCBwYXRoID0gZmlsZVBhdGggPyBgIG9uICR7YXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVsxXX1gIDogJydcbiAgICAgIHByb3ZpZGVyLmFkZChgJHtuYW1lcy5qb2luKCcsICcpfSR7cGF0aH1gKVxuICAgIH1cbiAgICBmaWxlTWFwLmNsZWFyKClcbiAgfVxuICBnZXRFeGVjdXRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nKTogP09iamVjdCB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmV4ZWN1dGluZykge1xuICAgICAgaWYgKGVudHJ5LmxpbnRlciA9PT0gbGludGVyICYmIGVudHJ5LmZpbGVQYXRoID09PSBmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm4gZW50cnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBkaWRCZWdpbkxpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuZ2V0RXhlY3V0aW5nKGxpbnRlciwgZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5leGVjdXRpbmcuYWRkKHsgbGludGVyLCBmaWxlUGF0aCB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuICBkaWRGaW5pc2hMaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogP3N0cmluZykge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5nZXRFeGVjdXRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICBpZiAoZW50cnkpIHtcbiAgICAgIHRoaXMuZXhlY3V0aW5nLmRlbGV0ZShlbnRyeSlcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5wcm92aWRlcikge1xuICAgICAgdGhpcy5wcm92aWRlci5jbGVhcigpXG4gICAgfVxuICAgIHRoaXMuZXhlY3V0aW5nLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==