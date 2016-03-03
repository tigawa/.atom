(function() {
  var cssDocsURL, firstCharsEqual, fs, hasScope, path, pesudoSelectorPrefixPattern, propertyNamePrefixPattern, propertyNameWithColonPattern, tagSelectorPrefixPattern;

  fs = require('fs');

  path = require('path');

  propertyNameWithColonPattern = /^\s*(\S+)\s*:/;

  propertyNamePrefixPattern = /[a-zA-Z]+[-a-zA-Z]*$/;

  pesudoSelectorPrefixPattern = /:(:)?([a-z]+[a-z-]*)?$/;

  tagSelectorPrefixPattern = /(^|\s|,)([a-z]+)?$/;

  cssDocsURL = "https://developer.mozilla.org/en-US/docs/Web/CSS";

  module.exports = {
    selector: '.source.sass',
    disableForSelector: '.source.sass .comment, .source.sass .string',
    filterSuggestions: true,
    getSuggestions: function(request) {
      var completions;
      completions = null;
      if (this.isCompletingValue(request)) {
        completions = this.getPropertyValueCompletions(request);
      } else if (this.isCompletingPseudoSelector(request)) {
        completions = this.getPseudoSelectorCompletions(request);
      } else if (this.isCompletingNameOrTag(request)) {
        completions = this.getPropertyNameCompletions(request);
        completions = completions.concat(this.getTagCompletions(request));
      }
      return completions;
    },
    onDidInsertSuggestion: function(_arg) {
      var editor, suggestion;
      editor = _arg.editor, suggestion = _arg.suggestion;
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
      return fs.readFile(path.resolve(__dirname, '..', 'completions.json'), (function(_this) {
        return function(error, content) {
          var _ref;
          if (error == null) {
            _ref = JSON.parse(content), _this.pseudoSelectors = _ref.pseudoSelectors, _this.properties = _ref.properties, _this.tags = _ref.tags;
          }
        };
      })(this));
    },
    isCompletingValue: function(_arg) {
      var bufferPosition, editor, prefix, previousBufferPosition, previousScopes, previousScopesArray, scopeDescriptor, scopes;
      scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix, bufferPosition = _arg.bufferPosition, editor = _arg.editor;
      scopes = scopeDescriptor.getScopesArray();
      previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
      previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
      previousScopesArray = previousScopes.getScopesArray();
      return hasScope(scopes, 'meta.property-value.sass') || (!hasScope(previousScopesArray, "entity.name.tag.css.sass") && prefix.trim() === ":");
    },
    isCompletingNameOrTag: function(_arg) {
      var scopeDescriptor, scopes;
      scopeDescriptor = _arg.scopeDescriptor;
      scopes = scopeDescriptor.getScopesArray();
      return hasScope(scopes, 'meta.selector.css') && !hasScope(scopes, 'entity.other.attribute-name.id.css.sass') && !hasScope(scopes, 'entity.other.attribute-name.class.sass');
    },
    isCompletingPseudoSelector: function(_arg) {
      var bufferPosition, editor, prefix, previousBufferPosition, previousScopes, previousScopesArray, scopeDescriptor, scopes;
      editor = _arg.editor, scopeDescriptor = _arg.scopeDescriptor, bufferPosition = _arg.bufferPosition;
      scopes = scopeDescriptor.getScopesArray();
      if (hasScope(scopes, 'source.sass')) {
        prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
        if (prefix) {
          previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
          previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
          previousScopesArray = previousScopes.getScopesArray();
          return !hasScope(previousScopesArray, 'meta.property-name.sass') && !hasScope(previousScopesArray, 'meta.property-value.sass');
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    isPropertyValuePrefix: function(prefix) {
      prefix = prefix.trim();
      return prefix.length > 0 && prefix !== ':';
    },
    getPreviousPropertyName: function(bufferPosition, editor) {
      var line, propertyName, row, _ref;
      row = bufferPosition.row;
      while (row >= 0) {
        line = editor.lineTextForBufferRow(row);
        propertyName = (_ref = propertyNameWithColonPattern.exec(line)) != null ? _ref[1] : void 0;
        if (propertyName) {
          return propertyName;
        }
        row--;
      }
    },
    getPropertyValueCompletions: function(_arg) {
      var bufferPosition, completions, editor, prefix, property, value, values, _i, _j, _len, _len1, _ref;
      bufferPosition = _arg.bufferPosition, editor = _arg.editor, prefix = _arg.prefix;
      property = this.getPreviousPropertyName(bufferPosition, editor);
      values = (_ref = this.properties[property]) != null ? _ref.values : void 0;
      if (values == null) {
        return null;
      }
      completions = [];
      if (this.isPropertyValuePrefix(prefix)) {
        for (_i = 0, _len = values.length; _i < _len; _i++) {
          value = values[_i];
          if (firstCharsEqual(value, prefix)) {
            completions.push(this.buildPropertyValueCompletion(value, property));
          }
        }
      } else {
        for (_j = 0, _len1 = values.length; _j < _len1; _j++) {
          value = values[_j];
          completions.push(this.buildPropertyValueCompletion(value, property));
        }
      }
      return completions;
    },
    buildPropertyValueCompletion: function(value, propertyName) {
      return {
        type: 'value',
        text: "" + value,
        displayText: value,
        description: "" + value + " value for the " + propertyName + " property",
        descriptionMoreURL: "" + cssDocsURL + "/" + propertyName + "#Values"
      };
    },
    getPropertyNamePrefix: function(bufferPosition, editor) {
      var line, _ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (_ref = propertyNamePrefixPattern.exec(line)) != null ? _ref[0] : void 0;
    },
    getPropertyNameCompletions: function(_arg) {
      var bufferPosition, completions, editor, line, options, prefix, property, _ref;
      bufferPosition = _arg.bufferPosition, editor = _arg.editor, prefix = _arg.prefix;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (!line.match(/^(\s|\t)/)) {
        return [];
      }
      prefix = this.getPropertyNamePrefix(bufferPosition, editor);
      completions = [];
      _ref = this.properties;
      for (property in _ref) {
        options = _ref[property];
        if (!prefix || firstCharsEqual(property, prefix)) {
          completions.push(this.buildPropertyNameCompletion(property, prefix, options));
        }
      }
      return completions;
    },
    buildPropertyNameCompletion: function(propertyName, prefix, _arg) {
      var description;
      description = _arg.description;
      return {
        type: 'property',
        text: "" + propertyName + ": ",
        displayText: propertyName,
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: "" + cssDocsURL + "/" + propertyName
      };
    },
    getPseudoSelectorPrefix: function(editor, bufferPosition) {
      var line, _ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (_ref = line.match(pesudoSelectorPrefixPattern)) != null ? _ref[0] : void 0;
    },
    getPseudoSelectorCompletions: function(_arg) {
      var bufferPosition, completions, editor, options, prefix, pseudoSelector, _ref;
      bufferPosition = _arg.bufferPosition, editor = _arg.editor;
      prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
      if (!prefix) {
        return null;
      }
      completions = [];
      _ref = this.pseudoSelectors;
      for (pseudoSelector in _ref) {
        options = _ref[pseudoSelector];
        if (firstCharsEqual(pseudoSelector, prefix)) {
          completions.push(this.buildPseudoSelectorCompletion(pseudoSelector, prefix, options));
        }
      }
      return completions;
    },
    buildPseudoSelectorCompletion: function(pseudoSelector, prefix, _arg) {
      var argument, completion, description;
      argument = _arg.argument, description = _arg.description;
      completion = {
        type: 'pseudo-selector',
        replacementPrefix: prefix,
        description: description,
        descriptionMoreURL: "" + cssDocsURL + "/" + pseudoSelector
      };
      if (argument != null) {
        completion.snippet = "" + pseudoSelector + "(${1:" + argument + "})";
      } else {
        completion.text = pseudoSelector;
      }
      return completion;
    },
    getTagSelectorPrefix: function(editor, bufferPosition) {
      var line, _ref;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return (_ref = tagSelectorPrefixPattern.exec(line)) != null ? _ref[2] : void 0;
    },
    getTagCompletions: function(_arg) {
      var bufferPosition, completions, editor, prefix, tag, _i, _len, _ref;
      bufferPosition = _arg.bufferPosition, editor = _arg.editor, prefix = _arg.prefix;
      completions = [];
      if (prefix) {
        _ref = this.tags;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tag = _ref[_i];
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

  hasScope = function(scopesArray, scope) {
    return scopesArray.indexOf(scope) !== -1;
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc2Fzcy9saWIvcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtKQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSw0QkFBQSxHQUErQixlQUgvQixDQUFBOztBQUFBLEVBSUEseUJBQUEsR0FBNEIsc0JBSjVCLENBQUE7O0FBQUEsRUFLQSwyQkFBQSxHQUE4Qix3QkFMOUIsQ0FBQTs7QUFBQSxFQU1BLHdCQUFBLEdBQTJCLG9CQU4zQixDQUFBOztBQUFBLEVBT0EsVUFBQSxHQUFhLGtEQVBiLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsY0FBVjtBQUFBLElBQ0Esa0JBQUEsRUFBb0IsNkNBRHBCO0FBQUEsSUFNQSxpQkFBQSxFQUFtQixJQU5uQjtBQUFBLElBUUEsY0FBQSxFQUFnQixTQUFDLE9BQUQsR0FBQTtBQUNkLFVBQUEsV0FBQTtBQUFBLE1BQUEsV0FBQSxHQUFjLElBQWQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsT0FBbkIsQ0FBSDtBQUNFLFFBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixPQUE3QixDQUFkLENBREY7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLDBCQUFELENBQTRCLE9BQTVCLENBQUg7QUFDSCxRQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsNEJBQUQsQ0FBOEIsT0FBOUIsQ0FBZCxDQURHO09BQUEsTUFFQSxJQUFHLElBQUMsQ0FBQSxxQkFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-sass/lib/provider.coffee
