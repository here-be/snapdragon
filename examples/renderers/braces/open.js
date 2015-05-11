'use strict';

module.exports = open;

/**
 * Open brace.
 */

function open(node) {
  return this.emit('(', node.position);
}
