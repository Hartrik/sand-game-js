import {Brush} from "../brush/Brush";
import {Tool} from "./Tool";
import {Brushes} from "../brush/Brushes";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export class RoundBrushTool extends Tool {

    /** @type Brush */
    #brush;

    /** @type Brush */
    #altBrush;

    /** @type number */
    #size;

    constructor(info, brush, size) {
        super(info);
        this.#brush = brush;
        this.#altBrush = Brushes.gentle(brush);
        this.#size = size;
    }

    getBrush() {
        return this.#brush;
    }

    isLineModeEnabled() {
        return true;
    }

    isAreaModeEnabled() {
        return true;
    }

    isRepeatingEnabled() {
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