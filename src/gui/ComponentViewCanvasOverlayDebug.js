import {Component} from "./Component";
import {DomBuilder} from "./DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-07
 */
export class ComponentViewCanvasOverlayDebug extends Component {

    /** @type Controller */
    #controller;

    #nodeOverlay;

    #nodeLabel = null;
    #nodeRectangles = null;

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
     * @param changedChunks {boolean[]}
     */
    highlightChunks(changedChunks) {
        if (changedChunks === null) {
            if (this.#nodeRectangles !== null) {
                // hide
                this.#nodeOverlay.style.display = 'none';
            }
            return;
        }

        if (this.#nodeRectangles === null) {
            this.#init();
        }
        this.#nodeOverlay.style.display = 'unset';
        this.#update(changedChunks);
    }

    #update(changedChunks) {
        const sandGame = this.#controller.getSandGame();
        const chunkSize = sandGame.getChunkSize();
        const horChunkCount = Math.ceil(sandGame.getWidth() / chunkSize);
        const verChunkCount = Math.ceil(sandGame.getHeight() / chunkSize);

        let highlighted = 0;
        for (let cy = 0; cy < verChunkCount; cy++) {
            for (let cx = 0; cx < horChunkCount; cx++) {
                const chunkIndex = cy * horChunkCount + cx;
                const rect = this.#nodeRectangles[chunkIndex];
                if (changedChunks[chunkIndex]) {
                    highlighted++;
                    rect.style.display = 'unset';
                } else {
                    rect.style.display = 'none';
                }
            }
        }

        // show stats
        const total = horChunkCount * verChunkCount;
        const highlightedPercent = Math.trunc(highlighted / total * 100);
        this.#nodeLabel.textContent = `${highlighted}/${total} (${highlightedPercent}%)`;
    }

    #init() {
        const sandGame = this.#controller.getSandGame();
        const chunkSize = sandGame.getChunkSize();
        const horChunkCount = Math.ceil(sandGame.getWidth() / chunkSize);
        const verChunkCount = Math.ceil(sandGame.getHeight() / chunkSize);

        const rects = Array(verChunkCount * horChunkCount);
        for (let cy = 0; cy < verChunkCount; cy++) {
            for (let cx = 0; cx < horChunkCount; cx++) {
                const chunkIndex = cy * horChunkCount + cx;
                rects[chunkIndex] = this.#createRectangle(cx, cy, chunkSize);
            }
        }

        this.#nodeRectangles = rects;
        this.#nodeOverlay.append(...rects);

        this.#nodeLabel = this.#createLabel(0, 0);
        this.#nodeOverlay.append(this.#nodeLabel);
    }

    #createLabel(x, y) {
        const xPx = x / this.#scale;
        const yPx = y / this.#scale;
        return DomBuilder.span('', {
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                position: 'absolute',
                color: 'rgb(0, 255, 0)'
            }
        });
    }

    #createRectangle(cx, cy, chunkSize) {
        const wPx = this.#w / this.#scale;
        const hPx = this.#h / this.#scale;
        const xPx = cx * chunkSize / this.#scale;
        const yPx = cy * chunkSize / this.#scale;
        const cwPx = chunkSize / this.#scale;
        const chPx = chunkSize / this.#scale;

        const rectangle = DomBuilder.div({
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                width: cwPx + 'px',
                height: chPx + 'px',
                position: 'absolute',
                outline: 'rgb(0, 255, 0) 1px solid'
            }
        });

        if (xPx + cwPx >= wPx || yPx + chPx >= hPx) {
            // clip

            const UNSET = -1;  // expect border
            const pxClipTop = UNSET;
            const pxClipRight = xPx + cwPx >= wPx ? xPx + cwPx - wPx : UNSET;
            const pxClipBottom = yPx + chunkSize >= hPx ? yPx + chPx - hPx : UNSET;
            const pxClipLeft = UNSET;

            rectangle.style.clipPath = `inset(${pxClipTop}px ${pxClipRight}px ${pxClipBottom}px ${pxClipLeft}px)`;
        }

        return rectangle;
    }

    createNode(controller) {
        return this.#nodeOverlay;
    }
}