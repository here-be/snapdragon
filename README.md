# snapdragon [![NPM version](https://img.shields.io/npm/v/snapdragon.svg?style=flat)](https://www.npmjs.com/package/snapdragon) [![NPM monthly downloads](https://img.shields.io/npm/dm/snapdragon.svg?style=flat)](https://npmjs.org/package/snapdragon)  [![NPM total downloads](https://img.shields.io/npm/dt/snapdragon.svg?style=flat)](https://npmjs.org/package/snapdragon) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/snapdragon.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/snapdragon)

> Easy-to-use plugin system for creating powerful, fast and versatile parsers and compilers, with built-in source-map support.

<details>
<summary><strong>Table of Contents</strong></summary>
- [Install](#install)
- [Usage examples](#usage-examples)
- [Getting started](#getting-started)
- [Docs](#docs)
  * [Parser middleware](#parser-middleware)
- [Renderer middleware](#renderer-middleware)
- [API](#api)
  * [Parse](#parse)
  * [Compile](#compile)
- [Snapdragon in the wild](#snapdragon-in-the-wild)
- [History](#history)
  * [v0.9.0](#v090)
  * [v0.5.0](#v050)
- [About](#about)
</details>

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save snapdragon
```

Created by [jonschlinkert](https://github.com/jonschlinkert) and [doowb](https://github.com/doowb).

**Features**

* Bootstrap your own parser, get sourcemap support for free
* All parsing and compiling is handled by simple, reusable middleware functions
* Inspired by the parsers in [pug](http://jade-lang.com) and [css](https://github.com/reworkcss/css).

## Usage examples

```js
var Snapdragon = require('snapdragon');
var snapdragon = new Snapdragon();
```

**Parse**

```js
var ast = snapdragon.parser('some string', options)
  // parser middleware that can be called by other middleware
  .set('foo', function () {})
  // parser middleware, runs immediately in the order defined
  .use(bar())
  .use(baz())
```

**Render**

```js
// pass the `ast` from the parse method
var res = snapdragon.compiler(ast)
  // compiler middleware, called when the name of the middleware
  // matches the `node.type` (defined in a parser middleware)
  .set('bar', function () {})
  .set('baz', function () {})
  .compile()
```

See the [examples](./examples/).

## Getting started

**Parsers**

Parsers are middleware functions used for parsing a string into an ast node.

```js
var ast = snapdragon.parser(str, options)
  .use(function() {
    var pos = this.position();
    var m = this.match(/^\./);
    if (!m) return;
    return pos({
      // `type` specifies the compiler to use
      type: 'dot',
      val: m[0]
    });
  })
```

**AST node**

When the parser finds a match, `pos()` is called, pushing a token for that node onto the ast that looks something like:

```js
{ type: 'dot',
  val: '.',
  position:
   { start: { lineno: 1, column: 1 },
     end: { lineno: 1, column: 2 } }}
```

**Renderers**

Renderers are _named_ middleware functions that visit over an array of ast nodes to compile a string.

```js
var res = snapdragon.compiler(ast)
  .set('dot', function (node) {
    console.log(node.val)
    //=> '.'
    return this.emit(node.val);
  })
```

**Source maps**

If you want source map support, make sure to emit the position as well.

```js
var res = snapdragon.compiler(ast)
  .set('dot', function (node) {
    return this.emit(node.val, node.position);
  })
```

## Docs

### Parser middleware

A parser middleware is a function that returns an abject called a `token`. This token is pushed onto the AST as a node.

**Example token**

```js
{ type: 'dot',
  val: '.',
  position:
   { start: { lineno: 1, column: 1 },
     end: { lineno: 1, column: 2 } }}
```

## Renderer middleware

Renderers are run when the name of the compiler middleware matches the `type` defined on an ast `node` (which is defined in a parser).

**Example**

Exercise: Parse a dot, then compile it as an escaped dot.

```js
var ast = snapdragon.parser('.')
  .use(function () {
    var pos = this.position();
    var m = this.match(/^\./);
    if (!m) return;
    return pos({
      // define the `type` of compiler to use
      type: 'dot',
      val: m[0]
    })
  })

var result = snapdragon.compiler(ast)
  .set('dot', function (node) {
    return this.emit('\\' + node.val);
  })
  .compile()

console.log(result.output);
//=> '\.'
```

## API

### [Parser](lib/parser.js#L21)

Create a new `Parser` with the given `input` and `options`.

**Params**

* `input` **{String}**
* `options` **{Object}**

Throw a formatted error message with details including the cursor position.

**Params**

* `msg` **{String}**: Message to use in the Error.
* `message` **{String}**
* `node` **{Object}**
* `returns` **{undefined}**

### [.define](lib/parser.js#L106)

Define a non-enumberable property on the `Parser` instance.

**Params**

* `key` **{String}**: propery name
* `val` **{any}**: property value
* `returns` **{Object}**: Returns the Parser instance for chaining.

**Example**

```js
parser.define('foo', 'bar');
```

**Params**

* `position` **{Function}**
* `val` **{Object}**
* `type` **{String}**
* `returns` **{Object}**: returns the [Node](#node) instance.

**Example**

```js
compiler.node(compiler.position(), 'slash', '/');
```

**Params**

* `message` **{String}**
* `node` **{Object}**
* `returns` **{undefined}**

**Example**

```js
parser.set('foo', function(node) {
  var pos = this.position();
  var match = this.match(/foo/);
  if (match) {
    // pass `pos` to `this.node` to patch position
    return this.node(pos, match[0]);
  }
});
```

**Params**

* `type` **{String}**
* `fn` **{Function}**

**Example**

```js
 parser.set('all', function() {
   var pos = this.position();
   var match = this.match(/^./);
   if (match) {
     return this.node(pos, match[0]);
   }
 });
```

**Params**

* `type` **{String}**

**Example**

```js
var fn = parser.get('slash');
```

**Params**

* `type` **{String}**
* `returns` **{Object}** `token`

**Example**

```js
parser.set('all', function() {
  var pos = this.position();
  var match = this.match(/^./);
  if (match) {
    var node = this.node(pos, match[0]);
    this.push(node);
    return node;
  }
});
```

**Params**

* `type` **{String}**
* `returns` **{Object}**: Returns a token

**Example**

```js
 parser.set('close', function() {
   var pos = this.position();
   var m = this.match(/^\}/);
   if (!m) return;

   var node = pos({
     type: 'close',
     val: m[0]
   });

   this.pop(node.type);
   return node;
 });
```

Return true if inside a "set" of the given `type`. Sets are created
manually by adding a type to `parser.sets`. A node is "inside" a set
when an `*.open` node for the given `type` was previously pushed onto the set.
The type is removed from the set by popping it off when the `*.close`
node for the given type is reached.

**Params**

* `type` **{String}**
* `returns` **{Boolean}**

**Params**

* `node` **{Object}**
* `type` **{String}**
* `returns` **{Boolean}**

**Example**

```js
parser.isType(node, 'brace');
```

### [Compiler](lib/compiler.js#L22)

Create a new `Compiler` with the given `options`.

**Params**

* `options` **{Object}**
* `state` **{Object}**: Optionally pass a "state" object to use inside visitor functions.

**Example**

```js
var Snapdragon = require('snapdragon');
var Compiler = Snapdragon.Compiler;
var compiler = new Compiler();
```

Throw a formatted error message with details including the cursor position.

**Params**

* `msg` **{String}**: Message to use in the Error.
* `message` **{String}**
* `node` **{Object}**
* `returns` **{undefined}**

**Params**

* `string` **{String}**
* `node` **{Object}**: Optionally pass the node to use for position if source maps are enabled.
* `returns` **{String}**: returns the string

**Example**

```js
compiler.set('foo', function(node) {
  this.emit(node.val, node);
});
```

**Params**

* **{Object}**: node

**Example**

```js
// example: do nothing for beginning-of-string
snapdragon.compiler.set('bos', compiler.noop);
```

### [.define](lib/compiler.js#L117)

Define a non-enumberable property on the `Compiler` instance. Useful in pluggins for adding methods to an

**Params**

* `key` **{String}**: propery name
* `val` **{any}**: property value
* `returns` **{Object}**: Returns the Compiler instance for chaining.

**Example**

```js
compiler.define('customMethod', function() {
  // do stuff
});
```

**Params**

* `type` **{String}**
* `fn` **{Function}**

**Example**

```js
compiler
  .set('comma', function(node) {
    this.emit(',');
  })
  .set('dot', function(node) {
    this.emit('.');
  })
  .set('slash', function(node) {
    this.emit('/');
  });
```

**Params**

* `type` **{String}**

**Example**

```js
var fn = compiler.get('slash');
```

**Params**

* `node` **{Object}**
* `returns` **{Object}**: returns the node

**Example**

```js
compiler
  .set('i', function(node) {
    this.visit(node);
  })
```

**Params**

* `node` **{Object}**
* `returns` **{Object}**: returns the node

**Example**

```js
compiler
  .set('i', function(node) {
    utils.mapVisit(node);
  })
```

**Params**

* `ast` **{Object}**
* `options` **{Object}**: Compiler options
* `returns` **{Object}**: returns the node

**Example**

```js
var ast = parser.parse('foo');
var str = compiler.compile(ast);
```

## Snapdragon in the wild

A few of the libraries that use snapdragon:

* [braces](https://www.npmjs.com/package/braces): Fast, comprehensive, bash-like brace expansion implemented in JavaScript. Complete support for the Bash 4.3 braces… [more](https://github.com/jonschlinkert/braces) | [homepage](https://github.com/jonschlinkert/braces "Fast, comprehensive, bash-like brace expansion implemented in JavaScript. Complete support for the Bash 4.3 braces specification, without sacrificing speed.")
* [expand-brackets](https://www.npmjs.com/package/expand-brackets): Expand POSIX bracket expressions (character classes) in glob patterns. | [homepage](https://github.com/jonschlinkert/expand-brackets "Expand POSIX bracket expressions (character classes) in glob patterns.")
* [extglob](https://www.npmjs.com/package/extglob): Extended glob support for JavaScript. Adds (almost) the expressive power of regular expressions to glob… [more](https://github.com/jonschlinkert/extglob) | [homepage](https://github.com/jonschlinkert/extglob "Extended glob support for JavaScript. Adds (almost) the expressive power of regular expressions to glob patterns.")
* [micromatch](https://www.npmjs.com/package/micromatch): Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch. | [homepage](https://github.com/jonschlinkert/micromatch "Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch.")

## History

### v0.9.0

**Breaking changes!**

In an attempt to make snapdragon lighter, more versatile, and more pluggable, some major changes were made in this release.

* `parser.capture` was externalized to [snapdragon-capture](https://github.com/jonschlinkert/snapdragon-capture)
* `parser.capturePair` was externalized to [snapdragon-capture-set](https://github.com/jonschlinkert/snapdragon-capture-set)
* Nodes are now an instance of [snapdragon-node](https://github.com/jonschlinkert/snapdragon-node)

### v0.5.0

**Breaking changes!**

Substantial breaking changes were made in v0.5.0! Most of these changes are part of a larger refactor that will be finished in 0.6.0, including the introduction of a `Lexer` class.

* Renderer was renamed to `Compiler`
* the `.render` method was renamed to `.compile`

## About

### Related projects

* [snapdragon-capture-set](https://www.npmjs.com/package/snapdragon-capture-set): Plugin that adds a `.captureSet()` method to snapdragon, for matching and capturing substrings that have… [more](https://github.com/jonschlinkert/snapdragon-capture-set) | [homepage](https://github.com/jonschlinkert/snapdragon-capture-set "Plugin that adds a `.captureSet()` method to snapdragon, for matching and capturing substrings that have an `open` and `close`, like braces, brackets, etc")
* [snapdragon-capture](https://www.npmjs.com/package/snapdragon-capture): Snapdragon plugin that adds a capture method to the parser instance. | [homepage](https://github.com/jonschlinkert/snapdragon-capture "Snapdragon plugin that adds a capture method to the parser instance.")
* [snapdragon-node](https://www.npmjs.com/package/snapdragon-node): Snapdragon utility for creating a new AST node in custom code, such as plugins. | [homepage](https://github.com/jonschlinkert/snapdragon-node "Snapdragon utility for creating a new AST node in custom code, such as plugins.")
* [snapdragon-util](https://www.npmjs.com/package/snapdragon-util): Utilities for the snapdragon parser/compiler. | [homepage](https://github.com/jonschlinkert/snapdragon-util "Utilities for the snapdragon parser/compiler.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Contributors

| **Commits** | **Contributor** | 
| --- | --- |
| 111 | [jonschlinkert](https://github.com/jonschlinkert) |
| 2 | [doowb](https://github.com/doowb) |

### Building docs

_(This document was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme) (a [verb](https://github.com/verbose/verb) generator), please don't edit the readme directly. Any changes to the readme must be made in [.verb.md](.verb.md).)_

To generate the readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-generate-readme && verb
```

### Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.1, on January 21, 2017._