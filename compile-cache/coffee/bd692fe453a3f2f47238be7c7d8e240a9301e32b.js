(function() {
  var isFunction, isString, isType;

  isFunction = function(value) {
    return isType(value, 'function');
  };

  isString = function(value) {
    return isType(value, 'string');
  };

  isType = function(value, typeName) {
    var t;
    t = typeof value;
    if (t == null) {
      return false;
    }
    return t === typeName;
  };

  module.exports = {
    isFunction: isFunction,
    isString: isString
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvdHlwZS1oZWxwZXJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0QkFBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTtXQUNYLE1BQUEsQ0FBTyxLQUFQLEVBQWMsVUFBZCxFQURXO0VBQUEsQ0FBYixDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLFNBQUMsS0FBRCxHQUFBO1dBQ1QsTUFBQSxDQUFPLEtBQVAsRUFBYyxRQUFkLEVBRFM7RUFBQSxDQUhYLENBQUE7O0FBQUEsRUFNQSxNQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsUUFBUixHQUFBO0FBQ1AsUUFBQSxDQUFBO0FBQUEsSUFBQSxDQUFBLEdBQUksTUFBQSxDQUFBLEtBQUosQ0FBQTtBQUNBLElBQUEsSUFBb0IsU0FBcEI7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQURBO1dBRUEsQ0FBQSxLQUFLLFNBSEU7RUFBQSxDQU5ULENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsWUFBQSxVQUFEO0FBQUEsSUFBYSxVQUFBLFFBQWI7R0FYakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-plus/lib/type-helpers.coffee
