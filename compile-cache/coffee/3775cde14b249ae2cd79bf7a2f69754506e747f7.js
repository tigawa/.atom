(function() {
  var path;

  path = require('path');

  module.exports = {
    config: {},
    activate: function() {
      return require("atom-package-deps").install("linter-coffeelint");
    },
    provideLinter: function() {
      return require('./plus-linter.coffee');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItY29mZmVlbGludC9saWIvaW5pdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsSUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQU9FO0FBQUEsSUFBQSxNQUFBLEVBQVEsRUFBUjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLE9BQUEsQ0FBUSxtQkFBUixDQUE0QixDQUFDLE9BQTdCLENBQXFDLG1CQUFyQyxFQURRO0lBQUEsQ0FGVjtBQUFBLElBS0EsYUFBQSxFQUFlLFNBQUEsR0FBQTtBQUNiLGFBQU8sT0FBQSxDQUFRLHNCQUFSLENBQVAsQ0FEYTtJQUFBLENBTGY7R0FURixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/linter-coffeelint/lib/init.coffee
