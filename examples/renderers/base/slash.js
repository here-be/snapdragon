'use strict';

module.exports = slash;

/**
 * Filepath slash: '/'
 */

function slash(node) {
  return this.emit('\\/', node.position);
}

