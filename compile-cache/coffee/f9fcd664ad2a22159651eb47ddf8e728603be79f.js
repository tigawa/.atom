(function() {
  var SublimeSelectEditorHandler,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = SublimeSelectEditorHandler = (function() {
    function SublimeSelectEditorHandler(editor, inputCfg) {
      this.onRangeChange = __bind(this.onRangeChange, this);
      this.onBlur = __bind(this.onBlur, this);
      this.onMouseEventToHijack = __bind(this.onMouseEventToHijack, this);
      this.onMouseMove = __bind(this.onMouseMove, this);
      this.onMouseDown = __bind(this.onMouseDown, this);
      this.editor = editor;
      this.inputCfg = inputCfg;
      this._resetState();
      this._setup_vars();
    }

    SublimeSelectEditorHandler.prototype.subscribe = function() {
      this.selection_observer = this.editor.onDidChangeSelectionRange(this.onRangeChange);
      this.editorElement.addEventListener('mousedown', this.onMouseDown);
      this.editorElement.addEventListener('mousemove', this.onMouseMove);
      this.editorElement.addEventListener('mouseup', this.onMouseEventToHijack);
      this.editorElement.addEventListener('mouseleave', this.onMouseEventToHijack);
      this.editorElement.addEventListener('mouseenter', this.onMouseEventToHijack);
      this.editorElement.addEventListener('contextmenu', this.onMouseEventToHijack);
      return this.editorElement.addEventListener('blur', this.onBlur);
    };

    SublimeSelectEditorHandler.prototype.unsubscribe = function() {
      this._resetState();
      this.selection_observer.dispose();
      this.editorElement.removeEventListener('mousedown', this.onMouseDown);
      this.editorElement.removeEventListener('mousemove', this.onMouseMove);
      this.editorElement.removeEventListener('mouseup', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('mouseleave', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('mouseenter', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('contextmenu', this.onMouseEventToHijack);
      return this.editorElement.removeEventListener('blur', this.onBlur);
    };

    SublimeSelectEditorHandler.prototype.onMouseDown = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        return false;
      }
      if (this._mainMouseAndKeyDown(e)) {
        this._resetState();
        this.mouseStartPos = this._screenPositionForMouseEvent(e);
        this.mouseEndPos = this.mouseStartPos;
        e.preventDefault();
        return false;
      }
    };

    SublimeSelectEditorHandler.prototype.onMouseMove = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        if (this._mainMouseDown(e)) {
          this.mouseEndPos = this._screenPositionForMouseEvent(e);
          this._selectBoxAroundCursors();
          return false;
        }
        if (e.which === 0) {
          return this._resetState();
        }
      }
    };

    SublimeSelectEditorHandler.prototype.onMouseEventToHijack = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        return false;
      }
    };

    SublimeSelectEditorHandler.prototype.onBlur = function(e) {
      return this._resetState();
    };

    SublimeSelectEditorHandler.prototype.onRangeChange = function(newVal) {
      if (this.mouseStartPos && !newVal.selection.isSingleScreenLine()) {
        newVal.selection.destroy();
        return this._selectBoxAroundCursors();
      }
    };

    SublimeSelectEditorHandler.prototype._resetState = function() {
      this.mouseStartPos = null;
      return this.mouseEndPos = null;
    };

    SublimeSelectEditorHandler.prototype._setup_vars = function() {
      if (this.editorBuffer == null) {
        this.editorBuffer = this.editor.displayBuffer;
      }
      if (this.editorElement == null) {
        this.editorElement = atom.views.getView(this.editor);
      }
      return this.editorComponent != null ? this.editorComponent : this.editorComponent = this.editorElement.component;
    };

    SublimeSelectEditorHandler.prototype._screenPositionForMouseEvent = function(e) {
      var column, defaultCharWidth, pixelPosition, row, targetLeft, targetTop;
      this._setup_vars();
      pixelPosition = this.editorComponent.pixelPositionForMouseEvent(e);
      targetTop = pixelPosition.top;
      targetLeft = pixelPosition.left;
      defaultCharWidth = this.editorBuffer.defaultCharWidth;
      row = Math.floor(targetTop / this.editorBuffer.getLineHeightInPixels());
      if (row > this.editorBuffer.getLastRow()) {
        targetLeft = Infinity;
      }
      row = Math.min(row, this.editorBuffer.getLastRow());
      row = Math.max(0, row);
      column = Math.round(targetLeft / defaultCharWidth);
      return {
        row: row,
        column: column
      };
    };

    SublimeSelectEditorHandler.prototype._mainMouseDown = function(e) {
      return e.which === this.inputCfg.mouseNum;
    };

    SublimeSelectEditorHandler.prototype._mainMouseAndKeyDown = function(e) {
      if (this.inputCfg.selectKey) {
        return this._mainMouseDown(e) && e[this.inputCfg.selectKey];
      } else {
        return this._mainMouseDown(e);
      }
    };

    SublimeSelectEditorHandler.prototype._selectBoxAroundCursors = function() {
      var allRanges, range, rangesWithLength, row, _i, _ref, _ref1;
      if (this.mouseStartPos && this.mouseEndPos) {
        allRanges = [];
        rangesWithLength = [];
        for (row = _i = _ref = this.mouseStartPos.row, _ref1 = this.mouseEndPos.row; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
          range = [[row, this.mouseStartPos.column], [row, this.mouseEndPos.column]];
          allRanges.push(range);
          if (this.editor.getTextInBufferRange(range).length > 0) {
            rangesWithLength.push(range);
          }
        }
        if (rangesWithLength.length) {
          return this.editor.setSelectedScreenRanges(rangesWithLength);
        } else if (allRanges.length) {
          return this.editor.setSelectedScreenRanges(allRanges);
        }
      }
    };

    return SublimeSelectEditorHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zdWJsaW1lLXN0eWxlLWNvbHVtbi1zZWxlY3Rpb24vbGliL2VkaXRvci1oYW5kbGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQkFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDUTtBQUNTLElBQUEsb0NBQUMsTUFBRCxFQUFTLFFBQVQsR0FBQTtBQUNYLDJEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseUVBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLE1BQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQURaLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBSEEsQ0FEVztJQUFBLENBQWI7O0FBQUEseUNBTUEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsSUFBQyxDQUFBLGFBQW5DLENBQXRCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsV0FBaEMsRUFBK0MsSUFBQyxDQUFBLFdBQWhELENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxXQUFoQyxFQUErQyxJQUFDLENBQUEsV0FBaEQsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLGdCQUFmLENBQWdDLFNBQWhDLEVBQStDLElBQUMsQ0FBQSxvQkFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/sublime-style-column-selection/lib/editor-handler.coffee
