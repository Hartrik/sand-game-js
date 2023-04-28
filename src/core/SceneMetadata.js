
/**
 *
 * @author Patrik Harag
 * @version 2023-04-28
 */
export class SceneMetadata {

    static CURRENT_FORMAT_VERSION = 1;


    /** @type number */
    formatVersion;

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
