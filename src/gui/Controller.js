import { ElementArea } from "../core/ElementArea";
import { SandGame } from "../core/SandGame";
import { Brushes } from "../core/Brushes";
import { Scenes } from "../def/Scenes";
import { SceneImplTmpResize } from "../core/SceneImplResize";
import { Tool } from "../core/Tool";
import { ServiceToolManager } from "./ServiceToolManager";
import { ServiceIO } from "./ServiceIO";
import { RendererInitializer } from "../core/RendererInitializer";
import { SceneImplSnapshot } from "../core/SceneImplSnapshot";
import { DomBuilder } from "./DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2023-10-15
 */
export class Controller {

    #init = {
        scale: 0.5,
        canvasWidthPx: 700,
        canvasHeightPx: 400,
        scene: 'empty'
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
    /** @type function[] */
    #onImageRenderingStyleChanged = [];
    /** @type boolean */
    #simulationEnabled = false;
    /** @type boolean */
    #showActiveChunks = false;
    #rendererInitializer = RendererInitializer.canvasWebGL();

    /** @type ServiceToolManager */
    #serviceToolManager = new ServiceToolManager();
    /** @type ServiceIO */
    #serviceIO = new ServiceIO(this);

    #dialogAnchor;
    #canvasInitializer = null;

    /**
     *
     * @param init
     */
    constructor(init) {
        if (init) {
            this.#init = init;
        }

        this.#currentWidthPoints = Math.trunc(this.#init.canvasWidthPx * this.#init.scale);
        this.#currentHeightPoints = Math.trunc(this.#init.canvasHeightPx * this.#init.scale);
        this.#currentScale = this.#init.scale;
    }

    /**
     *
     * @param canvasInitializer {function(contextId:string):CanvasRenderingContext2D|WebGLRenderingContext}
     */
    registerCanvasInitializer(canvasInitializer) {
        this.#canvasInitializer = canvasInitializer;
    }

    registerDialogAnchor(dialogAnchor) {
        this.#dialogAnchor = dialogAnchor;
    }

    setup() {
        this.#initialize(Scenes.SCENES[this.#init.scene]);
    }

    /**
     *
     * @param scene {Scene}
     */
    #initialize(scene) {
        if (this.#canvasInitializer == null) {
            throw 'Illegal state: canvas initializer not registered!';
        }
        if (this.#dialogAnchor == null) {
            throw 'Illegal state: dialog anchor not registered!';
        }

        const [w, h] = scene.countSize(this.#currentWidthPoints, this.#currentHeightPoints);
        if (w !== this.#currentWidthPoints || h !== this.#currentHeightPoints) {
            this.#currentWidthPoints = w;
            this.#currentHeightPoints = h;
            this.#currentScale = +(w / this.#init.canvasWidthPx).toFixed(3);
        }

        // init game
        const defaultElement = Brushes.AIR.apply(0, 0, undefined);
        let contextType = this.#rendererInitializer.getContextType();
        let context = this.#canvasInitializer(contextType);
        if ((contextType === 'webgl' || contextType === 'webgl2') && (context === null || context === undefined)) {
            // WebGL is not supported - unsupported at all / unsupported after recent failure
            // - to test this, run Chrome with --disable-3d-apis
            this.#reportRenderingFailure("Unable to get WebGL context. Using fallback renderer; game performance may be affected");
            this.#rendererInitializer = RendererInitializer.canvas2d();
            contextType = this.#rendererInitializer.getContextType();
            context = this.#canvasInitializer(contextType);
        }
        this.#sandGame = scene.createSandGame(w, h, defaultElement, context, this.#rendererInitializer);
        this.#sandGame.graphics().replace(ElementArea.TRANSPARENT_ELEMENT, defaultElement);

        this.#onInitialized.forEach(f => f(this.#sandGame));

        // start rendering
        this.#sandGame.startRendering();

        // start processing - if enabled
        if (this.#simulationEnabled) {
            this.#sandGame.startProcessing();
        }
    }

    #close() {
        if (this.#sandGame !== null) {
            this.#sandGame.stopProcessing();
            this.#sandGame.stopRendering();
        }
        for (let func of this.#onBeforeClosed) {
            func();
        }
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

    /**
     *
     * @returns {SandGame|null}
     */
    getSandGame() {
        return this.#sandGame;
    }

    // controller - simulation state

