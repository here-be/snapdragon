WIP (draft)

## Crash course

### Parser

The parser's job is create an AST from a string. It does this by looping over registered parser-middleware to create nodes from captured substrings.

**Parsing**

When a middleware returns a node, the parser updates the string position and starts over again with the first middleware.

**Parser middleware**

Each parser-middleware is responsible for matching and capturing a specific "type" of substring, and optionally returning a `node` with information about what was captured.

**Node**

A `node` is an object that is used for storing information about a captured substring, or to mark a significant point or delimiter in the AST or string.

The only required property is `node.type`.

Every node has a `node.type` that

semantically describes a substring that was captured by a middleware - or some other  purpose of the node, along with any other information that might be useful later during parsing or compiling.

of a specific `node.type` that semantically describes the  capturing substrings
. Matching is typically performed using a regular expression, but any means can be used.

Upon capturing a substring, the parser-middleware

- capturing and/or further processing relevant part(s) of the captured substring
- returning a node with information that semantically describes the substring that was captured, along with

When a parser returns a node, that indicates

by calling each user-defined middleware (referred to as "parsers") until one returns a node.
Each parser middleware
middleware
 a string and calling user-defined "parsers"

**AST**

which is an object with "nodes", where each "node" is an object with a `type`

**Nodes**

A `node` is an object that is used for storing and describing information about a captured substring.

Every node in the AST has a `type` property, and either:

- `val`: a captured substring
- `nodes`: an array of child nodes

When the substring is delimited - by, for example, braces, brackets, parentheses, etc - the `node` will

In fact, the AST itself is a `node` with type `root`, and a `nodes` array, which contains all of other nodes on the AST.

**Example**

The absolute simplest AST for a single-character string might look something like this:

```js
var ast = {
  type: 'root',
  nodes: [
    {
      type: 'text',
      val: 'a'
    }
  ]
};
```

Nodes may have any additional properties, but they must have

Parsers and compilers have a one-to-one relationship.

The parser uses middleware for

Some of the node "types" on our final AST will also roughly end up reflecting the goals we described in our high level strategy. Our strategy gives us a starting point, but it's good to be flexible. In reality our parser might end up doing something completely different than what we expected in the beginning.

### Compiler

The compiler's job is to render a string. It does this by iterating over an AST, and using the information contained in each node to determine what to render.

**A compiler for every parser**

Parsers and compilers have a one-to-one relationship.

The parser uses middleware for

