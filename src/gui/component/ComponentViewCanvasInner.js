import {Component} from "./Component";
import {ComponentViewCanvasOverlayDebug} from "./ComponentViewCanvasOverlayDebug";
import {ComponentViewCanvasOverlayMarker} from "./ComponentViewCanvasOverlayMarker";
import {ComponentViewCanvasOverlayCursor} from "./ComponentViewCanvasOverlayCursor";
import {ComponentViewCanvasOverlayScenario} from "./ComponentViewCanvasOverlayScenario";
import {DomBuilder} from "../DomBuilder";
import {Analytics} from "../../Analytics";

/**
 *
 *
 * @author Patrik Harag
 * @version 2024-01-15
 */
export class ComponentViewCanvasInner extends Component {

    /** @type Controller */
    #controller;

    #nodeCanvas;

    /** @type ComponentViewCanvasOverlayDebug */
    #debugOverlayComponent;
    #nodeDebugOverlay;

    /** @type ComponentViewCanvasOverlayMarker */
    #markerOverlayComponent;
    #nodeMarkerOverlay;

    /** @type ComponentViewCanvasOverlayCursor */
    #cursorOverlayComponent;
    #nodeCursorOverlay;

    /** @type ComponentViewCanvasOverlayScenario */
    #scenarioOverlayComponent;
    #nodeScenarioOverlay;

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

        this.#debugOverlayComponent = new ComponentViewCanvasOverlayDebug(w, h, scale, controller);
        this.#nodeDebugOverlay = this.#debugOverlayComponent.createNode();

        this.#markerOverlayComponent = new ComponentViewCanvasOverlayMarker(w, h, scale, controller);
        this.#nodeMarkerOverlay = this.#markerOverlayComponent.createNode();

        this.#cursorOverlayComponent = new ComponentViewCanvasOverlayCursor(w, h, scale, controller);
        this.#nodeCursorOverlay = this.#cursorOverlayComponent.createNode();

