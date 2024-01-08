import {DeterministicRandom} from "../DeterministicRandom";
import {Brush} from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
export class RandomBrush extends Brush {

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