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
        canvasWidthPx: 700,
        canvasHeightPx: 400,
        brushSize: 5
    };

    #nodeCanvas;
    #nodeTools;
    #nodeOptions;
    #nodeCounter;

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
        this.#nodeOptions = DomBuilder.div({ class: 'sand-game-options' });
        this.#nodeCounter = DomBuilder.span('', { class: 'sand-game-counter' });

        this.#nodeCanvas = DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: this.#countElementWidth() + 'px',
            height: this.#countElementHeight() + 'px'
        });
        this.#nodeCanvas.bind('contextmenu', e => false);

        return DomBuilder.div({ class: 'sand-game-component' }, [
            this.#nodeTools,
            this.#nodeCanvas,
            this.#nodeOptions
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
            this.#nodeCounter.text(this.#sandGame.getFramesPerSecond() + ' frames/s, '
                    + this.#sandGame.getCyclesPerSecond() + ' cycles/s');
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
            this.#createBrushButton('Erase', 'air', Brushes.AIR),
        ]);

        // options
        this.#nodeOptions.append([
            this.#nodeCounter
        ]);
    }

    start() {
        this.#sandGame.start();
    }

    #initMouseHandling(sandGame) {
        const domNode = this.#nodeCanvas[0];

        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * this.#init.scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * this.#init.scale));
            return [x, y];
        }

        let lastX, lastY;
        let brush = null;  // drawing is not active if null
        let ctrlPressed = false;
        let shiftPressed = false;

        domNode.addEventListener('mousedown', (e) => {
            const [x, y] = getActualMousePosition(e);
            lastX = x;
            lastY = y;
            brush = (e.buttons === 1) ? this.#brush : Brushes.AIR;
            ctrlPressed = e.ctrlKey;
            shiftPressed = e.shiftKey;
            if (!ctrlPressed && !shiftPressed) {
                sandGame.drawLine(x, y, x, y, this.#init.brushSize, brush);
            }
        });
        domNode.addEventListener('mousemove', (e) => {
            if (brush === null) {
                return;
            }
            if (!ctrlPressed && !shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                sandGame.drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
                lastX = x;
                lastY = y;
            }
        });
        domNode.addEventListener('mouseup', (e) => {
            if (brush === null) {
                return;
            }
            if (ctrlPressed) {
                const [x, y] = getActualMousePosition(e);
                let minX = Math.min(lastX, x);
                let minY = Math.min(lastY, y);
                let maxX = Math.max(lastX, x);
                let maxY = Math.max(lastY, y);
                sandGame.drawRectangle(minX, minY, maxX, maxY, brush);
            } else if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                sandGame.drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
            }
            brush = null;
        });
        domNode.addEventListener('mouseout', (e) => {
            brush = null;
        });

        // touch support

        let getActualTouchPosition = (e) => {
            let touch = e.touches[0];
            return getActualMousePosition(touch);
        }
        domNode.addEventListener('touchstart', (e) => {
            const [x, y] = getActualTouchPosition(e);
            lastX = x;
            lastY = y;
            brush = this.#brush;
            sandGame.drawLine(x, y, x, y, this.#init.brushSize, brush);

            e.preventDefault();
        });
        domNode.addEventListener('touchmove', (e) => {
            if (brush === null) {
                return;
            }
            const [x, y] = getActualTouchPosition(e);
            sandGame.drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
            lastX = x;
            lastY = y;

            e.preventDefault();
        });
        domNode.addEventListener('touchend', (e) => {
            brush = null;

            e.preventDefault();
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
        this.#sandGame.drawRectangle(150, h-1-170, w-1-150, h-1-150, Brushes.WATER);
    }
}
