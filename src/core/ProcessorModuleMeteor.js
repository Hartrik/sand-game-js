import {ElementHead} from "./ElementHead.js";
import {Brushes} from "./Brushes.js";
import {CircleIterator} from "./CircleIterator.js";
import {VisualEffects} from "./VisualEffects.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-06
 */
export class ProcessorModuleMeteor {

    // TODO: left right direction
    // TODO: radius of heat
    // TODO: leave some burning elements behind...
    // TODO: leave some metal behind...
    // TODO: when water hit?
    // TODO: add randomness to destruction

    static EXPLOSION_HEAT = 200;


    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type Element */
    #defaultElement;

    constructor(elementArea, random, defaultElement) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#defaultElement = defaultElement;
    }

    behaviourMeteor(elementHead, x, y) {
        this.#spawnFire(elementHead, x, y);

        const move = ElementHead.getSpecial(elementHead);
        elementHead = ElementHead.setSpecial(elementHead, !move);
        this.#elementArea.setElementHead(x, y, elementHead);
        if (!move) {
            return;  // move only once per simulation iteration
        }

        if (this.#elementArea.isValidPosition(x + 1, y + 1)) {
            let targetElementHead = this.#elementArea.getElementHead(x + 1, y + 1);
            if (ElementHead.getWeight(targetElementHead) === ElementHead.WEIGHT_AIR) {
                // move
                this.#elementArea.swap(x, y, x + 1, y + 1);
            } else {
               this.#explode(elementHead, x, y);
            }
        } else {
            this.#explode(elementHead, x, y);
        }
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
                if (ElementHead.getWeight(targetElementHead) === ElementHead.WEIGHT_AIR) {
                    this.#elementArea.setElement(tx, ty, Brushes.FIRE.apply(tx, ty, this.#random));
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
                    this.#elementArea.setElement(tx, ty, Brushes.FIRE.apply(tx, ty, this.#random));
                } else {
                    // set temperature, apply visual changes, break solid elements

                    // TODO
                    // targetElementHead = ElementHead.setTemperature(targetElementHead, ProcessorModuleMeteor.EXPLOSION_HEAT);

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
                    if (ElementHead.getTypeOrdinal(targetElementHead) === ElementHead.TYPE_STATIC
                            && ElementHead.getWeight(targetElementHead) === ElementHead.WEIGHT_WALL) {
                        if (level === 8 || (level === 9 && this.#random.nextInt(10) < 3)) {
                            targetElementHead = ElementHead.setWeight(targetElementHead, ElementHead.WEIGHT_POWDER);
                            targetElementHead = ElementHead.setType(targetElementHead, ElementHead.TYPE_SAND_1);
                        }
                    }

                    this.#elementArea.setElementHead(tx, ty, targetElementHead);
                }
            }
        });
    }
}
