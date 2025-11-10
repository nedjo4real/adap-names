import { Name, DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "./Name";

export class StringName implements Name {
    private delimiter: string = DEFAULT_DELIMITER;
    // Entire name stored as one masked string where components are joined by `this.delimiter`
    private maskedJoined: string = "";

    // ===== assertions =====
    // @methodtype assertion-method
    private assertIsValidIndex(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i >= this.getNoComponents()) {
            throw new RangeError(`index out of bounds: ${i}`);
        }
    }
    // @methodtype assertion-method
    private assertIsValidInsertIndex(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i > this.getNoComponents()) {
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
    // @methodtype helper-method
    private getComponentsMaskedForSelf(): string[] {
        if (this.maskedJoined.length === 0) { return []; }
        return this.splitMaskedList(this.maskedJoined, this.delimiter);
    }
    // @methodtype helper-method
    private rebuildFromMaskedComponents(maskedForSelf: string[]): void {
        // Validate each component
        maskedForSelf.forEach(c => this.assertIsProperlyMaskedForCurrentDelimiter(c));
        this.maskedJoined = maskedForSelf.join(this.delimiter);
    }

    // ===== ctor =====
    /** Expects components are properly masked for the given delimiter (or default). */
    // @methodtype initialization-method
    constructor(components: string[] | string, delimiter?: string) {
        this.delimiter = delimiter ?? DEFAULT_DELIMITER;

        if (typeof components === "string") {
            this.maskedJoined = components;
            const parts = this.getComponentsMaskedForSelf(); // split using current delimiter
            parts.forEach(c => this.assertIsProperlyMaskedForCurrentDelimiter(c));
            this.maskedJoined = parts.join(this.delimiter);
            return;
        }
        const normalized = components.map(c => this.reMask(c, this.delimiter, this.delimiter));
        this.rebuildFromMaskedComponents(normalized);
    }

    // ===== Printable =====
    // @methodtype conversion-method
    public asString(delimiter?: string): string {
        const useDelim = delimiter ?? this.delimiter;
        const raws = this.getComponentsMaskedForSelf()
            .map(c => this.unmaskForDelimiter(c, this.delimiter));
        return raws.join(useDelim);
    }
    // @methodtype conversion-method
    public asDataString(): string {
        const maskedForDefault = this.getComponentsMaskedForSelf()
            .map(c => this.reMask(c, this.delimiter, DEFAULT_DELIMITER));
        return maskedForDefault.join(DEFAULT_DELIMITER);
    }

    // ===== interface methods =====
    // @methodtype get-method
    public isEmpty(): boolean { return this.getNoComponents() === 0; }

    // @methodtype get-method
    public getNoComponents(): number { return this.getComponentsMaskedForSelf().length; }

    // @methodtype get-method
    public getComponent(i: number): string {
        this.assertIsValidIndex(i);
        return this.getComponentsMaskedForSelf()[i];
    }

    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        this.assertIsValidIndex(i);
        const comps = this.getComponentsMaskedForSelf();
        const remasked = this.reMask(c, this.delimiter, this.delimiter);
        this.assertIsProperlyMaskedForCurrentDelimiter(remasked);
        comps[i] = remasked;
        this.rebuildFromMaskedComponents(comps);
    }

    // @methodtype command-method
    public insert(i: number, c: string): void {
        this.assertIsValidInsertIndex(i);
        const comps = this.getComponentsMaskedForSelf();
        const remasked = this.reMask(c, this.delimiter, this.delimiter);
        this.assertIsProperlyMaskedForCurrentDelimiter(remasked);
        comps.splice(i, 0, remasked);
        this.rebuildFromMaskedComponents(comps);
    }

    // @methodtype command-method
    public append(c: string): void { this.insert(this.getNoComponents(), c); }

    // @methodtype command-method
    public remove(i: number): void {
        this.assertIsValidIndex(i);
        const comps = this.getComponentsMaskedForSelf();
        comps.splice(i, 1);
        this.rebuildFromMaskedComponents(comps);
    }

    // @methodtype command-method
    public concat(other: Name): void {
        const otherData = other.asDataString(); // canonical, delimiter-agnostic
        const otherMaskedForDefault = this.splitMaskedList(otherData, DEFAULT_DELIMITER);
        const comps = this.getComponentsMaskedForSelf();
        for (const m of otherMaskedForDefault) {
            comps.push(this.reMask(m, DEFAULT_DELIMITER, this.delimiter));
        }
        this.rebuildFromMaskedComponents(comps);
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }
}
