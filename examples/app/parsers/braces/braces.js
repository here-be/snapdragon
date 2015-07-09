'use strict';

module.exports = braces;

/**
 * Braces:
 *  | {a,b,c}
 *  | {1..5}
 *  | {1..10..2}
 */

function braces() {
  var pos = this.position();
  var open = this.braceOpen();
  if (!open) return;

  var inner = this.braceInner();
  var close = this.braceClose();
  var result = pos({
    type: 'braces.nodes',
    nodes: [open, inner, close].filter(Boolean)
  });

  if (!close) {
    if (this.strict) return this.error('missing closing brace: "}"');
    this.errorsList.push(result);
  }
  return result;
}
