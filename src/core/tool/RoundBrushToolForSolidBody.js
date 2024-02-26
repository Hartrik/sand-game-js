import { Tool } from "./Tool";
import { Brush } from "../brush/Brush";
import { Brushes } from "../brush/Brushes";
import { ElementHead } from "../ElementHead";
import { Element } from "../Element";
import { PredicateDefs } from "../../def/PredicateDefs";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-26
 */
export class RoundBrushToolForSolidBody extends Tool {

    /** @type Brush */
    #brush;

    /** @type Brush */
    #toSolidBodyBrush = Brushes.conditional(PredicateDefs.IS_STATIC, Brushes.toSolidBody(2));  // TODO: hardcoded

    /** @type number */
    #size;

    #drag = false;
    #dragBuffer = [];

    constructor(info, brush, size) {
        super(info);
        this.#brush = brush;
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
        return false;
    }

    applyPoint(x, y, graphics, altModifier) {
        // ignored
    }

    applyStroke(x1, y1, x2, y2, graphics, altModifier) {
        const brush = this.#currentBrush(altModifier);
        graphics.drawLine(x1, y1, x2, y2, this.#size, brush, true);
    }

    applyArea(x1, y1, x2, y2, graphics, altModifier) {
        const brush = this.#currentBrush(altModifier);
        graphics.drawRectangle(x1, y1, x2, y2, brush);
    }

    applySpecial(x, y, graphics, altModifier) {
        const brush = this.#currentBrush(altModifier);
        graphics.floodFill(x, y, brush, 1);
    }

    onDragStart(x, y, graphics, altModifier) {
        this.#drag = true;
    }

    onDragEnd(x, y, graphics, altModifier) {
        this.#drag = false;
        for (const [ex, ey] of this.#dragBuffer) {
            graphics.draw(ex, ey, this.#toSolidBodyBrush);
        }
        this.#dragBuffer = [];
    }

    #currentBrush(altModifier) {
        let brush = this.#brush;
        if (altModifier) {
            brush = Brushes.gentle(brush);
        }

        if (this.#drag) {
            return Brushes.custom((x, y, random, oldElement) => {
                const element = brush.apply(x, y, random, oldElement);
                if (element !== null) {
                    const elementHead = ElementHead.setType(element.elementHead, ElementHead.TYPE_STATIC);
                    this.#dragBuffer.push([x, y]);
                    return new Element(elementHead, element.elementTail);
                }
                return null;
            });
        } else {
            return brush;
        }
    }
}