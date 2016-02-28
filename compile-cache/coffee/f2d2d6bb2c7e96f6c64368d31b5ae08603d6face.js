(function() {
  var CommandRunner, Emitter, clearTimeout, config, glob, path, setTimeout, spawn, _ref;

  path = require('path');

  spawn = require('child_process').spawn;

  _ref = require('timers'), setTimeout = _ref.setTimeout, clearTimeout = _ref.clearTimeout;

  Emitter = require('atom').Emitter;

  glob = require('glob');

  config = require('./config');

  module.exports = CommandRunner = (function() {
    function CommandRunner(testStatusView) {
      this.testStatusView = testStatusView;
      this.emitter = new Emitter;
      this.timeout = null;
    }

    CommandRunner.prototype.run = function(testStatus) {
      var cfg, cmd, file, matches, pattern, projPath, _i, _len, _ref1;
      projPath = atom.project.getPaths()[0];
      if (!projPath) {
        return;
      }
      cfg = config.readOrInitConfig();
      cmd = null;
      _ref1 = Object.keys(cfg);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        file = _ref1[_i];
        pattern = path.join(projPath, file);
        matches = glob.sync(pattern);
        if (matches.length > 0) {
          cmd = cfg[file];
          break;
        }
      }
      if (!cmd) {
        return;
      }
      return this.execute(cmd, testStatus);
    };

    CommandRunner.prototype.execute = function(cmd, testStatus) {
      var cwd, err, output, proc, timeoutInMs, timeoutInSeconds;
      if (this.running) {
        return;
      }
      this.running = true;
      testStatus.removeClass('success fail').addClass('pending');
      try {
        cwd = atom.project.getPaths()[0];
        proc = spawn("" + process.env.SHELL, ['-l', '-i', '-c', cmd], {
          cwd: cwd
        });
        output = '';
        proc.stdout.on('data', function(data) {
          return output += data.toString();
        });
        proc.stderr.on('data', function(data) {
          return output += data.toString();
        });
        proc.on('exit', (function(_this) {
          return function(code, signal) {
            if (_this.timeout != null) {
              clearTimeout(_this.timeout);
            }
            if (signal != null) {
              output += "\nTerminated by " + signal + "\n";
            }
            _this.running = false;
            _this.testStatusView.update(output);
            if (code === 0) {
              _this.emitter.emit('test-status:success');
              return testStatus.removeClass('pending fail').addClass('success');
            } else {
              _this.emitter.emit('test-status:fail');
              return testStatus.removeClass('pending success').addClass('fail');
            }
          };
        })(this));
        if (this.timeout != null) {
          clearTimeout(this.timeout);
        }
        timeoutInSeconds = atom.config.get('test-status.timeoutInSeconds');
        timeoutInMs = timeoutInSeconds * 1000;
        return this.timeout = setTimeout(function() {
          output += "\n\nERROR: Timed out after " + timeoutInSeconds + "s\n";
          return proc.kill();
        }, timeoutInMs);
      } catch (_error) {
        err = _error;
        this.running = false;
        testStatus.removeClass('pending success').addClass('fail');
        return this.testStatusView.update('An error occured while attempting to run the test command');
      }
    };

    return CommandRunner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90ZXN0LXN0YXR1cy9saWIvY29tbWFuZC1ydW5uZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlGQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLGVBQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFFQSxPQUE2QixPQUFBLENBQVEsUUFBUixDQUE3QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxvQkFBQSxZQUZiLENBQUE7O0FBQUEsRUFJQyxVQUFXLE9BQUEsQ0FBUSxNQUFSLEVBQVgsT0FKRCxDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQVJULENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUdNO0FBTVMsSUFBQSx1QkFBRSxjQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxpQkFBQSxjQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQURYLENBRFc7SUFBQSxDQUFiOztBQUFBLDRCQU9BLEdBQUEsR0FBSyxTQUFDLFVBQUQsR0FBQTtBQUNILFVBQUEsMkRBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBbkMsQ0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLFFBQUE7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUFBLE1BR0EsR0FBQSxHQUFNLE1BQU0s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

//# sourceURL=/Users/igawataiichi/.atom/packages/test-status/lib/command-runner.coffee
