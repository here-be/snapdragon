'use strict';

module.exports = slash;

/**
 * Slash: '/'
 */

function slash(node) {
  return this.emit('\\' + node.val, node.position);
}
