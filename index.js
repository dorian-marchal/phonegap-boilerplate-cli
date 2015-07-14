'use strict';

var fs = require('fs');
var async = require('async');
var ConfigManager = require('./ConfigManager');
var Git = require('./GitHelper');
var chalk = require('chalk');
var prompt = require('prompt');
prompt.message = '- ';
prompt.delimiter = '';

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
        Git.localBranchExists(that.workingDirectory, 'pb-core', function(exists) {
          done(exists ? null : 'The `pb-core` branch doesn\'t exist.');
        });
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
        done('`' + path + '` is not a ' + type + '.');
      }
    }
    catch (err) {
      done(err);
    }
  },

  /**
   * verify that the pb remote branch exists
   */
  checkRemote: function(done) {
    Git.remoteBranchExists(this.config.options.repository, this.config.options.branch,
      function(exists) {
        done(exists);
      }
    );
  },

  loadAndCheckConfig: function(done) {
    var that = this;
    done = done || function() {};

    this.config.loadConfig(function(err) {
      if (err) {
        console.error('Error: loading config: ' + err);
        process.exit();
      }
      that.checkWorkingDirectory(function(err) {
        if (err) {
          console.error(chalk.red('Not in a Phonegap Boilerlate project: ') + err);
          process.exit();
        }
        that.checkRemote(function(exists) {
          if (!exists) {
            console.error('Error: The remote branch does not exist: ' +
                this.config.options.repository + '(' + this.config.options.branch + ')');
            process.exit();
          }
          done();
        });
      });
    });
  },

  /**
   * Fetch from the pb-core remote
   */
  fetch: function() {
    this.loadAndCheckConfig(function() {
      console.log(chalk.blue('Fetching `pb-core` remote...'));
      Git.fetchRemote(this.workingDirectory, 'pb-core', function(err) {
        if (err) {
          console.error(err.message);
        }
      });
    }.bind(this));
  },

  /**
   * Pull from the pb-core remote in the pb-core branch
   */
  update: function() {
    var that = this;

    this.loadAndCheckConfig(function() {
      Git.getCurrentBranch(that.workingDirectory, function(branchName) {
        // test if we are on `pb-core` branch
        if (branchName !== 'pb-core') {
          console.log(chalk.red('Error: Not on branch `pb-core`.'));
          process.exit();
        }

        console.log(chalk.blue('Pulling `pb-core/' + that.config.options.branch + '`...'));

        // Create a backup tag
        Git.git('tag pb-backup-before-update');

        var revertAndExit = function() {
          console.log(chalk.blue('\nReverting changes...'));
          // Revert to the backup tag
          Git.git('reset --hard pb-backup-before-update');
          Git.git('tag -d pb-backup-before-update');
          console.log('Update aborted.');
          process.exit();
        };

        // Pull the modifications
        try {
          Git.git('pull --rebase pb-core ' + that.config.options.branch);
        } catch (err) {
          console.error(chalk.red(err.message));
          revertAndExit();
        }

        var schema = [{
          name: 'push',
          default: 'Y/n',
          description: '\nEverything went well ? Push on `origin` ?',
        }];
        //
        prompt.get(schema, function(err, res) {
          if (!res || res.push.toLowerCase() === 'n' || res.push.toLowerCase() === 'no') {
            revertAndExit();
          } else {
            console.log(chalk.blue('\nPushing `pb-core` on `origin/pb-core`...'));
            try {
              Git.git('push origin pb-core');
            } catch (err) {
              revertAndExit();
            }
          }
          // Remove the backup tag
          Git.git('tag -d pb-backup-before-update');
        });
      });
    });
  },

  /**
   * Merge the pb-core branch in the current branch
   */
  merge: function() {
    var that = this;

    this.loadAndCheckConfig(function() {

      Git.getCurrentBranch(that.workingDirectory, function(branchName) {
        var schema = [{
          name: 'merge',
          default: 'y/N',
          description: 'Merge `pb-core` on `' + branchName + '` ?',
        }];

        prompt.get(schema, function(err, res) {
          if (!res || res.merge.toLowerCase() !== 'y') {
            console.log('Merge aborted.');
          } else {
            console.log(chalk.blue('Merging `pb-core` on `' + branchName + '`...'));
            Git.mergeBranch(that.workingDirectory, 'pb-core');
          }
        });
      });
    });
  },

  /**
   * Push the current branch on the pb-core remote branch
   */
  push: function() {
    var that = this;

    this.loadAndCheckConfig(function() {
      console.log(chalk.blue('Pushing `pb-core` on `pb-core:dev`...'));
      Git.pushBranch(that.workingDirectory, 'pb-core', 'pb-core', that.config.options.branch,
          function(err) {
            if (!err) {
              console.log(chalk.blue('Pushing `pb-core` on `origin:pb-core`...'));
              Git.pushBranch(that.workingDirectory, 'pb-core', 'origin', 'pb-core');
            }
          }
      );
    });
  },

  /**
   * Prompt for creating pb-config.json file
   */
  reconfigure: function() {
    this.config.reconfigure();
  },
};

module.exports = PhonegapBoilerplate;