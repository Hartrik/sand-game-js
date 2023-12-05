import {Assets} from "../Assets.js";
import {Element} from "./Element.js";
import {ElementTail} from "./ElementTail.js";
import {ElementHead} from "./ElementHead.js";
import {DeterministicRandom} from "./DeterministicRandom";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-04
 */
export class Brush {

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
            let rnd = ((random) ? random : DeterministicRandom.DEFAULT).next();
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

    static temperature(value) {
        return Brush.custom((x, y, random, oldElement) => {
            if (oldElement === null) {
                return null;
            }
            const newElementHead = ElementHead.setTemperature(oldElement.elementHead, value & 0xFF);
            return new Element(newElementHead, oldElement.elementTail);
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
            const i = ((random) ? random : DeterministicRandom.DEFAULT).nextInt(this.#elements.length);
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

        const i = ((random) ? random : DeterministicRandom.DEFAULT).nextInt(this.#palette.length);
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
