(function() {
  var Entry, History, _, settings,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  Entry = require('./entry');

  settings = require('./settings');

  History = (function() {
    function History() {
      this.init();
    }

    History.prototype.init = function() {
      this.index = 0;
      return this.entries = [];
    };

    History.prototype.clear = function() {
      var entry, j, len, ref;
      ref = this.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        entry.destroy();
      }
      return this.init();
    };

    History.prototype.destroy = function() {
      var entry, j, len, ref, ref1;
      ref = this.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        entry.destroy();
      }
      return ref1 = {}, this.index = ref1.index, this.entries = ref1.entries, ref1;
    };

    History.prototype.findValidIndex = function(direction, arg) {
      var URI, entry, index, indexesToSearch, j, k, l, lastIndex, len, results, results1, startIndex;
      URI = (arg != null ? arg : {}).URI;
      lastIndex = this.entries.length - 1;
      switch (direction) {
        case 'next':
          startIndex = this.index + 1;
          indexesToSearch = (function() {
            results = [];
            for (var j = startIndex; startIndex <= lastIndex ? j <= lastIndex : j >= lastIndex; startIndex <= lastIndex ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
          break;
        case 'prev':
          startIndex = this.index - 1;
          indexesToSearch = (function() {
            results1 = [];
            for (var k = startIndex; startIndex <= 0 ? k <= 0 : k >= 0; startIndex <= 0 ? k++ : k--){ results1.push(k); }
            return results1;
          }).apply(this);
      }
      if (!((0 <= startIndex && startIndex <= lastIndex))) {
        return;
      }
      for (l = 0, len = indexesToSearch.length; l < len; l++) {
        index = indexesToSearch[l];
        if ((entry = this.entries[index]).isValid()) {
          if (URI != null) {
            if (entry.URI === URI) {
              return index;
            }
          } else {
            return index;
          }
        }
      }
      return null;
    };

    History.prototype.get = function(direction, options) {
      var index;
      if (options == null) {
        options = {};
      }
      index = this.findValidIndex(direction, options);
      if (index != null) {
        return this.entries[this.index = index];
      }
    };

    History.prototype.isIndexAtHead = function() {
      return this.index === this.entries.length;
    };

    History.prototype.setIndexToHead = function() {
      return this.index = this.entries.length;
    };

    History.prototype.add = function(location, arg) {
      var URI, editor, entry, j, k, len, len1, newEntry, point, ref, ref1, setIndexToHead;
      setIndexToHead = (arg != null ? arg : {}).setIndexToHead;
      editor = location.editor, point = location.point, URI = location.URI;
      newEntry = new Entry(editor, point, URI);
      if (settings.get('keepSingleEntryPerBuffer')) {
        ref = this.entries;
        for (j = 0, len = ref.length; j < len; j++) {
          entry = ref[j];
          if (entry.URI === newEntry.URI) {
            entry.destroy();
          }
        }
      } else {
        ref1 = this.entries;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          entry = ref1[k];
          if (entry.isAtSameRow(newEntry)) {
            entry.destroy();
          }
        }
      }
      this.entries.push(newEntry);
      if (setIndexToHead != null ? setIndexToHead : true) {
        this.removeInvalidEntries();
        return this.setIndexToHead();
      }
    };

    History.prototype.uniqueByBuffer = function() {
      var URI, buffers, entry, j, len, ref;
      if (!this.entries.length) {
        return;
      }
      buffers = [];
      ref = this.entries.slice().reverse();
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        URI = entry.URI;
        if (indexOf.call(buffers, URI) >= 0) {
          entry.destroy();
        } else {
          buffers.push(URI);
        }
      }
      this.removeInvalidEntries();
      return this.setIndexToHead();
    };

    History.prototype.removeInvalidEntries = function() {
      var entry, j, k, len, len1, ref, removeCount, removed, results;
      ref = this.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        if (!entry.isValid()) {
          entry.destroy();
        }
      }
      this.entries = this.entries.filter(function(entry) {
        return entry.isValid();
      });
      removeCount = this.entries.length - settings.get('max');
      if (removeCount > 0) {
        removed = this.entries.splice(0, removeCount);
        results = [];
        for (k = 0, len1 = removed.length; k < len1; k++) {
          entry = removed[k];
          results.push(entry.destroy());
        }
        return results;
      }
    };

    History.prototype.inspect = function(msg) {
      var ary, e, i, s;
      ary = (function() {
        var j, len, ref, results;
        ref = this.entries;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          e = ref[i];
          s = i === this.index ? "> " : "  ";
          results.push("" + s + i + ": " + (e.inspect()));
        }
        return results;
      }).call(this);
      if (this.index === this.entries.length) {
        ary.push("> " + this.index + ":");
      }
      return ary.join("\n");
    };

    return History;

  })();

  module.exports = History;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9jdXJzb3ItaGlzdG9yeS9saWIvaGlzdG9yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJCQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBQ1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVMO0lBQ1MsaUJBQUE7TUFDWCxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRFc7O3NCQUdiLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULElBQUMsQ0FBQSxPQUFELEdBQVc7SUFGUDs7c0JBSU4sS0FBQSxHQUFPLFNBQUE7QUFDTCxVQUFBO0FBQUE7QUFBQSxXQUFBLHFDQUFBOztRQUFBLEtBQUssQ0FBQyxPQUFOLENBQUE7QUFBQTthQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFGSzs7c0JBSVAsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO0FBQUE7QUFBQSxXQUFBLHFDQUFBOztRQUFBLEtBQUssQ0FBQyxPQUFOLENBQUE7QUFBQTthQUNBLE9BQXFCLEVBQXJCLEVBQUMsSUFBQyxDQUFBLGFBQUEsS0FBRixFQUFTLElBQUMsQ0FBQSxlQUFBLE9BQVYsRUFBQTtJQUZPOztzQkFJVCxjQUFBLEdBQWdCLFNBQUMsU0FBRCxFQUFZLEdBQVo7QUFDZCxVQUFBO01BRDJCLHFCQUFELE1BQU07TUFDaEMsU0FBQSxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxHQUFrQjtBQUU5QixjQUFPLFNBQVA7QUFBQSxhQUNPLE1BRFA7VUFFSSxVQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUQsR0FBUztVQUN0QixlQUFBLEdBQWtCOzs7OztBQUZmO0FBRFAsYUFJTyxNQUpQO1VBS0ksVUFBQSxHQUFhLElB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LEtBQWI7TUFDaEMsSUFBRyxXQUFBLEdBQWMsQ0FBakI7UUFDRSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLENBQWhCLEVBQW1CLFdBQW5CO0FBQ1Y7YUFBQSwyQ0FBQTs7dUJBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBQTtBQUFBO3VCQUZGOztJQVJvQjs7c0JBWXRCLE9BQUEsR0FBUyxTQUFDLEdBQUQ7QUFDUCxVQUFBO01BQUEsR0FBQTs7QUFDRTtBQUFBO2FBQUEsNkNBQUE7O1VBQ0UsQ0FBQSxHQUFRLENBQUEsS0FBSyxJQUFDLENBQUEsS0FBVixHQUFzQixJQUF0QixHQUFnQzt1QkFDcEMsRUFBQSxHQUFHLENBQUgsR0FBTyxDQUFQLEdBQVMsSUFBVCxHQUFZLENBQUMsQ0FBQyxDQUFDLE9BQUYsQ0FBQSxDQUFEO0FBRmQ7OztNQUdGLElBQTRCLElBQUMsQ0FBQSxLQUFELEtBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUEvQztRQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBQSxHQUFLLElBQUMsQ0FBQSxLQUFOLEdBQVksR0FBckIsRUFBQTs7YUFDQSxHQUFHLENBQUMsSUFBSixDQUFTLElBQVQ7SUFOTzs7Ozs7O0VBUVgsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF4SmpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbkVudHJ5ID0gcmVxdWlyZSAnLi9lbnRyeSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgSGlzdG9yeVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogLT5cbiAgICBAaW5kZXggPSAwXG4gICAgQGVudHJpZXMgPSBbXVxuXG4gIGNsZWFyOiAtPlxuICAgIGVudHJ5LmRlc3Ryb3koKSBmb3IgZW50cnkgaW4gQGVudHJpZXNcbiAgICBAaW5pdCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBlbnRyeS5kZXN0cm95KCkgZm9yIGVudHJ5IGluIEBlbnRyaWVzXG4gICAge0BpbmRleCwgQGVudHJpZXN9ID0ge31cblxuICBmaW5kVmFsaWRJbmRleDogKGRpcmVjdGlvbiwge1VSSX09e30pIC0+XG4gICAgbGFzdEluZGV4ID0gQGVudHJpZXMubGVuZ3RoIC0gMVxuXG4gICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgd2hlbiAnbmV4dCdcbiAgICAgICAgc3RhcnRJbmRleCA9IEBpbmRleCArIDFcbiAgICAgICAgaW5kZXhlc1RvU2VhcmNoID0gW3N0YXJ0SW5kZXguLmxhc3RJbmRleF1cbiAgICAgIHdoZW4gJ3ByZXYnXG4gICAgICAgIHN0YXJ0SW5kZXggPSBAaW5kZXggLSAxXG4gICAgICAgIGluZGV4ZXNUb1NlYXJjaCA9IFtzdGFydEluZGV4Li4wXVxuXG4gICAgcmV0dXJuIHVubGVzcyAwIDw9IHN0YXJ0SW5kZXggPD0gbGFzdEluZGV4XG5cbiAgICBmb3IgaW5kZXggaW4gaW5kZXhlc1RvU2VhcmNoIHdoZW4gKGVudHJ5ID0gQGVudHJpZXNbaW5kZXhdKS5pc1ZhbGlkKClcbiAgICAgIGlmIFVSST9cbiAgICAgICAgcmV0dXJuIGluZGV4IGlmIGVudHJ5LlVSSSBpcyBVUklcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGluZGV4XG4gICAgbnVsbFxuXG4gIGdldDogKGRpcmVjdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAgICBpbmRleCA9IEBmaW5kVmFsaWRJbmRleChkaXJlY3Rpb24sIG9wdGlvbnMpXG4gICAgaWYgaW5kZXg/XG4gICAgICBAZW50cmllc1tAaW5kZXg9aW5kZXhdXG5cbiAgaXNJbmRleEF0SGVhZDogLT5cbiAgICBAaW5kZXggaXMgQGVudHJpZXMubGVuZ3RoXG5cbiAgc2V0SW5kZXhUb0hlYWQ6IC0+XG4gICAgQGluZGV4ID0gQGVudHJpZXMubGVuZ3RoXG5cbiAgIyBIaXN0b3J5IGNvbmNhdGVuYXRpb24gbWltaWNraW5nIFZpbSdzIHdheS5cbiAgIyBuZXdFbnRyeSg9b2xkIHBvc2l0aW9uIGZyb20gd2hlcmUgeW91IGp1bXAgdG8gbGFuZCBoZXJlKSBpc1xuICAjICphbHdheXMqIGFkZGVkIHRvIGVuZCBvZiBAZW50cmllcy5cbiAgIyBXaGVuZXZlciBuZXdFbnRyeSBpcyBhZGRlZCBvbGQgTWFya2VyIHdpY2ggaGF2ZSBzYW1lIHJvdyB3aXRoXG4gICMgbmV3RW50cnkgaXMgcmVtb3ZlZC5cbiAgIyBUaGlzIGFsbG93cyB5b3UgdG8gZ2V0IGJhY2sgdG8gb2xkIHBvc2l0aW9uKHJvdykgb25seSBvbmNlLlxuICAjXG4gICMgIGh0dHA6Ly92aW1oZWxwLmFwcHNwb3QuY29tL21vdGlvbi50eHQuaHRtbCNqdW1wLW1vdGlvbnNcbiAgI1xuICAjIGUuZ1xuICAjICAxc3QgY29sdW1uOiBpbmRleCBvZiBAZW50cmllc1xuICAjICAybmQgY29sdW1uOiByb3cgb2YgZWFjaCBNYXJrZXIgaW5kaWNhdGUuXG4gICMgID46IGluZGljYXRlIEBpbmRleFxuICAjXG4gICMgQ2FzZS0xOlxuICAjICAgSnVtcCBmcm9tIHJvdz03IHRvIHJvdz05IHRoZW4gYmFjayB3aXRoIGBjdXJzb3ItaGlzdG9yeTpwcmV2YC5cbiAgI1xuICAjICAgICBbMV0gICBbMl0gICAgWzNdXG4gICMgICAgIDAgMSAgIDAgMSAgICAwIDFcbiAgIyAgICAgMSAzICAgMSAzICAgIDEgM1xuICAjICAgICAyIDUgICAyIDUgICAgMiA1XG4gICMgICA+IDMgNyAgIDMgOCAgICAzIDhcbiAgIyAgICAgNCA4ICAgNCA3ICA+IDQgN1xuICAjICAgICAgICAgPiAgIF8gICAgNSA5XG4gICNcbiAgIyAxLiBJbml0aWFsIFN0YXRlLCBAaW5kZXg9Myhyb3c9NylcbiAgIyAyLiBKdW1wIGZyb20gcm93PTcgdG8gcm93PTksIG5ld0VudHJ5KHJvdz03KSBpcyBhcHBlbmRlZCB0byBlbmRcbiAgIyAgICBvZiBAZW50cmllcyB0aGVuIG9sZCByb3c9NyhAaW5kZXg9Mykgd2FzIGRlbGV0ZWQuXG4gICMgICAgQGluZGV4IGFkanVzdGVkIHRvIGhlYWQgb2YgQGVudHJpZXMoQGluZGV4ID0gQGVudHJpZXMubGVuZ3RoKS5cbiAgIyAzLiBCYWNrIGZyb20gcm93PTkgdG8gcm93PTcgd2l0aCBgY3Vyc29yLWhpc3Rvcnk6cHJldmAuXG4gICMgICAgbmV3RW50cnkocm93PTkpIGlzIGFwcGVuZGVkIHRvIGVuZCBvZiBAZW50cmllcy5cbiAgIyAgICBObyBzcGVjaWFsIEBpbmRleCBhZGp1c3RtZW50LlxuICAjXG4gICMgQ2FzZS0yOlxuICAjICBKdW1wIGZyb20gcm93PTMgdG8gcm93PTcgdGhlbiBiYWNrIHdpdGggYGN1cnNvci1oaXN0b3J5LnByZXZgLlxuICAjXG4gICMgICAgIFsxXSAgIFsyXSAgICBbM11cbiAgIyAgICAgMCAxICAgMCAxICAgIDAgMVxuICAjICAgPiAxIDMgICAxIDUgICAgMSA1XG4gICMgICAgIDIgNSAgIDIgNyAgICAyIDhcbiAgIyAgICAgMyA3ICAgMyA4ICA+IDMgM1xuICAjICAgICA0IDggICA0IDMgICAgNCA3XG4gICMgICAgICAgICA+ICAgX1xuICAjXG4gICMgMS4gSW5pdGlhbCBTdGF0ZSwgQGluZGV4PTEocm93PTMpXG4gICMgMi4gSnVtcCBmcm9tIHJvdz0zIHRvIHJvdz03LCBuZXdFbnRyeShyb3c9MykgaXMgYXBwZW5kZWQgdG8gZW5kXG4gICMgICAgb2YgQGVudHJpZXMgdGhlbiBvbGQgcm93PTMoQGluZGV4PTEpIHdhcyBkZWxldGVkLlxuICAjICAgIEBpbmRleCBhZGp1c3RlZCB0byBoZWFkIG9mIEBlbnRyaWVzKEBpbmRleCA9IEBlbnRyaWVzLmxlbmd0aCkuXG4gICMgMy4gQmFjayBmcm9tIHJvdz03IHRvIHJvdz0zIHdpdGggYGN1cnNvci1oaXN0b3J5OnByZXZgLlxuICAjICAgIG5ld0VudHJ5KHJvdz03KSBpcyBhcHBlbmRlZCB0byBlbmQgb2YgQGVudHJpZXMuXG4gICMgICAgTm8gc3BlY2lhbCBAaW5kZXggYWRqdXN0bWVudC5cbiAgI1xuICBhZGQ6IChsb2NhdGlvbiwge3NldEluZGV4VG9IZWFkfT17fSkgLT5cbiAgICB7ZWRpdG9yLCBwb2ludCwgVVJJfSA9IGxvY2F0aW9uXG4gICAgbmV3RW50cnkgPSBuZXcgRW50cnkoZWRpdG9yLCBwb2ludCwgVVJJKVxuXG4gICAgaWYgc2V0dGluZ3MuZ2V0KCdrZWVwU2luZ2xlRW50cnlQZXJCdWZmZXInKVxuICAgICAgZm9yIGVudHJ5IGluIEBlbnRyaWVzIHdoZW4gZW50cnkuVVJJIGlzIG5ld0VudHJ5LlVSSVxuICAgICAgICBlbnRyeS5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBmb3IgZW50cnkgaW4gQGVudHJpZXMgd2hlbiBlbnRyeS5pc0F0U2FtZVJvdyhuZXdFbnRyeSlcbiAgICAgICAgZW50cnkuZGVzdHJveSgpXG5cbiAgICBAZW50cmllcy5wdXNoKG5ld0VudHJ5KVxuICAgICMgT25seSB3aGVuIHdlIGFyZSBhbGxvd2VkIHRvIG1vZGlmeSBpbmRleCwgd2UgY2FuIHNhZmVseSByZW1vdmUgQGVudHJpZXMuXG4gICAgaWYgc2V0SW5kZXhUb0hlYWQgPyB0cnVlXG4gICAgICBAcmVtb3ZlSW52YWxpZEVudHJpZXMoKVxuICAgICAgQHNldEluZGV4VG9IZWFkKClcblxuICB1bmlxdWVCeUJ1ZmZlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlbnRyaWVzLmxlbmd0aFxuICAgIGJ1ZmZlcnMgPSBbXVxuICAgIGZvciBlbnRyeSBpbiBAZW50cmllcy5zbGljZSgpLnJldmVyc2UoKVxuICAgICAgVVJJID0gZW50cnkuVVJJXG4gICAgICBpZiBVUkkgaW4gYnVmZmVyc1xuICAgICAgICBlbnRyeS5kZXN0cm95KClcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmZmVycy5wdXNoKFVSSSlcbiAgICBAcmVtb3ZlSW52YWxpZEVudHJpZXMoKVxuICAgIEBzZXRJbmRleFRvSGVhZCgpXG5cbiAgcmVtb3ZlSW52YWxpZEVudHJpZXM6IC0+XG4gICAgIyBTY3J1YiBpbnZhbGlkXG4gICAgZm9yIGVudHJ5IGluIEBlbnRyaWVzIHdoZW4gbm90IGVudHJ5LmlzVmFsaWQoKVxuICAgICAgZW50cnkuZGVzdHJveSgpXG4gICAgQGVudHJpZXMgPSBAZW50cmllcy5maWx0ZXIgKGVudHJ5KSAtPiBlbnRyeS5pc1ZhbGlkKClcblxuICAgICMgUmVtb3ZlIGlmIGV4Y2VlZHMgbWF4XG4gICAgcmVtb3ZlQ291bnQgPSBAZW50cmllcy5sZW5ndGggLSBzZXR0aW5ncy5nZXQoJ21heCcpXG4gICAgaWYgcmVtb3ZlQ291bnQgPiAwXG4gICAgICByZW1vdmVkID0gQGVudHJpZXMuc3BsaWNlKDAsIHJlbW92ZUNvdW50KVxuICAgICAgZW50cnkuZGVzdHJveSgpIGZvciBlbnRyeSBpbiByZW1vdmVkXG5cbiAgaW5zcGVjdDogKG1zZykgLT5cbiAgICBhcnkgPVxuICAgICAgZm9yIGUsIGkgaW4gQGVudHJpZXNcbiAgICAgICAgcyA9IGlmIChpIGlzIEBpbmRleCkgdGhlbiBcIj4gXCIgZWxzZSBcIiAgXCJcbiAgICAgICAgXCIje3N9I3tpfTogI3tlLmluc3BlY3QoKX1cIlxuICAgIGFyeS5wdXNoIFwiPiAje0BpbmRleH06XCIgaWYgKEBpbmRleCBpcyBAZW50cmllcy5sZW5ndGgpXG4gICAgYXJ5LmpvaW4oXCJcXG5cIilcblxubW9kdWxlLmV4cG9ydHMgPSBIaXN0b3J5XG4iXX0=
