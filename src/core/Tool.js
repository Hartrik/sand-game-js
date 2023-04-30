import { Brush } from "./Brush.js";
import { Element } from "./Element.js";
import { DomBuilder } from "../DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-30
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

    /**
     * @param {number} scale
     * @return {{node:any,width:number,height:number}|null}
     */
    createCursor(scale) {
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


    // static factory methods

    static rectangleBrushTool(category, codeName, displayName, brush, size) {
        return new RectangleBrushTool(category, codeName, displayName, brush, size);
    }

    static pointBrushTool(category, codeName, displayName, brush) {
        return new PointBrushTool(category, codeName, displayName, brush);
    }

    static pasteTool(category, codeName, displayName, scene, handler) {
        return new PasteTool(category, codeName, displayName, scene, handler);
    }

    static actionTool(category, codeName, displayName, handler) {
        return new ActionTool(category, codeName, displayName, handler);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-04-30
 */
class RectangleBrushTool extends Tool {

    /** @type Brush */
    #brush;

    /** @type Brush */
    #altBrush;

    /** @type number */
    #size;

    constructor(category, codeName, displayName, brush, size) {
        super(category, codeName, displayName);
        this.#brush = brush;
        this.#altBrush = Brush.gentle(brush);
        this.#size = size;
    }

    isStrokeEnabled() {
        return true;
    }

    isSelectionEnabled() {
        return true;
    }

    applyPoint(x, y, graphics, altModifier) {
        this.applyStroke(x, y, x, y, graphics, altModifier);
    }

    applyStroke(x1, y1, x2, y2, graphics, altModifier) {
        const brush = altModifier ? this.#altBrush : this.#brush;
        graphics.drawLine(x1, y1, x2, y2, this.#size, brush);
    }

    applyArea(x1, y1, x2, y2, graphics, altModifier) {
        const brush = altModifier ? this.#altBrush : this.#brush;
        graphics.drawRectangle(x1, y1, x2, y2, brush);
    }

    applySpecial(x, y, graphics, altModifier) {
        const brush = altModifier ? this.#altBrush : this.#brush;
        graphics.floodFill(x, y, brush, 1);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-04-15
 */
class PointBrushTool extends Tool {

    /** @type Brush */
    #brush;

    constructor(category, codeName, displayName, brush) {
        super(category, codeName, displayName);
        this.#brush = brush;
    }

    applyPoint(x, y, graphics, aldModifier) {
        graphics.draw(x, y, this.#brush);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
 */
class PasteTool extends Tool {

    static DEFAULT_W = 30;
    static DEFAULT_H = 30;
    static BACKGROUND_ELEMENT = new Element(0xFFFFFFFF, 0xFFFFFFFF);

    /** @type ElementArea */
    #elementArea;
    /** @type function */
    #onPasteHandler;

    constructor(category, codeName, displayName, scene, onPasteHandler) {
        super(category, codeName, displayName);

        this.#elementArea = scene.createElementArea(
                PasteTool.DEFAULT_W, PasteTool.DEFAULT_H, PasteTool.BACKGROUND_ELEMENT);

        this.#onPasteHandler = onPasteHandler;
    }

    applyPoint(x, y, graphics, aldModifier) {
        const elementArea = this.#elementArea;

        const offsetX = x - Math.trunc(elementArea.getWidth() / 2);
        const offsetY = y - Math.trunc(elementArea.getHeight() / 2);
        for (let i = 0; i < elementArea.getWidth() && offsetX + i < graphics.getWidth(); i++) {
            const tx = offsetX + i;
            if (tx < 0) {
                continue;
            }

            for (let j = 0; j < elementArea.getHeight() && offsetY + j < graphics.getHeight(); j++) {
                const ty = offsetY + j;
                if (ty < 0) {
                    continue;
                }

                const element = elementArea.getElement(i, j);
                if (element.elementHead !== PasteTool.BACKGROUND_ELEMENT.elementHead
                        && element.elementTail !== PasteTool.BACKGROUND_ELEMENT.elementTail) {

                    graphics.draw(tx, ty, element);
                }
            }
        }
        this.#onPasteHandler();
    }

    createCursor(scale) {
        const w = Math.trunc(this.#elementArea.getWidth() / scale);
        const h = Math.trunc(this.#elementArea.getHeight() / scale);

        // TODO: return CursorDefinition and remove dom builder
        const node = DomBuilder.div({
            style: `width: ${w}px; height: ${h}px; outline: black 1px solid;`,
        });

        return {
            width: w,
            height: h,
            node: node
        };
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
 */
class ActionTool extends Tool {

    /** @type function */
    #handler;

    constructor(category, codeName, displayName, handler) {
        super(category, codeName, displayName);
        this.#handler = handler;
    }

    applyPoint(x, y, graphics, aldModifier) {
        this.#handler();
    }
}
