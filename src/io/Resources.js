// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Snapshot from "../core/Snapshot";
import Scene from "../core/scene/Scene";
import SceneImplSnapshot from "../core/scene/SceneImplSnapshot";
import Tool from "../core/tool/Tool";
import { strFromU8, unzipSync } from 'fflate';
import ResourceSnapshot from "./ResourceSnapshot";
import ResourceTool from "./ResourceTool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-09
 */
export default class Resources {

    static JSON_RESOURCE_TYPE_FIELD = 'resourceType';

    /**
     *
     * @param snapshot {Snapshot}
     * @returns Uint8Array
     */
    static createResourceFromSnapshot(snapshot) {
        return ResourceSnapshot.createZip(snapshot);
    }

    /**
     *
     * @param content {ArrayBuffer}
     * @returns Promise<Scene|Tool>
     */
    static async parseZipResource(content) {
        const zip = unzipSync(new Uint8Array(content));

        function parseJson(fileName) {
            return JSON.parse(strFromU8(zip[fileName]));
        }

        if (zip[ResourceSnapshot.METADATA_JSON_NAME]) {
            // snapshot
            const metadataJson = parseJson(ResourceSnapshot.METADATA_JSON_NAME);
            const snapshot = ResourceSnapshot.parse(metadataJson, zip);
            return new SceneImplSnapshot(snapshot);
        }
        if (zip[ResourceSnapshot.LEGACY_METADATA_JSON_NAME]) {
            // legacy snapshot
            const metadataJson = parseJson(ResourceSnapshot.LEGACY_METADATA_JSON_NAME);
            const snapshot = ResourceSnapshot.parse(metadataJson, zip);
            return new SceneImplSnapshot(snapshot);
        }
        if (zip[ResourceTool.METADATA_JSON_NAME]) {
            // legacy snapshot
            const metadataJson = parseJson(ResourceTool.METADATA_JSON_NAME);
            return await ResourceTool.parse(metadataJson, zip);
        }
        throw 'Wrong format';
    }

    /**
     *
     * @param content {ArrayBuffer}
     * @returns Promise<Tool>
     */
    static async parseJsonResource(content) {
        const text = strFromU8(new Uint8Array(content));
        const metadataJson = JSON.parse(text);

        const type = metadataJson[Resources.JSON_RESOURCE_TYPE_FIELD];
        if (type === 'tool') {
            return await ResourceTool.parse(metadataJson, null);
        }
        throw 'Wrong json format';
    }

    /**
     *
     * @param json
     * @returns {Promise<Tool>}
     */
    static async parseToolDefinition(json) {
        return ResourceTool.parse(json, null);
    }
}
