(function() {
  var CompositeDisposable, DefaultSuggestionTypeIconHTML, IconTemplate, ItemTemplate, ListTemplate, SnippetEnd, SnippetParser, SnippetStart, SnippetStartAndEnd, SuggestionListElement, escapeHtml, fuzzaldrinPlus, isString,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  SnippetParser = require('./snippet-parser');

  isString = require('./type-helpers').isString;

  fuzzaldrinPlus = require('fuzzaldrin-plus');

  ItemTemplate = "<span class=\"icon-container\"></span>\n<span class=\"left-label\"></span>\n<span class=\"word-container\">\n  <span class=\"word\"></span>\n  <span class=\"right-label\"></span>\n</span>";

  ListTemplate = "<div class=\"suggestion-list-scroller\">\n  <ol class=\"list-group\"></ol>\n</div>\n<div class=\"suggestion-description\">\n  <span class=\"suggestion-description-content\"></span>\n  <a class=\"suggestion-description-more-link\" href=\"#\">More..</a>\n</div>";

  IconTemplate = '<i class="icon"></i>';

  DefaultSuggestionTypeIconHTML = {
    'snippet': '<i class="icon-move-right"></i>',
    'import': '<i class="icon-package"></i>',
    'require': '<i class="icon-package"></i>',
    'module': '<i class="icon-package"></i>',
    'package': '<i class="icon-package"></i>',
    'tag': '<i class="icon-code"></i>',
    'attribute': '<i class="icon-tag"></i>'
  };

  SnippetStart = 1;

  SnippetEnd = 2;

  SnippetStartAndEnd = 3;

  SuggestionListElement = (function(_super) {
    __extends(SuggestionListElement, _super);

    function SuggestionListElement() {
      return SuggestionListElement.__super__.constructor.apply(this, arguments);
    }

    SuggestionListElement.prototype.maxItems = 200;

    SuggestionListElement.prototype.emptySnippetGroupRegex = /(\$\{\d+\:\})|(\$\{\d+\})|(\$\d+)/ig;

    SuggestionListElement.prototype.nodePool = null;

    SuggestionListElement.prototype.createdCallback = function() {
      this.subscriptions = new CompositeDisposable;
      this.classList.add('popover-list', 'select-list', 'autocomplete-suggestion-list');
      this.registerMouseHandling();
      this.snippetParser = new SnippetParser;
      return this.nodePool = [];
    };

    SuggestionListElement.prototype.attachedCallback = function() {
      this.parentElement.classList.add('autocomplete-plus');
      this.addActiveClassToEditor();
      if (!this.ol) {
        this.renderList();
      }
      return this.itemsChanged();
    };

    SuggestionListElement.prototype.detachedCallback = function() {
      return this.removeActiveClassFromEditor();
    };

    SuggestionListElement.prototype.initialize = function(model) {
      this.model = model;
      if (model == null) {
        return;
      }
      this.subscriptions.add(this.model.onDidChangeItems(this.itemsChanged.bind(this)));
      this.subscriptions.add(this.model.onDidSelectNext(this.moveSelectionDown.bind(this)));
      this.subscriptions.add(this.model.onDidSelectPrevious(this.moveSelectionUp.bind(this)));
      this.subscriptions.add(this.model.onDidSelectPageUp(this.moveSelectionPageUp.bind(this)));
      this.subscriptions.add(this.model.onDidSelectPageDown(this.moveSelectionPageDown.bind(this)));
      this.subscriptions.add(this.model.onDidSelectTop(this.moveSelectionToTop.bind(this)));
      this.subscriptions.add(this.model.onDidSelectBottom(this.moveSelectionToBottom.bind(this)));
      this.subscriptions.add(this.model.onDidConfirmSelection(this.confirmSelection.bind(this)));
      this.subscriptions.add(this.model.onDidDispose(this.dispose.bind(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.suggestionListFollows', (function(_this) {
        return function(suggestionListFollows) {
          _this.suggestionListFollows = suggestionListFollows;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.maxVisibleSuggestions', (function(_this) {
        return function(maxVisibleSuggestions) {
          _this.maxVisibleSuggestions = maxVisibleSuggestions;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.useAlternateScoring', (function(_this) {
        return function(useAlternateScoring) {
          _this.useAlternateScoring = useAlternateScoring;
        };
      })(this)));
      return this;
    };

    SuggestionListElement.prototype.registerMouseHandling = function() {
      this.onmousewheel = function(event) {
        return event.stopPropagation();
      };
      this.onmousedown = function(event) {
        var item;
        item = this.findItem(event);
        if ((item != null ? item.dataset.index : void 0) != null) {
          this.selectedIndex = item.dataset.index;
          return event.stopPropagation();
        }
      };
      return this.onmouseup = function(event) {
        var item;
        item = this.findItem(event);
        if ((item != null ? item.dataset.index : void 0) != null) {
          event.stopPropagation();
          return this.confirmSelection();
        }
      };
    };

    SuggestionListElement.prototype.findItem = function(event) {
      var item;
      item = event.target;
      while (item.tagName !== 'LI' && item !== this) {
        item = item.parentNode;
      }
      if (item.tagName === 'LI') {
        return item;
      }
    };

    SuggestionListElement.prototype.updateDescription = function(item) {
      var _ref, _ref1;
      item = item != null ? item : (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1[this.selectedIndex] : void 0 : void 0;
      if (item == null) {
        return;
      }
      if ((item.description != null) && item.description.length > 0) {
        this.descriptionContainer.style.display = 'block';
        this.descriptionContent.textContent = item.description;
        if ((item.descriptionMoreURL != null) && (item.descriptionMoreURL.length != null)) {
          this.descriptionMoreLink.style.display = 'inline';
          return this.descriptionMoreLink.setAttribute('href', item.descriptionMoreURL);
        } else {
          this.descriptionMoreLink.style.display = 'none';
          return this.descriptionMoreLink.setAttribute('href', '#');
        }
      } else {
        return this.descriptionContainer.style.display = 'none';
      }
    };

    SuggestionListElement.prototype.itemsChanged = function() {
      var _ref, _ref1;
      if ((_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1.length : void 0 : void 0) {
        return this.render();
      } else {
        return this.returnItemsToPool(0);
      }
    };

    SuggestionListElement.prototype.render = function() {
      var _base;
      this.selectedIndex = 0;
      if (typeof (_base = atom.views).pollAfterNextUpdate === "function") {
        _base.pollAfterNextUpdate();
      }
      atom.views.updateDocument(this.renderItems.bind(this));
      return atom.views.readDocument(this.readUIPropsFromDOM.bind(this));
    };

    SuggestionListElement.prototype.addActiveClassToEditor = function() {
      var editorElement, _ref;
      editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
      return editorElement != null ? (_ref = editorElement.classList) != null ? _ref.add('autocomplete-active') : void 0 : void 0;
    };

    SuggestionListElement.prototype.removeActiveClassFromEditor = function() {
      var editorElement, _ref;
      editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
      return editorElement != null ? (_ref = editorElement.classList) != null ? _ref.remove('autocomplete-active') : void 0 : void 0;
    };

    SuggestionListElement.prototype.moveSelectionUp = function() {
      if (!(this.selectedIndex <= 0)) {
        return this.setSelectedIndex(this.selectedIndex - 1);
      } else {
        return this.setSelectedIndex(this.visibleItems().length - 1);
      }
    };

    SuggestionListElement.prototype.moveSelectionDown = function() {
      if (!(this.selectedIndex >= (this.visibleItems().length - 1))) {
        return this.setSelectedIndex(this.selectedIndex + 1);
      } else {
        return this.setSelectedIndex(0);
      }
    };

    SuggestionListElement.prototype.moveSelectionPageUp = function() {
      var newIndex;
      newIndex = Math.max(0, this.selectedIndex - this.maxVisibleSuggestions);
      if (this.selectedIndex !== newIndex) {
        return this.setSelectedIndex(newIndex);
      }
    };

    SuggestionListElement.prototype.moveSelectionPageDown = function() {
      var itemsLength, newIndex;
      itemsLength = this.visibleItems().length;
      newIndex = Math.min(itemsLength - 1, this.selectedIndex + this.maxVisibleSuggestions);
      if (this.selectedIndex !== newIndex) {
        return this.setSelectedIndex(newIndex);
      }
    };

    SuggestionListElement.prototype.moveSelectionToTop = function() {
      var newIndex;
      newIndex = 0;
      if (this.selectedIndex !== newIndex) {
        return this.setSelectedIndex(newIndex);
      }
    };

    SuggestionListElement.prototype.moveSelectionToBottom = function() {
      var newIndex;
      newIndex = this.visibleItems().length - 1;
      if (this.selectedIndex !== newIndex) {
        return this.setSelectedIndex(newIndex);
      }
    };

    SuggestionListElement.prototype.setSelectedIndex = function(index) {
      this.selectedIndex = index;
      return atom.views.updateDocument(this.renderSelectedItem.bind(this));
    };

    SuggestionListElement.prototype.visibleItems = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1.slice(0, this.maxItems) : void 0 : void 0;
    };

    SuggestionListElement.prototype.getSelectedItem = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1[this.selectedIndex] : void 0 : void 0;
    };

    SuggestionListElement.prototype.confirmSelection = function() {
      var item;
      if (!this.model.isActive()) {
        return;
      }
      item = this.getSelectedItem();
      if (item != null) {
        return this.model.confirm(item);
      } else {
        return this.model.cancel();
      }
    };

    SuggestionListElement.prototype.renderList = function() {
      this.innerHTML = ListTemplate;
      this.ol = this.querySelector('.list-group');
      this.scroller = this.querySelector('.suggestion-list-scroller');
      this.descriptionContainer = this.querySelector('.suggestion-description');
      this.descriptionContent = this.querySelector('.suggestion-description-content');
      return this.descriptionMoreLink = this.querySelector('.suggestion-description-more-link');
    };

    SuggestionListElement.prototype.renderItems = function() {
      var descLength, index, item, items, longestDesc, longestDescIndex, _i, _len, _ref;
      this.style.width = null;
      items = (_ref = this.visibleItems()) != null ? _ref : [];
      longestDesc = 0;
      longestDescIndex = null;
      for (index = _i = 0, _len = items.length; _i < _len; index = ++_i) {
        item = items[index];
        this.renderItem(item, index);
        descLength = this.descriptionLength(item);
        if (descLength > longestDesc) {
          longestDesc = descLength;
          longestDescIndex = index;
        }
      }
      this.updateDescription(items[longestDescIndex]);
      return this.returnItemsToPool(items.length);
    };

    SuggestionListElement.prototype.returnItemsToPool = function(pivotIndex) {
      var li;
      while ((this.ol != null) && (li = this.ol.childNodes[pivotIndex])) {
        li.remove();
        this.nodePool.push(li);
      }
    };

    SuggestionListElement.prototype.descriptionLength = function(item) {
      var count;
      count = 0;
      if (item.description != null) {
        count += item.description.length;
      }
      if (item.descriptionMoreURL != null) {
        count += 6;
      }
      return count;
    };

    SuggestionListElement.prototype.renderSelectedItem = function() {
      var _ref;
      if ((_ref = this.selectedLi) != null) {
        _ref.classList.remove('selected');
      }
      this.selectedLi = this.ol.childNodes[this.selectedIndex];
      if (this.selectedLi != null) {
        this.selectedLi.classList.add('selected');
        this.scrollSelectedItemIntoView();
        return this.updateDescription();
      }
    };

    SuggestionListElement.prototype.scrollSelectedItemIntoView = function() {
      var itemHeight, scrollTop, scrollerHeight, selectedItemTop;
      scrollTop = this.scroller.scrollTop;
      selectedItemTop = this.selectedLi.offsetTop;
      if (selectedItemTop < scrollTop) {
        return this.scroller.scrollTop = selectedItemTop;
      }
      itemHeight = this.uiProps.itemHeight;
      scrollerHeight = this.maxVisibleSuggestions * itemHeight + this.uiProps.paddingHeight;
      if (selectedItemTop + itemHeight > scrollTop + scrollerHeight) {
        return this.scroller.scrollTop = selectedItemTop - scrollerHeight + itemHeight;
      }
    };

    SuggestionListElement.prototype.readUIPropsFromDOM = function() {
      var wordContainer, _base, _base1, _ref, _ref1, _ref2;
      wordContainer = (_ref = this.selectedLi) != null ? _ref.querySelector('.word-container') : void 0;
      if (this.uiProps == null) {
        this.uiProps = {};
      }
      this.uiProps.width = this.offsetWidth + 1;
      this.uiProps.marginLeft = -((_ref1 = wordContainer != null ? wordContainer.offsetLeft : void 0) != null ? _ref1 : 0);
      if ((_base = this.uiProps).itemHeight == null) {
        _base.itemHeight = this.selectedLi.offsetHeight;
      }
      if ((_base1 = this.uiProps).paddingHeight == null) {
        _base1.paddingHeight = (_ref2 = parseInt(getComputedStyle(this)['padding-top']) + parseInt(getComputedStyle(this)['padding-bottom'])) != null ? _ref2 : 0;
      }
      if (atom.views.documentReadInProgress != null) {
        return atom.views.updateDocument(this.updateUIForChangedProps.bind(this));
      } else {
        return this.updateUIForChangedProps();
      }
    };

    SuggestionListElement.prototype.updateUIForChangedProps = function() {
      this.scroller.style['max-height'] = "" + (this.maxVisibleSuggestions * this.uiProps.itemHeight + this.uiProps.paddingHeight) + "px";
      this.style.width = "" + this.uiProps.width + "px";
      if (this.suggestionListFollows === 'Word') {
        this.style['margin-left'] = "" + this.uiProps.marginLeft + "px";
      }
      return this.updateDescription();
    };

    SuggestionListElement.prototype.addClassToElement = function(element, classNames) {
      var className, classes, _i, _len;
      if (classNames && (classes = classNames.split(' '))) {
        for (_i = 0, _len = classes.length; _i < _len; _i++) {
          className = classes[_i];
          className = className.trim();
          if (className) {
            element.classList.add(className);
          }
        }
      }
    };

    SuggestionListElement.prototype.renderItem = function(_arg, index) {
      var className, defaultIconHTML, defaultLetterIconHTML, displayText, iconHTML, leftLabel, leftLabelHTML, leftLabelSpan, li, replacementPrefix, rightLabel, rightLabelHTML, rightLabelSpan, sanitizedIconHTML, sanitizedType, snippet, text, type, typeIcon, typeIconContainer, wordSpan, _ref;
      iconHTML = _arg.iconHTML, type = _arg.type, snippet = _arg.snippet, text = _arg.text, displayText = _arg.displayText, className = _arg.className, replacementPrefix = _arg.replacementPrefix, leftLabel = _arg.leftLabel, leftLabelHTML = _arg.leftLabelHTML, rightLabel = _arg.rightLabel, rightLabelHTML = _arg.rightLabelHTML;
      li = this.ol.childNodes[index];
      if (!li) {
        if (this.nodePool.length > 0) {
          li = this.nodePool.pop();
        } else {
          li = document.createElement('li');
          li.innerHTML = ItemTemplate;
        }
        li.dataset.index = index;
        this.ol.appendChild(li);
      }
      li.className = '';
      if (index === this.selectedIndex) {
        li.classList.add('selected');
      }
      if (className) {
        this.addClassToElement(li, className);
      }
      if (index === this.selectedIndex) {
        this.selectedLi = li;
      }
      typeIconContainer = li.querySelector('.icon-container');
      typeIconContainer.innerHTML = '';
      sanitizedType = escapeHtml(isString(type) ? type : '');
      sanitizedIconHTML = isString(iconHTML) ? iconHTML : void 0;
      defaultLetterIconHTML = sanitizedType ? "<span class=\"icon-letter\">" + sanitizedType[0] + "</span>" : '';
      defaultIconHTML = (_ref = DefaultSuggestionTypeIconHTML[sanitizedType]) != null ? _ref : defaultLetterIconHTML;
      if ((sanitizedIconHTML || defaultIconHTML) && iconHTML !== false) {
        typeIconContainer.innerHTML = IconTemplate;
        typeIcon = typeIconContainer.childNodes[0];
        typeIcon.innerHTML = sanitizedIconHTML != null ? sanitizedIconHTML : defaultIconHTML;
        if (type) {
          this.addClassToElement(typeIcon, type);
        }
      }
      wordSpan = li.querySelector('.word');
      wordSpan.innerHTML = this.getDisplayHTML(text, snippet, displayText, replacementPrefix);
      leftLabelSpan = li.querySelector('.left-label');
      if (leftLabelHTML != null) {
        leftLabelSpan.innerHTML = leftLabelHTML;
      } else if (leftLabel != null) {
        leftLabelSpan.textContent = leftLabel;
      } else {
        leftLabelSpan.textContent = '';
      }
      rightLabelSpan = li.querySelector('.right-label');
      if (rightLabelHTML != null) {
        return rightLabelSpan.innerHTML = rightLabelHTML;
      } else if (rightLabel != null) {
        return rightLabelSpan.textContent = rightLabel;
      } else {
        return rightLabelSpan.textContent = '';
      }
    };

    SuggestionListElement.prototype.getDisplayHTML = function(text, snippet, displayText, replacementPrefix) {
      var character, characterMatchIndices, displayHTML, index, replacementText, snippetIndices, snippets, _i, _len, _ref, _ref1;
      replacementText = text;
      if (typeof displayText === 'string') {
        replacementText = displayText;
      } else if (typeof snippet === 'string') {
        replacementText = this.removeEmptySnippets(snippet);
        snippets = this.snippetParser.findSnippets(replacementText);
        replacementText = this.removeSnippetsFromText(snippets, replacementText);
        snippetIndices = this.findSnippetIndices(snippets);
      }
      characterMatchIndices = this.findCharacterMatchIndices(replacementText, replacementPrefix);
      displayHTML = '';
      for (index = _i = 0, _len = replacementText.length; _i < _len; index = ++_i) {
        character = replacementText[index];
        if ((_ref = snippetIndices != null ? snippetIndices[index] : void 0) === SnippetStart || _ref === SnippetStartAndEnd) {
          displayHTML += '<span class="snippet-completion">';
        }
        if (characterMatchIndices != null ? characterMatchIndices[index] : void 0) {
          displayHTML += '<span class="character-match">' + escapeHtml(replacementText[index]) + '</span>';
        } else {
          displayHTML += escapeHtml(replacementText[index]);
        }
        if ((_ref1 = snippetIndices != null ? snippetIndices[index] : void 0) === SnippetEnd || _ref1 === SnippetStartAndEnd) {
          displayHTML += '</span>';
        }
      }
      return displayHTML;
    };

    SuggestionListElement.prototype.removeEmptySnippets = function(text) {
      if (!((text != null ? text.length : void 0) && text.indexOf('$') !== -1)) {
        return text;
      }
      return text.replace(this.emptySnippetGroupRegex, '');
    };

    SuggestionListElement.prototype.removeSnippetsFromText = function(snippets, text) {
      var body, index, result, snippetEnd, snippetStart, _i, _len, _ref;
      if (!(text.length && (snippets != null ? snippets.length : void 0))) {
        return text;
      }
      index = 0;
      result = '';
      for (_i = 0, _len = snippets.length; _i < _len; _i++) {
        _ref = snippets[_i], snippetStart = _ref.snippetStart, snippetEnd = _ref.snippetEnd, body = _ref.body;
        result += text.slice(index, snippetStart) + body;
        index = snippetEnd + 1;
      }
      if (index !== text.length) {
        result += text.slice(index, text.length);
      }
      return result;
    };

    SuggestionListElement.prototype.findSnippetIndices = function(snippets) {
      var body, bodyLength, endIndex, indices, offsetAccumulator, snippetEnd, snippetLength, snippetStart, startIndex, _i, _len, _ref;
      if (snippets == null) {
        return;
      }
      indices = {};
      offsetAccumulator = 0;
      for (_i = 0, _len = snippets.length; _i < _len; _i++) {
        _ref = snippets[_i], snippetStart = _ref.snippetStart, snippetEnd = _ref.snippetEnd, body = _ref.body;
        bodyLength = body.length;
        snippetLength = snippetEnd - snippetStart + 1;
        startIndex = snippetStart - offsetAccumulator;
        endIndex = startIndex + bodyLength - 1;
        offsetAccumulator += snippetLength - bodyLength;
        if (startIndex === endIndex) {
          indices[startIndex] = SnippetStartAndEnd;
        } else {
          indices[startIndex] = SnippetStart;
          indices[endIndex] = SnippetEnd;
        }
      }
      return indices;
    };

    SuggestionListElement.prototype.findCharacterMatchIndices = function(text, replacementPrefix) {
      var ch, i, matchIndices, matches, wordIndex, _i, _j, _len, _len1;
      if (!((text != null ? text.length : void 0) && (replacementPrefix != null ? replacementPrefix.length : void 0))) {
        return;
      }
      matches = {};
      if (this.useAlternateScoring) {
        matchIndices = fuzzaldrinPlus.match(text, replacementPrefix);
        for (_i = 0, _len = matchIndices.length; _i < _len; _i++) {
          i = matchIndices[_i];
          matches[i] = true;
        }
      } else {
        wordIndex = 0;
        for (i = _j = 0, _len1 = replacementPrefix.length; _j < _len1; i = ++_j) {
          ch = replacementPrefix[i];
          while (wordIndex < text.length && text[wordIndex].toLowerCase() !== ch.toLowerCase()) {
            wordIndex += 1;
          }
          if (wordIndex >= text.length) {
            break;
          }
          matches[wordIndex] = true;
          wordIndex += 1;
        }
      }
      return matches;
    };

    SuggestionListElement.prototype.dispose = function() {
      var _ref;
      this.subscriptions.dispose();
      return (_ref = this.parentNode) != null ? _ref.removeChild(this) : void 0;
    };

    return SuggestionListElement;

  })(HTMLElement);

  escapeHtml = function(html) {
    return String(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  module.exports = SuggestionListElement = document.registerElement('autocomplete-suggestion-list', {
    prototype: SuggestionListElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3VnZ2VzdGlvbi1saXN0LWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNOQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFFQyxXQUFZLE9BQUEsQ0FBUSxnQkFBUixFQUFaLFFBRkQsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGlCQUFSLENBSGpCLENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQWUsNkxBTGYsQ0FBQTs7QUFBQSxFQWNBLFlBQUEsR0FBZSxxUUFkZixDQUFBOztBQUFBLEVBd0JBLFlBQUEsR0FBZSxzQkF4QmYsQ0FBQTs7QUFBQSxFQTBCQSw2QkFBQSxHQUNFO0FBQUEsSUFBQSxTQUFBLEVBQVcsaUNBQVg7QUFBQSxJQUNBLFFBQUEsRUFBVSw4QkFEVjtBQUFBLElBRUEsU0FBQSxFQUFXLDhCQUZYO0FBQUEsSUFHQSxRQUFBLEVBQVUsOEJBSFY7QUFBQSxJQUlBLFNBQUEsRUFBVyw4QkFKWDtBQUFBLElBS0EsS0FBQSxFQUFPLDJCQUxQO0FBQUEsSUFNQSxXQUFBLEVBQWEsMEJBTmI7R0EzQkYsQ0FBQTs7QUFBQSxFQW1DQSxZQUFBLEdBQWUsQ0FuQ2YsQ0FBQTs7QUFBQSxFQW9DQSxVQUFBLEdBQWEsQ0FwQ2IsQ0FBQTs7QUFBQSxFQXFDQSxrQkFBQSxHQUFxQixDQXJDckIsQ0FBQTs7QUFBQSxFQXVDTTtBQUNKLDRDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxvQ0FBQSxRQUFBLEdBQVUsR0FB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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/suggestion-list-element.coffee
