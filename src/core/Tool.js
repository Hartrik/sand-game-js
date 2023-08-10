import { Brush } from "./Brush.js";
import { Element } from "./Element.js";
import { ElementArea } from "./ElementArea.js";
import { CursorDefinition } from "./CursorDefinition.js";
import { CursorDefinitionElementArea } from "./CursorDefinitionElementArea.js";
import { Brushes } from "./Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
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


    // static factory methods

    static rectangleBrushTool(category, codeName, displayName, brush, size) {
        return new RectangleBrushTool(category, codeName, displayName, brush, size);
    }

    static pointBrushTool(category, codeName, displayName, brush) {
        return new PointBrushTool(category, codeName, displayName, brush);
    }

    static meteorTool(category, codeName, displayName) {
        return new MeteorTool(category, codeName, displayName);
    }

    static insertElementAreaTool(category, codeName, displayName, scenes, handler) {
        if (scenes.length === 1) {
            return new InsertSceneTool(category, codeName, displayName, scenes[0], handler);
        } else {
            return new InsertRandomSceneTool(category, codeName, displayName, scenes, handler);
        }
    }

    static actionTool(category, codeName, displayName, handler) {
        return new ActionTool(category, codeName, displayName, handler);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
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

    getBrush() {
        return this.#brush;
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
        graphics.drawLine(x1, y1, x2, y2, this.#size, brush, true);
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
 * @version 2023-08-10
 */
class MeteorTool extends Tool {

    constructor(category, codeName, displayName) {
        super(category, codeName, displayName);
    }

    applyPoint(x, y, graphics, aldModifier) {
        const diffSlope4 = Math.trunc(y / 4);
        if (x < diffSlope4 + 10) {
            // right only
            graphics.draw(x + diffSlope4, 0, Brushes.METEOR_FROM_RIGHT);
            return;
        }
        if (x > graphics.getWidth() - diffSlope4 - 10) {
            // left only
            graphics.draw(x - diffSlope4, 0, Brushes.METEOR_FROM_LEFT);
            return;
        }

        if (x < graphics.getWidth() / 2) {
            if (Math.random() < 0.8) {
                graphics.draw(x + diffSlope4, 0, Brushes.METEOR_FROM_RIGHT);
            } else {
                graphics.draw(x, 0, Brushes.METEOR);
            }
        } else {
            if (Math.random() < 0.8) {
                graphics.draw(x - diffSlope4, 0, Brushes.METEOR_FROM_LEFT);
            } else {
                graphics.draw(x, 0, Brushes.METEOR);
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-05-16
 */
class InsertSceneTool extends Tool {

    static DEFAULT_W = 30;
    static DEFAULT_H = 30;

    /** @type ElementArea */
    #elementArea;
    /** @type function */
    #onInsertHandler;

    constructor(category, codeName, displayName, scene, onInsertHandler) {
        super(category, codeName, displayName);

        this.#elementArea = scene.createElementArea(
                InsertSceneTool.DEFAULT_W, InsertSceneTool.DEFAULT_H, ElementArea.TRANSPARENT_ELEMENT);

        this.#onInsertHandler = onInsertHandler;
    }

    applyPoint(x, y, graphics, aldModifier) {
        const elementArea = this.#elementArea;
        const offsetX = x - Math.trunc(elementArea.getWidth() / 2);
        const offsetY = y - Math.trunc(elementArea.getHeight() / 2);

        let brush = Brush.custom((tx, ty) => {
            const element = elementArea.getElement(tx - offsetX, ty - offsetY);
            if (element.elementHead !== ElementArea.TRANSPARENT_ELEMENT.elementHead
                    && element.elementTail !== ElementArea.TRANSPARENT_ELEMENT.elementTail) {

                return element;
            }
            return null;
        });
        if (aldModifier) {
            brush = Brush.gentle(brush);
        }

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

                graphics.draw(tx, ty, brush);
            }
        }

        if (this.#onInsertHandler !== undefined) {
            this.#onInsertHandler();
        }
    }

    createCursor() {
        return new CursorDefinitionElementArea(this.#elementArea);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
class InsertRandomSceneTool extends Tool {

    /** @type Scene[] */
    #scenes;

    #currentTool;

    /** @type function */
    #onInsertHandler;

    constructor(category, codeName, displayName, scenes, onInsertHandler) {
        super(category, codeName, displayName);
        this.#scenes = scenes;
        this.#onInsertHandler = onInsertHandler;
        this.#initRandomTool();
    }

    #initRandomTool() {
        if (this.#scenes.length === undefined || this.#scenes.length === 0) {
            throw 'Scenes not set';
        }

        const i = Math.trunc(Math.random() * this.#scenes.length);
        const scene = this.#scenes[i];
        this.#currentTool = new InsertSceneTool(this.getCategory(), this.getCodeName(), this.getDisplayName(),
                scene, this.#onInsertHandler);
    }

    applyPoint(x, y, graphics, aldModifier) {
        this.#currentTool.applyPoint(x, y, graphics, aldModifier);
        this.#initRandomTool();
    }

    createCursor() {
        return this.#currentTool.createCursor();
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
