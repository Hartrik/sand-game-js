import {ElementHead} from "../ElementHead";
import {ElementTail} from "../ElementTail";
import {Element} from "../Element";
import {Brush} from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
 */
export class MeltingBrush extends Brush {

    apply(x, y, random, oldElement) {
        if (oldElement === null) {
            return null;
        }

        const heatModIndex = ElementHead.getHeatModIndex(oldElement.elementHead);
        if (ElementHead.hmiToMeltingTemperature(heatModIndex) < (1 << ElementHead.FIELD_TEMPERATURE_SIZE)) {
            let newElementHead = oldElement.elementHead;
            newElementHead = ElementHead.setHeatModIndex(newElementHead, ElementHead.hmiToMeltingHMI(heatModIndex));
            newElementHead = ElementHead.setType(newElementHead, ElementHead.TYPE_FLUID);

            let newElementTail = ElementTail.setBlurType(oldElement.elementTail, ElementTail.BLUR_TYPE_1);

            return new Element(newElementHead, newElementTail);
        }
        return oldElement;
    }
}