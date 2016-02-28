(function() {
  var CompositeDisposable, ConfigSchema, isOpeningTagLikePattern,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  isOpeningTagLikePattern = /<(?![\!\/])([a-z]{1}[^>\s=\'\"]*)[^>]*>$/i;

  ConfigSchema = require('./configuration.coffee');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: ConfigSchema.config,
    neverClose: [],
    forceInline: [],
    forceBlock: [],
    makeNeverCloseSelfClosing: false,
    ignoreGrammar: false,
    activate: function() {
      atom.commands.add('atom-text-editor', {
        'autoclose-html:close-and-complete': (function(_this) {
          return function(e) {
            atom.workspace.getActiveTextEditor().insertText(">");
            return _this.execAutoclose();
          };
        })(this)
      });
      atom.config.observe('autoclose-html.neverClose', (function(_this) {
        return function(value) {
          return _this.neverClose = value;
        };
      })(this));
      atom.config.observe('autoclose-html.forceInline', (function(_this) {
        return function(value) {
          return _this.forceInline = value;
        };
      })(this));
      atom.config.observe('autoclose-html.forceBlock', (function(_this) {
        return function(value) {
          return _this.forceBlock = value;
        };
      })(this));
      return atom.config.observe('autoclose-html.makeNeverCloseSelfClosing', (function(_this) {
        return function(value) {
          return _this.makeNeverCloseSelfClosing = value;
        };
      })(this));
    },
    deactivate: function() {},
    isInline: function(eleTag) {
      var ele, ret, _ref, _ref1, _ref2;
      if (this.forceInline.indexOf("*") > -1) {
        return true;
      }
      try {
        ele = document.createElement(eleTag);
      } catch (_error) {
        return false;
      }
      if (_ref = eleTag.toLowerCase(), __indexOf.call(this.forceBlock, _ref) >= 0) {
        return false;
      } else if (_ref1 = eleTag.toLowerCase(), __indexOf.call(this.forceInline, _ref1) >= 0) {
        return true;
      }
      document.body.appendChild(ele);
      ret = (_ref2 = window.getComputedStyle(ele).getPropertyValue('display')) === 'inline' || _ref2 === 'inline-block' || _ref2 === 'none';
      document.body.removeChild(ele);
      return ret;
    },
    isNeverClosed: function(eleTag) {
      var _ref;
      return _ref = eleTag.toLowerCase(), __indexOf.call(this.neverClose, _ref) >= 0;
    },
    execAutoclose: function() {
      var doubleQuotes, editor, eleTag, index, isInline, line, matches, oddDoubleQuotes, oddSingleQuotes, partial, range, singleQuotes, tag;
      editor = atom.workspace.getActiveTextEditor();
      range = editor.selections[0].getBufferRange();
      line = editor.buffer.getLines()[range.end.row];
      partial = line.substr(0, range.start.column);
      partial = partial.substr(partial.lastIndexOf('<'));
      if (partial.substr(partial.length - 1, 1) === '/') {
        return;
      }
      singleQuotes = partial.match(/\'/g);
      doubleQuotes = partial.match(/\"/g);
      oddSingleQuotes = singleQuotes && (singleQuotes.length % 2);
      oddDoubleQuotes = doubleQuotes && (doubleQuotes.length % 2);
      if (oddSingleQuotes || oddDoubleQuotes) {
        return;
      }
      index = -1;
      while ((index = partial.indexOf('"')) !== -1) {
        partial = partial.slice(0, index) + partial.slice(partial.indexOf('"', index + 1) + 1);
      }
      while ((index = partial.indexOf("'")) !== -1) {
        partial = partial.slice(0, index) + partial.slice(partial.indexOf("'", index + 1) + 1);
      }
      if ((matches = partial.match(isOpeningTagLikePattern)) == null) {
        return;
      }
      eleTag = matches[matches.length - 1];
      if (this.isNeverClosed(eleTag)) {
        if (this.makeNeverCloseSelfClosing) {
          tag = '/>';
          if (partial.substr(partial.length - 1, 1 !== ' ')) {
            tag = ' ' + tag;
          }
          editor.backspace();
          editor.insertText(tag);
        }
        return;
      }
      isInline = this.isInline(eleTag);
      if (!isInline) {
        editor.insertNewline();
        editor.insertNewline();
      }
      editor.insertText('</' + eleTag + '>');
      if (isInline) {
        return editor.setCursorBufferPosition(range.end);
      } else {
        editor.autoIndentBufferRow(range.end.row + 1);
        return editor.setCursorBufferPosition([range.end.row + 1, atom.workspace.getActivePaneItem().getTabText().length * atom.workspace.getActivePaneItem().indentationForBufferRow(range.end.row + 1)]);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY2xvc2UtaHRtbC9saWIvYXV0b2Nsb3NlLWh0bWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSx1QkFBQSxHQUEwQiwyQ0FBMUIsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEsd0JBQVIsQ0FGZixDQUFBOztBQUFBLEVBR0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUhELENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNJO0FBQUEsSUFBQSxNQUFBLEVBQVEsWUFBWSxDQUFDLE1BQXJCO0FBQUEsSUFFQSxVQUFBLEVBQVcsRUFGWDtBQUFBLElBR0EsV0FBQSxFQUFhLEVBSGI7QUFBQSxJQUlBLFVBQUEsRUFBWSxFQUpaO0FBQUEsSUFLQSx5QkFBQSxFQUEyQixLQUwzQjtBQUFBLElBTUEsYUFBQSxFQUFlLEtBTmY7QUFBQSxJQVFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFFTixNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFDSTtBQUFBLFFBQUEsbUNBQUEsRUFBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLENBQUQsR0FBQTtBQUNqQyxZQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFvQyxDQUFDLFVBQXJDLENBQWdELEdBQWhELENBQUEsQ0FBQTttQkFDQSxLQUFJLENBQUMsYUFBTCxDQUFBLEVBRmlDO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckM7T0FESixDQUFBLENBQUE7QUFBQSxNQU1BLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiwy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

//# sourceURL=/Users/igawataiichi/.atom/packages/autoclose-html/lib/autoclose-html.coffee
