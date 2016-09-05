'use strict';

var debug = require('debug')('snapdragon:parser');
var Lexer = require('./lexer');
var error = require('./error');
var utils = require('./utils');

/**
 * Create a new `Parser` with the given `input` and `options`.
 * @param {String} `input`
 * @param {Object} `options`
 * @api public
 */

function Parser(input, options) {
  debug('initializing from <%s>', __filename);
  this.options = utils.extend({source: 'string'}, options);
  this.input = input;
  this.parsed = '';
  this.error = error.bind(this);
  this.lexer = new Lexer(input, this.options);
  this.ast = {type: 'root', nodes: []};
  this.nodes = [this.ast];
  this.stack = [];
  this.parsers = {};
  this.fns = [];
}

/**
 * Parser prototype.
 */

Parser.prototype = {
  constructor: Parser,

  use: function(fn) {
    this.fns.push(fn);
    return this;
  },

  set: function(type, fn) {
    this.parsers[type] = fn;
    return this;
  },

  get: function(type) {
    return this.parsers[type];
  },

  /**
   * Get the previous AST node
   * @return {Object}
   */

  prev: function() {
    return this.stack.length ? utils.last(this.stack) : utils.last(this.nodes);
  },

  /**
   * Lookahead `n` tokens.
   * @param {Number} `n`
   * @return {Object}
   */

  lookahead: function(n) {
    return this.lexer.lookahead(n);
  },

  /**
   * Single token lookahead.
   * @return {Object}
   */

  peek: function() {
    return this.lookahead(1);
  },

  /**
   * Return the next token object.
   * @return {Object}
   */

  advance: function() {
    return this.lexer.advance();
  },

  /**
   * Run all parser `fns` in the order registered.
   * @return {Object} `tok` returns a token
   */

  next: function() {
    return this.lexer.next();
  },

  run: function(node) {
    var fn = node && this.parsers[node.type];
    if (typeof fn !== 'function') {
      throw new Error('no parser registered for: ' + node.type);
    }
    fn.call(this, node, this.prev());
    this.input = this.lexer.input;
  },

  /**
   * Parse the given input and return an AST
   * @return {String}
   * @api public
   */

  parse: function(input) {
    this.input = input;
    this.run(this.next());
    if (input !== this.input) {
      return this.parse();
    } else {
      return this;
    }
  }
};

/**
 * Expose `Parser`
 */

module.exports = Parser;
