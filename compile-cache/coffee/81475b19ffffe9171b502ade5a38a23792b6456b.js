(function() {
  var Core, path,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Core = require('./core.coffee');

  path = require('path');

  module.exports = new ((function() {
    function _Class() {
      this.lint = __bind(this.lint, this);
    }

    _Class.prototype.name = 'CoffeeLint';

    _Class.prototype.grammarScopes = Core.scopes;

    _Class.prototype.scope = "file";

    _Class.prototype.lintOnFly = true;

    _Class.prototype.lint = function(TextEditor) {
      var TextBuffer, filePath, scopeName, source, transform;
      TextBuffer = TextEditor.getBuffer();
      filePath = TextEditor.getPath();
      if (filePath) {
        source = TextEditor.getText();
        scopeName = TextEditor.getGrammar().scopeName;
        transform = function(_arg) {
          var column, context, endCol, indentLevel, level, lineNumber, message, range, rule, startCol;
          level = _arg.level, message = _arg.message, rule = _arg.rule, lineNumber = _arg.lineNumber, context = _arg.context, column = _arg.column;
          if (context) {
            message = "" + message + ". " + context;
          }
          message = "" + message + ". (" + rule + ")";
          indentLevel = TextEditor.indentationForBufferRow(lineNumber - 1);
          startCol = TextEditor.getTabLength() * indentLevel;
          endCol = TextBuffer.lineLengthForRow(lineNumber - 1);
          range = [[lineNumber - 1, startCol], [lineNumber - 1, endCol]];
          return {
            type: level === 'error' ? 'Error' : 'Warning',
            text: message,
            filePath: filePath,
            range: range
          };
        };
        return Core.lint(filePath, source, scopeName).map(transform);
      }
    };

    return _Class;

  })());

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItY29mZmVlbGludC9saWIvcGx1cy1saW50ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFVBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsR0FBQSxDQUFBOzs7S0FFZjs7QUFBQSxxQkFBQSxJQUFBLEdBQU0sWUFBTixDQUFBOztBQUFBLHFCQUNBLGFBQUEsR0FBZSxJQUFJLENBQUMsTUFEcEIsQ0FBQTs7QUFBQSxxQkFFQSxLQUFBLEdBQU8sTUFGUCxDQUFBOztBQUFBLHFCQUdBLFNBQUEsR0FBVyxJQUhYLENBQUE7O0FBQUEscUJBT0EsSUFBQSxHQUFNLFNBQUMsVUFBRCxHQUFBO0FBQ0osVUFBQSxrREFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBYixDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQVcsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUZYLENBQUE7QUFHQSxNQUFBLElBQUcsUUFBSDtBQUNFLFFBQUEsTUFBQSxHQUFTLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBVCxDQUFBO0FBQUEsUUFFQSxTQUFBLEdBQVksVUFBVSxDQUFDLFVBQVgsQ0FBQSxDQUF1QixDQUFDLFNBRnBDLENBQUE7QUFBQSxRQUtBLFNBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNWLGNBQUEsdUZBQUE7QUFBQSxVQURZLGFBQUEsT0FBTyxlQUFBLFNBQVMsWUFBQSxNQUFNLGtCQUFBLFlBQVksZUFBQSxTQUFTLGNBQUEsTUFDdkQsQ0FBQTtBQUFBLFVBQUEsSUFBc0MsT0FBdEM7QUFBQSxZQUFBLE9BQUEsR0FBVSxFQUFBLEdBQUcsT0FBSCxHQUFXLElBQVgsR0FBZSxPQUF6QixDQUFBO1dBQUE7QUFBQSxVQUNBLE9BQUEsR0FBVSxFQUFBLEdBQUcsT0FBSCxHQUFXLEtBQVgsR0FBZ0IsSUFBaEIsR0FBcUIsR0FEL0IsQ0FBQTtBQUFBLFVBS0EsV0FBQSxHQUFjLFVBQVUsQ0FBQyx1QkFBWCxDQUFtQyxVQUFBLEdBQWEsQ0FBaEQsQ0FMZCxDQUFBO0FBQUEsVUFPQSxRQUFBLEdBQVksVUFBVSxDQUFDLFlBQVgsQ0FBQSxDQUFBLEdBQTRCLFdBUHhDLENBQUE7QUFBQSxVQVFBLE1BQUEsR0FBUyxVQUFVLENBQUMsZ0JBQVgsQ0FBNEIsVUFBQSxHQUFhLENBQXpDLENBUlQsQ0FBQTtBQUFBLFVBVUEsS0FBQSxHQUFRLENBQUMsQ0FBQyxVQUFBLEdBQWEsQ0FBZCxFQUFpQixRQUFqQixDQUFELEVBQTZCLENBQUMsVUFBQSxHQUFhLENBQWQsRUFBaUIsTUFBakIsQ0FBN0IsQ0FWUixDQUFBO0FBWUEsaUJBQU87QUFBQSxZQUNMLElBQUEsRUFBUyxLQUFBLEtBQVMsT0FBWixHQUF5QixPQUF6QixHQUFzQyxTQUR2QztBQUFBLFlBRUwsSUFBQSxFQUFNLE9BRkQ7QUFBQSxZQUdMLFFBQUEsRUFBVSxRQUhMO0FBQUEsWUFJTCxLQUFBLEVBQU8sS0FKRjtXQUFQLENBYlU7UUFBQSxDQUxaLENBQUE7QUF5QkEsZUFBTyxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsTUFBcEIsRUFBNEIsU0FBNUIsQ0FBc0MsQ0FBQyxHQUF2QyxDQUEyQyxTQUEzQyxDQUFQLENBMUJGO09BSkk7SUFBQSxDQVBOLENBQUE7O2tCQUFBOztPQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/linter-coffeelint/lib/plus-linter.coffee
