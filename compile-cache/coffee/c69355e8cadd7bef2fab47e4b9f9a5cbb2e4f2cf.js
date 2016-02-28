(function() {
  var JapaneseWrapManager;

  JapaneseWrapManager = require('./japanese-wrap-manager');

  module.exports = {
    japaneseWrapManager: null,
    config: {
      characterWidth: {
        type: 'object',
        properties: {
          greekAndCoptic: {
            title: 'ギリシャ文字及びコプト文字の幅',
            type: 'integer',
            "default": 2,
            minimum: 1,
            maximum: 2
          },
          cyrillic: {
            title: 'キリル文字の幅',
            type: 'integer',
            "default": 2,
            minimum: 1,
            maximum: 2
          }
        }
      },
      lineBreakingRule: {
        type: 'object',
        properties: {
          japanese: {
            title: '日本語禁則処理を行う',
            type: 'boolean',
            "default": true
          },
          halfwidthKatakana: {
            title: '半角カタカナ(JIS X 0201 片仮名図形文字集合)を禁則処理に含める',
            type: 'boolean',
            "default": true
          },
          ideographicSpaceAsWihteSpace: {
            title: '和文間隔(U+3000)を空白文字に含める',
            type: 'boolean',
            "default": false
          }
        }
      }
    },
    activate: function(state) {
      this.japaneseWrapManager = new JapaneseWrapManager;
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.japaneseWrapManager.overwriteFindWrapColumn(editor.displayBuffer);
        };
      })(this));
    },
    deactivate: function() {
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.japaneseWrapManager.restoreFindWrapColumn(editor.displayBuffer);
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qYXBhbmVzZS13cmFwL2xpYi9qYXBhbmVzZS13cmFwLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTs7QUFBQSxFQUFBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQUF0QixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsbUJBQUEsRUFBcUIsSUFBckI7QUFBQSxJQUVBLE1BQUEsRUFhRTtBQUFBLE1BQUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsVUFBQSxFQUNFO0FBQUEsVUFBQSxjQUFBLEVBQ0U7QUFBQSxZQUFBLEtBQUEsRUFBTyxpQkFBUDtBQUFBLFlBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxZQUVBLFNBQUEsRUFBUyxDQUZUO0FBQUEsWUFHQSxPQUFBLEVBQVMsQ0FIVDtBQUFBLFlBSUEsT0FBQSxFQUFTLENBSlQ7V0FERjtBQUFBLFVBTUEsUUFBQSxFQUNFO0FBQUEsWUFBQSxLQUFBLEVBQU8sU0FBUDtBQUFBLFlBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxZQUVBLFNBQUEsRUFBUyxDQUZUO0FBQUEsWUFHQSxPQUFBLEVBQVMsQ0FIVDtBQUFBLFlBSUEsT0FBQSxFQUFTLENBSlQ7V0FQRjtTQUZGO09BREY7QUFBQSxNQWtCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsVUFBQSxFQUNFO0FBQUEsVUFBQSxRQUFBLEVBQ0U7QUFBQSxZQUFBLEtBQUEsRUFBTyxZQUFQO0FBQUEsWUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFlBRUEsU0FBQSxFQUFTLElBRlQ7V0FERjtBQUFBLFVBSUEsaUJBQUEsRUFDRTtBQUFBLFlBQUEsS0FBQSxFQUFPLHVDQUFQO0FBQUEsWUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFlBRUEsU0FBQSxFQUFTLElBRlQ7V0FMRjtBQUFBLFVBUUEsNEJBQUEsRUFDRTtBQUFBLFlBQUEsS0FBQSxFQUFPLHVCQUFQO0FBQUEsWUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFlBRUEsU0FBQSxFQUFTLEtBRlQ7V0FURjtTQUZGO09BbkJGO0tBZkY7QUFBQSxJQWlEQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixHQUFBLENBQUEsbUJBQXZCLENBQUE7YUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDaEMsS0FBQyxDQUFBLG1CQUFtQixDQUFDLHVCQUFyQixDQUE2QyxNQUFNLENBQUMsYUFBcEQsRUFEZ0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQUZRO0lBQUEsQ0FqRFY7QUFBQSxJQXdEQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQ2hDLEtBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxxQkFBckIsQ0FBMkMsTUFBTSxDQUFDLGFBQWxELEVBRGdDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUFEVTtJQUFBLENBeERaO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/igawataiichi/.atom/packages/japanese-wrap/lib/japanese-wrap.coffee
