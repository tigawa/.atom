Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showError = showError;
function showError(title, description, points) {
  const renderedPoints = points.map(item => `  • ${item}`);
  atom.notifications.addWarning(`[Linter] ${title}`, {
    dismissable: true,
    detail: `${description}\n${renderedPoints.join('\n')}`
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOlsic2hvd0Vycm9yIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsInBvaW50cyIsInJlbmRlcmVkUG9pbnRzIiwibWFwIiwiaXRlbSIsImF0b20iLCJub3RpZmljYXRpb25zIiwiYWRkV2FybmluZyIsImRpc21pc3NhYmxlIiwiZGV0YWlsIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7O1FBRWdCQSxTLEdBQUFBLFM7QUFBVCxTQUFTQSxTQUFULENBQW1CQyxLQUFuQixFQUFrQ0MsV0FBbEMsRUFBdURDLE1BQXZELEVBQThFO0FBQ25GLFFBQU1DLGlCQUFpQkQsT0FBT0UsR0FBUCxDQUFXQyxRQUFTLE9BQU1BLElBQUssRUFBL0IsQ0FBdkI7QUFDQUMsT0FBS0MsYUFBTCxDQUFtQkMsVUFBbkIsQ0FBK0IsWUFBV1IsS0FBTSxFQUFoRCxFQUFtRDtBQUNqRFMsaUJBQWEsSUFEb0M7QUFFakRDLFlBQVMsR0FBRVQsV0FBWSxLQUFJRSxlQUFlUSxJQUFmLENBQW9CLElBQXBCLENBQTBCO0FBRkosR0FBbkQ7QUFJRCIsImZpbGUiOiJoZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvcih0aXRsZTogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nLCBwb2ludHM6IEFycmF5PHN0cmluZz4pIHtcbiAgY29uc3QgcmVuZGVyZWRQb2ludHMgPSBwb2ludHMubWFwKGl0ZW0gPT4gYCAg4oCiICR7aXRlbX1gKVxuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhgW0xpbnRlcl0gJHt0aXRsZX1gLCB7XG4gICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgZGV0YWlsOiBgJHtkZXNjcmlwdGlvbn1cXG4ke3JlbmRlcmVkUG9pbnRzLmpvaW4oJ1xcbicpfWAsXG4gIH0pXG59XG4iXX0=