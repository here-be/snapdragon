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
  return function(msg) {
    var message = '';
    if (app.lineno) {
      message += 'lineno:' + app.lineno + ' ';
      message += 'column:' + app.column + ' > ';
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
