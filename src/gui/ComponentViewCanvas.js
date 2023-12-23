import {DomBuilder} from "./DomBuilder";
import {Controller} from "./Controller";
import {CursorDefinitionElementArea} from "../core/CursorDefinitionElementArea";
import {Renderer2D} from "../core/Renderer2D";
import {Analytics} from "../Analytics";
import {Component} from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2023-11-20
 */
export class ComponentViewCanvas extends Component {

    #canvasHolderNode = DomBuilder.div({ class: 'sand-game-canvas-holder' });
    #currentCanvas = null;

    createNode(controller) {
        controller.registerCanvasNodeInitializer(() => {
            this.#canvasHolderNode.innerHTML = '';

            const canvasComponent = new ComponentViewInnerCanvas(controller);
            this.#canvasHolderNode.append(canvasComponent.createNode(controller));
            this.#currentCanvas = canvasComponent;
            return canvasComponent.getCanvasNode();
        });

        controller.registerCanvasNodeProvider(() => {
            if (this.#currentCanvas !== null) {
                return this.#currentCanvas.getCanvasNode();
            }
            return null;
        });

        controller.addOnImageRenderingStyleChanged((imageRenderingStyle) => {
            if (this.#currentCanvas !== null) {
                this.#currentCanvas.setImageRenderingStyle(imageRenderingStyle)
            }
        });

        controller.addOnInitialized((sandGame) => {
            sandGame.addOnRendered((changedChunks) => {
                // show highlighted chunks
                if (controller.isShowActiveChunks()) {
                    this.#currentCanvas.highlightChunks(changedChunks);
                } else {
                    this.#currentCanvas.highlightChunks(null);
                }
            });

            // mouse handling
            this.#currentCanvas.initMouseHandling(sandGame);
        })

        controller.addOnBeforeClosed(() => {
            this.#currentCanvas = null;
            this.#canvasHolderNode.innerHTML = '';
        })

        return this.#canvasHolderNode;
    }
}

/**
 *
 *
 * @author Patrik Harag
 * @version 2023-12-23
 */
class ComponentViewInnerCanvas extends Component {

    /** @type Controller */
    #controller;

    #nodeCanvas;

    /** @type SandGameCanvasDebugOverlayComponent */
    #debugOverlayComponent;
    #nodeDebugOverlay;

    /** @type SandGameCanvasCursorOverlayComponent */
    #cursorOverlayComponent;
    #nodeCursorOverlay;


    /**
     * @param controller {Controller}
     */
    constructor(controller) {
        super();
        this.#controller = controller;

        const w = this.#controller.getCurrentWidthPoints();
        const h = this.#controller.getCurrentHeightPoints();
        const scale = this.#controller.getCurrentScale();
        this.#nodeCanvas = this.#createCanvas(w, h, scale);

        this.#debugOverlayComponent = new SandGameCanvasDebugOverlayComponent(w, h, scale, controller);
        this.#nodeDebugOverlay = this.#debugOverlayComponent.createNode();

        this.#cursorOverlayComponent = new SandGameCanvasCursorOverlayComponent(w, h, scale, controller);
        this.#nodeCursorOverlay = this.#cursorOverlayComponent.createNode();
    }

    #createCanvas(w, h, scale) {
        const wPx = w / scale;
        const hPx = h / scale;
        const canvas = DomBuilder.element('canvas', {
            style: `position: relative; width: ${wPx}px; height: ${hPx}px;`,
            class: 'sand-game-canvas',
            width: w + 'px',
            height: h + 'px'
        });

        // rendering style
        canvas.style.imageRendering = this.#controller.getCanvasImageRenderingStyle();

