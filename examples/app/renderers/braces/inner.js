'use strict';

module.exports = inner;

/**
 * Inner brace.
 */

function inner(node) {
  if (!Array.isArray(node.val)) {
    return this.emit(node.val, node.position);
  }
  return this.emit(node.val.join('|'), node.position);
}
