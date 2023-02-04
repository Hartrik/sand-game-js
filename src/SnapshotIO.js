import {Snapshot} from "./core/Snapshot";
import {SnapshotMetadata} from "./core/SnapshotMetadata.js";
import {strToU8, strFromU8, zipSync, unzipSync} from 'fflate';

/**
 *
 * @author Patrik Harag
 * @version 2023-02-04
 */
export class SnapshotIO {

    static DEFAULT_FILENAME = 'sand-game-js.zip';

    /**
     *
     * @param snapshot {Snapshot}
     * @returns {Uint8Array}
     */
    static createSave(snapshot) {
        const metadata = strToU8(JSON.stringify(snapshot.metadata, null, 2));
        let data = new Uint8Array(snapshot.data);

        let zipData = {
            'metadata.json': metadata,
            'data.bin': data
        };
        return zipSync(zipData, { level: 9 });
    }

    /**
     *
     * @param content {ArrayBuffer}
     */
    static parseSave(content) {
        const zip = unzipSync(new Uint8Array(content));

        let snapshot = new Snapshot();

        let metadataRaw = zip['metadata.json'];
        if (!metadataRaw) {
            throw 'metadata.json not found';
        }
        snapshot.metadata = Object.assign(new SnapshotMetadata(), JSON.parse(strFromU8(metadataRaw)));

        let dataRaw = zip['data.bin'];
        if (!dataRaw) {
            throw 'data.bin not found';
        }
        snapshot.data = dataRaw.buffer;

        return snapshot;
    }
}