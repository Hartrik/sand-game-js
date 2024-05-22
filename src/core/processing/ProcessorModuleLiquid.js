// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-22
 */
export default class ProcessorModuleLiquid {

    static RET_FLAG_ACTIVE = 0b10;
    static RET_FLAG_SKIP_TEMP = 0b01;

    static SUBTYPE_WATER = 0;
    static SUBTYPE_MOLTEN_METAL = 1;


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

    behaviourLiquid(elementHead, x, y) {
        const special = ElementHead.getSpecial(elementHead);
        switch (special) {
            case ProcessorModuleLiquid.SUBTYPE_WATER:
                return this.#behaviourSubtypeWater(elementHead, x, y);
            case ProcessorModuleLiquid.SUBTYPE_MOLTEN_METAL:
                return this.#behaviourSubtypeMoltenMetal(elementHead, x, y);
        }
        return 0;
    }

    testBehaviourLiquid(elementHead, x, y) {
        const special = ElementHead.getSpecial(elementHead);
        switch (special) {
            case ProcessorModuleLiquid.SUBTYPE_WATER:
                return this.#testBehaviourSubtypeWater(elementHead, x, y);

            case ProcessorModuleLiquid.SUBTYPE_MOLTEN_METAL:
                return this.#testBehaviourSubtypeMoltenMetal(elementHead, x, y);
        }
        return false;
    }

    #behaviourSubtypeWater(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        const temperature = ElementHead.getTemperature(elementHead);

        if (typeClass === ElementHead.TYPE_FLUID) {
            if (temperature > 20) {
                const brush = this.#processorContext.getDefaults().getBrushSteam();
                const element = brush.apply(x, y, this.#random);
                const newElementHead = ElementHead.setTemperature(element.elementHead, temperature);
                this.#elementArea.setElementHeadAndTail(x, y, newElementHead, element.elementTail);
                return ProcessorModuleLiquid.RET_FLAG_ACTIVE | ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
            }

        } else if (typeClass === ElementHead.TYPE_GAS) {
            if (temperature < 10) {
                const brush = this.#processorContext.getDefaults().getBrushWater();
                const element = brush.apply(x, y, this.#random);
                const newElementHead = ElementHead.setTemperature(element.elementHead, temperature);
                this.#elementArea.setElementHeadAndTail(x, y, newElementHead, element.elementTail);
                return ProcessorModuleLiquid.RET_FLAG_ACTIVE | ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
            }
        }
        return 0;
    }

    #testBehaviourSubtypeWater(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        const temperature = ElementHead.getTemperature(elementHead);

        if (typeClass === ElementHead.TYPE_FLUID) {
            return temperature > 20;
        } else if (typeClass === ElementHead.TYPE_GAS) {
            return temperature < 10;
        }
        return false;
    }

    #behaviourSubtypeMoltenMetal(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return 0;
        }

        const rnd = this.#random.nextInt(8);
        let skipTemperature = 0;
        if (rnd % 4 === 0) {
            // gravity down...
            if (this.#tryMoveHardFluid(elementHead, x, y, x, y + 1)) {
                // nothing
                skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
            } else {
                if (rnd === 4) {
                    if (this.#tryMoveHardFluid(elementHead, x, y, x + 1, y)) {
                        skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                } else {
                    if (this.#tryMoveHardFluid(elementHead, x, y, x - 1, y)) {
                        skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                }
            }
        }

        const active = ProcessorModuleLiquid.RET_FLAG_ACTIVE;  // it doesn't matter because of temperature...
        return active | skipTemperature;
    }

    #testBehaviourSubtypeMoltenMetal(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return false;
        }
        return true;  // it doesn't matter because of temperature...
    }

    #tryMoveHardFluid(elementHead, x, y, nx, ny) {
        const targetElementHead = this.#elementArea.getElementHeadOrNull(nx, ny);
        if (targetElementHead === null) {
            return false;
        }
        if (ElementHead.getTypeClass(targetElementHead) !== ElementHead.TYPE_FLUID) {
            return false;
        }
        const special = ElementHead.getSpecial(targetElementHead);
        if (special !== ProcessorModuleLiquid.SUBTYPE_WATER) {
            return false;
        }
        this.#elementArea.swap(x, y, nx, ny);
        return true;
    }
}
