(function() {
  var formatter, minify, prettify, stringify, uglify;

  stringify = require("json-stable-stringify");

  uglify = require("jsonminify");

  formatter = {};

  prettify = function(editor, sorted) {
    var text, wholeFile;
    wholeFile = editor.getGrammar().name === 'JSON';
    if (wholeFile) {
      text = editor.getText();
      return editor.setText(formatter.pretty(text, sorted));
    } else {
      return text = editor.replaceSelectedText({}, function(text) {
        return formatter.pretty(text, sorted);
      });
    }
  };

  minify = function(editor, sorted) {
    var text, wholeFile;
    wholeFile = editor.getGrammar().name === 'JSON';
    if (wholeFile) {
      text = editor.getText();
      return editor.setText(formatter.minify(text));
    } else {
      return text = editor.replaceSelectedText({}, function(text) {
        return formatter.minify(text);
      });
    }
  };

  formatter.pretty = function(text, sorted) {
    var editorSettings, error, parsed, space;
    editorSettings = atom.config.get('editor');
    if (editorSettings.softTabs != null) {
      space = Array(editorSettings.tabLength + 1).join(" ");
    } else {
      space = "\t";
    }
    try {
      parsed = JSON.parse(text);
      if (sorted) {
        return stringify(parsed, {
          space: space
        });
      } else {
        return JSON.stringify(parsed, null, space);
      }
    } catch (_error) {
      error = _error;
      return text;
    }
  };

  formatter.minify = function(text) {
    var error;
    try {
      JSON.parse(text);
      return uglify(text);
    } catch (_error) {
      error = _error;
      return text;
    }
  };

  module.exports = {
    activate: function() {
      return atom.commands.add('atom-workspace', {
        'pretty-json:prettify': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return prettify(editor);
        },
        'pretty-json:sort-and-prettify': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return prettify(editor, true);
        },
        'pretty-json:minify': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return minify(editor, true);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9wcmV0dHktanNvbi9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOENBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLHVCQUFSLENBQVosQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsWUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksRUFGWixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNULFFBQUEsZUFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxJQUFwQixLQUE0QixNQUF4QyxDQUFBO0FBRUEsSUFBQSxJQUFHLFNBQUg7QUFDRSxNQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBQTthQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsSUFBakIsRUFBdUIsTUFBdkIsQ0FBZixFQUZGO0tBQUEsTUFBQTthQUlFLElBQUEsR0FBTyxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsRUFBM0IsRUFBK0IsU0FBQyxJQUFELEdBQUE7ZUFDcEMsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsSUFBakIsRUFBdUIsTUFBdkIsRUFEb0M7TUFBQSxDQUEvQixFQUpUO0tBSFM7RUFBQSxDQUpYLENBQUE7O0FBQUEsRUFlQSxNQUFBLEdBQVMsU0FBQyxNQUFELEVBQVMsTUFBVCxHQUFBO0FBQ1AsUUFBQSxlQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLElBQXBCLEtBQTRCLE1BQXhDLENBQUE7QUFFQSxJQUFBLElB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

//# sourceURL=/Users/igawataiichi/.atom/packages/pretty-json/index.coffee
