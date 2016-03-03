(function() {
  var packagesToTest;

  packagesToTest = {
    SASS: {
      name: 'language-sass',
      file: 'test.scss'
    }
  };

  describe("CSS property name and value autocompletions", function() {
    var editor, getCompletions, provider, _ref;
    _ref = [], editor = _ref[0], provider = _ref[1];
    getCompletions = function() {
      var cursor, end, prefix, request, start;
      cursor = editor.getLastCursor();
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      prefix = editor.getTextInRange([start, end]);
      request = {
        editor: editor,
        bufferPosition: end,
        scopeDescriptor: cursor.getScopeDescriptor(),
        prefix: prefix
      };
      return provider.getSuggestions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-sass');
      });
      runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-sass').mainModule.getProvider();
      });
      return waitsFor(function() {
        return Object.keys(provider.properties).length > 0;
      });
    });
    return describe("SASS files", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-sass');
        });
        waitsForPromise(function() {
          return atom.workspace.open('test.sass');
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("autocompletes property names with a prefix", function() {
        var completions;
        editor.setText("body\n  d");
        editor.setCursorBufferPosition([1, 3]);
        completions = getCompletions();
        expect(completions[0].text).toBe('display: ');
        expect(completions[0].displayText).toBe('display');
        expect(completions[0].type).toBe('property');
        expect(completions[0].replacementPrefix).toBe('d');
        expect(completions[0].description.length).toBeGreaterThan(0);
        expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0);
        expect(completions[1].text).toBe('direction: ');
        expect(completions[1].displayText).toBe('direction');
        expect(completions[1].type).toBe('property');
        expect(completions[1].replacementPrefix).toBe('d');
        editor.setText("body\n  D");
        editor.setCursorBufferPosition([1, 3]);
        completions = getCompletions();
        expect(completions.length).toBe(11);
        expect(completions[0].text).toBe('display: ');
        expect(completions[1].text).toBe('direction: ');
        expect(completions[1].replacementPrefix).toBe('D');
        editor.setText("body\n  d:");
        editor.setCursorBufferPosition([1, 3]);
        completions = getCompletions();
        expect(completions[0].text).toBe('display: ');
        expect(completions[1].text).toBe('direction: ');
        editor.setText("body\n  bord");
        editor.setCursorBufferPosition([1, 6]);
        completions = getCompletions();
        expect(completions[0].text).toBe('border: ');
        expect(completions[0].displayText).toBe('border');
        return expect(completions[0].replacementPrefix).toBe('bord');
      });
      it("triggers autocomplete when an property name has been inserted", function() {
        var args, suggestion;
        spyOn(atom.commands, 'dispatch');
        suggestion = {
          type: 'property',
          text: 'whatever'
        };
        provider.onDidInsertSuggestion({
          editor: editor,
          suggestion: suggestion
        });
        advanceClock(1);
        expect(atom.commands.dispatch).toHaveBeenCalled();
        args = atom.commands.dispatch.mostRecentCall.args;
        expect(args[0].tagName.toLowerCase()).toBe('atom-text-editor');
        return expect(args[1]).toBe('autocomplete-plus:activate');
      });
      it("autocompletes property values without a prefix", function() {
        var completion, completions, _i, _j, _len, _len1, _results;
        editor.setText("body\n  display:");
        editor.setCursorBufferPosition([1, 10]);
        completions = getCompletions();
        expect(completions.length).toBe(21);
        for (_i = 0, _len = completions.length; _i < _len; _i++) {
          completion = completions[_i];
          expect(completion.text.length).toBeGreaterThan(0);
          expect(completion.description.length).toBeGreaterThan(0);
          expect(completion.descriptionMoreURL.length).toBeGreaterThan(0);
        }
        editor.setText("body\n  display:");
        editor.setCursorBufferPosition([2, 0]);
        completions = getCompletions();
        expect(completions.length).toBe(21);
        _results = [];
        for (_j = 0, _len1 = completions.length; _j < _len1; _j++) {
          completion = completions[_j];
          _results.push(expect(completion.text.length).toBeGreaterThan(0));
        }
        return _results;
      });
      it("autocompletes property values with a prefix", function() {
        var completions;
        editor.setText("body\n  display: i");
        editor.setCursorBufferPosition([1, 12]);
        completions = getCompletions();
        expect(completions[0].text).toBe('inline');
        expect(completions[0].description.length).toBeGreaterThan(0);
        expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0);
        expect(completions[1].text).toBe('inline-block');
        expect(completions[2].text).toBe('inline-flex');
        expect(completions[3].text).toBe('inline-grid');
        expect(completions[4].text).toBe('inline-table');
        expect(completions[5].text).toBe('inherit');
        editor.setText("body\n  display: I");
        editor.setCursorBufferPosition([1, 12]);
        completions = getCompletions();
        expect(completions.length).toBe(6);
        expect(completions[0].text).toBe('inline');
        expect(completions[1].text).toBe('inline-block');
        expect(completions[2].text).toBe('inline-flex');
        expect(completions[3].text).toBe('inline-grid');
        expect(completions[4].text).toBe('inline-table');
        return expect(completions[5].text).toBe('inherit');
      });
      describe("tags", function() {
        it("autocompletes with a prefix", function() {
          var completions;
          editor.setText("ca");
          editor.setCursorBufferPosition([0, 2]);
          completions = getCompletions();
          expect(completions.length).toBe(7);
          expect(completions[0].text).toBe('canvas');
          expect(completions[0].type).toBe('tag');
          expect(completions[0].description).toBe('Selector for <canvas> elements');
          expect(completions[1].text).toBe('code');
          editor.setText("canvas,ca");
          editor.setCursorBufferPosition([0, 9]);
          completions = getCompletions();
          expect(completions.length).toBe(7);
          expect(completions[0].text).toBe('canvas');
          editor.setText("canvas ca");
          editor.setCursorBufferPosition([0, 9]);
          completions = getCompletions();
          expect(completions.length).toBe(7);
          expect(completions[0].text).toBe('canvas');
          editor.setText("canvas, ca");
          editor.setCursorBufferPosition([0, 10]);
          completions = getCompletions();
          expect(completions.length).toBe(7);
          return expect(completions[0].text).toBe('canvas');
        });
        return it("does not autocomplete when prefix is preceded by class or id char", function() {
          var completions;
          editor.setText(".ca");
          editor.setCursorBufferPosition([0, 3]);
          completions = getCompletions();
          expect(completions).toBe(null);
          editor.setText("#ca");
          editor.setCursorBufferPosition([0, 3]);
          completions = getCompletions();
          return expect(completions).toBe(null);
        });
      });
      return describe("pseudo selectors", function() {
        it("autocompletes without a prefix", function() {
          var completion, completions, text, _i, _len, _results;
          editor.setText("div:");
          editor.setCursorBufferPosition([0, 4]);
          completions = getCompletions();
          expect(completions.length).toBe(43);
          _results = [];
          for (_i = 0, _len = completions.length; _i < _len; _i++) {
            completion = completions[_i];
            text = completion.text || completion.snippet;
            expect(text.length).toBeGreaterThan(0);
            _results.push(expect(completion.type).toBe('pseudo-selector'));
          }
          return _results;
        });
        xit("autocompletes with a prefix", function() {
          var completions;
          editor.setText("div:f {\n}");
          editor.setCursorBufferPosition([0, 5]);
          completions = getCompletions();
          expect(completions.length).toBe(5);
          expect(completions[0].text).toBe(':first');
          expect(completions[0].type).toBe('pseudo-selector');
          expect(completions[0].description.length).toBeGreaterThan(0);
          return expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0);
        });
        xit("autocompletes with arguments", function() {
          var completions;
          editor.setText("div:nth {\n}");
          editor.setCursorBufferPosition([0, 7]);
          completions = getCompletions();
          expect(completions.length).toBe(4);
          expect(completions[0].snippet).toBe(':nth-child(${1:an+b})');
          expect(completions[0].type).toBe('pseudo-selector');
          expect(completions[0].description.length).toBeGreaterThan(0);
          return expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0);
        });
        return xit("autocompletes when nothing precedes the colon", function() {
          var completions;
          editor.setText(":f {\n}");
          editor.setCursorBufferPosition([0, 2]);
          completions = getCompletions();
          expect(completions.length).toBe(5);
          return expect(completions[0].text).toBe(':first');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc2Fzcy9zcGVjL3Byb3ZpZGVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLGVBQU47QUFBQSxNQUNBLElBQUEsRUFBTSxXQUROO0tBREY7R0FERixDQUFBOztBQUFBLEVBS0EsUUFBQSxDQUFTLDZDQUFULEVBQXdELFNBQUEsR0FBQTtBQUN0RCxRQUFBLHNDQUFBO0FBQUEsSUFBQSxPQUFxQixFQUFyQixFQUFDLGdCQUFELEVBQVMsa0JBQVQsQ0FBQTtBQUFBLElBRUEsY0FBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLG1DQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxNQUFNLENBQUMsdUNBQVAsQ0FBQSxDQURSLENBQUE7QUFBQSxNQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUZOLENBQUE7QUFBQSxNQUdBLE1BQUEsR0FBUyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLEtBQUQsRUFBUSxHQUFSLENBQXRCLENBSFQsQ0FBQTtBQUFBLE1BSUEsT0FBQSxHQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLFFBQ0EsY0FBQSxFQUFnQixHQURoQjtBQUFBLFFBRUEsZUFBQSxFQUFpQixNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQUZqQjtBQUFBLFFBR0EsTUFBQSxFQUFRLE1BSFI7T0FMRixDQUFBO2FBU0EsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEIsRUFWZTtJQUFBLENBRmpC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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-sass/spec/provider-spec.coffee