import {Brush} from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
export class CustomBrush extends Brush {

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