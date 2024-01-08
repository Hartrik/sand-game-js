
/**
 *
 * @author Patrik Harag
 * @version 2024-01-07
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

    /** @type object */
    #cssStyles;

    /** @type boolean */
    #visible = true;
    /** @type function(boolean)[] */
    #onVisibleChanged = [];

    constructor(x1, y1, x2, y2, cssStyles) {
        this.#x1 = x1;
        this.#y1 = y1;
        this.#x2 = x2;
        this.#y2 = y2;
        this.#cssStyles = cssStyles;
    }

    getPosition() {
        return [ this.#x1, this.#y1, this.#x2, this.#y2 ];
    }

    getCssStyles() {
        return this.#cssStyles;
    }

    // visibility

    isVisible() {
        return this.#visible;
    }

    setVisible(visible) {
        this.#visible = visible;
        for (let handler of this.#onVisibleChanged) {
            handler(visible);
        }
    }

    addOnVisibleChanged(handler) {
        this.#onVisibleChanged.push(handler);
    }
}
