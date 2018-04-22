import { error } from './error';
import { Node, NodeStatic } from 'snapdragon-node';
import { Position } from './position';
import * as Emitter from 'component-emitter';
import * as util from 'snapdragon-util';

export interface ParserOptions {
    silent?: boolean;
    strict?: boolean;
    astType?: string;
    eos?: (this: Parser, node: Node) => void;
}

export interface CompleteParserOptions extends ParserOptions {
    source: string;
}

export interface NodePosition {
    position: Position;
    parsed: string;
    inside: boolean;
    rest: string;
}

export class Parser extends Emitter {
    private parsers!: { [key: string]: (this: Parser, node: Node) => Node };
    private options: CompleteParserOptions;

    private orig!: string;
    private input!: string;
    private parsed!: string;

    private column!: number;
    private line!: number;

    private count!: number;
    private currentType!: string;
    private types!: string[];
    private sets!: { [key: string]: Node[] };

    private stack!: Node[];
    private typeStack!: string[];
    private setStack!: Node[];

    public errors!: Error[];
    public Node: NodeStatic = Node;

    /* orig: string = '';
    input: string = '';
    parsed: string = '';

    currentType: string = 'root';
    setCount: number = 0;
    count: number = 0;
    column: number = 1;
    line: number = 1;

    regex = new Cache();
    errors: Error[] = [];
    parsers: { [key: string]: (this: Parser, node: Node) => void } = {};
    types: string[] = [];
    sets: object = {};
    fns: Array<() => void> = [];
    tokens: string[] = [];
    */

    bos!: Node & NodePosition & { value: string, type: string };
    ast!: Node & NodePosition & { type: string, errors: Error[] };

    constructor(options?: ParserOptions) {
        super();
        Emitter((this as any).prototype);
        this.options = { source: 'string' };

        this.define('isParser', true);
        this.define('parsers', {});

        this.init(this.options);
    }

    init(options?: ParserOptions) {
        this.options = Object.assign(this.options, options);

        this.define('orig', '');
        this.define('input', '');
        this.define('parsed', '');

        this.define('column', 1);
        this.define('line', 1);

        this.errors = [];
        this.define('count', 0);
        this.define('currentType', 'root');
        this.define('types', []);
        this.define('sets', {});

        this.define('stack', []);
        this.define('typeStack', []);
        this.define('setStack', []);

        const pos = this.position();
        this.bos = pos(this.node('', 'bos'));
        this.ast = pos(this.node({
            type: this.options.astType || 'root',
            errors: this.errors
        }));
    }

    /**
     * Register a plugin function for a `Parser` instance.
     *
     * ```js
     * const parser = new Parser();
     * parser.use(function(instance) {
     *   console.log(this);     //<= `Parser` instance
     *   console.log(instance); //<= `Parser` instance
     * });
     * ```
     */
    use(fn: (instance: Parser) => void) {
        fn.call(this, this);
        return this;
    }

    /**
     * Throw a formatted error message with details including the cursor position.
     *
     * ```js
     * parser.set('foo', function(node) {
     *   if (node.val !== 'foo') {
     *     throw this.error('expected node.val to be "foo"', node);
     *   }
     * });
     * ```
     */
    error(msg: string, node?: Node) {
        error.call(this, msg, node);
    }

