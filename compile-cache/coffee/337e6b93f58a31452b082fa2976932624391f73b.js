(function() {
  var DidInsertText,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  module.exports = DidInsertText = (function() {
    function DidInsertText(editor) {
      this.editor = editor;
      this.insertText = bind(this.insertText, this);
      this.adviseBefore(this.editor, 'insertText', this.insertText);
    }

    DidInsertText.prototype.insertText = function(text, options) {
      if (this.editor.hasMultipleCursors()) {
        return true;
      }
      if (text === "\n") {
        if (!this.insertNewlineBetweenJSXTags()) {
          return false;
        }
        if (!this.insertNewlineAfterBacktick()) {
          return false;
        }
      } else if (text === "`") {
        if (!this.insertBackTick()) {
          return false;
        }
      }
      return true;
    };

    DidInsertText.prototype.bracketMatcherBackticks = function() {
      return atom.packages.isPackageActive("bracket-matcher") && atom.config.get("bracket-matcher.autocompleteBrackets") && indexOf.call(atom.config.get("bracket-matcher.autocompleteCharacters"), "``") >= 0;
    };

    DidInsertText.prototype.insertNewlineBetweenJSXTags = function() {
      var cursorBufferPosition, indentLength;
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if (!(cursorBufferPosition.column > 0)) {
        return true;
      }
      if ('JSXEndTagStart' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      cursorBufferPosition.column--;
      if ('JSXStartTagEnd' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      indentLength = this.editor.indentationForBufferRow(cursorBufferPosition.row);
      this.editor.insertText("\n\n");
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
        preserveLeadingWhitespace: false
      });
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 2, indentLength, {
        preserveLeadingWhitespace: false
      });
      this.editor.moveUp();
      this.editor.moveToEndOfLine();
      return false;
    };

    DidInsertText.prototype.insertNewlineAfterBacktick = function() {
      var betweenBackTicks, cursorBufferPosition, indentLength;
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if (!(cursorBufferPosition.column > 0)) {
        return true;
      }
      betweenBackTicks = 'punctuation.definition.quasi.end.js' === this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString();
      cursorBufferPosition.column--;
      if ('punctuation.definition.quasi.begin.js' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      indentLength = this.editor.indentationForBufferRow(cursorBufferPosition.row);
      if (!this.bracketMatcherBackticks()) {
        return true;
      }
      if (betweenBackTicks) {
        this.editor.insertText("\n\n");
        this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
          preserveLeadingWhitespace: false
        });
        this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 2, indentLength, {
          preserveLeadingWhitespace: false
        });
        this.editor.moveUp();
        this.editor.moveToEndOfLine();
      } else {
        this.editor.insertText("\n\t");
        this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
          preserveLeadingWhitespace: false
        });
      }
      return false;
    };

    DidInsertText.prototype.insertBackTick = function() {
      var cursorBufferPosition;
      if (!this.bracketMatcherBackticks()) {
        return true;
      }
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if ('punctuation.definition.quasi.begin.js' === this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().slice(-1).toString()) {
        return true;
      }
      this.editor.insertText("``");
      this.editor.moveLeft();
      return false;
    };

    DidInsertText.prototype.adviseBefore = function(object, methodName, advice) {
      var original;
      original = object[methodName];
      return object[methodName] = function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (advice.apply(this, args) !== false) {
          return original.apply(this, args);
        }
      };
    };

    return DidInsertText;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1iYWJlbC9saWIvZGlkLWluc2VydC10ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsYUFBQTtJQUFBOzs7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHVCQUFDLE1BQUQ7TUFBQyxJQUFDLENBQUEsU0FBRDs7TUFDWixJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxNQUFmLEVBQXVCLFlBQXZCLEVBQXFDLElBQUMsQ0FBQSxVQUF0QztJQURXOzs0QkFJYixVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sT0FBUDtNQUNWLElBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBLENBQWY7QUFBQSxlQUFPLEtBQVA7O01BRUEsSUFBSyxJQUFBLEtBQVEsSUFBYjtRQUNFLElBQUcsQ0FBQyxJQUFDLENBQUEsMkJBQUQsQ0FBQSxDQUFKO0FBQXdDLGlCQUFPLE1BQS9DOztRQUNBLElBQUcsQ0FBQyxJQUFDLENBQUEsMEJBQUQsQ0FBQSxDQUFKO0FBQXVDLGlCQUFPLE1BQTlDO1NBRkY7T0FBQSxNQUdLLElBQUssSUFBQSxLQUFRLEdBQWI7UUFDSCxJQUFHLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFKO0FBQTJCLGlCQUFPLE1BQWxDO1NBREc7O2FBRUw7SUFSVTs7NEJBV1osdUJBQUEsR0FBeUIsU0FBQTtBQUN2QixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixpQkFBOUIsQ0FBQSxJQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEIsQ0FESyxJQUVMLGFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUFSLEVBQUEsSUFBQTtJQUhxQjs7NEJBT3pCLDJCQUFBLEdBQTZCLFNBQUE7QUFDM0IsVUFBQTtNQUFBLG9CQUFBLEdBQXVCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQTtNQUN2QixJQUFBLENBQUEsQ0FBbUIsb0JBQW9CLENBQUMsTUFBckIsR0FBOEIsQ0FBakQsQ0FBQTtBQUFBLGVBQU8sS0FBUDs7TUFDQSxJQUFtQixnQkFBQSxLQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLGdDQUFSLENBQXlDLG9CQUF6QyxDQUE4RCxDQUFDLGNBQS9ELENBQUEsQ0FBK0UsQ0FBQyxLQUFoRixDQUFzRixDQUFDLENBQXZGLENBQXlGLENBQUMsUUFBMUYsQ0FBQSxDQUF2QztBQUFBLGVBQU8sS0FBUDs7TUFDQSxvQkFBb0IsQ0FBQyxNQUFyQjtNQUNBLElBQW1CLGdCQUFBLEtBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0NBQVIsQ0FBeUMsb0JBQXpDLENBQThELENBQUMsY0FBL0QsQ0FBQSxDQUErRSxDQUFDLEtBQWhGLENBQXNGLENBQUMsQ0FBdkYsQ0FBeUYsQ0FBQyxRQUExRixDQUFBLENBQXZDO0FBQUEsZUFBTyxLQUFQOztNQUNBLFlBQUEsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLG9CQUFvQixDQUFDLEdBQXJEO01BQ2YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLE1BQW5CO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxvQkFBb0IsQ0FBQyxHQUFyQixHQUF5QixDQUE1RCxFQUErRCxZQUFBLEdBQWEsQ0FBNUUsRUFBK0U7UUFBRSx5QkFBQSxFQUEyQixLQUE3QjtPQUEvRTtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsb0JBQW9CLENBQUMsR0FBckIsR0FBeUIsQ0FBNUQsRUFBK0QsWUFBL0QsRUFBNkU7UUFBRSx5QkFBQSxFQUEyQixLQUE3QjtPQUE3RTtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUE7YUFDQTtJQVoyQjs7NEJBZ0I3QiwwQkFBQSxHQUE0QixTQUFBO0FBQzFCLFVBQUE7TUFBQSxvQkFBQSxHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUE7TUFDdkIsSUFBQSxDQUFBLENBQW1CLG9CQUFvQixDQUFDLE1BQXJCLEdBQThCLENBQWpELENBQUE7QUFBQSxlQUFPLEtBQVA7O01BQ0EsZ0JBQUEsR0FBbUIscUNBQUEsS0FBeUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQ0FBUixDQUF5QyxvQkFBekMsQ0FBOEQsQ0FBQyxjQUEvRCxDQUFBLENBQStFLENBQUMsS0FBaEYsQ0FBc0YsQ0FBQyxDQUF2RixDQUF5RixDQUFDLFFBQTFGLENBQUE7TUFDNUQsb0JBQW9CLENBQUMsTUFBckI7TUFDQSxJQUFtQix1Q0FBQSxLQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdDQUFSLENBQXlDLG9CQUF6QyxDQUE4RCxDQUFDLGNBQS9ELENBQUEsQ0FBK0UsQ0FBQyxLQUFoRixDQUFzRixDQUFDLENBQXZGLENBQXlGLENBQUMsUUFBMUYsQ0FBQSxDQUE5RDtBQUFBLGVBQU8sS0FBUDs7TUFDQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxvQkFBb0IsQ0FBQyxHQUFyRDtNQUNmLElBQUEsQ0FBbUIsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBbkI7QUFBQSxlQUFPLEtBQVA7O01BQ0EsSUFBSSxnQkFBSjtRQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixNQUFuQjtRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsb0JBQW9CLENBQUMsR0FBckIsR0FBeUIsQ0FBNUQsRUFBK0QsWUFBQSxHQUFhLENBQTVFLEVBQStFO1VBQUUseUJBQUEsRUFBMkIsS0FBN0I7U0FBL0U7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQW1DLG9CQUFvQixDQUFDLEdBQXJCLEdBQXlCLENBQTVELEVBQStELFlBQS9ELEVBQTZFO1VBQUUseUJBQUEsRUFBMkIsS0FBN0I7U0FBN0U7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQTtRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUFBLEVBTEY7T0FBQSxNQUFBO1FBT0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLE1BQW5CO1FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxvQkFBb0IsQ0FBQyxHQUFyQixHQUF5QixDQUE1RCxFQUErRCxZQUFBLEdBQWEsQ0FBNUUsRUFBK0U7VUFBRSx5QkFBQSxFQUEyQixLQUE3QjtTQUEvRSxFQVJGOzthQVNBO0lBakIwQjs7NEJBc0I1QixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsSUFBQSxDQUFtQixJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFuQjtBQUFBLGVBQU8sS0FBUDs7TUFDQSxvQkFBQSxHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUE7TUFDdkIsSUFBZSx1Q0FBQSxLQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdDQUFSLENBQXlDLG9CQUF6QyxDQUE4RCxDQUFDLGNBQS9ELENBQUEsQ0FBK0UsQ0FBQyxLQUFoRixDQUFzRixDQUFDLENBQXZGLENBQXlGLENBQUMsUUFBMUYsQ0FBQSxDQUExRDtBQUFBLGVBQU8sS0FBUDs7TUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBbkI7TUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQTthQUNBO0lBTmM7OzRCQVVoQixZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixNQUFyQjtBQUNaLFVBQUE7TUFBQSxRQUFBLEdBQVcsTUFBTyxDQUFBLFVBQUE7YUFDbEIsTUFBTyxDQUFBLFVBQUEsQ0FBUCxHQUFxQixTQUFBO0FBQ25CLFlBQUE7UUFEb0I7UUFDcEIsSUFBTyxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBQSxLQUE0QixLQUFuQztpQkFDRSxRQUFRLENBQUMsS0FBVCxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFERjs7TUFEbUI7SUFGVDs7Ozs7QUF4RWhCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGlkSW5zZXJ0VGV4dFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XG4gICAgQGFkdmlzZUJlZm9yZShAZWRpdG9yLCAnaW5zZXJ0VGV4dCcsIEBpbnNlcnRUZXh0KVxuXG4gICMgcGF0Y2hlZCBUZXh0RWRpdG9yOjppbnNlcnRUZXh0XG4gIGluc2VydFRleHQ6ICh0ZXh0LCBvcHRpb25zKSA9PlxuICAgIHJldHVybiB0cnVlIGlmIEBlZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgIyBmb3IgdGltZSBiZWluZ1xuXG4gICAgaWYgKCB0ZXh0IGlzIFwiXFxuXCIpXG4gICAgICBpZiAhQGluc2VydE5ld2xpbmVCZXR3ZWVuSlNYVGFncygpIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICBpZiAhQGluc2VydE5ld2xpbmVBZnRlckJhY2t0aWNrKCkgdGhlbiByZXR1cm4gZmFsc2VcbiAgICBlbHNlIGlmICggdGV4dCBpcyBcImBcIilcbiAgICAgIGlmICFAaW5zZXJ0QmFja1RpY2soKSB0aGVuIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICAjIGNoZWNrIGJyYWNrZXQtbWF0Y2hlciBwYWNrYWdlIGNvbmZpZyB0byBkZXRlcm1pbmUgYmFja3RpY2sgaW5zZXJ0aW9uXG4gIGJyYWNrZXRNYXRjaGVyQmFja3RpY2tzOiAoKSAtPlxuICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShcImJyYWNrZXQtbWF0Y2hlclwiKSBhbmRcbiAgICAgIGF0b20uY29uZmlnLmdldChcImJyYWNrZXQtbWF0Y2hlci5hdXRvY29tcGxldGVCcmFja2V0c1wiKSBhbmRcbiAgICAgIFwiYGBcIiBpbiBhdG9tLmNvbmZpZy5nZXQoXCJicmFja2V0LW1hdGNoZXIuYXV0b2NvbXBsZXRlQ2hhcmFjdGVyc1wiKVxuXG4gICMgaWYgYSBuZXdMaW5lIGlzIGVudGVyZWQgYmV0d2VlbiBhIEpTWCB0YWcgb3BlbiBhbmQgY2xvc2UgbWFya2VkXyA8ZGl2Pl88L2Rpdj5cbiAgIyB0aGVuIGFkZCBhbm90aGVyIG5ld0xpbmUgYW5kIHJlcG9zaXRpb24gY3Vyc29yXG4gIGluc2VydE5ld2xpbmVCZXR3ZWVuSlNYVGFnczogKCkgLT5cbiAgICBjdXJzb3JCdWZmZXJQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIHJldHVybiB0cnVlIHVubGVzcyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5jb2x1bW4gPiAwXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzICdKU1hFbmRUYWdTdGFydCcgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIGN1cnNvckJ1ZmZlclBvc2l0aW9uLmNvbHVtbi0tXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzICdKU1hTdGFydFRhZ0VuZCcgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIGluZGVudExlbmd0aCA9IEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcblxcblwiKVxuICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzEsIGluZGVudExlbmd0aCsxLCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdysyLCBpbmRlbnRMZW5ndGgsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgIEBlZGl0b3IubW92ZVVwKClcbiAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgZmFsc2VcblxuICAjIGlmIGEgbmV3bGluZSBpcyBlbnRlcmVkIGFmdGVyIHRoZSBvcGVuaW5nIGJhY2t0aWNrXG4gICMgaW5kZW50IGN1cnNvciBhbmQgYWRkIGEgY2xvc2luZyBiYWNrdGlja1xuICBpbnNlcnROZXdsaW5lQWZ0ZXJCYWNrdGljazogKCkgLT5cbiAgICBjdXJzb3JCdWZmZXJQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIHJldHVybiB0cnVlIHVubGVzcyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5jb2x1bW4gPiAwXG4gICAgYmV0d2VlbkJhY2tUaWNrcyA9ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpLmVuZC5qcycgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIGN1cnNvckJ1ZmZlclBvc2l0aW9uLmNvbHVtbi0tXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpLmJlZ2luLmpzJyBpcyBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGN1cnNvckJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKS50b1N0cmluZygpXG4gICAgaW5kZW50TGVuZ3RoID0gQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3cpXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIEBicmFja2V0TWF0Y2hlckJhY2t0aWNrcygpXG4gICAgaWYgKGJldHdlZW5CYWNrVGlja3MpXG4gICAgICBAZWRpdG9yLmluc2VydFRleHQoXCJcXG5cXG5cIilcbiAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzEsIGluZGVudExlbmd0aCsxLCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzIsIGluZGVudExlbmd0aCwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgICBAZWRpdG9yLm1vdmVVcCgpXG4gICAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5pbnNlcnRUZXh0KFwiXFxuXFx0XCIpXG4gICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdysxLCBpbmRlbnRMZW5ndGgrMSwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgZmFsc2VcblxuICAjIHRoZSBhdG9tIGJyYWNrZXQgbWF0Y2hlciBkb2Vzbid0IGN1cnJlbnRseSAoIHYxLjE1KSBhZGQgYSBjbG9zaW5nIGJhY2t0aWNrIHdoZW4gdGhlIG9wZW5pbmdcbiAgIyBiYWNrdGljayBhcHBlYXJzIGFmdGVyIGEgd29yZCBjaGFyYWN0ZXIgYXMgaXMgdGhlIGNhc2UgaW4gYSB0YWduYW1lYGAgc2VxdWVuY2VcbiAgIyB0aGlzIHJlbWVkaWVzIHRoYXRcbiAgaW5zZXJ0QmFja1RpY2s6ICgpIC0+XG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIEBicmFja2V0TWF0Y2hlckJhY2t0aWNrcygpXG4gICAgY3Vyc29yQnVmZmVyUG9zaXRpb24gPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICByZXR1cm4gdHJ1ZSBpZiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5xdWFzaS5iZWdpbi5qcycgaXMgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JCdWZmZXJQb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSkudG9TdHJpbmcoKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcImBgXCIpXG4gICAgQGVkaXRvci5tb3ZlTGVmdCgpXG4gICAgZmFsc2VcblxuXG4gICMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS91bmRlcnNjb3JlLXBsdXMvYmxvYi9tYXN0ZXIvc3JjL3VuZGVyc2NvcmUtcGx1cy5jb2ZmZWVcbiAgYWR2aXNlQmVmb3JlOiAob2JqZWN0LCBtZXRob2ROYW1lLCBhZHZpY2UpIC0+XG4gICAgb3JpZ2luYWwgPSBvYmplY3RbbWV0aG9kTmFtZV1cbiAgICBvYmplY3RbbWV0aG9kTmFtZV0gPSAoYXJncy4uLikgLT5cbiAgICAgIHVubGVzcyBhZHZpY2UuYXBwbHkodGhpcywgYXJncykgPT0gZmFsc2VcbiAgICAgICAgb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncylcbiJdfQ==
