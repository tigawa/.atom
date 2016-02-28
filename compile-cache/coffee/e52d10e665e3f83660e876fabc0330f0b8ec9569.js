(function() {
  var $, $$, Point, RailsTransporter, fs, path, temp, wrench, _ref;

  path = require('path');

  fs = require('fs');

  temp = require('temp');

  wrench = require('wrench');

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$ = _ref.$$;

  Point = require('atom').Point;

  RailsTransporter = require('../lib/rails-transporter');

  describe("RailsTransporter", function() {
    var activationPromise, editor, viewFinderView, workspaceElement, _ref1;
    activationPromise = null;
    _ref1 = [], workspaceElement = _ref1[0], viewFinderView = _ref1[1], editor = _ref1[2];
    beforeEach(function() {
      var fixturesPath, tempPath;
      tempPath = fs.realpathSync(temp.mkdirSync('atom'));
      fixturesPath = atom.project.getPaths()[0];
      wrench.copyDirSyncRecursive(fixturesPath, tempPath, {
        forceDelete: true
      });
      atom.project.setPaths([tempPath]);
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('rails-transporter');
    });
    describe("open-migration-finder behavior", function() {
      return describe("when the rails-transporter:open-migration-finder event is triggered", function() {
        return it("shows all migration paths and selects the first", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-migration-finder');
          waitsForPromise(function() {
            return activationPromise;
          });
          return runs(function() {
            var migration, migrationDir, _i, _len, _ref2, _results;
            migrationDir = path.join(atom.project.getPaths()[0], 'db', 'migrate');
            expect(workspaceElement.querySelectorAll('.select-list li').length).toBe(fs.readdirSync(migrationDir).length);
            _ref2 = fs.readdirSync(migrationDir);
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              migration = _ref2[_i];
              expect($(workspaceElement).find(".select-list .primary-line:contains(" + migration + ")")).toExist();
              _results.push(expect($(workspaceElement).find(".select-list .secondary-line:contains(" + (atom.project.relativize(path.join(migrationDir, migration))) + ")")).toExist());
            }
            return _results;
          });
        });
      });
    });
    describe("open-view behavior", function() {
      return describe("when active editor opens controller", function() {
        describe("open file", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
            });
          });
          return it("opens related view", function() {
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(9, 0));
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-view');
            waitsFor(function() {
              activationPromise;
              return atom.workspace.getActivePane().getItems().length === 2;
            });
            return runs(function() {
              var viewPath;
              viewPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', 'index.html.erb');
              editor = atom.workspace.getActiveTextEditor();
              expect(editor.getPath()).toBe(viewPath);
              return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^<h1>Listing blogs<\/h1>$/);
            });
          });
        });
        return describe("open file for fallbacks", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              atom.config.set('rails-transporter.viewFileExtension', ['json.jbuilder']);
              return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'api', 'blogs_controller.rb'));
            });
          });
          return it("opens related view", function() {
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(4, 0));
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-view');
            waitsFor(function() {
              activationPromise;
              return atom.workspace.getActivePane().getItems().length === 2;
            });
            return runs(function() {
              var viewPath;
              viewPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'api', 'blogs', 'index.json.jbuilder');
              editor = atom.workspace.getActiveTextEditor();
              expect(editor.getPath()).toBe(viewPath);
              return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^json.array!(@blogs) do |blog|$/);
            });
          });
        });
      });
    });
    describe("open-view-finder behavior", function() {
      describe("when active editor opens controller", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
          });
        });
        return describe("when the rails-transporter:open-view-finder event is triggered", function() {
          return it("shows all relative view paths for the current controller and selects the first", function() {
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-view-finder');
            waitsForPromise(function() {
              return activationPromise;
            });
            return runs(function() {
              var view, viewDir, _i, _len, _ref2;
              viewDir = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs');
              expect($(workspaceElement).find('.select-list li').length).toBe(fs.readdirSync(viewDir).length);
              _ref2 = fs.readdirSync(viewDir);
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                view = _ref2[_i];
                expect($(workspaceElement).find(".select-list .primary-line:contains(" + view + ")")).toExist();
                expect($(workspaceElement).find(".select-list .secondary-line:contains(" + (atom.project.relativize(path.join(viewDir, view))) + ")")).toExist();
              }
              expect($(workspaceElement).find(".select-list li:first")).toHaveClass('two-lines selected');
              return atom.commands.dispatch(workspaceElement, 'rails-transporter:open-view-finder');
            });
          });
        });
      });
      describe("when active editor opens mailer", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'mailers', 'notification_mailer.rb'));
          });
        });
        return describe("when the rails-transporter:open-view-finder event is triggered", function() {});
      });
      return describe("when active editor opens model", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb'));
          });
        });
        return describe("when the rails-transporter:open-view-finder event is triggered", function() {});
      });
    });
    describe("open-model behavior", function() {
      describe("when active editor opens model and cursor is on include method", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb'));
          });
        });
        return it("opens model concern", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(1, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-model');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var concernPath;
            concernPath = path.join(atom.project.getPaths()[0], 'app', 'models', 'concerns', 'searchable.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(concernPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^module Searchable$/);
          });
        });
      });
      describe("when active editor opens controller", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
          });
        });
        return it("opens related model", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-model');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var modelPath;
            modelPath = path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(modelPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class Blog < ActiveRecord::Base$/);
          });
        });
      });
      return describe("when active editor opens namespaced controller", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'admins', 'blogs_controller.rb'));
          });
        });
        return it("opens related model", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-model');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var modelPath;
            modelPath = path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(modelPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class Blog < ActiveRecord::Base$/);
          });
        });
      });
    });
    describe("when active editor opens model test", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.workspace.open(path.join(atom.project.getPaths()[0], 'test', 'models', 'blog_test.rb'));
        });
      });
      return it("opens related model", function() {
        atom.commands.dispatch(workspaceElement, 'rails-transporter:open-model');
        waitsFor(function() {
          activationPromise;
          return atom.workspace.getActivePane().getItems().length === 2;
        });
        return runs(function() {
          var modelPath;
          modelPath = path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb');
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(editor.getPath()).toBe(modelPath);
          return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class Blog < ActiveRecord::Base$/);
        });
      });
    });
    describe("when active editor opens model spec", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'models', 'blog_spec.rb'));
        });
      });
      return it("opens related model", function() {
        atom.commands.dispatch(workspaceElement, 'rails-transporter:open-model');
        waitsFor(function() {
          activationPromise;
          return atom.workspace.getActivePane().getItems().length === 2;
        });
        return runs(function() {
          var modelPath;
          modelPath = path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb');
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(editor.getPath()).toBe(modelPath);
          return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class Blog < ActiveRecord::Base$/);
        });
      });
    });
    describe("when active editor opens factory", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'factories', 'blogs.rb'));
        });
      });
      return it("opens related model", function() {
        atom.commands.dispatch(workspaceElement, 'rails-transporter:open-model');
        waitsFor(function() {
          activationPromise;
          return atom.workspace.getActivePane().getItems().length === 2;
        });
        return runs(function() {
          var modelPath;
          modelPath = path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb');
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(editor.getPath()).toBe(modelPath);
          return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class Blog < ActiveRecord::Base$/);
        });
      });
    });
    describe("when active editor opens view", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', 'show.html.erb'));
        });
      });
      return it("opens related model", function() {
        atom.commands.dispatch(workspaceElement, 'rails-transporter:open-model');
        waitsFor(function() {
          activationPromise;
          return atom.workspace.getActivePane().getItems().length === 2;
        });
        return runs(function() {
          var modelPath;
          modelPath = path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb');
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(editor.getPath()).toBe(modelPath);
          return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class Blog < ActiveRecord::Base$/);
        });
      });
    });
    describe("open-helper behavior", function() {
      describe("when active editor opens controller", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
          });
        });
        return it("opens related helper", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-helper');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var helperPath;
            helperPath = path.join(atom.project.getPaths()[0], 'app', 'helpers', 'blogs_helper.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(helperPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^module BlogsHelper$/);
          });
        });
      });
      describe("when active editor opens helper test", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'test', 'helpers', 'blogs_helper_test.rb'));
          });
        });
        return it("opens related helper", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-helper');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var helperPath;
            helperPath = path.join(atom.project.getPaths()[0], 'app', 'helpers', 'blogs_helper.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(helperPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^module BlogsHelper$/);
          });
        });
      });
      describe("when active editor opens helper spec", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'helpers', 'blogs_helper_spec.rb'));
          });
        });
        return it("opens related helper", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-helper');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var helperPath;
            helperPath = path.join(atom.project.getPaths()[0], 'app', 'helpers', 'blogs_helper.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(helperPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^module BlogsHelper$/);
          });
        });
      });
      describe("when active editor opens model", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb'));
          });
        });
        return it("opens related helper", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-helper');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var helperPath;
            helperPath = path.join(atom.project.getPaths()[0], 'app', 'helpers', 'blogs_helper.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(helperPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^module BlogsHelper$/);
          });
        });
      });
      return describe("when active editor opens view", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', 'show.html.erb'));
          });
        });
        return it("opens related helper", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-helper');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var helperPath;
            helperPath = path.join(atom.project.getPaths()[0], 'app', 'helpers', 'blogs_helper.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(helperPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^module BlogsHelper$/);
          });
        });
      });
    });
    describe("open-patial-template behavior", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', 'edit.html.erb'));
        });
      });
      describe("when cursor's current buffer row contains render method", function() {
        return it("opens partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(2, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', '_form.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Form Partial$/);
          });
        });
      });
      describe("when cursor's current buffer row contains render method with ':partial =>'", function() {
        return it("opens partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(3, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', '_form.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Form Partial$/);
          });
        });
      });
      describe("when cursor's current buffer row contains render method with 'partial:'", function() {
        return it("opens partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(4, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', '_form.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Form Partial$/);
          });
        });
      });
      describe("when cursor's current buffer row contains render method taking shared partial", function() {
        return it("opens shared partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(5, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'shared', '_form.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Shared Form Partial$/);
          });
        });
      });
      describe("when current line is to call render method with integer", function() {
        return it("opens partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(6, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', '_form02.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Form02 Partial$/);
          });
        });
      });
      describe("when current line is to call render method with integer and including ':partial =>'", function() {
        return it("opens partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(7, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', '_form02.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Form02 Partial$/);
          });
        });
      });
      describe("when current line is to call render method with integer and including '(:partial =>'", function() {
        return it("opens partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(8, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', '_form02.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Form02 Partial$/);
          });
        });
      });
      return describe("when current line is to call render method with '(", function() {
        return it("opens partial template", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(9, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-partial-template');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', '_form02.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^Form02 Partial$/);
          });
        });
      });
    });
    describe("open-layout", function() {
      describe("when cursor's current buffer row contains layout method", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
          });
        });
        return it("opens specified layout", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(2, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-layout');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'layouts', 'special.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(3, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/Special Layout/);
          });
        });
      });
      describe("when same base name as the controller exists", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'top_controller.rb'));
          });
        });
        return it("opens layout that same base name as the controller", function() {
          editor = atom.workspace.getActiveTextEditor();
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-layout');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'layouts', 'top.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(3, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/Top Layout/);
          });
        });
      });
      return describe("when there is no such controller-specific layout", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'main_controller.rb'));
          });
        });
        return it("opens default layout named 'application'", function() {
          editor = atom.workspace.getActiveTextEditor();
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-layout');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var partialPath;
            partialPath = path.join(atom.project.getPaths()[0], 'app', 'views', 'layouts', 'application.html.erb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(3, 0));
            expect(editor.getPath()).toBe(partialPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/Application Layout/);
          });
        });
      });
    });
    describe("open-spec behavior", function() {
      describe("when active editor opens controller", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
          });
        });
        return it("opens controller spec", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-spec');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var specPath;
            specPath = path.join(atom.project.getPaths()[0], 'spec', 'controllers', 'blogs_controller_spec.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(20, 0));
            expect(editor.getPath()).toBe(specPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^describe BlogsController/);
          });
        });
      });
      describe("when active editor opens model", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb'));
          });
        });
        return it("opens model spec", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-spec');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var specPath;
            specPath = path.join(atom.project.getPaths()[0], 'spec', 'models', 'blog_spec.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(2, 0));
            expect(editor.getPath()).toBe(specPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^describe Blog /);
          });
        });
      });
      describe("when active editor opens factory", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'factories', 'blogs.rb'));
          });
        });
        return it("opens model spec", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-spec');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var specPath;
            specPath = path.join(atom.project.getPaths()[0], 'spec', 'models', 'blog_spec.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(2, 0));
            expect(editor.getPath()).toBe(specPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^describe Blog /);
          });
        });
      });
      return describe("when active editor opens helper", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'helpers', 'blogs_helper.rb'));
          });
        });
        return it("opens helper spec", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-spec');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var specPath;
            specPath = path.join(atom.project.getPaths()[0], 'spec', 'helpers', 'blogs_helper_spec.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(12, 0));
            expect(editor.getPath()).toBe(specPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^describe BlogsHelper/);
          });
        });
      });
    });
    describe("open-test behavior", function() {
      describe("when active editor opens controller", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
          });
        });
        return it("opens controller test", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-test');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var testPath;
            testPath = path.join(atom.project.getPaths()[0], 'test', 'controllers', 'blogs_controller_test.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(2, 0));
            expect(editor.getPath()).toBe(testPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^describe BlogsController/);
          });
        });
      });
      describe("when active editor opens model", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb'));
          });
        });
        return it("opens model test", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-test');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var testPath;
            testPath = path.join(atom.project.getPaths()[0], 'test', 'models', 'blog_test.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(2, 0));
            expect(editor.getPath()).toBe(testPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^describe Blog /);
          });
        });
      });
      return describe("when active editor opens helper", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'helpers', 'blogs_helper.rb'));
          });
        });
        return it("opens helper test", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-test');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var testPath;
            testPath = path.join(atom.project.getPaths()[0], 'test', 'helpers', 'blogs_helper_test.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(2, 0));
            expect(editor.getPath()).toBe(testPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^describe BlogsHelper/);
          });
        });
      });
    });
    describe("open-asset behavior", function() {
      describe("when active editor opens view", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'views', 'layouts', 'application.html.erb'));
          });
        });
        describe("when cursor's current buffer row contains stylesheet_link_tag", function() {
          describe("enclosed in parentheses", function() {
            return it("opens stylesheet", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(10, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'application.css');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(10, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/require_self$/);
              });
            });
          });
          describe("unenclosed in parentheses", function() {
            return it("opens stylesheet", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(11, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'application.css');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(11, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/require_tree/);
              });
            });
          });
          describe("when source includes slash", function() {
            return it("opens stylesheet", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(12, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'application02', 'common.css');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(1, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/require_self/);
              });
            });
          });
          describe("when source is located in vendor directory", function() {
            return it("opens stylesheet in vendor directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(13, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'vendor', 'assets', 'stylesheets', 'jquery.popular_style.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/it's popular scss file$/);
              });
            });
          });
          describe("when source is located in lib directory", function() {
            return it("opens stylesheet in lib directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(16, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'lib', 'assets', 'stylesheets', 'my_style.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/it's my scss file$/);
              });
            });
          });
          return describe("when source is located in public directory", function() {
            return it("opens stylesheet in public directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(14, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'public', 'no_asset_pipeline.css');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's css in public directory$/);
              });
            });
          });
        });
        return describe("when cursor's current buffer row contains javascript_include_tag", function() {
          describe("enclosed in parentheses", function() {
            return it("opens javascript", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(5, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'application01.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(12, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/= require jquery$/);
              });
            });
          });
          describe("unenclosed in parentheses", function() {
            return it("opens javascript", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(6, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'application01.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(12, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/= require jquery$/);
              });
            });
          });
          describe("when source includes slash", function() {
            return it("opens javascript in another directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(7, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'application02', 'common.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/= require jquery$/);
              });
            });
          });
          describe("when source is located in vendor directory", function() {
            return it("opens javascript in vendor directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(8, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'vendor', 'assets', 'javascripts', 'jquery.popular_library.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's popular library$/);
              });
            });
          });
          describe("when source is located in lib directory", function() {
            return it("opens javascript in lib directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(15, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'lib', 'assets', 'javascripts', 'my_library.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's my library$/);
              });
            });
          });
          describe("when source is located in public directory", function() {
            return it("opens javascript in public directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(9, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'public', 'no_asset_pipeline.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's in public directory$/);
              });
            });
          });
          return describe("when source's suffix is .erb", function() {
            return it("opens .erb javascript", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(17, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'dynamic_script.js.coffee.erb');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^# \.erb file$/);
              });
            });
          });
        });
      });
      describe("when active editor opens javascript manifest", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'application01.js'));
          });
        });
        describe("cursor's current buffer row contains require_tree", function() {
          beforeEach(function() {
            editor = atom.workspace.getActiveTextEditor();
            return editor.setCursorBufferPosition(new Point(15, 0));
          });
          return it("shows file paths in required directory and its subdirectories and selects the first", function() {
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
            waitsForPromise(function() {
              return activationPromise;
            });
            return runs(function() {
              var requireDir;
              requireDir = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'shared');
              expect(workspaceElement.querySelectorAll('.select-list li').length).toBe(fs.readdirSync(requireDir).length);
              expect($(workspaceElement).find(".select-list .primary-line:contains(common.js.coffee)")).toExist();
              expect($(workspaceElement).find(".select-list .secondary-line:contains(" + (atom.project.relativize(path.join(requireDir, 'common.js.coffee'))) + ")")).toExist();
              expect($(workspaceElement).find(".select-list .primary-line:contains(subdir.js.coffee)")).toExist();
              expect($(workspaceElement).find(".select-list .secondary-line:contains(" + (atom.project.relativize(path.join(requireDir, 'subdir', 'subdir.js.coffee'))) + ")")).toExist();
              expect($(workspaceElement).find(".select-list li:first")).toHaveClass('two-lines selected');
              return atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
            });
          });
        });
        describe("cursor's current buffer row contains require_directory", function() {
          return beforeEach(function() {
            editor = atom.workspace.getActiveTextEditor();
            return editor.setCursorBufferPosition(new Point(24, 0));
          });
        });
        return describe("cursor's current buffer row contains require", function() {
          describe("when it requires coffeescript with .js suffix", function() {
            return it("opens coffeescript", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(22, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'blogs.js.coffee');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^# blogs js$/);
              });
            });
          });
          describe("when it requires coffeescript with .js.coffee suffix", function() {
            return it("opens coffeescript", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(23, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'blogs.js.coffee');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^# blogs js$/);
              });
            });
          });
          describe("when it requires coffeescript without suffix", function() {
            return it("opens coffeescript", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(16, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'blogs.js.coffee');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^# blogs js$/);
              });
            });
          });
          describe("when it requires javascript without suffix", function() {
            return it("opens javascript", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(17, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'pure-js-blogs.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^# pure blogs js$/);
              });
            });
          });
          describe("when it requires coffeescript in another directory", function() {
            return it("opens coffeescript in another directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(18, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'shared', 'common.js.coffee');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^# shared coffee$/);
              });
            });
          });
          describe("when it requires javascript in another directory", function() {
            return it("opens javascript in another directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(19, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'javascripts', 'shared', 'pure-js-common.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^# shared js$/);
              });
            });
          });
          describe("when it requires javascript in lib directory", function() {
            return it("opens javascript in lib directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(20, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'lib', 'assets', 'javascripts', 'my_library.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's my library$/);
              });
            });
          });
          return describe("when it requires javascript in vendor directory", function() {
            return it("opens javascript in vendor directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(21, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'vendor', 'assets', 'javascripts', 'jquery.popular_library.js');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's popular library$/);
              });
            });
          });
        });
      });
      return describe("when active editor opens stylesheet manifest", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'application.css'));
          });
        });
        return describe("when cursor's current buffer row contains 'require'", function() {
          describe("when it requires scss with .css suffix", function() {
            return it("opens scss", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(12, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'blogs.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's blogs.css$/);
              });
            });
          });
          describe("when it requires scss with .css.scss suffix", function() {
            return it("opens scss", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(13, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'blogs.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's blogs.css$/);
              });
            });
          });
          describe("when it requires css without suffix", function() {
            return it("opens css", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(14, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'pure-css-blogs.css');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's pure css$/);
              });
            });
          });
          describe("when it requires scss without suffix", function() {
            return it("opens scss", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(15, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'blogs.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's blogs.css$/);
              });
            });
          });
          describe("when it requires scss in another directory", function() {
            return it("opens scss in another directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(16, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'shared', 'pure-css-common.css');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's pure css$/);
              });
            });
          });
          describe("when it requires css in another directory", function() {
            return it("opens css in another directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(17, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'app', 'assets', 'stylesheets', 'shared', 'common.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's scss$/);
              });
            });
          });
          describe("when it requires scss in lib directory", function() {
            return it("opens scss in lib directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(18, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'lib', 'assets', 'stylesheets', 'my_style.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's my scss file$/);
              });
            });
          });
          describe("when it requires css in lib directory", function() {
            return it("opens css in lib directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(19, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'lib', 'assets', 'stylesheets', 'pure_css_my_style.css');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's my css file$/);
              });
            });
          });
          return describe("when it requires scss in vendor directory", function() {
            return it("opens scss in vendor directory", function() {
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(20, 0));
              atom.commands.dispatch(workspaceElement, 'rails-transporter:open-asset');
              waitsFor(function() {
                activationPromise;
                return atom.workspace.getActivePane().getItems().length === 2;
              });
              return runs(function() {
                var assetPath;
                assetPath = path.join(atom.project.getPaths()[0], 'vendor', 'assets', 'stylesheets', 'jquery.popular_style.css.scss');
                editor = atom.workspace.getActiveTextEditor();
                editor.setCursorBufferPosition(new Point(0, 0));
                expect(editor.getPath()).toBe(assetPath);
                return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^\/\/ it's popular scss file$/);
              });
            });
          });
        });
      });
    });
    describe("open-controller behavior", function() {
      describe("when active editor opens controller and cursor is on include method", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb'));
          });
        });
        return it("opens model concern", function() {
          editor = atom.workspace.getActiveTextEditor();
          editor.setCursorBufferPosition(new Point(3, 0));
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-controller');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var concernPath;
            concernPath = path.join(atom.project.getPaths()[0], 'app', 'controllers', 'concerns', 'blog', 'taggable.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(concernPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^module Blog::Taggable$/);
          });
        });
      });
      describe("when active editor opens model", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app/models/blog.rb'));
          });
        });
        return it("opens related controller", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-controller');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var modelPath;
            modelPath = path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(modelPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class BlogsController < ApplicationController$/);
          });
        });
      });
      describe("when active editor opens controller test", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'test', 'controllers', 'blogs_controller_test.rb'));
          });
        });
        return it("opens related controller", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-controller');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var modelPath;
            modelPath = path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(modelPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class BlogsController < ApplicationController$/);
          });
        });
      });
      describe("when active editor opens controller spec", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'controllers', 'blogs_controller_spec.rb'));
          });
        });
        return it("opens related controller", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-controller');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var modelPath;
            modelPath = path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(modelPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class BlogsController < ApplicationController$/);
          });
        });
      });
      describe("when active editor opens request spec", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'requests', 'blogs_spec.rb'));
          });
        });
        return it("opens related controller", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-controller');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var modelPath;
            modelPath = path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(modelPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class BlogsController < ApplicationController$/);
          });
        });
      });
      return describe("when active editor opens view", function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'views', 'blogs', 'show.html.haml'));
          });
        });
        return it("opens related controller", function() {
          atom.commands.dispatch(workspaceElement, 'rails-transporter:open-controller');
          waitsFor(function() {
            activationPromise;
            return atom.workspace.getActivePane().getItems().length === 2;
          });
          return runs(function() {
            var modelPath;
            modelPath = path.join(atom.project.getPaths()[0], 'app', 'controllers', 'blogs_controller.rb');
            editor = atom.workspace.getActiveTextEditor();
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(editor.getPath()).toBe(modelPath);
            return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^class BlogsController < ApplicationController$/);
          });
        });
      });
    });
    return describe("open-factory behavior", function() {
      describe("when active editor opens model", function() {
        describe("open plural resource filename", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'models', 'blog.rb'));
            });
          });
          return it("opens related factory", function() {
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-factory');
            waitsFor(function() {
              activationPromise;
              return atom.workspace.getActivePane().getItems().length === 2;
            });
            return runs(function() {
              var factoryPath;
              factoryPath = path.join(atom.project.getPaths()[0], 'spec', 'factories', 'blogs.rb');
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(3, 0));
              expect(editor.getPath()).toBe(factoryPath);
              return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^  factory :blog, :class => 'Blog' do$/);
            });
          });
        });
        return describe("open singular resource filename", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.workspace.open(path.join(atom.project.getPaths()[0], 'app', 'models', 'entry.rb'));
            });
          });
          return it("opens related factory", function() {
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-factory');
            waitsFor(function() {
              activationPromise;
              return atom.workspace.getActivePane().getItems().length === 2;
            });
            return runs(function() {
              var factoryPath;
              factoryPath = path.join(atom.project.getPaths()[0], 'spec', 'factories', 'entry.rb');
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(3, 0));
              expect(editor.getPath()).toBe(factoryPath);
              return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^  factory :entry, :class => 'Entry' do$/);
            });
          });
        });
      });
      return describe("when active editor opens model-spec", function() {
        describe("open plural resource filename", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'models', 'blog_spec.rb'));
            });
          });
          return it("opens related factory", function() {
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-factory');
            waitsFor(function() {
              activationPromise;
              return atom.workspace.getActivePane().getItems().length === 2;
            });
            return runs(function() {
              var factoryPath;
              factoryPath = path.join(atom.project.getPaths()[0], 'spec', 'factories', 'blogs.rb');
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(3, 0));
              expect(editor.getPath()).toBe(factoryPath);
              return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^  factory :blog, :class => 'Blog' do$/);
            });
          });
        });
        return describe("open singular resource filename", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.workspace.open(path.join(atom.project.getPaths()[0], 'spec', 'models', 'entry_spec.rb'));
            });
          });
          return it("opens related factory", function() {
            atom.commands.dispatch(workspaceElement, 'rails-transporter:open-factory');
            waitsFor(function() {
              activationPromise;
              return atom.workspace.getActivePane().getItems().length === 2;
            });
            return runs(function() {
              var factoryPath;
              factoryPath = path.join(atom.project.getPaths()[0], 'spec', 'factories', 'entry.rb');
              editor = atom.workspace.getActiveTextEditor();
              editor.setCursorBufferPosition(new Point(3, 0));
              expect(editor.getPath()).toBe(factoryPath);
              return expect(editor.getLastCursor().getCurrentBufferLine()).toMatch(/^  factory :entry, :class => 'Entry' do$/);
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy10cmFuc3BvcnRlci9zcGVjL3JhaWxzLXRyYW5zcG9ydGVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDREQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUlBLE9BQVUsT0FBQSxDQUFRLHNCQUFSLENBQVYsRUFBQyxTQUFBLENBQUQsRUFBSSxVQUFBLEVBSkosQ0FBQTs7QUFBQSxFQU9DLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQVBELENBQUE7O0FBQUEsRUFRQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsMEJBQVIsQ0FSbkIsQ0FBQTs7QUFBQSxFQVVBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSxrRUFBQTtBQUFBLElBQUEsaUJBQUEsR0FBb0IsSUFBcEIsQ0FBQTtBQUFBLElBQ0EsUUFBNkMsRUFBN0MsRUFBQywyQkFBRCxFQUFtQix5QkFBbkIsRUFBbUMsaUJBRG5DLENBQUE7QUFBQSxJQUdBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFFVCxVQUFBLHNCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFmLENBQWhCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsWUFBQSxHQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixD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

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-transporter/spec/rails-transporter-spec.coffee
