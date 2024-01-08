import { Renderer } from "./Renderer";

/**
 * Null renderer. For testing purposes - to measure effects of rendering...
 *
 * @author Patrik Harag
 * @version 2023-10-11
 */
export class RendererNull extends Renderer {

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