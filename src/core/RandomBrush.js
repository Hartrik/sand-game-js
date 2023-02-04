import {Brush} from "./Brush.js";
import {Element} from "./Element.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
export class RandomBrush extends Brush {
    static of(elements) {
        return new RandomBrush(elements);
    }

    static fromHeadAndTails(elementHead, elementTails) {
        let elements = [];
        for (let elementTail of elementTails) {
            elements.push(new Element(elementHead, elementTail));
        }
        return new RandomBrush(elements);
    }


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