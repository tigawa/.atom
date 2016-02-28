(function() {
  module.exports = {
    config: {
      forceInline: {
        title: 'Force Inline',
        description: 'Elements in this comma delimited list will render their closing tags on the same line, even if they are block by default. Use * to force all closing tags to render inline',
        type: 'array',
        "default": ['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      forceBlock: {
        title: 'Force Block',
        description: 'Elements in this comma delimited list will render their closing tags after a tabbed line, even if they are inline by default. Values are ignored if Force Inline is *',
        type: 'array',
        "default": ['head']
      },
      neverClose: {
        title: 'Never Close Elements',
        description: 'Comma delimited list of elements to never close',
        type: 'array',
        "default": ['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr']
      },
      makeNeverCloseSelfClosing: {
        title: 'Make Never Close Elements Self-Closing',
        description: 'Closes elements with " />" (ie &lt;br&gt; becomes &lt;br /&gt;)',
        type: 'boolean',
        "default": true
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY2xvc2UtaHRtbC9saWIvY29uZmlndXJhdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtBQUFBLElBQUEsTUFBQSxFQUNJO0FBQUEsTUFBQSxXQUFBLEVBQ0k7QUFBQSxRQUFBLEtBQUEsRUFBTyxjQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsNEtBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxPQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsQ0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixJQUFoQixFQUFzQixJQUF0QixFQUE0QixJQUE1QixFQUFrQyxJQUFsQyxFQUF3QyxJQUF4QyxDQUhUO09BREo7QUFBQSxNQUtBLFVBQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSx1S0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLE9BRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxDQUFDLE1BQUQsQ0FIVDtPQU5KO0FBQUEsTUFVQSxVQUFBLEVBQ0k7QUFBQSxRQUFBLEtBQUEsRUFBTyxzQkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLGlEQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sT0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxLQUFiLEVBQW9CLE9BQXBCLEVBQTZCLE1BQTdCLEVBQXFDLE1BQXJDLEVBQTZDLE1BQTdDLEVBQXFELE1BQXJELEVBQTZELEtBQTdELEVBQW9FLFNBQXBFLEVBQStFLE9BQS9FLEVBQXdGLFFBQXhGLEVBQWtHLE9BQWxHLEVBQTJHLFFBQTNHLEVBQXFILE9BQXJILEVBQThILEtBQTlILENBSFQ7T0FYSjtBQUFBLE1BZUEseUJBQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLHdDQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsaUVBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtPQWhCSjtLQURKO0dBREosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/autoclose-html/lib/configuration.coffee
