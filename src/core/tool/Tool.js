// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import CursorDefinition from "./CursorDefinition.js";
import ToolInfo from "./ToolInfo";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2024-02-08
 */
export default class Tool {

    /** @type ToolInfo|null */
    #info;

    constructor(info = ToolInfo.NOT_DEFINED) {
        this.#info = info;
    }

    /**
     *
     * @returns {ToolInfo}
     */
    getInfo() {
        return this.#info;
    }

    hasCursor() {
        return false;
    }

    /**
     * @return {CursorDefinition|null}
     */
    createCursor() {
        // default cursor
        return null;
    }

    isRepeatingEnabled() {
        return false;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param graphics {SandGameGraphics}
     * @param altModifier {boolean}
     * @return {void}
     */
    applyPoint(x, y, graphics, altModifier) {
        // no action by default
    }

    isLineModeEnabled() {
        return false;
    }

    onDragStart(x, y, graphics, altModifier) {
        // no action by default
    }

    onDragEnd(x, y, graphics, altModifier) {
        // no action by default
    }

    /**
     *
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
     * @param graphics {SandGameGraphics}
     * @param altModifier {boolean}
     * @return {void}
     */
    applyStroke(x1, y1, x2, y2, graphics, altModifier) {
        // no action by default
    }

    isAreaModeEnabled() {
        return false;
    }

    /**
     *
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
     * @param graphics {SandGameGraphics}
     * @param altModifier {boolean}
     * @return {void}
     */
    applyArea(x1, y1, x2, y2, graphics, altModifier) {
        // no action by default
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param graphics {SandGameGraphics}
     * @param altModifier {boolean}
     * @return {void}
     */
    applySpecial(x, y, graphics, altModifier) {
        // no action by default
    }

    isSecondaryActionEnabled() {
        return false;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param graphics {SandGameGraphics}
     * @param altModifier {boolean}
     * @return {void}
     */
    applySecondaryAction(x, y, graphics, altModifier) {
        // no action by default
    }
}
