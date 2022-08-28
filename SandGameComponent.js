import { DomBuilder } from "./DomBuilder.js";
import { SandGame, Brushes } from "./SandGame.js";

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
    #nodeTools;
    #nodeFPS;

    /** @type SandGame */
    #sandGame;

    #brush = Brushes.SAND;

    constructor(init) {
        if (init) {
            this.#init = init;
        }
    }

    createNode() {
        this.#nodeTools = DomBuilder.div({ class: 'sand-game-toolbar' });
        this.#nodeFPS = DomBuilder.span('', { class: 'sand-game-fps-counter' });

        let width = this.#init.canvasWidthPx * this.#init.scale;
        let height = this.#init.canvasHeightPx * this.#init.scale;
        this.#nodeCanvas = DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: width + 'px',
            height: height + 'px'
        });
        this.#nodeCanvas.bind('contextmenu', e => false);

        return DomBuilder.div({ class: 'sand-game-component' }, [
            this.#nodeTools,
            this.#nodeCanvas
        ]);
    }

    initialize() {
        // scale up
        this.#nodeCanvas.width(this.#init.canvasWidthPx);
        this.#nodeCanvas.height(this.#init.canvasHeightPx);

        // init game
        let context = this.#nodeCanvas[0].getContext('2d');  // TODO: what about 'bitmaprenderer'
        let width = this.#init.canvasWidthPx * this.#init.scale;
        let height = this.#init.canvasHeightPx * this.#init.scale;
        let defaultElement = Brushes.AIR.apply(0, 0);
        this.#sandGame = new SandGame(context, width, height, defaultElement);
        this.#sandGame.addOnRendered(() => {
            this.#nodeFPS.text(this.#sandGame.getFPS() + ' FPS');
        });

        // mouse handling
        this.#initMouseHandling(this.#sandGame);

        // tools
        this.#nodeTools.append([
            this.#createBrushButton('Sand', 'sand', Brushes.SAND),
            this.#createBrushButton('Soil', 'soil', Brushes.SOIL),
            this.#createBrushButton('Gravel', 'gravel', Brushes.STONE),
            this.#createBrushButton('Wall', 'wall', Brushes.WALL),
            this.#createBrushButton('Water', 'water', Brushes.WATER),
            this.#nodeFPS
        ]);

        // start game
        this.#sandGame.start();
    }

    #initMouseHandling(sandGame) {
        this.#nodeCanvas[0].addEventListener('mousedown', (e) => {
            const rect = this.#nodeCanvas[0].getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * this.#init.scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * this.#init.scale));

            if (e.buttons === 1) {
                sandGame.draw(x, y, this.#brush);
            } else if (e.buttons === 2) {
                sandGame.draw(x, y, Brushes.AIR);
            }
        })
    }

    #createBrushButton(name, cssName, brush) {
        return DomBuilder.link(name, {
            href: '#',
            class: 'badge badge-secondary ' + cssName
        }, () => this.#brush = brush)
    }
}
