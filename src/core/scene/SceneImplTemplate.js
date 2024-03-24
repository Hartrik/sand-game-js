// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Scene from "./Scene.js";
import SandGame from "../SandGame";
import ElementArea from "../ElementArea.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export default class SceneImplTemplate extends Scene {

    /**
     * @type ElementArea
     */
    #elementArea;

    /**
     *
     * @param elementArea {ElementArea}
     */
    constructor(elementArea) {
        super();
        this.#elementArea = elementArea;
    }

    countSize(prefWidth, prefHeight) {
        return [this.#elementArea.getWidth(), this.#elementArea.getHeight()];
    }

    async createSandGame(prefWidth, prefHeight, defaults, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaults.getDefaultElement());
        return new SandGame(elementArea, null, defaults, context, rendererInitializer);
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        return ElementArea.from(
                this.#elementArea.getWidth(),
                this.#elementArea.getHeight(),
                this.#elementArea.getDataHeads(),
                this.#elementArea.getDataTails());
    }
}
