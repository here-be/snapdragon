'use strict';

module.exports = invalid;

/**
 * Invalide brace
 */

function invalid(node) {
  var val = node.val;
  if (val === '}') {
    return this.emit('\\}', node.position);
  }
  return this.emit('\\{', node.position);
}
