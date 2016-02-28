(function() {
  var Convert, TestStatusView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  Convert = require('ansi-to-html');

  module.exports = TestStatusView = (function(_super) {
    __extends(TestStatusView, _super);

    function TestStatusView() {
      return TestStatusView.__super__.constructor.apply(this, arguments);
    }

    TestStatusView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": 'test-status-output tool-panel panel-bottom padded native-key-bindings'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'block'
          }, function() {
            return _this.div({
              "class": 'message',
              outlet: 'testStatusOutput'
            });
          });
        };
      })(this));
    };

    TestStatusView.prototype.initialize = function() {
      this.output = "<strong>No output</strong>";
      this.testStatusOutput.html(this.output).css('font-size', "" + (atom.config.get('editor.fontSize')) + "px");
      return atom.commands.add('atom-workspace', {
        'test-status:toggle-output': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      });
    };

    TestStatusView.prototype.update = function(output) {
      if (this.convert == null) {
        this.convert = new Convert;
      }
      this.output = this.convert.toHtml(output.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      return this.testStatusOutput.html("<pre>" + (this.output.trim()) + "</pre>");
    };

    TestStatusView.prototype.destroy = function() {
      return this.detach();
    };

    TestStatusView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspace.addBottomPanel({
          item: this
        });
      }
    };

    return TestStatusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90ZXN0LXN0YXR1cy9saWIvdGVzdC1zdGF0dXMtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxjQUFSLENBRlYsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFHSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLFFBQUEsRUFBVSxDQUFBLENBQVY7QUFBQSxRQUFjLE9BQUEsRUFBTyx1RUFBckI7T0FBTCxFQUFtRyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNqRyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUEsR0FBQTttQkFDbkIsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLFNBQVA7QUFBQSxjQUFrQixNQUFBLEVBQVEsa0JBQTFCO2FBQUwsRUFEbUI7VUFBQSxDQUFyQixFQURpRztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5HLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsNkJBTUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSw0QkFBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBQyxDQUFBLE1BQXhCLENBQStCLENBQUMsR0FBaEMsQ0FBb0MsV0FBcEMsRUFBaUQsRUFBQSxHQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixDQUFELENBQUYsR0FBc0MsSUFBdkYsQ0FEQSxDQUFBO2FBR0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNFO0FBQUEsUUFBQSwyQkFBQSxFQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtPQURGLEVBSlU7SUFBQSxDQU5aLENBQUE7O0FBQUEsNkJBa0JBLE1BQUEsR0FBUSxTQUFDLE1BQUQsR0FBQTs7UUFDTixJQUFDLENBQUEsVUFBVyxHQUFBLENBQUE7T0FBWjtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FDUixNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsRUFBcUIsT0FBckIsQ0FDRSxDQUFDLE9BREgsQ0FDVyxJQURYLEVBQ2lCLFFBRGpCLENBRUUsQ0FBQyxPQUZILENBRVcsSUFGWCxFQUVpQixNQUZqQixDQUdFLENBQUMsT0FISCxDQUdXLElBSFgsRUFHaUIsTUFIakIsQ0FEUSxDQURWLENBQUE7YUFPQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBd0IsT0FBQSxHQUFNLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQUEsQ0FBRCxDQUFOLEdBQXNCLFFBQTlDLEVBUk07SUFBQSxDQWxCUixDQUFBOztBQUFBLDZCQStCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURPO0lBQUEsQ0EvQlQsQ0FBQTs7QUFBQSw2QkFxQ0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE5QixFQUhGO09BRE07SUFBQSxDQXJDUixDQUFBOzswQkFBQTs7S0FIMkIsS0FON0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/test-status/lib/test-status-view.coffee
