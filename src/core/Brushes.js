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
 * @version 2023-01-28
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
        "data:image/png;base64,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");

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