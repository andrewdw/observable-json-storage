'use strict';

// const m = require('mochainon');

const expect = require('chai').expect;
const path = require('path');
const utils = require('../lib/utils');

describe('Utils', function() {

  this.timeout(20000);

  describe('.getUserDataPath()', function() {

    it('should return an absolute path', function() {
      expect(path.isAbsolute(utils.getUserDataPath())).to.be.true;
    });

  });

});
