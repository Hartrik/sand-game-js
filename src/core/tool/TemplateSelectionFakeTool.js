// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Tool from "./Tool";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-08
 */
export default class TemplateSelectionFakeTool extends Tool {

    #templateDefinitions;

    constructor(info, templateDefinitions) {
        super(info);
        this.#templateDefinitions = templateDefinitions;
    }

    getTemplateDefinitions() {
        return this.#templateDefinitions;
    }
}