'use strict';

const Rx = require('rxjs/Rx');
const _ = require('lodash');
const path = require('path');

// logic for switching beteen node and electron
// apply electron path if found installed
var electron, app, dataPath;
try {
  electron = require('electron');
  app = electron.app || electron.remote.app;
  dataPath = app.getPath('userData');
} catch (e) {
  dataPath = path.join(__dirname, '../../../');
}

/**
 * @summary Get user data directory path
 * @function
 * @public
 *
 * @returns {Strings} current read/write path
 *
 * var userDataPath = utils.getUserDataPath();
 * console.log(userDataPath);
 */
exports.getUserDataPath = function() {
  return dataPath;
};

/**
 * @summary Change the default read/write path
 * @function
 * @public
 *
 * @param {String} directory - directory to change to
 * @param {Boolean} [replace=false] - completely replace the directory or not
 *
 * @example
 * var changePath = utils.changePath;
 * changePath('./foo', false);
 */
exports.changePath = function(directory, replace) {
  if (!replace) { replace = false; }
  if (typeof directory !== 'string') {
    throw new Error('Directory is not a string');
  }
  if (replace) {
    // simply replace the default path
    userData = path.join(directory);
  } else {
    // append new path the the root directory
    path.join(userData, directory);
  }
};

/**
 * @summary Return current abolute path with KEY.json appended
 * @function
 * @public
 *
 * @param {key} key - key
 * @returns {Observable<String>} absolute file path
 *
 * @example
 * var changePath = utils.changePath;
 * changePath('./foo', false);
 */
exports.getFilePath = function(key) {
  // throw error if no key
  if (!key) {
    return Rx.Observable.throw(new Error('Missing key.'));
  }
  // next check if the key is a valid string
  if (!_.isString(key) || key.trim().length === 0) {
    return Rx.Observable.throw(new Error('Invalid key'));
  }
  // Trick to prevent adding the `.json` twice
  // if the key already contains it.
  var keyFileName = path.basename(key, '.json') + '.json';

  // Prevent ENOENT and other similar errors when using
  // reserved characters in Windows filenames.
  // See: https://en.wikipedia.org/wiki/Filename#Reserved%5Fcharacters%5Fand%5Fwords
  var escapedFileName = encodeURIComponent(keyFileName);

  var fileNamePath = path.join(exports.getUserDataPath(), escapedFileName);
  // return observable of the filepath
  return Rx.Observable.of(fileNamePath);
};