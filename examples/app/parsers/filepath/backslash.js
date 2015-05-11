'use strict';

module.exports = backslash;

/**
 * backslashes: '\'
 */

function backslash() {
  var pos = this.position();
  var m = this.match(/^\\(?=\w)/);
  if (!m) return;

  var val = m[0];
  if (/\w/.test(this.input.charAt(0))) {
    val = '';
  }

  return pos({
    type: 'filepath.backslash',
    val: val
  });
}
