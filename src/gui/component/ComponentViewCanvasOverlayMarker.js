import {Component} from "./Component";
import {DomBuilder} from "../DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-10
 */
export class ComponentViewCanvasOverlayMarker extends Component {

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

    #createMarkerNode(marker) {
        const [x1, y1, x2, y2] = marker.getPosition();
        const rectangle = this.#createRectangle(x1, y1, x2, y2);
        for (const [key, value] of Object.entries(marker.getCssStyles())) {
            rectangle.style[key] = value;
        }
        if (!marker.isVisible()) {
            rectangle.style.display = 'none';
        }
        marker.addOnVisibleChanged((visible) => {
            rectangle.style.display = visible ? 'initial' : 'none';
        });
        return rectangle;
    }

    #createRectangle(x1, y1, x2, y2) {
        const xPx = x1 / this.#scale;
        const yPx = y1 / this.#scale;
        const wPx = (x2 - x1) / this.#scale;
        const hPx = (y2 - y1) / this.#scale;

        const rectangle = DomBuilder.div({
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                width: wPx + 'px',
                height: hPx + 'px',
                position: 'absolute',
            }
        });

        return rectangle;
    }

    createNode(controller) {
        return this.#nodeOverlay;
    }
}