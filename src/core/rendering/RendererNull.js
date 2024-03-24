// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Renderer from "./Renderer";

/**
 * Null renderer. For testing purposes - to measure effects of rendering...
 *
 * @author Patrik Harag
 * @version 2023-10-11
 */
export default class RendererNull extends Renderer {

    constructor() {
        super();
    }

    trigger(x, y) {
        // ignore
    }

    render(changedChunks) {
        // ignore
    }
}