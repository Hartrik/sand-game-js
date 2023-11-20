import { Brushes } from "../core/Brushes";
import { Brush } from "../core/Brush";


/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ActionsTest {

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
