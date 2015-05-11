'use strict';

module.exports = dash;

/**
 * Capture a dash '-'
 */

function dash() {
  var pos = this.position();
  var m = this.match(/^-/);
  if (!m) return;

  return pos({
    type: 'base.dash',
    val: m[0]
  });
}
