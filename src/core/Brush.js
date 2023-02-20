import {Assets} from "../Assets.js";
import {Element} from "./Element.js";
import {ElementTail} from "./ElementTail.js";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
export class Brush {

    /**
     *
     * @param x
     * @param y
     * @param random {DeterministicRandom|undefined}
     * @return {Element}
     */
    apply(x, y, random = undefined) {
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

    static randomFromHeadAndTails(elementHead, elementTails) {
        let elements = [];
        for (let elementTail of elementTails) {
            elements.push(new Element(elementHead, elementTail));
        }
        return new RandomBrush(elements);
    }

    static textureBrush(innerBrush, base64) {
        return new TextureBrush(innerBrush, base64);
    }

    /**
     *
     * @param func {function(x, y, DeterministicRandom|undefined)}
     * @returns {Brush}
     */
    static custom(func) {
        return new CustomBrush(func);
    }

    /**
     *
     * @param brush
     * @param intensity {number} 0..1
     * @returns {Brush}
     */
    static withIntensity(brush, intensity) {
        return new CustomBrush((x, y, random) => {
            let rnd = (random) ? random.next() : Math.random();
            if (rnd < intensity) {
                return brush.apply(x, y, random);
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

    apply(x, y, random) {
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

    apply(x, y, random) {
        const element = this.#innerBrush.apply(x, y, random);

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

    /** @type function(x, y, DeterministicRandom|undefined) */
    #func;

    constructor(func) {
        super();
        this.#func = func;
    }

    apply(x, y, random) {
        return this.#func(x, y, random);
    }
}
