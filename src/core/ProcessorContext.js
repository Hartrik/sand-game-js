
/**
 *
 * @author Patrik Harag
 * @version 2023-05-16
 */
export class ProcessorContext {

    static OPT_CYCLES_PER_SECOND = 120;
    static OPT_FRAMES_PER_SECOND = 60;


    /**
     * @returns number
     */
    getIteration() {
        throw 'Not implemented';
    }

    /**
     * @returns ProcessorDefaults
     */
    getDefaults() {
        throw 'Not implemented';
    }

    trigger(x, y) {
        throw 'Not implemented';
    }
}