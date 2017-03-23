(function() {
  var RegionRenderer;

  module.exports = RegionRenderer = (function() {
    function RegionRenderer() {}

    RegionRenderer.prototype.includeTextInRegion = false;

    RegionRenderer.prototype.renderRegions = function(colorMarker) {
      var i, range, ref, ref1, regions, row, rowSpan, textEditor;
      range = colorMarker.getScreenRange();
      if (range.isEmpty()) {
        return [];
      }
      rowSpan = range.end.row - range.start.row;
      regions = [];
      textEditor = colorMarker.colorBuffer.editor;
      if (rowSpan === 0) {
        regions.push(this.createRegion(range.start, range.end, colorMarker));
      } else {
        regions.push(this.createRegion(range.start, {
          row: range.start.row,
          column: 2e308
        }, colorMarker, this.screenLineForScreenRow(textEditor, range.start.row)));
        if (rowSpan > 1) {
          for (row = i = ref = range.start.row + 1, ref1 = range.end.row; ref <= ref1 ? i < ref1 : i > ref1; row = ref <= ref1 ? ++i : --i) {
            regions.push(this.createRegion({
              row: row,
              column: 0
            }, {
              row: row,
              column: 2e308
            }, colorMarker, this.screenLineForScreenRow(textEditor, row)));
          }
        }
        regions.push(this.createRegion({
          row: range.end.row,
          column: 0
        }, range.end, colorMarker, this.screenLineForScreenRow(textEditor, range.end.row)));
      }
      return regions;
    };

    RegionRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    RegionRenderer.prototype.createRegion = function(start, end, colorMarker, screenLine) {
      var bufferRange, charWidth, clippedEnd, clippedStart, css, endPosition, lineHeight, name, needAdjustment, ref, ref1, region, startPosition, text, textEditor, textEditorElement, value;
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      if (textEditorElement.component == null) {
        return;
      }
      lineHeight = textEditor.getLineHeightInPixels();
      charWidth = textEditor.getDefaultCharWidth();
      clippedStart = {
        row: start.row,
        column: (ref = this.clipScreenColumn(screenLine, start.column)) != null ? ref : start.column
      };
      clippedEnd = {
        row: end.row,
        column: (ref1 = this.clipScreenColumn(screenLine, end.column)) != null ? ref1 : end.column
      };
      bufferRange = textEditor.bufferRangeForScreenRange({
        start: clippedStart,
        end: clippedEnd
      });
      needAdjustment = (screenLine != null ? typeof screenLine.isSoftWrapped === "function" ? screenLine.isSoftWrapped() : void 0 : void 0) && end.column >= (screenLine != null ? screenLine.text.length : void 0) - (screenLine != null ? screenLine.softWrapIndentationDelta : void 0);
      if (needAdjustment) {
        bufferRange.end.column++;
      }
      startPosition = textEditorElement.pixelPositionForScreenPosition(clippedStart);
      endPosition = textEditorElement.pixelPositionForScreenPosition(clippedEnd);
      text = textEditor.getBuffer().getTextInRange(bufferRange);
      css = {};
      css.left = startPosition.left;
      css.top = startPosition.top;
      css.width = endPosition.left - startPosition.left;
      if (needAdjustment) {
        css.width += charWidth;
      }
      css.height = lineHeight;
      region = document.createElement('div');
      region.className = 'region';
      if (this.includeTextInRegion) {
        region.textContent = text;
      }
      if (startPosition.left === endPosition.left) {
        region.invalid = true;
      }
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      return region;
    };

    RegionRenderer.prototype.clipScreenColumn = function(line, column) {
      if (line != null) {
        if (line.clipScreenColumn != null) {
          return line.clipScreenColumn(column);
        } else {
          return Math.min(line.lineText.length, column);
        }
      }
    };

    return RegionRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL3JlZ2lvbi1yZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs2QkFDSixtQkFBQSxHQUFxQjs7NkJBRXJCLGFBQUEsR0FBZSxTQUFDLFdBQUQ7QUFDYixVQUFBO01BQUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxjQUFaLENBQUE7TUFDUixJQUFhLEtBQUssQ0FBQyxPQUFOLENBQUEsQ0FBYjtBQUFBLGVBQU8sR0FBUDs7TUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFWLEdBQWdCLEtBQUssQ0FBQyxLQUFLLENBQUM7TUFDdEMsT0FBQSxHQUFVO01BRVYsVUFBQSxHQUFhLFdBQVcsQ0FBQyxXQUFXLENBQUM7TUFFckMsSUFBRyxPQUFBLEtBQVcsQ0FBZDtRQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFLLENBQUMsS0FBcEIsRUFBMkIsS0FBSyxDQUFDLEdBQWpDLEVBQXNDLFdBQXRDLENBQWIsRUFERjtPQUFBLE1BQUE7UUFHRSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUMsQ0FBQSxZQUFELENBQ1gsS0FBSyxDQUFDLEtBREssRUFFWDtVQUNFLEdBQUEsRUFBSyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBRG5CO1VBRUUsTUFBQSxFQUFRLEtBRlY7U0FGVyxFQU1YLFdBTlcsRUFPWCxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsVUFBeEIsRUFBb0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFoRCxDQVBXLENBQWI7UUFTQSxJQUFHLE9BQUEsR0FBVSxDQUFiO0FBQ0UsZUFBVywySEFBWDtZQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FDWDtjQUFDLEtBQUEsR0FBRDtjQUFNLE1BQUEsRUFBUSxDQUFkO2FBRFcsRUFFWDtjQUFDLEtBQUEsR0FBRDtjQUFNLE1BQUEsRUFBUSxLQUFkO2FBRlcsRUFHWCxXQUhXLEVBSVgsSUFBQyxDQUFBLHNCQUFELENBQXdCLFVBQXhCLEVBQW9DLEdBQXBDLENBSlcsQ0FBYjtBQURGLFdBREY7O1FBU0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsWUFBRCxDQUNYO1VBQUMsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBaEI7VUFBcUIsTUFBQSxFQUFRLENBQTdCO1NBRFcsRUFFWCxLQUFLLENBQUMsR0FGSyxFQUdYLFdBSFcsRUFJWCxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsVUFBeEIsRUFBb0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUE5QyxDQUpXLENBQWIsRUFyQkY7O2FBNEJBO0lBckNhOzs2QkF1Q2Ysc0JBQUEsR0FBd0IsU0FBQyxVQUFELEVBQWEsR0FBYjtNQUN0QixJQUFHLHlDQUFIO2VBQ0UsVUFBVSxDQUFDLHNCQUFYLENBQWtDLEdBQWxDLEVBREY7T0FBQSxNQUFBO2VBR0UsVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFZLENBQUEsR0FBQSxFQUh2Qzs7SUFEc0I7OzZCQU14QixZQUFBLEdBQWMsU0FBQyxLQUFELEVBQVEsR0FBUixFQUFhLFdBQWIsRUFBMEIsVUFBMUI7QUFDWixVQUFBO01BQUEsVUFBQSxHQUFhLFdBQVcsQ0FBQyxXQUFXLENBQUM7TUFDckMsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CO01BRXBCLElBQWMsbUNBQWQ7QUFBQSxlQUFBOztNQUVBLFVBQUEsR0FBYSxVQUFVLENBQUMscUJBQVgsQ0FBQTtNQUNiLFNBQUEsR0FBWSxVQUFVLENBQUMsbUJBQVgsQ0FBQTtNQUVaLFlBQUEsR0FBZTtRQUNiLEdBQUEsRUFBSyxLQUFLLENBQUMsR0FERTtRQUViLE1BQUEsMEVBQXNELEtBQUssQ0FBQyxNQUYvQzs7TUFJZixVQUFBLEdBQWE7UUFDWCxHQUFBLEVBQUssR0FBRyxDQUFDLEdBREU7UUFFWCxNQUFBLDBFQUFvRCxHQUFHLENBQUMsTUFGN0M7O01BS2IsV0FBQSxHQUFjLFVBQVUsQ0FBQyx5QkFBWCxDQUFxQztRQUNqRCxLQUFBLEVBQU8sWUFEMEM7UUFFakQsR0FBQSxFQUFLLFVBRjRDO09BQXJDO01BS2QsY0FBQSwwRUFBaUIsVUFBVSxDQUFFLGtDQUFaLElBQWlDLEdBQUcsQ0FBQyxNQUFKLDBCQUFjLFVBQVUsQ0FBRSxJQUFJLENBQUMsZ0JBQWpCLHlCQUEwQixVQUFVLENBQUU7TUFFdEcsSUFBNEIsY0FBNUI7UUFBQSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQWhCLEdBQUE7O01BRUEsYUFBQSxHQUFnQixpQkFBaUIsQ0FBQyw4QkFBbEIsQ0FBaUQsWUFBakQ7TUFDaEIsV0FBQSxHQUFjLGlCQUFpQixDQUFDLDhCQUFsQixDQUFpRCxVQUFqRDtNQUVkLElBQUEsR0FBTyxVQUFVLENBQUMsU0FBWCxDQUFBLENBQXNCLENBQUMsY0FBdkIsQ0FBc0MsV0FBdEM7TUFFUCxHQUFBLEdBQU07TUFDTixHQUFHLENBQUMsSUFBSixHQUFXLGFBQWEsQ0FBQztNQUN6QixHQUFHLENBQUMsR0FBSixHQUFVLGFBQWEsQ0FBQztNQUN4QixHQUFHLENBQUMsS0FBSixHQUFZLFdBQVcsQ0FBQyxJQUFaLEdBQW1CLGFBQWEsQ0FBQztNQUM3QyxJQUEwQixjQUExQjtRQUFBLEdBQUcsQ0FBQyxLQUFKLElBQWEsVUFBYjs7TUFDQSxHQUFHLENBQUMsTUFBSixHQUFhO01BRWIsTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1QsTUFBTSxDQUFDLFNBQVAsR0FBbUI7TUFDbkIsSUFBNkIsSUFBQyxDQUFBLG1CQUE5QjtRQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLEtBQXJCOztNQUNBLElBQXlCLGFBQWEsQ0FBQyxJQUFkLEtBQXNCLFdBQVcsQ0FBQyxJQUEzRDtRQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQWpCOztBQUNBLFdBQUEsV0FBQTs7UUFBQSxNQUFNLENBQUMsS0FBTSxDQUFBLElBQUEsQ0FBYixHQUFxQixLQUFBLEdBQVE7QUFBN0I7YUFFQTtJQTdDWTs7NkJBK0NkLGdCQUFBLEdBQWtCLFNBQUMsSUFBRCxFQUFPLE1BQVA7TUFDaEIsSUFBRyxZQUFIO1FBQ0UsSUFBRyw2QkFBSDtpQkFDRSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsTUFBdEIsRUFERjtTQUFBLE1BQUE7aUJBR0UsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQXZCLEVBQStCLE1BQS9CLEVBSEY7U0FERjs7SUFEZ0I7Ozs7O0FBaEdwQiIsInNvdXJjZXNDb250ZW50IjpbIlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUmVnaW9uUmVuZGVyZXJcbiAgaW5jbHVkZVRleHRJblJlZ2lvbjogZmFsc2VcblxuICByZW5kZXJSZWdpb25zOiAoY29sb3JNYXJrZXIpIC0+XG4gICAgcmFuZ2UgPSBjb2xvck1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG4gICAgcmV0dXJuIFtdIGlmIHJhbmdlLmlzRW1wdHkoKVxuXG4gICAgcm93U3BhbiA9IHJhbmdlLmVuZC5yb3cgLSByYW5nZS5zdGFydC5yb3dcbiAgICByZWdpb25zID0gW11cblxuICAgIHRleHRFZGl0b3IgPSBjb2xvck1hcmtlci5jb2xvckJ1ZmZlci5lZGl0b3JcblxuICAgIGlmIHJvd1NwYW4gaXMgMFxuICAgICAgcmVnaW9ucy5wdXNoIEBjcmVhdGVSZWdpb24ocmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZCwgY29sb3JNYXJrZXIpXG4gICAgZWxzZVxuICAgICAgcmVnaW9ucy5wdXNoIEBjcmVhdGVSZWdpb24oXG4gICAgICAgIHJhbmdlLnN0YXJ0LFxuICAgICAgICB7XG4gICAgICAgICAgcm93OiByYW5nZS5zdGFydC5yb3dcbiAgICAgICAgICBjb2x1bW46IEluZmluaXR5XG4gICAgICAgIH0sXG4gICAgICAgIGNvbG9yTWFya2VyLFxuICAgICAgICBAc2NyZWVuTGluZUZvclNjcmVlblJvdyh0ZXh0RWRpdG9yLCByYW5nZS5zdGFydC5yb3cpXG4gICAgICApXG4gICAgICBpZiByb3dTcGFuID4gMVxuICAgICAgICBmb3Igcm93IGluIFtyYW5nZS5zdGFydC5yb3cgKyAxLi4ucmFuZ2UuZW5kLnJvd11cbiAgICAgICAgICByZWdpb25zLnB1c2ggQGNyZWF0ZVJlZ2lvbihcbiAgICAgICAgICAgIHtyb3csIGNvbHVtbjogMH0sXG4gICAgICAgICAgICB7cm93LCBjb2x1bW46IEluZmluaXR5fSxcbiAgICAgICAgICAgIGNvbG9yTWFya2VyLFxuICAgICAgICAgICAgQHNjcmVlbkxpbmVGb3JTY3JlZW5Sb3codGV4dEVkaXRvciwgcm93KVxuICAgICAgICAgIClcblxuICAgICAgcmVnaW9ucy5wdXNoIEBjcmVhdGVSZWdpb24oXG4gICAgICAgIHtyb3c6IHJhbmdlLmVuZC5yb3csIGNvbHVtbjogMH0sXG4gICAgICAgIHJhbmdlLmVuZCxcbiAgICAgICAgY29sb3JNYXJrZXIsXG4gICAgICAgIEBzY3JlZW5MaW5lRm9yU2NyZWVuUm93KHRleHRFZGl0b3IsIHJhbmdlLmVuZC5yb3cpXG4gICAgICApXG5cbiAgICByZWdpb25zXG5cbiAgc2NyZWVuTGluZUZvclNjcmVlblJvdzogKHRleHRFZGl0b3IsIHJvdykgLT5cbiAgICBpZiB0ZXh0RWRpdG9yLnNjcmVlbkxpbmVGb3JTY3JlZW5Sb3c/XG4gICAgICB0ZXh0RWRpdG9yLnNjcmVlbkxpbmVGb3JTY3JlZW5Sb3cocm93KVxuICAgIGVsc2VcbiAgICAgIHRleHRFZGl0b3IuZGlzcGxheUJ1ZmZlci5zY3JlZW5MaW5lc1tyb3ddXG5cbiAgY3JlYXRlUmVnaW9uOiAoc3RhcnQsIGVuZCwgY29sb3JNYXJrZXIsIHNjcmVlbkxpbmUpIC0+XG4gICAgdGV4dEVkaXRvciA9IGNvbG9yTWFya2VyLmNvbG9yQnVmZmVyLmVkaXRvclxuICAgIHRleHRFZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpXG5cbiAgICByZXR1cm4gdW5sZXNzIHRleHRFZGl0b3JFbGVtZW50LmNvbXBvbmVudD9cblxuICAgIGxpbmVIZWlnaHQgPSB0ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgY2hhcldpZHRoID0gdGV4dEVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKClcblxuICAgIGNsaXBwZWRTdGFydCA9IHtcbiAgICAgIHJvdzogc3RhcnQucm93XG4gICAgICBjb2x1bW46IEBjbGlwU2NyZWVuQ29sdW1uKHNjcmVlbkxpbmUsIHN0YXJ0LmNvbHVtbikgPyBzdGFydC5jb2x1bW5cbiAgICB9XG4gICAgY2xpcHBlZEVuZCA9IHtcbiAgICAgIHJvdzogZW5kLnJvd1xuICAgICAgY29sdW1uOiBAY2xpcFNjcmVlbkNvbHVtbihzY3JlZW5MaW5lLCBlbmQuY29sdW1uKSA/IGVuZC5jb2x1bW5cbiAgICB9XG5cbiAgICBidWZmZXJSYW5nZSA9IHRleHRFZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZSh7XG4gICAgICBzdGFydDogY2xpcHBlZFN0YXJ0XG4gICAgICBlbmQ6IGNsaXBwZWRFbmRcbiAgICB9KVxuXG4gICAgbmVlZEFkanVzdG1lbnQgPSBzY3JlZW5MaW5lPy5pc1NvZnRXcmFwcGVkPygpIGFuZCBlbmQuY29sdW1uID49IHNjcmVlbkxpbmU/LnRleHQubGVuZ3RoIC0gc2NyZWVuTGluZT8uc29mdFdyYXBJbmRlbnRhdGlvbkRlbHRhXG5cbiAgICBidWZmZXJSYW5nZS5lbmQuY29sdW1uKysgaWYgbmVlZEFkanVzdG1lbnRcblxuICAgIHN0YXJ0UG9zaXRpb24gPSB0ZXh0RWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oY2xpcHBlZFN0YXJ0KVxuICAgIGVuZFBvc2l0aW9uID0gdGV4dEVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGNsaXBwZWRFbmQpXG5cbiAgICB0ZXh0ID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKS5nZXRUZXh0SW5SYW5nZShidWZmZXJSYW5nZSlcblxuICAgIGNzcyA9IHt9XG4gICAgY3NzLmxlZnQgPSBzdGFydFBvc2l0aW9uLmxlZnRcbiAgICBjc3MudG9wID0gc3RhcnRQb3NpdGlvbi50b3BcbiAgICBjc3Mud2lkdGggPSBlbmRQb3NpdGlvbi5sZWZ0IC0gc3RhcnRQb3NpdGlvbi5sZWZ0XG4gICAgY3NzLndpZHRoICs9IGNoYXJXaWR0aCBpZiBuZWVkQWRqdXN0bWVudFxuICAgIGNzcy5oZWlnaHQgPSBsaW5lSGVpZ2h0XG5cbiAgICByZWdpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHJlZ2lvbi5jbGFzc05hbWUgPSAncmVnaW9uJ1xuICAgIHJlZ2lvbi50ZXh0Q29udGVudCA9IHRleHQgaWYgQGluY2x1ZGVUZXh0SW5SZWdpb25cbiAgICByZWdpb24uaW52YWxpZCA9IHRydWUgaWYgc3RhcnRQb3NpdGlvbi5sZWZ0IGlzIGVuZFBvc2l0aW9uLmxlZnRcbiAgICByZWdpb24uc3R5bGVbbmFtZV0gPSB2YWx1ZSArICdweCcgZm9yIG5hbWUsIHZhbHVlIG9mIGNzc1xuXG4gICAgcmVnaW9uXG5cbiAgY2xpcFNjcmVlbkNvbHVtbjogKGxpbmUsIGNvbHVtbikgLT5cbiAgICBpZiBsaW5lP1xuICAgICAgaWYgbGluZS5jbGlwU2NyZWVuQ29sdW1uP1xuICAgICAgICBsaW5lLmNsaXBTY3JlZW5Db2x1bW4oY29sdW1uKVxuICAgICAgZWxzZVxuICAgICAgICBNYXRoLm1pbihsaW5lLmxpbmVUZXh0Lmxlbmd0aCwgY29sdW1uKVxuIl19
