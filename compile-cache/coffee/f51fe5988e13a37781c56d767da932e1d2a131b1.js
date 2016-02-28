(function() {
  var Settings;

  Settings = require('../lib/settings');

  describe("Settings", function() {
    describe(".load(settings)", function() {
      it("Loads the settings provided if they are flat", function() {
        var settings;
        settings = new Settings();
        settings.load({
          "foo.bar.baz": 42
        });
        return expect(atom.config.get("foo.bar.baz")).toBe(42);
      });
      return it("Loads the settings provided if they are an object", function() {
        var settings;
        settings = new Settings();
        expect(atom.config.get('foo.bar.baz')).toBe(void 0);
        settings.load({
          foo: {
            bar: {
              baz: 42
            }
          }
        });
        return expect(atom.config.get('foo.bar.baz')).toBe(42);
      });
    });
    return describe(".load(settings) with a 'scope' option", function() {
      return it("Loads the settings for the scope", function() {
        var scopedSettings, settings;
        settings = new Settings();
        scopedSettings = {
          "*": {
            "foo.bar.baz": 42
          },
          ".source.coffee": {
            "foo.bar.baz": 84
          }
        };
        settings.load(scopedSettings);
        expect(atom.config.get("foo.bar.baz")).toBe(42);
        expect(atom.config.get("foo.bar.baz", {
          scope: [".source.coffee"]
        })).toBe(84);
        return expect(atom.config.get("foo.bar.baz", {
          scope: [".text"]
        })).toBe(42);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvc3BlYy9zZXR0aW5ncy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUFYLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFFbkIsSUFBQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLE1BQUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxZQUFBLFFBQUE7QUFBQSxRQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBQSxDQUFmLENBQUE7QUFBQSxRQUNBLFFBQVEsQ0FBQyxJQUFULENBQWM7QUFBQSxVQUFDLGFBQUEsRUFBZSxFQUFoQjtTQUFkLENBREEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsYUFBaEIsQ0FBUCxDQUFzQyxDQUFDLElBQXZDLENBQTRDLEVBQTVDLEVBSmlEO01BQUEsQ0FBbkQsQ0FBQSxDQUFBO2FBTUEsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtBQUN0RCxZQUFBLFFBQUE7QUFBQSxRQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBQSxDQUFmLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsYUFBaEIsQ0FBUCxDQUFzQyxDQUFDLElBQXZDLENBQTRDLE1BQTVDLENBREEsQ0FBQTtBQUFBLFFBRUEsUUFBUSxDQUFDLElBQVQsQ0FBYztBQUFBLFVBQ1osR0FBQSxFQUNFO0FBQUEsWUFBQSxHQUFBLEVBQ0U7QUFBQSxjQUFBLEdBQUEsRUFBSyxFQUFMO2FBREY7V0FGVTtTQUFkLENBRkEsQ0FBQTtlQU9BLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsYUFBaEIsQ0FBUCxDQUFzQyxDQUFDLElBQXZDLENBQTRDLEVBQTVDLEVBUnNEO01BQUEsQ0FBeEQsRUFQMEI7SUFBQSxDQUE1QixDQUFBLENBQUE7V0FpQkEsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUEsR0FBQTthQUNoRCxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFlBQUEsd0JBQUE7QUFBQSxRQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBQSxDQUFmLENBQUE7QUFBQSxRQUNBLGNBQUEsR0FDRTtBQUFBLFVBQUEsR0FBQSxFQUNFO0FBQUEsWUFBQSxhQUFBLEVBQWUsRUFBZjtXQURGO0FBQUEsVUFFQSxnQkFBQSxFQUNFO0FBQUEsWUFBQSxhQUFBLEVBQWUsRUFBZjtXQUhGO1NBRkYsQ0FBQTtBQUFBLFFBTUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxjQUFkLENBTkEsQ0FBQTtBQUFBLFFBUUEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFoQixDQUFQLENBQXNDLENBQUMsSUFBdkMsQ0FBNEMsRUFBNUMsQ0FSQSxDQUFBO0FBQUEsUUFTQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGFBQWhCLEVBQStCO0FBQUEsVUFBQyxLQUFBLEVBQU0sQ0FBQyxnQkFBRCxDQUFQO1NBQS9CLENBQVAsQ0FBa0UsQ0FBQyxJQUFuRSxDQUF3RSxFQUF4RSxDQVRBLENBQUE7ZUFVQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGFBQWhCLEVBQStCO0FBQUEsVUFBQyxLQUFBLEVBQU0sQ0FBQyxPQUFELENBQVA7U0FBL0IsQ0FBUCxDQUF5RCxDQUFDLElBQTFELENBQStELEVBQS9ELEVBWHFDO01BQUEsQ0FBdkMsRUFEZ0Q7SUFBQSxDQUFsRCxFQW5CbUI7RUFBQSxDQUFyQixDQUZBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/igawataiichi/.atom/packages/project-manager/spec/settings-spec.coffee