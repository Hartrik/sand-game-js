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

    static SAND = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 6)), [
        ElementTail.of(214, 212, 154, ElementTail.BLUR_TYPE_1),
        ElementTail.of(214, 212, 154, ElementTail.BLUR_TYPE_1),
        ElementTail.of(214, 212, 154, ElementTail.BLUR_TYPE_1),
        ElementTail.of(214, 212, 154, ElementTail.BLUR_TYPE_1),
        ElementTail.of(225, 217, 171, ElementTail.BLUR_TYPE_1),
        ElementTail.of(225, 217, 171, ElementTail.BLUR_TYPE_1),
        ElementTail.of(225, 217, 171, ElementTail.BLUR_TYPE_1),
        ElementTail.of(225, 217, 171, ElementTail.BLUR_TYPE_1),
        ElementTail.of(203, 201, 142, ElementTail.BLUR_TYPE_1),
        ElementTail.of(203, 201, 142, ElementTail.BLUR_TYPE_1),
        ElementTail.of(203, 201, 142, ElementTail.BLUR_TYPE_1),
        ElementTail.of(203, 201, 142, ElementTail.BLUR_TYPE_1),
        ElementTail.of(195, 194, 134, ElementTail.BLUR_TYPE_1),
        ElementTail.of(195, 194, 134, ElementTail.BLUR_TYPE_1),
        ElementTail.of(218, 211, 165, ElementTail.BLUR_TYPE_1),
        ElementTail.of(218, 211, 165, ElementTail.BLUR_TYPE_1),
        ElementTail.of(223, 232, 201, ElementTail.BLUR_TYPE_1),
        ElementTail.of(186, 183, 128, ElementTail.BLUR_TYPE_1)
    ]);

    static SOIL = Brush.randomFromHeadAndTails(ElementHead.of(
            ElementHead.type8Powder(ElementHead.TYPE_POWDER, 5), ElementHead.behaviour8(ElementHead.BEHAVIOUR_SOIL)), [
        ElementTail.of(142, 104, 72, ElementTail.BLUR_TYPE_1),
        ElementTail.of(142, 104, 72, ElementTail.BLUR_TYPE_1),
        ElementTail.of(142, 104, 72, ElementTail.BLUR_TYPE_1),
        ElementTail.of(142, 104, 72, ElementTail.BLUR_TYPE_1),
        ElementTail.of(142, 104, 72, ElementTail.BLUR_TYPE_1),
        ElementTail.of(142, 104, 72, ElementTail.BLUR_TYPE_1),
        ElementTail.of(114, 81, 58, ElementTail.BLUR_TYPE_1),
        ElementTail.of(114, 81, 58, ElementTail.BLUR_TYPE_1),
        ElementTail.of(114, 81, 58, ElementTail.BLUR_TYPE_1),
        ElementTail.of(114, 81, 58, ElementTail.BLUR_TYPE_1),
        ElementTail.of(114, 81, 58, ElementTail.BLUR_TYPE_1),
        ElementTail.of(114, 81, 58, ElementTail.BLUR_TYPE_1),
        ElementTail.of(82, 64, 30, ElementTail.BLUR_TYPE_1),
        ElementTail.of(82, 64, 30, ElementTail.BLUR_TYPE_1),
        ElementTail.of(82, 64, 30, ElementTail.BLUR_TYPE_1),
        ElementTail.of(177, 133, 87, ElementTail.BLUR_TYPE_1),
        ElementTail.of(177, 133, 87, ElementTail.BLUR_TYPE_1),
        ElementTail.of(177, 133, 87, ElementTail.BLUR_TYPE_1),
        ElementTail.of(102, 102, 102, ElementTail.BLUR_TYPE_1)
    ]);

    static STONE = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 2)), [
        ElementTail.of(97, 94, 88, ElementTail.BLUR_TYPE_1),
        ElementTail.of(111, 110, 106, ElementTail.BLUR_TYPE_1),
        ElementTail.of(117, 116, 112, ElementTail.BLUR_TYPE_1),
        ElementTail.of(117, 117, 113, ElementTail.BLUR_TYPE_1),
        ElementTail.of(120, 118, 115, ElementTail.BLUR_TYPE_1),
        ElementTail.of(104, 102, 97, ElementTail.BLUR_TYPE_1),
        ElementTail.of(113, 112, 107, ElementTail.BLUR_TYPE_1),
        ElementTail.of(129, 128, 125, ElementTail.BLUR_TYPE_1),
        ElementTail.of(124, 124, 121, ElementTail.BLUR_TYPE_1),
        ElementTail.of(81, 80, 75, ElementTail.BLUR_TYPE_1),
        ElementTail.of(80, 76, 69, ElementTail.BLUR_TYPE_1),
        ElementTail.of(123, 119, 111, ElementTail.BLUR_TYPE_1),
        ElementTail.of(105, 104, 99, ElementTail.BLUR_TYPE_1),
        ElementTail.of(84, 82, 78, ElementTail.BLUR_TYPE_1),
        ElementTail.of(77, 74, 69, ElementTail.BLUR_TYPE_1),
        ElementTail.of(91, 88, 82, ElementTail.BLUR_TYPE_1),
        ElementTail.of(68, 65, 60, ElementTail.BLUR_TYPE_1),
        ElementTail.of(79, 75, 69, ElementTail.BLUR_TYPE_1),
        ElementTail.of(85, 82, 77, ElementTail.BLUR_TYPE_1),
        ElementTail.of(98, 94, 88, ElementTail.BLUR_TYPE_1),
        ElementTail.of(105, 102, 96, ElementTail.BLUR_TYPE_1),
        ElementTail.of(104, 97, 86, ElementTail.BLUR_TYPE_1),
        ElementTail.of(60, 55, 47, ElementTail.BLUR_TYPE_1),
        ElementTail.of(93, 89, 81, ElementTail.BLUR_TYPE_1)
    ]);

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

    static ASH = Brush.randomFromHeadAndTails(ElementHead.of(ElementHead.type8Powder(ElementHead.TYPE_POWDER, 5),
            ElementHead.behaviour8(ElementHead.BEHAVIOUR_NONE, 0)), [
        ElementTail.of(131, 131, 131, ElementTail.BLUR_TYPE_1),
        ElementTail.of(131, 131, 131, ElementTail.BLUR_TYPE_1),
        ElementTail.of(131, 131, 131, ElementTail.BLUR_TYPE_1),
        ElementTail.of(131, 131, 131, ElementTail.BLUR_TYPE_1),
        ElementTail.of(131, 131, 131, ElementTail.BLUR_TYPE_1),
        ElementTail.of(131, 131, 131, ElementTail.BLUR_TYPE_1),
        ElementTail.of(135, 135, 135, ElementTail.BLUR_TYPE_1),
        ElementTail.of(135, 135, 135, ElementTail.BLUR_TYPE_1),
        ElementTail.of(135, 135, 135, ElementTail.BLUR_TYPE_1),
        ElementTail.of(135, 135, 135, ElementTail.BLUR_TYPE_1),
        ElementTail.of(135, 135, 135, ElementTail.BLUR_TYPE_1),
        ElementTail.of(135, 135, 135, ElementTail.BLUR_TYPE_1),
        ElementTail.of(145, 145, 145, ElementTail.BLUR_TYPE_1),
        ElementTail.of(145, 145, 145, ElementTail.BLUR_TYPE_1),
        ElementTail.of(145, 145, 145, ElementTail.BLUR_TYPE_1),
        ElementTail.of(145, 145, 145, ElementTail.BLUR_TYPE_1),
        ElementTail.of(145, 145, 145, ElementTail.BLUR_TYPE_1),
        ElementTail.of(145, 145, 145, ElementTail.BLUR_TYPE_1),
        ElementTail.of(148, 148, 148, ElementTail.BLUR_TYPE_1),
        ElementTail.of(148, 148, 148, ElementTail.BLUR_TYPE_1),
        ElementTail.of(148, 148, 148, ElementTail.BLUR_TYPE_1),
        ElementTail.of(148, 148, 148, ElementTail.BLUR_TYPE_1),
        ElementTail.of(148, 148, 148, ElementTail.BLUR_TYPE_1),
        ElementTail.of(148, 148, 148, ElementTail.BLUR_TYPE_1),
        ElementTail.of(160, 160, 160, ElementTail.BLUR_TYPE_1),
        ElementTail.of(160, 160, 160, ElementTail.BLUR_TYPE_1),
        ElementTail.of(160, 160, 160, ElementTail.BLUR_TYPE_1),
        ElementTail.of(160, 160, 160, ElementTail.BLUR_TYPE_1),
        ElementTail.of(160, 160, 160, ElementTail.BLUR_TYPE_1),
        ElementTail.of(160, 160, 160, ElementTail.BLUR_TYPE_1),
        ElementTail.of(114, 114, 114, ElementTail.BLUR_TYPE_1),
        ElementTail.of(193, 193, 193, ElementTail.BLUR_TYPE_1)
    ]);

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