import {Brush} from "./Brush.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-09-29
 */
export class CustomBrush extends Brush {
    static of(func) {
        return new CustomBrush(func);
    }

    /** @type function(x, y, DeterministicRandom) */
    #func;

    constructor(func) {
        super();
        this.#func = func;
    }

    apply(x, y, random) {
        return this.#func(x, y, random);
    }
}