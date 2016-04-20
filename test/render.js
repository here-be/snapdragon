'use strict';

require('mocha');
var assert = require('assert');
var Renderer = require('../lib/renderer');
var Parser = require('../lib/parser');
var renderer;
var parser;

describe('renderer', function() {
  beforeEach(function() {
    renderer = new Renderer();
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
    it('should throw an error when a renderer is missing', function(cb) {
      try {
        var ast = parser.parse('a/b/c');
        renderer.render(ast);      
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'renderer "text" is not registered. Failed to render string "a"');
        cb();
      }
    });
  });

  describe('rendering', function() {
    beforeEach(function()  {
      renderer
        .set('text', function(node)  {
          return node.val;
        })
        .set('slash', function(node)  {
          return '-';
        });
    });

    it('should set the result on `rendered`', function() {
      var ast = parser.parse('a/b/c');
      renderer.render(ast);
      assert.equal(renderer.rendered, 'a-b-c');
    });
  });
});
