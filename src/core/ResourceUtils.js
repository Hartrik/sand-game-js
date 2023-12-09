import { Assets } from "../Assets";
import { Brush } from "./Brush";
import { ElementArea } from "./ElementArea";
import { ElementTail } from "./ElementTail";
import { Scene } from "./Scene";
import { SceneImplTemplate } from "./SceneImplTemplate";
import { DeterministicRandom } from "./DeterministicRandom";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-09
 */
export class ResourceUtils {

    /**
     *
     * @param objectUrl
     * @param maxWidth
     * @param maxHeight
     * @returns {Promise<ImageData>}
     */
    static loadImageData(objectUrl, maxWidth, maxHeight) {
        // TODO: security - it will also fetch an external image
        return Assets.asImageData(objectUrl, maxWidth, maxHeight);
    }

    /**
     *
     * @param data {ArrayBuffer} ArrayBuffer
     * @param type {string} type
     * @returns {string}
     */
    static asObjectUrl(data, type='image/png') {
        // https://gist.github.com/candycode/f18ae1767b2b0aba568e
        const arrayBufferView = new Uint8Array(data);
        const blob = new Blob([ arrayBufferView ], { type: type });
        const urlCreator = window.URL || window.webkitURL;
        return urlCreator.createObjectURL(blob);
    }

    /**
     *
     * @param imageData {ImageData}
     * @param brush {Brush}
     * @param defaultElement {Element}
     * @param threshold {number} 0-255
     * @returns Scene
     */
    static createSceneFromImageTemplate(imageData, brush, defaultElement, threshold) {
        const width = imageData.width;
        const height = imageData.height;

        const elementArea = ElementArea.create(width, height, defaultElement);

        const random = new DeterministicRandom(0);

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

                const element = brush.apply(x, y, random);
                const elementHead = element.elementHead;
                const elementTail = ElementTail.setColor(element.elementTail, red, green, blue);
                elementArea.setElementHeadAndTail(x, y, elementHead, elementTail);
            }
        }

        return new SceneImplTemplate(elementArea);
    }

    static getImageTypeOrNull(filename) {
        filename = filename.toLowerCase();
        if (filename.endsWith('.png')) {
            return 'image/png'
        }
        if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            return 'image/jpg'
        }
        if (filename.endsWith('.bmp')) {
            return 'image/bmp'
        }
        if (filename.endsWith('.gif')) {
            return 'image/gif'
        }
        return null;
    }
}
