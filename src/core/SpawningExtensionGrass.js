import {ProcessorModuleGrass} from "./ProcessorModuleGrass.js";
import {Brushes} from "../def/Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-05-16
 */
export class SpawningExtensionGrass {
    static MAX_COUNTER_VALUE = 2;

    #elementArea;
    #random;
    #processorContext;
    #brush = Brushes.GRASS;

    #counter = SpawningExtensionGrass.MAX_COUNTER_VALUE;

    constructor(elementArea, random, processorContext) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#processorContext = processorContext;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = SpawningExtensionGrass.MAX_COUNTER_VALUE;

            const x = this.#random.nextInt(this.#elementArea.getWidth());
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 3) + 2;

            if (ProcessorModuleGrass.canGrowUpHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brush.apply(x, y, this.#random));
                this.#processorContext.trigger(x, y);
            }
        }
    }
}