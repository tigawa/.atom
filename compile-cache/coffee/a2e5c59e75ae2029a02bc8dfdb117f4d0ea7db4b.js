(function() {
  var path;

  path = require('path');

  module.exports = {
    config: {},
    activate: function() {
      return require("atom-package-deps").install();
    },
    provideLinter: function() {
      return require('./plus-linter.coffee');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItY29mZmVlbGludC9saWIvaW5pdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQU9FO0lBQUEsTUFBQSxFQUFRLEVBQVI7SUFFQSxRQUFBLEVBQVUsU0FBQTthQUNSLE9BQUEsQ0FBUSxtQkFBUixDQUE0QixDQUFDLE9BQTdCLENBQUE7SUFEUSxDQUZWO0lBS0EsYUFBQSxFQUFlLFNBQUE7QUFDYixhQUFPLE9BQUEsQ0FBUSxzQkFBUjtJQURNLENBTGY7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjIFlvdXIgY29uZmlndXJhdGlvbiBiZWxvbmdzIGluIHlvdXIgcHJvamVjdCwgbm90IHlvdXIgZWRpdG9yLlxuICAjIGh0dHBzOi8vZ2l0aHViLmNvbS9jbHV0Y2hza2kvY29mZmVlbGludC9ibG9iL21hc3Rlci9kb2MvdXNlci5tZFxuICAjXG4gICMgSWYgeW91IGluY2x1ZGUgY29mZmVlbGludCBpbiB5b3VyIHByb2plY3QncyBkZXYgZGVwZW5kZW5jaWVzIGl0IHdpbGwgdXNlXG4gICMgdGhhdCB2ZXJzaW9uLiBUaGlzIGlzIHRoZSBzYW1lIGJlaGF2aW9yIHRoZSBjb2ZmZWVsaW50IGNvbW1hbmRsaW5lIGdpdmVzXG4gICMgeW91LlxuICBjb25maWc6IHt9XG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgcmVxdWlyZShcImF0b20tcGFja2FnZS1kZXBzXCIpLmluc3RhbGwoKVxuXG4gIHByb3ZpZGVMaW50ZXI6IC0+XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vcGx1cy1saW50ZXIuY29mZmVlJylcbiJdfQ==