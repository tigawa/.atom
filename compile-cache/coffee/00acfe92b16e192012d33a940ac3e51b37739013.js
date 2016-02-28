(function() {
  module.exports = {
    config: {
      enableForIndentation: {
        type: 'boolean',
        "default": false,
        description: 'Enable highlight for lines containing only indentation'
      },
      enableForCursorLines: {
        type: 'boolean',
        "default": false,
        description: 'Enable highlight for lines containing a cursor'
      }
    },
    activate: function(state) {
      atom.config.observe('trailing-spaces.enableForIndentation', function(enable) {
        if (enable) {
          return document.body.classList.add('trailing-spaces-highlight-indentation');
        } else {
          return document.body.classList.remove('trailing-spaces-highlight-indentation');
        }
      });
      return atom.config.observe('trailing-spaces.enableForCursorLines', function(enable) {
        if (enable) {
          return document.body.classList.add('trailing-spaces-highlight-cursor-lines');
        } else {
          return document.body.classList.remove('trailing-spaces-highlight-cursor-lines');
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90cmFpbGluZy1zcGFjZXMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsd0RBRmI7T0FERjtBQUFBLE1BSUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsZ0RBRmI7T0FMRjtLQURGO0FBQUEsSUFVQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFFUixNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixzQ0FBcEIsRUFBNEQsU0FBQyxNQUFELEdBQUE7QUFDMUQsUUFBQSxJQUFHLE1BQUg7aUJBQ0UsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBeEIsQ0FBNEIsdUNBQTVCLEVBREY7U0FBQSxNQUFBO2lCQUdFLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQXhCLENBQStCLHVDQUEvQixFQUhGO1NBRDBEO01BQUEsQ0FBNUQsQ0FBQSxDQUFBO2FBT0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHNDQUFwQixFQUE0RCxTQUFDLE1BQUQsR0FBQTtBQUMxRCxRQUFBLElBQUcsTUFBSDtpQkFDRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUF4QixDQUE0Qix3Q0FBNUIsRUFERjtTQUFBLE1BQUE7aUJBR0UsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBeEIsQ0FBK0Isd0NBQS9CLEVBSEY7U0FEMEQ7TUFBQSxDQUE1RCxFQVRRO0lBQUEsQ0FWVjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/trailing-spaces/lib/main.coffee
