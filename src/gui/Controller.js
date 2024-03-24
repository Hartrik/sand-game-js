// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementArea from "../core/ElementArea";
import SandGame from "../core/SandGame";
import SceneImplTmpResize from "../core/scene/SceneImplResize";
import ServiceToolManager from "./ServiceToolManager";
import ServiceIO from "./ServiceIO";
import RendererInitializer from "../core/rendering/RendererInitializer";
import SceneImplSnapshot from "../core/scene/SceneImplSnapshot";
import DomBuilder from "./DomBuilder";
import Defaults from "../def/Defaults";
import Tools from "../core/tool/Tools";
import ToolInfo from "../core/tool/ToolInfo";
import Analytics from "../Analytics";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-24
 */
export default class Controller {

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

    /** @type Scene|null */
    #initialScene = null;

    /** @type ServiceToolManager */
    #serviceToolManager;
    /** @type ServiceIO */
    #serviceIO = new ServiceIO(this);

    /** @type HTMLElement */
    #dialogAnchor;

    /**
     * @typedef {Object} CanvasProvider
     * @property {function():HTMLElement} initialize
     * @property {function():HTMLElement} getCanvasNode
     */
    /** @type CanvasProvider|null */
    #canvasProvider = null;

    /**
     *
     * @param init
     * @param dialogAnchor
     * @param toolManager
     */
    constructor(init, dialogAnchor, toolManager) {
        if (init) {
            this.#init = init;
        }

        this.#dialogAnchor = dialogAnchor;
        this.#serviceToolManager = toolManager;

        this.#currentWidthPoints = Math.trunc(this.#init.canvasWidthPx * this.#init.scale);
        this.#currentHeightPoints = Math.trunc(this.#init.canvasHeightPx * this.#init.scale);
        this.#currentScale = this.#init.scale;
    }

    getVersion() {
        return this.#init.version;
    }

    /**
     *
     * @param canvasProvider {CanvasProvider}
     */
    registerCanvasProvider(canvasProvider) {
        this.#canvasProvider = canvasProvider;
    }

    /**
     * Returns initial scene definition - this is needed for restart etc.
     *
     * @returns {Scene|null}
     */
    getInitialScene() {
        return this.#initialScene;
    }

    setInitialScene(scene) {
        this.#initialScene = scene;
    }

    /**
     *
     * @param scene {Scene}
     */
    setup(scene) {
        this.setInitialScene(scene);
        this.#initialize(scene);
    }

