'use strict';

var fs = require('fs');
var ConfigManager = require('./ConfigManager');

var PhonegapBoilerplate = function(workingDirectory) {

  if (!workingDirectory) {
    throw new Error('Working directory not set');
  }

  this.config = new ConfigManager();
  this.setWorkingDirectory(workingDirectory)

};

PhonegapBoilerplate.prototype = {
  constructor: PhonegapBoilerplate,

  config: null,

  workingDirectory: null,

  setWorkingDirectory: function(workingDirectory) {
    this.workingDirectory = workingDirectory;
    this.config.setWorkingDirectory(workingDirectory);
  },

  /**
   * Check that the cli is used in a phonegap boilerplate project
   * @return {bool} true if we are in a pb project, else otherwise
   */
  checkWorkingDirectory: function() {
  },

  /**
   * verify that the pb remote exists
   */
  checkRemote: function() {
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
