import {ElementHead} from "./ElementHead.js";
import {ElementTail} from "./ElementTail.js";
import {Brushes} from "./Brushes.js";
import {VisualEffects} from "./VisualEffects.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ProcessorModuleFire {

    static #FIRE_MIN_TEMPERATURE = 34;

    static createFireElementHead(temperature) {
        let elementHead = ElementHead.of(ElementHead.TYPE_EFFECT, ElementHead.BEHAVIOUR_FIRE);
        elementHead = ElementHead.setTemperature(elementHead, temperature);
        return elementHead;
    }

    static createFireElementTail(temperature) {
        let elementTail = ElementTail.of(0, 0, 0);

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

    static #asFlameHeat(flameHeatType) {
        return [0, 165, 220, 255][flameHeatType];  // none .. very hot
    }

    static #asBurnDownChangeTo10000(burnableType) {
        return [0, 2, 100, 1000][burnableType];  // none .. fast
    }

    static #asFlammableChangeTo10000(flammableType) {
        return [0, 100, 4500, 10000][flammableType];  // never .. quickly
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

    // FIRE

    behaviourFire(elementHead, x, y) {
        if (this.#random.nextInt(4) !== 0) {
            return;  // it would disappear too quickly...
        }

        // count new temperature
        const temperature = ElementHead.getTemperature(elementHead);
        const newTemperature = this.#countNewTemperature(x, y, temperature);
        if (newTemperature < ProcessorModuleFire.#FIRE_MIN_TEMPERATURE) {
            // the fire will disappear
            this.#elementArea.setElement(x, y, this.#defaultElement);
            return;
        }

        // spread or update
        const elementHeadAbove = this.#elementArea.getElementHeadOrNull(x, y - 1);
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
        this.#fireEffect(x + 1, y - 1, newTemperature);
        this.#fireEffect(x - 1, y - 1, newTemperature);
        this.#fireEffect(x + 1, y, newTemperature);
        this.#fireEffect(x - 1, y, newTemperature);
        this.#fireEffect(x, y + 1, newTemperature);
    }

    #countNewTemperature(x, y, currentTemperature) {
        let newTemperature = currentTemperature
                + this.#getTemperatureAt(x, y + 1)          // under
                + this.#getTemperatureAt(x + 1, y + 1)   // under right
                + this.#getTemperatureAt(x - 1, y + 1);  // under left

        newTemperature = newTemperature / 4;

        if (newTemperature < 76) {
            if (this.#random.nextInt(2) === 0) {
                newTemperature -= this.#random.nextInt(10);
            }
        } else {
            if (this.#random.nextInt(2) === 0) {
                newTemperature -= this.#random.nextInt(50);
            }
        }
        if (newTemperature < 0) {
            newTemperature = 0;
        }
        return newTemperature;
    }

    #getTemperatureAt(x, y) {
        const elementHead = this.#elementArea.getElementHeadOrNull(x, y);
        if (elementHead !== null) {
            return ElementHead.getTemperature(elementHead);
        }
        return null;
    }

    #couldBeReplacedByFire(elementHead) {
        return ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_AIR;
    }

    #fireEffect(x, y, temperature) {
        const elementHead = this.#elementArea.getElementHeadOrNull(x, y);
        if (elementHead == null) {
            return;
        }

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
            return;
        }

        // for air elements...
        if (ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_AIR) {
            // spreading
            const newTemperature = Math.trunc(temperature * 0.7);
            if (newTemperature > ProcessorModuleFire.#FIRE_MIN_TEMPERATURE) {
                this.#elementArea.setElementHead(x, y, ProcessorModuleFire.createFireElementHead(newTemperature));
                this.#elementArea.setElementTail(x, y, ProcessorModuleFire.createFireElementTail(newTemperature));
            }
            return;
        }

        // for flammable elements...
        const flammableType = ElementHead.getFlammableType(elementHead);
        if (flammableType !== ElementHead.FLAME_HEAT_TYPE_NONE) {
            if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_FIRE_SOURCE) {
                // already in fire
                return;
            }

            const random = this.#random.nextInt(10000);
            if (random < ProcessorModuleFire.#asFlammableChangeTo10000(flammableType)) {
                // ignite
                let modifiedElementHead = ElementHead.setBehaviour(elementHead, ElementHead.BEHAVIOUR_FIRE_SOURCE);
                modifiedElementHead = ElementHead.setTemperature(modifiedElementHead,
                        ProcessorModuleFire.#asFlameHeat(ElementHead.getFlameHeatType(elementHead)));
                this.#elementArea.setElementHead(x, y, modifiedElementHead);
                // change visual
                const elementTail = this.#elementArea.getElementTail(x, y);
                this.#elementArea.setElementTail(x, y, VisualEffects.visualBurn(elementTail, 2));
                return;
            }
        }

        // visual change
        if (VisualEffects.isVisualBurnApplicable(elementHead)) {
            if (this.#random.nextInt(10) === 0) {
                const elementTail = this.#elementArea.getElementTail(x, y);
                this.#elementArea.setElementTail(x, y, VisualEffects.visualBurn(elementTail, 1, 2));
            }
        }
    }

    // FIRE SOURCE

    behaviourFireSource(elementHead, x, y) {
        const flameHeat = ProcessorModuleFire.#asFlameHeat(ElementHead.getFlameHeatType(elementHead));

        const burnDownChange = ProcessorModuleFire.#asBurnDownChangeTo10000(ElementHead.getBurnableType(elementHead));
        if (this.#random.nextInt(10000) < burnDownChange) {
            // burned down
            if (this.#random.nextInt(100) < 8) {
                // turn into ash
                let ashElement = Brushes.ASH.apply(x, y, this.#random);
                this.#elementArea.setElement(x, y, ashElement);
                // TODO: keep temperature
            } else {
                // turn into fire element
                this.#elementArea.setElementHead(x, y, ProcessorModuleFire.createFireElementHead(flameHeat));
                this.#elementArea.setElementTail(x, y, ProcessorModuleFire.createFireElementTail(flameHeat));
            }
            return;
        }

        // affect others
        const airFound = this.#fireSourceEffect(x, y + 1, flameHeat)
                | this.#fireSourceEffect(x, y - 1, flameHeat)
                | this.#fireSourceEffect(x - 1, y, flameHeat)
                | this.#fireSourceEffect(x + 1, y, flameHeat);

        if (!airFound) {
            // extinguish
            this.#elementArea.setElementHead(x, y, ElementHead.setBehaviour(elementHead, ElementHead.BEHAVIOUR_NONE));
            return;
        }

        if (ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_STATIC) {
            // occasionally a falling piece...
            if (this.#random.nextInt(10000) < 2) {
                const type = ElementHead.type8Powder(ElementHead.TYPE_POWDER, 2);
                this.#elementArea.setElementHead(x, y, ElementHead.setType(elementHead, type));
                return;
            }
        }

        // update temperature
        this.#elementArea.setElementHead(x, y, ElementHead.setTemperature(elementHead, flameHeat));
    }

    #fireSourceEffect(x, y, temperature) {
        const elementHead = this.#elementArea.getElementHeadOrNull(x, y);
        if (elementHead == null) {
            return false;
        }

        // air => spawn fire
        if (ElementHead.getTypeClass(elementHead) === ElementHead.TYPE_AIR) {
            // air found
            const actualTemperature = this.#random.nextInt(temperature);
            if (actualTemperature < ProcessorModuleFire.#FIRE_MIN_TEMPERATURE) {
                return true;
            }

            this.#elementArea.setElementHead(x, y, ProcessorModuleFire.createFireElementHead(actualTemperature));
            this.#elementArea.setElementTail(x, y, ProcessorModuleFire.createFireElementTail(actualTemperature));
            return true;
        }

        // visual change
        if (VisualEffects.isVisualBurnApplicable(elementHead)) {
            if (this.#random.nextInt(1000) === 0) {
                const elementTail = this.#elementArea.getElementTail(x, y);
                this.#elementArea.setElementTail(x, y, VisualEffects.visualBurn(elementTail, 1, 2));
            }
        }

        return false;
    }
}