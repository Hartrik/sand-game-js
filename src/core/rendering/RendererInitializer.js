// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class RendererInitializer {

    getContextType() {
        throw 'Not implemented'
    }

    /**
     *
     * @param elementArea
     * @param chunkSize
     * @param context
     * @return {Renderer}
     */
    initialize(elementArea, chunkSize, context) {
        throw 'Not implemented'
    }
}
