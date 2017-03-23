'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
let SnippetParser = class SnippetParser {
  reset() {
    this.inSnippet = false;
    this.inSnippetBody = false;
    this.snippetStart = -1;
    this.snippetEnd = -1;
    this.bodyStart = -1;
    this.bodyEnd = -1;
    this.escapedBraceIndices = null;
  }

  findSnippets(text) {
    if (text.length <= 0 || text.indexOf('$') === -1) {
      return;
    } // No snippets
    this.reset();
    const snippets = [];

    // We're not using a regex because escaped right braces cannot be tracked without lookbehind,
    // which doesn't exist yet for javascript; consequently we need to iterate through each character.
    // This might feel ugly, but it's necessary.
    for (let index = 0; index < text.length; index++) {
      if (this.inSnippet && this.snippetEnd === index) {
        let body = text.slice(this.bodyStart, this.bodyEnd + 1);
        body = this.removeBraceEscaping(body, this.bodyStart, this.escapedBraceIndices);
        snippets.push({ snippetStart: this.snippetStart, snippetEnd: this.snippetEnd, bodyStart: this.bodyStart, bodyEnd: this.bodyEnd, body });
        this.reset();
        continue;
      }

      if (this.inSnippet && index >= this.bodyStart && index <= this.bodyEnd) {
        this.inBody = true;
      }
      if (this.inSnippet && (index > this.bodyEnd || index < this.bodyStart)) {
        this.inBody = false;
      }
      if (this.bodyStart === -1 || this.bodyEnd === -1) {
        this.inBody = false;
      }
      if (this.inSnippet && !this.inBody) {
        continue;
      }
      if (this.inSnippet && this.inBody) {
        continue;
      }

      // Determine if we've found a new snippet
      if (!this.inSnippet && text.indexOf('${', index) === index) {
        // Find index of colon
        let colonIndex = text.indexOf(':', index + 3);
        if (colonIndex !== -1) {
          // Disqualify snippet unless the text between '${' and ':' are digits
          const groupStart = index + 2;
          const groupEnd = colonIndex - 1;
          if (groupEnd >= groupStart) {
            for (let i = groupStart; i < groupEnd; i++) {
              if (isNaN(parseInt(text.charAt(i)))) {
                colonIndex = -1;
              }
            }
          } else {
            colonIndex = -1;
          }
        }

        // Find index of '}'
        let rightBraceIndex = -1;
        if (colonIndex !== -1) {
          let i = index + 4;
          while (true) {
            rightBraceIndex = text.indexOf('}', i);
            if (rightBraceIndex === -1) {
              break;
            }
            if (text.charAt(rightBraceIndex - 1) === '\\') {
              if (this.escapedBraceIndices == null) {
                this.escapedBraceIndices = [];
              }
              this.escapedBraceIndices.push(rightBraceIndex - 1);
            } else {
              break;
            }
            i = rightBraceIndex + 1;
          }
        }

        if (colonIndex !== -1 && rightBraceIndex !== -1 && colonIndex < rightBraceIndex) {
          this.inSnippet = true;
          this.inBody = false;
          this.snippetStart = index;
          this.snippetEnd = rightBraceIndex;
          this.bodyStart = colonIndex + 1;
          this.bodyEnd = rightBraceIndex - 1;
          continue;
        } else {
          this.reset();
        }
      }
    }

    return snippets;
  }

  removeBraceEscaping(body, bodyStart, escapedBraceIndices) {
    if (escapedBraceIndices != null) {
      for (let i = 0; i < escapedBraceIndices.length; i++) {
        const bodyIndex = escapedBraceIndices[i];
        body = removeCharFromString(body, bodyIndex - bodyStart - i);
      }
    }
    return body;
  }
};
exports.default = SnippetParser;
;

