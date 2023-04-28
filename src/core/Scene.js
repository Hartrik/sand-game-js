
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-04-28
 */
export class Scene {

    /**
     * @returns [width: number, height: number]
     */
    countSize(prefWidth, prefHeight) {
        throw 'Not implemented';
    }

    /**
     * @param context {CanvasRenderingContext2D}
     * @param prefWidth {number}
     * @param prefHeight {number}
     * @param defaultElement {Element}
     * @returns SandGame
     */
    create(context, prefWidth, prefHeight, defaultElement) {
        throw 'Not implemented';
    }
}
