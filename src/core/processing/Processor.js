import {ElementHead} from "../ElementHead.js";
import {ElementTail} from "../ElementTail";
import {DeterministicRandom} from "../DeterministicRandom.js";
import {ProcessorContext} from "./ProcessorContext.js";
import {ProcessorDefaults} from "./ProcessorDefaults.js";
import {ProcessorModuleFire} from "./ProcessorModuleFire.js";
import {ProcessorModuleMeteor} from "./ProcessorModuleMeteor.js";
import {ProcessorModuleGrass} from "./ProcessorModuleGrass.js";
import {ProcessorModuleFish} from "./ProcessorModuleFish.js";
import {ProcessorModuleTree} from "./ProcessorModuleTree.js";
import {ProcessorModuleWater} from "./ProcessorModuleWater";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
 */
export class Processor extends ProcessorContext {

    /** @type ElementArea */
    #elementArea;

    /** @type number */
    #width;
    /** @type number */
    #height;

    /** @type number */
    #chunkSize;
    /** @type number */
    #horChunkCount;
    /** @type number */
    #verChunkCount;

    /** @type boolean[] */
    #activeChunks
    /** @type boolean[] */
    #changedChunks
    /** @type number[] */
    #chunkLastFullTest;

    /** @type number */
    #iteration = 0;

    /** @type DeterministicRandom */
    #random;

    /** @type boolean */
    #fallThroughEnabled = false;
    /** @type boolean */
    #erasingEnabled = false;

    /** @type ProcessorDefaults */
    #processorDefaults;

    static RANDOM_DATA_COUNT = 32;

    /** @type Uint32Array[] */
    #rndChunkOrder = [];
    /** @type Uint32Array[] */
    #rndChunkXRnd = [];
    /** @type Uint32Array[] */
    #rndChunkXOrder = [];

    /** @type ProcessorModuleWater */
    #moduleWater;
    /** @type ProcessorModuleFire */
    #moduleFire;
    /** @type ProcessorModuleMeteor */
    #moduleMeteor;
    /** @type ProcessorModuleGrass */
    #moduleGrass;
    /** @type ProcessorModuleFish */
    #moduleFish;
    /** @type ProcessorModuleTree */
    #moduleTree;

    constructor(elementArea, chunkSize, random, processorDefaults, sceneMetadata) {
        super();
        this.#elementArea = elementArea;
        this.#width = elementArea.getWidth();
        this.#height = elementArea.getHeight();

        this.#chunkSize = chunkSize;
        if (this.#chunkSize > 255) {
            throw 'Chunk size limit: 255';
        }
        this.#horChunkCount = Math.ceil(this.#width / this.#chunkSize);
        this.#verChunkCount = Math.ceil(this.#height / this.#chunkSize);
        this.#activeChunks = new Array(this.#horChunkCount * this.#verChunkCount).fill(true);
        this.#changedChunks = new Array(this.#horChunkCount * this.#verChunkCount).fill(true);
        this.#chunkLastFullTest = new Array(this.#horChunkCount * this.#verChunkCount).fill(-1);

        let rndDataRandom = new DeterministicRandom(0);
        this.#rndChunkOrder = Processor.#generateArrayOfOrderData(
            Processor.RANDOM_DATA_COUNT, this.#horChunkCount, rndDataRandom);
        this.#rndChunkXRnd = Processor.#generateArrayOfRandomData(
            Processor.RANDOM_DATA_COUNT, this.#chunkSize, this.#chunkSize, rndDataRandom);
        this.#rndChunkXOrder = Processor.#generateArrayOfOrderData(
            Processor.RANDOM_DATA_COUNT, this.#chunkSize, rndDataRandom);

        this.#random = random;
        this.#processorDefaults = processorDefaults;

        this.#moduleWater = new ProcessorModuleWater(elementArea, random, this);
        this.#moduleFire = new ProcessorModuleFire(elementArea, random, this);
        this.#moduleMeteor = new ProcessorModuleMeteor(elementArea, random, this);
        this.#moduleGrass = new ProcessorModuleGrass(elementArea, random, this);
        this.#moduleFish = new ProcessorModuleFish(elementArea, random, this);
        this.#moduleTree = new ProcessorModuleTree(elementArea, random, this);

        if (sceneMetadata) {
            this.#iteration = sceneMetadata.iteration;
            this.#fallThroughEnabled = sceneMetadata.fallThroughEnabled;
            this.#erasingEnabled = sceneMetadata.erasingEnabled;
        }
    }

