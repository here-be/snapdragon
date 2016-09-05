'use strict';

require('mocha');
var assert = require('assert');
var Lexer = require('../lib/lexer');

describe('Lexer', function() {
  it('should export a function', function() {
    assert.equal(typeof Lexer, 'function');
  });

  it('should throw an error when a character is unrecognized', function(cb) {
    var lexer = new Lexer('foo', {source: 'glob'});
    try {
      lexer.tokenize();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'unexpected character: f');
      cb();
    }
  });

  it('should tokenize a string with registered lexers', function() {
    var lexer = new Lexer('foo', {source: 'glob'});

    lexer.use(function() {
      var pos = this.position();
      var m = this.match(/^\w+/);
      if (!m) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    });

    var tokens = lexer.tokenize();
    assert.deepEqual(tokens, [{ type: 'text', val: 'foo' }]);
  });

  it('should decorate position onto tokens', function() {
    var lexer = new Lexer('foo', {source: 'glob'});

    lexer.use(function() {
      var pos = this.position();
      var m = this.match(/^\w+/);
      if (!m) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    });

    var tokens = lexer.tokenize();
    assert.deepEqual(tokens[0].position, {
      start: {
        lineno: 1,
        column: 1
      },
      end: {
        line: 1,
        column: 4
      }
    });
  });
});
