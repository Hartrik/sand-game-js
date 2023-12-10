import {ProcessorDefaults} from "../core/ProcessorDefaults";
import {Brushes} from "./Brushes";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-10
 */
export class Defaults extends ProcessorDefaults {

    static #DEFAULT_ELEMENT = Brushes.AIR.apply(0, 0, undefined);

    getDefaultElement() {
        return Defaults.#DEFAULT_ELEMENT;
    }

    getBrushWater() {
        return Brushes.WATER;
    }

    getBrushSteam() {
        return Brushes.STEAM;
    }

    getBrushGrass() {
        return Brushes.GRASS;
    }

    getBrushTree() {
        return Brushes.TREE;
    }

    getBrushFishHead() {
        return Brushes.FISH_HEAD;
    }

    getBrushFishBody() {
        return Brushes.FISH_BODY;
    }

    getBrushFishCorpse() {
        return Brushes.FISH_CORPSE;
    }

    getBrushFire() {
        return Brushes.FIRE;
    }

    getBrushAsh() {
        return Brushes.ASH;
    }
}
