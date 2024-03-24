// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DeterministicRandom from "../DeterministicRandom";
import Brush from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-29
 */
export default class RandomBrush extends Brush {

    /** @type Brush[] */
    #list;

    constructor(list) {
        super();
        this.#list = list;
    }

    apply(x, y, random, oldElement) {
        if (this.#list.length > 1) {
            const i = ((random) ? random : DeterministicRandom.DEFAULT).nextInt(this.#list.length);
            const item = this.#list[i];
            return item.apply(x, y, random, oldElement);
        } else if (this.#list.length === 1) {
            const item = this.#list[0];
            return item.apply(x, y, random, oldElement);
        } else {
            return null;
        }
    }
}