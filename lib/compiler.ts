import { error } from './error';
import { Node } from 'snapdragon-node';
import * as utils from 'snapdragon-util'
import * as Emitter from 'component-emitter';
import { SourceMapProperties, mixin } from './source-maps';
import { SourceMapGenerator } from 'source-map/source-map';

export interface CompilerOptions {
    silent?: boolean;
    inputSourcemaps?: boolean;
}

export interface CompleteCompilerOptions extends CompilerOptions {
    source: string;
}

export interface CompileOptions {
    sourcemap: boolean | 'generator';
}

export class Compiler implements Partial<SourceMapProperties> {
    private compilers: { [key: string]: (this: Compiler, node: Node) => void } = {};
    options: CompleteCompilerOptions;
    on: Emitter['on'];
    state: utils.StateLike;
    ast: Node | null = null;
    emitter: Emitter = new Emitter();
    output: string = '';
    //indent: string = '';

    map?: SourceMapProperties['map'];
    position?: SourceMapProperties['position'];
    content?: SourceMapProperties['content'];
    files?: SourceMapProperties['files'];

    constructor(options?: CompilerOptions, state?: utils.StateLike) {
        this.options = Object.assign({ source: 'string' }, options);
        this.state = state || {};
        this.state.inside = this.state.inside || {};
        this.on = this.emitter.on.bind(this.emitter);

        this.set('eos', function (node) {
            return this.emit(utils.value(node)!, node);
        });
        this.set('bos', function (node) {
            return this.emit(utils.value(node)!, node);
        });

        this.define('isCompiler', true);
    }

    /**
     * Register a plugin function for a `Compiler` instance.
     *
     * ```js
     * const compiler = new Compiler();
     * compiler.use(function(instance) {
     *   console.log(this);     //<= compiler instance
     *   console.log(instance); //<= compiler instance
     * });
     * ```
     */
    use(fn: (instance: Compiler) => void) {
        fn.call(this, this);
        return this;
    }

    /**
     * Throw a formatted error message with details including the cursor position.
     *
     * ```js
     * compiler.set('foo', function(node) {
     *   if (node.val !== 'foo') {
     *     this.error('expected node.val to be "foo"', node);
     *   }
     * });
     * ```
     */
    error(msg: string, node?: Node) {
        error.call(this, msg, node);
    }

    /**
     * Concat the given string to `compiler.output`.
     *
     * ```js
     * compiler.set('foo', function(node) {
     *   this.emit(node.value, node);
     * });
     * ```
     */
    emit(value: string, node: Node) {
        this.output += value;
        return value;
    }

    /**
     * Emit an empty string to effectively "skip" the string for the given `node`,
     * but still emit the position and node type.
     *
     * ```js
     * // example: do nothing for beginning-of-string
     * snapdragon.compiler.set('bos', compiler.noop);
     * ```
     */
    noop(node: Node) {
        this.emit('', node);
    }

    /**
     * Define a non-enumberable property on the `Compiler` instance. This is useful
     * in plugins, for exposing methods inside handlers.
     *
     * ```js
     * compiler.define('customMethod', function() {
     *   // do stuff
     * });
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
     * Add a compiler `fn` for the given `type`. Compilers are called
     * when the `.compile` method encounters a node of the given type to
     * generate the output string.
     *
     * ```js
     * compiler
     *   .set('comma', function(node) {
     *     this.emit(',');
     *   })
     *   .set('dot', function(node) {
     *     this.emit('.');
     *   })
     *   .set('slash', function(node) {
     *     this.emit('/');
     *   });
     * ```
     */
    set(type: string, fn: (this: Compiler, node: Node) => void) {
        this.compilers[type] = fn;
        return this;
    }

    /**
     * Get the compiler of the given `type`.
     *
     * ```js
     * const fn = compiler.get('slash');
     * ```
     */
    get(type: string) {
        return this.compilers[type];
    }

    /**
     * Visit `node` using the registered compiler function associated with the
     * `node.type`.
     *
     * ```js
     * compiler
     *   .set('i', function(node) {
     *     this.visit(node);
     *   })
     * ```
     */
    visit(node: Node) {
        if (utils.isOpen(node)) {
            utils.addType(this.state, node);
        }

        this.emitter.emit('node', node);

        const fn = this.compilers[node.type!] || this.compilers['unknown'];
        if (typeof fn !== 'function') {
            /* throw */ this.error(`compiler "${node.type}" is not registered`, node);
        }

        const val = fn.call(this, node) as Node || node;
        if (utils.isNode(val)) {
            node = val;
        }

        if (utils.isClose(node)) {
            utils.removeType(this.state, node);
        }
        return node;
    }

    /**
     * Iterate over `node.nodes`, calling [visit](#visit) on each node.
     *
     * ```js
     * compiler
     *   .set('i', function(node) {
     *     utils.mapVisit(node);
     *   })
     * ```
     */
    mapVisit(parent: Node) {
        const nodes = parent.nodes || (parent as any).children as Node[];
        for (let node of nodes) {
            if (!node.parent) {
                node.parent = parent;
            }
            node = this.visit(node);
        }
        /* for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!node.parent) node.parent = parent;
            nodes[i] = this.visit(node) || node;
        } */
    }

    /**
     * Compile the given `AST` and return a string. Iterates over `ast.nodes`
     * with [mapVisit](#mapVisit).
     *
     * ```js
     * const ast = parser.parse('foo');
     * const str = compiler.compile(ast);
     * ```
     */
    compile(ast: Node): this;
    compile(ast: Node, options: { sourcemap: false }): this;
    compile(ast: Node, options: { sourcemap: true | 'generator' }): Promise<this & SourceMapProperties>;
    compile(ast: Node, options?: CompileOptions) {
        const opts = Object.assign({}, this.options, options);
        this.ast = ast;
        this.output = '';

        // source map support
        if (opts.sourcemap) {
            const sourcemaps = require('./source-maps').mixin as typeof mixin;
            sourcemaps(this);
            this.mapVisit(this.ast);
            return (this as any).applySourceMaps().then(() => {
                this.map = opts.sourcemap === 'generator' ? this.map : (this.map as SourceMapGenerator).toJSON();
                return this as this & SourceMapProperties;
            });
        } else {
            this.mapVisit(this.ast);
            return this;
        }
    }
}
