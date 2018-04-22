import * as fs from 'fs';
import * as path from 'path';
import { Compiler } from './compiler';
import { Node } from 'snapdragon-node';
import { SourceMapGenerator, Position as SourceMapPosition, SourceMapConsumer, RawSourceMap } from 'source-map';

const sourceMapResolve = require('source-map-resolve');

/**
 * SourceMap properties interface.
 */
export interface SourceMapProperties {
    map: SourceMapGenerator | RawSourceMap;
    position: SourceMapPosition;
    content: { [key: string]: string };
    files: { [key: string]: string };
}

/**
 * SourceMap mixin interface.
 */
export interface SourceMap extends SourceMapProperties {
    updatePosition: typeof updatePosition;
    emit: typeof emit;
    addFile: typeof addFile;
    addContent: typeof addContent;
    applySourceMaps: typeof applySourceMaps;
    comment: typeof comment;
}

export interface Position {
    content: string
}

/**
 * Mixin source map support into `compiler`.
 */
// TODO: should a fallback function be used if `compiler.comment` is undefined?
export function mixin(compiler: Compiler) {
    define(compiler, '_comment', (compiler as any).comment || (() => ''));

    (compiler as Compiler & SourceMapProperties).map = new SourceMapGenerator();
    (compiler as Compiler & SourceMapProperties).position = { line: 1, column: 1 };
    (compiler as Compiler & SourceMapProperties).content = {};
    (compiler as Compiler & SourceMapProperties).files = {};

    if ((compiler as any).isSourceMap !== true) {
        define(compiler, 'isSourceMap', true);
        for (const key in exports) {
            define(compiler, key, exports[key]);
        }
    }
}

/**
 * Update position.
 */
export function updatePosition(this: Compiler & SourceMap, str: string) {
    const lines = str.match(/\n/g);
    if (lines) {
        this.position.line += lines.length
    }
    const i = str.lastIndexOf('\n');
    this.position.column = ~i ? str.length - i : this.position.column + str.length;
}

export function emit(this: Compiler & SourceMap, str: string, node: Node) {
    const position = node.position || {};
    let source = position.source;

    if (source) {
        if (position.filepath) {
            source = unixify(position.filepath);
        }

        (this.map as SourceMapGenerator).addMapping({
            source: source,
            generated: {
                line: this.position.line,
                column: Math.max(this.position.column - 1, 0)
            },
            original: {
                line: position.start.line,
                column: position.start.column - 1
            }
        });

        if (position.content) {
            this.addContent(source, position);
        }
        if (position.filepath) {
            this.addFile(source, position);
        }
    }

    this.updatePosition(str);
    this.output += str;
    return str;
}

/**
 * Adds a file to the source map output if it has not already been added.
 */
export function addFile(this: Compiler & SourceMap, file: string, position: Position) {
    if (typeof position.content !== 'string') return;
    if (Object.prototype.hasOwnProperty.call(this.files, file)) return;
    this.files[file] = position.content;
}

/**
 * Adds a content source to the source map output if it has not already been added
 */
export function addContent(this: Compiler & SourceMap, source: string, position: Position) {
    if (typeof position.content !== 'string') return;
    if (Object.prototype.hasOwnProperty.call(this.content, source)) return;
    (this.map as SourceMapGenerator).setSourceContent(source, position.content);
}

/**
 * Applies any original source maps to the output and embeds the source file
 * contents in the source map.
 */
export async function applySourceMaps(this: Compiler & SourceMap) {
    for (const file of Object.keys(this.files)) {
        const content = this.files[file];
        (this.map as SourceMapGenerator).setSourceContent(file, content);

        if (this.options.inputSourcemaps === true) {
            const originalMap = sourceMapResolve.resolveSync(content, file, fs.readFileSync);
            if (originalMap) {
                const map = await new SourceMapConsumer(originalMap.map);
                const relativeTo = originalMap.sourcesRelativeTo;
                (this.map as SourceMapGenerator).applySourceMap(map, file, unixify(path.dirname(relativeTo)));
            }
        }
    }
}

/**
 * Process comments, drops sourceMap comments.
 */
// TODO: Why does emit require `node.position` and not `node` itself?
export function comment(this: Compiler, node: Node & { comment?: string }) {
    if (node.comment && /^# sourceMappingURL=/.test(node.comment)) {
        return this.emit('', node /* node.position */);
    }
    return (this as any as { _comment: (node: Node) => string })._comment(node);
}

/**
 * Convert backslash in the given string to forward slashes.
 */
function unixify(fp: string) {
    return fp.split(/\\+/).join('/');
}

/**
 * Object.defineproperty simplification.
 */
function define<T, K extends string, V>(obj: T, name: K, val: V) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: val
    });
    return obj as (T & { [key in K]: V });
}
