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

    createSandGame(context, prefWidth, prefHeight, defaultElement) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaultElement);
        return new SandGame(context, elementArea, null, defaultElement);
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        let width = this.#elementArea.getWidth();
        let height = this.#elementArea.getHeight();
        let data = this.#elementArea.getData();
        return ElementArea.from(width, height, data);
    }
}
