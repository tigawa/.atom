(function() {
  var ConfigPlus;

  ConfigPlus = require('atom-config-plus');

  module.exports = new ConfigPlus('cursor-history', {
    max: {
      order: 11,
      type: 'integer',
      "default": 100,
      minimum: 1,
      description: "number of history to remember"
    },
    rowDeltaToRemember: {
      order: 12,
      type: 'integer',
      "default": 4,
      minimum: 0,
      description: "Only if dirrerence of cursor row exceed this value, cursor position is saved to history"
    },
    excludeClosedBuffer: {
      order: 13,
      type: 'boolean',
      "default": false,
      description: "Don't open closed Buffer on history excursion"
    },
    searchAllPanes: {
      order: 31,
      type: 'boolean',
      "default": true,
      description: "Land to another pane or stick to same pane"
    },
    flashOnLand: {
      order: 32,
      type: 'boolean',
      "default": false,
      description: "flash cursor line on land"
    },
    flashDurationMilliSeconds: {
      order: 33,
      type: 'integer',
      "default": 150,
      description: "Duration for flash"
    },
    flashColor: {
      order: 34,
      type: 'string',
      "default": 'info',
      "enum": ['info', 'success', 'warning', 'error', 'highlight', 'selected'],
      description: 'flash color style, correspoinding to @background-color-{flashColor}: see `styleguide:show`'
    },
    flashType: {
      order: 35,
      type: 'string',
      "default": 'line',
      "enum": ['line', 'word', 'point'],
      description: 'Range to be flashed'
    },
    ignoreCommands: {
      order: 36,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": ['command-palette:toggle'],
      description: 'list of commands to exclude from history tracking.'
    },
    debug: {
      order: 99,
      type: 'boolean',
      "default": false,
      description: "Output history on console.log"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvc2V0dGluZ3MuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFVBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGtCQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsVUFBQSxDQUFXLGdCQUFYLEVBQ25CO0FBQUEsSUFBQSxHQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxFQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLE1BRUEsU0FBQSxFQUFTLEdBRlQ7QUFBQSxNQUdBLE9BQUEsRUFBUyxDQUhUO0FBQUEsTUFJQSxXQUFBLEVBQWEsK0JBSmI7S0FERjtBQUFBLElBTUEsa0JBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLEVBQVA7QUFBQSxNQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsQ0FGVDtBQUFBLE1BR0EsT0FBQSxFQUFTLENBSFQ7QUFBQSxNQUlBLFdBQUEsRUFBYSx5RkFKYjtLQVBGO0FBQUEsSUFZQSxtQkFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sRUFBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxLQUZUO0FBQUEsTUFHQSxXQUFBLEVBQWEsK0NBSGI7S0FiRjtBQUFBLElBaUJBLGNBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLEVBQVA7QUFBQSxNQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsSUFGVDtBQUFBLE1BR0EsV0FBQSxFQUFhLDRDQUhiO0tBbEJGO0FBQUEsSUFzQkEsV0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sRUFBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxLQUZUO0FBQUEsTUFHQSxXQUFBLEVBQWEsMkJBSGI7S0F2QkY7QUFBQSxJQTJCQSx5QkFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sRUFBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxHQUZUO0FBQUEsTUFHQSxXQUFBLEVBQWEsb0JBSGI7S0E1QkY7QUFBQSxJQWdDQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxFQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLE1BRUEsU0FBQSxFQUFTLE1BRlQ7QUFBQSxNQUdBLE1BQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFNBQXBCLEVBQStCLE9BQS9CLEVBQXdDLFdBQXhDLEVBQXFELFVBQXJELENBSE47QUFBQSxNQUlBLFdBQUEsRUFBYSw0RkFKYjtLQWpDRjtBQUFBLElBc0NBLFNBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLEVBQVA7QUFBQSxNQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsTUFGVDtBQUFBLE1BR0EsTUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsT0FBakIsQ0FITjtBQUFBLE1BSUEsV0FBQSxFQUFhLHFCQUpiO0tBdkNGO0FBQUEsSUE0Q0EsY0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sRUFBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLE9BRE47QUFBQSxNQUVBLEtBQUEsRUFBTztBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47T0FGUDtBQUFBLE1BR0EsU0FBQSxFQUFTLENBQUMsd0JBQUQsQ0FIVDtBQUFBLE1BSUEsV0FBQSxFQUFhLG9EQUpiO0tBN0NGO0FBQUEsSUFrREEsS0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sRUFBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxLQUZUO0FBQUEsTUFHQSxXQUFBLEVBQWEsK0JBSGI7S0FuREY7R0FEbUIsQ0FGckIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/cursor-history/lib/settings.coffee
