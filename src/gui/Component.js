
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class Component {

    /**
     *
     * @param controller {Controller}
     * @return {jQuery<HTMLElement>}
     */
    createNode(controller) {
        throw 'Not implemented';
    }
}
