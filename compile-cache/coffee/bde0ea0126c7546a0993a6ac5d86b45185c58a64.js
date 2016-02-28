(function() {
  var MyClass, SomeModule,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SomeModule = require('some-module');

  MyClass = (function(_super) {
    __extends(MyClass, _super);

    function MyClass() {}

    MyClass.prototype.quicksort = function() {};

    return MyClass;

  })(SomeModule);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2ZpeHR1cmVzL3NhbXBsZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUixDQUFiLENBQUE7O0FBQUEsRUFFTTtBQUNKLDhCQUFBLENBQUE7O0FBQWEsSUFBQSxpQkFBQSxHQUFBLENBQWI7O0FBQUEsc0JBRUEsU0FBQSxHQUFXLFNBQUEsR0FBQSxDQUZYLENBQUE7O21CQUFBOztLQURvQixXQUZ0QixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/spec/fixtures/sample.coffee
