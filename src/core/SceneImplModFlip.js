import {Scene} from "./Scene.js";
import {SandGame} from "./SandGame.js";

/**
 * Create flipped scene using object composition.
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class SceneImplModFlip extends Scene {

    /**
     * @type Scene
     */
    #original;

    #flipHorizontally;

    constructor(scene, flipHorizontally) {
        super();
        this.#original = scene;
        this.#flipHorizontally = flipHorizontally;
    }

    countSize(prefWidth, prefHeight) {
        this.#original.countSize(prefWidth, prefHeight);
    }

    createSandGame(context, prefWidth, prefHeight, defaultElement) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaultElement);
        return new SandGame(context, elementArea, null, defaultElement);
        // TODO: sceneMetadata not set
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        const elementArea = this.#original.createElementArea(prefWidth, prefHeight, defaultElement);

        const width = elementArea.getWidth();
        const height = elementArea.getHeight();

        if (this.#flipHorizontally) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < Math.trunc(width / 2); x++) {
                    elementArea.swap(x, y, width - 1 - x, y);
                }
            }
        }

        return elementArea;
    }
}
