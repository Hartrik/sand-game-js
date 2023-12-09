import { strFromU8, strToU8, zipSync } from "fflate";
import { Snapshot } from "./Snapshot";
import { SceneMetadata } from "./SceneMetadata";
import { ElementArea } from "./ElementArea";
import { ElementHead } from "./ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-09
 */
export class ResourceSnapshot {

    /**
     *
     * @param snapshot {Snapshot}
     * @returns Uint8Array
     */
    static createZip(snapshot) {
        const metadata = strToU8(JSON.stringify(snapshot.metadata, null, 2));

        let zipData = {
            'metadata.json': metadata,
            'data-heads.bin': new Uint8Array(snapshot.dataHeads),
            'data-tails.bin': new Uint8Array(snapshot.dataTails)
        };
        return zipSync(zipData, {level: 9});
    }

    /**
     *
     * @param zip {{[path: string]: Uint8Array}}
     * @returns Snapshot
     */
    static parseZip(zip) {
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
            ResourceSnapshot.#convertToV2(snapshot);
            snapshot.metadata.formatVersion = 2;
        }
        if (snapshot.metadata.formatVersion === 2) {
            // interleaving buffer >> element head buffer & element tail buffer
            snapshot.metadata.formatVersion = 3;
        }
        if (snapshot.metadata.formatVersion === 3) {
            // temperature conducting
            ResourceSnapshot.#convertToV4(snapshot);
            snapshot.metadata.formatVersion = 4;
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

    static #convertToV4(snapshot) {
        // set at least some conductivity type and heat effect type

        const elementArea = ElementArea.from(
            snapshot.metadata.width, snapshot.metadata.height,
            snapshot.dataHeads, snapshot.dataTails);

        for (let y = 0; y < snapshot.metadata.height; y++) {
            for (let x = 0; x < snapshot.metadata.width; x++) {
                const elementHead = elementArea.getElementHead(x, y);
                const typeClass = elementHead & 0b111;
                switch (typeClass) {
                    case 0x04: // powder element
                    case 0x05: // powder element wet
                    case 0x07: // static
                        const elementTail = elementArea.getElementTail(x, y);
                        elementArea.setElementHead(x, y, elementHead | 0x00400000);
                        elementArea.setElementTail(x, y, elementTail | 0x10000000);
                        break;
                }
            }
        }

        snapshot.dataHeads = elementArea.getDataHeads();
        snapshot.dataTails = elementArea.getDataTails();
    }
}