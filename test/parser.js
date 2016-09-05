'use strict';

require('mocha');
var assert = require('assert');
var Parser = require('../lib/parser');
var parser;

describe('parser', function() {
  beforeEach(function() {
    parser = new Parser();
  });

  describe('constructor:', function() {
    it('should return an instance of Parser:', function() {
      assert(parser instanceof Parser);
    });
  });

  // ensures that we catch and document API changes
  describe('prototype methods:', function() {
    var methods = [
      'updatePosition',
      'position',
      'error',
      'set',
      'parse',
      'match',
      'use'
    ];

    methods.forEach(function(method) {
      it('should expose the `' + method + '` method', function() {
        assert.equal(typeof parser[method], 'function');
      });
    });
  });

  describe('parsers', function() {
    beforeEach(function() {
      parser = new Parser();
    });

    describe('.set():', function() {
      it('should register a named middleware', function() {
        parser.set('all', function() {
          var pos = this.position();
          var m = this.match(/^.*/);
          return pos({
            type: 'all',
            val: m[0]
          });
        });

        assert(typeof parser.parsers.all === 'function');
      });

      it('should expose named parsers to middleware:', function() {
        var count = 0;

        parser.set('word', function() {
          var pos = this.position();
          var m = this.match(/^\w/);
          if (!m) return;

          return pos({
            type: 'word',
            val: m[0]
          });
        });

        parser.use(function() {
          var pos = this.position();
          var m = this.match(/^\//);
          if (!m) return;

          var word = this.parsers.word();
          var prev = this.prev();

          var node = pos({
            type: 'slash',
            val: m[0]
          });

          if (word && word.type === 'word') {
            count++;
          }

          prev.nodes.push(node);
          prev.nodes.push(word);
        });

        parser.parse('a/b');
        assert.equal(parser.ast.nodes.length, 5);
        assert.equal(count, 1);
      });
    });
  });
});
