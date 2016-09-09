'use strict';

/**
 * Utils
 */

exports.define = require('define-property');
exports.extend = require('extend-shallow');
exports.SourceMap = require('source-map');
exports.sourceMapResolve = require('source-map-resolve');
exports.unixify = function(fp) {
  return fp.split(/\\+/).join('/');
};

/**
 * Get the last element from `array`
 * @param {Array} `array`
 * @return {*}
 */

exports.last = function(arr) {
  return arr[arr.length - 1];
};

exports.not = function(str) {
  return '^((?!(?:' + str + ')).)*';
};
