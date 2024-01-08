import {ProcessorDefaults} from "../core/processing/ProcessorDefaults";
import {BrushDefs} from "./BrushDefs";
import {StructureDefs} from "./StructureDefs";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-17
 */
export class Defaults extends ProcessorDefaults {

    static #DEFAULT_ELEMENT = BrushDefs.AIR.apply(0, 0, undefined);

    getDefaultElement() {
        return Defaults.#DEFAULT_ELEMENT;
    }

    // brushes

    getBrushWater() {
        return BrushDefs.WATER;
    }

    getBrushSteam() {
        return BrushDefs.STEAM;
    }

    getBrushGrass() {
        return BrushDefs.GRASS;
    }

    getBrushTree() {
        return BrushDefs.TREE;
    }

    getBrushFishHead() {
        return BrushDefs.FISH_HEAD;
    }

    getBrushFishBody() {
        return BrushDefs.FISH_BODY;
    }

    getBrushFishCorpse() {
        return BrushDefs.FISH_CORPSE;
    }

    getBrushFire() {
        return BrushDefs.FIRE;
    }

    getBrushAsh() {
        return BrushDefs.ASH;
    }

    // structures

    getTreeTrunkTemplates() {
        return StructureDefs.TREE_TRUNK_TEMPLATES;
    }

    getTreeLeafClusterTemplates() {
        return StructureDefs.TREE_CLUSTER_TEMPLATES;
    }
}
