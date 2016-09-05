'use strict';

require('mocha');
var assert = require('assert');
var extglob = require('..');

describe('extglob', function() {
  it('should export a function', function() {
    assert.equal(typeof extglob, 'function');
  });
});
