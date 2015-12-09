

var util = require('util');
var frep = require('frep');
var _ = require('lodash');
var utils = require('./lib/utils.js');



/**
 * ## new Strings()
 *
 * > Strings constructor method
 *
 * Instantiate a new instance of Strings, optionally passing a default context to use.
 *
 * @return {Object} Instance of a Strings object
 */

function Strings(context) {
  if (!(this instanceof Strings)) {
    return new Strings(context);
  }

  this._context = context || {};
  this._replacements = {};
  this._propstrings = {};
  this._templates = {};
  this._patterns = {};
  this._parsers = {};
  this._groups = {};
}


/**
 * ## .desc
 *
 * Get
 * or
 * set
 * a
 * propstring.
 *
 * **Example**
 *
 * ```js
 * strings.propstring('permalinks', ':destBase/:dirname/:basename/index.:ext');
 * ```
 *
 * @method `propstring`
 * @param {String} `name`
 * @param {String} `propstring`
 * @return {Object} Instance of the current Strings object
 * @api public
 */


/**
 * ## .propstring (name, propstring)
 *
 * Get or set a propstring.
 *
 * **Example**
 *
 * ```js
 * strings.propstring('permalinks', ':destBase/:dirname/:basename/index.:ext');
 * ```
 *
 * @method `propstring`
 * @param {String} `name`
 * @param {String} `propstring`
 * @return {Object} Instance of the current Strings object
 * @api public
 */

Strings.prototype.propstring = function (name, str) {
  if (_.isUndefined(str)) {
    return this._propstrings[name];
  }
  this._propstrings[name] = str;
  return this;
};


/**
 * ## .pattern (name, pattern)
 *
 * Get or set regular expression or string.
 *
 * **Example**
 *
 * ```js
 * strings.pattern('prop', ':([\\w]+)');
 * ```
 *
 * @param {String} `name`
 * @param {String} `pattern`
 * @return {Object} Instance of the current Strings object
 * @api public
 */

Strings.prototype.pattern = function (name, pattern, flags) {
  if (_.isUndefined(pattern)) {
    return this._patterns[name];
  }
  if (!(pattern instanceof RegExp)) {
    pattern = new RegExp(pattern, flags || '');
  }
  this._patterns[name] = pattern;
  return this;
};


/**
 * ## .replacement (name, replacement)
 *
 * Get or set a replacement string or function.
 *
 * **Example**
 *
 * ```js
 * strings.replacement('prop', function(match) {
 *   return match.toUpperCase();
 * });
 * ```
 *
 * @param {String} `name`
 * @param {String} `replacement`
 * @return {Object} Instance of the current Strings object
 * @api public
 */

Strings.prototype.replacement = function (name, replacement) {
  if (_.isUndefined(replacement)) {
    return this._replacements[name];
  }
  this._replacements[name] = replacement;
  return this;
};


/**
 * ## .parser ( name, replacement-patterns )
 *
 * Define a named parser to be used against any given string.
 *
 * **Example**
 *
 * Pass an object:
 *
 * ```js
 * strings.parser('prop', {
 *   pattern: /:([\\w]+)/,
 *   replacement: function(match) {
 *     return match.toUpperCase();
 *   }
 * );
 * ```
 *
 * Or an array
 *
 * ```js
 * strings.parser('prop', [
 *   {
 *     pattern: 'a',
 *     replacement: 'b'
 *   },
 *   {
 *     pattern: 'c',
 *     replacement: 'd'
 *   }
 * ]);
 * ```
 *
 * @param {String} `name` name of the parser.
 * @param {Object|Array} `pairings` array of replacement patterns to store with the given name.
 *   @param {String|RegExp} `pattern`
 *   @param {String|Function} `replacement`
 * @return {Object} Instance of the current Strings object
 *
 * @api public
 */

Strings.prototype.parser = function (name, arr) {
  if (_.isUndefined(arr)) {
    return this._parsers[name];
  }
  this._parsers[name] = !Array.isArray(arr) ? [arr] : arr;
  return this;
};


