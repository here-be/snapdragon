'use strict';

module.exports = text;

/**
 * Text characters
 */

function text(node) {
  return this.emit(node.val, node.position);
}

