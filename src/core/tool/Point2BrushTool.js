import {Tool} from "../Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-05
 */
export class Point2BrushTool extends Tool {

    /** @type Brush */
    #brush1;
    /** @type Brush */
    #brush2;

    constructor(category, codeName, displayName, brush1, brush2) {
        super(category, codeName, displayName);
        this.#brush1 = brush1;
        this.#brush2 = brush2;
    }

    applyPoint(x, y, graphics, aldModifier) {
        graphics.draw(x, y, this.#brush1);
        graphics.draw(x + 1, y, this.#brush2);
    }
}