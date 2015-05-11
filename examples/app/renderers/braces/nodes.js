'use strict';

module.exports = braces;

/**
 * Braces
 */

function braces(node) {
  var val = node.val || '';
  if (node.nodes && node.nodes.length) {
    val += this.mapVisit(node.nodes);
  }
  return this.emit(val, node.position);
}
