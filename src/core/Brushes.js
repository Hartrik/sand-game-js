import {Brush} from "./Brush.js";
import {ElementHead} from "./ElementHead.js";
import {ElementTail} from "./ElementTail.js";
import {Element} from "./Element.js";

import _ASSET_TEXTURE_ROCK from './assets/texture-rock.png'

// TODO: create some abstraction for brushes that are needed in core processing and move this into /def

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class Brushes {

    // // bright red color for testing purposes
    // static _TEST_SOLID = Brush.random([
    //     new Element(
    //         ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL),
    //         ElementTail.of(255, 0, 0))
    // ]);
    //
    // // bright red color for testing purposes
    // static _TEST_AIR = Brush.random([
    //     new Element(
    //         ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR),
    //         ElementTail.of(214, 212, 154))
    // ]);
    //
    // static _TEST_FLAMMABLE_SOLID_1 = Brush.random([
    //     new Element(
    //         ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, 0, 0,
    //             ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_NEVER),
    //         ElementTail.of(25, 52, 56))
    // ]);
    //
    // static _TEST_FLAMMABLE_SOLID_2 = Brush.random([
    //     new Element(
    //         ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, 0, 0,
    //             ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_HIGH, ElementHead.BURNABLE_TYPE_NEVER),
    //         ElementTail.of(25, 56, 49))
    // ]);
    //
    // static _TEST_FLAMMABLE_SOLID_3 = Brush.random([
    //     new Element(
    //         ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, 0, 0,
    //             ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_EXTREME, ElementHead.BURNABLE_TYPE_NEVER),
    //         ElementTail.of(25, 33, 56))
    // ]);

    // ---

    static AIR = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR),
            ElementTail.of(255, 255, 255, ElementTail.MODIFIER_BACKGROUND))
    ]);

    static WALL = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), [
        ElementTail.of(55, 55, 55, 0),
        ElementTail.of(57, 57, 57, 0)
    ]);

    static ROCK = Brush.textureBrush(
        Brush.random([new Element(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), 0)]),
        _ASSET_TEXTURE_ROCK);

    static SAND = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_2 | ElementHead.TYPE__DRY_FLAG, ElementHead.WEIGHT_POWDER), [
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(195, 194, 134, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(195, 194, 134, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(218, 211, 165, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(218, 211, 165, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(223, 232, 201, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(186, 183, 128, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static SOIL = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1 | ElementHead.TYPE__DRY_FLAG, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_SOIL), [
        ElementTail.of(142, 104, 72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104, 72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104, 72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104, 72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104, 72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104, 72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 81, 58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 81, 58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 81, 58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 81, 58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 81, 58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 81, 58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(82, 64, 30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(82, 64, 30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(82, 64, 30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133, 87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133, 87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133, 87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(102, 102, 102, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static STONE = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1 | ElementHead.TYPE__DRY_FLAG, ElementHead.WEIGHT_POWDER), [
        ElementTail.of(97, 94, 88, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(111, 110, 106, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(117, 116, 112, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(117, 117, 113, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(120, 118, 115, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(104, 102, 97, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(113, 112, 107, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(129, 128, 125, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(124, 124, 121, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(81, 80, 75, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(80, 76, 69, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(123, 119, 111, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(105, 104, 99, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(84, 82, 78, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(77, 74, 69, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(91, 88, 82, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(68, 65, 60, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(79, 75, 69, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(85, 82, 77, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(98, 94, 88, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(105, 102, 96, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(104, 97, 86, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(60, 55, 47, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(93, 89, 81, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static WATER = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.TYPE_FLUID_2, ElementHead.WEIGHT_WATER), [
        ElementTail.of(4, 135, 186, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(5, 138, 189, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static GRASS = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 5,
                ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST),
            ElementTail.of(56, 126, 38, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
            ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 3,
                ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST),
            ElementTail.of(46, 102, 31, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
            ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 4,
                ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_FAST),
            ElementTail.of(72, 130, 70, ElementTail.MODIFIER_BLUR_ENABLED))
    ]);

    static FISH = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH, 0),
            ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_BODY = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH_BODY, 0),
            ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_CORPSE = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_SAND_2, ElementHead.WEIGHT_POWDER),
            ElementTail.of(61, 68, 74, 0)),
    ]);

    static TREE = Brush.custom((x, y, random) => {
        let treeType = random.nextInt(17);
        return new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE, treeType,
                ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW),
            ElementTail.of(77, 41, 13, 0));
    });

    static TREE_ROOT = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_ROOT, 8,
                ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW),
            ElementTail.of(96, 50, 14, 0)),
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_ROOT, 5,
                ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW),
            ElementTail.of(77, 41, 13, 0))
    ]);

    static TREE_WOOD = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_TRUNK, 0,
            ElementHead.FLAMMABLE_TYPE_SLOW, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_SLOW), [
            ElementTail.of(96, 50, 14, 0),
            ElementTail.of(115, 64, 21, 0)
    ]);

    static TREE_LEAF_LIGHTER = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF, 0,
            ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM), [
            ElementTail.of(0, 129, 73, 0),
    ]);

    static TREE_LEAF_DARKER = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF, 0,
            ElementHead.FLAMMABLE_TYPE_MEDIUM, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM), [
            ElementTail.of(0, 76, 72, 0),
    ]);

    static TREE_LEAF_DEAD = Brush.randomFromHeadAndTails(
        ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF, 15,
            ElementHead.FLAMMABLE_TYPE_FAST, ElementHead.FLAME_HEAT_TYPE_MEDIUM, ElementHead.BURNABLE_TYPE_MEDIUM), [
            ElementTail.of(150, 69, 41, 0),
            ElementTail.of(185, 99, 75, 0),
            ElementTail.of(174, 97, 81, 0),
    ]);

    static #FIRE_ELEMENT_HEAD = ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR, ElementHead.BEHAVIOUR_FIRE, 0);
    static FIRE = Brush.random([
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD,255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD,255), ElementTail.of(249, 219, 30)),
        new Element(ElementHead.setTemperature(Brushes.#FIRE_ELEMENT_HEAD,120), ElementTail.of(249, 219, 30))
    ]);

    static ASH = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_2 | ElementHead.TYPE__DRY_FLAG, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_NONE, 0), [
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 114, 114, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(193, 193, 193, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static METEOR = Brush.random([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_METEOR),
            ElementTail.of(249, 219, 30))
    ]);


    // --- SEARCH

    static #LIST = [
        { codeName: 'air', brush: Brushes.AIR },
        { codeName: 'sand', brush: Brushes.SAND },
        { codeName: 'soil', brush: Brushes.SOIL },
        { codeName: 'gravel', brush: Brushes.STONE },
        { codeName: 'wall', brush: Brushes.WALL },
        { codeName: 'rock', brush: Brushes.ROCK },
        { codeName: 'wood', brush: Brushes.TREE_WOOD },
        { codeName: 'water', brush: Brushes.WATER },
        { codeName: 'fire', brush: Brushes.FIRE },
        { codeName: 'meteor', brush: Brushes.METEOR }
    ]

    static byCodeName(codeName) {
        for (let brushEntry of this.#LIST) {
            if (brushEntry.codeName === codeName) {
                return brushEntry.brush;
            }
        }
        return null;
    }
}