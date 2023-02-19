import {ElementHead} from "./ElementHead.js";
import {ElementTail} from "./ElementTail.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-19
 */
export class ProcessorModuleFire {

    static #FIRE_MIN_TEMPERATURE = 34;

    static createFireElementHead(temperature) {
        let elementHead = ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR, ElementHead.BEHAVIOUR_FIRE);
        elementHead = ElementHead.setTemperature(elementHead, temperature);
        return elementHead;
    }

    static createFireElementTail(temperature) {
        let elementTail = ElementTail.of(0, 0, 0, 0);

        if (temperature > 213)
            elementTail = ElementTail.setColor(elementTail, 249, 219, 30);
        else if (temperature > 170)
            elementTail = ElementTail.setColor(elementTail, 248, 201,  7);
        else if (temperature > 128)
            elementTail = ElementTail.setColor(elementTail, 250, 150,  3);
        else if (temperature > 85)
            elementTail = ElementTail.setColor(elementTail, 255, 111,  0);
        else if (temperature > 80)
            elementTail = ElementTail.setColor(elementTail, 255,  37,  0);
        else if (temperature > 75)
            elementTail = ElementTail.setColor(elementTail, 250,   4,  5);
        else
            elementTail = ElementTail.setColor(elementTail, 125,   0,  0);

        return elementTail;
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

    behaviourFire(elementHead, x, y) {
        if (this.#random.nextInt(3) !== 0) {
            return;  // it would disappear too quickly...
        }

        // count new temperature
        let temperature = ElementHead.getTemperature(elementHead);
        let newTemperature = this.#countNewTemperature(x, y, temperature);
        if (newTemperature < ProcessorModuleFire.#FIRE_MIN_TEMPERATURE) {
            // the fire will disappear
            this.#elementArea.setElement(x, y, this.#defaultElement);
            return;
        }

        // spread or update
        let elementHeadAbove = this.#elementArea.getElementHeadOrNull(x, y - 1);
        if (elementHeadAbove !== null && this.#couldBeReplacedByFire(elementHeadAbove)) {
            this.#elementArea.setElementHead(x, y - 1, ProcessorModuleFire.createFireElementHead(newTemperature));
            this.#elementArea.setElementTail(x, y - 1, ProcessorModuleFire.createFireElementTail(newTemperature));
        } else {
            this.#elementArea.setElementHead(x, y, ElementHead.setTemperature(elementHead, newTemperature));
            this.#elementArea.setElementTail(x, y, ProcessorModuleFire.createFireElementTail(newTemperature));
        }

        // affect near elements:
        //   # #
        //   #O#
        //    #
        this.#fireEffect(x + 1, y - 1, temperature);
        this.#fireEffect(x - 1, y - 1, temperature);
        this.#fireEffect(x + 1, y, temperature);
        this.#fireEffect(x - 1, y, temperature);
        this.#fireEffect(x, y + 1, temperature);
    }

    #countNewTemperature(x, y, currentTemperature) {
        let count = 1;
        let newTemperature = currentTemperature;

        const temperatureUnder = this.#getTemperatureAt(x, y + 1);
        if (temperatureUnder !== null) {
            newTemperature += temperatureUnder;
            count++;
        }
        const temperatureUnderRight = this.#getTemperatureAt(x + 1, y + 1);
        if (temperatureUnderRight !== null) {
            newTemperature += temperatureUnderRight;
            count++;
        }
        const temperatureUnderLeft = this.#getTemperatureAt(x - 1, y + 1);
        if (temperatureUnderLeft !== null) {
            newTemperature += temperatureUnderLeft;
            count++;
        }

        newTemperature = newTemperature / count;
        if (newTemperature < 76) {
            if (this.#random.nextInt(2) === 0) {
                newTemperature -= this.#random.nextInt(10);
            }
        }
        return newTemperature;
    }

    #getTemperatureAt(x, y) {
        let elementHead = this.#elementArea.getElementHeadOrNull(x, y);
        if (elementHead !== null) {
            return ElementHead.getTemperature(elementHead);
        }
        return null;
    }

    #couldBeReplacedByFire(elementHead) {
        return ElementHead.getWeight(elementHead) === ElementHead.WEIGHT_AIR
                && ElementHead.getBehaviour(elementHead) !== ElementHead.BEHAVIOUR_FIRE;
    }

    #fireEffect(x, y, temperature) {
        let elementHead = this.#elementArea.getElementHeadOrNull(x, y);
        if (elementHead == null) {
            return;
        }

        if (ElementHead.getWeight(elementHead) === ElementHead.WEIGHT_AIR) {
            if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_FIRE) {
                // affect fire
                const otherTemperature = ElementHead.getTemperature(elementHead);
                if (otherTemperature < temperature) {
                    const newTemperature = Math.trunc((temperature - otherTemperature) / 2);
                    if (newTemperature > ProcessorModuleFire.#FIRE_MIN_TEMPERATURE) {
                        this.#elementArea.setElementHead(x, y, ProcessorModuleFire.createFireElementHead(newTemperature));
                        this.#elementArea.setElementTail(x, y, ProcessorModuleFire.createFireElementTail(newTemperature));
                    }
                }
            } else {
                // spreading
                const newTemperature = Math.trunc(temperature * 0.7);
                if (newTemperature > ProcessorModuleFire.#FIRE_MIN_TEMPERATURE) {
                    this.#elementArea.setElementHead(x, y, ProcessorModuleFire.createFireElementHead(newTemperature));
                    this.#elementArea.setElementTail(x, y, ProcessorModuleFire.createFireElementTail(newTemperature));
                }
            }
        } else {
            // TODO
        }
    }
}