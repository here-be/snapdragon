'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var Renderer = require('../lib/renderer');
var renderer;

var fixture = {source: '', nodes: [], errorsList: []};

describe('renderer', function () {
  beforeEach(function() {
    renderer = new Renderer(fixture);
  });

  describe('constructor:', function () {
    it('should return an instance of Renderer:', function () {
      assert(renderer instanceof Renderer);
    });
  });

  describe('prototype methods:', function () {
    it('should expose the `.error()` method', function() {
      assert(typeof renderer.error === 'function');
    });
    it('should expose the `.set()` method', function() {
      assert(typeof renderer.set === 'function');
    });
    it('should expose the `.emit()` method', function() {
      assert(typeof renderer.emit === 'function');
    });
    it('should expose the `.visit()` method', function() {
      assert(typeof renderer.visit === 'function');
    });
    it('should expose the `.mapVisit()` method', function() {
      assert(typeof renderer.mapVisit === 'function');
    });
    it('should expose the `.render()` method', function() {
      assert(typeof renderer.render === 'function');
    });
  });
});
