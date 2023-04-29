import {Snapshot} from "./Snapshot";
import {SceneMetadata} from "./SceneMetadata.js";
import {SceneImplSnapshot} from "./SceneImplSnapshot.js";
import {strToU8, strFromU8, zipSync, unzipSync} from 'fflate';

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
 */
export class ResourceIO {

    static RESOURCE_TYPE_SCENE = 'scene';
    static RESOURCE_TYPE_TEMPLATE = 'template';
    static RESOURCE_TYPE_SCENE_OR_TEMPLATE = 'scene/template';

    /**
     *
     * @param snapshot {Snapshot}
     * @returns Uint8Array
     */
    static createResourceFromSnapshot(snapshot) {
        // TODO
        return LegacySnapshotIO.createSave(snapshot);
    }

    // TODO: other types of resources
    /**
     *
     * @param content {ArrayBuffer}
     * @returns Scene
     */
    static parseResource(content) {
        const zip = unzipSync(new Uint8Array(content));

        if (zip['metadata.json']) {
            // old snapshot format
            let snapshot = LegacySnapshotIO.parseSave(zip);
            return new SceneImplSnapshot(snapshot);
        }
        throw 'Wrong format';
    }
}

class LegacySnapshotIO {
    /**
     *
     * @param snapshot {Snapshot}
     * @returns Uint8Array
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
     * @param zip
     * @returns Snapshot
     */
    static parseSave(zip) {
        let snapshot = new Snapshot();

        let metadataRaw = zip['metadata.json'];
        if (!metadataRaw) {
            throw 'metadata.json not found';
        }
        snapshot.metadata = Object.assign(new SceneMetadata(), JSON.parse(strFromU8(metadataRaw)));

        let dataRaw = zip['data.bin'];
        if (!dataRaw) {
            throw 'data.bin not found';
        }
        snapshot.data = dataRaw.buffer;

        return snapshot;
    }
}