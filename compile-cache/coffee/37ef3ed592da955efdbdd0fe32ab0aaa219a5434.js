(function() {
  var fs, path, temp;

  temp = require('temp').track();

  path = require('path');

  fs = require('fs-plus');

  describe('Autocomplete Manager', function() {
    var autocompleteManager, completionDelay, didAutocomplete, directory, editor, editorView, filePath, mainModule, _ref;
    _ref = [], directory = _ref[0], filePath = _ref[1], completionDelay = _ref[2], editorView = _ref[3], editor = _ref[4], mainModule = _ref[5], autocompleteManager = _ref[6], didAutocomplete = _ref[7];
    beforeEach(function() {
      runs(function() {
        var sample, workspaceElement;
        directory = temp.mkdirSync();
        sample = 'var quicksort = function () {\n  var sort = function(items) {\n    if (items.length <= 1) return items;\n    var pivot = items.shift(), current, left = [], right = [];\n    while(items.length > 0) {\n      current = items.shift();\n      current < pivot ? left.push(current) : right.push(current);\n    }\n    return sort(left).concat(pivot).concat(sort(right));\n  };\n\n  return sort(Array.apply(this, arguments));\n};\n';
        filePath = path.join(directory, 'sample.js');
        fs.writeFileSync(filePath, sample);
        atom.config.set('autosave.enabled', true);
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('editor.fontSize', '16');
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('autosave');
      });
      waitsForPromise(function() {
        return atom.workspace.open(filePath).then(function(e) {
          editor = e;
          return editorView = atom.views.getView(editor);
        });
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
          return mainModule = a.mainModule;
        });
      });
      waitsFor(function() {
        var _ref1;
        return (_ref1 = mainModule.autocompleteManager) != null ? _ref1.ready : void 0;
      });
      return runs(function() {
        var displaySuggestions;
        advanceClock(mainModule.autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
        autocompleteManager = mainModule.autocompleteManager;
        displaySuggestions = autocompleteManager.displaySuggestions;
        return spyOn(autocompleteManager, 'displaySuggestions').andCallFake(function(suggestions, options) {
          displaySuggestions(suggestions, options);
          return didAutocomplete = true;
        });
      });
    });
    afterEach(function() {
      return didAutocomplete = false;
    });
    return describe('autosave compatibility', function() {
      return it('keeps the suggestion list open while saving', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.moveToBeginningOfLine();
          editor.insertText('f');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return didAutocomplete === true;
        });
        runs(function() {
          editor.save();
          didAutocomplete = false;
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          editor.insertText('u');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return didAutocomplete === true;
        });
        return runs(function() {
          var suggestionListView;
          editor.save();
          didAutocomplete = false;
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
          return expect(editor.getBuffer().getLastLine()).toEqual('function');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLWF1dG9zYXZlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUEsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUZMLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFFBQUEsZ0hBQUE7QUFBQSxJQUFBLE9BQStHLEVBQS9HLEVBQUMsbUJBQUQsRUFBWSxrQkFBWixFQUFzQix5QkFBdEIsRUFBdUMsb0JBQXZDLEVBQW1ELGdCQUFuRCxFQUEyRCxvQkFBM0QsRUFBdUUsNkJBQXZFLEVBQTRGLHlCQUE1RixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsWUFBQSx3QkFBQTtBQUFBLFFBQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBWixDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsd2FBRFQsQ0FBQTtBQUFBLFFBaUJBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsV0FBckIsQ0FqQlgsQ0FBQTtBQUFBLFFBa0JBLEVBQUUsQ0FBQyxhQUFILENBQWlCLFFBQWpCLEVBQTJCLE1BQTNCLENBbEJBLENBQUE7QUFBQSxRQXFCQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/autocomplete-manager-autosave-spec.coffee
