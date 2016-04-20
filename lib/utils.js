'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('define-property', 'define');
require('extend-shallow', 'extend');
require('source-map', 'SourceMap');
require('source-map-resolve');
require('urix');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
