import {Scene} from "./Scene.js";
import {SandGame} from "./SandGame";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-28
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

    create(context, prefWidth, prefHeight, defaultElement) {
        let sandGame = new SandGame(context, prefWidth, prefHeight, null, defaultElement);
        this.#sandGame.copyStateTo(sandGame);
        return sandGame;
    }
}
