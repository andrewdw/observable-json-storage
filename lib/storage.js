'use strict';

/**
 * @module storage
 */

const Rx = require('rxjs/Rx');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const _ = require('lodash');
const rimraf = require('rimraf');

/**
 * @summary Change the default read/write path
 * @function
 * @public
 *
 * @description
 * If running in Node, the default directory will be set to the project's
 * root folder.
 *
 * If running in Electron, it will be the app's default `userData` location.
 *
 * By default, `directory` will be appended relative to the default storage location.
 * Passing `true` to `replace` will overwrite the default directory completely.
 *
 * @param {String} directory - directory to change to
 * @param {Boolean} [replace=false] - completely replace the directory or not
 *
 * @example
 * const storage = require('observable-json-storage');
 * // setting path "foo" relative to app's default storage location
 * storage.setPath('./foo'); /DEFAULT/PATH/TO/APP/STORAGE/foo
 *
 * @example
 * const storage = require('observable-json-storage');
 * // completely replace absolute path with Node's root directory
 * storage.setPath(__dirname); // /PATH/TO/NODE/APP
 *
 * @example
 * const storage = require('observable-json-storage');
 * // completely replace absolute path with anything
 * storage.setPath('/new/path/to/anything'); // /new/path/to/anything
 */

exports.setPath = function(directory, replace) {
  return utils.changePath(directory, replace);
};

/**
 * @summary Return current read/write path
 * @function
 * @public
 *
 * @returns {String} current read/write path
 *
 * @example
 * const storage = require('observable-json-storage');
 * var currentStoragePath = storage.getPath();
 * console.log(currentStoragePath)
 */
exports.getPath = function() {
  return utils.getUserDataPath();
};

/**
 * @summary Write JSON data
 * @function
 * @public
 *
 * @param {String} key - key
 * @param {Object} value - JSON object
 *
 * @example
 * const storage = require('observable-json-storage');
 *
 * storage.set('foobar', { foo: 'bar' }).subscribe(
 *   function(){
 *     console.log('successful save');
 *   },
 *   function(error) {
 *     console.log(error)
 *   }
 * )
 *
 * @example <caption>Shortened.</caption>
 * const storage = require('observable-json-storage');
 * storage.set('foobar', { foo: 'bar' }).subscribe().catch((function(err){ console.log(err) }));
 */
exports.set = function(key, value) {
  const writeFileStream = Rx.Observable.bindCallback(fs.writeFile);
  // return save chain
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      // stringify the json object
      value = JSON.stringify(value);
      if (!value) {
        return Rx.Observable.throw(new Error('Error saving data'));
      }
      // save the file to the system
      return writeFileStream(filePath, value);
    });
};

/**
 * @summary Read JSON data
 * @function
 * @public
 *
 * @description
 * If the key(.json) doesn't exist in the directory, an `false` is returned.
 * Also notice that the `.json` extension is added automatically, but it's
 * ignored if you pass it yourself.
 *
 * Passing an extension other than `.json` will result in a file created
 * with both extensions. For example, the key `foo.data` will result in a file
 * called `foo.data.json`.
 *
 * @param {String} key - key
 *
 * @returns {Observable<Object|Boolean>}
 *
 * @example
 * const storage = require('observable-json-storage');
 *
 * storage.get('foobar').subscribe(
 *   function(data) {
 *     if (!data) { console.log(`Foobar does not exist`); return; }
 *     console.log(data);
 *   },
 *   function(error) {
 *     console.log(error);
 *   }
 * )
 */
exports.get = function(key) {
  const readFileStream = Rx.Observable.bindCallback(fs.readFile);
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      return readFileStream(filePath, {
        encoding: 'utf8'
      });
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
      var objectJSON;
      try {
        objectJSON = JSON.parse(obj);
      } catch (err) {
        return Rx.Observable.of(false);
      }
      return Rx.Observable.of(objectJSON);
    });
};

/**
 * @summary Check if a key exists
 * @function
 * @public
 *
 * @param {String} key - key
 *
 * @returns {Observable<Boolean>} returns `true` or `false` if the key exists or doesn't
 *
 * @example
 * const storage = require('observable-json-storage');
 *
 * storage.has('foobar').subscribe(
 *   function(hasKey) {
 *      console.log(hasKey);
 *   },
 *   function(error) {
 *      console.log(error);
 *   }
 * )
 */
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
    });
};

/**
 * @summary Get the list of saved keys
 * @function
 * @public
 *
 * @example
 * const storage = require('observable-json-storage');
 *
 * storage.keys().subscribe(
 *   function(keys) {
 *     console.log(keys);
 *   },
 *   function(error) {
 *     console.log(error);
 *   }
 * )
 */
exports.keys = function() {
  const readFilesStream = Rx.Observable.bindCallback(fs.readdir);
  const userDataPath = utils.getUserDataPath();
  return readFilesStream(userDataPath)
    .concatMap(function(res) {
      if (res[0]) {
        return Rx.Observable.throw(new Error('Error fetching keys'));
      }
      return Rx.Observable.of(res[1]);
    })
    .map(function(fileNames) {
      return fileNames.filter(function(name) {
        // find files that end in .json
        return _.endsWith(name, '.json');
      }).map(function(keys) {
        // strip the json from the filenames
        return path.basename(keys, '.json');
      });
    });
};

/**
 * @summary Remove a key
 * @function
 * @public
 *
 * @description
 * Notice this function does nothing, nor throws any error
 * if the key doesn't exist.
 *
 * @param {String} key - key
 *
 * @example
 * const storage = require('observable-json-storage');
 *
 * storage.remove(key).subscribe(
 *   function() {
 *     console.log('removed');
 *   },
 *   function(error) {
 *     console.log(error);
 *   }
 * )
 *
 * @example <caption>Shortened.</caption>
 * const storage = require('observable-json-storage');
 * storage.remove('foobar').subscribe().catch((function(err){ console.log(err) }));
 */
exports.remove = function(key) {
  const removeFileStream = Rx.Observable.bindCallback(rimraf);
  return utils.getFilePath(key)
    .concatMap(function(filePath) {
      return removeFileStream(filePath);
    });
};

/**
 * @summary Clear all stored JSON data
 * @function
 * @public
 *
 * @example
 * const storage = require('observable-json-storage');
 *
* storage.clear(key).subscribe(
 *   function() {
 *     console.log('cleared');
 *   },
 *   function(error) {
 *     console.log(error);
 *   }
 * )
 *
 * @example <caption>Shortened.</caption>
 * const storage = require('observable-json-storage');
 * storage.clear('foobar').subscribe().catch((function(err){ console.log(err) }));
 */
exports.clear = function() {
  const removeFileStream = Rx.Observable.bindCallback(rimraf);
  const userDataPath = utils.getUserDataPath();
  const jsonFiles = path.join(userDataPath, '*.json');
  return removeFileStream(jsonFiles);
};