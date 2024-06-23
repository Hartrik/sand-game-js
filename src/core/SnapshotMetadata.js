// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 *
 * @author Patrik Harag
 * @version 2024-06-23
 */
export default class SnapshotMetadata {

    static CURRENT_FORMAT_VERSION = 8;


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
