import {ElementHead} from "./ElementHead.js";
import {DeterministicRandom} from "./DeterministicRandom.js";
import {ProcessorContext} from "./ProcessorContext.js";
import {ProcessorModuleFire} from "./ProcessorModuleFire.js";
import {ProcessorModuleMeteor} from "./ProcessorModuleMeteor.js";
import {ProcessorModuleGrass} from "./ProcessorModuleGrass.js";
import {ProcessorModuleFish} from "./ProcessorModuleFish.js";
import {ProcessorModuleTree} from "./ProcessorModuleTree.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
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

    /** @type number */
    #iteration = 0;

    /** @type DeterministicRandom */
    #random;

    /** @type boolean */
    #fallThroughEnabled = false;
    /** @type boolean */
    #erasingEnabled = false;

    /** @type Element */
    #defaultElement;

    static RANDOM_DATA_COUNT = 32;

    /** @type Uint32Array[] */
    #rndChunkOrder = [];
    /** @type Uint32Array[] */
    #rndChunkXRnd = [];
    /** @type Uint32Array[] */
    #rndChunkXOrder = [];

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

    constructor(elementArea, chunkSize, random, defaultElement, sceneMetadata) {
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

        let rndDataRandom = new DeterministicRandom(0);
        this.#rndChunkOrder = Processor.#generateArrayOfOrderData(
            Processor.RANDOM_DATA_COUNT, this.#horChunkCount, rndDataRandom);
        this.#rndChunkXRnd = Processor.#generateArrayOfRandomData(
            Processor.RANDOM_DATA_COUNT, this.#chunkSize, this.#chunkSize, rndDataRandom);
        this.#rndChunkXOrder = Processor.#generateArrayOfOrderData(
            Processor.RANDOM_DATA_COUNT, this.#chunkSize, rndDataRandom);

        this.#random = random;
        this.#defaultElement = defaultElement;

        this.#moduleFire = new ProcessorModuleFire(elementArea, random, defaultElement);
        this.#moduleMeteor = new ProcessorModuleMeteor(elementArea, random, defaultElement);
        this.#moduleGrass = new ProcessorModuleGrass(elementArea, random, defaultElement);
        this.#moduleFish = new ProcessorModuleFish(elementArea, random, defaultElement);
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

    getDefaultElement() {
        return this.#defaultElement;
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
    }

    getActiveChunks() {
        return this.#activeChunks;
    }

    next() {
        const activeChunks = Array.from(this.#activeChunks);
        this.#activeChunks.fill(false);

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
                                let activeElement = this.#nextPoint(x, y);
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
                        activeChunks[chunkIndex] = false;
                    }
                }
            }
        }

        // erasing mode
        if (this.#erasingEnabled) {
            for (let x = 0; x < this.#width; x++) {
                this.#elementArea.setElement(x, 0, this.#defaultElement);
                this.#elementArea.setElement(x, this.#height - 1, this.#defaultElement);
            }
            for (let y = 1; y < this.#height - 1; y++) {
                this.#elementArea.setElement(0, y, this.#defaultElement);
                this.#elementArea.setElement(this.#width - 1, y, this.#defaultElement);
            }
        }

        // merge active chunks
        for (let i = 0; i < this.#horChunkCount * this.#verChunkCount; i++) {
            this.#activeChunks[i] |= activeChunks[i];
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

    #testPoint(x, y) {
        const elementHead = this.#elementArea.getElementHead(x, y);
        return elementHead !== 0;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @return {boolean}
     */
    #nextPoint(x, y) {
        const elementHead = this.#elementArea.getElementHead(x, y);
        const moved = this.#performMovingBehaviour(elementHead, x, y);

        if (!moved) {
            const behaviour = ElementHead.getBehaviour(elementHead);
            switch (behaviour) {
                case ElementHead.BEHAVIOUR_NONE:
                case ElementHead.BEHAVIOUR_SOIL:
                    break;
                case ElementHead.BEHAVIOUR_FIRE:
                    this.#moduleFire.behaviourFire(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_GRASS:
                    this.#moduleGrass.behaviourGrass(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE:
                    this.#moduleTree.behaviourTree(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE_LEAF:
                    this.#moduleTree.behaviourTreeLeaf(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE_TRUNK:
                    break;
                case ElementHead.BEHAVIOUR_TREE_ROOT:
                    this.#moduleTree.behaviourTreeRoot(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_FIRE_SOURCE:
                    this.#moduleFire.behaviourFireSource(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_METEOR:
                    this.#moduleMeteor.behaviourMeteor(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_FISH:
                    this.#moduleFish.behaviourFish(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_FISH_BODY:
                    this.#moduleFish.behaviourFishBody(elementHead, x, y);
                    break;
                default:
                    throw "Unknown element behaviour: " + behaviour;
            }
        }

        return elementHead !== 0;
    }

    /**
     *
     * @param elementHead
     * @param x {number}
     * @param y {number}
     * @returns {boolean}
     */
    #performMovingBehaviour(elementHead, x, y) {
        const type = ElementHead.getTypeOrdinal(elementHead);
        switch (type) {
            case ElementHead.TYPE_STATIC:
                // no action
                return false;

            case ElementHead.TYPE_FALLING:
                //  #
                //  #
                //  #
                return this.#move(elementHead, x, y, x, y + 1);

            case ElementHead.TYPE_SAND_1:
                //   #
                //  ###
                // #####

                if (!this.#move(elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        return this.#move(elementHead, x, y, x + 1, y + 1)
                    } else {
                        return this.#move(elementHead, x, y, x - 1, y + 1)
                    }
                }
                return true;

            case ElementHead.TYPE_SAND_2:
                //     #
                //   #####
                // #########

                if (!this.#move(elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        if (!this.#move(elementHead, x, y, x + 1, y + 1)) {
                            if (this.#move(elementHead, x, y, x + 2, y + 1)) {
                                this.trigger(x + 2, y + 1);
                                return true;
                            }
                            return false;
                        }
                        return true;
                    } else {
                        if (!this.#move(elementHead, x, y, x - 1, y + 1)) {
                            if (this.#move(elementHead, x, y, x - 2, y + 1)) {
                                this.trigger(x - 2, y + 1);
                                return true;
                            }
                            return false;
                        }
                        return true;
                    }
                }
                return true;

            case ElementHead.TYPE_FLUID_1:
                // slow moving fluid
                if (!this.#move(elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        return this.#move(elementHead, x, y, x + 1, y)
                    } else {
                        return this.#move(elementHead, x, y, x - 1, y)
                    }
                }
                return true;

            case ElementHead.TYPE_FLUID_2:
                // fast moving fluid (it can move by 3)
                if (!this.#move(elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        if (this.#move(elementHead, x, y, x + 1, y)) {
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

        let elementHead2 = this.#elementArea.getElementHead(x2, y2);
        if (ElementHead.getWeight(elementHead) > ElementHead.getWeight(elementHead2)) {
            // move

            if (ElementHead.getTypeDry(elementHead) && ElementHead.getTypeOrdinal(elementHead2) === ElementHead.TYPE_FLUID_2) {
                // element may cover element2

                const elementHeadNonDry = ElementHead.setType(elementHead, ElementHead.getTypeOrdinal(elementHead));
                const elementTail = this.#elementArea.getElementTail(x, y);

                // sometimes element2 will not be covered - it looks better
                if (this.#random.nextInt(100) > 9) {
                    this.#elementArea.setElement(x, y, this.#defaultElement);
                } else {
                    const elementTail2 = this.#elementArea.getElementTail(x2, y2);
                    this.#elementArea.setElementHead(x, y, elementHead2);
                    this.#elementArea.setElementTail(x, y, elementTail2);
                }
                this.#elementArea.setElementHead(x2, y2, elementHeadNonDry);
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
}