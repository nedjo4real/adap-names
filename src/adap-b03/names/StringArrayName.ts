import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);
        this.components = [...source];
    }

    public clone(): Name {
        return new StringArrayName([...this.components], this.delimiter);
    }

    // Primitive methods required by AbstractName

    protected doGetNoComponents(): number {
        return this.components.length;
    }

    protected doGetComponent(i: number): string {
        return this.components[i];
    }

    protected doSetComponent(i: number, c: string): void {
        this.components[i] = c;
    }

    protected doInsert(i: number, c: string): void {
        this.components.splice(i, 0, c);
    }

    protected doAppend(c: string): void {
        this.components.push(c);
    }

    protected doRemove(i: number): void {
        this.components.splice(i, 1);
    }
}
