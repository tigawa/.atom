(function() {
  var Color, ColorExpression, createVariableRegExpString;

  Color = require('./color');

  createVariableRegExpString = require('./regexes').createVariableRegExpString;

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
      return createVariableRegExpString(colorVariables);
    };

    ColorExpression.colorExpressionForColorVariables = function(colorVariables) {
      var paletteRegexpString;
      paletteRegexpString = this.colorExpressionRegexpForColorVariables(colorVariables);
      return new ColorExpression({
        name: 'pigments:variables',
        regexpString: paletteRegexpString,
        scopes: ['*'],
        priority: 1,
        handle: function(match, expression, context) {
          var baseColor, name, _;
          _ = match[0], name = match[1];
          if (context.readColorExpression(name) === name) {
            return this.invalid = true;
          }
          baseColor = context.readColor(name);
          this.colorExpression = name;
          this.variables = baseColor != null ? baseColor.variables : void 0;
          if (context.isInvalid(baseColor)) {
            return this.invalid = true;
          }
          return this.rgba = baseColor.rgba;
        }
      });
    };

    function ColorExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.scopes = _arg.scopes, this.priority = _arg.priority, this.handle = _arg.handle;
      this.regexp = new RegExp("^" + this.regexpString + "$");
    }

    ColorExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    ColorExpression.prototype.parse = function(expression, context) {
      var color;
      if (!this.match(expression)) {
        return null;
      }
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref = re.exec(text), match = _ref[0], _ref) {
        lastIndex = re.lastIndex;
        range = [lastIndex - match.length, lastIndex];
        results = {
          range: range,
          match: text.slice(range[0], range[1])
        };
      }
      return results;
    };

    return ColorExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItZXhwcmVzc2lvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0MsNkJBQThCLE9BQUEsQ0FBUSxXQUFSLEVBQTlCLDBCQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxlQUFDLENBQUEseUJBQUQsR0FBNEIsU0FBQyxPQUFELEdBQUE7YUFDMUIsSUFBQyxDQUFBLGdDQUFELENBQWtDLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBQWxDLEVBRDBCO0lBQUEsQ0FBNUIsQ0FBQTs7QUFBQSxJQUdBLGVBQUMsQ0FBQSxzQ0FBRCxHQUF5QyxTQUFDLGNBQUQsR0FBQTthQUN2QywwQkFBQSxDQUEyQixjQUEzQixFQUR1QztJQUFBLENBSHpDLENBQUE7O0FBQUEsSUFNQSxlQUFDLENBQUEsZ0NBQUQsR0FBbUMsU0FBQyxjQUFELEdBQUE7QUFDakMsVUFBQSxtQkFBQTtBQUFBLE1BQUEsbUJBQUEsR0FBc0IsSUFBQyxDQUFBLHNDQUFELENBQXdDLGNBQXhDLENBQXRCLENBQUE7YUFFSSxJQUFBLGVBQUEsQ0FDRjtBQUFBLFFBQUEsSUFBQSxFQUFNLG9CQUFOO0FBQUEsUUFDQSxZQUFBLEVBQWMsbUJBRGQ7QUFBQSxRQUVBLE1BQUEsRUFBUSxDQUFDLEdBQUQsQ0FGUjtBQUFBLFFBR0EsUUFBQSxFQUFVLENBSFY7QUFBQSxRQUlBLE1BQUEsRUFBUSxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLE9BQXBCLEdBQUE7QUFDTixjQUFBLGtCQUFBO0FBQUEsVUFBQyxZQUFELEVBQUcsZUFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/pigments/lib/color-expression.coffee
