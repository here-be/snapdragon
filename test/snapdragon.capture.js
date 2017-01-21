'use strict';

require('mocha');
var assert = require('assert');
var Snapdragon = require('..');
var capture = require('snapdragon-capture');
var snapdragon;

describe('.capture (plugin usage)', function() {
  beforeEach(function() {
    snapdragon = new Snapdragon();
    snapdragon.use(capture());
  });

  describe('errors', function(cb) {
    it('should throw an error when invalid args are passed to parse', function(cb) {
      try {
        snapdragon.parse();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected a string');
        cb();
      }
    });
  });

  describe('.capture():', function() {
    it('should register a parser', function() {
      snapdragon.capture('all', /^.*/);
      snapdragon.parse('a/b');
      assert(snapdragon.parsers.hasOwnProperty('all'));
    });

    it('should use middleware to parse', function() {
      snapdragon.capture('all', /^.*/);
      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.parsed, 'a/b');
      assert.equal(snapdragon.parser.input, '');
    });

    it('should create ast node:', function() {
      snapdragon.capture('all', /^.*/);
      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.ast.nodes.length, 3);
    });

    it('should be chainable:', function() {
      snapdragon.parser
        .capture('text', /^\w+/)
        .capture('slash', /^\//);

      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.ast.nodes.length, 5);
    });
  });
});

describe('ast', function() {
  beforeEach(function() {
    snapdragon = new Snapdragon();
    snapdragon.use(capture());
    snapdragon
        .capture('text', /^\w+/)
        .capture('slash', /^\//);
  });

  describe('orig:', function() {
    it('should add pattern to orig property', function() {
      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.orig, 'a/b');
    });
  });
});
