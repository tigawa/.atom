TestStatusStatusBarView = require './test-status-status-bar-view'

module.exports =
  config:
    autorun:
      type: 'boolean'
      default: true

    timeoutInSeconds:
      type: 'integer'
      default: 60
      minimum: 1
      description: 'Test jobs will be terminated if they run longer than this'

  # Public: Active the package and initialize the test-status views.
  #
  # Returns nothing.
  activate: ->
    createStatusEntry = =>
      @testStatusStatusBar = new TestStatusStatusBarView

      # Run tests once on startup
      if atom.config.get('test-status.autorun')
        @testStatusStatusBar.executeCommand()

    statusBar = document.querySelector('status-bar')

    if statusBar?
      createStatusEntry()
    else
      atom.packages.onDidActivateInitialPackages ->
        createStatusEntry()

  # Public: Deactivate the package and destroy the test-status views.
  #
  # Returns nothing.
  deactivate: ->
    @testStatusStatusBar?.destroy()
    @testStatusStatusBar = null
