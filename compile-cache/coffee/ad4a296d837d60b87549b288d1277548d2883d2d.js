(function() {
  var cssDocsURL, firstCharsEqual, firstInlinePropertyNameWithColonPattern, fs, hasScope, importantPrefixPattern, inlinePropertyNameWithColonPattern, lineEndsWithSemicolon, makeSnippet, path, pesudoSelectorPrefixPattern, propertyNamePrefixPattern, propertyNameWithColonPattern, tagSelectorPrefixPattern;

  fs = require('fs');

  path = require('path');

  firstInlinePropertyNameWithColonPattern = /{\s*(\S+)\s*:/;

  inlinePropertyNameWithColonPattern = /(?:;.+?)*;\s*(\S+)\s*:/;

  propertyNameWithColonPattern = /^\s*(\S+)\s*:/;

  propertyNamePrefixPattern = /[a-zA-Z]+[-a-zA-Z]*$/;

  pesudoSelectorPrefixPattern = /:(:)?([a-z]+[a-z-]*)?$/;

  tagSelectorPrefixPattern = /(^|\s|,)([a-z]+)?$/;

  importantPrefixPattern = /(![a-z]+)$/;

  cssDocsURL = "https://developer.mozilla.org/en-US/docs/Web/CSS";

  module.exports = {
    selector: '.source.inside-js.css.styled, .source.css.styled',
    disableForSelector: ".source.inside-js.css.styled .comment, .source.inside-js.css.styled .string, .source.inside-js.css.styled .entity.quasi.element.js, .source.css.styled .comment, .source.css.styled .string, .source.css.styled .entity.quasi.element.js",
    filterSuggestions: true,
    inclusionPriority: 10000,
    excludeLowerPriority: true,
    getSuggestions: function(request) {
      var completions, scopes;
      completions = null;
      scopes = request.scopeDescriptor.getScopesArray();
      if (this.isCompletingValue(request)) {
        completions = this.getPropertyValueCompletions(request);
      } else if (this.isCompletingPseudoSelector(request)) {
        completions = this.getPseudoSelectorCompletions(request);
      } else {
        if (this.isCompletingName(request)) {
          completions = this.getPropertyNameCompletions(request);
        } else if (this.isCompletingNameOrTag(request)) {
          completions = this.getPropertyNameCompletions(request).concat(this.getTagCompletions(request));
        }
      }
      return completions;
    },
    onDidInsertSuggestion: function(arg) {
      var editor, suggestion;
      editor = arg.editor, suggestion = arg.suggestion;
      if (suggestion.type === 'property') {
        return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
      }
    },
    triggerAutocomplete: function(editor) {
      return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
        activatedManually: false
      });
    },
    loadProperties: function() {
      this.properties = {};
      return fs.readFile(path.resolve(__dirname, 'completions.json'), (function(_this) {
        return function(error, content) {
          var ref;
          if (error == null) {
            ref = JSON.parse(content), _this.pseudoSelectors = ref.pseudoSelectors, _this.properties = ref.properties, _this.tags = ref.tags;
          }
        };
      })(this));
    },
    isCompletingValue: function(arg) {
      var beforePrefixBufferPosition, beforePrefixScopes, beforePrefixScopesArray, bufferPosition, editor, prefix, scopeDescriptor, scopes;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, prefix = arg.prefix, editor = arg.editor;
      scopes = scopeDescriptor.getScopesArray();
      beforePrefixBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
      beforePrefixScopes = editor.scopeDescriptorForBufferPosition(beforePrefixBufferPosition);
      beforePrefixScopesArray = beforePrefixScopes.getScopesArray();
      return (hasScope(scopes, 'meta.property-values.css')) || (hasScope(beforePrefixScopesArray, 'meta.property-values.css'));
    },
    isCompletingName: function(arg) {
      var bufferPosition, editor, prefix, scope, scopeDescriptor;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, editor = arg.editor;
      scope = scopeDescriptor.getScopesArray().slice(-1);
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      return this.isPropertyNamePrefix(prefix) && (scope[0] === 'meta.property-list.css');
    },
    isCompletingNameOrTag: function(arg) {
      var bufferPosition, editor, prefix, scope, scopeDescriptor;
      scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition, editor = arg.editor;
      scope = scopeDescriptor.getScopesArray().slice(-1);
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      return this.isPropertyNamePrefix(prefix) && ((scope[0] === 'meta.property-list.css') || (scope[0] === 'source.css.styled') || (scope[0] === 'source.inside-js.css.styled'));
    },
    isCompletingPseudoSelector: function(arg) {
      var bufferPosition, editor, scope, scopeDescriptor;
      editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition;
      scope = scopeDescriptor.getScopesArray().slice(-1);
      return (scope[0] === 'constant.language.pseudo.prefixed.css') || (scope[0] === 'keyword.operator.pseudo.css');
    },
    isPropertyValuePrefix: function(prefix) {
      prefix = prefix.trim();
      return prefix.length > 0 && prefix !== ':';
    },
    isPropertyNamePrefix: function(prefix) {
      if (prefix == null) {
        return false;
      }
      prefix = prefix.trim();
      return prefix.match(/^[a-zA-Z-]+$/);
    },
    getImportantPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = importantPrefixPattern.exec(line)) != null ? ref[1] : void 0;
    },
    getPreviousPropertyName: function(bufferPosition, editor) {
      var line, propertyName, ref, ref1, ref2, row;
      row = bufferPosition.row;
      while (row >= 0) {
        line = editor.lineTextForBufferRow(row);
        propertyName = (ref = inlinePropertyNameWithColonPattern.exec(line)) != null ? ref[1] : void 0;
        if (propertyName == null) {
          propertyName = (ref1 = firstInlinePropertyNameWithColonPattern.exec(line)) != null ? ref1[1] : void 0;
        }
        if (propertyName == null) {
          propertyName = (ref2 = propertyNameWithColonPattern.exec(line)) != null ? ref2[1] : void 0;
        }
        if (propertyName) {
          return propertyName;
        }
        row--;
      }
    },
    getPropertyValueCompletions: function(arg) {
      var addSemicolon, bufferPosition, completions, editor, i, importantPrefix, j, len, len1, prefix, property, ref, scopeDescriptor, scopes, value, values;
      bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
      property = this.getPreviousPropertyName(bufferPosition, editor);
      values = (ref = this.properties[property]) != null ? ref.values : void 0;
      if (values == null) {
        return null;
      }
      scopes = scopeDescriptor.getScopesArray();
      addSemicolon = !lineEndsWithSemicolon(bufferPosition, editor);
      completions = [];
      if (this.isPropertyValuePrefix(prefix)) {
        for (i = 0, len = values.length; i < len; i++) {
          value = values[i];
          if (firstCharsEqual(value, prefix)) {
            completions.push(this.buildPropertyValueCompletion(value, property, addSemicolon));
          }
        }
      } else {
        for (j = 0, len1 = values.length; j < len1; j++) {
          value = values[j];
          completions.push(this.buildPropertyValueCompletion(value, property, addSemicolon));
        }
      }
      if (importantPrefix = this.getImportantPrefix(editor, bufferPosition)) {
        completions.push({
          type: 'keyword',
          text: '!important',
          displayText: '!important',
          replacementPrefix: importantPrefix,
          description: "Forces this property to override any other declaration of the same property. Use with caution.",
          descriptionMoreURL: cssDocsURL + "/Specificity#The_!important_exception"
        });
      }
      return completions;
    },
    buildPropertyValueCompletion: function(value, propertyName, addSemicolon) {
      var text;
      text = value;
      if (addSemicolon) {
        text += ';';
      }
      text = makeSnippet(text);
      return {
        type: 'value',
        snippet: text,
        displayText: value,
        description: value + " value for the " + propertyName + " property",
        descriptionMoreURL: cssDocsURL + "/" + propertyName + "#Values"
      };
    },
    getPropertyNamePrefix: function(bufferPosition, editor) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = propertyNamePrefixPattern.exec(line)) != null ? ref[0] : void 0;
    },
    getPropertyNameCompletions: function(arg) {
      var activatedManually, bufferPosition, completions, editor, line, options, prefix, property, ref, scopeDescriptor, scopes;
      bufferPosition = arg.bufferPosition, editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, activatedManually = arg.activatedManually;
      scopes = scopeDescriptor.getScopesArray();
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      if (!(activatedManually || prefix)) {
        return [];
      }
      completions = [];
      ref = this.properties;
      for (property in ref) {
        options = ref[property];
        if (!prefix || firstCharsEqual(property, prefix)) {
          completions.push(this.buildPropertyNameCompletion(property, prefix, options));
        }
      }
      return completions;
    },
    buildPropertyNameCompletion: function(propertyName, prefix, arg) {
      var description;
      description = arg.description;
      return {
        type: 'property',
        text: propertyName + ": ",
        displayText: propertyName,
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: cssDocsURL + "/" + propertyName
      };
    },
    getPseudoSelectorPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = line.match(pesudoSelectorPrefixPattern)) != null ? ref[0] : void 0;
    },
    getPseudoSelectorCompletions: function(arg) {
      var bufferPosition, completions, editor, options, prefix, pseudoSelector, ref;
      bufferPosition = arg.bufferPosition, editor = arg.editor;
      prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
      if (!prefix) {
        return null;
      }
      completions = [];
      ref = this.pseudoSelectors;
      for (pseudoSelector in ref) {
        options = ref[pseudoSelector];
        if (firstCharsEqual(pseudoSelector, prefix)) {
          completions.push(this.buildPseudoSelectorCompletion(pseudoSelector, prefix, options));
        }
      }
      return completions;
    },
    buildPseudoSelectorCompletion: function(pseudoSelector, prefix, arg) {
      var argument, completion, description;
      argument = arg.argument, description = arg.description;
      completion = {
        type: 'pseudo-selector',
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: cssDocsURL + "/" + pseudoSelector
      };
      if (argument != null) {
        completion.snippet = pseudoSelector + "(${1:" + argument + "})";
      } else {
        completion.text = pseudoSelector;
      }
      return completion;
    },
    getTagSelectorPrefix: function(editor, bufferPosition) {
      var line, ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (ref = tagSelectorPrefixPattern.exec(line)) != null ? ref[2] : void 0;
    },
    getTagCompletions: function(arg) {
      var bufferPosition, completions, editor, i, len, prefix, ref, tag;
      bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix;
      completions = [];
      if (prefix) {
        ref = this.tags;
        for (i = 0, len = ref.length; i < len; i++) {
          tag = ref[i];
          if (firstCharsEqual(tag, prefix)) {
            completions.push(this.buildTagCompletion(tag));
          }
        }
      }
      return completions;
    },
    buildTagCompletion: function(tag) {
      return {
        type: 'tag',
        text: tag,
        description: "Selector for <" + tag + "> elements"
      };
    }
  };

  lineEndsWithSemicolon = function(bufferPosition, editor) {
    var line, row;
    row = bufferPosition.row;
    line = editor.lineTextForBufferRow(row);
    return /;\s*$/.test(line);
  };

  hasScope = function(scopesArray, scope) {
    return scopesArray.indexOf(scope) !== -1;
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

  makeSnippet = function(text) {
    var snippetNumber;
    snippetNumber = 0;
    while (text.includes('()')) {
      text = text.replace('()', "($" + (++snippetNumber) + ")");
    }
    text = text + ("$" + (++snippetNumber));
    return text;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1iYWJlbC9saWIvYXV0by1jb21wbGV0ZS1zdHlsZWQtY29tcG9uZW50cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0E7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsdUNBQUEsR0FBMEM7O0VBQzFDLGtDQUFBLEdBQXFDOztFQUNyQyw0QkFBQSxHQUErQjs7RUFDL0IseUJBQUEsR0FBNEI7O0VBQzVCLDJCQUFBLEdBQThCOztFQUM5Qix3QkFBQSxHQUEyQjs7RUFDM0Isc0JBQUEsR0FBeUI7O0VBQ3pCLFVBQUEsR0FBYTs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLGtEQUFWO0lBQ0Esa0JBQUEsRUFBb0IsME9BRHBCO0lBR0EsaUJBQUEsRUFBbUIsSUFIbkI7SUFJQSxpQkFBQSxFQUFtQixLQUpuQjtJQUtBLG9CQUFBLEVBQXNCLElBTHRCO0lBT0EsY0FBQSxFQUFnQixTQUFDLE9BQUQ7QUFDZCxVQUFBO01BQUEsV0FBQSxHQUFjO01BQ2QsTUFBQSxHQUFTLE9BQU8sQ0FBQyxlQUFlLENBQUMsY0FBeEIsQ0FBQTtNQUVULElBQUcsSUFBQyxDQUFBLGlCQUFELENBQW1CLE9BQW5CLENBQUg7UUFDRSxXQUFBLEdBQWMsSUFBQyxDQUFBLDJCQUFELENBQTZCLE9BQTdCLEVBRGhCO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixPQUE1QixDQUFIO1FBQ0gsV0FBQSxHQUFjLElBQUMsQ0FBQSw0QkFBRCxDQUE4QixPQUE5QixFQURYO09BQUEsTUFBQTtRQUdILElBQUcsSUFBQyxDQUFBLGdCQUFELENBQWtCLE9BQWxCLENBQUg7VUFDRSxXQUFBLEdBQWMsSUFBQyxDQUFBLDBC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QixDQUFqQjs7QUFERixTQURGOzthQUdBO0lBTGlCLENBdkxuQjtJQThMQSxrQkFBQSxFQUFvQixTQUFDLEdBQUQ7YUFDbEI7UUFBQSxJQUFBLEVBQU0sS0FBTjtRQUNBLElBQUEsRUFBTSxHQUROO1FBRUEsV0FBQSxFQUFhLGdCQUFBLEdBQWlCLEdBQWpCLEdBQXFCLFlBRmxDOztJQURrQixDQTlMcEI7OztFQW1NRixxQkFBQSxHQUF3QixTQUFDLGNBQUQsRUFBaUIsTUFBakI7QUFDdEIsUUFBQTtJQUFDLE1BQU87SUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLEdBQTVCO1dBQ1AsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiO0VBSHNCOztFQUt4QixRQUFBLEdBQVcsU0FBQyxXQUFELEVBQWMsS0FBZDtXQUNULFdBQVcsQ0FBQyxPQUFaLENBQW9CLEtBQXBCLENBQUEsS0FBZ0MsQ0FBQztFQUR4Qjs7RUFHWCxlQUFBLEdBQWtCLFNBQUMsSUFBRCxFQUFPLElBQVA7V0FDaEIsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEtBQXlCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFSLENBQUE7RUFEVDs7RUFNbEIsV0FBQSxHQUFjLFNBQUMsSUFBRDtBQUNaLFFBQUE7SUFBQSxhQUFBLEdBQWdCO0FBQ2hCLFdBQU0sSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFkLENBQU47TUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLElBQUEsR0FBSSxDQUFDLEVBQUUsYUFBSCxDQUFKLEdBQXFCLEdBQXhDO0lBRFQ7SUFFQSxJQUFBLEdBQU8sSUFBQSxHQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsRUFBRSxhQUFILENBQUg7QUFDZCxXQUFPO0VBTEs7QUE5TmQiLCJzb3VyY2VzQ29udGVudCI6WyIjIFRoaXMgY29kZSB3YXMgYmFzZWQgdXBvbiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtY3NzIGJ1dCBoYXMgYmVlbiBtb2RpZmllZCB0byBhbGxvdyBpdCB0byBiZSB1c2VkXG4jIGZvciBzdHlsZWQtY29tcG9uZW5ldHMuIFRoZSBjb21wbGV0aW9ucy5qc29uIGZpbGUgdXNlZCB0byBhdXRvIGNvbXBsZXRlIGlzIGEgY29weSBvZiB0aGUgb25lIHVzZWQgYnkgdGhlIGF0b21cbiMgcGFja2FnZS4gVGhhdCBwYWNrYWdlLCBwcm92aWRlZCBhcyBhbiBBdG9tIGJhc2UgcGFja2FnZSwgaGFzIHRvb2xzIHRvIHVwZGF0ZSB0aGUgY29tcGxldGlvbnMuanNvbiBmaWxlIGZyb20gdGhlIHdlYi5cbiMgU2VlIHRoYXQgcGFja2FnZSBmb3IgbW9yZSBpbmZvIGFuZCBqdXN0IGNvcHkgdGhlIGNvbXBsZXRpb25zLmpzb24gdG8gdGhpcyBmaWxlcyBkaXJlY3Rvcnkgd2hlbiBhIHJlZnJlc2ggaXMgbmVlZGVkLlxuXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmZpcnN0SW5saW5lUHJvcGVydHlOYW1lV2l0aENvbG9uUGF0dGVybiA9IC97XFxzKihcXFMrKVxccyo6LyAjIC5leGFtcGxlIHsgZGlzcGxheTogfVxuaW5saW5lUHJvcGVydHlOYW1lV2l0aENvbG9uUGF0dGVybiA9IC8oPzo7Lis/KSo7XFxzKihcXFMrKVxccyo6LyAjIC5leGFtcGxlIHsgZGlzcGxheTogYmxvY2s7IGZsb2F0OiBsZWZ0OyBjb2xvcjogfSAobWF0Y2ggdGhlIGxhc3Qgb25lKVxucHJvcGVydHlOYW1lV2l0aENvbG9uUGF0dGVybiA9IC9eXFxzKihcXFMrKVxccyo6LyAjIGRpc3BsYXk6XG5wcm9wZXJ0eU5hbWVQcmVmaXhQYXR0ZXJuID0gL1thLXpBLVpdK1stYS16QS1aXSokL1xucGVzdWRvU2VsZWN0b3JQcmVmaXhQYXR0ZXJuID0gLzooOik/KFthLXpdK1thLXotXSopPyQvXG50YWdTZWxlY3RvclByZWZpeFBhdHRlcm4gPSAvKF58XFxzfCwpKFthLXpdKyk/JC9cbmltcG9ydGFudFByZWZpeFBhdHRlcm4gPSAvKCFbYS16XSspJC9cbmNzc0RvY3NVUkwgPSBcImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTU1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2VsZWN0b3I6ICcuc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkLCAuc291cmNlLmNzcy5zdHlsZWQnXG4gIGRpc2FibGVGb3JTZWxlY3RvcjogXCIuc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkIC5jb21tZW50LCAuc291cmNlLmluc2lkZS1qcy5jc3Muc3R5bGVkIC5zdHJpbmcsIC5zb3VyY2UuaW5zaWRlLWpzLmNzcy5zdHlsZWQgLmVudGl0eS5xdWFzaS5lbGVtZW50LmpzLCAuc291cmNlLmNzcy5zdHlsZWQgLmNvbW1lbnQsIC5zb3VyY2UuY3NzLnN0eWxlZCAuc3RyaW5nLCAuc291cmNlLmNzcy5zdHlsZWQgLmVudGl0eS5xdWFzaS5lbGVtZW50LmpzXCJcblxuICBmaWx0ZXJTdWdnZXN0aW9uczogdHJ1ZVxuICBpbmNsdXNpb25Qcmlvcml0eTogMTAwMDBcbiAgZXhjbHVkZUxvd2VyUHJpb3JpdHk6IHRydWVcblxuICBnZXRTdWdnZXN0aW9uczogKHJlcXVlc3QpIC0+XG4gICAgY29tcGxldGlvbnMgPSBudWxsXG4gICAgc2NvcGVzID0gcmVxdWVzdC5zY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgaWYgQGlzQ29tcGxldGluZ1ZhbHVlKHJlcXVlc3QpXG4gICAgICBjb21wbGV0aW9ucyA9IEBnZXRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICBlbHNlIGlmIEBpc0NvbXBsZXRpbmdQc2V1ZG9TZWxlY3RvcihyZXF1ZXN0KVxuICAgICAgY29tcGxldGlvbnMgPSBAZ2V0UHNldWRvU2VsZWN0b3JDb21wbGV0aW9ucyhyZXF1ZXN0KVxuICAgIGVsc2VcbiAgICAgIGlmIEBpc0NvbXBsZXRpbmdOYW1lKHJlcXVlc3QpXG4gICAgICAgIGNvbXBsZXRpb25zID0gQGdldFByb3BlcnR5TmFtZUNvbXBsZXRpb25zKHJlcXVlc3QpXG4gICAgICBlbHNlIGlmIEBpc0NvbXBsZXRpbmdOYW1lT3JUYWcocmVxdWVzdClcbiAgICAgICAgY29tcGxldGlvbnMgPSBAZ2V0UHJvcGVydHlOYW1lQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICAgICAgICAuY29uY2F0KEBnZXRUYWdDb21wbGV0aW9ucyhyZXF1ZXN0KSlcblxuICAgIHJldHVybiBjb21wbGV0aW9uc1xuXG4gIG9uRGlkSW5zZXJ0U3VnZ2VzdGlvbjogKHtlZGl0b3IsIHN1Z2dlc3Rpb259KSAtPlxuICAgIHNldFRpbWVvdXQoQHRyaWdnZXJBdXRvY29tcGxldGUuYmluZCh0aGlzLCBlZGl0b3IpLCAxKSBpZiBzdWdnZXN0aW9uLnR5cGUgaXMgJ3Byb3BlcnR5J1xuXG4gIHRyaWdnZXJBdXRvY29tcGxldGU6IChlZGl0b3IpIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKSwgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJywge2FjdGl2YXRlZE1hbnVhbGx5OiBmYWxzZX0pXG5cbiAgbG9hZFByb3BlcnRpZXM6IC0+XG4gICAgQHByb3BlcnRpZXMgPSB7fVxuICAgIGZzLnJlYWRGaWxlIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdjb21wbGV0aW9ucy5qc29uJyksIChlcnJvciwgY29udGVudCkgPT5cbiAgICAgIHtAcHNldWRvU2VsZWN0b3JzLCBAcHJvcGVydGllcywgQHRhZ3N9ID0gSlNPTi5wYXJzZShjb250ZW50KSB1bmxlc3MgZXJyb3I/XG5cbiAgICAgIHJldHVyblxuXG4gIGlzQ29tcGxldGluZ1ZhbHVlOiAoe3Njb3BlRGVzY3JpcHRvciwgYnVmZmVyUG9zaXRpb24sIHByZWZpeCwgZWRpdG9yfSkgLT5cbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgYmVmb3JlUHJlZml4QnVmZmVyUG9zaXRpb24gPSBbYnVmZmVyUG9zaXRpb24ucm93LCBNYXRoLm1heCgwLCBidWZmZXJQb3NpdGlvbi5jb2x1bW4gLSBwcmVmaXgubGVuZ3RoIC0gMSldXG4gICAgYmVmb3JlUHJlZml4U2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGJlZm9yZVByZWZpeEJ1ZmZlclBvc2l0aW9uKVxuICAgIGJlZm9yZVByZWZpeFNjb3Blc0FycmF5ID0gYmVmb3JlUHJlZml4U2NvcGVzLmdldFNjb3Blc0FycmF5KClcblxuICAgIHJldHVybiAoaGFzU2NvcGUoc2NvcGVzLCAnbWV0YS5wcm9wZXJ0eS12YWx1ZXMuY3NzJykpIG9yXG4gICAgICAoaGFzU2NvcGUoYmVmb3JlUHJlZml4U2NvcGVzQXJyYXkgLCAnbWV0YS5wcm9wZXJ0eS12YWx1ZXMuY3NzJykpXG5cbiAgaXNDb21wbGV0aW5nTmFtZTogKHtzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3J9KSAtPlxuICAgIHNjb3BlID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KCkuc2xpY2UoLTEpXG4gICAgcHJlZml4ID0gQGdldFByb3BlcnR5TmFtZVByZWZpeChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKVxuICAgIHJldHVybiBAaXNQcm9wZXJ0eU5hbWVQcmVmaXgocHJlZml4KSBhbmQgKHNjb3BlWzBdIGlzICdtZXRhLnByb3BlcnR5LWxpc3QuY3NzJylcblxuICBpc0NvbXBsZXRpbmdOYW1lT3JUYWc6ICh7c2NvcGVEZXNjcmlwdG9yLCBidWZmZXJQb3NpdGlvbiwgZWRpdG9yfSkgLT5cbiAgICBzY29wZSA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpLnNsaWNlKC0xKVxuICAgIHByZWZpeCA9IEBnZXRQcm9wZXJ0eU5hbWVQcmVmaXgoYnVmZmVyUG9zaXRpb24sIGVkaXRvcilcbiAgICByZXR1cm4gQGlzUHJvcGVydHlOYW1lUHJlZml4KHByZWZpeCkgYW5kXG4gICAgICgoc2NvcGVbMF0gaXMgJ21ldGEucHJvcGVydHktbGlzdC5jc3MnKSBvclxuICAgICAgKHNjb3BlWzBdIGlzICdzb3VyY2UuY3NzLnN0eWxlZCcpIG9yXG4gICAgICAoc2NvcGVbMF0gaXMgJ3NvdXJjZS5pbnNpZGUtanMuY3NzLnN0eWxlZCcpKVxuXG4gIGlzQ29tcGxldGluZ1BzZXVkb1NlbGVjdG9yOiAoe2VkaXRvciwgc2NvcGVEZXNjcmlwdG9yLCBidWZmZXJQb3NpdGlvbn0pIC0+XG4gICAgc2NvcGUgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKS5zbGljZSgtMSlcbiAgICByZXR1cm4gKCAoIHNjb3BlWzBdIGlzICdjb25zdGFudC5sYW5ndWFnZS5wc2V1ZG8ucHJlZml4ZWQuY3NzJykgb3JcbiAgICAgICggc2NvcGVbMF0gaXMgJ2tleXdvcmQub3BlcmF0b3IucHNldWRvLmNzcycpIClcblxuICBpc1Byb3BlcnR5VmFsdWVQcmVmaXg6IChwcmVmaXgpIC0+XG4gICAgcHJlZml4ID0gcHJlZml4LnRyaW0oKVxuICAgIHByZWZpeC5sZW5ndGggPiAwIGFuZCBwcmVmaXggaXNudCAnOidcblxuICBpc1Byb3BlcnR5TmFtZVByZWZpeDogKHByZWZpeCkgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHByZWZpeD9cbiAgICBwcmVmaXggPSBwcmVmaXgudHJpbSgpXG4gICAgcHJlZml4Lm1hdGNoKC9eW2EtekEtWi1dKyQvKVxuXG4gIGdldEltcG9ydGFudFByZWZpeDogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBpbXBvcnRhbnRQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG5cbiAgZ2V0UHJldmlvdXNQcm9wZXJ0eU5hbWU6IChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKSAtPlxuICAgIHtyb3d9ID0gYnVmZmVyUG9zaXRpb25cbiAgICB3aGlsZSByb3cgPj0gMFxuICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpXG4gICAgICBwcm9wZXJ0eU5hbWUgPSBpbmxpbmVQcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG4gICAgICBwcm9wZXJ0eU5hbWUgPz0gZmlyc3RJbmxpbmVQcm9wZXJ0eU5hbWVXaXRoQ29sb25QYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG4gICAgICBwcm9wZXJ0eU5hbWUgPz0gcHJvcGVydHlOYW1lV2l0aENvbG9uUGF0dGVybi5leGVjKGxpbmUpP1sxXVxuICAgICAgcmV0dXJuIHByb3BlcnR5TmFtZSBpZiBwcm9wZXJ0eU5hbWVcbiAgICAgIHJvdy0tXG4gICAgcmV0dXJuXG5cbiAgZ2V0UHJvcGVydHlWYWx1ZUNvbXBsZXRpb25zOiAoe2J1ZmZlclBvc2l0aW9uLCBlZGl0b3IsIHByZWZpeCwgc2NvcGVEZXNjcmlwdG9yfSkgLT5cbiAgICBwcm9wZXJ0eSA9IEBnZXRQcmV2aW91c1Byb3BlcnR5TmFtZShidWZmZXJQb3NpdGlvbiwgZWRpdG9yKVxuICAgIHZhbHVlcyA9IEBwcm9wZXJ0aWVzW3Byb3BlcnR5XT8udmFsdWVzXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHZhbHVlcz9cblxuICAgIHNjb3BlcyA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG4gICAgYWRkU2VtaWNvbG9uID0gbm90IGxpbmVFbmRzV2l0aFNlbWljb2xvbihidWZmZXJQb3NpdGlvbiwgZWRpdG9yKVxuXG4gICAgY29tcGxldGlvbnMgPSBbXVxuICAgIGlmIEBpc1Byb3BlcnR5VmFsdWVQcmVmaXgocHJlZml4KVxuICAgICAgZm9yIHZhbHVlIGluIHZhbHVlcyB3aGVuIGZpcnN0Q2hhcnNFcXVhbCh2YWx1ZSwgcHJlZml4KVxuICAgICAgICBjb21wbGV0aW9ucy5wdXNoKEBidWlsZFByb3BlcnR5VmFsdWVDb21wbGV0aW9uKHZhbHVlLCBwcm9wZXJ0eSwgYWRkU2VtaWNvbG9uKSlcbiAgICBlbHNlXG4gICAgICBmb3IgdmFsdWUgaW4gdmFsdWVzXG4gICAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkUHJvcGVydHlWYWx1ZUNvbXBsZXRpb24odmFsdWUsIHByb3BlcnR5LCBhZGRTZW1pY29sb24pKVxuXG4gICAgaWYgaW1wb3J0YW50UHJlZml4ID0gQGdldEltcG9ydGFudFByZWZpeChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgY29tcGxldGlvbnMucHVzaFxuICAgICAgICB0eXBlOiAna2V5d29yZCdcbiAgICAgICAgdGV4dDogJyFpbXBvcnRhbnQnXG4gICAgICAgIGRpc3BsYXlUZXh0OiAnIWltcG9ydGFudCdcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IGltcG9ydGFudFByZWZpeFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJGb3JjZXMgdGhpcyBwcm9wZXJ0eSB0byBvdmVycmlkZSBhbnkgb3RoZXIgZGVjbGFyYXRpb24gb2YgdGhlIHNhbWUgcHJvcGVydHkuIFVzZSB3aXRoIGNhdXRpb24uXCJcbiAgICAgICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBcIiN7Y3NzRG9jc1VSTH0vU3BlY2lmaWNpdHkjVGhlXyFpbXBvcnRhbnRfZXhjZXB0aW9uXCJcblxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRQcm9wZXJ0eVZhbHVlQ29tcGxldGlvbjogKHZhbHVlLCBwcm9wZXJ0eU5hbWUsIGFkZFNlbWljb2xvbikgLT5cbiAgICB0ZXh0ID0gdmFsdWVcbiAgICB0ZXh0ICs9ICc7JyBpZiBhZGRTZW1pY29sb25cbiAgICB0ZXh0ID0gbWFrZVNuaXBwZXQodGV4dClcblxuICAgIHtcbiAgICAgIHR5cGU6ICd2YWx1ZSdcbiAgICAgIHNuaXBwZXQ6IHRleHRcbiAgICAgIGRpc3BsYXlUZXh0OiB2YWx1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiI3t2YWx1ZX0gdmFsdWUgZm9yIHRoZSAje3Byb3BlcnR5TmFtZX0gcHJvcGVydHlcIlxuICAgICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBcIiN7Y3NzRG9jc1VSTH0vI3twcm9wZXJ0eU5hbWV9I1ZhbHVlc1wiXG4gICAgfVxuXG4gIGdldFByb3BlcnR5TmFtZVByZWZpeDogKGJ1ZmZlclBvc2l0aW9uLCBlZGl0b3IpIC0+XG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBwcm9wZXJ0eU5hbWVQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzBdXG5cbiAgZ2V0UHJvcGVydHlOYW1lQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvciwgc2NvcGVEZXNjcmlwdG9yLCBhY3RpdmF0ZWRNYW51YWxseX0pIC0+XG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuXG4gICAgcHJlZml4ID0gQGdldFByb3BlcnR5TmFtZVByZWZpeChidWZmZXJQb3NpdGlvbiwgZWRpdG9yKVxuICAgIHJldHVybiBbXSB1bmxlc3MgYWN0aXZhdGVkTWFudWFsbHkgb3IgcHJlZml4XG5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgZm9yIHByb3BlcnR5LCBvcHRpb25zIG9mIEBwcm9wZXJ0aWVzIHdoZW4gbm90IHByZWZpeCBvciBmaXJzdENoYXJzRXF1YWwocHJvcGVydHksIHByZWZpeClcbiAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkUHJvcGVydHlOYW1lQ29tcGxldGlvbihwcm9wZXJ0eSwgcHJlZml4LCBvcHRpb25zKSlcbiAgICBjb21wbGV0aW9uc1xuXG4gIGJ1aWxkUHJvcGVydHlOYW1lQ29tcGxldGlvbjogKHByb3BlcnR5TmFtZSwgcHJlZml4LCB7ZGVzY3JpcHRpb259KSAtPlxuICAgIHR5cGU6ICdwcm9wZXJ0eSdcbiAgICB0ZXh0OiBcIiN7cHJvcGVydHlOYW1lfTogXCJcbiAgICBkaXNwbGF5VGV4dDogcHJvcGVydHlOYW1lXG4gICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvblxuICAgIGRlc2NyaXB0aW9uTW9yZVVSTDogXCIje2Nzc0RvY3NVUkx9LyN7cHJvcGVydHlOYW1lfVwiXG5cbiAgZ2V0UHNldWRvU2VsZWN0b3JQcmVmaXg6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgbGluZS5tYXRjaChwZXN1ZG9TZWxlY3RvclByZWZpeFBhdHRlcm4pP1swXVxuXG4gIGdldFBzZXVkb1NlbGVjdG9yQ29tcGxldGlvbnM6ICh7YnVmZmVyUG9zaXRpb24sIGVkaXRvcn0pIC0+XG4gICAgcHJlZml4ID0gQGdldFBzZXVkb1NlbGVjdG9yUHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHByZWZpeFxuXG4gICAgY29tcGxldGlvbnMgPSBbXVxuICAgIGZvciBwc2V1ZG9TZWxlY3Rvciwgb3B0aW9ucyBvZiBAcHNldWRvU2VsZWN0b3JzIHdoZW4gZmlyc3RDaGFyc0VxdWFsKHBzZXVkb1NlbGVjdG9yLCBwcmVmaXgpXG4gICAgICBjb21wbGV0aW9ucy5wdXNoKEBidWlsZFBzZXVkb1NlbGVjdG9yQ29tcGxldGlvbihwc2V1ZG9TZWxlY3RvciwgcHJlZml4LCBvcHRpb25zKSlcbiAgICBjb21wbGV0aW9uc1xuXG4gIGJ1aWxkUHNldWRvU2VsZWN0b3JDb21wbGV0aW9uOiAocHNldWRvU2VsZWN0b3IsIHByZWZpeCwge2FyZ3VtZW50LCBkZXNjcmlwdGlvbn0pIC0+XG4gICAgY29tcGxldGlvbiA9XG4gICAgICB0eXBlOiAncHNldWRvLXNlbGVjdG9yJ1xuICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uXG4gICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IFwiI3tjc3NEb2NzVVJMfS8je3BzZXVkb1NlbGVjdG9yfVwiXG5cbiAgICBpZiBhcmd1bWVudD9cbiAgICAgIGNvbXBsZXRpb24uc25pcHBldCA9IFwiI3twc2V1ZG9TZWxlY3Rvcn0oJHsxOiN7YXJndW1lbnR9fSlcIlxuICAgIGVsc2VcbiAgICAgIGNvbXBsZXRpb24udGV4dCA9IHBzZXVkb1NlbGVjdG9yXG4gICAgY29tcGxldGlvblxuXG4gIGdldFRhZ1NlbGVjdG9yUHJlZml4OiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIHRhZ1NlbGVjdG9yUHJlZml4UGF0dGVybi5leGVjKGxpbmUpP1syXVxuXG4gIGdldFRhZ0NvbXBsZXRpb25zOiAoe2J1ZmZlclBvc2l0aW9uLCBlZGl0b3IsIHByZWZpeH0pIC0+XG4gICAgY29tcGxldGlvbnMgPSBbXVxuICAgIGlmIHByZWZpeFxuICAgICAgZm9yIHRhZyBpbiBAdGFncyB3aGVuIGZpcnN0Q2hhcnNFcXVhbCh0YWcsIHByZWZpeClcbiAgICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRUYWdDb21wbGV0aW9uKHRhZykpXG4gICAgY29tcGxldGlvbnNcblxuICBidWlsZFRhZ0NvbXBsZXRpb246ICh0YWcpIC0+XG4gICAgdHlwZTogJ3RhZydcbiAgICB0ZXh0OiB0YWdcbiAgICBkZXNjcmlwdGlvbjogXCJTZWxlY3RvciBmb3IgPCN7dGFnfT4gZWxlbWVudHNcIlxuXG5saW5lRW5kc1dpdGhTZW1pY29sb24gPSAoYnVmZmVyUG9zaXRpb24sIGVkaXRvcikgLT5cbiAge3Jvd30gPSBidWZmZXJQb3NpdGlvblxuICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcbiAgLztcXHMqJC8udGVzdChsaW5lKVxuXG5oYXNTY29wZSA9IChzY29wZXNBcnJheSwgc2NvcGUpIC0+XG4gIHNjb3Blc0FycmF5LmluZGV4T2Yoc2NvcGUpIGlzbnQgLTFcblxuZmlyc3RDaGFyc0VxdWFsID0gKHN0cjEsIHN0cjIpIC0+XG4gIHN0cjFbMF0udG9Mb3dlckNhc2UoKSBpcyBzdHIyWzBdLnRvTG93ZXJDYXNlKClcblxuIyBsb29rcyBhdCBhIHN0cmluZyBhbmQgcmVwbGFjZXMgY29uc2VjdXRpdmUgKCkgd2l0aCBpbmNyZW1lbnRpbmcgc25pcHBldCBwb3NpdGlvbnMgKCRuKVxuIyBJdCBhbHNvIGFkZHMgYSB0cmFpbGluZyAkbiBhdCBlbmQgb2YgdGV4dFxuIyBlLmcgdHJhbnNsYXRlKCkgYmVjb21lcyB0cmFuc2xhdGUoJDEpJDJcbm1ha2VTbmlwcGV0ID0gKHRleHQpICAtPlxuICBzbmlwcGV0TnVtYmVyID0gMFxuICB3aGlsZSB0ZXh0LmluY2x1ZGVzKCcoKScpXG4gICAgdGV4dCA9IHRleHQucmVwbGFjZSgnKCknLCBcIigkI3srK3NuaXBwZXROdW1iZXJ9KVwiKVxuICB0ZXh0ID0gdGV4dCArIFwiJCN7KytzbmlwcGV0TnVtYmVyfVwiXG4gIHJldHVybiB0ZXh0XG4iXX0=
