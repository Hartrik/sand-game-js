// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Tool from "../core/tool/Tool.js";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-15
 */
export default class ServiceToolManager {

    #primaryTool;
    #secondaryTool;
    #tertiaryTool;

    /** @type function(Tool)[] */
    #onPrimaryToolChanged = [];


    /** @type boolean */
    #inputDisabled;
    /** @type function(boolean)[] */
    #onInputDisabledChanged = [];

    constructor(primaryTool, secondaryTool, tertiaryTool) {
        this.#primaryTool = primaryTool;
        this.#secondaryTool = secondaryTool;
        this.#tertiaryTool = tertiaryTool;
    }

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

    /**
     *
     * @returns {boolean}
     */
    isInputDisabled() {
        return this.#inputDisabled;
    }

    /**
     *
     * @param handler {function(boolean)}
     */
    addOnInputDisabledChanged(handler) {
        this.#onInputDisabledChanged.push(handler);
    }

    setInputDisabled(disabled) {
        if (this.#inputDisabled !== disabled) {
            this.#inputDisabled = disabled;
            for (let handler of this.#onInputDisabledChanged) {
                handler(disabled);
            }
        }
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
