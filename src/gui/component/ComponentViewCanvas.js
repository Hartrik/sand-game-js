// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DomBuilder from "../DomBuilder";
import Component from "./Component";
import ComponentViewCanvasInner from "./ComponentViewCanvasInner";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-15
 */
export default class ComponentViewCanvas extends Component {

    /** @type {HTMLElement} */
    #canvasHolderNode = DomBuilder.div({ class: 'sand-game-canvas-holder' });
    /** @type {ComponentViewCanvasInner} */
    #currentCanvas = null;

    createNode(controller) {
        controller.registerCanvasProvider({
            initialize: () => {
                this.#canvasHolderNode.innerHTML = '';

                this.#currentCanvas = new ComponentViewCanvasInner(controller);
                this.#canvasHolderNode.append(this.#currentCanvas.createNode(controller));
                return this.#currentCanvas.getCanvasNode();
            },
            getCanvasNode: () => {
                if (this.#currentCanvas !== null) {
                    return this.#currentCanvas.getCanvasNode();
                }
                return null;
            }
        });

        controller.addOnImageRenderingStyleChanged((imageRenderingStyle) => {
            if (this.#currentCanvas !== null) {
                this.#currentCanvas.setImageRenderingStyle(imageRenderingStyle)
            }
        });

        controller.addOnInitialized((sandGame) => {
            if (this.#currentCanvas === null) {
                throw 'Illegal state: canvas is not initialized';
            }

            // register mouse handling and overlays
            this.#currentCanvas.register(sandGame);
        })

        controller.addOnBeforeClosed(() => {
            this.#currentCanvas = null;
            this.#canvasHolderNode.innerHTML = '';
        })

        controller.getToolManager().addOnInputDisabledChanged(disabled => {
            if (this.#currentCanvas !== null) {
                this.#currentCanvas.onInputDisabledChanged(disabled);
            }
        });

        return this.#canvasHolderNode;
    }
}