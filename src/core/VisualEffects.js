import { ElementTail } from "./ElementTail.js";
import { ElementHead } from "./ElementHead.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-18
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
}