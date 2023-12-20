
/**
 * Custom random implementation: "Mulberry32"
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export class DeterministicRandom {

    static DEFAULT = new DeterministicRandom(106244033);

    static next(seed) {
        let t = seed + 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    /** @type number */
    #last;

    constructor(seed) {
        this.#last = seed;
    }

    /**
     *
     * @return {number} (0..1)
     */
    next() {
        let t = this.#last += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    /**
     *
     * @param max
     * @return {number} <0..max)
     */
    nextInt(max) {
        return Math.trunc(this.next() * max);
    }

    /**
     * Generator state.
     *
     * @return {number} integer
     */
    getState() {
        return this.#last;
    }
}
