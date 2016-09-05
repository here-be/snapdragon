'use strict';

/**
 * Store position information for a node
 */

module.exports = function Position(start, state) {
  this.start = start;
  this.end = { line: state.lineno, column: state.column };
};
