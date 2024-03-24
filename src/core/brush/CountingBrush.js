// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Brush from "./Brush";

/**
 * Special brush for counting elements.
 *
 * @author Patrik Harag
 * @version 2024-01-10
 */
export default class CountingBrush extends Brush {

    static #NULL_REDICATE = function (elementHead, elementTail) {
        return false;
    };

    #predicate;

    #counterPositives = 0;
    #counterTotal = 0;

    /**
     *
     * @param predicate {function(number:elementHead, number:elementTail):boolean}
     */
    constructor(predicate = CountingBrush.#NULL_REDICATE) {
        super();
        this.#predicate = predicate;
    }

    apply(x, y, random, oldElement) {
        this.#counterTotal++;
        if (oldElement !== null) {
            if (this.#predicate(oldElement.elementHead, oldElement.elementTail)) {
                this.#counterPositives++;
            }
        }
        return null;
    }

    getPositives() {
        return this.#counterPositives;
    }

    getTotal() {
        return this.#counterTotal;
    }

    reset() {
        this.#counterTotal = 0;
        this.#counterPositives = 0;
    }
}