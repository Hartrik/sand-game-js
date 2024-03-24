// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import BrushDefs from "../../def/BrushDefs";
import StructureDefs from "../../def/StructureDefs";


/**
 *
 * @author Patrik Harag
 * @version 2023-12-19
 */
export default class ActionsTest {

    static ALL_MATERIALS = function (controller) {
        let sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }

        const brushes = [
            'ash',
            'sand',
            'soil',
            'gravel',
            'wall',
            'rock',
            'metal',
            'wood',
            'water'
        ];

        let segment = Math.ceil(sandGame.getWidth() / brushes.length);
        for (let i = 0; i < brushes.length; i++) {
            const brush = BrushDefs.byCodeName(brushes[i]);
            sandGame.graphics().drawRectangle(i * segment, 0, (i + 1) * segment, -1, brush, true);
        }
    }

    static TREE_SPAWN_TEST = function (controller) {
        let sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }

        sandGame.graphics().fill(BrushDefs.AIR);

        sandGame.layeredTemplate()
                .layer(Math.trunc(sandGame.getHeight() / 2), false, BrushDefs.AIR)
                .layer(1, true, BrushDefs.WALL)
                .layer(10, true, BrushDefs.SOIL)
                .grass();

        sandGame.layeredTemplate()
                .layer(1, true, BrushDefs.WALL)
                .layer(10, true, BrushDefs.SOIL)
                .grass();
    }

    static treeGrowTest(level = -1) {
        return function (controller) {
            let sandGame = controller.getSandGame();
            if (sandGame === null) {
                return;
            }

            sandGame.graphics().fill(BrushDefs.AIR);

            let count = StructureDefs.TREE_TRUNK_TEMPLATES.length;
            let segment = Math.trunc(sandGame.getWidth() / 8);

            const template1 = sandGame.layeredTemplate();
            template1.layer(Math.trunc(sandGame.getHeight() / 2), false, BrushDefs.AIR);
            template1.layer(1, true, BrushDefs.WALL);
            template1.layer(10, true, BrushDefs.SOIL);
            for (let i = 0; i < 8; i++) {
                template1.tree(Math.trunc((i + 0.5) * segment), i % count, level);
            }
            template1.grass();

            const template2 = sandGame.layeredTemplate();
            template2.layer(1, true, BrushDefs.WALL);
            template2.layer(10, true, BrushDefs.SOIL);
            for (let i = 0; i < 8; i++) {
                template2.tree(Math.trunc((i + 0.5) * segment), (i + 8) % count, level);
            }
            template2.grass();
        }
    }
}
