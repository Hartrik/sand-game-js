import {Scene} from "./Scene.js";
import {SandGame} from "./SandGame.js";
import {ElementArea} from "./ElementArea.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
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

    createSandGame(prefWidth, prefHeight, defaults, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaults.getDefaultElement());
        let sandGame = new SandGame(elementArea, null, defaults, context, rendererInitializer);
        this.#apply(sandGame);
        return sandGame;
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        return ElementArea.create(prefWidth, prefHeight, defaultElement);
    }
}
