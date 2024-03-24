// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Tool from "../core/tool/Tool";
import Tools from "../core/tool/Tools";
import ToolInfo from "../core/tool/ToolInfo";
import Brush from "../core/brush/Brush";
import BrushDefs from "../def/BrushDefs";
import ElementArea from "../core/ElementArea";
import SceneImplModFlip from "../core/scene/SceneImplModFlip";
import ResourceUtils from "./ResourceUtils";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-22
 */
export default class ResourceTool {

    static METADATA_JSON_NAME = 'tool.json';

    /**
     *
     * @param metadataJson {any}
     * @param zip {{[path: string]: Uint8Array}|null}
     * @returns {Promise<Tool>}
     */
    static async parse(metadataJson, zip) {
        const info = metadataJson.info;
        const action = metadataJson.action;

        if (info === undefined) {
            throw 'Tool definition: info not set';
        }
        const parsedInfo = new ToolInfo(info);

        if (action === undefined) {
            throw 'Tool definition: action not set';
        }

        return ResourceTool.#parseAction(parsedInfo, action, zip);
    }

    /**
     *
     * @param info {ToolInfo}
     * @param json
     * @param zip {{[path: string]: Uint8Array}|null}
     * @returns {Promise<Tool>}
     */
    static async #parseAction(info, json, zip) {
        const type = json.type;

        if (type === 'image-template') {
            const scenes = await this.parseImageTemplate(json, zip);
            return Tools.insertScenesTool(scenes, undefined, info);

        } else if (type === 'random-template') {
            const scenes = await this.parseRandomTemplate(json, zip);
            return Tools.insertScenesTool(scenes, undefined, info);

        } else {
            throw 'Tool action not supported: ' + type;
        }
    }

    static async parseRandomTemplate(json, zip) {
        const actions = json.actions;
        if (actions === undefined || actions.length === undefined || actions.length === 0) {
            throw 'Image template: actions not set';
        }

        let scenes = [];
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const type = action.type;
            if (type === 'image-template') {
                const items = await this.parseImageTemplate(action, zip);
                scenes.push(...items);
            } else {
                throw 'Tool action not supported: ' + type;
            }
        }
        return scenes;
    }

    static async parseImageTemplate(json, zip) {
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
        let brush = null;
        if (typeof brushPar === 'string') {
            brush = BrushDefs.byCodeName(brushPar);
        } else if (typeof brushPar === 'object' && brushPar instanceof Brush) {
            brush = brushPar;
        }
        if (brush === null) {
            throw 'Image template: brush not found: ' + brushPar;
        }

        const defaultElement = ElementArea.TRANSPARENT_ELEMENT;
        const scene = ResourceUtils.createSceneFromImageTemplate(imageData, brush, defaultElement, threshold);
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