// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Element from "../Element.js";
import DeterministicRandom from "../DeterministicRandom";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export default class Brush {

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
