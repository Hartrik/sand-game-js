import {Tool} from "../Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-15
 */
export class PointBrushTool extends Tool {

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