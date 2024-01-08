import {Element} from "../Element.js";
import {DeterministicRandom} from "../DeterministicRandom";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-20
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
}
