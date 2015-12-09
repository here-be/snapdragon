'use strict';

var define = require('define-property');

/**
 * Store position information for a node
 */

function Position(start, str, node) {
  this.start = start;
  this.end = { line: node.lineno, column: node.column };
  define(this, 'source', str);
}

/**
 * Expose `Position`
 */

module.exports = Position;
