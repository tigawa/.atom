(function() {
  var SublimeSelectEditorHandler, defaultCfg, inputCfg, key, mouseNumMap, os, packageName, selectKeyMap, value;

  packageName = "Sublime-Style-Column-Selection";

  os = require('os');

  SublimeSelectEditorHandler = require('./editor-handler.coffee');

  defaultCfg = (function() {
    switch (os.platform()) {
      case 'win32':
        return {
          selectKey: 'altKey',
          selectKeyName: 'Alt',
          mouseNum: 1,
          mouseName: "Left"
        };
      case 'darwin':
        return {
          selectKey: 'altKey',
          selectKeyName: 'Alt',
          mouseNum: 1,
          mouseName: "Left"
        };
      case 'linux':
        return {
          selectKey: 'shiftKey',
          selectKeyName: 'Shift',
          mouseNum: 1,
          mouseName: "Left"
        };
      default:
        return {
          selectKey: 'shiftKey',
          selectKeyName: 'Shift',
          mouseNum: 1,
          mouseName: "Left"
        };
    }
  })();

  mouseNumMap = {
    Left: 1,
    Middle: 2,
    Right: 3
  };

  selectKeyMap = {
    Shift: 'shiftKey',
    Alt: 'altKey',
    Ctrl: 'ctrlKey',
    None: null
  };

  inputCfg = defaultCfg;

  module.exports = {
    config: {
      mouseButtonTrigger: {
        title: "Mouse Button",
        description: "The mouse button that will trigger column selection. If empty, the default will be used " + defaultCfg.mouseName + " mouse button.",
        type: 'string',
        "enum": (function() {
          var _results;
          _results = [];
          for (key in mouseNumMap) {
            value = mouseNumMap[key];
            _results.push(key);
          }
          return _results;
        })(),
        "default": defaultCfg.mouseName
      },
      selectKeyTrigger: {
        ttile: "Select Key",
        description: "The key that will trigger column selection. If empty, the default will be used " + defaultCfg.selectKeyName + " key.",
        type: 'string',
        "enum": (function() {
          var _results;
          _results = [];
          for (key in selectKeyMap) {
            value = selectKeyMap[key];
            _results.push(key);
          }
          return _results;
        })(),
        "default": defaultCfg.selectKeyName
      }
    },
    activate: function(state) {
      this.observers = [];
      this.editor_handler = null;
      this.observers.push(atom.config.observe("" + packageName + ".mouseButtonTrigger", (function(_this) {
        return function(newValue) {
          inputCfg.mouseName = newValue;
          return inputCfg.mouseNum = mouseNumMap[newValue];
        };
      })(this)));
      this.observers.push(atom.config.observe("" + packageName + ".selectKeyTrigger", (function(_this) {
        return function(newValue) {
          inputCfg.selectKeyName = newValue;
          return inputCfg.selectKey = selectKeyMap[newValue];
        };
      })(this)));
      this.observers.push(atom.workspace.onDidChangeActivePaneItem(this.switch_editor_handler));
      this.observers.push(atom.workspace.onDidAddPane(this.switch_editor_handler));
      return this.observers.push(atom.workspace.onDidDestroyPane(this.switch_editor_handler));
    },
    deactivate: function() {
      var observer, _i, _len, _ref, _results;
      this.editor_handler.unsubscribe();
      _ref = this.observers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        observer = _ref[_i];
        _results.push(observer.dispose());
      }
      return _results;
    },
    switch_editor_handler: (function(_this) {
      return function() {
        var active_editor, _ref;
        if ((_ref = _this.editor_handler) != null) {
          _ref.unsubscribe();
        }
        active_editor = atom.workspace.getActiveTextEditor();
        if (active_editor) {
          _this.editor_handler = new SublimeSelectEditorHandler(active_editor, inputCfg);
          return _this.editor_handler.subscribe();
        }
      };
    })(this)
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zdWJsaW1lLXN0eWxlLWNvbHVtbi1zZWxlY3Rpb24vbGliL3N1YmxpbWUtc2VsZWN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3R0FBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxnQ0FBZCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLDBCQUFBLEdBQTZCLE9BQUEsQ0FBUSx5QkFBUixDQUg3QixDQUFBOztBQUFBLEVBS0EsVUFBQTtBQUFhLFlBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFQO0FBQUEsV0FDTixPQURNO2VBRVQ7QUFBQSxVQUFBLFNBQUEsRUFBZSxRQUFmO0FBQUEsVUFDQSxhQUFBLEVBQWUsS0FEZjtBQUFBLFVBRUEsUUFBQSxFQUFlLENBRmY7QUFBQSxVQUdBLFNBQUEsRUFBZSxNQUhmO1VBRlM7QUFBQSxXQU1OLFFBTk07ZUFPVDtBQUFBLFVBQUEsU0FBQSxFQUFlLFFBQWY7QUFBQSxVQUNBLGFBQUEsRUFBZSxLQURmO0FBQUEsVUFFQSxRQUFBLEVBQWUsQ0FGZjtBQUFBLFVBR0EsU0FBQSxFQUFlLE1BSGY7VUFQUztBQUFBLFdBV04sT0FYTTtlQVlUO0FBQUEsVUFBQSxTQUFBLEVBQWUsVUFBZjtBQUFBLFVBQ0EsYUFBQSxFQUFlLE9BRGY7QUFBQSxVQUVBLFFBQUEsRUFBZSxDQUZmO0FBQUEsVUFHQSxTQUFBLEVBQWUsTUFIZjtVQVpTO0FBQUE7ZUFpQlQ7QUFBQSxVQUFBLFNBQUEsRUFBZSxVQUFmO0FBQUEsVUFDQSxhQUFBLEVBQWUsT0FEZjtBQUFBLFVBRUEsUUFBQSxFQUFlLENBRmY7QUFBQSxVQUdBLFNBQUEsRUFBZSxNQUhmO1VBakJTO0FBQUE7TUFM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

//# sourceURL=/Users/igawataiichi/.atom/packages/sublime-style-column-selection/lib/sublime-select.coffee
