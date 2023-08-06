import { ElementTail } from "./ElementTail.js";
import { ElementHead } from "./ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-06
 */
export class VisualEffects {

    static isVisualBurnApplicable(elementHead) {
        const typeOrdinal = ElementHead.getTypeOrdinal(elementHead);

        if (typeOrdinal === ElementHead.TYPE_SAND_1 || typeOrdinal === ElementHead.TYPE_SAND_2
                || typeOrdinal === ElementHead.TYPE_FALLING) {
            return true;
        }
        if (typeOrdinal === ElementHead.TYPE_STATIC) {
            let weight = ElementHead.getWeight(elementHead);
            return weight > ElementHead.WEIGHT_AIR;
        }
        return false;
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

        newTail = ElementTail.setBurntLevel(newTail, newBurntLevel);

        const appliedForce = newBurntLevel - burntLevel;
        if (appliedForce > 0) {
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
}