    /** @type function(SandGame)[] */
    #onInitialized = [];
    /** @type function(SandGame)[] */
    #onBeforeClosed = [];
    /** @type function[] */
    #onBeforeNewSceneLoaded = [];
    /** @type function[] */
    #onStarted = [];
    /** @type function[] */
    #onStopped = [];

    /**
     *
     * @param handler {function(SandGame)}
     * @returns void
     */
    addOnInitialized(handler) {
        this.#onInitialized.push(handler);
    }

    /**
     *
     * @param handler {function}
     * @returns void
     */
    addOnBeforeNewSceneLoaded(handler) {
        this.#onBeforeNewSceneLoaded.push(handler);
    }

    /**
     *
     * @param handler {function}
     * @returns void
     */
    addOnBeforeClosed(handler) {
        this.#onBeforeClosed.push(handler);
    }

    /**
     *
     * @param handler {function}
     * @returns void
     */
    addOnStarted(handler) {
        this.#onStarted.push(handler);
    }

    /**
     *
     * @param handler {function}
     * @returns void
     */
    addOnStopped(handler) {
        this.#onStopped.push(handler);
    }

    restartAfterRenderingFailure(cause) {
        this.#reportRenderingFailure(cause)
        const snapshot = this.createSnapshot();
        this.#rendererInitializer = RendererInitializer.canvas2d();  // fallback to classic CPU renderer
        this.openScene(new SceneImplSnapshot(snapshot));
    }

    #reportRenderingFailure(message) {
        console.warn(message);

        let toast = new DomBuilder.BootstrapToast();
        toast.setHeaderContent(DomBuilder.element('strong', { style: 'color: orange;' }, 'Warning'));
        toast.setBodyContent(DomBuilder.par(null, message));
        toast.setDelay(20000);
        toast.show(this.#dialogAnchor);
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

    /**
     * @returns Snapshot
     */
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
        const toolManager = this.getToolManager();
        const revert = toolManager.createRevertAction();

        toolManager.setPrimaryTool(Tool.insertElementAreaTool(null, null, null, [ scene ], revert));
        toolManager.setSecondaryTool(Tool.actionTool(null, null, null, revert));
    }

    // controller / canvas size

    /**
     *
     * @returns {number}
     */
    getCurrentWidthPoints() {
        return this.#currentWidthPoints;
    }

    /**
     *
     * @returns {number}
     */
    getCurrentHeightPoints() {
        return this.#currentHeightPoints;
    }

    /**
     *
     * @returns {number}
     */
    getCurrentScale() {
        return this.#currentScale;
    }

    /**
     *
     * @param width
     * @param height
     * @param scale
     * @returns void
     */
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

    // controller / options

    /**
     *
     * @param show {boolean}
     * @returns void
     */
    setShowActiveChunks(show) {
        this.#showActiveChunks = show;
    }

    /**
     * @returns {boolean}
     */
    isShowActiveChunks() {
        return this.#showActiveChunks;
    }

    /**
     *
     * @param initializer {RendererInitializer}
     * @returns void
     */
    setRendererInitializer(initializer) {
        this.#rendererInitializer = initializer;
        if (this.#sandGame) {
            this.#close();
            this.#initialize(new SceneImplTmpResize(this.#sandGame));
        }
    }

    /**
     * @returns {RendererInitializer}
     */
    getRendererInitializer() {
        return this.#rendererInitializer;
    }

    /**
     *
     * @param style {string}
     * @returns void
     */
    setCanvasImageRenderingStyle(style) {
        this.#imageRendering = style;
        for (let func of this.#onImageRenderingStyleChanged) {
            func(style);
        }
    }

    /**
     * @returns {string}
     */
    getCanvasImageRenderingStyle() {
        return this.#imageRendering;
    }

    /**
     *
     * @param handler {function(string)}
     * @returns void
     */
    addOnImageRenderingStyleChanged(handler) {
        this.#onImageRenderingStyleChanged.push(handler);
    }

    // controller / services

    /**
     *
     * @returns {ServiceToolManager}
     */
    getToolManager() {
        return this.#serviceToolManager;
    }

    /**
     *
     * @returns {ServiceIO}
     */
    getIOManager() {
        return this.#serviceIO;
    }

    // controller / ui

    getDialogAnchor() {
        return this.#dialogAnchor;
    }
}
