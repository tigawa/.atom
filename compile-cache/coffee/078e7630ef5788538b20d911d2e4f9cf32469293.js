(function() {
  var AssetFinderView, BaseFinderView, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  path = require('path');

  BaseFinderView = require('./base-finder-view');

  module.exports = AssetFinderView = (function(_super) {
    __extends(AssetFinderView, _super);

    function AssetFinderView() {
      return AssetFinderView.__super__.constructor.apply(this, arguments);
    }

    AssetFinderView.prototype.populate = function() {
      var dir, editor, line, result;
      this.displayFiles.length = 0;
      editor = atom.workspace.getActiveTextEditor();
      dir = path.dirname(editor.getPath());
      line = editor.getLastCursor().getCurrentBufferLine();
      if (line.indexOf("require_tree") !== -1) {
        result = line.match(/require_tree\s*([a-zA-Z0-9_\-\./]+)\s*$/);
        this.loadFolder(path.join(dir, result[1]), true);
      } else if (line.indexOf("require_directory") !== -1) {
        result = line.match(/require_directory\s*([a-zA-Z0-9_\-\./]+)\s*$/);
        this.loadFolder(path.join(dir, result[1]));
      }
      return this.setItems(this.displayFiles);
    };

    AssetFinderView.prototype.loadFolder = function(folderPath, recursive) {
      var asset, fullPath, stats, _i, _len, _ref, _results;
      if (recursive == null) {
        recursive = false;
      }
      _ref = fs.readdirSync(folderPath);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        asset = _ref[_i];
        fullPath = path.join(folderPath, asset);
        stats = fs.statSync(fullPath);
        if (stats.isDirectory() && recursive === true) {
          _results.push(this.loadFolder(fullPath));
        } else if (stats.isFile()) {
          _results.push(this.displayFiles.push(fullPath));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return AssetFinderView;

  })(BaseFinderView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy10cmFuc3BvcnRlci9saWIvYXNzZXQtZmluZGVyLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBSGpCLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDhCQUFBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixVQUFBLHlCQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsR0FBdUIsQ0FBdkIsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUZULENBQUE7QUFBQSxNQUdBLEdBQUEsR0FBTSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYixDQUhOLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxNQUFNLENBQUMsYUFBUCxDQUFBLENBQXNCLENBQUMsb0JBQXZCLENBQUEsQ0FKUCxDQUFBO0FBS0EsTUFBQSxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsY0FBYixDQUFBLEtBQWtDLENBQUEsQ0FBckM7QUFDRSxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLHlDQUFYLENBQVQsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBZSxNQUFPLENBQUEsQ0FBQSxDQUF0QixDQUFaLEVBQXVDLElBQXZDLENBREEsQ0FERjtPQUFBLE1BR0ssSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLG1CQUFiLENBQUEsS0FBdUMsQ0FBQSxDQUExQztBQUNILFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsOENBQVgsQ0FBVCxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLE1BQU8sQ0FBQSxDQUFBLENBQXRCLENBQVosQ0FEQSxDQURHO09BUkw7YUFZQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxZQUFYLEVBYlE7SUFBQSxDQUFWLENBQUE7O0FBQUEsOEJBZUEsVUFBQSxHQUFZLFNBQUMsVUFBRCxFQUFhLFNBQWIsR0FBQTtBQUNWLFVBQUEsZ0RBQUE7O1FBRHVCLFlBQVk7T0FDbkM7QUFBQTtBQUFBO1dBQUEsMkNBQUE7eUJBQUE7QUFDRSxRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLFVBQVYsRUFBc0IsS0FBdEIsQ0FBWCxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsRUFBRSxDQUFDLFFBQUgsQ0FBWSxRQUFaLENBRFIsQ0FBQTtBQUVBLFFBQUEsSUFBRyxLQUFLLENBQUMsV0FBTixDQUFBLENBQUEsSUFBd0IsU0FBQSxLQUFhLElBQXhDO3dCQUNFLElBQUMsQ0FBQSxVQUFELENBQVksUUFBWixHQURGO1NBQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxNQUFOLENBQUEsQ0FBSDt3QkFDSCxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsUUFBbkIsR0FERztTQUFBLE1BQUE7Z0NBQUE7U0FMUDtBQUFBO3NCQURVO0lBQUEsQ0FmWixDQUFBOzsyQkFBQTs7S0FENEIsZUFOOUIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-transporter/lib/asset-finder-view.coffee
