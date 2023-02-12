import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Brushes} from "./core/Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-12
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
        let content = DomBuilder.div(null, [
            DomBuilder.link('Tree spawn test', { class: 'btn btn-secondary' }, e => {
                let sandGame = this.#controls.getSandGame();
                if (sandGame !== null) {
                    this.#doTreeSpawnTest(sandGame);
                }
            })
        ]);

        return DomBuilder.Bootstrap.cardCollapsable('Test tools', false, content);
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
}