    /**
     * Define a non-enumerable property on the `Parser` instance. This is useful
     * in plugins, for exposing methods inside handlers.
     *
     * ```js
     * parser.define('foo', 'bar');
     * ```
     */
    define<K extends string, V>(name: K, val: V) {
        Object.defineProperty(this, name, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: val
        });
        return this as (this & { [key in K]: V });
    }

    /**
     * Create a new [Node](#node) with the given `value` and `type`.
     *
     * ```js
     * parser.node('/', 'slash');
     * ```
     */
    node(value: string, type: string): Node & { value: string, type: string };
    node<T extends object>(value: T): Node & T;
    node(value: any, type?: string) {
        return new this.Node(value, type as string);
    }

    /**
     * Mark position and patch `node.position`.
     *
     * ```js
     * parser.set('foo', function(node) {
     *   const pos = this.position();
     *   const match = this.match(/foo/);
     *   if (match) {
     *     // call `pos` with the node
     *     return pos(this.node(match[0]));
     *   }
     * });
     * ```
     */
    position() {
        const start = { line: this.line, column: this.column };
        const parsed = this.parsed;
        const self = this;

        return <T extends object>(node: T) => {
            if (!Node.isNode(node)) {
                node = new Node(node);
            }
            return (node as Node)
                .define('position', new Position(start, self))
                .define('parsed', parsed)
                .define('inside', this.stack.length > 0)
                .define('rest', this.input) as Node & NodePosition & T;
        };
    }

    /**
     * Add parser `type` with the given visitor `fn`.
     *
     * ```js
     *  parser.set('all', function() {
     *    const match = this.match(/^./);
     *    if (match) {
     *      return this.node(match[0]);
     *    }
     *  });
     * ```
     */
    set(type: string, fn: (this: Parser, node: Node) => Node) {
        if (this.types.indexOf(type) === -1) {
            this.types.push(type);
        }
        this.parsers[type] = fn/* .bind(this) */;
        return this;
    }

    /**
     * Get parser `type`.
     *
     * ```js
     * const fn = parser.get('slash');
     * ```
     */
    get(type: string) {
        return this.parsers[type];
    }

    /**
     * Push a node onto the stack for the given `type`.
     *
     * ```js
     * parser.set('all', function() {
     *   const match = this.match(/^./);
     *   if (match) {
     *     const node = this.node(match[0]);
     *     this.push(node.type);
     *     return node;
     *   }
     * });
     * ```
     */
    // TODO: what is token? node?
    push(type: string, token: Node) {
        this.sets[type] = this.sets[type] || [];
        this.count++;
        this.stack.push(token);
        this.setStack.push(token);
        this.typeStack.push(type);
        return this.sets[type].push(token);
    }

    /**
     * Pop a token off of the stack of the given `type`.
     *
     * ```js
     * parser.set('close', function() {
     *   const match = this.match(/^\}/);
     *   if (match) {
     *     const node = this.node({
     *       type: 'close',
     *       value: match[0]
     *     });
     *
     *     this.pop(node.type);
     *     return node;
     *   }
     * });
     * ```
     */
    pop(type: string) {
        if (this.sets[type]) {
            this.count--;
            this.stack.pop();
            this.setStack.pop();
            this.typeStack.pop();
            return this.sets[type].pop() || null;
        }
        return null;
    }

    /**
     * Return true if inside a "set" of the given `type`. Sets are created
     * manually by adding a type to `parser.sets`. A node is "inside" a set
     * when an `*.open` node for the given `type` was previously pushed onto the set.
     * The type is removed from the set by popping it off when the `*.close`
     * node for the given type is reached.
     *
     * ```js
     * parser.set('close', function() {
     *   const pos = this.position();
     *   const m = this.match(/^\}/);
     *   if (!m) return;
     *   if (!this.isInside('bracket')) {
     *     throw new Error('missing opening bracket');
     *   }
     * });
     * ```
     */
    isInside(type: string) {
        if (typeof type === 'undefined') {
            return this.count > 0;
        }
        if (!Array.isArray(this.sets[type])) {
            return false;
        }
        return this.sets[type].length > 0;
    }

    isDirectlyInside(type: string) {
        if (typeof type === 'undefined') {
            return this.count > 0 ? util.last(this.typeStack) !== null : false;
        }
        return util.last(this.typeStack) === type;
    }

    /**
     * Return true if `node` is the given `type`.
     *
     * ```js
     * parser.isType(node, 'brace');
     * ```
     */
    isType(node: Node, type: string) {
        return node && node.type === type;
    }

    /**
     * Get the previous AST node from the `parser.stack` (when inside a nested
     * context) or `parser.nodes`.
     *
     * ```js
     * const prev = this.prev();
     * ```
     */
    prev(n?: number): Node | null {
        return this.stack.length > 0 ? util.last(this.stack, n) : util.last(this.nodes, n);
    }

    /**
     * Update line and column based on `str`.
     */
    consume(len: number) {
        this.input = this.input.substr(len);
    }

    /**
     * Returns the string up to the given `substring`,
     * if it exists, and advances the cursor position past the substring.
     */
    advanceTo(str: string, pos?: number) {
        const idx = this.input.indexOf(str, pos);
        if (idx !== -1) {
            const val = this.input.slice(0, idx);
            this.consume(idx + str.length);
            return val;
        }
    }

    /**
     * Update column based on `str`.
     */
    updatePosition(str: string, len: number) {
        const lines = str.match(/\n/g);
        const i = str.lastIndexOf('\n');
        if (lines) {
            this.line += lines.length;
        }
        this.column = ~i ? len - i : this.column + len;
        this.parsed += str;
        this.consume(len);
    }

    /**
     * Match `regex`, return captures, and update the cursor position by `match[0]` length.
     *
     * ```js
     * // make sure to use the starting regex boundary: "^"
     * const match = this.match(/^\./);
     * ```
     */
    match(regex: RegExp) {
        const m = regex.exec(this.input);
        if (m) {
            this.updatePosition(m[0], m[0].length);
        }
        return m;
    }

    /**
     * Push `node` to `parent.nodes` and assign `node.parent`.
     */
    // TODO: is first `if` really necessary?
    pushNode(node: Node, parent: Node) {
        //if (node && parent) {
        if (parent === node) {
            parent = this.ast;
        }
        node.define('parent', parent);

        if (parent.nodes) {
            parent.nodes.push(node);
        }
        if (parent.type && this.sets.hasOwnProperty(parent.type)) {
            this.currentType = parent.type;
        }
        //}
    }

    /**
     * Capture end-of-string.
     */
    eos() {
        if (this.input) return null;

        const pos = this.position();
        let prev = this.prev();

        while (prev && prev.type !== 'root' && !(prev as Node & { visited: boolean }).visited) {
            if (this.options.strict === true) {
                throw new SyntaxError('invalid syntax:' + prev);
            }

            if (!util.hasOpenAndClose(prev)) {
                prev.parent!.define('escaped', true);
                prev.define('escaped', true);
            }

            this.visit(prev, (node) => {
                if (!util.hasOpenAndClose(node.parent)) {
                    node.parent!.define('escaped', true);
                    node.define('escaped', true);
                }
            });

            prev = prev.parent!;
        }

        let node = pos(this.node(this.append || '', 'eos'));
        if (typeof this.options.eos === 'function') {
            node = this.options.eos.call(this, node);
        }

        if (this.parsers.eos) {
            this.parsers.eos.call(this, node);
        }

        node.define('parent', this.ast);
        return node;
    }

    /**
     * Run parsers to advance the cursor position.
     */
    getNext() {
        const len = this.types.length;
        let idx = -1;

        while (++idx < len) {
            const type = this.types[idx];
            const tok = this.parsers[type].call(this);
            if (tok === true) {
                break;
            }

            if (tok) {
                tok.type = tok.type || type;
                tok.define('rest', this.input);
                tok.define(tok, 'parsed', this.parsed);
                this.last = tok;
                this.tokens.push(tok);
                this.emit('node', tok);
                return tok;
            }
        }
    }

    /**
     * Run parsers to get the next AST node
     */
    advance() {
        const input = this.input;
        this.pushNode(this.getNext(), this.prev());

        // if we're here and input wasn't modified, throw an error
        if (this.input && input === this.input) {
            const chokedOn = this.input.slice(0, 10);
            const err = this.error('no parser for: "' + chokedOn, this.last);
            if (this.hasListeners('error')) {
                this.emit('error', err);
            } else {
                throw err;
            }
        }
    }

    /**
     * Parse the given string an return an AST object.
     *
     * ```js
     * const ast = parser.parse('foo/bar');
     * ```
     */
    parse(input: string) {
        if (typeof input !== 'string') {
            throw new TypeError('expected a string');
        }

        this.init(this.options);
        this.orig = input;
        this.input = input;

        // run parsers
        while (this.input) this.advance();

        // balance unmatched sets, if not disabled
        balanceSets(this, this.stack.pop());

        // create end-of-string node
        const eos = this.eos();
        const ast = this.prev();
        if (ast.type === 'root') {
            this.pushNode(eos, ast);
        }
        return this.ast;
    }

    /**
     * Visit `node` with the given `fn`
     */
    visit(node: Node, fn: Function) {
        if (!util.isNode(node)) {
            throw new Error('expected "node" to be an instance of Node');
        }
        else if ((node as Node & { visited: boolean }).visited) {
            return;
        }

        node.define('visited', true);
        node = fn(node) || node;
        if (node.nodes) {
            this.mapVisit(node.nodes, fn);
        }
        return node;
    }

    /**
     * Map visit over array of `nodes`.
     */
    mapVisit(nodes: Node[], fn: Function) {
        for (const node of nodes) {
            this.visit(node, fn);
        }
    }
}

function balanceSets(parser: Parser, node: Node) {
    if (node && parser.options.strict === true) {
        throw parser.error('imbalanced "' + node.type + '": "' + parser.orig + '"');
    }
    if (node && node.nodes && node.nodes.length) {
        var first = node.nodes[0];
        first.val = '\\' + first.val;
    }
}
