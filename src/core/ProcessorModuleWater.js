import {ElementHead} from "./ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-10
 */
export class ProcessorModuleWater {

    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type ProcessorContext */
    #processorContext;

    constructor(elementArea, random, processorContext) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#processorContext = processorContext;
    }

    behaviourWater(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        const temperature = ElementHead.getTemperature(elementHead);

        if (typeClass === ElementHead.TYPE_FLUID) {
            if (temperature > 20) {
                const brush = this.#processorContext.getDefaults().getBrushSteam();
                const element = brush.apply(x, y, this.#random);
                const newElementTail = ElementHead.setTemperature(element.elementHead, temperature);
                this.#elementArea.setElementHeadAndTail(x, y, newElementTail, element.elementTail);
            }

        } else if (typeClass === ElementHead.TYPE_GAS) {
            if (temperature < 10) {
                const brush = this.#processorContext.getDefaults().getBrushWater();
                const element = brush.apply(x, y, this.#random);
                const newElementTail = ElementHead.setTemperature(element.elementHead, temperature);
                this.#elementArea.setElementHeadAndTail(x, y, newElementTail, element.elementTail);
            }
        }
    }
}
