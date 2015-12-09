'use strict';

require('mocha');
require('should');
var assert = require('assert');
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

  // ensures that we catch and document API changes
  describe('prototype methods:', function () {
    var methods = [
      'error',
      'set',
      'emit',
      'visit',
      'mapVisit',
      'render'
    ];

    methods.forEach(function (method) {
      it('should expose the `' + method + '` method', function() {
        assert(typeof renderer[method] === 'function');
      });
    });
  });
});
