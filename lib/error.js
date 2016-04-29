'use strict';

/**
 * Set an error message with the current line
 * number and column.
 *
 * ```js
 * this.error('Error parsing string.');
 * ```
 * @name .error
 * @param {String} `msg` Message to use in the Error.
 * @api public
 */

module.exports = function(app) {
  return function(msg, token) {
    if (Array.isArray(msg)) {
      msg = msg.join(' ');
    }
    var message = '';
    if (token) {
      var pos = token.position;
      var start = pos.start;
      var end = pos.end;

      var m = '';
      if (pos.start.line !== pos.end.line) {
        m = 'from row:' + start.line + ' col:' + start.column + ' ';
        m += 'to row:' + end.line + ' col:' + end.column;
      } else {
        m = 'row:' + start.line + ' col:' + start.column + ' ';
      }
      message += m;
    } else if (app.lineno) {
      message += 'row:' + app.lineno + ' ';
      message += 'col:' + app.column + ' > ';
    }
    message += msg;

    var err = new Error(message);
    err.reason = msg;
    err.source = app.source;
    if (app.lineno) {
      err.lineno = app.lineno;
      err.column = app.column;
    }

    if (app.options.silent) {
      app.errors.push(err);
    } else {
      return err;
    }
  };
};
