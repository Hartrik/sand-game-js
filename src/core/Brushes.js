import {Brush} from "./Brush.js";
import {ElementHead} from "./ElementHead.js";
import {ElementTail} from "./ElementTail.js";
import {Element} from "./Element.js";
import {VisualEffects} from "./VisualEffects.js";

import _ASSET_PALETTE_SAND from './assets/brushes/sand.palette.csv';
import _ASSET_PALETTE_SOIL from './assets/brushes/soil.palette.csv';
import _ASSET_PALETTE_GRAVEL from './assets/brushes/gravel.palette.csv';
import _ASSET_PALETTE_ASH from './assets/brushes/ash.palette.csv';
import _ASSET_PALETTE_WATER from './assets/brushes/water.palette.csv';
import _ASSET_PALETTE_WALL from './assets/brushes/wall.palette.csv';
import _ASSET_PALETTE_TREE_WOOD from './assets/brushes/tree-wood.palette.csv';
import _ASSET_PALETTE_TREE_LEAF_DEAD from './assets/brushes/tree-leaf-dead.palette.csv';

import _ASSET_TEXTURE_ROCK from './assets/brushes/rock.png';
import _ASSET_TEXTURE_METAL from './assets/brushes/metal.png';

// TODO: create some abstraction for brushes that are needed in core processing and move this into /def

/**
 *
 * @author Patrik Harag
 * @version 2023-12-04
 */
export class Brushes {

    // TEST brushes
    // bright color for testing purposes

    static _TEST_SOLID = Brush.random([
        new Element(
            ElementHead.of(ElementHead.type8(ElementHead.TYPE_STATIC)),
            ElementTail.of(255, 0, 125))
    ]);

    static _TEST_AIR = Brush.random([
        new Element(
            ElementHead.of(ElementHead.type8(ElementHead.TYPE_AIR)),
            ElementTail.of(255, 0, 125))
    ]);

