import {CursorDefinition} from "./CursorDefinition.js";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-23
 */
export class Tool {

    /** @type string */
    #category;

    /** @type string */
    #codeName;

    /** @type string */
    #displayName;

    constructor(category, codeName, displayName) {
        this.#category = category;
        this.#codeName = codeName;
        this.#displayName = displayName;
    }

    /**
     *
     * @return {string}
     */
    getCategory() {
        return this.#category;
    }

    /**
     *
     * @return {string}
     */
    getDisplayName() {
        return this.#displayName;
    }

    /**
     *
     * @return {string}
     */
    getCodeName() {
        return this.#codeName;
    }

    isStrokeEnabled() {
        return false;
    }

    isSelectionEnabled() {
        return false;
    }

    isRepeatingEnabled() {
        return false;
    }

    /**
     * @return {CursorDefinition|null}
     */
    createCursor() {
        // default cursor
        return null;
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
        throw 'Not implemented';
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
}
