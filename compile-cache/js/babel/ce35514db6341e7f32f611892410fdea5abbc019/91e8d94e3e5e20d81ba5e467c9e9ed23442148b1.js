Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _helpers = require('./helpers');

var VALID_SEVERITY = new Set(['error', 'warning', 'info']);

function validateUI(ui) {
  var messages = [];

  if (ui && typeof ui === 'object') {
    if (typeof ui.name !== 'string') {
      messages.push('UI.name must be a string');
    }
    if (typeof ui.didBeginLinting !== 'function') {
      messages.push('UI.didBeginLinting must be a function');
    }
    if (typeof ui.didFinishLinting !== 'function') {
      messages.push('UI.didFinishLinting must be a function');
    }
    if (typeof ui.render !== 'function') {
      messages.push('UI.render must be a function');
    }
    if (typeof ui.dispose !== 'function') {
      messages.push('UI.dispose must be a function');
    }
  } else {
    messages.push('UI must be an object');
  }

  if (messages.length) {
    (0, _helpers.showError)('Invalid UI received', 'These issues were encountered while registering the UI named \'' + (ui && ui.name ? ui.name : 'Unknown') + '\'', messages);
    return false;
  }

  return true;
}

function validateLinter(linter, version) {
  var messages = [];

  if (linter && typeof linter === 'object') {
    if (typeof linter.name !== 'string') {
      if (version === 2) {
        messages.push('Linter.name must be a string');
      } else linter.name = 'Unknown';
    }
    if (typeof linter.scope !== 'string' || linter.scope !== 'file' && linter.scope !== 'project') {
      messages.push("Linter.scope must be either 'file' or 'project'");
    }
    if (version === 1 && typeof linter.lintOnFly !== 'boolean') {
      messages.push('Linter.lintOnFly must be a boolean');
    } else if (version === 2 && typeof linter.lintsOnChange !== 'boolean') {
      messages.push('Linter.lintsOnChange must be a boolean');
    }
    if (!Array.isArray(linter.grammarScopes)) {
      messages.push('Linter.grammarScopes must be an Array');
    }
    if (typeof linter.lint !== 'function') {
      messages.push('Linter.lint must be a function');
    }
  } else {
    messages.push('Linter must be an object');
  }

  if (messages.length) {
    (0, _helpers.showError)('Invalid Linter received', 'These issues were encountered while registering a Linter named \'' + (linter && linter.name ? linter.name : 'Unknown') + '\'', messages);
    return false;
  }

  return true;
}

function validateIndie(indie) {
  var messages = [];

  if (indie && typeof indie === 'object') {
    if (typeof indie.name !== 'string') {
      messages.push('Indie.name must be a string');
    }
  } else {
    messages.push('Indie must be an object');
  }

  if (messages.length) {
    (0, _helpers.showError)('Invalid Indie received', 'These issues were encountered while registering an Indie Linter named \'' + (indie && indie.name ? indie.name : 'Unknown') + '\'', messages);
    return false;
  }

  return true;
}

