(function() {
  var PathsProvider, Range, fs, fuzzaldrin, path,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Range = require('atom').Range;

  fuzzaldrin = require('fuzzaldrin');

  path = require('path');

  fs = require('fs');

  module.exports = PathsProvider = (function() {
    function PathsProvider() {
      this.dispose = __bind(this.dispose, this);
      this.prefixForCursor = __bind(this.prefixForCursor, this);
      this.requestHandler = __bind(this.requestHandler, this);
    }

    PathsProvider.prototype.id = 'autocomplete-paths-pathsprovider';

    PathsProvider.prototype.selector = '*';

    PathsProvider.prototype.wordRegex = /[a-zA-Z0-9\.\/_-]*\/[a-zA-Z0-9\.\/_-]*/g;

    PathsProvider.prototype.cache = [];

    PathsProvider.prototype.requestHandler = function(options) {
      var basePath, editorPath, prefix, suggestions, _ref;
      if (options == null) {
        options = {};
      }
      if (!((options.editor != null) && (options.buffer != null) && (options.cursor != null))) {
        return [];
      }
      editorPath = (_ref = options.editor) != null ? _ref.getPath() : void 0;
      if (!(editorPath != null ? editorPath.length : void 0)) {
        return [];
      }
      basePath = path.dirname(editorPath);
      if (basePath == null) {
        return [];
      }
      prefix = this.prefixForCursor(options.editor, options.buffer, options.cursor, options.position);
      if (!prefix.length) {
        return [];
      }
      suggestions = this.findSuggestionsForPrefix(options.editor, basePath, prefix);
      if (!suggestions.length) {
        return [];
      }
      return suggestions;
    };

    PathsProvider.prototype.prefixForCursor = function(editor, buffer, cursor, position) {
      var end, start;
      if (!((buffer != null) && (cursor != null))) {
        return '';
      }
      start = this.getBeginningOfCurrentWordBufferPosition(editor, position, {
        wordRegex: this.wordRegex
      });
      end = cursor.getBufferPosition();
      if (!((start != null) && (end != null))) {
        return '';
      }
      return buffer.getTextInRange(new Range(start, end));
    };

    PathsProvider.prototype.getBeginningOfCurrentWordBufferPosition = function(editor, position, options) {
      var allowPrevious, beginningOfWordPosition, currentBufferPosition, scanRange, _ref;
      if (options == null) {
        options = {};
      }
      if (position == null) {
        return;
      }
      allowPrevious = (_ref = options.allowPrevious) != null ? _ref : true;
      currentBufferPosition = position;
      scanRange = [[currentBufferPosition.row, 0], currentBufferPosition];
      beginningOfWordPosition = null;
      editor.backwardsScanInBufferRange(options.wordRegex, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.end.isGreaterThanOrEqual(currentBufferPosition) || allowPrevious) {
          beginningOfWordPosition = range.start;
        }
        if (!(beginningOfWordPosition != null ? beginningOfWordPosition.isEqual(currentBufferPosition) : void 0)) {
          return stop();
        }
      });
      if (beginningOfWordPosition != null) {
        return beginningOfWordPosition;
      } else if (allowPrevious) {
        return [currentBufferPosition.row, 0];
      } else {
        return currentBufferPosition;
      }
    };

    PathsProvider.prototype.findSuggestionsForPrefix = function(editor, basePath, prefix) {
      var directory, e, files, label, prefixPath, result, resultPath, results, stat, suggestion, suggestions;
      if (basePath == null) {
        return [];
      }
      prefixPath = path.resolve(basePath, prefix);
      if (prefix.endsWith('/')) {
        directory = prefixPath;
        prefix = '';
      } else {
        if (basePath === prefixPath) {
          directory = prefixPath;
        } else {
          directory = path.dirname(prefixPath);
        }
        prefix = path.basename(prefix);
      }
      try {
        stat = fs.statSync(directory);
        if (!stat.isDirectory()) {
          return [];
        }
      } catch (_error) {
        e = _error;
        return [];
      }
      try {
        files = fs.readdirSync(directory);
      } catch (_error) {
        e = _error;
        return [];
      }
      results = fuzzaldrin.filter(files, prefix);
      suggestions = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          resultPath = path.resolve(directory, result);
          try {
            stat = fs.statSync(resultPath);
          } catch (_error) {
            e = _error;
            continue;
          }
          if (stat.isDirectory()) {
            label = 'Dir';
            result += path.sep;
          } else if (stat.isFile()) {
            label = 'File';
          } else {
            continue;
          }
          suggestion = {
            word: result,
            prefix: prefix,
            label: label,
            data: {
              body: result
            }
          };
          if (suggestion.label !== 'File') {
            suggestion.onDidConfirm = function() {
              return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate');
            };
          }
          _results.push(suggestion);
        }
        return _results;
      })();
      return suggestions;
    };

    PathsProvider.prototype.dispose = function() {
      this.editor = null;
      return this.basePath = null;
    };

    return PathsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL3BhdGhzLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQ0FBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUMsUUFBVSxPQUFBLENBQVEsTUFBUixFQUFWLEtBQUQsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQURiLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7O0tBQ0o7O0FBQUEsNEJBQUEsRUFBQSxHQUFJLGtDQUFKLENBQUE7O0FBQUEsNEJBQ0EsUUFBQSxHQUFVLEdBRFYsQ0FBQTs7QUFBQSw0QkFFQSxTQUFBLEdBQVcseUNBRlgsQ0FBQTs7QUFBQSw0QkFHQSxLQUFBLEdBQU8sRUFIUCxDQUFBOztBQUFBLDRCQUtBLGNBQUEsR0FBZ0IsU0FBQyxPQUFELEdBQUE7QUFDZCxVQUFBLCtDQUFBOztRQURlLFVBQVU7T0FDekI7QUFBQSxNQUFBLElBQUEsQ0FBQSxDQUFpQix3QkFBQSxJQUFvQix3QkFBcEIsSUFBd0Msd0JBQXpELENBQUE7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQUFBO0FBQUEsTUFDQSxVQUFBLHlDQUEyQixDQUFFLE9BQWhCLENBQUEsVUFEYixDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsc0JBQWlCLFVBQVUsQ0FBRSxnQkFBN0I7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQUZBO0FBQUEsTUFHQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBSFgs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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-paths/lib/paths-provider.coffee
