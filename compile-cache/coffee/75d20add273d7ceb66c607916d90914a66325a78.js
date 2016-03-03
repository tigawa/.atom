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
      this.subscriptions.add(this.findEditor.getModel().onDidStopChanging((function(_this) {
        return function() {
          return _this.updateSearchText();
        };
      })(this)));
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
      this.regexOptionButton.on('click', this.toggleRegexOption);
      this.caseOptionButton.on('click', this.toggleCaseOption);
      return this.searchModel.on('updatedOptions', (function(_this) {
        return function() {
          _this.updateOptionButtons();
          return _this.updateOptionsLabel();
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
      var _ref1, _ref2;
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      return (_ref2 = this.tooltipSubscriptions) != null ? _ref2.dispose() : void 0;
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
