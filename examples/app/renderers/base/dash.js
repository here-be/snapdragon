'use strict';

module.exports = dash;

/**
 *  Render a dash: '-'
 */

function dash(node) {
  return this.emit('-', node.position);
}

