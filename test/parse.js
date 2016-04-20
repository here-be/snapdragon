'use strict';

require('mocha');
var assert = require('assert');
var Parser = require('../lib/parser');
var parser;

describe('parser', function() {
  beforeEach(function() {
    parser = new Parser();
  });

  describe('input:', function() {
    it('should add pattern to input property', function() {
      parser.parse('a/b');
      assert.equal(parser.input, 'a/b');
    });
  });

  describe('errors', function(cb) {
    it('should throw an error when invalid args are passed to parse', function(cb) {
      var parser = new Parser();
      try {
        parser.parse();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected a string');
        cb();
      }
    });
  });

  describe('.use():', function() {
    it('should register middleware', function() {
      parser.use(function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      parser.parse('a/b');
      assert(parser.fns.length === 1);
    });

    it('should use middleware to parse', function() {
      parser.use(function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      parser.parse('a/b');
      assert.equal(parser.parsed, 'a/b');
      assert.equal(parser.input, '');
    });

    it('should create ast node:', function() {
      parser.use(function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      parser.parse('a/b');
      assert(parser.nodes.length === 1);
    });

    it('should be chainable:', function() {
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

      parser.parse('a/b');
      assert(parser.nodes.length === 3);
    });
  });
});

describe('ast', function() {
  beforeEach(function() {
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

  describe('chaining', function() {
    it('should concatenate the `original` string', function() {
      parser
        .parse('a/b/')
        .parse('c/d/')
        .parse('e/f/');
      assert.equal(parser.original, 'a/b/c/d/e/f/');
    });

    it('should concatenate the ast:', function() {
      parser
        .parse('a/b/')
        .parse('c/d/')
        .parse('e/f/');

      assert.equal(parser.nodes.length, 12);
    });
  });

  describe('recursion', function() {
    beforeEach(function() {
      parser.use(function() {
        var pos = this.position();
        var m = this.match(/^{/);
        if (!m) return;
        return pos({
          type: 'open',
          val: m[0]
        });
      });

      parser.use(function() {
        var pos = this.position();
        var m = this.match(/^}/);
        if (!m) return;
        return pos({
          type: 'close',
          val: m[0]
        });
      });

      parser.use(function() {
        var pos = this.position();
        var m = this.match(/,/);
        if (!m) return;
        return pos({
          type: 'comma',
          val: m[0]
        });
      });
    });

    it('should create nested nodes', function() {
      parser.parse('a{b,{c,d},e}f');
      console.log(parser)
      // assert.equal(parser.original, 'a/b/c/d/e/f/');
    });
  });
});
