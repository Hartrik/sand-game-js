import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Analytics} from "./Analytics.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-28
 */
export class SandGameCanvasComponent {

    /** @type SandGameControls */
    #controls;

    #nodeCanvas;
    #nodeOverlay;

    #context;

    /**
     * @param sandGameControls {SandGameControls}
     */
    constructor(sandGameControls) {
        this.#controls = sandGameControls;

        const w = this.#controls.getCurrentWidthPoints();
        const h = this.#controls.getCurrentHeightPoints();
        const scale = this.#controls.getCurrentScale();
        this.#nodeCanvas = this.#createCanvas(w, h, scale);
        this.#nodeOverlay = this.#createOverlay(w, h, scale);
    }

    #createCanvas(w, h, scale) {
        const canvas = DomBuilder.element('canvas', {
            style: 'position: relative;',
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

    #createOverlay(w, h, scale) {
        const overlay = DomBuilder.div({
            style: 'position: absolute; left: 0; top: 0;',
            class: 'sand-game-canvas-overlay',
            width: w + 'px',
            height: h + 'px'
        });

        // scale up
        overlay.width(w / scale);
        overlay.height(h / scale);

        return overlay;
    }

    createNode() {
        return DomBuilder.div({
            style: 'position: relative;',
            class: 'sand-game-canvas-component'
        }, [
            this.#nodeCanvas,
            this.#nodeOverlay
        ]);
    }

    initMouseHandling(sandGame) {
        let domNode = this.#nodeOverlay[0];
        const scale = this.#controls.getCurrentScale();

        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * scale));
            return [x, y];
        }

        let lastX, lastY;
        let lastTool = null;  // drawing is not active if null
        let ctrlPressed = false;
        let shiftPressed = false;

        this.#nodeOverlay.bind('contextmenu', e => false);
        domNode.addEventListener('mousedown', (e) => {
            const [x, y] = getActualMousePosition(e);
            lastX = x;
            lastY = y;
            lastTool = null;

            if (e.buttons === 4) {
                // middle button
                e.preventDefault();

                if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                    const tool = this.#controls.getTertiaryTool();
                    tool.applyPoint(x, y, sandGame.graphics(), false);
                    Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_TERTIARY);
                    Analytics.triggerToolUsed(tool);
                } else if (e.altKey && e.ctrlKey && e.shiftKey) {
                    console.log('' + x + 'x' + y + ': ' + sandGame.debugElementAt(x, y));
                }
                return;
            }

            if (e.buttons === 1) {
                lastTool = this.#controls.getPrimaryTool();
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_PRIMARY);
            } else {
                lastTool = this.#controls.getSecondaryTool();
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_SECONDARY);
            }

            if (e.ctrlKey && e.shiftKey) {
                lastTool.applyAround(x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_FLOOD);
                Analytics.triggerToolUsed(lastTool);
                lastTool = null;
                return;
            }

            ctrlPressed = e.ctrlKey;
            shiftPressed = e.shiftKey;
            if (!ctrlPressed && !shiftPressed) {
                lastTool.applyPoint(x, y, sandGame.graphics(), e.altKey)
                Analytics.triggerToolUsed(lastTool);
            }
        });
        domNode.addEventListener('mousemove', (e) => {
            if (lastTool === null) {
                return;
            }
            if (!ctrlPressed && !shiftPressed) {
                // drawing
                const [x, y] = getActualMousePosition(e);
                lastTool.applyDrag(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerToolUsed(lastTool);
                lastX = x;
                lastY = y;
                return;
            }
            if (ctrlPressed && shiftPressed) {
                return;
            }
            if (ctrlPressed) {
                const [x, y] = getActualMousePosition(e);
                this.#repaintRectangleSelection(lastX, lastY, x, y, scale);
                return;
            }
            if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                this.#repaintLineSelection(lastX, lastY, x, y, scale);
                return;
            }
        });
        domNode.addEventListener('mouseup', (e) => {
            if (lastTool === null) {
                return;
            }
            if (ctrlPressed) {
                const [x, y] = getActualMousePosition(e);
                let minX = Math.min(lastX, x);
                let minY = Math.min(lastY, y);
                let maxX = Math.max(lastX, x);
                let maxY = Math.max(lastY, y);
                lastTool.applyArea(minX, minY, maxX, maxY, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_RECT);
                Analytics.triggerToolUsed(lastTool);
            } else if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                lastTool.applyDrag(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_LINE);
                Analytics.triggerToolUsed(lastTool);
            }
            lastTool = null;
            this.#cleanSelection();
        });
        domNode.addEventListener('mouseout', (e) => {
            // nothing
        });
        domNode.addEventListener('mouseenter', (e) => {
            if (lastTool !== null && e.buttons === 0) {
                // mouse released outside...
                lastTool = null;
                this.#cleanSelection();
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
            lastTool = this.#controls.getPrimaryTool();
            lastTool.applyPoint(x, y, sandGame.graphics(), false);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_PRIMARY);
            Analytics.triggerToolUsed(lastTool);

            e.preventDefault();
        });
        domNode.addEventListener('touchmove', (e) => {
            if (lastTool === null) {
                return;
            }
            const [x, y] = getActualTouchPosition(e);
            lastTool.applyDrag(lastX, lastY, x, y, sandGame.graphics(), false);
            Analytics.triggerToolUsed(lastTool);
            lastX = x;
            lastY = y;

            e.preventDefault();
        });
        domNode.addEventListener('touchend', (e) => {
            lastTool = null;

            e.preventDefault();
        });
    }

    #cleanSelection() {
        this.#nodeOverlay.empty();
    }

    #repaintRectangleSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.empty();

        let xPx = Math.min(lastX, x) / scale;
        let yPx = Math.min(lastY, y) / scale;
        let wPx = Math.abs(x - lastX) / scale;
        let hPx = Math.abs(y - lastY) / scale;

        this.#nodeOverlay.append(DomBuilder.div({
            style: `position: absolute; left: ${xPx}px; top: ${yPx}px; width: ${wPx}px; height: ${hPx}px; outline: black 1px solid;`,
        }));
    }

    #repaintLineSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.empty();

        const w = this.#controls.getCurrentWidthPoints();
        const h = this.#controls.getCurrentHeightPoints();

        this.#nodeOverlay.append(DomBuilder.create(`
            <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
              <line x1="${lastX}" y1="${lastY}" x2="${x}" y2="${y}" stroke="black" />
            </svg>`
        ));
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
