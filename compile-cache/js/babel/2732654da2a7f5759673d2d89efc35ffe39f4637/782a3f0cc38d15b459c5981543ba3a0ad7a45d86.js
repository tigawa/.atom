Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.severityNames = exports.severityScore = undefined;
exports.$range = $range;
exports.$file = $file;
exports.copySelection = copySelection;
exports.getPathOfMessage = getPathOfMessage;
exports.getEditorsMap = getEditorsMap;
exports.filterMessages = filterMessages;
exports.filterMessagesByRangeOrPoint = filterMessagesByRangeOrPoint;
exports.visitMessage = visitMessage;
exports.htmlToText = htmlToText;
exports.openExternally = openExternally;
exports.sortMessages = sortMessages;
exports.sortSolutions = sortSolutions;
exports.applySolution = applySolution;

var _atom = require('atom');

var _electron = require('electron');

const severityScore = exports.severityScore = {
  error: 3,
  warning: 2,
  info: 1
};

const severityNames = exports.severityNames = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info'
};

function $range(message) {
  return message.version === 1 ? message.range : message.location.position;
}
function $file(message) {
  return message.version === 1 ? message.filePath : message.location.file;
}
function copySelection() {
  const selection = getSelection();
  if (selection) {
    atom.clipboard.write(selection.toString());
  }
}
function getPathOfMessage(message) {
  return atom.project.relativizePath($file(message) || '')[1];
}

function getEditorsMap(editors) {
  const editorsMap = {};
  const filePaths = [];
  for (const entry of editors.editors) {
    const filePath = entry.textEditor.getPath();
    if (editorsMap[filePath]) {
      editorsMap[filePath].editors.push(entry);
    } else {
      editorsMap[filePath] = {
        added: [],
        removed: [],
        editors: [entry]
      };
      filePaths.push(filePath);
    }
  }
  return { editorsMap, filePaths };
}

