import {Tool} from "./Tool";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-13
 */
export default class GlobalActionTool extends Tool {

    /** @type function(SandGame|null) */
    #handler;

    constructor(info, handler) {
        super(info);
        this.#handler = handler;
    }

    /**
     *
     * @return {function((SandGame|null))}
     */
    getHandler() {
        return this.#handler;
    }
}