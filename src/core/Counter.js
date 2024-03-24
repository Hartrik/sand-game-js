// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 *
 * @author Patrik Harag
 * @version 2022-09-25
 */
export default class Counter {

    #currentValue = 0;
    #lastValue = 0;
    #start = 0;

    tick(currentTimeMillis) {
        this.#currentValue++;
        if (currentTimeMillis - this.#start >= 1000) {
            this.#lastValue = this.#currentValue;
            this.#currentValue = 0;
            this.#start = currentTimeMillis;
        }
    }

    getValue() {
        return this.#lastValue;
    }

    clear() {
        this.#lastValue = 0;
    }
}