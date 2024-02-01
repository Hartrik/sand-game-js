import { strToU8, zipSync } from "fflate";
import { Snapshot } from "../core/Snapshot";
import { SnapshotMetadata } from "../core/SnapshotMetadata";
import { ElementArea } from "../core/ElementArea";
import { ElementHead } from "../core/ElementHead";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-01
 */
export class ResourceSnapshot {

    static METADATA_JSON_NAME = 'snapshot.json';
    static LEGACY_METADATA_JSON_NAME = 'metadata.json';

    /**
     *
     * @param snapshot {Snapshot}
     * @returns Uint8Array
     */
    static createZip(snapshot) {
        const metadata = strToU8(JSON.stringify(snapshot.metadata, null, 2));

        let zipData = {
            'snapshot.json': metadata,
            'data-heads.bin': new Uint8Array(snapshot.dataHeads),
            'data-tails.bin': new Uint8Array(snapshot.dataTails)
        };
        return zipSync(zipData, {level: 9});
    }

    /**
     *
     * @param metadataJson {any}
     * @param zip {{[path: string]: Uint8Array}}
     * @returns Snapshot
     */
    static parse(metadataJson, zip) {
        let snapshot = new Snapshot();
        snapshot.metadata = Object.assign(new SnapshotMetadata(), metadataJson);

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
            // temperature conducting, element type class changes
            ResourceSnapshot.#convertToV4(snapshot);
            snapshot.metadata.formatVersion = 4;
        }
        if (snapshot.metadata.formatVersion === 4) {
            // new trees
            ResourceSnapshot.#convertToV5(snapshot);
            snapshot.metadata.formatVersion = 5;
        }
        if (snapshot.metadata.formatVersion === 5) {
            // conductivity, flammability... >> heat mod index
            ResourceSnapshot.#convertToV6(snapshot);
            snapshot.metadata.formatVersion = 6;
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
        const elementArea = ElementArea.from(
            snapshot.metadata.width, snapshot.metadata.height,
            snapshot.dataHeads, snapshot.dataTails);

        for (let y = 0; y < snapshot.metadata.height; y++) {
            for (let x = 0; x < snapshot.metadata.width; x++) {
                let elementHead = elementArea.getElementHead(x, y);
                let elementTail = elementArea.getElementTail(x, y);

                let typeClass = elementHead & 0b111;

                // element type class changes
                if (typeClass > 0x1 && typeClass < 0x7) {
                    typeClass++;
                    elementHead = (elementHead & 0xFFFFFFF8) | typeClass;
                }

                // set at least some conductivity type and heat effect type
                switch (typeClass) {
                    case 0x5: // powder element
                    case 0x6: // powder element wet
                    case 0x7: // static
                        elementHead = elementHead | 0x00400000;
                        elementTail = elementTail | 0x10000000;
                        break;
                }

                // set water behaviour
                if (typeClass === 0x4) {
                    elementHead = (elementHead & 0xFFFFF0FF) | (0xC << 8)
                }

                elementArea.setElementHead(x, y, elementHead);
                elementArea.setElementTail(x, y, elementTail);
            }
        }

        snapshot.dataHeads = elementArea.getDataHeads();
        snapshot.dataTails = elementArea.getDataTails();
    }

    static #convertToV5(snapshot) {
        const elementArea = ElementArea.from(
            snapshot.metadata.width, snapshot.metadata.height,
            snapshot.dataHeads, snapshot.dataTails);

        for (let y = 0; y < snapshot.metadata.height; y++) {
            for (let x = 0; x < snapshot.metadata.width; x++) {
                let elementHead = elementArea.getElementHead(x, y);

                // unset tree and leaf behaviour
                let behaviour = (elementHead >> 8) & 0x0000000F;
                if (behaviour === 0x5 || behaviour === 0x8) {
                    elementHead = (elementHead & 0xFFFF00FF);
                }

                elementArea.setElementHead(x, y, elementHead);
            }
        }

        snapshot.dataHeads = elementArea.getDataHeads();
        snapshot.dataTails = elementArea.getDataTails();
    }

    static #convertToV6(snapshot) {
        const elementArea = ElementArea.from(
            snapshot.metadata.width, snapshot.metadata.height,
            snapshot.dataHeads, snapshot.dataTails);

        for (let y = 0; y < snapshot.metadata.height; y++) {
            for (let x = 0; x < snapshot.metadata.width; x++) {
                const elementHead = elementArea.getElementHead(x, y);

                // map old 4 constants to heat mod index

                const flammableType = (elementHead >> 16) & 0x00000003;
                const flameHeatType = (elementHead >> 18) & 0x00000003;
                const burnableType = (elementHead >> 20) & 0x00000003;
                const conductivityType = (elementHead >> 22) & 0x00000003;

                // [0.2, 0.25, 0.3, 0.45][conductivityType];  // small .. big    conductiveIndex
                // [2500, 500, 20, 10][conductivityType];  // big .. small       heatLossChanceTo10000
                // [0, 100, 4500, 10000][flammableType];  // never .. quickly    flammableChanceTo10000
                // [0, 2, 3, 5][flammableType];  // never .. quickly             selfIgnitionChanceTo10000
                // [0, 165, 220, 255][flameHeatType];  // none .. very hot       flameHeat
                // [0, 2, 100, 1000][burnableType];  // none .. fast             burnDownChanceTo10000

                // all used combinations
                let heatModIndex = 0;  // default
                if (flammableType === 0 && flameHeatType === 0 && burnableType === 0 && conductivityType === 0) {
                    heatModIndex = 0;
                } else if (flammableType === 0 && flameHeatType === 0 && burnableType === 0 && conductivityType === 1) {
                    heatModIndex = 1;
                } else if (flammableType === 0 && flameHeatType === 0 && burnableType === 0 && conductivityType === 2) {
                    heatModIndex = 2;
                } else if (flammableType === 0 && flameHeatType === 0 && burnableType === 0 && conductivityType === 3) {
                    heatModIndex = 3;
                } else if (flammableType === 2 && flameHeatType === 1 && burnableType === 3 && conductivityType === 0) {
                    heatModIndex = 4;
                } else if (flammableType === 1 && flameHeatType === 1 && burnableType === 1 && conductivityType === 0) {
                    heatModIndex = 5;
                } else if (flammableType === 2 && flameHeatType === 1 && burnableType === 2 && conductivityType === 0) {
                    heatModIndex = 6;
                }

                const newElementHead = (elementHead & 0xFF00FFFF) | (heatModIndex << 16);
                elementArea.setElementHead(x, y, newElementHead);
            }
        }

        snapshot.dataHeads = elementArea.getDataHeads();
        snapshot.dataTails = elementArea.getDataTails();
    }
}