    static #shuffle(array, iterations, random) {
        for (let i = 0; i < iterations; i++) {
            let a = random.nextInt(array.length);
            let b = random.nextInt(array.length);
            [array[a], array[b]] = [array[b], array[a]];
        }
    }

    static #generateArrayOfOrderData(arrayLength, count, random) {
        let data = Processor.#generateOrderData(count);
        Processor.#shuffle(data, arrayLength, random);

        let array = Array(arrayLength);
        for (let i = 0; i < arrayLength; i++) {
            Processor.#shuffle(data, Math.ceil(arrayLength / 4), random);
            array[i] = new Uint8Array(data);
        }
        return array;
    }

    static #generateOrderData(count) {
        let array = new Uint8Array(count);
        for (let i = 0; i < count; i++) {
            array[i] = i;
        }
        return array;
    }

    static #generateArrayOfRandomData(arrayLength, count, max, random) {
        let array = Array(arrayLength);
        for (let i = 0; i < arrayLength; i++) {
            array[i] = Processor.#generateRandomData(count, max, random);
        }
        return array;
    }

    static #generateRandomData(count, max, random) {
        let array = new Uint8Array(count);
        for (let i = 0; i < count; i++) {
            array[i] = random.nextInt(max);
        }
        return array;
    }

    getIteration() {
        return this.#iteration;
    }

    getDefaults() {
        return this.#processorDefaults;
    }

    setFallThroughEnabled(enabled) {
        this.#fallThroughEnabled = enabled;
    }

    setErasingEnabled(enabled) {
        this.#erasingEnabled = enabled;
    }

    isFallThroughEnabled() {
        return this.#fallThroughEnabled;
    }

    isErasingEnabled() {
        return this.#erasingEnabled;
    }

    trigger(x, y) {
        const cx = Math.floor(x / this.#chunkSize);
        const cy = Math.floor(y / this.#chunkSize);
        const chunkIndex = cy * this.#horChunkCount + cx;
        this.#activeChunks[chunkIndex] = true;
        // this.#changedChunks[chunkIndex] = true;
    }

    getActiveChunks() {
        return this.#activeChunks;
    }

    getChangedChunks() {
        return this.#changedChunks;
    }

    cleanChangedChunks() {
        this.#changedChunks.fill(false);
    }

    next() {
        const activeChunks = Array.from(this.#activeChunks);
        this.#activeChunks.fill(false);

        // TODO: try extra temperature active chunks with extra loop
        // element temperature is processed once per 9 iterations...
        //   x
        // y 1 2 3
        //   4 5 6
        //   7 8 9
        const temperatureProcessingMod = this.#iteration % 9;
        const temperatureProcessingMod3Y = Math.trunc(temperatureProcessingMod / 3);
        const temperatureProcessingMod3X = temperatureProcessingMod % 3;

        for (let cy = this.#verChunkCount - 1; cy >= 0; cy--) {
            const cyTop = cy * this.#chunkSize;
            const cyBottom = Math.min((cy + 1) * this.#chunkSize - 1, this.#height - 1);

            const chunkOrder = this.#rndChunkOrder[this.#random.nextInt(Processor.RANDOM_DATA_COUNT)];
            const fullChunkLoop = this.#random.nextInt(2) === 0;

            const chunkActiveElements = new Uint16Array(this.#horChunkCount);

            for (let y = cyBottom; y >= cyTop; y--) {
                for (let i = 0; i < this.#horChunkCount; i++) {
                    const cx = chunkOrder[i];
                    const chunkIndex = cy * this.#horChunkCount + cx;

                    const idx = this.#random.nextInt(Processor.RANDOM_DATA_COUNT);
                    const chunkXOder = (fullChunkLoop) ? this.#rndChunkXOrder[idx] : this.#rndChunkXRnd[idx];

                    if (activeChunks[chunkIndex]) {
                        // standard iteration
                        let activeElements = chunkActiveElements[cx];
                        for (let j = 0; j < this.#chunkSize; j++) {
                            let x = cx * this.#chunkSize + chunkXOder[j];
                            if (x < this.#width) {
                                const processTemperature = (x % 3 === temperatureProcessingMod3X)
                                        && (y % 3 === temperatureProcessingMod3Y);
                                const activeElement = this.#nextPoint(x, y, processTemperature);
                                if (activeElement) {
                                    activeElements++;
                                }
                            }
                        }
                        chunkActiveElements[cx] = activeElements;
                    }
                }
            }

            // fast check deactivated chunks (borders only - if they have active neighbours)
            for (let cx = 0; cx < this.#horChunkCount; cx++) {
                const chunkIndex = cy * this.#horChunkCount + cx;
                if (!activeChunks[chunkIndex]) {
                    if (this.#fastTest(cx, cy, activeChunks)) {
                        // wake up chunk
                        activeChunks[chunkIndex] = true;
                        chunkActiveElements[cx] = 1;
                    }
                }
            }

            // deactivate chunks if possible
            if (fullChunkLoop) {
                for (let cx = 0; cx < this.#horChunkCount; cx++) {
                    const chunkIndex = cy * this.#horChunkCount + cx;
                    if (activeChunks[chunkIndex] && chunkActiveElements[cx] === 0) {
                        // full test before deactivation

                        // this test is quite expensive, so we don't want to perform it every time
                        const lastFullTest = this.#chunkLastFullTest[chunkIndex];
                        if (lastFullTest === -1 || this.#iteration - lastFullTest >= 10) {
                            if (!this.#fullTest(cx, cy)) {
                                activeChunks[chunkIndex] = false;
                                this.#changedChunks[chunkIndex] = true;  // last repaint
                                this.#chunkLastFullTest[chunkIndex] = this.#iteration;
                            }
                        }
                    }
                }
            }
        }

        // erasing mode
        if (this.#erasingEnabled) {
            const defaultElement = this.#processorDefaults.getDefaultElement();
            for (let x = 0; x < this.#width; x++) {
                this.#elementArea.setElement(x, 0, defaultElement);
                this.#elementArea.setElement(x, this.#height - 1, defaultElement);
            }
            for (let y = 1; y < this.#height - 1; y++) {
                this.#elementArea.setElement(0, y, defaultElement);
                this.#elementArea.setElement(this.#width - 1, y, defaultElement);
            }
        }

        // merge active chunks
        for (let i = 0; i < this.#horChunkCount * this.#verChunkCount; i++) {
            let active = activeChunks[i];
            if (active) {
                this.#activeChunks[i] = true;
                this.#changedChunks[i] = true;
            }
        }

        this.#iteration++;
    }

    #fastTest(cx, cy, activeChunks) {
        // left
        if (cx > 0 && activeChunks[(cy * this.#horChunkCount) + cx - 1]) {
            const x = cx * this.#chunkSize;
            const my = Math.min((cy + 1) * this.#chunkSize, this.#height);
            for (let y = cy * this.#chunkSize; y < my; y++) {
                if (this.#testPoint(x, y)) {
                    return true;
                }
            }
        }

        // right
        if (cx < (this.#horChunkCount - 1) && activeChunks[(cy * this.#horChunkCount) + cx + 1]) {
            const x = Math.min(((cx + 1) * this.#chunkSize) - 1, this.#width - 1);
            const my = Math.min((cy + 1) * this.#chunkSize, this.#height);
            for (let y = cy * this.#chunkSize; y < my; y++) {
                if (this.#testPoint(x, y)) {
                    return true;
                }
            }
        }

        // top
        if ((cy > 0) && activeChunks[((cy - 1) * this.#horChunkCount) + cx]
            || (this.#fallThroughEnabled
                && cy === 0
                && activeChunks[((this.#verChunkCount - 1) * this.#horChunkCount) + cx])) {

            const y = cy * this.#chunkSize;
            const mx = Math.min((cx + 1) * this.#chunkSize, this.#width);
            for (let x = cx * this.#chunkSize; x < mx; x++) {
                if (this.#testPoint(x, y)) {
                    return true;
                }
            }
        }

        // bottom
        if (cy < (this.#verChunkCount - 1) && activeChunks[((cy + 1) * this.#horChunkCount) + cx]) {
            const y = (cy + 1) * this.#chunkSize - 1;
            const mx = Math.min((cx + 1) * this.#chunkSize, this.#width);
            for (let x = cx * this.#chunkSize; x < mx; x++) {
                if (this.#testPoint(x, y)) {
                    return true;
                }
            }
        }
    }

    #fullTest(cx, cy) {
        const mx = Math.min((cx + 1) * this.#chunkSize, this.#width);
        const my = Math.min((cy + 1) * this.#chunkSize, this.#height);
        for (let y = cy * this.#chunkSize; y < my; y++) {
            for (let x = cx * this.#chunkSize; x < mx; x++) {
                if (this.#testPoint(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    #testPoint(x, y) {
        const elementHead = this.#elementArea.getElementHead(x, y);

        if (ElementHead.getTemperature(elementHead) > 0) {
            return true;
        }
        if (this.#testMovingBehaviour(elementHead, x, y)) {
            return true;
        }
        switch (ElementHead.getBehaviour(elementHead)) {
            case ElementHead.BEHAVIOUR_NONE:
            case ElementHead.BEHAVIOUR_SOIL:
            case ElementHead.BEHAVIOUR_TREE_TRUNK:
                return false;
            default:
                return true;
        }
    }

    /**
     *
     * @param elementHead
     * @param x {number}
     * @param y {number}
     * @returns {boolean}
     */
    #testMovingBehaviour(elementHead, x, y) {
        const type = ElementHead.getTypeClass(elementHead);
        switch (type) {
            case ElementHead.TYPE_AIR:
            case ElementHead.TYPE_STATIC:
                // no action
                return false;

            case ElementHead.TYPE_POWDER:
            case ElementHead.TYPE_POWDER_FLOATING:
            case ElementHead.TYPE_POWDER_WET:
                if (ElementHead.getTypeModifierPowderSliding(elementHead)) {
                    return true;
                } else {
                    return this.#testMove(elementHead, x, y, x, y + 1);
                }

            case ElementHead.TYPE_FLUID:
                return this.#testMove(elementHead, x, y, x, y + 1)
                        || this.#testMove(elementHead, x, y, x + 1, y)
                        || this.#testMove(elementHead, x, y, x - 1, y);

            case ElementHead.TYPE_GAS:
                return this.#testMove(elementHead, x, y, x, y - 1)
                    || this.#testMove(elementHead, x, y, x + 1, y)
                    || this.#testMove(elementHead, x, y, x - 1, y);

            default:
                return true;
        }
        throw "Unknown element type: " + type;
    }

    #testMove(elementHead, x, y, x2, y2) {
        if (!this.#elementArea.isValidPosition(x2, y2)) {
            if (this.#fallThroughEnabled && y === this.#height - 1) {
                // try fall through
                y2 = 0;
                if (!this.#elementArea.isValidPosition(x2, y2)) {
                    return false;
                }
                // continue move...
            } else {
                return false;
            }
        }

        let elementHead2 = this.#elementArea.getElementHead(x2, y2);
        return this.#canMove(elementHead, elementHead2);
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param processTemperature {boolean}
     * @return {boolean} active
     */
    #nextPoint(x, y, processTemperature) {
        const elementHead = this.#elementArea.getElementHead(x, y);
        const moved = this.#performMovingBehaviour(elementHead, x, y);

        if (moved) {
            return true;
        }

        const behaviour = ElementHead.getBehaviour(elementHead);
        let active = false;
        switch (behaviour) {
            case ElementHead.BEHAVIOUR_NONE:
            case ElementHead.BEHAVIOUR_SOIL:
                break;
            case ElementHead.BEHAVIOUR_WATER:
                if (this.#moduleWater.behaviourWater(elementHead, x, y)) {
                    active = ElementHead.getTemperature(elementHead) > 0;
                    processTemperature = false;
                }
                break;
            case ElementHead.BEHAVIOUR_FIRE:
                this.#moduleFire.behaviourFire(elementHead, x, y);
                active = true;
                processTemperature = false;
                break;
            case ElementHead.BEHAVIOUR_GRASS:
                this.#moduleGrass.behaviourGrass(elementHead, x, y);
                active = true;
                break;
            case ElementHead.BEHAVIOUR_TREE:
                this.#moduleTree.behaviourTree(elementHead, x, y);
                active = true;
                break;
            case ElementHead.BEHAVIOUR_TREE_LEAF:
                this.#moduleTree.behaviourTreeLeaf(elementHead, x, y);
                active = true;
                break;
            case ElementHead.BEHAVIOUR_TREE_TRUNK:
                break;
            case ElementHead.BEHAVIOUR_TREE_ROOT:
                this.#moduleTree.behaviourTreeRoot(elementHead, x, y);
                active = true;
                break;
            case ElementHead.BEHAVIOUR_FIRE_SOURCE:
                this.#moduleFire.behaviourFireSource(elementHead, x, y);
                active = true;
                processTemperature = false;
                break;
            case ElementHead.BEHAVIOUR_METEOR:
                this.#moduleMeteor.behaviourMeteor(elementHead, x, y);
                active = true;
                processTemperature = false;
                break;
            case ElementHead.BEHAVIOUR_FISH:
                this.#moduleFish.behaviourFish(elementHead, x, y);
                processTemperature = false;
                active = true;
                break;
            case ElementHead.BEHAVIOUR_FISH_BODY:
                this.#moduleFish.behaviourFishBody(elementHead, x, y);
                active = true;
                break;
            default:
                throw "Unknown element behaviour: " + behaviour;
        }

        if (processTemperature) {
            const temperatureRelatedActivity = this.#temperature(elementHead, x, y);
            return active || temperatureRelatedActivity;
        } else {
            return active
        }
    }

    /**
     *
     * @param elementHead
     * @param x {number}
     * @param y {number}
     * @return boolean
     */
    #temperature(elementHead, x, y) {
        const temp = ElementHead.getTemperature(elementHead);

        if (temp === 0) {
            const heatModIndex = ElementHead.getHeatModIndex(elementHead);
            if (temp < ElementHead.hmiToHardeningTemperature(heatModIndex)) {
                this.#tryHardening(elementHead, x, y, heatModIndex);
                return true;
            }
            return false;
        }

        // conduct temperature

        let tx = x, ty = y;
        switch (this.#random.nextInt(4)) {
            case 0: ty--; break;  // Up
            case 1: tx++; break;  // Right
            case 2: ty++; break;  // Down
            case 3: tx--; break;  // Left
        }

        const heatModIndex = ElementHead.getHeatModIndex(elementHead);
        const heatLoss = (this.#random.nextInt(10000) < ElementHead.hmiToHeatLossChanceTo10000(heatModIndex));
        let newTemp;

        if (this.#elementArea.isValidPosition(tx, ty)) {
            const targetElementHead = this.#elementArea.getElementHead(tx, ty);
            const targetTemp = ElementHead.getTemperature(targetElementHead);

            const conductiveIndex = ElementHead.hmiToConductiveIndex(heatModIndex);
            newTemp = Math.trunc((conductiveIndex * targetTemp) + (1 - conductiveIndex) * temp);
            if (heatLoss) {
                newTemp = Math.max(newTemp - 1, 0);
            }

            if (temp - newTemp !== 0) {
                // limit max absolute change - it will look more natural...
                if (temp - newTemp > 24) {
                    newTemp = temp - 24;
                } else if (temp - newTemp < -24) {
                    newTemp = temp + 24;
                }

                elementHead = ElementHead.setTemperature(elementHead, newTemp);
                this.#elementArea.setElementHead(x, y, elementHead);

                let newTargetTemp = Math.trunc(targetTemp + (temp - newTemp));
                if (heatLoss) {
                    newTargetTemp = newTemp - 1;
                }
                newTargetTemp = Math.max(newTargetTemp, 0);
                this.#elementArea.setElementHead(tx, ty, ElementHead.setTemperature(targetElementHead, newTargetTemp));
                this.trigger(tx, ty);
            }
        } else {
            if (heatLoss) {
                newTemp = Math.max(temp - 1, 0);
                elementHead = ElementHead.setTemperature(elementHead, newTemp);
                this.#elementArea.setElementHead(x, y, elementHead);
            }
        }

        // self-ignition
        const chanceToIgnite = ElementHead.hmiToSelfIgnitionChanceTo10000(heatModIndex);
        if (newTemp > 100 && chanceToIgnite > 0) {
            if (ElementHead.getBehaviour(elementHead) === ElementHead.BEHAVIOUR_FIRE_SOURCE) {
                // already in fire
            } else {
                if (this.#random.nextInt(10000) < chanceToIgnite) {
                    this.#moduleFire.ignite(elementHead, x, y, heatModIndex);
                    return true;
                }
            }
        }

        // melting
        if (newTemp > ElementHead.hmiToMeltingTemperature(heatModIndex)) {
            elementHead = ElementHead.setType(elementHead, ElementHead.TYPE_FLUID);
            elementHead = ElementHead.setHeatModIndex(elementHead, ElementHead.hmiToMeltingHMI(heatModIndex));

            let elementTail = this.#elementArea.getElementTail(x, y);
            elementTail = ElementTail.setBlurType(elementTail, ElementTail.BLUR_TYPE_1);

            this.#elementArea.setElementHeadAndTail(x, y, elementHead, elementTail);
            return true;
        }

        // hardening
        if (newTemp < ElementHead.hmiToHardeningTemperature(heatModIndex)) {
            this.#tryHardening(elementHead, x, y, heatModIndex);
        }

        return true;
    }

    #tryHardening(elementHead, x, y, heatModIndex) {
        // there must be a solid element nearby
        if (this.#findHardeningSupport(x, y)) {
            elementHead = ElementHead.setType(elementHead, ElementHead.TYPE_STATIC);
            elementHead = ElementHead.setHeatModIndex(elementHead, ElementHead.hmiToHardeningHMI(heatModIndex));

            let elementTail = this.#elementArea.getElementTail(x, y);
            elementTail = ElementTail.setBlurType(elementTail, ElementTail.BLUR_TYPE_NONE);

            this.#elementArea.setElementHeadAndTail(x, y, elementHead, elementTail);
        }
    }

    #findHardeningSupport(x, y) {
        // below
        if (y !== this.#height - 1) {
            if (this.#isHardeningSupport(this.#elementArea.getElementHead(x, y + 1))) {
                return true;
            }
        } else {
            // bottom
            if (!this.#fallThroughEnabled && !this.#erasingEnabled) {
                return true;
            }
        }

        // left
        if (this.#elementArea.isValidPosition(x - 1, y)) {
            if (this.#isHardeningSupport(this.#elementArea.getElementHead(x - 1, y))) {
                return true;
            }
        }

        // right
        if (this.#elementArea.isValidPosition(x + 1, y)) {
            if (this.#isHardeningSupport(this.#elementArea.getElementHead(x + 1, y))) {
                return true;
            }
        }

        return false;  // support not found
    }

    #isHardeningSupport(targetElementHead) {
        const typeClass = ElementHead.getTypeClass(targetElementHead);
        if (typeClass > ElementHead.TYPE_FLUID) {
            return true;
        }
        return false;
    }

    /**
     *
     * @param elementHead
     * @param x {number}
     * @param y {number}
     * @returns {boolean}
     */
    #performMovingBehaviour(elementHead, x, y) {
        const type = ElementHead.getTypeClass(elementHead);
        switch (type) {
            case ElementHead.TYPE_AIR:
                // no action
                return false;

            case ElementHead.TYPE_POWDER:
            case ElementHead.TYPE_POWDER_WET:
            case ElementHead.TYPE_POWDER_FLOATING:
                if (this.#move(elementHead, x, y, x, y + 1)) {
                    // moved down

                    if (y % 2 === 0) {
                        this.#wake(x - 1, y + 1, 0);
                    } else {
                        this.#wake(x + 1, y + 1, 1);
                    }

                    this.#wake(x, y + 1, y % 2);

                    if (y % 2 === 0) {
                        this.#wake(x + 1, y, 0);
                    } else {
                        this.#wake(x - 1, y, 1);
                    }

                    return true;
                } else {
                    if (ElementHead.getTypeModifierPowderSliding(elementHead) === 1) {
                        const momentum = ElementHead.getTypeModifierPowderMomentum(elementHead);

                        const r = this.#random.nextInt(1000000);
                        if (r > Processor.#asMomentumMoveInMillion(momentum)) {
                            // stop - lost momentum
                            this.#elementArea.setElementHead(x, y, ElementHead.setTypeModifierPowderSliding(elementHead, 0));
                            return false;
                        }

                        const direction = ElementHead.getTypeModifierPowderDirection(elementHead);
                        this.#wake(x, y + 1, direction);

                        const directionX = (direction === 0) ? -1 : 1;
                        if (this.#move(elementHead, x, y, x + directionX, y)) {
                            // moved horizontally
                            this.#wake(x + directionX, y + 1, direction);
                            this.#wake(x - directionX, y, direction);
                            return true;
                        } else {
                            // stop - nowhere to go
                            this.#wake(x + directionX, y + 1, direction);
                            this.#elementArea.setElementHead(x, y, ElementHead.setTypeModifierPowderSliding(elementHead, 0));
                            return false;
                        }
                    }
                    return false;
                }
                return false;

            case ElementHead.TYPE_FLUID:
                // slow moving fluid
                // if (!this.#move(elementHead, x, y, x, y + 1)) {
                //     let rnd = this.#random.nextInt(2);
                //     if (rnd === 0) {
                //         return this.#move(elementHead, x, y, x + 1, y)
                //     } else {
                //         return this.#move(elementHead, x, y, x - 1, y)
                //     }
                // }
                // return true;

                // fast moving fluid (it can move by 3)
                if (!this.#move(elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        if (this.#move(elementHead, x, y, x + 1, y)) {
                            this.#wake(x + 1, y + 1, 1);
                            if (this.#move(elementHead, x + 1, y, x + 2, y)) {
                                if (this.#move(elementHead, x + 2, y, x + 3, y)) {
                                    this.trigger(x + 3, y);
                                } else {
                                    this.trigger(x + 2, y);
                                }
                            }
                            return true;
                        }
                        return false;
                    } else {
                        if (this.#move(elementHead, x, y, x - 1, y)) {
                            this.#wake(x - 1, y + 1, 0);
                            if (this.#move(elementHead, x - 1, y, x - 2, y)) {
                                if (this.#move(elementHead, x - 2, y, x - 3, y)) {
                                    this.trigger(x - 3, y);
                                } else {
                                    this.trigger(x - 2, y);
                                }
                            }
                            return true;
                        }
                        return false;
                    }
                }
                return true;

            case ElementHead.TYPE_GAS:
                let rnd = this.#random.nextInt(8);
                if (rnd === 0 || rnd === 2) {
                    if (this.#move(elementHead, x, y, x, y - 1)) {
                        // moved up
                        this.trigger(x, y - 1);
                        return true;
                    }
                }
                if (rnd === 3) {
                    if (this.#move(elementHead, x, y, x + 1, y)) {
                        // moved right
                        this.trigger(x + 1, y);
                        return true;
                    }
                }
                if (rnd === 4) {
                    if (this.#move(elementHead, x, y, x - 1, y)) {
                        // moved left
                        this.trigger(x - 1, y);
                        return true;
                    }
                }
                return false;

            case ElementHead.TYPE_STATIC:
            case ElementHead.TYPE_EFFECT:
                // no action
                return false;
        }
        throw "Unknown element type: " + type;
    }

    #move(elementHead, x, y, x2, y2) {
        if (!this.#elementArea.isValidPosition(x2, y2)) {
            if (this.#fallThroughEnabled && y === this.#height - 1) {
                // try fall through
                y2 = 0;
                if (!this.#elementArea.isValidPosition(x2, y2)) {
                    return false;
                }
                // continue move...
            } else {
                return false;
            }
        }

        const elementHead2 = this.#elementArea.getElementHead(x2, y2);
        const elementType2 = ElementHead.getTypeClass(elementHead2);
        if (elementType2 === ElementHead.TYPE_POWDER_FLOATING || elementType2 === ElementHead.TYPE_POWDER) {
            return false;
        }

        const elementType1 = ElementHead.getTypeClass(elementHead);
        if (elementType1 > elementType2) {
            // move

            if (elementType1 === ElementHead.TYPE_POWDER && elementType2 === ElementHead.TYPE_FLUID) {
                // element may cover element2

                const elementHeadWithAbsorbedFluid = ElementHead.setTypeClass(elementHead, ElementHead.TYPE_POWDER_WET);
                const elementTail = this.#elementArea.getElementTail(x, y);

                // sometimes element2 will not be covered - it looks better
                if (this.#random.nextInt(100) > 9) {
                    this.#elementArea.setElement(x, y, this.#processorDefaults.getDefaultElement());
                } else {
                    const elementTail2 = this.#elementArea.getElementTail(x2, y2);
                    this.#elementArea.setElementHead(x, y, elementHead2);
                    this.#elementArea.setElementTail(x, y, elementTail2);
                }
                this.#elementArea.setElementHead(x2, y2, elementHeadWithAbsorbedFluid);
                this.#elementArea.setElementTail(x2, y2, elementTail);

            } else {
                // swap

                const elementTail = this.#elementArea.getElementTail(x, y);
                const elementTail2 = this.#elementArea.getElementTail(x2, y2);

                this.#elementArea.setElementHead(x2, y2, elementHead);
                this.#elementArea.setElementHead(x, y, elementHead2);
                this.#elementArea.setElementTail(x2, y2, elementTail);
                this.#elementArea.setElementTail(x, y, elementTail2);
            }
            return true;
        }
        return false;
    }

    #canMove(elementHead1, elementHead2) {
        const elementType2 = ElementHead.getTypeClass(elementHead2);
        if (elementType2 === ElementHead.TYPE_POWDER_FLOATING || elementType2 === ElementHead.TYPE_POWDER) {
            return false;
        }

        const elementType1 = ElementHead.getTypeClass(elementHead1);
        return elementType1 > elementType2;
    }

    #wake(x, y, direction) {
        if (this.#elementArea.isValidPosition(x, y)) {
            let elementHead = this.#elementArea.getElementHead(x, y);
            const type = ElementHead.getTypeClass(elementHead);
            if (type === ElementHead.TYPE_POWDER
                    || type === ElementHead.TYPE_POWDER_WET
                    || type === ElementHead.TYPE_POWDER_FLOATING) {

                const momentum = ElementHead.getTypeModifierPowderMomentum(elementHead);
                if (momentum === 0) {
                    return;  // never wake up
                }

                const directionX = (direction === 0) ? -1 : 1;
                if (this.#elementArea.isValidPosition(x + directionX, y)) {
                    const nextElementHead = this.#elementArea.getElementHead(x + directionX, y);
                    if (!this.#canMove(elementHead, nextElementHead)) {
                        return;  // target element has no space to move
                    }
                }

                const r = this.#random.nextInt(1000000);
                if (r > Processor.#asMomentumWakeupInMillion(momentum)) {
                    return;  // not this time
                }

                elementHead = ElementHead.setTypeModifierPowderSliding(elementHead, 1);
                elementHead = ElementHead.setTypeModifierPowderDirection(elementHead, direction);
                this.#elementArea.setElementHead(x, y, elementHead);
            }
        }
    }


    static #asMomentumMoveInMillion(momentum) {
        return [0, 400000, 600000, 700000, 700000, 800000, 950000, 950000][momentum];  // none .. almost always
    }

    static #asMomentumWakeupInMillion(momentum) {
        return [0, 400000, 400000, 400000, 600000, 600000, 850000, 900000][momentum];  // never .. almost always
    }
}