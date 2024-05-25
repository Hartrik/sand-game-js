// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import RendererInitializer2D from "../core/rendering/RendererInitializer2D";
import RendererInitializerWebGL from "../core/rendering/RendererInitializerWebGL";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class RendererInitializerDefs {

    static canvas2d(renderingMode = null) {
        return new RendererInitializer2D(renderingMode);
    }

    static canvasWebGL() {
        return new RendererInitializerWebGL();
    }
}
