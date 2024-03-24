// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 * @author Patrik Harag
 * @version 2023-02-18
 */
export default class RenderingMode {

    /**
     * Element rendering function.
     *
     * Default implementation:
     * <pre>
     *     data[dataIndex] = ElementTail.getColorRed(elementTail);
     *     data[dataIndex + 1] = ElementTail.getColorGreen(elementTail);
     *     data[dataIndex + 2] = ElementTail.getColorBlue(elementTail);
     * </pre>
     *
     * @param data
     * @param dataIndex
     * @param elementHead
     * @param elementTail
     */
    apply(data, dataIndex, elementHead, elementTail) {
        throw 'Not implemented'
    }
}