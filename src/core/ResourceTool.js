import { Tool } from "./Tool";
import { BrushDefs } from "../def/BrushDefs";
import { ElementArea } from "./ElementArea";
import { SceneImplModFlip } from "./SceneImplModFlip";
import { ResourceUtils } from "./ResourceUtils";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-09
 */
export class ResourceTool {

    static METADATA_JSON_NAME = 'tool.json';

    /**
     *
     * @param metadataJson {any}
     * @param zip {{[path: string]: Uint8Array}|null}
     * @returns {Promise<Tool>}
     */
    static async parse(metadataJson, zip) {
        const type = metadataJson.type;
        const name = metadataJson.name;
        const category = metadataJson.category;
        const action = metadataJson.action;

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
            const scenes = await ResourceTool.#parseTemplateAction(action, zip);
            return Tool.insertElementAreaTool(category, null, name, scenes, undefined);

        } else {
            throw 'Tool type not supported: ' + type;
        }
    }

    /**
     *
     * @param json
     * @param zip {{[path: string]: Uint8Array}|null}
     * @returns {Promise<Scene[]>}
     */
    static async #parseTemplateAction(json, zip) {
        const type = json.type;

        if (type === 'image-template') {
            let imageData = await this.#parseImageData(json, zip);

            const thresholdPar = json.threshold;
            if (thresholdPar === undefined) {
                throw 'Image template: threshold not set';
            }
            const threshold = parseInt(thresholdPar);

            const brushPar = json.brush;
            if (brushPar === undefined) {
                throw 'Image template: brush not set';
            }
            const brush = BrushDefs.byCodeName(json.brush);
            if (brush === null) {
                throw 'Image template: brush not found: ' + brushPar;
            }

            const scene = ResourceUtils.createSceneFromImageTemplate(imageData, brush,
                    ElementArea.TRANSPARENT_ELEMENT, threshold);
            const scenes = [scene];

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
                let parsedScenes = await ResourceTool.#parseTemplateAction(actions[i], zip);
                for (let s of parsedScenes) {
                    scenes.push(s);
                }
            }
            return scenes;

        } else {
            throw 'Scene type not supported: ' + type;
        }
    }

    static async #parseImageData(json, zip) {
        const imageDataPar = json.imageData;
        if (imageDataPar !== undefined) {
            return await ResourceUtils.loadImageData(imageDataPar, undefined, undefined);
        }

        const imageFilePar = json.imageFile;
        if (imageFilePar !== undefined && zip !== null && zip[imageFilePar]) {
            const imageType = ResourceUtils.getImageTypeOrNull(imageFilePar);
            if (imageType !== null) {
                const objectUrl = ResourceUtils.asObjectUrl(zip[imageFilePar].buffer);
                return ResourceUtils.loadImageData(objectUrl, undefined, undefined);
            }
        }
        throw 'Image template: imageData/imageFile not set';
    }
}