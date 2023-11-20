import {Assets} from "../Assets.js";
import {Element} from "./Element.js";
import {ElementTail} from "./ElementTail.js";
import {ElementHead} from "./ElementHead.js";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-11-20
 */
export class Brush {

    // TODO: use default random if null

    /**
     *
     * @param x
     * @param y
     * @param random {DeterministicRandom}
     * @param oldElement {Element}
     * @return {Element}
     */
    apply(x, y, random = undefined, oldElement = undefined) {
        throw 'Not implemented'
    }


    // static factory methods

    /**
     *
     * @param elements {Element[]}
     * @returns {Brush}
     */
    static random(elements) {
        return new RandomBrush(elements);
    }

    static textureBrush(base64, innerBrush) {
        return new TextureBrush(innerBrush, base64);
    }

    /**
     *
     * @param palette {number[][]|string}
     * @param innerBrush
     * @returns {Brush}
     */
    static paletteBrush(palette, innerBrush) {
        if (typeof palette === 'string') {
            // parse
            palette = palette.split('\n').map(line => line.split(',').map(Number));
        }
        return new PaletteBrush(innerBrush, palette);
    }

    /**
     *
     * @param func {function(x: number, y: number, random: DeterministicRandom, oldElement: Element)}
     * @returns {Brush}
     */
    static custom(func) {
        return new CustomBrush(func);
    }

    /**
     *
     * @param brush {Brush}
     * @param intensity {number} 0..1
     * @returns {Brush}
     */
    static withIntensity(intensity, brush) {
        return Brush.custom((x, y, random, oldElement) => {
            let rnd = (random) ? random.next() : Math.random();
            if (rnd < intensity) {
                return brush.apply(x, y, random, oldElement);
            }
            return null;
        });
    }

    /**
     * Brush will not paint over other elements.
     *
     * @param brush {Brush}
     */
    static gentle(brush) {
        return Brush.custom((x, y, random, oldElement) => {
            if (ElementHead.getTypeClass(oldElement.elementHead) === ElementHead.TYPE_AIR) {
                return brush.apply(x, y, random, oldElement);
            }
            return null;
        });
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
class RandomBrush extends Brush {

    /** @type Element[] */
    #elements;

    constructor(elements) {
        super();
        this.#elements = elements;
    }

    apply(x, y, random, oldElement) {
        if (this.#elements.length > 1) {
            let i;
            if (random) {
                i = random.nextInt(this.#elements.length);
            } else {
                i = Math.trunc(Math.random() * this.#elements.length);
            }
            return this.#elements[i];
        } else {
            return this.#elements[0];
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-11-20
 */
class PaletteBrush extends Brush {

    /** @type Brush */
    #innerBrush;

    /** @type number[][] */
    #palette;

    constructor(innerBrush, palette) {
        super();
        this.#innerBrush = innerBrush;
        this.#palette = palette;
    }

    apply(x, y, random, oldElement) {
        const element = this.#innerBrush.apply(x, y, random);
        if (element === null) {
            return null;
        }

        let i;
        if (random) {
            i = random.nextInt(this.#palette.length);
        } else {
            i = Math.trunc(Math.random() * this.#palette.length);
        }
        const [r, g, b] = this.#palette[i];

        element.elementTail = ElementTail.setColor(element.elementTail, r, g, b);
        return element;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
class TextureBrush extends Brush {

    /** @type Brush */
    #innerBrush;

    /** @type ImageData|null */
    #imageData = null;

    constructor(innerBrush, base64) {
        super();
        this.#innerBrush = innerBrush;

        Assets.asImageData(base64).then(imageData => this.#imageData = imageData);
    }

    apply(x, y, random, oldElement) {
        const element = this.#innerBrush.apply(x, y, random);
        if (element === null) {
            return null;
        }

        if (this.#imageData != null) {
            const cx = x % this.#imageData.width;
            const cy = y % this.#imageData.height;
            const index = (cy * this.#imageData.width + cx) * 4;

            const red = this.#imageData.data[index];
            const green = this.#imageData.data[index + 1];
            const blue = this.#imageData.data[index + 2];
            // const alpha = this.#imageData.data[index + 3];

            element.elementTail = ElementTail.setColor(element.elementTail, red, green, blue);
        }
        return element;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
class CustomBrush extends Brush {

    /** @type function(x: number, y: number, random: DeterministicRandom, oldElement: Element) */
    #func;

    constructor(func) {
        super();
        this.#func = func;
    }

    apply(x, y, random, oldElement) {
        return this.#func(x, y, random, oldElement);
    }
}
