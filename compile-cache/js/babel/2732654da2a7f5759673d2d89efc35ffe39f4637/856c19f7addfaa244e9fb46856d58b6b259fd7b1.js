'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _underscorePlus = require('underscore-plus');

let Settings = class Settings {
  update(settings = {}) {
    this.load(settings);
  }

  load(values = {}) {
    let settings = values;
    if ('global' in settings) {
      settings['*'] = settings.global;
      delete settings.global;
    }

    if ('*' in settings) {
      const scopedSettings = settings;
      settings = settings['*'];
      delete scopedSettings['*'];

      (0, _underscorePlus.each)(scopedSettings, this.set, this);
    }

    this.set(settings);
  }

  set(settings, scope) {
    const flatSettings = {};
    const options = scope ? { scopeSelector: scope } : {};
    options.save = false;
    this.flatten(flatSettings, settings);

    (0, _underscorePlus.each)(flatSettings, (value, key) => {
      atom.config.set(key, value, options);
    });
  }

  flatten(root, dict, path) {
    let dotPath;
    let valueIsObject;

    (0, _underscorePlus.each)(dict, (value, key) => {
      dotPath = path ? `${path}.${key}` : key;
      valueIsObject = !(0, _underscorePlus.isArray)(value) && (0, _underscorePlus.isObject)(value);

      if (valueIsObject) {
        this.flatten(root, dict[key], dotPath);
      } else {
        root[dotPath] = value; // eslint-disable-line no-param-reassign
      }
    }, this);
  }
};
exports.default = Settings;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNldHRpbmdzLmpzIl0sIm5hbWVzIjpbIlNldHRpbmdzIiwidXBkYXRlIiwic2V0dGluZ3MiLCJsb2FkIiwidmFsdWVzIiwiZ2xvYmFsIiwic2NvcGVkU2V0dGluZ3MiLCJzZXQiLCJzY29wZSIsImZsYXRTZXR0aW5ncyIsIm9wdGlvbnMiLCJzY29wZVNlbGVjdG9yIiwic2F2ZSIsImZsYXR0ZW4iLCJ2YWx1ZSIsImtleSIsImF0b20iLCJjb25maWciLCJyb290IiwiZGljdCIsInBhdGgiLCJkb3RQYXRoIiwidmFsdWVJc09iamVjdCJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFFQTs7SUFFcUJBLFEsR0FBTixNQUFNQSxRQUFOLENBQWU7QUFDNUJDLFNBQU9DLFdBQVcsRUFBbEIsRUFBc0I7QUFDcEIsU0FBS0MsSUFBTCxDQUFVRCxRQUFWO0FBQ0Q7O0FBRURDLE9BQUtDLFNBQVMsRUFBZCxFQUFrQjtBQUNoQixRQUFJRixXQUFXRSxNQUFmO0FBQ0EsUUFBSSxZQUFZRixRQUFoQixFQUEwQjtBQUN4QkEsZUFBUyxHQUFULElBQWdCQSxTQUFTRyxNQUF6QjtBQUNBLGFBQU9ILFNBQVNHLE1BQWhCO0FBQ0Q7O0FBRUQsUUFBSSxPQUFPSCxRQUFYLEVBQXFCO0FBQ25CLFlBQU1JLGlCQUFpQkosUUFBdkI7QUFDQUEsaUJBQVdBLFNBQVMsR0FBVCxDQUFYO0FBQ0EsYUFBT0ksZUFBZSxHQUFmLENBQVA7O0FBRUEsZ0NBQUtBLGNBQUwsRUFBcUIsS0FBS0MsR0FBMUIsRUFBK0IsSUFBL0I7QUFDRDs7QUFFRCxTQUFLQSxHQUFMLENBQVNMLFFBQVQ7QUFDRDs7QUFFREssTUFBSUwsUUFBSixFQUFjTSxLQUFkLEVBQXFCO0FBQ25CLFVBQU1DLGVBQWUsRUFBckI7QUFDQSxVQUFNQyxVQUFVRixRQUFRLEVBQUVHLGVBQWVILEtBQWpCLEVBQVIsR0FBbUMsRUFBbkQ7QUFDQUUsWUFBUUUsSUFBUixHQUFlLEtBQWY7QUFDQSxTQUFLQyxPQUFMLENBQWFKLFlBQWIsRUFBMkJQLFFBQTNCOztBQUVBLDhCQUFLTyxZQUFMLEVBQW1CLENBQUNLLEtBQUQsRUFBUUMsR0FBUixLQUFnQjtBQUNqQ0MsV0FBS0MsTUFBTCxDQUFZVixHQUFaLENBQWdCUSxHQUFoQixFQUFxQkQsS0FBckIsRUFBNEJKLE9BQTVCO0FBQ0QsS0FGRDtBQUdEOztBQUVERyxVQUFRSyxJQUFSLEVBQWNDLElBQWQsRUFBb0JDLElBQXBCLEVBQTBCO0FBQ3hCLFFBQUlDLE9BQUo7QUFDQSxRQUFJQyxhQUFKOztBQUVBLDhCQUFLSCxJQUFMLEVBQVcsQ0FBQ0wsS0FBRCxFQUFRQyxHQUFSLEtBQWdCO0FBQ3pCTSxnQkFBVUQsT0FBUSxHQUFFQSxJQUFLLElBQUdMLEdBQUksRUFBdEIsR0FBMEJBLEdBQXBDO0FBQ0FPLHNCQUFnQixDQUFDLDZCQUFRUixLQUFSLENBQUQsSUFBbUIsOEJBQVNBLEtBQVQsQ0FBbkM7O0FBRUEsVUFBSVEsYUFBSixFQUFtQjtBQUNqQixhQUFLVCxPQUFMLENBQWFLLElBQWIsRUFBbUJDLEtBQUtKLEdBQUwsQ0FBbkIsRUFBOEJNLE9BQTlCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xILGFBQUtHLE9BQUwsSUFBZ0JQLEtBQWhCLENBREssQ0FDa0I7QUFDeEI7QUFDRixLQVRELEVBU0csSUFUSDtBQVVEO0FBaEQyQixDO2tCQUFUZCxRIiwiZmlsZSI6IlNldHRpbmdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IGVhY2gsIGlzQXJyYXksIGlzT2JqZWN0IH0gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0dGluZ3Mge1xuICB1cGRhdGUoc2V0dGluZ3MgPSB7fSkge1xuICAgIHRoaXMubG9hZChzZXR0aW5ncyk7XG4gIH1cblxuICBsb2FkKHZhbHVlcyA9IHt9KSB7XG4gICAgbGV0IHNldHRpbmdzID0gdmFsdWVzO1xuICAgIGlmICgnZ2xvYmFsJyBpbiBzZXR0aW5ncykge1xuICAgICAgc2V0dGluZ3NbJyonXSA9IHNldHRpbmdzLmdsb2JhbDtcbiAgICAgIGRlbGV0ZSBzZXR0aW5ncy5nbG9iYWw7XG4gICAgfVxuXG4gICAgaWYgKCcqJyBpbiBzZXR0aW5ncykge1xuICAgICAgY29uc3Qgc2NvcGVkU2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICAgIHNldHRpbmdzID0gc2V0dGluZ3NbJyonXTtcbiAgICAgIGRlbGV0ZSBzY29wZWRTZXR0aW5nc1snKiddO1xuXG4gICAgICBlYWNoKHNjb3BlZFNldHRpbmdzLCB0aGlzLnNldCwgdGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXQoc2V0dGluZ3MpO1xuICB9XG5cbiAgc2V0KHNldHRpbmdzLCBzY29wZSkge1xuICAgIGNvbnN0IGZsYXRTZXR0aW5ncyA9IHt9O1xuICAgIGNvbnN0IG9wdGlvbnMgPSBzY29wZSA/IHsgc2NvcGVTZWxlY3Rvcjogc2NvcGUgfSA6IHt9O1xuICAgIG9wdGlvbnMuc2F2ZSA9IGZhbHNlO1xuICAgIHRoaXMuZmxhdHRlbihmbGF0U2V0dGluZ3MsIHNldHRpbmdzKTtcblxuICAgIGVhY2goZmxhdFNldHRpbmdzLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KGtleSwgdmFsdWUsIG9wdGlvbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgZmxhdHRlbihyb290LCBkaWN0LCBwYXRoKSB7XG4gICAgbGV0IGRvdFBhdGg7XG4gICAgbGV0IHZhbHVlSXNPYmplY3Q7XG5cbiAgICBlYWNoKGRpY3QsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBkb3RQYXRoID0gcGF0aCA/IGAke3BhdGh9LiR7a2V5fWAgOiBrZXk7XG4gICAgICB2YWx1ZUlzT2JqZWN0ID0gIWlzQXJyYXkodmFsdWUpICYmIGlzT2JqZWN0KHZhbHVlKTtcblxuICAgICAgaWYgKHZhbHVlSXNPYmplY3QpIHtcbiAgICAgICAgdGhpcy5mbGF0dGVuKHJvb3QsIGRpY3Rba2V5XSwgZG90UGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb290W2RvdFBhdGhdID0gdmFsdWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfVxufVxuIl19