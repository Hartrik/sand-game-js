import {FloodFillPainter} from "./FloodFillPainter.js";
import {Element} from "./Element.js";
import {ElementArea} from "./ElementArea.js";
import {Brush} from "./brush/Brush.js";
import {CircleIterator} from "./CircleIterator.js";
import {Marker} from "./Marker";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-12
 */
export class SandGameGraphics {

    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type ProcessorDefaults */
    #defaults;

    /** @type {function(number,number)} */
    #triggerFunction;

    constructor(elementArea, random, defaults, triggerFunction) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#defaults = defaults;
        this.#triggerFunction = triggerFunction;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brushOrElement {Brush|Element|null}
     */
    draw(x, y, brushOrElement) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        if (this.#elementArea.isValidPosition(x, y)) {
            if (brushOrElement === null) {
                this.#elementArea.setElement(x, y, this.#defaults.getDefaultElement());
                this.#triggerFunction(x, y);
            } else if (brushOrElement instanceof Element) {
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

    drawRectangle(x1, y1, x2, y2, brushOrElement, supportNegativeCoordinates = false) {
        if (!(brushOrElement instanceof Brush || brushOrElement instanceof Element)) {
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

        x1 = Math.max(Math.min(x1, this.getWidth()), 0);
        x2 = Math.max(Math.min(x2, this.getWidth()), 0);
        y1 = Math.max(Math.min(y1, this.getHeight()), 0);
        y2 = Math.max(Math.min(y2, this.getHeight()), 0);

        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                this.draw(x, y, brushOrElement);
            }
        }
    }

    drawRectangleWH(x, y, w, h, brush) {
        this.drawRectangle(x, y, x + w, y + h, brush, false);
    }

    drawLine(x1, y1, x2, y2, size, brushOrElement, round=false) {
        if (!(brushOrElement instanceof Brush || brushOrElement instanceof Element)) {
            throw 'Brush expected';
        }

        x1 = Math.trunc(x1);
        y1 = Math.trunc(y1);
        x2 = Math.trunc(x2);
        y2 = Math.trunc(y2);

        let consumer;
        if (round) {
            let maxLevel = Math.trunc(size / 2);

            let blueprint;
            if (maxLevel <= 3) {
                blueprint = CircleIterator.BLUEPRINT_3;
            } else if (maxLevel === 4) {
                blueprint = CircleIterator.BLUEPRINT_4;
            } else {
                blueprint = CircleIterator.BLUEPRINT_9;
            }

            consumer = (x, y) => {
                CircleIterator.iterate(blueprint, (dx, dy, level) => {
                    if (level <= maxLevel) {
                        this.draw(x + dx, y + dy, brushOrElement);
                    }
                });
            };
        } else {
            const d = Math.ceil(size / 2);
            consumer = (x, y) => {
                this.drawRectangle(x - d, y - d, x + d, y + d, brushOrElement);
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

    /**
     *
     * @param shape {Marker}
     * @param brushOrElement {Brush|Element}
     */
    drawShape(shape, brushOrElement) {
        if (shape instanceof Marker) {
            const [x1, y1, x2, y2] = shape.getPosition();
            this.drawRectangle(x1, y1, x2, y2, brushOrElement, false);
        } else {
            throw 'Shape not supported';
        }
    }

    fill(brush) {
        this.drawRectangle(0, 0, this.#elementArea.getWidth(), this.#elementArea.getHeight(), brush);
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

    getDefaults() {
        return this.#defaults;
    }
}