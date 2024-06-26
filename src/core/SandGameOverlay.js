// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Marker from "./Marker";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class SandGameOverlay {

    /** @type number */
    #width;
    /** @type number */
    #height;

    /** @type Marker[] */
    #markers = [];

    /** @type function(Marker)[] */
    #onMarkerAdded = [];

    constructor(width, height) {
        this.#width = width;
        this.#height = height;
    }

    /**
     *
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param config {MarkerConfig}
     * @param supportNegativeCoordinates {boolean}
     * @returns {Marker}
     */
    createRectangle(x1, y1, x2, y2, config, supportNegativeCoordinates = false) {
        x1 = Math.trunc(x1);
        y1 = Math.trunc(y1);
        x2 = Math.trunc(x2);
        y2 = Math.trunc(y2);

        if (supportNegativeCoordinates) {
            x1 = (x1 >= 0) ? x1 : this.#width + x1 + 1;
            x2 = (x2 >= 0) ? x2 : this.#width + x2 + 1;
            y1 = (y1 >= 0) ? y1 : this.#height + y1 + 1;
            y2 = (y2 >= 0) ? y2 : this.#height + y2 + 1;
        }

        x1 = Math.max(Math.min(x1, this.#width - 1), 0);
        x2 = Math.max(Math.min(x2, this.#width - 1), 0);
        y1 = Math.max(Math.min(y1, this.#height - 1), 0);
        y2 = Math.max(Math.min(y2, this.#height - 1), 0);

        const marker = new Marker(x1, y1, x2, y2, config);
        this.#markers.push(marker);
        for (let handler of this.#onMarkerAdded) {
            handler(marker);
        }

        return marker;
    }

    /**
     *
     * @param x
     * @param y
     * @param w
     * @param h
     * @param config {MarkerConfig}
     * @returns {Marker}
     */
    createRectangleWH(x, y, w, h, config) {
        return this.createRectangle(x, y, x + w, y + h, config);
    }

    /**
     *
     * @param group {string|undefined}
     * @returns {Marker[]}
     */
    getMarkers(group = undefined) {
        if (group === undefined) {
            return [...this.#markers];
        } else {
            // TODO: cache?
            return this.#markers.filter(m => m.getConfig().group === group);
        }
    }

    addOnMarkerAdded(handler) {
        this.#onMarkerAdded.push(handler);
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height
    }
}