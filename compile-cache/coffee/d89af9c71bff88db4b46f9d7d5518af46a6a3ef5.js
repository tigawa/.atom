(function() {
  var GitNotFoundErrorView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('space-pen').View;

  GitNotFoundErrorView = (function(superClass) {
    extend(GitNotFoundErrorView, superClass);

    function GitNotFoundErrorView() {
      return GitNotFoundErrorView.__super__.constructor.apply(this, arguments);
    }

    GitNotFoundErrorView.content = function(err) {
      return this.div({
        "class": 'overlay from-top padded merge-conflict-error merge-conflicts-message'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'panel'
          }, function() {
            _this.div({
              "class": 'panel-heading no-path'
            }, function() {
              _this.code('git');
              return _this.text("can't be found in any of the default locations!");
            });
            _this.div({
              "class": 'panel-heading wrong-path'
            }, function() {
              _this.code('git');
              _this.text("can't be found at ");
              _this.code(atom.config.get('merge-conflicts.gitPath'));
              return _this.text('!');
            });
            return _this.div({
              "class": 'panel-body'
            }, function() {
              _this.div({
                "class": 'block'
              }, 'Please specify the correct path in the merge-conflicts package settings.');
              return _this.div({
                "class": 'block'
              }, function() {
                _this.button({
                  "class": 'btn btn-error inline-block-tight',
                  click: 'openSettings'
                }, 'Open Settings');
                return _this.button({
                  "class": 'btn inline-block-tight',
                  click: 'notRightNow'
                }, 'Not Right Now');
              });
            });
          });
        };
      })(this));
    };

    GitNotFoundErrorView.prototype.initialize = function(err) {
      if (atom.config.get('merge-conflicts.gitPath')) {
        this.find('.no-path').hide();
        return this.find('.wrong-path').show();
      } else {
        this.find('.no-path').show();
        return this.find('.wrong-path').hide();
      }
    };

    GitNotFoundErrorView.prototype.openSettings = function() {
      atom.workspace.open('atom://config/packages');
      return this.remove();
    };

    GitNotFoundErrorView.prototype.notRightNow = function() {
      return this.remove();
    };

    return GitNotFoundErrorView;

  })(View);

  module.exports = {
    handleErr: function(err) {
      if (err == null) {
        return false;
      }
      if (err.isGitError) {
        atom.workspace.addTopPanel({
          item: new GitNotFoundErrorView(err)
        });
      } else {
        atom.notifications.addError(err.message);
        console.error(err.message, err.trace);
      }
      return true;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvZXJyb3Itdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBCQUFBO0lBQUE7OztFQUFDLE9BQVEsT0FBQSxDQUFRLFdBQVI7O0VBRUg7Ozs7Ozs7SUFFSixvQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLEdBQUQ7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxzRUFBUDtPQUFMLEVBQW9GLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDbEYsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUE7WUFDbkIsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sdUJBQVA7YUFBTCxFQUFxQyxTQUFBO2NBQ25DLEtBQUMsQ0FBQSxJQUFELENBQU0sS0FBTjtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLGlEQUFOO1lBRm1DLENBQXJDO1lBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sMEJBQVA7YUFBTCxFQUF3QyxTQUFBO2NBQ3RDLEtBQUMsQ0FBQSxJQUFELENBQU0sS0FBTjtjQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sb0JBQU47Y0FDQSxLQUFDLENBQUEsSUFBRCxDQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBTjtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLEdBQU47WUFKc0MsQ0FBeEM7bUJBS0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDthQUFMLEVBQTBCLFNBQUE7Y0FDeEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7ZUFBTCxFQUNFLDBFQURGO3FCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO2VBQUwsRUFBcUIsU0FBQTtnQkFDbkIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtDQUFQO2tCQUEyQyxLQUFBLEVBQU8sY0FBbEQ7aUJBQVIsRUFBMEUsZUFBMUU7dUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO2tCQUFpQyxLQUFBLEVBQU8sYUFBeEM7aUJBQVIsRUFBK0QsZUFBL0Q7Y0FGbUIsQ0FBckI7WUFId0IsQ0FBMUI7VUFUbUIsQ0FBckI7UUFEa0Y7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBGO0lBRFE7O21DQWtCVixVQUFBLEdBQVksU0FBQyxHQUFEO01BQ1YsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQUg7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLFVBQU4sQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO2VBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxhQUFOLENBQW9CLENBQUMsSUFBckIsQ0FBQSxFQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxJQUFELENBQU0sVUFBTixDQUFpQixDQUFDLElBQWxCLENBQUE7ZUFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGFBQU4sQ0FBb0IsQ0FBQyxJQUFyQixDQUFBLEVBTEY7O0lBRFU7O21DQVFaLFlBQUEsR0FBYyxTQUFBO01BQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLHdCQUFwQjthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFGWTs7bUNBSWQsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRFc7Ozs7S0FoQ29COztFQW1DbkMsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFNBQUEsRUFBVyxTQUFDLEdBQUQ7TUFDVCxJQUFvQixXQUFwQjtBQUFBLGVBQU8sTUFBUDs7TUFFQSxJQUFHLEdBQUcsQ0FBQyxVQUFQO1FBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFmLENBQTJCO1VBQUEsSUFBQSxFQUFVLElBQUEsb0JBQUEsQ0FBcUIsR0FBckIsQ0FBVjtTQUEzQixFQURGO09BQUEsTUFBQTtRQUdFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsR0FBRyxDQUFDLE9BQWhDO1FBQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFHLENBQUMsT0FBbEIsRUFBMkIsR0FBRyxDQUFDLEtBQS9CLEVBSkY7O2FBS0E7SUFSUyxDQUFYOztBQXRDRiIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3fSA9IHJlcXVpcmUgJ3NwYWNlLXBlbidcblxuY2xhc3MgR2l0Tm90Rm91bmRFcnJvclZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgQGNvbnRlbnQ6IChlcnIpIC0+XG4gICAgQGRpdiBjbGFzczogJ292ZXJsYXkgZnJvbS10b3AgcGFkZGVkIG1lcmdlLWNvbmZsaWN0LWVycm9yIG1lcmdlLWNvbmZsaWN0cy1tZXNzYWdlJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbCcsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1oZWFkaW5nIG5vLXBhdGgnLCA9PlxuICAgICAgICAgIEBjb2RlICdnaXQnXG4gICAgICAgICAgQHRleHQgXCJjYW4ndCBiZSBmb3VuZCBpbiBhbnkgb2YgdGhlIGRlZmF1bHQgbG9jYXRpb25zIVwiXG4gICAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1oZWFkaW5nIHdyb25nLXBhdGgnLCA9PlxuICAgICAgICAgIEBjb2RlICdnaXQnXG4gICAgICAgICAgQHRleHQgXCJjYW4ndCBiZSBmb3VuZCBhdCBcIlxuICAgICAgICAgIEBjb2RlIGF0b20uY29uZmlnLmdldCAnbWVyZ2UtY29uZmxpY3RzLmdpdFBhdGgnXG4gICAgICAgICAgQHRleHQgJyEnXG4gICAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1ib2R5JywgPT5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAnYmxvY2snLFxuICAgICAgICAgICAgJ1BsZWFzZSBzcGVjaWZ5IHRoZSBjb3JyZWN0IHBhdGggaW4gdGhlIG1lcmdlLWNvbmZsaWN0cyBwYWNrYWdlIHNldHRpbmdzLidcbiAgICAgICAgICBAZGl2IGNsYXNzOiAnYmxvY2snLCA9PlxuICAgICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tZXJyb3IgaW5saW5lLWJsb2NrLXRpZ2h0JywgY2xpY2s6ICdvcGVuU2V0dGluZ3MnLCAnT3BlbiBTZXR0aW5ncydcbiAgICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0JywgY2xpY2s6ICdub3RSaWdodE5vdycsICdOb3QgUmlnaHQgTm93J1xuXG4gIGluaXRpYWxpemU6IChlcnIpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICdtZXJnZS1jb25mbGljdHMuZ2l0UGF0aCdcbiAgICAgIEBmaW5kKCcubm8tcGF0aCcpLmhpZGUoKVxuICAgICAgQGZpbmQoJy53cm9uZy1wYXRoJykuc2hvdygpXG4gICAgZWxzZVxuICAgICAgQGZpbmQoJy5uby1wYXRoJykuc2hvdygpXG4gICAgICBAZmluZCgnLndyb25nLXBhdGgnKS5oaWRlKClcblxuICBvcGVuU2V0dGluZ3M6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbiAnYXRvbTovL2NvbmZpZy9wYWNrYWdlcydcbiAgICBAcmVtb3ZlKClcblxuICBub3RSaWdodE5vdzogLT5cbiAgICBAcmVtb3ZlKClcblxubW9kdWxlLmV4cG9ydHMgPVxuICBoYW5kbGVFcnI6IChlcnIpIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBlcnI/XG5cbiAgICBpZiBlcnIuaXNHaXRFcnJvclxuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwgaXRlbTogbmV3IEdpdE5vdEZvdW5kRXJyb3JWaWV3KGVycilcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgZXJyLm1lc3NhZ2VcbiAgICAgIGNvbnNvbGUuZXJyb3IgZXJyLm1lc3NhZ2UsIGVyci50cmFjZVxuICAgIHRydWVcbiJdfQ==
