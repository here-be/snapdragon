
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
 *     @property {String} `option.a` This is the first option.
 *     @property {Object} `option.b` This is the second option.
 *     @property {Array} `option.c` This is the third option.
 * @param {String} `foo`
 *   @property {String} `foo.a` This is the first foo.
 *   @property {Object} `foo.b` This is the second foo.
 *   @property {Array} `foo.c` This is the third foo.
 * @param {*} `value`
 * @return {Options} for chaining
 * @chainable
 * @api public
 */

Config.prototype.hasOwn = function hasOwn(key) {
  return {}.hasOwnProperty.call(this.cache, key);
};

