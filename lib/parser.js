'use strict';

var Base = require('base-methods');
var cyan = require('ansi-cyan');
var yellow = require('ansi-yellow');
var define = require('define-property');
var Position = require('./position');

/**
 * Create a new `Parser` with the given `string`
 * and `options`.
 *
 * ```js
 * var parser = new snapdragon.Parser(str);
 * ```
 *
 * @param {String} `str` String to parse.
 * @param {Object} `options`
 */

function Parser(str, options) {
  if (!(this instanceof Parser)) {
    return new Parser(str, options);
  }
  if (typeof str !== 'string') {
    throw new TypeError('parser expects a string.');
  }

  Base.call(this);
  this.options = options || {};
  this.options.source = this.options.source || 'string';
  this.options.parsers = this.options.parsers || {};
  this.source = str;
  this.length = str.length;
  this.input = str;
  this.init(this.options);

  for (var key in this.options.parsers) {
    this.define(key, this.options.parsers[key]);
  }
}

Base.extend(Parser, {
  constructor: Parser,

  /**
   * Initialize default config settings.
   */

  init: function(opts) {
    this.errorsList = [];
    this.parsers = [];
    this.nodes = [];
    this.stash = [];
    this.parsed = '';
    this.lineno = opts.lineno ? (opts.lineno + 1) : 1;
    this.column = 1;
    this.i = 0;

    this.define('debug', function (obj) {
      var msg = cyan(JSON.stringify(obj));
      return console.log(msg);
    });
  },

  /**
   * Update this.lineno and this.column based on `str`.
   *
   * ```js
   * this.updatePosition('foo');
   * ```
   * @param {String} `str` Parsed out string used to
   * determine updated line number and position.
   */

  updatePosition: function(str, len) {
    var lines = str.match(/\n/g);
    if (lines) this.lineno += lines.length;
    var i = str.lastIndexOf('\n');
    this.column = ~i ? len - i : this.column + len;
  },

  /**
   * Mark position and update `node.position`.
   *
   * ```js
   * var pos = this.position();
   * var node = pos({type: 'dot'});
   * ```
   *
   * @name .position
   * @return {Function} Function used to update the position when finished.
   * @api public
   */

  position: function() {
    var start = { line: this.lineno, column: this.column };
    return function(node) {
      node.position = new Position(start, this.options.source, this);
      return node;
    }.bind(this);
  },

  /**
   * Set an error message with the current line
   * number and column.
   *
   * ```js
   * this.error('Error parsing string.');
   * ```
   * @name .error
   * @param {String} `msg` Message to use in the Error.
   * @api public
   */

  error: function(msg) {
    var message = (this.options.source || 'pattern')
      + ':' + this.column
      + ': ' + msg;

    var err = new Error(message);
    console.error(yellow(err));

    err.reason = msg;
    err.filename = this.options.source;
    err.line = this.lineno;
    err.column = this.column;
    err.source = this.input;

    if (this.options.silent) {
      this.errorsList.push(err);
    } else {
      return err;
    }
  },

  /**
   * Add a middleware to use for parsing the string
   * resulting in a single node on the AST
   *
   * ```js
   * parser
   *   .use(function () { ... })
   *   .use(function () { ... });
   * ```
   * @name .use
   * @param  {Function} `fn` Middleware function to use.
   * @return {Object} `this` to enable chaining
   * @api public
   */

  use: function(fn) {
    this.parsers.push(fn);
    return this;
  },

  /**
   * Parse a string with the specified parser middleware.
   *
   * ```js
   * var ast = snapdragon.parse();
   * ```
   * @name .parse
   * @return {Object} Object representing the parsed AST
   * @api public
   */

  parse: function() {
    var node;
    while (this.input.length && (node = (this.stashed() || this.next()))) {
      if (node) this.nodes.push(node);
    }
    return this;
  },

  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Object}
   */

  lookahead: function(n) {
    var fetch = n - this.stash.length;
    while (fetch-- > 0) this.stash.push(this.next());
    return this.stash[--n];
  },

  /**
   * Stashed token.
   */

  stashed: function() {
    return this.stash.length
      && this.stash.shift();
  },

  /**
   * Match `re` and return captures. Advances the
   * position of the parser by the length of the
   * captured string.
   *
   * ```js
   * // match a dot
   * function dot() {
   *   var pos = this.position();
   *   var m = this.match(/^\./);
   *   if (!m) return;
   *   return pos({type: 'dot', val: m[0]});
   * }
   * ```
   * @name .match
   * @param {RegExp} `re`
   * @return {Object} Push an object representing a parsed node onto the AST.
   * @api public
   */

  match: function(re) {
    var m = re.exec(this.input);
    if (!m) return null;
    var str = m[0];
    this.parsed += str;
    var len = str.length;
    this.updatePosition(str, len);
    this.input = this.input.slice(len);
    return m;
  },

  /**
   * Run the list of parser middleware.
   *
   * ```js
   * var node = this.run();
   * ```
   * @return {Object} Run all registered parser middleware.
   */

  next: function() {
    var arr = this.parsers.concat(this.nextline);
    var len = arr.length, i = -1;
    while (++i < len) {
      try {
        var fn = arr[i];
        var node = fn.call(this, this);
        if (node) return node;
      } catch (err) {
        this.error(err.message);
        throw err;
      }
    }
    return null;
  },

  whitespace: function() {
    var pos = this.position();
    var m = this.match(/^[ \t\n]+/);
    if (!m) return;

    return pos({
      type: 'whitespace',
      val: m[0]
    });
  },

  /**
   * Advance to the next line.
   *
   * ```js
   * snapdragon.parse(str)
   *   .use(function() {
   *     this.nextline();
   *   })
   * ```
   */

  nextline: function() {
    var pos = this.position();
    var m = this.match(/^\n+/);
    if (!m) return;
    return pos({
      type: 'newline',
      val: m[0]
    });
  },

  /**
   * Trim `str`.
   */

  trim: function(str) {
    return str ? str.replace(/\s+$/g, '') : '';
  }
});

/**
 * Expose `Parser`
 */

module.exports = Parser;
