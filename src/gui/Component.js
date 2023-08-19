
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class Component {

    /**
     *
     * @param sandGameControls {SandGameControls}
     * @return {jQuery<HTMLElement>}
     */
    createNode(sandGameControls) {
        throw 'Not implemented';
    }
}
