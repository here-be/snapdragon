import { Parser } from "./parser";

/**
 * Store the position for a node.
 */
export class Position {
    public end: { line: number, column: number };

    constructor(public start: object, public parser: Parser) {
        this.end = { line: (parser as any).line, column: (parser as any).column };
    }
}
