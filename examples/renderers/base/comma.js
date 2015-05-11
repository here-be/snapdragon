'use strict';

module.exports = comma;

/**
 * Filepath comma: ','
 */

function comma(node) {
  return this.emit('|', node.position);
}

