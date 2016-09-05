'use strict';

/**
 * Throw a formatted error with the given `msg`
 * @param {String} `msg` Error message
 * @param {Object} `node` AST node
 */

module.exports = function(msg, node) {
  node = node || {position: {start: {}, end: {}}};
  var pos = node.position;
  var lineno = pos.start.lineno;
  var column = pos.start.column;
  var src = this.options.source;

  var message = src + ' <lineno:' + lineno + ' column:' + column + '>: ' + msg;
  var err = new Error(message);
  err.source = src;
  err.reason = msg;
  err.pos = pos;

  if (this.options.silent) {
    this.errors.push(err);
  } else {
    throw err;
  }
};
