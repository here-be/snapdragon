'use strict';

module.exports = bashslash;

/**
 * Backslash: '\'
 */

function bashslash(node) {
  return this.emit(node.val, node.position);
}
