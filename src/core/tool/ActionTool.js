import {Tool} from "../Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
 */
export class ActionTool extends Tool {

    /** @type function */
    #handler;

    constructor(category, codeName, displayName, handler) {
        super(category, codeName, displayName);
        this.#handler = handler;
    }

    applyPoint(x, y, graphics, aldModifier) {
        this.#handler();
    }
}