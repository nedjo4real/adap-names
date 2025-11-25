import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";

export class StringName extends AbstractName implements Name {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(name: string, delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);

        if (name == null) {
            throw new IllegalArgumentException("name is null");
        }

        this.name = name;

        const components = this.parseComponents();
        this.noComponents = components.length;

        // Check masking of all components (precondition + invariant)
        for (const c of components) {
            this.assertIsProperlyMasked(c);
        }

        this.assertClassInvariants();
    }

    // --------- internal helpers ---------

    protected parseComponents(): string[] {
        if (this.name.length === 0) {
            return [];
        }
        return this.name.split(this.delimiter);
    }

    protected rebuildName(components: string[]): void {
        this.name = components.join(this.delimiter);
        this.noComponents = components.length;
    }

    // --------- Name implementation ---------

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(i: number): string {
        this.assertValidIndex(i);
        const components = this.parseComponents();
        return components[i];
    }

    public setComponent(i: number, c: string): void {
        this.assertValidIndex(i);
        this.assertIsProperlyMasked(c);

        this.assertClassInvariants();

        const components = this.parseComponents();
        components[i] = c;
        this.rebuildName(components);

        this.assertClassInvariants();
        // noComponents unchanged, so no additional postcondition check
    }

    public insert(i: number, c: string): void {
        this.assertValidInsertIndex(i);
        this.assertIsProperlyMasked(c);

        this.assertClassInvariants();
        const oldNo = this.getNoComponents();

        const components = this.parseComponents();
        components.splice(i, 0, c);
        this.rebuildName(components);

        this.assertClassInvariants();
        if (this.getNoComponents() !== oldNo + 1) {
            throw new MethodFailedException("insert postcondition violated");
        }
    }

    public append(c: string): void {
        this.insert(this.getNoComponents(), c);
    }

    public remove(i: number): void {
        this.assertValidIndex(i);

        this.assertClassInvariants();
        const oldNo = this.getNoComponents();

        const components = this.parseComponents();
        components.splice(i, 1);
        this.rebuildName(components);

        this.assertClassInvariants();
        if (this.getNoComponents() !== oldNo - 1) {
            throw new MethodFailedException("remove postcondition violated");
        }
    }

    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }
}
