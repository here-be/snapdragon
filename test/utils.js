'use strict';

require('mocha');
var assert = require('assert');
var utils = require('../lib/utils');

describe('utils', function() {
  describe('main export:', function() {
    it('should expose an object', function() {
      assert.equal(typeof utils, 'object');
    });
  });
});
