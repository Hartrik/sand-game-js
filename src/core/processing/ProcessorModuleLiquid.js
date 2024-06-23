// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../ElementHead.js";
import VisualEffects from "./VisualEffects";

/**
 *
 * @author Patrik Harag
 * @version 2024-06-23
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
            case ElementHead.SPECIAL_LIQUID_WATER_STAINED:
                return this.#behaviourSubtypeWater(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_LIGHT_OIL:
                return this.#behaviourSubtypeLightOil(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_LIGHT_ACID:
                return this.#behaviourSubtypeLightAcid(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_HEAVY_MOLTEN:
                return this.#behaviourSubtypeHeavyMolten(elementHead, x, y);
        }
        return 0;
    }

    testBehaviourLiquid(elementHead, x, y) {
        const special = ElementHead.getSpecial(elementHead);
        switch (special) {
            case ElementHead.SPECIAL_LIQUID_WATER:
            case ElementHead.SPECIAL_LIQUID_WATER_STAINED:
                return this.#testBehaviourSubtypeWater(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_LIGHT_OIL:
                return this.#testBehaviourSubtypeLightOil(elementHead, x, y);
            case ElementHead.SPECIAL_LIQUID_LIGHT_ACID:
                return this.#testBehaviourSubtypeLightAcid(elementHead, x, y);
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

        let result = 0;

        const rnd = this.#random.nextInt(8);

        // secondary movement
        if (rnd % 4 === 0) {
            // gravity down...
            if (this.#testMoveHeavyFluid(x, y + 1)) {
                this.#elementArea.swap(x, y, x, y + 1);
                result = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
            } else {
                if (rnd === 4) {
                    if (this.#testMoveHeavyFluid(x + 1, y)) {
                        this.#elementArea.swap(x, y, x + 1, y);
                        result = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                } else {
                    if (this.#testMoveHeavyFluid(x - 1, y)) {
                        this.#elementArea.swap(x, y, x - 1, y);
                        result = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                }
            }
        }

        const active = ProcessorModuleLiquid.RET_FLAG_ACTIVE;  // it doesn't matter because of temperature...
        return active | result;
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

        let result = 0;

        const rnd = this.#random.nextInt(32);

        // secondary movement
        if (rnd % 16 === 0) {
            result = this.#moveLightFluid(x, y, result, rnd === 0);
        }

        // staining
        if (rnd === 7) {
            const targetHead = this.#elementArea.getElementHeadOrNull(x, y + 1);
            if (targetHead !== null) {
                const targetClass = ElementHead.getTypeClass(targetHead);
                if (targetClass === ElementHead.TYPE_FLUID) {
                    if (ElementHead.getBehaviour(targetHead) === ElementHead.BEHAVIOUR_LIQUID
                            && ElementHead.getSpecial(targetHead) === ElementHead.SPECIAL_LIQUID_WATER) {

                        const oilyWaterBrush = this.#processorContext.getDefaults().getBrushWaterOily();
                        this.#elementArea.setElement(x, y + 1, oilyWaterBrush.apply(x, y, this.#random));
                    }
                } else if (targetClass > ElementHead.TYPE_FLUID) {
                    let targetTail = this.#elementArea.getElementTail(x, y + 1);
                    targetTail = VisualEffects.visualBurn(targetTail, 1, 1);
                    this.#elementArea.setElementTail(x, y + 1, targetTail);
                }
            }
        }

        return result;
    }

    #testBehaviourSubtypeLightOil(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return false;
        }

        return this.#testMoveLightFluid(x, y - 1)
            || this.#testMoveLightFluid(x + 1, y)
            || this.#testMoveLightFluid(x - 1, y);
    }

    #behaviourSubtypeLightAcid(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        const inLiquidForm = typeClass === ElementHead.TYPE_FLUID;

        let result = 0;
        let rnd = this.#random.next();
        if (rnd < 0.16) {
            if (inLiquidForm) {
                // secondary movement - 16 %
                result = this.#moveLightFluid(x, y, result, rnd < 0.08);
            }

        } else if ((rnd = rnd - 0.16) < 0.02) {
            // special - 2 %

            const directions = [[0, 1], [0, -1], [-1, 0], [-1, 0], [-1, 0], [1, 0], [1, 0], [1, 0]];
            const randomDirection = directions[this.#random.nextInt(directions.length)];
            const targetX = x + randomDirection[0];
            const targetY = y + randomDirection[1];

            const targetElementHead = this.#elementArea.getElementHeadOrNull(targetX, targetY);
            if (targetElementHead === null) {
                return result;
            }

            const targetTypeClass = ElementHead.getTypeClass(targetElementHead);
            switch (targetTypeClass) {
                case ElementHead.TYPE_AIR:
                    // evaporate
                    if (rnd < 0.01) {
                        if (inLiquidForm) {
                            elementHead = ElementHead.setType(elementHead, ElementHead.TYPE_GAS);
                            this.#elementArea.setElementHead(x, y, elementHead);
                        } else {
                            const defaultElement = this.#processorContext.getDefaults().getDefaultElement();
                            this.#elementArea.setElement(x, y, defaultElement);
                        }
                        result = ProcessorModuleLiquid.RET_FLAG_ACTIVE | ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    }
                    break;

                case ElementHead.TYPE_FLUID:
                    // react
                    const behaviour = ElementHead.getBehaviour(targetElementHead);
                    if (behaviour === ElementHead.BEHAVIOUR_LIQUID) {
                        const special = ElementHead.getSpecial(targetElementHead);
                        if (special === ElementHead.SPECIAL_LIQUID_WATER) {
                            if (rnd < 0.01) {
                                // neutralize
                                const waterBrush = this.#processorContext.getDefaults().getBrushWater();
                                this.#elementArea.setElement(x, y, waterBrush.apply(x, y, this.#random));
                                result = ProcessorModuleLiquid.RET_FLAG_ACTIVE | ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                            }
                        } else if (special === ElementHead.SPECIAL_LIQUID_LIGHT_OIL
                            || special === ElementHead.SPECIAL_LIQUID_HEAVY_MOLTEN) {
                            // dissolving
                            const defaultElement = this.#processorContext.getDefaults().getDefaultElement();
                            this.#elementArea.setElement(targetX, targetY, defaultElement);
                            result = ProcessorModuleLiquid.RET_FLAG_ACTIVE | ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                        }
                    }
                    break;

                case ElementHead.TYPE_POWDER:
                case ElementHead.TYPE_POWDER_WET:
                case ElementHead.TYPE_STATIC:
                    // dissolving
                    const defaultElement = this.#processorContext.getDefaults().getDefaultElement();
                    this.#elementArea.setElement(targetX, targetY, defaultElement);
                    result = ProcessorModuleLiquid.RET_FLAG_ACTIVE | ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                    break;
            }
        }

        return result;
    }

    #testBehaviourSubtypeLightAcid(elementHead, x, y) {
        const typeClass = ElementHead.getTypeClass(elementHead);
        if (typeClass !== ElementHead.TYPE_FLUID) {
            return true;
        }

        if (this.#testMoveLightFluid(x, y - 1)
            || this.#testMoveLightFluid(x + 1, y)
            || this.#testMoveLightFluid(x - 1, y)) {
            return true;
        }

        for (let [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
            const targetElementHead = this.#elementArea.getElementHeadOrNull(x + dx, y + dy);
            if (targetElementHead === null) {
                continue;
            }
            const targetTypeClass = ElementHead.getTypeClass(targetElementHead);
            if (targetTypeClass !== ElementHead.TYPE_FLUID) {
                return true;
            }
            const behaviour = ElementHead.getBehaviour(targetElementHead);
            if (behaviour !== ElementHead.BEHAVIOUR_LIQUID) {
                return true;
            }
            const special = ElementHead.getSpecial(targetElementHead);
            if (special !== ElementHead.SPECIAL_LIQUID_LIGHT_ACID) {
                return true;
            }
        }
        return false;
    }

    #moveLightFluid(x, y, result, preferRight) {
        if (this.#testMoveLightFluid(x, y - 1)) {
            this.#elementArea.swap(x, y, x, y - 1);
            result = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
        } else {
            if (preferRight) {
                if (this.#testMoveLightFluid(x + 1, y)) {
                    this.#elementArea.swap(x, y, x + 1, y);
                    result = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                }
            } else {
                if (this.#testMoveLightFluid(x - 1, y)) {
                    this.#elementArea.swap(x, y, x - 1, y);
                    result = ProcessorModuleLiquid.RET_FLAG_SKIP_TEMP;
                }
            }
        }
        return result;
    }

    // --- utilities

    #testMoveHeavyFluid(nx, ny) {
        const targetElementHead = this.#elementArea.getElementHeadOrNull(nx, ny);
        if (targetElementHead === null) {
            return false;
        }
        if (ElementHead.getTypeClass(targetElementHead) !== ElementHead.TYPE_FLUID) {
            return false;
        }
        const special = ElementHead.getSpecial(targetElementHead);
        return special < ProcessorModuleLiquid.FIRST_HEAVY;

    }

    #testMoveLightFluid(nx, ny) {
        const targetElementHead = this.#elementArea.getElementHeadOrNull(nx, ny);
        if (targetElementHead === null) {
            return false;
        }
        if (ElementHead.getTypeClass(targetElementHead) !== ElementHead.TYPE_FLUID) {
            return false;
        }
        const special = ElementHead.getSpecial(targetElementHead);
        return !(special >= ProcessorModuleLiquid.FIRST_LIGHT && special <= ProcessorModuleLiquid.FIRST_HEAVY);
    }
}
