import {ElementHead} from "../ElementHead";
import {Element} from "../Element";
import {Brush} from "./Brush";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-03
 */
export class MeltingBrush extends Brush {

    apply(x, y, random, oldElement) {
        if (oldElement === null) {
            return null;
        }

        const heatModIndex = ElementHead.getHeatModIndex(oldElement.elementHead);
        if (ElementHead.hmiToMeltingTemperature(heatModIndex) < (1 << ElementHead.FIELD_TEMPERATURE_SIZE)) {
            const newHeatModIndex = ElementHead.hmiToMeltingHMI(heatModIndex);
            let newElementHead = ElementHead.setHeatModIndex(oldElement.elementHead, newHeatModIndex);
            newElementHead = ElementHead.setType(newElementHead, ElementHead.TYPE_FLUID);
            return new Element(newElementHead, oldElement.elementTail);
        }
        return oldElement;
    }
}