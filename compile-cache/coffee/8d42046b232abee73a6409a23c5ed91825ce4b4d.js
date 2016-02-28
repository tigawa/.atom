(function() {
  var completionDelay;

  completionDelay = 100;

  beforeEach(function() {
    spyOn(atom.views, 'readDocument').andCallFake(function(fn) {
      return fn();
    });
    spyOn(atom.views, 'updateDocument').andCallFake(function(fn) {
      return fn();
    });
    atom.config.set('autocomplete-plus.defaultProvider', 'Symbol');
    atom.config.set('autocomplete-plus.minimumWordLength', 1);
    atom.config.set('autocomplete-plus.suggestionListFollows', 'Word');
    atom.config.set('autocomplete-plus.useCoreMovementCommands', true);
    return atom.config.set('autocomplete-plus.includeCompletionsFromAllBuffers', false);
  });

  exports.triggerAutocompletion = function(editor, moveCursor, char) {
    if (moveCursor == null) {
      moveCursor = true;
    }
    if (char == null) {
      char = 'f';
    }
    if (moveCursor) {
      editor.moveToBottom();
      editor.moveToBeginningOfLine();
    }
    editor.insertText(char);
    return exports.waitForAutocomplete();
  };

  exports.waitForAutocomplete = function() {
    advanceClock(completionDelay);
    return waitsFor('autocomplete to show', function(done) {
      return setImmediate(function() {
        advanceClock(10);
        return setImmediate(function() {
          advanceClock(10);
          return done();
        });
      });
    });
  };

  exports.buildIMECompositionEvent = function(event, _arg) {
    var data, target, _ref;
    _ref = _arg != null ? _arg : {}, data = _ref.data, target = _ref.target;
    event = new CustomEvent(event, {
      bubbles: true
    });
    event.data = data;
    Object.defineProperty(event, 'target', {
      get: function() {
        return target;
      }
    });
    return event;
  };

  exports.buildTextInputEvent = function(_arg) {
    var data, event, target;
    data = _arg.data, target = _arg.target;
    event = new CustomEvent('textInput', {
      bubbles: true
    });
    event.data = data;
    Object.defineProperty(event, 'target', {
      get: function() {
        return target;
      }
    });
    return event;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3NwZWMtaGVscGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxlQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixHQUFsQixDQUFBOztBQUFBLEVBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULElBQUEsS0FBQSxDQUFNLElBQUksQ0FBQyxLQUFYLEVBQWtCLGNBQWxCLENBQWlDLENBQUMsV0FBbEMsQ0FBOEMsU0FBQyxFQUFELEdBQUE7YUFBUSxFQUFBLENBQUEsRUFBUjtJQUFBLENBQTlDLENBQUEsQ0FBQTtBQUFBLElBQ0EsS0FBQSxDQUFNLElBQUksQ0FBQyxLQUFYLEVBQWtCLGdCQUFsQixDQUFtQyxDQUFDLFdBQXBDLENBQWdELFNBQUMsRUFBRCxHQUFBO2FBQVEsRUFBQSxDQUFBLEVBQVI7SUFBQSxDQUFoRCxDQURBLENBQUE7QUFBQSxJQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQ0FBaEIsRUFBcUQsUUFBckQsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLEVBQXVELENBQXZELENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixFQUEyRCxNQUEzRCxDQUpBLENBQUE7QUFBQSxJQUtBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQ0FBaEIsRUFBNkQsSUFBN0QsQ0FMQSxDQUFBO1dBTUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9EQUFoQixFQUFzRSxLQUF0RSxFQVBTO0VBQUEsQ0FBWCxDQUZBLENBQUE7O0FBQUEsRUFXQSxPQUFPLENBQUMscUJBQVIsR0FBZ0MsU0FBQyxNQUFELEVBQVMsVUFBVCxFQUE0QixJQUE1QixHQUFBOztNQUFTLGFBQWE7S0FDcEQ7O01BRDBELE9BQU87S0FDakU7QUFBQSxJQUFBLElBQUcsVUFBSDtBQUNFLE1BQUEsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBREEsQ0FERjtLQUFBO0FBQUEsSUFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQixDQUhBLENBQUE7V0FJQSxPQUFPLENBQUMsbUJBQVIsQ0FBQSxFQUw4QjtFQUFBLENBWGhDLENBQUE7O0FBQUEsRUFrQkEsT0FBTyxDQUFDLG1CQUFSLEdBQThCLFNBQUEsR0FBQTtBQUM1QixJQUFBLFlBQUEsQ0FBYSxlQUFiLENBQUEsQ0FBQTtXQUNBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFDLElBQUQsR0FBQTthQUMvQixZQUFBLENBQWEsU0FBQSxHQUFBO0FBQ1gsUUFBQSxZQUFBLENBQWEsRUFBYixDQUFBLENBQUE7ZUFDQSxZQUFBLENBQWEsU0FBQSxHQUFBO0FBQ1gsVUFBQSxZQUFBLENBQWEsRUFBYixDQUFBLENBQUE7aUJBQ0EsSUFBQSxDQUFBLEVBRlc7UUFBQSxDQUFiLEVBRlc7TUFBQSxDQUFiLEVBRCtCO0lBQUEsQ0FBakMsRUFGNEI7RUFBQSxDQWxCOUIsQ0FBQTs7QUFBQSxFQTJCQSxPQUFPLENBQUMsd0JBQVIsR0FBbUMsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ2pDLFFBQUEsa0JBQUE7QUFBQSwwQkFEeUMsT0FBaUIsSUFBaEIsWUFBQSxNQUFNLGNBQUEsTUFDaEQsQ0FBQTtBQUFBLElBQUEsS0FBQSxHQUFZLElBQUEsV0FBQSxDQUFZLEtBQVosRUFBbUI7QUFBQSxNQUFDLE9BQUEsRUFBUyxJQUFWO0tBQW5CLENBQVosQ0FBQTtBQUFBLElBQ0EsS0FBSyxDQUFDLElBQU4sR0FBYSxJQURiLENBQUE7QUFBQSxJQUVBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLFFBQTdCLEVBQXVDO0FBQUEsTUFBQyxHQUFBLEVBQUssU0FBQSxHQUFBO2VBQUcsT0FBSDtNQUFBLENBQU47S0FBdkMsQ0FGQSxDQUFBO1dBR0EsTUFKaUM7RUFBQSxDQTNCbkMsQ0FBQTs7QUFBQSxFQWlDQSxPQUFPLENBQUMsbUJBQVIsR0FBOEIsU0FBQyxJQUFELEdBQUE7QUFDNUIsUUFBQSxtQkFBQTtBQUFBLElBRDhCLFlBQUEsTUFBTSxjQUFBLE1BQ3BDLENBQUE7QUFBQSxJQUFBLEtBQUEsR0FBWSxJQUFBLFdBQUEsQ0FBWSxXQUFaLEVBQXlCO0FBQUEsTUFBQyxPQUFBLEVBQVMsSUFBVjtLQUF6QixDQUFaLENBQUE7QUFBQSxJQUNBLEtBQUssQ0FBQyxJQUFOLEdBQWEsSUFEYixDQUFBO0FBQUEsSUFFQSxNQUFNLENBQUMsY0FBUCxDQUFzQixLQUF0QixFQUE2QixRQUE3QixFQUF1QztBQUFBLE1BQUMsR0FBQSxFQUFLLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQUFOO0tBQXZDLENBRkEsQ0FBQTtXQUdBLE1BSjRCO0VBQUEsQ0FqQzlCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/spec-helper.coffee
