
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-08-27
 */
export class Renderer {

    trigger(x, y) {
        throw 'Not implemented';
    }

    /**
     *
     * @param changedChunks {boolean[]}
     * @return {void}
     */
    render(changedChunks) {
        throw 'Not implemented';
    }
}
