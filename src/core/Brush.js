
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
export class Brush {

    /**
     *
     * @param x
     * @param y
     * @param random {DeterministicRandom|undefined}
     * @return {Element}
     */
    apply(x, y, random = undefined) {
        throw 'Not implemented'
    }
}