'use strict';

module.exports = escape;

/**
 * Filepath escape: '\\/'
 */

function escape(node) {
  if (node.prev === '[' && node.val === '\\]') {
    return this.emit('\\' + node.val, node.position);
  }
  return this.emit(node.val, node.position);
}

