'use strict';

/**
 * Store position information for a node
 */

function Position(start, str, thisArg) {
  this.start = start;
  this.end = { line: thisArg.lineno, column: thisArg.column };
  this.source = str;
}

/**
 * Expose `Position`
 */

module.exports = Position;
