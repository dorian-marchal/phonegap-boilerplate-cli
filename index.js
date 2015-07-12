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

  options: {
    configFile: 'pb-config.json',
    repository: 'https://github.com/dorian-marchal/phonegap-boilerplate',
    branch: 'master',
  },

  workingDirectory: null,

  setWorkingDirectory: function(workingDirectory) {
    this.workingDirectory = workingDirectory;
  },

  /**
   * Merge the given options into this.options
   */
  setOptions: function(options) {
    extend(this.options, options);
  },

  /**
   * Load the configuration from the config file.
   * Prompt the user to fill the configuration file if it's missing.
   */
  loadConfig: function(done) {

    var that = this;
    done = done || function() {};

    var filePath = this.workingDirectory + '/' + this.options.configFile;

    // Read from the config file
    fs.open(filePath, 'r', function(err) {
      // If the file doesn't exist, create it
      if (err) {
        that.promptConfig(function(options) {
          that.setOptions(options);
          that.saveOptions();
          done();
        });
      // else, read it
      } else {
        var userOptions;
        try {
          userOptions = require(filePath);
          that.setOptions(userOptions);
          done();
        }
        catch (err) {
          throw err;
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
    done({});
  },

  /**
   * Persist current options in the config file
   */
  saveOptions: function(done) {
    done = done || function() {};

    var filePath = this.workingDirectory + '/' + this.options.configFile;

    fs.open(filePath, 'w', function(err) {
      if (err) {
        throw err;
      } else {
        done();
      }
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