        return canvas;
    }

    createNode(controller) {
        return DomBuilder.div({
            style: 'position: relative;',
            class: 'sand-game-canvas-component'
        }, [
            this.#nodeCanvas,
            this.#nodeDebugOverlay,
            this.#nodeCursorOverlay
        ]);
    }

    initMouseHandling(sandGame) {
        let domNode = this.#nodeCursorOverlay;
        const scale = this.#controller.getCurrentScale();

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

        let repeatingInterval = null;
        const startRepeatingIfEnabled = (x, y, altKey) => {
            if (lastTool.isRepeatingEnabled()) {
                repeatingInterval = setInterval(() => {
                    lastTool.applyPoint(x, y, sandGame.graphics(), altKey);
                }, 80);
            }
        }
        const cancelRepeatingIfNeeded = () => {
            if (repeatingInterval !== null) {
                clearInterval(repeatingInterval);
                repeatingInterval = null;
            }
        };

        // disable context menu
        this.#nodeCursorOverlay.addEventListener('contextmenu', e => {
            e.preventDefault();
            return false;
        });

        domNode.addEventListener('mousedown', (e) => {
            const [x, y] = getActualMousePosition(e);
            lastX = x;
            lastY = y;
            lastTool = null;
            ctrlPressed = false;
            shiftPressed = false;

            if (e.buttons === 1) {
                // primary button
                lastTool = this.#controller.getToolManager().getPrimaryTool();
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_PRIMARY);
            } else if (e.buttons === 2) {
                // secondary button
                lastTool = this.#controller.getToolManager().getSecondaryTool();
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_SECONDARY);
            } else if (e.buttons === 4) {
                // middle button
                e.preventDefault();

                if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                    const tool = this.#controller.getToolManager().getTertiaryTool();
                    tool.applyPoint(x, y, sandGame.graphics(), false);
                    Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_TERTIARY);
                    Analytics.triggerToolUsed(tool);
                } else if (e.altKey && e.ctrlKey && e.shiftKey) {
                    console.log('' + x + 'x' + y + ': ' + sandGame.debugElementAt(x, y));
                }
                return;
            } else {
                // mouse wheel, other combinations, etc.
                return;
            }

            if (!e.ctrlKey && !e.shiftKey) {
                lastTool.applyPoint(x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerToolUsed(lastTool);

                // repeating when holding mouse down on a position
                startRepeatingIfEnabled(x, y, e.altKey);

            } else if (e.ctrlKey && e.shiftKey) {
                lastTool.applySpecial(x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_FLOOD);
                Analytics.triggerToolUsed(lastTool);
                lastTool = null;
            } else {
                if (e.ctrlKey && lastTool.isSelectionEnabled()) {
                    ctrlPressed = e.ctrlKey;
                }
                if (e.shiftKey && lastTool.isStrokeEnabled()) {
                    shiftPressed = e.shiftKey;
                }
            }
        });
        domNode.addEventListener('mousemove', (e) => {
            // cancel repeating
            cancelRepeatingIfNeeded();

            if (!ctrlPressed && !shiftPressed) {
                // drawing while dragging...

                // show / move cursor
                if (this.#cursorOverlayComponent.hasCursor()) {
                    const [x, y] = getActualMousePosition(e);
                    this.#cursorOverlayComponent.moveCursor(x, y, scale);
                } else {
                    const cursorDefinition = this.#controller.getToolManager().getPrimaryTool().createCursor();
                    if (cursorDefinition !== null) {
                        const [x, y] = getActualMousePosition(e);
                        this.#cursorOverlayComponent.showCursor(x, y, scale, cursorDefinition);
                    }
                }

                if (lastTool === null) {
                    return;
                }

                // drawing
                const [x, y] = getActualMousePosition(e);
                lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerToolUsed(lastTool);
                lastX = x;
                lastY = y;

                // repeating when holding mouse down on a position
                startRepeatingIfEnabled(x, y, e.altKey);

                return;
            }

            if (lastTool === null) {
                return;
            }
            if (ctrlPressed && shiftPressed) {
                return;
            }
            if (ctrlPressed) {
                const [x, y] = getActualMousePosition(e);
                this.#cursorOverlayComponent.repaintRectangleSelection(lastX, lastY, x, y, scale);
                return;
            }
            if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                this.#cursorOverlayComponent.repaintLineSelection(lastX, lastY, x, y, scale);
                return;
            }
        });
        domNode.addEventListener('mouseup', (e) => {
            // cancel repeating
            cancelRepeatingIfNeeded();

            // rectangle or line
            if (lastTool !== null) {
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
                    lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                    Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_LINE);
                    Analytics.triggerToolUsed(lastTool);
                }
                lastTool = null;
                this.#cursorOverlayComponent.hideCursors();
            }
        });
        domNode.addEventListener('mouseout', (e) => {
            // disable drag
            // lastTool = null;

            // cancel repeating
            cancelRepeatingIfNeeded();

            // hide cursors
            this.#cursorOverlayComponent.hideCursors();
        });
        domNode.addEventListener('mouseenter', (e) => {
            if (lastTool !== null && e.buttons === 0) {
                // mouse released outside...
                lastTool = null;
                this.#cursorOverlayComponent.hideCursors();
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
            lastTool = this.#controller.getToolManager().getPrimaryTool();
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
            lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), false);
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

    getCanvasNode() {
        return this.#nodeCanvas;
    }

    setImageRenderingStyle(style) {
        this.#nodeCanvas.style.imageRendering = style;
    }

    highlightChunks(changedChunks) {
        this.#debugOverlayComponent.highlightChunks(changedChunks);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-12-22
 */
class SandGameCanvasCursorOverlayComponent {

    /** @type Controller */
    #controller;

    #nodeOverlay;

    /** @type {{node:any,width:number,height:number}|null} */
    #cursor = null;

    constructor(w, h, scale, controller) {
        const wPx = w / scale;
        const hPx = h / scale;
        this.#nodeOverlay = DomBuilder.div({
            style: {
                position: 'absolute',
                left: '0',
                top: '0',
                width: `${wPx}px`,
                height: `${hPx}px`
            },
            class: 'sand-game-canvas-overlay',
            width: w + 'px',
            height: h + 'px',
        });
        this.#controller = controller;
    }

    createNode() {
        return this.#nodeOverlay;
    }

    hideCursors() {
        this.#nodeOverlay.innerHTML = '';
        this.#cursor = null;
    }

    repaintRectangleSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.innerHTML = '';

        let xPx = Math.min(lastX, x) / scale;
        let yPx = Math.min(lastY, y) / scale;
        let wPx = Math.abs(x - lastX) / scale;
        let hPx = Math.abs(y - lastY) / scale;

        const selection = DomBuilder.div({
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                width: wPx + 'px',
                height: hPx + 'px',
                position: 'absolute',
                outline: 'black 1px solid',
                pointerEvents: 'none'
            }
        });
        this.#nodeOverlay.append(selection);
    }

    repaintLineSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.innerHTML = '';

        const w = this.#controller.getCurrentWidthPoints();
        const h = this.#controller.getCurrentHeightPoints();

        const line = DomBuilder.create(`
            <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
              <line x1="${lastX}" y1="${lastY}" x2="${x}" y2="${y}" stroke="black" />
            </svg>
        `);
        line.style.pointerEvents = 'none';
        this.#nodeOverlay.append(line);
    }

    showCursor(x, y, scale, cursorDefinition) {
        if (cursorDefinition instanceof CursorDefinitionElementArea) {
            const wPx = Math.trunc(cursorDefinition.getWidth() / scale);
            const hPx = Math.trunc(cursorDefinition.getHeight() / scale);

            const node = DomBuilder.element('canvas', {
                width: cursorDefinition.getWidth() + 'px',
                height: cursorDefinition.getHeight() + 'px',
                style: {
                    width: `${wPx}px`,
                    height: `${hPx}px`,
                    outline: 'black 1px solid'
                }
            });

            // render preview
            node.style.imageRendering = 'pixelated';
            Renderer2D.renderPreview(cursorDefinition.getElementArea(), node.getContext('2d'), 0xBB);

            this.#cursor = {
                width: wPx,
                height: hPx,
                node: node
            };
        } else {
            return;
        }

        this.#cursor.node.style.position = 'absolute';
        this.#cursor.node.style.pointerEvents = 'none';

        this.moveCursor(x, y, scale);
    }

    hasCursor() {
        return this.#cursor !== null;
    }

    moveCursor(x, y, scale) {
        const cursor = this.#cursor;

        const pxW = this.#controller.getCurrentWidthPoints() / scale;
        const pxH = this.#controller.getCurrentHeightPoints() / scale;

        const pxTop = y / scale - Math.trunc(cursor.height / 2);
        const pxLeft = x / scale - Math.trunc(cursor.width / 2);

        const UNSET = -1;  // expect border
        const pxClipTop = pxTop < 0 ? -pxTop : UNSET;
        const pxClipRight = pxLeft + cursor.width >= pxW ? pxLeft + cursor.width - pxW : UNSET;
        const pxClipBottom = pxTop + cursor.height >= pxH ? pxTop + cursor.height - pxH : UNSET;
        const pxClipLeft = pxLeft < 0 ? -pxLeft : UNSET;

        cursor.node.style.top = pxTop + 'px';
        cursor.node.style.left = pxLeft + 'px';
        cursor.node.style.clipPath = `inset(${pxClipTop}px ${pxClipRight}px ${pxClipBottom}px ${pxClipLeft}px)`;

        this.#nodeOverlay.innerHTML = '';
        this.#nodeOverlay.append(cursor.node);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-12-22
 */
class SandGameCanvasDebugOverlayComponent {

    /** @type Controller */
    #controller;

    #nodeOverlay;

    #nodeLabel = null;
    #nodeRectangles = null;

    #w;
    #h;
    #scale;

    constructor(w, h, scale, controller) {
        this.#w = w;
        this.#h = h;
        this.#scale = scale;
        const wPx = w / scale;
        const hPx = h / scale;
        this.#nodeOverlay = DomBuilder.div({
            style: {
                position: 'absolute',
                left: '0',
                top: '0',
                width: `${wPx}px`,
                height: `${hPx}px`
            },
            class: 'sand-game-canvas-overlay',
            width: w + 'px',
            height: h + 'px',
        });
        this.#controller = controller;
    }

    /**
     *
     * @param changedChunks {boolean[]}
     */
    highlightChunks(changedChunks) {
        if (changedChunks === null) {
            if (this.#nodeRectangles !== null) {
                // hide
                this.#nodeOverlay.style.display = 'none';
            }
            return;
        }

        if (this.#nodeRectangles === null) {
            this.#init();
        }
        this.#nodeOverlay.style.display = 'unset';
        this.#update(changedChunks);
    }

    #update(changedChunks) {
        const sandGame = this.#controller.getSandGame();
        const chunkSize = sandGame.getChunkSize();
        const horChunkCount = Math.ceil(sandGame.getWidth() / chunkSize);
        const verChunkCount = Math.ceil(sandGame.getHeight() / chunkSize);

        let highlighted = 0;
        for (let cy = 0; cy < verChunkCount; cy++) {
            for (let cx = 0; cx < horChunkCount; cx++) {
                const chunkIndex = cy * horChunkCount + cx;
                const rect = this.#nodeRectangles[chunkIndex];
                if (changedChunks[chunkIndex]) {
                    highlighted++;
                    rect.style.display = 'unset';
                } else {
                    rect.style.display = 'none';
                }
            }
        }

        // show stats
        const total = horChunkCount * verChunkCount;
        const highlightedPercent = Math.trunc(highlighted / total * 100);
        this.#nodeLabel.textContent = `${highlighted}/${total} (${highlightedPercent}%)`;
    }

    #init() {
        const sandGame = this.#controller.getSandGame();
        const chunkSize = sandGame.getChunkSize();
        const horChunkCount = Math.ceil(sandGame.getWidth() / chunkSize);
        const verChunkCount = Math.ceil(sandGame.getHeight() / chunkSize);

        const rects = Array(verChunkCount * horChunkCount);
        for (let cy = 0; cy < verChunkCount; cy++) {
            for (let cx = 0; cx < horChunkCount; cx++) {
                const chunkIndex = cy * horChunkCount + cx;
                rects[chunkIndex] = this.#createRectangle(cx, cy, chunkSize);
            }
        }

        this.#nodeRectangles = rects;
        this.#nodeOverlay.append(...rects);

        this.#nodeLabel = this.#createLabel(0, 0);
        this.#nodeOverlay.append(this.#nodeLabel);
    }

    #createLabel(x, y) {
        const xPx = x / this.#scale;
        const yPx = y / this.#scale;
        return DomBuilder.span('', {
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                position: 'absolute',
                color: 'rgb(0, 255, 0)'
            }
        });
    }

    #createRectangle(cx, cy, chunkSize) {
        const wPx = this.#w / this.#scale;
        const hPx = this.#h / this.#scale;
        const xPx = cx * chunkSize / this.#scale;
        const yPx = cy * chunkSize / this.#scale;
        const cwPx = chunkSize / this.#scale;
        const chPx = chunkSize / this.#scale;

        const rectangle = DomBuilder.div({
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                width: cwPx + 'px',
                height: chPx + 'px',
                position: 'absolute',
                outline: 'rgb(0, 255, 0) 1px solid'
            }
        });

        if (xPx + cwPx >= wPx || yPx + chPx >= hPx) {
            // clip

            const UNSET = -1;  // expect border
            const pxClipTop = UNSET;
            const pxClipRight = xPx + cwPx >= wPx ? xPx + cwPx - wPx : UNSET;
            const pxClipBottom = yPx + chunkSize >= hPx ? yPx + chPx - hPx : UNSET;
            const pxClipLeft = UNSET;

            rectangle.style.clipPath = `inset(${pxClipTop}px ${pxClipRight}px ${pxClipBottom}px ${pxClipLeft}px)`;
        }

        return rectangle;
    }

    createNode() {
        return this.#nodeOverlay;
    }
}
