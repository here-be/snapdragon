'use strict';

var extend = require('extend-shallow');
var Render = require('./lib/render');
var Parse = require('./lib/parse');

function Snapdragon(str, options) {
  this.options = options || {};
  this.input = str;
  this.transforms = {};
}

/**
 * Transforms are used to extend or modify the `this` object
 * upon initialization.
 *
 * @param {String} `name` The name of the transform to add.
 * @param {Function} `fn` The actual transform function.
 * @return {Object} Returns `Snapdragon` for chaining.
 * @api public
 */

Snapdragon.prototype.transform = function(name, fn) {
  if (typeof name !== 'string') {
    throw new TypeError('Snapdragon#transform expects `name` to be a string.');
  }
  if (arguments.length === 1) {
    return this.transforms[name];
  }
  if (fn && typeof fn === 'function') {
    this.transforms[name] = fn;
    fn.call(this, this);
  }
  return this;
};

/**
 * Add a method to the `Snapdragon` prototype.
 *
 * @param  {string} `name`
 * @param  {Function} `fn`
 */

Snapdragon.prototype.mixin = function(name, fn) {
  if (typeof name !== 'string') {
    throw new TypeError('Snapdragon#mixin expects `name` to be a string.');
  }
  if (name && fn && typeof fn === 'function') {
    Snapdragon.prototype[name] = fn.bind(this);
  }
  return this;
};

/**
 * Parse the given string into an ast by calling
 * each parser in the middleware stack.
 *
 * @param  {String} `str` String to parse
 * @param  {Object} `options`
 * @return {Object} Returns a parsed ast
 * @api public
 */

Snapdragon.prototype.parse = function(str, options) {
  if (str && typeof str === 'object') {
    options = str;
    str = null;
  }
  var opts = extend({}, this.options, options);
  this.input = str || this.input;
  if (typeof this.input === 'undefined') {
    throw new TypeError('Snapdragon#parse expects a string');
  }
  return new Parse(this.input, opts);
};

/**
 * Render a string by visiting over an array of ast nodes.
 *
 * @param  {Object} `ast`
 * @param  {Object} `options`
 * @return {String} Rendered string.
 * @api public
 */

Snapdragon.prototype.render = function(ast, options) {
  var opts = extend({}, this.options, options);
  return new Render(ast, options);
};

/**
 * Expose `Snapdragon`
 */

module.exports = Snapdragon;

/**
 * Expose `Parse`
 */

module.exports.Parser = Parse;

/**
 * Expose `Render`
 */

module.exports.Renderer = Render;
