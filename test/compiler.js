'use strict';

require('mocha');
var assert = require('assert');
var Compiler = require('../lib/compiler');
var compiler;

describe('compiler', function() {
  beforeEach(function() {
    compiler = new Compiler();
  });

  describe('constructor:', function() {
    it('should return an instance of Compiler:', function() {
      assert(compiler instanceof Compiler);
    });
  });

  // ensures that we catch and document API changes
  describe('prototype methods:', function() {
    var methods = [
      'error',
      'set',
      'emit',
      'visit',
      'mapVisit',
      'compile'
    ];

    methods.forEach(function(method) {
      it('should expose the `' + method + '` method', function() {
        assert.equal(typeof compiler[method], 'function', method);
      });
    });
  });
});
