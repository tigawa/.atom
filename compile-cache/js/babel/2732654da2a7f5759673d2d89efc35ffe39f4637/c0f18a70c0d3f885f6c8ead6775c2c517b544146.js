Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _greetV2Welcome = require('./greet-v2-welcome');

var _greetV2Welcome2 = _interopRequireDefault(_greetV2Welcome);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Note: This package should not be used from "Main" class,
// Instead it should be used from the main package entry point directly
let Greeter = class Greeter {
  constructor() {
    this.notifications = new Set();
  }
  showWelcome() {
    (0, _greetV2Welcome2.default)();
  }
  dispose() {
    this.notifications.forEach(n => n.dismiss());
    this.notifications.clear();
  }
};

// Greets

exports.default = Greeter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkdyZWV0ZXIiLCJjb25zdHJ1Y3RvciIsIm5vdGlmaWNhdGlvbnMiLCJTZXQiLCJzaG93V2VsY29tZSIsImRpc3Bvc2UiLCJmb3JFYWNoIiwibiIsImRpc21pc3MiLCJjbGVhciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQTs7Ozs7O0FBR0E7QUFDQTtJQUNxQkEsTyxHQUFOLE1BQU1BLE9BQU4sQ0FBYztBQUUzQkMsZ0JBQWM7QUFDWixTQUFLQyxhQUFMLEdBQXFCLElBQUlDLEdBQUosRUFBckI7QUFDRDtBQUNEQyxnQkFBb0I7QUFDbEI7QUFDRDtBQUNEQyxZQUFVO0FBQ1IsU0FBS0gsYUFBTCxDQUFtQkksT0FBbkIsQ0FBMkJDLEtBQUtBLEVBQUVDLE9BQUYsRUFBaEM7QUFDQSxTQUFLTixhQUFMLENBQW1CTyxLQUFuQjtBQUNEO0FBWDBCLEM7O0FBTjdCOztrQkFNcUJULE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG4vLyBHcmVldHNcbmltcG9ydCBncmVldFYyV2VsY29tZSBmcm9tICcuL2dyZWV0LXYyLXdlbGNvbWUnXG5cblxuLy8gTm90ZTogVGhpcyBwYWNrYWdlIHNob3VsZCBub3QgYmUgdXNlZCBmcm9tIFwiTWFpblwiIGNsYXNzLFxuLy8gSW5zdGVhZCBpdCBzaG91bGQgYmUgdXNlZCBmcm9tIHRoZSBtYWluIHBhY2thZ2UgZW50cnkgcG9pbnQgZGlyZWN0bHlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWV0ZXIge1xuICBub3RpZmljYXRpb25zOiBTZXQ8T2JqZWN0PjtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ub3RpZmljYXRpb25zID0gbmV3IFNldCgpXG4gIH1cbiAgc2hvd1dlbGNvbWUoKTogdm9pZCB7XG4gICAgZ3JlZXRWMldlbGNvbWUoKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5ub3RpZmljYXRpb25zLmZvckVhY2gobiA9PiBuLmRpc21pc3MoKSlcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMuY2xlYXIoKVxuICB9XG59XG4iXX0=