'use strict';

require('mocha');
require('should');
var assert = require('assert');
var Parser = require('../lib/parser');
var parser;

describe('parser', function () {
  beforeEach(function() {
    parser = new Parser();
  });

  describe('constructor:', function () {
    it('should return an instance of Parser:', function () {
      assert(parser instanceof Parser);
    });
  });

  // ensures that we catch and document API changes
  describe('prototype methods:', function () {
    var methods = [
      'init',
      'updatePosition',
      'position',
      'error',
      'set',
      'parse',
      'next',
      'match',
      'use',
      'whitespace',
      'nextline',
      'trim'
    ];

    methods.forEach(function (method) {
      it('should expose the `' + method + '` method', function() {
        assert(typeof parser[method] === 'function');
      });
    });
  });
});

describe('parsers', function () {
  beforeEach(function() {
    parser = new Parser();
  });

  describe('register parsers:', function () {
    it('should add a parser to the instance', function () {
      parser.set('foo', function () {});
      assert(parser.foo);
      assert(typeof parser.foo === 'function');
    });
  });
});

describe('parse', function () {
  beforeEach(function() {
    parser = new Parser();
  });

  describe('input:', function () {
    it('should add pattern to input property', function () {
      parser.parse('a/b');
      assert.equal(parser.input, 'a/b');
    });
  });

  describe('.use():', function () {
    it('should register middleware', function () {
      parser.use(function () {
        var pos = this.position();
        var m = this.match(/^.*/);
        return pos({
          type: 'all',
          val: m[0]
        });
      });

      parser.parse('a/b');
      assert(parser.parsers.length === 1);
    });

    it('should use middleware to parse', function () {
      parser.use(function () {
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

    it('should create ast nodes:', function () {
      parser.use(function () {
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

    it('should be chainable:', function () {
      parser
        .use(function () {
          var pos = this.position();
          var m = this.match(/^\w+/);
          if (!m) return;
          return pos({
            type: 'text',
            val: m[0]
          });
        })
        .use(function () {
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

describe('ast', function () {
  beforeEach(function () {
    parser = new Parser();
    parser
      .use(function () {
        var pos = this.position();
        var m = this.match(/^\w+/);
        if (!m) return;
        return pos({
          type: 'text',
          val: m[0]
        });
      })
      .use(function () {
        var pos = this.position();
        var m = this.match(/^\//);
        if (!m) return;
        return pos({
          type: 'slash',
          val: m[0]
        });
      });
  });

  describe('chaining', function () {
    it('should concatenate the `original` string', function () {
      parser
        .parse('a/b/')
        .parse('c/d/')
        .parse('e/f/');
      assert.equal(parser.original, 'a/b/c/d/e/f/');
    });

    it('should concatenate the ast:', function () {
      parser
        .parse('a/b/')
        .parse('c/d/')
        .parse('e/f/');
      assert.equal(parser.nodes.length, 12);
    });
  });
});
