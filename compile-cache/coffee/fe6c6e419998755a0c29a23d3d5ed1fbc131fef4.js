(function() {
  var WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  describe("pretty json", function() {
    var editor, editorView, minify, prettify, sortedPrettify, _ref;
    _ref = [], editor = _ref[0], editorView = _ref[1];
    prettify = function(callback) {
      editorView.trigger("pretty-json:prettify");
      return runs(callback);
    };
    minify = function(callback) {
      editorView.trigger("pretty-json:minify");
      return runs(callback);
    };
    sortedPrettify = function(callback) {
      editorView.trigger("pretty-json:sort-and-prettify");
      return runs(callback);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('pretty-json');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-json');
      });
      atom.workspaceView = new WorkspaceView;
      atom.workspaceView.openSync();
      editorView = atom.workspaceView.getActiveView();
      return editor = editorView.getEditor();
    });
    describe("when no text is selected", function() {
      return it("doesn't change anything", function() {
        editor.setText("Start\n{ \"a\": \"b\", \"c\": \"d\" }\nEnd");
        return prettify(function() {
          return expect(editor.getText()).toBe("Start\n{ \"a\": \"b\", \"c\": \"d\" }\nEnd");
        });
      });
    });
    describe("when a valid json text is selected", function() {
      return it("formats it correctly", function() {
        editor.setText("Start\n{ \"a\": \"b\", \"c\": \"d\" }\nEnd");
        editor.setSelectedBufferRange([[1, 0], [1, 22]]);
        return prettify(function() {
          return expect(editor.getText()).toBe("Start\n{\n  \"a\": \"b\",\n  \"c\": \"d\"\n}\nEnd");
        });
      });
    });
    describe("when an invalid json text is selected", function() {
      return it("doesn't change anything", function() {
        editor.setText("Start\n{]\nEnd");
        editor.setSelectedBufferRange([[1, 0], [1, 2]]);
        return prettify(function() {
          return expect(editor.getText()).toBe("Start\n{]\nEnd");
        });
      });
    });
    describe("JSON file", function() {
      beforeEach(function() {
        return editor.setGrammar(atom.syntax.selectGrammar('test.json'));
      });
      describe("with invalid JSON", function() {
        return it("doesn't change anything", function() {
          editor.setText("{]");
          return prettify(function() {
            return expect(editor.getText()).toBe("{]");
          });
        });
      });
      describe("with valid JSON", function() {
        return it("formats the whole file correctly", function() {
          editor.setText("{ \"a\": \"b\", \"c\": \"d\" }");
          return prettify(function() {
            return expect(editor.getText()).toBe("{\n  \"a\": \"b\",\n  \"c\": \"d\"\n}");
          });
        });
      });
      return describe("Sort and prettify", function() {
        beforeEach(function() {
          return editor.setGrammar(atom.syntax.selectGrammar('test.json'));
        });
        describe("with invalid JSON", function() {
          return it("doesn't change anything", function() {
            editor.setText("{]");
            return sortedPrettify(function() {
              return expect(editor.getText()).toBe("{]");
            });
          });
        });
        return describe("with valid JSON", function() {
          return it("formats the whole file correctly", function() {
            editor.setText("{ \"c\": \"d\", \"a\": \"b\" }");
            return sortedPrettify(function() {
              return expect(editor.getText()).toBe("{\n  \"a\": \"b\",\n  \"c\": \"d\"\n}");
            });
          });
        });
      });
    });
    describe("Minify JSON file", function() {
      beforeEach(function() {
        return editor.setGrammar(atom.syntax.selectGrammar('test.json'));
      });
      it("Returns same string from invalid JSON", function() {
        editor.setText("{\n  [\n}");
        return minify(function() {
          return expect(editor.getText()).toBe("{\n  [\n}");
        });
      });
      return it("Minifies valid JSON", function() {
        editor.setText("{\n  \"a\": \"b\",\n  \"c\": \"d\",\n  \"num\": 123\n}");
        return minify(function() {
          return expect(editor.getText()).toBe("{\"a\":\"b\",\"c\":\"d\",\"num\":123}");
        });
      });
    });
    return describe("Minify selected JSON", function() {
      return it("Minifies JSON data", function() {
        editor.setText("Start\n{\n  \"a\": \"b\",\n  \"c\": \"d\",\n  \"num\": 123\n}\nEnd");
        editor.setSelectedBufferRange([[1, 0], [5, 1]]);
        return minify(function() {
          return expect(editor.getText()).toBe("Start\n{\"a\":\"b\",\"c\":\"d\",\"num\":123}\nEnd");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9wcmV0dHktanNvbi9zcGVjL2luZGV4LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQyxnQkFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsYUFBRCxDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsMERBQUE7QUFBQSxJQUFBLE9BQXVCLEVBQXZCLEVBQUMsZ0JBQUQsRUFBUyxvQkFBVCxDQUFBO0FBQUEsSUFFQSxRQUFBLEdBQVcsU0FBQyxRQUFELEdBQUE7QUFDVCxNQUFBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLHNCQUFuQixDQUFBLENBQUE7YUFDQSxJQUFBLENBQUssUUFBTCxFQUZTO0lBQUEsQ0FGWCxDQUFBO0FBQUEsSUFNQSxNQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7QUFDUCxNQUFBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLG9CQUFuQixDQUFBLENBQUE7YUFDQSxJQUFBLENBQUssUUFBTCxFQUZPO0lBQUEsQ0FOVCxDQUFBO0FBQUEsSUFVQSxjQUFBLEdBQWlCLFNBQUMsUUFBRCxHQUFBO0FBQ2YsTUFBQSxVQUFVLENBQUMsT0FBWCxDQUFtQiwrQkFBbkIsQ0FBQSxDQUFBO2FBQ0EsSUFBQSxDQUFLLFFBQUwsRUFGZTtJQUFBLENBVmpCLENBQUE7QUFBQSxJQWNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGFBQTlCLEVBQUg7TUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxNQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGVBQTlCLEVBQUg7TUFBQSxDQUFoQixDQURBLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxhQUFMLEdBQXFCLEdBQUEsQ0FBQSxhQUhyQixDQUFBO0FBQUEsTUFJQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFNQSxVQUFBLEdBQWEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFuQixDQUFBLENBTmIsQ0FBQTthQU9BLE1BQUEsR0FBUyxVQUFVLENBQUMsU0FBWCxDQUFBLEVBUkE7SUFBQSxDQUFYLENBZEEsQ0FBQTtBQUFBLElBd0JBLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBLEdBQUE7YUFDbkMsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsNENBQWYsQ0FBQSxDQUFBO2VBTUEsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFDUCxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsNENBQTlCLEVBRE87UUFBQSxDQUFULEVBUDRCO01BQUEsQ0FBOUIsRUFEbUM7SUFBQSxDQUFyQyxDQXhCQSxDQUFBO0FBQUEsSUF1Q0EsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUEsR0FBQTthQUM3QyxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSw0Q0FBZixDQUFBLENBQUE7QUFBQSxRQUtBLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBUixDQUE5QixDQUxBLENBQUE7ZUFPQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUNQLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixtREFBOUIsRUFETztRQUFBLENBQVQsRUFSeUI7TUFBQSxDQUEzQixFQUQ2QztJQUFBLENBQS9DLENBdkNBLENBQUE7QUFBQSxJQTBEQSxRQUFBLENBQVMsdUNBQVQsRUFBa0QsU0FBQSxHQUFBO2FBQ2hELEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLGdCQUFmLENBQUEsQ0FBQTtBQUFBLFFBS0EsTUFBTSxDQUFDLHNCQUFQLENBQThCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSLENBQTlCLENBTEEsQ0FBQTtlQU9BLFFBQUEsQ0FBUyxTQUFBLEdBQUE7aUJBQ1AsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLGdCQUE5QixFQURPO1FBQUEsQ0FBVCxFQVI0QjtNQUFBLENBQTlCLEVBRGdEO0lBQUEsQ0FBbEQsQ0ExREEsQ0FBQTtBQUFBLElBMEVBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsV0FBMUIsQ0FBbEIsRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFHQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO2VBQzVCLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsVUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsQ0FBQSxDQUFBO2lCQUlBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7bUJBQ1AsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLElBQTlCLEVBRE87VUFBQSxDQUFULEVBTDRCO1FBQUEsQ0FBOUIsRUFENEI7TUFBQSxDQUE5QixDQUhBLENBQUE7QUFBQSxNQWNBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7ZUFDMUIsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxVQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsZ0NBQWYsQ0FBQSxDQUFBO2lCQUlBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7bUJBQ1AsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLHVDQUE5QixFQURPO1VBQUEsQ0FBVCxFQUxxQztRQUFBLENBQXZDLEVBRDBCO01BQUEsQ0FBNUIsQ0FkQSxDQUFBO2FBNEJBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixXQUExQixDQUFsQixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUdBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7aUJBQzVCLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsWUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsQ0FBQSxDQUFBO21CQUlBLGNBQUEsQ0FBZSxTQUFBLEdBQUE7cUJBQ2IsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLElBQTlCLEVBRGE7WUFBQSxDQUFmLEVBTDRCO1VBQUEsQ0FBOUIsRUFENEI7UUFBQSxDQUE5QixDQUhBLENBQUE7ZUFjQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO2lCQUMxQixFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFlBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxnQ0FBZixDQUFBLENBQUE7bUJBSUEsY0FBQSxDQUFlLFNBQUEsR0FBQTtxQkFDYixNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsdUNBQTlCLEVBRGE7WUFBQSxDQUFmLEVBTHFDO1VBQUEsQ0FBdkMsRUFEMEI7UUFBQSxDQUE1QixFQWY0QjtNQUFBLENBQTlCLEVBN0JvQjtJQUFBLENBQXRCLENBMUVBLENBQUE7QUFBQSxJQW9JQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixXQUExQixDQUFsQixFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUdBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBLEdBQUE7QUFDMUMsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO2VBTUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsV0FBOUIsRUFESztRQUFBLENBQVAsRUFQMEM7TUFBQSxDQUE1QyxDQUhBLENBQUE7YUFpQkEsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsd0RBQWYsQ0FBQSxDQUFBO2VBUUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsdUNBQTlCLEVBREs7UUFBQSxDQUFQLEVBVHdCO01BQUEsQ0FBMUIsRUFsQjJCO0lBQUEsQ0FBN0IsQ0FwSUEsQ0FBQTtXQW9LQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO2FBQy9CLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLG9FQUFmLENBQUEsQ0FBQTtBQUFBLFFBU0EsTUFBTSxDQUFDLHNCQUFQLENBQThCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSLENBQTlCLENBVEEsQ0FBQTtlQVdBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQ0wsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLG1EQUE5QixFQURLO1FBQUEsQ0FBUCxFQVp1QjtNQUFBLENBQXpCLEVBRCtCO0lBQUEsQ0FBakMsRUFyS3NCO0VBQUEsQ0FBeEIsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/pretty-json/spec/index-spec.coffee
