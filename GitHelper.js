/**
 * A very naive git helper while waiting for nodegit to be compatible
 * with older versions of glib.
 * It uses the git cli via exec.
 */

'use strict';

var exec = require('child_process').exec;

module.exports = {

  /**
   * @param {Function} done Called with true/false
   */
  localBranchExists: function(localRepositoryPath, branchName, done) {
    done = done || function() {};
    var cd = 'cd "' + localRepositoryPath + '"';
    var showRef = 'git show-ref --verify --quiet "refs/heads/' + branchName + '"';

    exec(cd + ' && ' + showRef, function(err) {
      done(!err);
    });
  },

  /**
   * @param {Function} done Called with true/false
   */
  remoteBranchExists: function(remoteRepositoryPath, branchName, done) {
    done = done || function() {};
    var lsRemote = 'git ls-remote --heads "' + remoteRepositoryPath + '"';
    var grep = 'grep "refs/heads/' + branchName + '$"';

    exec(lsRemote + ' | ' + grep, function(err, stdout) {
      done(!!stdout);
    });
  },

  fetchRemote: function(localRepositoryPath, remoteName, done) {
    done = done || function() {};
    var cd = 'cd "' + localRepositoryPath + '"';
    var fetch = 'git fetch "' + remoteName + '"';

    exec(cd  + ' && ' + fetch, function(err, stdout, stderr) {
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.log(stderr);
      }
      done(err);
    });
  },

  pushBranch: function(localRepositoryPath, localbranchName, remoteName, remoteBranchName, done) {
    done = done || function() {};
    var cd = 'cd "' + localRepositoryPath + '"';
    var push = 'git push "' + remoteName + '" "' + localbranchName + ':' + remoteBranchName + '"';

    exec(cd  + ' && ' + push, function(err, stdout, stderr) {
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.log(stderr);
      }
      done(err);
    });
  },

  /**
   * Check if a repo is in a clean state
   * @param {Function} done Called with true/false
   */
  isRepositoryClean: function(localRepositoryPath, done) {
  },

};
