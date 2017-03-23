Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _validate = require('./validate');

var _highlight = require('./elements/highlight');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let ProvidersHighlight = class ProvidersHighlight {

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

      const visibleRange = _atom.Range.fromObject([textEditor.bufferPositionForScreenPosition([textEditor.getFirstVisibleScreenRow(), 0]), textEditor.bufferPositionForScreenPosition([textEditor.getLastVisibleScreenRow(), 0])]);
      // Setting this to infinity on purpose, cause the buffer position just marks visible column
      // according to element width
      visibleRange.end.column = Infinity;

      const promises = [];
      _this.providers.forEach(function (provider) {
        if (scopes.some(scope => provider.grammarScopes.indexOf(scope) !== -1)) {
          promises.push(new Promise(function (resolve) {
            resolve(provider.getIntentions({ textEditor, visibleRange }));
          }).then(function (results) {
            if (atom.inDevMode()) {
              (0, _validate.suggestionsShow)(results);
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
        // Or we just don't have any results
        return [];
      }

      return results;
    })();
  }
  paint(textEditor, intentions) {
    const markers = [];
    for (const intention of intentions) {
      const matchedText = textEditor.getTextInBufferRange(intention.range);
      const marker = textEditor.markBufferRange(intention.range);
      const element = (0, _highlight.create)(intention, matchedText.length);
      intention.created({ textEditor, element, marker, matchedText });
      textEditor.decorateMarker(marker, {
        type: 'overlay',
        position: 'tail',
        item: element
      });
      marker.onDidChange(function ({ newHeadBufferPosition: start, oldTailBufferPosition: end }) {
        element.textContent = _highlight.PADDING_CHARACTER.repeat(textEditor.getTextInBufferRange([start, end]).length);
      });
      markers.push(marker);
    }
    return new _atom.Disposable(function () {
      markers.forEach(function (marker) {
        try {
          marker.destroy();
        } catch (_) {/* No Op */}
      });
    });
  }
  dispose() {
    this.providers.clear();
  }
};
exports.default = ProvidersHighlight;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3ZpZGVycy1oaWdobGlnaHQuanMiXSwibmFtZXMiOlsiUHJvdmlkZXJzSGlnaGxpZ2h0IiwiY29uc3RydWN0b3IiLCJudW1iZXIiLCJwcm92aWRlcnMiLCJTZXQiLCJhZGRQcm92aWRlciIsInByb3ZpZGVyIiwiaGFzUHJvdmlkZXIiLCJhZGQiLCJoYXMiLCJkZWxldGVQcm92aWRlciIsImRlbGV0ZSIsInRyaWdnZXIiLCJ0ZXh0RWRpdG9yIiwiZWRpdG9yUGF0aCIsImdldFBhdGgiLCJidWZmZXJQb3NpdGlvbiIsImdldEN1cnNvckJ1ZmZlclBvc2l0aW9uIiwic2NvcGVzIiwic2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24iLCJnZXRTY29wZXNBcnJheSIsInB1c2giLCJ2aXNpYmxlUmFuZ2UiLCJmcm9tT2JqZWN0IiwiYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbiIsImdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyIsImdldExhc3RWaXNpYmxlU2NyZWVuUm93IiwiZW5kIiwiY29sdW1uIiwiSW5maW5pdHkiLCJwcm9taXNlcyIsImZvckVhY2giLCJzb21lIiwic2NvcGUiLCJncmFtbWFyU2NvcGVzIiwiaW5kZXhPZiIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0SW50ZW50aW9ucyIsInRoZW4iLCJyZXN1bHRzIiwiYXRvbSIsImluRGV2TW9kZSIsImFsbCIsInJlZHVjZSIsIml0ZW1zIiwiaXRlbSIsIkFycmF5IiwiaXNBcnJheSIsImNvbmNhdCIsImxlbmd0aCIsInBhaW50IiwiaW50ZW50aW9ucyIsIm1hcmtlcnMiLCJpbnRlbnRpb24iLCJtYXRjaGVkVGV4dCIsImdldFRleHRJbkJ1ZmZlclJhbmdlIiwicmFuZ2UiLCJtYXJrZXIiLCJtYXJrQnVmZmVyUmFuZ2UiLCJlbGVtZW50IiwiY3JlYXRlZCIsImRlY29yYXRlTWFya2VyIiwidHlwZSIsInBvc2l0aW9uIiwib25EaWRDaGFuZ2UiLCJuZXdIZWFkQnVmZmVyUG9zaXRpb24iLCJzdGFydCIsIm9sZFRhaWxCdWZmZXJQb3NpdGlvbiIsInRleHRDb250ZW50IiwicmVwZWF0IiwiZGVzdHJveSIsIl8iLCJkaXNwb3NlIiwiY2xlYXIiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBRUE7O0FBQ0E7Ozs7SUFHcUJBLGtCLEdBQU4sTUFBTUEsa0JBQU4sQ0FBeUI7O0FBSXRDQyxnQkFBYztBQUNaLFNBQUtDLE1BQUwsR0FBYyxDQUFkO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixJQUFJQyxHQUFKLEVBQWpCO0FBQ0Q7QUFDREMsY0FBWUMsUUFBWixFQUF5QztBQUN2QyxRQUFJLENBQUMsS0FBS0MsV0FBTCxDQUFpQkQsUUFBakIsQ0FBTCxFQUFpQztBQUMvQiw4QkFBaUJBLFFBQWpCO0FBQ0EsV0FBS0gsU0FBTCxDQUFlSyxHQUFmLENBQW1CRixRQUFuQjtBQUNEO0FBQ0Y7QUFDREMsY0FBWUQsUUFBWixFQUFrRDtBQUNoRCxXQUFPLEtBQUtILFNBQUwsQ0FBZU0sR0FBZixDQUFtQkgsUUFBbkIsQ0FBUDtBQUNEO0FBQ0RJLGlCQUFlSixRQUFmLEVBQTRDO0FBQzFDLFFBQUksS0FBS0MsV0FBTCxDQUFpQkQsUUFBakIsQ0FBSixFQUFnQztBQUM5QixXQUFLSCxTQUFMLENBQWVRLE1BQWYsQ0FBc0JMLFFBQXRCO0FBQ0Q7QUFDRjtBQUNLTSxTQUFOLENBQWNDLFVBQWQsRUFBcUU7QUFBQTs7QUFBQTtBQUNuRSxZQUFNQyxhQUFhRCxXQUFXRSxPQUFYLEVBQW5CO0FBQ0EsWUFBTUMsaUJBQWlCSCxXQUFXSSx1QkFBWCxFQUF2Qjs7QUFFQSxVQUFJLENBQUNILFVBQUwsRUFBaUI7QUFDZixlQUFPLEVBQVA7QUFDRDs7QUFFRCxZQUFNSSxTQUFTTCxXQUFXTSxnQ0FBWCxDQUE0Q0gsY0FBNUMsRUFBNERJLGNBQTVELEVBQWY7QUFDQUYsYUFBT0csSUFBUCxDQUFZLEdBQVo7O0FBRUEsWUFBTUMsZUFBZSxZQUFNQyxVQUFOLENBQWlCLENBQ3BDVixXQUFXVywrQkFBWCxDQUEyQyxDQUFD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QUFPYSxPQUFQO0FBQ0QsU0FGRCxDQUVFLE9BQU9DLENBQVAsRUFBVSxDQUFFLFdBQWE7QUFDNUIsT0FKRDtBQUtELEtBTk0sQ0FBUDtBQU9EO0FBQ0RDLFlBQVU7QUFDUixTQUFLdEUsU0FBTCxDQUFldUUsS0FBZjtBQUNEO0FBbEdxQyxDO2tCQUFuQjFFLGtCIiwiZmlsZSI6InByb3ZpZGVycy1oaWdobGlnaHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBSYW5nZSwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgcHJvdmlkZXIgYXMgdmFsaWRhdGVQcm92aWRlciwgc3VnZ2VzdGlvbnNTaG93IGFzIHZhbGlkYXRlU3VnZ2VzdGlvbnMgfSBmcm9tICcuL3ZhbGlkYXRlJ1xuaW1wb3J0IHsgY3JlYXRlIGFzIGNyZWF0ZUVsZW1lbnQsIFBBRERJTkdfQ0hBUkFDVEVSIH0gZnJvbSAnLi9lbGVtZW50cy9oaWdobGlnaHQnXG5pbXBvcnQgdHlwZSB7IEhpZ2hsaWdodFByb3ZpZGVyLCBIaWdobGlnaHRJdGVtIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdmlkZXJzSGlnaGxpZ2h0IHtcbiAgbnVtYmVyOiBudW1iZXI7XG4gIHByb3ZpZGVyczogU2V0PEhpZ2hsaWdodFByb3ZpZGVyPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm51bWJlciA9IDBcbiAgICB0aGlzLnByb3ZpZGVycyA9IG5ldyBTZXQoKVxuICB9XG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcikge1xuICAgIGlmICghdGhpcy5oYXNQcm92aWRlcihwcm92aWRlcikpIHtcbiAgICAgIHZhbGlkYXRlUHJvdmlkZXIocHJvdmlkZXIpXG4gICAgICB0aGlzLnByb3ZpZGVycy5hZGQocHJvdmlkZXIpXG4gICAgfVxuICB9XG4gIGhhc1Byb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnByb3ZpZGVycy5oYXMocHJvdmlkZXIpXG4gIH1cbiAgZGVsZXRlUHJvdmlkZXIocHJvdmlkZXI6IEhpZ2hsaWdodFByb3ZpZGVyKSB7XG4gICAgaWYgKHRoaXMuaGFzUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICB0aGlzLnByb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpXG4gICAgfVxuICB9XG4gIGFzeW5jIHRyaWdnZXIodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8QXJyYXk8SGlnaGxpZ2h0SXRlbT4+IHtcbiAgICBjb25zdCBlZGl0b3JQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBjb25zdCBidWZmZXJQb3NpdGlvbiA9IHRleHRFZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgKCFlZGl0b3JQYXRoKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG5cbiAgICBjb25zdCBzY29wZXMgPSB0ZXh0RWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpXG4gICAgc2NvcGVzLnB1c2goJyonKVxuXG4gICAgY29uc3QgdmlzaWJsZVJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChbXG4gICAgICB0ZXh0RWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3RleHRFZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCksIDBdKSxcbiAgICAgIHRleHRFZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbdGV4dEVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCAwXSksXG4gICAgXSlcbiAgICAvLyBTZXR0aW5nIHRoaXMgdG8gaW5maW5pdHkgb24gcHVycG9zZSwgY2F1c2UgdGhlIGJ1ZmZlciBwb3NpdGlvbiBqdXN0IG1hcmtzIHZpc2libGUgY29sdW1uXG4gICAgLy8gYWNjb3JkaW5nIHRvIGVsZW1lbnQgd2lkdGhcbiAgICB2aXNpYmxlUmFuZ2UuZW5kLmNvbHVtbiA9IEluZmluaXR5XG5cbiAgICBjb25zdCBwcm9taXNlcyA9IFtdXG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlcikge1xuICAgICAgaWYgKHNjb3Blcy5zb21lKHNjb3BlID0+IHByb3ZpZGVyLmdyYW1tYXJTY29wZXMuaW5kZXhPZihzY29wZSkgIT09IC0xKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICByZXNvbHZlKHByb3ZpZGVyLmdldEludGVudGlvbnMoeyB0ZXh0RWRpdG9yLCB2aXNpYmxlUmFuZ2UgfSkpXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIGlmIChhdG9tLmluRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZVN1Z2dlc3Rpb25zKHJlc3VsdHMpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCBudW1iZXIgPSArK3RoaXMubnVtYmVyXG4gICAgY29uc3QgcmVzdWx0cyA9IChhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcykpLnJlZHVjZShmdW5jdGlvbihpdGVtcywgaXRlbSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLmNvbmNhdChpdGVtKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZW1zXG4gICAgfSwgW10pXG5cbiAgICBpZiAobnVtYmVyICE9PSB0aGlzLm51bWJlciB8fCAhcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGhhcyBiZWVuIGV4ZWN1dGVkIG9uZSBtb3JlIHRpbWUsIGlnbm9yZSB0aGVzZSByZXN1bHRzXG4gICAgICAvLyBPciB3ZSBqdXN0IGRvbid0IGhhdmUgYW55IHJlc3VsdHNcbiAgICAgIHJldHVybiBbXVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cbiAgcGFpbnQodGV4dEVkaXRvcjogVGV4dEVkaXRvciwgaW50ZW50aW9uczogQXJyYXk8SGlnaGxpZ2h0SXRlbT4pOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBtYXJrZXJzID0gW11cbiAgICBmb3IgKGNvbnN0IGludGVudGlvbiBvZiAoaW50ZW50aW9uczogQXJyYXk8SGlnaGxpZ2h0SXRlbT4pKSB7XG4gICAgICBjb25zdCBtYXRjaGVkVGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoaW50ZW50aW9uLnJhbmdlKVxuICAgICAgY29uc3QgbWFya2VyID0gdGV4dEVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoaW50ZW50aW9uLnJhbmdlKVxuICAgICAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQoaW50ZW50aW9uLCBtYXRjaGVkVGV4dC5sZW5ndGgpXG4gICAgICBpbnRlbnRpb24uY3JlYXRlZCh7IHRleHRFZGl0b3IsIGVsZW1lbnQsIG1hcmtlciwgbWF0Y2hlZFRleHQgfSlcbiAgICAgIHRleHRFZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgcG9zaXRpb246ICd0YWlsJyxcbiAgICAgICAgaXRlbTogZWxlbWVudCxcbiAgICAgIH0pXG4gICAgICBtYXJrZXIub25EaWRDaGFuZ2UoZnVuY3Rpb24oeyBuZXdIZWFkQnVmZmVyUG9zaXRpb246IHN0YXJ0LCBvbGRUYWlsQnVmZmVyUG9zaXRpb246IGVuZCB9KSB7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBQQURESU5HX0NIQVJBQ1RFUi5yZXBlYXQodGV4dEVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbc3RhcnQsIGVuZF0pLmxlbmd0aClcbiAgICAgIH0pXG4gICAgICBtYXJrZXJzLnB1c2gobWFya2VyKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICBtYXJrZXJzLmZvckVhY2goZnVuY3Rpb24obWFya2VyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgICB9IGNhdGNoIChfKSB7IC8qIE5vIE9wICovIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMucHJvdmlkZXJzLmNsZWFyKClcbiAgfVxufVxuIl19