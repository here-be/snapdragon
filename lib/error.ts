import { NodeLike } from 'snapdragon-util';
const get = require('get-value');

export function error(this: any, msg: string, node?: NodeLike & { position?: {} }) {
  node = node || {};
  const pos = node.position || {};
  const line = get(node, 'position.end.line') as number || 1;
  const column = get(node, 'position.end.column') as number || 1;
  const source = this.options.source;

  const message = `${source} <line: ${line} column: ${column}>: ${msg}`;
  const err = new Error(message) as Error & { source: typeof source, reason: typeof msg, pos: typeof pos };
  err.source = source;
  err.reason = msg;
  err.pos = pos;

  if (this.options.silent) {
    this.errors.push(err);
  } else {
    throw err;
  }
}
