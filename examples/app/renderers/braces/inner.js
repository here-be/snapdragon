'use strict';

module.exports = inner;

/**
 * Inner brace.
 */

function inner(node) {
  if (!Array.isArray(node.val)) {
    return this.emit(node.val, node.position);
  }

  node.val.forEach(function (seg) {
    this.patterns.push(node.head + seg + node.tail);
  }.bind(this));

  return this.emit(node.val.join('|'), node.position);
}
