import {RenderingMode} from "./RenderingMode.js";
import {ElementHead} from "./ElementHead.js";

/**
 * @author Patrik Harag
 * @version 2023-08-18
 */
export class RenderingModeElementType extends RenderingMode {

    constructor() {
        super();
    }

    #asColor(elementHead) {
        switch (ElementHead.getTypeClass(elementHead)) {
            case ElementHead.TYPE_AIR: return [255, 255, 255];
            case ElementHead.TYPE_STATIC: return [0, 0, 0];
            case ElementHead.TYPE_FLUID: return [0, 0, 255];
            case ElementHead.TYPE_POWDER:
            case ElementHead.TYPE_POWDER_WET:
            case ElementHead.TYPE_POWDER_FLOATING:
                if (ElementHead.getTypeModifierPowderSliding(elementHead) === 1) {
                    if (ElementHead.getTypeModifierPowderDirection(elementHead) === 1) {
                        return [232, 137, 70];
                    } else {
                        return [255, 0, 0];
                    }
                }
                switch (ElementHead.getTypeClass(elementHead)) {
                    case ElementHead.TYPE_POWDER: return [36, 163, 57];
                    case ElementHead.TYPE_POWDER_WET: return [44, 122, 57];
                    case ElementHead.TYPE_POWDER_FLOATING: return [16, 194, 45];
                }
                // fallthrough
            default: return [255, 0, 125];
        }
    }

    apply(data, dataIndex, elementHead, elementTail) {
        const [r, g, b] = this.#asColor(elementHead);

        data[dataIndex] = r;
        data[dataIndex + 1] = g;
        data[dataIndex + 2] = b;

        return false;
    }
}