// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-26
 */
export default class ProcessorModuleLiquid {

    static RET_FLAG_ACTIVE = 0b10;
    static RET_FLAG_SKIP_TEMP = 0b01;

    static FIRST_LIGHT = ElementHead.SPECIAL_LIQUID_LIGHT_OIL;
    static FIRST_HEAVY = ElementHead.SPECIAL_LIQUID_HEAVY_MOLTEN;


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
            case ElementHead.SPECIAL_LIQUID_WATER:
                return this.#behaviourSubtypeWater(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_LIGHT_OIL:
                return this.#behaviourSubtypeLightOil(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_HEAVY_MOLTEN:
                return this.#behaviourSubtypeHeavyMolten(elementHead, x, y);
        }
        return 0;
    }

    testBehaviourLiquid(elementHead, x, y) {
        const special = ElementHead.getSpecial(elementHead);
        switch (special) {
            case ElementHead.SPECIAL_LIQUID_WATER:
                return this.#testBehaviourSubtypeWater(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_LIGHT_OIL:
                return this.#testBehaviourSubtypeLightOil(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_HEAVY_MOLTEN:
                return this.#testBehaviourSubtypeHeavyMolten(elementHead, x, y);
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

    #behaviourSubtypeHeavyMolten(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return 0;
        }

        const rnd = this.#random.nextInt(8);
        let skipTemperature = 0;
        if (rnd % 4 === 0) {
            // gravity down...
            if (this.#tryMoveHeavyFluid(elementHead, x, y, x, y + 1)) {
                // nothing
                skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
            } else {
                if (rnd === 4) {
                    if (this.#tryMoveHeavyFluid(elementHead, x, y, x + 1, y)) {
                        skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                } else {
                    if (this.#tryMoveHeavyFluid(elementHead, x, y, x - 1, y)) {
                        skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                }
            }
        }

        const active = ProcessorModuleLiquid.RET_FLAG_ACTIVE;  // it doesn't matter because of temperature...
        return active | skipTemperature;
    }

    #testBehaviourSubtypeHeavyMolten(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return false;
        }
        return true;  // it doesn't matter because of temperature...
    }

    #behaviourSubtypeLightOil(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return 0;
        }

        const rnd = this.#random.nextInt(32);
        let skipTemperature = 0;
        if (rnd % 16 === 0) {
            // gravity down...
            if (this.#tryMoveLightFluid(elementHead, x, y, x, y - 1)) {
                // nothing
                skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
            } else {
                if (rnd === 0) {
                    if (this.#tryMoveLightFluid(elementHead, x, y, x + 1, y)) {
                        skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                } else {
                    if (this.#tryMoveLightFluid(elementHead, x, y, x - 1, y)) {
                        skipTemperature = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                }
            }
        }

        const active = ProcessorModuleLiquid.RET_FLAG_ACTIVE;  // it doesn't matter because of temperature...
        return active | skipTemperature;
    }

    #testBehaviourSubtypeLightOil(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return false;
        }
        return true;  // TODO: optimize
    }

    // --- utilities

    #tryMoveHeavyFluid(elementHead, x, y, nx, ny) {
        const targetElementHead = this.#elementArea.getElementHeadOrNull(nx, ny);
        if (targetElementHead === null) {
            return false;
        }
        if (ElementHead.getTypeClass(targetElementHead) !== ElementHead.TYPE_FLUID) {
            return false;
        }
        const special = ElementHead.getSpecial(targetElementHead);
        if (special >= ProcessorModuleLiquid.FIRST_HEAVY) {
            return false;
        }
        this.#elementArea.swap(x, y, nx, ny);
        return true;
    }

    #tryMoveLightFluid(elementHead, x, y, nx, ny) {
        const targetElementHead = this.#elementArea.getElementHeadOrNull(nx, ny);
        if (targetElementHead === null) {
            return false;
        }
        if (ElementHead.getTypeClass(targetElementHead) !== ElementHead.TYPE_FLUID) {
            return false;
        }
        const special = ElementHead.getSpecial(targetElementHead);
        if (special >= ProcessorModuleLiquid.FIRST_LIGHT && special <= ProcessorModuleLiquid.FIRST_HEAVY) {
            return false;
        }
        this.#elementArea.swap(x, y, nx, ny);
        return true;
    }
}
