# snapdragon [![NPM version](https://img.shields.io/npm/v/snapdragon.svg?style=flat)](https://www.npmjs.com/package/snapdragon) [![NPM monthly downloads](https://img.shields.io/npm/dm/snapdragon.svg?style=flat)](https://npmjs.org/package/snapdragon) [![NPM total downloads](https://img.shields.io/npm/dt/snapdragon.svg?style=flat)](https://npmjs.org/package/snapdragon) [![Linux Build Status](https://img.shields.io/travis/here-be/snapdragon.svg?style=flat&label=Travis)](https://travis-ci.org/here-be/snapdragon)

> Easy-to-use plugin system for creating powerful, fast and versatile parsers and compilers, with built-in source-map support.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Table of Contents

<details>
<summary><strong>Details</strong></summary>

- [Install](#install)
- [Quickstart example](#quickstart-example)
- [Parsing](#parsing)
- [Compiling](#compiling)
- [All together](#all-together)
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
* Inspired by the parsers in [pug](https://pugjs.org/) and [css](https://github.com/reworkcss/css).

## Quickstart example

All of the examples in this document assume the following two lines of setup code exist first:

```js
var Snapdragon = require('snapdragon');
var snapdragon = new Snapdragon();
```

**Parse a string**

```js
var ast = snapdragon.parser
  // parser handlers (essentially middleware)
  // used for parsing substrings to create tokens
  .set('foo', function () {})
  .set('bar', function () {})
  .parse('some string', options);
```

**Compile an AST returned from `.parse()`**

```js
var result = snapdragon.compiler
  // compiler handlers (essentially middleware), 
  // called on a node when the `node.type` matches
  // the name of the handler
  .set('foo', function () {})
  .set('bar', function () {})
  // pass the `ast` from the parse method
  .compile(ast)

// the compiled string
console.log(result.output);
```

See the [examples](./examples/).

## Parsing

**Parser handlers**

Parser handlers are middleware functions responsible for matching substrings to create tokens:

**Example handler**

```js
var ast = snapdragon.parser
  .set('dot', function() {
    var pos = this.position();
    var m = this.match(/^\./);
    if (!m) return;
    return pos({
      // the "type" will be used by the compiler later on,
      // we'll go over this in the compiler docs
      type: 'dot',
      // "val" is the string captured by ".match",
      // in this case that would be '.'
      val: m[0]
    });
  })
  .parse('.'[, options])
```

_As a side node, it's not scrictly required to set the `type` on the token, since the parser will add it to the token if it's undefined, based on the name of the handler. But it's good practice since tokens aren't always returned._

**Example token**

And the resulting tokens look something like this:

```js
{ 
  type: 'dot',
  val: '.' 
}
```

**Position**

Next, `pos()` is called on the token as it's returned, which patches the token with the `position` of the string that was captured:

```js
{ type: 'dot',
  val: '.',
  position:
   { start: { lineno: 1, column: 1 },
     end: { lineno: 1, column: 2 } }}
```

**Life as an AST node**

When the token is returned, the parser pushes it onto the `nodes` array of the "previous" node (since we're in a tree, the "previous" node might be literally the last node that was created, or it might be the "parent" node inside a nested context, like when parsing brackets or something with an open or close), at which point the token begins its life as an AST node.

**Wrapping up**

In the parser calls all handlers and cannot find a match for a substring, an error is thrown.

Assuming the parser finished parsing the entire string, an AST is returned.

## Compiling

The compiler's job is to take the AST created by the [parser](#parsing) and convert it to a new string. It does this by iterating over each node on the AST and calling a function on the node based on its `type`.

This function is called a "handler".

**Compiler handlers**

Handlers are _named_ middleware functions that are called on a node when `node.type` matches the name of a registered handler.

```js
var result = snapdragon.compiler
  .set('dot', function (node) {
    console.log(node.val)
    //=> '.'
    return this.emit(node.val);
  })
```

If `node.type` does not match a registered handler, an error is thrown.

**Source maps**

If you want source map support, make sure to emit the entire node as the second argument as well (this allows the compiler to get the `node.position`).

```js
var res = snapdragon.compiler
  .set('dot', function (node) {
    return this.emit(node.val, node);
  })
```

## All together

This is a very basic example, but it shows how to parse a dot, then compile it as an escaped dot.

```js
var Snapdragon = require('..');
var snapdragon = new Snapdragon();

var ast = snapdragon.parser
  .set('dot', function () {
    var pos = this.position();
    var m = this.match(/^\./);
    if (!m) return;
    return pos({
      type: 'dot',
      val: m[0]
    })
  })
  .parse('.')

var result = snapdragon.compiler
  .set('dot', function (node) {
    return this.emit('\\' + node.val);
  })
  .compile(ast)

console.log(result.output);
//=> '\.'
```

## API

### [Parser](lib/parser.js#L27)

Create a new `Parser` with the given `input` and `options`.

**Params**

* `input` **{String}**
* `options` **{Object}**

**Example**

```js
var Snapdragon = require('snapdragon');
var Parser = Snapdragon.Parser;
var parser = new Parser();
```

### [.error](lib/parser.js#L97)

Throw a formatted error message with details including the cursor position.

**Params**

* `msg` **{String}**: Message to use in the Error.
* `node` **{Object}**
* `returns` **{undefined}**

**Example**

```js
parser.set('foo', function(node) {
  if (node.val !== 'foo') {
    throw this.error('expected node.val to be "foo"', node);
  }
});
```

### [.define](lib/parser.js#L115)

Define a non-enumberable property on the `Parser` instance. This is useful in plugins, for exposing methods inside handlers.

**Params**

* `key` **{String}**: propery name
* `val` **{any}**: property value
* `returns` **{Object}**: Returns the Parser instance for chaining.

**Example**

```js
parser.define('foo', 'bar');
```

### [.node](lib/parser.js#L133)

Create a new [Node](#node) with the given `val` and `type`.

**Params**

* `val` **{Object}**
* `type` **{String}**
* `returns` **{Object}**: returns the [Node](#node) instance.

**Example**

```js
parser.node('/', 'slash');
```

### [.position](lib/parser.js#L155)

Mark position and patch `node.position`.

* `returns` **{Function}**: Returns a function that takes a `node`

**Example**

```js
parser.set('foo', function(node) {
  var pos = this.position();
  var match = this.match(/foo/);
  if (match) {
    // call `pos` with the node
    return pos(this.node(match[0]));
  }
});
```

### [.set](lib/parser.js#L187)

Add parser `type` with the given visitor `fn`.

**Params**

* `type` **{String}**
* `fn` **{Function}**

**Example**

```js
 parser.set('all', function() {
   var match = this.match(/^./);
   if (match) {
     return this.node(match[0]);
   }
 });
```

### [.get](lib/parser.js#L206)

Get parser `type`.

**Params**

* `type` **{String}**

**Example**

```js
var fn = parser.get('slash');
```

### [.push](lib/parser.js#L229)

Push a node onto the stack for the given `type`.

**Params**

* `type` **{String}**
* `returns` **{Object}** `token`

**Example**

```js
parser.set('all', function() {
  var match = this.match(/^./);
  if (match) {
    var node = this.node(match[0]);
    this.push(node);
    return node;
  }
});
```

### [.pop](lib/parser.js#L261)

Pop a token off of the stack of the given `type`.

**Params**

* `type` **{String}**
* `returns` **{Object}**: Returns a token

**Example**

```js
parser.set('close', function() {
  var match = this.match(/^\}/);
  if (match) {
    var node = this.node({
      type: 'close',
      val: match[0]
    });

    this.pop(node.type);
    return node;
  }
});
```

### [.isInside](lib/parser.js#L294)

Return true if inside a "set" of the given `type`. Sets are created manually by adding a type to `parser.sets`. A node is "inside" a set when an `*.open` node for the given `type` was previously pushed onto the set. The type is removed from the set by popping it off when the `*.close` node for the given type is reached.

**Params**

* `type` **{String}**
* `returns` **{Boolean}**

**Example**

```js
parser.set('close', function() {
  var pos = this.position();
  var m = this.match(/^\}/);
  if (!m) return;
  if (!this.isInside('bracket')) {
    throw new Error('missing opening bracket');
  }
});
```

### [.isType](lib/parser.js#L324)

Return true if `node` is the given `type`.

**Params**

* `node` **{Object}**
* `type` **{String}**
* `returns` **{Boolean}**

**Example**

```js
parser.isType(node, 'brace');
```

### [.prev](lib/parser.js#L340)

Get the previous AST node from the `parser.stack` (when inside a nested context) or `parser.nodes`.

* `returns` **{Object}**

**Example**

```js
var prev = this.prev();
```

### [.prev](lib/parser.js#L394)

Match `regex`, return captures, and update the cursor position by `match[0]` length.

**Params**

* `regex` **{RegExp}**
* `returns` **{Object}**

**Example**

```js
// make sure to use the starting regex boundary: "^"
var match = this.match(/^\./);
```

**Params**

* `input` **{String}**
* `returns` **{Object}**: Returns an AST with `ast.nodes`

**Example**

```js
var ast = parser.parse('foo/bar');
```

### [Compiler](lib/compiler.js#L24)

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

### [.error](lib/compiler.js#L67)

Throw a formatted error message with details including the cursor position.

**Params**

* `msg` **{String}**: Message to use in the Error.
* `node` **{Object}**
* `returns` **{undefined}**

**Example**

```js
compiler.set('foo', function(node) {
  if (node.val !== 'foo') {
    throw this.error('expected node.val to be "foo"', node);
  }
});
```

### [.emit](lib/compiler.js#L86)

Concat the given string to `compiler.output`.

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

### [.noop](lib/compiler.js#L104)

Emit an empty string to effectively "skip" the string for the given `node`, but still emit the position and node type.

**Params**

* **{Object}**: node

**Example**

```js
// example: do nothing for beginning-of-string
snapdragon.compiler.set('bos', compiler.noop);
```

### [.define](lib/compiler.js#L124)

Define a non-enumberable property on the `Compiler` instance. This is useful in plugins, for exposing methods inside handlers.

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

### [.set](lib/compiler.js#L152)

Add a compiler `fn` for the given `type`. Compilers are called when the `.compile` method encounters a node of the given type to generate the output string.

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

### [.get](lib/compiler.js#L168)

Get the compiler of the given `type`.

**Params**

* `type` **{String}**

**Example**

```js
var fn = compiler.get('slash');
```

### [.visit](lib/compiler.js#L188)

Visit `node` using the registered compiler function associated with the `node.type`.

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

### [.mapVisit](lib/compiler.js#L226)

Iterate over `node.nodes`, calling [visit](#visit) on each node.

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

### [.compile](lib/compiler.js#L250)

Compile the given `AST` and return a string. Iterates over `ast.nodes` with [mapVisit](#mapVisit).

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

* [braces](https://www.npmjs.com/package/braces): Bash-like brace expansion, implemented in JavaScript. Safer than other brace expansion libs, with complete support… [more](https://github.com/micromatch/braces) | [homepage](https://github.com/micromatch/braces "Bash-like brace expansion, implemented in JavaScript. Safer than other brace expansion libs, with complete support for the Bash 4.3 braces specification, without sacrificing speed.")
* [breakdance](https://www.npmjs.com/package/breakdance): Breakdance is a node.js library for converting HTML to markdown. Highly pluggable, flexible and easy… [more](http://breakdance.io) | [homepage](http://breakdance.io "Breakdance is a node.js library for converting HTML to markdown. Highly pluggable, flexible and easy to use. It's time for your markup to get down.")
* [expand-brackets](https://www.npmjs.com/package/expand-brackets): Expand POSIX bracket expressions (character classes) in glob patterns. | [homepage](https://github.com/jonschlinkert/expand-brackets "Expand POSIX bracket expressions (character classes) in glob patterns.")
* [extglob](https://www.npmjs.com/package/extglob): Extended glob support for JavaScript. Adds (almost) the expressive power of regular expressions to glob… [more](https://github.com/micromatch/extglob) | [homepage](https://github.com/micromatch/extglob "Extended glob support for JavaScript. Adds (almost) the expressive power of regular expressions to glob patterns.")
* [micromatch](https://www.npmjs.com/package/micromatch): Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch. | [homepage](https://github.com/micromatch/micromatch "Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch.")
* [nanomatch](https://www.npmjs.com/package/nanomatch): Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash… [more](https://github.com/micromatch/nanomatch) | [homepage](https://github.com/micromatch/nanomatch "Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash 4.3 wildcard support only (no support for exglobs, posix brackets or braces)")

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

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Related projects

A few of the libraries that use snapdragon:

* [snapdragon-capture-set](https://www.npmjs.com/package/snapdragon-capture-set): Plugin that adds a `.captureSet()` method to snapdragon, for matching and capturing substrings that have… [more](https://github.com/jonschlinkert/snapdragon-capture-set) | [homepage](https://github.com/jonschlinkert/snapdragon-capture-set "Plugin that adds a `.captureSet()` method to snapdragon, for matching and capturing substrings that have an `open` and `close`, like braces, brackets, etc")
* [snapdragon-capture](https://www.npmjs.com/package/snapdragon-capture): Snapdragon plugin that adds a capture method to the parser instance. | [homepage](https://github.com/jonschlinkert/snapdragon-capture "Snapdragon plugin that adds a capture method to the parser instance.")
* [snapdragon-node](https://www.npmjs.com/package/snapdragon-node): Snapdragon utility for creating a new AST node in custom code, such as plugins. | [homepage](https://github.com/jonschlinkert/snapdragon-node "Snapdragon utility for creating a new AST node in custom code, such as plugins.")
* [snapdragon-util](https://www.npmjs.com/package/snapdragon-util): Utilities for the snapdragon parser/compiler. | [homepage](https://github.com/here-be/snapdragon-util "Utilities for the snapdragon parser/compiler.")

### Contributors

| **Commits** | **Contributor** | 
| --- | --- |
| 156 | [jonschlinkert](https://github.com/jonschlinkert) |
| 3 | [doowb](https://github.com/doowb) |
| 2 | [danez](https://github.com/danez) |
| 1 | [EdwardBetts](https://github.com/EdwardBetts) |

### Author

**Jon Schlinkert**

* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)
* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)

### License

Copyright © 2018, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on March 20, 2018._