'use strict';

var chalk = require('chalk');
var utils = require('./utils');

/**
 * Store position information for a node
 */

function Position(start, src, thisArg) {
  this.start = start;
  this.end = { line: thisArg.lineno, column: thisArg.column };
  this.src = src;
}

/**
 * Create a new `Parser` with the given `string` and `options`.
 *
 * ```js
 * var parser = new snapdragon.Parser(str);
 * ```
 *
 * @param {String} `str` String to parse.
 * @param {Object} `options`
 */

function Parser(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('parser expects a string.');
  }

  this.errorsList = [];
  this.options = options || {};
  this.length = str.length;
  this.input = str;
  this.parsed = '';
  this.orig = str;
  this.nodes = {};

  /**
   * Parsers
   */
  this.parsers = [];

  /**
   * Position
   */
  this.lineno = 1;
  this.column = 1;

  /**
   * Token stash
   */
  this.stash = {};
  this.stash.head = [];
  this.stash.tail = [];
}

/**
 * Update this.lineno and this.column based on `str`.
 *
 * ```js
 * this.updatePosition('foo');
 * ```
 *
 * @param {String} `str` Parsed out string used to determine updated line number and position.
 * @api public
 */

Parser.prototype.updatePosition = function(str) {
  var lines = str.match(utils.nl);
  if (lines) this.lineno += lines.length;
  var i = str.lastIndexOf('\n');
  this.column = ~i ? str.length - i : this.column + str.length;
};

/**
 * Mark position and update `node.position`.
 *
 * ```js
 * var pos = this.position();
 * var node = pos({type: 'parser'});
 * ```
 *
 * @return {Function} Function used to update the position when finished.
 * @api public
 */

Parser.prototype.position = function() {
  var start = { line: this.lineno, column: this.column };
  return function(node) {
    node.position = new Position(start, this.options.src, this);
    this.whitespace();
    return node;
  }.bind(this);
};

/**
 * Set an error message with the current line number and column.
 *
 * ```js
 * this.error('Error parsing string.');
 * ```
 *
 * @param {String} `msg` Message to use in the Error.
 * @api public
 */

Parser.prototype.error = function(msg) {
  var message = (this.options.src || 'pattern')
    + ':' + this.column
    + ': ' + msg;

  var err = new Error(message);
  console.log(chalk.yellow(err));

  err.reason = msg;
  err.filename = this.options.src;
  err.line = this.lineno;
  err.column = this.column;
  err.src = this.input;

  if (this.options.silent) {
    this.errorsList.push(err);
  } else {
    throw err;
  }
};

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
 *
 * @param  {String} `name` Name of the parser to add to the prototype.
 * @param  {Function} `fn` Rule function to add to the prototype.
 * @return {Object} `this` to enable chaining.
 * @api public
 */

Parser.prototype.set = function(name, fn) {
  if (typeof name !== 'string') {
    throw new Error('Parser#parser expects `name` to be a string, but got: ' + name);
  }
  if (typeof fn !== 'function') {
    throw new Error('Parser#parser expects `fn` to be a function: [' + name + ']: ' + fn);
  }
  Parser.prototype[name] = fn;
  return this;
};

/**
 * Run the middleware stack.
 *
 * @api private
 */

Parser.prototype.middleware = function() {
  var res = [], node;
  this.whitespace();
  while (this.input.length && (node = this.run())) {
    if (node !== false) {
      res.push(node);
    }
  }
  return res;
};

/**
 * Parse the currently loaded string with the specified parser middleware.
 *
 * ```js
 * var ast = snapdragon.parse();
 * ```
 *
 * @return {Object} Object representing the parsed AST
 * @api public
 */

Parser.prototype.parse = function() {
  this.nodes = addParent(this.middleware());
  return this;
};

/**
 * Match `re` and return captures. Advances the position of the
 * parser by the length of the captured string.
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
 *
 * @param {RegExp} `re`
 * @return {Object} Push an object representing a parsed node onto the AST.
 * @api public
 */

Parser.prototype.match = function(re) {
  var m = re.exec(this.input);
  if (!m) return;
  var str = m[0];
  this.parsed += str;
  this.updatePosition(str);
  this.input = this.input.slice(str.length);
  return m;
};

/**
 * Run the list of parser middleware.
 *
 * ```js
 * var node = this.run();
 * ```
 * @return {Object} Run all registered parser middleware.
 * @api private
 */

Parser.prototype.run = function() {
  var arr = this.parsers.concat(this.nextline);
  var len = arr.length, i = 0;
  while (len--) {
    var fn = arr[i++];
    var node = fn.call(this);
    if (node) return node;
  }
  return null;
};

/**
 * Add a middleware to use for parsing the string resulting in a single node on the AST
 *
 * ```js
 * parser
 *   .use(function () { ... })
 *   .use(function () { ... });
 * ```
 *
 * @param  {Function} `fn` Middleware function to use.
 * @return {Object} `this` to enable chaining
 */

Parser.prototype.use = function(fn) {
  this.parsers.push(fn);
  return this;
};

/**
 * Parse whitespace.
 */

Parser.prototype.whitespace = function() {
  this.match(/^\s+/);
};

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

Parser.prototype.nextline = function() {
  var pos = this.position();
  var m = this.match(/^\n+/);
  if (!m) return;
  return pos({
    type: 'line',
    val: this.trim(m[0])
  });
};

/**
 * Trim `str`.
 */

Parser.prototype.trim = function(str) {
  return str ? str.replace(/\s+$/g, '') : '';
};

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

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }
  return obj;
}

/**
 * Expose `Parser`
 */

module.exports = Parser;
