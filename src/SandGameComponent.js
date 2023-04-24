import {DomBuilder} from "./DomBuilder.js";
import {SandGame} from "./core/SandGame.js";
import {Brushes} from "./core/Brushes.js";
import {Scenes} from "./core/Scenes.js";
import {Tools} from "./core/Tools.js";
import {SandGameControls} from "./SandGameControls.js";
import {SandGameScenesComponent} from "./SandGameScenesComponent.js";
import {SandGameElementSizeComponent} from "./SandGameElementSizeComponent.js";
import {SandGameIOComponent} from "./SandGameIOComponent.js";
import {SandGameOptionsComponent} from "./SandGameOptionsComponent.js";
import {SandGameTestComponent} from "./SandGameTestComponent.js";
import {SandGameBrushComponent} from "./SandGameBrushComponent.js";
import {SandGameCanvasComponent} from "./SandGameCanvasComponent.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2023-04-24
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

    /** @type function[] */
    #onBeforeSnapshotLoaded = [];

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

    #createSnapshot() {
        let snapshot = this.#sandGame.createSnapshot();
        snapshot.metadata.scale = this.getCurrentScale();
        return snapshot;
    }

    /**
     *
     * @param snapshot {Snapshot|null}
     * @param sandGameInitializer {function(SandGame)}
     */
    #initialize(snapshot, sandGameInitializer) {
        const canvasComponent = new SandGameCanvasComponent(this);
        this.#nodeHolderCanvas.append(canvasComponent.createNode());

        // init game
        const w = this.#currentWidthPoints;
        const h = this.#currentHeightPoints;
        const defaultElement = Brushes.AIR.apply(0, 0, undefined);
        this.#sandGame = new SandGame(canvasComponent.getContext(), w, h, snapshot, defaultElement);
        this.#sandGame.setRendererShowActiveChunks(this.isShowActiveChunks());
        if (this.isShowHeatmap()) {
            this.#sandGame.setRendererMode(SandGame.RENDERING_MODE_HEATMAP);
        }
        this.#sandGame.addOnRendered(() => {
            const fps = this.#sandGame.getFramesPerSecond();
            const ips = this.#sandGame.getIterationsPerSecond();
            this.#onPerformanceUpdate.forEach(f => f(ips, fps))
        });
        sandGameInitializer(this.#sandGame);

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
        let optionsComponent = new SandGameOptionsComponent(this);
        this.#nodeHolderBottomToolbar.append(optionsComponent.createNode());
    }

    enableSizeOptions() {
        let component = new SandGameElementSizeComponent(this, this.#init.scale, newScale => {
            let w = Math.trunc(this.#currentWidthPoints / this.#currentScale * newScale);
            let h = Math.trunc(this.#currentHeightPoints / this.#currentScale * newScale);
            this.changeCanvasSize(w, h, newScale);
        });

        this.#nodeHolderAdditionalViews.append(component.createNode());
    }

    enableScenes() {
        // TODO: clean up, use openNewScene method
        let showSceneFunction = (scene) => {
            this.#close();
            this.#initialize(null, sandGame => {
                scene.apply(sandGame);
            });
        };
        let snapshotFunction = () => this.#createSnapshot();
        let reopenSceneFunction = (snapshot) => {
            this.#close();

            this.#currentScale = snapshot.metadata.scale;
            this.#currentWidthPoints = snapshot.metadata.width;
            this.#currentHeightPoints = snapshot.metadata.height;

            this.#initialize(snapshot, sandGame => {});
        }
        let component = new SandGameScenesComponent(this, showSceneFunction, snapshotFunction, reopenSceneFunction,
                this.#init.scene);

        this.#nodeHolderAdditionalViews.append(component.createNode());
        this.#onBeforeSnapshotLoaded.push(() => component.onBeforeOtherSceneLoad());
    }

    enableSavingAndLoading() {
        let component = new SandGameIOComponent(() => this.#createSnapshot(), snapshot => {
            this.openFromSnapshot(snapshot);
        });
        this.#nodeHolderAdditionalViews.append(component.createNode());
        component.initFileDragAndDrop(this.#node);
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

    openNewScene(sandGameInitializer, canvasWidth = undefined, canvasHeight = undefined, scale = undefined) {
        for (let handler of this.#onBeforeSnapshotLoaded) {
            handler();
        }
        this.#close();

        if (canvasWidth !== undefined) {
            this.#currentWidthPoints = canvasWidth;
        }
        if (canvasHeight !== undefined) {
            this.#currentHeightPoints = canvasHeight;
        }
        if (scale !== undefined) {
            this.#currentScale = scale;
        }

        this.#initialize(null, sandGameInitializer);
    }

    openFromSnapshot(snapshot) {
        for (let handler of this.#onBeforeSnapshotLoaded) {
            handler();
        }
        this.#close();

        this.#currentScale = +(snapshot.metadata.width / this.#init.canvasWidthPx).toFixed(3);
        this.#currentWidthPoints = snapshot.metadata.width;
        this.#currentHeightPoints = snapshot.metadata.height;

        this.#initialize(snapshot, sandGame => {});
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
