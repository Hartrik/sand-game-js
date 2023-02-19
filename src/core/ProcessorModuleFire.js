import {ElementHead} from "./ElementHead.js";
import {Brushes} from "./Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-19
 */
export class ProcessorModuleFire {

    static #FIRE_MIN_TEMPERATURE = 34;


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
        if (this.#random.nextInt(2) !== 0) {
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
            const newFireElement = Brushes.FIRE.apply(x, y - 1, this.#random);
            let newFireElementHead = ElementHead.setTemperature(newFireElement.elementHead, newTemperature);
            this.#elementArea.setElementHead(x, y - 1, newFireElementHead);
            this.#elementArea.setElementTail(x, y - 1, newFireElement.elementTail);
        } else {
            this.#elementArea.setElementHead(x, y, ElementHead.setTemperature(elementHead, newTemperature));
        }

        // TODO: affect near elements
        // TODO: rendering
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
            // TODO: fire only?
            return ElementHead.getTemperature(elementHead);
        }
        return null;
    }

    #couldBeReplacedByFire(elementHead) {
        return ElementHead.getWeight(elementHead) === ElementHead.WEIGHT_AIR
                && ElementHead.getBehaviour(elementHead) !== ElementHead.BEHAVIOUR_FIRE;
    }
}