'use strict';

require('mocha');
var assert = require('assert');
var Parser = require('../lib/parser');
var parser;

describe('parser', function() {
  beforeEach(function() {
    parser = new Parser();
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

  describe('.set():', function() {
    it('should register middleware', function() {
      parser.set('all', function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        if (!m) return;
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      parser.parse('a/b');
      assert(parser.parsers.hasOwnProperty('all'));
    });

    it('should use middleware to parse', function() {
      parser.set('all', function() {
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
      parser.set('all', function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      parser.parse('a/b');
      assert.equal(parser.ast.nodes.length, 3);
    });

    it('should be chainable:', function() {
      parser
        .set('text', function() {
          var pos = this.position();
          var m = this.match(/^\w+/);
          if (!m) return;
          return pos({
            type: 'text',
            val: m[0]
          });
        })
        .set('slash', function() {
          var pos = this.position();
          var m = this.match(/^\//);
          if (!m) return;
          return pos({
            type: 'slash',
            val: m[0]
          });
        });

      parser.parse('a/b');
      assert.equal(parser.ast.nodes.length, 5);
    });
  });
});

describe('ast', function() {
  beforeEach(function() {
    parser = new Parser();
    parser
      .set('text', function() {
        var pos = this.position();
        var m = this.match(/^\w+/);
        if (!m) return;
        return pos({
          type: 'text',
          val: m[0]
        });
      })
      .set('slash', function() {
        var pos = this.position();
        var m = this.match(/^\//);
        if (!m) return;
        return pos({
          type: 'slash',
          val: m[0]
        });
      });
  });

  describe('orig:', function() {
    it('should add pattern to orig property', function() {
      parser.parse('a/b');
      assert.equal(parser.orig, 'a/b');
    });
  });

  describe('recursion', function() {
    beforeEach(function() {
      parser.set('text', function() {
        var pos = this.position();
        var m = this.match(/^\w/);
        if (!m) return;
        return pos({
          type: 'text',
          val: m[0]
        });
      });

      parser.set('open', function() {
        var pos = this.position();
        var m = this.match(/^{/);
        if (!m) return;
        return pos({
          type: 'open',
          val: m[0]
        });
      });

      parser.set('close', function() {
        var pos = this.position();
        var m = this.match(/^}/);
        if (!m) return;
        return pos({
          type: 'close',
          val: m[0]
        });
      });

      parser.set('comma', function() {
        var pos = this.position();
        var m = this.match(/,/);
        if (!m) return;
        return pos({
          type: 'comma',
          val: m[0]
        });
      });
    });

    it('should set original string on `orig`', function() {
      parser.parse('a{b,{c,d},e}f');
      assert.equal(parser.orig, 'a{b,{c,d},e}f');
    });
  });
});
