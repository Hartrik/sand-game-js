// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import CursorDefinition from "./CursorDefinition";

/**
 * @author Patrik Harag
 * @version 2023-05-04
 */
export default class CursorDefinitionElementArea extends CursorDefinition {

    /** @type ElementArea */
    #elementArea;

    constructor(elementArea) {
        super();
        this.#elementArea = elementArea;
    }

    getWidth() {
        return this.#elementArea.getWidth();
    }

    getHeight() {
        return this.#elementArea.getHeight();
    }

    getElementArea() {
        return this.#elementArea;
    }
}