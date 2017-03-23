Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vanillaJsx = require('vanilla-jsx');

var _helpers = require('../helpers');

/** @jsx jsx */
exports.default = (0, _vanillaJsx.createClass)({
  renderView(suggestions, selectCallback) {
    let className = 'select-list popover-list';
    if (suggestions.length > 7) {
      className += ' intentions-scroll';
    }

    this.suggestions = suggestions;
    this.suggestionsCount = suggestions.length;
    this.suggestionsIndex = -1;
    this.selectCallback = selectCallback;

    return (0, _vanillaJsx.jsx)(
      'intentions-list',
      { 'class': className, id: 'intentions-list' },
      (0, _vanillaJsx.jsx)(
        'ol',
        { 'class': 'list-group', ref: 'list' },
        suggestions.map(function (suggestion) {
          return (0, _vanillaJsx.jsx)(
            'li',
            null,
            (0, _vanillaJsx.jsx)(
              'span',
              { 'class': suggestion[_helpers.$class], 'on-click': function () {
                  selectCallback(suggestion);
                } },
              suggestion.title
            )
          );
        })
      )
    );
  },
  move(movement) {
    let newIndex = this.suggestionsIndex;

    if (movement === 'up') {
      newIndex--;
    } else if (movement === 'down') {
      newIndex++;
    } else if (movement === 'move-to-top') {
      newIndex = 0;
    } else if (movement === 'move-to-bottom') {
      newIndex = this.suggestionsCount;
    }
    // TODO: Implement page up/down
    newIndex = newIndex % this.suggestionsCount;
    if (newIndex < 0) {
      newIndex = this.suggestionsCount + newIndex;
    }
    this.selectIndex(newIndex);
  },
  selectIndex(index) {
    if (this.refs.active) {
      this.refs.active.classList.remove('selected');
    }

    this.refs.active = this.refs.list.children[index];
    this.refs.active.classList.add('selected');

    this.refs.active.scrollIntoViewIfNeeded(false);
    this.suggestionsIndex = index;
  },
  select() {
    this.selectCallback(this.suggestions[this.suggestionsIndex]);
  }
}); // eslint-disable-line no-unused-vars

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpc3QuanMiXSwibmFtZXMiOlsicmVuZGVyVmlldyIsInN1Z2dlc3Rpb25zIiwic2VsZWN0Q2FsbGJhY2siLCJjbGFzc05hbWUiLCJsZW5ndGgiLCJzdWdnZXN0aW9uc0NvdW50Iiwic3VnZ2VzdGlvbnNJbmRleCIsIm1hcCIsInN1Z2dlc3Rpb24iLCJ0aXRsZSIsIm1vdmUiLCJtb3ZlbWVudCIsIm5ld0luZGV4Iiwic2VsZWN0SW5kZXgiLCJpbmRleCIsInJlZnMiLCJhY3RpdmUiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJsaXN0IiwiY2hpbGRyZW4iLCJhZGQiLCJzY3JvbGxJbnRvVmlld0lmTmVlZGVkIiwic2VsZWN0Il0sIm1hcHBpbmdzIjoiOzs7O0FBR0E7O0FBQ0E7O0FBRkE7a0JBS2UsNkJBQVk7QUFDekJBLGFBQVdDLFdBQVgsRUFBd0JDLGNBQXhCLEVBQXdDO0FBQ3RDLFFBQUlDLFlBQVksMEJBQWhCO0FBQ0EsUUFBSUYsWUFBWUcsTUFBWixHQUFxQixDQUF6QixFQUE0QjtBQUMxQkQsbUJBQWEsb0JBQWI7QUFDRDs7QUFFRCxTQUFLRixXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLFNBQUtJLGdCQUFMLEdBQXdCSixZQUFZRyxNQUFwQztBQUNBLFNBQUtFLGdCQUFMLEdBQXdCLENBQUMsQ0FBekI7QUFDQSxTQUFLSixjQUFMLEdBQXNCQSxjQUF0Qjs7QUFFQSxXQUFPO0FBQUE7QUFBQSxRQUFpQixTQUFPQyxTQUF4QixFQUFtQyxJQUFHLGlCQUF0QztBQUNMO0FBQUE7QUFBQSxVQUFJLFNBQU0sWUFBVixFQUF1QixLQUFJLE1BQTNCO0FBQ0dGLG9CQUFZTSxHQUFaLENBQWdCLFVBQVNDLFVBQVQsRUFBcUI7QUFDcEMsaUJBQU87QUFBQTtBQUFBO0FBQ0w7QUFBQTtBQUFBLGdCQUFNLFNBQU9BLDJCQUFiLEVBQWlDLFlBQVUsWUFBVztBQUNwRE4saUNBQWVNLFVBQWY7QUFDRCxpQkFGRDtBQUVJQSx5QkFBV0M7QUFGZjtBQURLLFdBQVA7QUFLRCxTQU5BO0FBREg7QUFESyxLQUFQO0FBV0QsR0F2QndCO0FBd0J6QkMsT0FBS0MsUUFBTCxFQUE2QjtBQUMzQixRQUFJQyxXQUFXLEtBQUtOLGdCQUFwQjs7QUFFQSxRQUFJSyxhQUFhLElBQWpCLEVBQXVCO0FBQ3JCQztBQUNELEtBRkQsTUFFTyxJQUFJRCxhQUFhLE1BQWpCLEVBQXlCO0FBQzlCQztBQUNELEtBRk0sTUFFQSxJQUFJRCxhQUFhLGFBQWpCLEVBQWdDO0FBQ3JDQyxpQkFBVyxDQUFYO0FBQ0QsS0FGTSxNQUVBLElBQUlELGFBQWEsZ0JBQWpCLEVBQW1DO0FBQ3hDQyxpQkFBVyxLQUFLUCxnQkFBaEI7QUFDRDtBQUNEO0FBQ0FPLGVBQVdBLFdBQVcsS0FBS1AsZ0JBQTNCO0FBQ0EsUUFBSU8sV0FBVyxDQUFmLEVBQWtCO0FBQ2hCQSxpQkFBVyxLQUFLUCxnQkFBTCxHQUF3Qk8sUUFBbkM7QUFDRDtBQUNELFNBQUtDLFdBQUwsQ0FBaUJELFFBQWpCO0FBQ0QsR0ExQ3dCO0FBMkN6QkMsY0FBWUMsS0FBWixFQUFtQjtBQUNqQixRQUFJLEtBQUtDLElBQUwsQ0FBVUMsTUFBZCxFQUFzQjtBQUNwQixXQUFLRCxJQUFMLENBQVVDLE1BQVYsQ0FBaUJDLFNBQWpCLENBQTJCQyxNQUEzQixDQUFrQyxVQUFsQztBQUNEOztBQUVELFNBQUtILElBQUwsQ0FBVUMsTUFBVixHQUFtQixLQUFLRCxJQUFMLENBQVVJLElBQVYsQ0FBZUMsUUFBZixDQUF3Qk4sS0FBeEIsQ0FBbkI7QUFDQSxTQUFLQyxJQUFMLENBQVVDLE1BQVYsQ0FBaUJDLFNBQWpCLENBQTJCSSxHQUEzQixDQUErQixVQUEvQjs7QUFFQSxTQUFLTixJQUFMLENBQVVDLE1BQVYsQ0FBaUJNLHNCQUFqQixDQUF3QyxLQUF4QztBQUNBLFNBQUtoQixnQkFBTCxHQUF3QlEsS0FBeEI7QUFDRCxHQXJEd0I7QUFzRHpCUyxXQUFTO0FBQ1AsU0FBS3JCLGNBQUwsQ0FBb0IsS0FBS0QsV0FBTCxDQUFpQixLQUFLSyxnQkFBdEIsQ0FBcEI7QUFDRDtBQXhEd0IsQ0FBWixDLEVBSmdDIiwiZmlsZSI6Imxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG4vKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7IGNyZWF0ZUNsYXNzLCBqc3ggfSBmcm9tICd2YW5pbGxhLWpzeCcgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgJGNsYXNzIH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGlzdE1vdmVtZW50IH0gZnJvbSAnLi4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyVmlldyhzdWdnZXN0aW9ucywgc2VsZWN0Q2FsbGJhY2spIHtcbiAgICBsZXQgY2xhc3NOYW1lID0gJ3NlbGVjdC1saXN0IHBvcG92ZXItbGlzdCdcbiAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoID4gNykge1xuICAgICAgY2xhc3NOYW1lICs9ICcgaW50ZW50aW9ucy1zY3JvbGwnXG4gICAgfVxuXG4gICAgdGhpcy5zdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zXG4gICAgdGhpcy5zdWdnZXN0aW9uc0NvdW50ID0gc3VnZ2VzdGlvbnMubGVuZ3RoXG4gICAgdGhpcy5zdWdnZXN0aW9uc0luZGV4ID0gLTFcbiAgICB0aGlzLnNlbGVjdENhbGxiYWNrID0gc2VsZWN0Q2FsbGJhY2tcblxuICAgIHJldHVybiA8aW50ZW50aW9ucy1saXN0IGNsYXNzPXtjbGFzc05hbWV9IGlkPVwiaW50ZW50aW9ucy1saXN0XCI+XG4gICAgICA8b2wgY2xhc3M9XCJsaXN0LWdyb3VwXCIgcmVmPVwibGlzdFwiPlxuICAgICAgICB7c3VnZ2VzdGlvbnMubWFwKGZ1bmN0aW9uKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gPGxpPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e3N1Z2dlc3Rpb25bJGNsYXNzXX0gb24tY2xpY2s9e2Z1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBzZWxlY3RDYWxsYmFjayhzdWdnZXN0aW9uKVxuICAgICAgICAgICAgfX0+e3N1Z2dlc3Rpb24udGl0bGV9PC9zcGFuPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIH0pfVxuICAgICAgPC9vbD5cbiAgICA8L2ludGVudGlvbnMtbGlzdD5cbiAgfSxcbiAgbW92ZShtb3ZlbWVudDogTGlzdE1vdmVtZW50KSB7XG4gICAgbGV0IG5ld0luZGV4ID0gdGhpcy5zdWdnZXN0aW9uc0luZGV4XG5cbiAgICBpZiAobW92ZW1lbnQgPT09ICd1cCcpIHtcbiAgICAgIG5ld0luZGV4LS1cbiAgICB9IGVsc2UgaWYgKG1vdmVtZW50ID09PSAnZG93bicpIHtcbiAgICAgIG5ld0luZGV4KytcbiAgICB9IGVsc2UgaWYgKG1vdmVtZW50ID09PSAnbW92ZS10by10b3AnKSB7XG4gICAgICBuZXdJbmRleCA9IDBcbiAgICB9IGVsc2UgaWYgKG1vdmVtZW50ID09PSAnbW92ZS10by1ib3R0b20nKSB7XG4gICAgICBuZXdJbmRleCA9IHRoaXMuc3VnZ2VzdGlvbnNDb3VudFxuICAgIH1cbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgcGFnZSB1cC9kb3duXG4gICAgbmV3SW5kZXggPSBuZXdJbmRleCAlIHRoaXMuc3VnZ2VzdGlvbnNDb3VudFxuICAgIGlmIChuZXdJbmRleCA8IDApIHtcbiAgICAgIG5ld0luZGV4ID0gdGhpcy5zdWdnZXN0aW9uc0NvdW50ICsgbmV3SW5kZXhcbiAgICB9XG4gICAgdGhpcy5zZWxlY3RJbmRleChuZXdJbmRleClcbiAgfSxcbiAgc2VsZWN0SW5kZXgoaW5kZXgpIHtcbiAgICBpZiAodGhpcy5yZWZzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5yZWZzLmFjdGl2ZS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgfVxuXG4gICAgdGhpcy5yZWZzLmFjdGl2ZSA9IHRoaXMucmVmcy5saXN0LmNoaWxkcmVuW2luZGV4XVxuICAgIHRoaXMucmVmcy5hY3RpdmUuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuXG4gICAgdGhpcy5yZWZzLmFjdGl2ZS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKGZhbHNlKVxuICAgIHRoaXMuc3VnZ2VzdGlvbnNJbmRleCA9IGluZGV4XG4gIH0sXG4gIHNlbGVjdCgpIHtcbiAgICB0aGlzLnNlbGVjdENhbGxiYWNrKHRoaXMuc3VnZ2VzdGlvbnNbdGhpcy5zdWdnZXN0aW9uc0luZGV4XSlcbiAgfSxcbn0pXG4iXX0=