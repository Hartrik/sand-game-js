import {Element} from "./Element.js";
import {Brush} from "./Brush.js";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-08
 */
export class ProcessorDefaults {

    /**
     * @return Element
     */
    getDefaultElement() {
        throw 'Not implemented';
    }

    /**
     * @return Brush
     */
    getBrushGrass() {
        throw 'Not implemented';
    }

    /**
     * @return Brush
     */
    getBrushTree() {
        throw 'Not implemented';
    }
}
