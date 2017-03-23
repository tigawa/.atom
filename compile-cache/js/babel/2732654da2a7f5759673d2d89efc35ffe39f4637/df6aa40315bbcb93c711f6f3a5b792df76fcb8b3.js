Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _helpers = require('./helpers');

var _validate = require('./validate');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let ProvidersList = class ProvidersList {

  constructor() {
    this.number = 0;
    this.providers = new Set();
  }
  addProvider(provider) {
    if (!this.hasProvider(provider)) {
      (0, _validate.provider)(provider);
      this.providers.add(provider);
    }
  }
  hasProvider(provider) {
    return this.providers.has(provider);
  }
  deleteProvider(provider) {
    if (this.hasProvider(provider)) {
      this.providers.delete(provider);
    }
  }
  trigger(textEditor) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const editorPath = textEditor.getPath();
      const bufferPosition = textEditor.getCursorBufferPosition();

      if (!editorPath) {
        return [];
      }

      const scopes = textEditor.scopeDescriptorForBufferPosition(bufferPosition).getScopesArray();
      scopes.push('*');

      const promises = [];
      _this.providers.forEach(function (provider) {
        if (scopes.some(scope => provider.grammarScopes.indexOf(scope) !== -1)) {
          promises.push(new Promise(function (resolve) {
            resolve(provider.getIntentions({ textEditor, bufferPosition }));
          }).then(function (results) {
            if (atom.inDevMode()) {
              (0, _validate.suggestionsList)(results);
            }
            return results;
          }));
        }
      });

      const number = ++_this.number;
      const results = (yield Promise.all(promises)).reduce(function (items, item) {
        if (Array.isArray(item)) {
          return items.concat(item);
        }
        return items;
      }, []);

      if (number !== _this.number || !results.length) {
        // If has been executed one more time, ignore these results
        // Or we don't have any results
        return [];
      }

      return (0, _helpers.processListItems)(results);
    })();
  }
  dispose() {
    this.providers.clear();
  }
};
exports.default = ProvidersList;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3ZpZGVycy1saXN0LmpzIl0sIm5hbWVzIjpbIlByb3ZpZGVyc0xpc3QiLCJjb25zdHJ1Y3RvciIsIm51bWJlciIsInByb3ZpZGVycyIsIlNldCIsImFkZFByb3ZpZGVyIiwicHJvdmlkZXIiLCJoYXNQcm92aWRlciIsImFkZCIsImhhcyIsImRlbGV0ZVByb3ZpZGVyIiwiZGVsZXRlIiwidHJpZ2dlciIsInRleHRFZGl0b3IiLCJlZGl0b3JQYXRoIiwiZ2V0UGF0aCIsImJ1ZmZlclBvc2l0aW9uIiwiZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24iLCJzY29wZXMiLCJzY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbiIsImdldFNjb3Blc0FycmF5IiwicHVzaCIsInByb21pc2VzIiwiZm9yRWFjaCIsInNvbWUiLCJzY29wZSIsImdyYW1tYXJTY29wZXMiLCJpbmRleE9mIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXRJbnRlbnRpb25zIiwidGhlbiIsInJlc3VsdHMiLCJhdG9tIiwiaW5EZXZNb2RlIiwiYWxsIiwicmVkdWNlIiwiaXRlbXMiLCJpdGVtIiwiQXJyYXkiLCJpc0FycmF5IiwiY29uY2F0IiwibGVuZ3RoIiwiZGlzcG9zZSIsImNsZWFyIl0sIm1hcHBpbmdzIjoiOzs7OztBQUdBOztBQUNBOzs7O0lBR3FCQSxhLEdBQU4sTUFBTUEsYUFBTixDQUFvQjs7QUFJakNDLGdCQUFjO0FBQ1osU0FBS0MsTUFBTCxHQUFjLENBQWQ7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLElBQUlDLEdBQUosRUFBakI7QUFDRDtBQUNEQyxjQUFZQyxRQUFaLEVBQW9DO0FBQ2xDLFFBQUksQ0FBQyxLQUFLQyxXQUFMLENBQWlCRCxRQUFqQixDQUFMLEVBQWlDO0FBQy9CLDhCQUFpQkEsUUFBakI7QUFDQSxXQUFLSCxTQUFMLENBQWVLLEdBQWYsQ0FBbUJGLFFBQW5CO0FBQ0Q7QUFDRjtBQUNEQyxjQUFZRCxRQUFaLEVBQTZDO0FBQzNDLFdBQU8sS0FBS0gsU0FBTCxDQUFlTSxHQUFmLENBQW1CSCxRQUFuQixDQUFQO0FBQ0Q7QUFDREksaUJBQWVKLFFBQWYsRUFBdUM7QUFDckMsUUFBSSxLQUFLQyxXQUFMLENBQWlCRCxRQUFqQixDQUFKLEVBQWdDO0FBQzlCLFdBQUtILFNBQUwsQ0FBZVEsTUFBZixDQUFzQkwsUUFBdEI7QUFDRDtBQUNGO0FBQ0tNLFNBQU4sQ0FBY0MsVUFBZCxFQUFnRTtBQUFBOztBQUFBO0FBQzlELFlBQU1DLGFBQWFELFdBQVdFLE9BQVgsRUFBbkI7QUFDQSxZQUFNQyxpQkFBaUJILFdBQVdJLHVCQUFYLEVBQXZCOztBQUVBLFVBQUksQ0FBQ0gsVUFBTCxFQUFpQjtBQUNmLGVBQU8sRUFBUDtBQUNEOztBQUVELFlBQU1JLFNBQVNMLFdBQVdNLGdDQUFYLENBQTRDSCxjQUE1QyxFQUE0REksY0FBNUQsRUFBZjtBQUNBRixhQUFPRyxJQUFQLENBQVksR0FBWjs7QUFFQSxZQUFNQyxXQUFXLEVBQWpCO0FBQ0EsWUFBS25CLFNBQUwsQ0FBZW9CLE9BQWYsQ0FBdUIsVUFBU2pCLFFBQVQsRUFBbUI7QUFDeEMsWUFBSVksT0FBT00sSUFBUCxDQUFZQyxTQUFTbkIsU0FBU29CLGFBQVQsQ0FBdUJDLE9BQXZCLENBQStCRixLQUEvQixNQUEwQyxDQUFDLENBQWhFLENBQUosRUFBd0U7QUFDdEVILG1CQUFTRCxJQUFULENBQWMsSUFBSU8sT0FBSixDQUFZLFVBQVNDLE9BQVQsRUFBa0I7QUFDMUNBLG9CQUFRdkIsU0FBU3dCLGFBQVQsQ0FBdUIsRUFBRWpCLFVBQUYsRUFBY0csY0FBZCxFQUF2QixDQUFSO0FBQ0QsV0FGYSxFQUVYZSxJQUZXLENBRU4sVUFBU0MsT0FBVCxFQUFrQjtBQUN4QixnQkFBSUMsS0FBS0MsU0FBTCxFQUFKLEVBQXNCO0FBQ3BCLDZDQUFvQkYsT0FBcEI7QUFDRDtBQUNELG1CQUFPQSxPQUFQO0FBQ0QsV0FQYSxDQUFkO0FBUUQ7QUFDRixPQVhEOztBQWFBLFlBQU05QixTQUFTLEVBQUUsTUFBS0EsTUFBdEI7QUFDQSxZQUFNOEIsVUFBVSxDQUFDLE1BQU1KLFFBQVFPLEdBQVIsQ0FBWWIsUUFBWixDQUFQLEVBQThCYyxNQUE5QixDQUFxQyxVQUFTQyxLQUFULEVBQWdCQyxJQUFoQixFQUFzQjtBQUN6RSxZQUFJQyxNQUFNQyxPQUFOLENBQWNGLElBQWQsQ0FBSixFQUF5QjtBQUN2QixpQkFBT0QsTUFBTUksTUFBTixDQUFhSCxJQUFiLENBQVA7QUFDRDtBQUNELGVBQU9ELEtBQVA7QUFDRCxPQUxlLEVBS2IsRUFMYSxDQUFoQjs7QUFPQSxVQUFJbkMsV0FBVyxNQUFLQSxNQUFoQixJQUEwQixDQUFDOEIsUUFBUVUsTUFBdkMsRUFBK0M7QUFDN0M7QUFDQTtBQUNBLGVBQU8sRUFBUDtBQUNEOztBQUVELGFBQU8sK0JBQWlCVixPQUFqQixDQUFQO0FBdkM4RDtBQXdDL0Q7QUFDRFcsWUFBVTtBQUNSLFNBQUt4QyxTQUFMLENBQWV5QyxLQUFmO0FBQ0Q7QUFqRWdDLEM7a0JBQWQ1QyxhIiwiZmlsZSI6InByb3ZpZGVycy1saXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IHByb2Nlc3NMaXN0SXRlbXMgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgeyBwcm92aWRlciBhcyB2YWxpZGF0ZVByb3ZpZGVyLCBzdWdnZXN0aW9uc0xpc3QgYXMgdmFsaWRhdGVTdWdnZXN0aW9ucyB9IGZyb20gJy4vdmFsaWRhdGUnXG5pbXBvcnQgdHlwZSB7IExpc3RQcm92aWRlciwgTGlzdEl0ZW0gfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm92aWRlcnNMaXN0IHtcbiAgbnVtYmVyOiBudW1iZXI7XG4gIHByb3ZpZGVyczogU2V0PExpc3RQcm92aWRlcj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5udW1iZXIgPSAwXG4gICAgdGhpcy5wcm92aWRlcnMgPSBuZXcgU2V0KClcbiAgfVxuICBhZGRQcm92aWRlcihwcm92aWRlcjogTGlzdFByb3ZpZGVyKSB7XG4gICAgaWYgKCF0aGlzLmhhc1Byb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgICAgdmFsaWRhdGVQcm92aWRlcihwcm92aWRlcilcbiAgICAgIHRoaXMucHJvdmlkZXJzLmFkZChwcm92aWRlcilcbiAgICB9XG4gIH1cbiAgaGFzUHJvdmlkZXIocHJvdmlkZXI6IExpc3RQcm92aWRlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnByb3ZpZGVycy5oYXMocHJvdmlkZXIpXG4gIH1cbiAgZGVsZXRlUHJvdmlkZXIocHJvdmlkZXI6IExpc3RQcm92aWRlcikge1xuICAgIGlmICh0aGlzLmhhc1Byb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgICAgdGhpcy5wcm92aWRlcnMuZGVsZXRlKHByb3ZpZGVyKVxuICAgIH1cbiAgfVxuICBhc3luYyB0cmlnZ2VyKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPEFycmF5PExpc3RJdGVtPj4ge1xuICAgIGNvbnN0IGVkaXRvclBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gdGV4dEVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBpZiAoIWVkaXRvclBhdGgpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cblxuICAgIGNvbnN0IHNjb3BlcyA9IHRleHRFZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pLmdldFNjb3Blc0FycmF5KClcbiAgICBzY29wZXMucHVzaCgnKicpXG5cbiAgICBjb25zdCBwcm9taXNlcyA9IFtdXG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlcikge1xuICAgICAgaWYgKHNjb3Blcy5zb21lKHNjb3BlID0+IHByb3ZpZGVyLmdyYW1tYXJTY29wZXMuaW5kZXhPZihzY29wZSkgIT09IC0xKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICByZXNvbHZlKHByb3ZpZGVyLmdldEludGVudGlvbnMoeyB0ZXh0RWRpdG9yLCBidWZmZXJQb3NpdGlvbiB9KSlcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcbiAgICAgICAgICAgIHZhbGlkYXRlU3VnZ2VzdGlvbnMocmVzdWx0cylcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHNcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IG51bWJlciA9ICsrdGhpcy5udW1iZXJcbiAgICBjb25zdCByZXN1bHRzID0gKGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKSkucmVkdWNlKGZ1bmN0aW9uKGl0ZW1zLCBpdGVtKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgICAgICByZXR1cm4gaXRlbXMuY29uY2F0KGl0ZW0pXG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlbXNcbiAgICB9LCBbXSlcblxuICAgIGlmIChudW1iZXIgIT09IHRoaXMubnVtYmVyIHx8ICFyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgLy8gSWYgaGFzIGJlZW4gZXhlY3V0ZWQgb25lIG1vcmUgdGltZSwgaWdub3JlIHRoZXNlIHJlc3VsdHNcbiAgICAgIC8vIE9yIHdlIGRvbid0IGhhdmUgYW55IHJlc3VsdHNcbiAgICAgIHJldHVybiBbXVxuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzTGlzdEl0ZW1zKHJlc3VsdHMpXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnByb3ZpZGVycy5jbGVhcigpXG4gIH1cbn1cbiJdfQ==