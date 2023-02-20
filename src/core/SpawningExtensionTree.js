import {ElementHead} from "./ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-09-29
 */
export class SpawningExtensionTree {
    static STARTING_COUNTER_VALUE = 1000;
    static MAX_COUNTER_VALUE = 4;

    #elementArea;
    #random;
    #brush;

    #counter = SpawningExtensionTree.STARTING_COUNTER_VALUE;

    constructor(elementArea, random, brush) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brush = brush;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = SpawningExtensionTree.MAX_COUNTER_VALUE;

            const x = this.#random.nextInt(this.#elementArea.getWidth() - 12) + 6;
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 16) + 15;

            if (SpawningExtensionTree.couldGrowUpHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brush.apply(x, y, this.#random));
            }
        }
    }

    static couldGrowUpHere(elementArea, x, y) {
        if (x < 0 || y < 12) {
            return false;
        }
        if (x > elementArea.getWidth() - 5 || y > elementArea.getHeight() - 2) {
            return false;
        }
        let e1 = elementArea.getElementHead(x, y);
        if (ElementHead.getBehaviour(e1) !== ElementHead.BEHAVIOUR_GRASS) {
            return false;
        }
        let e2 = elementArea.getElementHead(x, y + 1);
        if (ElementHead.getBehaviour(e2) !== ElementHead.BEHAVIOUR_SOIL) {
            return false;
        }

        // check space directly above
        for (let dy = 1; dy < 18; dy++) {
            if (!SpawningExtensionTree.#isSpaceHere(elementArea, x, y - dy)) {
                return false;
            }
        }

        // check trees around
        for (let dx = -8; dx < 8; dx++) {
            if (SpawningExtensionTree.#isOtherThreeThere(elementArea, x + dx, y - 4)) {
                return false;
            }
        }

        // check space above - left & right
        for (let dy = 10; dy < 15; dy++) {
            if (!SpawningExtensionTree.#isSpaceHere(elementArea, x - 8, y - dy)) {
                return false;
            }
            if (!SpawningExtensionTree.#isSpaceHere(elementArea, x + 8, y - dy)) {
                return false;
            }
        }

        return true;
    }

    static #isSpaceHere(elementArea, tx, ty) {
        let targetElementHead = elementArea.getElementHead(tx, ty);
        if (ElementHead.getWeight(targetElementHead) === ElementHead.WEIGHT_AIR) {
            return true;
        }
        if (ElementHead.getBehaviour(targetElementHead) === ElementHead.BEHAVIOUR_GRASS) {
            return true;
        }
        return false;
    }

    static #isOtherThreeThere(elementArea, tx, ty) {
        let targetElementHead = elementArea.getElementHead(tx, ty);
        let behaviour = ElementHead.getBehaviour(targetElementHead);
        if (behaviour === ElementHead.BEHAVIOUR_TREE_TRUNK || behaviour === ElementHead.BEHAVIOUR_TREE) {
            return true;
        }
        return false;
    }
}