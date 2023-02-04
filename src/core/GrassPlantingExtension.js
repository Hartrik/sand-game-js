import {GrassElement} from "./GrassElement.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
export class GrassPlantingExtension {
    static MAX_COUNTER_VALUE = 2;

    #elementArea;
    #random;
    #brush;

    #counter = GrassPlantingExtension.MAX_COUNTER_VALUE;

    constructor(elementArea, random, brush) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brush = brush;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = GrassPlantingExtension.MAX_COUNTER_VALUE;

            const x = this.#random.nextInt(this.#elementArea.getWidth());
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 3) + 2;

            if (GrassElement.couldGrowUpHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brush.apply(x, y, this.#random));
            }
        }
    }
}