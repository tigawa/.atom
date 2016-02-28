(function() {
  var GlobalVimState;

  module.exports = GlobalVimState = (function() {
    function GlobalVimState() {}

    GlobalVimState.prototype.registers = {};

    GlobalVimState.prototype.searchHistory = [];

    GlobalVimState.prototype.currentSearch = {};

    GlobalVimState.prototype.currentFind = null;

    return GlobalVimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvZ2xvYmFsLXZpbS1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007Z0NBQ0o7O0FBQUEsNkJBQUEsU0FBQSxHQUFXLEVBQVgsQ0FBQTs7QUFBQSw2QkFDQSxhQUFBLEdBQWUsRUFEZixDQUFBOztBQUFBLDZCQUVBLGFBQUEsR0FBZSxFQUZmLENBQUE7O0FBQUEsNkJBR0EsV0FBQSxHQUFhLElBSGIsQ0FBQTs7MEJBQUE7O01BRkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/vim-mode/lib/global-vim-state.coffee
