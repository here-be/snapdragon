
/**
 * ## .option
 *
 * Extend the options.
 *
 * **Example**
 *
 * ```js
 * option
 *   .option('layouts', 'src/layouts')
 *   .option('partials', 'src/partials/*.hbs');
 * ```
 *
 * @method `option`
 * @param {String} `option`
 *     @option {String} `option.a` This is the first option.
 *     @option {Object} `option.b` This is the second option.
 *     @option {Array} `option.c` This is the third option.
 * @param {*} `value`
 * @param {String} `key`
 * @return {Options} for chaining
 * @chainable
 * @api public
 */

Config.prototype.hasOwn = function hasOwn(key) {
  return {}.hasOwnProperty.call(this.cache, key);
};



/**
 * ## .set
 *
 * Reads a template from a file and sets it
 *
 * **Example:**
 *
 * ```js
 * partials.set('templates/index.tmpl');
 * ```
 *
 * @chainable
 * @param  {String} `filepath`
 * @param  {Object} `options`
 *    @option {String} [options] `autodetect` default to `true`
 * @return {Object} this for chaining
 * @api public
 */

Config.prototype.set = function set(key) {
  return {}.hasOwnProperty.call(this.cache, key);
};
