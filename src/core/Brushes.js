import {Assets} from "../Assets.js";
import {Brush} from "./Brush.js";
import {CustomBrush} from "./CustomBrush.js";
import {ElementHead} from "./ElementHead.js";
import {ElementTail} from "./ElementTail.js";
import {Element} from "./Element.js";
import {RandomBrush} from "./RandomBrush.js";
import {TextureBrush} from "./TextureBrush.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-04
 */
export class Brushes {

    // bright red color for testing purposes
    static _TEST_SOLID = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), [
        ElementTail.of(255, 0, 0, 0),
    ]);

    // bright red color for testing purposes
    static _TEST_AIR = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR), [
        ElementTail.of(255, 0, 0, 0),
    ]);

    static AIR = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR),
            ElementTail.of(255, 255, 255, ElementTail.MODIFIER_BACKGROUND))
    ]);

    static WALL = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), [
        ElementTail.of(55, 55, 55, 0),
        ElementTail.of(57, 57, 57, 0)
    ]);

    static ROCK = TextureBrush.ofBase64(
        RandomBrush.of([new Element(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), 0)]),
        Assets.TEXTURE_ROCK);

    static SAND = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_2, ElementHead.WEIGHT_POWDER), [
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

    static SOIL = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_SOIL), [
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

    static STONE = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1, ElementHead.WEIGHT_POWDER), [
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

    static WATER = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_FLUID_2, ElementHead.WEIGHT_WATER), [
        ElementTail.of(4, 135, 186, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(5, 138, 189, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static GRASS = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 5),
            ElementTail.of(56, 126, 38, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
            ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 3),
            ElementTail.of(46, 102, 31, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
            ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 4),
            ElementTail.of(72, 130, 70, ElementTail.MODIFIER_BLUR_ENABLED))
    ]);

    static FISH = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH, 0),
            ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_BODY = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH_BODY, 0),
            ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_CORPSE = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_SAND_2, ElementHead.WEIGHT_POWDER),
            ElementTail.of(61, 68, 74, 0)),
    ]);

    static TREE = CustomBrush.of((x, y, random) => {
        let treeType = random.nextInt(17);
        return new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE, treeType),
            ElementTail.of(77, 41, 13, 0));
    });

    static TREE_ROOT = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_ROOT, 8),
            ElementTail.of(96, 50, 14, 0)),
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_ROOT, 5),
            ElementTail.of(77, 41, 13, 0))
    ]);

    static TREE_WOOD = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_TRUNK), [
        ElementTail.of(96, 50, 14, 0),
        ElementTail.of(115, 64, 21, 0)
    ]);

    static TREE_LEAF_LIGHTER = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF), [
        ElementTail.of(0, 129, 73, 0),
    ]);

    static TREE_LEAF_DARKER = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF), [
        ElementTail.of(0, 76, 72, 0),
    ]);

    static TREE_LEAF_DEAD = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF, 15), [
        ElementTail.of(150, 69, 41, 0),
        ElementTail.of(185, 99, 75, 0),
        ElementTail.of(174, 97, 81, 0),
    ]);


    /**
     *
     * @param brush
     * @param intensity {number} 0..1
     */
    static withIntensity(brush, intensity) {
        class WrappingBrush extends Brush {
            apply(x, y, random) {
                let rnd = (random) ? random.next() : Math.random();
                if (rnd < intensity) {
                    return brush.apply(x, y, random);
                }
                return null;
            }
        }

        return new WrappingBrush();
    }
}