import {Tool} from "../core/Tool.js";
import {Tools} from "../def/Tools.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class ServiceToolManager {

    #primaryTool = Tools.byCodeName('sand');
    #secondaryTool = Tools.byCodeName('air');
    #tertiaryTool = Tools.byCodeName('meteor');

    /**
     *
     * @param tool {Tool}
     * @returns void
     */
    setPrimaryTool(tool) {
        this.#primaryTool = tool;
    }

    /**
     *
     * @param tool {Tool}
     * @returns void
     */
    setSecondaryTool(tool) {
        this.#secondaryTool = tool;
    }

    /**
     * @returns {Tool}
     */
    getPrimaryTool() {
        return this.#primaryTool;
    }

    /**
     * @returns {Tool}
     */
    getSecondaryTool() {
        return this.#secondaryTool;
    }

    /**
     * @returns {Tool}
     */
    getTertiaryTool() {
        return this.#tertiaryTool;
    }
}
