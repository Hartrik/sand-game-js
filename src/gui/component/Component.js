// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-22
 */
export default class Component {

    /**
     *
     * @param controller {Controller}
     * @return {HTMLElement}
     */
    createNode(controller) {
        throw 'Not implemented';
    }
}
