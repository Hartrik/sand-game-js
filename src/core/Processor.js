import {Brushes} from "./Brushes.js";
import {ElementHead} from "./ElementHead.js";
import {GrassElement} from "./GrassElement.js";
import {TreeTemplateNode, TreeTemplates} from "./TreeTemplates.js";
import {DeterministicRandom} from "./DeterministicRandom.js";
import {ProcessorModuleFire} from "./ProcessorModuleFire.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-19
 */
export class Processor {

    static OPT_CYCLES_PER_SECOND = 120;
    static OPT_FRAMES_PER_SECOND = 60;

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

    constructor(elementArea, chunkSize, random, defaultElement, snapshot) {
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

        if (snapshot) {
            this.#iteration = snapshot.metadata.iteration;
            this.#fallThroughEnabled = snapshot.metadata.fallThroughEnabled;
            this.#erasingEnabled = snapshot.metadata.erasingEnabled;
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
                    this.#behaviourGrass(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE:
                    this.#behaviourTree(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE_LEAF:
                    this.#behaviourTreeLeaf(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE_TRUNK:
                    break;
                case ElementHead.BEHAVIOUR_TREE_ROOT:
                    this.#behaviourTreeRoot(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_FIRE_SOURCE:
                    this.#moduleFire.behaviourFireSource(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_FISH:
                    this.#behaviourFish(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_FISH_BODY:
                    this.#behaviourFishBody(elementHead, x, y);
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
        let type = ElementHead.getType(elementHead);
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
                // move
            } else {
                return false;
            }
        }

