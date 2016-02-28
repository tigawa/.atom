(function() {
  var Range, Selector, SymbolStore;

  SymbolStore = require('../lib/symbol-store');

  Selector = require('selector-kit').Selector;

  Range = require('atom').Range;

  describe('SymbolStore', function() {
    var buffer, editor, store, _ref;
    _ref = [], store = _ref[0], editor = _ref[1], buffer = _ref[2];
    beforeEach(function() {
      waitsForPromise(function() {
        return Promise.all([
          atom.packages.activatePackage("language-coffee-script"), atom.workspace.open('sample.coffee').then(function(e) {
            return editor = e;
          })
        ]);
      });
      return runs(function() {
        store = new SymbolStore(/\b\w*[a-zA-Z_-]+\w*\b/g);
        editor.setText('');
        return editor.getBuffer().onDidChange(function(_arg) {
          var newRange, oldRange;
          oldRange = _arg.oldRange, newRange = _arg.newRange;
          return store.recomputeSymbolsForEditorInBufferRange(editor, oldRange.start, oldRange.getExtent(), newRange.getExtent());
        });
      });
    });
    describe("::symbolsForConfig(config)", function() {
      it("gets a list of symbols matching the passed in configuration", function() {
        var config, occurrences;
        config = {
          "function": {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        occurrences = store.symbolsForConfig(config, null, 'ab');
        expect(occurrences.length).toBe(1);
        expect(occurrences[0].symbol.text).toBe('abc');
        return expect(occurrences[0].symbol.type).toBe('function');
      });
      it("updates the symbol types as new tokens come in", function() {
        var config, occurrences;
        config = {
          variable: {
            selectors: Selector.create('.variable'),
            typePriority: 2
          },
          "function": {
            selectors: Selector.create('.function'),
            typePriority: 3
          },
          "class": {
            selectors: Selector.create('.class.name'),
            typePriority: 4
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        occurrences = store.symbolsForConfig(config, null, 'a');
        expect(occurrences.length).toBe(2);
        expect(occurrences[0].symbol.text).toBe('abc');
        expect(occurrences[0].symbol.type).toBe('function');
        expect(occurrences[1].symbol.text).toBe('avar');
        expect(occurrences[1].symbol.type).toBe('variable');
        editor.setCursorBufferPosition([0, 0]);
        editor.insertText('class abc');
        occurrences = store.symbolsForConfig(config, null, 'a');
        expect(occurrences.length).toBe(2);
        expect(occurrences[0].symbol.text).toBe('abc');
        expect(occurrences[0].symbol.type).toBe('class');
        expect(occurrences[1].symbol.text).toBe('avar');
        return expect(occurrences[1].symbol.type).toBe('variable');
      });
      it("returns symbols with an empty type", function() {
        var config, occurrences;
        config = {
          '': {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        occurrences = store.symbolsForConfig(config, null, 'a');
        expect(occurrences.length).toBe(1);
        expect(occurrences[0].symbol.text).toBe('abc');
        return expect(occurrences[0].symbol.type).toBe('');
      });
      return it("resets the types when a new config is used", function() {
        var config, occurrences;
        config = {
          'function': {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        occurrences = store.symbolsForConfig(config, null, 'a');
        expect(occurrences.length).toBe(1);
        expect(occurrences[0].symbol.text).toBe('abc');
        expect(occurrences[0].symbol.type).toBe('function');
        config = {
          'newtype': {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        occurrences = store.symbolsForConfig(config, null, 'a');
        expect(occurrences.length).toBe(1);
        expect(occurrences[0].symbol.text).toBe('abc');
        return expect(occurrences[0].symbol.type).toBe('newtype');
      });
    });
    return describe("when there are multiple files with tokens in the store", function() {
      var config, editor1, editor2, _ref1;
      _ref1 = [], config = _ref1[0], editor1 = _ref1[1], editor2 = _ref1[2];
      beforeEach(function() {
        config = {
          stuff: {
            selectors: Selector.create('.text.plain.null-grammar')
          }
        };
        waitsForPromise(function() {
          return Promise.all([
            atom.workspace.open('one.txt').then(function(editor) {
              return editor1 = editor;
            }), atom.workspace.open('two.txt').then(function(editor) {
              return editor2 = editor;
            })
          ]);
        });
        return runs(function() {
          var oldExtent, start;
          editor1.moveToBottom();
          editor1.insertText(" humongous hill");
          editor2.moveToBottom();
          editor2.insertText(" hello hola");
          start = {
            row: 0,
            column: 0
          };
          oldExtent = {
            row: 0,
            column: 0
          };
          store.recomputeSymbolsForEditorInBufferRange(editor1, start, oldExtent, editor1.getBuffer().getRange().getExtent());
          return store.recomputeSymbolsForEditorInBufferRange(editor2, start, oldExtent, editor2.getBuffer().getRange().getExtent());
        });
      });
      describe("::symbolsForConfig(config)", function() {
        return it("returs symbols based on path", function() {
          var occurrences;
          occurrences = store.symbolsForConfig(config, [editor1.getBuffer()], 'h');
          expect(occurrences).toHaveLength(2);
          expect(occurrences[0].symbol.text).toBe('humongous');
          expect(occurrences[1].symbol.text).toBe('hill');
          occurrences = store.symbolsForConfig(config, [editor2.getBuffer()], 'h');
          expect(occurrences).toHaveLength(2);
          expect(occurrences[0].symbol.text).toBe('hello');
          return expect(occurrences[1].symbol.text).toBe('hola');
        });
      });
      return describe("::clear()", function() {
        return describe("when a buffer is specified", function() {
          return it("removes only the path specified", function() {
            var occurrences;
            occurrences = store.symbolsForConfig(config, null, 'h');
            expect(occurrences).toHaveLength(4);
            expect(occurrences[0].symbol.text).toBe('humongous');
            expect(occurrences[1].symbol.text).toBe('hill');
            expect(occurrences[2].symbol.text).toBe('hello');
            expect(occurrences[3].symbol.text).toBe('hola');
            store.clear(editor1.getBuffer());
            occurrences = store.symbolsForConfig(config, null, 'h');
            expect(occurrences).toHaveLength(2);
            expect(occurrences[0].symbol.text).toBe('hello');
            return expect(occurrences[1].symbol.text).toBe('hola');
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3N5bWJvbC1zdG9yZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0QkFBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0MsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBREQsQ0FBQTs7QUFBQSxFQUVDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSwyQkFBQTtBQUFBLElBQUEsT0FBMEIsRUFBMUIsRUFBQyxlQUFELEVBQVEsZ0JBQVIsRUFBZ0IsZ0JBQWhCLENBQUE7QUFBQSxJQUNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsT0FBTyxDQUFDLEdBQVIsQ0FBWTtVQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix3QkFBOUIsQ0FEVSxFQUVWLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixlQUFwQixDQUFvQyxDQUFDLElBQXJDLENBQTBDLFNBQUMsQ0FBRCxHQUFBO21CQUFPLE1BQUEsR0FBUyxFQUFoQjtVQUFBLENBQTFDLENBRlU7U0FBWixFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBTUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsS0FBQSxHQUFZLElBQUEsV0FBQSxDQUFZLHdCQUFaLENBQVosQ0FBQTtBQUFBLFFBRUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxFQUFmLENBRkEsQ0FBQTtlQUdBLE1BQU0sQ0FBQyxTQUFQLENBQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/symbol-store-spec.coffee