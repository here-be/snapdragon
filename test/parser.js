'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
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
    it('should expose the `.init()` method', function() {
      assert(typeof parser.init === 'function');
    });
    it('should expose the `.hint()` method', function() {
      assert(typeof parser.hint === 'function');
    });
    it('should expose the `.updatePosition()` method', function() {
      assert(typeof parser.updatePosition === 'function');
    });
    it('should expose the `.position()` method', function() {
      assert(typeof parser.position === 'function');
    });
    it('should expose the `.error()` method', function() {
      assert(typeof parser.error === 'function');
    });
    it('should expose the `.set()` method', function() {
      assert(typeof parser.set === 'function');
    });
    it('should expose the `.runParsers()` method', function() {
      assert(typeof parser.runParsers === 'function');
    });
    it('should expose the `.parse()` method', function() {
      assert(typeof parser.parse === 'function');
    });
    it('should expose the `.prev()` method', function() {
      assert(typeof parser.prev === 'function');
    });
    it('should expose the `.next()` method', function() {
      assert(typeof parser.next === 'function');
    });
    it('should expose the `.match()` method', function() {
      assert(typeof parser.match === 'function');
    });
    it('should expose the `.run()` method', function() {
      assert(typeof parser.run === 'function');
    });
    it('should expose the `.use()` method', function() {
      assert(typeof parser.use === 'function');
    });
    it('should expose the `.whitespace()` method', function() {
      assert(typeof parser.whitespace === 'function');
    });
    it('should expose the `.nextline()` method', function() {
      assert(typeof parser.nextline === 'function');
    });
    it('should expose the `.trim()` method', function() {
      assert(typeof parser.trim === 'function');
    });
  });
});
