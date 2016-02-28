'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var StatusBarItem = (function () {
  function StatusBarItem() {
    _classCallCheck(this, StatusBarItem);

    this.element = document.createElement('a');
    this.element.className = 'line-ending-tile inline-block';
    this.setLineEndings(new Set());
  }

  _createClass(StatusBarItem, [{
    key: 'setLineEndings',
    value: function setLineEndings(lineEndings) {
      this.lineEndings = lineEndings;
      this.element.textContent = lineEndingName(lineEndings);
    }
  }, {
    key: 'hasLineEnding',
    value: function hasLineEnding(lineEnding) {
      return this.lineEndings.has(lineEnding);
    }
  }, {
    key: 'onClick',
    value: function onClick(callback) {
      this.element.addEventListener('click', callback);
    }
  }]);

  return StatusBarItem;
})();

exports['default'] = StatusBarItem;

function lineEndingName(lineEndings) {
  if (lineEndings.size > 1) {
    return 'Mixed';
  } else if (lineEndings.has('\n')) {
    return 'LF';
  } else if (lineEndings.has('\r\n')) {
    return 'CRLF';
  } else if (lineEndings.has('\r')) {
    return 'CR';
  } else {
    return '';
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3ByaXZhdGUvdmFyL2xpYi9qZW5raW5zL3dvcmtzcGFjZS9hdG9tL25vZGVfbW9kdWxlcy9saW5lLWVuZGluZy1zZWxlY3Rvci9saWIvc3RhdHVzLWJhci1pdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7QUNFWCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUU7QUFDM0MsT0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDLENBQUM7O0FBRUgsSUFBSSxZQUFZLEdBQUcsQ0FBQyxZQUFZO0FBQUUsV0FBUyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQUUsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFBRSxVQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxVQUFVLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLEFBQUMsVUFBVSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQUFBQyxJQUFJLE9BQU8sSUFBSSxVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQUFBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQUU7R0FBRSxBQUFDLE9BQU8sVUFBVSxXQUFXLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRTtBQUFFLFFBQUksVUFBVSxFQUFFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQUFBQyxJQUFJLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQUFBQyxPQUFPLFdBQVcsQ0FBQztHQUFFLENBQUM7Q0FBRSxDQUFBLEVBQUcsQ0FBQzs7QUFFdGpCLFNBQVMsZUFBZSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUU7QUFBRSxNQUFJLEVBQUUsUUFBUSxZQUFZLFdBQVcsQ0FBQSxBQUFDLEVBQUU7QUFBRSxVQUFNLElBQUksU0FBUyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7R0FBRTtDQUFFOztBQUV6SixJRFJxQixhQUFhLEdBQUEsQ0FBQSxZQUFBO0FBQ3BCLFdBRE8sYUFBYSxHQUNqQjtBQ1NiLG1CQUFlLENBQUMsSUFBSSxFRFZILGFBQWEsQ0FBQSxDQUFBOztBQUU5QixRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsK0JBQStCLENBQUE7QUFDeEQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUE7R0FDL0I7O0FDWUQsY0FBWSxDRGpCTyxhQUFhLEVBQUEsQ0FBQTtBQ2tCOUIsT0FBRyxFQUFFLGdCQUFnQjtBQUNyQixTQUFLLEVEWlEsU0FBQSxjQUFBLENBQUMsV0FBVyxFQUFFO0FBQzNCLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFVBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUN2RDtHQ2FBLEVBQUU7QUFDRCxPQUFHLEVBQUUsZUFBZTtBQUNwQixTQUFLLEVEYk8sU0FBQSxhQUFBLENBQUMsVUFBVSxFQUFFO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7S0FDeEM7R0NjQSxFQUFFO0FBQ0QsT0FBRyxFQUFFLFNBQVM7QUFDZCxTQUFLLEVEZEMsU0FBQSxPQUFBLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2pEO0dDZUEsQ0FBQyxDQUFDLENBQUM7O0FBRUosU0RuQ21CLGFBQWEsQ0FBQTtDQ29DakMsQ0FBQSxFQUFHLENBQUM7O0FBRUwsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHRHRDRyxhQUFhLENBQUE7O0FBcUJsQyxTQUFTLGNBQWMsQ0FBRSxXQUFXLEVBQUU7QUFDcEMsTUFBSSxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUN4QixXQUFPLE9BQU8sQ0FBQTtHQUNmLE1BQU0sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2hDLFdBQU8sSUFBSSxDQUFBO0dBQ1osTUFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDbEMsV0FBTyxNQUFNLENBQUE7R0FDZCxNQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoQyxXQUFPLElBQUksQ0FBQTtHQUNaLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQTtHQUNWO0NBQ0Y7QUNvQkQsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMiLCJmaWxlIjoic3RhdHVzLWJhci1pdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHVzQmFySXRlbSB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gJ2xpbmUtZW5kaW5nLXRpbGUgaW5saW5lLWJsb2NrJ1xuICAgIHRoaXMuc2V0TGluZUVuZGluZ3MobmV3IFNldCgpKVxuICB9XG5cbiAgc2V0TGluZUVuZGluZ3MgKGxpbmVFbmRpbmdzKSB7XG4gICAgdGhpcy5saW5lRW5kaW5ncyA9IGxpbmVFbmRpbmdzXG4gICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gbGluZUVuZGluZ05hbWUobGluZUVuZGluZ3MpXG4gIH1cblxuICBoYXNMaW5lRW5kaW5nIChsaW5lRW5kaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubGluZUVuZGluZ3MuaGFzKGxpbmVFbmRpbmcpXG4gIH1cblxuICBvbkNsaWNrIChjYWxsYmFjaykge1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrKVxuICB9XG59XG5cbmZ1bmN0aW9uIGxpbmVFbmRpbmdOYW1lIChsaW5lRW5kaW5ncykge1xuICBpZiAobGluZUVuZGluZ3Muc2l6ZSA+IDEpIHtcbiAgICByZXR1cm4gJ01peGVkJ1xuICB9IGVsc2UgaWYgKGxpbmVFbmRpbmdzLmhhcygnXFxuJykpIHtcbiAgICByZXR1cm4gJ0xGJ1xuICB9IGVsc2UgaWYgKGxpbmVFbmRpbmdzLmhhcygnXFxyXFxuJykpIHtcbiAgICByZXR1cm4gJ0NSTEYnXG4gIH0gZWxzZSBpZiAobGluZUVuZGluZ3MuaGFzKCdcXHInKSkge1xuICAgIHJldHVybiAnQ1InXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnXG4gIH1cbn1cbiIsIid1c2UgYmFiZWwnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBTdGF0dXNCYXJJdGVtID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU3RhdHVzQmFySXRlbSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3RhdHVzQmFySXRlbSk7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTmFtZSA9ICdsaW5lLWVuZGluZy10aWxlIGlubGluZS1ibG9jayc7XG4gICAgdGhpcy5zZXRMaW5lRW5kaW5ncyhuZXcgU2V0KCkpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFN0YXR1c0Jhckl0ZW0sIFt7XG4gICAga2V5OiAnc2V0TGluZUVuZGluZ3MnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRMaW5lRW5kaW5ncyhsaW5lRW5kaW5ncykge1xuICAgICAgdGhpcy5saW5lRW5kaW5ncyA9IGxpbmVFbmRpbmdzO1xuICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gbGluZUVuZGluZ05hbWUobGluZUVuZGluZ3MpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2hhc0xpbmVFbmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNMaW5lRW5kaW5nKGxpbmVFbmRpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmxpbmVFbmRpbmdzLmhhcyhsaW5lRW5kaW5nKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdvbkNsaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb25DbGljayhjYWxsYmFjaykge1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FsbGJhY2spO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTdGF0dXNCYXJJdGVtO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gU3RhdHVzQmFySXRlbTtcblxuZnVuY3Rpb24gbGluZUVuZGluZ05hbWUobGluZUVuZGluZ3MpIHtcbiAgaWYgKGxpbmVFbmRpbmdzLnNpemUgPiAxKSB7XG4gICAgcmV0dXJuICdNaXhlZCc7XG4gIH0gZWxzZSBpZiAobGluZUVuZGluZ3MuaGFzKCdcXG4nKSkge1xuICAgIHJldHVybiAnTEYnO1xuICB9IGVsc2UgaWYgKGxpbmVFbmRpbmdzLmhhcygnXFxyXFxuJykpIHtcbiAgICByZXR1cm4gJ0NSTEYnO1xuICB9IGVsc2UgaWYgKGxpbmVFbmRpbmdzLmhhcygnXFxyJykpIHtcbiAgICByZXR1cm4gJ0NSJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4iXX0=
//# sourceURL=/opt/homebrew-cask/Caskroom/atom/1.2.0/Atom.app/Contents/Resources/app.asar/node_modules/line-ending-selector/lib/status-bar-item.js
