'use strict';

/**
 * Store position information for a node
 */

function Position(start, source, thisArg) {
  this.start = start;
  this.end = { line: thisArg.lineno, column: thisArg.column };
  this.source = source;
}

/**
 * Expose `Position`
 */

module.exports = Position;
