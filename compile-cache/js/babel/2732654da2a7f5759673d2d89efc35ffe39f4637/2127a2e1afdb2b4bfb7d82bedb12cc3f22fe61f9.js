Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.provider = provider;
exports.suggestionsList = suggestionsList;
exports.suggestionsShow = suggestionsShow;
function provider(entry) {
  let message;
  if (!entry || typeof entry !== 'object') {
    message = 'Invalid provider provided';
  } else if (!Array.isArray(entry.grammarScopes)) {
    message = 'Invalid or no grammarScopes found on provider';
  } else if (typeof entry.getIntentions !== 'function') {
    message = 'Invalid or no getIntentions found on provider';
  }
  if (message) {
    console.log('[Intentions] Invalid provider', entry);
    throw new Error(message);
  }
}

function suggestionsList(suggestions) {
  if (Array.isArray(suggestions)) {
    const suggestionsLength = suggestions.length;
    for (let i = 0; i < suggestionsLength; ++i) {
      const suggestion = suggestions[i];
      let message;
      if (typeof suggestion.title !== 'string') {
        message = 'Invalid or no title found on intention';
      } else if (typeof suggestion.selected !== 'function') {
        message = 'Invalid or no selected found on intention';
      }
      if (message) {
        console.log('[Intentions] Invalid suggestion of type list', suggestion);
        throw new Error(message);
      }
    }
  }
  return suggestions;
}

