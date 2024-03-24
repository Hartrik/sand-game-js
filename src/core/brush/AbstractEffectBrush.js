// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Brush from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-05
 */
export default class AbstractEffectBrush extends Brush {

    /** @type Brush|undefined */
    #innerBrush;
    constructor(innerBrush) {
        super();
        this.#innerBrush = innerBrush;
    }

    _retrieveElement(x, y, random, oldElement) {
        if (this.#innerBrush !== undefined) {
            // use inner brush
            return this.#innerBrush.apply(x, y, random);
        } else {
            // use old element
            return oldElement;
        }
    }
}