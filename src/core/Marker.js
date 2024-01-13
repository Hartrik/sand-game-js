
/**
 * @typedef {object} MarkerConfig
 * @property {CSSStyleDeclaration} style
 * @property {boolean} visible
 */

/**
 *
 * @author Patrik Harag
 * @version 2024-01-13
 */
export class Marker {

    /** @type number */
    #x1;
    /** @type number */
    #y1;
    /** @type number */
    #x2;
    /** @type number */
    #y2;

    /** @type MarkerConfig */
    #config;

    /** @type boolean */
    #visible = true;
    /** @type function(boolean)[] */
    #onVisibleChanged = [];

    constructor(x1, y1, x2, y2, config) {
        this.#x1 = x1;
        this.#y1 = y1;
        this.#x2 = x2;
        this.#y2 = y2;
        this.#config = config;
        this.#visible = config.visible === true;
    }

    getPosition() {
        return [ this.#x1, this.#y1, this.#x2, this.#y2 ];
    }

    /**
     *
     * @returns {MarkerConfig}
     */
    getConfig() {
        return this.#config;
    }

    // visibility

    isVisible() {
        return this.#visible;
    }

    setVisible(visible) {
        if (this.#visible !== visible) {
            // handlers are triggered only on change
            this.#visible = visible;
            for (let handler of this.#onVisibleChanged) {
                handler(visible);
            }
        }
    }

    addOnVisibleChanged(handler) {
        this.#onVisibleChanged.push(handler);
    }
}
