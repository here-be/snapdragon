'use strict';

require('mocha');
require('should');
var assert = require('assert');
var Parser = require('../lib/parser');
var parser;

describe('parser', function () {
  beforeEach(function() {
    parser = new Parser('fixture');
  });

  describe('constructor:', function () {
    it('should return an instance of Parser:', function () {
      assert(parser instanceof Parser);
    });
  });

  // ensures that we catch and document API changes
  describe('prototype methods:', function () {
    var methods = [
      'init',
      'updatePosition',
      'position',
      'error',
      'set',
      'parse',
      'next',
      'match',
      'use',
      'whitespace',
      'nextline',
      'trim'
    ];

    methods.forEach(function (method) {
      it('should expose the `' + method + '` method', function() {
        assert(typeof parser[method] === 'function');
      });
    });
  });
});

describe('parsers', function () {
  beforeEach(function() {
    parser = new Parser('fixture');
  });

  describe('register parsers:', function () {
    it('should add a parser to the instance', function () {
      parser.set('foo', function () {});
      assert(parser.foo);
      assert(typeof parser.foo === 'function');
    });
  });
});
