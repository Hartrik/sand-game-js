import {ElementHead} from "./ElementHead.js";
import {Brushes} from "./Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-24
 */
export class ProcessorModuleGrass {

    static couldGrowUpHere(elementArea, x, y) {
        if (x < 0 || y - 1 < 0) {
            return false;
        }
        if (x >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }
        let e1 = elementArea.getElementHead(x, y);
        if (ElementHead.getWeight(e1) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        let e2 = elementArea.getElementHead(x, y + 1);
        if (ElementHead.getBehaviour(e2) !== ElementHead.BEHAVIOUR_SOIL) {
            return false;
        }
        let e3 = elementArea.getElementHead(x, y - 1);
        if (ElementHead.getWeight(e3) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        return true;
    }


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

    behaviourGrass(elementHead, x, y) {
        let random = this.#random.nextInt(100);
        if (random < 3) {
            // check above
            if (y > 0) {
                let above1 = this.#elementArea.getElementHead(x, y - 1);
                if (ElementHead.getBehaviour(above1) !== ElementHead.BEHAVIOUR_GRASS) {
                    let weightAbove1 = ElementHead.getWeight(above1);
                    // note: it takes longer for water to suffocate the grass
                    if (weightAbove1 > ElementHead.WEIGHT_WATER
                        || (weightAbove1 === ElementHead.WEIGHT_WATER && this.#random.nextInt(100) === 0)) {
                        // remove grass
                        this.#elementArea.setElement(x, y, this.#defaultElement);
                        return;
                    }
                }
            }

            if (random === 0) {
                // grow up
                let growIndex = ElementHead.getSpecial(elementHead);
                if (growIndex === 0) {
                    // maximum height
                    if (this.#random.nextInt(5) === 0) {
                        // remove top element to create some movement
                        this.#elementArea.setElement(x, y, this.#defaultElement);
                    }
                    return;
                }
                if (y === 0) {
                    return;
                }
                let above1 = this.#elementArea.getElementHead(x, y - 1);
                if (ElementHead.getWeight(above1) !== ElementHead.WEIGHT_AIR) {
                    return;
                }
                if (y > 1) {
                    let above2 = this.#elementArea.getElementHead(x, y - 2);
                    if (ElementHead.getWeight(above2) !== ElementHead.WEIGHT_AIR) {
                        return;
                    }
                }
                this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(elementHead, growIndex - 1));
                this.#elementArea.setElementTail(x, y - 1, this.#elementArea.getElementTail(x, y));
            } else if (random === 1) {
                // grow right
                if (ProcessorModuleGrass.couldGrowUpHere(this.#elementArea, x + 1, y + 1)) {
                    this.#elementArea.setElement(x + 1, y + 1, Brushes.GRASS.apply(x, y, this.#random));
                }
            } else if (random === 2) {
                // grow left
                if (ProcessorModuleGrass.couldGrowUpHere(this.#elementArea, x - 1, y + 1)) {
                    this.#elementArea.setElement(x - 1, y + 1, Brushes.GRASS.apply(x, y, this.#random));
                }
            }
        }
    }
}