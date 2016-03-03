(function() {
  var FixesForCrappyDescriptions, Promise, fetch, filterExcerpt, fs, mdnCSSURL, mdnJSONAPI, path, propertiesURL, request;

  path = require('path');

  fs = require('fs');

  request = require('request');

  Promise = require('bluebird');

  mdnCSSURL = 'https://developer.mozilla.org/en-US/docs/Web/CSS';

  mdnJSONAPI = 'https://developer.mozilla.org/en-US/search.json';

  propertiesURL = 'https://raw.githubusercontent.com/adobe/brackets/master/src/extensions/default/CSSCodeHints/CSSProperties.json';

  fetch = function() {
    var docsPromise, propertiesPromise;
    propertiesPromise = new Promise(function(resolve) {
      return request({
        json: true,
        url: propertiesURL
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
    return docsPromise = propertiesPromise.then(function(properties) {
      var MAX, docs, queue, running;
      if (properties == null) {
        return;
      }
      MAX = 10;
      queue = Object.keys(properties);
      running = [];
      docs = {};
      return new Promise(function(resolve) {
        var checkEnd, handleRequest, i, removeRunning, run, runNext, _i;
        checkEnd = function() {
          if (queue.length === 0 && running.length === 0) {
            return resolve(docs);
          }
        };
        removeRunning = function(propertyName) {
          var index;
          index = running.indexOf(propertyName);
          if (index > -1) {
            return running.splice(index, 1);
          }
        };
        runNext = function() {
          var propertyName;
          checkEnd();
          if (queue.length !== 0) {
            propertyName = queue.pop();
            running.push(propertyName);
            return run(propertyName);
          }
        };
        run = function(propertyName) {
          var url;
          url = "" + mdnJSONAPI + "?q=" + propertyName;
          return request({
            json: true,
            url: url
          }, function(error, response, searchResults) {
            if ((error == null) && response.statusCode === 200) {
              handleRequest(propertyName, searchResults);
            } else {
              console.error("Req failed " + url + "; " + response.statusCode + ", " + error);
            }
            removeRunning(propertyName);
            checkEnd();
            return runNext();
          });
        };
        handleRequest = function(propertyName, searchResults) {
          var doc, _i, _len, _ref;
          if (searchResults.documents != null) {
            _ref = searchResults.documents;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              doc = _ref[_i];
              if (doc.url === ("" + mdnCSSURL + "/" + propertyName)) {
                docs[propertyName] = filterExcerpt(propertyName, doc.excerpt);
                break;
              }
            }
          }
        };
        for (i = _i = 0; 0 <= MAX ? _i <= MAX : _i >= MAX; i = 0 <= MAX ? ++_i : --_i) {
          runNext();
        }
      });
    });
  };

  FixesForCrappyDescriptions = {
    border: 'Specifies all borders on an HTMLElement.',
    clear: 'Specifies whether an element can be next to floating elements that precede it or must be moved down (cleared) below them.'
  };

  filterExcerpt = function(propertyName, excerpt) {
    var beginningPattern, periodIndex;
    if (FixesForCrappyDescriptions[propertyName] != null) {
      return FixesForCrappyDescriptions[propertyName];
    }
    beginningPattern = /^the (css )?[a-z-]+ (css )?property (is )?(\w+)/i;
    excerpt = excerpt.replace(/<\/?mark>/g, '');
    excerpt = excerpt.replace(beginningPattern, function(match) {
      var firstWord, matches;
      matches = beginningPattern.exec(match);
      firstWord = matches[4];
      return firstWord[0].toUpperCase() + firstWord.slice(1);
    });
    periodIndex = excerpt.indexOf('.');
    if (periodIndex > -1) {
      excerpt = excerpt.slice(0, periodIndex + 1);
    }
    return excerpt;
  };

  if (require.main === module) {
    fetch().then(function(docs) {
      if (docs != null) {
        return fs.writeFileSync(path.join(__dirname, 'property-docs.json'), "" + (JSON.stringify(docs, null, '  ')) + "\n");
      } else {
        return console.error('No docs');
      }
    });
  }

  module.exports = fetch;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc2Fzcy9mZXRjaC1wcm9wZXJ0eS1kb2NzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrSEFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSLENBRlYsQ0FBQTs7QUFBQSxFQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQUhWLENBQUE7O0FBQUEsRUFLQSxTQUFBLEdBQVksa0RBTFosQ0FBQTs7QUFBQSxFQU1BLFVBQUEsR0FBYSxpREFOYixDQUFBOztBQUFBLEVBT0EsYUFBQSxHQUFnQixnSEFQaEIsQ0FBQTs7QUFBQSxFQVNBLEtBQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixRQUFBLDhCQUFBO0FBQUEsSUFBQSxpQkFBQSxHQUF3QixJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsR0FBQTthQUM5QixPQUFBLENBQVE7QUFBQSxRQUFDLElBQUEsRUFBTSxJQUFQO0FBQUEsUUFBYSxHQUFBLEVBQUssYUFBbEI7T0FBUixFQUEwQyxTQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLFVBQWxCLEdBQUE7QUFDeEMsUUFBQSxJQUFHLGFBQUg7QUFDRSxVQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBSyxDQUFDLE9BQXBCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsT0FBQSxDQUFRLElBQVIsQ0FEQSxDQURGO1NBQUE7QUFJQSxRQUFBLElBQUcsUUFBUSxDQUFDLFVBQVQsS0FBeUIsR0FBNUI7QUFDRSxVQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWUseUNBQUEs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

//# sourceURL=/Users/igawataiichi/.atom/packages/autocomplete-sass/fetch-property-docs.coffee