    static _TEST_FLAMMABLE_SOLID_M = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_NEVER)),
            ElementTail.of(25, 52, 56))
    ]);

    static _TEST_FLAMMABLE_SOLID_H = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_HIGH, ElementHead.BURNABLE_TYPE_NEVER)),
            ElementTail.of(25, 56, 49))
    ]);

    static _TEST_FLAMMABLE_SOLID_E = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_EXTREME, ElementHead.BURNABLE_TYPE_NEVER)),
            ElementTail.of(25, 33, 56))
    ]);

    // ---

    static AIR = Brush.random([
        new Element(
            ElementHead.of(ElementHead.type8(ElementHead.TYPE_AIR)),
            ElementTail.of(255, 255, 255, ElementTail.BLUR_TYPE_BACKGROUND))
    ]);

    static WALL = Brush.paletteBrush(_ASSET_PALETTE_WALL, Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(0),
                ElementHead.modifiers8(0, 0, 0, 1)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_2))
    ]));

    static ROCK = Brush.textureBrush(_ASSET_TEXTURE_ROCK, Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(),
                ElementHead.modifiers8(0, 0, 0, 1)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_2))
    ]));

    static METAL = Brush.textureBrush(_ASSET_TEXTURE_METAL, Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(),
                ElementHead.modifiers8(0, 0, 0, 3)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_3))
    ]));

    static SAND = Brush.paletteBrush(_ASSET_PALETTE_SAND, Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 60 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 6),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(0, 0, 0, 2));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2);
        return new Element(elementHead, elementTail);
    }));

    static SOIL = Brush.paletteBrush(_ASSET_PALETTE_SOIL, Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 40 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 5),
            ElementHead.behaviour8(ElementHead.BEHAVIOUR_SOIL),
            ElementHead.modifiers8(0, 0, 0, 1));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1);
        return new Element(elementHead, elementTail);
    }));

    static GRAVEL = Brush.paletteBrush(_ASSET_PALETTE_GRAVEL, Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 20 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 3),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(0, 0, 0, 2));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2);
        return new Element(elementHead, elementTail);
    }));

    static WATER = Brush.paletteBrush(_ASSET_PALETTE_WATER, Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8Fluid(ElementHead.TYPE_FLUID),
                ElementHead.behaviour8(),
                ElementHead.modifiers8(0, 0, 0, 3)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_NONE))
    ]));

    static GRASS = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 5),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST)),
            ElementTail.of(56, 126, 38, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1)),
        new Element(
            ElementHead.of(
                ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 3),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST)),
            ElementTail.of(46, 102, 31, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1)),
        new Element(
            ElementHead.of(
                ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 4),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST)),
            ElementTail.of(72, 130, 70, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1))
    ]);

    static FISH = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_FISH, 0)),
            ElementTail.of(37, 53, 66)),
    ]);

    static FISH_BODY = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_FISH_BODY, 0)),
            ElementTail.of(37, 53, 66)),
    ]);

    static FISH_CORPSE = Brush.random([
        new Element(
            ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 2)),
            ElementTail.of(61, 68, 74, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_1)),
    ]);

    static TREE = Brush.custom((x, y, random) => {
        let treeType = random.nextInt(17);
        return new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE, treeType),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW)),
            ElementTail.of(77, 41, 13, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1));
    });

    static TREE_ROOT = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_ROOT, 8),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW)),
            ElementTail.of(96, 50, 14, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1)),
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_ROOT, 5),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW)),
            ElementTail.of(77, 41, 13, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]);

    static TREE_WOOD = Brush.paletteBrush(_ASSET_PALETTE_TREE_WOOD, Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_TRUNK, 0),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]));

    static TREE_LEAF_LIGHTER = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 0),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM)),
            ElementTail.of(0, 129, 73, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]);

    static TREE_LEAF_DARKER = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 0),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM)),
            ElementTail.of(0, 76, 72, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]);

    static TREE_LEAF_DEAD = Brush.paletteBrush(_ASSET_PALETTE_TREE_LEAF_DEAD, Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 15),
                ElementHead.modifiers8(ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE, ElementTail.HEAT_EFFECT_1))
    ]));

    static #FIRE_ELEMENT_HEAD = ElementHead.of(
            ElementHead.type8(ElementHead.TYPE_EFFECT),
            ElementHead.behaviour8(ElementHead.BEHAVIOUR_FIRE, 0));
    static FIRE = Brush.random([
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD, 255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD, 255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD, 120), ElementTail.of(249, 219, 30))
    ]);

    static ASH = Brush.paletteBrush(_ASSET_PALETTE_ASH, Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 80 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
            ElementHead.type8Powder(type, 6),
            ElementHead.behaviour8(),
            ElementHead.modifiers8(0, 0, 0, 2));
        const elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1, ElementTail.HEAT_EFFECT_2, 3);
        return new Element(elementHead, elementTail);
    }));

    static METEOR = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 0)),
            ElementTail.of(249, 219, 30))
    ]);

    static METEOR_FROM_LEFT = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 1 << 1)),
            ElementTail.of(249, 219, 30))
    ]);

    static METEOR_FROM_RIGHT = Brush.random([
        new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 2 << 1)),
            ElementTail.of(249, 219, 30))
    ]);

    static EFFECT_BURNT = Brush.custom((x, y, random, oldElement) => {
        if (VisualEffects.isVisualBurnApplicable(oldElement.elementHead)) {
            const burntLevel = ElementTail.getBurntLevel(oldElement.elementTail);
            if (burntLevel < 3) {
                return new Element(oldElement.elementHead, VisualEffects.visualBurn(oldElement.elementTail, 1));
            }
        }
        return null;
    });

    static EFFECT_TEMP_0 = Brush.temperature(0);
    static EFFECT_TEMP_127 = Brush.temperature(127);
    static EFFECT_TEMP_200 = Brush.temperature(200);
    static EFFECT_TEMP_255 = Brush.temperature(255);

    // --- SEARCH

    static LIST = [
        { codeName: 'air', brush: Brushes.AIR },
        { codeName: 'ash', brush: Brushes.ASH },
        { codeName: 'sand', brush: Brushes.SAND },
        { codeName: 'soil', brush: Brushes.SOIL },
        { codeName: 'gravel', brush: Brushes.GRAVEL },
        { codeName: 'wall', brush: Brushes.WALL },
        { codeName: 'rock', brush: Brushes.ROCK },
        { codeName: 'metal', brush: Brushes.METAL },
        { codeName: 'wood', brush: Brushes.TREE_WOOD },
        { codeName: 'water', brush: Brushes.WATER },
        { codeName: 'fire', brush: Brushes.FIRE },
        { codeName: 'meteor', brush: Brushes.METEOR },
        { codeName: 'meteor_l', brush: Brushes.METEOR_FROM_LEFT },
        { codeName: 'meteor_r', brush: Brushes.METEOR_FROM_RIGHT },
        { codeName: 'effect_burnt', brush: Brushes.EFFECT_BURNT },
        { codeName: 'effect_temp_0', brush: Brushes.EFFECT_TEMP_0 },
        { codeName: 'effect_temp_127', brush: Brushes.EFFECT_TEMP_127 },
        { codeName: 'effect_temp_200', brush: Brushes.EFFECT_TEMP_200 },
        { codeName: 'effect_temp_255', brush: Brushes.EFFECT_TEMP_255 },
    ]

    static byCodeName(codeName) {
        for (let brushEntry of Brushes.LIST) {
            if (brushEntry.codeName === codeName) {
                return brushEntry.brush;
            }
        }
        return null;
    }
}