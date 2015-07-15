'use strict';

var fs = require('fs');
var extend = require('extend');

var ConfigManager = function(workingDirectory) {
  this.setWorkingDirectory(workingDirectory);
};

ConfigManager.prototype = {
  constructor: ConfigManager,
  configFile: 'pb-config.json',
  options: {
    branch: 'master',
  },

  setWorkingDirectory: function(workingDirectory) {
    this.workingDirectory = workingDirectory;
  },

  /**
   * Merge the given options into this.options
   */
  _mergeOptions: function(options) {
    extend(this.options, options);
  },

  getConfigFilePath: function() {
    return this.workingDirectory + '/' + this.configFile;
  },

  /**
   * Set the config file relative path
   * @param {String} configFile path relative to the working directory
   */
  setConfigFile: function(configFile) {
    this.configFile = configFile;
  },

  /**
   * Load the configuration from the config file.
   */
  _loadConfigFromFile: function(done) {

    done = done || function() {};
    var filePath = this.getConfigFilePath();

    // Read from the config file
    fs.open(filePath, 'r', function(err) {
      // If the file doesn't exist, create it
      if (err) {
        done(err);
      // else, read it
      } else {
        var userOptions;
        try {
          userOptions = require(filePath);
          this._mergeOptions(userOptions);
          done(null);
        }
        catch (err) {
          done('Bad config file formatting: ' + err);
        }
      }
    }.bind(this));
  },

  /**
   * Prompt the user, asking for configuration vars
   * @param {function} done Called with the config object when done
   */
  _getConfigFromPrompt: function(done) {
    done = done || function() {};

    var prompt = require('prompt');
    prompt.message = '- ';
    prompt.delimiter = '';

    var schema = [
      {
        name: 'repository',
        default: this.options.repository,
        description: 'Phonegap Boilerlate remote repository:',
      },
      {
        name: 'branch',
        default: this.options.branch,
        description: 'Remote Phonegap Boilerplate branch:',
      },
    ];

    prompt.get(schema, function(err, userConfig) {
      if (err) {
        console.error('\nThe config file has not been created.\n');
        process.exit();
      }
      done(userConfig);
    });
  },

  /**
   * Prompt for config and save options in config file
   */
  _loadConfigFromPromptAndSave: function(done) {
    this._getConfigFromPrompt(function(options) {
      this._mergeOptions(options);
      this._saveConfigFile(done);
    }.bind(this));
  },

  /**
   * Try to load the config file, prompt the user in case of error
   * @param {function} done Called with 'file' if the config is loaded from a
   *                        file, or 'prompt' from the prompt
   */
  loadConfig: function(done) {
    done = done || function() {};

    this._loadConfigFromFile(function(err) {
      if (err) {
        this._loadConfigFromPromptAndSave(function() {
          done('prompt');
        });
      } else {
        done('file');
      }
    }.bind(this));
  },

  /**
   * Prompt the user, asking for configuration vars and save current options.
   */
  reconfigure: function(done) {
    done = done || function() {};

    this._loadConfigFromFile(function() {
      this._loadConfigFromPromptAndSave(done);
    }.bind(this));
  },

  /**
   * Persist current options in the config file
   */
  _saveConfigFile: function(done) {

    var that = this;
    done = done || function() {};

    fs.open(this.getConfigFilePath(), 'w', function(err, fd) {
      if (err) {
        throw err;
      } else {
        var configBuffer = new Buffer(JSON.stringify(that.options, null, '  '));
        fs.write(fd, configBuffer, 0, configBuffer.length, null, function(err) {
          if (err) {
            throw 'Error writing config file: ' + err;
          }

          fs.close(fd, function() {
            console.log('Config file written in: ' + that.getConfigFilePath() + '\n');
            done();
          });
        });
      }
    });
  },

};

module.exports = ConfigManager;
