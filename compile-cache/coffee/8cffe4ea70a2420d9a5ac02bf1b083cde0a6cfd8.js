
/* global atom */

(function() {
  var $, CompositeDisposable, JumpyView, Point, Range, View, _, a, c1, c2, i, j, k, keys, l, len, len1, len2, len3, len4, len5, lowerCharacters, m, n, ref, ref1, upperCharacters,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Point = ref.Point, Range = ref.Range;

  ref1 = require('space-pen'), View = ref1.View, $ = ref1.$;

  _ = require('lodash');

  lowerCharacters = (function() {
    var i, ref2, ref3, results;
    results = [];
    for (a = i = ref2 = 'a'.charCodeAt(), ref3 = 'z'.charCodeAt(); ref2 <= ref3 ? i <= ref3 : i >= ref3; a = ref2 <= ref3 ? ++i : --i) {
      results.push(String.fromCharCode(a));
    }
    return results;
  })();

  upperCharacters = (function() {
    var i, ref2, ref3, results;
    results = [];
    for (a = i = ref2 = 'A'.charCodeAt(), ref3 = 'Z'.charCodeAt(); ref2 <= ref3 ? i <= ref3 : i >= ref3; a = ref2 <= ref3 ? ++i : --i) {
      results.push(String.fromCharCode(a));
    }
    return results;
  })();

  keys = [];

  for (i = 0, len = lowerCharacters.length; i < len; i++) {
    c1 = lowerCharacters[i];
    for (j = 0, len1 = lowerCharacters.length; j < len1; j++) {
      c2 = lowerCharacters[j];
      keys.push(c1 + c2);
    }
  }

  for (k = 0, len2 = upperCharacters.length; k < len2; k++) {
    c1 = upperCharacters[k];
    for (l = 0, len3 = lowerCharacters.length; l < len3; l++) {
      c2 = lowerCharacters[l];
      keys.push(c1 + c2);
    }
  }

  for (m = 0, len4 = lowerCharacters.length; m < len4; m++) {
    c1 = lowerCharacters[m];
    for (n = 0, len5 = upperCharacters.length; n < len5; n++) {
      c2 = upperCharacters[n];
      keys.push(c1 + c2);
    }
  }

  JumpyView = (function(superClass) {
    extend(JumpyView, superClass);

    function JumpyView() {
      this.clearJumpModeHandler = bind(this.clearJumpModeHandler, this);
      return JumpyView.__super__.constructor.apply(this, arguments);
    }

    JumpyView.content = function() {
      return this.div('');
    };

    JumpyView.prototype.initialize = function() {
      var c, characterSet, commands, fn, len6, len7, o, p, ref2, ref3;
      this.disposables = new CompositeDisposable();
      this.decorations = [];
      this.commands = new CompositeDisposable();
      this.commands.add(atom.commands.add('atom-workspace', {
        'jumpy:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'jumpy:reset': (function(_this) {
          return function() {
            return _this.reset();
          };
        })(this),
        'jumpy:clear': (function(_this) {
          return function() {
            return _this.clearJumpMode();
          };
        })(this)
      }));
      commands = {};
      ref2 = [lowerCharacters, upperCharacters];
      for (o = 0, len6 = ref2.length; o < len6; o++) {
        characterSet = ref2[o];
        fn = (function(_this) {
          return function(c) {
            return commands['jumpy:' + c] = function() {
              return _this.getKey(c);
            };
          };
        })(this);
        for (p = 0, len7 = characterSet.length; p < len7; p++) {
          c = characterSet[p];
          fn(c);
        }
      }
      this.commands.add(atom.commands.add('atom-workspace', commands));
      this.backedUpKeyBindings = _.clone(atom.keymaps.keyBindings);
      this.workspaceElement = atom.views.getView(atom.workspace);
      this.statusBar = document.querySelector('status-bar');
      if ((ref3 = this.statusBar) != null) {
        ref3.addLeftTile({
          item: $('<div id="status-bar-jumpy" class="inline-block"></div>'),
          priority: -1
        });
      }
      return this.statusBarJumpy = document.getElementById('status-bar-jumpy');
    };

    JumpyView.prototype.getKey = function(character) {
      var isMatchOfCurrentLabels, labelPosition, ref2, ref3, ref4, ref5;
      if ((ref2 = this.statusBarJumpy) != null) {
        ref2.classList.remove('no-match');
      }
      isMatchOfCurrentLabels = (function(_this) {
        return function(character, labelPosition) {
          var found;
          found = false;
          _this.disposables.add(atom.workspace.observeTextEditors(function(editor) {
            var decoration, editorView, element, len6, o, ref3;
            editorView = atom.views.getView(editor);
            if ($(editorView).is(':not(:visible)')) {
              return;
            }
            ref3 = _this.decorations;
            for (o = 0, len6 = ref3.length; o < len6; o++) {
              decoration = ref3[o];
              element = decoration.getProperties().item;
              if (element.textContent[labelPosition] === character) {
                found = true;
                return false;
              }
            }
          }));
          return found;
        };
      })(this);
      labelPosition = (!this.firstChar ? 0 : 1);
      if (!isMatchOfCurrentLabels(character, labelPosition)) {
        if ((ref3 = this.statusBarJumpy) != null) {
          ref3.classList.add('no-match');
        }
        if ((ref4 = this.statusBarJumpyStatus) != null) {
          ref4.innerHTML = 'No match!';
        }
        return;
      }
      if (!this.firstChar) {
        this.firstChar = character;
        if ((ref5 = this.statusBarJumpyStatus) != null) {
          ref5.innerHTML = this.firstChar;
        }
        this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
          return function(editor) {
            var decoration, editorView, element, len6, o, ref6, results;
            editorView = atom.views.getView(editor);
            if ($(editorView).is(':not(:visible)')) {
              return;
            }
            ref6 = _this.decorations;
            results = [];
            for (o = 0, len6 = ref6.length; o < len6; o++) {
              decoration = ref6[o];
              element = decoration.getProperties().item;
              if (element.textContent.indexOf(_this.firstChar) !== 0) {
                results.push(element.classList.add('irrelevant'));
              } else {
                results.push(void 0);
              }
            }
            return results;
          };
        })(this)));
      } else if (!this.secondChar) {
        this.secondChar = character;
      }
      if (this.secondChar) {
        this.jump();
        return this.clearJumpMode();
      }
    };

    JumpyView.prototype.clearKeys = function() {
      this.firstChar = null;
      return this.secondChar = null;
    };

    JumpyView.prototype.reset = function() {
      var decoration, len6, o, ref2, ref3, ref4;
      this.clearKeys();
      ref2 = this.decorations;
      for (o = 0, len6 = ref2.length; o < len6; o++) {
        decoration = ref2[o];
        decoration.getProperties().item.classList.remove('irrelevant');
      }
      if ((ref3 = this.statusBarJumpy) != null) {
        ref3.classList.remove('no-match');
      }
      return (ref4 = this.statusBarJumpyStatus) != null ? ref4.innerHTML = 'Jump Mode!' : void 0;
    };

    JumpyView.prototype.getFilteredJumpyKeys = function() {
      return atom.keymaps.keyBindings.filter(function(keymap) {
        if (typeof keymap.command === 'string') {
          return keymap.command.includes('jumpy');
        }
      });
    };

    JumpyView.prototype.turnOffSlowKeys = function() {
      return atom.keymaps.keyBindings = this.getFilteredJumpyKeys();
    };

    JumpyView.prototype.toggle = function() {
      var fontSize, highContrast, nextKeys, ref2, ref3, wordsPattern;
      this.clearJumpMode();
      this.cleared = false;
      wordsPattern = new RegExp(atom.config.get('jumpy.matchPattern'), 'g');
      fontSize = atom.config.get('jumpy.fontSize');
      if (isNaN(fontSize) || fontSize > 1) {
        fontSize = .75;
      }
      fontSize = (fontSize * 100) + '%';
      highContrast = atom.config.get('jumpy.highContrast');
      this.turnOffSlowKeys();
      if ((ref2 = this.statusBarJumpy) != null) {
        ref2.classList.remove('no-match');
      }
      if ((ref3 = this.statusBarJumpy) != null) {
        ref3.innerHTML = 'Jumpy: <span class="status">Jump Mode!</span>';
      }
      this.statusBarJumpyStatus = document.querySelector('#status-bar-jumpy .status');
      this.allPositions = {};
      nextKeys = _.clone(keys);
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var $editorView, column, drawLabels, editorView, firstVisibleRow, getVisibleColumnRange, lastVisibleRow, lineContents, lineNumber, maxColumn, minColumn, o, ref4, ref5, ref6, rows, word;
          editorView = atom.views.getView(editor);
          $editorView = $(editorView);
          if ($editorView.is(':not(:visible)')) {
            return;
          }
          editorView.classList.add('jumpy-jump-mode');
          getVisibleColumnRange = function(editorView) {
            var charWidth, maxColumn, minColumn;
            charWidth = editorView.getDefaultCharacterWidth();
            minColumn = (editorView.getScrollLeft() / charWidth) - 1;
            maxColumn = editorView.getScrollRight() / charWidth;
            return [minColumn, maxColumn];
          };
          drawLabels = function(lineNumber, column) {
            var decoration, keyLabel, labelElement, marker, position;
            if (!nextKeys.length) {
              return;
            }
            keyLabel = nextKeys.shift();
            position = {
              row: lineNumber,
              column: column
            };
            _this.allPositions[keyLabel] = {
              editor: editor.id,
              position: position
            };
            marker = editor.markScreenRange(new Range(new Point(lineNumber, column), new Point(lineNumber, column)), {
              invalidate: 'touch'
            });
            labelElement = document.createElement('div');
            labelElement.textContent = keyLabel;
            labelElement.style.fontSize = fontSize;
            labelElement.classList.add('jumpy-label');
            if (highContrast) {
              labelElement.classList.add('high-contrast');
            }
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: labelElement,
              position: 'head'
            });
            return _this.decorations.push(decoration);
          };
          ref4 = getVisibleColumnRange(editorView), minColumn = ref4[0], maxColumn = ref4[1];
          rows = editor.getVisibleRowRange();
          if (rows) {
            firstVisibleRow = rows[0], lastVisibleRow = rows[1];
            for (lineNumber = o = ref5 = firstVisibleRow, ref6 = lastVisibleRow; ref5 <= ref6 ? o < ref6 : o > ref6; lineNumber = ref5 <= ref6 ? ++o : --o) {
              lineContents = editor.lineTextForScreenRow(lineNumber);
              if (editor.isFoldedAtScreenRow(lineNumber)) {
                drawLabels(lineNumber, 0);
              } else {
                while ((word = wordsPattern.exec(lineContents)) !== null) {
                  column = word.index;
                  if (column > minColumn && column < maxColumn) {
                    drawLabels(lineNumber, column);
                  }
                }
              }
            }
          }
          return _this.initializeClearEvents(editorView);
        };
      })(this)));
    };

    JumpyView.prototype.clearJumpModeHandler = function() {
      return this.clearJumpMode();
    };

    JumpyView.prototype.initializeClearEvents = function(editorView) {
      var e, len6, o, ref2, results;
      this.disposables.add(editorView.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.clearJumpModeHandler();
        };
      })(this)));
      this.disposables.add(editorView.onDidChangeScrollLeft((function(_this) {
        return function() {
          return _this.clearJumpModeHandler();
        };
      })(this)));
      ref2 = ['blur', 'click'];
      results = [];
      for (o = 0, len6 = ref2.length; o < len6; o++) {
        e = ref2[o];
        results.push(editorView.addEventListener(e, this.clearJumpModeHandler, true));
      }
      return results;
    };

    JumpyView.prototype.clearJumpMode = function() {
      var clearAllMarkers, ref2, ref3;
      clearAllMarkers = (function(_this) {
        return function() {
          var decoration, len6, o, ref2;
          ref2 = _this.decorations;
          for (o = 0, len6 = ref2.length; o < len6; o++) {
            decoration = ref2[o];
            decoration.getMarker().destroy();
          }
          return _this.decorations = [];
        };
      })(this);
      if (this.cleared) {
        return;
      }
      this.cleared = true;
      this.clearKeys();
      if ((ref2 = this.statusBarJumpy) != null) {
        ref2.innerHTML = '';
      }
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var e, editorView, len6, o, ref3, results;
          editorView = atom.views.getView(editor);
          editorView.classList.remove('jumpy-jump-mode');
          ref3 = ['blur', 'click'];
          results = [];
          for (o = 0, len6 = ref3.length; o < len6; o++) {
            e = ref3[o];
            results.push(editorView.removeEventListener(e, _this.clearJumpModeHandler, true));
          }
          return results;
        };
      })(this)));
      atom.keymaps.keyBindings = this.backedUpKeyBindings;
      clearAllMarkers();
      if ((ref3 = this.disposables) != null) {
        ref3.dispose();
      }
      return this.detach();
    };

    JumpyView.prototype.jump = function() {
      var location;
      location = this.findLocation();
      if (location === null) {
        return;
      }
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(currentEditor) {
          var editorView, isSelected, isVisualMode, pane;
          editorView = atom.views.getView(currentEditor);
          if (currentEditor.id !== location.editor) {
            return;
          }
          pane = atom.workspace.paneForItem(currentEditor);
          pane.activate();
          isVisualMode = editorView.classList.contains('visual-mode');
          isSelected = currentEditor.getSelections().length === 1 && currentEditor.getSelectedText() !== '';
          if (isVisualMode || isSelected) {
            currentEditor.selectToScreenPosition(location.position);
          } else {
            currentEditor.setCursorScreenPosition(location.position);
          }
          if (atom.config.get('jumpy.useHomingBeaconEffectOnJumps')) {
            return _this.drawBeacon(currentEditor, location);
          }
        };
      })(this)));
    };

    JumpyView.prototype.drawBeacon = function(editor, location) {
      var beacon, marker, range;
      range = Range(location.position, location.position);
      marker = editor.markScreenRange(range, {
        invalidate: 'never'
      });
      beacon = document.createElement('span');
      beacon.classList.add('beacon');
      editor.decorateMarker(marker, {
        item: beacon,
        type: 'overlay'
      });
      return setTimeout(function() {
        return marker.destroy();
      }, 150);
    };

    JumpyView.prototype.findLocation = function() {
      var label;
      label = "" + this.firstChar + this.secondChar;
      if (label in this.allPositions) {
        return this.allPositions[label];
      }
      return null;
    };

    JumpyView.prototype.serialize = function() {};

    JumpyView.prototype.destroy = function() {
      var ref2;
      if ((ref2 = this.commands) != null) {
        ref2.dispose();
      }
      return this.clearJumpMode();
    };

    return JumpyView;

  })(View);

  module.exports = JumpyView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qdW1weS9saWIvanVtcHktdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUlBOztBQUFBO0FBQUEsTUFBQSwyS0FBQTtJQUFBOzs7O0VBQ0EsTUFBc0MsT0FBQSxDQUFRLE1BQVIsQ0FBdEMsRUFBQyw2Q0FBRCxFQUFzQixpQkFBdEIsRUFBNkI7O0VBQzdCLE9BQVksT0FBQSxDQUFRLFdBQVIsQ0FBWixFQUFDLGdCQUFELEVBQU87O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUVKLGVBQUE7O0FBQ0s7U0FBZ0MsNEhBQWhDO21CQUFBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLENBQXBCO0FBQUE7Ozs7RUFDTCxlQUFBOztBQUNLO1NBQWdDLDRIQUFoQzttQkFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixDQUFwQjtBQUFBOzs7O0VBQ0wsSUFBQSxHQUFPOztBQUtQLE9BQUEsaURBQUE7O0FBQ0ksU0FBQSxtREFBQTs7TUFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUEsR0FBSyxFQUFmO0FBREo7QUFESjs7QUFHQSxPQUFBLG1EQUFBOztBQUNJLFNBQUEsbURBQUE7O01BQ0ksSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFBLEdBQUssRUFBZjtBQURKO0FBREo7O0FBR0EsT0FBQSxtREFBQTs7QUFDSSxTQUFBLG1EQUFBOztNQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBQSxHQUFLLEVBQWY7QUFESjtBQURKOztFQUlNOzs7Ozs7OztJQUVGLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNOLElBQUMsQ0FBQSxHQUFELENBQUssRUFBTDtJQURNOzt3QkFHVixVQUFBLEdBQVksU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLG1CQUFBLENBQUE7TUFDbkIsSUFBQyxDQUFBLFdBQUQs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LFNBQVMsQ0FBQyxHQUFqQixDQUFxQixRQUFyQjtNQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLEVBQ0k7UUFBQSxJQUFBLEVBQU0sTUFBTjtRQUNBLElBQUEsRUFBTSxTQUROO09BREo7YUFHQSxVQUFBLENBQVcsU0FBQTtlQUNQLE1BQU0sQ0FBQyxPQUFQLENBQUE7TUFETyxDQUFYLEVBRUUsR0FGRjtJQVJROzt3QkFZWixZQUFBLEdBQWMsU0FBQTtBQUNWLFVBQUE7TUFBQSxLQUFBLEdBQVEsRUFBQSxHQUFHLElBQUMsQ0FBQSxTQUFKLEdBQWdCLElBQUMsQ0FBQTtNQUN6QixJQUFHLEtBQUEsSUFBUyxJQUFDLENBQUEsWUFBYjtBQUNJLGVBQU8sSUFBQyxDQUFBLFlBQWEsQ0FBQSxLQUFBLEVBRHpCOztBQUdBLGFBQU87SUFMRzs7d0JBUWQsU0FBQSxHQUFXLFNBQUEsR0FBQTs7d0JBR1gsT0FBQSxHQUFTLFNBQUE7QUFDTCxVQUFBOztZQUFTLENBQUUsT0FBWCxDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELENBQUE7SUFGSzs7OztLQXhRVzs7RUE0UXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBcFNqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgVE9ETzogTWVyZ2UgaW4gQGpvaG5nZW9yZ2V3cmlnaHQncyBjb2RlIGZvciB0cmVldmlld1xuIyBUT0RPOiBNZXJnZSBpbiBAd2lsbGRhZHkncyBjb2RlIGZvciBiZXR0ZXIgYWNjdXJhY3kuXG4jIFRPRE86IFJlbW92ZSBzcGFjZS1wZW4/XG5cbiMjIyBnbG9iYWwgYXRvbSAjIyNcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcbntWaWV3LCAkfSA9IHJlcXVpcmUgJ3NwYWNlLXBlbidcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmxvd2VyQ2hhcmFjdGVycyA9XG4gICAgKFN0cmluZy5mcm9tQ2hhckNvZGUoYSkgZm9yIGEgaW4gWydhJy5jaGFyQ29kZUF0KCkuLid6Jy5jaGFyQ29kZUF0KCldKVxudXBwZXJDaGFyYWN0ZXJzID1cbiAgICAoU3RyaW5nLmZyb21DaGFyQ29kZShhKSBmb3IgYSBpbiBbJ0EnLmNoYXJDb2RlQXQoKS4uJ1onLmNoYXJDb2RlQXQoKV0pXG5rZXlzID0gW11cblxuIyBBIGxpdHRsZSB1Z2x5LlxuIyBJIHVzZWQgaXRlcnRvb2xzLnBlcm11dGF0aW9uIGluIHB5dGhvbi5cbiMgQ291bGRuJ3QgZmluZCBhIGdvb2Qgb25lIGluIG5wbS4gIERvbid0IHdvcnJ5IHRoaXMgdGFrZXMgPCAxbXMgb25jZS5cbmZvciBjMSBpbiBsb3dlckNoYXJhY3RlcnNcbiAgICBmb3IgYzIgaW4gbG93ZXJDaGFyYWN0ZXJzXG4gICAgICAgIGtleXMucHVzaCBjMSArIGMyXG5mb3IgYzEgaW4gdXBwZXJDaGFyYWN0ZXJzXG4gICAgZm9yIGMyIGluIGxvd2VyQ2hhcmFjdGVyc1xuICAgICAgICBrZXlzLnB1c2ggYzEgKyBjMlxuZm9yIGMxIGluIGxvd2VyQ2hhcmFjdGVyc1xuICAgIGZvciBjMiBpbiB1cHBlckNoYXJhY3RlcnNcbiAgICAgICAga2V5cy5wdXNoIGMxICsgYzJcblxuY2xhc3MgSnVtcHlWaWV3IGV4dGVuZHMgVmlld1xuXG4gICAgQGNvbnRlbnQ6IC0+XG4gICAgICAgIEBkaXYgJydcblxuICAgIGluaXRpYWxpemU6ICgpIC0+XG4gICAgICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgICAgQGRlY29yYXRpb25zID0gW11cbiAgICAgICAgQGNvbW1hbmRzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgICAgIEBjb21tYW5kcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgICAgICdqdW1weTp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcbiAgICAgICAgICAgICdqdW1weTpyZXNldCc6ID0+IEByZXNldCgpXG4gICAgICAgICAgICAnanVtcHk6Y2xlYXInOiA9PiBAY2xlYXJKdW1wTW9kZSgpXG5cbiAgICAgICAgY29tbWFuZHMgPSB7fVxuICAgICAgICBmb3IgY2hhcmFjdGVyU2V0IGluIFtsb3dlckNoYXJhY3RlcnMsIHVwcGVyQ2hhcmFjdGVyc11cbiAgICAgICAgICAgIGZvciBjIGluIGNoYXJhY3RlclNldFxuICAgICAgICAgICAgICAgIGRvIChjKSA9PiBjb21tYW5kc1snanVtcHk6JyArIGNdID0gPT4gQGdldEtleShjKVxuICAgICAgICBAY29tbWFuZHMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIGNvbW1hbmRzXG5cbiAgICAgICAgIyBUT0RPOiBjb25zaWRlciBtb3ZpbmcgdGhpcyBpbnRvIHRvZ2dsZSBmb3IgbmV3IGJpbmRpbmdzLlxuICAgICAgICBAYmFja2VkVXBLZXlCaW5kaW5ncyA9IF8uY2xvbmUgYXRvbS5rZXltYXBzLmtleUJpbmRpbmdzXG5cbiAgICAgICAgQHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgIEBzdGF0dXNCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yICdzdGF0dXMtYmFyJ1xuICAgICAgICBAc3RhdHVzQmFyPy5hZGRMZWZ0VGlsZVxuICAgICAgICAgICAgaXRlbTogJCgnPGRpdiBpZD1cInN0YXR1cy1iYXItanVtcHlcIiBjbGFzcz1cImlubGluZS1ibG9ja1wiPjwvZGl2PicpXG4gICAgICAgICAgICBwcmlvcml0eTogLTFcbiAgICAgICAgQHN0YXR1c0Jhckp1bXB5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3N0YXR1cy1iYXItanVtcHknXG5cbiAgICBnZXRLZXk6IChjaGFyYWN0ZXIpIC0+XG4gICAgICAgIEBzdGF0dXNCYXJKdW1weT8uY2xhc3NMaXN0LnJlbW92ZSAnbm8tbWF0Y2gnXG5cbiAgICAgICAgaXNNYXRjaE9mQ3VycmVudExhYmVscyA9IChjaGFyYWN0ZXIsIGxhYmVsUG9zaXRpb24pID0+XG4gICAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAkKGVkaXRvclZpZXcpLmlzICc6bm90KDp2aXNpYmxlKSdcblxuICAgICAgICAgICAgICAgIGZvciBkZWNvcmF0aW9uIGluIEBkZWNvcmF0aW9uc1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkuaXRlbVxuICAgICAgICAgICAgICAgICAgICBpZiBlbGVtZW50LnRleHRDb250ZW50W2xhYmVsUG9zaXRpb25dID09IGNoYXJhY3RlclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiBmb3VuZFxuXG4gICAgICAgICMgQXNzZXJ0OiBsYWJlbFBvc2l0aW9uIHdpbGwgc3RhcnQgYXQgMCFcbiAgICAgICAgbGFiZWxQb3NpdGlvbiA9IChpZiBub3QgQGZpcnN0Q2hhciB0aGVuIDAgZWxzZSAxKVxuICAgICAgICBpZiAhaXNNYXRjaE9mQ3VycmVudExhYmVscyBjaGFyYWN0ZXIsIGxhYmVsUG9zaXRpb25cbiAgICAgICAgICAgIEBzdGF0dXNCYXJKdW1weT8uY2xhc3NMaXN0LmFkZCAnbm8tbWF0Y2gnXG4gICAgICAgICAgICBAc3RhdHVzQmFySnVtcHlTdGF0dXM/LmlubmVySFRNTCA9ICdObyBtYXRjaCEnXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBpZiBub3QgQGZpcnN0Q2hhclxuICAgICAgICAgICAgQGZpcnN0Q2hhciA9IGNoYXJhY3RlclxuICAgICAgICAgICAgQHN0YXR1c0Jhckp1bXB5U3RhdHVzPy5pbm5lckhUTUwgPSBAZmlyc3RDaGFyXG4gICAgICAgICAgICAjIFRPRE86IFJlZmFjdG9yIHRoaXMgc28gbm90IDIgY2FsbHMgdG8gb2JzZXJ2ZVRleHRFZGl0b3JzXG4gICAgICAgICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAkKGVkaXRvclZpZXcpLmlzICc6bm90KDp2aXNpYmxlKSdcblxuICAgICAgICAgICAgICAgIGZvciBkZWNvcmF0aW9uIGluIEBkZWNvcmF0aW9uc1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkuaXRlbVxuICAgICAgICAgICAgICAgICAgICBpZiBlbGVtZW50LnRleHRDb250ZW50LmluZGV4T2YoQGZpcnN0Q2hhcikgIT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkICdpcnJlbGV2YW50J1xuICAgICAgICBlbHNlIGlmIG5vdCBAc2Vjb25kQ2hhclxuICAgICAgICAgICAgQHNlY29uZENoYXIgPSBjaGFyYWN0ZXJcblxuICAgICAgICBpZiBAc2Vjb25kQ2hhclxuICAgICAgICAgICAgQGp1bXAoKSAjIEp1bXAgZmlyc3QuICBDdXJyZW50bHkgbmVlZCB0aGUgcGxhY2VtZW50IG9mIHRoZSBsYWJlbHMuXG4gICAgICAgICAgICBAY2xlYXJKdW1wTW9kZSgpXG5cbiAgICBjbGVhcktleXM6IC0+XG4gICAgICAgIEBmaXJzdENoYXIgPSBudWxsXG4gICAgICAgIEBzZWNvbmRDaGFyID0gbnVsbFxuXG4gICAgcmVzZXQ6IC0+XG4gICAgICAgIEBjbGVhcktleXMoKVxuICAgICAgICBmb3IgZGVjb3JhdGlvbiBpbiBAZGVjb3JhdGlvbnNcbiAgICAgICAgICAgIGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpLml0ZW0uY2xhc3NMaXN0LnJlbW92ZSAnaXJyZWxldmFudCdcbiAgICAgICAgQHN0YXR1c0Jhckp1bXB5Py5jbGFzc0xpc3QucmVtb3ZlICduby1tYXRjaCdcbiAgICAgICAgQHN0YXR1c0Jhckp1bXB5U3RhdHVzPy5pbm5lckhUTUwgPSAnSnVtcCBNb2RlISdcblxuICAgIGdldEZpbHRlcmVkSnVtcHlLZXlzOiAtPlxuICAgICAgICBhdG9tLmtleW1hcHMua2V5QmluZGluZ3MuZmlsdGVyIChrZXltYXApIC0+XG4gICAgICAgICAgICBrZXltYXAuY29tbWFuZC5pbmNsdWRlcyAnanVtcHknIGlmIHR5cGVvZiBrZXltYXAuY29tbWFuZCBpcyAnc3RyaW5nJ1xuXG4gICAgdHVybk9mZlNsb3dLZXlzOiAtPlxuICAgICAgICBhdG9tLmtleW1hcHMua2V5QmluZGluZ3MgPSBAZ2V0RmlsdGVyZWRKdW1weUtleXMoKVxuXG4gICAgdG9nZ2xlOiAtPlxuICAgICAgICBAY2xlYXJKdW1wTW9kZSgpXG5cbiAgICAgICAgIyBTZXQgZGlydHkgZm9yIEBjbGVhckp1bXBNb2RlXG4gICAgICAgIEBjbGVhcmVkID0gZmFsc2VcblxuICAgICAgICAjIFRPRE86IENhbiB0aGUgZm9sbG93aW5nIGZldyBsaW5lcyBiZSBzaW5nbGV0b24nZCB1cD8gaWUuIGluc3RhbmNlIHZhcj9cbiAgICAgICAgd29yZHNQYXR0ZXJuID0gbmV3IFJlZ0V4cCAoYXRvbS5jb25maWcuZ2V0ICdqdW1weS5tYXRjaFBhdHRlcm4nKSwgJ2cnXG4gICAgICAgIGZvbnRTaXplID0gYXRvbS5jb25maWcuZ2V0ICdqdW1weS5mb250U2l6ZSdcbiAgICAgICAgZm9udFNpemUgPSAuNzUgaWYgaXNOYU4oZm9udFNpemUpIG9yIGZvbnRTaXplID4gMVxuICAgICAgICBmb250U2l6ZSA9IChmb250U2l6ZSAqIDEwMCkgKyAnJSdcbiAgICAgICAgaGlnaENvbnRyYXN0ID0gYXRvbS5jb25maWcuZ2V0ICdqdW1weS5oaWdoQ29udHJhc3QnXG5cbiAgICAgICAgQHR1cm5PZmZTbG93S2V5cygpXG4gICAgICAgIEBzdGF0dXNCYXJKdW1weT8uY2xhc3NMaXN0LnJlbW92ZSAnbm8tbWF0Y2gnXG4gICAgICAgIEBzdGF0dXNCYXJKdW1weT8uaW5uZXJIVE1MID1cbiAgICAgICAgICAgICdKdW1weTogPHNwYW4gY2xhc3M9XCJzdGF0dXNcIj5KdW1wIE1vZGUhPC9zcGFuPidcbiAgICAgICAgQHN0YXR1c0Jhckp1bXB5U3RhdHVzID1cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJyNzdGF0dXMtYmFyLWp1bXB5IC5zdGF0dXMnXG5cbiAgICAgICAgQGFsbFBvc2l0aW9ucyA9IHt9XG4gICAgICAgIG5leHRLZXlzID0gXy5jbG9uZSBrZXlzXG4gICAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgICAgICRlZGl0b3JWaWV3ID0gJChlZGl0b3JWaWV3KVxuICAgICAgICAgICAgcmV0dXJuIGlmICRlZGl0b3JWaWV3LmlzICc6bm90KDp2aXNpYmxlKSdcblxuICAgICAgICAgICAgIyAnanVtcHktanVtcC1tb2RlIGlzIGZvciBrZXltYXBzIGFuZCB1dGlsaXplZCBieSB0ZXN0c1xuICAgICAgICAgICAgZWRpdG9yVmlldy5jbGFzc0xpc3QuYWRkICdqdW1weS1qdW1wLW1vZGUnXG5cbiAgICAgICAgICAgIGdldFZpc2libGVDb2x1bW5SYW5nZSA9IChlZGl0b3JWaWV3KSAtPlxuICAgICAgICAgICAgICAgIGNoYXJXaWR0aCA9IGVkaXRvclZpZXcuZ2V0RGVmYXVsdENoYXJhY3RlcldpZHRoKClcbiAgICAgICAgICAgICAgICAjIEZZSTogYXNzZXJ0czpcbiAgICAgICAgICAgICAgICAjIG51bWJlck9mVmlzaWJsZUNvbHVtbnMgPSBlZGl0b3JWaWV3LmdldFdpZHRoKCkgLyBjaGFyV2lkdGhcbiAgICAgICAgICAgICAgICBtaW5Db2x1bW4gPSAoZWRpdG9yVmlldy5nZXRTY3JvbGxMZWZ0KCkgLyBjaGFyV2lkdGgpIC0gMVxuICAgICAgICAgICAgICAgIG1heENvbHVtbiA9IGVkaXRvclZpZXcuZ2V0U2Nyb2xsUmlnaHQoKSAvIGNoYXJXaWR0aFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgbWluQ29sdW1uXG4gICAgICAgICAgICAgICAgICAgIG1heENvbHVtblxuICAgICAgICAgICAgICAgIF1cblxuICAgICAgICAgICAgZHJhd0xhYmVscyA9IChsaW5lTnVtYmVyLCBjb2x1bW4pID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBuZXh0S2V5cy5sZW5ndGhcblxuICAgICAgICAgICAgICAgIGtleUxhYmVsID0gbmV4dEtleXMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0ge3JvdzogbGluZU51bWJlciwgY29sdW1uOiBjb2x1bW59XG4gICAgICAgICAgICAgICAgIyBjcmVhdGVzIGEgcmVmZXJlbmNlOlxuICAgICAgICAgICAgICAgIEBhbGxQb3NpdGlvbnNba2V5TGFiZWxdID1cbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yOiBlZGl0b3IuaWRcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uXG5cbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBlZGl0b3IubWFya1NjcmVlblJhbmdlIG5ldyBSYW5nZShcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBvaW50KGxpbmVOdW1iZXIsIGNvbHVtbiksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQb2ludChsaW5lTnVtYmVyLCBjb2x1bW4pKSxcbiAgICAgICAgICAgICAgICAgICAgaW52YWxpZGF0ZTogJ3RvdWNoJ1xuXG4gICAgICAgICAgICAgICAgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQudGV4dENvbnRlbnQgPSBrZXlMYWJlbFxuICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IGZvbnRTaXplXG4gICAgICAgICAgICAgICAgbGFiZWxFbGVtZW50LmNsYXNzTGlzdC5hZGQgJ2p1bXB5LWxhYmVsJ1xuICAgICAgICAgICAgICAgIGlmIGhpZ2hDb250cmFzdFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuY2xhc3NMaXN0LmFkZCAnaGlnaC1jb250cmFzdCdcblxuICAgICAgICAgICAgICAgIGRlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIgbWFya2VyLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb3ZlcmxheSdcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogbGFiZWxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnaGVhZCdcbiAgICAgICAgICAgICAgICBAZGVjb3JhdGlvbnMucHVzaCBkZWNvcmF0aW9uXG5cbiAgICAgICAgICAgIFttaW5Db2x1bW4sIG1heENvbHVtbl0gPSBnZXRWaXNpYmxlQ29sdW1uUmFuZ2UgZWRpdG9yVmlld1xuICAgICAgICAgICAgcm93cyA9IGVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICAgICAgICAgICAgaWYgcm93c1xuICAgICAgICAgICAgICAgIFtmaXJzdFZpc2libGVSb3csIGxhc3RWaXNpYmxlUm93XSA9IHJvd3NcbiAgICAgICAgICAgICAgICAjIFRPRE86IFJpZ2h0IG5vdyB0aGVyZSBhcmUgaXNzdWVzIHdpdGggbGFzdFZpc2JsZVJvd1xuICAgICAgICAgICAgICAgIGZvciBsaW5lTnVtYmVyIGluIFtmaXJzdFZpc2libGVSb3cuLi5sYXN0VmlzaWJsZVJvd11cbiAgICAgICAgICAgICAgICAgICAgbGluZUNvbnRlbnRzID0gZWRpdG9yLmxpbmVUZXh0Rm9yU2NyZWVuUm93KGxpbmVOdW1iZXIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGVkaXRvci5pc0ZvbGRlZEF0U2NyZWVuUm93KGxpbmVOdW1iZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3TGFiZWxzIGxpbmVOdW1iZXIsIDBcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCh3b3JkID0gd29yZHNQYXR0ZXJuLmV4ZWMobGluZUNvbnRlbnRzKSkgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW4gPSB3b3JkLmluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBEbyBub3QgZG8gYW55dGhpbmcuLi4gbWFya2VycyBldGMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBpZiB0aGUgY29sdW1ucyBhcmUgb3V0IG9mIGJvdW5kcy4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbHVtbiA+IG1pbkNvbHVtbiAmJiBjb2x1bW4gPCBtYXhDb2x1bW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhd0xhYmVscyBsaW5lTnVtYmVyLCBjb2x1bW5cblxuICAgICAgICAgICAgQGluaXRpYWxpemVDbGVhckV2ZW50cyhlZGl0b3JWaWV3KVxuXG4gICAgY2xlYXJKdW1wTW9kZUhhbmRsZXI6ID0+XG4gICAgICAgIEBjbGVhckp1bXBNb2RlKClcblxuICAgIGluaXRpYWxpemVDbGVhckV2ZW50czogKGVkaXRvclZpZXcpIC0+XG4gICAgICAgIEBkaXNwb3NhYmxlcy5hZGQgZWRpdG9yVmlldy5vbkRpZENoYW5nZVNjcm9sbFRvcCA9PlxuICAgICAgICAgICAgQGNsZWFySnVtcE1vZGVIYW5kbGVyKClcbiAgICAgICAgQGRpc3Bvc2FibGVzLmFkZCBlZGl0b3JWaWV3Lm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdCA9PlxuICAgICAgICAgICAgQGNsZWFySnVtcE1vZGVIYW5kbGVyKClcblxuICAgICAgICBmb3IgZSBpbiBbJ2JsdXInLCAnY2xpY2snXVxuICAgICAgICAgICAgZWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyIGUsIEBjbGVhckp1bXBNb2RlSGFuZGxlciwgdHJ1ZVxuXG4gICAgY2xlYXJKdW1wTW9kZTogLT5cbiAgICAgICAgY2xlYXJBbGxNYXJrZXJzID0gPT5cbiAgICAgICAgICAgIGZvciBkZWNvcmF0aW9uIGluIEBkZWNvcmF0aW9uc1xuICAgICAgICAgICAgICAgIGRlY29yYXRpb24uZ2V0TWFya2VyKCkuZGVzdHJveSgpXG4gICAgICAgICAgICBAZGVjb3JhdGlvbnMgPSBbXSAjIFZlcnkgaW1wb3J0YW50IGZvciBHQy5cbiAgICAgICAgICAgICMgVmVyaWZpYWJsZSBpbiBEZXYgVG9vbHMgLT4gVGltZWxpbmUgLT4gTm9kZXMuXG5cbiAgICAgICAgaWYgQGNsZWFyZWRcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIEBjbGVhcmVkID0gdHJ1ZVxuICAgICAgICBAY2xlYXJLZXlzKClcbiAgICAgICAgQHN0YXR1c0Jhckp1bXB5Py5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG5cbiAgICAgICAgICAgIGVkaXRvclZpZXcuY2xhc3NMaXN0LnJlbW92ZSAnanVtcHktanVtcC1tb2RlJ1xuICAgICAgICAgICAgZm9yIGUgaW4gWydibHVyJywgJ2NsaWNrJ11cbiAgICAgICAgICAgICAgICBlZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIgZSwgQGNsZWFySnVtcE1vZGVIYW5kbGVyLCB0cnVlXG4gICAgICAgIGF0b20ua2V5bWFwcy5rZXlCaW5kaW5ncyA9IEBiYWNrZWRVcEtleUJpbmRpbmdzXG4gICAgICAgIGNsZWFyQWxsTWFya2VycygpXG4gICAgICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgICAgIEBkZXRhY2goKVxuXG4gICAganVtcDogLT5cbiAgICAgICAgbG9jYXRpb24gPSBAZmluZExvY2F0aW9uKClcbiAgICAgICAgaWYgbG9jYXRpb24gPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChjdXJyZW50RWRpdG9yKSA9PlxuICAgICAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhjdXJyZW50RWRpdG9yKVxuXG4gICAgICAgICAgICAjIFByZXZlbnQgb3RoZXIgZWRpdG9ycyBmcm9tIGp1bXBpbmcgY3Vyc29ycyBhcyB3ZWxsXG4gICAgICAgICAgICAjIFRPRE86IG1ha2UgYSB0ZXN0IGZvciB0aGlzIHJldHVybiBpZlxuICAgICAgICAgICAgcmV0dXJuIGlmIGN1cnJlbnRFZGl0b3IuaWQgIT0gbG9jYXRpb24uZWRpdG9yXG5cbiAgICAgICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShjdXJyZW50RWRpdG9yKVxuICAgICAgICAgICAgcGFuZS5hY3RpdmF0ZSgpXG5cbiAgICAgICAgICAgIGlzVmlzdWFsTW9kZSA9IGVkaXRvclZpZXcuY2xhc3NMaXN0LmNvbnRhaW5zICd2aXN1YWwtbW9kZSdcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQgPSAoY3VycmVudEVkaXRvci5nZXRTZWxlY3Rpb25zKCkubGVuZ3RoID09IDEgJiZcbiAgICAgICAgICAgICAgICBjdXJyZW50RWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpICE9ICcnKVxuICAgICAgICAgICAgaWYgKGlzVmlzdWFsTW9kZSB8fCBpc1NlbGVjdGVkKVxuICAgICAgICAgICAgICAgIGN1cnJlbnRFZGl0b3Iuc2VsZWN0VG9TY3JlZW5Qb3NpdGlvbiBsb2NhdGlvbi5wb3NpdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGN1cnJlbnRFZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24gbG9jYXRpb24ucG9zaXRpb25cblxuICAgICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0ICdqdW1weS51c2VIb21pbmdCZWFjb25FZmZlY3RPbkp1bXBzJ1xuICAgICAgICAgICAgICAgIEBkcmF3QmVhY29uIGN1cnJlbnRFZGl0b3IsIGxvY2F0aW9uXG5cbiAgICBkcmF3QmVhY29uOiAoZWRpdG9yLCBsb2NhdGlvbikgLT5cbiAgICAgICAgcmFuZ2UgPSBSYW5nZSBsb2NhdGlvbi5wb3NpdGlvbiwgbG9jYXRpb24ucG9zaXRpb25cbiAgICAgICAgbWFya2VyID0gZWRpdG9yLm1hcmtTY3JlZW5SYW5nZSByYW5nZSwgaW52YWxpZGF0ZTogJ25ldmVyJ1xuICAgICAgICBiZWFjb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdzcGFuJ1xuICAgICAgICBiZWFjb24uY2xhc3NMaXN0LmFkZCAnYmVhY29uJ1xuICAgICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIgbWFya2VyLFxuICAgICAgICAgICAgaXRlbTogYmVhY29uLFxuICAgICAgICAgICAgdHlwZTogJ292ZXJsYXknXG4gICAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAgICAgLCAxNTBcblxuICAgIGZpbmRMb2NhdGlvbjogLT5cbiAgICAgICAgbGFiZWwgPSBcIiN7QGZpcnN0Q2hhcn0je0BzZWNvbmRDaGFyfVwiXG4gICAgICAgIGlmIGxhYmVsIG9mIEBhbGxQb3NpdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBAYWxsUG9zaXRpb25zW2xhYmVsXVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG4gICAgc2VyaWFsaXplOiAtPlxuXG4gICAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAY29tbWFuZHM/LmRpc3Bvc2UoKVxuICAgICAgICBAY2xlYXJKdW1wTW9kZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gSnVtcHlWaWV3XG4iXX0=
