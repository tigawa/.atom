(function() {
  var Path, RailsRspec, Workspace;

  Path = require('path');

  Workspace = require('atom').Workspace;

  RailsRspec = require('../lib/rails-rspec');

  describe('RailsRspec', function() {
    var activationPromise, currentPath, toggleFile;
    activationPromise = null;
    currentPath = function() {
      return atom.workspace.getActiveTextEditor().getPath();
    };
    toggleFile = function(file) {
      var editor;
      atom.workspace.openSync(file);
      editor = atom.workspace.getActiveTextEditor();
      atom.commands.dispatch(atom.views.getView(editor), 'rails-rspec:toggle-spec-file');
      return waitsForPromise(function() {
        return activationPromise;
      });
    };
    beforeEach(function() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'rails-rspec:toggle-spec-file');
      return activationPromise = atom.packages.activatePackage('rails-rspec');
    });
    return describe('when the rails-rspec:toggle-spec-file event is triggered', function() {
      return it('swtiches to spec file', function() {
        toggleFile('app/models/user.rb');
        return runs(function() {
          return expect(currentPath()).toBe(Path.join(__dirname, 'fixtures/spec/models/user_spec.rb'));
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy1yc3BlYy9zcGVjL3JhaWxzLXJzcGVjLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNDLFlBQWEsT0FBQSxDQUFRLE1BQVIsRUFBYixTQURELENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLG9CQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixRQUFBLDBDQUFBO0FBQUEsSUFBQSxpQkFBQSxHQUFvQixJQUFwQixDQUFBO0FBQUEsSUFDQSxXQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQW9DLENBQUMsT0FBckMsQ0FBQSxFQURZO0lBQUEsQ0FEZCxDQUFBO0FBQUEsSUFJQSxVQUFBLEdBQWEsU0FBQyxJQUFELEdBQUE7QUFDWCxVQUFBLE1BQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBZixDQUF3QixJQUF4QixDQUFBLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FEVCxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBQXZCLEVBQW1ELDhCQUFuRCxDQUZBLENBQUE7YUFHQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLGtCQURjO01BQUEsQ0FBaEIsRUFKVztJQUFBLENBSmIsQ0FBQTtBQUFBLElBV0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBdkIsRUFBMkQsOEJBQTNELENBQUEsQ0FBQTthQUNBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixhQUE5QixFQUZYO0lBQUEsQ0FBWCxDQVhBLENBQUE7V0FlQSxRQUFBLENBQVMsMERBQVQsRUFBcUUsU0FBQSxHQUFBO2FBQ25FLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSxVQUFBLENBQVcsb0JBQVgsQ0FBQSxDQUFBO2VBRUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFDSCxNQUFBLENBQU8sV0FBQSxDQUFBLENBQVAsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsbUNBQXJCLENBQTNCLEVBREc7UUFBQSxDQUFMLEVBSDBCO01BQUEsQ0FBNUIsRUFEbUU7SUFBQSxDQUFyRSxFQWhCcUI7RUFBQSxDQUF2QixDQUpBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-rspec/spec/rails-rspec-spec.coffee