        let elementHead2 = this.#elementArea.getElementHead(x2, y2);
        if (ElementHead.getWeight(elementHead) > ElementHead.getWeight(elementHead2)) {
            let elementTail = this.#elementArea.getElementTail(x, y);
            let elementTail2 = this.#elementArea.getElementTail(x2, y2);

            this.#elementArea.setElementHead(x2, y2, elementHead);
            this.#elementArea.setElementHead(x, y, elementHead2);
            this.#elementArea.setElementTail(x2, y2, elementTail);
            this.#elementArea.setElementTail(x, y, elementTail2);
            return true;
        }
        return false;
    }

    #behaviourGrass(elementHead, x, y) {
        let random = this.#random.nextInt(100);
        if (random < 3) {
            // check above
            if (y > 0) {
                let above1 = this.#elementArea.getElementHead(x, y - 1);
                if (ElementHead.getBehaviour(above1) !== ElementHead.BEHAVIOUR_GRASS) {
                    let weightAbove1 = ElementHead.getWeight(above1);
                    // note: it takes longer for water to suffocate the grass
                    if (weightAbove1 > ElementHead.WEIGHT_WATER
                        || (weightAbove1 === ElementHead.WEIGHT_WATER && this.#random.nextInt(100) === 0)) {
                        // remove grass
                        this.#elementArea.setElement(x, y, this.#defaultElement);
                        return;
                    }
                }
            }

            if (random === 0) {
                // grow up
                let growIndex = ElementHead.getSpecial(elementHead);
                if (growIndex === 0) {
                    // maximum height
                    if (this.#random.nextInt(5) === 0) {
                        // remove top element to create some movement
                        this.#elementArea.setElement(x, y, this.#defaultElement);
                    }
                    return;
                }
                if (y === 0) {
                    return;
                }
                let above1 = this.#elementArea.getElementHead(x, y - 1);
                if (ElementHead.getWeight(above1) !== ElementHead.WEIGHT_AIR) {
                    return;
                }
                if (y > 1) {
                    let above2 = this.#elementArea.getElementHead(x, y - 2);
                    if (ElementHead.getWeight(above2) !== ElementHead.WEIGHT_AIR) {
                        return;
                    }
                }
                this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(elementHead, growIndex - 1));
                this.#elementArea.setElementTail(x, y - 1, this.#elementArea.getElementTail(x, y));
            } else if (random === 1) {
                // grow right
                if (GrassElement.couldGrowUpHere(this.#elementArea, x + 1, y + 1)) {
                    this.#elementArea.setElement(x + 1, y + 1, Brushes.GRASS.apply(x, y, this.#random));
                }
            } else if (random === 2) {
                // grow left
                if (GrassElement.couldGrowUpHere(this.#elementArea, x - 1, y + 1)) {
                    this.#elementArea.setElement(x - 1, y + 1, Brushes.GRASS.apply(x, y, this.#random));
                }
            }
        }
    }

    #behaviourTree(elementHead, x, y) {
        let random = this.#random.nextInt(Processor.OPT_CYCLES_PER_SECOND);
        if (random === 0) {
            let template = TreeTemplates.getTemplate(ElementHead.getSpecial(elementHead));

            let level = 0;
            let stack = [];
            for (let child of template.root.children) {
                stack.push(child);
            }

            while (stack.length > 0) {
                let node = stack.pop();

                let nx = x + node.x;
                let ny = y + node.y;
                if (this.#elementArea.isValidPosition(nx, ny)) {
                    let isHereAlready = false;
                    let canGrowHere = false;

                    const currentElementHead = this.#elementArea.getElementHead(nx, ny);
                    const currentElementBehaviour = ElementHead.getBehaviour(currentElementHead);

                    switch (node.type) {
                        case TreeTemplateNode.TYPE_TRUNK:
                        case TreeTemplateNode.TYPE_ROOT:
                            if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                                isHereAlready = true;
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
                                canGrowHere = true;
                            } else if (ElementHead.getWeight(currentElementHead) === ElementHead.WEIGHT_AIR) {
                                canGrowHere = true;
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_SOIL) {
                                canGrowHere = true;
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_GRASS) {
                                canGrowHere = true;
                            } else if (node.y > Math.min(-4, -7 + Math.abs(node.x))) {
                                // roots & bottom trunk only...
                                if (ElementHead.getType(currentElementHead) !== ElementHead.TYPE_STATIC) {
                                    canGrowHere = true;
                                }
                            }
                            break;
                        case TreeTemplateNode.TYPE_LEAF:
                            if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_LEAF) {
                                isHereAlready = true;
                                // update leaf vitality (if not dead already)
                                if (ElementHead.getSpecial(currentElementHead) < 15) {
                                    this.#elementArea.setElementHead(nx, ny, ElementHead.setSpecial(currentElementHead, 0));
                                }
                            } else if (currentElementBehaviour === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                                isHereAlready = true;
                            } else if (ElementHead.getWeight(currentElementHead) === ElementHead.WEIGHT_AIR) {
                                canGrowHere = true;
                            }
                            break;
                        default:
                            throw 'Unknown type: ' + node.type;
                    }

                    if (canGrowHere || isHereAlready) {
                        level++;
                    }

                    if (canGrowHere) {
                        this.#elementArea.setElement(nx, ny, node.brush.apply(nx, ny, this.#random));
                    }

                    if (isHereAlready) {
                        for (let child of node.children) {
                            stack.push(child);
                        }
                    }
                }
            }

            // check tree status
            // - last tree status is carried by tree trunk above
            if (y > 0) {
                let carrierElementHead = this.#elementArea.getElementHead(x, y - 1);
                if (ElementHead.getBehaviour(carrierElementHead) === ElementHead.BEHAVIOUR_TREE_TRUNK) {
                    const maxStage = 15;
                    let lastStage = ElementHead.getSpecial(carrierElementHead);
                    let currentStage = Math.trunc(level / template.nodes * maxStage);
                    if (lastStage - currentStage > 5) {
                        // too big damage taken => kill tree
                        this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(carrierElementHead, 0));
                        this.#elementArea.setElement(x, y, Brushes.TREE_WOOD.apply(x, y, this.#random));
                    } else {
                        // update stage
                        this.#elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(carrierElementHead, currentStage));
                    }
                }
            }
        }
    }

    #behaviourTreeRoot(elementHead, x, y) {
        let growIndex = ElementHead.getSpecial(elementHead);
        if (growIndex === 0) {
            // maximum size

            if (this.#iteration % 1000 === 0) {
                // harden surrounding elements

                const targetX = x + this.#random.nextInt(3) - 1;
                const targetY = y + this.#random.nextInt(3) - 1;

                if (this.#elementArea.isValidPosition(targetX, targetY)) {
                    let targetElementHead = this.#elementArea.getElementHead(targetX, targetY);
                    let type = ElementHead.getType(targetElementHead);
                    if (type === ElementHead.TYPE_SAND_1 || type === ElementHead.TYPE_SAND_2) {
                        let modifiedElementHead = ElementHead.setType(targetElementHead, ElementHead.TYPE_STATIC);
                        this.#elementArea.setElementHead(targetX, targetY, modifiedElementHead);
                    }
                }
            }

            return;
        }

        let random = this.#random.nextInt(Processor.OPT_CYCLES_PER_SECOND * 10);
        if (random < 10) {

            let doGrow = (nx, ny) => {
                this.#elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, 0));

                let element = Brushes.TREE_ROOT.apply(nx, ny, this.#random);
                let modifiedHead = ElementHead.setSpecial(element.elementHead, growIndex - 1);
                this.#elementArea.setElementHead(nx, ny, modifiedHead);
                this.#elementArea.setElementTail(nx, ny, element.elementTail);
            }

            // grow down first if there is a free space
            if (y < this.#elementArea.getHeight() - 1) {
                let targetElementHead = this.#elementArea.getElementHead(x, y + 1);
                if (ElementHead.getWeight(targetElementHead) === ElementHead.WEIGHT_AIR) {
                    doGrow(x, y + 1);
                    return;
                }
            }

            // grow in random way
            let nx = x;
            let ny = y;
            if (random === 9 || random === 8 || random === 7) {
                nx += 1;
                ny += 1;
            } else if (random === 6 || random === 5 || random === 4) {
                nx += -1;
                ny += 1;
            } else {
                ny += 1;
            }

            if (this.#elementArea.isValidPosition(nx, ny)) {
                let targetElementHead = this.#elementArea.getElementHead(nx, ny);
                if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_STATIC) {
                    doGrow(nx, ny);
                }
            }
        }
    }

    #behaviourTreeLeaf(elementHead, x, y) {
        // decrement vitality (if not dead already)
        let vitality = ElementHead.getSpecial(elementHead);
        if (vitality < 15) {
            if (this.#iteration % 32 === 0) {
                if (this.#random.nextInt(10) === 0) {
                    vitality++;
                    if (vitality >= 15) {
                        this.#elementArea.setElement(x, y, Brushes.TREE_LEAF_DEAD.apply(x, y, this.#random));
                        return;
                    } else {
                        elementHead = ElementHead.setSpecial(elementHead, vitality);
                        this.#elementArea.setElementHead(x, y, elementHead);
                    }
                }
            }
        }

        // approx one times per 5 seconds... check if it's not buried or levitating
        if (this.#iteration % Processor.OPT_CYCLES_PER_SECOND === 0) {
            const random = this.#random.nextInt(5);

            if (random === 0) {
                // - check if it's not buried

                const directions = [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]];
                const randomDirection = directions[this.#random.nextInt(directions.length)];
                const targetX = x + randomDirection[0];
                const targetY = y + randomDirection[1];

                if (this.#elementArea.isValidPosition(targetX, targetY)) {
                    const elementHeadAbove = this.#elementArea.getElementHead(targetX, targetY);
                    if (ElementHead.getType(elementHeadAbove) !== ElementHead.TYPE_STATIC
                        && ElementHead.getWeight(elementHeadAbove) >= ElementHead.WEIGHT_WATER) {
                        this.#elementArea.setElement(x, y, this.#defaultElement);
                    }
                }
            }
            if (random === 1) {
                // - check it's not levitating
                // TODO
            }
        }
    }

    #behaviourFish(elementHead, x, y) {
        // check has body
        if (x === this.#elementArea.getWidth() - 1
            || ElementHead.getBehaviour(this.#elementArea.getElementHead(x + 1, y)) !== ElementHead.BEHAVIOUR_FISH_BODY) {
            // => turn into corpse
            this.#elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y, this.#random));
        }

        // move down if flying
        if (y < this.#elementArea.getHeight() - 1) {
            if (ElementHead.getWeight(this.#elementArea.getElementHead(x, y + 1)) < ElementHead.WEIGHT_WATER
                && ElementHead.getWeight(this.#elementArea.getElementHead(x + 1, y + 1)) < ElementHead.WEIGHT_WATER) {
                this.#elementArea.swap(x, y, x, y + 1);
                this.#elementArea.swap(x + 1, y, x + 1, y + 1);
                return;
            }
        }

        // once a while check if there is a water
        // once a while move

        const action = this.#random.nextInt(Processor.OPT_CYCLES_PER_SECOND);
        if (action === 0) {
            let w = 0;
            w += this.#isWaterEnvironment(x - 1, y) ? 1 : 0;
            w += this.#isWaterEnvironment(x + 2, y) ? 1 : 0;
            w += this.#isWaterEnvironment(x, y + 1) ? 1 : 0;
            w += this.#isWaterEnvironment(x, y - 1) ? 1 : 0;
            if (w < 4) {
                w += this.#isWaterEnvironment(x + 1, y + 1) ? 1 : 0;
                w += this.#isWaterEnvironment(x + 1, y - 1) ? 1 : 0;
            }

            let dried = ElementHead.getSpecial(elementHead);
            if (w >= 4) {
                // enough water
                if (dried > 0) {
                    // reset counter
                    this.#elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, 0));
                }
            } else {
                // not enough water
                dried++;
                if (dried > 5) {
                    // turn into corpse
                    this.#elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y, this.#random));
                } else {
                    this.#elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, dried));
                }
            }
        } else if (action < Processor.OPT_CYCLES_PER_SECOND / 10) {
            const rx = this.#random.nextInt(3) - 1;
            const ry = this.#random.nextInt(3) - 1;
            if (rx === 0 && ry === 0) {
                return;
            }
            // move fish and it's body
            if (this.#isWater(rx + x, ry + y) && this.#isWater(rx + x + 1, ry + y)) {
                this.#elementArea.swap(x, y, rx + x, ry + y);
                this.#elementArea.swap(x + 1, y, rx + x + 1, ry + y);
            }
        }
    }

    #behaviourFishBody(elementHead, x, y) {
        if (x === 0 || ElementHead.getBehaviour(this.#elementArea.getElementHead(x - 1, y)) !== ElementHead.BEHAVIOUR_FISH) {
            // the fish lost it's head :(
            // => turn into corpse
            this.#elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y, this.#random));
        }
    }

    #isWater(x, y) {
        if (!this.#elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = this.#elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_FLUID_2) {
            return false;
        }
        return true;
    }

    #isWaterEnvironment(x, y) {
        if (!this.#elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = this.#elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) === ElementHead.TYPE_FLUID_2) {
            return true;
        }
        let behaviour = ElementHead.getBehaviour(targetElementHead);
        if (behaviour === ElementHead.BEHAVIOUR_FISH || behaviour === ElementHead.BEHAVIOUR_FISH_BODY) {
            return true;
        }
        return false;
    }
}