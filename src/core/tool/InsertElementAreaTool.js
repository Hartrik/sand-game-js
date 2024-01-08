import {ElementArea} from "../ElementArea";
import {Brushes} from "../brush/Brushes";
import {CursorDefinitionElementArea} from "./CursorDefinitionElementArea";
import {Tool} from "./Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-28
 */
export class InsertElementAreaTool extends Tool {

    static asElementArea(scene) {
        return scene.createElementArea(InsertElementAreaTool.DEFAULT_W, InsertElementAreaTool.DEFAULT_H,
                ElementArea.TRANSPARENT_ELEMENT);
    }


    static DEFAULT_W = 30;
    static DEFAULT_H = 30;

    /** @type ElementArea */
    #elementArea;
    /** @type function */
    #onInsertHandler;

    constructor(info, elementArea, onInsertHandler) {
        super(info);
        this.#elementArea = elementArea;
        this.#onInsertHandler = onInsertHandler;
    }

    applyPoint(x, y, graphics, aldModifier) {
        const elementArea = this.#elementArea;
        const offsetX = x - Math.trunc(elementArea.getWidth() / 2);
        const offsetY = y - Math.trunc(elementArea.getHeight() / 2);

        let brush = Brushes.custom((tx, ty) => {
            const element = elementArea.getElement(tx - offsetX, ty - offsetY);
            if (element.elementHead !== ElementArea.TRANSPARENT_ELEMENT.elementHead
                && element.elementTail !== ElementArea.TRANSPARENT_ELEMENT.elementTail) {

                return element;
            }
            return null;
        });
        if (aldModifier) {
            brush = Brushes.gentle(brush);
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

    hasCursor() {
        return true;
    }

    createCursor() {
        return new CursorDefinitionElementArea(this.#elementArea);
    }
}