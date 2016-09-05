'use strict';

var debug = require('debug')('snapdragon:lexer');
var Position = require('./position');
var error = require('./error');
var utils = require('./utils');

/**
 * Create a new `Lexer` with the given input `str`.
 * @param {String} `str`
 * @param {Object} `options`
 */

function Lexer(input, options) {
  debug('initializing from <%s>', __filename);
  this.options = utils.extend({source: 'string'}, options);
  this.error = error.bind(this);
  this.input = input;
  this.lexed = '';
  this.lineno = 1;
  this.column = 1;
  this.errors = [];
  this.tokens = [];
  this.lexers = [];
  this.stash = [];
  this.fns = [];
}

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  constructor: Lexer,

  set: function(type, fn) {
    this.lexers[type] = fn;
    return this;
  },

  get: function(type) {
    return this.lexers[type];
  },

  use: function(fn) {
    this.fns.push(fn);
    return this;
  },

  /**
   * Mark position and patch `node.position`.
   */

  position: function() {
    var start = { lineno: this.lineno, column: this.column };
    var self = this;

    return function(node) {
      utils.define(node, 'position', new Position(start, self));
      return node;
    };
  },

  /**
   * Create an AST token with the given `type` and `val`.
   * @param {String} `type`
   * @param {String} `val`
   * @return {Object}
   */

  tok: function(pos, type, val) {
    return pos({
      type: type,
      val: val
    })
  },

  /**
   * Consume the given `len` of input.
   * @param {Number} len
   */

  consume: function(len) {
    this.input = this.input.substr(len);
  },

  /**
   * Update cursor position based on `str` length.
   */

  move: function(str, len) {
    var lines = str.match(/\n/g);
    var idx = str.lastIndexOf('\n');
    if (lines) this.lineno += lines.length;
    this.column = ~idx ? str.length - idx : this.column + len;
    this.lexed += str;
    this.consume(len);
  },

  /**
   * Match `regex`, return captures, and update the cursor position by `match[0]` length.
   * @param {RegExp} `regex`
   * @return {Object}
   */

  match: function(regex) {
    var m = regex.exec(this.input);
    if (m) {
      this.move(m[0], m[0].length);
      return m;
    }
  },

  /**
   * Scan for `type` with the given `regex`.
   * @param {String} type
   * @param {RegExp} regex
   * @return {Object}
   */

  scan: function(type, regex) {
    var pos = this.position();
    var m = this.match(regex);
    if (!m) return;
    return this.tok(pos, type, m[0]);
  },

  /**
   * Scan for `type` with the given `regex`.
   * @param {String} type
   * @param {RegExp} regex
   * @return {Object}
   */

  capture: function(type, regex) {
    this.fns.push(function() {
      return this.scan(type, regex);
    }.bind(this));
    return this;
  },

  /**
   * Push the given `tok` onto the tokens array.
   * @param {Object} tok
   */

  keep: function(tok) {
    this.tokens.push(tok);
    return tok;
  },

  /**
   * Defer the given `tok`.
   * @param {Object} tok
   */

  defer: function(tok) {
    this.tokens.push(tok);
    return tok;
  },

  /**
   * Lookahead `n` tokens.
   * @param {Number} n
   * @return {Object}
   */

  lookahead: function(n) {
    var fetch = n - this.stash.length;
    while (fetch--) {
      this.stash.push(this.next());
    }
    return this.stash[--n];
  },

  /**
   * Deferred token.
   */

  deferred: function() {
    return this.tokens.length && this.tokens.shift();
  },

  /**
   * Stashed token.
   */

  stashed: function() {
    return this.stash.length && this.stash.shift();
  },

  /**
   * Capture end-of-line: '\r'
   */

  eol: function() {
    if (this.input.charAt(0) === '\r') {
      ++this.lineno;
      this.consume(1);
      return this.advance();
    }
  },

  /**
   * Capture end-of-string
   */

  eos: function() {
    if (!this.input) {
      return this.tok(this.position(), 'eos');
    }
  },

  /**
   * Throw an error on exepected characters.
   */

  fail: function() {
    throw new SyntaxError('unexpected character: ' + this.input.charAt(0));
  },

  /**
   * Run all lexer `fns` in the order registered.
   * @return {Object} `tok` returns a token
   */

  run: function() {
    var len = this.fns.length;
    var idx = -1;
    var tok;

    while (this.input && ++idx < len) {
      if ((tok = this.fns[idx].call(this))) {
        return tok;
      }
    }
  },

  /**
   * Return the next token object.
   * @return {Object}
   */

  advance: function() {
    return this.deferred()
      || this.run()
      || this.eos()
      || this.fail();
  },

  /**
   * Fetch next token including those stashed by lookahead.
   * @return {Object} Token
   */

  next: function() {
    return (this.prev = this.stashed() || this.advance());
  },

  tokenize: function() {
    while(this.input) {
      this.tokens.push(this.next());
    }
    return this.tokens;
  }
};

/**
 * Expose `Lexer`
 */

module.exports = Lexer;
