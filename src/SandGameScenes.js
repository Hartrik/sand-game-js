import {Brushes} from "./core/Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-10-02
 */
export class SandGameScenes {

    static SCENES = {
        empty: {
            name: 'Empty',
            description: 'Boxed mode',
            apply: function (sandGame) {
                sandGame.setBoxedMode();
                // empty
            }
        },
        landscape: {
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
        },
        fallthrough: {
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
        },
        platform: {
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
        }
    };
}

