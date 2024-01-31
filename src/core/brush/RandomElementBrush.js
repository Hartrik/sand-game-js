import {DeterministicRandom} from "../DeterministicRandom";
import {Brush} from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-29
 */
export class RandomElementBrush extends Brush {

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
        } else if (this.#elements.length === 1) {
            return this.#elements[0];
        } else {
            return null;
        }
    }
}