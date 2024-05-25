// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import RendererNull from "./RendererNull";
import RendererInitializer from "./RendererInitializer";

/**
 *
 * @author Patrik Harag
 * @version 2024-04-06
 */
export default class RendererInitializerNull extends RendererInitializer {

    constructor() {
        super();
    }

    getContextType() {
        return '2d';
    }

    initialize(elementArea, chunkSize, context) {
        return new RendererNull();
    }
}