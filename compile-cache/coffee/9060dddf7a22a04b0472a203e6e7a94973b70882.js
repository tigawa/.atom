(function() {
  var CompositeDisposable, Emitter, ListView, TermView, Terminals, capitalize, config, getColors, keypather, path;

  path = require('path');

  TermView = require('./lib/term-view');

  ListView = require('./lib/build/list-view');

  Terminals = require('./lib/terminal-model');

  Emitter = require('event-kit').Emitter;

  keypather = require('keypather')();

  CompositeDisposable = require('event-kit').CompositeDisposable;

  capitalize = function(str) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  };

  getColors = function() {
    var background, brightBlack, brightBlue, brightCyan, brightGreen, brightPurple, brightRed, brightWhite, brightYellow, foreground, normalBlack, normalBlue, normalCyan, normalGreen, normalPurple, normalRed, normalWhite, normalYellow, ref;
    ref = (atom.config.getAll('term3.colors'))[0].value, normalBlack = ref.normalBlack, normalRed = ref.normalRed, normalGreen = ref.normalGreen, normalYellow = ref.normalYellow, normalBlue = ref.normalBlue, normalPurple = ref.normalPurple, normalCyan = ref.normalCyan, normalWhite = ref.normalWhite, brightBlack = ref.brightBlack, brightRed = ref.brightRed, brightGreen = ref.brightGreen, brightYellow = ref.brightYellow, brightBlue = ref.brightBlue, brightPurple = ref.brightPurple, brightCyan = ref.brightCyan, brightWhite = ref.brightWhite, background = ref.background, foreground = ref.foreground;
    return [normalBlack, normalRed, normalGreen, normalYellow, normalBlue, normalPurple, normalCyan, normalWhite, brightBlack, brightRed, brightGreen, brightYellow, brightBlue, brightPurple, brightCyan, brightWhite, background, foreground].map(function(color) {
      return color.toHexString();
    });
  };

  config = {
    autoRunCommand: {
      type: 'string',
      "default": ''
    },
    titleTemplate: {
      type: 'string',
      "default": "Terminal ({{ bashName }})"
    },
    fontFamily: {
      type: 'string',
      "default": ''
    },
    fontSize: {
      type: 'string',
      "default": ''
    },
    colors: {
      type: 'object',
      properties: {
        normalBlack: {
          type: 'color',
          "default": '#2e3436'
        },
        normalRed: {
          type: 'color',
          "default": '#cc0000'
        },
        normalGreen: {
          type: 'color',
          "default": '#4e9a06'
        },
        normalYellow: {
          type: 'color',
          "default": '#c4a000'
        },
        normalBlue: {
          type: 'color',
          "default": '#3465a4'
        },
        normalPurple: {
          type: 'color',
          "default": '#75507b'
        },
        normalCyan: {
          type: 'color',
          "default": '#06989a'
        },
        normalWhite: {
          type: 'color',
          "default": '#d3d7cf'
        },
        brightBlack: {
          type: 'color',
          "default": '#555753'
        },
        brightRed: {
          type: 'color',
          "default": '#ef2929'
        },
        brightGreen: {
          type: 'color',
          "default": '#8ae234'
        },
        brightYellow: {
          type: 'color',
          "default": '#fce94f'
        },
        brightBlue: {
          type: 'color',
          "default": '#729fcf'
        },
        brightPurple: {
          type: 'color',
          "default": '#ad7fa8'
        },
        brightCyan: {
          type: 'color',
          "default": '#34e2e2'
        },
        brightWhite: {
          type: 'color',
          "default": '#eeeeec'
        },
        background: {
          type: 'color',
          "default": '#000000'
        },
        foreground: {
          type: 'color',
          "default": '#f0f0f0'
        }
      }
    },
    scrollback: {
      type: 'integer',
      "default": 1000
    },
    cursorBlink: {
      type: 'boolean',
      "default": true
    },
    shellOverride: {
      type: 'string',
      "default": ''
    },
    shellArguments: {
      type: 'string',
      "default": (function(arg) {
        var HOME, SHELL;
        SHELL = arg.SHELL, HOME = arg.HOME;
        switch (path.basename(SHELL && SHELL.toLowerCase())) {
          case 'bash':
            return "--init-file " + (path.join(HOME, '.bash_profile'));
          case 'zsh':
            return "-l";
          default:
            return '';
        }
      })(process.env)
    },
    openPanesInSameSplit: {
      type: 'boolean',
      "default": false
    }
  };

  module.exports = {
    termViews: [],
    focusedTerminal: false,
    emitter: new Emitter(),
    config: config,
    disposables: null,
    activate: function(state) {
      this.state = state;
      this.disposables = new CompositeDisposable();
      if (!process.env.LANG) {
        console.warn("Term3: LANG environment variable is not set. Fancy characters (å, ñ, ó, etc`) may be corrupted. The only work-around is to quit Atom and run `atom` from your shell.");
      }
      ['up', 'right', 'down', 'left'].forEach((function(_this) {
        return function(direction) {
          return _this.disposables.add(atom.commands.add("atom-workspace", "term3:open-split-" + direction, _this.splitTerm.bind(_this, direction)));
        };
      })(this));
      this.disposables.add(atom.commands.add("atom-workspace", "term3:open", this.newTerm.bind(this)));
      this.disposables.add(atom.commands.add("atom-workspace", "term3:pipe-path", this.pipeTerm.bind(this, 'path')));
      this.disposables.add(atom.commands.add("atom-workspace", "term3:pipe-selection", this.pipeTerm.bind(this, 'selection')));
      return atom.packages.activatePackage('tree-view').then((function(_this) {
        return function(treeViewPkg) {
          var node;
          node = new ListView();
          return treeViewPkg.mainModule.treeView.find(".tree-view-scroller").prepend(node);
        };
      })(this));
    },
    service_0_1_3: function() {
      return {
        getTerminals: this.getTerminals.bind(this),
        onTerm: this.onTerm.bind(this),
        newTerm: this.newTerm.bind(this)
      };
    },
    getTerminals: function() {
      return Terminals.map(function(t) {
        return t.term;
      });
    },
    onTerm: function(callback) {
      return this.emitter.on('term', callback);
    },
    attachSubscriptions: function(termView, item, pane) {
      var focusNextTick, subscriptions;
      subscriptions = new CompositeDisposable;
      focusNextTick = function(activeItem) {
        return process.nextTick(function() {
          var atomPane;
          termView.focus();
          atomPane = activeItem.parentsUntil("atom-pane").parent()[0];
          if (termView.term) {
            return termView.term.constructor._textarea = atomPane;
          }
        });
      };
      subscriptions.add(pane.onDidActivate(function() {
        var activeItem;
        activeItem = pane.getActiveItem();
        if (activeItem !== item) {
          return;
        }
        this.focusedTerminal = termView;
        termView.focus();
        return focusNextTick(activeItem);
      }));
      subscriptions.add(pane.onDidChangeActiveItem(function(activeItem) {
        if (activeItem !== termView) {
          if (termView.term) {
            termView.term.constructor._textarea = null;
          }
          return;
        }
        return focusNextTick(activeItem);
      }));
      subscriptions.add(termView.onExit(function() {
        return Terminals.remove(termView.id);
      }));
      subscriptions.add(pane.onWillRemoveItem((function(_this) {
        return function(itemRemoved, index) {
          if (itemRemoved.item === item) {
            item.destroy();
            Terminals.remove(termView.id);
            _this.disposables.remove(subscriptions);
            return subscriptions.dispose();
          }
        };
      })(this)));
      return subscriptions;
    },
    newTerm: function(forkPTY, rows, cols, title) {
      var item, pane, termView;
      if (forkPTY == null) {
        forkPTY = true;
      }
      if (rows == null) {
        rows = 30;
      }
      if (cols == null) {
        cols = 80;
      }
      if (title == null) {
        title = 'tty';
      }
      termView = this.createTermView(forkPTY, rows, cols, title);
      pane = atom.workspace.getActivePane();
      item = pane.addItem(termView);
      this.disposables.add(this.attachSubscriptions(termView, item, pane));
      pane.activateItem(item);
      return termView;
    },
    createTermView: function(forkPTY, rows, cols, title) {
      var base, editorPath, id, model, opts, termView;
      if (forkPTY == null) {
        forkPTY = true;
      }
      if (rows == null) {
        rows = 30;
      }
      if (cols == null) {
        cols = 80;
      }
      if (title == null) {
        title = 'tty';
      }
      opts = {
        runCommand: atom.config.get('term3.autoRunCommand'),
        shellOverride: atom.config.get('term3.shellOverride'),
        shellArguments: atom.config.get('term3.shellArguments'),
        titleTemplate: atom.config.get('term3.titleTemplate'),
        cursorBlink: atom.config.get('term3.cursorBlink'),
        fontFamily: atom.config.get('term3.fontFamily'),
        fontSize: atom.config.get('term3.fontSize'),
        colors: getColors(),
        forkPTY: forkPTY,
        rows: rows,
        cols: cols
      };
      if (opts.shellOverride) {
        opts.shell = opts.shellOverride;
      } else {
        opts.shell = process.env.SHELL || 'bash';
      }
      editorPath = keypather.get(atom, 'workspace.getEditorViews[0].getEditor().getPath()');
      opts.cwd = opts.cwd || atom.project.getPaths()[0] || editorPath || process.env.HOME;
      termView = new TermView(opts);
      model = Terminals.add({
        local: !!forkPTY,
        term: termView,
        title: title
      });
      id = model.id;
      termView.id = id;
      termView.on('remove', this.handleRemoveTerm.bind(this));
      termView.on('click', (function(_this) {
        return function() {
          termView.term.element.focus();
          termView.term.focus();
          return _this.focusedTerminal = termView;
        };
      })(this));
      termView.onDidChangeTitle(function() {
        if (forkPTY) {
          return model.title = termView.getTitle();
        } else {
          return model.title = title + '-' + termView.getTitle();
        }
      });
      if (typeof (base = this.termViews).push === "function") {
        base.push(termView);
      }
      process.nextTick((function(_this) {
        return function() {
          return _this.emitter.emit('term', termView);
        };
      })(this));
      return termView;
    },
    splitTerm: function(direction) {
      var activePane, item, openPanesInSameSplit, pane, splitter, termView;
      openPanesInSameSplit = atom.config.get('term3.openPanesInSameSplit');
      termView = this.createTermView();
      direction = capitalize(direction);
      splitter = (function(_this) {
        return function() {
          var pane;
          pane = activePane["split" + direction]({
            items: [termView]
          });
          activePane.termSplits[direction] = pane;
          _this.focusedTerminal = [pane, pane.items[0]];
          return _this.disposables.add(_this.attachSubscriptions(termView, pane.items[0], pane));
        };
      })(this);
      activePane = atom.workspace.getActivePane();
      activePane.termSplits || (activePane.termSplits = {});
      if (openPanesInSameSplit) {
        if (activePane.termSplits[direction] && activePane.termSplits[direction].items.length > 0) {
          pane = activePane.termSplits[direction];
          item = pane.addItem(termView);
          pane.activateItem(item);
          this.focusedTerminal = [pane, item];
          return this.disposables.add(this.attachSubscriptions(termView, item, pane));
        } else {
          return splitter();
        }
      } else {
        return splitter();
      }
    },
    pipeTerm: function(action) {
      var editor, item, pane, ref, stream;
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return;
      }
      stream = (function() {
        switch (action) {
          case 'path':
            return editor.getBuffer().file.path;
          case 'selection':
            return editor.getSelectedText();
        }
      })();
      if (stream && this.focusedTerminal) {
        if (Array.isArray(this.focusedTerminal)) {
          ref = this.focusedTerminal, pane = ref[0], item = ref[1];
          pane.activateItem(item);
        } else {
          item = this.focusedTerminal;
        }
        item.pty.write(stream.trim());
        return item.term.focus();
      }
    },
    handleRemoveTerm: function(termView) {
      return this.termViews.splice(this.termViews.indexOf(termView), 1);
    },
    deactivate: function() {
      this.termViews.forEach(function(view) {
        return view.exit();
      });
      this.termViews = [];
      return this.disposables.dispose;
    },
    serialize: function() {
      var termViewsState;
      termViewsState = this.termViews.map(function(view) {
        return view.serialize();
      });
      return {
        termViews: termViewsState
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy90ZXJtMy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsdUJBQVI7O0VBQ1gsU0FBQSxHQUFZLE9BQUEsQ0FBUSxzQkFBUjs7RUFDWCxVQUFZLE9BQUEsQ0FBUSxXQUFSOztFQUNiLFNBQUEsR0FBZ0IsT0FBQSxDQUFRLFdBQVIsQ0FBSCxDQUFBOztFQUNaLHNCQUF1QixPQUFBLENBQVEsV0FBUjs7RUFFeEIsVUFBQSxHQUFhLFNBQUMsR0FBRDtXQUFRLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFQLENBQUEsQ0FBQSxHQUF1QixHQUFJLFNBQUksQ0FBQyxXQUFULENBQUE7RUFBL0I7O0VBRWIsU0FBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsTUFNSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBWixDQUFtQixjQUFuQixDQUFELENBQW9DLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FOM0MsRUFDRSw2QkFERixFQUNlLHlCQURmLEVBQzBCLDZCQUQxQixFQUN1QywrQkFEdkMsRUFFRSwyQkFGRixFQUVjLCtCQUZkLEVBRTRCLDJCQUY1QixFQUV3Qyw2QkFGeEMsRUFHRSw2QkFIRixFQUdlLHlCQUhmLEVBRzBCLDZCQUgxQixFQUd1QywrQkFIdkMsRUFJRSwyQkFKRixFQUljLCtCQUpkLEVBSTRCLDJCQUo1QixFQUl3Qyw2QkFKeEMsRUFLRSwyQkFMRixFQUtjO1dBRWQsQ0FDRSxXQURGLEVBQ2UsU0FEZixFQUMwQixXQUQxQixFQUN1QyxZQUR2QyxFQUVFLFVBRkYsRUFFYyxZQUZkLEVBRTRCLFVBRjVCLEVBRXdDLFdBRnhDLEVBR0UsV0FIRixFQUdlLFNBSGYsRUFHMEIsV0FIMUIsRUFHdUMsWUFIdkMsRUFJRSxVQUpGLEVBSWMsWUFKZCxFQUk0QixVQUo1QixFQUl3QyxXQUp4QyxFQUtFLFVBTEYsRUFLYyxVQUxkLENBTUMsQ0FBQyxHQU5GLENBTU0sU0FBQyxLQUFEO2FBQVcsS0FBSyxDQUFDLFdBQU4sQ0FBQTtJQUFYLENBTk47RUFSVTs7RUFnQlosTUFBQSxHQUNFO0lBQUEsY0FBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFFBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7S0FERjtJQUdBLGFBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxRQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUywyQkFEVDtLQUpGO0lBTUEsVUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFFBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7S0FQRjtJQVNBLFFBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxRQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO0tBVkY7SUFZQSxNQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLFVBQUEsRUFDRTtRQUFBLFdBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxPQUFOO1VBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQURUO1NBREY7UUFHQSxTQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sT0FBTjtVQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FEVDtTQUpGO1FBTUEsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0FQRjtRQVNBLFlBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxPQUFOO1VBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQURUO1NBVkY7UUFZQSxVQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sT0FBTjtVQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FEVDtTQWJGO1FBZUEsWUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0FoQkY7UUFrQkEsVUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0FuQkY7UUFxQkEsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0F0QkY7UUF3QkEsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0F6QkY7UUEyQkEsU0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0E1QkY7UUE4QkEsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0EvQkY7UUFpQ0EsWUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0FsQ0Y7UUFvQ0EsVUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0FyQ0Y7UUF1Q0EsWUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0F4Q0Y7UUEwQ0EsVUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0EzQ0Y7UUE2Q0EsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0E5Q0Y7UUFnREEsVUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7U0FqREY7UUFtREEsVUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLE9BQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNB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Q0FBQTtBQUpLOztNQU1ULElBQUcsTUFBQSxJQUFXLElBQUMsQ0FBQSxlQUFmO1FBQ0UsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxlQUFmLENBQUg7VUFDRSxNQUFlLElBQUMsQ0FBQSxlQUFoQixFQUFDLGFBQUQsRUFBTztVQUNQLElBQUksQ0FBQyxZQUFMLENBQWtCLElBQWxCLEVBRkY7U0FBQSxNQUFBO1VBSUUsSUFBQSxHQUFPLElBQUMsQ0FBQSxnQkFKVjs7UUFNQSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWY7ZUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsQ0FBQSxFQVJGOztJQVZRLENBbEtWO0lBc0xBLGdCQUFBLEVBQWtCLFNBQUMsUUFBRDthQUNoQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLFFBQW5CLENBQWxCLEVBQWdELENBQWhEO0lBRGdCLENBdExsQjtJQXlMQSxVQUFBLEVBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixTQUFDLElBQUQ7ZUFBVSxJQUFJLENBQUMsSUFBTCxDQUFBO01BQVYsQ0FBbkI7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLFdBQVcsQ0FBQztJQUhKLENBekxYO0lBOExBLFNBQUEsRUFBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFmLENBQW1CLFNBQUMsSUFBRDtlQUFTLElBQUksQ0FBQyxTQUFMLENBQUE7TUFBVCxDQUFuQjthQUNqQjtRQUFDLFNBQUEsRUFBVyxjQUFaOztJQUZRLENBOUxWOztBQXRIRiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuVGVybVZpZXcgPSByZXF1aXJlICcuL2xpYi90ZXJtLXZpZXcnXG5MaXN0VmlldyA9IHJlcXVpcmUgJy4vbGliL2J1aWxkL2xpc3QtdmlldydcblRlcm1pbmFscyA9IHJlcXVpcmUgJy4vbGliL3Rlcm1pbmFsLW1vZGVsJ1xue0VtaXR0ZXJ9ICA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcbmtleXBhdGhlciAgPSBkbyByZXF1aXJlICdrZXlwYXRoZXInXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG5cbmNhcGl0YWxpemUgPSAoc3RyKS0+IHN0clswXS50b1VwcGVyQ2FzZSgpICsgc3RyWzEuLl0udG9Mb3dlckNhc2UoKVxuXG5nZXRDb2xvcnMgPSAtPlxuICB7XG4gICAgbm9ybWFsQmxhY2ssIG5vcm1hbFJlZCwgbm9ybWFsR3JlZW4sIG5vcm1hbFllbGxvd1xuICAgIG5vcm1hbEJsdWUsIG5vcm1hbFB1cnBsZSwgbm9ybWFsQ3lhbiwgbm9ybWFsV2hpdGVcbiAgICBicmlnaHRCbGFjaywgYnJpZ2h0UmVkLCBicmlnaHRHcmVlbiwgYnJpZ2h0WWVsbG93XG4gICAgYnJpZ2h0Qmx1ZSwgYnJpZ2h0UHVycGxlLCBicmlnaHRDeWFuLCBicmlnaHRXaGl0ZVxuICAgIGJhY2tncm91bmQsIGZvcmVncm91bmRcbiAgfSA9IChhdG9tLmNvbmZpZy5nZXRBbGwgJ3Rlcm0zLmNvbG9ycycpWzBdLnZhbHVlXG4gIFtcbiAgICBub3JtYWxCbGFjaywgbm9ybWFsUmVkLCBub3JtYWxHcmVlbiwgbm9ybWFsWWVsbG93XG4gICAgbm9ybWFsQmx1ZSwgbm9ybWFsUHVycGxlLCBub3JtYWxDeWFuLCBub3JtYWxXaGl0ZVxuICAgIGJyaWdodEJsYWNrLCBicmlnaHRSZWQsIGJyaWdodEdyZWVuLCBicmlnaHRZZWxsb3dcbiAgICBicmlnaHRCbHVlLCBicmlnaHRQdXJwbGUsIGJyaWdodEN5YW4sIGJyaWdodFdoaXRlXG4gICAgYmFja2dyb3VuZCwgZm9yZWdyb3VuZFxuICBdLm1hcCAoY29sb3IpIC0+IGNvbG9yLnRvSGV4U3RyaW5nKClcblxuY29uZmlnID1cbiAgYXV0b1J1bkNvbW1hbmQ6XG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAnJ1xuICB0aXRsZVRlbXBsYXRlOlxuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogXCJUZXJtaW5hbCAoe3sgYmFzaE5hbWUgfX0pXCJcbiAgZm9udEZhbWlseTpcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICcnXG4gIGZvbnRTaXplOlxuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJydcbiAgY29sb3JzOlxuICAgIHR5cGU6ICdvYmplY3QnXG4gICAgcHJvcGVydGllczpcbiAgICAgIG5vcm1hbEJsYWNrOlxuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICcjMmUzNDM2J1xuICAgICAgbm9ybWFsUmVkOlxuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICcjY2MwMDAwJ1xuICAgICAgbm9ybWFsR3JlZW46XG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJyM0ZTlhMDYnXG4gICAgICBub3JtYWxZZWxsb3c6XG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJyNjNGEwMDAnXG4gICAgICBub3JtYWxCbHVlOlxuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICcjMzQ2NWE0J1xuICAgICAgbm9ybWFsUHVycGxlOlxuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICcjNzU1MDdiJ1xuICAgICAgbm9ybWFsQ3lhbjpcbiAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICBkZWZhdWx0OiAnIzA2OTg5YSdcbiAgICAgIG5vcm1hbFdoaXRlOlxuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICcjZDNkN2NmJ1xuICAgICAgYnJpZ2h0QmxhY2s6XG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJyM1NTU3NTMnXG4gICAgICBicmlnaHRSZWQ6XG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJyNlZjI5MjknXG4gICAgICBicmlnaHRHcmVlbjpcbiAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICBkZWZhdWx0OiAnIzhhZTIzNCdcbiAgICAgIGJyaWdodFllbGxvdzpcbiAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICBkZWZhdWx0OiAnI2ZjZTk0ZidcbiAgICAgIGJyaWdodEJsdWU6XG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJyM3MjlmY2YnXG4gICAgICBicmlnaHRQdXJwbGU6XG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJyNhZDdmYTgnXG4gICAgICBicmlnaHRDeWFuOlxuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICcjMzRlMmUyJ1xuICAgICAgYnJpZ2h0V2hpdGU6XG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJyNlZWVlZWMnXG4gICAgICBiYWNrZ3JvdW5kOlxuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICcjMDAwMDAwJ1xuICAgICAgZm9yZWdyb3VuZDpcbiAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICBkZWZhdWx0OiAnI2YwZjBmMCdcbiAgc2Nyb2xsYmFjazpcbiAgICB0eXBlOiAnaW50ZWdlcidcbiAgICBkZWZhdWx0OiAxMDAwXG4gIGN1cnNvckJsaW5rOlxuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgc2hlbGxPdmVycmlkZTpcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICcnXG4gIHNoZWxsQXJndW1lbnRzOlxuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogZG8gKHtTSEVMTCwgSE9NRX09cHJvY2Vzcy5lbnYpIC0+XG4gICAgICBzd2l0Y2ggcGF0aC5iYXNlbmFtZSBTSEVMTCAmJiBTSEVMTC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHdoZW4gJ2Jhc2gnIHRoZW4gXCItLWluaXQtZmlsZSAje3BhdGguam9pbiBIT01FLCAnLmJhc2hfcHJvZmlsZSd9XCJcbiAgICAgICAgd2hlbiAnenNoJyAgdGhlbiBcIi1sXCJcbiAgICAgICAgZWxzZSAnJ1xuICBvcGVuUGFuZXNJblNhbWVTcGxpdDpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgdGVybVZpZXdzOiBbXVxuICBmb2N1c2VkVGVybWluYWw6IG9mZlxuICBlbWl0dGVyOiBuZXcgRW1pdHRlcigpXG4gIGNvbmZpZzogY29uZmlnXG4gIGRpc3Bvc2FibGVzOiBudWxsXG5cbiAgYWN0aXZhdGU6IChAc3RhdGUpIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdW5sZXNzIHByb2Nlc3MuZW52LkxBTkdcbiAgICAgIGNvbnNvbGUud2FybiBcIlRlcm0zOiBMQU5HIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG5vdCBzZXQuIEZhbmN5IGNoYXJhY3RlcnMgKMOlLCDDsSwgw7MsIGV0Y2ApIG1heSBiZSBjb3JydXB0ZWQuIFRoZSBvbmx5IHdvcmstYXJvdW5kIGlzIHRvIHF1aXQgQXRvbSBhbmQgcnVuIGBhdG9tYCBmcm9tIHlvdXIgc2hlbGwuXCJcblxuICAgIFsndXAnLCAncmlnaHQnLCAnZG93bicsICdsZWZ0J10uZm9yRWFjaCAoZGlyZWN0aW9uKSA9PlxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwidGVybTM6b3Blbi1zcGxpdC0je2RpcmVjdGlvbn1cIiwgQHNwbGl0VGVybS5iaW5kKHRoaXMsIGRpcmVjdGlvbilcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcInRlcm0zOm9wZW5cIiwgQG5ld1Rlcm0uYmluZCh0aGlzKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcInRlcm0zOnBpcGUtcGF0aFwiLCBAcGlwZVRlcm0uYmluZCh0aGlzLCAncGF0aCcpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwidGVybTM6cGlwZS1zZWxlY3Rpb25cIiwgQHBpcGVUZXJtLmJpbmQodGhpcywgJ3NlbGVjdGlvbicpXG5cbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndHJlZS12aWV3JykudGhlbiAodHJlZVZpZXdQa2cpID0+XG4gICAgICBub2RlID0gbmV3IExpc3RWaWV3KClcbiAgICAgIHRyZWVWaWV3UGtnLm1haW5Nb2R1bGUudHJlZVZpZXcuZmluZChcIi50cmVlLXZpZXctc2Nyb2xsZXJcIikucHJlcGVuZCBub2RlXG5cbiAgc2VydmljZV8wXzFfMzogKCkgLT5cbiAgICB7XG4gICAgICBnZXRUZXJtaW5hbHM6IEBnZXRUZXJtaW5hbHMuYmluZCh0aGlzKSxcbiAgICAgIG9uVGVybTogQG9uVGVybS5iaW5kKHRoaXMpLFxuICAgICAgbmV3VGVybTogQG5ld1Rlcm0uYmluZCh0aGlzKSxcbiAgICB9XG5cbiAgZ2V0VGVybWluYWxzOiAtPlxuICAgIFRlcm1pbmFscy5tYXAgKHQpIC0+XG4gICAgICB0LnRlcm1cblxuICBvblRlcm06IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAndGVybScsIGNhbGxiYWNrXG5cbiAgYXR0YWNoU3Vic2NyaXB0aW9uczogKHRlcm1WaWV3LCBpdGVtLCBwYW5lKSAtPlxuICAgIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgZm9jdXNOZXh0VGljayA9IChhY3RpdmVJdGVtKSAtPlxuICAgICAgcHJvY2Vzcy5uZXh0VGljayAtPlxuICAgICAgICB0ZXJtVmlldy5mb2N1cygpXG4gICAgICAgICMgSEFDSyFcbiAgICAgICAgIyBzbywgdGVybS5qcyBhbGxvd3MgZm9yIGEgc3BlY2lhbCBfdGV4dGFyZWEgYmVjYXVzZSBvZiBpZnJhbWUgc2hlbmFuaWdhbnMsXG4gICAgICAgICMgYnV0LCBpdCBpcyB0aGUgY29uc3RydWN0b3IgaW5zdGVhZCBvZiB0aGUgaW5zdGFuY2UhISExIC0gcHJvYmFibHkgdG8gYXZvaWQgaGF2aW5nIHRvIGJpbmQgdGhpcyBhcyBhIHByZW1hdHVyZVxuICAgICAgICAjIG9wdGltaXphdGlvbi5cbiAgICAgICAgYXRvbVBhbmUgPSBhY3RpdmVJdGVtLnBhcmVudHNVbnRpbChcImF0b20tcGFuZVwiKS5wYXJlbnQoKVswXVxuICAgICAgICBpZiB0ZXJtVmlldy50ZXJtXG4gICAgICAgICAgdGVybVZpZXcudGVybS5jb25zdHJ1Y3Rvci5fdGV4dGFyZWEgPSBhdG9tUGFuZVxuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQgcGFuZS5vbkRpZEFjdGl2YXRlIC0+XG4gICAgICBhY3RpdmVJdGVtID0gcGFuZS5nZXRBY3RpdmVJdGVtKClcbiAgICAgIGlmIGFjdGl2ZUl0ZW0gIT0gaXRlbVxuICAgICAgICByZXR1cm5cbiAgICAgIEBmb2N1c2VkVGVybWluYWwgPSB0ZXJtVmlld1xuICAgICAgdGVybVZpZXcuZm9jdXMoKVxuICAgICAgZm9jdXNOZXh0VGljayBhY3RpdmVJdGVtXG5cbiAgICBzdWJzY3JpcHRpb25zLmFkZCBwYW5lLm9uRGlkQ2hhbmdlQWN0aXZlSXRlbSAoYWN0aXZlSXRlbSkgLT5cbiAgICAgIGlmIGFjdGl2ZUl0ZW0gIT0gdGVybVZpZXdcbiAgICAgICAgaWYgdGVybVZpZXcudGVybVxuICAgICAgICAgIHRlcm1WaWV3LnRlcm0uY29uc3RydWN0b3IuX3RleHRhcmVhID0gbnVsbFxuICAgICAgICByZXR1cm5cbiAgICAgIGZvY3VzTmV4dFRpY2sgYWN0aXZlSXRlbVxuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQgdGVybVZpZXcub25FeGl0ICgpIC0+XG4gICAgICBUZXJtaW5hbHMucmVtb3ZlIHRlcm1WaWV3LmlkXG5cbiAgICBzdWJzY3JpcHRpb25zLmFkZCBwYW5lLm9uV2lsbFJlbW92ZUl0ZW0gKGl0ZW1SZW1vdmVkLCBpbmRleCkgPT5cbiAgICAgIGlmIGl0ZW1SZW1vdmVkLml0ZW0gPT0gaXRlbVxuICAgICAgICBpdGVtLmRlc3Ryb3koKVxuICAgICAgICBUZXJtaW5hbHMucmVtb3ZlIHRlcm1WaWV3LmlkXG4gICAgICAgIEBkaXNwb3NhYmxlcy5yZW1vdmUgc3Vic2NyaXB0aW9uc1xuICAgICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgc3Vic2NyaXB0aW9uc1xuXG4gIG5ld1Rlcm06IChmb3JrUFRZPXRydWUsIHJvd3M9MzAsIGNvbHM9ODAsIHRpdGxlPSd0dHknKSAtPlxuICAgIHRlcm1WaWV3ID0gQGNyZWF0ZVRlcm1WaWV3IGZvcmtQVFksIHJvd3MsIGNvbHMsIHRpdGxlXG4gICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIGl0ZW0gPSBwYW5lLmFkZEl0ZW0gdGVybVZpZXdcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBhdHRhY2hTdWJzY3JpcHRpb25zKHRlcm1WaWV3LCBpdGVtLCBwYW5lKVxuICAgIHBhbmUuYWN0aXZhdGVJdGVtIGl0ZW1cbiAgICB0ZXJtVmlld1xuXG4gIGNyZWF0ZVRlcm1WaWV3OiAoZm9ya1BUWT10cnVlLCByb3dzPTMwLCBjb2xzPTgwLCB0aXRsZT0ndHR5JykgLT5cbiAgICBvcHRzID1cbiAgICAgIHJ1bkNvbW1hbmQgICAgOiBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm0zLmF1dG9SdW5Db21tYW5kJ1xuICAgICAgc2hlbGxPdmVycmlkZSA6IGF0b20uY29uZmlnLmdldCAndGVybTMuc2hlbGxPdmVycmlkZSdcbiAgICAgIHNoZWxsQXJndW1lbnRzOiBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm0zLnNoZWxsQXJndW1lbnRzJ1xuICAgICAgdGl0bGVUZW1wbGF0ZSA6IGF0b20uY29uZmlnLmdldCAndGVybTMudGl0bGVUZW1wbGF0ZSdcbiAgICAgIGN1cnNvckJsaW5rICAgOiBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm0zLmN1cnNvckJsaW5rJ1xuICAgICAgZm9udEZhbWlseSAgICA6IGF0b20uY29uZmlnLmdldCAndGVybTMuZm9udEZhbWlseSdcbiAgICAgIGZvbnRTaXplICAgICAgOiBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm0zLmZvbnRTaXplJ1xuICAgICAgY29sb3JzICAgICAgICA6IGdldENvbG9ycygpXG4gICAgICBmb3JrUFRZICAgICAgIDogZm9ya1BUWVxuICAgICAgcm93cyAgICAgICAgICA6IHJvd3NcbiAgICAgIGNvbHMgICAgICAgICAgOiBjb2xzXG5cbiAgICBpZiBvcHRzLnNoZWxsT3ZlcnJpZGVcbiAgICAgICAgb3B0cy5zaGVsbCA9IG9wdHMuc2hlbGxPdmVycmlkZVxuICAgIGVsc2VcbiAgICAgICAgb3B0cy5zaGVsbCA9IHByb2Nlc3MuZW52LlNIRUxMIG9yICdiYXNoJ1xuXG4gICAgIyBvcHRzLnNoZWxsQXJndW1lbnRzIG9yPSAnJ1xuICAgIGVkaXRvclBhdGggPSBrZXlwYXRoZXIuZ2V0IGF0b20sICd3b3Jrc3BhY2UuZ2V0RWRpdG9yVmlld3NbMF0uZ2V0RWRpdG9yKCkuZ2V0UGF0aCgpJ1xuICAgIG9wdHMuY3dkID0gb3B0cy5jd2Qgb3IgYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0gb3IgZWRpdG9yUGF0aCBvciBwcm9jZXNzLmVudi5IT01FXG5cbiAgICB0ZXJtVmlldyA9IG5ldyBUZXJtVmlldyBvcHRzXG4gICAgbW9kZWwgPSBUZXJtaW5hbHMuYWRkIHtcbiAgICAgIGxvY2FsOiAhIWZvcmtQVFksXG4gICAgICB0ZXJtOiB0ZXJtVmlldyxcbiAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICB9XG4gICAgaWQgPSBtb2RlbC5pZFxuICAgIHRlcm1WaWV3LmlkID0gaWRcblxuICAgIHRlcm1WaWV3Lm9uICdyZW1vdmUnLCBAaGFuZGxlUmVtb3ZlVGVybS5iaW5kIHRoaXNcbiAgICB0ZXJtVmlldy5vbiAnY2xpY2snLCA9PlxuICAgICAgIyBnZXQgZm9jdXMgaW4gdGhlIHRlcm1pbmFsXG4gICAgICAjIGF2b2lkIGRvdWJsZSBjbGljayB0byBnZXQgZm9jdXNcbiAgICAgIHRlcm1WaWV3LnRlcm0uZWxlbWVudC5mb2N1cygpXG4gICAgICB0ZXJtVmlldy50ZXJtLmZvY3VzKClcblxuICAgICAgQGZvY3VzZWRUZXJtaW5hbCA9IHRlcm1WaWV3XG5cbiAgICB0ZXJtVmlldy5vbkRpZENoYW5nZVRpdGxlICgpIC0+XG4gICAgICBpZiBmb3JrUFRZXG4gICAgICAgIG1vZGVsLnRpdGxlID0gdGVybVZpZXcuZ2V0VGl0bGUoKVxuICAgICAgZWxzZVxuICAgICAgICBtb2RlbC50aXRsZSA9IHRpdGxlICsgJy0nICsgdGVybVZpZXcuZ2V0VGl0bGUoKVxuXG4gICAgQHRlcm1WaWV3cy5wdXNoPyB0ZXJtVmlld1xuICAgIHByb2Nlc3MubmV4dFRpY2sgKCkgPT4gQGVtaXR0ZXIuZW1pdCAndGVybScsIHRlcm1WaWV3XG4gICAgdGVybVZpZXdcblxuICBzcGxpdFRlcm06IChkaXJlY3Rpb24pIC0+XG4gICAgb3BlblBhbmVzSW5TYW1lU3BsaXQgPSBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm0zLm9wZW5QYW5lc0luU2FtZVNwbGl0J1xuICAgIHRlcm1WaWV3ID0gQGNyZWF0ZVRlcm1WaWV3KClcbiAgICBkaXJlY3Rpb24gPSBjYXBpdGFsaXplIGRpcmVjdGlvblxuXG4gICAgc3BsaXR0ZXIgPSA9PlxuICAgICAgcGFuZSA9IGFjdGl2ZVBhbmVbXCJzcGxpdCN7ZGlyZWN0aW9ufVwiXSBpdGVtczogW3Rlcm1WaWV3XVxuICAgICAgYWN0aXZlUGFuZS50ZXJtU3BsaXRzW2RpcmVjdGlvbl0gPSBwYW5lXG4gICAgICBAZm9jdXNlZFRlcm1pbmFsID0gW3BhbmUsIHBhbmUuaXRlbXNbMF1dXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBhdHRhY2hTdWJzY3JpcHRpb25zKHRlcm1WaWV3LCBwYW5lLml0ZW1zWzBdLCBwYW5lKVxuXG4gICAgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIGFjdGl2ZVBhbmUudGVybVNwbGl0cyBvcj0ge31cbiAgICBpZiBvcGVuUGFuZXNJblNhbWVTcGxpdFxuICAgICAgaWYgYWN0aXZlUGFuZS50ZXJtU3BsaXRzW2RpcmVjdGlvbl0gYW5kIGFjdGl2ZVBhbmUudGVybVNwbGl0c1tkaXJlY3Rpb25dLml0ZW1zLmxlbmd0aCA+IDBcbiAgICAgICAgcGFuZSA9IGFjdGl2ZVBhbmUudGVybVNwbGl0c1tkaXJlY3Rpb25dXG4gICAgICAgIGl0ZW0gPSBwYW5lLmFkZEl0ZW0gdGVybVZpZXdcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0gaXRlbVxuICAgICAgICBAZm9jdXNlZFRlcm1pbmFsID0gW3BhbmUsIGl0ZW1dXG4gICAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGF0dGFjaFN1YnNjcmlwdGlvbnModGVybVZpZXcsIGl0ZW0sIHBhbmUpXG4gICAgICBlbHNlXG4gICAgICAgIHNwbGl0dGVyKClcbiAgICBlbHNlXG4gICAgICBzcGxpdHRlcigpXG5cbiAgcGlwZVRlcm06IChhY3Rpb24pIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgIWVkaXRvclxuICAgICAgcmV0dXJuXG4gICAgc3RyZWFtID0gc3dpdGNoIGFjdGlvblxuICAgICAgd2hlbiAncGF0aCdcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLmZpbGUucGF0aFxuICAgICAgd2hlbiAnc2VsZWN0aW9uJ1xuICAgICAgICBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcblxuICAgIGlmIHN0cmVhbSBhbmQgQGZvY3VzZWRUZXJtaW5hbFxuICAgICAgaWYgQXJyYXkuaXNBcnJheSBAZm9jdXNlZFRlcm1pbmFsXG4gICAgICAgIFtwYW5lLCBpdGVtXSA9IEBmb2N1c2VkVGVybWluYWxcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0gaXRlbVxuICAgICAgZWxzZVxuICAgICAgICBpdGVtID0gQGZvY3VzZWRUZXJtaW5hbFxuXG4gICAgICBpdGVtLnB0eS53cml0ZSBzdHJlYW0udHJpbSgpXG4gICAgICBpdGVtLnRlcm0uZm9jdXMoKVxuXG4gIGhhbmRsZVJlbW92ZVRlcm06ICh0ZXJtVmlldyktPlxuICAgIEB0ZXJtVmlld3Muc3BsaWNlIEB0ZXJtVmlld3MuaW5kZXhPZih0ZXJtVmlldyksIDFcblxuICBkZWFjdGl2YXRlOi0+XG4gICAgQHRlcm1WaWV3cy5mb3JFYWNoICh2aWV3KSAtPiB2aWV3LmV4aXQoKVxuICAgIEB0ZXJtVmlld3MgPSBbXVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlXG5cbiAgc2VyaWFsaXplOi0+XG4gICAgdGVybVZpZXdzU3RhdGUgPSB0aGlzLnRlcm1WaWV3cy5tYXAgKHZpZXcpLT4gdmlldy5zZXJpYWxpemUoKVxuICAgIHt0ZXJtVmlld3M6IHRlcm1WaWV3c1N0YXRlfVxuIl19