/**
 * ## .extend ( parser, replacement-patterns )
 *
 * Extend a parser.
 *
 * **Example**
 *
 * ```js
 * strings.extend('prop', {
 *   pattern: /:([\\w]+)/,
 *   replacement: function(match) {
 *     return match.toUpperCase();
 *   }
 * );
 * ```
 *
 * @param {String} `name` name of the parser to extend.
 * @param {Object|Array} `arr` array of replacement patterns to store with the given name.
 *   @param {String|RegExp} `pattern`
 *   @param {String|Function} `replacement`
 * @return {Object} Instance of the current Strings object
 * @api public
 */

Strings.prototype.extend = function (name, arr) {
  arr = !Array.isArray(arr) ? [arr] : arr;
  var parser = _.union(this._parsers[name], arr);
  this._parsers[name] = parser;
  return this;
};


/**
 * ## .parsers ( parsers )
 *
 * Return a list of parsers based on the given list of named
 * parsers or parser objects.
 *
 * **Example**
 *
 * ```js
 * // pass an array of parser names
 * strings.parsers(['a', 'b', 'c']);
 *
 * // or a string
 * strings.parsers('a');
 * ```
 *
 * @param {String|Array} `parsers` named parsers or parser objects to use.
 * @return {Array}
 * @api public
 */

Strings.prototype.parsers = function (parsers) {
  // if there are no parsers specified, return them all
  if (_.isEmpty(parsers)) {
    parsers = _.keys(this._parsers);
  }

  parsers = Array.isArray(parsers) ? parsers : [parsers];

  // find the specified parsers
  var _parsers = _.map(parsers, function (parser) {
    // if this is an actual parser object, just return it
    if (_.isObject(parser)) {
      return parser;
    }

    // find the parser and return it
    if (this._parsers.hasOwnProperty(parser)) {
      return this._parsers[parser];
    }
  }, this);

  // finally normalize and return parsers
  return utils._normalize(_.flatten(_parsers));
};


/**
 * ## .template( name, propstring, parsers )
 *
 * Store, by name, a named propstring and an array of parsers.
 *
 * **Example**
 *
 * ```js
 * // strings.template(name string, array);
 * strings.template('prop', ['prop'], {
 *   foo: 'aaa',
 *   bar: 'bbb',
 *   baz: 'ccc'
 * });
 * ```
 *
 * @param {String} `name` The name of the template to store
 * @param {String} `name` Name of replacement group to use for building the final string
 * @param {Object} `context` Optional Object to bind to replacement function as `this`
 * @return {String}
 * @api public
 */

Strings.prototype.template = function (name, propstring, parsers) {
  if (_.isUndefined(propstring) && _.isUndefined(parsers)) {
    return this._templates[name];
  }

  if (arguments.length === 2 && typeof propstring === 'object') {
    this._templates[name] = {
      propstring: this.propstring(propstring.propstring),
      parsers: propstring.parsers
    }
  } else {
    this._templates[name] = {
      propstring: this.propstring(propstring),
      parsers: parsers
    }
  }

  return this;
};


/**
 * ## .transform( named-propstring, named-parsers, context)
 *
 * Similar to `.process`, except that the first parameter is the name
 * of the stored `propstring` to use, rather than any given string.
 *
 * **Example**
 *
 * ```js
 * strings.transform('propstring', ['parser'], {
 *   foo: 'aaa',
 *   bar: 'bbb',
 *   baz: 'ccc'
 * });
 * ```
 *
 * Or pass an object, `strings.transform({})`:
 *
 * ```js
 * strings.transform({
 *   propstring: 'prop',
 *   parsers: ['prop'],
 *   context: {
 *     foo: 'aaa',
 *     bar: 'bbb',
 *     baz: 'ccc'
 *   }
 * });
 * ```
 *
 * @param {String} `name` The name of the stored template to use
 * @param {Object} `context` The optional context object to bind to replacement functions as `this`
 * @return {String}
 * @api public
 */

