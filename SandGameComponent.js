import { DomBuilder } from "./DomBuilder.js";
import { SandGame, Brushes } from "./SandGame.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2022-09-07
 */
export class SandGameComponent {

    #init = {
        scale: 0.5,
        canvasWidthPx: 600,
        canvasHeightPx: 400,
        brushSize: 5
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

    #countElementWidth() {
        return Math.trunc(this.#init.canvasWidthPx * this.#init.scale);
    }

    #countElementHeight() {
        return Math.trunc(this.#init.canvasHeightPx * this.#init.scale);
    }

    createNode() {
        this.#nodeTools = DomBuilder.div({ class: 'sand-game-toolbar' });
        this.#nodeFPS = DomBuilder.span('', { class: 'sand-game-fps-counter' });

        this.#nodeCanvas = DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: this.#countElementWidth() + 'px',
            height: this.#countElementHeight() + 'px'
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
        let context = this.#nodeCanvas[0].getContext('2d');
        let width = this.#countElementWidth();
        let height = this.#countElementHeight();
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
    }

    start() {
        this.#sandGame.start();
    }

    #initMouseHandling(sandGame) {
        const domNode = this.#nodeCanvas[0];

        let getActualPosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * this.#init.scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * this.#init.scale));
            return [x, y];
        }

        let lastX, lastY;
        let brush = null;

        domNode.addEventListener('mousedown', (e) => {
            const [x, y] = getActualPosition(e);
            lastX = x;
            lastY = y;
            brush = (e.buttons === 1) ? this.#brush : Brushes.AIR;
            sandGame.drawLine(x, y, x, y, this.#init.brushSize, brush);
        });
        domNode.addEventListener('mousemove', (e) => {
            if (brush === null) {
                return;
            }
            const [x, y] = getActualPosition(e);
            sandGame.drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
            lastX = x;
            lastY = y;
        });
        domNode.addEventListener('mouseup', (e) => {
            brush = null;
        });
        domNode.addEventListener('mouseout', (e) => {
            brush = null;
        });
    }

    #createBrushButton(name, cssName, brush) {
        return DomBuilder.link(name, {
            href: '#',
            class: 'badge badge-secondary ' + cssName
        }, () => this.#brush = brush)
    }

    drawExample() {
        let w = this.#countElementWidth();
        let h = this.#countElementHeight();

        // gravel bottom
        this.#sandGame.drawRectangle(0, h-1-20, w-1, h-1-10, Brushes.STONE);

        // left side
        this.#sandGame.drawRectangle(0, h-1-40, 120, h-1-20, Brushes.SOIL);
        this.#sandGame.drawRectangle(0, h-1-60, 80, h-1-40, Brushes.SOIL);

        // right side
        this.#sandGame.drawRectangle(w-1-120, h-1-34, w-1-10, h-1-20, Brushes.SOIL);
        this.#sandGame.drawRectangle(w-1-60, h-1-70, w-1, h-1-40, Brushes.SOIL);

        // sand
        this.#sandGame.drawRectangle(80, h-1-150, w-1-70, h-1-140, Brushes.SAND);

        // water
        this.#sandGame.drawRectangle(w-1-150, h-1-170, w-1-100, h-1-150, Brushes.WATER);
    }
}
