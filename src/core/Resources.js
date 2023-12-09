import { Snapshot } from "./Snapshot";
import { Scene } from "./Scene";
import { SceneImplSnapshot } from "./SceneImplSnapshot";
import { Tool } from "./Tool";
import { unzipSync } from 'fflate';
import { ResourceSnapshot } from "./ResourceSnapshot";
import { ResourceTool } from "./ResourceTool";

// TODO: unify Snapshot resource with Tool resource etc.

/**
 *
 * @author Patrik Harag
 * @version 2023-12-09
 */
export class Resources {

    /**
     *
     * @param snapshot {Snapshot}
     * @returns Uint8Array
     */
    static createResourceFromSnapshot(snapshot) {
        // TODO
        return ResourceSnapshot.createZip(snapshot);
    }

    // TODO: other types of resources
    /**
     *
     * @param content {ArrayBuffer}
     * @returns Promise<Scene>
     */
    static async parseZipResource(content) {
        const zip = unzipSync(new Uint8Array(content));

        if (zip['metadata.json']) {
            // old snapshot format
            let snapshot = ResourceSnapshot.parseZip(zip);
            return new SceneImplSnapshot(snapshot);
        }
        throw 'Wrong format';
    }

    /**
     *
     * @param json
     * @returns {Promise<Tool>}
     */
    static async parseToolDefinition(json) {
        return ResourceTool.parseToolDefinition(json);
    }
}
