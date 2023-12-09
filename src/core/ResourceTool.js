import { Tool } from "./Tool";
import { Brushes } from "../def/Brushes";
import { ElementArea } from "./ElementArea";
import { SceneImplModFlip } from "./SceneImplModFlip";
import { ResourceUtils } from "./ResourceUtils";

/**
 *
 * @author Patrik Harag
 * @version 2023-07-23
 */
export class ResourceTool {

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
            const scenes = await ResourceTool.#parseTemplateAction(action);
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
    static async #parseTemplateAction(json) {
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

            const scene = await ResourceUtils.createSceneFromImageTemplate(imageData, parsedBrush,
                    ElementArea.TRANSPARENT_ELEMENT, parsedThreshold, undefined, undefined);
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
                let parsedScenes = await ResourceTool.#parseTemplateAction(actions[i]);
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