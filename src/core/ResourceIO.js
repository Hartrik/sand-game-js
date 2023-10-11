import { Assets } from "../Assets";
import { Brush } from "./Brush";
import { Brushes } from "./Brushes";
import { ElementArea } from "./ElementArea";
import { ElementHead } from "./ElementHead";
import { ElementTail } from "./ElementTail";
import { Snapshot } from "./Snapshot";
import { Scene } from "./Scene";
import { SceneMetadata } from "./SceneMetadata";
import { SceneImplSnapshot } from "./SceneImplSnapshot";
import { SceneImplTemplate } from "./SceneImplTemplate";
import { SceneImplModFlip } from "./SceneImplModFlip";
import { Tool } from "./Tool";
import { strToU8, strFromU8, zipSync, unzipSync } from 'fflate';

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class ResourceIO {

    static RESOURCE_TYPE_SCENE = 'scene';
    static RESOURCE_TYPE_TOOL = 'tool';

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
     * @param json
     * @returns {Promise<Tool>}
     */
    static async parseToolDefinition(json) {
        return NewIO.parseToolDefinition(json);
    }

    /**
     *
     * @param objectUrl {string}
     * @param brush {Brush}
     * @param defaultElement {Element}
     * @param threshold {number} 0-255
     * @param maxWidth {number|undefined}
     * @param maxHeight {number|undefined}
     * @returns Promise<Scene>
     */
    static async fromImage(objectUrl, brush, defaultElement, threshold, maxWidth, maxHeight) {
        const imageData = await Assets.asImageData(objectUrl, maxWidth, maxHeight);

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

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
class NewIO {

    /**
     *
     * @param json
     * @returns {Promise<Tool>}
     */
    static async parseToolDefinition(json) {
        const type = json.type;
        const name = json.name;
        const category = json.category;
        const action = json.action;

        if (type === undefined) {
            throw 'Tool definition: type not set';
        }
        if (name === undefined) {
            throw 'Tool definition: name not set';
        }
        if (category === undefined) {
            throw 'Tool definition: category not set';
        }
        if (action === undefined) {
            throw 'Tool definition: action not set';
        }

        if (type === 'template') {
            const scenes = await NewIO.parseSceneDefinition(action);
            return Tool.insertElementAreaTool(category, null, name, scenes, undefined);

        } else {
            throw 'Tool type not supported: ' + type;
        }
    }

    /**
     *
     * @param json
     * @returns {Promise<Scene[]>}
     */
    static async parseSceneDefinition(json) {
        const type = json.type;

        if (type === 'image-template') {
            const imageData = json.imageData;
            if (imageData === undefined) {
                throw 'Image template: imageData not set';
            }

            const threshold = json.threshold;
            if (threshold === undefined) {
                throw 'Image template: threshold not set';
            }
            const parsedThreshold = parseInt(threshold);

            const brush = json.brush;
            if (brush === undefined) {
                throw 'Image template: brush not set';
            }
            const parsedBrush = Brushes.byCodeName(json.brush);
            if (parsedBrush === null) {
                throw 'Image template: brush not found: ' + brush;
            }

            const scene = await ResourceIO.fromImage(imageData, parsedBrush, ElementArea.TRANSPARENT_ELEMENT,
                    parsedThreshold, undefined, undefined);
            const scenes = [ scene ];

            const randomFlipHorizontally = json.randomFlipHorizontally;
            if (randomFlipHorizontally) {
                scenes.push(new SceneImplModFlip(scene, true, false));
            }

            const randomFlipVertically = json.randomFlipVertically;
            if (randomFlipVertically) {
                for (const s of [...scenes]) {
                    scenes.push(new SceneImplModFlip(s, false, true));
                }
            }

            return scenes;

        } else if (type === 'random') {
            const actions = json.actions;
            if (actions === undefined || actions.length === undefined || actions.length === 0) {
                throw 'Image template: actions not set';
            }

            let scenes = [];
            for (let i = 0; i < actions.length; i++) {
                let parsedScenes = await NewIO.parseSceneDefinition(actions[i]);
                for (let s of parsedScenes) {
                    scenes.push(s);
                }
            }
            return scenes;

        } else {
            throw 'Scene type not supported: ' + type;
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-10-11
 */
class LegacySnapshotIO {
    /**
     *
     * @param snapshot {Snapshot}
     * @returns Uint8Array
     */
    static createSave(snapshot) {
        const metadata = strToU8(JSON.stringify(snapshot.metadata, null, 2));

        let zipData = {
            'metadata.json': metadata,
            'data-heads.bin': new Uint8Array(snapshot.dataHeads),
            'data-tails.bin': new Uint8Array(snapshot.dataTails)
        };
        return zipSync(zipData, { level: 9 });
    }

    /**
     *
     * @param zip {{[path: string]: Uint8Array}}
     * @returns Snapshot
     */
    static parseSave(zip) {
        let snapshot = new Snapshot();

        let metadataRaw = zip['metadata.json'];
        if (!metadataRaw) {
            throw 'metadata.json not found';
        }
        snapshot.metadata = Object.assign(new SceneMetadata(), JSON.parse(strFromU8(metadataRaw)));
        if (typeof snapshot.metadata.width !== "number") {
            throw 'Metadata property wrong format: width';
        }
        if (typeof snapshot.metadata.height !== "number") {
            throw 'Metadata property wrong format: height';
        }

        // load element data
        if (snapshot.metadata.formatVersion < 3) {
            // ensure backward compatibility
            // legacy interleaving buffer (element head 1, element tail 1, element head 2, element tail 2, ...)
            const dataRaw = zip['data.bin'];
            if (dataRaw) {
                if (dataRaw.byteLength % 8 !== 0) {
                    throw 'Buffer length is not divisible by 8';
                }
                const elements = dataRaw.byteLength / 8;
                const dataHeads = new Uint8Array(new ArrayBuffer(elements * 4));
                const dataTails = new Uint8Array(new ArrayBuffer(elements * 4));
                for (let i = 0; i < elements; i++) {
                    for (let j = 0; j < 4; j++) {  // 4 bytes
                        dataHeads[(i * 4) + j] = dataRaw[(i * 8) + j];
                        dataTails[(i * 4) + j] = dataRaw[(i * 8) + j + 4];
                    }
                }
                snapshot.dataHeads = dataHeads.buffer;
                snapshot.dataTails = dataTails.buffer;
            } else {
                throw 'data.bin not found';
            }
        } else {
            // one buffer for element heads and one for element tails
            const dataRawHeads = zip['data-heads.bin'];
            if (dataRawHeads) {
                snapshot.dataHeads = dataRawHeads.buffer;
            } else {
                throw 'data-heads.bin not found';
            }
            const dataRawTails = zip['data-tails.bin'];
            if (!dataRawTails) {
                throw 'data-tails.bin not found';
            }
            snapshot.dataTails = dataRawTails.buffer;
        }

        // ensure backward compatibility
        if (snapshot.metadata.formatVersion === 1) {
            // after 23w32a first byte of element head was changed (powder elements reworked)
            LegacySnapshotIO.#convertToV2(snapshot);
            snapshot.metadata.formatVersion = 2;
        }
        if (snapshot.metadata.formatVersion === 2) {
            // interleaving buffer >> element head buffer & element tail buffer
            snapshot.metadata.formatVersion = 3;
        }

        return snapshot;
    }

    static #convertToV2(snapshot) {
        const elementArea = ElementArea.from(
                snapshot.metadata.width, snapshot.metadata.height,
                snapshot.dataHeads, snapshot.dataTails);

        for (let y = 0; y < snapshot.metadata.height; y++) {
            for (let x = 0; x < snapshot.metadata.width; x++) {

                // TODO: dry flag ignored
                let elementHead = elementArea.getElementHead(x, y);
                let oldType = elementHead & 0b111;  // type without dry flag
                let oldWeight = (elementHead >> 4) & 0x0000000F;

                if (oldType === 0x0 && oldWeight === 0x0) {
                    // air
                } else if (oldType === 0x0) {
                    // static
                    elementArea.setElementHead(x, y, ElementHead.setType(elementHead, 0x7));
                } else if (oldType === 0x1) {
                    // falling (grass only)
                    elementArea.setElementHead(x, y, ElementHead.setType(elementHead, 0x5));
                } else if (oldType === 0x2) {
                    // sand 1 (soil, gravel)
                    elementArea.setElementHead(x, y, ElementHead.setType(elementHead, 0x5 | (4 << 5)));
                } else if (oldType === 0x3) {
                    // sand 2 (sand)
                    elementArea.setElementHead(x, y, ElementHead.setType(elementHead, 0x5 | (6 << 5)));
                } else if (oldType === 0x4 || oldType === 0x5) {
                    // fluid 1 (not used) or fluid 2 (water)
                    elementArea.setElementHead(x, y, ElementHead.setType(elementHead, 0x3));
                }
            }
        }

        snapshot.dataHeads = elementArea.getDataHeads();
        snapshot.dataTails = elementArea.getDataTails();
    }
}