'use strict';

var Render = require('./lib/render');
var Parse = require('./lib/parse');

/**
 * Parse the given string into an ast by calling
 * each parser in the middleware stack.
 *
 * @param  {String} `str` String to parse
 * @param  {Object} `options`
 * @return {Object} Returns a parsed ast
 * @api public
 */

exports.parser = function(str, options) {
  return new Parse(str, options);
};

/**
 * Render a string by visiting over an array of ast nodes.
 *
 * @param  {Object} `ast`
 * @param  {Object} `options`
 * @return {String} Rendered string.
 * @api public
 */

exports.renderer = function(ast, options) {
  return new Render(ast, options);
};

/**
 * Expose `Parse`
 */

exports.Parse = Parse;

/**
 * Expose `Render`
 */

exports.Render = Render;
