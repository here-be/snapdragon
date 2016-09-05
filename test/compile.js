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
    parser = new Parser();
    parser
      .use(function() {
        var pos = this.position();
        var m = this.match(/^\w+/);
        if (!m) return;
        return pos({
          type: 'text',
          val: m[0]
        });
      })
      .use(function() {
        var pos = this.position();
        var m = this.match(/^\//);
        if (!m) return;
        return pos({
          type: 'slash',
          val: m[0]
        });
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
        assert.equal(err.message, 'string column:1: compiler "text" is not registered');
        cb();
      }
    });
  });

  describe('compiling', function() {
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
  });
});
