import {Brushes} from "./core/Brushes.js";
import {Brush} from "./core/Brush.js";
import {SceneImplHardcoded} from "./core/SceneImplHardcoded.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-28
 */
export class Scenes {

    /** @type Scene */
    static SCENE_EMPTY = new SceneImplHardcoded({
        name: 'Empty',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            // empty
        }
    });

    /** @type Scene */
    static SCENE_LANDSCAPE_1 = new SceneImplHardcoded({
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
                    '2222222222',
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
    });

    static SCENE_LANDSCAPE_2 = new SceneImplHardcoded({
        name: 'Landscape 2',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            sandGame.layeredTemplate()
                .layer([[0, 20], [50, 15], [100, 10], [150, 10], [200, 10], [250, 10], [1250, 10]],
                    true, Brushes.STONE)
                .layer([[0, 30], [25, 31], [50, 27], [100, 15], [150, 0], [200, 5], [220, 15], [300, 35], [330, 37],
                        [370, 50], [400, 45], [500, 40], [1250, 40]],
                    true, Brushes.SOIL, 30)
                .layer([[0, 0], [50, 0], [100, 10], [150, 10], [200, 9], [275, 0], [1250, 0]],
                    true, Brushes.SAND, 5)
                .layer(35, false, Brushes.WATER)
                .layer(36, false, Brush.withIntensity(Brushes.WATER, 0.33))
                .grass()
                .tree(16, 4)
                .tree(28, 6)
                .tree(45, 3)
                .tree(309, 1)
                .tree(336, 5)
                .tree(361, 7);
        }
    });

    /** @type Scene */
    static SCENE_FALLTHROUGH = new SceneImplHardcoded({
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
    });

    /** @type Scene */
    static SCENE_PLATFORM = new SceneImplHardcoded({
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
    });

    static SCENES = {
        empty: Scenes.SCENE_EMPTY,
        landscape_1: Scenes.SCENE_LANDSCAPE_1,
        landscape_2: Scenes.SCENE_LANDSCAPE_2,
        fallthrough: Scenes.SCENE_FALLTHROUGH,
        platform: Scenes.SCENE_PLATFORM
    };
}
