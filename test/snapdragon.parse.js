'use strict';

require('mocha');
var assert = require('assert');
var Snapdragon = require('..');
var snapdragon;

describe('parser', function() {
  beforeEach(function() {
    snapdragon = new Snapdragon();
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

  describe('.set():', function() {
    it('should register middleware', function() {
      snapdragon.parser.set('all', function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        if (!m) return;
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      snapdragon.parse('a/b');
      assert(snapdragon.parsers.hasOwnProperty('all'));
    });

    it('should use middleware to parse', function() {
      snapdragon.parser.set('all', function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.parsed, 'a/b');
      assert.equal(snapdragon.parser.input, '');
    });

    it('should create ast node:', function() {
      snapdragon.parser.set('all', function() {
        var pos = this.position();
        var m = this.match(/^.*/);
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.ast.nodes.length, 3);
    });

    it('should be chainable:', function() {
      snapdragon.parser
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

      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.ast.nodes.length, 5);
    });
  });
});

describe('ast', function() {
  beforeEach(function() {
    snapdragon = new Snapdragon();
    snapdragon.parser
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
      snapdragon.parse('a/b');
      assert.equal(snapdragon.parser.orig, 'a/b');
    });
  });

  describe('recursion', function() {
    beforeEach(function() {
      snapdragon.parser.set('text', function() {
        var pos = this.position();
        var m = this.match(/^\w/);
        if (!m) return;
        return pos({
          type: 'text',
          val: m[0]
        });
      });

      snapdragon.parser.set('open', function() {
        var pos = this.position();
        var m = this.match(/^{/);
        if (!m) return;
        return pos({
          type: 'open',
          val: m[0]
        });
      });

      snapdragon.parser.set('close', function() {
        var pos = this.position();
        var m = this.match(/^}/);
        if (!m) return;
        return pos({
          type: 'close',
          val: m[0]
        });
      });

      snapdragon.parser.set('comma', function() {
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
      snapdragon.parse('a{b,{c,d},e}f');
      assert.equal(snapdragon.parser.orig, 'a{b,{c,d},e}f');
    });
  });
});
