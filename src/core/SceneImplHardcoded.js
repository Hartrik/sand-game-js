import {Scene} from "./Scene.js";
import {SandGame} from "./SandGame";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-28
 */
export class SceneImplHardcoded extends Scene {

    name;
    description;

    #apply;

    constructor({name, description, apply}) {
        super();
        this.#apply = apply;
        this.name = name;
        this.description = description;
    }

    countSize(prefWidth, prefHeight) {
        return [prefWidth, prefHeight];
    }

    create(context, prefWidth, prefHeight, defaultElement) {
        let sandGame = new SandGame(context, prefWidth, prefHeight, null, defaultElement);
        this.#apply(sandGame);
        return sandGame;
    }
}
