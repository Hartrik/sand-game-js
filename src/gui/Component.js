
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-12-22
 */
export class Component {

    /**
     *
     * @param controller {Controller}
     * @return {HTMLElement}
     */
    createNode(controller) {
        throw 'Not implemented';
    }
}
