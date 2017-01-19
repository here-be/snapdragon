# Snapdragon parser

The following documentation is split into two sections, one for users and one for developers. The user documentation is API-focused, and the developer documentation explores how the Snapdragon parser works "under the hood".

Feel free to jump around and please [let us know](../../issues) if you find any typos, outdated or incorrect information. Pull requests are always welcome as well!

<details>
<summary><strong>Pre-requisites</strong></summary>
If you're not quite sure how an AST works, don't sweat it. Not every programmer needs to interact with an AST, and the first experience with one is daunting for everyone.

To get the most from this documentation, we suggest you head over to the [begin/parsers-compilers](https://github.com/begin/parsers-compilers) project to brush up. Within a few minutes you'll know everything you need to proceed!
</details>

<details>
<summary><strong>Table of contents</strong></summary>
- Usage
- Developer
  * Parser
  * Parsers
  * Custom parsers
</details>

## API

## Parser

The snapdragon [Parser]() class contains all of the functionality and methods that are used for creating an AST from a string.

To understand what `Parser` does,

The snapdragon parser takes a string and creates an  by

1. looping over the string
1. invoking registered [parsers](#parsers) to create new AST nodes.

The following documentation describes this in more detail.

 checking to see if any registered [parsers](#parsers) match the sub-string at the current position, and:
  * if a parser matches, it is called, possibly resuling in a new AST node (this is up to the parser function)
  * if _no matches are found_, an error is throw notifying you that the s

## Parsers

Snapdragon parsers are functions that are registered by name, and are invoked by the `.parse` method as it loops over the given string.

**How parsers work**

A very basic parser function might look something like this:

```js
function() {
  var parsed = this.parsed;
  var pos = this.position();
  var m = this.match(regex);
  if (!m || !m[0]) return;

  var prev = this.prev();
  var node = pos({
    type: type,
    val: m[0]
  });

  define(node, 'match', m);
  define(node, 'inside', this.stack.length > 0);
  define(node, 'parent', prev);
  define(node, 'parsed', parsed);
  define(node, 'rest', this.input);
  prev.nodes.push(node);
}
```

TODO

## Custom parsers

TODO

## Plugins

TODO

```js
parser.use(function() {});
```

```js
snapdragon.parser.use(function() {});
```
