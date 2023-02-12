import {Brushes} from "./Brushes.js";

/**
 * @typedef {Object} Scene
 * @property {string} name
 * @property {function(SandGame)} apply
 * @property {string} description
 */


/**
 *
 * @author Patrik Harag
 * @version 2023-02-12
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
        name: 'Landscape',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            sandGame.template()
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
                    w: Brushes.withIntensity(Brushes.WATER, 0.95),
                    1: Brushes.SAND,
                    2: Brushes.SOIL,
                    3: Brushes.STONE
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
            sandGame.template()
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
                    w: Brushes.withIntensity(Brushes.WATER, 0.5),
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
            sandGame.template()
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
        fallthrough: Scenes.SCENE_FALLTHROUGH,
        platform: Scenes.SCENE_PLATFORM
    };
}

