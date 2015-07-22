'use strict';

var fs = require('fs');
var async = require('async');
var extend = require('extend');
var ConfigManager = require('./ConfigManager');
var Git = require('./GitHelper');
var chalk = require('chalk');
var prompt = require('prompt');
var execSync = require('child_process').execSync;
prompt.message = '- ';
prompt.delimiter = '';

var defaultClientRepo = 'https://github.com/dorian-marchal/phonegap-boilerplate';
var defaultServerRepo = 'https://github.com/dorian-marchal/phonegap-boilerplate-server';

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
  projectType: null, // 'client' or 'server'

  setWorkingDirectory: function(workingDirectory) {
    this.workingDirectory = workingDirectory;
    this.config.setWorkingDirectory(workingDirectory);
  },

  /**
   * Check that the cli is used in a phonegap boilerplate client project
   * These points are checked :
   *   - presence of '/config.xml'
   *   - presence of a '/www/cordova.js' file
   *   - presence of a '/.cordova' directory
   *   - presence of a 'pb-core' branch pointing to the configured remote branch
   * @param {function} done Called with err if we are not in a pb project
   */
  checkClientWorkingDirectory: function(doneChecking) {
    var that = this;
    doneChecking = doneChecking || function() {};

    var checks = {
      '/config.xml': function(done) {
        that.checkPath(that.workingDirectory + '/config.xml', 'file', done);
      },
      '/www/cordova.js': function(done) {
        that.checkPath(that.workingDirectory + '/www/cordova.js', 'file', done);
      },
      '/.cordova': function(done) {
        that.checkPath(that.workingDirectory + '/.cordova', 'directory', done);
      },
      'pb-core': function(done) {
        Git.localBranchExists(that.workingDirectory, 'pb-core', function(exists) {
          done(exists ? null : 'The `pb-core` branch doesn\'t exist.');
        });
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
   * Check that the cli is used in a phonegap boilerplate server project
   * These points are checked :
   *   - presence of '/core/RestServer.js'
   *   - presence of '/core/server_modules'
   *   - presence of a 'pb-core' branch pointing to the configured remote branch
   * @param {function} done Called with err if we are not in a pb project
   */
  checkServerWorkingDirectory: function(doneChecking) {
    var that = this;
    doneChecking = doneChecking || function() {};

    var checks = {
      '/version.json': function(done) {
        that.checkPath(that.workingDirectory + '/version.json', 'file', done);
      },
      '/core/RestServer.js': function(done) {
        that.checkPath(that.workingDirectory + '/core/RestServer.js', 'file', done);
      },
      '/core/server_modules': function(done) {
        that.checkPath(that.workingDirectory + '/core/server_modules', 'directory', done);
      },
      'pb-core': function(done) {
        Git.localBranchExists(that.workingDirectory, 'pb-core', function(exists) {
          done(exists ? null : 'The `pb-core` branch doesn\'t exist.');
        });
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
   * Check that the cli is used in a phonegap boilerplate project
   * @param {function} doneChecking (err, type) where type = 'client' | 'server'
   */
  checkWorkingDirectory: function(doneChecking) {

    var that = this;
    doneChecking = doneChecking || function() {};

    this.checkClientWorkingDirectory(function(errClient) {
      if (errClient) {
        that.checkServerWorkingDirectory(function(errServer) {
          if (errServer) {
            doneChecking(
              '\nNot on a client project: ' + errClient +
              '\nNor on a server project: ' + errServer
            );
          } else {
            doneChecking(null, 'server');
          }
        });
      } else {
        doneChecking(null, 'client');
      }
    });
  },

  /**
   * Test if a path exists and is a file or a directory
   * @param {function} done Called with a potential error in parameter
   */
  checkPath: function(path, type, done) {
    type = type || '';
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

    this.checkWorkingDirectory(function(err, projectType) {
      if (err) {
        console.error(chalk.red('Not in a Phonegap Boilerlate project: ') + err);
        process.exit();
      }

      // If in a Phonegap Boilerplate project, set default options
      that.projectType = projectType;
      if (projectType === 'client') {
        that.config.mergeOptions({
          repository: defaultClientRepo,
        });
      } else if (projectType === 'server') {
        that.config.mergeOptions({
          repository: defaultServerRepo,
        });
      }

      that.config.loadConfig(function(type) {
        // If the config is loaded from the prompt, check its validity
        if (type === 'prompt') {
          console.log(chalk.blue('Verifying remote...'));
          that.checkRemote(function(exists) {
            if (!exists) {
              console.error(chalk.red('Error: The remote branch does not exist: ') +
                  '`' + that.config.options.branch + '` on ' + that.config.options.repository);
              process.exit();
            }
            done();
          });
        } else {
          done();
        }
      });
    });
  },

  /**
   * Prompt the user for new project infos
   */
  createProjectPrompt: function(done) {

    done = done || function() {};
    var options = {};

    prompt.get(
      {
        name: 'type',
        default: 'client',
        description: 'Type of repository (client|server):',
        conform: function(type) {
          return type === 'client' || type === 'server';
        }
      },
      function(err, resType) {
        if (err) {
          return done(err);
        }

        extend(options, resType);

        var schema = [
          {
            name: 'directoryName',
            description: 'Directory name for the ' + resType.type + ':',
            required: true,
          },
          {
            name: 'pbRepository',
            default: resType.type === 'client' ? defaultClientRepo : defaultServerRepo,
            description: 'Phonegap Boilerplate repository:',
          },
          {
            name: 'pbBranch',
            default: 'master',
            description: 'Phonegap Boilerplate branch ?',
          },
          {
            name: 'existingRepository',
            default: false,
            type: 'boolean',
            description: 'Clone the project from an existing ' + chalk.bold('empty') +
                ' repository ? (if not, it will be created)',
          },
        ];

        prompt.get(schema, function(err, resProject) {
          if (err) {
            return done(err);
          }

          extend(options, resProject);

          if (resProject.existingRepository) {
            prompt.get(
              {
                name: 'projectRepository',
                required: true,
                description: 'Project repository:',
              },
              function(err, resProjectRepo) {
                if (err) {
                  return done(err);
                }

                extend(options, resProjectRepo);

                done(null, options);
              }
            );
          } else {
            done(null, options);
          }
        });
      }
    );
  },

  /**
   * Create a new project
   */
  create: function() {
    var that = this;

    // Prompt user for project config
    this.createProjectPrompt(function(err, projectOptions) {
      if (err) {
        console.log('\nProject creation aborted');
        process.exit();
      }

      var createRepo = function() {
        if (projectOptions.existingRepository) {
          console.log(chalk.blue('\nCloning project repository...'));
          Git.git('clone ' + projectOptions.projectRepository + ' ' +
              projectOptions.directoryName);
          process.chdir(projectOptions.directoryName);
        } else {
          console.log(chalk.blue('\nCreating project repository...'));
          fs.mkdirSync(that.workingDirectory + '/' + projectOptions.directoryName);
          process.chdir(projectOptions.directoryName);
          Git.git('init');
        }
        that.setWorkingDirectory(that.workingDirectory + '/' + projectOptions.directoryName);
      };

      try {
        // Create an empty repo for the project
        createRepo();

        console.log(chalk.blue('\nFirst commit...'));
        Git.git('commit --allow-empty -m "First commit"');

        // Backup the current branch
        Git.getCurrentBranch(process.cwd(), function(err, defaultProjectBranch) {
          if (err) {
            throw err;
          }

          console.log(chalk.blue('\nAdding `pb-core` remote and branch...'));
          Git.git('remote add pb-core "' + projectOptions.pbRepository + '"');
          Git.git('checkout -b pb-core');

          console.log(chalk.blue('\nPulling `pb-core`...'));
          Git.git('pull --rebase pb-core ' + projectOptions.pbBranch);
          Git.git('checkout ' + defaultProjectBranch);
          Git.git('merge --no-ff pb-core -m "Use Phonegap Boilerplate"');

          console.log(chalk.blue('\nLoading submodules...'));
          Git.git('submodule init');
          Git.git('submodule update');

          console.log(chalk.blue('\nInstalling environment...'));
          execSync('make install');

          console.log(chalk.blue('\nCreating config files...'));
          // pb config
          that.config.mergeOptions({
            repository: projectOptions.pbRepository,
            branch: projectOptions.pbBranch,
          });

          that.config.saveConfigFile(function() {
            // Project config
            var configFile;
            if (projectOptions.type === 'client') {
              execSync('cp www/js/config.js.default www/js/config.js');
              configFile = 'www/js/config.js';
            } else {
              execSync('cp config.js.default config.js');
              configFile = 'config.js';
            }
            console.log('Don\'t forget to update the config file: ' + configFile);
          });
        });
      }
      catch (err) {
        console.log(chalk.red('Error creating the repository: '));
        throw err;
      }
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
      Git.getCurrentBranch(that.workingDirectory, function(err, branchName) {
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

      Git.getCurrentBranch(that.workingDirectory, function(err, branchName) {

        if (err) {
          throw err;
        }
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

  /**
   * Return the version number
   */
  getVersion: function() {
    var packageData = require('./package.json');
    return packageData.version;
  },
};

module.exports = PhonegapBoilerplate;
