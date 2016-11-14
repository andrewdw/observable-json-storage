const Rx = require('rxjs/Rx');
const fs = require('fs');
const _ = require('lodash');
const utils = require('./utils');

// TODO:
// - on init accept custom file path

exports.set = function(key, value) {
  // save the value in observable format
  var writeFileObservable = Rx.Observable.bindCallback(fs.writeFile);
  // return save chain
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      // stringify the json object
      value = JSON.stringify(value);
      if (!value) {
        return Rx.Observable.throw(new Error('Invalid JSON data'));
      }
      // save the file to the system
      return writeFileObservable(filePath, value);
    });
}

exports.get = function(key) {
  var readFileObservable = Rx.Observable.bindCallback(fs.readFile);
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      return readFileObservable(filePath, {
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

exports.has = function(has) {
  return false;
}
exports.remove = function(key) {
  return false;
}
exports.clear = function() {
  return false;

}
exports.concurrentGet = function() {
  // forkjoin an array of observable get requests
  return false;
}