import {Brush} from "./Brush.js";
import {ElementHead} from "./ElementHead.js";
import {ElementTail} from "./ElementTail.js";
import {Element} from "./Element.js";
import {VisualEffects} from "./VisualEffects.js";

import _ASSET_TEXTURE_ROCK from './assets/texture-rock.png'

// TODO: create some abstraction for brushes that are needed in core processing and move this into /def

/**
 *
 * @author Patrik Harag
 * @version 2023-08-20
 */
export class Brushes {

    // TEST brushes
    // bright color for testing purposes

    static _TEST_SOLID = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC),
            ElementTail.of(255, 0, 125))
    ]);

    static _TEST_AIR = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_AIR),
            ElementTail.of(255, 0, 125))
    ]);

    static _TEST_FLAMMABLE_SOLID_M = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, 0,
                ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_NEVER),
            ElementTail.of(25, 52, 56))
    ]);

    static _TEST_FLAMMABLE_SOLID_H = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, 0,
                ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_HIGH, ElementHead.BURNABLE_TYPE_NEVER),
            ElementTail.of(25, 56, 49))
    ]);

    static _TEST_FLAMMABLE_SOLID_E = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, 0,
                ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_EXTREME, ElementHead.BURNABLE_TYPE_NEVER),
            ElementTail.of(25, 33, 56))
    ]);

    // ---

    static AIR = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_AIR),
            ElementTail.of(255, 255, 255, ElementTail.BLUR_TYPE_BACKGROUND))
    ]);

    static WALL = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC), [
        ElementTail.of(55, 55, 55),
        ElementTail.of(57, 57, 57)
    ]);

    static ROCK = Brush.textureBrush(
        Brush.random([new Element(ElementHead.of(ElementHead.TYPE_STATIC), 0)]),
        _ASSET_TEXTURE_ROCK);

    static SAND = Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 60 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(ElementHead.type8Powder(type, 6));

        let elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1);
        const colors = [
            [214, 212, 154], [214, 212, 154], [214, 212, 154], [214, 212, 154],
            [225, 217, 171], [225, 217, 171], [225, 217, 171], [225, 217, 171],
            [203, 201, 142], [203, 201, 142], [203, 201, 142], [203, 201, 142],
            [195, 194, 134], [195, 194, 134],
            [218, 211, 165], [218, 211, 165],
            [223, 232, 201],
            [186, 183, 128],
        ];
        const [r, g, b] = colors[Math.trunc(random.nextInt(colors.length))];
        elementTail = ElementTail.setColor(elementTail, r, g, b);

        return new Element(elementHead, elementTail);
    });

    static SOIL = Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 40 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(
                ElementHead.type8Powder(type, 5), ElementHead.behaviour8(ElementHead.BEHAVIOUR_SOIL));

        let elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1);
        const colors = [
            [142, 104, 72], [142, 104, 72], [142, 104, 72], [142, 104, 72], [142, 104, 72], [142, 104, 72],
            [114,  81, 58], [114,  81, 58], [114,  81, 58], [114,  81, 58], [114,  81, 58], [114,  81, 58],
            [82,  64,  30], [82,   64, 30], [ 82,  64, 30],
            [177, 133, 87], [177, 133, 87], [177, 133, 87],
            [102, 102, 102],
        ];
        const [r, g, b] = colors[Math.trunc(random.nextInt(colors.length))];
        elementTail = ElementTail.setColor(elementTail, r, g, b);

        return new Element(elementHead, elementTail);
    });

    static STONE = Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 20 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(ElementHead.type8Powder(type, 3));

        let elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1);
        const colors = [
            [97, 94, 88],
            [111, 110, 106],
            [117, 116, 112],
            [117, 117, 113],
            [120, 118, 115],
            [104, 102, 97],
            [113, 112, 107],
            [129, 128, 125],
            [124, 124, 121],
            [81, 80, 75],
            [80, 76, 69],
            [123, 119, 111],
            [105, 104, 99],
            [84, 82, 78],
            [77, 74, 69],
            [91, 88, 82],
            [68, 65, 60],
            [79, 75, 69],
            [85, 82, 77],
            [98, 94, 88],
            [105, 102, 96],
            [104, 97, 86],
            [60, 55, 47],
            [93, 89, 81],
        ];
        const [r, g, b] = colors[Math.trunc(random.nextInt(colors.length))];
        elementTail = ElementTail.setColor(elementTail, r, g, b);

        return new Element(elementHead, elementTail);
    });

    static WATER = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.type8Fluid(ElementHead.TYPE_FLUID)), [
        ElementTail.of(4, 135, 186, ElementTail.BLUR_TYPE_1),
        ElementTail.of(5, 138, 189, ElementTail.BLUR_TYPE_1)
    ]);

    static GRASS = Brush.random([
        new Element(
            ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 5),
                ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST),
            ElementTail.of(56, 126, 38, ElementTail.BLUR_TYPE_1)),
        new Element(
            ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 3),
                ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST),
            ElementTail.of(46, 102, 31, ElementTail.BLUR_TYPE_1)),
        new Element(
            ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 0),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_GRASS, 4),
                ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST),
            ElementTail.of(72, 130, 70, ElementTail.BLUR_TYPE_1))
    ]);

    static FISH = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_FISH, 0)),
            ElementTail.of(37, 53, 66)),
    ]);

    static FISH_BODY = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_FISH_BODY, 0)),
            ElementTail.of(37, 53, 66)),
    ]);

    static FISH_CORPSE = Brush.random([
        new Element(
            ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 2)),
            ElementTail.of(61, 68, 74)),
    ]);

    static TREE = Brush.custom((x, y, random) => {
        let treeType = random.nextInt(17);
        return new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE, treeType),
                ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW),
            ElementTail.of(77, 41, 13));
    });

    static TREE_ROOT = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_ROOT, 8),
                ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW),
            ElementTail.of(96, 50, 14)),
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_ROOT, 5),
                ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW),
            ElementTail.of(77, 41, 13))
    ]);

    static TREE_WOOD = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_TRUNK, 0),
            ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW), [
            ElementTail.of(96, 50, 14),
            ElementTail.of(115, 64, 21)
    ]);

    static TREE_LEAF_LIGHTER = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 0),
            ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM), [
            ElementTail.of(0, 129, 73),
    ]);

    static TREE_LEAF_DARKER = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 0),
            ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM), [
            ElementTail.of(0, 76, 72),
    ]);

    static TREE_LEAF_DEAD = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_TREE_LEAF, 15),
            ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM), [
            ElementTail.of(150, 69, 41),
            ElementTail.of(185, 99, 75),
            ElementTail.of(174, 97, 81),
    ]);

    static #FIRE_ELEMENT_HEAD = ElementHead.of(ElementHead.TYPE_EFFECT, ElementHead.behaviour8(ElementHead.BEHAVIOUR_FIRE, 0));
    static FIRE = Brush.random([
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD, 255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD, 255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD, 120), ElementTail.of(249, 219, 30))
    ]);

    static ASH = Brush.custom((x, y, random) => {
        const type = random.nextInt(100) < 80 ? ElementHead.TYPE_POWDER : ElementHead.TYPE_POWDER_WET;
        const elementHead = ElementHead.of(ElementHead.type8Powder(type, 6));

        let elementTail = ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_1);
        const colors = [
            [131, 131, 131], [131, 131, 131], [131, 131, 131], [131, 131, 131], [131, 131, 131], [131, 131, 131],
            [135, 135, 135], [135, 135, 135], [135, 135, 135], [135, 135, 135], [135, 135, 135], [135, 135, 135],
            [145, 145, 145], [145, 145, 145], [145, 145, 145], [145, 145, 145], [145, 145, 145], [145, 145, 145],
            [148, 148, 148], [148, 148, 148], [148, 148, 148], [148, 148, 148], [148, 148, 148], [148, 148, 148],
            [160, 160, 160], [160, 160, 160], [160, 160, 160], [160, 160, 160], [160, 160, 160], [160, 160, 160],
            [114, 114, 114],
            [193, 193, 193],
        ];
        const [r, g, b] = colors[Math.trunc(random.nextInt(colors.length))];
        elementTail = ElementTail.setColor(elementTail, r, g, b);

        return new Element(elementHead, elementTail);
    });

    static METEOR = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 0)),
            ElementTail.of(249, 219, 30))
    ]);

    static METEOR_FROM_LEFT = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 1 << 1)),
            ElementTail.of(249, 219, 30))
    ]);

    static METEOR_FROM_RIGHT = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.behaviour8(ElementHead.BEHAVIOUR_METEOR, 2 << 1)),
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

    // --- SEARCH

    static LIST = [
        { codeName: 'air', brush: Brushes.AIR },
        { codeName: 'ash', brush: Brushes.ASH },
        { codeName: 'sand', brush: Brushes.SAND },
        { codeName: 'soil', brush: Brushes.SOIL },
        { codeName: 'gravel', brush: Brushes.STONE },
        { codeName: 'wall', brush: Brushes.WALL },
        { codeName: 'rock', brush: Brushes.ROCK },
        { codeName: 'wood', brush: Brushes.TREE_WOOD },
        { codeName: 'water', brush: Brushes.WATER },
        { codeName: 'fire', brush: Brushes.FIRE },
        { codeName: 'meteor', brush: Brushes.METEOR },
        { codeName: 'meteor_l', brush: Brushes.METEOR_FROM_LEFT },
        { codeName: 'meteor_r', brush: Brushes.METEOR_FROM_RIGHT },
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