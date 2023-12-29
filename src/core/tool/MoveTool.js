import {Tool} from "../Tool";
import {ToolInfo} from "../ToolInfo";
import {ElementArea} from "../ElementArea";
import {ElementHead} from "../ElementHead";
import {InsertElementAreaTool} from "./InsertElementAreaTool";
import {Brushes} from "../Brushes";

/**
 * It can be used to move elements from one place to another.
 * This tool works in three modes: click-click, drag-drop and selection-click.
 *
 * @author Patrik Harag
 * @version 2023-12-29
 */
export class MoveTool extends Tool {

    /** @type number */
    #size;

    /** @type InsertElementAreaTool */
    #insertScene = null;

    constructor(info, size) {
        super(info);
        this.#size = size;
    }

    // POINT & DRAG AND DROP ACTION

    applyPoint(x, y, graphics, altModifier) {
        if (this.#insertScene === null) {
            this.#insertScene = this.#createInsertToolAt(x, y, graphics);
        } else {
            this.#insertScene.applyPoint(x, y, graphics, altModifier);
            this.#insertScene = null;
        }
    }

    onDragStart(x, y, graphics, altModifier) {
        // ignore
    }

    onDragEnd(x, y, graphics, altModifier) {
        if (this.#insertScene !== null) {
            this.#insertScene.applyPoint(x, y, graphics, altModifier);
            this.#insertScene = null;
        }
    }

    #createInsertToolAt(x, y, graphics) {
        const elementArea = this.#copyElementsAt(x, y, graphics);
        return (elementArea !== null)
                ? new InsertElementAreaTool(new ToolInfo(), elementArea)
                : null;
    }

    #copyElementsAt(x, y, graphics) {
        const elementArea = ElementArea.create(this.#size, this.#size, ElementArea.TRANSPARENT_ELEMENT);
        const p = Math.trunc(this.#size / 2);

        const defaultElement = graphics.getDefaults().getDefaultElement();
        let empty = true;
        const brush = Brushes.custom((tx, ty, r, element) => {
            if (this.#canBeCopied(element.elementHead)) {
                const dx = tx - x;
                const dy = ty - y;
                elementArea.setElement(dx + p, dy + p, element);
                empty = false;
                return defaultElement;  // remove
            }
            return null;  // ignore
        });

        graphics.drawLine(x, y, x, y, this.#size, brush, true);

        return (empty) ? null : elementArea;
    }

    #canBeCopied(elementHead) {
        const elementTypeClass = ElementHead.getTypeClass(elementHead);
        if (elementTypeClass > ElementHead.TYPE_AIR && elementTypeClass < ElementHead.TYPE_STATIC) {
            return true;
        }
        const behaviour = ElementHead.getBehaviour(elementHead);
        if (behaviour === ElementHead.BEHAVIOUR_FISH || behaviour === ElementHead.BEHAVIOUR_FISH_BODY) {
            return true;
        }
        return false;
    }

    // AREA ACTION

    isAreaModeEnabled() {
        return true;
    }

    applyArea(x1, y1, x2, y2, graphics, altModifier) {
        this.#insertScene = this.#createInsertTool(x1, y1, x2, y2, graphics);
    }

    #createInsertTool(x1, y1, x2, y2, graphics) {
        const elementArea = this.#copyElements(x1, y1, x2, y2, graphics);
        return (elementArea !== null)
            ? new InsertElementAreaTool(new ToolInfo(), elementArea)
            : null;
    }

    #copyElements(x1, y1, x2, y2, graphics) {
        const w = Math.abs(x1 - x2) + 1;
        const h = Math.abs(y1 - y2) + 1;
        const elementArea = ElementArea.create(w, h, ElementArea.TRANSPARENT_ELEMENT);

        const defaultElement = graphics.getDefaults().getDefaultElement();
        let empty = true;
        const brush = Brushes.custom((tx, ty, r, element) => {
            if (ElementHead.getTypeClass(element.elementHead) > ElementHead.TYPE_AIR) {
                let x = tx - Math.min(x1, x2);
                let y = ty - Math.min(y1, y2);
                elementArea.setElement(x, y, element);
                empty = false;
                return defaultElement;  // remove
            }
            return null;  // ignore
        });

        graphics.drawRectangle(x1, y1, x2, y2, brush, false);

        return (empty) ? null : elementArea;
    }

    // SECONDARY ACTION

    isSecondaryActionEnabled() {
        return (this.#insertScene !== null);
    }

    applySecondaryAction(x, y, graphics, altModifier) {
        this.#insertScene = null;
    }

    // CURSOR

    hasCursor() {
        return this.#insertScene !== null;
    }

    createCursor() {
        if (this.#insertScene !== null) {
            return this.#insertScene.createCursor();
        } else {
            return null;
        }
    }
}