
/**
 *
 * @author Patrik Harag
 * @version 2024-01-08
 */
export class SnapshotMetadata {

    static CURRENT_FORMAT_VERSION = 5;


    /** @type number */
    formatVersion;

    /** @type string */
    appVersion;

    /** @type number|undefined */
    created;

    /** @type number|undefined */
    width;

    /** @type number|undefined */
    height;

    /** @type number|undefined */
    scale;

    /** @type number|undefined */
    random;

    /** @type number|undefined */
    iteration;

    /** @type boolean|undefined */
    fallThroughEnabled;

    /** @type boolean|undefined */
    erasingEnabled;
}