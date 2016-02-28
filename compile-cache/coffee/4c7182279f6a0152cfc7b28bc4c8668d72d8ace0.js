(function() {
  var Rails;

  Rails = require('./rails');

  module.exports = {
    config: {
      specSearchPaths: {
        type: 'array',
        "default": ['spec', 'fast_spec']
      },
      specDefaultPath: {
        type: 'string',
        "default": 'spec'
      }
    },
    activate: function(state) {
      return atom.commands.add('atom-text-editor', {
        'rails-rspec:toggle-spec-file': (function(_this) {
          return function(event) {
            return _this.toggleSpecFile();
          };
        })(this)
      });
    },
    toggleSpecFile: function() {
      var editor, file, root, specDefault, specPaths;
      editor = atom.workspace.getActiveTextEditor();
      specPaths = atom.config.get('rails-rspec.specSearchPaths');
      specDefault = atom.config.get('rails-rspec.specDefaultPath');
      root = atom.project.getPaths()[0];
      file = new Rails(root, specPaths, specDefault).toggleSpecFile(editor.getPath());
      if (file != null) {
        return atom.workspace.open(file);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy1yc3BlYy9saWIvcmFpbHMtcnNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLEtBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBUixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FBQyxNQUFELEVBQVMsV0FBVCxDQURUO09BREY7QUFBQSxNQUdBLGVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxNQURUO09BSkY7S0FERjtBQUFBLElBUUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUNFO0FBQUEsUUFBQSw4QkFBQSxFQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsS0FBRCxHQUFBO21CQUFXLEtBQUMsQ0FBQSxjQUFELENBQUEsRUFBWDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO09BREYsRUFEUTtJQUFBLENBUlY7QUFBQSxJQVlBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSwwQ0FBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLENBRFosQ0FBQTtBQUFBLE1BRUEsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FGZCxDQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBSC9CLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBVyxJQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVksU0FBWixFQUF1QixXQUF2QixDQUFtQyxDQUFDLGNBQXBDLENBQW1ELE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBbkQsQ0FKWCxDQUFBO0FBS0EsTUFBQSxJQUE2QixZQUE3QjtlQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixJQUFwQixFQUFBO09BTmM7SUFBQSxDQVpoQjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-rspec/lib/rails-rspec.coffee
