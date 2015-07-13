/**
 * A very naive git helper while waiting for nodegit to be compatible
 * with older versions of glib.
 * It uses the git cli via exec.
 */

'use strict';

var exec = require('child_process').exec;

module.exports = {

  /**
   * @param {Function} callback Called with true/false
   */
  localBranchExists: function(localRepositoryPath, branchName, callback) {
    var cd = 'cd "' + localRepositoryPath + '"';
    var showRef = 'git show-ref --verify --quiet "refs/heads/' + branchName + '"';

    exec(cd + ' && ' + showRef, function(err) {
      callback(!err);
    });
  },
};
