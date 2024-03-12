import {Brush} from "../core/brush/Brush.js";
import {Brushes} from "../core/brush/Brushes";
import {ElementHead} from "../core/ElementHead.js";
import {ElementTail} from "../core/ElementTail.js";
import {Element} from "../core/Element.js";
import {VisualEffects} from "../core/processing/VisualEffects.js";
import {StructureDefs} from "./StructureDefs";

import _ASSET_PALETTE_SAND from './assets/brushes/sand.palette.csv';
import _ASSET_PALETTE_SOIL from './assets/brushes/soil.palette.csv';
import _ASSET_PALETTE_GRAVEL from './assets/brushes/gravel.palette.csv';
import _ASSET_PALETTE_THERMITE from './assets/brushes/thermite-2.palette.csv';
import _ASSET_PALETTE_COAL from './assets/brushes/coal.palette.csv';
import _ASSET_PALETTE_ASH from './assets/brushes/ash.palette.csv';
import _ASSET_PALETTE_WATER from './assets/brushes/water.palette.csv';
import _ASSET_PALETTE_STEAM from './assets/brushes/steam.palette.csv';
import _ASSET_PALETTE_WALL from './assets/brushes/wall.palette.csv';
import _ASSET_PALETTE_TREE_WOOD_LIGHT from './assets/brushes/tree-wood-light.palette.csv';
import _ASSET_PALETTE_TREE_WOOD_DARK from './assets/brushes/tree-wood-dark.palette.csv';
import _ASSET_PALETTE_TREE_ROOT from './assets/brushes/tree-root.palette.csv';
import _ASSET_PALETTE_TREE_LEAF_LIGHT from './assets/brushes/tree-leaf-light.palette.csv';
import _ASSET_PALETTE_TREE_LEAF_DARK from './assets/brushes/tree-leaf-dark.palette.csv';

/**
 *
 * @author Patrik Harag
 * @version 2024-02-24
 */
export class BrushDefs {

    static NONE = Brushes.custom(() => null);

    // TEST brushes
    // bright color for testing purposes

    static _TEST_SOLID = Brushes.random([
        new Element(
            ElementHead.of(ElementHead.type8(ElementHead.TYPE_STATIC)),
            ElementTail.of(255, 0, 125))
    ]);

    static _TEST_AIR = Brushes.random([
        new Element(
            ElementHead.of(ElementHead.type8(ElementHead.TYPE_AIR)),
            ElementTail.of(255, 0, 125))
    ]);

    // ---

    static AIR = Brushes.random([
        new Element(
            ElementHead.of(ElementHead.type8(ElementHead.TYPE_AIR)),
            ElementTail.of(255, 255, 255, ElementTail.BLUR_TYPE_BACKGROUND))
    ]);

