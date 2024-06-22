// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Tool from "./Tool";

/**
 *
 * @author Patrik Harag
 * @version 2024-06-22
 */
export default class ColorSelectionFakeTool extends Tool {

    #func;
    #defaultColor;

    constructor(info, func, defaultColor) {
        super(info);
        this.#func = func;
        this.#defaultColor = defaultColor;
    }

    /**
     *
     * @returns {function(r:number,g:number,b:number):Tool}
     */
    getFunc() {
        return this.#func;
    }

    getDefaultColor() {
        return this.#defaultColor;
    }
}