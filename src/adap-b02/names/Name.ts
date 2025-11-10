import { Printable } from "../common/Printable";

export const DEFAULT_DELIMITER: string = ".";
export const ESCAPE_CHARACTER: string = "\\";

export interface Name extends Printable {
    // Queries
    isEmpty(): boolean;
    getNoComponents(): number;
    getComponent(i: number): string;

    // Mutations
    setComponent(i: number, c: string): void; 
    insert(i: number, c: string): void;       
    append(c: string): void;                  
    remove(i: number): void;
    concat(other: Name): void;

    // Conversions
    asString(delimiter?: string): string;
    asDataString(): string;
    getDelimiterCharacter(): string;

}
