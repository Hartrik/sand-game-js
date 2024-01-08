import {Scene} from "./Scene.js";
import {SandGame} from "../SandGame.js";
import {ElementArea} from "../ElementArea.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
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

    async createSandGame(prefWidth, prefHeight, defaults, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaults.getDefaultElement());
        let sandGame = new SandGame(elementArea, null, defaults, context, rendererInitializer);
        this.#sandGame.copyStateTo(sandGame);
        return sandGame;
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        return ElementArea.create(prefWidth, prefHeight, defaultElement);
    }
}
