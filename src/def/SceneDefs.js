// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Brushes from "../core/brush/Brushes";
import BrushDefs from "./BrushDefs.js";
import SceneImplHardcoded from "../core/scene/SceneImplHardcoded.js";
import Resources from "../io/Resources";
import TemplateDefs from "./TemplateDefs";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-08
 */
export default class SceneDefs {

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
        apply: async function (sandGame) {
            sandGame.setBoxedMode();
            const m = 40;
            let layeredPainter = sandGame.layeredTemplate()
                .layerSpline([[0, 35], [60, 35], [40 + m, 40], [60 + m, 50], [80 + m, 40], [200 + m, 20], [400 + m, 20], [1000 + m, 20]],
                    true, Brushes.concat(BrushDefs.SOIL, BrushDefs.EFFECT_NOISE_LG))
                .layerSpline([[0, 0], [90 + m, 0], [110 + m, 10], [150 + m, 10], [250 + m, 0]],
                        true, BrushDefs.SAND, 2)
                .tool(30, 17, await Resources.parseToolDefinition(TemplateDefs.CABIN))
                .tool(120 + m, 5, await Resources.parseToolDefinition(TemplateDefs.SAND_CASTLE))
                .tree(60 + m, 1, 200)
                .tree(30 + m, 5)
                .grass(20 + m, 40 + m)
                .grass(50 + m, 70 + m);

            if (sandGame.getWidth() / sandGame.getHeight() > 1.5) {
                // wide screens only
                sandGame.blockTemplate()
                    .withMaxHeight(120)
                    .withBlueprint([
                        '          ',
                        '        ww',
                        '          ',
                        '       1  ',
                        '     111111',
                        '          ',
                        '          ',
                        '          ',
                        '          ',
                    ])
                    .withBrushes({
                        w: Brushes.withIntensity(0.5, BrushDefs.WATER),
                        1: BrushDefs.SAND
                    })
                    .paint();
            } else {
                layeredPainter
                    .layer(26, false, BrushDefs.WATER)
                    .layer(27, false, Brushes.withIntensity(0.33, BrushDefs.WATER));
            }
        }
    });

    static SCENE_LANDSCAPE_2 = new SceneImplHardcoded({
        name: 'Landscape 2',
        description: 'Boxed mode',
        apply: function (sandGame) {
            sandGame.setBoxedMode();
            sandGame.layeredTemplate()
                .layerSpline([[0, 20], [50, 15], [100, 10], [150, 10], [200, 10], [250, 10], [1250, 10]],
                    true, Brushes.concat(BrushDefs.GRAVEL, BrushDefs.EFFECT_NOISE_LG))
                .layerSpline([[0, 30], [25, 31], [50, 27], [100, 15], [150, 0], [200, 5], [220, 15], [300, 35], [330, 37],
                        [370, 50], [400, 45], [500, 40], [1250, 40]],
                    true, Brushes.concat(BrushDefs.SOIL, BrushDefs.EFFECT_NOISE_LG), 30)
                .layerSpline([[0, 0], [50, 0], [100, 10], [150, 10], [200, 9], [275, 0], [1250, 0]],
                    true, BrushDefs.SAND, 5)
                .layer(35, false, BrushDefs.WATER)
                .layer(36, false, Brushes.withIntensity(0.33, BrushDefs.WATER))
                .fish(150, -8)
                .grass()
                .tree(16, 6)
                .tree(28, 3, 70)
                .tree(45, 5)
                .tree(309, 1)
                .tree(336, 4)
                .tree(361, 0);
        }
    });

    /** @type Scene */
    static SCENE_FALLTHROUGH = new SceneImplHardcoded({
        name: 'Fall-through',
        description: 'Fall-through mode',
        apply: function (sandGame) {
            sandGame.setFallThroughMode();
            const graphics = sandGame.graphics();
            const xo = Math.trunc((sandGame.getWidth() - 150) / 2 - 15);
            const yo = Math.trunc((sandGame.getHeight() - 150) / 2);
            graphics.drawRectangle(40 + xo, 20 + yo, 60 + xo, 40 + yo, BrushDefs.WATER);
            graphics.drawLine(30 + xo, 30 + yo, 30 + xo, 50 + yo, 5, BrushDefs.WALL, true);
            graphics.drawLine(30 + xo, 50 + yo, 70 + xo, 80 + yo, 5, BrushDefs.WALL, true);
            graphics.drawLine(65 + xo, 90 + yo, 100 + xo, 100 + yo, 5, BrushDefs.WALL, true);
            graphics.drawLine(55 + xo, 140 + yo, 125 + xo, 140 + yo, 10, BrushDefs.WALL, false);
            graphics.drawLine(55 + xo, 130 + yo, 55 + xo, 140 + yo, 10, BrushDefs.WALL, false);
            graphics.drawLine(70 + xo, 125 + yo, 90 + xo, 125 + yo, 10, BrushDefs.SAND, false);
            graphics.draw(120 + xo, 130 + yo, BrushDefs.SAND);
            graphics.drawLine(150 + xo, 10 + yo, 80 + xo, 35 + yo, 5, BrushDefs.WALL, true);
            graphics.drawLine(80 + xo, 35 + yo, 80 + xo, 15 + yo, 5, BrushDefs.WALL, true);
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
                    w: BrushDefs.SAND,
                    s: BrushDefs.WALL
                })
                .paint();
        }
    });

    static SCENES = {
        empty: SceneDefs.SCENE_EMPTY,
        landscape_1: SceneDefs.SCENE_LANDSCAPE_1,
        landscape_2: SceneDefs.SCENE_LANDSCAPE_2,
        fallthrough: SceneDefs.SCENE_FALLTHROUGH,
        platform: SceneDefs.SCENE_PLATFORM
    };
}
