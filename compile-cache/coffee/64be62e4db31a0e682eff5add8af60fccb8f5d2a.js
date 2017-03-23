(function() {
  var $, CompositeDisposable, Emitter, Task, TermView, Terminal, View, debounce, fs, last, os, path, ref, renderTemplate, util,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  util = require('util');

  os = require('os');

  fs = require('fs-plus');

  path = require('path');

  debounce = require('debounce');

  Terminal = require('atom-term.js');

  CompositeDisposable = require('atom').CompositeDisposable;

  window.isMac = window.navigator.userAgent.indexOf('Mac') !== -1;

  Task = require('atom').Task;

  Emitter = require('event-kit').Emitter;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  last = function(str) {
    return str[str.length - 1];
  };

  renderTemplate = function(template, data) {
    var vars;
    vars = Object.keys(data);
    return vars.reduce(function(_template, key) {
      return _template.split(RegExp("\\{\\{\\s*" + key + "\\s*\\}\\}")).join(data[key]);
    }, template.toString());
  };

  TermView = (function(superClass) {
    extend(TermView, superClass);

    function TermView(opts) {
      this.opts = opts != null ? opts : {};
      this.emitter = new Emitter;
      this.fakeRow = $("<div><span>&nbsp;</span></div>").css({
        visibility: 'hidden'
      });
      TermView.__super__.constructor.apply(this, arguments);
    }

    TermView.prototype.focusPane = function() {
      var index, items, pane;
      pane = atom.workspace.getActivePane();
      items = pane.getItems();
      index = items.indexOf(this);
      if (index === -1) {
        return;
      }
      pane.activateItemAtIndex(index);
      return focus();
    };

    TermView.prototype.getForked = function() {
      return this.opts.forkPTY;
    };

    TermView.content = function() {
      return this.div({
        "class": 'term3'
      });
    };

    TermView.prototype.onData = function(callback) {
      return this.emitter.on('data', callback);
    };

    TermView.prototype.onExit = function(callback) {
      return this.emitter.on('exit', callback);
    };

    TermView.prototype.onResize = function(callback) {
      return this.emitter.on('resize', callback);
    };

    TermView.prototype.onSTDIN = function(callback) {
      return this.emitter.on('stdin', callback);
    };

    TermView.prototype.onSTDOUT = function(callback) {
      return this.emitter.on('stdout', callback);
    };

    TermView.prototype.input = function(data) {
      var base64ed, error;
      if (!this.term) {
        return;
      }
      try {
        if (this.ptyProcess) {
          base64ed = new Buffer(data).toString("base64");
          this.ptyProcess.send({
            event: 'input',
            text: base64ed
          });
        } else {
          this.term.write(data);
        }
      } catch (error1) {
        error = error1;
        console.error(error);
      }
      this.resizeToPane_();
      return this.focusTerm();
    };

    TermView.prototype.attached = function() {
      var args, colors, cols, cursorBlink, cwd, processPath, ref1, ref2, ref3, rows, runCommand, scrollback, shell, shellArguments, shellOverride, term;
      this.disposable = new CompositeDisposable();
      ref1 = this.opts, cols = ref1.cols, rows = ref1.rows, cwd = ref1.cwd, shell = ref1.shell, shellArguments = ref1.shellArguments, shellOverride = ref1.shellOverride, runCommand = ref1.runCommand, colors = ref1.colors, cursorBlink = ref1.cursorBlink, scrollback = ref1.scrollback;
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      if (this.opts.forkPTY) {
        ref2 = this.getDimensions_(), cols = ref2.cols, rows = ref2.rows;
      }
      this.term = term = new Terminal({
        useStyle: false,
        screenKeys: false,
        handler: (function(_this) {
          return function(data) {
            return _this.emitter.emit('stdin', data);
          };
        })(this),
        colors: colors,
        cursorBlink: cursorBlink,
        scrollback: scrollback,
        cols: cols,
        rows: rows
      });
      term.on("data", (function(_this) {
        return function(data) {
          if (_this.ptyProcess) {
            return _this.input(data);
          }
        };
      })(this));
      term.on("title", (function(_this) {
        return function(title) {
          var newTitle, split;
          if (title.length > 20) {
            split = title.split(path.sep);
            newTitle = "";
            if (split[0] === "") {
              split.shift(1);
            }
            if (split.length === 1) {
              title = title.slice(0, 10) + "..." + title.slice(-10);
            } else {
              title = path.sep + [split[0], "...", split[split.length - 1]].join(path.sep);
              if (title.length > 25) {
                title = path.sep + [split[0], split[split.length - 1]].join(path.sep);
                title = title.slice(0, 10) + "..." + title.slice(-10);
              }
            }
          }
          _this.title_ = title;
          return _this.emitter.emit('did-change-title', title);
        };
      })(this));
      term.open(this.get(0));
      if (!this.opts.forkPTY) {
        term.end = (function(_this) {
          return function() {
            return _this.exit();
          };
        })(this);
      } else {
        processPath = require.resolve('./pty');
        this.ptyProcess = Task.once(processPath, fs.absolute((ref3 = atom.project.getPaths()[0]) != null ? ref3 : '~'), shellOverride, cols, rows, args);
        this.ptyProcess.on('term3:data', (function(_this) {
          return function(data) {
            var utf8;
            if (!_this.term) {
              return;
            }
            utf8 = new Buffer(data, "base64").toString("utf-8");
            _this.term.write(utf8);
            return _this.emitter.emit('stdout', utf8);
          };
        })(this));
        this.ptyProcess.on('term3:exit', (function(_this) {
          return function() {
            return _this.exit();
          };
        })(this));
      }
      if (runCommand) {
        this.input("" + runCommand + os.EOL);
      }
      term.focus();
      this.applyStyle();
      this.attachEvents();
      return this.resizeToPane_();
    };

    TermView.prototype.resize = function(cols, rows) {
      var error;
      if (!this.term) {
        return;
      }
      if (this.term.rows === rows && this.term.cols === cols) {
        return;
      }
      if (!(cols > 0 && rows > 0 && isFinite(cols) && isFinite(rows))) {
        return;
      }
      try {
        if (this.ptyProcess) {
          this.ptyProcess.send({
            event: 'resize',
            rows: rows,
            cols: cols
          });
        }
        if (this.term) {
          this.term.resize(cols, rows);
        }
      } catch (error1) {
        error = error1;
        console.error(error);
        return;
      }
      return this.emitter.emit('resize', {
        cols: cols,
        rows: rows
      });
    };

    TermView.prototype.titleVars = function() {
      return {
        bashName: last(this.opts.shell.split('/')),
        hostName: os.hostname(),
        platform: process.platform,
        home: process.env.HOME
      };
    };

    TermView.prototype.getTitle = function() {
      var titleTemplate;
      if (this.title_) {
        return this.title_;
      }
      this.vars = this.titleVars();
      titleTemplate = this.opts.titleTemplate || "({{ bashName }})";
      return renderTemplate(titleTemplate, this.vars);
    };

    TermView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    TermView.prototype.getIconName = function() {
      return "terminal";
    };

    TermView.prototype.applyStyle = function() {
      this.term.element.style.fontFamily = this.opts.fontFamily || atom.config.get('editor.fontFamily') || "monospace";
      return this.term.element.style.fontSize = (this.opts.fontSize || atom.config.get('editor.fontSize')) + "px";
    };

    TermView.prototype.attachEvents = function() {
      this.resizeToPane_ = this.resizeToPane_.bind(this);
      this.on('focus', this.focus);
      $(window).on('resize', (function(_this) {
        return function() {
          return _this.resizeToPane_();
        };
      })(this));
      this.disposable.add(atom.workspace.getActivePane().observeFlexScale((function(_this) {
        return function() {
          return setTimeout((function() {
            return _this.resizeToPane_();
          }), 300);
        };
      })(this)));
      this.disposable.add(atom.commands.add("atom-workspace", "term3:paste", (function(_this) {
        return function() {
          return _this.paste();
        };
      })(this)));
      return this.disposable.add(atom.commands.add("atom-workspace", "term3:copy", (function(_this) {
        return function() {
          return _this.copy();
        };
      })(this)));
    };

    TermView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (!this.term) {
        return;
      }
      if (this.term._selected) {
        textarea = this.term.getCopyTextarea();
        text = this.term.grabText(this.term._selected.x1, this.term._selected.x2, this.term._selected.y1, this.term._selected.y2);
      } else {
        rawText = this.term.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    TermView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    TermView.prototype.focus = function() {
      this.resizeToPane_();
      return this.focusTerm();
    };

    TermView.prototype.focusTerm = function() {
      if (!this.term) {
        return;
      }
      return this.term.focus();
    };

    TermView.prototype.resizeToPane_ = function() {
      var cols, ref1, rows;
      if (!this.ptyProcess) {
        return;
      }
      ref1 = this.getDimensions_(), cols = ref1.cols, rows = ref1.rows;
      return this.resize(cols, rows);
    };

    TermView.prototype.getDimensions = function() {
      var cols, rows;
      cols = this.term.cols;
      rows = this.term.rows;
      return {
        cols: cols,
        rows: rows
      };
    };

    TermView.prototype.getDimensions_ = function() {
      var cols, fakeCol, rows;
      if (!this.term) {
        cols = Math.floor(this.width() / 7);
        rows = Math.floor(this.height() / 15);
        return {
          cols: cols,
          rows: rows
        };
      }
      this.find('.terminal').append(this.fakeRow);
      fakeCol = this.fakeRow.children().first();
      cols = Math.floor((this.width() / fakeCol.width()) || 9);
      rows = Math.floor((this.height() / fakeCol.height()) || 16);
      this.fakeRow.remove();
      return {
        cols: cols,
        rows: rows
      };
    };

    TermView.prototype.exit = function() {
      var pane;
      pane = atom.workspace.getActivePane();
      return pane.destroyItem(this);
    };

    TermView.prototype.destroy = function() {
      if (this.ptyProcess) {
        this.ptyProcess.terminate();
        this.ptyProcess = null;
      }
      if (this.term) {
        this.emitter.emit('exit');
        this.term.destroy();
        this.term = null;
        this.off('focus', this.focus);
        $(window).off('resize', this.resizeToPane_);
      }
      if (this.disposable) {
        this.disposable.dispose();
        return this.disposable = null;
      }
    };

    return TermView;

  })(View);

  module.exports = TermView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90ZXJtMy9saWIvdGVybS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd0hBQUE7SUFBQTs7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLGNBQVI7O0VBQ1Ysc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUd4QixNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQTNCLENBQW1DLEtBQW5DLENBQUEsS0FBNkMsQ0FBQzs7RUFFNUQsT0FBUSxPQUFBLENBQVEsTUFBUjs7RUFDUixVQUFZLE9BQUEsQ0FBUSxXQUFSOztFQUNiLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFELEVBQUk7O0VBRUosSUFBQSxHQUFPLFNBQUMsR0FBRDtXQUFRLEdBQUksQ0FBQSxHQUFHLENBQUMsTUFBSixHQUFXLENBQVg7RUFBWjs7RUFFUCxjQUFBLEdBQWlCLFNBQUMsUUFBRCxFQUFXLElBQVg7QUFDZixRQUFBO0lBQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtXQUNQLElBQUksQ0FBQyxNQUFMLENBQVksU0FBQyxTQUFELEVBQVksR0FBWjthQUNWLFNBQVMsQ0FBQyxLQUFWLENBQWdCLE1BQUEsQ0FBQSxZQUFBLEdBQVksR0FBWixHQUFnQixZQUFoQixDQUFoQixDQUNFLENBQUMsSUFESCxDQUNRLElBQUssQ0FBQSxHQUFBLENBRGI7SUFEVSxDQUFaLEVBR0UsUUFB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U0FBWixDQUFBO1FBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUZoQjs7TUFJQSxJQUFHLElBQUMsQ0FBQSxJQUFKO1FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBZDtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBO1FBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLElBQUMsQ0FBQSxLQUFmO1FBQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBYyxRQUFkLEVBQXdCLElBQUMsQ0FBQSxhQUF6QixFQUxGOztNQU1BLElBQUcsSUFBQyxDQUFBLFVBQUo7UUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQTtlQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsS0FGaEI7O0lBWE87Ozs7S0FoT1k7O0VBZ1B2QixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXhRakIiLCJzb3VyY2VzQ29udGVudCI6WyJ1dGlsID0gcmVxdWlyZSAndXRpbCdcbm9zID0gcmVxdWlyZSAnb3MnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmRlYm91bmNlID0gcmVxdWlyZSAnZGVib3VuY2UnXG5UZXJtaW5hbCA9IHJlcXVpcmUgJ2F0b20tdGVybS5qcydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG4gIyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2YvYXRvbS10ZXJtLmpzL3B1bGwvNVxuICMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mL2F0b20tdGVybS5qcy9wdWxsLzRcbndpbmRvdy5pc01hYyA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01hYycpICE9IC0xO1xuXG57VGFza30gPSByZXF1aXJlICdhdG9tJ1xue0VtaXR0ZXJ9ICA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcbnskLCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5sYXN0ID0gKHN0ciktPiBzdHJbc3RyLmxlbmd0aC0xXVxuXG5yZW5kZXJUZW1wbGF0ZSA9ICh0ZW1wbGF0ZSwgZGF0YSkgLT5cbiAgdmFycyA9IE9iamVjdC5rZXlzIGRhdGFcbiAgdmFycy5yZWR1Y2UgKF90ZW1wbGF0ZSwga2V5KSAtPlxuICAgIF90ZW1wbGF0ZS5zcGxpdCgvLy9cXHtcXHtcXHMqI3trZXl9XFxzKlxcfVxcfS8vLylcbiAgICAgIC5qb2luIGRhdGFba2V5XVxuICAsIHRlbXBsYXRlLnRvU3RyaW5nKClcblxuY2xhc3MgVGVybVZpZXcgZXh0ZW5kcyBWaWV3XG4gIGNvbnN0cnVjdG9yOiAoQG9wdHM9e30pLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQGZha2VSb3cgPSAkKFwiPGRpdj48c3Bhbj4mbmJzcDs8L3NwYW4+PC9kaXY+XCIpLmNzcyB2aXNpYmlsaXR5OiAnaGlkZGVuJ1xuICAgIHN1cGVyXG5cbiAgZm9jdXNQYW5lOiAoKSAtPlxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBpdGVtcyA9IHBhbmUuZ2V0SXRlbXMoKVxuICAgIGluZGV4ID0gaXRlbXMuaW5kZXhPZih0aGlzKVxuICAgIHJldHVybiB1bmxlc3MgaW5kZXggIT0gLTFcbiAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgoaW5kZXgpXG4gICAgZm9jdXMoKVxuXG4gIGdldEZvcmtlZDogKCkgLT5cbiAgICByZXR1cm4gQG9wdHMuZm9ya1BUWVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICd0ZXJtMydcblxuICBvbkRhdGE6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGF0YScsIGNhbGxiYWNrXG5cbiAgb25FeGl0OiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2V4aXQnLCBjYWxsYmFja1xuXG4gIG9uUmVzaXplOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ3Jlc2l6ZScsIGNhbGxiYWNrXG5cbiAgb25TVERJTjogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdzdGRpbicsIGNhbGxiYWNrXG5cbiAgb25TVERPVVQ6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnc3Rkb3V0JywgY2FsbGJhY2tcblxuICBpbnB1dDogKGRhdGEpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGVybVxuICAgIHRyeVxuICAgICAgaWYgQHB0eVByb2Nlc3NcbiAgICAgICAgYmFzZTY0ZWQgPSBuZXcgQnVmZmVyKGRhdGEpLnRvU3RyaW5nKFwiYmFzZTY0XCIpXG4gICAgICAgIEBwdHlQcm9jZXNzLnNlbmQgZXZlbnQ6ICdpbnB1dCcsIHRleHQ6IGJhc2U2NGVkXG4gICAgICBlbHNlXG4gICAgICAgIEB0ZXJtLndyaXRlIGRhdGFcbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuICAgIEByZXNpemVUb1BhbmVfKClcbiAgICBAZm9jdXNUZXJtKClcblxuICBhdHRhY2hlZDogKCkgLT5cbiAgICBAZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB7Y29scywgcm93cywgY3dkLCBzaGVsbCwgc2hlbGxBcmd1bWVudHMsIHNoZWxsT3ZlcnJpZGUsIHJ1bkNvbW1hbmQsIGNvbG9ycywgY3Vyc29yQmxpbmssIHNjcm9sbGJhY2t9ID0gQG9wdHNcbiAgICBhcmdzID0gc2hlbGxBcmd1bWVudHMuc3BsaXQoL1xccysvZykuZmlsdGVyIChhcmcpIC0+IGFyZ1xuXG4gICAgaWYgQG9wdHMuZm9ya1BUWVxuICAgICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnNfKClcblxuICAgIEB0ZXJtID0gdGVybSA9IG5ldyBUZXJtaW5hbCB7XG4gICAgICB1c2VTdHlsZTogbm9cbiAgICAgIHNjcmVlbktleXM6IG5vXG4gICAgICBoYW5kbGVyOiAoZGF0YSkgPT5cbiAgICAgICAgQGVtaXR0ZXIuZW1pdCAnc3RkaW4nLCBkYXRhXG4gICAgICBjb2xvcnMsIGN1cnNvckJsaW5rLCBzY3JvbGxiYWNrLCBjb2xzLCByb3dzXG4gICAgfVxuXG4gICAgdGVybS5vbiBcImRhdGFcIiwgKGRhdGEpID0+XG4gICAgICAjIGxldCB0aGUgcmVtb3RlIHRlcm0gd3JpdGUgdG8gc3RkaW4gLSB3ZSBzbHVycCB1cCBpdHMgc3Rkb3V0XG4gICAgICBpZiBAcHR5UHJvY2Vzc1xuICAgICAgICBAaW5wdXQgZGF0YVxuXG4gICAgdGVybS5vbiBcInRpdGxlXCIsICh0aXRsZSkgPT5cbiAgICAgIGlmIHRpdGxlLmxlbmd0aCA+IDIwXG4gICAgICAgIHNwbGl0ID0gdGl0bGUuc3BsaXQocGF0aC5zZXApXG4gICAgICAgIG5ld1RpdGxlID0gXCJcIlxuICAgICAgICBpZiBzcGxpdFswXSA9PSBcIlwiXG4gICAgICAgICAgc3BsaXQuc2hpZnQoMSlcblxuICAgICAgICBpZiBzcGxpdC5sZW5ndGggPT0gMVxuICAgICAgICAgIHRpdGxlID0gdGl0bGUuc2xpY2UoMCwgMTApICsgXCIuLi5cIiArIHRpdGxlLnNsaWNlKC0xMClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRpdGxlID0gcGF0aC5zZXAgKyBbc3BsaXRbMF0sIFwiLi4uXCIsIHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdXS5qb2luKHBhdGguc2VwKVxuICAgICAgICAgIGlmIHRpdGxlLmxlbmd0aCA+IDI1XG4gICAgICAgICAgICB0aXRsZSA9IHBhdGguc2VwICsgW3NwbGl0WzBdLCBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXV0uam9pbihwYXRoLnNlcClcbiAgICAgICAgICAgIHRpdGxlID0gdGl0bGUuc2xpY2UoMCwgMTApICsgXCIuLi5cIiArIHRpdGxlLnNsaWNlKC0xMClcblxuICAgICAgQHRpdGxlXyA9IHRpdGxlXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXRpdGxlJywgdGl0bGVcblxuICAgIHRlcm0ub3BlbiB0aGlzLmdldCgwKVxuXG4gICAgaWYgbm90IEBvcHRzLmZvcmtQVFlcbiAgICAgIHRlcm0uZW5kID0gPT4gQGV4aXQoKVxuICAgIGVsc2VcbiAgICAgIHByb2Nlc3NQYXRoID0gcmVxdWlyZS5yZXNvbHZlICcuL3B0eSdcbiAgICAgIEBwdHlQcm9jZXNzID0gVGFzay5vbmNlIHByb2Nlc3NQYXRoLCBmcy5hYnNvbHV0ZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSA/ICd+JyksIHNoZWxsT3ZlcnJpZGUsIGNvbHMsIHJvd3MsIGFyZ3NcblxuICAgICAgQHB0eVByb2Nlc3Mub24gJ3Rlcm0zOmRhdGEnLCAoZGF0YSkgPT5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBAdGVybVxuICAgICAgICB1dGY4ID0gbmV3IEJ1ZmZlcihkYXRhLCBcImJhc2U2NFwiKS50b1N0cmluZyhcInV0Zi04XCIpXG4gICAgICAgIEB0ZXJtLndyaXRlIHV0ZjhcbiAgICAgICAgQGVtaXR0ZXIuZW1pdCgnc3Rkb3V0JywgdXRmOClcblxuICAgICAgQHB0eVByb2Nlc3Mub24gJ3Rlcm0zOmV4aXQnLCAoKSA9PlxuICAgICAgICBAZXhpdCgpXG5cblxuICAgIEBpbnB1dCBcIiN7cnVuQ29tbWFuZH0je29zLkVPTH1cIiBpZiAocnVuQ29tbWFuZClcbiAgICB0ZXJtLmZvY3VzKClcbiAgICBAYXBwbHlTdHlsZSgpXG4gICAgQGF0dGFjaEV2ZW50cygpXG4gICAgQHJlc2l6ZVRvUGFuZV8oKVxuXG4gIHJlc2l6ZTogKGNvbHMsIHJvd3MpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGVybVxuICAgIHJldHVybiBpZiBAdGVybS5yb3dzIGlzIHJvd3MgYW5kIEB0ZXJtLmNvbHMgaXMgY29sc1xuICAgIHJldHVybiB1bmxlc3MgY29scyA+IDAgYW5kIHJvd3MgPiAwIGFuZCBpc0Zpbml0ZShjb2xzKSBhbmQgaXNGaW5pdGUocm93cylcbiAgICAjIGNvbnNvbGUubG9nIEB0ZXJtLnJvd3MsIEB0ZXJtLmNvbHMsIFwiLT5cIiwgcm93cywgY29sc1xuICAgIHRyeVxuICAgICAgaWYgQHB0eVByb2Nlc3NcbiAgICAgICAgQHB0eVByb2Nlc3Muc2VuZCB7ZXZlbnQ6ICdyZXNpemUnLCByb3dzLCBjb2xzfVxuICAgICAgaWYgQHRlcm1cbiAgICAgICAgQHRlcm0ucmVzaXplIGNvbHMsIHJvd3NcbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgcmV0dXJuXG5cbiAgICBAZW1pdHRlci5lbWl0ICdyZXNpemUnLCB7Y29scywgcm93c31cblxuICB0aXRsZVZhcnM6IC0+XG4gICAgYmFzaE5hbWU6IGxhc3QgQG9wdHMuc2hlbGwuc3BsaXQgJy8nXG4gICAgaG9zdE5hbWU6IG9zLmhvc3RuYW1lKClcbiAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybVxuICAgIGhvbWUgICAgOiBwcm9jZXNzLmVudi5IT01FXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgcmV0dXJuIEB0aXRsZV8gaWYgQHRpdGxlX1xuICAgIEB2YXJzID0gQHRpdGxlVmFycygpXG4gICAgdGl0bGVUZW1wbGF0ZSA9IEBvcHRzLnRpdGxlVGVtcGxhdGUgb3IgXCIoe3sgYmFzaE5hbWUgfX0pXCJcbiAgICByZW5kZXJUZW1wbGF0ZSB0aXRsZVRlbXBsYXRlLCBAdmFyc1xuXG4gIG9uRGlkQ2hhbmdlVGl0bGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrXG5cbiAgZ2V0SWNvbk5hbWU6IC0+XG4gICAgXCJ0ZXJtaW5hbFwiXG5cbiAgYXBwbHlTdHlsZTogLT5cbiAgICAjIHJlbW92ZSBiYWNrZ3JvdW5kIGNvbG9yIGluIGZhdm9yIG9mIHRoZSBhdG9tIGJhY2tncm91bmRcbiAgICAjIEB0ZXJtLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IG51bGxcbiAgICBAdGVybS5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSAoXG4gICAgICBAb3B0cy5mb250RmFtaWx5IG9yXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5Jykgb3JcbiAgICAgICMgKEF0b20gZG9lc24ndCByZXR1cm4gYSBkZWZhdWx0IHZhbHVlIGlmIHRoZXJlIGlzIG5vbmUpXG4gICAgICAjIHNvIHdlIHVzZSBhIHBvb3IgZmFsbGJhY2tcbiAgICAgIFwibW9ub3NwYWNlXCJcbiAgICApXG4gICAgIyBBdG9tIHJldHVybnMgYSBkZWZhdWx0IGZvciBmb250U2l6ZVxuICAgIEB0ZXJtLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSAoXG4gICAgICBAb3B0cy5mb250U2l6ZSBvclxuICAgICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKVxuICAgICkgKyBcInB4XCJcblxuICBhdHRhY2hFdmVudHM6IC0+XG4gICAgQHJlc2l6ZVRvUGFuZV8gPSBAcmVzaXplVG9QYW5lXy5iaW5kIHRoaXNcbiAgICBAb24gJ2ZvY3VzJywgQGZvY3VzXG4gICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCA9PiBAcmVzaXplVG9QYW5lXygpXG4gICAgQGRpc3Bvc2FibGUuYWRkIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5vYnNlcnZlRmxleFNjYWxlID0+IHNldFRpbWVvdXQgKD0+IEByZXNpemVUb1BhbmVfKCkpLCAzMDBcbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcInRlcm0zOnBhc3RlXCIsID0+IEBwYXN0ZSgpXG4gICAgQGRpc3Bvc2FibGUuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJ0ZXJtMzpjb3B5XCIsID0+IEBjb3B5KClcblxuICBjb3B5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1cblxuICAgIGlmIEB0ZXJtLl9zZWxlY3RlZCAgIyB0ZXJtLmpzIHZpc3VhbCBtb2RlIHNlbGVjdGlvbnNcbiAgICAgIHRleHRhcmVhID0gQHRlcm0uZ2V0Q29weVRleHRhcmVhKClcbiAgICAgIHRleHQgPSBAdGVybS5ncmFiVGV4dChcbiAgICAgICAgQHRlcm0uX3NlbGVjdGVkLngxLCBAdGVybS5fc2VsZWN0ZWQueDIsXG4gICAgICAgIEB0ZXJtLl9zZWxlY3RlZC55MSwgQHRlcm0uX3NlbGVjdGVkLnkyKVxuICAgIGVsc2UgIyBmYWxsYmFjayB0byBET00tYmFzZWQgc2VsZWN0aW9uc1xuICAgICAgcmF3VGV4dCA9IEB0ZXJtLmNvbnRleHQuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgICAgcmF3TGluZXMgPSByYXdUZXh0LnNwbGl0KC9cXHI/XFxuL2cpXG4gICAgICBsaW5lcyA9IHJhd0xpbmVzLm1hcCAobGluZSkgLT5cbiAgICAgICAgbGluZS5yZXBsYWNlKC9cXHMvZywgXCIgXCIpLnRyaW1SaWdodCgpXG4gICAgICB0ZXh0ID0gbGluZXMuam9pbihcIlxcblwiKVxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIHRleHRcblxuICBwYXN0ZTogLT5cbiAgICBAaW5wdXQgYXRvbS5jbGlwYm9hcmQucmVhZCgpXG5cbiAgZm9jdXM6IC0+XG4gICAgQHJlc2l6ZVRvUGFuZV8oKVxuICAgIEBmb2N1c1Rlcm0oKVxuXG4gIGZvY3VzVGVybTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtXG4gICAgQHRlcm0uZm9jdXMoKVxuXG4gIHJlc2l6ZVRvUGFuZV86IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzc1xuICAgIHtjb2xzLCByb3dzfSA9IEBnZXREaW1lbnNpb25zXygpXG4gICAgQHJlc2l6ZSBjb2xzLCByb3dzXG5cbiAgZ2V0RGltZW5zaW9uczogLT5cbiAgICBjb2xzID0gQHRlcm0uY29sc1xuICAgIHJvd3MgPSBAdGVybS5yb3dzXG4gICAge2NvbHMsIHJvd3N9XG5cbiAgZ2V0RGltZW5zaW9uc186IC0+XG4gICAgaWYgbm90IEB0ZXJtXG4gICAgICBjb2xzID0gTWF0aC5mbG9vciBAd2lkdGgoKSAvIDdcbiAgICAgIHJvd3MgPSBNYXRoLmZsb29yIEBoZWlnaHQoKSAvIDE1XG4gICAgICByZXR1cm4ge2NvbHMsIHJvd3N9XG5cbiAgICBAZmluZCgnLnRlcm1pbmFsJykuYXBwZW5kIEBmYWtlUm93XG4gICAgZmFrZUNvbCA9IEBmYWtlUm93LmNoaWxkcmVuKCkuZmlyc3QoKVxuICAgIGNvbHMgPSBNYXRoLmZsb29yIChAd2lkdGgoKSAvIGZha2VDb2wud2lkdGgoKSkgb3IgOVxuICAgIHJvd3MgPSBNYXRoLmZsb29yIChAaGVpZ2h0KCkgLyBmYWtlQ29sLmhlaWdodCgpKSBvciAxNlxuICAgIEBmYWtlUm93LnJlbW92ZSgpXG4gICAge2NvbHMsIHJvd3N9XG5cbiAgZXhpdDogLT5cbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgcGFuZS5kZXN0cm95SXRlbSh0aGlzKTtcblxuICBkZXN0cm95OiAtPlxuICAgIGlmIEBwdHlQcm9jZXNzXG4gICAgICBAcHR5UHJvY2Vzcy50ZXJtaW5hdGUoKVxuICAgICAgQHB0eVByb2Nlc3MgPSBudWxsXG4gICAgIyB3ZSBhbHdheXMgaGF2ZSBhIEB0ZXJtXG4gICAgaWYgQHRlcm1cbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2V4aXQnKVxuICAgICAgQHRlcm0uZGVzdHJveSgpXG4gICAgICBAdGVybSA9IG51bGxcbiAgICAgIEBvZmYgJ2ZvY3VzJywgQGZvY3VzXG4gICAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAcmVzaXplVG9QYW5lX1xuICAgIGlmIEBkaXNwb3NhYmxlXG4gICAgICBAZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIEBkaXNwb3NhYmxlID0gbnVsbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGVybVZpZXdcbiJdfQ==
