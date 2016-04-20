'use strict';

var utils = require('./utils');

/**
 * Store position information for a node
 */

module.exports = function Position(start, str, node) {
  this.start = start;
  this.end = { line: node.lineno, column: node.column };
  utils.define(this, 'source', str);
};
