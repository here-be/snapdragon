'use strict';

/**
 * Store the position for a node
 */

module.exports = function Position(start, parser) {
  this.start = start;
  this.end = { line: parser.line, column: parser.column };
};
