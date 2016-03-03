(function() {
  var JumpyView;

  JumpyView = require('./jumpy-view');

  module.exports = {
    jumpyView: null,
    config: {
      fontSize: {
        description: 'The font size of jumpy labels.',
        type: 'number',
        "default": .75,
        minimum: 0,
        maximum: 1
      },
      highContrast: {
        description: 'This will display a high contrast label, usually green.  It is dynamic per theme.',
        type: 'boolean',
        "default": false
      },
      useHomingBeaconEffectOnJumps: {
        description: 'This will animate a short lived homing beacon upon jump.  It is *temporarily* not working due to architectural changes in Atom.',
        type: 'boolean',
        "default": true
      },
      matchPattern: {
        description: 'Jumpy will create labels based on this pattern.',
        type: 'string',
        "default": '([A-Z]+([0-9a-z])*)|[a-z0-9]{2,}'
      }
    },
    activate: function(state) {
      return this.jumpyView = new JumpyView(state.jumpyViewState);
    },
    deactivate: function() {
      this.jumpyView.destroy();
      return this.jumpyView = null;
    },
    serialize: function() {
      return {
        jumpyViewState: this.jumpyView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qdW1weS9saWIvanVtcHkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFNBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FBWixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtBQUFBLElBQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxJQUNBLE1BQUEsRUFDSTtBQUFBLE1BQUEsUUFBQSxFQUNJO0FBQUEsUUFBQSxXQUFBLEVBQWEsZ0NBQWI7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsR0FGVDtBQUFBLFFBR0EsT0FBQSxFQUFTLENBSFQ7QUFBQSxRQUlBLE9BQUEsRUFBUyxDQUpUO09BREo7QUFBQSxNQU1BLFlBQUEsRUFDSTtBQUFBLFFBQUEsV0FBQSxFQUFhLG1GQUFiO0FBQUEsUUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLEtBSFQ7T0FQSjtBQUFBLE1BV0EsNEJBQUEsRUFDSTtBQUFBLFFBQUEsV0FBQSxFQUFhLGlJQUFiO0FBQUEsUUFHQSxJQUFBLEVBQU0sU0FITjtBQUFBLFFBSUEsU0FBQSxFQUFTLElBSlQ7T0FaSjtBQUFBLE1BaUJBLFlBQUEsRUFDSTtBQUFBLFFBQUEsV0FBQSxFQUFhLGlEQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsU0FBQSxFQUFTLGtDQUZUO09BbEJKO0tBRko7QUFBQSxJQXdCQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDTixJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FBVSxLQUFLLENBQUMsY0FBaEIsRUFEWDtJQUFBLENBeEJWO0FBQUEsSUEyQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUZMO0lBQUEsQ0EzQlo7QUFBQSxJQStCQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1A7QUFBQSxRQUFBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLENBQUEsQ0FBaEI7UUFETztJQUFBLENBL0JYO0dBSEosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/jumpy/lib/jumpy.coffee
