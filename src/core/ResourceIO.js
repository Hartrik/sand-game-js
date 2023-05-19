import {Assets} from "../Assets.js";
import {Brush} from "./Brush.js";
import {ElementArea} from "./ElementArea.js";
import {ElementTail} from "./ElementTail.js";
import {Snapshot} from "./Snapshot";
import {SceneMetadata} from "./SceneMetadata.js";
import {SceneImplSnapshot} from "./SceneImplSnapshot.js";
import {SceneImplTemplate} from "./SceneImplTemplate.js";
import {strToU8, strFromU8, zipSync, unzipSync} from 'fflate';

/**
 *
 * @author Patrik Harag
 * @version 2023-05-19
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
     * @returns Promise<Scene>
     */
    static async parseResource(content) {
        const zip = unzipSync(new Uint8Array(content));

        if (zip['metadata.json']) {
            // old snapshot format
            let snapshot = LegacySnapshotIO.parseSave(zip);
            return new SceneImplSnapshot(snapshot);
        }
        throw 'Wrong format';
    }

    /**
     *
     * @param content {ArrayBuffer}
     * @param imageType {string}
     * @param brush {Brush}
     * @param defaultElement {Element}
     * @param threshold {number} 0-255
     * @param maxWidth {number|undefined}
     * @param maxHeight {number|undefined}
     * @returns Promise<Scene>
     */
    static async fromImage(content, imageType, brush, defaultElement, threshold, maxWidth, maxHeight) {
        const imageData = await Assets.asImageData(Assets.asObjectUrl(content, imageType), maxWidth, maxHeight);

        const width = imageData.width;
        const height = imageData.height;

        const elementArea = ElementArea.create(width, height, defaultElement);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;

                let red = imageData.data[index];
                let green = imageData.data[index + 1];
                let blue = imageData.data[index + 2];
                const alpha = imageData.data[index + 3];

                // perform alpha blending if needed
                if (alpha !== 0xFF) {
                    red = Math.trunc((red * alpha) / 0xFF) + 0xFF - alpha;
                    green = Math.trunc((green * alpha) / 0xFF) + 0xFF - alpha;
                    blue = Math.trunc((blue * alpha) / 0xFF) + 0xFF - alpha;
                }

                // filter out background
                if (red > 0xFF-threshold && green > 0xFF-threshold && blue > 0xFF-threshold) {
                    continue;  // white
                }

                const element = brush.apply(x, y, undefined, undefined);
                const elementHead = element.elementHead;
                const elementTail = ElementTail.setColor(element.elementTail, red, green, blue);
                elementArea.setElementHeadAndTail(x, y, elementHead, elementTail);
            }
        }

        return new SceneImplTemplate(elementArea);
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