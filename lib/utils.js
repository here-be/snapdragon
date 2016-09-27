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
 * Cast `val` to an array
 * @return {Array}
 */

exports.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
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

exports.escape = function(str) {
  return exports.isString(str) && str.charAt(0) !== '\\' ? ('\\' + str) : '';
};

exports.isString = function(str) {
  return str && typeof str === 'string';
};
