'use strict';

require('mocha');
var assert = require('assert');
var Snapdragon = require('..');
var snapdragon;
var parser;

describe('snapdragon.compiler', function() {
  beforeEach(function() {
    snapdragon = new Snapdragon();
    snapdragon.parser
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
      });
  });

  describe('errors', function(cb) {
    it('should throw an error when a compiler is missing', function(cb) {
      try {
        var ast = snapdragon.parse('a/b/c');
        snapdragon.compile(ast);
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'string <line:1 column:2>: compiler "text" is not registered');
        cb();
      }
    });
  });

  describe('snapdragon.compile', function() {
    beforeEach(function() {
      snapdragon.compiler
        .set('text', function(node) {
          return this.emit(node.val);
        })
        .set('slash', function(node) {
          return this.emit('-');
        });
    });

    it('should set the result on `output`', function() {
      var ast = snapdragon.parse('a/b/c');
      var res = snapdragon.compile(ast);
      assert.equal(res.output, 'a-b-c');
    });
  });
});
