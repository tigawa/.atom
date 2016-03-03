(function() {
  var CompositeDisposable, Disposable, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = function() {
    var FakeEditor, HighlightedAreaView, MinimapHighlightSelectedView, highlightSelected, highlightSelectedPackage;
    highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
    highlightSelected = require(highlightSelectedPackage.path);
    HighlightedAreaView = require(highlightSelectedPackage.path + '/lib/highlighted-area-view');
    FakeEditor = (function() {
      function FakeEditor(minimap) {
        this.minimap = minimap;
      }

      FakeEditor.prototype.getActiveMinimap = function() {
        return this.minimap.getActiveMinimap();
      };

      FakeEditor.prototype.getActiveTextEditor = function() {
        var _ref1;
        return (_ref1 = this.getActiveMinimap()) != null ? _ref1.getTextEditor() : void 0;
      };

      ['markBufferRange', 'scanInBufferRange', 'getEofBufferPosition', 'getSelections', 'getLastSelection', 'bufferRangeForBufferRow', 'getTextInBufferRange'].forEach(function(key) {
        return FakeEditor.prototype[key] = function() {
          var _ref1;
          return (_ref1 = this.getActiveTextEditor()) != null ? _ref1[key].apply(_ref1, arguments) : void 0;
        };
      });

      ['onDidAddSelection', 'onDidChangeSelectionRange'].forEach(function(key) {
        return FakeEditor.prototype[key] = function() {
          var _ref1, _ref2;
          return (_ref1 = (_ref2 = this.getActiveTextEditor()) != null ? _ref2[key].apply(_ref2, arguments) : void 0) != null ? _ref1 : new Disposable(function() {});
        };
      });

      ['decorateMarker'].forEach(function(key) {
        return FakeEditor.prototype[key] = function() {
          var _ref1;
          return (_ref1 = this.getActiveMinimap())[key].apply(_ref1, arguments);
        };
      });

      return FakeEditor;

    })();
    return MinimapHighlightSelectedView = (function(_super) {
      __extends(MinimapHighlightSelectedView, _super);

      function MinimapHighlightSelectedView(minimap) {
        this.fakeEditor = new FakeEditor(minimap);
        MinimapHighlightSelectedView.__super__.constructor.apply(this, arguments);
      }

      MinimapHighlightSelectedView.prototype.getActiveEditor = function() {
        return this.fakeEditor;
      };

      MinimapHighlightSelectedView.prototype.handleSelection = function() {
        var editor, range, regex, regexFlags, regexSearch, result, text;
        if (atom.workspace.getActiveTextEditor() == null) {
          return;
        }
        if (this.fakeEditor.getActiveTextEditor() == null) {
          return;
        }
        this.removeMarkers();
        editor = this.getActiveEditor();
        if (!editor) {
          return;
        }
        if (editor.getLastSelection().isEmpty()) {
          return;
        }
        if (!this.isWordSelected(editor.getLastSelection())) {
          return;
        }
        this.selections = editor.getSelections();
        text = _.escapeRegExp(this.selections[0].getText());
        regex = new RegExp("\\S*\\w*\\b", 'gi');
        result = regex.exec(text);
        if (result == null) {
          return;
        }
        if (result[0].length < atom.config.get('highlight-selected.minimumLength') || result.index !== 0 || result[0] !== result.input) {
          return;
        }
        regexFlags = 'g';
        if (atom.config.get('highlight-selected.ignoreCase')) {
          regexFlags = 'gi';
        }
        range = [[0, 0], editor.getEofBufferPosition()];
        this.ranges = [];
        regexSearch = result[0];
        if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
          regexSearch = "\\b" + regexSearch + "\\b";
        }
        return editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
          return function(result) {
            var className, decoration, marker;
            marker = editor.markBufferRange(result.range);
            className = _this.makeClasses(_this.showHighlightOnSelectedWord(result.range, _this.selections));
            decoration = editor.decorateMarker(marker, {
              type: 'highlight',
              "class": className
            });
            return _this.views.push(marker);
          };
        })(this));
      };

      MinimapHighlightSelectedView.prototype.makeClasses = function(inSelection) {
        var className;
        className = 'highlight-selected';
        if (inSelection) {
          className += ' selected';
        }
        return className;
      };

      MinimapHighlightSelectedView.prototype.subscribeToActiveTextEditor = function() {
        var editor, _ref1;
        if ((_ref1 = this.selectionSubscription) != null) {
          _ref1.dispose();
        }
        this.selectionSubscription = new CompositeDisposable;
        if (editor = this.getActiveEditor()) {
          this.selectionSubscription.add(editor.onDidAddSelection((function(_this) {
            return function() {
              return _this.handleSelection();
            };
          })(this)));
          this.selectionSubscription.add(editor.onDidChangeSelectionRange((function(_this) {
            return function() {
              return _this.handleSelection();
            };
          })(this)));
        }
        return this.handleSelection();
      };

      return MinimapHighlightSelectedView;

    })(HighlightedAreaView);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC9saWIvbWluaW1hcC1oaWdobGlnaHQtc2VsZWN0ZWQtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsMkJBQUEsbUJBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsMEdBQUE7QUFBQSxJQUFBLHdCQUFBLEdBQTJCLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0Isb0JBQS9CLENBQTNCLENBQUE7QUFBQSxJQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUyx3QkFBd0IsQ0FBQyxJQUFsQyxDQUZwQixDQUFBO0FBQUEsSUFHQSxtQkFBQSxHQUFzQixPQUFBLENBQVMsd0JBQXdCLENBQUMsSUFBekIsR0FBZ0MsNEJBQXpDLENBSHRCLENBQUE7QUFBQSxJQUtNO0FBQ1MsTUFBQSxvQkFBRSxPQUFGLEdBQUE7QUFBWSxRQUFYLElBQUMsQ0FBQSxVQUFBLE9BQVUsQ0FBWjtNQUFBLENBQWI7O0FBQUEsMkJBRUEsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO2VBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUFBLEVBQUg7TUFBQSxDQUZsQixDQUFBOztBQUFBLDJCQUlBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUFHLFlBQUEsS0FBQTtnRUFBbUIsQ0FBRSxhQUFyQixDQUFBLFdBQUg7TUFBQSxDQUpyQixDQUFBOztB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

//# sourceURL=/Users/igawataiichi/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected-view.coffee
