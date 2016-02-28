(function() {
  var BaseFinderView, ViewFinderView, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  path = require('path');

  BaseFinderView = require('./base-finder-view');

  module.exports = ViewFinderView = (function(_super) {
    __extends(ViewFinderView, _super);

    function ViewFinderView() {
      return ViewFinderView.__super__.constructor.apply(this, arguments);
    }

    ViewFinderView.prototype.populate = function() {
      var filePath, migrationDir, migrationFile, _i, _ref;
      this.displayFiles.length = 0;
      migrationDir = path.join(atom.project.getPaths()[0], "db", "migrate");
      if (!fs.existsSync(migrationDir)) {
        return;
      }
      _ref = fs.readdirSync(migrationDir);
      for (_i = _ref.length - 1; _i >= 0; _i += -1) {
        migrationFile = _ref[_i];
        filePath = path.join(migrationDir, migrationFile);
        if (fs.statSync(filePath).isFile()) {
          this.displayFiles.push(filePath);
        }
      }
      return this.setItems(this.displayFiles);
    };

    return ViewFinderView;

  })(BaseFinderView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy10cmFuc3BvcnRlci9saWIvbWlncmF0aW9uLWZpbmRlci12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUixDQUhqQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw2QkFBQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSwrQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLEdBQXVCLENBQXZCLENBQUE7QUFBQSxNQUNBLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFsQyxFQUFzQyxJQUF0QyxFQUE0QyxTQUE1QyxDQURmLENBQUE7QUFHQSxNQUFBLElBQUEsQ0FBQSxFQUFnQixDQUFDLFVBQUgsQ0FBYyxZQUFkLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUlBO0FBQUEsV0FBQSx1Q0FBQTtpQ0FBQTtBQUNFLFFBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixhQUF4QixDQUFYLENBQUE7QUFDQSxRQUFBLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBWSxRQUFaLENBQXFCLENBQUMsTUFBdEIsQ0FBQSxDQUFIO0FBQ0UsVUFBQSxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsUUFBbkIsQ0FBQSxDQURGO1NBRkY7QUFBQSxPQUpBO2FBU0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsWUFBWCxFQVZRO0lBQUEsQ0FBVixDQUFBOzswQkFBQTs7S0FEMkIsZUFON0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-transporter/lib/migration-finder-view.coffee
