(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      charWidth = textEditor.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: [range.end.row, range.end.row]
      }).filter(function(m) {
        return m.getScreenRange().end.row === range.end.row;
      });
      index = markers.indexOf(colorMarker);
      screenLine = this.screenLineForScreenRow(textEditor, range.end.row);
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = this.getLineLastColumn(screenLine) * charWidth;
      pixelPosition = textEditorElement.pixelPositionForScreenPosition(range.end);
      return {
        "class": 'dot',
        style: {
          backgroundColor: color.toCSS(),
          top: (pixelPosition.top + lineHeight / 2) + 'px',
          left: (column + index * 18) + 'px'
        }
      };
    };

    DotRenderer.prototype.getLineLastColumn = function(line) {
      if (line.lineText != null) {
        return line.lineText.length + 1;
      } else {
        return line.getMaxScreenColumn() + 1;
      }
    };

    DotRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL2RvdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007OzswQkFDSixNQUFBLEdBQVEsU0FBQyxXQUFEO0FBQ04sVUFBQTtNQUFBLEtBQUEsR0FBUSxXQUFXLENBQUMsY0FBWixDQUFBO01BRVIsS0FBQSxHQUFRLFdBQVcsQ0FBQztNQUVwQixJQUFpQixhQUFqQjtBQUFBLGVBQU8sR0FBUDs7TUFFQSxVQUFBLEdBQWEsV0FBVyxDQUFDLFdBQVcsQ0FBQztNQUNyQyxpQkFBQSxHQUFvQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsVUFBbkI7TUFDcEIsU0FBQSxHQUFZLFVBQVUsQ0FBQyxtQkFBWCxDQUFBO01BRVosT0FBQSxHQUFVLFdBQVcsQ0FBQyxXQUFXLENBQUMscUJBQXhCLENBQThDO1FBQ3RELHdCQUFBLEVBQTBCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFYLEVBQWdCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBMUIsQ0FENEI7T0FBOUMsQ0FFUixDQUFDLE1BRk8sQ0FFQSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsY0FBRixDQUFBLENBQWtCLENBQUMsR0FBRyxDQUFDLEdBQXZCLEtBQThCLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFBL0MsQ0FGQTtNQUlWLEtBQUEsR0FBUSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQjtNQUNSLFVBQUEsR0FBYSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsVUFBeEIsRUFBb0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUE5QztNQUViLElBQWlCLGtCQUFqQjtBQUFBLGVBQU8sR0FBUDs7TUFFQSxVQUFBLEdBQWEsVUFBVSxDQUFDLHFCQUFYLENBQUE7TUFDYixNQUFBLEdBQVMsSUFBQyxDQUFBLGlCQUFELENBQW1CLFVBQW5CLENBQUEsR0FBaUM7TUFDMUMsYUFBQSxHQUFnQixpQkFBaUIsQ0FBQyw4QkFBbEIsQ0FBaUQsS0FBSyxDQUFDLEdBQXZEO2FBRWhCO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxLQUFQO1FBQ0EsS0FBQSxFQUNFO1VBQUEsZUFBQSxFQUFpQixLQUFLLENBQUMsS0FBTixDQUFBLENBQWpCO1VBQ0EsR0FBQSxFQUFLLENBQUMsYUFBYSxDQUFDLEdBQWQsR0FBb0IsVUFBQSxHQUFhLENBQWxDLENBQUEsR0FBdUMsSUFENUM7VUFFQSxJQUFBLEVBQU0sQ0FBQyxNQUFBLEdBQVMsS0FBQSxHQUFRLEVBQWxCLENBQUEsR0FBd0IsSUFGOUI7U0FGRjs7SUF4Qk07OzBCQThCUixpQkFBQSxHQUFtQixTQUFDLElBQUQ7TUFDakIsSUFBRyxxQkFBSDtlQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBZCxHQUF1QixFQUR6QjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsa0JBQUwsQ0FBQSxDQUFBLEdBQTRCLEVBSDlCOztJQURpQjs7MEJBTW5CLHNCQUFBLEdBQXdCLFNBQUMsVUFBRCxFQUFhLEdBQWI7TUFDdEIsSUFBRyx5Q0FBSDtlQUNFLFVBQVUsQ0FBQyxzQkFBWCxDQUFrQyxHQUFsQyxFQURGO09BQUEsTUFBQTtlQUdFLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBWSxDQUFBLEdBQUEsRUFIdkM7O0lBRHNCOzs7OztBQXRDMUIiLCJzb3VyY2VzQ29udGVudCI6WyJcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIERvdFJlbmRlcmVyXG4gIHJlbmRlcjogKGNvbG9yTWFya2VyKSAtPlxuICAgIHJhbmdlID0gY29sb3JNYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICAgY29sb3IgPSBjb2xvck1hcmtlci5jb2xvclxuXG4gICAgcmV0dXJuIHt9IHVubGVzcyBjb2xvcj9cblxuICAgIHRleHRFZGl0b3IgPSBjb2xvck1hcmtlci5jb2xvckJ1ZmZlci5lZGl0b3JcbiAgICB0ZXh0RWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKVxuICAgIGNoYXJXaWR0aCA9IHRleHRFZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpXG5cbiAgICBtYXJrZXJzID0gY29sb3JNYXJrZXIuY29sb3JCdWZmZXIuZmluZFZhbGlkQ29sb3JNYXJrZXJzKHtcbiAgICAgIGludGVyc2VjdHNTY3JlZW5Sb3dSYW5nZTogW3JhbmdlLmVuZC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgfSkuZmlsdGVyIChtKSAtPiBtLmdldFNjcmVlblJhbmdlKCkuZW5kLnJvdyBpcyByYW5nZS5lbmQucm93XG5cbiAgICBpbmRleCA9IG1hcmtlcnMuaW5kZXhPZihjb2xvck1hcmtlcilcbiAgICBzY3JlZW5MaW5lID0gQHNjcmVlbkxpbmVGb3JTY3JlZW5Sb3codGV4dEVkaXRvciwgcmFuZ2UuZW5kLnJvdylcblxuICAgIHJldHVybiB7fSB1bmxlc3Mgc2NyZWVuTGluZT9cblxuICAgIGxpbmVIZWlnaHQgPSB0ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgY29sdW1uID0gQGdldExpbmVMYXN0Q29sdW1uKHNjcmVlbkxpbmUpICogY2hhcldpZHRoXG4gICAgcGl4ZWxQb3NpdGlvbiA9IHRleHRFZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihyYW5nZS5lbmQpXG5cbiAgICBjbGFzczogJ2RvdCdcbiAgICBzdHlsZTpcbiAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3IudG9DU1MoKVxuICAgICAgdG9wOiAocGl4ZWxQb3NpdGlvbi50b3AgKyBsaW5lSGVpZ2h0IC8gMikgKyAncHgnXG4gICAgICBsZWZ0OiAoY29sdW1uICsgaW5kZXggKiAxOCkgKyAncHgnXG5cbiAgZ2V0TGluZUxhc3RDb2x1bW46IChsaW5lKSAtPlxuICAgIGlmIGxpbmUubGluZVRleHQ/XG4gICAgICBsaW5lLmxpbmVUZXh0Lmxlbmd0aCArIDFcbiAgICBlbHNlXG4gICAgICBsaW5lLmdldE1heFNjcmVlbkNvbHVtbigpICsgMVxuXG4gIHNjcmVlbkxpbmVGb3JTY3JlZW5Sb3c6ICh0ZXh0RWRpdG9yLCByb3cpIC0+XG4gICAgaWYgdGV4dEVkaXRvci5zY3JlZW5MaW5lRm9yU2NyZWVuUm93P1xuICAgICAgdGV4dEVkaXRvci5zY3JlZW5MaW5lRm9yU2NyZWVuUm93KHJvdylcbiAgICBlbHNlXG4gICAgICB0ZXh0RWRpdG9yLmRpc3BsYXlCdWZmZXIuc2NyZWVuTGluZXNbcm93XVxuIl19
