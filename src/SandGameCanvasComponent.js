import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Brush} from "./core/Brush.js";
import {Brushes} from "./core/Brushes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-20
 */
export class SandGameCanvasComponent {

    /** @type SandGameControls */
    #controls;

    #nodeCanvas;

    #context;

    /**
     * @param sandGameControls {SandGameControls}
     */
    constructor(sandGameControls) {
        this.#controls = sandGameControls;
        this.#nodeCanvas = this.#createCanvas();
    }

    #createCanvas() {
        const w = this.#controls.getCurrentWidthPoints();
        const h = this.#controls.getCurrentHeightPoints();
        const scale = this.#controls.getCurrentScale();

        let canvas = DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: w + 'px',
            height: h + 'px'
        });

        // scale up
        canvas.width(w / scale);
        canvas.height(h / scale);

        // rendering style
        let domCanvasNode = canvas[0];
        domCanvasNode.style.imageRendering = this.#controls.getCanvasImageRenderingStyle();

        return canvas;
    }

    createNode() {
        return this.#nodeCanvas;
    }

    initMouseHandling(sandGame) {
        let domNode = this.#nodeCanvas[0];
        const scale = this.#controls.getCurrentScale();

        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * scale));
            return [x, y];
        }

        let lastX, lastY;
        let brush = null;  // drawing is not active if null
        let ctrlPressed = false;
        let shiftPressed = false;

        this.#nodeCanvas.bind('contextmenu', e => false);
        domNode.addEventListener('mousedown', (e) => {
            const [x, y] = getActualMousePosition(e);
            lastX = x;
            lastY = y;

            if (e.buttons === 4) {
                // middle button
                e.preventDefault();

                if (e.altKey) {
                    console.log('' + x + 'x' + y + ': ' + sandGame.debugElementAt(x, y));
                } else {
                    sandGame.graphics().floodFill(x, y, this.#controls.getBrush(), 1);
                }
                brush = null;
                return;
            }

            brush = (e.buttons === 1) ? this.#controls.getBrush() : Brushes.AIR;
            ctrlPressed = e.ctrlKey;
            shiftPressed = e.shiftKey;
            if (!ctrlPressed && !shiftPressed) {
                const actualBrush = e.altKey ? Brush.gentle(brush) : brush;
                sandGame.graphics().drawLine(x, y, x, y, this.#controls.getBrushSize(), actualBrush);
            }
        });
        domNode.addEventListener('mousemove', (e) => {
            if (brush === null) {
                return;
            }
            if (!ctrlPressed && !shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                const actualBrush = e.altKey ? Brush.gentle(brush) : brush;
                sandGame.graphics().drawLine(lastX, lastY, x, y, this.#controls.getBrushSize(), actualBrush);
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
                const actualBrush = e.altKey ? Brush.gentle(brush) : brush;
                sandGame.graphics().drawRectangle(minX, minY, maxX, maxY, actualBrush);
            } else if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                const actualBrush = e.altKey ? Brush.gentle(brush) : brush;
                sandGame.graphics().drawLine(lastX, lastY, x, y, this.#controls.getBrushSize(), actualBrush);
            }
            brush = null;
        });
        domNode.addEventListener('mouseout', (e) => {
            // nothing
        });
        domNode.addEventListener('mouseenter', (e) => {
            if (brush !== null && e.buttons === 0) {
                // mouse released outside...
                brush = null;
                e.preventDefault();
            }
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
            brush = this.#controls.getBrush();
            sandGame.graphics().drawLine(x, y, x, y, this.#controls.getBrushSize(), brush);

            e.preventDefault();
        });
        domNode.addEventListener('touchmove', (e) => {
            if (brush === null) {
                return;
            }
            const [x, y] = getActualTouchPosition(e);
            sandGame.graphics().drawLine(lastX, lastY, x, y, this.#controls.getBrushSize(), brush);
            lastX = x;
            lastY = y;

            e.preventDefault();
        });
        domNode.addEventListener('touchend', (e) => {
            brush = null;

            e.preventDefault();
        });
    }

    getContext() {
        let domCanvasNode = this.#nodeCanvas[0];
        this.#context = domCanvasNode.getContext('2d');
        return this.#context;
    }

    setImageRenderingStyle(style) {
        let domCanvasNode = this.#nodeCanvas[0];
        domCanvasNode.style.imageRendering = style;
    }

    close() {
        // TODO
    }
}
