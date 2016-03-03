(function() {
  var MinimapBookmarks;

  MinimapBookmarks = require('../lib/minimap-bookmarks');

  describe("MinimapBookmarks", function() {
    var editor, minimap, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], editor = _ref[1], minimap = _ref[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.workspace.open('sample.coffee').then(function(e) {
          return editor = e;
        });
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('minimap').then(function(pkg) {
          return minimap = pkg.mainModule.minimapForEditor(editor);
        });
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('minimap-bookmarks');
      });
    });
    return describe("with an open editor that have a minimap", function() {
      var marker1, marker2, marker3, _ref1;
      _ref1 = [], marker1 = _ref1[0], marker2 = _ref1[1], marker3 = _ref1[2];
      return describe('when bookmarks markers are added to the editor', function() {
        beforeEach(function() {
          marker1 = editor.markBufferRange([[2, 0], [2, 0]], {
            "class": 'bookmark',
            invalidate: 'surround'
          });
          marker2 = editor.markBufferRange([[3, 0], [3, 0]], {
            "class": 'bookmark',
            invalidate: 'surround'
          });
          return marker3 = editor.markBufferRange([[1, 0], [1, 0]], {
            invalidate: 'surround'
          });
        });
        return it('creates decoration for the bookmark markers', function() {
          expect(Object.keys(minimap.decorationsByMarkerId).length).toEqual(2);
          marker1.destroy();
          expect(Object.keys(minimap.decorationsByMarkerId).length).toEqual(1);
          marker2.destroy();
          return expect(Object.keys(minimap.decorationsByMarkerId).length).toEqual(0);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWJvb2ttYXJrcy9zcGVjL21pbmltYXAtYm9va21hcmtzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDBCQUFSLENBQW5CLENBQUE7O0FBQUEsRUFPQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsdUNBQUE7QUFBQSxJQUFBLE9BQXNDLEVBQXRDLEVBQUMsMEJBQUQsRUFBbUIsZ0JBQW5CLEVBQTJCLGlCQUEzQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQURBLENBQUE7QUFBQSxNQUdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGVBQXBCLENBQW9DLENBQUMsSUFBckMsQ0FBMEMsU0FBQyxDQUFELEdBQUE7aUJBQ3hDLE1BQUEsR0FBUyxFQUQrQjtRQUFBLENBQTFDLEVBRGM7TUFBQSxDQUFoQixDQUhBLENBQUE7QUFBQSxNQU9BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFNBQTlCLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsU0FBQyxHQUFELEdBQUE7aUJBQzVDLE9BQUEsR0FBVSxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFmLENBQWdDLE1BQWhDLEVBRGtDO1FBQUEsQ0FBOUMsRUFEYztNQUFBLENBQWhCLENBUEEsQ0FBQTthQVdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLG1CQUE5QixFQURjO01BQUEsQ0FBaEIsRUFaUztJQUFBLENBQVgsQ0FGQSxDQUFBO1dBaUJBLFFBQUEsQ0FBUyx5Q0FBVCxFQUFvRCxTQUFBLEdBQUE7QUFDbEQsVUFBQSxnQ0FBQTtBQUFBLE1BQUEsUUFBOEIsRUFBOUIsRUFBQyxrQkFBRCxFQUFVLGtCQUFWLEVBQW1CLGtCQUFuQixDQUFBO2FBQ0EsUUFBQSxDQUFTLGdEQUFULEVBQTJELFNBQUEsR0FBQTtBQUN6RCxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsZUFBUCxDQUF1QixDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFPLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBUCxDQUF2QixFQUFzQztBQUFBLFlBQUEsT0FBQSxFQUFPLFVBQVA7QUFBQSxZQUFtQixVQUFBLEVBQVksVUFBL0I7V0FBdEMsQ0FBVixDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBTyxDQUFDLENBQUQsRUFBRyxDQUFILENBQVAsQ0FBdkIsRUFBc0M7QUFBQSxZQUFBLE9BQUEsRUFBTyxVQUFQO0FBQUEsWUFBbUIsVUFBQSxFQUFZLFVBQS9CO1dBQXRDLENBRFYsQ0FBQTtpQkFHQSxPQUFBLEdBQVUsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBTyxDQUFDLENBQUQsRUFBRyxDQUFILENBQVAsQ0FBdkIsRUFBc0M7QUFBQSxZQUFBLFVBQUEsRUFBWSxVQUFaO1dBQXRDLEVBSkQ7UUFBQSxDQUFYLENBQUEsQ0FBQTtlQU1BLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBLEdBQUE7QUFDaEQsVUFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMscUJBQXBCLENBQTBDLENBQUMsTUFBbEQsQ0FBeUQsQ0FBQyxPQUExRCxDQUFrRSxDQUFsRSxDQUFBLENBQUE7QUFBQSxVQUVBLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FGQSxDQUFBO0FBQUEsVUFJQSxNQUFBLENBQU8sTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMscUJBQXBCLENBQTBDLENBQUMsTUFBbEQsQ0FBeUQsQ0FBQyxPQUExRCxDQUFrRSxDQUFsRSxDQUpBLENBQUE7QUFBQSxVQU1BLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FOQSxDQUFBO2lCQVFBLE1BQUEsQ0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxxQkFBcEIsQ0FBMEMsQ0FBQyxNQUFsRCxDQUF5RCxDQUFDLE9BQTFELENBQWtFLENBQWxFLEVBVGdEO1FBQUEsQ0FBbEQsRUFQeUQ7TUFBQSxDQUEzRCxFQUZrRDtJQUFBLENBQXBELEVBbEIyQjtFQUFBLENBQTdCLENBUEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/minimap-bookmarks/spec/minimap-bookmarks-spec.coffee
