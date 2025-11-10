import { Name, DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "./Name";

export class StringArrayName implements Name {
    private delimiter: string = DEFAULT_DELIMITER;
    private components: string[] = [];

    // ===== assertions =====
    // @methodtype assertion-method
    private assertIsValidIndex(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i >= this.components.length) {
            throw new RangeError(`index out of bounds: ${i}`);
        }
    }
    // @methodtype assertion-method
    private assertIsValidInsertIndex(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i > this.components.length) {
            throw new RangeError(`insert index out of bounds: ${i}`);
        }
    }
    // @methodtype assertion-method
    private assertIsProperlyMaskedForCurrentDelimiter(c: string): void {
        const d = this.delimiter;
        let escaped = false;
        for (let i = 0; i < c.length; i++) {
            const ch = c[i];
            if (escaped) { escaped = false; continue; }
            if (ch === ESCAPE_CHARACTER) { escaped = true; continue; }
            if (ch === d) { throw new RangeError(`unescaped delimiter '${d}' in component`); }
        }
        if (escaped) { throw new RangeError("dangling escape at end of component"); }
    }

    // ===== helpers =====
    // @methodtype helper-method
    private maskForDelimiter(raw: string, delimiter: string): string {
        let out = "";
        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];
            if (ch === ESCAPE_CHARACTER || ch === delimiter) { out += ESCAPE_CHARACTER; }
            out += ch;
        }
        return out;
    }
    // @methodtype helper-method
    private unmaskForDelimiter(masked: string, delimiter: string): string {
        let out = "", escaped = false;
        for (let i = 0; i < masked.length; i++) {
            const ch = masked[i];
            if (escaped) {
                if (ch === delimiter || ch === ESCAPE_CHARACTER) { out += ch; }
                else { out += ESCAPE_CHARACTER + ch; }
                escaped = false; continue;
            }
            if (ch === ESCAPE_CHARACTER) { escaped = true; continue; }
            out += ch;
        }
        if (escaped) { throw new RangeError("dangling escape at end of component"); }
        return out;
    }
    // @methodtype helper-method
    private reMask(maskedForFrom: string, fromDelim: string, toDelim: string): string {
        const raw = this.unmaskForDelimiter(maskedForFrom, fromDelim);
        return this.maskForDelimiter(raw, toDelim);
    }
    // Split a DEFAULT_DELIMITER data string into masked components for DEFAULT_DELIMITER
    // @methodtype helper-method
    private splitMaskedList(text: string, delimiter: string): string[] {
        const out: string[] = [];
        let cur = "", escaped = false;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (escaped) { cur += ch; escaped = false; continue; }
            if (ch === ESCAPE_CHARACTER) { escaped = true; continue; }
            if (ch === delimiter) { out.push(cur); cur = ""; continue; }
            cur += ch;
        }
        if (escaped) { throw new RangeError("dangling escape at end of list"); }
        out.push(cur);
        return out;
    }

    // ===== ctor =====
    /** Expects all components are properly masked for the provided delimiter (or default). */
    // @methodtype initialization-method
    constructor(components: string[], delimiter?: string) {
        this.delimiter = delimiter ?? DEFAULT_DELIMITER;
        this.components = components.map(c => this.reMask(c, this.delimiter, this.delimiter));
        this.components.forEach(c => this.assertIsProperlyMaskedForCurrentDelimiter(c));
    }

    // ===== Printable =====
    // @methodtype conversion-method
    public asString(delimiter?: string): string {
        const useDelim = delimiter ?? this.delimiter;
        const raws = this.components.map(c => this.unmaskForDelimiter(c, this.delimiter));
        return raws.join(useDelim);
        // Mirrors your B01 behavior. 
    }
    // @methodtype conversion-method
    public asDataString(): string {
        const maskedForDefault = this.components.map(c =>
            this.reMask(c, this.delimiter, DEFAULT_DELIMITER)
        );
        return maskedForDefault.join(DEFAULT_DELIMITER);
        // Same algorithm as B01, just refactored. :contentReference[oaicite:2]{index=2}
    }

    // ===== interface methods =====
    // @methodtype get-method
    public isEmpty(): boolean { return this.components.length === 0; }

    // @methodtype get-method
    public getNoComponents(): number { return this.components.length; }

    // @methodtype get-method
    public getComponent(i: number): string { this.assertIsValidIndex(i); return this.components[i]; }

    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        this.assertIsValidIndex(i);
        const remasked = this.reMask(c, this.delimiter, this.delimiter);
        this.assertIsProperlyMaskedForCurrentDelimiter(remasked);
        this.components[i] = remasked;
    }

    // @methodtype command-method
    public insert(i: number, c: string): void {
        this.assertIsValidInsertIndex(i);
        const remasked = this.reMask(c, this.delimiter, this.delimiter);
        this.assertIsProperlyMaskedForCurrentDelimiter(remasked);
        this.components.splice(i, 0, remasked);
    }

    // @methodtype command-method
    public append(c: string): void { this.insert(this.components.length, c); }

    // @methodtype command-method
    public remove(i: number): void { this.assertIsValidIndex(i); this.components.splice(i, 1); }

    // @methodtype command-method
    public concat(other: Name): void {
        // Go through the canonical data string to avoid depending on other's delimiter.
        const otherData = other.asDataString();
        const otherMaskedForDefault = this.splitMaskedList(otherData, DEFAULT_DELIMITER);
        for (const compMaskedForDefault of otherMaskedForDefault) {
            const remasked = this.reMask(compMaskedForDefault, DEFAULT_DELIMITER, this.delimiter);
            this.components.push(remasked);
        }
    }
    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

}
