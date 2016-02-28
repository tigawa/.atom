(function() {
  var BaseFinderView, RailsUtil, ViewFinderView, fs, path, pluralize, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  path = require('path');

  pluralize = require('pluralize');

  _ = require('underscore');

  BaseFinderView = require('./base-finder-view');

  RailsUtil = require('./rails-util');

  module.exports = ViewFinderView = (function(_super) {
    __extends(ViewFinderView, _super);

    function ViewFinderView() {
      return ViewFinderView.__super__.constructor.apply(this, arguments);
    }

    _.extend(ViewFinderView.prototype, RailsUtil.prototype);

    ViewFinderView.prototype.populate = function() {
      var basename, currentFile, viewDir, viewFile, viewPath, _i, _len, _ref;
      this.displayFiles.length = 0;
      currentFile = atom.workspace.getActiveTextEditor().getPath();
      if (this.isController(currentFile)) {
        viewDir = currentFile.replace('controllers', 'views').replace(/_controller\.rb$/, '');
      } else if (this.isModel(currentFile)) {
        basename = path.basename(currentFile, '.rb');
        viewDir = currentFile.replace('models', 'views').replace(basename, pluralize(basename)).replace(".rb", "");
      } else if (this.isMailer(currentFile)) {
        viewDir = currentFile.replace('mailers', 'views').replace(/\.rb$/, '');
      } else {
        return;
      }
      if (!fs.existsSync(viewDir)) {
        return;
      }
      _ref = fs.readdirSync(viewDir);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        viewFile = _ref[_i];
        viewPath = path.join(viewDir, viewFile);
        if (fs.statSync(viewPath).isFile()) {
          this.displayFiles.push(viewPath);
        }
      }
      return this.setItems(this.displayFiles);
    };

    return ViewFinderView;

  })(BaseFinderView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy10cmFuc3BvcnRlci9saWIvdmlldy1maW5kZXItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBRlosQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUhKLENBQUE7O0FBQUEsRUFLQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUixDQUxqQixDQUFBOztBQUFBLEVBTUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBTlosQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxDQUFDLENBQUMsTUFBRixDQUFTLGNBQUksQ0FBQSxTQUFiLEVBQWlCLFNBQVMsQ0FBQSxTQUExQixDQUFBLENBQUE7O0FBQUEsNkJBRUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsa0VBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUF1QixDQUF2QixDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQW9DLENBQUMsT0FBckMsQ0FBQSxDQURkLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBQyxDQUFBLFlBQUQsQ0FBYyxXQUFkLENBQUg7QUFDRSxRQUFBLE9BQUEsR0FBVSxXQUFXLENBQUMsT0FBWixDQUFvQixhQUFwQixFQUFtQyxPQUFuQyxDQUNXLENBQUMsT0FEWixDQUNvQixrQkFEcEIsRUFDd0MsRUFEeEMsQ0FBVixDQURGO09BQUEsTUFHSyxJQUFHLElBQUMsQ0FBQSxPQUFELENBQVMsV0FBVCxDQUFIO0FBQ0gsUUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxXQUFkLEVBQTJCLEtBQTNCLENBQVgsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLFdBQVcsQ0FBQyxPQUFaLENBQW9CLFFBQXBCLEVBQThCLE9BQTlCLENBQ1csQ0FBQyxPQURaLENBQ29CLFFBRHBCLEVBQzhCLFNBQUEsQ0FBVSxRQUFWLENBRDlCLENBRVcsQ0FBQyxPQUZaLENBRW9CLEtBRnBCLEVBRTJCLEVBRjNCLENBRFYsQ0FERztPQUFBLE1BS0EsSUFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLFdBQVYsQ0FBSDtBQUNILFFBQUEsT0FBQSxHQUFVLFdBQVcsQ0FBQyxPQUFaLENBQW9CLFNBQXBCLEVBQStCLE9BQS9CLENBQ1csQ0FBQyxPQURaLENBQ29CLE9BRHBCLEVBQzZCLEVBRDdCLENBQVYsQ0FERztPQUFBLE1BQUE7QUFJSCxjQUFBLENBSkc7T0FWTDtBQWdCQSxNQUFBLElBQUEsQ0FBQSxFQUFnQixDQUFDLFVBQUgsQ0FBYyxPQUFkLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FoQkE7QUFpQkE7QUFBQSxXQUFBLDJDQUFBOzRCQUFBO0FBQ0UsUUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLFFBQW5CLENBQVgsQ0FBQTtBQUNBLFFBQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLFFBQVosQ0FBcUIsQ0FBQyxNQUF0QixDQUFBLENBQUg7QUFDRSxVQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsSUFBZCxDQUFtQixRQUFuQixDQUFBLENBREY7U0FGRjtBQUFBLE9BakJBO2FBc0JBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFlBQVgsRUF2QlE7SUFBQSxDQUZWLENBQUE7OzBCQUFBOztLQUQyQixlQVQ3QixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-transporter/lib/view-finder-view.coffee
