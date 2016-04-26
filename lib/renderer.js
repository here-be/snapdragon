'use strict';

var debug = require('debug')('renderer');
var error = require('./error');
var utils = require('./utils');

/**
 * Create an instance of `Renderer`.
 *
 * ```js
 * var parser = new Parser();
 * var ast = parser.parse('foo');
 *
 * var renderer = new Renderer();
 * var res = renderer.render(ast);
 * ```
 * @param {Object} `ast` Takes the ast create by `.parse`
 * @param {Object} `options`
 * @api public
 */

function Renderer(options) {
  if (!(this instanceof Renderer)) {
    return new Renderer(options);
  }

  this.options = utils.extend({}, options);
  this.rendered = '';
  this.errors = [];
  this.renderers = {};
  this.fns = [];
  this.ast = [];
  this.error = error(this);
}

/**
 * Prototype methods
 */

Renderer.prototype = {
  constructor: Renderer,

  /**
   * Register a renderer for a corresponding parser `type`.
   *
   * ```js
   * var ast = parse(str)
   *   .use(function() {
   *     // `type` is the name of the renderer to use
   *     return pos({ type: 'dot' });
   *   })
   *
   * var res = render(ast, options)
   *   .set('dot', function(node) {
   *     return this.emit(node.val);
   *   })
   * ```
   * @name .set
   * @param  {String} `name` Name of the renderer to register
   * @param  {Function} `fn` Function to register
   * @return {Object} Returns the `renderer` instance for chaining.
   * @api public
   */

  set: function(name, fn) {
    debug('Registered: %s', name);
    this.renderers[name] = fn;
    return this;
  },

  /**
   * Emit `str`
   */

  emit: function(str) {
    return str;
  },

  /**
   * Visit `node`
   */

  visit: function(node, nodes, i) {
    var fn = this.renderers[node.type];
    debug('Visiting node.type: %s: %j', node.type, node);

    if (typeof fn !== 'function') {
      var msg = 'renderer "' + node.type
        + '" is not registered. Failed to render string "'
        + node.val + '"';
      throw this.error(msg);
    }

    var res = fn.call(this, node, nodes, i);
    this.rendered += res;
    return res;
  },

  /**
   * Map `visit` over array of `nodes`
   */

  mapVisit: function(nodes) {
    var len = nodes.length;
    var buf = '';
    for (var i = 0; i < len; i++) {
      buf += this.visit(nodes[i], nodes, i);
    }
    return buf;
  },

  /**
   * Iterate over each node in the given AST and call renderer `type`.
   *
   * ```js
   * var ast = snapdragon.parse('foo/bar');
   * var res = snapdragon.render(ast);
   * console.log(res);
   *
   * // enable sourcemap
   * var ast = snapdragon.parse('foo/bar');
   * var res = snapdragon.render(ast, {sourcemap: true});
   * console.log(res);
   * ```
   * @name .render
   * @return {Object} Object representing the parsed AST
   * @api public
   */

  render: function(ast, options) {
    var opts = utils.extend({}, this.options, options);
    this.ast = ast;
    this.parsingErrors = this.ast.errors;
    this.original = this.ast.original;
    this.source = this.ast.source;
    this.length = this.ast.nodes.length;

    // source maps
    if (opts.sourcemap) {
      var sourcemaps = require('./source-maps');
      sourcemaps(this);
    }

    this.mapVisit(this.ast.nodes);
    if (opts.sourcemap) {
      this.applySourceMaps();
      this.map = opts.sourcemap === 'generator' ? this.map : this.map.toJSON();
    }
    return this;
  }
};

/**
 * Expose `Renderer`.
 */

module.exports = Renderer;
