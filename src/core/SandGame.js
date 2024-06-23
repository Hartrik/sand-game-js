// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Counter from "./Counter.js";
import DeterministicRandom from "./DeterministicRandom.js";
import Element from "./Element.js";
import ElementHead from "./ElementHead.js";
import ElementTail from "./ElementTail.js";
import ElementArea from "./ElementArea.js";
import EntityManager from "./entity/EntityManager";
import Processor from "./processing/Processor.js";
import Renderer from "./rendering/Renderer.js";
import RendererInitializer from "./rendering/RendererInitializer.js";
import SandGameGraphics from "./SandGameGraphics.js";
import SandGameEntities from "./SandGameEntities";
import SandGameOverlay from "./SandGameOverlay";
import SandGameScenario from "./SandGameScenario";
import GameState from "./GameState";
import Snapshot from "./Snapshot.js";
import SnapshotMetadata from "./SnapshotMetadata.js";
import TemplateBlockPainter from "./TemplateBlockPainter.js";
import TemplateLayeredPainter from "./TemplateLayeredPainter.js";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-04
 */
export default class SandGame {

    /** @type ElementArea */
    #elementArea;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type EntityManager */
    #entityManager;

    /** @type DeterministicRandom */
    #random;

    /** @type Counter */
    #framesCounter;

    /** @type Counter */
    #iterationsCounter;

    /** @type Processor */
    #processor;

    /** @type Renderer */
    #renderer;

    /** @type number|null */
    #processorIntervalHandle = null;

    /** @type number|null */
    #rendererIntervalHandle = null;

    /** @type function[] */
    #onRendered = [];
    /** @type function[] */
    #onRenderingFailed = [];

    /** @type function(number)[] */
    #onProcessed = [];

    /** @type SandGameGraphics */
    #graphics;

    /** @type SandGameEntities */
    #entities;

    /** @type SandGameOverlay */
    #overlay;

    /** @type SandGameScenario */
    #scenario;

    /**
     *
     * @param elementArea {ElementArea}
     * @param serializedEntities {object[]}
     * @param sceneMetadata {SnapshotMetadata|null}
     * @param gameDefaults {GameDefaults}
     * @param context {CanvasRenderingContext2D|WebGLRenderingContext}
     * @param rendererInitializer {RendererInitializer}
     */
    constructor(elementArea, serializedEntities, sceneMetadata, gameDefaults,
            context, rendererInitializer) {

        this.#random = new DeterministicRandom((sceneMetadata) ? sceneMetadata.random : 0);
        this.#elementArea = elementArea;
        this.#width = elementArea.getWidth();
        this.#height = elementArea.getHeight();
        this.#framesCounter = new Counter();
        this.#iterationsCounter = new Counter();
        this.#processor = new Processor(this.#elementArea, 16, this.#random, gameDefaults, sceneMetadata);
        this.#renderer = rendererInitializer.initialize(this.#elementArea, 16, context);
        this.#entityManager = new EntityManager(serializedEntities, new GameState(elementArea, this.#random, this.#processor, null));
        const triggerFunction = (x, y) => {
            this.#processor.trigger(x, y);
            this.#renderer.trigger(x, y);
        };
        this.#entities = new SandGameEntities(elementArea.getWidth(), elementArea.getHeight(), this.#entityManager, triggerFunction);
        this.#graphics = new SandGameGraphics(this.#elementArea, this.#entities, this.#random, gameDefaults, triggerFunction);
        this.#overlay = new SandGameOverlay(elementArea.getWidth(), elementArea.getHeight());
        this.#scenario = new SandGameScenario();

        this.#initExtensions(gameDefaults);
        this.#initObjectives();
    }

