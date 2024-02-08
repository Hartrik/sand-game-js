import {Tool} from "./Tool";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-08
 */
export class TemplateSelectionFakeTool extends Tool {

    #templateDefinitions;

    constructor(info, templateDefinitions) {
        super(info);
        this.#templateDefinitions = templateDefinitions;
    }

    getTemplateDefinitions() {
        return this.#templateDefinitions;
    }
}