(function() {
  var CommandRunner, CompositeDisposable, TestStatusStatusBarView, TestStatusView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  CompositeDisposable = require('atom').CompositeDisposable;

  TestStatusView = require('./test-status-view');

  CommandRunner = require('./command-runner');

  module.exports = TestStatusStatusBarView = (function(_super) {
    __extends(TestStatusStatusBarView, _super);

    function TestStatusStatusBarView() {
      return TestStatusStatusBarView.__super__.constructor.apply(this, arguments);
    }

    TestStatusStatusBarView.content = function() {
      return this.div({
        click: 'toggleTestStatusView',
        "class": 'inline-block'
      }, (function(_this) {
        return function() {
          return _this.span({
            outlet: 'testStatus',
            "class": 'test-status icon icon-hubot',
            tabindex: -1
          }, '');
        };
      })(this));
    };

    TestStatusStatusBarView.prototype.initialize = function() {
      this.testStatusView = new TestStatusView;
      this.commandRunner = new CommandRunner(this.testStatusView);
      this.attach();
      this.subscriptions = new CompositeDisposable;
      this.statusBarSub = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.subscriptions.add(editor.onDidSave(function() {
            if (!atom.config.get('test-status.autorun')) {
              return;
            }
            return _this.executeCommand();
          }));
        };
      })(this));
      return atom.commands.add('atom-workspace', {
        'test-status:run-tests': (function(_this) {
          return function() {
            return _this.executeCommand();
          };
        })(this)
      });
    };

    TestStatusStatusBarView.prototype.executeCommand = function() {
      return this.commandRunner.run(this.testStatus);
    };

    TestStatusStatusBarView.prototype.attach = function() {
      var statusBar;
      statusBar = document.querySelector('status-bar');
      if (statusBar != null) {
        return this.statusBarTile = statusBar.addLeftTile({
          item: this,
          priority: 100
        });
      }
    };

    TestStatusStatusBarView.prototype.destroy = function() {
      this.testStatusView.destroy();
      this.testStatusView = null;
      this.statusBarSub.dispose();
      this.statusBarSub = null;
      this.subscriptions.dispose();
      this.subscriptions = null;
      return this.detach();
    };

    TestStatusStatusBarView.prototype.toggleTestStatusView = function() {
      return this.testStatusView.toggle();
    };

    return TestStatusStatusBarView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90ZXN0LXN0YXR1cy9saWIvdGVzdC1zdGF0dXMtc3RhdHVzLWJhci12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpRkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBSGpCLENBQUE7O0FBQUEsRUFJQSxhQUFBLEdBQWlCLE9BQUEsQ0FBUSxrQkFBUixDQUpqQixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUdKLDhDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHVCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLEtBQUEsRUFBTyxzQkFBUDtBQUFBLFFBQStCLE9BQUEsRUFBTyxjQUF0QztPQUFMLEVBQTJELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3pELEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE1BQUEsRUFBUyxZQUFUO0FBQUEsWUFBdUIsT0FBQSxFQUFPLDZCQUE5QjtBQUFBLFlBQTZELFFBQUEsRUFBVSxDQUFBLENBQXZFO1dBQU4sRUFBaUYsRUFBakYsRUFEeUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzRCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHNDQUtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxjQUFELEdBQWtC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

//# sourceURL=/Users/igawataiichi/.atom/packages/test-status/lib/test-status-status-bar-view.coffee
