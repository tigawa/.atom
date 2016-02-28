fs   = require 'fs'
path = require 'path'

cson = require 'season'

# Internal: An object of default key/value file to command mappings.
DEFAULT_MAPPINGS = {
  'script/test':       'script/test'
  'script/cibuild':    'script/cibuild'

  'Makefile':          'make test'

  'test/**/*_test.rb': 'rake test',
  'spec/**/*_spec.rb': 'rake spec',

  'Gruntfile.*':       'grunt test'
  'gulpfile.*':        'gulp test'
  'test/mocha.opts':   'mocha'

  'deft-package.json': 'deft test'

  '*_test.go':         'go test -v .'

  'phpunit.xml':       'phpunit'

  'setup.py':          'python setup.py test'

  'Cargo.toml':        'cargo test'

  'package.json':      'npm test'
}

module.exports =
  # Public: Read or initialise a new test-status.cson configuration file.
  # The file is created in the Atom configuration directory.
  #
  # Returns an object of key/value file to command mappings.
  readOrInitConfig: ->
    fn = path.join(atom.config.configDirPath, 'test-status.cson')

    if fs.existsSync(fn)
      cson.readFileSync(fn)
    else
      cson.writeFileSync(fn, DEFAULT_MAPPINGS)
      DEFAULT_MAPPINGS
