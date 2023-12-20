import {Tool} from "../core/Tool.js";
import {ToolDefs} from "../def/ToolDefs.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class ServiceToolManager {

    #primaryTool = ToolDefs.byCodeName('sand');
    #secondaryTool = ToolDefs.byCodeName('air');
    #tertiaryTool = ToolDefs.byCodeName('meteor');

    /** @type function(Tool)[] */
    #onPrimaryToolChanged = [];

    /**
     *
     * @param tool {Tool}
     * @returns void
     */
    setPrimaryTool(tool) {
        this.#primaryTool = tool;
        for (let handler of this.#onPrimaryToolChanged) {
            handler(tool);
        }
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
     *
     * @param tool {Tool}
     * @returns void
     */
    setTertiaryTool(tool) {
        this.#tertiaryTool = tool;
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

    /**
     *
     * @param handler {function(Tool)}
     */
    addOnPrimaryToolChanged(handler) {
        this.#onPrimaryToolChanged.push(handler);
    }

    createRevertAction() {
        const oldPrimary = this.getPrimaryTool();
        const oldSecondary = this.getSecondaryTool();
        const oldTertiary = this.getTertiaryTool();
        return () => {
            this.setPrimaryTool(oldPrimary);
            this.setSecondaryTool(oldSecondary);
            this.setTertiaryTool(oldTertiary);
        };
    }
}
