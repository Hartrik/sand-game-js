import {Scene} from "./Scene.js";
import {SandGame} from "./SandGame";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-28
 */
export class SceneImplSnapshot extends Scene {

    /**
     * @type Snapshot
     */
    #snapshot;

    constructor(snapshot) {
        super();
        this.#snapshot = snapshot;
    }

    countSize(prefWidth, prefHeight) {
        return [this.#snapshot.metadata.width, this.#snapshot.metadata.height];
    }

    create(context, prefWidth, prefHeight, defaultElement) {
        return new SandGame(context, this.#snapshot.metadata.width, this.#snapshot.metadata.height,
                this.#snapshot, defaultElement);
    }
}
