import {Scene} from "./Scene.js";
import {SandGame} from "./SandGame";
import {ElementArea} from "./ElementArea.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-05-16
 */
export class SceneImplTemplate extends Scene {

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

    createSandGame(prefWidth, prefHeight, defaultElement, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaultElement);
        return new SandGame(elementArea, null, defaultElement, context, rendererInitializer);
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        return ElementArea.from(
                this.#elementArea.getWidth(),
                this.#elementArea.getHeight(),
                this.#elementArea.getDataHeads(),
                this.#elementArea.getDataTails());
    }
}
