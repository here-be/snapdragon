'use strict';

module.exports = space;

/**
 * Filepath space: ' '
 */

function space(node) {
  return this.emit('\\/', node.position);
}