function validateMessages(linterName, entries) {
  var messages = [];

  if (Array.isArray(entries)) {
    var invalidURL = false;
    var invalidIcon = false;
    var invalidExcerpt = false;
    var invalidLocation = false;
    var invalidSeverity = false;
    var invalidSolution = false;
    var invalidReference = false;
    var invalidDescription = false;

    for (var i = 0, _length = entries.length; i < _length; ++i) {
      var message = entries[i];
      var reference = message.reference;
      if (!invalidIcon && message.icon && typeof message.icon !== 'string') {
        invalidIcon = true;
        messages.push('Message.icon must be a string');
      }
      if (!invalidLocation && (!message.location || typeof message.location !== 'object' || typeof message.location.file !== 'string' || typeof message.location.position !== 'object' || !message.location.position)) {
        invalidLocation = true;
        messages.push('Message.location must be valid');
      } else if (!invalidLocation) {
        var range = _atom.Range.fromObject(message.location.position);
        if (Number.isNaN(range.start.row) || Number.isNaN(range.start.column) || Number.isNaN(range.end.row) || Number.isNaN(range.end.column)) {
          invalidLocation = true;
          messages.push('Message.location.position should not contain NaN coordinates');
        }
      }
      if (!invalidSolution && message.solutions && !Array.isArray(message.solutions)) {
        invalidSolution = true;
        messages.push('Message.solutions must be valid');
      }
      if (!invalidReference && reference && (typeof reference !== 'object' || typeof reference.file !== 'string' || typeof reference.position !== 'object' || !reference.position)) {
        invalidReference = true;
        messages.push('Message.reference must be valid');
      } else if (!invalidReference && reference) {
        var position = _atom.Point.fromObject(reference.position);
        if (Number.isNaN(position.row) || Number.isNaN(position.column)) {
          invalidReference = true;
          messages.push('Message.reference.position should not contain NaN coordinates');
        }
      }
      if (!invalidExcerpt && typeof message.excerpt !== 'string') {
        invalidExcerpt = true;
        messages.push('Message.excerpt must be a string');
      }
      if (!invalidSeverity && !VALID_SEVERITY.has(message.severity)) {
        invalidSeverity = true;
        messages.push("Message.severity must be 'error', 'warning' or 'info'");
      }
      if (!invalidURL && message.url && typeof message.url !== 'string') {
        invalidURL = true;
        messages.push('Message.url must a string');
      }
      if (!invalidDescription && message.description && typeof message.description !== 'function' && typeof message.description !== 'string') {
        invalidDescription = true;
        messages.push('Message.description must be a function or string');
      }
    }
  } else {
    messages.push('Linter Result must be an Array');
  }

  if (messages.length) {
    (0, _helpers.showError)('Invalid Linter Result received', 'These issues were encountered while processing messages from a linter named \'' + linterName + '\'', messages);
    return false;
  }

  return true;
}

function validateMessagesLegacy(linterName, entries) {
  var messages = [];

  if (Array.isArray(entries)) {
    var invalidFix = false;
    var invalidType = false;
    var invalidClass = false;
    var invalidRange = false;
    var invalidTrace = false;
    var invalidContent = false;
    var invalidFilePath = false;
    var invalidSeverity = false;

    for (var i = 0, _length2 = entries.length; i < _length2; ++i) {
      var message = entries[i];
      if (!invalidType && typeof message.type !== 'string') {
        invalidType = true;
        messages.push('Message.type must be a string');
      }
      if (!invalidContent && (typeof message.text !== 'string' && typeof message.html !== 'string' && !(message.html instanceof HTMLElement) || !message.text && !message.html)) {
        invalidContent = true;
        messages.push('Message.text or Message.html must have a valid value');
      }
      if (!invalidFilePath && message.filePath && typeof message.filePath !== 'string') {
        invalidFilePath = true;
        messages.push('Message.filePath must be a string');
      }
      if (!invalidRange && message.range && typeof message.range !== 'object') {
        invalidRange = true;
        messages.push('Message.range must be an object');
      } else if (!invalidRange && message.range) {
        var range = _atom.Range.fromObject(message.range);
        if (Number.isNaN(range.start.row) || Number.isNaN(range.start.column) || Number.isNaN(range.end.row) || Number.isNaN(range.end.column)) {
          invalidRange = true;
          messages.push('Message.range should not contain NaN coordinates');
        }
      }
      if (!invalidClass && message['class'] && typeof message['class'] !== 'string') {
        invalidClass = true;
        messages.push('Message.class must be a string');
      }
      if (!invalidSeverity && message.severity && !VALID_SEVERITY.has(message.severity)) {
        invalidSeverity = true;
        messages.push("Message.severity must be 'error', 'warning' or 'info'");
      }
      if (!invalidTrace && message.trace && !Array.isArray(message.trace)) {
        invalidTrace = true;
        messages.push('Message.trace must be an Array');
      }
      if (!invalidFix && message.fix && (typeof message.fix.range !== 'object' || typeof message.fix.newText !== 'string' || message.fix.oldText && typeof message.fix.oldText !== 'string')) {
        invalidFix = true;
        messages.push('Message.fix must be valid');
      }
    }
  } else {
    messages.push('Linter Result must be an Array');
  }

  if (messages.length) {
    (0, _helpers.showError)('Invalid Linter Result received', 'These issues were encountered while processing messages from a linter named \'' + linterName + '\'', messages);
    return false;
  }

  return true;
}

