'use strict';

var fs = require('fs');
var extend = require('extend');

var PhonegapBoilerplate = function(workingDirectory) {

  if (!workingDirectory) {
    throw new Error('Working directory not set');
  }

  this.setWorkingDirectory(workingDirectory);
};

PhonegapBoilerplate.prototype = {
  constructor: PhonegapBoilerplate,

  configFile: 'pb-config.json',
  options: {
    repository: 'https://github.com/dorian-marchal/phonegap-boilerplate',
    branch: 'master',
  },

  workingDirectory: null,

  setWorkingDirectory: function(workingDirectory) {
    this.workingDirectory = workingDirectory;
  },

  /**
   * Set the config file path
   * @param {String} configFile path relative to the working directory
   */
  setConfigFile: function(configFile) {
    this.configFile = configFile;
  },

  /**
   * Merge the given options into this.options
   */
  setOptions: function(options) {
    extend(this.options, options);
  },

  /**
   * Load the configuration from the config file.
   * Prompt the user to fill the configuration file if it's missing and save it.
   */
  loadConfig: function(done) {

    var that = this;
    done = done || function() {};

    var filePath = this.workingDirectory + '/' + this.configFile;

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
          that.setOptions(userOptions);
          done();
        }
        catch (err) {
          done('Bad config file formatting: ' + err);
        }
      }
    });
  },

  /**
   * Prompt the user, asking for configuration vars
   * @param {function} done Called with the config object when done
   */
  promptConfig: function(done) {
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
        console.error('\nError: a config file must be created before using pb');
        process.exit();
      }
      done(userConfig);
    });
  },

  /**
   * Persist current options in the config file
   */
  saveOptions: function(done) {

    var that = this;
    done = done || function() {};

    var filePath = this.workingDirectory + '/' + this.configFile;

    fs.open(filePath, 'w', function(err, fd) {
      if (err) {
        throw err;
      } else {
        fs.write(fd, JSON.stringify(that.options, null, '  '), function(err) {
          if (err) {
            throw 'Error writing config file: ' + err;
          }

          fs.close(fd, function() {
            console.log('Config file written in: ' + filePath);
            done();
          });
        });
      }
    });
  },

  /**
   * Prompt the user, asking for configuration vars and save current options.
   */
  promptReconfigure: function(done) {

    var that = this;
    done = done || function() {};

    this.loadConfig(function() {
      that.promptConfig(function(options) {
        that.setOptions(options);
        that.saveOptions(done);
      });
    });

  },

  /**
   * Check that the cli is used in a phonegap boilerplate project
   * @return {bool} true if we are in a pb project, else otherwise
   */
  checkWorkingDirectory: function() {
  },

  /**
   * Fetch from the pb-core remote
   */
  fetch: function() {
  },

  /**
   * Pull from the pb-core remote in the pb-core branch
   */
  update: function() {
  },

  /**
   * Merge the pb-core branch in the current branch
   */
  merge: function() {
  },

  /**
   * Push the current branch on the pb-core remote branch
   */
  push: function() {
  },
};

module.exports = PhonegapBoilerplate;
