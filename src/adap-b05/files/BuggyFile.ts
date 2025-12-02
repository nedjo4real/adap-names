import { Node } from "./Node";
import { File } from "./File";
import { InvalidStateException } from "../common/InvalidStateException";


export class BuggyFile extends File {

    protected doGetBaseName(): string {
        this.baseName = "";           
        return this.baseName;
    }

    public findNodes(_bn: string): Set<Node> {
        throw new InvalidStateException("BuggyFile encountered during search");
    }
}
