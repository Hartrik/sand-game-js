// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import RendererWebGL from "./RendererWebGL";
import RenderingWebGLException from "./RenderingWebGLException";
import RendererInitializer from "./RendererInitializer";

/**
 *
 * @author Patrik Harag
 * @version 2024-04-06
 */
export default class RendererInitializerWebGL extends RendererInitializer {

    getContextType() {
        return 'webgl2';
    }

    initialize(elementArea, chunkSize, context) {
        try {
            return new RendererWebGL(elementArea, chunkSize, context);
        } catch (e) {
            throw new RenderingWebGLException(e);
        }
    }
}