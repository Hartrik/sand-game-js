import {Brushes} from "../def/Brushes";
import {Structures} from "../def/Structures";


/**
 *
 * @author Patrik Harag
 * @version 2023-12-19
 */
export class ActionsTest {

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
            const brush = Brushes.byCodeName(brushes[i]);
            sandGame.graphics().drawRectangle(i * segment, 0, (i + 1) * segment, -1, brush, true);
        }
    }

    static TREE_SPAWN_TEST = function (controller) {
        let sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }

        sandGame.graphics().fill(Brushes.AIR);

        sandGame.layeredTemplate()
                .layer(Math.trunc(sandGame.getHeight() / 2), false, Brushes.AIR)
                .layer(1, true, Brushes.WALL)
                .layer(10, true, Brushes.SOIL)
                .grass();

        sandGame.layeredTemplate()
                .layer(1, true, Brushes.WALL)
                .layer(10, true, Brushes.SOIL)
                .grass();
    }

    static treeGrowTest(level = -1) {
        return function (controller) {
            let sandGame = controller.getSandGame();
            if (sandGame === null) {
                return;
            }

            sandGame.graphics().fill(Brushes.AIR);

            let count = Structures.TREE_TRUNK_TEMPLATES.length;
            let segment = Math.trunc(sandGame.getWidth() / 8);

            const template1 = sandGame.layeredTemplate();
            template1.layer(Math.trunc(sandGame.getHeight() / 2), false, Brushes.AIR);
            template1.layer(1, true, Brushes.WALL);
            template1.layer(10, true, Brushes.SOIL);
            for (let i = 0; i < 8; i++) {
                template1.tree(Math.trunc((i + 0.5) * segment), i % count, level);
            }
            template1.grass();

            const template2 = sandGame.layeredTemplate();
            template2.layer(1, true, Brushes.WALL);
            template2.layer(10, true, Brushes.SOIL);
            for (let i = 0; i < 8; i++) {
                template2.tree(Math.trunc((i + 0.5) * segment), (i + 8) % count, level);
            }
            template2.grass();
        }
    }
}
