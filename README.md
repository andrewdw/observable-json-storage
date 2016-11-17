ovservable-json-storage
=====================

> Easily read & write persistent, observable data in Node & Electron apps

[![npm downloads](https://img.shields.io/npm/dm/observable-json-storage.svg)](https://img.shields.io/npm/dm/observable-json-storage.svg)
[![npm version](https://badge.fury.io/js/observable-json-storage.svg)](https://badge.fury.io/js/observable-json-storage)
[![dependencies](https://david-dm.org/andrewdw/observable-json-storage.svg)](https://david-dm.org/andrewdw/observable-json-storage.svg)

Both [Node](http://nodejs.org) and [Electron](http://electron.atom.io) lack easy ways to persist data for your application. `observable-json-storage` implements an API similar to [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage) to read and write JSON objects to your application using observable (RxJS) methods.

Installation
------------

Install `observable-json-storage` by running:

```sh
$ npm install --save observable-json-storage
```

In Electron, you can require this module from either the **main** or **renderer** process (with and without `remote`).

Documentation
-------------


* [storage](#module_storage)
    * [.setPath(directory, [replace])](#module_storage.setPath)
    * [.getPath()](#module_storage.getPath) ⇒ <code>String</code>
    * [.set(key, value)](#module_storage.set)
    * [.get(key)](#module_storage.get) ⇒ <code>Observable.&lt;(Object\|Boolean)&gt;</code>
    * [.has(key)](#module_storage.has) ⇒ <code>Observable.&lt;Boolean&gt;</code>
    * [.keys()](#module_storage.keys) ⇒ <code>Observable.&lt;Array&gt;</code>
    * [.remove(key)](#module_storage.remove)
    * [.clear()](#module_storage.clear)

<a name="module_storage.setPath"></a>

### storage.setPath(directory, [replace])
If running in Node, the default directory will be set to the project's
root folder.

If running in Electron, it will be the app's default `userData` location.

By default, `directory` will be appended relative to the default storage location.
Passing `true` to `replace` will overwrite the default directory completely.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Change the default read/write path  
**Access:** public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| directory | <code>String</code> |  | directory to change to |
| [replace] | <code>Boolean</code> | <code>false</code> | completely replace the directory or not |

**Example**  
```js
const storage = require('observable-json-storage');
// setting path "foo" relative to app's default storage location
storage.setPath('./foo'); // /DEFAULT/PATH/TO/APP/STORAGE/foo
```
**Example** *(Node)*  
```js
const storage = require('observable-json-storage');
// completely replace absolute path with Node's root directory
storage.setPath(__dirname, true); // /PATH/TO/NODE/APP
```
**Example**  
```js
const storage = require('observable-json-storage');
// completely replace absolute path with anything
storage.setPath('/new/path/to/anything', true); // /new/path/to/anything
```
<a name="module_storage.getPath"></a>

### storage.getPath() ⇒ <code>String</code>
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Return current read/write path  
**Returns**: <code>String</code> - current read/write path  
**Access:** public  
**Example**  
```js
const storage = require('observable-json-storage');

var currentStoragePath = storage.getPath();
console.log(currentStoragePath)
```
<a name="module_storage.set"></a>

### storage.set(key, value)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Write JSON data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| value | <code>Object</code> | value to save |

**Example**  
```js
const storage = require('observable-json-storage');

storage.set('foobar', { foo: 'bar' }).subscribe(
  function(){
    console.log('successful save');
  },
  function(error) {
    console.log(error)
  }
)
```
**Example** *(shortened)*  
```js
const storage = require('observable-json-storage');

storage.set('foobar', { foo: 'bar' }).subscribe().catch((function(err){ console.log(err) }));
```
<a name="module_storage.get"></a>

### storage.get(key) ⇒ <code>Observable.&lt;(Object\|Boolean)&gt;</code>
If the key does not exist, `false` is returned.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Read JSON data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |

**Example**  
```js
const storage = require('observable-json-storage');

storage.get('foobar').subscribe(
  function(data) {
    if (!data) { console.log(`Foobar does not exist`); return; }
    console.log(data);
  },
  function(error) {
    console.log(error);
  }
)
```
<a name="module_storage.has"></a>

### storage.has(key) ⇒ <code>Observable.&lt;Boolean&gt;</code>
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Check if a key exists  
**Returns**: <code>Observable.&lt;Boolean&gt;</code> - returns `true` or `false` if the key exists or doesn't  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |

**Example**  
```js
const storage = require('observable-json-storage');

storage.has('foobar').subscribe(
  function(hasKey) {
     console.log(hasKey);
  },
  function(error) {
     console.log(error);
  }
)
```
<a name="module_storage.keys"></a>

### storage.keys() ⇒ <code>Observable.&lt;Array&gt;</code>
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Get the list of saved keys  
**Returns**: <code>Observable.&lt;Array&gt;</code> - array of key strings  
**Access:** public  
**Example**  
```js
const storage = require('observable-json-storage');

storage.keys().subscribe(
  function(keys) {
    console.log(keys);
  },
  function(error) {
    console.log(error);
  }
)
```
<a name="module_storage.remove"></a>

### storage.remove(key)
Notice this function does nothing, nor throws any error
if the key doesn't exist.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Remove a key  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |

**Example**  
```js
const storage = require('observable-json-storage');

storage.remove(key).subscribe(
  function() {
    console.log('removed');
  },
  function(error) {
    console.log(error);
  }
)
```
**Example** *(shortened)*  
```js
const storage = require('observable-json-storage');
storage.remove('foobar').subscribe().catch((function(err){ console.log(err) }));
```
<a name="module_storage.clear"></a>

### storage.clear()
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Clear all stored JSON data  
**Access:** public  
**Example**  
```js
const storage = require('observable-json-storage');

storage.clear().subscribe(
  function() {
    console.log('cleared');
  },
  function(error) {
    console.log(error);
  }
)
```
**Example** *(shortened)*  
```js
const storage = require('observable-json-storage');
storage.clear().subscribe().catch((function(err){ console.log(err) }));
```


License
-------

The project is licensed under the MIT license.
