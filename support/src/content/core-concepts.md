WIP (draft)

# Core concepts

- [Lexer](#parser)
  * Token Stream
  * Token
  * Scope
- [Parser](#parser)
  * [Node](#node)
  * Stack
  * [AST](#ast)
- [Compiler](#compiler)
  * State
- [Renderer](#renderer)
  * Contexts
  * Context

## Lexer

- [ ] Token
- [ ] Tokens
- [ ] Scope

## Parser

### AST

TODO

### Node

#### Properties

Officially supported properties

- `type`
- `val`
- `nodes`

**Related**

- The [snapdragon-position][] plugin adds support for `node.position`, which patches the `node` with the start and end position of a captured value.
- The [snapdragon-scope][] plugin adds support for `node.scope`, which patches the `node` with lexical scope of the node.


## Compiler

TODO

## Renderer

TODO


[verb][]
