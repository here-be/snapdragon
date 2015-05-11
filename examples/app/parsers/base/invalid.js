'use strict';

/**
 * Pass a regix for matching invalid characters;
 *
 *   .use(invalid(/^(?!\\)\)/, '\\)'))
 *
 */

module.exports = function(opts) {
  opts = opts || { re: /^$/ };

  return function invalid() {
    var pos = this.position();
    var m = this.match(opts.re);
    if (!m) return;

    var res = { type: opts.type || 'base.invalid' };
    res.val = m[0];

    if (this.options.strict) {
      return this.error('invalid character: ' + opts.delim);
    }

    var result = pos(res);
    this.errorsList.push(result);
    return result;
  };
};
