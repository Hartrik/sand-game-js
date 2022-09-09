
/**
 *
 * @author Patrik Harag
 * @version 2022-09-08
 */
export class SandGame {

    /** @type ElementArea */
    #elementArea;

    /** @type FastRandom */
    #random;

    /** @type Counter */
    #framesCounter;

    /** @type Counter */
    #cyclesCounter;

    /** @type ElementProcessor */
    #processor;

    /** @type Renderer */
    #renderer;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type function[] */
    #onRendered = [];

    /**
     *
     * @param context {CanvasRenderingContext2D}
     * @param width {number}
     * @param height {number}
     * @param defaultElement
     */
    constructor(context, width, height, defaultElement) {
        this.#elementArea = new ElementArea(width, height, defaultElement);
        this.#random = new FastRandom(0);
        this.#framesCounter = new Counter();
        this.#cyclesCounter = new Counter();
        this.#processor = new ElementProcessor(width, height, this.#random);
        this.#renderer = new MotionBlurRenderer(width, height, context);
        this.#width = width;
        this.#height = height;
    }

    start() {
        // processing
        {
            let interval = Math.trunc(1000 / 120);  // ms
            setInterval(() => this.#doProcessing(), interval);
        }
        // rendering
        {
            let interval = Math.trunc(1000 / 60);  // ms
            setInterval(() => this.#doRendering(), interval);
        }
    }

    #doProcessing() {
        this.#processor.next(this.#elementArea);
        const t = Date.now();
        this.#cyclesCounter.tick(t);
    }

    #doRendering() {
        this.#renderer.render(this.#elementArea);
        const t = Date.now();
        this.#framesCounter.tick(t);
        for (let func of this.#onRendered) {
            func();
        }
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brush {Brush}
     */
    draw(x, y, brush) {
        let element = brush.apply(x, y);
        this.#elementArea.setElement(x, y, element);
    }

    drawRectangle(x1, y1, x2, y2, brush) {
        x1 = Math.max(Math.min(x1, this.#width), 0);
        x2 = Math.max(Math.min(x2, this.#width), 0);
        y1 = Math.max(Math.min(y1, this.#height), 0);
        y2 = Math.max(Math.min(y2, this.#height), 0);

        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                this.draw(x, y, brush);
            }
        }
    }

    drawLine(x1, y1, x2, y2, size, brush) {
        const d = Math.ceil(size / 2);
        let consumer = (x, y) => {
            this.drawRectangle(x-d, y-d, x+d, y+d, brush);
        };
        SandGame.#lineAlgorithm(x1, y1, x2, y2, consumer);
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

    addOnRendered(onRenderedFunc) {
        this.#onRendered.push(onRenderedFunc);
    }

    getFramesPerSecond() {
        return this.#framesCounter.getValue();
    }

    getCyclesPerSecond() {
        return this.#cyclesCounter.getValue();
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-08-28
 */
class Brush {
    apply(x, y) {
        throw 'Not implemented'
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-08-28
 */
class RandomBrush extends Brush {
    #elements;

    constructor(elements) {
        super();
        this.#elements = elements;
    }

    apply(x, y) {
        return this.#elements[Math.trunc(Math.random() * this.#elements.length)];
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-07
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
}

/**
 *
 * @author Patrik Harag
 * @version 2022-08-28
 */
class FastRandom {
    /** @type number */
    #last;

    constructor(seed) {
        this.#last = seed;
    }

    // TODO: Deterministic fast random.

    nextInt(max) {
        return Math.trunc(Math.random() * max);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-08-28
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
        this.#buffer = new DataView(new ArrayBuffer(width * height * 4));

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
        let byteOffset = (this.#width * y + x) * 4;
        this.#buffer.setUint32(byteOffset, element, ElementArea.LITTLE_ENDIAN);
    }

    getElement(x, y) {
        let byteOffset = (this.#width * y + x) * 4;
        return this.#buffer.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
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
 * @version 2022-09-08
 */
class Elements {

    static ELEMENT_TYPE_BACKGROUND = 0x0;
    static ELEMENT_TYPE_STATIC = 0x1;
    static ELEMENT_TYPE_SAND_1 = 0x2;
    static ELEMENT_TYPE_SAND_2 = 0x3;
    static ELEMENT_TYPE_FLUID_1 = 0x4;
    static ELEMENT_TYPE_FLUID_2 = 0x5;

    static of(type, weight, r, g, b) {
        return (((((((type << 4) | weight) << 8) | r) << 8) | g) << 8) | b
    }

    static getType(element) {
        return (element >> 28) & 0x0000000F;
    }

    static getWeight(element) {
        return (element >> 24) & 0x0000000F;
    }

    static getColorRed(element) {
        return (element >> 16) & 0x000000FF;
    }

    static getColorGreen(element) {
        return (element >> 8) & 0x000000FF;
    }

    static getColorBlue(element) {
        return element & 0x000000FF;
    }
}

class ElementProcessor {

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type FastRandom */
    #random;

    static RANDOM_DATA_COUNT = 100;

    /** @type Uint32Array[] */
    #randData = [];

    constructor(width, height, random) {
        this.#width = width;
        this.#height = height;
        this.#random = random;

        // init random data
        this.#randData = [];
        for (let i = 0; i < ElementProcessor.RANDOM_DATA_COUNT; i++) {
            let array = new Uint32Array(width);
            for (let j = 0; j < width; j++) {
                array[j] = this.#random.nextInt(width);
            }
            this.#randData.push(array);
        }
    }

    /**
     *
     * @param elementArea {ElementArea}
     */
    next(elementArea) {
        for (let y = this.#height - 1; y >= 0; y--) {
            let dataIndex = Math.trunc(this.#random.nextInt(ElementProcessor.RANDOM_DATA_COUNT));
            let data = this.#randData[dataIndex];

            for (let i = 0; i < this.#width; i++) {
                let x = data[i];
                this.#nextPoint(elementArea, x, y);
            }
        }
    }

    #nextPoint(elementArea, x, y) {
        let element = elementArea.getElement(x, y);
        let type = Elements.getType(element);

        if (type === Elements.ELEMENT_TYPE_STATIC) {
            // no action

        } else if (type === Elements.ELEMENT_TYPE_SAND_1) {
            //   #
            //  ###
            // #####

            if (!this.#move(elementArea, element, x, y, x, y + 1)) {
                let rnd = this.#random.nextInt(2);
                if (rnd === 0) {
                    this.#move(elementArea, element, x, y, x + 1, y + 1)
                } else {
                    this.#move(elementArea, element, x, y, x - 1, y + 1)
                }
            }
        } else if (type === Elements.ELEMENT_TYPE_SAND_2) {
            //     #
            //   #####
            // #########

            if (!this.#move(elementArea, element, x, y, x, y + 1)) {
                let rnd = this.#random.nextInt(2);
                if (rnd === 0) {
                    if (!this.#move(elementArea, element, x, y, x + 1, y + 1)) {
                        this.#move(elementArea, element, x, y, x + 2, y + 1)
                    }
                } else {
                    if (!this.#move(elementArea, element, x, y, x - 1, y + 1)) {
                        this.#move(elementArea, element, x, y, x - 2, y + 1)
                    }
                }
            }
        } else if (type === Elements.ELEMENT_TYPE_FLUID_1) {
            if (!this.#move(elementArea, element, x, y, x, y + 1)) {
                let rnd = this.#random.nextInt(2);
                if (rnd === 0) {
                    this.#move(elementArea, element, x, y, x + 1, y)
                } else {
                    this.#move(elementArea, element, x, y, x - 1, y)
                }
            }
        } else if (type === Elements.ELEMENT_TYPE_FLUID_2) {
            if (!this.#move(elementArea, element, x, y, x, y + 1)) {
                let rnd = this.#random.nextInt(2);
                if (rnd === 0) {
                    if (this.#move(elementArea, element, x, y, x + 1, y)) {
                        if (this.#move(elementArea, element, x + 1, y, x + 2, y)) {
                            this.#move(elementArea, element, x + 2, y, x + 3, y)
                        }
                    }
                } else {
                    if (this.#move(elementArea, element, x, y, x - 1, y)) {
                        if (this.#move(elementArea, element, x - 1, y, x - 2, y)) {
                            this.#move(elementArea, element, x - 2, y, x - 3, y)
                        }
                    }
                }
            }
        }
    }

    #move(elementArea, element, x, y, x2, y2) {
        if (!elementArea.isValidPosition(x2, y2)) {
            return false;
        }

        let element2 = elementArea.getElement(x2, y2);
        if (Elements.getWeight(element) > Elements.getWeight(element2)) {
            elementArea.setElement(x2, y2, element);
            elementArea.setElement(x, y, element2);
            return true;
        }
        return false;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-08
 */
class Renderer {

    /**
     *
     * @param elementArea {ElementArea}
     * @return {void}
     */
    render(elementArea) {
        throw 'Not implemented';
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-08
 */
class DoubleBufferedRenderer extends Renderer {

    /** @type CanvasRenderingContext2D */
    #context;

    /** @type number */
    _width;

    /** @type number */
    _height;

    /** @type ImageData */
    #buffer;

    static #WATER_EFFECT_COUNTER_MAX = 1000;
    #waterEffectCounter = DoubleBufferedRenderer.#WATER_EFFECT_COUNTER_MAX;

    constructor(width, height, context) {
        super();
        this.#context = context;
        this._width = width;
        this._height = height;
        this.#buffer = this.#context.createImageData(width, height);

        // set up alpha color component
        let data = this.#buffer.data;
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                let index = 4 * (this._width * y + x);
                data[index + 3] = 0xFF;
            }
        }
    }

    /**
     *
     * @param elementArea {ElementArea}
     * @return {void}
     */
    render(elementArea) {
        const data = this.#buffer.data;

        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                this._renderPixel(elementArea, x, y, data);
            }
        }

        this.#context.putImageData(this.#buffer, 0, 0, 0, 0, this._width, this._height);
    }

    _renderPixel(elementArea, x, y, data) {
        const element = elementArea.getElement(x, y);
        const index = (this._width * y + x) * 4;
        this._renderElement(index, element, data);
    }

    _renderElement(index, element, data) {
        const elementType = Elements.getType(element);
        if (elementType === Elements.ELEMENT_TYPE_FLUID_2 && this.#waterEffectCounter-- === 0) {
            // water effect - implemented using alpha blending

            this.#waterEffectCounter = DoubleBufferedRenderer.#WATER_EFFECT_COUNTER_MAX;

            const alpha = 0.5 + Math.random() * 0.5;
            const whiteBackground = 255 * (1.0 - alpha);

            data[index]     = (Elements.getColorRed(element)   * alpha) + whiteBackground;
            data[index + 1] = (Elements.getColorGreen(element) * alpha) + whiteBackground;
            data[index + 2] = (Elements.getColorBlue(element)  * alpha) + whiteBackground;
        } else {
            data[index]     = Elements.getColorRed(element);
            data[index + 1] = Elements.getColorGreen(element);
            data[index + 2] = Elements.getColorBlue(element);
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class MotionBlurRenderer extends DoubleBufferedRenderer {

    static #ALPHA = 0.875;
    static #WHITE_BACKGROUND = 255 * (1.0 - MotionBlurRenderer.#ALPHA);

    /** @type boolean[] */
    #blur;

    /** @type boolean[] */
    #canBeBlurred;

    constructor(width, height, context) {
        super(width, height, context);
        this.#blur = new Array(width * height);
        this.#blur.fill(false);
        this.#canBeBlurred = new Array(width * height);
        this.#canBeBlurred.fill(false);
    }

    _renderPixel(elementArea, x, y, data) {
        const element = elementArea.getElement(x, y);
        const elementType = Elements.getType(element);

        const pixelIndex = this._width * y + x;
        const dataIndex = pixelIndex * 4;

        if (elementType === Elements.ELEMENT_TYPE_BACKGROUND) {
            if (this.#canBeBlurred[pixelIndex] && MotionBlurRenderer.#isWhite(element)) {
                // init fading here

                this.#blur[pixelIndex] = true;
                this.#canBeBlurred[pixelIndex] = false;
            }

            if (this.#blur[pixelIndex]) {
                // continue fading

                const r = data[dataIndex];
                const g = data[dataIndex + 1];
                const b = data[dataIndex + 2];

                if (MotionBlurRenderer.#isVisible(r, g, b)) {
                    data[dataIndex]     = (r * MotionBlurRenderer.#ALPHA) + MotionBlurRenderer.#WHITE_BACKGROUND;
                    data[dataIndex + 1] = (g * MotionBlurRenderer.#ALPHA) + MotionBlurRenderer.#WHITE_BACKGROUND;
                    data[dataIndex + 2] = (b * MotionBlurRenderer.#ALPHA) + MotionBlurRenderer.#WHITE_BACKGROUND;
                    return;
                } else {
                    // fading completed
                    this.#blur[pixelIndex] = false;
                }
            }
        }

        // no blur
        super._renderElement(dataIndex, element, data);
        this.#canBeBlurred[pixelIndex] = elementType > Elements.ELEMENT_TYPE_STATIC;
        this.#blur[pixelIndex] = false;
    }

    static #isWhite(element) {
        return Elements.getColorRed(element) === 255
                && Elements.getColorGreen(element) === 255
                && Elements.getColorBlue(element) === 255;
    }

    static #isVisible(r, g, b) {
        return r < 251 && g < 251 && b < 251;
    }
}

export class Brushes {
    static #AIR_W = 0x0;
    static #WATER_W = 0x1;
    static #POWDER_W = 0x2;
    static #WALL_W = 0x3;

    static AIR = new RandomBrush([
        Elements.of(Elements.ELEMENT_TYPE_BACKGROUND, Brushes.#AIR_W, 255, 255, 255)
    ]);

    static WALL = new RandomBrush([
        Elements.of(Elements.ELEMENT_TYPE_STATIC, Brushes.#WALL_W, 55, 55, 55),
        Elements.of(Elements.ELEMENT_TYPE_STATIC, Brushes.#WALL_W, 57, 57, 57)
    ]);

    static SAND = new RandomBrush([
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 214, 212, 154),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 214, 212, 154),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 214, 212, 154),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 214, 212, 154),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 225, 217, 171),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 225, 217, 171),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 225, 217, 171),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 225, 217, 171),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 203, 201, 142),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 203, 201, 142),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 203, 201, 142),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 203, 201, 142),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 195, 194, 134),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 195, 194, 134),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 218, 211, 165),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 218, 211, 165),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 223, 232, 201),
        Elements.of(Elements.ELEMENT_TYPE_SAND_2, Brushes.#POWDER_W, 186, 183, 128),
    ]);

    static SOIL = new RandomBrush([
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 142, 104,  72),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 142, 104,  72),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 142, 104,  72),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 142, 104,  72),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 142, 104,  72),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 142, 104,  72),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 114,  81,  58),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 114,  81,  58),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 114,  81,  58),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 114,  81,  58),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 114,  81,  58),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 114,  81,  58),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W,  82,  64,  30),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W,  82,  64,  30),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W,  82,  64,  30),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 177, 133,  87),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 177, 133,  87),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 177, 133,  87),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 102, 102, 102),
    ]);

    static STONE = new RandomBrush([
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 131, 131, 131),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 131, 131, 131),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 131, 131, 131),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 131, 131, 131),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 131, 131, 131),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 131, 131, 131),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 135, 135, 135),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 135, 135, 135),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 135, 135, 135),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 135, 135, 135),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 135, 135, 135),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 135, 135, 135),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 145, 145, 145),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 145, 145, 145),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 145, 145, 145),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 145, 145, 145),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 145, 145, 145),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 145, 145, 145),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 148, 148, 148),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 148, 148, 148),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 148, 148, 148),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 148, 148, 148),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 148, 148, 148),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 148, 148, 148),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 160, 160, 160),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 160, 160, 160),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 160, 160, 160),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 160, 160, 160),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 160, 160, 160),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 160, 160, 160),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 114, 114, 114),
        Elements.of(Elements.ELEMENT_TYPE_SAND_1, Brushes.#POWDER_W, 193, 193, 193),
    ]);

    static WATER = new RandomBrush([
        Elements.of(Elements.ELEMENT_TYPE_FLUID_2, Brushes.#WATER_W, 4, 135, 186),
        Elements.of(Elements.ELEMENT_TYPE_FLUID_2, Brushes.#WATER_W, 5, 138, 189),
    ]);
}