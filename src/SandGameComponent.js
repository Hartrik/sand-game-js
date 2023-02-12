import {DomBuilder} from "./DomBuilder.js";
import {SandGame} from "./core/SandGame.js";
import {Brushes} from "./core/Brushes.js";
import {Scenes} from "./core/Scenes.js";
import {SandGameScenesComponent} from "./SandGameScenesComponent.js";
import {SandGameElementSizeComponent} from "./SandGameElementSizeComponent.js";
import {SandGameSaveComponent} from "./SandGameSaveComponent.js";
import {SandGameOptionsComponent} from "./SandGameOptionsComponent.js";
import {SandGameControls} from "./SandGameControls.js";
import {SandGameTestComponent} from "./SandGameTestComponent.js";
import {SandGameTemplateComponent} from "./SandGameTemplateComponent.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2023-02-12
 */
export class SandGameComponent extends SandGameControls {

    #init = {
        scale: 0.5,
        canvasWidthPx: 700,
        canvasHeightPx: 400,
        brushSize: 5,
        scene: 'empty',
        assetsContextPath: './assets'
    };

    /** @type BrushDeclaration[] */
    #brushDeclarations = [
        { name: 'Sand',   cssName: 'sand',   code: '1', brush: Brushes.SAND },
        { name: 'Soil',   cssName: 'soil',   code: '2', brush: Brushes.SOIL },
        { name: 'Gravel', cssName: 'gravel', code: '3', brush: Brushes.STONE },
        { name: 'Rock',   cssName: 'wall',   code: 'r', brush: Brushes.ROCK },
        { name: 'Water',  cssName: 'water',  code: 'w', brush: Brushes.WATER },
        { name: 'Erase',  cssName: 'air',    code: '.', brush: Brushes.AIR }
    ];

    #currentWidthPoints;
    #currentHeightPoints;
    #currentScale;

    /** @type SandGame */
    #sandGame = null;
    /** @type string */
    #imageRendering = 'pixelated';
    /** @type boolean */
    #simulationEnabled = false;
    /** @type boolean */
    #showActiveChunks = false;
    /** @type Brush */
    #brush = Brushes.SAND;

    #node = null;
    #nodeCanvas;
    #nodeHolderTopToolbar;
    #nodeHolderCanvas;
    #nodeHolderBottomToolbar;
    #nodeHolderAdditionalViews;

    /** @type function[] */
    #onSnapshotLoaded = [];

    constructor(rootNode, init) {
        super();

        if (init) {
            this.#init = init;
        }

        this.#currentWidthPoints = Math.trunc(this.#init.canvasWidthPx * this.#init.scale);
        this.#currentHeightPoints = Math.trunc(this.#init.canvasHeightPx * this.#init.scale);
        this.#currentScale = this.#init.scale;

        // create component node
        this.#node = DomBuilder.div({ class: 'sand-game-component' }, [
            this.#nodeHolderTopToolbar = DomBuilder.div(),
            this.#nodeHolderCanvas = DomBuilder.div(),
            this.#nodeHolderBottomToolbar = DomBuilder.div(),
            this.#nodeHolderAdditionalViews = DomBuilder.div({ class: 'sand-game-views' }),
        ]);
        rootNode.append(this.#node);

        this.#initialize(null, sandGame => {
            let scene = Scenes.SCENES[this.#init.scene];
            if (scene) {
                scene.apply(sandGame);
            }
        });
    }

    /**
     *
     * @param snapshot {Snapshot}
     * @param sandGameInitializer {function(SandGame)}
     */
    #initialize(snapshot, sandGameInitializer) {
        this.#nodeCanvas = this.#createCanvas();
        this.#nodeHolderCanvas.append(this.#nodeCanvas);

        const w = this.#currentWidthPoints;
        const h = this.#currentHeightPoints;

        // scale up
        this.#nodeCanvas.width(w / this.#currentScale);
        this.#nodeCanvas.height(h / this.#currentScale);

        // init game
        let domCanvasNode = this.#nodeCanvas[0];
        let context = domCanvasNode.getContext('2d');

        let defaultElement = Brushes.AIR.apply(0, 0, undefined);
        this.#sandGame = new SandGame(context, w, h, snapshot, defaultElement);
        this.#sandGame.setRendererShowActiveChunks(this.#showActiveChunks);
        this.#sandGame.addOnRendered(() => {
            const fps = this.#sandGame.getFramesPerSecond();
            const cps = this.#sandGame.getCyclesPerSecond();
            this.#onPerformanceUpdate.forEach(f => f(cps, fps))
        });
        sandGameInitializer(this.#sandGame);

        // mouse handling
        this.#nodeCanvas.bind('contextmenu', e => false);
        this.#initMouseHandling(domCanvasNode, this.#sandGame);

        // start rendering
        this.#sandGame.startRendering();

        // start processing - if enabled
        if (this.#simulationEnabled) {
            this.#sandGame.startProcessing();
        }

        this.#onInitialized.forEach(f => f());
    }

    #createCanvas() {
        let canvas = DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: this.#currentWidthPoints + 'px',
            height: this.#currentHeightPoints + 'px'
        });
        let domCanvasNode = canvas[0];
        domCanvasNode.style.imageRendering = this.#imageRendering;
        return canvas;
    }

    #close() {
        if (this.#sandGame !== null) {
            this.#sandGame.stopProcessing();
            this.#sandGame.stopRendering();
        }
        this.#nodeHolderCanvas.empty();
        this.#nodeCanvas = null;
    }

    #initMouseHandling(domNode, sandGame) {
        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * this.#currentScale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * this.#currentScale));
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

            if (e.buttons === 4) {
                // middle button
                e.preventDefault();
                sandGame.graphics().floodFill(x, y, this.#brush, 1);
                brush = null;
                return;
            }

            brush = (e.buttons === 1) ? this.#brush : Brushes.AIR;
            ctrlPressed = e.ctrlKey;
            shiftPressed = e.shiftKey;
            if (!ctrlPressed && !shiftPressed) {
                sandGame.graphics().drawLine(x, y, x, y, this.#init.brushSize, brush);
            }
        });
        domNode.addEventListener('mousemove', (e) => {
            if (brush === null) {
                return;
            }
            if (!ctrlPressed && !shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                sandGame.graphics().drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
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
                sandGame.graphics().drawRectangle(minX, minY, maxX, maxY, brush);
            } else if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                sandGame.graphics().drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
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
            sandGame.graphics().drawLine(x, y, x, y, this.#init.brushSize, brush);

            e.preventDefault();
        });
        domNode.addEventListener('touchmove', (e) => {
            if (brush === null) {
                return;
            }
            const [x, y] = getActualTouchPosition(e);
            sandGame.graphics().drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
            lastX = x;
            lastY = y;

            e.preventDefault();
        });
        domNode.addEventListener('touchend', (e) => {
            brush = null;

            e.preventDefault();
        });
    }

    enableBrushes() {
        let toolbar = DomBuilder.div({ class: 'sand-game-brushes' });
        let buttons = [];

        for (let d of this.#brushDeclarations) {
            let button = DomBuilder.link(d.name, { class: 'badge badge-secondary ' + d.cssName }, () => {
                // unselect last
                for (let b of buttons) {
                    b.removeClass('selected');
                }

                // select
                button.addClass('selected');

                this.#brush = d.brush;
            });
            // initial select
            if (d.brush === this.#brush) {
                button.addClass('selected');
            }

            buttons.push(button);
        }

        toolbar.append(buttons);
        this.#nodeHolderTopToolbar.append(toolbar);
    }

    enableOptions() {
        let optionsComponent = new SandGameOptionsComponent(this);
        this.#nodeHolderBottomToolbar.append(optionsComponent.createNode());
    }

    enableSizeOptions() {
        let component = new SandGameElementSizeComponent(newScale => {
            let w = Math.trunc(this.#currentWidthPoints / this.#currentScale * newScale);
            let h = Math.trunc(this.#currentHeightPoints / this.#currentScale * newScale);
            this.changeCanvasSize(w, h, newScale);
        }, this.#init.scale, this.#init.assetsContextPath);

        this.#nodeHolderAdditionalViews.append(component.createNode());
        this.#onSnapshotLoaded.push(() => component.unselect());
    }

    enableScenes() {
        let component = new SandGameScenesComponent(scene => {
            this.#close();
            this.#initialize(null, sandGame => {
                scene.apply(sandGame);
            });
        }, this.#init.scene);

        this.#nodeHolderAdditionalViews.append(component.createNode());
        this.#onSnapshotLoaded.push(() => component.unselect());
    }

    enableSavingAndLoading() {
        let component = new SandGameSaveComponent(() => this.#sandGame.createSnapshot(), snapshot => {
            this.#close();
            for (let handler of this.#onSnapshotLoaded) {
                handler();
            }

            this.#currentScale = (snapshot.metadata.width / this.#init.canvasWidthPx).toFixed(3);
            this.#currentWidthPoints = snapshot.metadata.width;
            this.#currentHeightPoints = snapshot.metadata.height;

            this.#initialize(snapshot, sandGame => {});
        });
        this.#nodeHolderAdditionalViews.append(component.createNode());
    }

    enableTemplateEditor() {
        let component = new SandGameTemplateComponent(this, this.#brushDeclarations);
        this.#nodeHolderAdditionalViews.append(component.createNode());
    }

    enableTestTools() {
        let component = new SandGameTestComponent(this);
        this.#nodeHolderAdditionalViews.append(component.createNode());
    }

    // SandGameControls

    getSandGame() {
        return this.#sandGame;
    }

    // SandGameControls - simulation state

    /** @type function[] */
    #onInitialized = [];
    /** @type function[] */
    #onStarted = [];
    /** @type function[] */
    #onStopped = [];

    addOnInitialized(handler) {
        this.#onInitialized.push(handler);
    }

    addOnStarted(handler) {
        this.#onStarted.push(handler);
    }

    addOnStopped(handler) {
        this.#onStopped.push(handler);
    }

    start() {
        if (this.#sandGame !== null) {
            if (!this.#simulationEnabled) {
                this.#simulationEnabled = true;
                this.#sandGame.startProcessing();
                this.#onStarted.forEach(f => f());
            }
        }
    }

    switchStartStop() {
        if (this.#sandGame !== null) {
            if (this.#simulationEnabled) {
                this.#simulationEnabled = false;
                this.#sandGame.stopProcessing();
                this.#onStopped.forEach(f => f());
            } else {
                this.#simulationEnabled = true;
                this.#sandGame.startProcessing();
                this.#onStarted.forEach(f => f());
            }
        }
    }

    // SandGameControls / canvas size

    getCurrentWidthPoints() {
        return this.#currentWidthPoints;
    }

    getCurrentHeightPoints() {
        return this.#currentHeightPoints;
    }

    getCurrentScale() {
        return this.#currentScale;
    }

    changeCanvasSize(width, height, scale) {
        if (typeof width !== 'number' || !(width > 0 && width < 2048)) {
            throw 'Incorrect width';
        }
        if (typeof height !== 'number' || !(height > 0 && height < 2048)) {
            throw 'Incorrect height';
        }
        if (typeof scale !== 'number' || !(scale > 0 && scale <= 1)) {
            throw 'Incorrect scale';
        }

        this.#close();

        this.#currentWidthPoints = width;
        this.#currentHeightPoints = height;
        this.#currentScale = scale;

        let oldSandGameInstanceToCopy = this.#sandGame;
        this.#initialize(null, sandGame => {
            oldSandGameInstanceToCopy.copyStateTo(sandGame);
        });
    }

    // SandGameControls / options

    setShowActiveChunks(show) {
        this.#showActiveChunks = show;
        if (this.#sandGame) {
            this.#sandGame.setRendererShowActiveChunks(show);
        }
    }

    isShowActiveChunks() {
        return this.#showActiveChunks;
    }

    setCanvasImageRenderingStyle(style) {
        this.#imageRendering = style;
        if (this.#nodeCanvas !== null) {
            let domCanvasNode = this.#nodeCanvas[0];
            domCanvasNode.style.imageRendering = style;
        }
    }

    getCanvasImageRenderingStyle() {
        return this.#imageRendering;
    }

    // SandGameControls / performance

    /** @type function[] */
    #onPerformanceUpdate = [];

    addOnPerformanceUpdate(handler) {
        this.#onPerformanceUpdate.push(handler);
    }

}
