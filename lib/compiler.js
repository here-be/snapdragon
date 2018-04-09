'use strict';

var use = require('use');
var util = require('snapdragon-util');
var Emitter = require('component-emitter');
var define = require('define-property');
var extend = require('extend-shallow');
var error = require('./error');

/**
 * Create a new `Compiler` with the given `options`.
 *
 * ```js
 * var Snapdragon = require('snapdragon');
 * var Compiler = Snapdragon.Compiler;
 * var compiler = new Compiler();
 * ```
 * @param {Object} `options`
 * @param {Object} `state` Optionally pass a "state" object to use inside visitor functions.
 * @api public
 */

function Compiler(options, state) {
  this.options = extend({source: 'string'}, options);
  this.emitter = new Emitter();
  this.on = this.emitter.on.bind(this.emitter);
  this.isCompiler = true;
  this.state = state || {};
  this.state.inside = this.state.inside || {};
  this.compilers = {};
  this.output = '';
  this.indent = '';
  this.set('eos', function(node) {
    return this.emit(node.val, node);
  });
  this.set('bos', function(node) {
    return this.emit(node.val, node);
  });
  use(this);
}

/**
 * Prototype methods
 */

Compiler.prototype = {

  /**
   * Throw a formatted error message with details including the cursor position.
   *
   * ```js
   * compiler.set('foo', function(node) {
   *   if (node.val !== 'foo') {
   *     throw this.error('expected node.val to be "foo"', node);
   *   }
   * });
   * ```
   * @name .error
   * @param {String} `msg` Message to use in the Error.
   * @param {Object} `node`
   * @return {undefined}
   * @api public
   */

  error: function(/*msg, node*/) {
    return error.apply(this, arguments);
  },

  /**
   * Concat the given string to `compiler.output`.
   *
   * ```js
   * compiler.set('foo', function(node) {
   *   this.emit(node.val, node);
   * });
   * ```
   * @name .emit
   * @param {String} `string`
   * @param {Object} `node` Optionally pass the node to use for position if source maps are enabled.
   * @return {String} returns the string
   * @api public
   */

  emit: function(val, node) {
    this.output += val;
    return val;
  },

  /**
   * Emit an empty string to effectively "skip" the string for the given `node`,
   * but still emit the position and node type.
   *
   * ```js
   * // example: do nothing for beginning-of-string
   * snapdragon.compiler.set('bos', compiler.noop);
   * ```
   * @name .noop
   * @param {Object} node
   * @api public
   */

  noop: function(node) {
    this.emit('', node);
  },

  /**
   * Define a non-enumberable property on the `Compiler` instance. This is useful
   * in plugins, for exposing methods inside handlers.
   *
   * ```js
   * compiler.define('customMethod', function() {
   *   // do stuff
   * });
   * ```
   * @name .define
   * @param {String} `key` propery name
   * @param {any} `val` property value
   * @return {Object} Returns the Compiler instance for chaining.
   * @api public
   */

  define: function(key, val) {
    define(this, key, val);
    return this;
  },

  /**
   * Add a compiler `fn` for the given `type`. Compilers are called
   * when the `.compile` method encounters a node of the given type to
   * generate the output string.
   *
   * ```js
   * compiler
   *   .set('comma', function(node) {
   *     this.emit(',');
   *   })
   *   .set('dot', function(node) {
   *     this.emit('.');
   *   })
   *   .set('slash', function(node) {
   *     this.emit('/');
   *   });
   * ```
   * @name .set
   * @param {String} `type`
   * @param {Function} `fn`
   * @api public
   */

  set: function(type, fn) {
    this.compilers[type] = fn;
    return this;
  },

  /**
   * Get the compiler of the given `type`.
   *
   * ```js
   * var fn = compiler.get('slash');
   * ```
   * @name .get
   * @param {String} `type`
   * @api public
   */

  get: function(type) {
    return this.compilers[type];
  },

  /**
   * Visit `node` using the registered compiler function associated with the
   * `node.type`.
   *
   * ```js
   * compiler
   *   .set('i', function(node) {
   *     this.visit(node);
   *   })
   * ```
   * @name .visit
   * @param {Object} `node`
   * @return {Object} returns the node
   * @api public
   */

  visit: function(node) {
    if (util.isOpen(node)) {
      util.addType(this.state, node);
    }

    this.emitter.emit('node', node);

    var fn = this.compilers[node.type] || this.compilers.unknown;
    if (typeof fn !== 'function') {
      throw this.error('compiler "' + node.type + '" is not registered', node);
    }

    var val = fn.call(this, node) || node;
    if (util.isNode(val)) {
      node = val;
    }

    if (util.isClose(node)) {
      util.removeType(this.state, node);
    }
    return node;
  },

  /**
   * Iterate over `node.nodes`, calling [visit](#visit) on each node.
   *
   * ```js
   * compiler
   *   .set('i', function(node) {
   *     utils.mapVisit(node);
   *   })
   * ```
   * @name .mapVisit
   * @param {Object} `node`
   * @return {Object} returns the node
   * @api public
   */

  mapVisit: function(parent) {
    var nodes = parent.nodes || parent.children;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!node.parent) node.parent = parent;
      nodes[i] = this.visit(node) || node;
    }
  },

  /**
   * Compile the given `AST` and return a string. Iterates over `ast.nodes`
   * with [mapVisit](#mapVisit).
   *
   * ```js
   * var ast = parser.parse('foo');
   * var str = compiler.compile(ast);
   * ```
   * @name .compile
   * @param {Object} `ast`
   * @param {Object} `options` Compiler options
   * @return {Object} returns the node
   * @api public
   */

  compile: function(ast, options) {
    var opts = extend({}, this.options, options);
    this.ast = ast;
    this.output = '';

    // source map support
    if (opts.sourcemap) {
      var sourcemaps = require('./source-maps');
      sourcemaps(this);
      this.mapVisit(this.ast);
      this.applySourceMaps();
      this.map = opts.sourcemap === 'generator' ? this.map : this.map.toJSON();
    } else {
      this.mapVisit(this.ast);
    }

    return this;
  }
};

/**
 * Expose `Compiler`
 */

module.exports = Compiler;
