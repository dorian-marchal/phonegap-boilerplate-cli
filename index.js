'use strict';

var PhonegapBoilerplate = function() {
  this.loadConfig();
};

PhonegapBoilerplate.prototype = {
  constructor: PhonegapBoilerplate,

  options: {
    repository: 'https://github.com/dorian-marchal/phonegap-boilerplate',
    branch: 'master',
  },

  /**
   * Load the configuration from the config file.
   * Prompt the user to fill the configuration file if it's missing.
   */
  loadConfig: function() {
    this.options = require('./pb-config.json');
  },

  /**
   * Check that the cli is used in a phonegap boilerplate project
   * @return {bool} true if we are in a pb project, else otherwise
   */
  checkWorkingDirectory: function() {
  },

  fetch: function() {
  },

  update: function() {
  },

  merge: function() {
  },

  push: function() {
  },
};

module.exports = new PhonegapBoilerplate();
