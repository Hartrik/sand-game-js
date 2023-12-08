import { Brushes } from "../def/Brushes";
import { Brush } from "../core/Brush";


/**
 *
 * @author Patrik Harag
 * @version 2023-12-05
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

        const segment = sandGame.getWidth() / brushes.length;
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
        sandGame.graphics().drawRectangle(0, -10, -1, -1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, -11, -1, -11, Brushes.GRASS, true);

        let c = Math.trunc(sandGame.getHeight() / 2);
        sandGame.graphics().drawRectangle(0, c, -1, c, Brushes.WALL, true);
        sandGame.graphics().drawRectangle(0, c-10, -1, c-1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, c-11, -1, c-11, Brushes.GRASS, true);
    }

    static TREE_GROW_TEST = function (controller) {
        let sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }

        let treeBrush = Brush.withIntensity(0.05, Brushes.TREE);

        sandGame.graphics().fill(Brushes.AIR);
        sandGame.graphics().drawRectangle(0, -10, -1, -1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, -11, -1, -11, treeBrush, true);

        let c = Math.trunc(sandGame.getHeight() / 2);
        sandGame.graphics().drawRectangle(0, c, -1, c, Brushes.WALL, true);
        sandGame.graphics().drawRectangle(0, c-10, -1, c-1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, c-11, -1, c-11, treeBrush, true);
    }
}
