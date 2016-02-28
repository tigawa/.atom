(function() {
  var SuggestionListElement;

  SuggestionListElement = require('../lib/suggestion-list-element');

  describe('Suggestion List Element', function() {
    var suggestionListElement;
    suggestionListElement = [][0];
    beforeEach(function() {
      return suggestionListElement = new SuggestionListElement();
    });
    afterEach(function() {
      if (suggestionListElement != null) {
        suggestionListElement.dispose();
      }
      return suggestionListElement = null;
    });
    describe('renderItem', function() {
      beforeEach(function() {
        return jasmine.attachToDOM(suggestionListElement);
      });
      it("HTML escapes displayText", function() {
        var suggestion;
        suggestion = {
          text: 'Animal<Cat>'
        };
        suggestionListElement.renderItem(suggestion);
        expect(suggestionListElement.selectedLi.innerHTML).toContain('Animal&lt;Cat&gt;');
        suggestion = {
          text: 'Animal<Cat>',
          displayText: 'Animal<Cat>'
        };
        suggestionListElement.renderItem(suggestion);
        expect(suggestionListElement.selectedLi.innerHTML).toContain('Animal&lt;Cat&gt;');
        suggestion = {
          snippet: 'Animal<Cat>',
          displayText: 'Animal<Cat>'
        };
        suggestionListElement.renderItem(suggestion);
        return expect(suggestionListElement.selectedLi.innerHTML).toContain('Animal&lt;Cat&gt;');
      });
      it("HTML escapes snippets", function() {
        var suggestion;
        suggestion = {
          snippet: 'Animal<Cat>(${1:omg<wow>}, ${2:ok<yeah>})'
        };
        suggestionListElement.renderItem(suggestion);
        expect(suggestionListElement.selectedLi.innerHTML).toContain('Animal&lt;Cat&gt;');
        expect(suggestionListElement.selectedLi.innerHTML).toContain('omg&lt;wow&gt;');
        expect(suggestionListElement.selectedLi.innerHTML).toContain('ok&lt;yeah&gt;');
        suggestion = {
          snippet: 'Animal<Cat>(${1:omg<wow>}, ${2:ok<yeah>})',
          displayText: 'Animal<Cat>(omg<wow>, ok<yeah>)'
        };
        suggestionListElement.renderItem(suggestion);
        expect(suggestionListElement.selectedLi.innerHTML).toContain('Animal&lt;Cat&gt;');
        expect(suggestionListElement.selectedLi.innerHTML).toContain('omg&lt;wow&gt;');
        return expect(suggestionListElement.selectedLi.innerHTML).toContain('ok&lt;yeah&gt;');
      });
      return it("HTML escapes labels", function() {
        var suggestion;
        suggestion = {
          text: 'something',
          leftLabel: 'Animal<Cat>',
          rightLabel: 'Animal<Dog>'
        };
        suggestionListElement.renderItem(suggestion);
        expect(suggestionListElement.selectedLi.querySelector('.left-label').innerHTML).toContain('Animal&lt;Cat&gt;');
        return expect(suggestionListElement.selectedLi.querySelector('.right-label').innerHTML).toContain('Animal&lt;Dog&gt;');
      });
    });
    describe('getDisplayHTML', function() {
      it('uses displayText over text or snippet', function() {
        var displayText, html, replacementPrefix, snippet, text;
        text = 'abcd()';
        snippet = void 0;
        displayText = 'acd';
        replacementPrefix = 'a';
        html = suggestionListElement.getDisplayHTML(text, snippet, displayText, replacementPrefix);
        return expect(html).toBe('<span class="character-match">a</span>cd');
      });
      it('handles the empty string in the text field', function() {
        var html, replacementPrefix, snippet, text;
        text = '';
        snippet = void 0;
        replacementPrefix = 'a';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('');
      });
      it('handles the empty string in the snippet field', function() {
        var html, replacementPrefix, snippet, text;
        text = void 0;
        snippet = '';
        replacementPrefix = 'a';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('');
      });
      it('handles an empty prefix', function() {
        var html, replacementPrefix, snippet, text;
        text = void 0;
        snippet = 'abc';
        replacementPrefix = '';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('abc');
      });
      it('outputs correct html when there are no snippets in the snippet field', function() {
        var html, replacementPrefix, snippet, text;
        text = '';
        snippet = 'abc(d, e)f';
        replacementPrefix = 'a';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('<span class="character-match">a</span>bc(d, e)f');
      });
      it('outputs correct html when there are not character matches', function() {
        var html, replacementPrefix, snippet, text;
        text = '';
        snippet = 'abc(d, e)f';
        replacementPrefix = 'omg';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('abc(d, e)f');
      });
      it('outputs correct html when the text field is used', function() {
        var html, replacementPrefix, snippet, text;
        text = 'abc(d, e)f';
        snippet = void 0;
        replacementPrefix = 'a';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('<span class="character-match">a</span>bc(d, e)f');
      });
      it('replaces a snippet with no escaped right braces', function() {
        var html, replacementPrefix, snippet, text;
        text = '';
        snippet = 'abc(${1:d}, ${2:e})f';
        replacementPrefix = 'a';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('<span class="character-match">a</span>bc(<span class="snippet-completion">d</span>, <span class="snippet-completion">e</span>)f');
      });
      it('replaces a snippet with no escaped right braces', function() {
        var html, replacementPrefix, snippet, text;
        text = '';
        snippet = 'text(${1:ab}, ${2:cd})';
        replacementPrefix = 'ta';
        html = suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix);
        return expect(html).toBe('<span class="character-match">t</span>ext(<span class="snippet-completion"><span class="character-match">a</span>b</span>, <span class="snippet-completion">cd</span>)');
      });
      it('replaces a snippet with escaped right braces', function() {
        var replacementPrefix, snippet, text;
        text = '';
        snippet = 'abc(${1:d}, ${2:e})f ${3:interface{\\}}';
        replacementPrefix = 'a';
        return expect(suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix)).toBe('<span class="character-match">a</span>bc(<span class="snippet-completion">d</span>, <span class="snippet-completion">e</span>)f <span class="snippet-completion">interface{}</span>');
      });
      it('replaces a snippet with escaped multiple right braces', function() {
        var replacementPrefix, snippet, text;
        text = '';
        snippet = 'abc(${1:d}, ${2:something{ok\\}}, ${3:e})f ${4:interface{\\}}';
        replacementPrefix = 'a';
        return expect(suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix)).toBe('<span class="character-match">a</span>bc(<span class="snippet-completion">d</span>, <span class="snippet-completion">something{ok}</span>, <span class="snippet-completion">e</span>)f <span class="snippet-completion">interface{}</span>');
      });
      return it('replaces a snippet with elements that have no text', function() {
        var replacementPrefix, snippet, text;
        text = '';
        snippet = 'abc(${1:d}, ${2:e})f${3}';
        replacementPrefix = 'a';
        return expect(suggestionListElement.getDisplayHTML(text, snippet, null, replacementPrefix)).toBe('<span class="character-match">a</span>bc(<span class="snippet-completion">d</span>, <span class="snippet-completion">e</span>)f');
      });
    });
    describe('findCharacterMatches', function() {
      var assertMatches;
      assertMatches = function(text, replacementPrefix, truthyIndices) {
        var i, matches, snippets, _i, _ref, _results;
        text = suggestionListElement.removeEmptySnippets(text);
        snippets = suggestionListElement.snippetParser.findSnippets(text);
        text = suggestionListElement.removeSnippetsFromText(snippets, text);
        matches = suggestionListElement.findCharacterMatchIndices(text, replacementPrefix);
        _results = [];
        for (i = _i = 0, _ref = text.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (truthyIndices.indexOf(i) !== -1) {
            _results.push(expect(matches != null ? matches[i] : void 0).toBeTruthy());
          } else {
            _results.push(expect(matches != null ? matches[i] : void 0).toBeFalsy());
          }
        }
        return _results;
      };
      it('finds matches when no snippets exist', function() {
        assertMatches('hello', '', []);
        assertMatches('hello', 'h', [0]);
        assertMatches('hello', 'hl', [0, 2]);
        return assertMatches('hello', 'hlo', [0, 2, 4]);
      });
      return it('finds matches when snippets exist', function() {
        assertMatches('${0:hello}', '', []);
        assertMatches('${0:hello}', 'h', [0]);
        assertMatches('${0:hello}', 'hl', [0, 2]);
        assertMatches('${0:hello}', 'hlo', [0, 2, 4]);
        assertMatches('${0:hello}world', '', []);
        assertMatches('${0:hello}world', 'h', [0]);
        assertMatches('${0:hello}world', 'hw', [0, 5]);
        assertMatches('${0:hello}world', 'hlw', [0, 2, 5]);
        assertMatches('hello${0:world}', '', []);
        assertMatches('hello${0:world}', 'h', [0]);
        assertMatches('hello${0:world}', 'hw', [0, 5]);
        return assertMatches('hello${0:world}', 'hlw', [0, 2, 5]);
      });
    });
    return describe('removeEmptySnippets', function() {
      it('removes an empty snippet group', function() {
        expect(suggestionListElement.removeEmptySnippets('$0')).toBe('');
        return expect(suggestionListElement.removeEmptySnippets('$1000')).toBe('');
      });
      it('removes an empty snippet group with surrounding text', function() {
        expect(suggestionListElement.removeEmptySnippets('hello$0')).toBe('hello');
        expect(suggestionListElement.removeEmptySnippets('$0hello')).toBe('hello');
        expect(suggestionListElement.removeEmptySnippets('hello$0hello')).toBe('hellohello');
        return expect(suggestionListElement.removeEmptySnippets('hello$1000hello')).toBe('hellohello');
      });
      it('removes an empty snippet group with braces', function() {
        expect(suggestionListElement.removeEmptySnippets('${0}')).toBe('');
        return expect(suggestionListElement.removeEmptySnippets('${1000}')).toBe('');
      });
      it('removes an empty snippet group with braces with surrounding text', function() {
        expect(suggestionListElement.removeEmptySnippets('hello${0}')).toBe('hello');
        expect(suggestionListElement.removeEmptySnippets('${0}hello')).toBe('hello');
        expect(suggestionListElement.removeEmptySnippets('hello${0}hello')).toBe('hellohello');
        return expect(suggestionListElement.removeEmptySnippets('hello${1000}hello')).toBe('hellohello');
      });
      it('removes an empty snippet group with braces and a colon', function() {
        expect(suggestionListElement.removeEmptySnippets('${0:}')).toBe('');
        return expect(suggestionListElement.removeEmptySnippets('${1000:}')).toBe('');
      });
      return it('removes an empty snippet group with braces and a colon with surrounding text', function() {
        expect(suggestionListElement.removeEmptySnippets('hello${0:}')).toBe('hello');
        expect(suggestionListElement.removeEmptySnippets('${0:}hello')).toBe('hello');
        expect(suggestionListElement.removeEmptySnippets('hello${0:}hello')).toBe('hellohello');
        return expect(suggestionListElement.removeEmptySnippets('hello${1000:}hello')).toBe('hellohello');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3N1Z2dlc3Rpb24tbGlzdC1lbGVtZW50LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBOztBQUFBLEVBQUEscUJBQUEsR0FBd0IsT0FBQSxDQUFRLGdDQUFSLENBQXhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEscUJBQUE7QUFBQSxJQUFDLHdCQUF5QixLQUExQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QscUJBQUEsR0FBNEIsSUFBQSxxQkFBQSxDQUFBLEVBRG5CO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQUtBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7O1FBQ1IscUJBQXFCLENBQUUsT0FBdkIsQ0FBQTtPQUFBO2FBQ0EscUJBQUEsR0FBd0IsS0FGaEI7SUFBQSxDQUFWLENBTEEsQ0FBQTtBQUFBLElBU0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULE9BQU8sQ0FBQyxXQUFSLENBQW9CLHFCQUFwQixFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUdBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7QUFDN0IsWUFBQSxVQUFBO0FBQUEsUUFBQSxVQUFBLEdBQWE7QUFBQSxVQUFBLElBQUEsRUFBTSxhQUFOO1NBQWIsQ0FBQTtBQUFBLFFBQ0EscUJBQXFCLENBQUMsVUFBdEIsQ0FBaUMsVUFBakMsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8scUJBQXFCLENBQUMsVUFBVSxDQUFDLFNBQXhDLENB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/suggestion-list-element-spec.coffee
