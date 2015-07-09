'use strict';

module.exports = nodes;

/**
 * Braces:
 *  | {a,b,c}
 *  | {1..5}
 *  | {1..10..2}
 */

function nodes() {
  var pos = this.position();
  var nodes = [], node;
  while (node = this.braceBraces()) {
    nodes.push(node);
  }
  if (!nodes.length) return;
  return pos({
    type: 'braces.nodes',
    nodes: nodes
  });
}
