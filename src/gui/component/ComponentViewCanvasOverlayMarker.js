// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Component from "./Component";
import DomBuilder from "../DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-17
 */
export default class ComponentViewCanvasOverlayMarker extends Component {

    /** @type Controller */
    #controller;

    #nodeOverlay;

    #w;
    #h;
    #scale;

    constructor(w, h, scale, controller) {
        super();
        this.#w = w;
        this.#h = h;
        this.#scale = scale;
        const wPx = w / scale;
        const hPx = h / scale;
        this.#nodeOverlay = DomBuilder.div({
            style: {
                display: 'none',  // hidden by default
                position: 'absolute',
                left: '0',
                top: '0',
                width: `${wPx}px`,
                height: `${hPx}px`
            },
            class: 'sand-game-canvas-overlay',
            width: w + 'px',
            height: h + 'px',
        });
        this.#controller = controller;
    }

    /**
     *
     * @param overlay {SandGameOverlay}
     */
    register(overlay) {
        const markers = overlay.getMarkers();
        if (markers.length > 0) {
            for (const marker of markers) {
                this.#nodeOverlay.append(this.#createMarkerNode(marker));
            }
            this.#nodeOverlay.style.display = 'initial';
        }

        // future markers
        overlay.addOnMarkerAdded((marker) => {
            this.#nodeOverlay.append(this.#createMarkerNode(marker));
            this.#nodeOverlay.style.display = 'initial';
        });
    }

    /**
     *
     * @param marker {Marker}
     * @returns {HTMLElement}
     */
    #createMarkerNode(marker) {
        const config = marker.getConfig();

        const [x1, y1, x2, y2] = marker.getPosition();
        const rectangle = this.#createRectangle(x1, y1, x2, y2, config.label);
        if (typeof config.style === 'object') {
            for (const [key, value] of Object.entries(config.style)) {
                rectangle.style[key] = value;
            }
        }
        if (!marker.isVisible()) {
            rectangle.style.display = 'none';
        }
        marker.addOnVisibleChanged((visible) => {
            rectangle.style.display = visible ? 'initial' : 'none';
        });
        return rectangle;
    }

    #createRectangle(x1, y1, x2, y2, content = null) {
        const xPx = x1 / this.#scale;
        const yPx = y1 / this.#scale;
        const wPx = (x2 - x1) / this.#scale;
        const hPx = (y2 - y1) / this.#scale;

        const attributes = {
            class: 'sand-game-marker',
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                width: wPx + 'px',
                height: hPx + 'px',
                position: 'absolute',
            }
        };

        return DomBuilder.div(attributes, content);
    }

    createNode(controller) {
        return this.#nodeOverlay;
    }
}