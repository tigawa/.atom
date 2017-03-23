function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _workerHelpers = require('./worker-helpers');

var Helpers = _interopRequireWildcard(_workerHelpers);

var _processCommunication = require('process-communication');

var _atomLinter = require('atom-linter');

'use babel';
// Note: 'use babel' doesn't work in forked processes
process.title = 'linter-eslint helper';

var ignoredMessages = [
// V1
'File ignored because of your .eslintignore file. Use --no-ignore to override.',
// V2
'File ignored because of a matching ignore pattern. Use --no-ignore to override.',
// V2.11.1
'File ignored because of a matching ignore pattern. Use "--no-ignore" to override.'];

function lintJob(argv, contents, eslint, configPath, config) {
  if (configPath === null && config.disableWhenNoEslintConfig) {
    return [];
  }
  eslint.execute(argv, contents);
  return global.__LINTER_ESLINT_RESPONSE.filter(function (e) {
    return !ignoredMessages.includes(e.message);
  });
}
function fixJob(argv, eslint) {
  try {
    eslint.execute(argv);
    return 'Linter-ESLint: Fix Complete';
  } catch (err) {
    throw new Error('Linter-ESLint: Fix Attempt Completed, Linting Errors Remain');
  }
}

(0, _processCommunication.create)().onRequest('job', function (_ref, job) {
  var contents = _ref.contents;
  var type = _ref.type;
  var config = _ref.config;
  var filePath = _ref.filePath;

  global.__LINTER_ESLINT_RESPONSE = [];

  if (config.disableFSCache) {
    _atomLinter.FindCache.clear();
  }

  var fileDir = _path2['default'].dirname(filePath);
  var eslint = Helpers.getESLintInstance(fileDir, config);
  var configPath = Helpers.getConfigPath(fileDir);
  var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config);

  var argv = Helpers.getArgv(type, config, relativeFilePath, fileDir, configPath);

  if (type === 'lint') {
    job.response = lintJob(argv, contents, eslint, configPath, config);
  } else if (type === 'fix') {
    job.response = fixJob(argv, eslint);
  }
});

