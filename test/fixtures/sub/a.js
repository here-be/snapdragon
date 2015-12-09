
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
 * @param {String} `options` These are the available options:
 *     @option [options] {String} `a` This is the first option.
 *     @option [options] {Object} `b` This is the second option.
 *     @option [options] {Array} `c` This is the third option.
 * @param {String} `config` These are the properties on the config:
 *     @option [config] {String} `a` This is the first config.
 *     @option [config] {Object} `b` This is the second config.
 *     @option [config] {Array} `c` This is the third config.
 * @param {String} `params` These are the params:
 *     @option [params] {String} `a` This is the first param.
 *     @option [params] {Object} `b` This is the second param.
 *     @option [params] {Array} `c` This is the third param.
 * @param {*} `value`
 * @return {Options} for chaining
 * @chainable
 * @api public
 */

function Config(obj) {
  this.cache = obj || {};
  this.cache.options = this.cache.options || {};

  this.option = new Options(this.cache.options);
}
