(function() {
  var FileOpener, MigrationFinderView, ViewFinderView;

  ViewFinderView = require('./view-finder-view');

  MigrationFinderView = require('./migration-finder-view');

  FileOpener = require('./file-opener');

  module.exports = {
    config: {
      viewFileExtension: {
        type: 'array',
        description: 'This is the extension of the view files.',
        "default": ['html.erb', 'html.slim', 'html.haml'],
        items: {
          type: 'string'
        }
      },
      controllerSpecType: {
        type: 'string',
        description: 'This is the type of the controller spec. controllers, requests or features',
        "default": 'controllers',
        "enum": ['controllers', 'requests', 'features', 'api', 'integration']
      }
    },
    activate: function(state) {
      return atom.commands.add('atom-workspace', {
        'rails-transporter:open-view-finder': (function(_this) {
          return function() {
            return _this.createViewFinderView().toggle();
          };
        })(this),
        'rails-transporter:open-migration-finder': (function(_this) {
          return function() {
            return _this.createMigrationFinderView().toggle();
          };
        })(this),
        'rails-transporter:open-model': (function(_this) {
          return function() {
            return _this.createFileOpener().openModel();
          };
        })(this),
        'rails-transporter:open-helper': (function(_this) {
          return function() {
            return _this.createFileOpener().openHelper();
          };
        })(this),
        'rails-transporter:open-partial-template': (function(_this) {
          return function() {
            return _this.createFileOpener().openPartial();
          };
        })(this),
        'rails-transporter:open-test': (function(_this) {
          return function() {
            return _this.createFileOpener().openTest();
          };
        })(this),
        'rails-transporter:open-spec': (function(_this) {
          return function() {
            return _this.createFileOpener().openSpec();
          };
        })(this),
        'rails-transporter:open-asset': (function(_this) {
          return function() {
            return _this.createFileOpener().openAsset();
          };
        })(this),
        'rails-transporter:open-controller': (function(_this) {
          return function() {
            return _this.createFileOpener().openController();
          };
        })(this),
        'rails-transporter:open-layout': (function(_this) {
          return function() {
            return _this.createFileOpener().openLayout();
          };
        })(this),
        'rails-transporter:open-view': (function(_this) {
          return function() {
            return _this.createFileOpener().openView();
          };
        })(this),
        'rails-transporter:open-factory': (function(_this) {
          return function() {
            return _this.createFileOpener().openFactory();
          };
        })(this)
      });
    },
    deactivate: function() {
      if (this.viewFinderView != null) {
        this.viewFinderView.destroy();
      }
      if (this.migrationFinderView != null) {
        return this.migrationFinderView.destroy();
      }
    },
    createFileOpener: function() {
      if (this.fileOpener == null) {
        this.fileOpener = new FileOpener();
      }
      return this.fileOpener;
    },
    createViewFinderView: function() {
      if (this.viewFinderView == null) {
        this.viewFinderView = new ViewFinderView();
      }
      return this.viewFinderView;
    },
    createMigrationFinderView: function() {
      if (this.migrationFinderView == null) {
        this.migrationFinderView = new MigrationFinderView();
      }
      return this.migrationFinderView;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9yYWlscy10cmFuc3BvcnRlci9saWIvcmFpbHMtdHJhbnNwb3J0ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUNBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQUR0QixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFhLE9BQWI7QUFBQSxRQUNBLFdBQUEsRUFBYSwwQ0FEYjtBQUFBLFFBRUEsU0FBQSxFQUFhLENBQUMsVUFBRCxFQUFhLFdBQWIsRUFBMEIsV0FBMUIsQ0FGYjtBQUFBLFFBR0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUpGO09BREY7QUFBQSxNQU1BLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBYSxRQUFiO0FBQUEsUUFDQSxXQUFBLEVBQWEsNEVBRGI7QUFBQSxRQUVBLFNBQUEsRUFBYSxhQUZiO0FBQUEsUUFHQSxNQUFBLEVBQWEsQ0FBQyxhQUFELEVBQWdCLFVBQWhCLEVBQTRCLFVBQTVCLEVBQXdDLEtBQXhDLEVBQStDLGFBQS9DLENBSGI7T0FQRjtLQURGO0FBQUEsSUFhQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ0U7QUFBQSxRQUFBLG9DQUFBLEVBQXNDLENBQUEsU0FBQSxLQUFB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

//# sourceURL=/Users/igawataiichi/.atom/packages/rails-transporter/lib/rails-transporter.coffee
