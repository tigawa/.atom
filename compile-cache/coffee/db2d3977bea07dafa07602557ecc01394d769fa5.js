(function() {
  var triggerAutocompletion, waitForAutocomplete, _ref;

  _ref = require('./spec-helper'), waitForAutocomplete = _ref.waitForAutocomplete, triggerAutocompletion = _ref.triggerAutocompletion;

  describe('Provider API', function() {
    var autocompleteManager, completionDelay, editor, mainModule, registration, testProvider, _ref1;
    _ref1 = [], completionDelay = _ref1[0], editor = _ref1[1], mainModule = _ref1[2], autocompleteManager = _ref1[3], registration = _ref1[4], testProvider = _ref1[5];
    beforeEach(function() {
      runs(function() {
        var workspaceElement;
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('editor.fontSize', '16');
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
      });
      waitsForPromise(function() {
        return Promise.all([
          atom.packages.activatePackage('language-javascript'), atom.workspace.open('sample.js').then(function(e) {
            return editor = e;
          }), atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            return mainModule = a.mainModule;
          })
        ]);
      });
      return waitsFor(function() {
        return autocompleteManager = mainModule.autocompleteManager;
      });
    });
    afterEach(function() {
      if ((registration != null ? registration.dispose : void 0) != null) {
        if (registration != null) {
          registration.dispose();
        }
      }
      registration = null;
      if ((testProvider != null ? testProvider.dispose : void 0) != null) {
        if (testProvider != null) {
          testProvider.dispose();
        }
      }
      return testProvider = null;
    });
    return describe('Provider API v2.0.0', function() {
      it('registers the provider specified by [provider]', function() {
        testProvider = {
          selector: '.source.js,.source.coffee',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai',
                replacementPrefix: 'ohai'
              }
            ];
          }
        };
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', [testProvider]);
        return expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
      });
      it('registers the provider specified by the naked provider', function() {
        testProvider = {
          selector: '.source.js,.source.coffee',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai',
                replacementPrefix: 'ohai'
              }
            ];
          }
        };
        expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(1);
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
        return expect(autocompleteManager.providerManager.providersForScopeDescriptor('.source.js').length).toEqual(2);
      });
      it('passes the correct parameters to getSuggestions for the version', function() {
        testProvider = {
          selector: '.source.js,.source.coffee',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai',
                replacementPrefix: 'ohai'
              }
            ];
          }
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
        spyOn(testProvider, 'getSuggestions');
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var args;
          args = testProvider.getSuggestions.mostRecentCall.args[0];
          expect(args.editor).toBeDefined();
          expect(args.bufferPosition).toBeDefined();
          expect(args.scopeDescriptor).toBeDefined();
          expect(args.prefix).toBeDefined();
          expect(args.scope).not.toBeDefined();
          expect(args.scopeChain).not.toBeDefined();
          expect(args.buffer).not.toBeDefined();
          return expect(args.cursor).not.toBeDefined();
        });
      });
      it('correctly displays the suggestion options', function() {
        testProvider = {
          selector: '.source.js, .source.coffee',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai',
                replacementPrefix: 'o',
                rightLabelHTML: '<span style="color: red">ohai</span>',
                description: 'There be documentation'
              }
            ];
          }
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var suggestionListView;
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          expect(suggestionListView.querySelector('li .right-label')).toHaveHtml('<span style="color: red">ohai</span>');
          expect(suggestionListView.querySelector('.word')).toHaveText('ohai');
          expect(suggestionListView.querySelector('.suggestion-description-content')).toHaveText('There be documentation');
          return expect(suggestionListView.querySelector('.suggestion-description-more-link').style.display).toBe('none');
        });
      });
      it("favors the `displayText` over text or snippet suggestion options", function() {
        testProvider = {
          selector: '.source.js, .source.coffee',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai',
                snippet: 'snippet',
                displayText: 'displayOHAI',
                replacementPrefix: 'o',
                rightLabelHTML: '<span style="color: red">ohai</span>',
                description: 'There be documentation'
              }
            ];
          }
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var suggestionListView;
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          return expect(suggestionListView.querySelector('.word')).toHaveText('displayOHAI');
        });
      });
      it('correctly displays the suggestion description and More link', function() {
        testProvider = {
          selector: '.source.js, .source.coffee',
          getSuggestions: function(options) {
            return [
              {
                text: 'ohai',
                replacementPrefix: 'o',
                rightLabelHTML: '<span style="color: red">ohai</span>',
                description: 'There be documentation',
                descriptionMoreURL: 'http://google.com'
              }
            ];
          }
        };
        registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
        triggerAutocompletion(editor, true, 'o');
        return runs(function() {
          var content, moreLink, suggestionListView;
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          content = suggestionListView.querySelector('.suggestion-description-content');
          moreLink = suggestionListView.querySelector('.suggestion-description-more-link');
          expect(content).toHaveText('There be documentation');
          expect(moreLink).toHaveText('More..');
          expect(moreLink.style.display).toBe('inline');
          return expect(moreLink.getAttribute('href')).toBe('http://google.com');
        });
      });
      return describe("when the filterSuggestions option is set to true", function() {
        var getSuggestions;
        getSuggestions = function() {
          var text, _i, _len, _ref2, _results;
          _ref2 = autocompleteManager.suggestionList.items;
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            text = _ref2[_i].text;
            _results.push({
              text: text
            });
          }
          return _results;
        };
        beforeEach(function() {
          return editor.setText('');
        });
        it('filters suggestions based on the default prefix', function() {
          testProvider = {
            selector: '.source.js',
            filterSuggestions: true,
            getSuggestions: function(options) {
              return [
                {
                  text: 'okwow'
                }, {
                  text: 'ohai'
                }, {
                  text: 'ok'
                }, {
                  text: 'cats'
                }, {
                  text: 'something'
                }
              ];
            }
          };
          registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
          editor.insertText('o');
          editor.insertText('k');
          waitForAutocomplete();
          return runs(function() {
            return expect(getSuggestions()).toEqual([
              {
                text: 'ok'
              }, {
                text: 'okwow'
              }
            ]);
          });
        });
        it('filters suggestions based on the specified replacementPrefix for each suggestion', function() {
          testProvider = {
            selector: '.source.js',
            filterSuggestions: true,
            getSuggestions: function(options) {
              return [
                {
                  text: 'ohai'
                }, {
                  text: 'hai'
                }, {
                  text: 'okwow',
                  replacementPrefix: 'k'
                }, {
                  text: 'ok',
                  replacementPrefix: 'nope'
                }, {
                  text: '::cats',
                  replacementPrefix: '::c'
                }, {
                  text: 'something',
                  replacementPrefix: 'sm'
                }
              ];
            }
          };
          registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
          editor.insertText('h');
          waitForAutocomplete();
          return runs(function() {
            return expect(getSuggestions()).toEqual([
              {
                text: '::cats'
              }, {
                text: 'hai'
              }, {
                text: 'something'
              }
            ]);
          });
        });
        return it('allows all suggestions when the prefix is an empty string / space', function() {
          testProvider = {
            selector: '.source.js',
            filterSuggestions: true,
            getSuggestions: function(options) {
              return [
                {
                  text: 'ohai'
                }, {
                  text: 'hai'
                }, {
                  text: 'okwow',
                  replacementPrefix: ' '
                }, {
                  text: 'ok',
                  replacementPrefix: 'nope'
                }
              ];
            }
          };
          registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testProvider);
          editor.insertText('h');
          editor.insertText(' ');
          waitForAutocomplete();
          return runs(function() {
            return expect(getSuggestions()).toEqual([
              {
                text: 'ohai'
              }, {
                text: 'hai'
              }, {
                text: 'okwow'
              }
            ]);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3Byb3ZpZGVyLWFwaS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnREFBQTs7QUFBQSxFQUFBLE9BQStDLE9BQUEsQ0FBUSxlQUFSLENBQS9DLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsNkJBQUEscUJBQXRCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSwyRkFBQTtBQUFBLElBQUEsUUFBeUYsRUFBekYsRUFBQywwQkFBRCxFQUFrQixpQkFBbEIsRUFBMEIscUJBQTFCLEVBQXNDLDhCQUF0QyxFQUEyRCx1QkFBM0QsRUFBeUUsdUJBQXpFLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFFSCxZQUFBLGdCQUFBO0FBQUEsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLEVBQTBELElBQTFELENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixFQUFtQyxJQUFuQyxDQURBLENBQUE7QUFBQSxRQUlBLGVBQUEsR0FBa0IsR0FKbEIsQ0FBQTtBQUFBLFFBS0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixFQUF5RCxlQUF6RCxDQUxBLENBQUE7QUFBQSxRQU1BLGVBQUEsSUFBbUIsR0FObkIsQ0FBQTtBQUFBLFFBUUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQVJuQixDQUFBO2VBU0EsT0FBTyxDQUFDLFdB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/provider-api-spec.coffee
