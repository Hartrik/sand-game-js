import { ElementHead } from "./ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-20
 */
export class FloodFillPainter {

    static NEIGHBOURHOOD_VON_NEUMANN = 0;
    static NEIGHBOURHOOD_MOORE = 1;


    /** @type ElementArea */
    #elementArea;

    /** @type SandGameGraphics */
    #graphics;

    #neighbourhood;

    /**
     *
     * @param elementArea {ElementArea}
     * @param neighbourhood
     * @param graphics {SandGameGraphics}
     */
    constructor(elementArea, neighbourhood = FloodFillPainter.NEIGHBOURHOOD_VON_NEUMANN, graphics) {
        this.#elementArea = elementArea;
        this.#neighbourhood = neighbourhood;
        this.#graphics = graphics;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brush {Brush}
     */
    paint(x, y, brush) {
        const pattern = 0b1111_11100111;  // TODO: different for fluid, powder-like...
        const matcher = this.#normalize(this.#elementArea.getElementHead(x, y)) & pattern;

        const w = this.#elementArea.getWidth();

        const pointSet = new Set();
        const queue = [];

        let point = x + y * w;
        do {
            let x = point % w;
            let y = Math.trunc(point / w);

            if (pointSet.has(point)) {
                continue;  // already completed
            }

            this.#graphics.draw(x, y, brush);
            pointSet.add(point);

            // add neighbours
            this.#tryAdd(x, y - 1, pattern, matcher, pointSet, queue);
            this.#tryAdd(x + 1, y, pattern, matcher, pointSet, queue);
            this.#tryAdd(x, y + 1, pattern, matcher, pointSet, queue);
            this.#tryAdd(x - 1, y, pattern, matcher, pointSet, queue);

            if (this.#neighbourhood === FloodFillPainter.NEIGHBOURHOOD_MOORE) {
                this.#tryAdd(x + 1, y + 1, pattern, matcher, pointSet, queue);
                this.#tryAdd(x + 1, y - 1, pattern, matcher, pointSet, queue);
                this.#tryAdd(x - 1, y + 1, pattern, matcher, pointSet, queue);
                this.#tryAdd(x - 1, y - 1, pattern, matcher, pointSet, queue);
            }

        } while ((point = queue.pop()) != null);
    }

    #tryAdd(x, y, pattern, matcher, pointSet, queue) {
        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();

        if (x < 0 || y < 0) {
            return;
        }
        if (x >= w || y >= h) {
            return;
        }

        if (!this.#equals(x, y, pattern, matcher)) {
            return;
        }

        const point = x + y * w;
        if (pointSet.has(point)) {
            return;
        }

        queue.push(point);
    }

    #equals(x, y, pattern, matcher) {
        let elementHead = this.#elementArea.getElementHead(x, y);
        elementHead = this.#normalize(elementHead);
        return (elementHead & pattern) === matcher;
    }

    #normalize(elementHead) {
        // wetness is ignored
        if (ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_POWDER_WET) {
            elementHead = ElementHead.setTypeClass(elementHead, ElementHead.TYPE_POWDER);
        }
        return elementHead;
    }
}