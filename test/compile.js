'use strict';

require('mocha');
var assert = require('assert');
var Compile = require('../lib/compiler');
var Parser = require('../lib/parser');
var compiler;
var parser;

describe('compiler', function() {
  beforeEach(function() {
    compiler = new Compile();
    compiler
      .set('parens.open', function(node) {
        return this.emit('(', node);
      })
      .set('parens.close', function(node) {
        return this.emit(')', node);
      });
    parser = new Parser();
    parser
      .set('text', function() {
        var pos = this.position();
        var match = this.match(/^\w+/);
        if (match) {
          return pos(this.node(match[0]));
        }
      })
      .set('slash', function() {
        var pos = this.position();
        var match = this.match(/^\//);
        if (match) {
          return pos(this.node(match[0]))
        }
      })
      .set('parens.open', function() {
        var pos = this.position();
        var match = this.match(/^\(/);
        if (match) {
          return pos(this.node(match[0]))
        }
      })
      .set('parens.close', function() {
        var pos = this.position();
        var match = this.match(/^\)/);
        if (match) {
          return pos(this.node(match[0]))
        }
      });
  });

  describe('errors', function(cb) {
    it('should throw an error when a compiler is missing', function(cb) {
      try {
        var ast = parser.parse('a/b/c');
        compiler.compile(ast);
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'string <line:1 column:2>: compiler "text" is not registered');
        cb();
      }
    });
  });

  describe('.compile', function() {
    beforeEach(function() {
      compiler
        .set('text', function(node) {
          return this.emit(node.val);
        })
        .set('slash', function(node) {
          return this.emit('-');
        });
    });

    it('should set the result on `output`', function() {
      var ast = parser.parse('a/b/c');
      var res = compiler.compile(ast);
      assert.equal(res.output, 'a-b-c');
    });

    it('should compile close without open', function() {
      var ast = parser.parse('a)');
      var res = compiler.compile(ast);
      assert.equal(res.output, 'a)');
    });
  });
});
