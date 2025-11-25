import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);
        // Precondition: source not null
        if (!source) {
            throw new Error("source is null");
        }
        // Copy + check masking
        this.components = [];
        for (const c of source) {
            this.assertIsProperlyMasked(c);
            this.components.push(c);
        }
        this.assertClassInvariants();
    }

    public clone(): Name {
        return new StringArrayName([...this.components], this.delimiter);
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        this.assertValidIndex(i);
        return this.components[i];
    }

    public setComponent(i: number, c: string): void {
        this.assertValidIndex(i);
        this.assertIsProperlyMasked(c);
        this.assertClassInvariants();
        this.components[i] = c;
        this.assertClassInvariants();
    }

    public insert(i: number, c: string): void {
        this.assertValidInsertIndex(i);
        this.assertIsProperlyMasked(c);
        this.assertClassInvariants();
        const oldNo = this.getNoComponents();

        this.components.splice(i, 0, c);

        this.assertClassInvariants();
        if (this.getNoComponents() !== oldNo + 1) {
            throw new Error("insert postcondition violated");
        }
    }

    public append(c: string): void {
        this.insert(this.getNoComponents(), c);
    }

    public remove(i: number): void {
        this.assertValidIndex(i);
        this.assertClassInvariants();
        const oldNo = this.getNoComponents();

        this.components.splice(i, 1);

        this.assertClassInvariants();
        if (this.getNoComponents() !== oldNo - 1) {
            throw new Error("remove postcondition violated");
        }
    }
}
