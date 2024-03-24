// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ProcessorModuleGrass from "./ProcessorModuleGrass.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-08
 */
export default class ProcessorExtensionSpawnGrass {
    static MAX_COUNTER_VALUE = 2;

    /** @type ElementArea */
    #elementArea;
    /** @type DeterministicRandom */
    #random;
    /** @type ProcessorContext */
    #processorContext;

    #counter = ProcessorExtensionSpawnGrass.MAX_COUNTER_VALUE;

    constructor(elementArea, random, processorContext) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#processorContext = processorContext;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = ProcessorExtensionSpawnGrass.MAX_COUNTER_VALUE;

            const x = this.#random.nextInt(this.#elementArea.getWidth());
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 3) + 2;

            if (ProcessorModuleGrass.canGrowUpHere(this.#elementArea, x, y)) {
                const brush = this.#processorContext.getDefaults().getBrushGrass();
                this.#elementArea.setElement(x, y, brush.apply(x, y, this.#random));
                this.#processorContext.trigger(x, y);
            }
        }
    }
}