process.exit = function () {/* Stop eslint from closing the daemon */};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9pZ2F3YXRhaWljaGkvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBSWlCLE1BQU07Ozs7NkJBQ0Usa0JBQWtCOztJQUEvQixPQUFPOztvQ0FDSSx1QkFBdUI7OzBCQUNwQixhQUFhOztBQVB2QyxXQUFXLENBQUE7O0FBRVgsT0FBTyxDQUFDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQTs7QUFPdEMsSUFBTSxlQUFlLEdBQUc7O0FBRXRCLCtFQUErRTs7QUFFL0UsaUZBQWlGOztBQUVqRixtRkFBbUYsQ0FDcEYsQ0FBQTs7QUFFRCxTQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFO0FBQzNELE1BQUksVUFBVSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMseUJBQXlCLEVBQUU7QUFDM0QsV0FBTyxFQUFFLENBQUE7R0FDVjtBQUNELFFBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLFNBQU8sTUFBTSxDQUFDLHdCQUF3QixDQUNuQyxNQUFNLENBQUMsVUFBQSxDQUFDO1dBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7R0FBQSxDQUFDLENBQUE7Q0FDckQ7QUFDRCxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzVCLE1BQUk7QUFDRixVQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3BCLFdBQU8sNkJBQTZCLENBQUE7R0FDckMsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLFVBQU0sSUFBSSxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQTtHQUMvRTtDQUNGOztBQUVELG1DQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxVQUFDLElBQW9DLEVBQUUsR0FBRyxFQUFLO01BQTVDLFFBQVEsR0FBVixJQUFvQyxDQUFsQyxRQUFRO01BQUUsSUFBSSxHQUFoQixJQUFvQyxDQUF4QixJQUFJO01BQUUsTUFBTSxHQUF4QixJQUFvQyxDQUFsQixNQUFNO01BQUUsUUFBUSxHQUFsQyxJQUFvQyxDQUFWLFFBQVE7O0FBQzNELFFBQU0sQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUE7O0FBRXBDLE1BQUksTUFBTSxDQUFDLGNBQWMsRUFBRTtBQUN6QiwwQkFBVSxLQUFLLEVBQUUsQ0FBQTtHQUNsQjs7QUFFRCxNQUFNLE9BQU8sR0FBRyxrQkFBSyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUN6RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2pELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUUzRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFBOztBQUVqRixNQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDbkIsT0FBRyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0dBQ25FLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO0FBQ3pCLE9BQUcsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtHQUNwQztDQUNGLENBQUMsQ0FBQTs7QUFFRixPQUFPLENBQUMsSUFBSSxHQUFHLFlBQVksMkNBQTZDLENBQUEiLCJmaWxlIjoiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuLy8gTm90ZTogJ3VzZSBiYWJlbCcgZG9lc24ndCB3b3JrIGluIGZvcmtlZCBwcm9jZXNzZXNcbnByb2Nlc3MudGl0bGUgPSAnbGludGVyLWVzbGludCBoZWxwZXInXG5cbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4vd29ya2VyLWhlbHBlcnMnXG5pbXBvcnQgeyBjcmVhdGUgfSBmcm9tICdwcm9jZXNzLWNvbW11bmljYXRpb24nXG5pbXBvcnQgeyBGaW5kQ2FjaGUgfSBmcm9tICdhdG9tLWxpbnRlcidcblxuY29uc3QgaWdub3JlZE1lc3NhZ2VzID0gW1xuICAvLyBWMVxuICAnRmlsZSBpZ25vcmVkIGJlY2F1c2Ugb2YgeW91ciAuZXNsaW50aWdub3JlIGZpbGUuIFVzZSAtLW5vLWlnbm9yZSB0byBvdmVycmlkZS4nLFxuICAvLyBWMlxuICAnRmlsZSBpZ25vcmVkIGJlY2F1c2Ugb2YgYSBtYXRjaGluZyBpZ25vcmUgcGF0dGVybi4gVXNlIC0tbm8taWdub3JlIHRvIG92ZXJyaWRlLicsXG4gIC8vIFYyLjExLjFcbiAgJ0ZpbGUgaWdub3JlZCBiZWNhdXNlIG9mIGEgbWF0Y2hpbmcgaWdub3JlIHBhdHRlcm4uIFVzZSBcIi0tbm8taWdub3JlXCIgdG8gb3ZlcnJpZGUuJyxcbl1cblxuZnVuY3Rpb24gbGludEpvYihhcmd2LCBjb250ZW50cywgZXNsaW50LCBjb25maWdQYXRoLCBjb25maWcpIHtcbiAgaWYgKGNvbmZpZ1BhdGggPT09IG51bGwgJiYgY29uZmlnLmRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuICBlc2xpbnQuZXhlY3V0ZShhcmd2LCBjb250ZW50cylcbiAgcmV0dXJuIGdsb2JhbC5fX0xJTlRFUl9FU0xJTlRfUkVTUE9OU0VcbiAgICAuZmlsdGVyKGUgPT4gIWlnbm9yZWRNZXNzYWdlcy5pbmNsdWRlcyhlLm1lc3NhZ2UpKVxufVxuZnVuY3Rpb24gZml4Sm9iKGFyZ3YsIGVzbGludCkge1xuICB0cnkge1xuICAgIGVzbGludC5leGVjdXRlKGFyZ3YpXG4gICAgcmV0dXJuICdMaW50ZXItRVNMaW50OiBGaXggQ29tcGxldGUnXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IG5ldyBFcnJvcignTGludGVyLUVTTGludDogRml4IEF0dGVtcHQgQ29tcGxldGVkLCBMaW50aW5nIEVycm9ycyBSZW1haW4nKVxuICB9XG59XG5cbmNyZWF0ZSgpLm9uUmVxdWVzdCgnam9iJywgKHsgY29udGVudHMsIHR5cGUsIGNvbmZpZywgZmlsZVBhdGggfSwgam9iKSA9PiB7XG4gIGdsb2JhbC5fX0xJTlRFUl9FU0xJTlRfUkVTUE9OU0UgPSBbXVxuXG4gIGlmIChjb25maWcuZGlzYWJsZUZTQ2FjaGUpIHtcbiAgICBGaW5kQ2FjaGUuY2xlYXIoKVxuICB9XG5cbiAgY29uc3QgZmlsZURpciA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShmaWxlRGlyLCBjb25maWcpXG4gIGNvbnN0IGNvbmZpZ1BhdGggPSBIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcilcbiAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpbGVEaXIsIGZpbGVQYXRoLCBjb25maWcpXG5cbiAgY29uc3QgYXJndiA9IEhlbHBlcnMuZ2V0QXJndih0eXBlLCBjb25maWcsIHJlbGF0aXZlRmlsZVBhdGgsIGZpbGVEaXIsIGNvbmZpZ1BhdGgpXG5cbiAgaWYgKHR5cGUgPT09ICdsaW50Jykge1xuICAgIGpvYi5yZXNwb25zZSA9IGxpbnRKb2IoYXJndiwgY29udGVudHMsIGVzbGludCwgY29uZmlnUGF0aCwgY29uZmlnKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmaXgnKSB7XG4gICAgam9iLnJlc3BvbnNlID0gZml4Sm9iKGFyZ3YsIGVzbGludClcbiAgfVxufSlcblxucHJvY2Vzcy5leGl0ID0gZnVuY3Rpb24gKCkgeyAvKiBTdG9wIGVzbGludCBmcm9tIGNsb3NpbmcgdGhlIGRhZW1vbiAqLyB9XG4iXX0=
//# sourceURL=/Users/igawataiichi/.atom/packages/linter-eslint/src/worker.js