function filterMessages(messages, filePath, severity = null) {
  const filtered = [];
  messages.forEach(function (message) {
    if ((filePath === null || $file(message) === filePath) && (!severity || message.severity === severity)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function filterMessagesByRangeOrPoint(messages, filePath, rangeOrPoint) {
  const filtered = [];
  const expectedRange = rangeOrPoint.constructor.name === 'Point' ? new _atom.Range(rangeOrPoint, rangeOrPoint) : _atom.Range.fromObject(rangeOrPoint);
  messages.forEach(function (message) {
    const file = $file(message);
    const range = $range(message);
    if (file && range && file === filePath && range.intersectsWith(expectedRange)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function visitMessage(message, reference = false) {
  let messageFile;
  let messagePosition;
  if (reference) {
    if (message.version !== 2) {
      console.warn('[Linter-UI-Default] Only messages v2 are allowed in jump to reference. Ignoring');
      return;
    }
    if (!message.reference || !message.reference.file) {
      console.warn('[Linter-UI-Default] Message does not have a valid reference. Ignoring');
      return;
    }
    messageFile = message.reference.file;
    messagePosition = message.reference.position;
  } else {
    const messageRange = $range(message);
    messageFile = $file(message);
    if (messageRange) {
      messagePosition = messageRange.start;
    }
  }
  atom.workspace.open(messageFile, { searchAllPanes: true }).then(function () {
    const textEditor = atom.workspace.getActiveTextEditor();
    if (messagePosition && textEditor && textEditor.getPath() === messageFile) {
      textEditor.setCursorBufferPosition(messagePosition);
    }
  });
}

// NOTE: Code Point 160 === &nbsp;
const replacementRegex = new RegExp(String.fromCodePoint(160), 'g');
function htmlToText(html) {
  const element = document.createElement('div');
  if (typeof html === 'string') {
    element.innerHTML = html;
  } else {
    element.appendChild(html.cloneNode(true));
  }
  // NOTE: Convert &nbsp; to regular whitespace
  return element.textContent.replace(replacementRegex, ' ');
}
function openExternally(message) {
  if (message.version === 1 && message.type.toLowerCase() === 'trace') {
    visitMessage(message);
    return;
  }

  let link;
  let searchTerm = '';
  if (message.version === 2) {
    if (message.url) {
      link = message.url;
    } else {
      searchTerm = message.excerpt;
    }
  } else {
    searchTerm = `${message.linterName} ${message.excerpt || message.text || htmlToText(message.html || '')}`;
  }
  // $FlowIgnore: Flow has a bug where it thinks the above line produces a mixed result instead of string
  link = link || `https://google.com/search?q=${encodeURIComponent(searchTerm)}`;
  _electron.shell.openExternal(link);
}

function sortMessages(sortInfo, rows) {
  const sortColumns = {};

  sortInfo.forEach(function (entry) {
    sortColumns[entry.column] = entry.type;
  });

  return rows.slice().sort(function (a, b) {
    if (sortColumns.severity) {
      const multiplyWith = sortColumns.severity === 'asc' ? 1 : -1;
      const severityA = severityScore[a.severity];
      const severityB = severityScore[b.severity];
      if (severityA !== severityB) {
        return multiplyWith * (severityA > severityB ? 1 : -1);
      }
    }
    if (sortColumns.linterName) {
      const multiplyWith = sortColumns.linterName === 'asc' ? 1 : -1;
      const sortValue = a.severity.localeCompare(b.severity);
      if (sortValue !== 0) {
        return multiplyWith * sortValue;
      }
    }
    if (sortColumns.file) {
      const multiplyWith = sortColumns.file === 'asc' ? 1 : -1;
      const fileA = getPathOfMessage(a);
      const fileALength = fileA.length;
      const fileB = getPathOfMessage(b);
      const fileBLength = fileB.length;
      if (fileALength !== fileBLength) {
        return multiplyWith * (fileALength > fileBLength ? 1 : -1);
      } else if (fileA !== fileB) {
        return multiplyWith * fileA.localeCompare(fileB);
      }
    }
    if (sortColumns.line) {
      const multiplyWith = sortColumns.line === 'asc' ? 1 : -1;
      const rangeA = $range(a);
      const rangeB = $range(b);
      if (rangeA && !rangeB) {
        return 1;
      } else if (rangeB && !rangeA) {
        return -1;
      } else if (rangeA && rangeB) {
        if (rangeA.start.row !== rangeB.start.row) {
          return multiplyWith * (rangeA.start.row > rangeB.start.row ? 1 : -1);
        }
        if (rangeA.start.column !== rangeB.start.column) {
          return multiplyWith * (rangeA.start.column > rangeB.start.column ? 1 : -1);
        }
      }
    }

    return 0;
  });
}

function sortSolutions(solutions) {
  return solutions.slice().sort(function (a, b) {
    return b.priority - a.priority;
  });
}

function applySolution(textEditor, version, solution) {
  if (solution.apply) {
    solution.apply();
    return true;
  }
  const range = version === 1 ? solution.range : solution.position;
  const currentText = version === 1 ? solution.oldText : solution.currentText;
  const replaceWith = version === 1 ? solution.newText : solution.replaceWith;
  if (currentText) {
    const textInRange = textEditor.getTextInBufferRange(range);
    if (currentText !== textInRange) {
      console.warn('[linter-ui-default] Not applying fix because text did not match the expected one', 'expected', currentText, 'but got', textInRange);
      return false;
    }
  }
  textEditor.setTextInBufferRange(range, replaceWith);
  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOlsiJHJhbmdlIiwiJGZpbGUiLCJjb3B5U2VsZWN0aW9uIiwiZ2V0UGF0aE9mTWVzc2FnZSIsImdldEVkaXRvcnNNYXAiLCJmaWx0ZXJNZXNzYWdlcyIsImZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQiLCJ2aXNpdE1lc3NhZ2UiLCJodG1sVG9UZXh0Iiwib3BlbkV4dGVybmFsbHkiLCJzb3J0TWVzc2FnZXMiLCJzb3J0U29sdXRpb25zIiwiYXBwbHlTb2x1dGlvbiIsInNldmVyaXR5U2NvcmUiLCJlcnJvciIsIndhcm5pbmciLCJpbmZvIiwic2V2ZXJpdHlOYW1lcyIsIm1lc3NhZ2UiLCJ2ZXJzaW9uIiwicmFuZ2UiLCJsb2NhdGlvbiIsInBvc2l0aW9uIiwiZmlsZVBhdGgiLCJmaWxlIiwic2VsZWN0aW9uIiwiZ2V0U2VsZWN0aW9uIiwiYXRvbSIsImNsaXBib2FyZCIsIndyaXRlIiwidG9TdHJpbmciLCJwcm9qZWN0IiwicmVsYXRpdml6ZVBhdGgiLCJlZGl0b3JzIiwiZWRpdG9yc01hcCIsImZpbGVQYXRocyIsImVudHJ5IiwidGV4dEVkaXRvciIsImdldFBhdGgiLCJwdXNoIiwiYWRkZWQiLCJyZW1vdmVkIiwibWVzc2FnZXMiLCJzZXZlcml0eSIsImZpbHRlcmVkIiwiZm9yRWFjaCIsInJhbmdlT3JQb2ludCIsImV4cGVjdGVkUmFuZ2UiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJmcm9tT2JqZWN0IiwiaW50ZXJzZWN0c1dpdGgiLCJyZWZlcmVuY2UiLCJtZXNzYWdlRmlsZSIsIm1lc3NhZ2VQb3NpdGlvbiIsImNvbnNvbGUiLCJ3YXJuIiwibWVzc2FnZVJhbmdlIiwic3RhcnQiLCJ3b3Jrc3BhY2UiLCJvcGVuIiwic2VhcmNoQWxsUGFuZXMiLCJ0aGVuIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsInNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIiwicmVwbGFjZW1lbnRSZWdleCIsIlJlZ0V4cCIsIlN0cmluZyIsImZyb21Db2RlUG9pbnQiLCJodG1sIiwiZWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwidGV4dENvbnRlbnQiLCJyZXBsYWNlIiwidHlwZSIsInRvTG93ZXJDYXNlIiwibGluayIsInNlYXJjaFRlcm0iLCJ1cmwiLCJleGNlcnB0IiwibGludGVyTmFtZSIsInRleHQiLCJlbmNvZGVVUklDb21wb25lbnQiLCJvcGVuRXh0ZXJuYWwiLCJzb3J0SW5mbyIsInJvd3MiLCJzb3J0Q29sdW1ucyIsImNvbHVtbiIsInNsaWNlIiwic29ydCIsImEiLCJiIiwibXVsdGlwbHlXaXRoIiwic2V2ZXJpdHlBIiwic2V2ZXJpdHlCIiwic29ydFZhbHVlIiwibG9jYWxlQ29tcGFyZSIsImZpbGVBIiwiZmlsZUFMZW5ndGgiLCJsZW5ndGgiLCJmaWxlQiIsImZpbGVCTGVuZ3RoIiwibGluZSIsInJhbmdlQSIsInJhbmdlQiIsInJvdyIsInNvbHV0aW9ucyIsInByaW9yaXR5Iiwic29sdXRpb24iLCJhcHBseSIsImN1cnJlbnRUZXh0Iiwib2xkVGV4dCIsInJlcGxhY2VXaXRoIiwibmV3VGV4dCIsInRleHRJblJhbmdlIiwiZ2V0VGV4dEluQnVmZmVyUmFuZ2UiLCJzZXRUZXh0SW5CdWZmZXJSYW5nZSJdLCJtYXBwaW5ncyI6Ijs7OztRQW9CZ0JBLE0sR0FBQUEsTTtRQUdBQyxLLEdBQUFBLEs7UUFHQUMsYSxHQUFBQSxhO1FBTUFDLGdCLEdBQUFBLGdCO1FBSUFDLGEsR0FBQUEsYTtRQW1CQUMsYyxHQUFBQSxjO1FBVUFDLDRCLEdBQUFBLDRCO1FBYUFDLFksR0FBQUEsWTtRQStCQUMsVSxHQUFBQSxVO1FBVUFDLGMsR0FBQUEsYztRQXNCQUMsWSxHQUFBQSxZO1FBOERBQyxhLEdBQUFBLGE7UUFNQUMsYSxHQUFBQSxhOztBQS9NaEI7O0FBQ0E7O0FBS08sTUFBTUMsd0NBQWdCO0FBQzNCQyxTQUFPLENBRG9CO0FBRTNCQyxXQUFTLENB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QUFDRGpGLGFBQVdtRixvQkFBWCxDQUFnQ3BHLEtBQWhDLEVBQXVDZ0csV0FBdkM7QUFDQSxTQUFPLElBQVA7QUFDRCIsImZpbGUiOiJoZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgc2hlbGwgfSBmcm9tICdlbGVjdHJvbidcbmltcG9ydCB0eXBlIHsgUG9pbnQsIFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgRWRpdG9ycyBmcm9tICcuL2VkaXRvcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3Qgc2V2ZXJpdHlTY29yZSA9IHtcbiAgZXJyb3I6IDMsXG4gIHdhcm5pbmc6IDIsXG4gIGluZm86IDEsXG59XG5cbmV4cG9ydCBjb25zdCBzZXZlcml0eU5hbWVzID0ge1xuICBlcnJvcjogJ0Vycm9yJyxcbiAgd2FybmluZzogJ1dhcm5pbmcnLFxuICBpbmZvOiAnSW5mbycsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiAkcmFuZ2UobWVzc2FnZTogTGludGVyTWVzc2FnZSk6ID9PYmplY3Qge1xuICByZXR1cm4gbWVzc2FnZS52ZXJzaW9uID09PSAxID8gbWVzc2FnZS5yYW5nZSA6IG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb25cbn1cbmV4cG9ydCBmdW5jdGlvbiAkZmlsZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogP3N0cmluZyB7XG4gIHJldHVybiBtZXNzYWdlLnZlcnNpb24gPT09IDEgPyBtZXNzYWdlLmZpbGVQYXRoIDogbWVzc2FnZS5sb2NhdGlvbi5maWxlXG59XG5leHBvcnQgZnVuY3Rpb24gY29weVNlbGVjdGlvbigpIHtcbiAgY29uc3Qgc2VsZWN0aW9uID0gZ2V0U2VsZWN0aW9uKClcbiAgaWYgKHNlbGVjdGlvbikge1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGlvbi50b1N0cmluZygpKVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0aE9mTWVzc2FnZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aCgkZmlsZShtZXNzYWdlKSB8fCAnJylbMV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVkaXRvcnNNYXAoZWRpdG9yczogRWRpdG9ycyk6IHsgZWRpdG9yc01hcDogT2JqZWN0LCBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4gfSB7XG4gIGNvbnN0IGVkaXRvcnNNYXAgPSB7fVxuICBjb25zdCBmaWxlUGF0aHMgPSBbXVxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVkaXRvcnMuZWRpdG9ycykge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZW50cnkudGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBpZiAoZWRpdG9yc01hcFtmaWxlUGF0aF0pIHtcbiAgICAgIGVkaXRvcnNNYXBbZmlsZVBhdGhdLmVkaXRvcnMucHVzaChlbnRyeSlcbiAgICB9IGVsc2Uge1xuICAgICAgZWRpdG9yc01hcFtmaWxlUGF0aF0gPSB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICAgIGVkaXRvcnM6IFtlbnRyeV0sXG4gICAgICB9XG4gICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgZWRpdG9yc01hcCwgZmlsZVBhdGhzIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1lc3NhZ2VzKG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPiwgZmlsZVBhdGg6ID9zdHJpbmcsIHNldmVyaXR5OiA/c3RyaW5nID0gbnVsbCk6IEFycmF5PExpbnRlck1lc3NhZ2U+IHtcbiAgY29uc3QgZmlsdGVyZWQgPSBbXVxuICBtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBpZiAoKGZpbGVQYXRoID09PSBudWxsIHx8ICRmaWxlKG1lc3NhZ2UpID09PSBmaWxlUGF0aCkgJiYgKCFzZXZlcml0eSB8fCBtZXNzYWdlLnNldmVyaXR5ID09PSBzZXZlcml0eSkpIHtcbiAgICAgIGZpbHRlcmVkLnB1c2gobWVzc2FnZSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiBmaWx0ZXJlZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludChtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+IHwgQXJyYXk8TGludGVyTWVzc2FnZT4sIGZpbGVQYXRoOiBzdHJpbmcsIHJhbmdlT3JQb2ludDogUG9pbnQgfCBSYW5nZSk6IEFycmF5PExpbnRlck1lc3NhZ2U+IHtcbiAgY29uc3QgZmlsdGVyZWQgPSBbXVxuICBjb25zdCBleHBlY3RlZFJhbmdlID0gcmFuZ2VPclBvaW50LmNvbnN0cnVjdG9yLm5hbWUgPT09ICdQb2ludCcgPyBuZXcgUmFuZ2UocmFuZ2VPclBvaW50LCByYW5nZU9yUG9pbnQpIDogUmFuZ2UuZnJvbU9iamVjdChyYW5nZU9yUG9pbnQpXG4gIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnN0IGZpbGUgPSAkZmlsZShtZXNzYWdlKVxuICAgIGNvbnN0IHJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgaWYgKGZpbGUgJiYgcmFuZ2UgJiYgZmlsZSA9PT0gZmlsZVBhdGggJiYgcmFuZ2UuaW50ZXJzZWN0c1dpdGgoZXhwZWN0ZWRSYW5nZSkpIHtcbiAgICAgIGZpbHRlcmVkLnB1c2gobWVzc2FnZSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiBmaWx0ZXJlZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRNZXNzYWdlKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UsIHJlZmVyZW5jZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gIGxldCBtZXNzYWdlRmlsZVxuICBsZXQgbWVzc2FnZVBvc2l0aW9uXG4gIGlmIChyZWZlcmVuY2UpIHtcbiAgICBpZiAobWVzc2FnZS52ZXJzaW9uICE9PSAyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tMaW50ZXItVUktRGVmYXVsdF0gT25seSBtZXNzYWdlcyB2MiBhcmUgYWxsb3dlZCBpbiBqdW1wIHRvIHJlZmVyZW5jZS4gSWdub3JpbmcnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghbWVzc2FnZS5yZWZlcmVuY2UgfHwgIW1lc3NhZ2UucmVmZXJlbmNlLmZpbGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignW0xpbnRlci1VSS1EZWZhdWx0XSBNZXNzYWdlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWZlcmVuY2UuIElnbm9yaW5nJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBtZXNzYWdlRmlsZSA9IG1lc3NhZ2UucmVmZXJlbmNlLmZpbGVcbiAgICBtZXNzYWdlUG9zaXRpb24gPSBtZXNzYWdlLnJlZmVyZW5jZS5wb3NpdGlvblxuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1lc3NhZ2VSYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuICAgIG1lc3NhZ2VGaWxlID0gJGZpbGUobWVzc2FnZSlcbiAgICBpZiAobWVzc2FnZVJhbmdlKSB7XG4gICAgICBtZXNzYWdlUG9zaXRpb24gPSBtZXNzYWdlUmFuZ2Uuc3RhcnRcbiAgICB9XG4gIH1cbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihtZXNzYWdlRmlsZSwgeyBzZWFyY2hBbGxQYW5lczogdHJ1ZSB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiAobWVzc2FnZVBvc2l0aW9uICYmIHRleHRFZGl0b3IgJiYgdGV4dEVkaXRvci5nZXRQYXRoKCkgPT09IG1lc3NhZ2VGaWxlKSB7XG4gICAgICB0ZXh0RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG1lc3NhZ2VQb3NpdGlvbilcbiAgICB9XG4gIH0pXG59XG5cbi8vIE5PVEU6IENvZGUgUG9pbnQgMTYwID09PSAmbmJzcDtcbmNvbnN0IHJlcGxhY2VtZW50UmVnZXggPSBuZXcgUmVnRXhwKFN0cmluZy5mcm9tQ29kZVBvaW50KDE2MCksICdnJylcbmV4cG9ydCBmdW5jdGlvbiBodG1sVG9UZXh0KGh0bWw6IGFueSk6IHN0cmluZyB7XG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBpZiAodHlwZW9mIGh0bWwgPT09ICdzdHJpbmcnKSB7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBodG1sXG4gIH0gZWxzZSB7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChodG1sLmNsb25lTm9kZSh0cnVlKSlcbiAgfVxuICAvLyBOT1RFOiBDb252ZXJ0ICZuYnNwOyB0byByZWd1bGFyIHdoaXRlc3BhY2VcbiAgcmV0dXJuIGVsZW1lbnQudGV4dENvbnRlbnQucmVwbGFjZShyZXBsYWNlbWVudFJlZ2V4LCAnICcpXG59XG5leHBvcnQgZnVuY3Rpb24gb3BlbkV4dGVybmFsbHkobWVzc2FnZTogTGludGVyTWVzc2FnZSk6IHZvaWQge1xuICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAxICYmIG1lc3NhZ2UudHlwZS50b0xvd2VyQ2FzZSgpID09PSAndHJhY2UnKSB7XG4gICAgdmlzaXRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgbGlua1xuICBsZXQgc2VhcmNoVGVybSA9ICcnXG4gIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIpIHtcbiAgICBpZiAobWVzc2FnZS51cmwpIHtcbiAgICAgIGxpbmsgPSBtZXNzYWdlLnVybFxuICAgIH0gZWxzZSB7XG4gICAgICBzZWFyY2hUZXJtID0gbWVzc2FnZS5leGNlcnB0XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHNlYXJjaFRlcm0gPSBgJHttZXNzYWdlLmxpbnRlck5hbWV9ICR7bWVzc2FnZS5leGNlcnB0IHx8IG1lc3NhZ2UudGV4dCB8fCBodG1sVG9UZXh0KG1lc3NhZ2UuaHRtbCB8fCAnJyl9YFxuICB9XG4gIC8vICRGbG93SWdub3JlOiBGbG93IGhhcyBhIGJ1ZyB3aGVyZSBpdCB0aGlua3MgdGhlIGFib3ZlIGxpbmUgcHJvZHVjZXMgYSBtaXhlZCByZXN1bHQgaW5zdGVhZCBvZiBzdHJpbmdcbiAgbGluayA9IGxpbmsgfHwgYGh0dHBzOi8vZ29vZ2xlLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChzZWFyY2hUZXJtKX1gXG4gIHNoZWxsLm9wZW5FeHRlcm5hbChsaW5rKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc29ydE1lc3NhZ2VzKHNvcnRJbmZvOiBBcnJheTx7IGNvbHVtbjogc3RyaW5nLCB0eXBlOiAnYXNjJyB8ICdkZXNjJyB9Piwgcm93czogQXJyYXk8TGludGVyTWVzc2FnZT4pOiBBcnJheTxMaW50ZXJNZXNzYWdlPiB7XG4gIGNvbnN0IHNvcnRDb2x1bW5zIDoge1xuICAgIHNldmVyaXR5PzogJ2FzYycgfCAnZGVzYycsXG4gICAgbGludGVyTmFtZT86ICdhc2MnIHwgJ2Rlc2MnLFxuICAgIGZpbGU/OiAnYXNjJyB8ICdkZXNjJyxcbiAgICBsaW5lPzogJ2FzYycgfCAnZGVzYydcbiAgfSA9IHt9XG5cbiAgc29ydEluZm8uZm9yRWFjaChmdW5jdGlvbihlbnRyeSkge1xuICAgIHNvcnRDb2x1bW5zW2VudHJ5LmNvbHVtbl0gPSBlbnRyeS50eXBlXG4gIH0pXG5cbiAgcmV0dXJuIHJvd3Muc2xpY2UoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICBpZiAoc29ydENvbHVtbnMuc2V2ZXJpdHkpIHtcbiAgICAgIGNvbnN0IG11bHRpcGx5V2l0aCA9IHNvcnRDb2x1bW5zLnNldmVyaXR5ID09PSAnYXNjJyA/IDEgOiAtMVxuICAgICAgY29uc3Qgc2V2ZXJpdHlBID0gc2V2ZXJpdHlTY29yZVthLnNldmVyaXR5XVxuICAgICAgY29uc3Qgc2V2ZXJpdHlCID0gc2V2ZXJpdHlTY29yZVtiLnNldmVyaXR5XVxuICAgICAgaWYgKHNldmVyaXR5QSAhPT0gc2V2ZXJpdHlCKSB7XG4gICAgICAgIHJldHVybiBtdWx0aXBseVdpdGggKiAoc2V2ZXJpdHlBID4gc2V2ZXJpdHlCID8gMSA6IC0xKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc29ydENvbHVtbnMubGludGVyTmFtZSkge1xuICAgICAgY29uc3QgbXVsdGlwbHlXaXRoID0gc29ydENvbHVtbnMubGludGVyTmFtZSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IHNvcnRWYWx1ZSA9IGEuc2V2ZXJpdHkubG9jYWxlQ29tcGFyZShiLnNldmVyaXR5KVxuICAgICAgaWYgKHNvcnRWYWx1ZSAhPT0gMCkge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogc29ydFZhbHVlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzb3J0Q29sdW1ucy5maWxlKSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5maWxlID09PSAnYXNjJyA/IDEgOiAtMVxuICAgICAgY29uc3QgZmlsZUEgPSBnZXRQYXRoT2ZNZXNzYWdlKGEpXG4gICAgICBjb25zdCBmaWxlQUxlbmd0aCA9IGZpbGVBLmxlbmd0aFxuICAgICAgY29uc3QgZmlsZUIgPSBnZXRQYXRoT2ZNZXNzYWdlKGIpXG4gICAgICBjb25zdCBmaWxlQkxlbmd0aCA9IGZpbGVCLmxlbmd0aFxuICAgICAgaWYgKGZpbGVBTGVuZ3RoICE9PSBmaWxlQkxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKGZpbGVBTGVuZ3RoID4gZmlsZUJMZW5ndGggPyAxIDogLTEpXG4gICAgICB9IGVsc2UgaWYgKGZpbGVBICE9PSBmaWxlQikge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogZmlsZUEubG9jYWxlQ29tcGFyZShmaWxlQilcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNvcnRDb2x1bW5zLmxpbmUpIHtcbiAgICAgIGNvbnN0IG11bHRpcGx5V2l0aCA9IHNvcnRDb2x1bW5zLmxpbmUgPT09ICdhc2MnID8gMSA6IC0xXG4gICAgICBjb25zdCByYW5nZUEgPSAkcmFuZ2UoYSlcbiAgICAgIGNvbnN0IHJhbmdlQiA9ICRyYW5nZShiKVxuICAgICAgaWYgKHJhbmdlQSAmJiAhcmFuZ2VCKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9IGVsc2UgaWYgKHJhbmdlQiAmJiAhcmFuZ2VBKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfSBlbHNlIGlmIChyYW5nZUEgJiYgcmFuZ2VCKSB7XG4gICAgICAgIGlmIChyYW5nZUEuc3RhcnQucm93ICE9PSByYW5nZUIuc3RhcnQucm93KSB7XG4gICAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIChyYW5nZUEuc3RhcnQucm93ID4gcmFuZ2VCLnN0YXJ0LnJvdyA/IDEgOiAtMSlcbiAgICAgICAgfVxuICAgICAgICBpZiAocmFuZ2VBLnN0YXJ0LmNvbHVtbiAhPT0gcmFuZ2VCLnN0YXJ0LmNvbHVtbikge1xuICAgICAgICAgIHJldHVybiBtdWx0aXBseVdpdGggKiAocmFuZ2VBLnN0YXJ0LmNvbHVtbiA+IHJhbmdlQi5zdGFydC5jb2x1bW4gPyAxIDogLTEpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gMFxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc29ydFNvbHV0aW9ucyhzb2x1dGlvbnM6IEFycmF5PE9iamVjdD4pOiBBcnJheTxPYmplY3Q+IHtcbiAgcmV0dXJuIHNvbHV0aW9ucy5zbGljZSgpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBiLnByaW9yaXR5IC0gYS5wcmlvcml0eVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTb2x1dGlvbih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLCB2ZXJzaW9uOiAxIHwgMiwgc29sdXRpb246IE9iamVjdCk6IGJvb2xlYW4ge1xuICBpZiAoc29sdXRpb24uYXBwbHkpIHtcbiAgICBzb2x1dGlvbi5hcHBseSgpXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBjb25zdCByYW5nZSA9IHZlcnNpb24gPT09IDEgPyBzb2x1dGlvbi5yYW5nZSA6IHNvbHV0aW9uLnBvc2l0aW9uXG4gIGNvbnN0IGN1cnJlbnRUZXh0ID0gdmVyc2lvbiA9PT0gMSA/IHNvbHV0aW9uLm9sZFRleHQgOiBzb2x1dGlvbi5jdXJyZW50VGV4dFxuICBjb25zdCByZXBsYWNlV2l0aCA9IHZlcnNpb24gPT09IDEgPyBzb2x1dGlvbi5uZXdUZXh0IDogc29sdXRpb24ucmVwbGFjZVdpdGhcbiAgaWYgKGN1cnJlbnRUZXh0KSB7XG4gICAgY29uc3QgdGV4dEluUmFuZ2UgPSB0ZXh0RWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGlmIChjdXJyZW50VGV4dCAhPT0gdGV4dEluUmFuZ2UpIHtcbiAgICAgIGNvbnNvbGUud2FybignW2xpbnRlci11aS1kZWZhdWx0XSBOb3QgYXBwbHlpbmcgZml4IGJlY2F1c2UgdGV4dCBkaWQgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBvbmUnLCAnZXhwZWN0ZWQnLCBjdXJyZW50VGV4dCwgJ2J1dCBnb3QnLCB0ZXh0SW5SYW5nZSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICB0ZXh0RWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlLCByZXBsYWNlV2l0aClcbiAgcmV0dXJuIHRydWVcbn1cbiJdfQ==