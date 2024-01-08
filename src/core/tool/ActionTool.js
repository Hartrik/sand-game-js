import {Tool} from "./Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export class ActionTool extends Tool {

    /** @type function */
    #handler;

    constructor(info, handler) {
        super(info);
        this.#handler = handler;
    }

    applyPoint(x, y, graphics, aldModifier) {
        this.#handler();
    }
}