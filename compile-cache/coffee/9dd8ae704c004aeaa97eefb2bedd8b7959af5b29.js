(function() {
  var Point, TagParser;

  Point = require('atom').Point;

  module.exports = TagParser = (function() {
    function TagParser(tags, grammar) {
      this.tags = tags;
      this.grammar = grammar;
      if (this.grammar === 'source.c++' || this.grammar === 'source.c' || this.grammar === 'source.cpp') {
        this.splitSymbol = '::';
      } else {
        this.splitSymbol = '.';
      }
    }

    TagParser.prototype.splitParentTag = function(parentTag) {
      var index;
      index = parentTag.indexOf(':');
      return {
        type: parentTag.substr(0, index),
        parent: parentTag.substr(index + 1)
      };
    };

    TagParser.prototype.splitNameTag = function(nameTag) {
      var index;
      index = nameTag.lastIndexOf(this.splitSymbol);
      if (index >= 0) {
        return nameTag.substr(index + this.splitSymbol.length);
      } else {
        return nameTag;
      }
    };

    TagParser.prototype.buildMissedParent = function(parents) {
      var i, name, now, parentTags, pre, type, _i, _len, _ref, _ref1, _results;
      parentTags = Object.keys(parents);
      parentTags.sort((function(_this) {
        return function(a, b) {
          var nameA, nameB, typeA, typeB, _ref, _ref1;
          _ref = _this.splitParentTag(a), typeA = _ref.typeA, nameA = _ref.parent;
          _ref1 = _this.splitParentTag(b), typeB = _ref1.typeB, nameB = _ref1.parent;
          if (nameA < nameB) {
            return -1;
          } else if (nameA > nameB) {
            return 1;
          } else {
            return 0;
          }
        };
      })(this));
      _results = [];
      for (i = _i = 0, _len = parentTags.length; _i < _len; i = ++_i) {
        now = parentTags[i];
        _ref = this.splitParentTag(now), type = _ref.type, name = _ref.parent;
        if (parents[now] === null) {
          parents[now] = {
            name: name,
            type: type,
            position: null,
            parent: null
          };
          this.tags.push(parents[now]);
          if (i >= 1) {
            pre = parentTags[i - 1];
            _ref1 = this.splitParentTag(pre), type = _ref1.type, name = _ref1.parent;
            if (now.indexOf(name) >= 0) {
              parents[now].parent = pre;
              _results.push(parents[now].name = this.splitNameTag(parents[now].name));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    TagParser.prototype.parse = function() {
      var key, parent, parents, roots, tag, type, types, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;
      roots = [];
      parents = {};
      types = {};
      this.tags.sort((function(_this) {
        return function(a, b) {
          return a.position.row - b.position.row;
        };
      })(this));
      _ref = this.tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        if (tag.parent) {
          parents[tag.parent] = null;
        }
      }
      _ref1 = this.tags;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tag = _ref1[_j];
        if (tag.parent) {
          _ref2 = this.splitParentTag(tag.parent), type = _ref2.type, parent = _ref2.parent;
          key = tag.type + ':' + parent + this.splitSymbol + tag.name;
        } else {
          key = tag.type + ':' + tag.name;
        }
        parents[key] = tag;
      }
      this.buildMissedParent(parents);
      _ref3 = this.tags;
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        tag = _ref3[_k];
        if (tag.parent) {
          parent = parents[tag.parent];
          if (!parent.position) {
            parent.position = new Point(tag.position.row - 1);
          }
        }
      }
      this.tags.sort((function(_this) {
        return function(a, b) {
          return a.position.row - b.position.row;
        };
      })(this));
      _ref4 = this.tags;
      for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
        tag = _ref4[_l];
        tag.label = tag.name;
        tag.icon = "icon-" + tag.type;
        if (tag.parent) {
          parent = parents[tag.parent];
          if (parent.children == null) {
            parent.children = [];
          }
          parent.children.push(tag);
        } else {
          roots.push(tag);
        }
        types[tag.type] = null;
      }
      return {
        root: {
          label: 'root',
          icon: null,
          children: roots
        },
        types: Object.keys(types)
      };
    };

    TagParser.prototype.getNearestTag = function(row) {
      var left, mid, midRow, nearest, right;
      left = 0;
      right = this.tags.length - 1;
      while (left <= right) {
        mid = Math.floor((left + right) / 2);
        midRow = this.tags[mid].position.row;
        if (row < midRow) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
      nearest = left - 1;
      return this.tags[nearest];
    };

    return TagParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvdGFnLXBhcnNlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0JBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDUTtBQUNTLElBQUEsbUJBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFSLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FEWCxDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFELEtBQVksWUFBWixJQUE0QixJQUFDLENBQUEsT0FBRCxLQUFZLFVBQXhDLElBQ0EsSUFBQyxDQUFBLE9BQUQsS0FBWSxZQURmO0FBRUUsUUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQWYsQ0FGRjtPQUFBLE1BQUE7QUFJRSxRQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBZixDQUpGO09BTFc7SUFBQSxDQUFiOztBQUFBLHdCQVdBLGNBQUEsR0FBZ0IsU0FBQyxTQUFELEdBQUE7QUFDZCxVQUFBLEtBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxTQUFTLENBQUMsT0FBVixDQUFrQixHQUFsQixDQUFSLENBQUE7YUFFQTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQVMsQ0FBQyxNQUFWLENBQWlCLENBQWpCLEVBQW9CLEtBQXBCLENBQU47QUFBQSxRQUNBLE1BQUEsRUFBUSxTQUFTLENBQUMsTUFBVixDQUFpQixLQUFBLEdBQU0sQ0FBdkIsQ0FEUjtRQUhjO0lBQUEsQ0FYaEIsQ0FBQTs7QUFBQSx3QkFpQkEsWUFBQSxHQUFjLFNBQUMsT0FBRCxH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

//# sourceURL=/Users/igawataiichi/.atom/packages/symbols-tree-view/lib/tag-parser.coffee
