'use strict';

module.exports = open;

/**
 * Open brace.
 */

function open(node, prev, next) {
  var ch = (next && next.val.length > 1) ? '(?:' : '';
  return this.emit(ch, node.position);
}
