'use strict';

var argv = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');

/**
 * Create an instance of `Renderer`. This is only necessary
 * if need to create your own instance.
 *
 * ```js
 * var renderer = new snapdragon.Renderer();
 * ```
 *
 * @param {Object} `ast` Pass the ast from the `Parse` method
 * @api public
 */

function Renderer(ast, opts) {
  this.options = opts || {};
  this.patterns = [];

  this.ast = ast;
  this.orig = this.ast.orig;
  this.stash = ast.stash;
  this.length = ast.nodes.length;
  this.errorsList = [];
  this.parsingErrors = this.ast.errorsList;
  this.renderers = this.options.renderers || {};
  this._result = '';

  this.debug = function() {
    arguments[0] = chalk.cyan(arguments[0]);
    return console.log.apply(console, arguments);
  };
}

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

Renderer.prototype.error = function(msg) {
  var message = ''
    + ':' + this.column
    + ': ' + msg;

  var err = new Error(message);
  err.filename = this.options.source;
  err.source = this.input;
  err.reason = msg;
  console.log(chalk.yellow(err));

  if (this.options.silent) {
    this.errorsList.push(err);
  } else {
    throw err;
  }
};

/**
 * Register a renderer for a corresponding parser `type`.
 *
 * ```js
 * var ast = snapdragon.parse(str)
 *   .use(function() {
 *     // `type` is the name of the renderer to use
 *     return pos({ type: 'dot' });
 *   })
 *
 * var res = snapdragon.render(ast, options)
 *   .set('dot', function (node) {
 *     return this.emit(node.val);
 *   })
 * ```
 *
 * @param  {String} `name` Name of the renderer to register
 * @param  {Function} `fn` Function to register
 * @return {Object} `this` to enable chaining.
 * @api public
 */

Renderer.prototype.set = function(name, fn) {
  if (typeof name !== 'string') {
    throw new Error('Renderer#set expects `name` to be a string, but got: ' + name);
  }
  if (typeof fn !== 'function') {
    throw new Error('Renderer#set expects `fn` to be a function, but got: ' + fn);
  }
  this.renderers[name] = fn;
  return this;
};

/**
 * Emit `str`
 */

Renderer.prototype.emit = function(str) {
  return str;
};

/**
 * Visit `node`.
 */

Renderer.prototype.visit = function(node) {
  var fn = this.renderers[node.type];
  if (argv.verbose || argv.v) {
    console.log(chalk.yellow(node.type));
    console.log(node);
  }
  if (typeof fn !== 'function') {
    this.error('visit expects "' + node.type + ' | ' +  node.val + '" to be a function.');
  }
  return fn.call(this, node);
};

/**
 * Map `visit` over array of `nodes`, optionally using
 * a `delim`
 */

Renderer.prototype.mapVisit = function(nodes, delim) {
  delim = delim || '';
  var buf = '', len = nodes.length;
  for (var i = 0; i < len; i++) {
    buf += this.visit(nodes[i]);
    if (delim && i < len - 1) buf += this.emit(delim);
  }
  return buf;
};

/**
 * Render.
 */

Renderer.prototype.render = function() {
  var opts = this.options;
  var ast = this.ast;
  this.orig = ast.orig;

  // source maps
  if (opts.sourcemap) {
    var sourcemaps = require('../lib/source-maps');
    sourcemaps(this);
  }

  var result = this.mapVisit(ast.nodes);
  var head = this.stash.head;
  var len = head.length;
  var h = '';
  while (len--) h += head[len];
  this.result = h + result;

  if (opts.sourcemap) {
    this.applySourceMaps();
    this.map = opts.sourcemap === 'generator' ? this.map : this.map.toJSON();
  }
  return this;
};

/**
 * Expose `Renderer`.
 */

module.exports = Renderer;
