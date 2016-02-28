path    = require 'path'
{spawn} = require 'child_process'
{setTimeout, clearTimeout} = require 'timers'

{Emitter} = require 'atom'

glob = require 'glob'

config = require './config'

module.exports =
# Internal: Finds the correct test command to run based on what "file" it can
# find in the project root.
class CommandRunner

  # Internal: Initialize the command runner with the views for rendering the
  # output.
  #
  # @testStatusView - A space-pen view for the test status output element.
  constructor: (@testStatusView) ->
    @emitter = new Emitter
    @timeout = null

  # Internal: Run the test command based on configuration priority.
  #
  # Returns nothing.
  run: (testStatus) ->
    projPath = atom.project.getPaths()[0]
    return unless projPath

    cfg = config.readOrInitConfig()
    cmd = null

    for file in Object.keys(cfg)
      pattern = path.join(projPath, file)
      matches = glob.sync(pattern)

      if matches.length > 0
        cmd = cfg[file]
        break

    return unless cmd
    @execute(cmd, testStatus)

  # Internal: Execute the command and render the output.
  #
  # cmd - A string of the command to run, including arguments.
  #
  # Returns nothing.
  execute: (cmd, testStatus) ->
    return if @running
    @running = true

    testStatus.removeClass('success fail').addClass('pending')

    try
      cwd = atom.project.getPaths()[0]
      proc = spawn("#{process.env.SHELL}", ['-l', '-i', '-c', cmd], cwd: cwd)

      output = ''

      proc.stdout.on 'data', (data) ->
        output += data.toString()

      proc.stderr.on 'data', (data) ->
        output += data.toString()

      proc.on 'exit', (code, signal) =>
        clearTimeout(@timeout) if @timeout?

        output += "\nTerminated by " + signal + "\n" if signal?

        @running = false
        @testStatusView.update(output)

        if code is 0
          @emitter.emit 'test-status:success'
          testStatus.removeClass('pending fail').addClass('success')
        else
          @emitter.emit 'test-status:fail'
          testStatus.removeClass('pending success').addClass('fail')

      clearTimeout(@timeout) if @timeout?
      timeoutInSeconds = atom.config.get('test-status.timeoutInSeconds')
      timeoutInMs = timeoutInSeconds * 1000
      @timeout = setTimeout ->
        output += "\n\nERROR: Timed out after " + timeoutInSeconds + "s\n"
        proc.kill()
      , timeoutInMs
    catch err
      @running = false
      testStatus.removeClass('pending success').addClass('fail')
      @testStatusView.update('An error occured while attempting to run the test command')
