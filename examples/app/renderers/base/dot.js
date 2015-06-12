'use strict';

module.exports = dot;

/**
 * Render a dot: '/'
 */

function dot(node) {
  return this.emit('\\.', node.position);
}