    /**
     *
     * @param scene {Scene}
     */
    #initialize(scene) {
        if (this.#canvasProvider == null) {
            throw 'Illegal state: canvas provider not registered!';
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
        const defaults = new Defaults();
        const context = this.#initializeContext();
        this.#sandGame = null;
        let promise;
        try {
            promise = scene.createSandGame(w, h, defaults, context, this.#rendererInitializer);
        } catch (e) {
            this.#reportSeriousFailure('Initialization failed: ' + e);
            return;
        }

        promise.then(sandGame => {
            this.#sandGame = sandGame;
            this.#sandGame.graphics().replace(ElementArea.TRANSPARENT_ELEMENT, defaults.getDefaultElement());

            // handlers
            this.#onInitialized.forEach(f => f(this.#sandGame));

            // start rendering
            this.#sandGame.addOnRenderingFailed((e) => {
                this.#reportSeriousFailure('Rendering failure: ' + e);
            });
            this.#sandGame.startRendering();

            // start processing - if enabled
            if (this.#simulationEnabled) {
                this.#sandGame.startProcessing();
                this.#onStarted.forEach(f => f());
            }
        }).catch(e => {
            this.#reportSeriousFailure('Initialization failed: ' + e);
        });
    }

    #initializeContext() {
        const canvas = this.#canvasProvider.initialize();
        let contextType = this.#rendererInitializer.getContextType();
        let context = this.#initializeContextAs(canvas, contextType);
        if ((contextType === 'webgl2') && (context === null || context === undefined)) {
            // WebGL is not supported - unsupported at all / unsupported after recent failure
            // - to test this, run Chrome with --disable-3d-apis
            this.#reportFirstRenderingFailure("Unable to get WebGL context. Using fallback renderer; game performance and visual will be affected");
            this.#rendererInitializer = RendererInitializer.canvas2d();
            contextType = this.#rendererInitializer.getContextType();
            context = this.#initializeContextAs(canvas, contextType);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_RENDERER_FALLBACK);
        }
        return context;
    }

    #initializeContextAs(canvasDomNode, contextId) {
        if (contextId === 'webgl2') {
            // handle WebGL failures

            let contextLossHandled = false;
            canvasDomNode.addEventListener('webglcontextlost', (e) => {
                // GPU memory leak, GPU failure, etc.
                // - to test this move the texture definition into rendering loop to create a memory leak

                if (!contextLossHandled) {
                    contextLossHandled = true;
                } else {
                    return;  // already handled
                }

                const cause = 'WebGL context loss detected. Using fallback renderer; game performance and visuals will be affected';
                e.preventDefault();
                setTimeout(() => {
                    this.restartAfterRenderingFailure(cause);
                }, 2000);
            }, false);
        }
        return canvasDomNode.getContext(contextId);
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

    /**
     *
     * @returns {HTMLElement|null}
     */
    getCanvas() {
        if (this.#canvasProvider !== null) {
            return this.#canvasProvider.getCanvasNode();
        }
        return null;
    }

    // controller - simulation state

    /** @type function(SandGame)[] */
    #onInitialized = [];
    /** @type function(SandGame)[] */
    #onBeforeClosed = [];
    /** @type function(Scene)[] */
    #onBeforeNewSceneLoaded = [];
    /** @type function[] */
    #onStarted = [];
    /** @type function[] */
    #onStopped = [];
    /** @type function(type:string,message:string)[] */
    #onFailure = [];

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
     * @param handler {function(Scene)}
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

    /**
     *
     * @param handler {function(type:string,message:string)}
     * @returns void
     */
    addOnFailure(handler) {
        this.#onFailure.push(handler);
    }

    restartAfterRenderingFailure(cause) {
        this.#reportFirstRenderingFailure(cause)
        const snapshot = this.createSnapshot();
        this.#rendererInitializer = RendererInitializer.canvas2d();  // fallback to classic CPU renderer
        this.openScene(new SceneImplSnapshot(snapshot));
        Analytics.triggerFeatureUsed(Analytics.FEATURE_RENDERER_FALLBACK);
    }

    #reportFirstRenderingFailure(message) {
        console.warn(message);
        for (let handler of this.#onFailure) {
            handler('rendering-warning', message);
        }

        let toast = DomBuilder.bootstrapToastBuilder();
        toast.setHeaderContent(DomBuilder.element('strong', { style: 'color: orange;' }, 'Warning'));
        toast.setBodyContent(DomBuilder.par(null, message));
        toast.setDelay(60000);
        toast.show(this.#dialogAnchor);
    }

    #reportSeriousFailure(message) {
        console.error(message);
        for (let handler of this.#onFailure) {
            handler('serious', message);
        }

        let toast = DomBuilder.bootstrapToastBuilder();
        toast.setHeaderContent(DomBuilder.element('strong', { style: 'color: red;' }, 'Error'));
        toast.setBodyContent(DomBuilder.par(null, message));
        toast.show(this.#dialogAnchor);
    }

    start() {
        if (this.#sandGame !== null) {
            if (!this.#simulationEnabled) {
                this.#sandGame.startProcessing();
                this.#onStarted.forEach(f => f());
            }
        }
        this.#simulationEnabled = true;
    }

    switchStartStop() {
        this.#simulationEnabled = !this.#simulationEnabled;
        if (this.#sandGame !== null) {
            if (this.#simulationEnabled) {
                this.#simulationEnabled = true;
                this.#sandGame.startProcessing();
                this.#onStarted.forEach(f => f());
            } else {
                this.#sandGame.stopProcessing();
                this.#onStopped.forEach(f => f());
            }
        }
    }

    /**
     * @returns Snapshot
     */
    createSnapshot() {
        if (this.#sandGame !== null) {
            let snapshot = this.#sandGame.createSnapshot();
            snapshot.metadata.scale = this.getCurrentScale();
            if (this.#init.version !== undefined) {
                snapshot.metadata.appVersion = this.#init.version;
            }
            return snapshot;
        } else {
            return null;
        }
    }

    openScene(scene) {
        for (let handler of this.#onBeforeNewSceneLoaded) {
            handler(scene);
        }
        this.#close();

        this.#initialize(scene);
    }

    pasteScene(scene) {
        const toolManager = this.getToolManager();
        const revert = toolManager.createRevertAction();

        toolManager.setPrimaryTool(Tools.insertScenesTool([ scene ], revert));
        toolManager.setSecondaryTool(Tools.actionTool(revert));
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

    /**
     *
     * @returns {HTMLElement}
     */
    getDialogAnchor() {
        return this.#dialogAnchor;
    }
}