Strings.prototype.transform = function (propstring, parsers, context) {
  if (arguments.length === 1) {
    propstring = propstring.propstring;
    parsers = propstring.parsers;
    context = propstring.context;
  }
  return this.process(this.propstring(propstring), parsers, context);
};



/**
 * ## .use( named-propstring, named-parsers, context)
 *
 * Similar to `.process`, except that the first parameter is the name
 * of the stored `propstring` to use, rather than any given string.
 *
 * **Example**
 *
 * ```js
 * strings.use('propstring', ['parser'], {
 *   foo: 'aaa',
 *   bar: 'bbb',
 *   baz: 'ccc'
 * });
 * ```
 *
 * Or pass an object, `strings.use({})`:
 *
 * ```js
 * strings.use({
 *   propstring: 'prop',
 *   parsers: ['prop'],
 *   context: {
 *     foo: 'aaa',
 *     bar: 'bbb',
 *     baz: 'ccc'
 *   }
 * });
 * ```
 *
 * @param {String} `name` The name of the stored template to use
 * @param {Object} `context` The optional context object to bind to replacement functions as `this`
 * @return {String}
 * @api public
 */

Strings.prototype.use = function (template, context) {
  var tmpl = this.template(template);
  return this.process(tmpl.propstring, tmpl.parsers, context);
};


/**
 * ## .process (str, parsers, context)
 *
 * Directly process the given string, using a named replacement
 * pattern or array of named replacement patterns, with the given
 * context.
 *
 * **Example**
 *
 * ```js
 * strings.process(':foo/:bar/:baz', ['a', 'b', 'c'], {
 *   foo: 'aaa',
 *   bar: 'bbb',
 *   baz: 'ccc'
 * });
 * ```
 *
 * @param {String} `str` the string to process
 * @param {String|Object|Array} `parsers` named parsers or parser objects to use when processing.
 * @param {Object} `context` context to use. optional if a global context is passed.
 * @return {String}
 * @api public
 */

Strings.prototype.process = function (str, arr, context) {
  var parsers = this.parsers(arr);
  var ctx = _.extend({}, this._context, context);
  return frep.strWithArr(str, utils._bind(parsers, ctx));
};


/**
 * ## .group ( name, propstring, parsers )
 *
 * Define a named group of propstring/parser mappings, or get a
 * group if only the name is passed.
 *
 * **Example**
 *
 * ```js
 * strings.group('my-group-name', ':foo/:bar/:baz', ['a', 'b', 'c']);
 * ```
 *
 * To get a group:
 *
 * ```js
 * strings.group( name );
 * ```
 *
 * @param {String} `name`
 * @param {String} `propstring` the name of the propstring to use
 * @param {String|Array} `parsers` name or array of names of parsers to use
 * @return {Object} Instance of the current Strings object
 * @api public
 */

Strings.prototype.group = function (groupName, propstring, parsers) {
  if (_.isUndefined(propstring) && _.isUndefined(parsers)) {
    return this._groups[groupName];
  }
  this._groups[groupName] = {
    propstring: propstring,
    parsers: parsers
  };
  return this;
};


/**
 * ## .run ( groupname, context )
 *
 * Process the specified group using the given context.
 *
 * **Example**
 *
 * Set: (`strings.run( string, object )`)
 *
 * ```js
 * strings.run('my-group-name', {
 *   foo: 'aaa',
 *   bar: 'bbb',
 *   baz: 'ccc'
 * });
 * ```
 *
 * @param {String} `group` The group to run.
 * @param {Object} `context` Optional context object, to bind to replacement function as `this`
 * @return {String}
 * @api public
 */

Strings.prototype.run = function (group, context) {
  var namedGroup = this.group(group);
  return this.transform(namedGroup.propstring, namedGroup.parsers, context);
};


module.exports = Strings;