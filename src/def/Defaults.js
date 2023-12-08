import {ProcessorDefaults} from "../core/ProcessorDefaults";
import {Brushes} from "./Brushes";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-08
 */
export class Defaults extends ProcessorDefaults {

    static #DEFAULT_ELEMENT = Brushes.AIR.apply(0, 0, undefined);

    getDefaultElement() {
        return Defaults.#DEFAULT_ELEMENT;
    }

    getBrushGrass() {
        return Brushes.GRASS;
    }

    getBrushTree() {
        return Brushes.TREE;
    }
}
