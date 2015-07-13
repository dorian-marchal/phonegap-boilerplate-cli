'use strict';

var fs = require('fs');
var async = require('async');
var ConfigManager = require('./ConfigManager');

var PhonegapBoilerplate = function(workingDirectory) {

  if (!workingDirectory) {
    throw new Error('Working directory not set');
  }

  this.config = new ConfigManager();
  this.setWorkingDirectory(workingDirectory);

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
   * These points are checked :
   * - presence of '/config.xml'
   * - presence of a 'pb-core' branch pointing to the configured remote branch
   * - presence of a '/.cordova' directory
   * - presence of a '/www/cordova.js' file
   * @param {function} done Called with err if we are not in a pb project
   */
  checkWorkingDirectory: function(doneChecking) {

    var that = this;
    doneChecking = doneChecking || function() {};

    var checks = {
      '/config.xml': function(done) {
        that.checkPath(that.workingDirectory + '/config.xml', 'file', done);
      },
      'pb-core': function(done) {
        done();
      },
      '/.cordova': function(done) {
        that.checkPath(that.workingDirectory + '/.cordova', 'directory', done);
      },
      '/www/cordova.js': function(done) {
        that.checkPath(that.workingDirectory + '/www/cordova.js', 'file', done);
      },
    };

    async.parallel(checks, function(err) {
      if (err) {
        doneChecking(err);
      } else {
        doneChecking();
      }
    });
  },

  /**
   * Test if a path exists and is a file or a directory
   * @param {function} done Called with a potential error in parameter
   */
  checkPath: function(path, type, done) {
    try {
      var stats = fs.lstatSync(path);
      if ((type === 'directory' && stats.isDirectory()) ||
          (type === 'file' && stats.isFile())) {
        done();
      } else {
        done(path + ' is not a ' + type + '.');
      }
    }
    catch (err) {
      done(err);
    }
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
    this.checkWorkingDirectory();
  },

  /**
   * Pull from the pb-core remote in the pb-core branch
   */
  update: function() {
    this.checkWorkingDirectory();
  },

  /**
   * Merge the pb-core branch in the current branch
   */
  merge: function() {
    this.checkWorkingDirectory();
  },

  /**
   * Push the current branch on the pb-core remote branch
   */
  push: function() {
    this.checkWorkingDirectory();
  },
};

module.exports = PhonegapBoilerplate;
