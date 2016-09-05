'use strict';

/**
 * Utils
 */

exports.define = require('define-property');
exports.extend = require('extend-shallow');
exports.SourceMap = require('source-map');
exports.sourceMapResolve = require('source-map-resolve');
exports.urix = require('urix');

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