    static WALL = Brushes.colorPaletteRandom(_ASSET_PALETTE_WALL, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(0),
                ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_1)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_2))
    ]));

    static ROCK = Brushes.join([
        Brushes.random([
            new Element(
                ElementHead.of(
                    ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 1)),
                    ElementHead.behaviour8(),
                    ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_1)),
                ElementTail.of(155, 155, 155, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_2))
        ]),
        Brushes.colorNoise([
            { seed: 40, factor: 60, threshold: 0.4, force: 0.9 },
            { seed: 41, factor: 30, threshold: 0.4, force: 0.9 },
            { seed: 42, factor: 15, threshold: 0.4, force: 0.5 },
            { seed: 43, factor: 3, threshold: 0.1, force: 0.1 },
        ], 79, 69, 63),
        Brushes.colorNoise([
            { seed: 51, factor: 30, threshold: 0.4, force: 0.9 },
            { seed: 52, factor: 15, threshold: 0.4, force: 0.5 },
            { seed: 53, factor: 3, threshold: 0.1, force: 0.1 },
        ], 55, 48, 46),
        Brushes.colorNoise([
            { seed: 61, factor: 30, threshold: 0.4, force: 0.9 },
            { seed: 62, factor: 15, threshold: 0.4, force: 0.5 },
            { seed: 63, factor: 3, threshold: 0.1, force: 0.1 },
        ], 33, 29, 28)
    ]);

    static METAL = Brushes.join([
        Brushes.random([
            new Element(
                ElementHead.of(
                    ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 2)),
                    ElementHead.behaviour8(),
                    ElementHead.modifiers8(ElementHead.HMI_METAL)),
                ElementTail.of(155, 155, 155, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_3))
        ]),
        Brushes.colorNoise([
            { seed: 40, factor: 40, threshold: 0.4, force: 0.75 },
            { seed: 40, factor: 20, threshold: 0.5, force: 0.4 },
            { seed: 40, factor: 10, threshold: 0.4, force: 0.2 },
            { seed: 40, factor: 5, threshold: 0.4, force: 0.1 },
        ], 135, 135, 135),
        Brushes.colorNoise([
            { seed: 41, factor: 10, threshold: 0.4, force: 0.4 },
            { seed: 41, factor: 6, threshold: 0.3, force: 0.3 },
            { seed: 41, factor: 4, threshold: 0.5, force: 0.3 },
        ], 130, 130, 130)
    ]);

    static METAL_MOLTEN = Brushes.join([BrushDefs.METAL, Brushes.temperature(180), Brushes.molten()]);

    static SAND = Brushes.colorPaletteRandom(_ASSET_PALETTE_SAND, Brushes.custom((x, y, random) => {
        const type = random.nextInt(100) < 60 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 6),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_2));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2);
        return new Element(elementHead, elementTail);
    }));

    static SOIL = Brushes.colorPaletteRandom(_ASSET_PALETTE_SOIL, Brushes.custom((x, y, random) => {
        const type = random.nextInt(100) < 40 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 5),
            ElementHead.behaviour8(ElementHead.BEHAVIOUR_SOIL),
            ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_1));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1);
        return new Element(elementHead, elementTail);
    }));

    static GRAVEL = Brushes.colorPaletteRandom(_ASSET_PALETTE_GRAVEL, Brushes.custom((x, y, random) => {
        const type = random.nextInt(100) < 20 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 3),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_2));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2);
        return new Element(elementHead, elementTail);
    }));

    static COAL = Brushes.colorPaletteRandom(_ASSET_PALETTE_COAL, Brushes.custom((x, y, random) => {
        const type = random.nextInt(100) < 40 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 4),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(ElementHead.HMI_COAL));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2, 3);
        return new Element(elementHead, elementTail);
    }));

    static THERMITE = Brushes.colorPaletteRandom(_ASSET_PALETTE_THERMITE, Brushes.custom((x, y, random) => {
        const type = random.nextInt(100) < 60 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 5),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(ElementHead.HMI_THERMITE));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2, 3);
        return new Element(elementHead, elementTail);
    }));

    static WATER = Brushes.colorPaletteRandom(_ASSET_PALETTE_WATER, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8Fluid(ElementHead.TYPE_FLUID),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_WATER),
                ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_3)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_NONE))
    ]));

    static STEAM = Brushes.colorPaletteRandom(_ASSET_PALETTE_STEAM, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8Fluid(ElementHead.TYPE_GAS),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_WATER),
                ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_3)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_NONE))
    ]));

    static GRASS = Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 5),
                ElementHead.modifiers8(ElementHead.HMI_GRASS_LIKE)),
            ElementTail.of(56, 126, 38, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1)),
        new Element(
            ElementHead.of(
                ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 3),
                ElementHead.modifiers8(ElementHead.HMI_GRASS_LIKE)),
            ElementTail.of(46, 102, 31, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1)),
        new Element(
            ElementHead.of(
                ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 4),
                ElementHead.modifiers8(ElementHead.HMI_GRASS_LIKE)),
            ElementTail.of(72, 130, 70, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1))
    ]);

    static FISH_HEAD = Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_FISH, 0)),
            ElementTail.of(37, 53, 66)),
    ]);

    static FISH_BODY = Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_FISH_BODY, 0)),
            ElementTail.of(37, 53, 66)),
    ]);

    static FISH_CORPSE = Brushes.random([
        new Element(
            ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 2)),
            ElementTail.of(61, 68, 74, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1)),
    ]);

    static TREE = Brushes.colorPaletteRandom(_ASSET_PALETTE_TREE_WOOD_DARK, Brushes.custom((x, y, random) => {
        let treeType = random.nextInt(StructureDefs.TREE_TRUNK_TEMPLATES.length);
        return new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3)),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE, treeType),
                ElementHead.modifiers8(ElementHead.HMI_WOOD_LIKE)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1));
    }));

    static TREE_ROOT = Brushes.colorPaletteRandom(_ASSET_PALETTE_TREE_ROOT, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3)),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_ROOT, 8),
                ElementHead.modifiers8(ElementHead.HMI_WOOD_LIKE)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1)),
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3)),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_ROOT, 5),
                ElementHead.modifiers8(ElementHead.HMI_WOOD_LIKE)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]));

    static TREE_WOOD = Brushes.colorPaletteRandom(_ASSET_PALETTE_TREE_WOOD_LIGHT, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3)),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_TRUNK, 0),
                ElementHead.modifiers8(ElementHead.HMI_WOOD_LIKE)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]));

    static TREE_WOOD_DARK = Brushes.colorPaletteRandom(_ASSET_PALETTE_TREE_WOOD_DARK, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3)),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_TRUNK, 0),
                ElementHead.modifiers8(ElementHead.HMI_WOOD_LIKE)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]));

    static TREE_LEAF_LIGHTER = Brushes.colorPaletteRandom(_ASSET_PALETTE_TREE_LEAF_LIGHT, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3)),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 0),
                ElementHead.modifiers8(ElementHead.HMI_LEAF_LIKE)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]));

    static TREE_LEAF_DARKER = Brushes.colorPaletteRandom(_ASSET_PALETTE_TREE_LEAF_DARK, Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.type8Solid(ElementHead.TYPE_STATIC, 3)),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 0),
                ElementHead.modifiers8(ElementHead.HMI_LEAF_LIKE)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]));

    static #FIRE_ELEMENT_HEAD = ElementHead.of(
            ElementHead.type8(ElementHead.TYPE_EFFECT),
            ElementHead.behaviour8(ElementHead.BEHAVIOUR_FIRE, 0));
    static FIRE = Brushes.random([
        new Element(ElementHead.setTemperature(BrushDefs.#FIRE_ELEMENT_HEAD, 255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(BrushDefs.#FIRE_ELEMENT_HEAD, 255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(BrushDefs.#FIRE_ELEMENT_HEAD, 120), ElementTail.of(249, 219, 30))
    ]);

    static ASH = Brushes.colorPaletteRandom(_ASSET_PALETTE_ASH, Brushes.custom((x, y, random) => {
        const type = random.nextInt(100) < 80 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 6),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_2));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2, 3);
        return new Element(elementHead, elementTail);
    }));

    static METEOR = Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 0)),
            ElementTail.of(249, 219, 30))
    ]);

    static METEOR_FROM_LEFT = Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 1 << 1)),
            ElementTail.of(249, 219, 30))
    ]);

    static METEOR_FROM_RIGHT = Brushes.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 2 << 1)),
            ElementTail.of(249, 219, 30))
    ]);

    static EFFECT_BURNT = Brushes.custom((x, y, random, oldElement) => {
        if (VisualEffects.isVisualBurnApplicable(oldElement.elementHead)) {
            const burntLevel = ElementTail.getBurntLevel(oldElement.elementTail);
            if (burntLevel < 3) {
                return new Element(oldElement.elementHead, VisualEffects.visualBurn(oldElement.elementTail, 1));
            }
        }
        return null;
    });

    static EFFECT_NOISE_LG = Brushes.colorNoise({ seed: 0, factor: 40, threshold: 0.5, force: 0.25 });
    static EFFECT_NOISE_MD = Brushes.colorNoise({ seed: 0, factor: 10, threshold: 0.5, force: 0.25 });
    static EFFECT_NOISE_SM = Brushes.colorNoise({ seed: 0, factor: 4, threshold: 0.5, force: 0.25 });

    static EFFECT_TEMP_0 = Brushes.temperature(0);
    static EFFECT_TEMP_127 = Brushes.temperature(127);
    static EFFECT_TEMP_200 = Brushes.temperature(200);
    static EFFECT_TEMP_255 = Brushes.temperature(255);

    static EFFECT_WET = Brushes.custom((x, y, random, oldElement) => {
        if (oldElement !== null) {
            const typeClass = ElementHead.getTypeClass(oldElement.elementHead);
            if (typeClass === ElementHead.TYPE_POWDER) {
                const modifiedElementHead = ElementHead.setTypeClass(oldElement.elementHead, ElementHead.TYPE_POWDER_WET);
                return new Element(modifiedElementHead, oldElement.elementTail);
            } else {
                return oldElement;
            }
        }
        return null;
    });

    static EFFECT_MOLTEN = Brushes.molten();

    // --- SEARCH

    static _LIST = {
        none: BrushDefs.NONE,
        air: BrushDefs.AIR,
        ash: BrushDefs.ASH,
        sand: BrushDefs.SAND,
        soil: BrushDefs.SOIL,
        gravel: BrushDefs.GRAVEL,
        wall: BrushDefs.WALL,
        rock: BrushDefs.ROCK,
        metal: BrushDefs.METAL,
        metal_molten: BrushDefs.METAL,
        wood: BrushDefs.TREE_WOOD,
        water: BrushDefs.WATER,
        steam: BrushDefs.STEAM,
        fire: BrushDefs.FIRE,
        meteor: BrushDefs.METEOR,
        meteor_l: BrushDefs.METEOR_FROM_LEFT,
        meteor_r: BrushDefs.METEOR_FROM_RIGHT,
        effect_burnt: BrushDefs.EFFECT_BURNT,
        effect_temp_0: BrushDefs.EFFECT_TEMP_0,
        effect_temp_127: BrushDefs.EFFECT_TEMP_127,
        effect_temp_200: BrushDefs.EFFECT_TEMP_200,
        effect_temp_255: BrushDefs.EFFECT_TEMP_255,
        effect_wet: BrushDefs.EFFECT_WET,
        effect_melt: BrushDefs.EFFECT_MOLTEN,
    }

    /**
     *
     * @param codeName {string}
     * @returns {Brush|null}
     */
    static byCodeName(codeName) {
        const brush = BrushDefs._LIST[codeName];
        if (brush !== undefined) {
            return brush;
        }
        return null;
    }
}