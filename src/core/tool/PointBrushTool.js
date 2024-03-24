// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Tool from "./Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export default class PointBrushTool extends Tool {

    /** @type Brush */
    #brush;

    constructor(info, brush) {
        super(info);
        this.#brush = brush;
    }

    applyPoint(x, y, graphics, aldModifier) {
        graphics.draw(x, y, this.#brush);
    }
}