exports.ui = validateUI;
exports.linter = validateLinter;
exports.indie = validateIndie;
exports.messages = validateMessages;
exports.messagesLegacy = validateMessagesLegacy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi92YWxpZGF0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUU2QixNQUFNOzt1QkFDVCxXQUFXOztBQUdyQyxJQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTs7QUFFNUQsU0FBUyxVQUFVLENBQUMsRUFBTSxFQUFXO0FBQ25DLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTs7QUFFbkIsTUFBSSxFQUFFLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO0FBQ2hDLFFBQUksT0FBTyxFQUFFLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUMvQixjQUFRLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUE7S0FDMUM7QUFDRCxRQUFJLE9BQU8sRUFBRSxDQUFDLGVBQWUsS0FBSyxVQUFVLEVBQUU7QUFDNUMsY0FBUSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFBO0tBQ3ZEO0FBQ0QsUUFBSSxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsS0FBSyxVQUFVLEVBQUU7QUFDN0MsY0FBUSxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO0tBQ3hEO0FBQ0QsUUFBSSxPQUFPLEVBQUUsQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFO0FBQ25DLGNBQVEsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQTtLQUM5QztBQUNELFFBQUksT0FBTyxFQUFFLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRTtBQUNwQyxjQUFRLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUE7S0FDL0M7R0FDRixNQUFNO0FBQ0wsWUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0dBQ3RDOztBQUVELE1BQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUNu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Q0FBZ0MsQ0FBQyxDQUFBO0dBQ2hEOztBQUVELE1BQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUNuQiw0QkFBVSxnQ0FBZ0MscUZBQWtGLFVBQVUsU0FBSyxRQUFRLENBQUMsQ0FBQTtBQUNwSixXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELFNBQU8sSUFBSSxDQUFBO0NBQ1o7O1FBR2UsRUFBRSxHQUFoQixVQUFVO1FBQ1EsTUFBTSxHQUF4QixjQUFjO1FBQ0csS0FBSyxHQUF0QixhQUFhO1FBQ08sUUFBUSxHQUE1QixnQkFBZ0I7UUFDVSxjQUFjLEdBQXhDLHNCQUFzQiIsImZpbGUiOiIvVXNlcnMvaWdhd2F0YWlpY2hpLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdmFsaWRhdGUvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBSYW5nZSwgUG9pbnQgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgc2hvd0Vycm9yIH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBVSSwgTGludGVyLCBNZXNzYWdlLCBNZXNzYWdlTGVnYWN5LCBJbmRpZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5jb25zdCBWQUxJRF9TRVZFUklUWSA9IG5ldyBTZXQoWydlcnJvcicsICd3YXJuaW5nJywgJ2luZm8nXSlcblxuZnVuY3Rpb24gdmFsaWRhdGVVSSh1aTogVUkpOiBib29sZWFuIHtcbiAgY29uc3QgbWVzc2FnZXMgPSBbXVxuXG4gIGlmICh1aSAmJiB0eXBlb2YgdWkgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKHR5cGVvZiB1aS5uYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbWVzc2FnZXMucHVzaCgnVUkubmFtZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB1aS5kaWRCZWdpbkxpbnRpbmcgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJ1VJLmRpZEJlZ2luTGludGluZyBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHVpLmRpZEZpbmlzaExpbnRpbmcgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJ1VJLmRpZEZpbmlzaExpbnRpbmcgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB1aS5yZW5kZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJ1VJLnJlbmRlciBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHVpLmRpc3Bvc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJ1VJLmRpc3Bvc2UgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbWVzc2FnZXMucHVzaCgnVUkgbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgIHNob3dFcnJvcignSW52YWxpZCBVSSByZWNlaXZlZCcsIGBUaGVzZSBpc3N1ZXMgd2VyZSBlbmNvdW50ZXJlZCB3aGlsZSByZWdpc3RlcmluZyB0aGUgVUkgbmFtZWQgJyR7dWkgJiYgdWkubmFtZSA/IHVpLm5hbWUgOiAnVW5rbm93bid9J2AsIG1lc3NhZ2VzKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVMaW50ZXIobGludGVyOiBMaW50ZXIsIHZlcnNpb246IDEgfCAyKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1lc3NhZ2VzID0gW11cblxuICBpZiAobGludGVyICYmIHR5cGVvZiBsaW50ZXIgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKHR5cGVvZiBsaW50ZXIubmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ0xpbnRlci5uYW1lIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfSBlbHNlIGxpbnRlci5uYW1lID0gJ1Vua25vd24nXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGludGVyLnNjb3BlICE9PSAnc3RyaW5nJyB8fCAobGludGVyLnNjb3BlICE9PSAnZmlsZScgJiYgbGludGVyLnNjb3BlICE9PSAncHJvamVjdCcpKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKFwiTGludGVyLnNjb3BlIG11c3QgYmUgZWl0aGVyICdmaWxlJyBvciAncHJvamVjdCdcIilcbiAgICB9XG4gICAgaWYgKHZlcnNpb24gPT09IDEgJiYgdHlwZW9mIGxpbnRlci5saW50T25GbHkgIT09ICdib29sZWFuJykge1xuICAgICAgbWVzc2FnZXMucHVzaCgnTGludGVyLmxpbnRPbkZseSBtdXN0IGJlIGEgYm9vbGVhbicpXG4gICAgfSBlbHNlIGlmICh2ZXJzaW9uID09PSAyICYmIHR5cGVvZiBsaW50ZXIubGludHNPbkNoYW5nZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKCdMaW50ZXIubGludHNPbkNoYW5nZSBtdXN0IGJlIGEgYm9vbGVhbicpXG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShsaW50ZXIuZ3JhbW1hclNjb3BlcykpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJ0xpbnRlci5ncmFtbWFyU2NvcGVzIG11c3QgYmUgYW4gQXJyYXknKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGxpbnRlci5saW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKCdMaW50ZXIubGludCBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlcy5wdXNoKCdMaW50ZXIgbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgIHNob3dFcnJvcignSW52YWxpZCBMaW50ZXIgcmVjZWl2ZWQnLCBgVGhlc2UgaXNzdWVzIHdlcmUgZW5jb3VudGVyZWQgd2hpbGUgcmVnaXN0ZXJpbmcgYSBMaW50ZXIgbmFtZWQgJyR7bGludGVyICYmIGxpbnRlci5uYW1lID8gbGludGVyLm5hbWUgOiAnVW5rbm93bid9J2AsIG1lc3NhZ2VzKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVJbmRpZShpbmRpZTogSW5kaWUpOiBib29sZWFuIHtcbiAgY29uc3QgbWVzc2FnZXMgPSBbXVxuXG4gIGlmIChpbmRpZSAmJiB0eXBlb2YgaW5kaWUgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKHR5cGVvZiBpbmRpZS5uYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbWVzc2FnZXMucHVzaCgnSW5kaWUubmFtZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbWVzc2FnZXMucHVzaCgnSW5kaWUgbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgIHNob3dFcnJvcignSW52YWxpZCBJbmRpZSByZWNlaXZlZCcsIGBUaGVzZSBpc3N1ZXMgd2VyZSBlbmNvdW50ZXJlZCB3aGlsZSByZWdpc3RlcmluZyBhbiBJbmRpZSBMaW50ZXIgbmFtZWQgJyR7aW5kaWUgJiYgaW5kaWUubmFtZSA/IGluZGllLm5hbWUgOiAnVW5rbm93bid9J2AsIG1lc3NhZ2VzKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVNZXNzYWdlcyhsaW50ZXJOYW1lOiBzdHJpbmcsIGVudHJpZXM6IEFycmF5PE1lc3NhZ2U+KTogYm9vbGVhbiB7XG4gIGNvbnN0IG1lc3NhZ2VzID0gW11cblxuICBpZiAoQXJyYXkuaXNBcnJheShlbnRyaWVzKSkge1xuICAgIGxldCBpbnZhbGlkVVJMID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZEljb24gPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkRXhjZXJwdCA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRMb2NhdGlvbiA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRTZXZlcml0eSA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRTb2x1dGlvbiA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRSZWZlcmVuY2UgPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkRGVzY3JpcHRpb24gPSBmYWxzZVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlbnRyaWVzW2ldXG4gICAgICBjb25zdCByZWZlcmVuY2UgPSBtZXNzYWdlLnJlZmVyZW5jZVxuICAgICAgaWYgKCFpbnZhbGlkSWNvbiAmJiBtZXNzYWdlLmljb24gJiYgdHlwZW9mIG1lc3NhZ2UuaWNvbiAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW52YWxpZEljb24gPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UuaWNvbiBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZExvY2F0aW9uICYmICghbWVzc2FnZS5sb2NhdGlvbiB8fCB0eXBlb2YgbWVzc2FnZS5sb2NhdGlvbiAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIG1lc3NhZ2UubG9jYXRpb24uZmlsZSAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24gIT09ICdvYmplY3QnIHx8ICFtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uKSkge1xuICAgICAgICBpbnZhbGlkTG9jYXRpb24gPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UubG9jYXRpb24gbXVzdCBiZSB2YWxpZCcpXG4gICAgICB9IGVsc2UgaWYgKCFpbnZhbGlkTG9jYXRpb24pIHtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pXG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4ocmFuZ2Uuc3RhcnQucm93KSB8fCBOdW1iZXIuaXNOYU4ocmFuZ2Uuc3RhcnQuY29sdW1uKSB8fCBOdW1iZXIuaXNOYU4ocmFuZ2UuZW5kLnJvdykgfHwgTnVtYmVyLmlzTmFOKHJhbmdlLmVuZC5jb2x1bW4pKSB7XG4gICAgICAgICAgaW52YWxpZExvY2F0aW9uID0gdHJ1ZVxuICAgICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24gc2hvdWxkIG5vdCBjb250YWluIE5hTiBjb29yZGluYXRlcycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZFNvbHV0aW9uICYmIG1lc3NhZ2Uuc29sdXRpb25zICYmICFBcnJheS5pc0FycmF5KG1lc3NhZ2Uuc29sdXRpb25zKSkge1xuICAgICAgICBpbnZhbGlkU29sdXRpb24gPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2Uuc29sdXRpb25zIG11c3QgYmUgdmFsaWQnKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkUmVmZXJlbmNlICYmIHJlZmVyZW5jZSAmJiAodHlwZW9mIHJlZmVyZW5jZSAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHJlZmVyZW5jZS5maWxlICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgcmVmZXJlbmNlLnBvc2l0aW9uICE9PSAnb2JqZWN0JyB8fCAhcmVmZXJlbmNlLnBvc2l0aW9uKSkge1xuICAgICAgICBpbnZhbGlkUmVmZXJlbmNlID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLnJlZmVyZW5jZSBtdXN0IGJlIHZhbGlkJylcbiAgICAgIH0gZWxzZSBpZiAoIWludmFsaWRSZWZlcmVuY2UgJiYgcmVmZXJlbmNlKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gUG9pbnQuZnJvbU9iamVjdChyZWZlcmVuY2UucG9zaXRpb24pXG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4ocG9zaXRpb24ucm93KSB8fCBOdW1iZXIuaXNOYU4ocG9zaXRpb24uY29sdW1uKSkge1xuICAgICAgICAgIGludmFsaWRSZWZlcmVuY2UgPSB0cnVlXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5yZWZlcmVuY2UucG9zaXRpb24gc2hvdWxkIG5vdCBjb250YWluIE5hTiBjb29yZGluYXRlcycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZEV4Y2VycHQgJiYgdHlwZW9mIG1lc3NhZ2UuZXhjZXJwdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW52YWxpZEV4Y2VycHQgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UuZXhjZXJwdCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZFNldmVyaXR5ICYmICFWQUxJRF9TRVZFUklUWS5oYXMobWVzc2FnZS5zZXZlcml0eSkpIHtcbiAgICAgICAgaW52YWxpZFNldmVyaXR5ID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKFwiTWVzc2FnZS5zZXZlcml0eSBtdXN0IGJlICdlcnJvcicsICd3YXJuaW5nJyBvciAnaW5mbydcIilcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZFVSTCAmJiBtZXNzYWdlLnVybCAmJiB0eXBlb2YgbWVzc2FnZS51cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGludmFsaWRVUkwgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UudXJsIG11c3QgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkRGVzY3JpcHRpb24gJiYgbWVzc2FnZS5kZXNjcmlwdGlvbiAmJiB0eXBlb2YgbWVzc2FnZS5kZXNjcmlwdGlvbiAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbWVzc2FnZS5kZXNjcmlwdGlvbiAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW52YWxpZERlc2NyaXB0aW9uID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLmRlc2NyaXB0aW9uIG11c3QgYmUgYSBmdW5jdGlvbiBvciBzdHJpbmcnKVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlcy5wdXNoKCdMaW50ZXIgUmVzdWx0IG11c3QgYmUgYW4gQXJyYXknKVxuICB9XG5cbiAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgIHNob3dFcnJvcignSW52YWxpZCBMaW50ZXIgUmVzdWx0IHJlY2VpdmVkJywgYFRoZXNlIGlzc3VlcyB3ZXJlIGVuY291bnRlcmVkIHdoaWxlIHByb2Nlc3NpbmcgbWVzc2FnZXMgZnJvbSBhIGxpbnRlciBuYW1lZCAnJHtsaW50ZXJOYW1lfSdgLCBtZXNzYWdlcylcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3kobGludGVyTmFtZTogc3RyaW5nLCBlbnRyaWVzOiBBcnJheTxNZXNzYWdlTGVnYWN5Pik6IGJvb2xlYW4ge1xuICBjb25zdCBtZXNzYWdlcyA9IFtdXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZW50cmllcykpIHtcbiAgICBsZXQgaW52YWxpZEZpeCA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRUeXBlID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZENsYXNzID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZFJhbmdlID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZFRyYWNlID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZENvbnRlbnQgPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkRmlsZVBhdGggPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkU2V2ZXJpdHkgPSBmYWxzZVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlbnRyaWVzW2ldXG4gICAgICBpZiAoIWludmFsaWRUeXBlICYmIHR5cGVvZiBtZXNzYWdlLnR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGludmFsaWRUeXBlID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLnR5cGUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB9XG4gICAgICBpZiAoIWludmFsaWRDb250ZW50ICYmICgodHlwZW9mIG1lc3NhZ2UudGV4dCAhPT0gJ3N0cmluZycgJiYgKHR5cGVvZiBtZXNzYWdlLmh0bWwgIT09ICdzdHJpbmcnICYmICEobWVzc2FnZS5odG1sIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSkgfHwgKCFtZXNzYWdlLnRleHQgJiYgIW1lc3NhZ2UuaHRtbCkpKSB7XG4gICAgICAgIGludmFsaWRDb250ZW50ID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLnRleHQgb3IgTWVzc2FnZS5odG1sIG11c3QgaGF2ZSBhIHZhbGlkIHZhbHVlJylcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZEZpbGVQYXRoICYmIG1lc3NhZ2UuZmlsZVBhdGggJiYgdHlwZW9mIG1lc3NhZ2UuZmlsZVBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGludmFsaWRGaWxlUGF0aCA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5maWxlUGF0aCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZFJhbmdlICYmIG1lc3NhZ2UucmFuZ2UgJiYgdHlwZW9mIG1lc3NhZ2UucmFuZ2UgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIGludmFsaWRSYW5nZSA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5yYW5nZSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgICB9IGVsc2UgaWYgKCFpbnZhbGlkUmFuZ2UgJiYgbWVzc2FnZS5yYW5nZSkge1xuICAgICAgICBjb25zdCByYW5nZSA9IFJhbmdlLmZyb21PYmplY3QobWVzc2FnZS5yYW5nZSlcbiAgICAgICAgaWYgKE51bWJlci5pc05hTihyYW5nZS5zdGFydC5yb3cpIHx8IE51bWJlci5pc05hTihyYW5nZS5zdGFydC5jb2x1bW4pIHx8IE51bWJlci5pc05hTihyYW5nZS5lbmQucm93KSB8fCBOdW1iZXIuaXNOYU4ocmFuZ2UuZW5kLmNvbHVtbikpIHtcbiAgICAgICAgICBpbnZhbGlkUmFuZ2UgPSB0cnVlXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5yYW5nZSBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkQ2xhc3MgJiYgbWVzc2FnZS5jbGFzcyAmJiB0eXBlb2YgbWVzc2FnZS5jbGFzcyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW52YWxpZENsYXNzID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLmNsYXNzIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkU2V2ZXJpdHkgJiYgbWVzc2FnZS5zZXZlcml0eSAmJiAhVkFMSURfU0VWRVJJVFkuaGFzKG1lc3NhZ2Uuc2V2ZXJpdHkpKSB7XG4gICAgICAgIGludmFsaWRTZXZlcml0eSA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaChcIk1lc3NhZ2Uuc2V2ZXJpdHkgbXVzdCBiZSAnZXJyb3InLCAnd2FybmluZycgb3IgJ2luZm8nXCIpXG4gICAgICB9XG4gICAgICBpZiAoIWludmFsaWRUcmFjZSAmJiBtZXNzYWdlLnRyYWNlICYmICFBcnJheS5pc0FycmF5KG1lc3NhZ2UudHJhY2UpKSB7XG4gICAgICAgIGludmFsaWRUcmFjZSA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS50cmFjZSBtdXN0IGJlIGFuIEFycmF5JylcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZEZpeCAmJiBtZXNzYWdlLmZpeCAmJiAodHlwZW9mIG1lc3NhZ2UuZml4LnJhbmdlICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgbWVzc2FnZS5maXgubmV3VGV4dCAhPT0gJ3N0cmluZycgfHwgKG1lc3NhZ2UuZml4Lm9sZFRleHQgJiYgdHlwZW9mIG1lc3NhZ2UuZml4Lm9sZFRleHQgIT09ICdzdHJpbmcnKSkpIHtcbiAgICAgICAgaW52YWxpZEZpeCA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5maXggbXVzdCBiZSB2YWxpZCcpXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2VzLnB1c2goJ0xpbnRlciBSZXN1bHQgbXVzdCBiZSBhbiBBcnJheScpXG4gIH1cblxuICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgc2hvd0Vycm9yKCdJbnZhbGlkIExpbnRlciBSZXN1bHQgcmVjZWl2ZWQnLCBgVGhlc2UgaXNzdWVzIHdlcmUgZW5jb3VudGVyZWQgd2hpbGUgcHJvY2Vzc2luZyBtZXNzYWdlcyBmcm9tIGEgbGludGVyIG5hbWVkICcke2xpbnRlck5hbWV9J2AsIG1lc3NhZ2VzKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IHtcbiAgdmFsaWRhdGVVSSBhcyB1aSxcbiAgdmFsaWRhdGVMaW50ZXIgYXMgbGludGVyLFxuICB2YWxpZGF0ZUluZGllIGFzIGluZGllLFxuICB2YWxpZGF0ZU1lc3NhZ2VzIGFzIG1lc3NhZ2VzLFxuICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5IGFzIG1lc3NhZ2VzTGVnYWN5LFxufVxuIl19