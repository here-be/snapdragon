'use strict';

module.exports = invalid;

/**
 * Escape invalid characters: '\\'
 */

function invalid(node) {
  return this.emit('\\' + node.val, node.position);
}

