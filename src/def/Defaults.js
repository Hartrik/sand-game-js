import {ProcessorDefaults} from "../core/ProcessorDefaults";
import {Brushes} from "./Brushes";
import {Structures} from "./Structures";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-17
 */
export class Defaults extends ProcessorDefaults {

    static #DEFAULT_ELEMENT = Brushes.AIR.apply(0, 0, undefined);

    getDefaultElement() {
        return Defaults.#DEFAULT_ELEMENT;
    }

    // brushes

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

    // structures

    getTreeTrunkTemplates() {
        return Structures.TREE_TRUNK_TEMPLATES;
    }

    getTreeLeafClusterTemplates() {
        return Structures.TREE_CLUSTER_TEMPLATES;
    }
}
