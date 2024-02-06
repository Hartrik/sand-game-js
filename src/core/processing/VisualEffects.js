import {ElementTail} from "../ElementTail.js";
import {ElementHead} from "../ElementHead.js";
import {createNoise2D} from "simplex-noise";
import {DeterministicRandom} from "../DeterministicRandom";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
 */
export class VisualEffects {

    static isVisualBurnApplicable(elementHead) {
        const type = ElementHead.getTypeClass(elementHead);
        return type > ElementHead.TYPE_FLUID || type === ElementHead.TYPE_POWDER_FLOATING;
    }

    static visualBurn(elementTail, force = 1, maxBurntLevel = 3) {
        const burntLevel = ElementTail.getBurntLevel(elementTail);
        if (burntLevel > 2) {
            return elementTail;
        }

        let newTail = elementTail;

        let newBurntLevel = burntLevel + force;
        newBurntLevel = Math.min(newBurntLevel, maxBurntLevel);
        newBurntLevel = Math.max(newBurntLevel, 0);

        const appliedForce = newBurntLevel - burntLevel;
        if (appliedForce > 0) {
            newTail = ElementTail.setBurntLevel(newTail, newBurntLevel);

            let red = ElementTail.getColorRed(elementTail);
            let green = ElementTail.getColorGreen(elementTail);
            let blue = ElementTail.getColorBlue(elementTail);

            let divisor = 1.8 - (Math.random() * 0.5);
            if (appliedForce > 1) {
                divisor = divisor * (1.8 - (Math.random() * 0.5));
            }
            if (appliedForce > 2) {
                divisor = divisor * (1.8 - (Math.random() * 0.5));
            }

            red = Math.trunc(red / divisor);
            green = Math.trunc(green / divisor);
            blue = Math.trunc(blue / divisor);

            newTail = ElementTail.setColor(newTail, red, green, blue);
        }

        return newTail;
    }

    /**
     *
     * @param seed {number|number[]|null}
     * @returns {PerlinNoiseVisualEffect}
     */
    static visualNoiseProvider(seed = 0) {
        if (Array.isArray(seed)) {
            const instances = seed.map(s => {
                const random = new DeterministicRandom(s);
                return createNoise2D(() => random.next());
            });
            return new PerlinNoiseVisualEffect(instances);
        } else {
            const random = new DeterministicRandom(seed);
            const noise2D = createNoise2D(() => random.next());
            return new PerlinNoiseVisualEffect([noise2D]);
        }
    }
}

class PerlinNoiseVisualEffect {
    #noise2DInstances;

    constructor(noise2DInstances) {
        this.#noise2DInstances = noise2DInstances;
    }

    visualNoise(elementTail, x, y, factor = 1, threshold = 0.5, force = 0.1,
                nr = 0x00, ng = 0x00, nb = 0x00) {

        const nose2D = this.#noise2DInstances[0];

        let value = (nose2D(x / factor, y / factor) + 1) / 2;  // 0..1

        // apply threshold

        if (value < threshold) {
            return elementTail;
        }
        value = (value - threshold) * (1 / (1 - threshold));  // normalized 0..1

        // alpha blending

        const alpha = 1 - (value * force);

        let r = ElementTail.getColorRed(elementTail);
        let g = ElementTail.getColorGreen(elementTail);
        let b = ElementTail.getColorBlue(elementTail);

        r = Math.trunc(r * alpha) + (nr * (1 - alpha));
        g = Math.trunc(g * alpha) + (ng * (1 - alpha));
        b = Math.trunc(b * alpha) + (nb * (1 - alpha));

        return ElementTail.setColor(elementTail, r, g, b);
    }

    visualNoiseCombined(elementTail, x, y, coefficientList,
                nr = 0x00, ng = 0x00, nb = 0x00) {

        let result = 0;
        for (let i = 0; i < coefficientList.length; i++) {
            const { factor, threshold, force } = coefficientList[i];
            const instance = this.#noise2DInstances[i % this.#noise2DInstances.length];

            // apply factor and count value
            let value = (instance(x / factor, y / factor) + 1) / 2;  // 0..1

            // apply threshold
            if (value < threshold) {
                value = 0;
            } else {
                value = (value - threshold) * (1 / (1 - threshold));  // normalized 0..1

                // apply force
                value = value * force;

                result += value;
            }
        }
        result = Math.min(result, 1);

        // alpha blending

        const alpha = 1 - (result);

        let r = ElementTail.getColorRed(elementTail);
        let g = ElementTail.getColorGreen(elementTail);
        let b = ElementTail.getColorBlue(elementTail);

        r = Math.trunc(r * alpha) + (nr * (1 - alpha));
        g = Math.trunc(g * alpha) + (ng * (1 - alpha));
        b = Math.trunc(b * alpha) + (nb * (1 - alpha));

        return ElementTail.setColor(elementTail, r, g, b);
    }
}