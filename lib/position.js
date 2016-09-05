'use strict';

var utils = require('./utils');

/**
 * Store position for a node
 */

module.exports = function Position(start, parser) {
  this.start = start;
  this.end = { lineno: parser.lineno, column: parser.column };
  utils.define(this, 'source', parser.options.source);
};
