
/**
 *
 * @author Patrik Harag
 * @version 2022-11-08
 */
export class SandGame {

    static OPT_CYCLES_PER_SECOND = 120;
    static OPT_FRAMES_PER_SECOND = 60;

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
    #cyclesCounter;

    /** @type ElementProcessor */
    #processor;

    /** @type Renderer */
    #renderer;

    /** @type number|null */
    #processorIntervalHandle = null;

    /** @type number|null */
    #rendererIntervalHandle = null;

    /** @type boolean */
    #rendererShowActiveChunks = false;

    /** @type function[] */
    #onRendered = [];

    /** @type function[] */
    #onProcessed = [];

    /**
     *
     * @param context {CanvasRenderingContext2D}
     * @param width {number}
     * @param height {number}
     * @param defaultElement {Element}
     */
    constructor(context, width, height, defaultElement) {
        this.#elementArea = new ElementArea(width, height, defaultElement);
        this.#random = new DeterministicRandom(0);
        this.#framesCounter = new Counter();
        this.#cyclesCounter = new Counter();
        this.#processor = new ElementProcessor(this.#elementArea, 16, this.#random, defaultElement);
        this.#renderer = new Renderer(this.#elementArea, 16, context);
        this.#width = width;
        this.#height = height;

        let grassPlantingExtension = new GrassPlantingExtension(this.#elementArea, this.#random, Brushes.GRASS);
        this.#onProcessed.push(() => grassPlantingExtension.run());
        let treePlantingExtension = new TreePlantingExtension(this.#elementArea, this.#random, Brushes.TREE);
        this.#onProcessed.push(() => treePlantingExtension.run());
        let fishSpawningExtension = new FishSpawningExtension(this.#elementArea, this.#random, Brushes.FISH, Brushes.FISH_BODY);
        this.#onProcessed.push(() => fishSpawningExtension.run());
    }

    startProcessing() {
        if (this.#processorIntervalHandle === null) {
            const interval = Math.trunc(1000 / SandGame.OPT_CYCLES_PER_SECOND);  // ms
            this.#processorIntervalHandle = setInterval(() => this.#doProcessing(), interval);
        }
    }

    startRendering() {
        if (this.#rendererIntervalHandle === null) {
            const interval = Math.trunc(1000 / SandGame.OPT_FRAMES_PER_SECOND);  // ms
            this.#rendererIntervalHandle = setInterval(() => this.#doRendering(), interval);
        }
    }

    stopProcessing() {
        if (this.#processorIntervalHandle !== null) {
            clearInterval(this.#processorIntervalHandle);
            this.#processorIntervalHandle = null;
        }
        this.#cyclesCounter.clear();
    }

    stopRendering() {
        if (this.#rendererIntervalHandle !== null) {
            clearInterval(this.#rendererIntervalHandle);
            this.#rendererIntervalHandle = null;
        }
        this.#framesCounter.clear();
    }

    #doProcessing() {
        this.#processor.next();
        const t = Date.now();
        this.#cyclesCounter.tick(t);
        for (let func of this.#onProcessed) {
            func();
        }
    }

    #doRendering() {
        this.#renderer.render(this.#processor.getActiveChunks(), this.#rendererShowActiveChunks);
        const t = Date.now();
        this.#framesCounter.tick(t);
        for (let func of this.#onRendered) {
            func();
        }
    }

    graphics() {
        return new SandGameGraphics(this.#elementArea, this.#random, (x, y) => {
            this.#processor.trigger(x, y);
            this.#renderer.trigger(x, y);
        });
    }

    template() {
        return new TemplatePainter(this.graphics());
    }

    setRendererShowActiveChunks(show) {
        this.#rendererShowActiveChunks = show;
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

    addOnRendered(onRenderedFunc) {
        this.#onRendered.push(onRenderedFunc);
    }

    getFramesPerSecond() {
        return this.#framesCounter.getValue();
    }

    getCyclesPerSecond() {
        return this.#cyclesCounter.getValue();
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height;
    }

    copyStateTo(sandGame) {
        let sourceY0;
        let targetY0;
        if (sandGame.#height >= this.#height) {
            sourceY0 = 0;
            targetY0 = sandGame.#height - this.#height
        } else {
            sourceY0 = this.#height - sandGame.#height;
            targetY0 = 0;
        }

        for (let y = 0; y < Math.min(this.#height, sandGame.#height); y++) {
            for (let x = 0; x < Math.min(this.#width, sandGame.#width); x++) {
                let elementHead = this.#elementArea.getElementHead(x, y + sourceY0);
                let elementTail = this.#elementArea.getElementTail(x, y + sourceY0);
                sandGame.#elementArea.setElementHead(x, targetY0 + y, elementHead);
                sandGame.#elementArea.setElementTail(x, targetY0 + y, elementTail);
            }
        }
        sandGame.#processor.setFallThroughEnabled(this.#processor.isFallThroughEnabled());
        sandGame.#processor.setErasingEnabled(this.#processor.isErasingEnabled());
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-07
 */
class SandGameGraphics {

    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type function(number, number) */
    #triggerFunction;

    constructor(elementArea, random, triggerFunction) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#triggerFunction = triggerFunction;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brush {Brush}
     */
    draw(x, y, brush) {
        let element = brush.apply(x, y, this.#random);
        this.#elementArea.setElement(x, y, element);
        this.#triggerFunction(x, y);
    }

    drawRectangle(x1, y1, x2, y2, brush, supportNegativeCoordinates = false) {
        if (supportNegativeCoordinates) {
            x1 = (x1 >= 0) ? x1 : this.getWidth() + x1 + 1;
            x2 = (x2 >= 0) ? x2 : this.getWidth() + x2 + 1;
            y1 = (y1 >= 0) ? y1 : this.getHeight() + y1 + 1;
            y2 = (y2 >= 0) ? y2 : this.getHeight() + y2 + 1;
        }

        x1 = Math.max(Math.min(x1, this.getWidth() - 1), 0);
        x2 = Math.max(Math.min(x2, this.getWidth() - 1), 0);
        y1 = Math.max(Math.min(y1, this.getHeight() - 1), 0);
        y2 = Math.max(Math.min(y2, this.getHeight() - 1), 0);

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                this.draw(x, y, brush);
            }
        }
    }

    drawLine(x1, y1, x2, y2, size, brush) {
        const d = Math.ceil(size / 2);
        let consumer = (x, y) => {
            this.drawRectangle(x-d, y-d, x+d, y+d, brush);
        };
        SandGameGraphics.#lineAlgorithm(x1, y1, x2, y2, consumer);
    }

    static #lineAlgorithm(x1, y1, x2, y2, consumer) {
        consumer(x1, y1);

        if ((x1 !== x2) || (y1 !== y2)) {
            const moveX = x1 < x2 ? 1 : -1;
            const moveY = y1 < y2 ? 1 : -1;

            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            let diff = dx - dy;

            while ((x1 !== x2) || (y1 !== y2)) {
                const p = 2 * diff;

                if (p > -dy) {
                    diff = diff - dy;
                    x1 = x1 + moveX;
                }
                if (p < dx) {
                    diff = diff + dx;
                    y1 = y1 + moveY;
                }
                consumer(x1, y1);
            }
        }
    }

    fill(brush) {
        this.drawRectangle(0, 0, this.#elementArea.getWidth() - 1, this.#elementArea.getHeight() - 1, brush);
    }

    floodFill(x, y, brush, neighbourhood) {
        let floodFillPainter = new FloodFillPainter(this.#elementArea, neighbourhood, this);
        floodFillPainter.paint(x, y, brush);
    }

    getWidth() {
        return this.#elementArea.getWidth();
    }

    getHeight() {
        return this.#elementArea.getHeight();
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
class Brush {

    /**
     *
     * @param x
     * @param y
     * @param random {DeterministicRandom|undefined}
     * @return {Element}
     */
    apply(x, y, random = undefined) {
        throw 'Not implemented'
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
class RandomBrush extends Brush {
    static of(elements) {
        return new RandomBrush(elements);
    }

    static fromHeadAndTails(elementHead, elementTails) {
        let elements = [];
        for (let elementTail of elementTails) {
            elements.push(new Element(elementHead, elementTail));
        }
        return new RandomBrush(elements);
    }


    /** @type Element[] */
    #elements;

    constructor(elements) {
        super();
        this.#elements = elements;
    }

    apply(x, y, random) {
        if (this.#elements.length > 1) {
            let i;
            if (random) {
                i = random.nextInt(this.#elements.length);
            } else {
                i = Math.trunc(Math.random() * this.#elements.length);
            }
            return this.#elements[i];
        } else {
            return this.#elements[0];
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-29
 */
class CustomBrush extends Brush {
    static of(func) {
        return new CustomBrush(func);
    }

    /** @type function(x, y, DeterministicRandom) */
    #func;

    constructor(func) {
        super();
        this.#func = func;
    }

    apply(x, y, random) {
        return this.#func(x, y, random);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-21
 */
class TemplatePainter {

    /** @type SandGameGraphics */
    #graphics;

    /** @type string|string[]|null */
    #blueprint = null;
    /** @type object|null */
    #brushes = null;

    /** @type number */
    #maxHeight = Number.MAX_SAFE_INTEGER;

    /** @type string */
    #verticalAlign = 'bottom';

    /**
     *
     * @param graphics {SandGameGraphics}
     */
    constructor(graphics) {
        this.#graphics = graphics;
    }

    /**
     *
     * @param blueprint {string|string[]}
     * @returns {TemplatePainter}
     */
    withBlueprint(blueprint) {
        this.#blueprint = blueprint;
        return this;
    }

    /**
     *
     * @param brushes
     * @returns {TemplatePainter}
     */
    withBrushes(brushes) {
        this.#brushes = brushes;
        return this;
    }

    /**
     *
     * @param maxHeight max template height
     * @param align {string} bottom|top
     * @returns {TemplatePainter}
     */
    withMaxHeight(maxHeight, align='bottom') {
        this.#maxHeight = maxHeight;
        this.#verticalAlign = align;
        return this;
    }

    paint() {
        if (this.#blueprint === null || this.#blueprint.length === 0) {
            throw 'Blueprint not set';
        }
        if (this.#brushes === null) {
            throw 'Brushes not set';
        }

        const blueprint = (typeof this.#blueprint === 'string')
                ? this.#blueprint.split('\n')
                : this.#blueprint;

        const w = blueprint[0].length;
        const h = blueprint.length;

        const ww = Math.ceil(this.#graphics.getWidth() / w);
        const hh = Math.ceil(Math.min(this.#graphics.getHeight(), this.#maxHeight) / h);
        // note: rounding up is intentional - we don't want gaps, drawRectangle can handle drawing out of canvas

        const verticalOffset = (this.#verticalAlign === 'bottom' ? this.#graphics.getHeight() - (hh * h) : 0);

        for (let y = 0; y < h; y++) {
            const line = blueprint[y];
            for (let x = 0; x < Math.min(w, line.length); x++) {
                const char = line.charAt(x);
                let brush = this.#brushes[char];
                if (brush === undefined) {
                    if (char === ' ') {
                        // let this cell empty
                        continue;
                    }
                    throw 'Brush not found: ' + char;
                }
                this.#graphics.drawRectangle(
                        x * ww, verticalOffset + (y * hh),
                        x * ww + ww, verticalOffset + (y * hh) + hh, brush);
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-06
 */
class FloodFillPainter {

    static NEIGHBOURHOOD_VON_NEUMANN = 0;
    static NEIGHBOURHOOD_MOORE = 1;


    /** @type ElementArea */
    #elementArea;

    /** @type SandGameGraphics */
    #graphics;

    #neighbourhood;

    /**
     *
     * @param elementArea {ElementArea}
     * @param neighbourhood
     * @param graphics {SandGameGraphics}
     */
    constructor(elementArea, neighbourhood = FloodFillPainter.NEIGHBOURHOOD_VON_NEUMANN, graphics) {
        this.#elementArea = elementArea;
        this.#neighbourhood = neighbourhood;
        this.#graphics = graphics;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brush {Brush}
     */
    paint(x, y, brush) {
        const pattern = 0x00000FFF;  // type, weight, behaviour
        const matcher = this.#elementArea.getElementHead(x, y) & pattern;

        const w = this.#elementArea.getWidth();

        const pointSet = new Set();
        const queue = [];

        let point = x + y*w;
        do {
            let x = point % w;
            let y = Math.trunc(point / w);

            if (pointSet.has(point)) {
                continue;  // already completed
            }

            this.#graphics.draw(x, y, brush);
            pointSet.add(point);

            // add neighbours
            this.#tryAdd(x, y-1, pattern, matcher, pointSet, queue);
            this.#tryAdd(x+1, y, pattern, matcher, pointSet, queue);
            this.#tryAdd(x, y+1, pattern, matcher, pointSet, queue);
            this.#tryAdd(x-1, y, pattern, matcher, pointSet, queue);

            if (this.#neighbourhood === FloodFillPainter.NEIGHBOURHOOD_MOORE) {
                this.#tryAdd(x+1, y+1, pattern, matcher, pointSet, queue);
                this.#tryAdd(x+1, y-1, pattern, matcher, pointSet, queue);
                this.#tryAdd(x-1, y+1, pattern, matcher, pointSet, queue);
                this.#tryAdd(x-1, y-1, pattern, matcher, pointSet, queue);
            }

        } while ((point = queue.pop()) != null);
    }

    #tryAdd(x, y, pattern, matcher, pointSet, queue) {
        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();

        if (x < 0 || y < 0) {
            return;
        }
        if (x >= w || y >= h) {
            return;
        }

        if (!this.#equals(x, y, pattern, matcher)) {
            return;
        }

        const point = x + y*w;
        if (pointSet.has(point)) {
            return;
        }

        queue.push(point);
    }

    #equals(x, y, pattern, matcher) {
        let elementHead = this.#elementArea.getElementHead(x, y);
        return (elementHead & pattern) === matcher;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-25
 */
class Counter {

    #currentValue = 0;
    #lastValue = 0;
    #start = 0;

    tick(currentTimeMillis) {
        this.#currentValue++;
        if (currentTimeMillis - this.#start >= 1000) {
            this.#lastValue = this.#currentValue;
            this.#currentValue = 0;
            this.#start = currentTimeMillis;
        }
    }

    getValue() {
        return this.#lastValue;
    }

    clear() {
        this.#lastValue = 0;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
class DeterministicRandom {
    /** @type number */
    #last;

    constructor(seed) {
        this.#last = seed;
    }

    next() {
        // Mulberry32
        // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
        let t = this.#last += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    nextInt(max) {
        return Math.trunc(this.next() * max);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-20
 */
class ElementArea {
    static LITTLE_ENDIAN = true;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type DataView */
    #buffer;

    constructor(width, height, defaultElement) {
        this.#width = width;
        this.#height = height;
        this.#buffer = new DataView(new ArrayBuffer(width * height * 8));

        // set default elements
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                this.setElement(x, y, defaultElement);
            }
        }
    }

    isValidPosition(x, y) {
        if (x < 0 || y < 0) {
            return false;
        }
        if (x >= this.#width || y >= this.#height) {
            return false;
        }
        return true;
    }

    setElement(x, y, element) {
        if (element !== null) {
            this.setElementHeadAndTail(x, y, element.elementHead, element.elementTail);
        }
        // brushes can produce nulls
    }

    setElementHeadAndTail(x, y, elementHead, elementTail) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
        this.#buffer.setUint32(byteOffset + 4, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    setElementHead(x, y, elementHead) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
    }

    setElementTail(x, y, elementTail) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset + 4, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    getElement(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        const elementHead = this.#buffer.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
        const elementTail = this.#buffer.getUint32(byteOffset + 4, ElementArea.LITTLE_ENDIAN);
        return new Element(elementHead, elementTail);
    }

    getElementHead(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        return this.#buffer.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
    }

    getElementTail(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        return this.#buffer.getUint32(byteOffset + 4, ElementArea.LITTLE_ENDIAN);
    }

    swap(x, y, x2, y2) {
        const elementHead = this.getElementHead(x, y);
        const elementHead2 = this.getElementHead(x2, y2);
        this.setElementHead(x2, y2, elementHead);
        this.setElementHead(x, y, elementHead2);

        const elementTail = this.getElementTail(x, y);
        const elementTail2 = this.getElementTail(x2, y2);
        this.setElementTail(x2, y2, elementTail);
        this.setElementTail(x, y, elementTail2);
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-29
 */
class ElementHead {
    static TYPE_STATIC = 0x0;
    static TYPE_FALLING = 0x1;
    static TYPE_SAND_1 = 0x2;
    static TYPE_SAND_2 = 0x3;
    static TYPE_FLUID_1 = 0x4;
    static TYPE_FLUID_2 = 0x5;

    static WEIGHT_AIR = 0x0;
    static WEIGHT_WATER = 0x1;
    static WEIGHT_POWDER = 0x2;
    static WEIGHT_WALL = 0x3;

    static BEHAVIOUR_NONE = 0x0;
    static BEHAVIOUR_SOIL = 0x1;
    static BEHAVIOUR_GRASS = 0x2;
    static BEHAVIOUR_FISH = 0x3;
    static BEHAVIOUR_FISH_BODY = 0x4;
    static BEHAVIOUR_TREE = 0x5;
    static BEHAVIOUR_TREE_ROOT = 0x6;
    static BEHAVIOUR_TREE_TRUNK = 0x7;
    static BEHAVIOUR_TREE_LEAF = 0x8;

    static of(type, weight, behaviour=0, special=0) {
        let value = 0;
        value = (value | special) << 4;
        value = (value | behaviour) << 4;
        value = (value | weight) << 4;
        value = value | type;
        return value;
    }

    static getType(elementHead) {
        return elementHead & 0x0000000F;
    }

    static getWeight(elementHead) {
        return (elementHead >> 4) & 0x0000000F;
    }

    static getBehaviour(elementHead) {
        return (elementHead >> 8) & 0x0000000F;
    }

    static getSpecial(elementHead) {
        return (elementHead >> 12) & 0x0000000F;
    }

    static setType(elementHead, type) {
        return (elementHead & ~(0x0000000F)) | type;
    }

    static setSpecial(elementHead, special) {
        return (elementHead & ~(0x0000F000)) | (special << 12);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class ElementTail {
    static MODIFIER_BACKGROUND = 0x01000000;
    static MODIFIER_BLUR_ENABLED = 0x02000000;

    static of(r, g, b, renderingModifiers) {
        let value = 0;
        value = (value | r) << 8;
        value = (value | g) << 8;
        value = value | b;
        value = value | renderingModifiers
        return value;
    }

    static getColorRed(elementTail) {
        return (elementTail >> 16) & 0x000000FF;
    }

    static getColorGreen(elementTail) {
        return (elementTail >> 8) & 0x000000FF;
    }

    static getColorBlue(elementTail) {
        return elementTail & 0x000000FF;
    }

    static isRenderingModifierBackground(elementTail) {
        return (elementTail & ElementTail.MODIFIER_BACKGROUND) !== 0;
    }

    static isRenderingModifierBlurEnabled(elementTail) {
        return (elementTail & ElementTail.MODIFIER_BLUR_ENABLED) !== 0;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class Element {
    elementHead;
    elementTail;

    constructor(elementHead, elementTail) {
        this.elementHead = elementHead;
        this.elementTail = elementTail;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-08
 */
class ElementProcessor {

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

    constructor(elementArea, chunkSize, random, defaultElement) {
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

        this.#random = random;
        this.#rndChunkOrder = ElementProcessor.#generateArrayOfOrderData(
                ElementProcessor.RANDOM_DATA_COUNT, this.#horChunkCount, this.#random);
        this.#rndChunkXRnd = ElementProcessor.#generateArrayOfRandomData(
                ElementProcessor.RANDOM_DATA_COUNT, this.#chunkSize, this.#chunkSize, this.#random);
        this.#rndChunkXOrder = ElementProcessor.#generateArrayOfOrderData(
                ElementProcessor.RANDOM_DATA_COUNT, this.#chunkSize, this.#random);

        this.#defaultElement = defaultElement;
    }

    static #shuffle(array, iterations, random) {
        for (let i = 0; i < iterations; i++) {
            let a = random.nextInt(array.length);
            let b = random.nextInt(array.length);
            [array[a], array[b]] = [array[b], array[a]];
        }
    }

    static #generateArrayOfOrderData(arrayLength, count, random) {
        let data = ElementProcessor.#generateOrderData(count);
        ElementProcessor.#shuffle(data, arrayLength, random);

        let array = Array(arrayLength);
        for (let i = 0; i < arrayLength; i++) {
            ElementProcessor.#shuffle(data, Math.ceil(arrayLength / 4), random);
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
            array[i] = ElementProcessor.#generateRandomData(count, max, random);
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

            const chunkOrder = this.#rndChunkOrder[this.#random.nextInt(ElementProcessor.RANDOM_DATA_COUNT)];
            const fullChunkLoop = this.#random.nextInt(2) === 0;

            const chunkActiveElements = new Uint16Array(this.#horChunkCount);

            for (let y = cyBottom; y >= cyTop; y--) {
                for (let i = 0; i < this.#horChunkCount; i++) {
                    const cx = chunkOrder[i];
                    const chunkIndex = cy * this.#horChunkCount + cx;

                    const idx = this.#random.nextInt(ElementProcessor.RANDOM_DATA_COUNT);
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
                case ElementHead.BEHAVIOUR_TREE_TRUNK:
                    break;
                case ElementHead.BEHAVIOUR_GRASS:
                    this.#behaviourGrass(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE:
                    this.#behaviourTree(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE_ROOT:
                    this.#behaviourTreeRoot(elementHead, x, y);
                    break;
                case ElementHead.BEHAVIOUR_TREE_LEAF:
                    this.#behaviourTreeLeaf(elementHead, x, y);
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
        let random = this.#random.nextInt(SandGame.OPT_CYCLES_PER_SECOND);
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

        let random = this.#random.nextInt(SandGame.OPT_CYCLES_PER_SECOND * 10);
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
        if (this.#iteration % SandGame.OPT_CYCLES_PER_SECOND === 0) {
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

        const action = this.#random.nextInt(SandGame.OPT_CYCLES_PER_SECOND);
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
        } else if (action < SandGame.OPT_CYCLES_PER_SECOND / 10) {
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

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class GrassElement {
    static couldGrowUpHere(elementArea, x, y) {
        if (x < 0 || y - 1 < 0) {
            return false;
        }
        if (x >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }
        let e1 = elementArea.getElementHead(x, y);
        if (ElementHead.getWeight(e1) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        let e2 = elementArea.getElementHead(x, y + 1);
        if (ElementHead.getBehaviour(e2) !== ElementHead.BEHAVIOUR_SOIL) {
            return false;
        }
        let e3 = elementArea.getElementHead(x, y - 1);
        if (ElementHead.getWeight(e3) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        return true;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
class TreeTemplates {
    static #random = new DeterministicRandom(0);

    static TEMPLATES = [];

    /**
     *
     * @param id {number} template id
     * @returns {TreeTemplate} template
     */
    static getTemplate(id) {
        let template = TreeTemplates.TEMPLATES[id];
        if (!template) {
            let root = TreeTemplates.#generate(id);
            let count = TreeTemplates.#countNodes(root);
            template = new TreeTemplate(root, count);
            TreeTemplates.TEMPLATES[id] = template;
        }
        return template;
    }

    static #generate(id) {
        let root = new TreeTemplateNode(0, 0, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD);
        root.children.push(new TreeTemplateNode(0, 1, TreeTemplateNode.TYPE_ROOT, Brushes.TREE_ROOT));

        let size = [20, 37, 35, 42][(id & 0b1100) >> 2];
        let firstSplit = ((id & 0b0010) !== 0) ? 1 : -1;
        let firstIncrement = ((id & 0b0001) !== 0) ? 1 : -1;

        let splits = [15, 19, 22, 25, 29, 32, 35];
        if (size < 25) {
            splits.unshift(12);  // small trees
        }
        let splitDirection = firstSplit;

        let incrementWidth = [12, 20, 28, 32];
        let incrementX = [1, -1, 2, -2, 3, -3].map(v => v * firstIncrement);
        let incrementNext = 0;

        let centerTrunkNodes = [root];

        for (let i = 1; i <= size; i++) {
            const remainingSize = size - i;

            // increment trunk size
            if (incrementWidth.includes(i)) {
                let nx = incrementX[incrementNext++];
                let node = new TreeTemplateNode(nx, 0, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD);
                node.children.push(new TreeTemplateNode(nx, 1, TreeTemplateNode.TYPE_ROOT, Brushes.TREE_ROOT));

                centerTrunkNodes[0].children.push(node);
                centerTrunkNodes.push(node);
            }

            // add split
            if (splits.includes(i)) {
                let branchLength = 12;
                if (remainingSize < 10) {
                    branchLength = 8;
                }
                if (remainingSize < 6) {
                    branchLength = 5;
                }

                let branchRoot = this.#generateBranch(branchLength, splitDirection, i, remainingSize);
                centerTrunkNodes[0].children.push(branchRoot);

                splitDirection = splitDirection * -1;
            }

            // add next trunk level
            for (let j = 0; j < centerTrunkNodes.length; j++) {
                let last = centerTrunkNodes[j];

                let node = (j !== 0 || remainingSize > 3)
                        ? new TreeTemplateNode(last.x, last.y - 1, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD)
                        : new TreeTemplateNode(last.x, last.y - 1, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_DARKER);

                last.children.push(node);
                centerTrunkNodes[j] = node;
            }

            // add trunk leaves
            if (i > 20) {
                let brush = (remainingSize > 3) ? Brushes.TREE_LEAF_DARKER : Brushes.TREE_LEAF_LIGHTER;

                let leafR = new TreeTemplateNode(1, -i, TreeTemplateNode.TYPE_LEAF, brush);
                centerTrunkNodes[0].children.push(leafR);
                let leafL = new TreeTemplateNode(-1, -i, TreeTemplateNode.TYPE_LEAF, brush);
                centerTrunkNodes[0].children.push(leafL);

                if (remainingSize > 1) {
                    leafR.children.push(new TreeTemplateNode(2, -i, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
                    leafL.children.push(new TreeTemplateNode(-2, -i, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
                }
            }
        }
        return root;
    }

    static #generateBranch(branchLength, splitDirection, i, remainingSize) {
        let shift = 0;
        let branchRoot = null;
        let branchLast = null;

        for (let j = 1; j <= branchLength; j++) {
            const remainingBranchSize = branchLength - j;

            if (j > 3 && TreeTemplates.#random.next() < 0.2) {
                shift++;
            }
            let nx = splitDirection * j;
            let ny = -i - shift;

            let next = (remainingSize > 3 && remainingBranchSize > 1)
                ? new TreeTemplateNode(nx, ny, TreeTemplateNode.TYPE_TRUNK, Brushes.TREE_WOOD)
                : new TreeTemplateNode(nx, ny, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER);

            if (branchRoot === null) {
                branchRoot = next;
            }

            if (branchLast !== null) {
                branchLast.children.push(next);
            }
            branchLast = next;

            // generate branch leaves

            let leafAbove = new TreeTemplateNode(nx, ny - 1, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER);
            let leafBelow = new TreeTemplateNode(nx, ny + 1, TreeTemplateNode.TYPE_LEAF,
                (remainingBranchSize > 3) ? Brushes.TREE_LEAF_DARKER : Brushes.TREE_LEAF_LIGHTER);

            if (remainingBranchSize > 3) {
                leafAbove.children.push(new TreeTemplateNode(nx, ny - 2, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
                leafBelow.children.push(new TreeTemplateNode(nx, ny + 2, TreeTemplateNode.TYPE_LEAF, Brushes.TREE_LEAF_LIGHTER));
            }

            next.children.push(leafAbove);
            next.children.push(leafBelow);
        }
        return branchRoot;
    }

    static #countNodes(root) {
        let count = 0;

        let stack = [root];
        while (stack.length > 0) {
            let node = stack.pop();
            count++;
            for (let child of node.children) {
                stack.push(child);
            }
        }
        return count;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-10-01
 */
class TreeTemplate {

    /** @type TreeTemplateNode */
    root;

    /** @type number */
    nodes;

    constructor(root, nodes) {
        this.root = root;
        this.nodes = nodes;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-29
 */
class TreeTemplateNode {
    static TYPE_TRUNK = 1;
    static TYPE_LEAF = 2;
    static TYPE_ROOT = 3;


    /** @type number */
    x;

    /** @type number */
    y;

    /** @type number */
    type;

    /** @type Brush */
    brush;

    /** @type TreeTemplateNode[] */
    children = [];

    constructor(x, y, type, brush) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.brush = brush;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class GrassPlantingExtension {
    static MAX_COUNTER_VALUE = 2;

    #elementArea;
    #random;
    #brush;

    #counter = GrassPlantingExtension.MAX_COUNTER_VALUE;

    constructor(elementArea, random, brush) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brush = brush;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = GrassPlantingExtension.MAX_COUNTER_VALUE;

            const x = this.#random.nextInt(this.#elementArea.getWidth());
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 3) + 2;

            if (GrassElement.couldGrowUpHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brush.apply(x, y, this.#random));
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-29
 */
class TreePlantingExtension {
    static STARTING_COUNTER_VALUE = 1000;
    static MAX_COUNTER_VALUE = 4;

    #elementArea;
    #random;
    #brush;

    #counter = TreePlantingExtension.STARTING_COUNTER_VALUE;

    constructor(elementArea, random, brush) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brush = brush;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = TreePlantingExtension.MAX_COUNTER_VALUE;

            const x = this.#random.nextInt(this.#elementArea.getWidth() - 12) + 6;
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 16) + 15;

            if (TreePlantingExtension.couldGrowUpHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brush.apply(x, y, this.#random));
            }
        }
    }

    static couldGrowUpHere(elementArea, x, y) {
        if (x < 0 || y < 12) {
            return false;
        }
        if (x > elementArea.getWidth() - 5 || y > elementArea.getHeight() - 2) {
            return false;
        }
        let e1 = elementArea.getElementHead(x, y);
        if (ElementHead.getBehaviour(e1) !== ElementHead.BEHAVIOUR_GRASS) {
            return false;
        }
        let e2 = elementArea.getElementHead(x, y + 1);
        if (ElementHead.getBehaviour(e2) !== ElementHead.BEHAVIOUR_SOIL) {
            return false;
        }

        // check space directly above
        for (let dy = 1; dy < 18; dy++) {
            if (!TreePlantingExtension.#isSpaceHere(elementArea, x, y - dy)) {
                return false;
            }
        }

        // check trees around
        for (let dx = -8; dx < 8; dx++) {
            if (TreePlantingExtension.#isOtherThreeThere(elementArea, x + dx, y - 4)) {
                return false;
            }
        }

        // check space above - left & right
        for (let dy = 10; dy < 15; dy++) {
            if (!TreePlantingExtension.#isSpaceHere(elementArea, x - 8, y - dy)) {
                return false;
            }
            if (!TreePlantingExtension.#isSpaceHere(elementArea, x + 8, y - dy)) {
                return false;
            }
        }

        return true;
    }

    static #isSpaceHere(elementArea, tx, ty) {
        let targetElementHead = elementArea.getElementHead(tx, ty);
        if (ElementHead.getWeight(targetElementHead) === ElementHead.WEIGHT_AIR) {
            return true;
        }
        if (ElementHead.getBehaviour(targetElementHead) === ElementHead.BEHAVIOUR_GRASS) {
            return true;
        }
        return false;
    }

    static #isOtherThreeThere(elementArea, tx, ty) {
        let targetElementHead = elementArea.getElementHead(tx, ty);
        let behaviour = ElementHead.getBehaviour(targetElementHead);
        if (behaviour === ElementHead.BEHAVIOUR_TREE_TRUNK || behaviour === ElementHead.BEHAVIOUR_TREE) {
            return true;
        }
        return false;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-20
 */
class FishSpawningExtension {

    #elementArea;
    #random;
    #brushHead;
    #brushBody;

    #counterStartValue = 2;
    #counter = 2;

    constructor(elementArea, random, brushHead, brushBody) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brushHead = brushHead;
        this.#brushBody = brushBody;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = this.#counterStartValue;

            const x = this.#random.nextInt(this.#elementArea.getWidth() - 2) + 1;
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 2) + 1;

            if (this.#couldSpawnHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brushHead.apply(x, y, this.#random));
                this.#elementArea.setElement(x + 1, y, this.#brushBody.apply(x + 1, y, this.#random));

                // increase difficulty of spawning fish again
                this.#counterStartValue = this.#counterStartValue << 2;
            }
        }
    }

    #couldSpawnHere(elementArea, x, y) {
        // space around
        if (x < 1 || y < 1) {
            return false;
        }
        if (x + 1 >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }

        // water around
        if (!this.#isWater(elementArea, x, y) || !this.#isWater(elementArea, x - 1, y)
                || !this.#isWater(elementArea, x + 1, y) || !this.#isWater(elementArea, x + 2, y)
                || !this.#isWater(elementArea, x + 1, y + 1) || !this.#isWater(elementArea, x + 2, y + 1)
                || !this.#isWater(elementArea, x + 1, y - 1) || !this.#isWater(elementArea, x + 2, y - 1)) {
            return false;
        }

        // sand around
        return this.#isSand(elementArea, x, y + 2)
                || this.#isSand(elementArea, x + 1, y + 2);
    }

    #isWater(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_FLUID_2) {
            return false;
        }
        return true;
    }

    #isSand(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_SAND_2) {
            return false;
        }
        return true;
    }
}

/**
 * Double buffered renderer. With motion blur.
 *
 * @author Patrik Harag
 * @version 2022-11-08
 */
class Renderer {

    /** @type CanvasRenderingContext2D */
    #context;

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
    #triggeredChunks

    /** @type ImageData */
    #buffer;

    /** @type boolean[] */
    #blur;

    /** @type boolean[] */
    #canBeBlurred;

    constructor(elementArea, chunkSize, context) {
        this.#context = context;
        this.#elementArea = elementArea;
        this.#width = elementArea.getWidth();
        this.#height = elementArea.getHeight();

        this.#chunkSize = chunkSize;
        this.#horChunkCount = Math.ceil(this.#width / this.#chunkSize);
        this.#verChunkCount = Math.ceil(this.#height / this.#chunkSize);
        this.#triggeredChunks = new Array(this.#horChunkCount * this.#verChunkCount).fill(true);

        this.#buffer = this.#context.createImageData(this.#width, this.#height);
        // set up alpha color component
        const data = this.#buffer.data;
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                let index = 4 * (this.#width * y + x);
                data[index + 3] = 0xFF;
            }
        }

        this.#blur = new Array(this.#width * this.#height).fill(false);
        this.#canBeBlurred = new Array(this.#width * this.#height).fill(false);
    }

    trigger(x, y) {
        const cx = Math.trunc(x / this.#chunkSize);
        const cy = Math.trunc(y / this.#chunkSize);
        const chunkIndex = cy * this.#horChunkCount + cx;
        this.#triggeredChunks[chunkIndex] = true;
    }

    triggerChunk(cx, cy) {
        const chunkIndex = cy * this.#horChunkCount + cx;
        this.#triggeredChunks[chunkIndex] = true;
    }

    /**
     *
     * @param activeChunks {boolean[]}
     * @param showActiveChunks {boolean}
     * @return {void}
     */
    render(activeChunks, showActiveChunks) {
        for (let cy = 0; cy < this.#verChunkCount; cy++) {
            for (let cx = 0; cx < this.#horChunkCount; cx++) {
                const chunkIndex = cy * this.#horChunkCount + cx;
                const active = activeChunks[chunkIndex];
                const triggered = this.#triggeredChunks[chunkIndex];
                if (active) {
                    // repaint at least once more because of motion blur
                    this.#triggeredChunks[chunkIndex] = true;
                } else if (triggered) {
                    // unset
                    this.#triggeredChunks[chunkIndex] = false;
                }
                if (active || triggered) {
                    this.#renderChunk(cx, cy, active && showActiveChunks);
                }
            }
        }

        this.#context.putImageData(this.#buffer, 0, 0, 0, 0, this.#width, this.#height);
    }

    #renderChunk(cx, cy, highlight) {
        if (highlight) {
            const setHighlightingPixel = (x, y) => {
                if (x < this.#width && y < this.#height) {
                    const index = (this.#width * y + x) * 4;
                    this.#buffer.data[index]     = 0x00;
                    this.#buffer.data[index + 1] = 0xFF;
                    this.#buffer.data[index + 2] = 0x00;
                }
            }
            for (let i = 0; i < this.#chunkSize; i++) {
                // top
                setHighlightingPixel(cx * this.#chunkSize + i, cy * this.#chunkSize);
                // bottom
                setHighlightingPixel(cx * this.#chunkSize + i, (cy + 1) * this.#chunkSize - 1);
                // left
                setHighlightingPixel(cx * this.#chunkSize, cy * this.#chunkSize + i);
                // right
                setHighlightingPixel((cx + 1) * this.#chunkSize - 1, cy * this.#chunkSize + i);
            }
            const mx = Math.min((cx + 1) * this.#chunkSize - 1, this.#width);
            const my = Math.min((cy + 1) * this.#chunkSize - 1, this.#height);
            for (let y = cy * this.#chunkSize + 1; y < my; y++) {
                for (let x = cx * this.#chunkSize + 1; x < mx; x++) {
                    this.#renderPixel(x, y, this.#buffer.data);
                }
            }
            this.triggerChunk(cx, cy);  // to repaint highlighting
        } else {
            const mx = Math.min((cx + 1) * this.#chunkSize, this.#width);
            const my = Math.min((cy + 1) * this.#chunkSize, this.#height);
            for (let y = cy * this.#chunkSize; y < my; y++) {
                for (let x = cx * this.#chunkSize; x < mx; x++) {
                    this.#renderPixel(x, y, this.#buffer.data);
                }
            }
        }
    }

    #renderPixel(x, y, data) {
        const elementTail = this.#elementArea.getElementTail(x, y);

        const pixelIndex = this.#width * y + x;
        const dataIndex = pixelIndex * 4;

        if (ElementTail.isRenderingModifierBackground(elementTail)) {
            // motion blur

            if (this.#canBeBlurred[pixelIndex] && Renderer.#isWhite(elementTail)) {
                // init fading here

                this.#blur[pixelIndex] = true;
                this.#canBeBlurred[pixelIndex] = false;
            }

            if (this.#blur[pixelIndex]) {
                // paint - continue fading

                const r = data[dataIndex];
                const g = data[dataIndex + 1];
                const b = data[dataIndex + 2];

                const alpha = 0.875 + (Math.random() * 0.1 - 0.05);
                const whiteBackground = 255 * (1.0 - alpha);

                const nr = Math.trunc((r * alpha) + whiteBackground);
                const ng = Math.trunc((g * alpha) + whiteBackground);
                const nb = Math.trunc((b * alpha) + whiteBackground);

                if (r === nr && g === ng && b === nb) {
                    // no change => fading completed
                    this.#blur[pixelIndex] = false;
                    data[dataIndex]     = 0xFF;
                    data[dataIndex + 1] = 0xFF;
                    data[dataIndex + 2] = 0xFF;
                } else {
                    data[dataIndex]     = nr;
                    data[dataIndex + 1] = ng;
                    data[dataIndex + 2] = nb;
                    this.trigger(x, y);  // request next repaint
                }
                return;
            }
        }

        // paint - no blur
        data[dataIndex]     = ElementTail.getColorRed(elementTail);
        data[dataIndex + 1] = ElementTail.getColorGreen(elementTail);
        data[dataIndex + 2] = ElementTail.getColorBlue(elementTail);
        this.#canBeBlurred[pixelIndex] = ElementTail.isRenderingModifierBlurEnabled(elementTail);
        this.#blur[pixelIndex] = false;
    }

    static #isWhite(element) {
        return ElementTail.getColorRed(element) === 255
                && ElementTail.getColorGreen(element) === 255
                && ElementTail.getColorBlue(element) === 255;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
export class Brushes {

    // bright red color for testing purposes
    static _TEST_SOLID = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), [
        ElementTail.of(255, 0, 0, 0),
    ]);

    // bright red color for testing purposes
    static _TEST_AIR = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR), [
        ElementTail.of(255, 0, 0, 0),
    ]);

    static AIR = RandomBrush.of([
        new Element(
                ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR),
                ElementTail.of(255, 255, 255, ElementTail.MODIFIER_BACKGROUND))
    ]);

    static WALL = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), [
        ElementTail.of(55, 55, 55, 0),
        ElementTail.of(57, 57, 57, 0)
    ]);

    static SAND = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_2, ElementHead.WEIGHT_POWDER), [
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(195, 194, 134, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(195, 194, 134, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(218, 211, 165, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(218, 211, 165, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(223, 232, 201, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(186, 183, 128, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static SOIL = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_SOIL), [
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of( 82,  64,  30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of( 82,  64,  30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of( 82,  64,  30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133,  87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133,  87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133,  87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(102, 102, 102, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static STONE = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1, ElementHead.WEIGHT_POWDER), [
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 114, 114, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(193, 193, 193, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static WATER = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_FLUID_2, ElementHead.WEIGHT_WATER), [
        ElementTail.of(4, 135, 186, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(5, 138, 189, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static GRASS = RandomBrush.of([
        new Element(
                ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 5),
                ElementTail.of(56, 126, 38, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
                ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 3),
                ElementTail.of(46, 102,  31, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
                ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 4),
                ElementTail.of(72, 130,  70, ElementTail.MODIFIER_BLUR_ENABLED))
    ]);

    static FISH = RandomBrush.of([
        new Element(
                ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH, 0),
                ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_BODY = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH_BODY, 0),
            ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_CORPSE = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_SAND_2, ElementHead.WEIGHT_POWDER),
            ElementTail.of(61, 68, 74, 0)),
    ]);

    static TREE = CustomBrush.of((x, y, random) => {
        let treeType = random.nextInt(17);
        return new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE, treeType),
            ElementTail.of(77, 41, 13, 0));
    });

    static TREE_ROOT = RandomBrush.of([
        new Element(
                ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_ROOT, 8),
                ElementTail.of(96, 50, 14, 0)),
        new Element(
                ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_ROOT, 5),
                ElementTail.of(77, 41, 13, 0))
    ]);

    static TREE_WOOD = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_TRUNK), [
        ElementTail.of(96, 50, 14, 0),
        ElementTail.of(115, 64, 21, 0)
    ]);

    static TREE_LEAF_LIGHTER = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF), [
        ElementTail.of(0, 129, 73, 0),
    ]);

    static TREE_LEAF_DARKER = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF), [
        ElementTail.of(0, 76, 72, 0),
    ]);

    static TREE_LEAF_DEAD = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL, ElementHead.BEHAVIOUR_TREE_LEAF, 15), [
        ElementTail.of(150, 69, 41, 0),
        ElementTail.of(185, 99, 75, 0),
        ElementTail.of(174, 97, 81, 0),
    ]);


    /**
     *
     * @param brush
     * @param intensity {number} 0..1
     */
    static withIntensity(brush, intensity) {
        class WrappingBrush extends Brush {
            apply(x, y, random) {
                let rnd = (random) ? random.next() : Math.random();
                if (rnd < intensity) {
                    return brush.apply(x, y, random);
                }
                return null;
            }
        }
        return new WrappingBrush();
    }
}