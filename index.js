'use strict';

var define = require('define-property');
var extend = require('extend-shallow');
var Compiler = require('./lib/compiler');
var Parser = require('./lib/parser');

/**
 * Create a new instance of `Snapdragon` with the given `options`.
 *
 * ```js
 * var Snapdragon = require('snapdragon');
 * var snapdragon = new Snapdragon();
 * ```
 * @param {Object} `options`
 * @api public
 */

function Snapdragon(options) {
  if (typeof options === 'string') {
    var protoa = Object.create(Snapdragon.prototype);
    Snapdragon.call(protoa);
    return protoa.render.apply(protoa, arguments);
  }

  if (!(this instanceof Snapdragon)) {
    var protob = Object.create(Snapdragon.prototype);
    Snapdragon.call(protob);
    return protob;
  }

  this.define('cache', {});
  this.options = extend({source: 'string'}, options);
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
 * Define a non-enumerable property or method on the Snapdragon instance.
 * Useful in plugins for adding convenience methods that can be used in
 * nodes.
 *
 * ```js
 * snapdraong.define('isTypeFoo', function(node) {
 *   return node.type === 'foo';
 * });
 *
 * // inside a handler
 * snapdragon.set('razzle-dazzle', function(node) {
 *   if (this.isTypeFoo(node.parent)) {
 *     // do stuff
 *   }
 * });
 * ```
 * @param {String} `name` Name of the property or method being defined
 * @param {any} `val` Property value
 * @return {Object} Returns the instance for chaining.
 * @api public
 */

Snapdragon.prototype.define = function(key, val) {
  define(this, key, val);
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
  var opts = extend({}, this.options, options);
  var ast = this.parser.parse(str, opts);
  // add non-enumerable parser reference to AST
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
  var opts = extend({}, this.options, options);
  return this.compiler.compile(ast, opts);
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
  return this.compile(ast, options).output;
};

/**
 * Get or set a `Snapdragon.Compiler` instance.
 * @api public
 */

Object.defineProperty(Snapdragon.prototype, 'compiler', {
  configurable: true,
  set: function(val) {
    this.cache.compiler = val;
  },
  get: function() {
    if (!this.cache.compiler) {
      this.cache.compiler = new Compiler(this.options);
    }
    return this.cache.compiler;
  }
});

/**
 * Get or set a `Snapdragon.Parser` instance.
 * @api public
 */

Object.defineProperty(Snapdragon.prototype, 'parser', {
  configurable: true,
  set: function(val) {
    this.cache.parser = val;
  },
  get: function() {
    if (!this.cache.parser) {
      this.cache.parser = new Parser(this.options);
    }
    return this.cache.parser;
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
 * Expose `Parser` and `Compiler`
 */

Snapdragon.Compiler = Compiler;
Snapdragon.Parser = Parser;

/**
 * Expose `Snapdragon`
 */

module.exports = Snapdragon;
