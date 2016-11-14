const Rx = require('rxjs/Rx');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const _ = require('lodash');
const rimraf = require('rimraf');

// TODO:
// - on init accept custom file path

exports.set = function(key, value) {
  const writeFileStream = Rx.Observable.bindCallback(fs.writeFile);
  // return save chain
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      // stringify the json object
      value = JSON.stringify(value);
      if (!value) {
        return Rx.Observable.throw(new Error('Invalid data'));
      }
      // save the file to the system
      return writeFileStream(filePath, value);
    });
}

exports.get = function(key) {
  const readFileStream = Rx.Observable.bindCallback(fs.readFile);
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      return readFileStream(filePath, {
        encoding: 'utf8'
      })
    })
    .flatMap(function(res) {
      // Rx.Observable.bindCallback returns an array of the args returned
      // meaning err is res[0] and any other values follow
      if (res[0]) {
        if (res[0].code === 'ENOENT') {
          return Rx.Observable.of(JSON.stringify({}));
        }
        return Rx.Observable.throw('Error reading file.');
      }
      return Rx.Observable.of(res[1]);
    })
    // process JSON object
    .flatMap(function(obj) {
      var objectJSON = {};
      try {
        objectJSON = JSON.parse(obj);
      } catch (err) {
        return Rx.Observable.throw(new Error('Invalid data'));
      }
      return Rx.Observable.of(objectJSON);
    })
}

exports.has = function(key) {
  const hasFileStream = Rx.Observable.bindCallback(fs.stat);
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      return hasFileStream(filePath);
    })
    .flatMap(function(res) {
      // for some reason binding the callback of fs.stat only return an object on error
      // so we have to check to see if it's not an array. If it isn't, there is an error.
      if (!_.isArray(res)) {
        if (res.code === 'ENOENT') {
          // file doen't exist
          return Rx.Observable.of(false);
        }
        // unkown error
        return Rx.Observable.throw(res);
      }
      // file exists
      return Rx.Observable.of(true);
    })
}

exports.remove = function(key) {
  const removeFileStream = Rx.Observable.bindCallback(rimraf);
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      return removeFileStream(filePath);
    })
}

exports.clear = function() {
  const removeFileStream = Rx.Observable.bindCallback(rimraf);
  const userDataPath = utils.getUserDataPath();
  const jsonFiles = path.join(userDataPath, '*.json');
  return removeFileStream(jsonFiles);
}

exports.keys = function() {

}

exports.concurrentGet = function() {
  // forkjoin an array of observable get requests
  return false;
}