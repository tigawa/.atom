(function() {
  var Promise, PropertiesURL, fetchPropertyDescriptions, fs, path, propertiesPromise, propertyDescriptionsPromise, request;

  path = require('path');

  fs = require('fs');

  request = require('request');

  Promise = require('bluebird');

  fetchPropertyDescriptions = require('./fetch-property-docs');

  PropertiesURL = 'https://raw.githubusercontent.com/adobe/brackets/master/src/extensions/default/CSSCodeHints/CSSProperties.json';

  propertyDescriptionsPromise = fetchPropertyDescriptions();

  propertiesPromise = new Promise(function(resolve) {
    return request({
      json: true,
      url: PropertiesURL
    }, function(error, response, properties) {
      if (error != null) {
        console.error(error.message);
        resolve(null);
      }
      if (response.statusCode !== 200) {
        console.error("Request for CSSProperties.json failed: " + response.statusCode);
        resolve(null);
      }
      return resolve(properties);
    });
  });

  Promise.settle([propertiesPromise, propertyDescriptionsPromise]).then(function(results) {
    var completions, d, metadata, properties, propertiesRaw, propertyDescriptions, propertyName, pseudoSelectors, sortedPropertyNames, tags, _i, _len;
    properties = {};
    propertiesRaw = results[0].value();
    propertyDescriptions = results[1].value();
    sortedPropertyNames = JSON.parse(fs.readFileSync(path.join(__dirname, 'sorted-property-names.json')));
    for (_i = 0, _len = sortedPropertyNames.length; _i < _len; _i++) {
      propertyName = sortedPropertyNames[_i];
      if (!(metadata = propertiesRaw[propertyName])) {
        continue;
      }
      metadata.description = propertyDescriptions[propertyName];
      properties[propertyName] = metadata;
      if (propertyDescriptions[propertyName] == null) {
        console.warn("No description for property " + propertyName);
      }
    }
    for (propertyName in propertiesRaw) {
      d = propertiesRaw[propertyName];
      if (sortedPropertyNames.indexOf(propertyName) < 0) {
        console.warn("Ignoring " + propertyName + "; not in sorted-property-names.json");
      }
    }
    tags = JSON.parse(fs.readFileSync(path.join(__dirname, 'html-tags.json')));
    pseudoSelectors = JSON.parse(fs.readFileSync(path.join(__dirname, 'pseudo-selectors.json')));
    completions = {
      tags: tags,
      properties: properties,
      pseudoSelectors: pseudoSelectors
    };
    return fs.writeFileSync(path.join(__dirname, 'completions.json'), "" + (JSON.stringify(completions, null, '  ')) + "\n");
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc2Fzcy91cGRhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxNQUFBLG9IQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FGVixDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBSFYsQ0FBQTs7QUFBQSxFQUlBLHlCQUFBLEdBQTRCLE9BQUEsQ0FBUSx1QkFBUixDQUo1QixDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFnQixnSEFOaEIsQ0FBQTs7QUFBQSxFQVFBLDJCQUFBLEdBQThCLHlCQUFBLENBQUEsQ0FSOUIsQ0FBQTs7QUFBQSxFQVNBLGlCQUFBLEdBQXdCLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxHQUFBO1dBQzlCLE9BQUEsQ0FBUTtBQUFBLE1BQUMsSUFBQSxFQUFNLElBQVA7QUFBQSxNQUFhLEdBQUEsRUFBSyxhQUFsQjtLQUFSLEVBQTBDLFNBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsVUFBbEIsR0FBQTtBQUN4QyxNQUFBLElBQUcsYUFBSDtBQUNFLFFBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFLLENBQUMsT0FBcEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxPQUFBLENBQVEsSUFBUixDQURBLENBREY7T0FBQTtBQUdBLE1BQUEsSUFBRyxRQUFRLENBQUMsVUFBVCxLQUF5QixHQUE1QjtBQUNFLFFBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBZSx5Q0FBQSxHQUF5QyxRQUFRLENBQUMsVUFBakUsQ0FBQSxD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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-sass/update.coffee
