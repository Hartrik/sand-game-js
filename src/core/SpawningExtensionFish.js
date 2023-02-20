import {ElementHead} from "./ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-09-20
 */
export class SpawningExtensionFish {

    #elementArea;
    #random;
    #brushHead;
    #brushBody;

    #counterStartValue = 2;
    #counter = 2;

    constructor(elementArea, random, brushHead, brushBody) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brushHead = brushHead;
        this.#brushBody = brushBody;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = this.#counterStartValue;

            const x = this.#random.nextInt(this.#elementArea.getWidth() - 2) + 1;
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 2) + 1;

            if (this.#couldSpawnHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brushHead.apply(x, y, this.#random));
                this.#elementArea.setElement(x + 1, y, this.#brushBody.apply(x + 1, y, this.#random));

                // increase difficulty of spawning fish again
                this.#counterStartValue = this.#counterStartValue << 2;
            }
        }
    }

    #couldSpawnHere(elementArea, x, y) {
        // space around
        if (x < 1 || y < 1) {
            return false;
        }
        if (x + 1 >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }

        // water around
        if (!this.#isWater(elementArea, x, y) || !this.#isWater(elementArea, x - 1, y)
            || !this.#isWater(elementArea, x + 1, y) || !this.#isWater(elementArea, x + 2, y)
            || !this.#isWater(elementArea, x + 1, y + 1) || !this.#isWater(elementArea, x + 2, y + 1)
            || !this.#isWater(elementArea, x + 1, y - 1) || !this.#isWater(elementArea, x + 2, y - 1)) {
            return false;
        }

        // sand around
        return this.#isSand(elementArea, x, y + 2)
            || this.#isSand(elementArea, x + 1, y + 2);
    }

    #isWater(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_FLUID_2) {
            return false;
        }
        return true;
    }

    #isSand(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_SAND_2) {
            return false;
        }
        return true;
    }
}