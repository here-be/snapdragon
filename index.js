'use strict';

var Base = require('base');
var define = require('define-property');
var Compiler = require('./lib/compiler');
var Parser = require('./lib/parser');
var utils = require('./lib/utils');

/**
 * Create a new instance of `Snapdragon` with the given `options`.
 *
 * ```js
 * var Snapdragon = require('snapdragon');
 * var snapdragon = new Snapdragon();
 * ```
 *
 * @param {Object} `options`
 * @api public
 */

function Snapdragon(options) {
  Base.call(this, null, options);
  this.define('cache', {});
  this.options = utils.extend({source: 'string'}, this.options);
  this.isSnapdragon = true;
  this.plugins = {
    fns: [],
    preprocess: [],
    visitors: {},
    before: {},
    after: {}
  };
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
 * Parse the given `str` and return an AST.
 *
 * ```js
 * var snapdragon = new Snapdgragon([options]);
 * var ast = snapdragon.parse('foo/bar');
 * console.log(ast);
 * ```
 * @param {String} `str`
 * @param {Object} `options` Set `options.sourcemap` to true to enable source maps.
 * @return {Object} Returns an AST.
 * @api public
 */

Snapdragon.prototype.parse = function(str, options) {
  var opts = utils.extend({}, this.options, options);
  var ast = this.parser.parse(str, opts);
  // add non-enumerable reference to the parser instance
  define(ast, 'parser', this.parser);
  return ast;
};

/**
 * Compile an `ast` returned from `snapdragon.parse()`
 *
 * ```js
 * // compile
 * var res = snapdragon.compile(ast);
 * // get the compiled output string
 * console.log(res.output);
 * ```
 * @param {Object} `ast`
 * @param {Object} `options`
 * @return {Object} Returns an object with an `output` property with the rendered string.
 * @api public
 */

Snapdragon.prototype.compile = function(ast, options) {
  var opts = utils.extend({}, this.options, options);
  var compiled = this.compiler.compile(ast, opts);
  // add non-enumerable reference to the compiler instance
  define(compiled, 'compiler', this.compiler);
  return compiled;
};

/**
 * Renders the given string or AST by calling `snapdragon.parse()` (if it's a string)
 * then `snapdragon.compile()`, and returns the output string.
 *
 * ```js
 * // setup parsers and compilers, then call render
 * var str = snapdragon.render([string_or_ast]);
 * console.log(str);
 * ```
 * @param {Object} `ast`
 * @param {Object} `options`
 * @return {Object} Returns an object with an `output` property with the rendered string.
 * @api public
 */

Snapdragon.prototype.render = function(ast, options) {
  if (typeof ast === 'string') {
    ast = this.parse(ast, options);
  }
  var compiled = this.compile(ast, options);
  return compiled.output;
};

/**
 * Get or set a `Snapdragon.Compiler` instance.
 * @api public
 */

Object.defineProperty(Snapdragon.prototype, 'compiler', {
  set: function(val) {
    this.cache.compiler = val;
  },
  get: function() {
    if (this.cache.compiler) {
      return this.cache.compiler;
    }
    return (this.cache.compiler = new Compiler(this.options));
  }
});

/**
 * Get or set a `Snapdragon.Parser` instance.
 * @api public
 */

Object.defineProperty(Snapdragon.prototype, 'parser', {
  set: function(val) {
    this.cache.parser = val;
  },
  get: function() {
    if (this.cache.parser) {
      return this.cache.parser;
    }
    return (this.cache.parser = new Parser(this.options));
  }
});

/**
 * Get the compilers from a `Snapdragon.Compiler` instance.
 * @api public
 */

Object.defineProperty(Snapdragon.prototype, 'compilers', {
  get: function() {
    return this.compiler.compilers;
  }
});

/**
 * Get the parsers from a `Snapdragon.Parser` instance.
 * @api public
 */

Object.defineProperty(Snapdragon.prototype, 'parsers', {
  get: function() {
    return this.parser.parsers;
  }
});

/**
 * Get the regex cache from a `Snapdragon.Parser` instance.
 * @api public
 */

Object.defineProperty(Snapdragon.prototype, 'regex', {
  get: function() {
    return this.parser.regex;
  }
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
