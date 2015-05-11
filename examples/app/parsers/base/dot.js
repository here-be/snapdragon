'use strict';

module.exports = dot;

/**
 * dots: '.'
 */

function dot() {
  var pos = this.position();
  var m = this.match(/^\./);
  if (!m) return;

  return pos({
    type: 'base.dot',
    val: m[0]
  });
}
