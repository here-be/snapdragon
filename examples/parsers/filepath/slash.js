'use strict';

module.exports = slash;

/**
 * slashes
 */

function slash() {
  var pos = this.position();
  var m = this.match(/^\//);
  if (!m) return;

  return pos({
    type: 'filepath.slash',
    val: m[0]
  });
}
