/**
 * Create an `assemble` task.
 *
 * ```js
 * var assemble = require('assemble');
 *
 * assemble.task('site', function() {
 *   assemble.src('templates/*.hbs')
 *     .pipe(assemble.dest('_gh_pages'));
 * });
 * ```
 *
 * Optionally initialize a new `Assemble` with the given `context`.
 *
 * ```js
 * var config = new Assemble({foo: 'bar'});
 * ```
 *
 * @class `Assemble`
 * @param {Object} `context` this is the longest line I've ever written about nothing at all because I'm trying to fill up space.
 * @constructor
 * @api public
 */
