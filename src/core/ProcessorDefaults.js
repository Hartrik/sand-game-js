import {Element} from "./Element.js";
import {Brush} from "./Brush.js";

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-10
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
    getBrushWater() {
        throw 'Not implemented';
    }

    /**
     * @return Brush
     */
    getBrushSteam() {
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

    /**
     * @return Brush
     */
    getBrushFishHead() {
        throw 'Not implemented';
    }

    /**
     * @return Brush
     */
    getBrushFishBody() {
        throw 'Not implemented';
    }

    /**
     * @return Brush
     */
    getBrushFishCorpse() {
        throw 'Not implemented';
    }

    /**
     * @return Brush
     */
    getBrushFire() {
        throw 'Not implemented';
    }

    /**
     * @return Brush
     */
    getBrushAsh() {
        throw 'Not implemented';
    }
}
