(function() {
  var CompositeDisposable, InputView, SearchModel, TextEditorView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), View = _ref.View, TextEditorView = _ref.TextEditorView;

  CompositeDisposable = require('atom').CompositeDisposable;

  SearchModel = require('./search-model');

  module.exports = InputView = (function(_super) {
    __extends(InputView, _super);

    function InputView() {
      this.toggleCaseOption = __bind(this.toggleCaseOption, this);
      this.toggleRegexOption = __bind(this.toggleRegexOption, this);
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": 'isearch tool-panel panel-bottom padded'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block'
          }, function() {
            _this.span({
              outlet: 'descriptionLabel',
              "class": 'description'
            }, 'Incremental Search');
            return _this.span({
              outlet: 'optionsLabel',
              "class": 'options'
            });
          });
          return _this.div({
            "class": 'find-container block'
          }, function() {
            _this.div({
              "class": 'editor-container'
            }, function() {
              return _this.subview('findEditor', new TextEditorView({
                mini: true,
                placeholderText: 'search'
              }));
            });
            return _this.div({
              "class": 'btn-group btn-toggle btn-group-options'
            }, function() {
              _this.button({
                outlet: 'regexOptionButton',
                "class": 'btn'
              }, '.*');
              return _this.button({
                outlet: 'caseOptionButton',
                "class": 'btn'
              }, 'Aa');
            });
          });
        };
      })(this));
    };

    InputView.prototype.initialize = function(serializeState) {
      this.subscriptions = new CompositeDisposable;
      serializeState = serializeState || {};
      this.searchModel = new SearchModel(serializeState.modelState);
      return this.handleEvents();
    };

    InputView.prototype.handleEvents = function() {
      this.subscriptions.add(atom.config.observe('incremental-search.instantSearch', this.handleInstantSearchConfigChange.bind(this)));
      this.subscriptions.add(atom.commands.add(this.findEditor.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.stopSearch();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add(this.element, {
        'core:close': (function(_this) {
          return function() {
            return _this.cancelSearch();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancelSearch();
          };
        })(this),
        'incremental-search:toggle-regex-option': this.toggleRegexOption,
        'incremental-search:toggle-case-option': this.toggleCaseOption,
        'incremental-search:focus-editor': (function(_this) {
          return function() {
            return _this.focusEditor();
          };
        })(this),
        'incremental-search:slurp': (function(_this) {
          return function() {
            return _this.slurp();
          };
        })(this)
      }));
      if (atom.config.get('incremental-search.cancelSearchOnBlur')) {
        this.findEditor.on('blur', (function(_this) {
          return function() {
            return _this.cancelSearch();
          };
        })(this));
      }
      this.regexOptionButton.on('click', this.toggleRegexOption);
      this.caseOptionButton.on('click', this.toggleCaseOption);
      return this.searchModel.on('updatedOptions', (function(_this) {
        return function() {
          _this.updateOptionButtons();
          return _this.updateOptionsLabel();
        };
      })(this));
    };

    InputView.prototype.handleInstantSearchConfigChange = function(instantSearch) {
      var changeEventListener, _ref1;
      changeEventListener = instantSearch ? 'onDidChange' : 'onDidStopChanging';
      if ((_ref1 = this.changeSubscription) != null) {
        _ref1.dispose();
      }
      return this.changeSubscription = this.findEditor.getModel()[changeEventListener]((function(_this) {
        return function() {
          return _this.updateSearchText();
        };
      })(this));
    };

    InputView.prototype.attached = function() {
      if (this.tooltipSubscriptions != null) {
        return;
      }
      this.tooltipSubscriptions = new CompositeDisposable;
      this.tooltipSubscriptions.add(atom.tooltips.add(this.regexOptionButton, {
        title: "Use Regex",
        keyBindingCommand: 'incremental-search:toggle-regex-option',
        keyBindingTarget: this.findEditor[0]
      }));
      return this.tooltipSubscriptions.add(atom.tooltips.add(this.caseOptionButton, {
        title: "Match Case",
        keyBindingCommand: 'incremental-search:toggle-case-option',
        keyBindingTarget: this.findEditor[0]
      }));
    };

    InputView.prototype.hideAllTooltips = function() {
      var _ref1;
      if ((_ref1 = this.tooltipSubscriptions) != null) {
        _ref1.dispose();
      }
      return this.tooltipSubscriptions = null;
    };

    InputView.prototype.slurp = function() {
      this.searchModel.slurp();
      return this.findEditor.setText(this.searchModel.pattern);
    };

    InputView.prototype.toggleRegexOption = function() {
      this.searchModel.update({
        pattern: this.findEditor.getText(),
        useRegex: !this.searchModel.useRegex
      });
      this.updateOptionsLabel();
      return this.updateOptionButtons();
    };

    InputView.prototype.toggleCaseOption = function() {
      this.searchModel.update({
        pattern: this.findEditor.getText(),
        caseSensitive: !this.searchModel.caseSensitive
      });
      this.updateOptionsLabel();
      return this.updateOptionButtons();
    };

    InputView.prototype.updateSearchText = function() {
      var pattern;
      pattern = this.findEditor.getText();
      return this.searchModel.update({
        pattern: pattern
      });
    };

    InputView.prototype.serialize = function() {
      return {
        modelState: this.searchModel.serialize()
      };
    };

    InputView.prototype.destroy = function() {
      var _ref1, _ref2, _ref3;
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.tooltipSubscriptions) != null) {
        _ref2.dispose();
      }
      return (_ref3 = this.changeSubscription) != null ? _ref3.dispose() : void 0;
    };

    InputView.prototype.detach = function() {
      var workspaceElement;
      this.hideAllTooltips();
      workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.focus();
      return InputView.__super__.detach.call(this);
    };

    InputView.prototype.trigger = function(direction) {
      var pattern;
      this.searchModel.direction = direction;
      this.updateOptionsLabel();
      this.updateOptionButtons();
      if (!this.hasParent()) {
        this.inputPanel = atom.workspace.addBottomPanel({
          item: this
        });
        pattern = '';
        this.findEditor.setText(pattern);
        this.searchModel.start(pattern);
        this.inputPanel.show();
        return this.findEditor.focus();
      } else {
        this.inputPanel.show();
        this.findEditor.focus();
        if (this.findEditor.getText()) {
          return this.searchModel.findNext();
        } else {
          if (this.searchModel.history.length) {
            pattern = this.searchModel.history[this.searchModel.history.length - 1];
            this.findEditor.setText(pattern);
            return this.searchModel.update({
              pattern: pattern
            });
          }
        }
      }
    };

    InputView.prototype.stopSearch = function() {
      this.searchModel.stopSearch(this.findEditor.getText());
      return this.detach();
    };

    InputView.prototype.cancelSearch = function() {
      var _ref1;
      this.searchModel.cancelSearch();
      if ((_ref1 = this.inputPanel) != null) {
        _ref1.hide();
      }
      return this.detach();
    };

    InputView.prototype.updateOptionsLabel = function() {
      var label;
      label = [];
      if (this.searchModel.useRegex) {
        label.push('regex');
      }
      if (this.searchModel.caseSensitive) {
        label.push('case sensitive');
      } else {
        label.push('case insensitive');
      }
      return this.optionsLabel.text(' (' + label.join(', ') + ')');
    };

    InputView.prototype.updateOptionButtons = function() {
      this.setOptionButtonState(this.regexOptionButton, this.searchModel.useRegex);
      return this.setOptionButtonState(this.caseOptionButton, this.searchModel.caseSensitive);
    };

    InputView.prototype.setOptionButtonState = function(optionButton, selected) {
      if (selected) {
        return optionButton.addClass('selected');
      } else {
        return optionButton.removeClass('selected');
      }
    };

    InputView.prototype.focusEditor = function() {
      if (this.searchModel.lastPosition) {
        this.searchModel.moveCursorToCurrent();
        return atom.workspaceView.getActiveView().focus();
      }
    };

    return InputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9pbmNyZW1lbnRhbC1zZWFyY2gvbGliL2lucHV0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVFQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsWUFBQSxJQUFELEVBQU8sc0JBQUEsY0FBUCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBSGQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixnQ0FBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsUUFBQSxFQUFVLENBQUEsQ0FBVjtBQUFBLFFBQWMsT0FBQSxFQUFPLHdDQUFyQjtPQUFMLEVBQW9FLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDbEUsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUEsR0FBQTtBQUNuQixZQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxjQUFBLE1BQUEsRUFBUSxrQkFBUjtBQUFBLGNBQTRCLE9BQUEsRUFBTyxhQUFuQzthQUFOLEVBQXdELG9CQUF4RCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLGNBQVI7QUFBQSxjQUF3QixPQUFBLEVBQU8sU0FBL0I7YUFBTixFQUZtQjtVQUFBLENB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

//# sourceURL=/Users/igawataiichi/.atom/packages/incremental-search/lib/input-view.coffee
