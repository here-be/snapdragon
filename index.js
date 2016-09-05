'use strict';

var Compiler = require('./lib/compiler');
var Parser = require('./lib/parser');
var utils = require('./lib/utils');

/**
 * Create a new instance of `Snapdragon` with the given `options`.
 *
 * ```js
 * var snapdragon = new Snapdragon();
 * ```
 *
 * @param {Object} `options`
 * @api public
 */

function Snapdragon(options) {
  this.options = utils.extend({source: 'string'}, options);
}

/**
 * Register a plugin `fn`.
 *
 * ```js
 * var snapdragon = new Snapdgragon([options]);
 * snapdragon.use(function() {
 *   console.log(this);          //<= snapdragon instance
 *   console.log(this.parser);   //<= parser instance
 *   console.log(this.compiler); //<= compiler instance
 * });
 * ```
 * @param {Object} `fn`
 * @api public
 */

Snapdragon.prototype.use = function(fn) {
  fn.call(this, this);
  return this;
};

/**
 * Parse the given `str`.
 *
 * ```js
 * var snapdragon = new Snapdgragon([options]);
 * // register parsers
 * snapdragon.parser.use(function() {});
 *
 * // parse
 * var ast = snapdragon.parse('foo/bar');
 * console.log(ast);
 * ```
 * @param {String} `str`
 * @param {Object} `options` Set `options.sourcemap` to true to enable source maps.
 * @return {Object} Returns an AST.
 * @api public
 */

Snapdragon.prototype.parse = function(str, options) {
  this.options = utils.extend({}, this.options, options);
  var parsed = this.parser.parse(str, this.options);

  // add non-enumerable parser reference
  utils.define(parsed, 'parser', this.parser);
  return parsed;
};

/**
 * Compile the given `AST`.
 *
 * ```js
 * var snapdragon = new Snapdgragon([options]);
 * // register plugins
 * snapdragon.use(function() {});
 * // register parser plugins
 * snapdragon.parser.use(function() {});
 * // register compiler plugins
 * snapdragon.compiler.use(function() {});
 *
 * // parse
 * var ast = snapdragon.parse('foo/bar');
 *
 * // compile
 * var res = snapdragon.compile(ast);
 * console.log(res.output);
 * ```
 * @param {Object} `ast`
 * @param {Object} `options`
 * @return {Object} Returns an object with an `output` property with the rendered string.
 * @api public
 */

Snapdragon.prototype.compile = function(ast, options) {
  this.options = utils.extend({}, this.options, options);
  return this.compiler.compile(ast, this.options);
};

/**
 * Getter for lazily creating a new `Parser` when the [parse](#parse)
 * method is called.
 *
 * ```js
 * var snapdragon = new Snapdragon();
 * console.log(snapdragon.parser);
 * ```
 *
 * @return {Object} Returns a new `Snapdragon.Parser` instance.
 * @api public
 */

utils.defineProp(Snapdragon.prototype, 'parser', function() {
  return new Parser(this.options);
});

/**
 * Getter for lazily creating a new `Compiler` when the [compile](#compile)
 * method is called.
 *
 * ```js
 * var snapdragon = new Snapdragon();
 * console.log(snapdragon.compiler);
 * ```
 *
 * @return {Object} Returns a new `Snapdragon.Compiler` instance.
 * @api public
 */

utils.defineProp(Snapdragon.prototype, 'compiler', function() {
  return new Compiler(this.options);
});

/**
 * Expose `Snapdragon`
 */

module.exports = Snapdragon;

/**
 * Expose `Parser` and `Compiler`
 */

module.exports.Compiler = Compiler;
module.exports.Parser = Parser;
