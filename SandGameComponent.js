import { DomBuilder } from "./DomBuilder.js";
import { SandGame } from "./SandGame.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2022-08-28
 */
export class SandGameComponent {

    #init = {
        scale: 0.25,
        canvasWidthPx: 600,
        canvasHeightPx: 400,
    };

    #nodeCanvas;

    /** @type SandGame */
    #sandGame;

    constructor(init) {
        if (init) {
            this.#init = init;
        }
    }

    createNode() {
        let width = this.#init.canvasWidthPx * this.#init.scale;
        let height = this.#init.canvasHeightPx * this.#init.scale;

        this.#nodeCanvas = DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: width + 'px',
            height: height + 'px'
        });

        return DomBuilder.div({ class: 'sand-game-component' }, [
            this.#nodeCanvas
        ]);
    }

    initialize() {
        // scale up
        this.#nodeCanvas.width(this.#init.canvasWidthPx);
        this.#nodeCanvas.height(this.#init.canvasHeightPx);

        // init game
        let context = this.#nodeCanvas[0].getContext('2d');
        let width = this.#init.canvasWidthPx * this.#init.scale;
        let height = this.#init.canvasHeightPx * this.#init.scale;
        this.#sandGame = new SandGame(context, width, height);

        // mouse handling
        this.#initMouseHandling(this.#sandGame);

        // start game
        this.#sandGame.start();
    }

    #initMouseHandling(sandGame) {
        this.#nodeCanvas[0].addEventListener('mousedown', (e) => {
            const rect = this.#nodeCanvas[0].getBoundingClientRect();
            const x = Math.max(0, Math.floor((e.clientX - rect.left) * this.#init.scale));
            const y = Math.max(0, Math.floor((e.clientY - rect.top) * this.#init.scale));
            console.log("x: " + x + " y: " + y)

            sandGame.draw(x, y);
        })
    }
}
