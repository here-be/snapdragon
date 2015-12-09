
/**
 * Read in source files from file paths or glob patterns. 
 *
 * ```js
 * verb.src('src/*.hbs', {layout: 'default'});
 * ```
 *
 * **Example usage**
 *
 * ```js
 * verb.task('site', function() {
 *   verb.src('src/*.hbs', {layout: 'default'})
 *     verb.dest('dist');
 * });
 * ```
 *
 * @param {String|Array} `glob` Glob patterns or file paths to source files.
 * @param {Object} `options` Options or locals to merge into the context and/or pass to `src` plugins
 * @api public
 */

Verb.prototype.src = function(glob, opts) {
  return stack.src(this, glob, opts);
};