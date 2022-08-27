import { SandGame } from "./SandGame.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2022-08-27
 */
export class SandGameComponent {

    // TODO: scaling
    #init = {
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
        let panel = $('<div class="sand-game-component"></div>');
        panel.append(this.#nodeCanvas = $(`<canvas width="${this.#init.canvasWidthPx}px" height="${this.#init.canvasHeightPx}px" class="sand-game-canvas"></canvas>`));
        return panel;
    }

    initialize() {
        let context = this.#nodeCanvas[0].getContext('2d');
        this.#sandGame = new SandGame(context, this.#init.canvasWidthPx, this.#init.canvasHeightPx);

        // mouse handling
        this.#initMouseHandling(this.#sandGame);

        // init game
        this.#sandGame.start();
    }

    #initMouseHandling(sandGame) {
        function getCursorPosition(canvas, event) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0, Math.floor(event.clientX - rect.left));
            const y = Math.max(0, Math.floor(event.clientY - rect.top));
            console.log("x: " + x + " y: " + y)

            sandGame.draw(x, y);
        }

        this.#nodeCanvas[0].addEventListener('mousedown', (e) => {
            getCursorPosition(this.#nodeCanvas[0], e)
        })
    }
}
