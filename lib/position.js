'use strict';

var define = require('define-property');

/**
 * Store position information for a node
 */

function Position(start, str, thisArg) {
  this.start = start;
  this.end = { line: thisArg.lineno, column: thisArg.column };
  define(this, 'source', str);
}

/**
 * Expose `Position`
 */

module.exports = Position;
