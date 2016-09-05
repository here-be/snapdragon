'use strict';

require('mocha');
var assert = require('assert');
var Position = require('../lib/position');

describe('Position', function() {
  it('should export a function', function() {
    assert.equal(typeof Position, 'function');
  });
});
