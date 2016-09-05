'use strict';

require('mocha');
var assert = require('assert');
var Compiler = require('../lib/compiler');

describe('Compiler', function() {
  it('should export a function', function() {
    assert.equal(typeof Compiler, 'function');
  });
});