    #initObjectives() {
        let activeObjectives = [];
        const updateActiveObjectives = () => {
            activeObjectives = this.#scenario.getObjectives().filter(o => {
                return o.isActive() && (typeof o.getConfig().checkHandler === 'function');
            });
        };

        this.#scenario.addOnObjectiveAdded(objective => {
            updateActiveObjectives();
            objective.addOnActiveChanged(() => updateActiveObjectives());
            objective.addOnCompleted(() => updateActiveObjectives());
        });
        this.#onProcessed.push(() => {
            for (let objective of activeObjectives) {
                objective.getConfig().checkHandler(this.#processor.getIteration() - 1);
            }
        });
    }

    #initExtensions(gameDefaults) {
        const gameState = new GameState(this.#elementArea, this.#random, this.#processor, this.#entityManager);
        const extensionsFactory = gameDefaults.getExtensionsFactory();
        const extensions = extensionsFactory(gameState);
        for (const extension of extensions) {
            this.#processor.addExtension(extension);
        }
    }

    getBrushCollection() {
        return this.#processor.getDefaults().getBrushCollection();
    }

    startProcessing() {
        if (this.#processorIntervalHandle === null) {
            const interval = Math.trunc(1000 / Processor.OPT_CYCLES_PER_SECOND);  // ms
            this.#processorIntervalHandle = setInterval(() => this.doProcessing(), interval);
        }
    }

    startRendering() {
        if (this.#rendererIntervalHandle === null) {
            const interval = Math.trunc(1000 / Processor.OPT_FRAMES_PER_SECOND);  // ms
            this.#rendererIntervalHandle = setInterval(() => this.doRendering(), interval);
        }
    }

    stopProcessing() {
        if (this.#processorIntervalHandle !== null) {
            clearInterval(this.#processorIntervalHandle);
            this.#processorIntervalHandle = null;
        }
        this.#iterationsCounter.clear();
    }

    stopRendering() {
        if (this.#rendererIntervalHandle !== null) {
            clearInterval(this.#rendererIntervalHandle);
            this.#rendererIntervalHandle = null;
        }
        this.#framesCounter.clear();
    }

    doProcessing() {
        // TODO: error reporting

        this.#entityManager.performBeforeProcessing();
        this.#processor.next();
        this.#entityManager.performAfterProcessing();

        const t = Date.now();
        this.#iterationsCounter.tick(t);
        for (let func of this.#onProcessed) {
            func(this.#processor.getIteration());
        }
    }

    doRendering() {
        const changedChunks = this.#processor.getChangedChunks();
        try {
            this.#renderer.render(changedChunks);
        } catch (e) {
            this.stopRendering();
            for (let func of this.#onRenderingFailed) {
                func(e);
            }
            return;
        }
        const t = Date.now();
        this.#framesCounter.tick(t);
        for (let func of this.#onRendered) {
            func(changedChunks);
        }
        this.#processor.cleanChangedChunks();
    }

    /**
     *
     * @returns {SandGameGraphics}
     */
    graphics() {
        return this.#graphics;
    }

    /**
     *
     * @returns {SandGameEntities}
     */
    entities() {
        return this.#entities;
    }

    /**
     *
     * @returns {SandGameOverlay}
     */
    overlay() {
        return this.#overlay;
    }

    /**
     *
     * @returns {SandGameScenario}
     */
    scenario() {
        return this.#scenario;
    }

    /**
     *
     * @returns {TemplateBlockPainter}
     */
    blockTemplate() {
        return new TemplateBlockPainter(this.graphics());
    }

    /**
     *
     * @returns {TemplateLayeredPainter}
     */
    layeredTemplate() {
        return new TemplateLayeredPainter(this.#elementArea, this.graphics(), this.#random, this.#processor);
    }

    setBoxedMode() {
        this.#processor.setFallThroughEnabled(false);
        this.#processor.setErasingEnabled(false);
    }

    setFallThroughMode() {
        this.#processor.setFallThroughEnabled(true);
        this.#processor.setErasingEnabled(false);
    }

    setErasingMode() {
        this.#processor.setFallThroughEnabled(false);
        this.#processor.setErasingEnabled(true);
    }

    /**
     *
     * @param handler {function(iteration:number)}
     */
    addOnProcessed(handler) {
        this.#onProcessed.push(handler);
    }

    addOnRendered(handler) {
        this.#onRendered.push(handler);
    }

    addOnRenderingFailed(handler) {
        this.#onRenderingFailed.push(handler);
    }

    getFramesPerSecond() {
        return this.#framesCounter.getValue();
    }

    getIterationsPerSecond() {
        return this.#iterationsCounter.getValue();
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height;
    }

    getChunkSize() {
        return 16;
    }

    /**
     * @returns {Snapshot}
     */
    createSnapshot() {
        let metadata = new SnapshotMetadata();
        metadata.formatVersion = SnapshotMetadata.CURRENT_FORMAT_VERSION;
        metadata.created = new Date().getTime();
        metadata.width = this.#width;
        metadata.height = this.#height;
        metadata.random = this.#random.getState();
        metadata.iteration = this.#processor.getIteration();
        metadata.fallThroughEnabled = this.#processor.isFallThroughEnabled();
        metadata.erasingEnabled = this.#processor.isErasingEnabled();

        let snapshot = new Snapshot();
        snapshot.metadata = metadata;
        snapshot.dataHeads = this.#elementArea.getDataHeads();
        snapshot.dataTails = this.#elementArea.getDataTails();
        snapshot.serializedEntities = this.#entityManager.serializeEntities();
        return snapshot;
    }

    debugElementAt(x, y) {
        if (!this.#elementArea.isValidPosition(x, y)) {
            return 'Out of bounds';
        }

        const elementHead = this.#elementArea.getElementHead(x, y);
        const elementTail = this.#elementArea.getElementTail(x, y);

        function toHex(n) {
            let t = n.toString(16).padStart(8, '0');
            return '0x' + t;
        }
        let hex = toHex(elementHead) + ' ' + toHex(elementTail);

        const json = {
            type: {
                class: ElementHead.getTypeClass(elementHead),
            },
            behaviour: {
                type: ElementHead.getBehaviour(elementHead),
                special: ElementHead.getSpecial(elementHead)
            },
            modifiers: {
                heatModIndex: ElementHead.getHeatModIndex(elementHead),
                fireSource: ElementHead.getFireSource(elementHead),
            },
            temperature: ElementHead.getTemperature(elementHead),
            color: [
                ElementTail.getColorRed(elementTail),
                ElementTail.getColorGreen(elementTail),
                ElementTail.getColorBlue(elementTail)
            ],
            blurType: ElementTail.getBlurType(elementTail),
            burntLevel: ElementTail.getBurntLevel(elementTail),
            heatEffect: ElementTail.getHeatEffect(elementTail)
        };

        if (json.type.class === ElementHead.TYPE_STATIC) {
            json.type.neighbourhood = ElementHead.getTypeModifierSolidNeighbourhoodType(elementHead);
            json.type.body = ElementHead.getTypeModifierSolidBodyId(elementHead);
        }

        let structure = JSON.stringify(json)
                .replaceAll('"', '')
                .replaceAll(',', ', ')
                .replaceAll(':', '=');
        structure = structure.substring(1, structure.length - 1);  // remove {}

        return hex + '\n' + structure;
    }
}
