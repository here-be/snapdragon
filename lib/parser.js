'use strict';

var Position = require('./position');
var error = require('./error');
var utils = require('./utils');

/**
 * Create a new `Parser` with the given `options`.
 *
 * ```js
 * var parser = new Parser();
 * parser.parse('foo');
 * ```
 * @param {Object} `options`
 * @api public
 */

function Parser(options) {
  if (!(this instanceof (Parser))) {
    return new Parser(options);
  }

  this.options = utils.extend({}, options);
  this.source = this.options.source || 'string';
  this.original = '';
  this.parsed = '';
  this.input = '';

  this.errors = [];
  this.parsers = {};
  this.nodes = [];
  this.fns = [];

  this.lineno = 1;
  this.column = 1;

  this.error = error(this);
}

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
 *   .set('slash', function() {})
 *   .set('backslash', function() {})
 *   .parse();
 * ```
 * @name .set
 * @param  {String} `name` Name of the parser to add to the prototype.
 * @param  {Function} `fn` Rule function to add to the prototype.
 * @return {Object} `this` to enable chaining.
 * @api public
 */

Parser.prototype.set = function(name, fn) {
  if (typeof name !== 'string') {
    throw new TypeError('expected a string');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('expected a function');
  }
  this.parsers[name] = fn.bind(this);
  return this;
};

/**
 * Get a cached parser by `name`
 *
 * ```js
 * var braceOpen = parser.get('brace.open');
 * ```
 * @param {String} `name`
 * @return {Function} Parser function
 * @api public
 */

Parser.prototype.get = function(name) {
  return this.parsers[name];
};

/**
 * Add a middleware to use for parsing the string
 * resulting in a single node on the AST
 *
 * ```js
 * parser
 *   .use(function() { ... })
 *   .use(function() { ... });
 * ```
 * @name .use
 * @param  {Function} `fn` Middleware function to use.
 * @return {Object} `this` to enable chaining
 * @api public
 */

Parser.prototype.use = function(fn) {
  this.fns.push(fn);
  return this;
};

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

Parser.prototype.position = function() {
  var start = { line: this.lineno, column: this.column };
  var self = this;
  return function(node) {
    node.pos = new Position(start, self.source, self);
    return node;
  };
};

/**
 * Update this.lineno and this.column based on `str`.
 *
 * ```js
 * this.updatePosition('foo');
 * ```
 * @param {String} `str` Parsed out string used to
 * determine updated line number and position.
 */

Parser.prototype.updatePosition = function(str, len) {
  var lines = str.match(/\n/g);
  if (lines) this.lineno += lines.length;
  var i = str.lastIndexOf('\n');
  this.column = ~i ? len - i : this.column + len;
};

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

Parser.prototype.match = function(re) {
  var m = re.exec(this.input);
  if (!m) return;
  var str = m[0];
  this.parsed += str;
  var len = str.length;
  this.updatePosition(str, len);
  this.input = this.input.slice(len);
  return m;
};

/**
 * Run the list of parser middleware.
 *
 * ```js
 * var node = this.run();
 * ```
 * @return {Object} Run all registered parser middleware.
 */

Parser.prototype.run = function() {
  var len = this.fns.length;
  var idx = -1;

  while (++idx < len) {
    var fn = this.fns[idx];
    try {
      var node = fn.call(this, this.input);
      if (node) return node;
    } catch (err) {
      throw this.error(err.message);
    }
  }
  return null;
};

/**
 * Parse a string by calling each parser in the the `parsers` array
 * until the end of the string is reached.
 *
 * ```js
 * var ast = snapdragon.parse();
 * ```
 * @name .parse
 * @return {Object} Object representing the parsed AST
 * @api public
 */

Parser.prototype.parse = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  this.original += str;
  this.input += str;
  var node = null;

  while (this.input.length && (node = this.run())) {
    if (node) this.nodes.push(node);
  }
  return this;
};

/**
 * Expose `Parser`
 */

module.exports = Parser;
