export const DEFAULT_DELIMITER: string = '.';
export const ESCAPE_CHARACTER = '\\';

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 * 
 * Homogenous name examples
 * 
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 */
export class Name {
    private delimiter: string = DEFAULT_DELIMITER;
    private components: string[] = [];

    // ===== helper assertions =================================================

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

    // Ensures no unescaped delimiter or stray escape exists for this.delimiter
    // @methodtype assertion-method
    private assertIsProperlyMaskedForCurrentDelimiter(c: string): void {
        const d = this.delimiter;
        let escaped = false;
        for (let i = 0; i < c.length; i++) {
            const ch = c[i];
            if (escaped) {
                // Only delimiter or escape should be escaped; others allowed, but then
                // the backslash is redundant. We allow it but normalize on re-mask.
                escaped = false;
                continue;
            }
            if (ch === ESCAPE_CHARACTER) {
                escaped = true;
                continue;
            }
            if (ch === d) {
                // delimiter must be escaped
                throw new RangeError(`unescaped delimiter '${d}' in component`);
            }
        }
        if (escaped) {
            throw new RangeError(`dangling escape at end of component`);
        }
    }

    // ===== masking helpers ===================================================

    // @methodtype helper-method
    private maskForDelimiter(raw: string, delimiter: string): string {
        let out = '';
        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];
            if (ch === ESCAPE_CHARACTER || ch === delimiter) {
                out += ESCAPE_CHARACTER;
            }
            out += ch;
        }
        return out;
    }

    // @methodtype helper-method
    private unmaskForDelimiter(masked: string, delimiter: string): string {
        let out = '';
        let escaped = false;
        for (let i = 0; i < masked.length; i++) {
            const ch = masked[i];
            if (escaped) {
                // Only treat escaped delimiter or escape as special; keep others as-is
                if (ch === delimiter || ch === ESCAPE_CHARACTER) {
                    out += ch;
                } else {
                    // Keep the escape — not expected if input is "properly masked"
                    out += ESCAPE_CHARACTER + ch;
                }
                escaped = false;
                continue;
            }
            if (ch === ESCAPE_CHARACTER) {
                escaped = true;
                continue;
            }
            out += ch;
        }
        if (escaped) {
            // dangling escape; treat as literal backslash
            out += ESCAPE_CHARACTER;
        }
        return out;
    }

    // Convert a component masked for `fromDelim` to *masked* for `toDelim`
    // @methodtype helper-method
    private reMask(maskedForFrom: string, fromDelim: string, toDelim: string): string {
        const raw = this.unmaskForDelimiter(maskedForFrom, fromDelim);
        return this.maskForDelimiter(raw, toDelim);
    }

    // ===== ctor ==============================================================

    /** Expects that all Name components are properly masked */
    // @methodtype initialization-method
    constructor(other: string[], delimiter?: string) {
        this.delimiter = delimiter ?? DEFAULT_DELIMITER;
        // Normalize to internal delimiter masking
        this.components = other.map(c => this.reMask(c, this.delimiter, this.delimiter));
        // Validate
        this.components.forEach(c => this.assertIsProperlyMaskedForCurrentDelimiter(c));
    }

    /**
     * Returns a human-readable representation using the provided delimiter.
     * Control characters are NOT escaped in the output.
     */
    // @methodtype conversion-method
    public asString(delimiter?: string): string {
        const useDelim = delimiter ?? this.delimiter;
        // produce raw components, then join with chosen delimiter
        const raws = this.components.map(c => this.unmaskForDelimiter(c, this.delimiter));
        return raws.join(useDelim);
    }

    /**
     * Returns a machine-readable data string using DEFAULT_DELIMITER and proper escaping.
     * From this string, a Name can be parsed back using DEFAULT_DELIMITER rules.
     */
    // @methodtype conversion-method
    public asDataString(): string {
        const maskedForDefault = this.components.map(c =>
            this.reMask(c, this.delimiter, DEFAULT_DELIMITER)
        );
        return maskedForDefault.join(DEFAULT_DELIMITER);
    }

    // ===== basic queries / mutations ========================================

    /** Returns the i-th component in masked form for this.delimiter */
    // @methodtype get-method
    public getComponent(i: number): string {
        this.assertIsValidIndex(i);
        return this.components[i];
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        this.assertIsValidIndex(i);
        // normalize to current delimiter masking and validate
        const remasked = this.reMask(c, this.delimiter, this.delimiter);
        this.assertIsProperlyMaskedForCurrentDelimiter(remasked);
        this.components[i] = remasked;
    }

    /** Returns number of components in Name instance */
    // @methodtype get-method
    public getNoComponents(): number {
        return this.components.length;
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype command-method
    public insert(i: number, c: string): void {
        this.assertIsValidInsertIndex(i);
        const remasked = this.reMask(c, this.delimiter, this.delimiter);
        this.assertIsProperlyMaskedForCurrentDelimiter(remasked);
        this.components.splice(i, 0, remasked);
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype command-method
    public append(c: string): void {
        this.insert(this.components.length, c);
    }

    // @methodtype command-method
    public remove(i: number): void {
        this.assertIsValidIndex(i);
        this.components.splice(i, 1);
    }
}