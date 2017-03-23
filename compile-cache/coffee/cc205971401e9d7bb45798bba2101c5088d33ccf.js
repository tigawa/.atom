(function() {
  var CompositeDisposable, Settings, _,
    slice = [].slice;

  _ = require('underscore-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  Settings = (function() {
    Settings.prototype.cache = {};

    function Settings(scope, config) {
      var i, j, key, len, name, object, ref, ref1;
      this.scope = scope;
      this.config = config;
      this.disposables = new CompositeDisposable;
      ref = Object.keys(this.config);
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        name = ref[i];
        this.config[name].order = i;
      }
      ref1 = this.config;
      for (key in ref1) {
        object = ref1[key];
        object.type = (function() {
          switch (false) {
            case !Number.isInteger(object["default"]):
              return 'integer';
            case typeof object["default"] !== 'boolean':
              return 'boolean';
            case typeof object["default"] !== 'string':
              return 'string';
            case !Array.isArray(object["default"]):
              return 'array';
          }
        })();
      }
    }

    Settings.prototype.destroy = function() {
      return this.disposables.dispose();
    };

    Settings.prototype.notifyAndDelete = function() {
      var content, j, len, param, params, paramsToDelete;
      params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      paramsToDelete = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = params.length; j < len; j++) {
          param = params[j];
          if (this.has(param)) {
            results.push(param);
          }
        }
        return results;
      }).call(this);
      if (paramsToDelete.length === 0) {
        return;
      }
      content = [this.scope + ": Config options deprecated.  ", "Automatically removed from your `connfig.cson`  "];
      for (j = 0, len = paramsToDelete.length; j < len; j++) {
        param = paramsToDelete[j];
        this["delete"](param);
        content.push("- `" + param + "`");
      }
      return atom.notifications.addWarning(content.join("\n"), {
        dismissable: true
      });
    };

    Settings.prototype.notifyAndRename = function(oldName, newName) {
      var content;
      if (!this.has(oldName)) {
        return;
      }
      this.set(newName, this.get(oldName));
      this["delete"](oldName);
      content = [this.scope + ": Config options renamed.  ", "Automatically renamed in your `connfig.cson`  ", " - `" + oldName + "` to " + newName];
      return atom.notifications.addWarning(content.join("\n"), {
        dismissable: true
      });
    };

    Settings.prototype.has = function(param) {
      return param in atom.config.get(this.scope);
    };

    Settings.prototype["delete"] = function(param) {
      return this.set(param, void 0);
    };

    Settings.prototype.setCachableParams = function(params) {
      return this.cachableParams = params;
    };

    Settings.prototype.get = function(param) {
      return atom.config.get(this.scope + "." + param);
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set(this.scope + "." + param, value);
    };

    Settings.prototype.toggle = function(param) {
      return this.set(param, !this.get(param));
    };

    Settings.prototype.observe = function(param, fn) {
      return this.disposables.add(atom.config.observe(this.scope + "." + param, fn));
    };

    return Settings;

  })();

  module.exports = new Settings('cursor-history', {
    max: {
      "default": 100,
      minimum: 1,
      description: "number of history to keep"
    },
    rowDeltaToRemember: {
      "default": 4,
      minimum: 0,
      description: "Save history when row delta was greater than this value"
    },
    columnDeltaToRemember: {
      "default": 9999,
      minimum: 0,
      description: "Save history when cursor moved within same row and column delta was greater than this value"
    },
    excludeClosedBuffer: {
      "default": false,
      description: "Don't open closed Buffer on history excursion"
    },
    keepSingleEntryPerBuffer: {
      "default": false,
      description: 'Keep latest entry only per buffer'
    },
    searchAllPanes: {
      "default": true,
      description: "Search existing buffer from all panes before opening new editor"
    },
    flashOnLand: {
      "default": false,
      description: "flash cursor on land"
    },
    ignoreCommands: {
      "default": ['command-palette:toggle'],
      items: {
        type: 'string'
      },
      description: 'list of commands to exclude from history tracking.'
    },
    debug: {
      "default": false
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUVsQjt1QkFDSixLQUFBLEdBQU87O0lBRU0sa0JBQUMsS0FBRCxFQUFTLE1BQVQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsU0FBRDtNQUNwQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7QUFHbkI7QUFBQSxXQUFBLDZDQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsSUFBQSxDQUFLLENBQUMsS0FBZCxHQUFzQjtBQUR4QjtBQUdBO0FBQUEsV0FBQSxXQUFBOztRQUNFLE1BQU0sQ0FBQyxJQUFQO0FBQWMsa0JBQUEsS0FBQTtBQUFBLGtCQUNQLE1BQU0sQ0FBQyxTQUFQLENBQWlCLE1BQU0sRUFBQyxPQUFELEVBQXZCLENBRE87cUJBQytCO0FBRC9CLGlCQUVQLE9BQU8sTUFBTSxFQUFDLE9BQUQsRUFBYixLQUEwQixTQUZuQjtxQkFFa0M7QUFGbEMsaUJBR1AsT0FBTyxNQUFNLEVBQUMsT0FBRCxFQUFiLEtBQTBCLFFBSG5CO3FCQUdpQztBQUhqQyxrQkFJUCxLQUFLLENBQUMsT0FBTixDQUFjLE1BQU0sRUFBQyxPQUFELEVBQXBCLENBSk87cUJBSTRCO0FBSjVCOztBQURoQjtJQVBXOzt1QkFjYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBRE87O3VCQUdULGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFEZ0I7TUFDaEIsY0FBQTs7QUFBa0I7YUFBQSx3Q0FBQTs7Y0FBK0IsSUFB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LFdBQUEsRUFBYSw2RkFGYjtLQVRGO0lBWUEsbUJBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSwrQ0FEYjtLQWJGO0lBZUEsd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxtQ0FEYjtLQWhCRjtJQWtCQSxjQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQVQ7TUFDQSxXQUFBLEVBQWEsaUVBRGI7S0FuQkY7SUFxQkEsV0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLHNCQURiO0tBdEJGO0lBd0JBLGNBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyx3QkFBRCxDQUFUO01BQ0EsS0FBQSxFQUFPO1FBQUEsSUFBQSxFQUFNLFFBQU47T0FEUDtNQUVBLFdBQUEsRUFBYSxvREFGYjtLQXpCRjtJQTRCQSxLQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7S0E3QkY7R0FEbUI7QUFyRXJCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmNsYXNzIFNldHRpbmdzXG4gIGNhY2hlOiB7fVxuXG4gIGNvbnN0cnVjdG9yOiAoQHNjb3BlLCBAY29uZmlnKSAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIEluamVjdCBvcmRlciBwcm9wcyB0byBkaXNwbGF5IG9yZGVyZCBpbiBzZXR0aW5nLXZpZXdcbiAgICBmb3IgbmFtZSwgaSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgQGNvbmZpZ1tuYW1lXS5vcmRlciA9IGlcblxuICAgIGZvciBrZXksIG9iamVjdCBvZiBAY29uZmlnXG4gICAgICBvYmplY3QudHlwZSA9IHN3aXRjaFxuICAgICAgICB3aGVuIE51bWJlci5pc0ludGVnZXIob2JqZWN0LmRlZmF1bHQpIHRoZW4gJ2ludGVnZXInXG4gICAgICAgIHdoZW4gdHlwZW9mKG9iamVjdC5kZWZhdWx0KSBpcyAnYm9vbGVhbicgdGhlbiAnYm9vbGVhbidcbiAgICAgICAgd2hlbiB0eXBlb2Yob2JqZWN0LmRlZmF1bHQpIGlzICdzdHJpbmcnIHRoZW4gJ3N0cmluZydcbiAgICAgICAgd2hlbiBBcnJheS5pc0FycmF5KG9iamVjdC5kZWZhdWx0KSB0aGVuICdhcnJheSdcblxuICBkZXN0cm95OiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBub3RpZnlBbmREZWxldGU6IChwYXJhbXMuLi4pIC0+XG4gICAgcGFyYW1zVG9EZWxldGUgPSAocGFyYW0gZm9yIHBhcmFtIGluIHBhcmFtcyB3aGVuIEBoYXMocGFyYW0pKVxuICAgIHJldHVybiBpZiBwYXJhbXNUb0RlbGV0ZS5sZW5ndGggaXMgMFxuXG4gICAgY29udGVudCA9IFtcbiAgICAgIFwiI3tAc2NvcGV9OiBDb25maWcgb3B0aW9ucyBkZXByZWNhdGVkLiAgXCIsXG4gICAgICBcIkF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIHlvdXIgYGNvbm5maWcuY3NvbmAgIFwiXG4gICAgXVxuICAgIGZvciBwYXJhbSBpbiBwYXJhbXNUb0RlbGV0ZVxuICAgICAgQGRlbGV0ZShwYXJhbSlcbiAgICAgIGNvbnRlbnQucHVzaCBcIi0gYCN7cGFyYW19YFwiXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgY29udGVudC5qb2luKFwiXFxuXCIpLCBkaXNtaXNzYWJsZTogdHJ1ZVxuXG4gIG5vdGlmeUFuZFJlbmFtZTogKG9sZE5hbWUsIG5ld05hbWUpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaGFzKG9sZE5hbWUpXG5cbiAgICBAc2V0KG5ld05hbWUsIEBnZXQob2xkTmFtZSkpXG4gICAgQGRlbGV0ZShvbGROYW1lKVxuICAgIGNvbnRlbnQgPSBbXG4gICAgICBcIiN7QHNjb3BlfTogQ29uZmlnIG9wdGlvbnMgcmVuYW1lZC4gIFwiLFxuICAgICAgXCJBdXRvbWF0aWNhbGx5IHJlbmFtZWQgaW4geW91ciBgY29ubmZpZy5jc29uYCAgXCJcbiAgICAgIFwiIC0gYCN7b2xkTmFtZX1gIHRvICN7bmV3TmFtZX1cIlxuICAgIF1cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBjb250ZW50LmpvaW4oXCJcXG5cIiksIGRpc21pc3NhYmxlOiB0cnVlXG5cbiAgaGFzOiAocGFyYW0pIC0+XG4gICAgcGFyYW0gb2YgYXRvbS5jb25maWcuZ2V0KEBzY29wZSlcblxuICBkZWxldGU6IChwYXJhbSkgLT5cbiAgICBAc2V0KHBhcmFtLCB1bmRlZmluZWQpXG5cbiAgc2V0Q2FjaGFibGVQYXJhbXM6IChwYXJhbXMpIC0+XG4gICAgQGNhY2hhYmxlUGFyYW1zID0gcGFyYW1zXG5cbiAgZ2V0OiAocGFyYW0pIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwiI3tAc2NvcGV9LiN7cGFyYW19XCIpXG5cbiAgc2V0OiAocGFyYW0sIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldCBcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCB2YWx1ZVxuXG4gIHRvZ2dsZTogKHBhcmFtKSAtPlxuICAgIEBzZXQocGFyYW0sIG5vdCBAZ2V0KHBhcmFtKSlcblxuICBvYnNlcnZlOiAocGFyYW0sIGZuKSAtPlxuICAgIEBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCBmbikpXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzICdjdXJzb3ItaGlzdG9yeScsXG4gIG1heDpcbiAgICBkZWZhdWx0OiAxMDBcbiAgICBtaW5pbXVtOiAxXG4gICAgZGVzY3JpcHRpb246IFwibnVtYmVyIG9mIGhpc3RvcnkgdG8ga2VlcFwiXG4gIHJvd0RlbHRhVG9SZW1lbWJlcjpcbiAgICBkZWZhdWx0OiA0XG4gICAgbWluaW11bTogMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNhdmUgaGlzdG9yeSB3aGVuIHJvdyBkZWx0YSB3YXMgZ3JlYXRlciB0aGFuIHRoaXMgdmFsdWVcIlxuICBjb2x1bW5EZWx0YVRvUmVtZW1iZXI6XG4gICAgZGVmYXVsdDogOTk5OVxuICAgIG1pbmltdW06IDBcbiAgICBkZXNjcmlwdGlvbjogXCJTYXZlIGhpc3Rvcnkgd2hlbiBjdXJzb3IgbW92ZWQgd2l0aGluIHNhbWUgcm93IGFuZCBjb2x1bW4gZGVsdGEgd2FzIGdyZWF0ZXIgdGhhbiB0aGlzIHZhbHVlXCJcbiAgZXhjbHVkZUNsb3NlZEJ1ZmZlcjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG9wZW4gY2xvc2VkIEJ1ZmZlciBvbiBoaXN0b3J5IGV4Y3Vyc2lvblwiXG4gIGtlZXBTaW5nbGVFbnRyeVBlckJ1ZmZlcjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnS2VlcCBsYXRlc3QgZW50cnkgb25seSBwZXIgYnVmZmVyJ1xuICBzZWFyY2hBbGxQYW5lczpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiU2VhcmNoIGV4aXN0aW5nIGJ1ZmZlciBmcm9tIGFsbCBwYW5lcyBiZWZvcmUgb3BlbmluZyBuZXcgZWRpdG9yXCJcbiAgZmxhc2hPbkxhbmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJmbGFzaCBjdXJzb3Igb24gbGFuZFwiXG4gIGlnbm9yZUNvbW1hbmRzOlxuICAgIGRlZmF1bHQ6IFsnY29tbWFuZC1wYWxldHRlOnRvZ2dsZSddXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIGNvbW1hbmRzIHRvIGV4Y2x1ZGUgZnJvbSBoaXN0b3J5IHRyYWNraW5nLidcbiAgZGVidWc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiJdfQ==
