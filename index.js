'use strict';

var options = {
  repository: 'https://github.com/dorian-marchal/phonegap-boilerplate',
  branch: 'master',
};

/**
 * Check that the cli is used in a phonegap boilerplate project
 * @return {bool} true if we are in a pb project, else otherwise
 */
var checkWorkingDirectory = function() {

};

/**
 * Load the configuration from the config file.
 * Prompt the user to fill the configuration file if it's missing.
 */
var loadConfig = function() {
  var config = require('./config.json');
};

module.exports = {
  fetch: function() {
    loadConfig();
  },
  update: function() {

  },
  merge: function() {

  },
  push: function() {

  },
};
