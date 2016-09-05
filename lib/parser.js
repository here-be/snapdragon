'use strict';

var debug = require('debug')('snapdragon:parser');
var Position = require('./position');
var utils = require('./utils');

/**
 * Create a new `Parser` with the given `input` and `options`.
 * @param {String} `input`
 * @param {Object} `options`
 * @api public
 */

function Parser(options) {
  debug('initializing', __filename);
  this.options = utils.extend({source: 'string'}, options);
  this.orig = '';
  this.input = '';
  this.parsed = '';
  this.column = 1;
  this.lineno = 1;
  this.errors = [];

  this.parsers = {};
  this.fns = [];

  var pos = this.position();
  this.bos = pos({type: 'bos', val: ''});

  this.ast = {
    type: 'root',
    nodes: [this.bos],
    errors: this.errors
  };

  this.nodes = [this.ast];
  this.count = 0;
  this.types = [];
  this.stack = [];
  this.sets = {};
}

/**
 * Prototype methods
 */

Parser.prototype = {
  constructor: Parser,

  /**
   * Throw a formatted error with the cursor column and `msg`.
   * @param {String} `msg` Message to use in the Error.
   */

  error: function(msg, node) {
    var pos = node.position;
    var lineno = pos.start.lineno;
    var column = pos.start.column;
    var source = this.options.source;

    var message = source + ' <lineno:' + lineno + ' column:' + column + '>: ' + msg;
    var err = new Error(message);
    err.source = source;
    err.reason = msg;
    err.pos = pos;

    if (this.options.silent) {
      this.errors.push(err);
    } else {
      throw err;
    }
  },

  /**
   * Mark position and patch `node.position`.
   */

  position: function() {
    var start = { lineno: this.lineno, column: this.column };
    var self = this;

    return function(node) {
      utils.define(node, 'position', new Position(start, self));
      utils.define(node, 'source', self.orig);
      return node;
    };
  },

  /**
   * Push a parser `fn` onto the `fns` array
   * @param {Function} `fn`
   */

  use: function(fn) {
    this.fns.push(fn.bind(this));
    return this;
  },

  /**
   * Set parser `name` with the given `fn`
   * @param {String} `name`
   * @param {Function} `fn`
   */

  set: function(type, fn) {
    this.types.push(type);
    this.parsers[type] = fn.bind(this);
    return this;
  },

  /**
   * Get parser `name`
   * @param {String} `name`
   */

  get: function(name) {
    return this.parsers[name];
  },

  /**
   * Push a `token` onto the `type` stack.
   *
   * @param {String} `type`
   * @return {Object} `token`
   * @api public
   */

  push: function(type, token) {
    this.count++;
    this.stack.push(token);
    return this.sets[type].push(token);
  },

  /**
   * Pop a token off of the `type` stack
   * @param {String} `type`
   * @returns {Object} Returns a token
   * @api public
   */

  pop: function(type) {
    this.count--;
    this.stack.pop();
    return this.sets[type].pop();
  },

  /**
   * Return true if inside a `stack` node. Types are `braces`, `parens` or `brackets`.
   *
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isInside: function(type) {
    return this.sets[type].length > 0;
  },

  /**
   * Return true node is the given type.
   *
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isType: function(node, type) {
    return node && node.type === type;
  },

  /**
   * Get the previous AST node
   * @return {Object}
   */

  prev: function() {
    return this.stack.length ? utils.last(this.stack) : utils.last(this.nodes);
  },

  /**
   * Update lineno and column based on `str`.
   */

  consume: function(len) {
    this.input = this.input.substr(len);
  },

  /**
   * Update column based on `str`.
   */

  updatePosition: function(str, len) {
    var lines = str.match(/\n/g);
    if (lines) this.lineno += lines.length;
    var i = str.lastIndexOf('\n');
    this.column = ~i ? len - i : this.column + len;
    this.parsed += str;
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
      this.updatePosition(m[0], m[0].length);
      return m;
    }
  },

  /**
   * Capture `type` with the given regex.
   * @param {String} `type`
   * @param {RegExp} `regex`
   * @return {Function}
   */

  capture: function(type, regex) {
    this.set(type, function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(regex);
      if (!m || !m[0]) return;

      var prev = this.prev();
      var node = pos({
        type: type,
        parsed: parsed,
        rest: this.input,
        val: m[0]
      });

      utils.define(node, 'parent', prev);
      prev.nodes.push(node);
    }.bind(this));
    return this;
  },

  /**
   * Create a parser with open and close for parens,
   * brackets or braces
   */

  pair: function(type, openRegex, closeRegex) {
    this.sets[type] = this.sets[type] || [];

    /**
     * Open
     */

    this.set(type + '.open', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(openRegex);
      if (!m || !m[0]) return;
      var val = m[0];

      var prev = this.prev();
      this.specialChars = true;
      var open = pos({
        type: type + '.open',
        inner: m[1],
        val: val
      });

      var node = pos({
        type: type,
        nodes: [open]
      });

      utils.define(node, 'rest', this.input);
      utils.define(node, 'parsed', parsed);
      utils.define(node, 'prefix', m[1]);
      utils.define(node, 'parent', prev);
      utils.define(open, 'parent', node);

      this.push(type, node);
      prev.nodes.push(node);
    });

    /**
     * Close
     */

    this.set(type + '.close', function() {
      var pos = this.position();
      var m = this.match(closeRegex);
      if (!m) return;

      var open = this.pop(type);
      var node = pos({
        type: type + '.close',
        rest: this.input,
        suffix: m[1],
        val: m[0]
      });

      if (!this.isType(open, type)) {
        if (this.options.strict) {
          throw new Error('missing opening "' + type + '"');
        }
        node.type = 'text';
        node.val = '\\' + node.val;
        return node;
      }

      open.nodes.push(node);
      utils.define(node, 'parent', open);
    });

    return this;
  },

  /**
   * Capture end-of-string
   */

  eos: function() {
    var pos = this.position();
    if (this.input) return;
    var prev = this.prev();
    var node = pos({
      type: 'eos',
      val: this.append || ''
    });
    prev.nodes.push(node);
  },

  /**
   * Run parsers to advance the cursor position
   */

  run: function() {
    var len = this.fns.length;
    var idx = -1;
    var tok;

    while (++idx < len) {
      tok = this.fns[idx].call(this);
      if (tok) return tok;
    }
  },

  next: function() {
    var len = this.types.length;
    var idx = -1;
    var tok;

    while (++idx < len) {
      tok = this.parsers[this.types[idx]].call(this);
      if (tok) return tok;
    }
  },

  /**
   * Parse the given string.
   * @return {Array}
   */

  parse: function(input) {
    if (typeof input !== 'string') {
      throw new TypeError('expected a string');
    }

    this.orig += input;
    this.input += input;

    if (this.ast.nodes.length > 1) {
      // remove the `eos` node
      this.ast.nodes.pop();
    }

    while (this.input) {
      var prev = this.input;
      var tok = this.run() || this.next();
      if (tok) {
        var prev = this.prev();
        if (prev) {
          utils.define(tok, 'parent', prev);
          if (prev.nodes) {
            prev.nodes.push(tok);
          }
        }
      }

      if (this.input && prev === this.input) {
        throw new Error('no parsers registered for: "' + this.input.charAt(0) + '"');
      }
    }

    if (this.stack.length && this.options.strict) {
      var node = this.stack.pop();
      throw this.error('missing opening ' + node.type + ': "' + this.orig + '"');
    }

    this.eos();
    return this.ast;
  }
};

/**
 * Expose `Parser`
 */

module.exports = Parser;