const removeCharFromString = (str, index) => str.slice(0, index) + str.slice(index + 1);
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNuaXBwZXQtcGFyc2VyLmpzIl0sIm5hbWVzIjpbIlNuaXBwZXRQYXJzZXIiLCJyZXNldCIsImluU25pcHBldCIsImluU25pcHBldEJvZHkiLCJzbmlwcGV0U3RhcnQiLCJzbmlwcGV0RW5kIiwiYm9keVN0YXJ0IiwiYm9keUVuZCIsImVzY2FwZWRCcmFjZUluZGljZXMiLCJmaW5kU25pcHBldHMiLCJ0ZXh0IiwibGVuZ3RoIiwiaW5kZXhPZiIsInNuaXBwZXRzIiwiaW5kZXgiLCJib2R5Iiwic2xpY2UiLCJyZW1vdmVCcmFjZUVzY2FwaW5nIiwicHVzaCIsImluQm9keSIsImNvbG9uSW5kZXgiLCJncm91cFN0YXJ0IiwiZ3JvdXBFbmQiLCJpIiwiaXNOYU4iLCJwYXJzZUludCIsImNoYXJBdCIsInJpZ2h0QnJhY2VJbmRleCIsImJvZHlJbmRleCIsInJlbW92ZUNoYXJGcm9tU3RyaW5nIiwic3RyIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7SUFFcUJBLGEsR0FBTixNQUFNQSxhQUFOLENBQW9CO0FBQ2pDQyxVQUFTO0FBQ1AsU0FBS0MsU0FBTCxHQUFpQixLQUFqQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsS0FBckI7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLENBQUMsQ0FBckI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLENBQUMsQ0FBbkI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLENBQUMsQ0FBbEI7QUFDQSxTQUFLQyxPQUFMLEdBQWUsQ0FBQyxDQUFoQjtBQUNBLFNBQUtDLG1CQUFMLEdBQTJCLElBQTNCO0FBQ0Q7O0FBRURDLGVBQWNDLElBQWQsRUFBb0I7QUFDbEIsUUFBSUEsS0FBS0MsTUFBTCxJQUFlLENBQWYsSUFBb0JELEtBQUtFLE9BQUwsQ0FBYSxHQUFiLE1BQXNCLENBQUMsQ0FBL0MsRUFBa0Q7QUFBRTtBQUFRLEtBRDFDLENBQzJDO0FBQzdELFNBQUtYLEtBQUw7QUFDQSxVQUFNWSxXQUFXLEVBQWpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQUss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c2UgYmFiZWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNuaXBwZXRQYXJzZXIge1xuICByZXNldCAoKSB7XG4gICAgdGhpcy5pblNuaXBwZXQgPSBmYWxzZVxuICAgIHRoaXMuaW5TbmlwcGV0Qm9keSA9IGZhbHNlXG4gICAgdGhpcy5zbmlwcGV0U3RhcnQgPSAtMVxuICAgIHRoaXMuc25pcHBldEVuZCA9IC0xXG4gICAgdGhpcy5ib2R5U3RhcnQgPSAtMVxuICAgIHRoaXMuYm9keUVuZCA9IC0xXG4gICAgdGhpcy5lc2NhcGVkQnJhY2VJbmRpY2VzID0gbnVsbFxuICB9XG5cbiAgZmluZFNuaXBwZXRzICh0ZXh0KSB7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IDAgfHwgdGV4dC5pbmRleE9mKCckJykgPT09IC0xKSB7IHJldHVybiB9IC8vIE5vIHNuaXBwZXRzXG4gICAgdGhpcy5yZXNldCgpXG4gICAgY29uc3Qgc25pcHBldHMgPSBbXVxuXG4gICAgLy8gV2UncmUgbm90IHVzaW5nIGEgcmVnZXggYmVjYXVzZSBlc2NhcGVkIHJpZ2h0IGJyYWNlcyBjYW5ub3QgYmUgdHJhY2tlZCB3aXRob3V0IGxvb2tiZWhpbmQsXG4gICAgLy8gd2hpY2ggZG9lc24ndCBleGlzdCB5ZXQgZm9yIGphdmFzY3JpcHQ7IGNvbnNlcXVlbnRseSB3ZSBuZWVkIHRvIGl0ZXJhdGUgdGhyb3VnaCBlYWNoIGNoYXJhY3Rlci5cbiAgICAvLyBUaGlzIG1pZ2h0IGZlZWwgdWdseSwgYnV0IGl0J3MgbmVjZXNzYXJ5LlxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0ZXh0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgaWYgKHRoaXMuaW5TbmlwcGV0ICYmIHRoaXMuc25pcHBldEVuZCA9PT0gaW5kZXgpIHtcbiAgICAgICAgbGV0IGJvZHkgPSB0ZXh0LnNsaWNlKHRoaXMuYm9keVN0YXJ0LCB0aGlzLmJvZHlFbmQgKyAxKVxuICAgICAgICBib2R5ID0gdGhpcy5yZW1vdmVCcmFjZUVzY2FwaW5nKGJvZHksIHRoaXMuYm9keVN0YXJ0LCB0aGlzLmVzY2FwZWRCcmFjZUluZGljZXMpXG4gICAgICAgIHNuaXBwZXRzLnB1c2goe3NuaXBwZXRTdGFydDogdGhpcy5zbmlwcGV0U3RhcnQsIHNuaXBwZXRFbmQ6IHRoaXMuc25pcHBldEVuZCwgYm9keVN0YXJ0OiB0aGlzLmJvZHlTdGFydCwgYm9keUVuZDogdGhpcy5ib2R5RW5kLCBib2R5fSlcbiAgICAgICAgdGhpcy5yZXNldCgpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmluU25pcHBldCAmJiBpbmRleCA+PSB0aGlzLmJvZHlTdGFydCAmJiBpbmRleCA8PSB0aGlzLmJvZHlFbmQpIHsgdGhpcy5pbkJvZHkgPSB0cnVlIH1cbiAgICAgIGlmICh0aGlzLmluU25pcHBldCAmJiAoaW5kZXggPiB0aGlzLmJvZHlFbmQgfHwgaW5kZXggPCB0aGlzLmJvZHlTdGFydCkpIHsgdGhpcy5pbkJvZHkgPSBmYWxzZSB9XG4gICAgICBpZiAodGhpcy5ib2R5U3RhcnQgPT09IC0xIHx8IHRoaXMuYm9keUVuZCA9PT0gLTEpIHsgdGhpcy5pbkJvZHkgPSBmYWxzZSB9XG4gICAgICBpZiAodGhpcy5pblNuaXBwZXQgJiYgIXRoaXMuaW5Cb2R5KSB7IGNvbnRpbnVlIH1cbiAgICAgIGlmICh0aGlzLmluU25pcHBldCAmJiB0aGlzLmluQm9keSkgeyBjb250aW51ZSB9XG5cbiAgICAgIC8vIERldGVybWluZSBpZiB3ZSd2ZSBmb3VuZCBhIG5ldyBzbmlwcGV0XG4gICAgICBpZiAoIXRoaXMuaW5TbmlwcGV0ICYmIHRleHQuaW5kZXhPZignJHsnLCBpbmRleCkgPT09IGluZGV4KSB7XG4gICAgICAgIC8vIEZpbmQgaW5kZXggb2YgY29sb25cbiAgICAgICAgbGV0IGNvbG9uSW5kZXggPSB0ZXh0LmluZGV4T2YoJzonLCBpbmRleCArIDMpXG4gICAgICAgIGlmIChjb2xvbkluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIC8vIERpc3F1YWxpZnkgc25pcHBldCB1bmxlc3MgdGhlIHRleHQgYmV0d2VlbiAnJHsnIGFuZCAnOicgYXJlIGRpZ2l0c1xuICAgICAgICAgIGNvbnN0IGdyb3VwU3RhcnQgPSBpbmRleCArIDJcbiAgICAgICAgICBjb25zdCBncm91cEVuZCA9IGNvbG9uSW5kZXggLSAxXG4gICAgICAgICAgaWYgKGdyb3VwRW5kID49IGdyb3VwU3RhcnQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBncm91cFN0YXJ0OyBpIDwgZ3JvdXBFbmQ7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VJbnQodGV4dC5jaGFyQXQoaSkpKSkgeyBjb2xvbkluZGV4ID0gLTEgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb2xvbkluZGV4ID0gLTFcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5kIGluZGV4IG9mICd9J1xuICAgICAgICBsZXQgcmlnaHRCcmFjZUluZGV4ID0gLTFcbiAgICAgICAgaWYgKGNvbG9uSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgbGV0IGkgPSBpbmRleCArIDRcbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgcmlnaHRCcmFjZUluZGV4ID0gdGV4dC5pbmRleE9mKCd9JywgaSlcbiAgICAgICAgICAgIGlmIChyaWdodEJyYWNlSW5kZXggPT09IC0xKSB7IGJyZWFrIH1cbiAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJBdChyaWdodEJyYWNlSW5kZXggLSAxKSA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmVzY2FwZWRCcmFjZUluZGljZXMgPT0gbnVsbCkgeyB0aGlzLmVzY2FwZWRCcmFjZUluZGljZXMgPSBbXSB9XG4gICAgICAgICAgICAgIHRoaXMuZXNjYXBlZEJyYWNlSW5kaWNlcy5wdXNoKHJpZ2h0QnJhY2VJbmRleCAtIDEpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHJpZ2h0QnJhY2VJbmRleCArIDFcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29sb25JbmRleCAhPT0gLTEgJiYgcmlnaHRCcmFjZUluZGV4ICE9PSAtMSAmJiBjb2xvbkluZGV4IDwgcmlnaHRCcmFjZUluZGV4KSB7XG4gICAgICAgICAgdGhpcy5pblNuaXBwZXQgPSB0cnVlXG4gICAgICAgICAgdGhpcy5pbkJvZHkgPSBmYWxzZVxuICAgICAgICAgIHRoaXMuc25pcHBldFN0YXJ0ID0gaW5kZXhcbiAgICAgICAgICB0aGlzLnNuaXBwZXRFbmQgPSByaWdodEJyYWNlSW5kZXhcbiAgICAgICAgICB0aGlzLmJvZHlTdGFydCA9IGNvbG9uSW5kZXggKyAxXG4gICAgICAgICAgdGhpcy5ib2R5RW5kID0gcmlnaHRCcmFjZUluZGV4IC0gMVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXNldCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc25pcHBldHNcbiAgfVxuXG4gIHJlbW92ZUJyYWNlRXNjYXBpbmcgKGJvZHksIGJvZHlTdGFydCwgZXNjYXBlZEJyYWNlSW5kaWNlcykge1xuICAgIGlmIChlc2NhcGVkQnJhY2VJbmRpY2VzICE9IG51bGwpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXNjYXBlZEJyYWNlSW5kaWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBib2R5SW5kZXggPSBlc2NhcGVkQnJhY2VJbmRpY2VzW2ldXG4gICAgICAgIGJvZHkgPSByZW1vdmVDaGFyRnJvbVN0cmluZyhib2R5LCBib2R5SW5kZXggLSBib2R5U3RhcnQgLSBpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm9keVxuICB9XG59O1xuXG5jb25zdCByZW1vdmVDaGFyRnJvbVN0cmluZyA9IChzdHIsIGluZGV4KSA9PiBzdHIuc2xpY2UoMCwgaW5kZXgpICsgc3RyLnNsaWNlKGluZGV4ICsgMSlcbiJdfQ==