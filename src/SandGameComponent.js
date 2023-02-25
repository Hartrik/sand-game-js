import {DomBuilder} from "./DomBuilder.js";
import {SandGame} from "./core/SandGame.js";
import {Brush} from "./core/Brush.js";
import {Brushes} from "./core/Brushes.js";
import {Scenes} from "./core/Scenes.js";
import {SandGameControls} from "./SandGameControls.js";
import {SandGameScenesComponent} from "./SandGameScenesComponent.js";
import {SandGameElementSizeComponent} from "./SandGameElementSizeComponent.js";
import {SandGameSaveComponent} from "./SandGameSaveComponent.js";
import {SandGameOptionsComponent} from "./SandGameOptionsComponent.js";
import {SandGameTestComponent} from "./SandGameTestComponent.js";
import {SandGameBrushComponent} from "./SandGameBrushComponent.js";
import {SandGameCanvasComponent} from "./SandGameCanvasComponent.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2023-02-20
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
        { name: 'Fire',   cssName: 'fire',   code: 'f', brush: Brush.gentle(Brushes.FIRE) },
        { name: 'Erase',  cssName: 'air',    code: '.', brush: Brushes.AIR },
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
    #showHeatmap = false;
    /** @type Brush */
    #brush = Brushes.SAND;

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
            const cps = this.#sandGame.getCyclesPerSecond();
            this.#onPerformanceUpdate.forEach(f => f(cps, fps))
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
        let component = new SandGameBrushComponent(this, this.#brushDeclarations);
        this.#nodeHolderTopToolbar.append(component.createNode());
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

    enableTestTools() {
        let component = new SandGameTestComponent(this, this.#brushDeclarations);
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

    setBrush(brush) {
        this.#brush = brush;
    }

    getBrush() {
        return this.#brush;
    }

    getBrushSize() {
        return this.#init.brushSize;
    }
}