function suggestionsShow(suggestions) {
  if (Array.isArray(suggestions)) {
    const suggestionsLength = suggestions.length;
    for (let i = 0; i < suggestionsLength; ++i) {
      const suggestion = suggestions[i];
      let message;
      if (typeof suggestion.range !== 'object' || !suggestion.range) {
        message = 'Invalid or no range found on intention';
      } else if (suggestion.class && typeof suggestion.class !== 'string') {
        message = 'Invalid class found on intention';
      } else if (typeof suggestion.created !== 'function') {
        message = 'Invalid or no created found on intention';
      }
      if (message) {
        console.log('[Intentions] Invalid suggestion of type show', suggestion);
        throw new Error(message);
      }
    }
  }
  return suggestions;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRlLmpzIl0sIm5hbWVzIjpbInByb3ZpZGVyIiwic3VnZ2VzdGlvbnNMaXN0Iiwic3VnZ2VzdGlvbnNTaG93IiwiZW50cnkiLCJtZXNzYWdlIiwiQXJyYXkiLCJpc0FycmF5IiwiZ3JhbW1hclNjb3BlcyIsImdldEludGVudGlvbnMiLCJjb25zb2xlIiwibG9nIiwiRXJyb3IiLCJzdWdnZXN0aW9ucyIsInN1Z2dlc3Rpb25zTGVuZ3RoIiwibGVuZ3RoIiwiaSIsInN1Z2dlc3Rpb24iLCJ0aXRsZSIsInNlbGVjdGVkIiwicmFuZ2UiLCJjbGFzcyIsImNyZWF0ZWQiXSwibWFwcGluZ3MiOiI7OztRQUlnQkEsUSxHQUFBQSxRO1FBZUFDLGUsR0FBQUEsZTtRQW9CQUMsZSxHQUFBQSxlO0FBbkNULFNBQVNGLFFBQVQsQ0FBa0JHLEtBQWxCLEVBQTJEO0FBQ2hFLE1BQUlDLE9BQUo7QUFDQSxNQUFJLENBQUNELEtBQUQsSUFBVSxPQUFPQSxLQUFQLEtBQWlCLFFBQS9CLEVBQXlDO0FBQ3ZDQyxjQUFVLDJCQUFWO0FBQ0QsR0FGRCxNQUVPLElBQUksQ0FBQ0MsTUFBTUMsT0FBTixDQUFjSCxNQUFNSSxhQUFwQixDQUFMLEVBQXlDO0FBQzlDSCxjQUFVLCtDQUFWO0FBQ0QsR0FGTSxNQUVBLElBQUksT0FBT0QsTUFBTUssYUFBYixLQUErQixVQUFuQyxFQUErQztBQUNwREosY0FBVSwrQ0FBVjtBQUNEO0FBQ0QsTUFBSUEsT0FBSixFQUFhO0FBQ1hLLFlBQVFDLEdBQVIsQ0FBWSwrQkFBWixFQUE2Q1AsS0FBN0M7QUFDQSxVQUFNLElBQUlRLEtBQUosQ0FBVVAsT0FBVixDQUFOO0FBQ0Q7QUFDRjs7QUFFTSxTQUFTSCxlQUFULENBQXlCVyxXQUF6QixFQUF3RTtBQUM3RSxNQUFJUCxNQUFNQyxPQUFOLENBQWNNLFdBQWQsQ0FBSixFQUFnQztBQUM5QixVQUFNQyxvQkFBb0JELFlBQVlFLE1BQXRDO0FBQ0EsU0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLGlCQUFwQixFQUF1QyxFQUFFRSxDQUF6QyxFQUE0QztBQUMxQyxZQUFNQyxhQUFhSixZQUFZRyxDQUFaLENBQW5CO0FBQ0EsVUFBSVgsT0FBSjtBQUNBLFVBQUksT0FBT1ksV0FBV0MsS0FBbEIsS0FBNEIsUUFBaEMsRUFBMEM7QUFDeENiLGtCQUFVLHdDQUFWO0FBQ0QsT0FGRCxNQUVPLElBQUksT0FBT1ksV0FBV0UsUUFBbEIsS0FBK0IsVUFBbkMsRUFBK0M7QUFDcERkLGtCQUFVLDJDQUFWO0FBQ0Q7QUFDRCxVQUFJQSxPQUFKLEVBQWE7QUFDWEssZ0JBQVFDLEdBQVIsQ0FBWSw4Q0FBWixFQUE0RE0sVUFBNUQ7QUFDQSxjQUFNLElBQUlMLEtBQUosQ0FBVVAsT0FBVixDQUFOO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsU0FBT1EsV0FBUDtBQUNEOztBQUVNLFNBQVNWLGVBQVQsQ0FBeUJVLFdBQXpCLEVBQWtGO0FBQ3ZGLE1BQUlQLE1BQU1DLE9BQU4sQ0FBY00sV0FBZCxDQUFKLEVBQWdDO0FBQzlCLFVBQU1DLG9CQUFvQkQsWUFBWUUsTUFBdEM7QUFDQSxTQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsaUJBQXBCLEVBQXVDLEVBQUVFLENBQXpDLEVBQTRDO0FBQzFDLFlBQU1DLGFBQWFKLFlBQVlHLENBQVosQ0FBbkI7QUFDQSxVQUFJWCxPQUFKO0FBQ0EsVUFBSSxPQUFPWSxXQUFXRyxLQUFsQixLQUE0QixRQUE1QixJQUF3QyxDQUFDSCxXQUFXRyxLQUF4RCxFQUErRDtBQUM3RGYsa0JBQVUsd0NBQVY7QUFDRCxPQUZELE1BRU8sSUFBSVksV0FBV0ksS0FBWCxJQUFvQixPQUFPSixXQUFXSSxLQUFsQixLQUE0QixRQUFwRCxFQUE4RDtBQUNuRWhCLGtCQUFVLGtDQUFWO0FBQ0QsT0FGTSxNQUVBLElBQUksT0FBT1ksV0FBV0ssT0FBbEIsS0FBOEIsVUFBbEMsRUFBOEM7QUFDbkRqQixrQkFBVSwwQ0FBVjtBQUNEO0FBQ0QsVUFBSUEsT0FBSixFQUFhO0FBQ1hLLGdCQUFRQyxHQUFSLENBQVksOENBQVosRUFBNERNLFVBQTVEO0FBQ0EsY0FBTSxJQUFJTCxLQUFKLENBQVVQLE9BQVYsQ0FBTjtBQUNEO0FBQ0Y7QUFDRjtBQUNELFNBQU9RLFdBQVA7QUFDRCIsImZpbGUiOiJ2YWxpZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB0eXBlIHsgTGlzdFByb3ZpZGVyLCBMaXN0SXRlbSwgSGlnaGxpZ2h0UHJvdmlkZXIsIEhpZ2hsaWdodEl0ZW0gfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZXIoZW50cnk6IExpc3RQcm92aWRlciB8IEhpZ2hsaWdodFByb3ZpZGVyKSB7XG4gIGxldCBtZXNzYWdlXG4gIGlmICghZW50cnkgfHwgdHlwZW9mIGVudHJ5ICE9PSAnb2JqZWN0Jykge1xuICAgIG1lc3NhZ2UgPSAnSW52YWxpZCBwcm92aWRlciBwcm92aWRlZCdcbiAgfSBlbHNlIGlmICghQXJyYXkuaXNBcnJheShlbnRyeS5ncmFtbWFyU2NvcGVzKSkge1xuICAgIG1lc3NhZ2UgPSAnSW52YWxpZCBvciBubyBncmFtbWFyU2NvcGVzIGZvdW5kIG9uIHByb3ZpZGVyJ1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlbnRyeS5nZXRJbnRlbnRpb25zICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgbWVzc2FnZSA9ICdJbnZhbGlkIG9yIG5vIGdldEludGVudGlvbnMgZm91bmQgb24gcHJvdmlkZXInXG4gIH1cbiAgaWYgKG1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmxvZygnW0ludGVudGlvbnNdIEludmFsaWQgcHJvdmlkZXInLCBlbnRyeSlcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGlvbnNMaXN0KHN1Z2dlc3Rpb25zOiBBcnJheTxMaXN0SXRlbT4pOiBBcnJheTxMaXN0SXRlbT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheShzdWdnZXN0aW9ucykpIHtcbiAgICBjb25zdCBzdWdnZXN0aW9uc0xlbmd0aCA9IHN1Z2dlc3Rpb25zLmxlbmd0aFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VnZ2VzdGlvbnNMZW5ndGg7ICsraSkge1xuICAgICAgY29uc3Qgc3VnZ2VzdGlvbiA9IHN1Z2dlc3Rpb25zW2ldXG4gICAgICBsZXQgbWVzc2FnZVxuICAgICAgaWYgKHR5cGVvZiBzdWdnZXN0aW9uLnRpdGxlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBtZXNzYWdlID0gJ0ludmFsaWQgb3Igbm8gdGl0bGUgZm91bmQgb24gaW50ZW50aW9uJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VnZ2VzdGlvbi5zZWxlY3RlZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtZXNzYWdlID0gJ0ludmFsaWQgb3Igbm8gc2VsZWN0ZWQgZm91bmQgb24gaW50ZW50aW9uJ1xuICAgICAgfVxuICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tJbnRlbnRpb25zXSBJbnZhbGlkIHN1Z2dlc3Rpb24gb2YgdHlwZSBsaXN0Jywgc3VnZ2VzdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzdWdnZXN0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGlvbnNTaG93KHN1Z2dlc3Rpb25zOiBBcnJheTxIaWdobGlnaHRJdGVtPik6IEFycmF5PEhpZ2hsaWdodEl0ZW0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3VnZ2VzdGlvbnMpKSB7XG4gICAgY29uc3Qgc3VnZ2VzdGlvbnNMZW5ndGggPSBzdWdnZXN0aW9ucy5sZW5ndGhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1Z2dlc3Rpb25zTGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBzdWdnZXN0aW9uc1tpXVxuICAgICAgbGV0IG1lc3NhZ2VcbiAgICAgIGlmICh0eXBlb2Ygc3VnZ2VzdGlvbi5yYW5nZSAhPT0gJ29iamVjdCcgfHwgIXN1Z2dlc3Rpb24ucmFuZ2UpIHtcbiAgICAgICAgbWVzc2FnZSA9ICdJbnZhbGlkIG9yIG5vIHJhbmdlIGZvdW5kIG9uIGludGVudGlvbidcbiAgICAgIH0gZWxzZSBpZiAoc3VnZ2VzdGlvbi5jbGFzcyAmJiB0eXBlb2Ygc3VnZ2VzdGlvbi5jbGFzcyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgbWVzc2FnZSA9ICdJbnZhbGlkIGNsYXNzIGZvdW5kIG9uIGludGVudGlvbidcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Z2dlc3Rpb24uY3JlYXRlZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtZXNzYWdlID0gJ0ludmFsaWQgb3Igbm8gY3JlYXRlZCBmb3VuZCBvbiBpbnRlbnRpb24nXG4gICAgICB9XG4gICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnW0ludGVudGlvbnNdIEludmFsaWQgc3VnZ2VzdGlvbiBvZiB0eXBlIHNob3cnLCBzdWdnZXN0aW9uKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1Z2dlc3Rpb25zXG59XG4iXX0=