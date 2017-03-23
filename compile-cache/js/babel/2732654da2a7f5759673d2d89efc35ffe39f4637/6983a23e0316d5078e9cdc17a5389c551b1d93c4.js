Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _helpers = require('./helpers');

let Intentions = class Intentions {

  constructor() {
    this.messages = [];
    this.grammarScopes = ['*'];
  }
  getIntentions({ textEditor, bufferPosition }) {
    let intentions = [];
    const messages = (0, _helpers.filterMessages)(this.messages, textEditor.getPath());

    for (const message of messages) {
      const hasFixes = message.version === 1 ? message.fix : message.solutions && message.solutions.length;
      if (!hasFixes) {
        continue;
      }
      const range = (0, _helpers.$range)(message);
      const inRange = range && range.containsPoint(bufferPosition);
      if (!inRange) {
        continue;
      }

      let solutions = [];
      if (message.version === 1 && message.fix) {
        solutions.push(message.fix);
      } else if (message.version === 2 && message.solutions && message.solutions.length) {
        solutions = message.solutions;
      }
      const linterName = message.linterName || 'Linter';

      intentions = intentions.concat(solutions.map(solution => ({
        priority: solution.priority ? solution.priority + 200 : 200,
        icon: 'tools',
        title: solution.title || `Fix ${linterName} issue`,
        selected() {
          (0, _helpers.applySolution)(textEditor, message.version, solution);
        }
      })));
    }
    return intentions;
  }
  update(messages) {
    this.messages = messages;
  }
};
exports.default = Intentions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImludGVudGlvbnMuanMiXSwibmFtZXMiOlsiSW50ZW50aW9ucyIsImNvbnN0cnVjdG9yIiwibWVzc2FnZXMiLCJncmFtbWFyU2NvcGVzIiwiZ2V0SW50ZW50aW9ucyIsInRleHRFZGl0b3IiLCJidWZmZXJQb3NpdGlvbiIsImludGVudGlvbnMiLCJnZXRQYXRoIiwibWVzc2FnZSIsImhhc0ZpeGVzIiwidmVyc2lvbiIsImZpeCIsInNvbHV0aW9ucyIsImxlbmd0aCIsInJhbmdlIiwiaW5SYW5nZSIsImNvbnRhaW5zUG9pbnQiLCJwdXNoIiwibGludGVyTmFtZSIsImNvbmNhdCIsIm1hcCIsInNvbHV0aW9uIiwicHJpb3JpdHkiLCJpY29uIiwidGl0bGUiLCJzZWxlY3RlZCIsInVwZGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7SUFHcUJBLFUsR0FBTixNQUFNQSxVQUFOLENBQWlCOztBQUk5QkMsZ0JBQWM7QUFDWixTQUFLQyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixDQUFDLEdBQUQsQ0FBckI7QUFDRDtBQUNEQyxnQkFBYyxFQUFFQyxVQUFGLEVBQWNDLGNBQWQsRUFBZCxFQUFxRTtBQUNuRSxRQUFJQyxhQUFhLEVBQWpCO0FBQ0EsVUFBTUwsV0FBVyw2QkFBZSxLQUFLQSxRQUFwQixFQUE4QkcsV0FBV0csT0FBWCxFQUE5QixDQUFqQjs7QUFFQSxTQUFLLE1BQU1DLE9BQVgsSUFBc0JQLFFBQXRCLEVBQWdDO0FBQzlCLFlBQU1RLFdBQVdELFFBQVFFLE9BQVIsS0FBb0IsQ0FBcEIsR0FBd0JGLFFBQVFHLEdBQWhDLEdBQXNDSCxRQUFRSSxTQUFSLElBQXFCSixRQUFRSSxTQUFSLENBQWtCQyxNQUE5RjtBQUNBLFVBQUksQ0FBQ0osUUFBTCxFQUFlO0FBQ2I7QUFDRDtBQUNELFlBQU1LLFFBQVEscUJBQU9OLE9BQVAsQ0FBZDtBQUNBLFlBQU1PLFVBQVVELFNBQVNBLE1BQU1FLGFBQU4sQ0FBb0JYLGNBQXBCLENBQXpCO0FBQ0EsVUFBSSxDQUFDVSxPQUFMLEVBQWM7QUFDWjtBQUNEOztBQUVELFVBQUlILFlBQTJCLEVBQS9CO0FBQ0EsVUFBSUosUUFBUUUsT0FBUixLQUFvQixDQUFwQixJQUF5QkYsUUFBUUcsR0FBckMsRUFBMEM7QUFDeENDLGtCQUFVSyxJQUFWLENBQWVULFFBQVFHLEdBQXZCO0FBQ0QsT0FGRCxNQUVPLElBQUlILFFBQVFFLE9BQVIsS0FBb0IsQ0FBcEIsSUFBeUJGLFFBQVFJLFNBQWpDLElBQThDSixRQUFRSSxTQUFSLENBQWtCQyxNQUFwRSxFQUE0RTtBQUNqRkQsb0JBQVlKLFFBQVFJLFNBQXBCO0FBQ0Q7QUFDRCxZQUFNTSxhQUFhVixRQUFRVSxVQUFSLElBQXNCLFFBQXpDOztBQUVBWixtQkFBYUEsV0FBV2EsTUFBWCxDQUFrQlAsVUFBVVEsR0FBVixDQUFjQyxhQUFhO0FBQ3hEQyxrQkFBVUQsU0FBU0MsUUFBVCxHQUFvQkQsU0FBU0MsUUFBVCxHQUFvQixHQUF4QyxHQUE4QyxHQURBO0FBRXhEQyxjQUFNLE9BRmtEO0FBR3hEQyxlQUFPSCxTQUFTRyxLQUFULElBQW1CLE9BQU1OLFVBQVcsUUFIYTtBQUl4RE8sbUJBQVc7QUFDVCxzQ0FBY3JCLFVBQWQsRUFBMEJJLFFBQVFFLE9BQWxDLEVBQTJDVyxRQUEzQztBQUNEO0FBTnVELE9BQWIsQ0FBZCxDQUFsQixDQUFiO0FBUUQ7QUFDRCxXQUFPZixVQUFQO0FBQ0Q7QUFDRG9CLFNBQU96QixRQUFQLEVBQXVDO0FBQ3JDLFNBQUtBLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0Q7QUE1QzZCLEM7a0JBQVhGLFUiLCJmaWxlIjoiaW50ZW50aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7ICRyYW5nZSwgYXBwbHlTb2x1dGlvbiwgZmlsdGVyTWVzc2FnZXMgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlbnRpb25zIHtcbiAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+O1xuICBncmFtbWFyU2NvcGVzOiBBcnJheTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuZ3JhbW1hclNjb3BlcyA9IFsnKiddXG4gIH1cbiAgZ2V0SW50ZW50aW9ucyh7IHRleHRFZGl0b3IsIGJ1ZmZlclBvc2l0aW9uIH06IE9iamVjdCk6IEFycmF5PE9iamVjdD4ge1xuICAgIGxldCBpbnRlbnRpb25zID0gW11cbiAgICBjb25zdCBtZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIHRleHRFZGl0b3IuZ2V0UGF0aCgpKVxuXG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzKSB7XG4gICAgICBjb25zdCBoYXNGaXhlcyA9IG1lc3NhZ2UudmVyc2lvbiA9PT0gMSA/IG1lc3NhZ2UuZml4IDogbWVzc2FnZS5zb2x1dGlvbnMgJiYgbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoXG4gICAgICBpZiAoIWhhc0ZpeGVzKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBjb25zdCByYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuICAgICAgY29uc3QgaW5SYW5nZSA9IHJhbmdlICYmIHJhbmdlLmNvbnRhaW5zUG9pbnQoYnVmZmVyUG9zaXRpb24pXG4gICAgICBpZiAoIWluUmFuZ2UpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IHNvbHV0aW9uczogQXJyYXk8T2JqZWN0PiA9IFtdXG4gICAgICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAxICYmIG1lc3NhZ2UuZml4KSB7XG4gICAgICAgIHNvbHV0aW9ucy5wdXNoKG1lc3NhZ2UuZml4KVxuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS5zb2x1dGlvbnMgJiYgbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHNvbHV0aW9ucyA9IG1lc3NhZ2Uuc29sdXRpb25zXG4gICAgICB9XG4gICAgICBjb25zdCBsaW50ZXJOYW1lID0gbWVzc2FnZS5saW50ZXJOYW1lIHx8ICdMaW50ZXInXG5cbiAgICAgIGludGVudGlvbnMgPSBpbnRlbnRpb25zLmNvbmNhdChzb2x1dGlvbnMubWFwKHNvbHV0aW9uID0+ICh7XG4gICAgICAgIHByaW9yaXR5OiBzb2x1dGlvbi5wcmlvcml0eSA/IHNvbHV0aW9uLnByaW9yaXR5ICsgMjAwIDogMjAwLFxuICAgICAgICBpY29uOiAndG9vbHMnLFxuICAgICAgICB0aXRsZTogc29sdXRpb24udGl0bGUgfHwgYEZpeCAke2xpbnRlck5hbWV9IGlzc3VlYCxcbiAgICAgICAgc2VsZWN0ZWQoKSB7XG4gICAgICAgICAgYXBwbHlTb2x1dGlvbih0ZXh0RWRpdG9yLCBtZXNzYWdlLnZlcnNpb24sIHNvbHV0aW9uKVxuICAgICAgICB9LFxuICAgICAgfSkpKVxuICAgIH1cbiAgICByZXR1cm4gaW50ZW50aW9uc1xuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pIHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgfVxufVxuIl19