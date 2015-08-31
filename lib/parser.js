'use strict';

var cyan = require('ansi-cyan');
var yellow = require('ansi-yellow');
var define = require('define-property');
var Position = require('./position');
var utils = require('./utils');

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

  this.options = options || {};
  this.options.source = this.options.source || 'string';
  this.options.parsers = this.options.parsers || {};
  this.source = str;
  this.length = str.length;
  this.input = str;
  this.init();

  for (var key in this.options.parsers) {
    define(this, key, this.options.parsers[key]);
  }
}

Parser.prototype = {
  constructor: Parser,

  /**
   * Initialize default config settings.
   */

  init: function() {
    this.errorsList = [];
    this.parsed = '';
    this.nodes = [];
    this.parsers = [];
    this.lineno = 1;
    this.column = 1;
    this.i = 0;
    this.hints = {};
    this.stash = {};
    this.stash.head = [];
    this.stash.tail = [];

    this.debug = function (obj) {
      var msg = cyan(JSON.stringify(obj));
      return console.log(msg);
    };
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
    var lines = str.match(utils.nl);
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
      node.i = this.i++;
      node.position = new Position(start, this.options.source, this);
      this.whitespace();
      return node;
    }.bind(this);
  },

  /**
   * Set a `hint` to be used by downstream parsers.
   *
   * ```js
   * this.hint('bracket.start', true);
   * ```
   * @name .hint
   * @param {String} `prop`
   * @param {any} `val`
   * @return {Object} Returns the `Parser` instance for chaining.
   * @api public
   */

  hint: function(prop, val) {
    set(this.hints, prop, val);
    return this;
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
    console.log(yellow(err));

    err.reason = msg;
    err.filename = this.options.source;
    err.line = this.lineno;
    err.column = this.column;
    err.source = this.input;

    if (this.options.silent) {
      this.errorsList.push(err);
    } else {
      throw err;
    }
  },

  /**
   * Register a parser middleware by name, so it can be called
   * by other parsers. Parsers are added to the `prototype` to
   * allow using `this`.
   *
   * ```js
   * function heading() {
   *   //=> do stuff
   * }
   * function heading() {
   *   //=> do stuff
   * }
   *
   * var ast = snapdragon.parser(str, options)
   *   .set('slash', function(){})
   *   .set('backslash', function(){})
   *   .parse();
   * ```
   * @name .set
   * @param  {String} `name` Name of the parser to add to the prototype.
   * @param  {Function} `fn` Rule function to add to the prototype.
   * @return {Object} `this` to enable chaining.
   * @api public
   */

  set: function(name, fn) {
    if (typeof name !== 'string') {
      throw new Error('expected a string');
    }
    if (typeof fn !== 'function') {
      throw new Error('expected a function');
    }
    Parser.prototype[name] = fn;
    return this;
  },

  /**
   * Run the middleware stack.
   */

  runParsers: function() {
    var node;
    while (this.input.length && (node = this.run())) {
      if (node) this.nodes.push(node);
    }
    return this.nodes;
  },

  /**
   * Parse the currently loaded string with the
   * specified parser middleware.
   *
   * ```js
   * var ast = snapdragon.parse();
   * ```
   * @name .parse
   * @return {Object} Object representing the parsed AST
   * @api public
   */

  parse: function() {
    this.nodes = addParent(this.runParsers());
    return this;
  },

  /**
   * Look behind the given number of columns.
   */

  prev: function(n) {
    return this.parsed.length ? this.parsed[this.parsed.length - n] : null;
  },

  /**
   * Look ahead the given number of columns.
   */

  next: function(n) {
    return this.input.charAt(n);
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
    if (!m) return;
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

  run: function() {
    var arr = this.parsers.concat(this.nextline);
    var len = arr.length, i = 0;
    while (len--) {
      try {
        var fn = arr[i++];
        var node = fn.call(this, this);
        if (node) return node;
      } catch (err) {
        console.log(arr);
        this.error(err.message);
        throw err;
      }
    }
    return null;
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
   * Parse whitespace.
   */

  whitespace: function() {
    this.match(/^\s+/);
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
      type: 'line',
      val: this.trim(m[0])
    });
  },

  /**
   * Trim `str`.
   */

  trim: function(str) {
    return str ? str.replace(/\s+$/g, '') : '';
  }
}


/**
 * Adds non-enumerable parent node reference to each node.
 */

function addParent(obj, parent) {
  var isNode = obj && typeof obj.type === 'string';
  var childParent = isNode ? obj : parent;

  for (var key in obj) {
    var val = obj[key];
    if (Array.isArray(val)) {
      var len = val.length;
      while (len--) {
        addParent(val[len], childParent);
      }

    } else if (val && typeof val === 'object') {
      addParent(val, childParent);
    }
  }

  if (isNode) define(obj, 'parent', parent || null);
  return obj;
}

/**
 * Expose `Parser`
 */

module.exports = Parser;
