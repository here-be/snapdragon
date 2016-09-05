'use strict';

var utils = module.exports;

/**
 * Utils
 */

utils.extend = require('extend-shallow');
utils.define = require('define-property');

/**
 * Get the last element from `array`
 * @param {Array} `array`
 * @return {*}
 */

utils.last = function(arr) {
  return arr[arr.length - 1];
};
