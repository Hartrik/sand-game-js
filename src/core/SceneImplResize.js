import {Scene} from "./Scene.js";
import {SandGame} from "./SandGame.js";
import {ElementArea} from "./ElementArea.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
 */
export class SceneImplTmpResize extends Scene {

    /**
     * @type SandGame
     */
    #sandGame;

    constructor(sandGame) {
        super();
        this.#sandGame = sandGame;
    }

    countSize(prefWidth, prefHeight) {
        return [prefWidth, prefHeight];
    }

    createSandGame(prefWidth, prefHeight, defaultElement, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaultElement);
        let sandGame = new SandGame(elementArea, null, defaultElement, context, rendererInitializer);
        this.#sandGame.copyStateTo(sandGame);
        return sandGame;
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        return ElementArea.create(prefWidth, prefHeight, defaultElement);
    }
}