        this.#scenarioOverlayComponent = new ComponentViewCanvasOverlayScenario(w, h, scale, controller);
        this.#nodeScenarioOverlay = this.#scenarioOverlayComponent.createNode();
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
            this.#nodeMarkerOverlay,
            this.#nodeCursorOverlay,
            this.#nodeScenarioOverlay,
        ]);
    }

    /**
     *
     * @param sandGame {SandGame}
     */
    register(sandGame) {
        this.#markerOverlayComponent.register(sandGame.overlay());
        this.#scenarioOverlayComponent.register(sandGame.scenario());

        // chunk highlighting
        sandGame.addOnRendered((changedChunks) => {
            if (this.#controller.isShowActiveChunks()) {
                this.#debugOverlayComponent.highlightChunks(changedChunks);
            } else {
                this.#debugOverlayComponent.highlightChunks(null);
            }
        });

        this.#initMouseHandling(sandGame);
    }

    #initMouseHandling(sandGame) {
        const domNode = this.#nodeCursorOverlay;
        const scale = this.#controller.getCurrentScale();

        const toolManager = this.#controller.getToolManager();

        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * scale));
            return [x, y];
        }

        let lastX, lastY;
        let lastTool = null;  // drawing is not active if null
        let drag = false;
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
            if (toolManager.isInputDisabled()) {
                return;
            }

            const [x, y] = getActualMousePosition(e);
            lastX = x;
            lastY = y;
            lastTool = null;
            drag = false;
            ctrlPressed = false;
            shiftPressed = false;

            if (e.buttons === 1) {
                // primary button
                lastTool = toolManager.getPrimaryTool();
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_PRIMARY);

            } else if (e.buttons === 2) {
                // secondary button
                let primaryTool = toolManager.getPrimaryTool();
                if (primaryTool.isSecondaryActionEnabled()) {
                    // special secondary action

                    primaryTool.applySecondaryAction(x, y, sandGame.graphics(), e.altKey);

                    // hide cursors
                    this.#cursorOverlayComponent.hideCursors();

                    cancelRepeatingIfNeeded();

                    return;
                } else {
                    lastTool = toolManager.getSecondaryTool();
                    Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_SECONDARY);
                }
            } else if (e.buttons === 4) {
                // middle button
                e.preventDefault();

                if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                    const tool = toolManager.getTertiaryTool();
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

                // show/recreate cursor
                this.#cursorOverlayComponent.hideCursors();
                const cursorDefinition = toolManager.getPrimaryTool().createCursor();
                if (cursorDefinition !== null) {
                    this.#cursorOverlayComponent.showCursor(x, y, scale, cursorDefinition);
                }

            } else if (e.ctrlKey && e.shiftKey) {
                lastTool.applySpecial(x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_FLOOD);
                Analytics.triggerToolUsed(lastTool);
                lastTool = null;
            } else {
                if (e.ctrlKey && lastTool.isAreaModeEnabled()) {
                    ctrlPressed = e.ctrlKey;
                }
                if (e.shiftKey && lastTool.isLineModeEnabled()) {
                    shiftPressed = e.shiftKey;
                }
            }
        });
        domNode.addEventListener('mousemove', (e) => {
            // cancel repeating
            cancelRepeatingIfNeeded();

            if (toolManager.isInputDisabled()) {
                lastTool = null;
                this.#cursorOverlayComponent.hideCursors();
                return;
            }

            if (!ctrlPressed && !shiftPressed) {
                // drawing while dragging...

                // show / move cursor
                if (this.#cursorOverlayComponent.hasCursor()) {
                    const [x, y] = getActualMousePosition(e);
                    this.#cursorOverlayComponent.moveCursor(x, y, scale);
                } else {
                    const cursorDefinition = toolManager.getPrimaryTool().createCursor();
                    if (cursorDefinition !== null) {
                        const [x, y] = getActualMousePosition(e);
                        this.#cursorOverlayComponent.showCursor(x, y, scale, cursorDefinition);
                    }
                }

                if (lastTool === null) {
                    return;
                }

                const [x, y] = getActualMousePosition(e);

                // drag action
                if (!drag) {
                    lastTool.onDragStart(lastX, lastY, sandGame.graphics(), e.altKey);
                    drag = true;
                }

                // stroke action
                lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerToolUsed(lastTool);

                // repeating when holding mouse down on a position
                startRepeatingIfEnabled(x, y, e.altKey);

                lastX = x;
                lastY = y;

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

            if (toolManager.isInputDisabled()) {
                return;
            }

            if (lastTool !== null) {
                // click, dragging, rectangle or line
                if (drag) {
                    lastTool.onDragEnd(lastX, lastY, sandGame.graphics(), e.altKey);
                    drag = false;
                    if (!lastTool.hasCursor()) {
                        this.#cursorOverlayComponent.hideCursors();
                    }

                } else if (ctrlPressed) {
                    // rectangle
                    const [x, y] = getActualMousePosition(e);
                    let minX = Math.min(lastX, x);
                    let minY = Math.min(lastY, y);
                    let maxX = Math.max(lastX, x);
                    let maxY = Math.max(lastY, y);
                    lastTool.applyArea(minX, minY, maxX, maxY, sandGame.graphics(), e.altKey);
                    this.#cursorOverlayComponent.hideCursors();

                    Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_RECT);
                    Analytics.triggerToolUsed(lastTool);

                } else if (shiftPressed) {
                    // line
                    const [x, y] = getActualMousePosition(e);
                    lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                    this.#cursorOverlayComponent.hideCursors();

                    Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_LINE);
                    Analytics.triggerToolUsed(lastTool);
                }
                lastTool = null;
                ctrlPressed = false;
                shiftPressed = false;
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
            if (toolManager.isInputDisabled()) {
                return;
            }

            const [x, y] = getActualTouchPosition(e);
            lastX = x;
            lastY = y;
            lastTool = toolManager.getPrimaryTool();
            lastTool.applyPoint(x, y, sandGame.graphics(), false);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_PRIMARY);
            Analytics.triggerToolUsed(lastTool);

            e.preventDefault();
        });
        domNode.addEventListener('touchmove', (e) => {
            if (toolManager.isInputDisabled()) {
                lastTool = null;
                return;
            }

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

    onInputDisabledChanged(disabled) {
        this.#nodeCursorOverlay.style.cursor = disabled ? 'not-allowed' : null;
    }
}