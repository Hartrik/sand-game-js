import {ElementHead} from "./ElementHead.js";
import {CircleIterator} from "./CircleIterator.js";
import {VisualEffects} from "./VisualEffects.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-18
 */
export class ProcessorModuleMeteor {

    // TODO: leave some metal behind...
    // TODO: when water hit?

    static DIRECTION_FROM_TOP = 0;
    static DIRECTION_FROM_LEFT = 1;
    static DIRECTION_FROM_RIGHT = 2;

    static #HEAT = 100;

    static #EXPLOSION_MAX_HEAT_LVL_8 = 255;
    static #EXPLOSION_MAX_HEAT_LVL_9 = 220;
    static #EXPLOSION_MAX_HEAT_VARIANCE = 60;

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

    behaviourMeteor(elementHead, x, y) {
        this.#spawnFire(elementHead, x, y);

        const special = ElementHead.getSpecial(elementHead);
        const move = special & 0x1;
        let newSpecial = special ^ (!move);
        elementHead = ElementHead.setSpecial(elementHead, newSpecial);
        this.#elementArea.setElementHead(x, y, elementHead);
        if (!move) {
            return;  // move only once per simulation iteration
        }

        // resolve direction
        const slope = 4;
        const direction = (special & (~0x1)) >> 1;
        let tx, ty;
        if (direction === ProcessorModuleMeteor.DIRECTION_FROM_TOP) {
            ty = y + 1;
            tx = x;
        } else if (direction === ProcessorModuleMeteor.DIRECTION_FROM_LEFT) {
            ty = y + 1;
            tx = x + (ty % slope === 0 ? 1 : 0);
        } else if (direction === ProcessorModuleMeteor.DIRECTION_FROM_RIGHT) {
            ty = y + 1;
            tx = x - (ty % slope === 0 ? 1 : 0);
        } else {
            // unknown direction
            ty = y + 1;
            tx = x;
        }

        if (this.#elementArea.isValidPosition(tx, ty)) {
            if (this.#canMove(tx, ty)) {
                // move
                this.#elementArea.swap(x, y, tx, ty);
            } else {
               this.#explode(elementHead, x, y);
            }
        } else {
            this.#explode(elementHead, x, y);
        }
    }

    #canMove(x, y) {
        const targetElementHead = this.#elementArea.getElementHead(x, y);
        const typeClass = ElementHead.getTypeClass(targetElementHead);
        if (typeClass <= ElementHead.TYPE_GAS || typeClass === ElementHead.TYPE_FLUID) {
            return true;
        }
        const behaviour = ElementHead.getBehaviour(targetElementHead);
        if (behaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
            return true;
        }
        if (behaviour === ElementHead.BEHAVIOUR_GRASS) {
            return true;
        }
        return false;
    }

    #spawnFire(elementHead, x, y) {
        CircleIterator.iterate(CircleIterator.BLUEPRINT_4, (dx, dy, level) => {
            if (level === 0) {
                return;  // ignore center
            }

            const tx = x + dx;
            const ty = y + dy;
            if (this.#elementArea.isValidPosition(tx, ty)) {
                let targetElementHead = this.#elementArea.getElementHead(tx, ty);
                if (ElementHead.getTypeClass(targetElementHead) <= ElementHead.TYPE_EFFECT) {
                    const brush = this.#processorContext.getDefaults().getBrushFire();
                    this.#elementArea.setElement(tx, ty, brush.apply(tx, ty, this.#random));
                } else {
                    const modifiedElementHead = ElementHead.setTemperature(targetElementHead, ProcessorModuleMeteor.#HEAT);
                    this.#elementArea.setElementHead(tx, ty, modifiedElementHead);
                }
            }
        });
    }

    #explode(elementHead, x, y) {
        CircleIterator.iterate(CircleIterator.BLUEPRINT_9, (dx, dy, level) => {
            const tx = x + dx;
            const ty = y + dy;
            if (this.#elementArea.isValidPosition(tx, ty)) {
                let targetElementHead = this.#elementArea.getElementHead(tx, ty);
                if (level !== 0 && ElementHead.getBehaviour(targetElementHead) === ElementHead.BEHAVIOUR_METEOR) {
                    // do not destroy other meteors
                    return;
                }

                if (level <= 7) {
                    // destroy elements & spawn fire
                    const brush = this.#processorContext.getDefaults().getBrushFire();
                    this.#elementArea.setElement(tx, ty, brush.apply(tx, ty, this.#random));
                } else {
                    // set temperature, apply visual changes, break solid elements

                    // set temperature
                    const maxHeat = (level === 8)
                            ? ProcessorModuleMeteor.#EXPLOSION_MAX_HEAT_LVL_8
                            : ProcessorModuleMeteor.#EXPLOSION_MAX_HEAT_LVL_9;
                    const heat = maxHeat - this.#random.nextInt(ProcessorModuleMeteor.#EXPLOSION_MAX_HEAT_VARIANCE);
                    targetElementHead = ElementHead.setTemperature(targetElementHead, heat);

                    // visual burnt effect (color)
                    if (VisualEffects.isVisualBurnApplicable(targetElementHead)) {
                        let targetElementTail = this.#elementArea.getElementTail(tx, ty);
                        if (level === 8) {
                            targetElementTail = VisualEffects.visualBurn(targetElementTail, 2);
                        } else {
                            targetElementTail = VisualEffects.visualBurn(targetElementTail, 1);
                        }
                        this.#elementArea.setElementTail(tx, ty, targetElementTail);
                    }

                    // turn some solid elements into fragments
                    if (ElementHead.getTypeClass(targetElementHead) === ElementHead.TYPE_STATIC) {
                        if (level === 8 || (level === 9 && this.#random.nextInt(10) < 3)) {
                            const type = ElementHead.type8Powder(ElementHead.TYPE_POWDER, 5);
                            targetElementHead = ElementHead.setType(targetElementHead, type);
                        }
                    }

                    this.#elementArea.setElementHead(tx, ty, targetElementHead);
                }
            }
        });
    }
}
