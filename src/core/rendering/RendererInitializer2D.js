// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Renderer2D from "./Renderer2D";
import RendererInitializer from "./RendererInitializer";

/**
 *
 * @author Patrik Harag
 * @version 2024-04-06
 */
export default class RendererInitializer2D extends RendererInitializer {

    #mode;

    constructor(mode) {
        super();
        this.#mode = mode;
    }

    getContextType() {
        return '2d';
    }

    initialize(elementArea, chunkSize, context) {
        let renderer = new Renderer2D(elementArea, chunkSize, context);
        if (this.#mode !== null) {
            renderer.setMode(this.#mode);
        }
        return renderer;
    }
}