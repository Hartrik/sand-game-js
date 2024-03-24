// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Scene from "./Scene.js";
import SandGame from "../SandGame";
import ElementArea from "../ElementArea.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export default class SceneImplSnapshot extends Scene {

    /**
     * @type Snapshot
     */
    #snapshot;

    /**
     *
     * @param snapshot {Snapshot}
     */
    constructor(snapshot) {
        super();
        this.#snapshot = snapshot;
    }

    countSize(prefWidth, prefHeight) {
        return [this.#snapshot.metadata.width, this.#snapshot.metadata.height];
    }

    async createSandGame(prefWidth, prefHeight, defaults, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaults.getDefaultElement());
        return new SandGame(elementArea, this.#snapshot.metadata, defaults, context, rendererInitializer);
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        return ElementArea.from(
                this.#snapshot.metadata.width,
                this.#snapshot.metadata.height,
                this.#snapshot.dataHeads,
                this.#snapshot.dataTails);
    }
}
