import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/**
 * Abstract base class for Name implementations.
 * Implements the common behavior based on a small primitive inheritance interface.
 */
export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    protected constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.delimiter = delimiter;
    }

    // ----- Cloneable -----
    public abstract clone(): Name;

    // ----- Printable -----

    public asString(delimiter: string = this.delimiter): string {
        const noComponents: number = this.getNoComponents();
        const parts: string[] = [];
        for (let i = 0; i < noComponents; i++) {
            parts.push(this.getComponent(i));
        }
        return parts.join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        // Stable, machine-oriented representation for hashing / debugging.
        const noComponents: number = this.getNoComponents();
        const parts: string[] = [];
        for (let i = 0; i < noComponents; i++) {
            parts.push(this.getComponent(i));
        }
        return parts.join("#");
    }

    // ----- Equality -----

    public isEqual(other: any): boolean {
        const otherName = other as Name;
        if (!otherName) {
            return false;
        }
        const thisCount = this.getNoComponents();
        if (thisCount !== otherName.getNoComponents()) {
            return false;
        }
        for (let i = 0; i < thisCount; i++) {
            if (this.getComponent(i) !== otherName.getComponent(i)) {
                return false;
            }
        }
        return true;
    }

    public getHashCode(): number {
        let hashCode = 0;
        const s: string = this.asDataString();
        for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0;
        }
        return hashCode;
    }

    // ----- Name core behavior (use-client interface) -----

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public getNoComponents(): number {
        return this.doGetNoComponents();
    }

    public getComponent(i: number): string {
        return this.doGetComponent(i);
    }

    /** Expects that new Name component c is properly masked */
    public setComponent(i: number, c: string): void {
        this.doSetComponent(i, c);
    }

    /** Expects that new Name component c is properly masked */
    public insert(i: number, c: string): void {
        this.doInsert(i, c);
    }

    /** Expects that new Name component c is properly masked */
    public append(c: string): void {
        this.doAppend(c);
    }

    public remove(i: number): void {
        this.doRemove(i);
    }

    public concat(other: Name): void {
        const count = other.getNoComponents();
        for (let i = 0; i < count; i++) {
            this.append(other.getComponent(i));
        }
    }

    // ----- Narrow inheritance interface (primitive methods) -----

    protected abstract doGetNoComponents(): number;

    protected abstract doGetComponent(i: number): string;

    protected abstract doSetComponent(i: number, c: string): void;

    protected abstract doInsert(i: number, c: string): void;

    protected abstract doAppend(c: string): void;

    protected abstract doRemove(i: number): void;
}
