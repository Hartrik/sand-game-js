import {ElementArea} from "./ElementArea.js";
import {Marker} from "./Marker";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-08
 */
export class SandGameOverlay {

    /** @type ElementArea */
    #elementArea;

    /** @type Marker[] */
    #markers = [];

    /** @type function(Marker)[] */
    #onMarkerAdded = [];

    constructor(elementArea) {
        this.#elementArea = elementArea;
    }

    createRectangle(x1, y1, x2, y2, cssStyles, supportNegativeCoordinates = false) {
        x1 = Math.trunc(x1);
        y1 = Math.trunc(y1);
        x2 = Math.trunc(x2);
        y2 = Math.trunc(y2);

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

        const marker = new Marker(x1, y1, x2, y2, cssStyles);
        this.#markers.push(marker);
        for (let handler of this.#onMarkerAdded) {
            handler(marker);
        }

        return marker;
    }

    /**
     *
     * @returns {Marker[]}
     */
    getMarkers() {
        return [...this.#markers];
    }

    addOnMarkerAdded(handler) {
        this.#onMarkerAdded.push(handler);
    }

    getWidth() {
        return this.#elementArea.getWidth();
    }

    getHeight() {
        return this.#elementArea.getHeight();
    }
}