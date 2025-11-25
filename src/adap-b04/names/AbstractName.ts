import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { StringArrayName } from "./StringArrayName";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.assertIsValidDelimiter(delimiter);
        this.delimiter = delimiter;
        this.assertClassInvariants();
    }

    // --- helper assertions ---

    protected assertIsValidDelimiter(delimiter: string): void {
        if (delimiter.length !== 1 || delimiter === ESCAPE_CHARACTER) {
            throw new IllegalArgumentException("invalid delimiter");
        }
    }

    protected assertValidIndex(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i >= this.getNoComponents()) {
            throw new IllegalArgumentException("invalid index");
        }
    }

    protected assertValidInsertIndex(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i > this.getNoComponents()) {
            throw new IllegalArgumentException("invalid insert index");
        }
    }

    protected assertIsProperlyMasked(c: string): void {
        if (c == null) {
            throw new IllegalArgumentException("component is null");
        }
        // Simplified: forbid raw delimiter or escape character
        if (c.includes(this.delimiter) || c.includes(ESCAPE_CHARACTER)) {
            throw new IllegalArgumentException("component not properly masked");
        }
    }

    protected assertClassInvariants(): void {
        const n = this.getNoComponents();
        if (n < 0) {
            throw new InvalidStateException("negative component count");
        }
        for (let i = 0; i < n; i++) {
            const c = this.getComponent(i);
            if (c == null) {
                throw new InvalidStateException("null component");
            }
            this.assertIsProperlyMasked(c);
        }
    }

    // --- Printable / Equality, etc. ---

    public asString(delimiter: string = this.delimiter): string {
        this.assertIsValidDelimiter(delimiter);
        const n = this.getNoComponents();
        const parts: string[] = [];
        for (let i = 0; i < n; i++) {
            parts.push(this.getComponent(i));
        }
        return parts.join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        return this.asString(DEFAULT_DELIMITER);
    }

    public isEqual(other: Name): boolean {
        if (other == null) {
            return false;
        }
        return this.asDataString() === other.asDataString();
    }

    public getHashCode(): number {
        let hashCode = 0;
        const s = this.asDataString();
        for (let i = 0; i < s.length; i++) {
            let c = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0;
        }
        return hashCode;
    }

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public concat(other: Name): void {
        if (other == null) {
            throw new IllegalArgumentException("other is null");
        }
        this.assertClassInvariants();
        const oldNo = this.getNoComponents();

        const otherCount = other.getNoComponents();
        for (let i = 0; i < otherCount; i++) {
            const c = other.getComponent(i);
            this.assertIsProperlyMasked(c);
            this.append(c);
        }

        this.assertClassInvariants();
        if (this.getNoComponents() !== oldNo + otherCount) {
            throw new MethodFailedException("concat postcondition violated");
        }
    }

    // Subclass responsibilities
    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public clone(): Name {
        // generic clone via data string (subclasses may override)
        return new StringArrayName(
            this.asDataString().split(this.delimiter),
            this.delimiter
        );
    }
}
