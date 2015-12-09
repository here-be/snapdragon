'use strict';

module.exports = close;

/**
 * Close brace.
 */

function close(node, prev, next) {
  var prevLen = (prev && prev.val.length);
  var len = node.val.length;
  var res = '';
  while (len-- && prevLen > 1) {
    res += ')';
  }
  return this.emit(res, node.position);
}
