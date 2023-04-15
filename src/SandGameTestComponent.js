import {DomBuilder} from "./DomBuilder.js";
import {Brush} from "./core/Brush.js";
import {Brushes} from "./core/Brushes.js";
import {SandGameControls} from "./SandGameControls.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-15
 */
export class SandGameTestComponent {

    /** @type SandGameControls */
    #controls;

    /**
     *
     * @param sandGameControls {SandGameControls}
     */
    constructor(sandGameControls) {
        this.#controls = sandGameControls;
    }

    createNode() {
        let content = DomBuilder.div({ class: 'test-tools' }, [
            DomBuilder.button('Tree spawn test', { class: 'btn btn-secondary' }, e => {
                let sandGame = this.#controls.getSandGame();
                if (sandGame !== null) {
                    this.#doTreeSpawnTest(sandGame);
                }
            }),
            DomBuilder.button('Tree grow test', { class: 'btn btn-secondary' }, e => {
                let sandGame = this.#controls.getSandGame();
                if (sandGame !== null) {
                    this.#doTreeGrowTest(sandGame);
                }
            })
        ]);
        return content;
    }

    #doTreeSpawnTest(sandGame) {
        sandGame.graphics().fill(Brushes.AIR);
        sandGame.graphics().drawRectangle(0, -10, -1, -1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, -11, -1, -11, Brushes.GRASS, true);

        let c = Math.trunc(sandGame.getHeight() / 2);
        sandGame.graphics().drawRectangle(0, c, -1, c, Brushes.WALL, true);
        sandGame.graphics().drawRectangle(0, c-10, -1, c-1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, c-11, -1, c-11, Brushes.GRASS, true);
    }

    #doTreeGrowTest(sandGame) {
        let treeBrush = Brush.withIntensity(Brushes.TREE, 0.05);

        sandGame.graphics().fill(Brushes.AIR);
        sandGame.graphics().drawRectangle(0, -10, -1, -1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, -11, -1, -11, treeBrush, true);

        let c = Math.trunc(sandGame.getHeight() / 2);
        sandGame.graphics().drawRectangle(0, c, -1, c, Brushes.WALL, true);
        sandGame.graphics().drawRectangle(0, c-10, -1, c-1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, c-11, -1, c-11, treeBrush, true);
    }
}
