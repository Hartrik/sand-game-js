import {FloodFillPainter} from "./FloodFillPainter.js";
import {Element} from "./Element.js";
import {ElementArea} from "./ElementArea.js";
import {Brush} from "./Brush.js";
import {CircleIterator} from "./CircleIterator.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-10
 */
export class SandGameGraphics {

    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type function(number, number) */
    #triggerFunction;

    constructor(elementArea, random, triggerFunction) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#triggerFunction = triggerFunction;
    }

    /**
     *
     * @param aX {number}
     * @param aY {number}
     * @param bX {number}
     * @param bY {number}
     */
    swap(aX, aY, bX, bY) {
        aX = Math.trunc(aX);
        aY = Math.trunc(aY);
        bX = Math.trunc(bX);
        bY = Math.trunc(bY);

        if (this.#elementArea.isValidPosition(aX, aY) && this.#elementArea.isValidPosition(bX, bY)) {
            this.#elementArea.swap(aX, aY, bX, bY);
        }
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brushOrElement {Brush|Element}
     */
    draw(x, y, brushOrElement) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        if (this.#elementArea.isValidPosition(x, y)) {
            if (brushOrElement instanceof Element) {
                this.#elementArea.setElement(x, y, brushOrElement);
                this.#triggerFunction(x, y);
            } else if (brushOrElement instanceof Brush) {
                let oldElement = this.#elementArea.getElement(x, y);
                let newElement = brushOrElement.apply(x, y, this.#random, oldElement);
                this.#elementArea.setElement(x, y, newElement);
                this.#triggerFunction(x, y);
            } else {
                throw 'Brush or Element expected';
            }
        }
    }

    drawRectangle(x1, y1, x2, y2, brush, supportNegativeCoordinates = false) {
        if (!(brush instanceof Brush)) {
            throw 'Brush expected';
        }

        x1 = Math.trunc(x1);
        y1 = Math.trunc(y1);
        x2 = Math.trunc(x2);
        y2 = Math.trunc(y2);

        if (supportNegativeCoordinates) {
            x1 = (x1 >= 0) ? x1 : this.getWidth() + x1 + 1;
            x2 = (x2 >= 0) ? x2 : this.getWidth() + x2 + 1;
            y1 = (y1 >= 0) ? y1 : this.getHeight() + y1 + 1;
            y2 = (y2 >= 0) ? y2 : this.getHeight() + y2 + 1;
        }

        x1 = Math.max(Math.min(x1, this.getWidth() - 1), 0);
        x2 = Math.max(Math.min(x2, this.getWidth() - 1), 0);
        y1 = Math.max(Math.min(y1, this.getHeight() - 1), 0);
        y2 = Math.max(Math.min(y2, this.getHeight() - 1), 0);

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                this.draw(x, y, brush);
            }
        }
    }

    drawLine(x1, y1, x2, y2, size, brush, round=false) {
        if (!(brush instanceof Brush)) {
            throw 'Brush expected';
        }

        x1 = Math.trunc(x1);
        y1 = Math.trunc(y1);
        x2 = Math.trunc(x2);
        y2 = Math.trunc(y2);

        const d = Math.ceil(size / 2);

        let consumer;
        if (round) {
            consumer = (x, y) => {
                CircleIterator.iterate(CircleIterator.BLUEPRINT_3, (dx, dy, level) => {
                    this.draw(x + dx, y + dy, brush);
                });
            };
        } else {
            consumer = (x, y) => {
                this.drawRectangle(x - d, y - d, x + d, y + d, brush);
            };
        }

        SandGameGraphics.#lineAlgorithm(x1, y1, x2, y2, consumer);
    }

    static #lineAlgorithm(x1, y1, x2, y2, consumer) {
        consumer(x1, y1);

        if ((x1 !== x2) || (y1 !== y2)) {
            const moveX = x1 < x2 ? 1 : -1;
            const moveY = y1 < y2 ? 1 : -1;

            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            let diff = dx - dy;

            while ((x1 !== x2) || (y1 !== y2)) {
                const p = 2 * diff;

                if (p > -dy) {
                    diff = diff - dy;
                    x1 = x1 + moveX;
                }
                if (p < dx) {
                    diff = diff + dx;
                    y1 = y1 + moveY;
                }
                consumer(x1, y1);
            }
        }
    }

    fill(brush) {
        this.drawRectangle(0, 0, this.#elementArea.getWidth() - 1, this.#elementArea.getHeight() - 1, brush);
    }

    floodFill(x, y, brush, neighbourhood) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        let floodFillPainter = new FloodFillPainter(this.#elementArea, neighbourhood, this);
        floodFillPainter.paint(x, y, brush);
    }

    replace(elementTarget, elementReplacement) {
        const width = this.getWidth();
        const height = this.getHeight();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const next = this.#elementArea.getElement(x, y);
                if (next.elementHead === elementTarget.elementHead && next.elementTail === elementTarget.elementTail) {
                    this.#elementArea.setElement(x, y, elementReplacement);
                }
            }
        }
    }

    getWidth() {
        return this.#elementArea.getWidth();
    }

    getHeight() {
        return this.#elementArea.getHeight();
    }
}