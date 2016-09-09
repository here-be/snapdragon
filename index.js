'use strict';

var Base = require('base');
var Compiler = require('./lib/compiler');
var Parser = require('./lib/parser');
var utils = require('./lib/utils');
var regexCache = {};
var cache = {};

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
  Base.call(this, null, options);
  this.options = utils.extend({source: 'string'}, this.options);
  this.compiler = new Compiler(this.options);
  this.parser = new Parser(this.options);
}

/**
 * Inherit Base
 */

Base.extend(Snapdragon);

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
  var compiled = this.compiler.compile(ast, this.options);

  // add non-enumerable compiler reference
  utils.define(compiled, 'compiler', this.compiler);
  return compiled;
};

/**
 * Create a regular expression from the given string `pattern`.
 *
 * ```js
 * var Snapdragon = require('snapdragon');
 * var snapdragon = new Snapdragon();
 *
 * var re = snapdragon.makeRe('*.!(*a)');
 * console.log(re);
 * //=> /^[^\/]*?\.(?![^\/]*?a)[^\/]*?$/
 * ```
 * @param {String} `pattern` The pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

Snapdragon.prototype.makeRe = function(pattern, options) {
  var key = pattern;
  var regex;

  if (options) {
    for (var prop in options) {
      if (options.hasOwnProperty(prop)) {
        key += ';' + prop + '=' + String(options[prop]);
      }
    }
  }

  if (cache.hasOwnProperty(key)) {
    return cache[key];
  }

  var ast = this.parse(pattern, options);
  // console.log(util.inspect(ast, null, 10))
  var res = this.compile(ast, options);
  // console.log(res.output)
  // console.log(pattern)
  regex = cache[key] = this.toRegex(res.output, options);
  // console.log(regex)
  return regex;
};

/**
 * Create a regex from the given `string` and `options`
 */

Snapdragon.prototype.toRegex = function(pattern, options) {
  if (pattern instanceof RegExp) return pattern;
  var key = pattern;

  if (options) {
    for (var prop in options) {
      if (options.hasOwnProperty(prop)) {
        key += ':' + prop + ':' + String(options[prop]);
      }
    }
  }

  options = options || {};
  if (options.cache !== false && regexCache.hasOwnProperty(key)) {
    return regexCache[key];
  }

  var flags = options.flags || '';
  if (options.nocase === true && !/i/.test(flags)) {
    flags += 'i';
  }

  var prefix = options.strictOpen !== false ? '^' : '';
  var suffix = options.strictClose !== false ? '$' : '';

  try {
    var str = prefix + '(?:' + pattern + ')' + suffix;
    if (options.isNegated) {
      str = utils.not(str);
    }

    var re = new RegExp(str, flags);
    regexCache[key] = re;
    return re;
  } catch (err) {
    if (options.strict) throw err;
    return /$^/;
  }
};

/**
 * Expose `Snapdragon`
 */

module.exports = Snapdragon;

/**
 * Expose `Parser` and `Compiler`
 */

module.exports.Compiler = Compiler;
module.exports.Parser = Parser;
