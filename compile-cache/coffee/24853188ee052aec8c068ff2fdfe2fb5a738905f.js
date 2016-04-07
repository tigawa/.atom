(function() {
  var Flasher, Range, settings;

  settings = require('./settings');

  Range = require('atom').Range;

  module.exports = Flasher = (function() {
    function Flasher() {}

    Flasher.flash = function() {
      var editor, marker, point, spec;
      Flasher.clear();
      editor = atom.workspace.getActiveTextEditor();
      spec = (function() {
        switch (settings.get('flashType')) {
          case 'line':
            return {
              type: 'line',
              range: editor.getLastCursor().getCurrentLineBufferRange()
            };
          case 'word':
            return {
              type: 'highlight',
              range: editor.getLastCursor().getCurrentWordBufferRange()
            };
          case 'point':
            point = editor.getCursorBufferPosition();
            return {
              type: 'highlight',
              range: new Range(point, point.translate([0, 1]))
            };
        }
      })();
      marker = editor.markBufferRange(spec.range, {
        invalidate: 'never',
        persistent: false
      });
      Flasher.decoration = editor.decorateMarker(marker, {
        type: spec.type,
        "class": "cursor-history-" + (settings.get('flashColor'))
      });
      return Flasher.timeoutID = setTimeout(function() {
        return Flasher.decoration.getMarker().destroy();
      }, settings.get('flashDurationMilliSeconds'));
    };

    Flasher.clear = function() {
      var _ref;
      if ((_ref = Flasher.decoration) != null) {
        _ref.getMarker().destroy();
      }
      return clearTimeout(Flasher.timeoutID);
    };

    return Flasher;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvZmxhc2hlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0JBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVksT0FBQSxDQUFRLFlBQVIsQ0FBWixDQUFBOztBQUFBLEVBQ0MsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007eUJBQ0o7O0FBQUEsSUFBQSxPQUFDLENBQUEsS0FBRCxHQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEsMkJBQUE7QUFBQSxNQUFBLE9BQUMsQ0FBQSxLQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBRFQsQ0FBQTtBQUFBLE1BRUEsSUFBQTtBQUNFLGdCQUFPLFFBQVEsQ0FBQyxHQUFULENBQWEsV0FBYixDQUFQO0FBQUEsZUFDTyxNQURQO21CQUVJO0FBQUEsY0FBQSxJQUFBLEVBQU0sTUFBTjtBQUFBLGNBQ0EsS0FBQSxFQUFPLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyx5QkFBdkIsQ0FBQSxDQURQO2NBRko7QUFBQSxlQUlPLE1BSlA7bUJBS0k7QUFBQSxjQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsY0FDQSxLQUFBLEVBQU8sTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFzQixDQUFDLHlCQUF2QixDQUFBLENBRFA7Y0FMSjtBQUFBLGVBT08sT0FQUDtBQVFJLFlBQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVIsQ0FBQTttQkFDQTtBQUFBLGNBQUEsSUFBQSxFQUFNLFdBQU47QUFBQSxjQUNBLEtBQUEsRUFBVyxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFoQixDQUFiLENBRFg7Y0FUSjtBQUFBO1VBSEYsQ0FBQTtBQUFBLE1BZUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxlQUFQLENBQXVCLElBQUksQ0FBQyxLQUE1QixFQUNQO0FBQUEsUUFBQSxVQUFBLEVBQVksT0FBWjtBQUFBLFFBQ0EsVUFBQSxFQUFZLEtBRFo7T0FETyxDQWZULENBQUE7QUFBQSxNQW1CQSxPQUFDLENBQUEsVUFBRCxHQUFjLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLEVBQ1o7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFJLENBQUMsSUFBWDtBQUFBLFFBQ0EsT0FBQSxFQUFRLGlCQUFBLEdBQWdCLENBQUMsUUFBUSxDQUFDLEdBQVQsQ0FBYSxZQUFiLENBQUQsQ0FEeEI7T0FEWSxDQW5CZCxDQUFBO2FBdUJBLE9BQUMsQ0FBQSxTQUFELEdBQWEsVUFBQSxDQUFZLFNBQUEsR0FBQTtlQUN2QixPQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBQSxDQUF1QixDQUFDLE9BQXhCLENBQUEsRUFEdUI7TUFBQSxDQUFaLEVBRVgsUUFBUSxDQUFDLEdBQVQsQ0FBYSwyQkFBYixDQUZXLEVBeEJQO0lBQUEsQ0FBUixDQUFBOztBQUFBLElBNEJBLE9BQUMsQ0FBQSxLQUFELEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxJQUFBOztZQUFXLENBQUUsU0FBYixDQUFBLENBQXdCLENBQUMsT0FBekIsQ0FBQTtPQUFBO2FBQ0EsWUFBQSxDQUFhLE9BQUMsQ0FBQSxTQUFkLEVBRk07SUFBQSxDQTVCUixDQUFBOzttQkFBQTs7TUFMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/cursor-history/lib/flasher.coffee
