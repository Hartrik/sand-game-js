import {ElementHead} from "./ElementHead.js";
import {Brushes} from "./Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-25
 */
export class ProcessorModuleGrass {

    static canGrowUpHere(elementArea, x, y) {
        if (x < 0 || y - 1 < 0) {
            return false;
        }
        if (x >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }
        let e1 = elementArea.getElementHead(x, y);
        if (ElementHead.getTypeClass(e1) !== ElementHead.TYPE_AIR) {
            return false;
        }
        let e2 = elementArea.getElementHead(x, y + 1);
        if (ElementHead.getBehaviour(e2) !== ElementHead.BEHAVIOUR_SOIL) {
            return false;
        }
        let e3 = elementArea.getElementHead(x, y - 1);
        if (ElementHead.getTypeClass(e3) !== ElementHead.TYPE_AIR) {
            return false;
        }
        return true;
    }

    static spawnHere(elementArea, x, y, brush, random) {
        let element = brush.apply(x, y, random);
        let offset = 0;
        for (let i = ElementHead.getSpecial(element.elementHead); i >= 0; i--) {
            if (y - offset < 0) {
                break;
            }
            elementArea.setElementHead(x, y - offset, ElementHead.setSpecial(element.elementHead, i));
            elementArea.setElementTail(x, y - offset, element.elementTail)
            offset++;
        }
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
                    let typeAbove1 = ElementHead.getTypeClass(above1);
                    if (typeAbove1 > ElementHead.TYPE_FLUID
                            || (typeAbove1 === ElementHead.TYPE_FLUID && this.#random.nextInt(100) === 0)) {
                        // note: it takes longer for water to suffocate the grass
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
                if (ElementHead.getTypeClass(above1) !== ElementHead.TYPE_AIR) {
                    return;
                }
                if (y > 1) {
                    let above2 = this.#elementArea.getElementHead(x, y - 2);
                    if (ElementHead.getTypeClass(above2) !== ElementHead.TYPE_AIR) {
                        return;
                    }
                }
                this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(elementHead, growIndex - 1));
                this.#elementArea.setElementTail(x, y - 1, this.#elementArea.getElementTail(x, y));
            } else if (random === 1) {
                // grow right
                if (ProcessorModuleGrass.canGrowUpHere(this.#elementArea, x + 1, y + 1)) {
                    this.#elementArea.setElement(x + 1, y + 1, Brushes.GRASS.apply(x, y, this.#random));
                }
            } else if (random === 2) {
                // grow left
                if (ProcessorModuleGrass.canGrowUpHere(this.#elementArea, x - 1, y + 1)) {
                    this.#elementArea.setElement(x - 1, y + 1, Brushes.GRASS.apply(x, y, this.#random));
                }
            }
        }
    }
}