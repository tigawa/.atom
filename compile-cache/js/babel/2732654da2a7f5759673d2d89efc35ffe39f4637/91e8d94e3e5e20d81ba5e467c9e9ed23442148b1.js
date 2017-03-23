Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messagesLegacy = exports.messages = exports.indie = exports.linter = exports.ui = undefined;

var _atom = require('atom');

var _helpers = require('./helpers');

const VALID_SEVERITY = new Set(['error', 'warning', 'info']);

function validateUI(ui) {
  const messages = [];

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
    (0, _helpers.showError)('Invalid UI received', `These issues were encountered while registering the UI named '${ui && ui.name ? ui.name : 'Unknown'}'`, messages);
    return false;
  }

  return true;
}

function validateLinter(linter, version) {
  const messages = [];

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
    (0, _helpers.showError)('Invalid Linter received', `These issues were encountered while registering a Linter named '${linter && linter.name ? linter.name : 'Unknown'}'`, messages);
    return false;
  }

  return true;
}

function validateIndie(indie) {
  const messages = [];

  if (indie && typeof indie === 'object') {
    if (typeof indie.name !== 'string') {
      messages.push('Indie.name must be a string');
    }
  } else {
    messages.push('Indie must be an object');
  }

  if (messages.length) {
    (0, _helpers.showError)('Invalid Indie received', `These issues were encountered while registering an Indie Linter named '${indie && indie.name ? indie.name : 'Unknown'}'`, messages);
    return false;
  }

  return true;
}

