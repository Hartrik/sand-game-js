// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Extension from "./Extension";
import ElementHead from "../ElementHead.js";
import Entities from "../entity/Entities";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-26
 */
export default class ExtensionSpawnFish extends Extension {

    /** @type ElementArea */
    #elementArea;
    /** @type DeterministicRandom */
    #random;
    /** @type ProcessorContext */
    #processorContext;
    /** @type EntityManager */
    #entityManager;

    /**
     *
     * @param gameState {GameState}
     */
    constructor(gameState) {
        super();
        this.#elementArea = gameState.elementArea;
        this.#random = gameState.random;
        this.#processorContext = gameState.processorContext;
        this.#entityManager = gameState.entityManager;
    }

    run() {
        if ((this.#processorContext.getIteration() + 200) % 1000 === 0) {
            const fishCount = this.#entityManager.countEntities('fish');

            if (fishCount >= 8) {
                return;
            }

            const x = this.#random.nextInt(this.#elementArea.getWidth() - 20) + 10;
            const y = this.#findSpawnY(this.#elementArea, x);
            if (y !== null) {
                this.#entityManager.addSerializedEntity(Entities.fish(x, y));
                this.#processorContext.trigger(x, y);
            }
        }
    }

    #findSpawnY(elementArea, x) {
        let waterCount = 0;

        for (let y = 0; y < elementArea.getHeight(); y++) {
            const elementHead = elementArea.getElementHead(x, y);
            const typeClass = ElementHead.getTypeClass(elementHead);
            if (typeClass === ElementHead.TYPE_AIR) {
                waterCount = 0;
            } else if (typeClass === ElementHead.TYPE_FLUID) {
                if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_LIQUID
                        && ElementHead.getSpecial(elementHead) === ElementHead.SPECIAL_LIQUID_WATER) {
                    waterCount++;
                }
            } else if (typeClass === ElementHead.TYPE_POWDER || typeClass === ElementHead.TYPE_POWDER_WET) {
                if (waterCount > 7 && this.#isSpaceAround(x, y - 1)) {
                    return y - 1;
                }
                break;
            }
        }

        return null;
    }

    #isSpaceAround(x, y) {
        for (let dy = 0; dy < 6; dy++) {
            for (let dx = -(dy + 1); dx < dy + 1; dx++) {
                const ex = x + dx;
                const ey = y - dy;
                const elementHead = this.#elementArea.getElementHeadOrNull(ex, ey);
                if (elementHead === null) {
                    return false;
                }
                if (ElementHead.getTypeClass(elementHead) !== ElementHead.TYPE_FLUID) {
                    return false;
                }
                if (ElementHead.getTemperature(elementHead) > 0) {
                    return false;
                }
            }
        }
        return true;
    }
}