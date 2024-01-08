import {Component} from "./Component";
import {DomBuilder} from "./DomBuilder";
import {CursorDefinitionElementArea} from "../core/CursorDefinitionElementArea";
import {Renderer2D} from "../core/Renderer2D";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-07
 */
export class ComponentViewCanvasOverlayCursor extends Component {

    /** @type Controller */
    #controller;

    #nodeOverlay;

    /** @type {{node:any,width:number,height:number}|null} */
    #cursor = null;

    constructor(w, h, scale, controller) {
        super();
        const wPx = w / scale;
        const hPx = h / scale;
        this.#nodeOverlay = DomBuilder.div({
            style: {
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

    createNode(controller) {
        return this.#nodeOverlay;
    }

    hideCursors() {
        this.#nodeOverlay.innerHTML = '';
        this.#cursor = null;
    }

    repaintRectangleSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.innerHTML = '';

        let xPx = Math.min(lastX, x) / scale;
        let yPx = Math.min(lastY, y) / scale;
        let wPx = Math.abs(x - lastX) / scale;
        let hPx = Math.abs(y - lastY) / scale;

        const selection = DomBuilder.div({
            style: {
                left: xPx + 'px',
                top: yPx + 'px',
                width: wPx + 'px',
                height: hPx + 'px',
                position: 'absolute',
                outline: 'black 1px solid',
                pointerEvents: 'none'
            }
        });
        this.#nodeOverlay.append(selection);
    }

    repaintLineSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.innerHTML = '';

        const w = this.#controller.getCurrentWidthPoints();
        const h = this.#controller.getCurrentHeightPoints();

        const line = DomBuilder.create(`
            <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
              <line x1="${lastX}" y1="${lastY}" x2="${x}" y2="${y}" stroke="black" />
            </svg>
        `);
        line.style.pointerEvents = 'none';
        this.#nodeOverlay.append(line);
    }

    showCursor(x, y, scale, cursorDefinition) {
        if (cursorDefinition instanceof CursorDefinitionElementArea) {
            const wPx = Math.trunc(cursorDefinition.getWidth() / scale);
            const hPx = Math.trunc(cursorDefinition.getHeight() / scale);

            const node = DomBuilder.element('canvas', {
                width: cursorDefinition.getWidth() + 'px',
                height: cursorDefinition.getHeight() + 'px',
                style: {
                    width: `${wPx}px`,
                    height: `${hPx}px`,
                    outline: 'black 1px solid'
                }
            });

            // render preview
            node.style.imageRendering = 'pixelated';
            Renderer2D.renderPreview(cursorDefinition.getElementArea(), node.getContext('2d'), 0xBB);

            this.#cursor = {
                width: wPx,
                height: hPx,
                node: node
            };
        } else {
            return;
        }

        this.#cursor.node.style.position = 'absolute';
        this.#cursor.node.style.pointerEvents = 'none';

        this.moveCursor(x, y, scale);
    }

    hasCursor() {
        return this.#cursor !== null;
    }

    moveCursor(x, y, scale) {
        const cursor = this.#cursor;

        const pxW = this.#controller.getCurrentWidthPoints() / scale;
        const pxH = this.#controller.getCurrentHeightPoints() / scale;

        const pxTop = y / scale - Math.trunc(cursor.height / 2);
        const pxLeft = x / scale - Math.trunc(cursor.width / 2);

        const UNSET = -1;  // expect border
        const pxClipTop = pxTop < 0 ? -pxTop : UNSET;
        const pxClipRight = pxLeft + cursor.width >= pxW ? pxLeft + cursor.width - pxW : UNSET;
        const pxClipBottom = pxTop + cursor.height >= pxH ? pxTop + cursor.height - pxH : UNSET;
        const pxClipLeft = pxLeft < 0 ? -pxLeft : UNSET;

        cursor.node.style.top = pxTop + 'px';
        cursor.node.style.left = pxLeft + 'px';
        cursor.node.style.clipPath = `inset(${pxClipTop}px ${pxClipRight}px ${pxClipBottom}px ${pxClipLeft}px)`;

        this.#nodeOverlay.innerHTML = '';
        this.#nodeOverlay.append(cursor.node);
    }
}