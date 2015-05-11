'use strict';

module.exports = ext;

/**
 * File extensions: '.js'
 */

function ext(node) {
  return this.emit(node.val, node.position);
}
