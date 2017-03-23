(function() {
  var Dialog, FlowDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = FlowDialog = (function(_super) {
    __extends(FlowDialog, _super);

    function FlowDialog() {
      return FlowDialog.__super__.constructor.apply(this, arguments);
    }

    FlowDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Workflow - GitFlow');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Git Flow ');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'flowType',
              change: 'flowTypeChange'
            });
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'flowAction',
              change: 'flowActionChange'
            });
            _this.label('Branch Name:', {
              outlet: 'labelBranchName'
            });
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'branchName'
            });
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'branchChoose'
            });
            _this.label('Message:', {
              outlet: 'labelMessage'
            });
            _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'message'
            });
            _this.input({
              "class": 'native-key-bindings',
              type: 'checkbox',
              outlet: 'noTag',
              id: 'noTag'
            });
            return _this.label('No Tag', {
              outlet: 'labelNoTag',
              "for": 'noTag'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'flow'
            }, function() {
              _this.i({
                "class": 'icon flow'
              });
              return _this.span('Ok');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    FlowDialog.prototype.activate = function(branches) {
      var current;
      current = git.getLocalBranch();
      this.branches = branches;
      this.flowType.find('option').remove();
      this.flowType.append("<option value='feature'>feature</option>");
      this.flowType.append("<option value='release'>release</option>");
      this.flowType.append("<option value='hotfix'>hotfix</option>");
      this.flowType.append("<option value='init'>init</option>");
      this.flowAction.find('option').remove();
      this.flowAction.append("<option value='start'>start</option>");
      this.flowAction.append("<option value='finish'>finish</option>");
      this.flowAction.append("<option value='publish'>publish</option>");
      this.flowAction.append("<option value='pull'>pull</option>");
      this.flowTypeChange();
      this.flowActionChange();
      return FlowDialog.__super__.activate.call(this);
    };

    FlowDialog.prototype.flow = function() {
      var actionSelected, branchSelected;
      this.deactivate();
      if (this.flowType.val() === "init") {
        this.parentView.flow(this.flowType.val(), '-d', '');
      } else {
        branchSelected = this.branchName.val() !== '' ? this.branchName.val() : this.branchChoose.val();
        actionSelected = this.flowAction.val();
        if ((branchSelected != null) && branchSelected !== '') {
          if (actionSelected === "finish") {
            if (this.message.val() !== '') {
              actionSelected += ' -m "' + this.message.val() + '"';
            }
            if (this.noTag.prop('checked')) {
              actionSelected += ' -n';
            }
          }
          this.parentView.flow(this.flowType.val(), actionSelected, branchSelected);
        } else {
          git.alert("> No branches selected... Git flow action not valid.");
        }
      }
    };

    FlowDialog.prototype.checkMessageNeeded = function() {
      this.message.val("");
      if (this.flowAction.val() === "finish" && (this.flowType.val() === "release" || this.flowType.val() === "hotfix")) {
        this.message.show();
        this.labelMessage.show();
      } else {
        this.message.hide();
        this.labelMessage.hide();
      }
    };

    FlowDialog.prototype.checkNoTagNeeded = function() {
      if (this.flowAction.val() === "finish" && (this.flowType.val() === "release" || this.flowType.val() === "hotfix")) {
        this.noTag.show();
        this.labelNoTag.show();
      } else {
        this.noTag.hide();
        this.labelNoTag.hide();
      }
    };

    FlowDialog.prototype.flowTypeChange = function() {
      if (this.flowType.val() === "init") {
        this.flowAction.hide();
        this.branchName.hide();
        this.branchChoose.hide();
        this.labelBranchName.hide();
      } else {
        this.flowAction.show();
        this.flowActionChange();
        this.labelBranchName.show();
      }
      this.checkMessageNeeded();
      this.checkNoTagNeeded();
    };

    FlowDialog.prototype.flowActionChange = function() {
      var branch, value, _i, _len, _ref;
      this.checkMessageNeeded();
      this.checkNoTagNeeded();
      if (this.flowAction.val() !== "start") {
        this.branchName.hide();
        this.branchName.val('');
        this.branchChoose.find('option').remove();
        _ref = this.branches;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          branch = _ref[_i];
          if (branch.indexOf(this.flowType.val()) !== -1) {
            value = branch.replace(this.flowType.val() + '/', '');
            this.branchChoose.append("<option value='" + value + "'>" + value + "</option>");
          }
        }
        if (this.branchChoose.find('option').length <= 0) {
          this.branchChoose.append("<option value=''> --no " + this.flowType.val() + " branches--</option>");
        }
        return this.branchChoose.show();
      } else {
        this.branchName.show();
        this.branchChoose.val('');
        return this.branchChoose.hide();
      }
    };

    return FlowDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9mbG93LWRpYWxvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FGTixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BCLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBLEdBQUE7QUFDckIsWUFBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsY0FBQSxPQUFBLEVBQU8sa0JBQVA7QUFBQSxjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxvQkFBUixFQUZxQjtVQUFBLENBQXZCLENBQUEsQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsWUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLFdBQVAsQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsY0FBQSxP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

//# sourceURL=/Users/igawataiichi/.atom/packages/git-control/lib/dialogs/flow-dialog.coffee
