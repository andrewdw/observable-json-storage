'use strict';

const Rx = require('rxjs/Rx');
const _ = require('lodash');
const path = require('path');
const electron = require('electron');
const app = electron.app || electron.remote.app;
const userData = app.getPath('userData');

/**
 * @summary Get user data directory path
 * @function
 * @public
 *
 * @returns {Strings} user data path
 *
 * let userDataPath = utils.getUserDataPath();
 * console.log(userDataPath);
 */
exports.getUserDataPath = function() {
  return userData;
};

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
}