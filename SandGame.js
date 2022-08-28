
/**
 *
 * @author Patrik Harag
 * @version 2022-08-28
 */
export class SandGame {

    /** @type Canvas */
    #canvas;

    /** @type DoubleBufferedRenderer */
    #renderer;

    /** @type number */
    #width;

    /** @type number */
    #height;

    constructor(context, width, height) {
        this.#canvas = new Canvas(width, height);
        this.#renderer = new DoubleBufferedRenderer(width, height, context);
        this.#width = width;
        this.#height = height;
    }

    start() {
        let interval = 1000 / 60;  // ms
        setInterval(() => this.tick(), interval);
    }

    tick() {
        let t1 = new Date();

        this.#renderer.render(this.#canvas);

        let t2 = new Date();
        let dt = t2 - t1;

        console.log('Tick time = ' + dt + ' ms');
    }

    draw(x, y) {
        let element = 0x01ff0000;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                let xx = x+5-j;
                let yy = y+5-i;
                if (this.#canvas.isValidPosition(xx, yy)) {
                    this.#canvas.setElement(xx, yy, element);
                }
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-08-28
 */
class Canvas {
    static LITTLE_ENDIAN = true;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type DataView */
    #buffer;

    constructor(width, height) {
        this.#width = width;
        this.#height = height;
        this.#buffer = new DataView(new ArrayBuffer(width * height * 4));

        // set default elements
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                this.setElement(x, y, 0x00FFFFFF);
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
        this.#buffer.setUint32(byteOffset, element, Canvas.LITTLE_ENDIAN);
    }

    getElement(x, y) {
        let byteOffset = (this.#width * y + x) * 4;
        return this.#buffer.getUint32(byteOffset, Canvas.LITTLE_ENDIAN);
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
 * @version 2022-08-27
 */
class Elements {

    static getType(element) {
        return (element >> 24) & 0x000000FF;
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

/**
 *
 * @author Patrik Harag
 * @version 2022-08-27
 */
class DoubleBufferedRenderer {

    #context;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type ImageData */
    #buffer;

    constructor(width, height, context) {
        this.#context = context;
        this.#width = width;
        this.#height = height;
        this.#buffer = this.#context.createImageData(width, height);

        // set up alpha color component
        let data = this.#buffer.data;
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                let index = 4 * (this.#width * y + x);
                data[index + 3] = 0xFF;
            }
        }
    }

    /**
     *
     * @param canvas Canvas
     */
    render(canvas) {
        let data = this.#buffer.data;

        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                let element = canvas.getElement(x, y);

                let index = (this.#width * y + x) * 4;
                data[index] = Elements.getColorRed(element);
                data[index + 1] = Elements.getColorGreen(element);
                data[index + 2] = Elements.getColorBlue(element);
                // data[index + 3] = 0xFF;
            }
        }

        this.#context.putImageData(this.#buffer, 0, 0, 0, 0, this.#width, this.#height);
    }
}