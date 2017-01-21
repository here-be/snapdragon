'use strict';

require('mocha');
var assert = require('assert');
var Snapdragon = require('..');
var captureSet = require('snapdragon-capture-set');
var Parser = require('../lib/parser');
var parser;
var ast;

describe('parser', function() {
  beforeEach(function() {
    parser = new Parser();
    parser.use(captureSet());
    parser.captureSet('brace', /^\{/, /^\}/);

    parser.set('text', function() {
      var pos = this.position();
      var match = this.match(/^[^{}]/);
      if (match) {
        return pos(this.node(match[0]));
      }
    });

    parser.set('comma', function() {
      var pos = this.position();
      var match = this.match(/,/);
      if (match) {
        return pos(this.node(match[0]));
      }
    });

    ast = parser.parse('a{b,{c,d},e}f');
  });

  describe('.isType', function() {
    it('should return true if "node" is the given "type"', function() {
      assert(ast.isType('root'));
      assert(ast.nodes[0].isType('bos'));
    });
  });

  describe('.hasType', function() {
    it('should return true if "node" has the given "type"', function() {
      assert(ast.hasType('bos'));
      assert(ast.hasType('eos'));
    });
  });

  describe('.first', function() {
    it('should get the first node in node.nodes', function() {
      assert(ast.first);
      assert(ast.first.isType('bos'));
    });
  });

  describe('.last', function() {
    it('should get the last node in node.nodes', function() {
      assert(ast.last);
      assert(ast.last.isType('eos'));
    });
  });

  describe('.next', function() {
    it('should get the next node in an array of nodes', function() {

      // console.log(ast)
    });
  });
});
