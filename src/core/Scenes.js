import {Brushes} from "./Brushes.js";
import {Brush} from "./Brush.js";

/**
 * @typedef {Object} Scene
 * @property {string} name
 * @property {function(SandGame)} apply
 * @property {string} description
 */


/**
 *
 * @author Patrik Harag
 * @version 2023-02-25
 */
export class Scenes {

    /** @type Scene */
    static SCENE_EMPTY = {
        name: 'Empty',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            // empty
        }
    };

    /** @type Scene */
    static SCENE_LANDSCAPE = {
        name: 'Landscape 1',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            sandGame.blockTemplate()
                .withMaxHeight(120)
                .withBlueprint([
                    '          ',
                    '     ww   ',
                    '          ',
                    '   11     ',
                    ' 2 11111 2',
                    ' 222    22',
                    '222    222',
                    '3333333333',
                    '          ',
                ])
                .withBrushes({
                    w: Brush.withIntensity(Brushes.WATER, 0.95),
                    1: Brushes.SAND,
                    2: Brushes.SOIL,
                    3: Brushes.STONE
                })
                .paint();
        }
    };

    static SCENE_LANDSCAPE_2 = {
        name: 'Landscape 2',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            sandGame.layeredTemplate()
                .level([[0, 20], [50, 15], [100, 10], [150, 10], [200, 10], [250, 10], [1250, 10]],
                    true, Brushes.STONE)
                .level([[0, 30], [25, 31], [50, 27], [100, 15], [150, 0], [200, 5], [220, 15], [300, 35], [330, 37],
                        [370, 50], [400, 45], [500, 40], [1250, 40]],
                    true, Brushes.SOIL, 30)
                .level([[0, 0], [50, 0], [100, 10], [150, 10], [200, 9], [275, 0], [1250, 0]],
                    true, Brushes.SAND, 5)
                .level(35, false, Brushes.WATER)
                .level(36, false, Brush.withIntensity(Brushes.WATER, 0.33))
                .grass()
                .tree(16, 4)
                .tree(28, 6)
                .tree(45, 3)
                .tree(309, 1)
                .tree(336, 5)
                .tree(361, 7);
        }
    }

    /** @type Scene */
    static SCENE_LANDSCAPE_DESERT = {
        name: 'Desert landscape',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            sandGame.blockTemplate()
                .withMaxHeight(120)
                .withBlueprint([
                    '          ',
                    '     ww   ',
                    '  2       ',
                    '22211     ',
                    '11111111 1',
                    '        11',
                    '       111',
                    '1111111111',
                    '          ',
                ])
                .withBrushes({
                    w: Brush.withIntensity(Brushes.WATER, 0.65),
                    1: Brushes.SAND,
                    2: Brushes.SOIL
                })
                .paint();
        }
    };

    /** @type Scene */
    static SCENE_FALLTHROUGH = {
        name: 'Fall-through',
        description: 'Fall-through mode',
        apply: function (sandGame) {
            sandGame.setFallThroughMode();
            sandGame.blockTemplate()
                .withBlueprint([
                    '          ',
                    '     ww   ',
                    '          ',
                    'ss ssss ss',
                    '          ',
                    '  s   ss  ',
                    '          ',
                    '          ',
                    '          ',
                    '          ',
                ])
                .withBrushes({
                    w: Brush.withIntensity(Brushes.WATER, 0.5),
                    s: Brushes.WALL
                })
                .paint();
        }
    };

    /** @type Scene */
    static SCENE_PLATFORM = {
        name: 'Platform',
        description: 'Erasing mode',
        apply: function (sandGame) {
            sandGame.setErasingMode();
            sandGame.blockTemplate()
                .withBlueprint([
                    '          ',
                    '          ',
                    '        w ',
                    '        w ',
                    '          ',
                    '          ',
                    ' ssssssss ',
                    '          ',
                    '          ',
                ])
                .withBrushes({
                    w: Brushes.SAND,
                    s: Brushes.WALL
                })
                .paint();
        }
    };

    static SCENES = {
        empty: Scenes.SCENE_EMPTY,
        landscape: Scenes.SCENE_LANDSCAPE,
        landscape_2: Scenes.SCENE_LANDSCAPE_2,
        landscape_desert: Scenes.SCENE_LANDSCAPE_DESERT,
        fallthrough: Scenes.SCENE_FALLTHROUGH,
        platform: Scenes.SCENE_PLATFORM
    };
}

