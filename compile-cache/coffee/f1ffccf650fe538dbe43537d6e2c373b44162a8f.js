(function() {
  var AFTERPROPS, AutoIndent, BRACE_CLOSE, BRACE_OPEN, CompositeDisposable, DidInsertText, File, JSXBRACE_CLOSE, JSXBRACE_OPEN, JSXTAG_CLOSE, JSXTAG_CLOSE_ATTRS, JSXTAG_OPEN, JSXTAG_SELFCLOSE_END, JSXTAG_SELFCLOSE_START, JS_ELSE, JS_IF, JS_RETURN, LINEALIGNED, NO_TOKEN, PAREN_CLOSE, PAREN_OPEN, PROPSALIGNED, Point, Range, SWITCH_BRACE_CLOSE, SWITCH_BRACE_OPEN, SWITCH_CASE, SWITCH_DEFAULT, TAGALIGNED, TEMPLATE_END, TEMPLATE_START, TERNARY_ELSE, TERNARY_IF, YAML, autoCompleteJSX, fs, path, ref, stripJsonComments,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, File = ref.File, Range = ref.Range, Point = ref.Point;

  fs = require('fs-plus');

  path = require('path');

  autoCompleteJSX = require('./auto-complete-jsx');

  DidInsertText = require('./did-insert-text');

  stripJsonComments = require('strip-json-comments');

  YAML = require('js-yaml');

  NO_TOKEN = 0;

  JSXTAG_SELFCLOSE_START = 1;

  JSXTAG_SELFCLOSE_END = 2;

  JSXTAG_OPEN = 3;

  JSXTAG_CLOSE_ATTRS = 4;

  JSXTAG_CLOSE = 5;

  JSXBRACE_OPEN = 6;

  JSXBRACE_CLOSE = 7;

  BRACE_OPEN = 8;

  BRACE_CLOSE = 9;

  TERNARY_IF = 10;

  TERNARY_ELSE = 11;

  JS_IF = 12;

  JS_ELSE = 13;

  SWITCH_BRACE_OPEN = 14;

  SWITCH_BRACE_CLOSE = 15;

  SWITCH_CASE = 16;

  SWITCH_DEFAULT = 17;

  JS_RETURN = 18;

  PAREN_OPEN = 19;

  PAREN_CLOSE = 20;

  TEMPLATE_START = 21;

  TEMPLATE_END = 22;

  TAGALIGNED = 'tag-aligned';

  LINEALIGNED = 'line-aligned';

  AFTERPROPS = 'after-props';

  PROPSALIGNED = 'props-aligned';

  module.exports = AutoIndent = (function() {
    function AutoIndent(editor) {
      this.editor = editor;
      this.onMouseUp = bind(this.onMouseUp, this);
      this.onMouseDown = bind(this.onMouseDown, this);
      this.handleOnDidStopChanging = bind(this.handleOnDidStopChanging, this);
      this.changedCursorPosition = bind(this.changedCursorPosition, this);
      this.DidInsertText = new DidInsertText(this.editor);
      this.autoJsx = atom.config.get('language-babel').autoIndentJSX;
      this.JSXREGEXP = /(<)([$_A-Za-z](?:[$_.:\-A-Za-z0-9])*)|(\/>)|(<\/)([$_A-Za-z](?:[$._:\-A-Za-z0-9])*)(>)|(>)|({)|(})|(\?)|(:)|(if)|(else)|(case)|(default)|(return)|(\()|(\))|(`)/g;
      this.mouseUp = true;
      this.multipleCursorTrigger = 1;
      this.disposables = new CompositeDisposable();
      this.eslintIndentOptions = this.getIndentOptions();
      this.templateDepth = 0;
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:auto-indent-jsx-on': (function(_this) {
          return function(event) {
            _this.autoJsx = true;
            return _this.eslintIndentOptions = _this.getIndentOptions();
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:auto-indent-jsx-off': (function(_this) {
          return function(event) {
            return _this.autoJsx = false;
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:toggle-auto-indent-jsx': (function(_this) {
          return function(event) {
            _this.autoJsx = !_this.autoJsx;
            if (_this.autoJsx) {
              return _this.eslintIndentOptions = _this.getIndentOptions();
            }
          };
        })(this)
      }));
      document.addEventListener('mousedown', this.onMouseDown);
      document.addEventListener('mouseup', this.onMouseUp);
      this.disposables.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function(event) {
          return _this.changedCursorPosition(event);
        };
      })(this)));
      this.handleOnDidStopChanging();
    }

    AutoIndent.prototype.destroy = function() {
      this.disposables.dispose();
      this.onDidStopChangingHandler.dispose();
      document.removeEventListener('mousedown', this.onMouseDown);
      return document.removeEventListener('mouseup', this.onMouseUp);
    };

    AutoIndent.prototype.changedCursorPosition = function(event) {
      var blankLineEndPos, bufferRow, columnToMoveTo, cursorPosition, cursorPositions, endPointOfJsx, j, len, previousRow, ref1, ref2, startPointOfJsx;
      if (!this.autoJsx) {
        return;
      }
      if (!this.mouseUp) {
        return;
      }
      if (event.oldBufferPosition.row === event.newBufferPosition.row) {
        return;
      }
      bufferRow = event.newBufferPosition.row;
      if (this.editor.hasMultipleCursors()) {
        cursorPositions = this.editor.getCursorBufferPositions();
        if (cursorPositions.length === this.multipleCursorTrigger) {
          this.multipleCursorTrigger = 1;
          bufferRow = 0;
          for (j = 0, len = cursorPositions.length; j < len; j++) {
            cursorPosition = cursorPositions[j];
            if (cursorPosition.row > bufferRow) {
              bufferRow = cursorPosition.row;
            }
          }
        } else {
          this.multipleCursorTrigger++;
          return;
        }
      } else {
        cursorPosition = event.newBufferPosition;
      }
      previousRow = event.oldBufferPosition.row;
      if (this.jsxInScope(previousRow)) {
        blankLineEndPos = (ref1 = /^\s*$/.exec(this.editor.lineTextForBufferRow(previousRow))) != null ? ref1[0].length : void 0;
        if (blankLineEndPos != null) {
          this.indentRow({
            row: previousRow,
            blockIndent: 0
          });
        }
      }
      if (!this.jsxInScope(bufferRow)) {
        return;
      }
      endPointOfJsx = new Point(bufferRow, 0);
      startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, cursorPosition);
      this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
      columnToMoveTo = (ref2 = /^\s*$/.exec(this.editor.lineTextForBufferRow(bufferRow))) != null ? ref2[0].length : void 0;
      if (columnToMoveTo != null) {
        return this.editor.setCursorBufferPosition([bufferRow, columnToMoveTo]);
      }
    };

    AutoIndent.prototype.didStopChanging = function() {
      var endPointOfJsx, highestRow, lowestRow, selectedRange, startPointOfJsx;
      if (!this.autoJsx) {
        return;
      }
      if (!this.mouseUp) {
        return;
      }
      selectedRange = this.editor.getSelectedBufferRange();
      if (selectedRange.start.row === selectedRange.end.row && selectedRange.start.column === selectedRange.end.column && indexOf.call(this.editor.scopeDescriptorForBufferPosition([selectedRange.start.row, selectedRange.start.column]).getScopesArray(), 'JSXStartTagEnd') >= 0) {
        return;
      }
      highestRow = Math.max(selectedRange.start.row, selectedRange.end.row);
      lowestRow = Math.min(selectedRange.start.row, selectedRange.end.row);
      this.onDidStopChangingHandler.dispose();
      while (highestRow >= lowestRow) {
        if (this.jsxInScope(highestRow)) {
          endPointOfJsx = new Point(highestRow, 0);
          startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, endPointOfJsx);
          this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
          highestRow = startPointOfJsx.row - 1;
        } else {
          highestRow = highestRow - 1;
        }
      }
      setTimeout(this.handleOnDidStopChanging, 300);
    };

    AutoIndent.prototype.handleOnDidStopChanging = function() {
      return this.onDidStopChangingHandler = this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.didStopChanging();
        };
      })(this));
    };

    AutoIndent.prototype.jsxInScope = function(bufferRow) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition([bufferRow, 0]).getScopesArray();
      return indexOf.call(scopes, 'meta.tag.jsx') >= 0;
    };

    AutoIndent.prototype.indentJSX = function(range) {
      var blankLineEndPos, firstCharIndentation, firstTagInLineIndentation, idxOfToken, indent, indentRecalc, isFirstTagOfBlock, isFirstTokenOfLine, j, line, match, matchColumn, matchPointEnd, matchPointStart, matchRange, parentTokenIdx, ref1, ref2, ref3, results, row, stackOfTokensStillOpen, token, tokenIndentation, tokenOnThisLine, tokenStack;
      tokenStack = [];
      idxOfToken = 0;
      stackOfTokensStillOpen = [];
      indent = 0;
      isFirstTagOfBlock = true;
      this.JSXREGEXP.lastIndex = 0;
      this.templateDepth = 0;
      results = [];
      for (row = j = ref1 = range.start.row, ref2 = range.end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
        isFirstTokenOfLine = true;
        tokenOnThisLine = false;
        indentRecalc = false;
        line = this.editor.lineTextForBufferRow(row);
        while ((match = this.JSXREGEXP.exec(line)) !== null) {
          matchColumn = match.index;
          matchPointStart = new Point(row, matchColumn);
          matchPointEnd = new Point(row, matchColumn + match[0].length - 1);
          matchRange = new Range(matchPointStart, matchPointEnd);
          if (!(token = this.getToken(row, match))) {
            continue;
          }
          firstCharIndentation = this.editor.indentationForBufferRow(row);
          if (this.editor.getSoftTabs()) {
            tokenIndentation = matchColumn / this.editor.getTabLength();
          } else {
            tokenIndentation = (function(editor) {
              var charsFound, hardTabsFound, i, k, ref3;
              this.editor = editor;
              hardTabsFound = charsFound = 0;
              for (i = k = 0, ref3 = matchColumn; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
                if ((line.substr(i, 1)) === '\t') {
                  hardTabsFound++;
                } else {
                  charsFound++;
                }
              }
              return hardTabsFound + (charsFound / this.editor.getTabLength());
            })(this.editor);
          }
          if (isFirstTokenOfLine) {
            firstTagInLineIndentation = tokenIndentation;
          }
          switch (token) {
            case JSXTAG_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === BRACE_OPEN && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tokenIndentation = firstCharIndentation = firstTagInLineIndentation = this.eslintIndentOptions.jsxIndent[1] + this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if (isFirstTagOfBlock && (parentTokenIdx != null)) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: this.getIndentOfPreviousRow(row),
                    jsxIndent: 1
                  });
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                    jsxIndent: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_OPEN,
                name: match[2],
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXTAG_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row,
                  blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                });
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_CLOSE,
                name: match[5],
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_SELFCLOSE_END:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing);
                } else {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstTagInLineIndentation,
                    jsxIndentProps: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_SELFCLOSE_END,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
                tokenStack[parentTokenIdx].type = JSXTAG_SELFCLOSE_START;
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_CLOSE_ATTRS:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty);
                } else {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstTagInLineIndentation,
                    jsxIndentProps: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_CLOSE_ATTRS,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXBRACE_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  if (tokenStack[parentTokenIdx].type === JSXTAG_OPEN && tokenStack[parentTokenIdx].termsThisTagsAttributesIdx === null) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndentProps: 1
                    });
                  } else {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndent: 1
                    });
                  }
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = true;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXBRACE_OPEN,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXBRACE_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row,
                  blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                });
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXBRACE_CLOSE,
                name: '',
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case BRACE_OPEN:
            case SWITCH_BRACE_OPEN:
            case PAREN_OPEN:
            case TEMPLATE_START:
              tokenOnThisLine = true;
              if (token === TEMPLATE_START) {
                this.templateDepth++;
              }
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === token && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tokenIndentation = firstCharIndentation = this.eslintIndentOptions.jsxIndent[1] + this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                    jsxIndent: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case BRACE_CLOSE:
            case SWITCH_BRACE_CLOSE:
            case PAREN_CLOSE:
            case TEMPLATE_END:
              if (token === SWITCH_BRACE_CLOSE) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (tokenStack[parentTokenIdx].type === SWITCH_CASE || tokenStack[parentTokenIdx].type === SWITCH_DEFAULT) {
                  stackOfTokensStillOpen.pop();
                }
              }
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              if (parentTokenIdx != null) {
                tokenStack.push({
                  type: token,
                  name: '',
                  row: row,
                  parentTokenIdx: parentTokenIdx
                });
                if (parentTokenIdx >= 0) {
                  tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
                }
                idxOfToken++;
              }
              if (token === TEMPLATE_END) {
                this.templateDepth--;
              }
              break;
            case SWITCH_CASE:
            case SWITCH_DEFAULT:
              tokenOnThisLine = true;
              isFirstTagOfBlock = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  if (tokenStack[parentTokenIdx].type === SWITCH_CASE || tokenStack[parentTokenIdx].type === SWITCH_DEFAULT) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                    });
                    stackOfTokensStillOpen.pop();
                  } else if (tokenStack[parentTokenIdx].type === SWITCH_BRACE_OPEN) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndent: 1
                    });
                  }
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case TERNARY_IF:
            case JS_IF:
            case JS_ELSE:
            case JS_RETURN:
              isFirstTagOfBlock = true;
          }
        }
        if (idxOfToken && !tokenOnThisLine) {
          if (row !== range.end.row) {
            blankLineEndPos = (ref3 = /^\s*$/.exec(this.editor.lineTextForBufferRow(row))) != null ? ref3[0].length : void 0;
            if (blankLineEndPos != null) {
              results.push(this.indentRow({
                row: row,
                blockIndent: 0
              }));
            } else {
              results.push(this.indentUntokenisedLine(row, tokenStack, stackOfTokensStillOpen));
            }
          } else {
            results.push(this.indentUntokenisedLine(row, tokenStack, stackOfTokensStillOpen));
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    AutoIndent.prototype.indentUntokenisedLine = function(row, tokenStack, stackOfTokensStillOpen) {
      var parentTokenIdx, token;
      stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
      token = tokenStack[parentTokenIdx];
      switch (token.type) {
        case JSXTAG_OPEN:
        case JSXTAG_SELFCLOSE_START:
          if (token.termsThisTagsAttributesIdx === null) {
            return this.indentRow({
              row: row,
              blockIndent: token.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: token.firstCharIndentation,
              jsxIndent: 1
            });
          }
          break;
        case JSXBRACE_OPEN:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case BRACE_OPEN:
        case SWITCH_BRACE_OPEN:
        case PAREN_OPEN:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case JSXTAG_SELFCLOSE_END:
        case JSXBRACE_CLOSE:
        case JSXTAG_CLOSE_ATTRS:
          return this.indentRow({
            row: row,
            blockIndent: tokenStack[token.parentTokenIdx].firstCharIndentation,
            jsxIndentProps: 1
          });
        case BRACE_CLOSE:
        case SWITCH_BRACE_CLOSE:
        case PAREN_CLOSE:
          return this.indentRow({
            row: row,
            blockIndent: tokenStack[token.parentTokenIdx].firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case SWITCH_CASE:
        case SWITCH_DEFAULT:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1
          });
        case TEMPLATE_START:
        case TEMPLATE_END:
      }
    };

    AutoIndent.prototype.getToken = function(bufferRow, match) {
      var scope;
      scope = this.editor.scopeDescriptorForBufferPosition([bufferRow, match.index]).getScopesArray().pop();
      if ('punctuation.definition.tag.jsx' === scope) {
        if (match[1] != null) {
          return JSXTAG_OPEN;
        } else if (match[3] != null) {
          return JSXTAG_SELFCLOSE_END;
        }
      } else if ('JSXEndTagStart' === scope) {
        if (match[4] != null) {
          return JSXTAG_CLOSE;
        }
      } else if ('JSXStartTagEnd' === scope) {
        if (match[7] != null) {
          return JSXTAG_CLOSE_ATTRS;
        }
      } else if (match[8] != null) {
        if ('punctuation.section.embedded.begin.jsx' === scope) {
          return JSXBRACE_OPEN;
        } else if ('meta.brace.curly.switchStart.js' === scope) {
          return SWITCH_BRACE_OPEN;
        } else if ('meta.brace.curly.js' === scope || 'meta.brace.curly.litobj.js' === scope) {
          return BRACE_OPEN;
        }
      } else if (match[9] != null) {
        if ('punctuation.section.embedded.end.jsx' === scope) {
          return JSXBRACE_CLOSE;
        } else if ('meta.brace.curly.switchEnd.js' === scope) {
          return SWITCH_BRACE_CLOSE;
        } else if ('meta.brace.curly.js' === scope || 'meta.brace.curly.litobj.js' === scope) {
          return BRACE_CLOSE;
        }
      } else if (match[10] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_IF;
        }
      } else if (match[11] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_ELSE;
        }
      } else if (match[12] != null) {
        if ('keyword.control.conditional.js' === scope) {
          return JS_IF;
        }
      } else if (match[13] != null) {
        if ('keyword.control.conditional.js' === scope) {
          return JS_ELSE;
        }
      } else if (match[14] != null) {
        if ('keyword.control.switch.js' === scope) {
          return SWITCH_CASE;
        }
      } else if (match[15] != null) {
        if ('keyword.control.switch.js' === scope) {
          return SWITCH_DEFAULT;
        }
      } else if (match[16] != null) {
        if ('keyword.control.flow.js' === scope) {
          return JS_RETURN;
        }
      } else if (match[17] != null) {
        if ('meta.brace.round.js' === scope || 'meta.brace.round.graphql' === scope || 'meta.brace.round.directive.graphql' === scope) {
          return PAREN_OPEN;
        }
      } else if (match[18] != null) {
        if ('meta.brace.round.js' === scope || 'meta.brace.round.graphql' === scope || 'meta.brace.round.directive.graphql' === scope) {
          return PAREN_CLOSE;
        }
      } else if (match[19] != null) {
        if ('punctuation.definition.quasi.begin.js' === scope) {
          return TEMPLATE_START;
        }
        if ('punctuation.definition.quasi.end.js' === scope) {
          return TEMPLATE_END;
        }
      }
      return NO_TOKEN;
    };

    AutoIndent.prototype.getIndentOfPreviousRow = function(row) {
      var j, line, ref1;
      if (!row) {
        return 0;
      }
      for (row = j = ref1 = row - 1; ref1 <= 0 ? j < 0 : j > 0; row = ref1 <= 0 ? ++j : --j) {
        line = this.editor.lineTextForBufferRow(row);
        if (/.*\S/.test(line)) {
          return this.editor.indentationForBufferRow(row);
        }
      }
      return 0;
    };

    AutoIndent.prototype.getIndentOptions = function() {
      var eslintrcFilename;
      if (!this.autoJsx) {
        return this.translateIndentOptions();
      }
      if (eslintrcFilename = this.getEslintrcFilename()) {
        eslintrcFilename = new File(eslintrcFilename);
        return this.translateIndentOptions(this.readEslintrcOptions(eslintrcFilename.getPath()));
      } else {
        return this.translateIndentOptions({});
      }
    };

    AutoIndent.prototype.getEslintrcFilename = function() {
      var projectContainingSource;
      projectContainingSource = atom.project.relativizePath(this.editor.getPath());
      if (projectContainingSource[0] != null) {
        return path.join(projectContainingSource[0], '.eslintrc');
      }
    };

    AutoIndent.prototype.onMouseDown = function() {
      return this.mouseUp = false;
    };

    AutoIndent.prototype.onMouseUp = function() {
      return this.mouseUp = true;
    };

    AutoIndent.prototype.readEslintrcOptions = function(eslintrcFile) {
      var err, eslintRules, fileContent;
      if (fs.existsSync(eslintrcFile)) {
        fileContent = stripJsonComments(fs.readFileSync(eslintrcFile, 'utf8'));
        try {
          eslintRules = (YAML.safeLoad(fileContent)).rules;
          if (eslintRules) {
            return eslintRules;
          }
        } catch (error) {
          err = error;
          atom.notifications.addError("LB: Error reading .eslintrc at " + eslintrcFile, {
            dismissable: true,
            detail: "" + err.message
          });
        }
      }
      return {};
    };

    AutoIndent.prototype.translateIndentOptions = function(eslintRules) {
      var ES_DEFAULT_INDENT, defaultIndent, eslintIndentOptions, rule;
      eslintIndentOptions = {
        jsxIndent: [1, 1],
        jsxIndentProps: [1, 1],
        jsxClosingBracketLocation: [
          1, {
            selfClosing: TAGALIGNED,
            nonEmpty: TAGALIGNED
          }
        ]
      };
      if (typeof eslintRules !== "object") {
        return eslintIndentOptions;
      }
      ES_DEFAULT_INDENT = 4;
      rule = eslintRules['indent'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        defaultIndent = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        if (typeof rule[1] === 'number') {
          defaultIndent = rule[1] / this.editor.getTabLength();
        } else {
          defaultIndent = 1;
        }
      } else {
        defaultIndent = 1;
      }
      rule = eslintRules['react/jsx-indent'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxIndent[0] = rule;
        eslintIndentOptions.jsxIndent[1] = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxIndent[0] = rule[0];
        if (typeof rule[1] === 'number') {
          eslintIndentOptions.jsxIndent[1] = rule[1] / this.editor.getTabLength();
        } else {
          eslintIndentOptions.jsxIndent[1] = 1;
        }
      } else {
        eslintIndentOptions.jsxIndent[1] = defaultIndent;
      }
      rule = eslintRules['react/jsx-indent-props'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxIndentProps[0] = rule;
        eslintIndentOptions.jsxIndentProps[1] = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxIndentProps[0] = rule[0];
        if (typeof rule[1] === 'number') {
          eslintIndentOptions.jsxIndentProps[1] = rule[1] / this.editor.getTabLength();
        } else {
          eslintIndentOptions.jsxIndentProps[1] = 1;
        }
      } else {
        eslintIndentOptions.jsxIndentProps[1] = defaultIndent;
      }
      rule = eslintRules['react/jsx-closing-bracket-location'];
      eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = TAGALIGNED;
      eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = TAGALIGNED;
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxClosingBracketLocation[0] = rule;
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxClosingBracketLocation[0] = rule[0];
        if (typeof rule[1] === 'string') {
          eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1];
        } else {
          if (rule[1].selfClosing != null) {
            eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = rule[1].selfClosing;
          }
          if (rule[1].nonEmpty != null) {
            eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1].nonEmpty;
          }
        }
      }
      return eslintIndentOptions;
    };

    AutoIndent.prototype.indentForClosingBracket = function(row, parentTag, closingBracketRule) {
      if (this.eslintIndentOptions.jsxClosingBracketLocation[0]) {
        if (closingBracketRule === TAGALIGNED) {
          return this.indentRow({
            row: row,
            blockIndent: parentTag.tokenIndentation
          });
        } else if (closingBracketRule === LINEALIGNED) {
          return this.indentRow({
            row: row,
            blockIndent: parentTag.firstCharIndentation
          });
        } else if (closingBracketRule === AFTERPROPS) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation
            });
          }
        } else if (closingBracketRule === PROPSALIGNED) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation
            });
          }
        }
      }
    };

    AutoIndent.prototype.indentRow = function(options) {
      var allowAdditionalIndents, blockIndent, jsxIndent, jsxIndentProps, row;
      row = options.row, allowAdditionalIndents = options.allowAdditionalIndents, blockIndent = options.blockIndent, jsxIndent = options.jsxIndent, jsxIndentProps = options.jsxIndentProps;
      if (this.templateDepth > 0) {
        return false;
      }
      if (jsxIndent) {
        if (this.eslintIndentOptions.jsxIndent[0]) {
          if (this.eslintIndentOptions.jsxIndent[1]) {
            blockIndent += jsxIndent * this.eslintIndentOptions.jsxIndent[1];
          }
        }
      }
      if (jsxIndentProps) {
        if (this.eslintIndentOptions.jsxIndentProps[0]) {
          if (this.eslintIndentOptions.jsxIndentProps[1]) {
            blockIndent += jsxIndentProps * this.eslintIndentOptions.jsxIndentProps[1];
          }
        }
      }
      if (allowAdditionalIndents) {
        if (this.editor.indentationForBufferRow(row) < blockIndent) {
          this.editor.setIndentationForBufferRow(row, blockIndent, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      } else {
        if (this.editor.indentationForBufferRow(row) !== blockIndent) {
          this.editor.setIndentationForBufferRow(row, blockIndent, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      }
      return false;
    };

    return AutoIndent;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1iYWJlbC9saWIvYXV0by1pbmRlbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2ZkFBQTtJQUFBOzs7RUFBQSxNQUE0QyxPQUFBLENBQVEsTUFBUixDQUE1QyxFQUFDLDZDQUFELEVBQXNCLGVBQXRCLEVBQTRCLGlCQUE1QixFQUFtQzs7RUFDbkMsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDbEIsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVI7O0VBQ2hCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxxQkFBUjs7RUFDcEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSOztFQUdQLFFBQUEsR0FBMEI7O0VBQzFCLHNCQUFBLEdBQTBCOztFQUMxQixvQkFBQSxHQUEwQjs7RUFDMUIsV0FBQSxHQUEwQjs7RUFDMUIsa0JBQUEsR0FBMEI7O0VBQzFCLFlBQUEsR0FBMEI7O0VBQzFCLGFBQUEsR0FBMEI7O0VBQzFCLGNBQUEsR0FBMEI7O0VBQzFCLFVBQUEsR0FBMEI7O0VBQzFCLFdBQUEsR0FBMEI7O0VBQzFCLFVBQUEsR0FBMEI7O0VBQzFCLFlBQUEsR0FBMEI7O0VBQzFCLEtBQUEsR0FBMEI7O0VBQzFCLE9BQUEsR0FBMEI7O0VBQzFCLGlCQUFBLEdBQTBCOztFQUMxQixrQkFBQSxHQUEwQjs7RUFDMUIsV0FBQSxHQUEwQjs7RUFDMUIsY0FBQSxHQUEwQjs7RUFDMUIsU0FBQSxHQUEwQjs7RUFDMUIsVUFBQSxHQUEwQjs7RUFDMUIsV0FBQSxHQUEwQjs7RUFDMUIsY0FBQSxHQUEwQjs7RUFDMUIsWUFBQSxHQUEwQjs7RUFHMUIsVUFBQSxHQUFnQjs7RUFDaEIsV0FBQSxHQUFn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QSxHQUFZLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxTQUFVLENBQUEsQ0FBQSxFQUQ1RDtXQURGO1NBREY7O01BSUEsSUFBRyxjQUFIO1FBQ0UsSUFBRyxJQUFDLENBQUEsbUJBQW1CLENBQUMsY0FBZSxDQUFBLENBQUEsQ0FBdkM7VUFDRSxJQUFHLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxjQUFlLENBQUEsQ0FBQSxDQUF2QztZQUNFLFdBQUEsSUFBZSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxjQUFlLENBQUEsQ0FBQSxFQUR0RTtXQURGO1NBREY7O01BT0EsSUFBRyxzQkFBSDtRQUNFLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxHQUFoQyxDQUFBLEdBQXVDLFdBQTFDO1VBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxHQUFuQyxFQUF3QyxXQUF4QyxFQUFxRDtZQUFFLHlCQUFBLEVBQTJCLEtBQTdCO1dBQXJEO0FBQ0EsaUJBQU8sS0FGVDtTQURGO09BQUEsTUFBQTtRQUtFLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxHQUFoQyxDQUFBLEtBQTBDLFdBQTdDO1VBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxHQUFuQyxFQUF3QyxXQUF4QyxFQUFxRDtZQUFFLHlCQUFBLEVBQTJCLEtBQTdCO1dBQXJEO0FBQ0EsaUJBQU8sS0FGVDtTQUxGOztBQVFBLGFBQU87SUF2QkU7Ozs7O0FBMXdCYiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBGaWxlLCBSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuYXV0b0NvbXBsZXRlSlNYID0gcmVxdWlyZSAnLi9hdXRvLWNvbXBsZXRlLWpzeCdcbkRpZEluc2VydFRleHQgPSByZXF1aXJlICcuL2RpZC1pbnNlcnQtdGV4dCdcbnN0cmlwSnNvbkNvbW1lbnRzID0gcmVxdWlyZSAnc3RyaXAtanNvbi1jb21tZW50cydcbllBTUwgPSByZXF1aXJlICdqcy15YW1sJ1xuXG5cbk5PX1RPS0VOICAgICAgICAgICAgICAgID0gMFxuSlNYVEFHX1NFTEZDTE9TRV9TVEFSVCAgPSAxICAgICAgICMgdGhlIDx0YWcgaW4gPHRhZyAvPlxuSlNYVEFHX1NFTEZDTE9TRV9FTkQgICAgPSAyICAgICAgICMgdGhlIC8+IGluIDx0YWcgLz5cbkpTWFRBR19PUEVOICAgICAgICAgICAgID0gMyAgICAgICAjIHRoZSA8dGFnIGluIDx0YWc+PC90YWc+XG5KU1hUQUdfQ0xPU0VfQVRUUlMgICAgICA9IDQgICAgICAgIyB0aGUgMXN0ID4gaW4gPHRhZz48L3RhZz5cbkpTWFRBR19DTE9TRSAgICAgICAgICAgID0gNSAgICAgICAjIGEgPC90YWc+XG5KU1hCUkFDRV9PUEVOICAgICAgICAgICA9IDYgICAgICAgIyBlbWJlZGRlZCBleHByZXNzaW9uIGJyYWNlIHN0YXJ0IHtcbkpTWEJSQUNFX0NMT1NFICAgICAgICAgID0gNyAgICAgICAjIGVtYmVkZGVkIGV4cHJlc3Npb24gYnJhY2UgZW5kIH1cbkJSQUNFX09QRU4gICAgICAgICAgICAgID0gOCAgICAgICAjIEphdmFzY3JpcHQgYnJhY2VcbkJSQUNFX0NMT1NFICAgICAgICAgICAgID0gOSAgICAgICAjIEphdmFzY3JpcHQgYnJhY2VcblRFUk5BUllfSUYgICAgICAgICAgICAgID0gMTAgICAgICAjIFRlcm5hcnkgP1xuVEVSTkFSWV9FTFNFICAgICAgICAgICAgPSAxMSAgICAgICMgVGVybmFyeSA6XG5KU19JRiAgICAgICAgICAgICAgICAgICA9IDEyICAgICAgIyBKUyBJRlxuSlNfRUxTRSAgICAgICAgICAgICAgICAgPSAxMyAgICAgICMgSlMgRUxTRVxuU1dJVENIX0JSQUNFX09QRU4gICAgICAgPSAxNCAgICAgICMgb3BlbmluZyBicmFjZSBpbiBzd2l0Y2ggeyB9XG5TV0lUQ0hfQlJBQ0VfQ0xPU0UgICAgICA9IDE1ICAgICAgIyBjbG9zaW5nIGJyYWNlIGluIHN3aXRjaCB7IH1cblNXSVRDSF9DQVNFICAgICAgICAgICAgID0gMTYgICAgICAjIHN3aXRjaCBjYXNlIHN0YXRlbWVudFxuU1dJVENIX0RFRkFVTFQgICAgICAgICAgPSAxNyAgICAgICMgc3dpdGNoIGRlZmF1bHQgc3RhdGVtZW50XG5KU19SRVRVUk4gICAgICAgICAgICAgICA9IDE4ICAgICAgIyBKUyByZXR1cm5cblBBUkVOX09QRU4gICAgICAgICAgICAgID0gMTkgICAgICAjIHBhcmVuIG9wZW4gKFxuUEFSRU5fQ0xPU0UgICAgICAgICAgICAgPSAyMCAgICAgICMgcGFyZW4gY2xvc2UgKVxuVEVNUExBVEVfU1RBUlQgICAgICAgICAgPSAyMSAgICAgICMgYCBiYWNrLXRpY2sgc3RhcnRcblRFTVBMQVRFX0VORCAgICAgICAgICAgID0gMjIgICAgICAjIGAgYmFjay10aWNrIGVuZFxuXG4jIGVzbGludCBwcm9wZXJ0eSB2YWx1ZXNcblRBR0FMSUdORUQgICAgPSAndGFnLWFsaWduZWQnXG5MSU5FQUxJR05FRCAgID0gJ2xpbmUtYWxpZ25lZCdcbkFGVEVSUFJPUFMgICAgPSAnYWZ0ZXItcHJvcHMnXG5QUk9QU0FMSUdORUQgID0gJ3Byb3BzLWFsaWduZWQnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEF1dG9JbmRlbnRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuICAgIEBEaWRJbnNlcnRUZXh0ID0gbmV3IERpZEluc2VydFRleHQoQGVkaXRvcilcbiAgICBAYXV0b0pzeCA9IGF0b20uY29uZmlnLmdldCgnbGFuZ3VhZ2UtYmFiZWwnKS5hdXRvSW5kZW50SlNYXG4gICAgIyByZWdleCB0byBzZWFyY2ggZm9yIHRhZyBvcGVuL2Nsb3NlIHRhZyBhbmQgY2xvc2UgdGFnXG4gICAgQEpTWFJFR0VYUCA9IC8oPCkoWyRfQS1aYS16XSg/OlskXy46XFwtQS1aYS16MC05XSkqKXwoXFwvPil8KDxcXC8pKFskX0EtWmEtel0oPzpbJC5fOlxcLUEtWmEtejAtOV0pKikoPil8KD4pfCh7KXwofSl8KFxcPyl8KDopfChpZil8KGVsc2UpfChjYXNlKXwoZGVmYXVsdCl8KHJldHVybil8KFxcKCl8KFxcKSl8KGApL2dcbiAgICBAbW91c2VVcCA9IHRydWVcbiAgICBAbXVsdGlwbGVDdXJzb3JUcmlnZ2VyID0gMVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAZXNsaW50SW5kZW50T3B0aW9ucyA9IEBnZXRJbmRlbnRPcHRpb25zKClcbiAgICBAdGVtcGxhdGVEZXB0aCA9IDAgIyB0cmFjayBkZXB0aCBvZiBhbnkgZW1iZWRkZWQgYmFjay10aWNrIHRlbXBsYXRlc1xuXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdsYW5ndWFnZS1iYWJlbDphdXRvLWluZGVudC1qc3gtb24nOiAoZXZlbnQpID0+XG4gICAgICAgIEBhdXRvSnN4ID0gdHJ1ZVxuICAgICAgICBAZXNsaW50SW5kZW50T3B0aW9ucyA9IEBnZXRJbmRlbnRPcHRpb25zKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2xhbmd1YWdlLWJhYmVsOmF1dG8taW5kZW50LWpzeC1vZmYnOiAoZXZlbnQpID0+ICBAYXV0b0pzeCA9IGZhbHNlXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdsYW5ndWFnZS1iYWJlbDp0b2dnbGUtYXV0by1pbmRlbnQtanN4JzogKGV2ZW50KSA9PlxuICAgICAgICBAYXV0b0pzeCA9IG5vdCBAYXV0b0pzeFxuICAgICAgICBpZiBAYXV0b0pzeCB0aGVuIEBlc2xpbnRJbmRlbnRPcHRpb25zID0gQGdldEluZGVudE9wdGlvbnMoKVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgQG9uTW91c2VEb3duXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIEBvbk1vdXNlVXBcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT4gQGNoYW5nZWRDdXJzb3JQb3NpdGlvbihldmVudClcbiAgICBAaGFuZGxlT25EaWRTdG9wQ2hhbmdpbmcoKVxuXG4gIGRlc3Ryb3k6ICgpIC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBvbkRpZFN0b3BDaGFuZ2luZ0hhbmRsZXIuZGlzcG9zZSgpXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgQG9uTW91c2VEb3duXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIEBvbk1vdXNlVXBcblxuICAjIGNoYW5nZWQgY3Vyc29yIHBvc2l0aW9uXG4gIGNoYW5nZWRDdXJzb3JQb3NpdGlvbjogKGV2ZW50KSA9PlxuICAgIHJldHVybiB1bmxlc3MgQGF1dG9Kc3hcbiAgICByZXR1cm4gdW5sZXNzIEBtb3VzZVVwXG4gICAgcmV0dXJuIHVubGVzcyBldmVudC5vbGRCdWZmZXJQb3NpdGlvbi5yb3cgaXNudCBldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICBidWZmZXJSb3cgPSBldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICAjIGhhbmRsZSBtdWx0aXBsZSBjdXJzb3JzLiBvbmx5IHRyaWdnZXIgaW5kZW50IG9uIG9uZSBjaGFuZ2UgZXZlbnRcbiAgICAjIGFuZCB0aGVuIG9ubHkgYXQgdGhlIGhpZ2hlc3Qgcm93XG4gICAgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxuICAgICAgY3Vyc29yUG9zaXRpb25zID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuICAgICAgaWYgY3Vyc29yUG9zaXRpb25zLmxlbmd0aCBpcyBAbXVsdGlwbGVDdXJzb3JUcmlnZ2VyXG4gICAgICAgIEBtdWx0aXBsZUN1cnNvclRyaWdnZXIgPSAxXG4gICAgICAgIGJ1ZmZlclJvdyA9IDBcbiAgICAgICAgZm9yIGN1cnNvclBvc2l0aW9uIGluIGN1cnNvclBvc2l0aW9uc1xuICAgICAgICAgIGlmIGN1cnNvclBvc2l0aW9uLnJvdyA+IGJ1ZmZlclJvdyB0aGVuIGJ1ZmZlclJvdyA9IGN1cnNvclBvc2l0aW9uLnJvd1xuICAgICAgZWxzZVxuICAgICAgICBAbXVsdGlwbGVDdXJzb3JUcmlnZ2VyKytcbiAgICAgICAgcmV0dXJuXG4gICAgZWxzZSBjdXJzb3JQb3NpdGlvbiA9IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uXG5cbiAgICAjIHJlbW92ZSBhbnkgYmxhbmsgbGluZXMgZnJvbSB3aGVyZSBjdXJzb3Igd2FzIHByZXZpb3VzbHlcbiAgICBwcmV2aW91c1JvdyA9IGV2ZW50Lm9sZEJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgIGlmIEBqc3hJblNjb3BlKHByZXZpb3VzUm93KVxuICAgICAgYmxhbmtMaW5lRW5kUG9zID0gL15cXHMqJC8uZXhlYyhAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHByZXZpb3VzUm93KSk/WzBdLmxlbmd0aFxuICAgICAgaWYgYmxhbmtMaW5lRW5kUG9zP1xuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHByZXZpb3VzUm93ICwgYmxvY2tJbmRlbnQ6IDAgfSlcblxuICAgIHJldHVybiBpZiBub3QgQGpzeEluU2NvcGUgYnVmZmVyUm93XG5cbiAgICBlbmRQb2ludE9mSnN4ID0gbmV3IFBvaW50IGJ1ZmZlclJvdywwICMgbmV4dCByb3cgc3RhcnRcbiAgICBzdGFydFBvaW50T2ZKc3ggPSAgYXV0b0NvbXBsZXRlSlNYLmdldFN0YXJ0T2ZKU1ggQGVkaXRvciwgY3Vyc29yUG9zaXRpb25cbiAgICBAaW5kZW50SlNYIG5ldyBSYW5nZShzdGFydFBvaW50T2ZKc3gsIGVuZFBvaW50T2ZKc3gpXG4gICAgY29sdW1uVG9Nb3ZlVG8gPSAvXlxccyokLy5leGVjKEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYnVmZmVyUm93KSk/WzBdLmxlbmd0aFxuICAgIGlmIGNvbHVtblRvTW92ZVRvPyB0aGVuIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gW2J1ZmZlclJvdywgY29sdW1uVG9Nb3ZlVG9dXG5cblxuICAjIEJ1ZmZlciBoYXMgc3RvcHBlZCBjaGFuZ2luZy4gSW5kZW50IGFzIHJlcXVpcmVkXG4gIGRpZFN0b3BDaGFuZ2luZzogKCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhdXRvSnN4XG4gICAgcmV0dXJuIHVubGVzcyBAbW91c2VVcFxuICAgIHNlbGVjdGVkUmFuZ2UgPSBAZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKVxuICAgICMgaWYgdGhpcyBpcyBhIHRhZyBzdGFydCdzIGVuZCA+IHRoZW4gZG9uJ3QgYXV0byBpbmRlbnRcbiAgICAjIHRoaXMgaWEgZml4IHRvIGFsbG93IGZvciB0aGUgYXV0byBjb21wbGV0ZSB0YWcgdGltZSB0byBwb3AgdXBcbiAgICBpZiBzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdyBpcyBzZWxlY3RlZFJhbmdlLmVuZC5yb3cgYW5kXG4gICAgICBzZWxlY3RlZFJhbmdlLnN0YXJ0LmNvbHVtbiBpcyAgc2VsZWN0ZWRSYW5nZS5lbmQuY29sdW1uIGFuZFxuICAgICAgJ0pTWFN0YXJ0VGFnRW5kJyBpbiBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdywgc2VsZWN0ZWRSYW5nZS5zdGFydC5jb2x1bW5dKS5nZXRTY29wZXNBcnJheSgpXG4gICAgICAgIHJldHVyblxuXG4gICAgaGlnaGVzdFJvdyA9IE1hdGgubWF4IHNlbGVjdGVkUmFuZ2Uuc3RhcnQucm93LCBzZWxlY3RlZFJhbmdlLmVuZC5yb3dcbiAgICBsb3dlc3RSb3cgPSBNYXRoLm1pbiBzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdywgc2VsZWN0ZWRSYW5nZS5lbmQucm93XG5cbiAgICAjIHJlbW92ZSB0aGUgaGFuZGxlciBmb3IgZGlkU3RvcENoYW5naW5nIHRvIGF2b2lkIHRoaXMgY2hhbmdlIGNhdXNpbmcgYSBuZXcgZXZlbnRcbiAgICBAb25EaWRTdG9wQ2hhbmdpbmdIYW5kbGVyLmRpc3Bvc2UoKVxuXG4gICAgIyB3b3JrIGJhY2t3YXJkcyB0aHJvdWdoIGJ1ZmZlciByb3dzIGluZGVudGluZyBKU1ggYXMgbmVlZGVkXG4gICAgd2hpbGUgKCBoaWdoZXN0Um93ID49IGxvd2VzdFJvdyApXG4gICAgICBpZiBAanN4SW5TY29wZShoaWdoZXN0Um93KVxuICAgICAgICBlbmRQb2ludE9mSnN4ID0gbmV3IFBvaW50IGhpZ2hlc3RSb3csMFxuICAgICAgICBzdGFydFBvaW50T2ZKc3ggPSAgYXV0b0NvbXBsZXRlSlNYLmdldFN0YXJ0T2ZKU1ggQGVkaXRvciwgZW5kUG9pbnRPZkpzeFxuICAgICAgICBAaW5kZW50SlNYIG5ldyBSYW5nZShzdGFydFBvaW50T2ZKc3gsIGVuZFBvaW50T2ZKc3gpXG4gICAgICAgIGhpZ2hlc3RSb3cgPSBzdGFydFBvaW50T2ZKc3gucm93IC0gMVxuICAgICAgZWxzZSBoaWdoZXN0Um93ID0gaGlnaGVzdFJvdyAtIDFcblxuICAgICMgcmVuYWJsZSB0aGlzIGV2ZW50IGhhbmRsZXIgYWZ0ZXIgMzAwbXMgYXMgcGVyIHRoZSBkZWZhdWx0IHRpbWVvdXQgZm9yIGNoYW5nZSBldmVudHNcbiAgICAjIHRvIGF2b2lkIHRoaXMgbWV0aG9kIGJlaW5nIHJlY2FsbGVkIVxuICAgIHNldFRpbWVvdXQoQGhhbmRsZU9uRGlkU3RvcENoYW5naW5nLCAzMDApXG4gICAgcmV0dXJuXG5cbiAgaGFuZGxlT25EaWRTdG9wQ2hhbmdpbmc6ID0+XG4gICAgQG9uRGlkU3RvcENoYW5naW5nSGFuZGxlciA9IEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgKCkgPT4gQGRpZFN0b3BDaGFuZ2luZygpXG5cbiAgIyBpcyB0aGUganN4IG9uIHRoaXMgbGluZSBpbiBzY29wZVxuICBqc3hJblNjb3BlOiAoYnVmZmVyUm93KSAtPlxuICAgIHNjb3BlcyA9IEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2J1ZmZlclJvdywgMF0pLmdldFNjb3Blc0FycmF5KClcbiAgICByZXR1cm4gJ21ldGEudGFnLmpzeCcgaW4gc2NvcGVzXG5cbiAgIyBpbmRlbnQgdGhlIEpTWCBpbiB0aGUgJ3JhbmdlJyBvZiByb3dzXG4gICMgVGhpcyBpcyBkZXNpZ25lZCB0byBiZSBhIHNpbmdsZSBwYXJzZSBpbmRlbnRlciB0byByZWR1Y2UgdGhlIGltcGFjdCBvbiB0aGUgZWRpdG9yLlxuICAjIEl0IGFzc3VtZXMgdGhlIGdyYW1tYXIgaGFzIGRvbmUgaXRzIGpvYiBhZGRpbmcgc2NvcGVzIHRvIGludGVyZXN0aW5nIHRva2Vucy5cbiAgIyBUaG9zZSBhcmUgSlNYIDx0YWcsID4sIDwvdGFnLCAvPiwgZW1lZGRlZCBleHByZXNzaW9uc1xuICAjIG91dHNpZGUgdGhlIHRhZyBzdGFydGluZyB7IGFuZCBlbmRpbmcgfSBhbmQgamF2YXNjcmlwdCBicmFjZXMgb3V0c2lkZSBhIHRhZyB7ICYgfVxuICAjIGl0IHVzZXMgYW4gYXJyYXkgdG8gaG9sZCB0b2tlbnMgYW5kIGEgcHVzaC9wb3Agc3RhY2sgdG8gaG9sZCB0b2tlbnMgbm90IGNsb3NlZFxuICAjIHRoZSB2ZXJ5IGZpcnN0IGpzeCB0YWcgbXVzdCBiZSBjb3JyZXRseSBpbmRldGVkIGJ5IHRoZSB1c2VyIGFzIHdlIGRvbid0IGhhdmVcbiAgIyBrbm93bGVkZ2Ugb2YgcHJlY2VlZGluZyBKYXZhc2NyaXB0LlxuICBpbmRlbnRKU1g6IChyYW5nZSkgLT5cbiAgICB0b2tlblN0YWNrID0gW11cbiAgICBpZHhPZlRva2VuID0gMFxuICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4gPSBbXSAjIGxlbmd0aCBlcXVpdmFsZW50IHRvIHRva2VuIGRlcHRoXG4gICAgaW5kZW50ID0gIDBcbiAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWVcbiAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDBcbiAgICBAdGVtcGxhdGVEZXB0aCA9IDBcblxuICAgIGZvciByb3cgaW4gW3JhbmdlLnN0YXJ0LnJvdy4ucmFuZ2UuZW5kLnJvd11cbiAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IHRydWVcbiAgICAgIHRva2VuT25UaGlzTGluZSA9IGZhbHNlXG4gICAgICBpbmRlbnRSZWNhbGMgPSBmYWxzZVxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG5cbiAgICAgICMgbG9vayBmb3IgdG9rZW5zIGluIGEgYnVmZmVyIGxpbmVcbiAgICAgIHdoaWxlICgoIG1hdGNoID0gQEpTWFJFR0VYUC5leGVjKGxpbmUpKSBpc250IG51bGwgKVxuICAgICAgICBtYXRjaENvbHVtbiA9IG1hdGNoLmluZGV4XG4gICAgICAgIG1hdGNoUG9pbnRTdGFydCA9IG5ldyBQb2ludChyb3csIG1hdGNoQ29sdW1uKVxuICAgICAgICBtYXRjaFBvaW50RW5kID0gbmV3IFBvaW50KHJvdywgbWF0Y2hDb2x1bW4gKyBtYXRjaFswXS5sZW5ndGggLSAxKVxuICAgICAgICBtYXRjaFJhbmdlID0gbmV3IFJhbmdlKG1hdGNoUG9pbnRTdGFydCwgbWF0Y2hQb2ludEVuZClcblxuICAgICAgICBpZiBub3QgdG9rZW4gPSAgQGdldFRva2VuKHJvdywgbWF0Y2gpIHRoZW4gY29udGludWVcblxuICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbiA9IChAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93IHJvdylcbiAgICAgICAgIyBjb252ZXJ0IHRoZSBtYXRjaGVkIGNvbHVtbiBwb3NpdGlvbiBpbnRvIHRhYiBpbmRlbnRzXG4gICAgICAgIGlmIEBlZGl0b3IuZ2V0U29mdFRhYnMoKVxuICAgICAgICAgIHRva2VuSW5kZW50YXRpb24gPSAobWF0Y2hDb2x1bW4gLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpKVxuICAgICAgICBlbHNlIHRva2VuSW5kZW50YXRpb24gPVxuICAgICAgICAgIGRvIChAZWRpdG9yKSAtPlxuICAgICAgICAgICAgaGFyZFRhYnNGb3VuZCA9IGNoYXJzRm91bmQgPSAwXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLm1hdGNoQ29sdW1uXVxuICAgICAgICAgICAgICBpZiAoKGxpbmUuc3Vic3RyIGksIDEpIGlzICdcXHQnKVxuICAgICAgICAgICAgICAgIGhhcmRUYWJzRm91bmQrK1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2hhcnNGb3VuZCsrXG4gICAgICAgICAgICByZXR1cm4gaGFyZFRhYnNGb3VuZCArICggY2hhcnNGb3VuZCAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkgKVxuXG4gICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gPSAgdG9rZW5JbmRlbnRhdGlvblxuXG4gICAgICAgICMgYmlnIHN3aXRjaCBzdGF0ZW1lbnQgZm9sbG93cyBmb3IgZWFjaCB0b2tlbi4gSWYgdGhlIGxpbmUgaXMgcmVmb3JtYXRlZFxuICAgICAgICAjIHRoZW4gd2UgcmVjYWxjdWxhdGUgdGhlIG5ldyBwb3NpdGlvbi5cbiAgICAgICAgIyBiaXQgaG9ycmlkIGJ1dCBob3BlZnVsbHkgZmFzdC5cbiAgICAgICAgc3dpdGNoICh0b2tlbilcbiAgICAgICAgICAjIHRhZ3Mgc3RhcnRpbmcgPHRhZ1xuICAgICAgICAgIHdoZW4gSlNYVEFHX09QRU5cbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgICMgaW5kZW50IG9ubHkgb24gZmlyc3QgdG9rZW4gb2YgYSBsaW5lXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICAjIGlzRmlyc3RUYWdPZkJsb2NrIGlzIHVzZWQgdG8gbWFyayB0aGUgdGFnIHRoYXQgc3RhcnRzIHRoZSBKU1ggYnV0XG4gICAgICAgICAgICAgICMgYWxzbyB0aGUgZmlyc3QgdGFnIG9mIGJsb2NrcyBpbnNpZGUgIGVtYmVkZGVkIGV4cHJlc3Npb25zLiBlLmcuXG4gICAgICAgICAgICAgICMgPHRib2R5PiwgPHBDb21wPiBhbmQgPG9iamVjdFJvdz4gYXJlIGZpcnN0IHRhZ3NcbiAgICAgICAgICAgICAgIyByZXR1cm4gKFxuICAgICAgICAgICAgICAjICAgICAgIDx0Ym9keSBjb21wPXs8cENvbXAgcHJvcGVydHkgLz59PlxuICAgICAgICAgICAgICAjICAgICAgICAge29iamVjdHMubWFwKGZ1bmN0aW9uKG9iamVjdCwgaSl7XG4gICAgICAgICAgICAgICMgICAgICAgICAgIHJldHVybiA8T2JqZWN0Um93IG9iaj17b2JqZWN0fSBrZXk9e2l9IC8+O1xuICAgICAgICAgICAgICAjICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICMgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgIyAgICAgKVxuICAgICAgICAgICAgICAjIGJ1dCB3ZSBkb24ndCBwb3NpdGlvbiB0aGUgPHRib2R5PiBhcyB3ZSBoYXZlIG5vIGtub3dsZWRnZSBvZiB0aGUgcHJlY2VlZGluZ1xuICAgICAgICAgICAgICAjIGpzIHN5bnRheFxuICAgICAgICAgICAgICBpZiBpc0ZpcnN0VGFnT2ZCbG9jayBhbmRcbiAgICAgICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4PyBhbmRcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgQlJBQ0VfT1BFTiBhbmRcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnJvdyBpcyAoIHJvdyAtIDEpXG4gICAgICAgICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb24gPSBmaXJzdENoYXJJbmRlbnRhdGlvbiA9IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSArIEBnZXRJbmRlbnRPZlByZXZpb3VzUm93IHJvd1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdyAsIGJsb2NrSW5kZW50OiBmaXJzdENoYXJJbmRlbnRhdGlvbiB9KVxuICAgICAgICAgICAgICBlbHNlIGlmIGlzRmlyc3RUYWdPZkJsb2NrIGFuZCBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdyAsIGJsb2NrSW5kZW50OiBAZ2V0SW5kZW50T2ZQcmV2aW91c1Jvdyhyb3cpLCBqc3hJbmRlbnQ6IDF9KVxuICAgICAgICAgICAgICBlbHNlIGlmIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93ICwgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDF9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSBmYWxzZVxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogSlNYVEFHX09QRU5cbiAgICAgICAgICAgICAgbmFtZTogbWF0Y2hbMl1cbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbjogZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvblxuICAgICAgICAgICAgICB0b2tlbkluZGVudGF0aW9uOiB0b2tlbkluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGZpcnN0Q2hhckluZGVudGF0aW9uOiBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHhcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHg6IG51bGwgICMgcHRyIHRvID4gdGFnXG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ0lkeDogbnVsbCAgICAgICAgICAgICAjIHB0ciB0byA8L3RhZz5cblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyB0YWdzIGVuZGluZyA8L3RhZz5cbiAgICAgICAgICB3aGVuIEpTWFRBR19DTE9TRVxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiB9IClcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcblxuICAgICAgICAgICAgcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogSlNYVEFHX0NMT1NFXG4gICAgICAgICAgICAgIG5hbWU6IG1hdGNoWzVdXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeCAgICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49MCB0aGVuIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyB0YWdzIGVuZGluZyAvPlxuICAgICAgICAgIHdoZW4gSlNYVEFHX1NFTEZDTE9TRV9FTkRcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gaXMgZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Rm9yQ2xvc2luZ0JyYWNrZXQgIHJvdyxcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLFxuICAgICAgICAgICAgICAgICAgQGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5zZWxmQ2xvc2luZ1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3dcbiAgICAgICAgICAgICAgICAgICxibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiwganN4SW5kZW50UHJvcHM6IDEgfSApXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWFRBR19TRUxGQ0xPU0VfRU5EXG4gICAgICAgICAgICAgIG5hbWU6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLm5hbWVcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4ICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49IDBcbiAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgPSBKU1hUQUdfU0VMRkNMT1NFX1NUQVJUXG4gICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyB0YWdzIGVuZGluZyA+XG4gICAgICAgICAgd2hlbiBKU1hUQUdfQ0xPU0VfQVRUUlNcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gaXMgZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Rm9yQ2xvc2luZ0JyYWNrZXQgIHJvdyxcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLFxuICAgICAgICAgICAgICAgICAgQGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5ub25FbXB0eVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdFRhZ0luTGluZUluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMSB9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IGZhbHNlXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogSlNYVEFHX0NMT1NFX0FUVFJTXG4gICAgICAgICAgICAgIG5hbWU6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLm5hbWVcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4ICAgICAgICAgICAgIyBwdHIgdG8gPHRhZ1xuICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHggPj0gMCB0aGVuIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4ID0gaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIGVtYmVkZWQgZXhwcmVzc2lvbiBzdGFydCB7XG4gICAgICAgICAgd2hlbiBKU1hCUkFDRV9PUEVOXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpZiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIEpTWFRBR19PUEVOIGFuZCB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeCBpcyBudWxsXG4gICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMSB9KVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSB9IClcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSB0cnVlICAjIHRoaXMgbWF5IGJlIHRoZSBzdGFydCBvZiBhIG5ldyBKU1ggYmxvY2tcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiBKU1hCUkFDRV9PUEVOXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb246IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbjogdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbjogZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4XG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4OiBudWxsICAjIHB0ciB0byA+IHRhZ1xuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdJZHg6IG51bGwgICAgICAgICAgICAgIyBwdHIgdG8gPC90YWc+XG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgZW1iZWRlZCBleHByZXNzaW9uIGVuZCB9XG4gICAgICAgICAgd2hlbiBKU1hCUkFDRV9DTE9TRVxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiB9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IGZhbHNlXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiBKU1hCUkFDRV9DTE9TRVxuICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHggICAgICAgICAjIHB0ciB0byA8dGFnXG4gICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeCA+PTAgdGhlbiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgSmF2YXNjcmlwdCBicmFjZSBTdGFydCB7IG9yIHN3aXRjaCBicmFjZSBzdGFydCB7IG9yIHBhcmVuICggb3IgYmFjay10aWNrIGBzdGFydFxuICAgICAgICAgIHdoZW4gQlJBQ0VfT1BFTiwgU1dJVENIX0JSQUNFX09QRU4sIFBBUkVOX09QRU4sIFRFTVBMQVRFX1NUQVJUXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiB0b2tlbiBpcyBURU1QTEFURV9TVEFSVCB0aGVuIEB0ZW1wbGF0ZURlcHRoKytcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIGlzRmlyc3RUYWdPZkJsb2NrIGFuZFxuICAgICAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg/IGFuZFxuICAgICAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyB0b2tlbiBhbmRcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnJvdyBpcyAoIHJvdyAtIDEpXG4gICAgICAgICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb24gPSBmaXJzdENoYXJJbmRlbnRhdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdICsgQGdldEluZGVudE9mUHJldmlvdXNSb3cgcm93XG4gICAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogZmlyc3RDaGFySW5kZW50YXRpb259KVxuICAgICAgICAgICAgICBlbHNlIGlmIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSB9IClcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IHRva2VuXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb246IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbjogdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbjogZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4XG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4OiBudWxsICAjIHB0ciB0byA+IHRhZ1xuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdJZHg6IG51bGwgICAgICAgICAgICAgIyBwdHIgdG8gPC90YWc+XG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgSmF2YXNjcmlwdCBicmFjZSBFbmQgfSBvciBzd2l0Y2ggYnJhY2UgZW5kIH0gb3IgcGFyZW4gY2xvc2UgKSBvciBiYWNrLXRpY2sgYCBlbmRcbiAgICAgICAgICB3aGVuIEJSQUNFX0NMT1NFLCBTV0lUQ0hfQlJBQ0VfQ0xPU0UsIFBBUkVOX0NMT1NFLCBURU1QTEFURV9FTkRcblxuICAgICAgICAgICAgaWYgdG9rZW4gaXMgU1dJVENIX0JSQUNFX0NMT1NFXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBTV0lUQ0hfQ0FTRSBvciB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIFNXSVRDSF9ERUZBVUxUXG4gICAgICAgICAgICAgICAgIyB3ZSBvbmx5IGFsbG93IGEgc2luZ2xlIGNhc2UvZGVmYXVsdCBzdGFjayBlbGVtZW50IHBlciBzd2l0Y2ggaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAjIHNvIG5vdyB3ZSBhcmUgYXQgdGhlIHN3aXRjaCdzIGNsb3NlIGJyYWNlIHdlIHBvcCBvZmYgYW55IGNhc2UvZGVmYXVsdCB0b2tlbnNcbiAgICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG5cbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24gfSlcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgICAgdHlwZTogdG9rZW5cbiAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4ICAgICAgICAgIyBwdHIgdG8gPHRhZ1xuICAgICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeCA+PTAgdGhlbiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgICBpZiB0b2tlbiBpcyBURU1QTEFURV9FTkQgdGhlbiBAdGVtcGxhdGVEZXB0aC0tXG5cbiAgICAgICAgICAjIGNhc2UsIGRlZmF1bHQgc3RhdGVtZW50IG9mIHN3aXRjaFxuICAgICAgICAgIHdoZW4gU1dJVENIX0NBU0UsIFNXSVRDSF9ERUZBVUxUXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICAgIGlmIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgU1dJVENIX0NBU0Ugb3IgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBTV0lUQ0hfREVGQVVMVFxuICAgICAgICAgICAgICAgICAgIyB3ZSBvbmx5IGFsbG93IGEgc2luZ2xlIGNhc2UvZGVmYXVsdCBzdGFjayBlbGVtZW50IHBlciBzd2l0Y2ggaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICMgc28gcG9zaXRpb24gbmV3IGNhc2UvZGVmYXVsdCB0byB0aGUgbGFzdCBvbmVzIHBvc2l0aW9uIGFuZCB0aGVuIHBvcCB0aGUgbGFzdCdzXG4gICAgICAgICAgICAgICAgICAjIG9mZiB0aGUgc3RhY2suXG4gICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uIH0pXG4gICAgICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIFNXSVRDSF9CUkFDRV9PUEVOXG4gICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSlcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogdG9rZW5cbiAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbjogZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvblxuICAgICAgICAgICAgICB0b2tlbkluZGVudGF0aW9uOiB0b2tlbkluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGZpcnN0Q2hhckluZGVudGF0aW9uOiBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHhcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHg6IG51bGwgICMgcHRyIHRvID4gdGFnXG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ0lkeDogbnVsbCAgICAgICAgICAgICAjIHB0ciB0byA8L3RhZz5cblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyBUZXJuYXJ5IGFuZCBjb25kaXRpb25hbCBpZi9lbHNlIG9wZXJhdG9yc1xuICAgICAgICAgIHdoZW4gVEVSTkFSWV9JRiwgSlNfSUYsIEpTX0VMU0UsIEpTX1JFVFVSTlxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSB0cnVlXG5cbiAgICAgICMgaGFuZGxlIGxpbmVzIHdpdGggbm8gdG9rZW4gb24gdGhlbVxuICAgICAgaWYgaWR4T2ZUb2tlbiBhbmQgbm90IHRva2VuT25UaGlzTGluZVxuICAgICAgICAjIGluZGVudCBsaW5lcyBidXQgcmVtb3ZlIGFueSBibGFuayBsaW5lcyB3aXRoIHdoaXRlIHNwYWNlIGV4Y2VwdCB0aGUgbGFzdCByb3dcbiAgICAgICAgaWYgcm93IGlzbnQgcmFuZ2UuZW5kLnJvd1xuICAgICAgICAgIGJsYW5rTGluZUVuZFBvcyA9IC9eXFxzKiQvLmV4ZWMoQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpKT9bMF0ubGVuZ3RoXG4gICAgICAgICAgaWYgYmxhbmtMaW5lRW5kUG9zP1xuICAgICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3cgLCBibG9ja0luZGVudDogMCB9KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpbmRlbnRVbnRva2VuaXNlZExpbmUgcm93LCB0b2tlblN0YWNrLCBzdGFja09mVG9rZW5zU3RpbGxPcGVuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaW5kZW50VW50b2tlbmlzZWRMaW5lIHJvdywgdG9rZW5TdGFjaywgc3RhY2tPZlRva2Vuc1N0aWxsT3BlblxuXG5cbiAgIyBpbmRlbnQgYW55IGxpbmVzIHRoYXQgaGF2ZW4ndCBhbnkgaW50ZXJlc3RpbmcgdG9rZW5zXG4gIGluZGVudFVudG9rZW5pc2VkTGluZTogKHJvdywgdG9rZW5TdGFjaywgc3RhY2tPZlRva2Vuc1N0aWxsT3BlbiApIC0+XG4gICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgIHRva2VuID0gdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF1cbiAgICBzd2l0Y2ggdG9rZW4udHlwZVxuICAgICAgd2hlbiBKU1hUQUdfT1BFTiwgSlNYVEFHX1NFTEZDTE9TRV9TVEFSVFxuICAgICAgICBpZiAgdG9rZW4udGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHggaXMgbnVsbFxuICAgICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW4uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxIH0pXG4gICAgICAgIGVsc2UgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxIH0pXG4gICAgICB3aGVuIEpTWEJSQUNFX09QRU5cbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxLCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzOiB0cnVlIH0pXG4gICAgICB3aGVuIEJSQUNFX09QRU4sIFNXSVRDSF9CUkFDRV9PUEVOLCBQQVJFTl9PUEVOXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW4uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSwgYWxsb3dBZGRpdGlvbmFsSW5kZW50czogdHJ1ZSB9KVxuICAgICAgd2hlbiBKU1hUQUdfU0VMRkNMT1NFX0VORCwgSlNYQlJBQ0VfQ0xPU0UsIEpTWFRBR19DTE9TRV9BVFRSU1xuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbdG9rZW4ucGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMX0pXG4gICAgICB3aGVuIEJSQUNFX0NMT1NFLCBTV0lUQ0hfQlJBQ0VfQ0xPU0UsIFBBUkVOX0NMT1NFXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1t0b2tlbi5wYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSwgYWxsb3dBZGRpdGlvbmFsSW5kZW50czogdHJ1ZSB9KVxuICAgICAgd2hlbiBTV0lUQ0hfQ0FTRSwgU1dJVENIX0RFRkFVTFRcbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxIH0pXG4gICAgICB3aGVuIFRFTVBMQVRFX1NUQVJULCBURU1QTEFURV9FTkRcbiAgICAgICAgcmV0dXJuOyAjIGRvbid0IHRvdWNoIHRlbXBsYXRlc1xuXG4gICMgZ2V0IHRoZSB0b2tlbiBhdCB0aGUgZ2l2ZW4gbWF0Y2ggcG9zaXRpb24gb3IgcmV0dXJuIHRydXRoeSBmYWxzZVxuICBnZXRUb2tlbjogKGJ1ZmZlclJvdywgbWF0Y2gpIC0+XG4gICAgc2NvcGUgPSBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtidWZmZXJSb3csIG1hdGNoLmluZGV4XSkuZ2V0U2NvcGVzQXJyYXkoKS5wb3AoKVxuICAgIGlmICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnRhZy5qc3gnIGlzIHNjb3BlXG4gICAgICBpZiAgICAgIG1hdGNoWzFdPyB0aGVuIHJldHVybiBKU1hUQUdfT1BFTlxuICAgICAgZWxzZSBpZiBtYXRjaFszXT8gdGhlbiByZXR1cm4gSlNYVEFHX1NFTEZDTE9TRV9FTkRcbiAgICBlbHNlIGlmICdKU1hFbmRUYWdTdGFydCcgaXMgc2NvcGVcbiAgICAgIGlmIG1hdGNoWzRdPyB0aGVuIHJldHVybiBKU1hUQUdfQ0xPU0VcbiAgICBlbHNlIGlmICdKU1hTdGFydFRhZ0VuZCcgaXMgc2NvcGVcbiAgICAgIGlmIG1hdGNoWzddPyB0aGVuIHJldHVybiBKU1hUQUdfQ0xPU0VfQVRUUlNcbiAgICBlbHNlIGlmIG1hdGNoWzhdP1xuICAgICAgaWYgJ3B1bmN0dWF0aW9uLnNlY3Rpb24uZW1iZWRkZWQuYmVnaW4uanN4JyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNYQlJBQ0VfT1BFTlxuICAgICAgZWxzZSBpZiAnbWV0YS5icmFjZS5jdXJseS5zd2l0Y2hTdGFydC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFNXSVRDSF9CUkFDRV9PUEVOXG4gICAgICBlbHNlIGlmICdtZXRhLmJyYWNlLmN1cmx5LmpzJyBpcyBzY29wZSBvclxuICAgICAgICAnbWV0YS5icmFjZS5jdXJseS5saXRvYmouanMnIGlzIHNjb3BlXG4gICAgICAgICAgcmV0dXJuIEJSQUNFX09QRU5cbiAgICBlbHNlIGlmIG1hdGNoWzldP1xuICAgICAgaWYgJ3B1bmN0dWF0aW9uLnNlY3Rpb24uZW1iZWRkZWQuZW5kLmpzeCcgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTWEJSQUNFX0NMT1NFXG4gICAgICBlbHNlIGlmICdtZXRhLmJyYWNlLmN1cmx5LnN3aXRjaEVuZC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFNXSVRDSF9CUkFDRV9DTE9TRVxuICAgICAgZWxzZSBpZiAnbWV0YS5icmFjZS5jdXJseS5qcycgaXMgc2NvcGUgb3JcbiAgICAgICAgJ21ldGEuYnJhY2UuY3VybHkubGl0b2JqLmpzJyBpcyBzY29wZVxuICAgICAgICAgIHJldHVybiBCUkFDRV9DTE9TRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTBdP1xuICAgICAgaWYgJ2tleXdvcmQub3BlcmF0b3IudGVybmFyeS5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFRFUk5BUllfSUZcbiAgICBlbHNlIGlmIG1hdGNoWzExXT9cbiAgICAgIGlmICdrZXl3b3JkLm9wZXJhdG9yLnRlcm5hcnkuanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBURVJOQVJZX0VMU0VcbiAgICBlbHNlIGlmIG1hdGNoWzEyXT9cbiAgICAgIGlmICdrZXl3b3JkLmNvbnRyb2wuY29uZGl0aW9uYWwuanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBKU19JRlxuICAgIGVsc2UgaWYgbWF0Y2hbMTNdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5jb25kaXRpb25hbC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTX0VMU0VcbiAgICBlbHNlIGlmIG1hdGNoWzE0XT9cbiAgICAgIGlmICdrZXl3b3JkLmNvbnRyb2wuc3dpdGNoLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gU1dJVENIX0NBU0VcbiAgICBlbHNlIGlmIG1hdGNoWzE1XT9cbiAgICAgIGlmICdrZXl3b3JkLmNvbnRyb2wuc3dpdGNoLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gU1dJVENIX0RFRkFVTFRcbiAgICBlbHNlIGlmIG1hdGNoWzE2XT9cbiAgICAgIGlmICdrZXl3b3JkLmNvbnRyb2wuZmxvdy5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTX1JFVFVSTlxuICAgIGVsc2UgaWYgbWF0Y2hbMTddP1xuICAgICAgaWYgJ21ldGEuYnJhY2Uucm91bmQuanMnIGlzIHNjb3BlIG9yXG4gICAgICAgJ21ldGEuYnJhY2Uucm91bmQuZ3JhcGhxbCcgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5kaXJlY3RpdmUuZ3JhcGhxbCcgaXMgc2NvcGVcbiAgICAgICAgICByZXR1cm4gUEFSRU5fT1BFTlxuICAgIGVsc2UgaWYgbWF0Y2hbMThdP1xuICAgICAgaWYgJ21ldGEuYnJhY2Uucm91bmQuanMnIGlzIHNjb3BlIG9yXG4gICAgICAgJ21ldGEuYnJhY2Uucm91bmQuZ3JhcGhxbCcgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5kaXJlY3RpdmUuZ3JhcGhxbCcgaXMgc2NvcGVcbiAgICAgICAgICByZXR1cm4gUEFSRU5fQ0xPU0VcbiAgICBlbHNlIGlmIG1hdGNoWzE5XT9cbiAgICAgIGlmICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpLmJlZ2luLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gVEVNUExBVEVfU1RBUlRcbiAgICAgIGlmICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpLmVuZC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFRFTVBMQVRFX0VORFxuXG4gICAgcmV0dXJuIE5PX1RPS0VOXG5cblxuICAjIGdldCBpbmRlbnQgb2YgdGhlIHByZXZpb3VzIHJvdyB3aXRoIGNoYXJzIGluIGl0XG4gIGdldEluZGVudE9mUHJldmlvdXNSb3c6IChyb3cpIC0+XG4gICAgcmV0dXJuIDAgdW5sZXNzIHJvd1xuICAgIGZvciByb3cgaW4gW3Jvdy0xLi4uMF1cbiAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgcmV0dXJuIEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgcm93IGlmICAvLipcXFMvLnRlc3QgbGluZVxuICAgIHJldHVybiAwXG5cbiAgIyBnZXQgZXNsaW50IHRyYW5zbGF0ZWQgaW5kZW50IG9wdGlvbnNcbiAgZ2V0SW5kZW50T3B0aW9uczogKCkgLT5cbiAgICBpZiBub3QgQGF1dG9Kc3ggdGhlbiByZXR1cm4gQHRyYW5zbGF0ZUluZGVudE9wdGlvbnMoKVxuICAgIGlmIGVzbGludHJjRmlsZW5hbWUgPSBAZ2V0RXNsaW50cmNGaWxlbmFtZSgpXG4gICAgICBlc2xpbnRyY0ZpbGVuYW1lID0gbmV3IEZpbGUoZXNsaW50cmNGaWxlbmFtZSlcbiAgICAgIEB0cmFuc2xhdGVJbmRlbnRPcHRpb25zKEByZWFkRXNsaW50cmNPcHRpb25zKGVzbGludHJjRmlsZW5hbWUuZ2V0UGF0aCgpKSlcbiAgICBlbHNlXG4gICAgICBAdHJhbnNsYXRlSW5kZW50T3B0aW9ucyh7fSkgIyBnZXQgZGVmYXVsdHNcblxuICAjIHJldHVybiB0ZXh0IHN0cmluZyBvZiBhIHByb2plY3QgYmFzZWQgLmVzbGludHJjIGZpbGUgaWYgb25lIGV4aXN0c1xuICBnZXRFc2xpbnRyY0ZpbGVuYW1lOiAoKSAtPlxuICAgIHByb2plY3RDb250YWluaW5nU291cmNlID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoIEBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgIyBJcyB0aGUgc291cmNlRmlsZSBsb2NhdGVkIGluc2lkZSBhbiBBdG9tIHByb2plY3QgZm9sZGVyP1xuICAgIGlmIHByb2plY3RDb250YWluaW5nU291cmNlWzBdP1xuICAgICAgcGF0aC5qb2luIHByb2plY3RDb250YWluaW5nU291cmNlWzBdLCAnLmVzbGludHJjJ1xuXG4gICMgbW91c2Ugc3RhdGVcbiAgb25Nb3VzZURvd246ICgpID0+XG4gICAgQG1vdXNlVXAgPSBmYWxzZVxuXG4gICMgbW91c2Ugc3RhdGVcbiAgb25Nb3VzZVVwOiAoKSA9PlxuICAgIEBtb3VzZVVwID0gdHJ1ZVxuXG4gICMgdG8gY3JlYXRlIGluZGVudHMuIFdlIGNhbiByZWFkIGFuZCByZXR1cm4gdGhlIHJ1bGVzIHByb3BlcnRpZXMgb3IgdW5kZWZpbmVkXG4gIHJlYWRFc2xpbnRyY09wdGlvbnM6IChlc2xpbnRyY0ZpbGUpIC0+XG4gICAgIyBnZXQgbG9jYWwgcGF0aCBvdmVyaWRlc1xuICAgIGlmIGZzLmV4aXN0c1N5bmMgZXNsaW50cmNGaWxlXG4gICAgICBmaWxlQ29udGVudCA9IHN0cmlwSnNvbkNvbW1lbnRzKGZzLnJlYWRGaWxlU3luYyhlc2xpbnRyY0ZpbGUsICd1dGY4JykpXG4gICAgICB0cnlcbiAgICAgICAgZXNsaW50UnVsZXMgPSAoWUFNTC5zYWZlTG9hZCBmaWxlQ29udGVudCkucnVsZXNcbiAgICAgICAgaWYgZXNsaW50UnVsZXMgdGhlbiByZXR1cm4gZXNsaW50UnVsZXNcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJMQjogRXJyb3IgcmVhZGluZyAuZXNsaW50cmMgYXQgI3tlc2xpbnRyY0ZpbGV9XCIsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICBkZXRhaWw6IFwiI3tlcnIubWVzc2FnZX1cIlxuICAgIHJldHVybiB7fVxuXG4gICMgdXNlIGVzbGludCByZWFjdCBmb3JtYXQgZGVzY3JpYmVkIGF0IGh0dHA6Ly90aW55dXJsLmNvbS9wNG10YXR2XG4gICMgdHVybiBzcGFjZXMgaW50byB0YWIgZGltZW5zaW9ucyB3aGljaCBjYW4gYmUgZGVjaW1hbFxuICAjIGEgZW1wdHkgb2JqZWN0IGFyZ3VtZW50IHBhcnNlcyBiYWNrIHRoZSBkZWZhdWx0IHNldHRpbmdzXG4gIHRyYW5zbGF0ZUluZGVudE9wdGlvbnM6IChlc2xpbnRSdWxlcykgLT5cbiAgICAjIEVzbGludCBydWxlcyB0byB1c2UgYXMgZGVmYXVsdCBvdmVyaWRkZW4gYnkgLmVzbGludHJjXG4gICAgIyBOLkIuIHRoYXQgdGhpcyBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIGVzbGludCBydWxlcyBpbiB0aGF0XG4gICAgIyB0aGUgdGFiLXNwYWNlcyBhbmQgJ3RhYidzIGluIGVzbGludHJjIGFyZSBjb252ZXJ0ZWQgdG8gdGFicyBiYXNlZCB1cG9uXG4gICAgIyB0aGUgQXRvbSBlZGl0b3IgdGFiIHNwYWNpbmcuXG4gICAgIyBlLmcuIGVzbGludCBpbmRlbnQgWzEsNF0gd2l0aCBhbiBBdG9tIHRhYiBzcGFjaW5nIG9mIDIgYmVjb21lcyBpbmRlbnQgWzEsMl1cbiAgICBlc2xpbnRJbmRlbnRPcHRpb25zICA9XG4gICAgICBqc3hJbmRlbnQ6IFsxLDFdICAgICAgICAgICAgIyAxID0gZW5hYmxlZCwgMT0jdGFic1xuICAgICAganN4SW5kZW50UHJvcHM6IFsxLDFdICAgICAgICMgMSA9IGVuYWJsZWQsIDE9I3RhYnNcbiAgICAgIGpzeENsb3NpbmdCcmFja2V0TG9jYXRpb246IFtcbiAgICAgICAgMSxcbiAgICAgICAgc2VsZkNsb3Npbmc6IFRBR0FMSUdORURcbiAgICAgICAgbm9uRW1wdHk6IFRBR0FMSUdORURcbiAgICAgIF1cblxuICAgIHJldHVybiBlc2xpbnRJbmRlbnRPcHRpb25zIHVubGVzcyB0eXBlb2YgZXNsaW50UnVsZXMgaXMgXCJvYmplY3RcIlxuXG4gICAgRVNfREVGQVVMVF9JTkRFTlQgPSA0ICMgZGVmYXVsdCBlc2xpbnQgaW5kZW50IGFzIHNwYWNlc1xuXG4gICAgIyByZWFkIGluZGVudCBpZiBpdCBleGlzdHMgYW5kIHVzZSBpdCBhcyB0aGUgZGVmYXVsdCBpbmRlbnQgZm9yIEpTWFxuICAgIHJ1bGUgPSBlc2xpbnRSdWxlc1snaW5kZW50J11cbiAgICBpZiB0eXBlb2YgcnVsZSBpcyAnbnVtYmVyJyBvciB0eXBlb2YgcnVsZSBpcyAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdEluZGVudCAgPSBFU19ERUZBVUxUX0lOREVOVCAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICBlbHNlIGlmIHR5cGVvZiBydWxlIGlzICdvYmplY3QnXG4gICAgICBpZiB0eXBlb2YgcnVsZVsxXSBpcyAnbnVtYmVyJ1xuICAgICAgICBkZWZhdWx0SW5kZW50ICA9IHJ1bGVbMV0gLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgICBlbHNlIGRlZmF1bHRJbmRlbnQgID0gMVxuICAgIGVsc2UgZGVmYXVsdEluZGVudCAgPSAxXG5cbiAgICBydWxlID0gZXNsaW50UnVsZXNbJ3JlYWN0L2pzeC1pbmRlbnQnXVxuICAgIGlmIHR5cGVvZiBydWxlIGlzICdudW1iZXInIG9yIHR5cGVvZiBydWxlIGlzICdzdHJpbmcnXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFswXSA9IHJ1bGVcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdID0gRVNfREVGQVVMVF9JTkRFTlQgLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgZWxzZSBpZiB0eXBlb2YgcnVsZSBpcyAnb2JqZWN0J1xuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMF0gPSBydWxlWzBdXG4gICAgICBpZiB0eXBlb2YgcnVsZVsxXSBpcyAnbnVtYmVyJ1xuICAgICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSA9IHJ1bGVbMV0gLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgICBlbHNlIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdID0gMVxuICAgIGVsc2UgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV0gPSBkZWZhdWx0SW5kZW50XG5cbiAgICBydWxlID0gZXNsaW50UnVsZXNbJ3JlYWN0L2pzeC1pbmRlbnQtcHJvcHMnXVxuICAgIGlmIHR5cGVvZiBydWxlIGlzICdudW1iZXInIG9yIHR5cGVvZiBydWxlIGlzICdzdHJpbmcnXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzBdID0gcnVsZVxuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXSA9IEVTX0RFRkFVTFRfSU5ERU5UIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIGVsc2UgaWYgdHlwZW9mIHJ1bGUgaXMgJ29iamVjdCdcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMF0gPSBydWxlWzBdXG4gICAgICBpZiB0eXBlb2YgcnVsZVsxXSBpcyAnbnVtYmVyJ1xuICAgICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdID0gcnVsZVsxXSAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICAgIGVsc2UgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXSA9IDFcbiAgICBlbHNlIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMV0gPSBkZWZhdWx0SW5kZW50XG5cbiAgICBydWxlID0gZXNsaW50UnVsZXNbJ3JlYWN0L2pzeC1jbG9zaW5nLWJyYWNrZXQtbG9jYXRpb24nXVxuICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5zZWxmQ2xvc2luZyA9IFRBR0FMSUdORURcbiAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0ubm9uRW1wdHkgPSBUQUdBTElHTkVEXG4gICAgaWYgdHlwZW9mIHJ1bGUgaXMgJ251bWJlcicgb3IgdHlwZW9mIHJ1bGUgaXMgJ3N0cmluZydcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblswXSA9IHJ1bGVcbiAgICBlbHNlIGlmIHR5cGVvZiBydWxlIGlzICdvYmplY3QnICMgYXJyYXlcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblswXSA9IHJ1bGVbMF1cbiAgICAgIGlmIHR5cGVvZiBydWxlWzFdIGlzICdzdHJpbmcnXG4gICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5zZWxmQ2xvc2luZyA9XG4gICAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLm5vbkVtcHR5ID1cbiAgICAgICAgICAgIHJ1bGVbMV1cbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcnVsZVsxXS5zZWxmQ2xvc2luZz9cbiAgICAgICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0uc2VsZkNsb3NpbmcgPSBydWxlWzFdLnNlbGZDbG9zaW5nXG4gICAgICAgIGlmIHJ1bGVbMV0ubm9uRW1wdHk/XG4gICAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLm5vbkVtcHR5ID0gcnVsZVsxXS5ub25FbXB0eVxuXG4gICAgcmV0dXJuIGVzbGludEluZGVudE9wdGlvbnNcblxuICAjIGFsbGlnbiBub25FbXB0eSBhbmQgc2VsZkNsb3NpbmcgdGFncyBiYXNlZCBvbiBlc2xpbnQgcnVsZXNcbiAgIyByb3cgdG8gYmUgaW5kZW50ZWQgYmFzZWQgdXBvbiBhIHBhcmVudFRhZ3MgcHJvcGVydGllcyBhbmQgYSBydWxlIHR5cGVcbiAgIyByZXR1cm5zIGluZGVudFJvdydzIHJldHVybiB2YWx1ZVxuICBpbmRlbnRGb3JDbG9zaW5nQnJhY2tldDogKCByb3csIHBhcmVudFRhZywgY2xvc2luZ0JyYWNrZXRSdWxlICkgLT5cbiAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzBdXG4gICAgICBpZiBjbG9zaW5nQnJhY2tldFJ1bGUgaXMgVEFHQUxJR05FRFxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHBhcmVudFRhZy50b2tlbkluZGVudGF0aW9ufSlcbiAgICAgIGVsc2UgaWYgY2xvc2luZ0JyYWNrZXRSdWxlIGlzIExJTkVBTElHTkVEXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogcGFyZW50VGFnLmZpcnN0Q2hhckluZGVudGF0aW9uIH0pXG4gICAgICBlbHNlIGlmIGNsb3NpbmdCcmFja2V0UnVsZSBpcyBBRlRFUlBST1BTXG4gICAgICAgICMgdGhpcyByZWFsbHkgaXNuJ3QgdmFsaWQgYXMgdGhpcyB0YWcgc2hvdWxkbid0IGJlIG9uIGEgbGluZSBieSBpdHNlbGZcbiAgICAgICAgIyBidXQgSSBkb24ndCByZWZvcm1hdCBsaW5lcyBqdXN0IGluZGVudCFcbiAgICAgICAgIyBpbmRlbnQgdG8gbWFrZSBpdCBsb29rIE9LIGFsdGhvdWdoIGl0IHdpbGwgZmFpbCBlc2xpbnRcbiAgICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMF1cbiAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcuZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxIH0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcuZmlyc3RDaGFySW5kZW50YXRpb259KVxuICAgICAgZWxzZSBpZiBjbG9zaW5nQnJhY2tldFJ1bGUgaXMgUFJPUFNBTElHTkVEXG4gICAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzBdXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csICBibG9ja0luZGVudDogcGFyZW50VGFnLmZpcnN0Q2hhckluZGVudGF0aW9uLGpzeEluZGVudFByb3BzOiAxfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCAgYmxvY2tJbmRlbnQ6IHBhcmVudFRhZy5maXJzdENoYXJJbmRlbnRhdGlvbn0pXG5cbiAgIyBpbmRlbnQgYSByb3cgYnkgdGhlIGFkZGl0aW9uIG9mIG9uZSBvciBtb3JlIGluZGVudHMuXG4gICMgcmV0dXJucyBmYWxzZSBpZiBubyBpbmRlbnQgcmVxdWlyZWQgYXMgaXQgaXMgYWxyZWFkeSBjb3JyZWN0XG4gICMgcmV0dXJuIHRydWUgaWYgaW5kZW50IHdhcyByZXF1aXJlZFxuICAjIGJsb2NrSW5kZW50IGlzIHRoZSBpbmRlbnQgdG8gdGhlIHN0YXJ0IG9mIHRoaXMgbG9naWNhbCBqc3ggYmxvY2tcbiAgIyBvdGhlciBpbmRlbnRzIGFyZSB0aGUgcmVxdWlyZWQgaW5kZW50IGJhc2VkIG9uIGVzbGludCBjb25kaXRpb25zIGZvciBSZWFjdFxuICAjIG9wdGlvbiBjb250YWlucyByb3cgdG8gaW5kZW50IGFuZCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzIGZsYWdcbiAgaW5kZW50Um93OiAob3B0aW9ucykgLT5cbiAgICB7IHJvdywgYWxsb3dBZGRpdGlvbmFsSW5kZW50cywgYmxvY2tJbmRlbnQsIGpzeEluZGVudCwganN4SW5kZW50UHJvcHMgfSA9IG9wdGlvbnNcbiAgICBpZiBAdGVtcGxhdGVEZXB0aCA+IDAgdGhlbiByZXR1cm4gZmFsc2UgIyBkb24ndCBpbmRlbnQgaW5zaWRlIGEgdGVtcGxhdGVcbiAgICAjIGNhbGMgb3ZlcmFsbCBpbmRlbnRcbiAgICBpZiBqc3hJbmRlbnRcbiAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFswXVxuICAgICAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV1cbiAgICAgICAgICBibG9ja0luZGVudCArPSBqc3hJbmRlbnQgKiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV1cbiAgICBpZiBqc3hJbmRlbnRQcm9wc1xuICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMF1cbiAgICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMV1cbiAgICAgICAgICBibG9ja0luZGVudCArPSBqc3hJbmRlbnRQcm9wcyAqIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdXG4gICAgIyBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzIGFsbG93cyBpbmRlbnRzIHRvIGJlIGdyZWF0ZXIgdGhhbiB0aGUgbWluaW11bVxuICAgICMgdXNlZCB3aGVyZSBpdGVtcyBhcmUgYWxpZ25lZCBidXQgbm8gZXNsaW50IHJ1bGVzIGFyZSBhcHBsaWNhYmxlXG4gICAgIyBzbyB1c2VyIGhhcyBzb21lIGRpc2NyZXRpb24gaW4gYWRkaW5nIG1vcmUgaW5kZW50c1xuICAgIGlmIGFsbG93QWRkaXRpb25hbEluZGVudHNcbiAgICAgIGlmIEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSA8IGJsb2NrSW5kZW50XG4gICAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgcm93LCBibG9ja0luZGVudCwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgaWYgQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpIGlzbnQgYmxvY2tJbmRlbnRcbiAgICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyByb3csIGJsb2NrSW5kZW50LCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcbiJdfQ==
