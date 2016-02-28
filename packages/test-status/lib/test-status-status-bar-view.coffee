{View} = require 'atom-space-pen-views'
{CompositeDisposable} = require 'atom'

TestStatusView = require './test-status-view'
CommandRunner  = require './command-runner'

module.exports =
# Internal: A status bar view for the test status icon.
class TestStatusStatusBarView extends View

  # Internal: Initialize test-status status bar view DOM contents.
  @content: ->
    @div click: 'toggleTestStatusView', class: 'inline-block', =>
      @span outlet:  'testStatus', class: 'test-status icon icon-hubot', tabindex: -1, ''

  # Internal: Initialize the status bar view and event handlers.
  initialize: ->
    @testStatusView = new TestStatusView
    @commandRunner = new CommandRunner(@testStatusView)
    @attach()

    @subscriptions = new CompositeDisposable
    @statusBarSub = atom.workspace.observeTextEditors (editor) =>
      @subscriptions.add editor.onDidSave =>
        return unless atom.config.get('test-status.autorun')
        @executeCommand()

    atom.commands.add 'atom-workspace',
      'test-status:run-tests': => @executeCommand()

  # Run the tests
  executeCommand: ->
    @commandRunner.run(@testStatus)

  # Internal: Attach the status bar view to the status bar.
  #
  # Returns nothing.
  attach: ->
    statusBar = document.querySelector('status-bar')

    if statusBar?
      @statusBarTile = statusBar.addLeftTile(item: this, priority: 100)

  # Internal: Detach and destroy the test-status status bar view.
  #
  # Returns nothing.
  destroy: ->
    @testStatusView.destroy()
    @testStatusView = null

    @statusBarSub.dispose()
    @statusBarSub = null

    @subscriptions.dispose()
    @subscriptions = null

    @detach()

  # Internal: Called on click of status bar view
  #
  # Returns nothing
  toggleTestStatusView: ->
    @testStatusView.toggle()
