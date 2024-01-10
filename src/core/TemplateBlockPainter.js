
/**
 *
 * @author Patrik Harag
 * @version 2022-09-21
 */
export class TemplateBlockPainter {

    /** @type SandGameGraphics */
    #graphics;

    /** @type string|string[]|null */
    #blueprint = null;
    /** @type object|null */
    #brushes = null;

    /** @type number */
    #maxHeight = Number.MAX_SAFE_INTEGER;

    /** @type string */
    #verticalAlign = 'bottom';

    /**
     *
     * @param graphics {SandGameGraphics}
     */
    constructor(graphics) {
        this.#graphics = graphics;
    }

    /**
     *
     * @param blueprint {string|string[]}
     * @returns {TemplateBlockPainter}
     */
    withBlueprint(blueprint) {
        this.#blueprint = blueprint;
        return this;
    }

    /**
     *
     * @param brushes
     * @returns {TemplateBlockPainter}
     */
    withBrushes(brushes) {
        this.#brushes = brushes;
        return this;
    }

    /**
     *
     * @param maxHeight max template height
     * @param align {string} bottom|top
     * @returns {TemplateBlockPainter}
     */
    withMaxHeight(maxHeight, align = 'bottom') {
        this.#maxHeight = maxHeight;
        this.#verticalAlign = align;
        return this;
    }

    paint() {
        if (this.#blueprint === null || this.#blueprint.length === 0) {
            throw 'Blueprint not set';
        }
        if (this.#brushes === null) {
            throw 'Brushes not set';
        }

        const blueprint = (typeof this.#blueprint === 'string')
            ? this.#blueprint.split('\n')
            : this.#blueprint;

        const w = blueprint[0].length;
        const h = blueprint.length;

        const ww = Math.ceil(this.#graphics.getWidth() / w);
        const hh = Math.ceil(Math.min(this.#graphics.getHeight(), this.#maxHeight) / h);
        // note: rounding up is intentional - we don't want gaps, drawRectangle can handle drawing out of canvas

        const verticalOffset = (this.#verticalAlign === 'bottom' ? this.#graphics.getHeight() - (hh * h) : 0);

        for (let y = 0; y < h; y++) {
            const line = blueprint[y];
            for (let x = 0; x < Math.min(w, line.length); x++) {
                const char = line.charAt(x);
                let brush = this.#brushes[char];
                if (brush === undefined) {
                    if (char === ' ') {
                        // let this cell empty
                        continue;
                    }
                    throw 'Brush not found: ' + char;
                }
                this.#graphics.drawRectangle(
                    x * ww, verticalOffset + (y * hh),
                    x * ww + ww + 1, verticalOffset + (y * hh) + hh + 1, brush);
            }
        }
    }
}