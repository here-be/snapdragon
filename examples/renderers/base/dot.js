'use strict';

module.exports = dot;

/**
 * Dot: '/'
 */

function dot(node) {
  return this.emit('\\.', node.position);
}

