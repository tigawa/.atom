(function() {
  var ColorProject, CompositeDisposable, Disposable, PigmentsAPI, PigmentsProvider, uris, url, _ref, _ref1;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  uris = require('./uris');

  ColorProject = require('./color-project');

  _ref1 = [], PigmentsProvider = _ref1[0], PigmentsAPI = _ref1[1], url = _ref1[2];

  module.exports = {
    config: {
      traverseIntoSymlinkDirectories: {
        type: 'boolean',
        "default": false
      },
      sourceNames: {
        type: 'array',
        "default": ['**/*.styl', '**/*.stylus', '**/*.less', '**/*.sass', '**/*.scss'],
        description: "Glob patterns of files to scan for variables.",
        items: {
          type: 'string'
        }
      },
      ignoredNames: {
        type: 'array',
        "default": ["vendor/*", "node_modules/*", "spec/*", "test/*"],
        description: "Glob patterns of files to ignore when scanning the project for variables.",
        items: {
          type: 'string'
        }
      },
      ignoredBufferNames: {
        type: 'array',
        "default": [],
        description: "Glob patterns of files that won't get any colors highlighted",
        items: {
          type: 'string'
        }
      },
      extendedSearchNames: {
        type: 'array',
        "default": ['**/*.css'],
        description: "When performing the `find-colors` command, the search will scans all the files that match the `sourceNames` glob patterns and the one defined in this setting."
      },
      supportedFiletypes: {
        type: 'array',
        "default": ['*'],
        description: "An array of file extensions where colors will be highlighted. If the wildcard `*` is present in this array then colors in every file will be highlighted."
      },
      ignoredScopes: {
        type: 'array',
        "default": [],
        description: "Regular expressions of scopes in which colors are ignored. For example, to ignore all colors in comments you can use `\\.comment`.",
        items: {
          type: 'string'
        }
      },
      autocompleteScopes: {
        type: 'array',
        "default": ['.source.css', '.source.css.less', '.source.sass', '.source.css.scss', '.source.stylus'],
        description: 'The autocomplete provider will only complete color names in editors whose scope is present in this list.',
        items: {
          type: 'string'
        }
      },
      extendAutocompleteToVariables: {
        type: 'boolean',
        "default": false,
        description: 'When enabled, the autocomplete provider will also provides completion for non-color variables.'
      },
      extendAutocompleteToColorValue: {
        type: 'boolean',
        "default": false,
        description: 'When enabled, the autocomplete provider will also provides color value.'
      },
      markerType: {
        type: 'string',
        "default": 'background',
        "enum": ['background', 'outline', 'underline', 'dot', 'square-dot', 'gutter']
      },
      sortPaletteColors: {
        type: 'string',
        "default": 'none',
        "enum": ['none', 'by name', 'by color']
      },
      groupPaletteColors: {
        type: 'string',
        "default": 'none',
        "enum": ['none', 'by file']
      },
      mergeColorDuplicates: {
        type: 'boolean',
        "default": false
      },
      delayBeforeScan: {
        type: 'integer',
        "default": 500,
        description: 'Number of milliseconds after which the current buffer will be scanned for changes in the colors. This delay starts at the end of the text input and will be aborted if you start typing again during the interval.'
      },
      ignoreVcsIgnoredPaths: {
        type: 'boolean',
        "default": true,
        title: 'Ignore VCS Ignored Paths'
      }
    },
    activate: function(state) {
      var convertMethod;
      this.project = state.project != null ? atom.deserializers.deserialize(state.project) : new ColorProject();
      atom.commands.add('atom-workspace', {
        'pigments:find-colors': (function(_this) {
          return function() {
            return _this.findColors();
          };
        })(this),
        'pigments:show-palette': (function(_this) {
          return function() {
            return _this.showPalette();
          };
        })(this),
        'pigments:project-settings': (function(_this) {
          return function() {
            return _this.showSettings();
          };
        })(this),
        'pigments:reload': (function(_this) {
          return function() {
            return _this.reloadProjectVariables();
          };
        })(this),
        'pigments:report': (function(_this) {
          return function() {
            return _this.createPigmentsReport();
          };
        })(this)
      });
      convertMethod = (function(_this) {
        return function(action) {
          return function(event) {
            var colorBuffer, editor, marker;
            marker = _this.lastEvent != null ? action(_this.colorMarkerForMouseEvent(_this.lastEvent)) : (editor = atom.workspace.getActiveTextEditor(), colorBuffer = _this.project.colorBufferForEditor(editor), editor.getCursors().forEach(function(cursor) {
              marker = colorBuffer.getColorMarkerAtBufferPosition(cursor.getBufferPosition());
              return action(marker);
            }));
            return _this.lastEvent = null;
          };
        };
      })(this);
      atom.commands.add('atom-text-editor', {
        'pigments:convert-to-hex': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHex();
          }
        }),
        'pigments:convert-to-rgb': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGB();
          }
        }),
        'pigments:convert-to-rgba': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGBA();
          }
        })
      });
      atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var host, protocol, _ref2;
          url || (url = require('url'));
          _ref2 = url.parse(uriToOpen), protocol = _ref2.protocol, host = _ref2.host;
          if (protocol !== 'pigments:') {
            return;
          }
          switch (host) {
            case 'search':
              return _this.project.findAllColors();
            case 'palette':
              return _this.project.getPalette();
            case 'settings':
              return atom.views.getView(_this.project);
          }
        };
      })(this));
      return atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Pigments',
            submenu: [
              {
                label: 'Convert to hexadecimal',
                command: 'pigments:convert-to-hex'
              }, {
                label: 'Convert to RGB',
                command: 'pigments:convert-to-rgb'
              }, {
                label: 'Convert to RGBA',
                command: 'pigments:convert-to-rgba'
              }
            ],
            shouldDisplay: (function(_this) {
              return function(event) {
                return _this.shouldDisplayContextMenu(event);
              };
            })(this)
          }
        ]
      });
    },
    deactivate: function() {
      var _ref2;
      return (_ref2 = this.getProject()) != null ? typeof _ref2.destroy === "function" ? _ref2.destroy() : void 0 : void 0;
    },
    provideAutocomplete: function() {
      if (PigmentsProvider == null) {
        PigmentsProvider = require('./pigments-provider');
      }
      return new PigmentsProvider(this);
    },
    provideAPI: function() {
      if (PigmentsAPI == null) {
        PigmentsAPI = require('./pigments-api');
      }
      return new PigmentsAPI(this.getProject());
    },
    consumeColorPicker: function(api) {
      this.getProject().setColorPickerAPI(api);
      return new Disposable((function(_this) {
        return function() {
          return _this.getProject().setColorPickerAPI(null);
        };
      })(this));
    },
    consumeColorExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      registry = this.getProject().getColorExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    consumeVariableExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      registry = this.getProject().getVariableExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    shouldDisplayContextMenu: function(event) {
      this.lastEvent = event;
      setTimeout(((function(_this) {
        return function() {
          return _this.lastEvent = null;
        };
      })(this)), 10);
      return this.colorMarkerForMouseEvent(event) != null;
    },
    colorMarkerForMouseEvent: function(event) {
      var colorBuffer, colorBufferElement, editor;
      editor = atom.workspace.getActiveTextEditor();
      colorBuffer = this.project.colorBufferForEditor(editor);
      colorBufferElement = atom.views.getView(colorBuffer);
      return colorBufferElement != null ? colorBufferElement.colorMarkerForMouseEvent(event) : void 0;
    },
    serialize: function() {
      return {
        project: this.project.serialize()
      };
    },
    getProject: function() {
      return this.project;
    },
    findColors: function() {
      var pane;
      pane = atom.workspace.paneForURI(uris.SEARCH);
      pane || (pane = atom.workspace.getActivePane());
      return atom.workspace.openURIInPane(uris.SEARCH, pane, {});
    },
    showPalette: function() {
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.PALETTE);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.PALETTE, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    showSettings: function() {
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.SETTINGS);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.SETTINGS, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    reloadProjectVariables: function() {
      return this.project.initialize().then((function(_this) {
        return function() {
          return _this.project.loadPathsAndVariables();
        };
      })(this))["catch"](function(reason) {
        return console.error(reason);
      });
    },
    createPigmentsReport: function() {
      return atom.workspace.open('pigments-report.json').then((function(_this) {
        return function(editor) {
          return editor.setText(_this.createReport());
        };
      })(this));
    },
    createReport: function() {
      var o;
      o = {
        atom: atom.getVersion(),
        pigments: atom.packages.getLoadedPackage('pigments').metadata.version,
        platform: require('os').platform(),
        config: atom.config.get('pigments'),
        project: {
          config: {
            sourceNames: this.project.sourceNames,
            searchNames: this.project.searchNames,
            ignoredNames: this.project.ignoredNames,
            ignoredScopes: this.project.ignoredScopes,
            includeThemes: this.project.includeThemes,
            ignoreGlobalSourceNames: this.project.ignoreGlobalSourceNames,
            ignoreGlobalSearchNames: this.project.ignoreGlobalSearchNames,
            ignoreGlobalIgnoredNames: this.project.ignoreGlobalIgnoredNames,
            ignoreGlobalIgnoredScopes: this.project.ignoreGlobalIgnoredScopes
          },
          paths: this.project.getPaths(),
          variables: {
            colors: this.project.getColorVariables().length,
            total: this.project.getVariables().length
          }
        }
      };
      return JSON.stringify(o, null, 2).replace(RegExp("" + (atom.project.getPaths().join('|')), "g"), '<root>');
    },
    loadDeserializersAndRegisterViews: function() {
      var ColorBuffer, ColorBufferElement, ColorMarkerElement, ColorProjectElement, ColorResultsElement, ColorSearch, Palette, PaletteElement, VariablesCollection;
      ColorBuffer = require('./color-buffer');
      ColorSearch = require('./color-search');
      Palette = require('./palette');
      ColorBufferElement = require('./color-buffer-element');
      ColorMarkerElement = require('./color-marker-element');
      ColorResultsElement = require('./color-results-element');
      ColorProjectElement = require('./color-project-element');
      PaletteElement = require('./palette-element');
      VariablesCollection = require('./variables-collection');
      ColorBufferElement.registerViewProvider(ColorBuffer);
      ColorResultsElement.registerViewProvider(ColorSearch);
      ColorProjectElement.registerViewProvider(ColorProject);
      PaletteElement.registerViewProvider(Palette);
      atom.deserializers.add(Palette);
      atom.deserializers.add(ColorSearch);
      atom.deserializers.add(ColorProject);
      atom.deserializers.add(ColorProjectElement);
      return atom.deserializers.add(VariablesCollection);
    }
  };

  module.exports.loadDeserializersAndRegisterViews();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGlnbWVudHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9HQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixrQkFBQSxVQUF0QixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FGZixDQUFBOztBQUFBLEVBR0EsUUFBdUMsRUFBdkMsRUFBQywyQkFBRCxFQUFtQixzQkFBbkIsRUFBZ0MsY0FIaEMsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsOEJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BREY7QUFBQSxNQUdBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxDQUNQLFdBRE8sRUFFUCxhQUZPLEVBR1AsV0FITyxFQUlQLFdBSk8sRUFLUCxXQUxPLENBRFQ7QUFBQSxRQVFBLFdBQUEsRUFBYSwrQ0FSYjtBQUFBLFFBU0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQVZGO09BSkY7QUFBQSxNQWVBLFlBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxDQUNQLFVBRE8sRUFFUCxnQkFGTyxFQUdQLFFBSE8sRUFJUCxRQUpPLENBRFQ7QUFBQSxRQU9BLFdBQUEsRUFBYSwyRUFQYjtBQUFBLFFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/pigments/lib/pigments.coffee