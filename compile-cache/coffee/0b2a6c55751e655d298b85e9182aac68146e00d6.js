(function() {
  var TestStatusStatusBarView;

  TestStatusStatusBarView = require('./test-status-status-bar-view');

  module.exports = {
    config: {
      autorun: {
        type: 'boolean',
        "default": true
      },
      timeoutInSeconds: {
        type: 'integer',
        "default": 60,
        minimum: 1,
        description: 'Test jobs will be terminated if they run longer than this'
      }
    },
    activate: function() {
      var createStatusEntry, statusBar;
      createStatusEntry = (function(_this) {
        return function() {
          _this.testStatusStatusBar = new TestStatusStatusBarView;
          if (atom.config.get('test-status.autorun')) {
            return _this.testStatusStatusBar.executeCommand();
          }
        };
      })(this);
      statusBar = document.querySelector('status-bar');
      if (statusBar != null) {
        return createStatusEntry();
      } else {
        return atom.packages.onDidActivateInitialPackages(function() {
          return createStatusEntry();
        });
      }
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.testStatusStatusBar) != null) {
        _ref.destroy();
      }
      return this.testStatusStatusBar = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90ZXN0LXN0YXR1cy9saWIvdGVzdC1zdGF0dXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBOztBQUFBLEVBQUEsdUJBQUEsR0FBMEIsT0FBQSxDQUFRLCtCQUFSLENBQTFCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO09BREY7QUFBQSxNQUlBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsT0FBQSxFQUFTLENBRlQ7QUFBQSxRQUdBLFdBQUEsRUFBYSwyREFIYjtPQUxGO0tBREY7QUFBQSxJQWNBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLDRCQUFBO0FBQUEsTUFBQSxpQkFBQSxHQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2xCLFVBQUEsS0FBQyxDQUFBLG1CQUFELEdBQXVCLEdBQUEsQ0FBQSx1QkFBdkIsQ0FBQTtBQUdBLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLENBQUg7bUJBQ0UsS0FBQyxDQUFBLG1CQUFtQixDQUFDLGNBQXJCLENBQUEsRUFERjtXQUprQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQUE7QUFBQSxNQU9BLFNBQUEsR0FBWSxRQUFRLENBQUMsYUFBVCxDQUF1QixZQUF2QixDQVBaLENBQUE7QUFTQSxNQUFBLElBQUcsaUJBQUg7ZUFDRSxpQkFBQSxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBZCxDQUEyQyxTQUFBLEdBQUE7aUJBQ3pDLGlCQUFBLENBQUEsRUFEeUM7UUFBQSxDQUEzQyxFQUhGO09BVlE7SUFBQSxDQWRWO0FBQUEsSUFpQ0EsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsSUFBQTs7WUFBb0IsQ0FBRSxPQUF0QixDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FGYjtJQUFBLENBakNaO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/test-status/lib/test-status.coffee
