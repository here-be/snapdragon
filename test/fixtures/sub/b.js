
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
 *     @option {String} [options] `a` This is the first option.
 *     @option {Object} [options] `b` This is the second option.
 *     @option {Array} [options] `c` This is the third option.
 * @param {String} `config` These are the properties on the config:
 *     @option {String} [config] `a` This is the first config.
 *     @option {Object} [config] `b` This is the second config.
 *     @option {Array} [config] `c` This is the third config.
 * @param {String} `params` These are the params:
 *     @option {String} [params] `a` This is the first param.
 *     @option {Object} [params] `b` This is the second param.
 *     @option {Array} [params] `c` This is the third param.
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
 *     @foo {String} [options] `a` This is the first option.
 *     @foo {Object} [options] `b` This is the second option.
 *     @foo {Array} [options] `c` This is the third option.
 * @param {String} `config` These are the properties on the config:
 *     @bar {String} [config] `a` This is the first config.
 *     @bar {Object} [config] `b` This is the second config.
 *     @bar {Array} [config] `c` This is the third config.
 * @param {String} `params` These are the params:
 *     @baz {String} [params] `a` This is the first param.
 *     @baz {Object} [params] `b` This is the second param.
 *     @baz {Array} [params] `c` This is the third param.
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
 *     @foo [options] {String} `a` This is the first option.
 *     @foo [options] {Object} `b` This is the second option.
 *     @foo [options] {Array} `c` This is the third option.
 * @param {String} `config` These are the properties on the config:
 *     @bar [config] {String} `a` This is the first config.
 *     @bar [config] {Object} `b` This is the second config.
 *     @bar [config] {Array} `c` This is the third config.
 * @param {String} `params` These are the params:
 *     @baz [params] {String} `a` This is the first param.
 *     @baz [params] {Object} `b` This is the second param.
 *     @baz [params] {Array} `c` This is the third param.
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