function validateMessages(linterName, entries) {
  const messages = [];

  if (Array.isArray(entries)) {
    let invalidURL = false;
    let invalidIcon = false;
    let invalidExcerpt = false;
    let invalidLocation = false;
    let invalidSeverity = false;
    let invalidSolution = false;
    let invalidReference = false;
    let invalidDescription = false;

    for (let i = 0, length = entries.length; i < length; ++i) {
      const message = entries[i];
      const reference = message.reference;
      if (!invalidIcon && message.icon && typeof message.icon !== 'string') {
        invalidIcon = true;
        messages.push('Message.icon must be a string');
      }
      if (!invalidLocation && (!message.location || typeof message.location !== 'object' || typeof message.location.file !== 'string' || typeof message.location.position !== 'object' || !message.location.position)) {
        invalidLocation = true;
        messages.push('Message.location must be valid');
      } else if (!invalidLocation) {
        const range = _atom.Range.fromObject(message.location.position);
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
        const position = _atom.Point.fromObject(reference.position);
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
    (0, _helpers.showError)('Invalid Linter Result received', `These issues were encountered while processing messages from a linter named '${linterName}'`, messages);
    return false;
  }

  return true;
}

function validateMessagesLegacy(linterName, entries) {
  const messages = [];

  if (Array.isArray(entries)) {
    let invalidFix = false;
    let invalidType = false;
    let invalidClass = false;
    let invalidRange = false;
    let invalidTrace = false;
    let invalidContent = false;
    let invalidFilePath = false;
    let invalidSeverity = false;

    for (let i = 0, length = entries.length; i < length; ++i) {
      const message = entries[i];
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
        const range = _atom.Range.fromObject(message.range);
        if (Number.isNaN(range.start.row) || Number.isNaN(range.start.column) || Number.isNaN(range.end.row) || Number.isNaN(range.end.column)) {
          invalidRange = true;
          messages.push('Message.range should not contain NaN coordinates');
        }
      }
      if (!invalidClass && message.class && typeof message.class !== 'string') {
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
    (0, _helpers.showError)('Invalid Linter Result received', `These issues were encountered while processing messages from a linter named '${linterName}'`, messages);
    return false;
  }

  return true;
}

exports.ui = validateUI;
exports.linter = validateLinter;
exports.indie = validateIndie;
exports.messages = validateMessages;
exports.messagesLegacy = validateMessagesLegacy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlZBTElEX1NFVkVSSVRZIiwiU2V0IiwidmFsaWRhdGVVSSIsInVpIiwibWVzc2FnZXMiLCJuYW1lIiwicHVzaCIsImRpZEJlZ2luTGludGluZyIsImRpZEZpbmlzaExpbnRpbmciLCJyZW5kZXIiLCJkaXNwb3NlIiwibGVuZ3RoIiwidmFsaWRhdGVMaW50ZXIiLCJsaW50ZXIiLCJ2ZXJzaW9uIiwic2NvcGUiLCJsaW50T25GbHkiLCJsaW50c09uQ2hhbmdlIiwiQXJyYXkiLCJpc0FycmF5IiwiZ3JhbW1hclNjb3BlcyIsImxpbnQiLCJ2YWxpZGF0ZUluZGllIiwiaW5kaWUiLCJ2YWxpZGF0ZU1lc3NhZ2VzIiwibGludGVyTmFtZSIsImVudHJpZXMiLCJpbnZhbGlkVVJMIiwiaW52YWxpZEljb24iLCJpbnZhbGlkRXhjZXJwdCIsImludmFsaWRMb2NhdGlvbiIsImludmFsaWRTZXZlcml0eSIsImludmFsaWRTb2x1dGlvbiIsImludmFsaWRSZWZlcmVuY2UiLCJpbnZhbGlkRGVzY3JpcHRpb24iLCJpIiwibWVzc2FnZSIsInJlZmVyZW5jZSIsImljb24iLCJsb2NhdGlvbiIsImZpbGUiLCJwb3NpdGlvbiIsInJhbmdlIiwiZnJvbU9iamVjdCIsIk51bWJlciIsImlzTmFOIiwic3RhcnQiLCJyb3ciLCJjb2x1bW4iLCJlbmQiLCJzb2x1dGlvbnMiLCJleGNlcnB0IiwiaGFzIiwic2V2ZXJpdHkiLCJ1cmwiLCJkZXNjcmlwdGlvbiIsInZhbGlkYXRlTWVzc2FnZXNMZWdhY3kiLCJpbnZhbGlkRml4IiwiaW52YWxpZFR5cGUiLCJpbnZhbGlkQ2xhc3MiLCJpbnZhbGlkUmFuZ2UiLCJpbnZhbGlkVHJhY2UiLCJpbnZhbGlkQ29udGVudCIsImludmFsaWRGaWxlUGF0aCIsInR5cGUiLCJ0ZXh0IiwiaHRtbCIsIkhUTUxFbGVtZW50IiwiZmlsZVBhdGgiLCJjbGFzcyIsInRyYWNlIiwiZml4IiwibmV3VGV4dCIsIm9sZFRleHQi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VUFBVyxHQUF2SSxFQUEySXJCLFFBQTNJO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7O0FBRUQsU0FBTyxJQUFQO0FBQ0Q7O1FBR2VELEUsR0FBZEQsVTtRQUNrQlcsTSxHQUFsQkQsYztRQUNpQlcsSyxHQUFqQkQsYTtRQUNvQmxCLFEsR0FBcEJvQixnQjtRQUMwQmtELGMsR0FBMUJsQixzQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IFJhbmdlLCBQb2ludCB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBzaG93RXJyb3IgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IFVJLCBMaW50ZXIsIE1lc3NhZ2UsIE1lc3NhZ2VMZWdhY3ksIEluZGllIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNvbnN0IFZBTElEX1NFVkVSSVRZID0gbmV3IFNldChbJ2Vycm9yJywgJ3dhcm5pbmcnLCAnaW5mbyddKVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVVJKHVpOiBVSSk6IGJvb2xlYW4ge1xuICBjb25zdCBtZXNzYWdlcyA9IFtdXG5cbiAgaWYgKHVpICYmIHR5cGVvZiB1aSA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAodHlwZW9mIHVpLm5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKCdVSS5uYW1lIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHVpLmRpZEJlZ2luTGludGluZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbWVzc2FnZXMucHVzaCgnVUkuZGlkQmVnaW5MaW50aW5nIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdWkuZGlkRmluaXNoTGludGluZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbWVzc2FnZXMucHVzaCgnVUkuZGlkRmluaXNoTGludGluZyBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHVpLnJlbmRlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbWVzc2FnZXMucHVzaCgnVUkucmVuZGVyIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdWkuZGlzcG9zZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbWVzc2FnZXMucHVzaCgnVUkuZGlzcG9zZSBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlcy5wdXNoKCdVSSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgc2hvd0Vycm9yKCdJbnZhbGlkIFVJIHJlY2VpdmVkJywgYFRoZXNlIGlzc3VlcyB3ZXJlIGVuY291bnRlcmVkIHdoaWxlIHJlZ2lzdGVyaW5nIHRoZSBVSSBuYW1lZCAnJHt1aSAmJiB1aS5uYW1lID8gdWkubmFtZSA6ICdVbmtub3duJ30nYCwgbWVzc2FnZXMpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUxpbnRlcihsaW50ZXI6IExpbnRlciwgdmVyc2lvbjogMSB8IDIpOiBib29sZWFuIHtcbiAgY29uc3QgbWVzc2FnZXMgPSBbXVxuXG4gIGlmIChsaW50ZXIgJiYgdHlwZW9mIGxpbnRlciA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAodHlwZW9mIGxpbnRlci5uYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHZlcnNpb24gPT09IDIpIHtcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTGludGVyLm5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB9IGVsc2UgbGludGVyLm5hbWUgPSAnVW5rbm93bidcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsaW50ZXIuc2NvcGUgIT09ICdzdHJpbmcnIHx8IChsaW50ZXIuc2NvcGUgIT09ICdmaWxlJyAmJiBsaW50ZXIuc2NvcGUgIT09ICdwcm9qZWN0JykpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goXCJMaW50ZXIuc2NvcGUgbXVzdCBiZSBlaXRoZXIgJ2ZpbGUnIG9yICdwcm9qZWN0J1wiKVxuICAgIH1cbiAgICBpZiAodmVyc2lvbiA9PT0gMSAmJiB0eXBlb2YgbGludGVyLmxpbnRPbkZseSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKCdMaW50ZXIubGludE9uRmx5IG11c3QgYmUgYSBib29sZWFuJylcbiAgICB9IGVsc2UgaWYgKHZlcnNpb24gPT09IDIgJiYgdHlwZW9mIGxpbnRlci5saW50c09uQ2hhbmdlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJ0xpbnRlci5saW50c09uQ2hhbmdlIG11c3QgYmUgYSBib29sZWFuJylcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxpbnRlci5ncmFtbWFyU2NvcGVzKSkge1xuICAgICAgbWVzc2FnZXMucHVzaCgnTGludGVyLmdyYW1tYXJTY29wZXMgbXVzdCBiZSBhbiBBcnJheScpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGludGVyLmxpbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJ0xpbnRlci5saW50IG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2VzLnB1c2goJ0xpbnRlciBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgc2hvd0Vycm9yKCdJbnZhbGlkIExpbnRlciByZWNlaXZlZCcsIGBUaGVzZSBpc3N1ZXMgd2VyZSBlbmNvdW50ZXJlZCB3aGlsZSByZWdpc3RlcmluZyBhIExpbnRlciBuYW1lZCAnJHtsaW50ZXIgJiYgbGludGVyLm5hbWUgPyBsaW50ZXIubmFtZSA6ICdVbmtub3duJ30nYCwgbWVzc2FnZXMpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUluZGllKGluZGllOiBJbmRpZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtZXNzYWdlcyA9IFtdXG5cbiAgaWYgKGluZGllICYmIHR5cGVvZiBpbmRpZSA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAodHlwZW9mIGluZGllLm5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKCdJbmRpZS5uYW1lIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlcy5wdXNoKCdJbmRpZSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgc2hvd0Vycm9yKCdJbnZhbGlkIEluZGllIHJlY2VpdmVkJywgYFRoZXNlIGlzc3VlcyB3ZXJlIGVuY291bnRlcmVkIHdoaWxlIHJlZ2lzdGVyaW5nIGFuIEluZGllIExpbnRlciBuYW1lZCAnJHtpbmRpZSAmJiBpbmRpZS5uYW1lID8gaW5kaWUubmFtZSA6ICdVbmtub3duJ30nYCwgbWVzc2FnZXMpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1lc3NhZ2VzKGxpbnRlck5hbWU6IHN0cmluZywgZW50cmllczogQXJyYXk8TWVzc2FnZT4pOiBib29sZWFuIHtcbiAgY29uc3QgbWVzc2FnZXMgPSBbXVxuXG4gIGlmIChBcnJheS5pc0FycmF5KGVudHJpZXMpKSB7XG4gICAgbGV0IGludmFsaWRVUkwgPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkSWNvbiA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRFeGNlcnB0ID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZExvY2F0aW9uID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZFNldmVyaXR5ID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZFNvbHV0aW9uID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZFJlZmVyZW5jZSA9IGZhbHNlXG4gICAgbGV0IGludmFsaWREZXNjcmlwdGlvbiA9IGZhbHNlXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVudHJpZXNbaV1cbiAgICAgIGNvbnN0IHJlZmVyZW5jZSA9IG1lc3NhZ2UucmVmZXJlbmNlXG4gICAgICBpZiAoIWludmFsaWRJY29uICYmIG1lc3NhZ2UuaWNvbiAmJiB0eXBlb2YgbWVzc2FnZS5pY29uICE9PSAnc3RyaW5nJykge1xuICAgICAgICBpbnZhbGlkSWNvbiA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5pY29uIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkTG9jYXRpb24gJiYgKCFtZXNzYWdlLmxvY2F0aW9uIHx8IHR5cGVvZiBtZXNzYWdlLmxvY2F0aW9uICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgbWVzc2FnZS5sb2NhdGlvbi5maWxlICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgbWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiAhPT0gJ29iamVjdCcgfHwgIW1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pKSB7XG4gICAgICAgIGludmFsaWRMb2NhdGlvbiA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5sb2NhdGlvbiBtdXN0IGJlIHZhbGlkJylcbiAgICAgIH0gZWxzZSBpZiAoIWludmFsaWRMb2NhdGlvbikge1xuICAgICAgICBjb25zdCByYW5nZSA9IFJhbmdlLmZyb21PYmplY3QobWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbilcbiAgICAgICAgaWYgKE51bWJlci5pc05hTihyYW5nZS5zdGFydC5yb3cpIHx8IE51bWJlci5pc05hTihyYW5nZS5zdGFydC5jb2x1bW4pIHx8IE51bWJlci5pc05hTihyYW5nZS5lbmQucm93KSB8fCBOdW1iZXIuaXNOYU4ocmFuZ2UuZW5kLmNvbHVtbikpIHtcbiAgICAgICAgICBpbnZhbGlkTG9jYXRpb24gPSB0cnVlXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkU29sdXRpb24gJiYgbWVzc2FnZS5zb2x1dGlvbnMgJiYgIUFycmF5LmlzQXJyYXkobWVzc2FnZS5zb2x1dGlvbnMpKSB7XG4gICAgICAgIGludmFsaWRTb2x1dGlvbiA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5zb2x1dGlvbnMgbXVzdCBiZSB2YWxpZCcpXG4gICAgICB9XG4gICAgICBpZiAoIWludmFsaWRSZWZlcmVuY2UgJiYgcmVmZXJlbmNlICYmICh0eXBlb2YgcmVmZXJlbmNlICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgcmVmZXJlbmNlLmZpbGUgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiByZWZlcmVuY2UucG9zaXRpb24gIT09ICdvYmplY3QnIHx8ICFyZWZlcmVuY2UucG9zaXRpb24pKSB7XG4gICAgICAgIGludmFsaWRSZWZlcmVuY2UgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UucmVmZXJlbmNlIG11c3QgYmUgdmFsaWQnKVxuICAgICAgfSBlbHNlIGlmICghaW52YWxpZFJlZmVyZW5jZSAmJiByZWZlcmVuY2UpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBQb2ludC5mcm9tT2JqZWN0KHJlZmVyZW5jZS5wb3NpdGlvbilcbiAgICAgICAgaWYgKE51bWJlci5pc05hTihwb3NpdGlvbi5yb3cpIHx8IE51bWJlci5pc05hTihwb3NpdGlvbi5jb2x1bW4pKSB7XG4gICAgICAgICAgaW52YWxpZFJlZmVyZW5jZSA9IHRydWVcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLnJlZmVyZW5jZS5wb3NpdGlvbiBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkRXhjZXJwdCAmJiB0eXBlb2YgbWVzc2FnZS5leGNlcnB0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICBpbnZhbGlkRXhjZXJwdCA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS5leGNlcnB0IG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkU2V2ZXJpdHkgJiYgIVZBTElEX1NFVkVSSVRZLmhhcyhtZXNzYWdlLnNldmVyaXR5KSkge1xuICAgICAgICBpbnZhbGlkU2V2ZXJpdHkgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goXCJNZXNzYWdlLnNldmVyaXR5IG11c3QgYmUgJ2Vycm9yJywgJ3dhcm5pbmcnIG9yICdpbmZvJ1wiKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkVVJMICYmIG1lc3NhZ2UudXJsICYmIHR5cGVvZiBtZXNzYWdlLnVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW52YWxpZFVSTCA9IHRydWVcbiAgICAgICAgbWVzc2FnZXMucHVzaCgnTWVzc2FnZS51cmwgbXVzdCBhIHN0cmluZycpXG4gICAgICB9XG4gICAgICBpZiAoIWludmFsaWREZXNjcmlwdGlvbiAmJiBtZXNzYWdlLmRlc2NyaXB0aW9uICYmIHR5cGVvZiBtZXNzYWdlLmRlc2NyaXB0aW9uICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBtZXNzYWdlLmRlc2NyaXB0aW9uICE9PSAnc3RyaW5nJykge1xuICAgICAgICBpbnZhbGlkRGVzY3JpcHRpb24gPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UuZGVzY3JpcHRpb24gbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIHN0cmluZycpXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2VzLnB1c2goJ0xpbnRlciBSZXN1bHQgbXVzdCBiZSBhbiBBcnJheScpXG4gIH1cblxuICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgc2hvd0Vycm9yKCdJbnZhbGlkIExpbnRlciBSZXN1bHQgcmVjZWl2ZWQnLCBgVGhlc2UgaXNzdWVzIHdlcmUgZW5jb3VudGVyZWQgd2hpbGUgcHJvY2Vzc2luZyBtZXNzYWdlcyBmcm9tIGEgbGludGVyIG5hbWVkICcke2xpbnRlck5hbWV9J2AsIG1lc3NhZ2VzKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShsaW50ZXJOYW1lOiBzdHJpbmcsIGVudHJpZXM6IEFycmF5PE1lc3NhZ2VMZWdhY3k+KTogYm9vbGVhbiB7XG4gIGNvbnN0IG1lc3NhZ2VzID0gW11cblxuICBpZiAoQXJyYXkuaXNBcnJheShlbnRyaWVzKSkge1xuICAgIGxldCBpbnZhbGlkRml4ID0gZmFsc2VcbiAgICBsZXQgaW52YWxpZFR5cGUgPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkQ2xhc3MgPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkUmFuZ2UgPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkVHJhY2UgPSBmYWxzZVxuICAgIGxldCBpbnZhbGlkQ29udGVudCA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRGaWxlUGF0aCA9IGZhbHNlXG4gICAgbGV0IGludmFsaWRTZXZlcml0eSA9IGZhbHNlXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVudHJpZXNbaV1cbiAgICAgIGlmICghaW52YWxpZFR5cGUgJiYgdHlwZW9mIG1lc3NhZ2UudHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW52YWxpZFR5cGUgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UudHlwZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZENvbnRlbnQgJiYgKCh0eXBlb2YgbWVzc2FnZS50ZXh0ICE9PSAnc3RyaW5nJyAmJiAodHlwZW9mIG1lc3NhZ2UuaHRtbCAhPT0gJ3N0cmluZycgJiYgIShtZXNzYWdlLmh0bWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpKSB8fCAoIW1lc3NhZ2UudGV4dCAmJiAhbWVzc2FnZS5odG1sKSkpIHtcbiAgICAgICAgaW52YWxpZENvbnRlbnQgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UudGV4dCBvciBNZXNzYWdlLmh0bWwgbXVzdCBoYXZlIGEgdmFsaWQgdmFsdWUnKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkRmlsZVBhdGggJiYgbWVzc2FnZS5maWxlUGF0aCAmJiB0eXBlb2YgbWVzc2FnZS5maWxlUGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgaW52YWxpZEZpbGVQYXRoID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLmZpbGVQYXRoIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkUmFuZ2UgJiYgbWVzc2FnZS5yYW5nZSAmJiB0eXBlb2YgbWVzc2FnZS5yYW5nZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaW52YWxpZFJhbmdlID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLnJhbmdlIG11c3QgYmUgYW4gb2JqZWN0JylcbiAgICAgIH0gZWxzZSBpZiAoIWludmFsaWRSYW5nZSAmJiBtZXNzYWdlLnJhbmdlKSB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChtZXNzYWdlLnJhbmdlKVxuICAgICAgICBpZiAoTnVtYmVyLmlzTmFOKHJhbmdlLnN0YXJ0LnJvdykgfHwgTnVtYmVyLmlzTmFOKHJhbmdlLnN0YXJ0LmNvbHVtbikgfHwgTnVtYmVyLmlzTmFOKHJhbmdlLmVuZC5yb3cpIHx8IE51bWJlci5pc05hTihyYW5nZS5lbmQuY29sdW1uKSkge1xuICAgICAgICAgIGludmFsaWRSYW5nZSA9IHRydWVcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLnJhbmdlIHNob3VsZCBub3QgY29udGFpbiBOYU4gY29vcmRpbmF0ZXMnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWludmFsaWRDbGFzcyAmJiBtZXNzYWdlLmNsYXNzICYmIHR5cGVvZiBtZXNzYWdlLmNsYXNzICE9PSAnc3RyaW5nJykge1xuICAgICAgICBpbnZhbGlkQ2xhc3MgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goJ01lc3NhZ2UuY2xhc3MgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB9XG4gICAgICBpZiAoIWludmFsaWRTZXZlcml0eSAmJiBtZXNzYWdlLnNldmVyaXR5ICYmICFWQUxJRF9TRVZFUklUWS5oYXMobWVzc2FnZS5zZXZlcml0eSkpIHtcbiAgICAgICAgaW52YWxpZFNldmVyaXR5ID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKFwiTWVzc2FnZS5zZXZlcml0eSBtdXN0IGJlICdlcnJvcicsICd3YXJuaW5nJyBvciAnaW5mbydcIilcbiAgICAgIH1cbiAgICAgIGlmICghaW52YWxpZFRyYWNlICYmIG1lc3NhZ2UudHJhY2UgJiYgIUFycmF5LmlzQXJyYXkobWVzc2FnZS50cmFjZSkpIHtcbiAgICAgICAgaW52YWxpZFRyYWNlID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLnRyYWNlIG11c3QgYmUgYW4gQXJyYXknKVxuICAgICAgfVxuICAgICAgaWYgKCFpbnZhbGlkRml4ICYmIG1lc3NhZ2UuZml4ICYmICh0eXBlb2YgbWVzc2FnZS5maXgucmFuZ2UgIT09ICdvYmplY3QnIHx8IHR5cGVvZiBtZXNzYWdlLmZpeC5uZXdUZXh0ICE9PSAnc3RyaW5nJyB8fCAobWVzc2FnZS5maXgub2xkVGV4dCAmJiB0eXBlb2YgbWVzc2FnZS5maXgub2xkVGV4dCAhPT0gJ3N0cmluZycpKSkge1xuICAgICAgICBpbnZhbGlkRml4ID0gdHJ1ZVxuICAgICAgICBtZXNzYWdlcy5wdXNoKCdNZXNzYWdlLmZpeCBtdXN0IGJlIHZhbGlkJylcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbWVzc2FnZXMucHVzaCgnTGludGVyIFJlc3VsdCBtdXN0IGJlIGFuIEFycmF5JylcbiAgfVxuXG4gIGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICBzaG93RXJyb3IoJ0ludmFsaWQgTGludGVyIFJlc3VsdCByZWNlaXZlZCcsIGBUaGVzZSBpc3N1ZXMgd2VyZSBlbmNvdW50ZXJlZCB3aGlsZSBwcm9jZXNzaW5nIG1lc3NhZ2VzIGZyb20gYSBsaW50ZXIgbmFtZWQgJyR7bGludGVyTmFtZX0nYCwgbWVzc2FnZXMpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5leHBvcnQge1xuICB2YWxpZGF0ZVVJIGFzIHVpLFxuICB2YWxpZGF0ZUxpbnRlciBhcyBsaW50ZXIsXG4gIHZhbGlkYXRlSW5kaWUgYXMgaW5kaWUsXG4gIHZhbGlkYXRlTWVzc2FnZXMgYXMgbWVzc2FnZXMsXG4gIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3kgYXMgbWVzc2FnZXNMZWdhY3ksXG59XG4iXX0=