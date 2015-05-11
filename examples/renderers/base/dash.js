'use strict';

module.exports = dash;

/**
 *  Dash: '-'
 */

function dash(node) {
  return this.emit('-', node.position);
}

