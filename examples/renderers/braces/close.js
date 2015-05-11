'use strict';

module.exports = close;

/**
 * Close brace.
 */

function close(node) {
  return this.emit(')', node.position);
}
