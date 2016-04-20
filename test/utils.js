'use strict';

require('mocha');
var assert = require('assert');
var utils = require('../lib/utils');

describe('utils', function() {
  describe('main export:', function() {
    it('should expose a function', function() {
      assert.equal(typeof utils, 'function');
    });
  });
});
