'use strict';

require('mocha');
require('should');
var assert = require('assert');
var Snapdragon = require('../');
var snapdragon;

describe('snapdragon', function () {
  beforeEach(function() {
    snapdragon = new Snapdragon('foo');
  });

  describe('constructor:', function () {
    it('should return an instance of Snapdragon:', function () {
      assert(snapdragon instanceof Snapdragon);
    });
  });

  describe('static methods:', function () {
    it('should expose the `Renderer` constructor:', function () {
      assert(typeof Snapdragon.Renderer === 'function');
    });
    it('should expose the `Parser` constructor:', function () {
      assert(typeof Snapdragon.Parser === 'function');
    });
  });

  describe('prototype:', function () {
    it('should expose the `renderer` method:', function () {
      assert(typeof snapdragon.renderer === 'function');
    });

    it('should expose the `parser` method:', function () {
      assert(typeof snapdragon.parser === 'function');
    });
  });
});
