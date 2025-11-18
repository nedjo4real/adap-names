import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);
        this.name = source;
        this.noComponents =
            source.length === 0 ? 0 : source.split(this.delimiter).length;
    }

    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    // Helpers to work with the string representation

    protected explode(): string[] {
        if (this.name.length === 0) {
            return [];
        }
        return this.name.split(this.delimiter);
    }

    protected implode(parts: string[]): void {
        this.name = parts.join(this.delimiter);
        this.noComponents = parts.length;
    }

    // Primitive methods required by AbstractName

    protected doGetNoComponents(): number {
        return this.noComponents;
    }

    protected doGetComponent(i: number): string {
        const parts = this.explode();
        return parts[i];
    }

    protected doSetComponent(i: number, c: string): void {
        const parts = this.explode();
        parts[i] = c;
        this.implode(parts);
    }

    protected doInsert(i: number, c: string): void {
        const parts = this.explode();
        parts.splice(i, 0, c);
        this.implode(parts);
    }

    protected doAppend(c: string): void {
        const parts = this.explode();
        parts.push(c);
        this.implode(parts);
    }

    protected doRemove(i: number): void {
        const parts = this.explode();
        parts.splice(i, 1);
        this.implode(parts);
    }
}
