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
    #flipVertically;

    constructor(scene, flipHorizontally, flipVertically) {
        super();
        this.#original = scene;
        this.#flipHorizontally = flipHorizontally;
        this.#flipVertically = flipVertically;
    }

    countSize(prefWidth, prefHeight) {
        this.#original.countSize(prefWidth, prefHeight);
    }

    createSandGame(prefWidth, prefHeight, defaults, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaults.getDefaultElement());
        return new SandGame(elementArea, null, defaults, context, rendererInitializer);
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

        if (this.#flipVertically) {
            for (let y = 0; y < Math.trunc(height / 2); y++) {
                for (let x = 0; x < width; x++) {
                    elementArea.swap(x, y, x, height - 1 - y);
                }
            }
        }

        return elementArea;
    }
}
