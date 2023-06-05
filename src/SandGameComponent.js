import {DomBuilder} from "./DomBuilder.js";
import {ElementArea} from "./core/ElementArea.js";
import {SandGame} from "./core/SandGame.js";
import {Brushes} from "./core/Brushes.js";
import {Scenes} from "./Scenes.js";
import {SceneImplTmpResize} from "./core/SceneImplResize.js";
import {Tools} from "./core/Tools.js";
import {Tool} from "./core/Tool.js";
import {SandGameControls} from "./SandGameControls.js";
import {SandGameControllerIO} from "./SandGameControllerIO.js";
import {SandGameScenesComponent} from "./SandGameScenesComponent.js";
import {SandGameElementSizeComponent} from "./SandGameElementSizeComponent.js";
import {SandGameOptionsComponent} from "./SandGameOptionsComponent.js";
import {SandGameTestComponent} from "./SandGameTestComponent.js";
import {SandGameBrushComponent} from "./SandGameBrushComponent.js";
import {SandGameCanvasComponent} from "./SandGameCanvasComponent.js";
import { Assets } from "./Assets";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2023-06-05
 */
export class SandGameComponent extends SandGameControls {

    #init = {
        scale: 0.5,
        canvasWidthPx: 700,
        canvasHeightPx: 400,
        scene: 'empty',
        assetsContextPath: './assets'
    };

    /** @type number */
    #currentWidthPoints;
    /** @type number */
    #currentHeightPoints;
    /** @type number */
    #currentScale;

    /** @type SandGame */
    #sandGame = null;
    /** @type string */
    #imageRendering = 'pixelated';
    /** @type boolean */
    #simulationEnabled = false;
    /** @type boolean */
    #showActiveChunks = false;
    #showHeatmap = false;
    /** @type Tool */
    #primaryTool = Tools.byCodeName('sand');
    #secondaryTool = Tools.byCodeName('air');
    #tertiaryTool = Tools.byCodeName('meteor');

    #node = null;
    #nodeHolderTopToolbar;
    #nodeHolderCanvas;
    #nodeHolderBottomToolbar;
    #nodeHolderAdditionalViews;

    /** @type function|null */
    #canvasFinalizer = null;
    /** @type function|null */
    #canvasSettingsUpdater = null;

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

        this.#initialize(Scenes.SCENES[this.#init.scene]);
    }

    /**
     *
     * @param scene {Scene}
     */
    #initialize(scene) {
        const [w, h] = scene.countSize(this.#currentWidthPoints, this.#currentHeightPoints);
        if (w !== this.#currentWidthPoints || h !== this.#currentHeightPoints) {
            this.#currentWidthPoints = w;
            this.#currentHeightPoints = h;
            this.#currentScale = +(w / this.#init.canvasWidthPx).toFixed(3);
        }

        const canvasComponent = new SandGameCanvasComponent(this);
        this.#nodeHolderCanvas.append(canvasComponent.createNode());

        // init game
        const defaultElement = Brushes.AIR.apply(0, 0, undefined);
        const context = canvasComponent.getContext();
        this.#sandGame = scene.createSandGame(context, this.#currentWidthPoints, this.#currentHeightPoints, defaultElement);
        this.#sandGame.graphics().replace(ElementArea.TRANSPARENT_ELEMENT, defaultElement);
        if (this.isShowHeatmap()) {
            this.#sandGame.setRendererMode(SandGame.RENDERING_MODE_HEATMAP);
        }
        this.#sandGame.addOnRendered((changedChunks) => {
            // show highlighted chunks
            if (this.isShowActiveChunks()) {
                canvasComponent.highlightChunks(changedChunks);
            } else {
                canvasComponent.highlightChunks(null);
            }

            // update metrics
            const fps = this.#sandGame.getFramesPerSecond();
            const ips = this.#sandGame.getIterationsPerSecond();
            this.#onPerformanceUpdate.forEach(f => f(ips, fps))
        });

        // mouse handling
        canvasComponent.initMouseHandling(this.#sandGame);

        // handlers
        this.#canvasSettingsUpdater = () => {
            canvasComponent.setImageRenderingStyle(this.#imageRendering);
        };
        this.#canvasFinalizer = () => {
            canvasComponent.close();
            this.#nodeHolderCanvas.empty();
        };

        // start rendering
        this.#sandGame.startRendering();

        // start processing - if enabled
        if (this.#simulationEnabled) {
            this.#sandGame.startProcessing();
        }

        this.#onInitialized.forEach(f => f(this.#sandGame));
    }

    #close() {
        if (this.#sandGame !== null) {
            this.#sandGame.stopProcessing();
            this.#sandGame.stopRendering();
        }
        if (this.#canvasFinalizer !== null) {
            this.#canvasFinalizer();
        }
        this.#canvasFinalizer = null;
        this.#canvasSettingsUpdater = null;
    }

    enableGlobalShortcuts() {
        document.onkeydown = (e) => {
            // handle start stop
            if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                this.switchStartStop();
            }
            // handle next step
            if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key === ' ') {
                e.preventDefault();
                if (this.#sandGame !== null) {
                    this.#sandGame.doProcessing();
                }
            }
            // handle fast execute
            if (e.ctrlKey && !e.altKey && e.shiftKey && e.key === ' ') {
                e.preventDefault();
                if (this.#sandGame !== null) {
                    const input = prompt('Enter the number of iterations to run', '10000');
                    const iterations = Math.abs(parseInt(input));
                    const timeBefore = new Date();
                    for (let i = 0; i < iterations; i++) {
                        this.#sandGame.doProcessing();
                        if (i % 2500 === 0) {
                            console.log(`Performed ${i} of ${iterations} iterations`);
                        }
                    }
                    const timeAfter = new Date();
                    const elapsedMs = timeAfter.getTime() - timeBefore.getTime();
                    console.log(`Performed ${iterations} iterations in ${elapsedMs} ms`);
                }
            }
        };
    }

    enableBrushes() {
        let component = new SandGameBrushComponent(this, Tools.DEFAULT_TOOLS);
        this.#nodeHolderTopToolbar.append(component.createNode());
    }

    enableOptions() {
        let ioController = new SandGameControllerIO(this);
        ioController.initFileDragAndDrop(this.#node);

        let optionsComponent = new SandGameOptionsComponent(this, ioController);
        this.#nodeHolderBottomToolbar.append(optionsComponent.createNode());
    }

    enableScenes() {
        let scenesComponent = new SandGameScenesComponent(this, this.#init.scene);

        this.#nodeHolderAdditionalViews.append(DomBuilder.div(null, [
            DomBuilder.button(DomBuilder.create(Assets.SVG_ADJUST_SCALE), { class : 'btn btn-outline-secondary adjust-scale' }, () => {
                let elementSizeComponent = new SandGameElementSizeComponent(this, this.#currentScale, newScale => {
                    let w = Math.trunc(this.#currentWidthPoints / this.#currentScale * newScale);
                    let h = Math.trunc(this.#currentHeightPoints / this.#currentScale * newScale);
                    this.changeCanvasSize(w, h, newScale);
                });

                let dialog = new DomBuilder.BootstrapDialog();
                dialog.setHeaderContent('Adjust Scale');
                dialog.setBodyContent(DomBuilder.div({ class: 'sand-game-component' }, elementSizeComponent.createNode()));
                dialog.addCloseButton('Close');
                dialog.show(this.getDialogAnchor());
            }),
            scenesComponent.createNode(),
        ]));
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

    /** @type function(SandGame)[] */
    #onInitialized = [];
    /** @type function[] */
    #onBeforeNewSceneLoaded = [];
    /** @type function[] */
    #onStarted = [];
    /** @type function[] */
    #onStopped = [];

    addOnInitialized(handler) {
        this.#onInitialized.push(handler);
    }

    addOnBeforeNewSceneLoaded(handler) {
        this.#onBeforeNewSceneLoaded.push(handler);
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

    createSnapshot() {
        let snapshot = this.#sandGame.createSnapshot();
        snapshot.metadata.scale = this.getCurrentScale();
        return snapshot;
    }

    openScene(scene) {
        for (let handler of this.#onBeforeNewSceneLoaded) {
            handler();
        }
        this.#close();

        this.#initialize(scene);
    }

    pasteScene(scene) {
        const oldPrimary = this.getPrimaryTool();
        const oldSecondary = this.getSecondaryTool();
        const revert = () => {
            this.setPrimaryTool(oldPrimary);
            this.setSecondaryTool(oldSecondary);
        };

        this.setPrimaryTool(Tool.insertElementAreaTool(null, null, null, scene, revert));
        this.setSecondaryTool(Tool.actionTool(null, null, null, revert));
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

        this.#initialize(new SceneImplTmpResize(this.#sandGame));
    }

    // SandGameControls / options

    setShowActiveChunks(show) {
        this.#showActiveChunks = show;
    }

    isShowActiveChunks() {
        return this.#showActiveChunks;
    }

    setShowHeatmap(show) {
        this.#showHeatmap = show;
        if (this.#sandGame) {
            this.#sandGame.setRendererMode(show ? SandGame.RENDERING_MODE_HEATMAP : SandGame.RENDERING_MODE_CLASSIC);
        }
    }

    isShowHeatmap() {
        return this.#showHeatmap;
    }

    setCanvasImageRenderingStyle(style) {
        this.#imageRendering = style;
        if (this.#canvasSettingsUpdater !== null) {
            this.#canvasSettingsUpdater();
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

    // SandGameControls / tools

    setPrimaryTool(tool) {
        this.#primaryTool = tool;
    }

    setSecondaryTool(tool) {
        this.#secondaryTool = tool;
    }

    getPrimaryTool() {
        return this.#primaryTool;
    }

    getSecondaryTool() {
        return this.#secondaryTool;
    }

    getTertiaryTool() {
        return this.#tertiaryTool;
    }

    // SandGameControls / ui

    getDialogAnchor() {
        return this.#node;
    }
}
