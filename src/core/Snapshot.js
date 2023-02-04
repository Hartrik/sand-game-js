
/**
 *
 * @author Patrik Harag
 * @version 2023-02-04
 */
export class Snapshot {

    static CURRENT_FORMAT_VERSION = 1;

    /** @type SnapshotMetadata */
    metadata;

    /** @type ArrayBuffer */
    data;
}
