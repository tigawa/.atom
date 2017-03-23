(function() {
  var MergeState;

  MergeState = (function() {
    function MergeState(conflicts, context1, isRebase) {
      this.conflicts = conflicts;
      this.context = context1;
      this.isRebase = isRebase;
    }

    MergeState.prototype.conflictPaths = function() {
      var c, i, len, ref, results;
      ref = this.conflicts;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        c = ref[i];
        results.push(c.path);
      }
      return results;
    };

    MergeState.prototype.reread = function() {
      return this.context.readConflicts().then((function(_this) {
        return function(conflicts) {
          _this.conflicts = conflicts;
        };
      })(this));
    };

    MergeState.prototype.isEmpty = function() {
      return this.conflicts.length === 0;
    };

    MergeState.prototype.relativize = function(filePath) {
      return this.context.workingDirectory.relativize(filePath);
    };

    MergeState.prototype.join = function(relativePath) {
      return this.context.joinPath(relativePath);
    };

    MergeState.read = function(context) {
      var isr;
      isr = context.isRebasing();
      return context.readConflicts().then(function(cs) {
        return new MergeState(cs, context, isr);
      });
    };

    return MergeState;

  })();

  module.exports = {
    MergeState: MergeState
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL21lcmdlLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQU07SUFFUyxvQkFBQyxTQUFELEVBQWEsUUFBYixFQUF1QixRQUF2QjtNQUFDLElBQUMsQ0FBQSxZQUFEO01BQVksSUFBQyxDQUFBLFVBQUQ7TUFBVSxJQUFDLENBQUEsV0FBRDtJQUF2Qjs7eUJBRWIsYUFBQSxHQUFlLFNBQUE7QUFBRyxVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFBQSxDQUFDLENBQUM7QUFBRjs7SUFBSDs7eUJBRWYsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQSxDQUF3QixDQUFDLElBQXpCLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO1VBQUMsS0FBQyxDQUFBLFlBQUQ7UUFBRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFETTs7eUJBR1IsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsS0FBcUI7SUFBeEI7O3lCQUVULFVBQUEsR0FBWSxTQUFDLFFBQUQ7YUFBYyxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQTFCLENBQXFDLFFBQXJDO0lBQWQ7O3lCQUVaLElBQUEsR0FBTSxTQUFDLFlBQUQ7YUFBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULENBQWtCLFlBQWxCO0lBQWxCOztJQUVOLFVBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxPQUFEO0FBQ0wsVUFBQTtNQUFBLEdBQUEsR0FBTSxPQUFPLENBQUMsVUFBUixDQUFBO2FBQ04sT0FBTyxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLElBQXhCLENBQTZCLFNBQUMsRUFBRDtlQUN2QixJQUFBLFVBQUEsQ0FBVyxFQUFYLEVBQWUsT0FBZixFQUF3QixHQUF4QjtNQUR1QixDQUE3QjtJQUZLOzs7Ozs7RUFLVCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsVUFBQSxFQUFZLFVBQVo7O0FBckJGIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWVyZ2VTdGF0ZVxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbmZsaWN0cywgQGNvbnRleHQsIEBpc1JlYmFzZSkgLT5cblxuICBjb25mbGljdFBhdGhzOiAtPiBjLnBhdGggZm9yIGMgaW4gQGNvbmZsaWN0c1xuXG4gIHJlcmVhZDogLT5cbiAgICBAY29udGV4dC5yZWFkQ29uZmxpY3RzKCkudGhlbiAoQGNvbmZsaWN0cykgPT5cblxuICBpc0VtcHR5OiAtPiBAY29uZmxpY3RzLmxlbmd0aCBpcyAwXG5cbiAgcmVsYXRpdml6ZTogKGZpbGVQYXRoKSAtPiBAY29udGV4dC53b3JraW5nRGlyZWN0b3J5LnJlbGF0aXZpemUgZmlsZVBhdGhcblxuICBqb2luOiAocmVsYXRpdmVQYXRoKSAtPiBAY29udGV4dC5qb2luUGF0aChyZWxhdGl2ZVBhdGgpXG5cbiAgQHJlYWQ6IChjb250ZXh0KSAtPlxuICAgIGlzciA9IGNvbnRleHQuaXNSZWJhc2luZygpXG4gICAgY29udGV4dC5yZWFkQ29uZmxpY3RzKCkudGhlbiAoY3MpIC0+XG4gICAgICBuZXcgTWVyZ2VTdGF0ZShjcywgY29udGV4dCwgaXNyKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIE1lcmdlU3RhdGU6IE1lcmdlU3RhdGVcbiJdfQ==
