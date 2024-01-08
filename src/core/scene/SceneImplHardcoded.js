import {Scene} from "./Scene.js";
import {SandGame} from "../SandGame.js";
import {ElementArea} from "../ElementArea.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export class SceneImplHardcoded extends Scene {

    name;
    description;

    /** @type function(SandGame):Promise<any>|any */
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

    async createSandGame(prefWidth, prefHeight, defaults, context, rendererInitializer) {
        let elementArea = this.createElementArea(prefWidth, prefHeight, defaults.getDefaultElement());
        let sandGame = new SandGame(elementArea, null, defaults, context, rendererInitializer);
        await this.#apply(sandGame);
        return sandGame;
    }

    createElementArea(prefWidth, prefHeight, defaultElement) {
        return ElementArea.create(prefWidth, prefHeight, defaultElement);
    }
}
