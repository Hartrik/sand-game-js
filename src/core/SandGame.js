import {Counter} from "./Counter.js";
import {DeterministicRandom} from "./DeterministicRandom.js";
import {Element} from "./Element.js";
import {ElementHead} from "./ElementHead.js";
import {ElementTail} from "./ElementTail.js";
import {ElementArea} from "./ElementArea.js";
import {Processor} from "./processing/Processor.js";
import {ProcessorExtensionSpawnFish} from "./processing/ProcessorExtensionSpawnFish.js";
import {ProcessorExtensionSpawnGrass} from "./processing/ProcessorExtensionSpawnGrass.js";
import {ProcessorExtensionSpawnTree} from "./processing/ProcessorExtensionSpawnTree.js";
import {Renderer} from "./rendering/Renderer.js";
import {RendererInitializer} from "./rendering/RendererInitializer.js";
import {SandGameGraphics} from "./SandGameGraphics.js";
import {SandGameOverlay} from "./SandGameOverlay";
import {SandGameScenario} from "./SandGameScenario";
import {Snapshot} from "./Snapshot.js";
import {SnapshotMetadata} from "./SnapshotMetadata.js";
import {TemplateBlockPainter} from "./TemplateBlockPainter.js";
import {TemplateLayeredPainter} from "./TemplateLayeredPainter.js";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-08
 */
export class SandGame {

    /** @type ElementArea */
    #elementArea;

    /** @type number */
    #width;

    /** @type number */
    #height;

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

    /** @type function[] */
    #onProcessed = [];

    /** @type SandGameOverlay */
    #overlay;

    /** @type SandGameScenario */
    #scenario;

    /**
     *
     * @param elementArea {ElementArea}
     * @param sceneMetadata {SnapshotMetadata|null}
     * @param processorDefaults {ProcessorDefaults}
     * @param context {CanvasRenderingContext2D|WebGLRenderingContext}
     * @param rendererInitializer {RendererInitializer}
     */
    constructor(elementArea, sceneMetadata, processorDefaults, context, rendererInitializer) {
        this.#elementArea = elementArea;
        this.#random = new DeterministicRandom((sceneMetadata) ? sceneMetadata.random : 0);
        this.#framesCounter = new Counter();
        this.#iterationsCounter = new Counter();
        this.#processor = new Processor(this.#elementArea, 16, this.#random, processorDefaults, sceneMetadata);
        this.#renderer = rendererInitializer.initialize(this.#elementArea, 16, context);
        this.#width = elementArea.getWidth();
        this.#height = elementArea.getHeight();
        this.#overlay = new SandGameOverlay(elementArea.getWidth(), elementArea.getHeight());
        this.#scenario = new SandGameScenario();

        let grassSpawningExt = new ProcessorExtensionSpawnGrass(this.#elementArea, this.#random, this.#processor);
        this.#onProcessed.push(() => grassSpawningExt.run());
        let treeSpawningExt = new ProcessorExtensionSpawnTree(this.#elementArea, this.#random, this.#processor);
        this.#onProcessed.push(() => treeSpawningExt.run());
        let fishSpawningExt = new ProcessorExtensionSpawnFish(this.#elementArea, this.#random, this.#processor);
        this.#onProcessed.push(() => fishSpawningExt.run());
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
        this.#processor.next();
        const t = Date.now();
        this.#iterationsCounter.tick(t);
        for (let func of this.#onProcessed) {
            func();
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
        const defaults = this.#processor.getDefaults();
        return new SandGameGraphics(this.#elementArea, this.#random, defaults, (x, y) => {
            this.#processor.trigger(x, y);
            this.#renderer.trigger(x, y);
        });
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

    copyStateTo(targetSandGame) {
        let sourceY0;
        let targetY0;
        if (targetSandGame.#height >= this.#height) {
            sourceY0 = 0;
            targetY0 = targetSandGame.#height - this.#height
        } else {
            sourceY0 = this.#height - targetSandGame.#height;
            targetY0 = 0;
        }

        for (let y = 0; y < Math.min(this.#height, targetSandGame.#height); y++) {
            for (let x = 0; x < Math.min(this.#width, targetSandGame.#width); x++) {
                let elementHead = this.#elementArea.getElementHead(x, y + sourceY0);
                let elementTail = this.#elementArea.getElementTail(x, y + sourceY0);
                targetSandGame.#elementArea.setElementHead(x, targetY0 + y, elementHead);
                targetSandGame.#elementArea.setElementTail(x, targetY0 + y, elementTail);
            }
        }
        targetSandGame.#processor.setFallThroughEnabled(this.#processor.isFallThroughEnabled());
        targetSandGame.#processor.setErasingEnabled(this.#processor.isErasingEnabled());
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
                'class': ElementHead.getTypeClass(elementHead)
            },
            behaviour: {
                type: ElementHead.getBehaviour(elementHead),
                special: ElementHead.getSpecial(elementHead)
            },
            modifiers: {
                flammableType: ElementHead.getFlammableType(elementHead),
                flameHeatType: ElementHead.getFlameHeatType(elementHead),
                burnableType: ElementHead.getBurnableType(elementHead),
                conductivityType: ElementHead.getConductivityType(elementHead),
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

        let structure = JSON.stringify(json)
                .replaceAll('"', '')
                .replaceAll(',', ', ')
                .replaceAll(':', '=');
        structure = structure.substring(1, structure.length - 1);  // remove {}

        return hex + '\n' + structure;
    }
}
