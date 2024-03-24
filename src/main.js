// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import SizeUtils from "./gui/SizeUtils";
import Analytics from "./Analytics";
import DomBuilder from "./gui/DomBuilder";
import Controller from "./gui/Controller";
import Brushes from "./core/brush/Brushes";
import BrushDefs from "./def/BrushDefs";
import Tool from "./core/tool/Tool";
import Tools from "./core/tool/Tools";
import ToolDefs from "./def/ToolDefs";
import PredicateDefs from "./def/PredicateDefs";
import Scenes from "./core/scene/Scenes";
import SceneDefs from "./def/SceneDefs";
import ComponentViewTools from "./gui/component/ComponentViewTools";
import ComponentViewCanvas from "./gui/component/ComponentViewCanvas";
import ComponentButtonAdjustScale from "./gui/component/ComponentButtonAdjustScale";
import ComponentViewSceneSelection from "./gui/component/ComponentViewSceneSelection";
import ComponentViewTestTools from "./gui/component/ComponentViewTestTools";
import ComponentContainer from "./gui/component/ComponentContainer";
import ComponentSimple from "./gui/component/ComponentSimple";
import ComponentButton from "./gui/component/ComponentButton";
import ComponentButtonStartStop from "./gui/component/ComponentButtonStartStop";
import ComponentStatusIndicator from "./gui/component/ComponentStatusIndicator";
import ComponentButtonRestart from "./gui/component/ComponentButtonRestart";
import ActionIOImport from "./gui/action/ActionIOImport";
import ActionIOExport from "./gui/action/ActionIOExport";
import ServiceToolManager from "./gui/ServiceToolManager";
import ComponentButtonReport from "./gui/component/ComponentButtonReport";
import Resources from "./io/Resources";

// exported classes and constants (accessible as SandGameJS.XXX)

export { Brushes };
export { BrushDefs };
export { PredicateDefs };
export { Tools };
export { ToolDefs};
export { Scenes };
export { SceneDefs };
export { Resources };

export const brushes = BrushDefs._LIST;
export const tools = ToolDefs._LIST;

/**
 * Initialize Sand Game JS.
 *
 * @param root {HTMLElement}
 * @param config {{
 *     version: undefined|string,
 *     debug: undefined|boolean,
 *     canvas: undefined|{
 *         scale: undefined|number,
 *         maxWidthPx: undefined|number,
 *         maxHeightPx: undefined|number
 *     },
 *     autoStart: undefined|boolean,
 *     scene: undefined|string|{init:(function(SandGame, Controller):Promise<any>|any)},
 *     scenes: undefined|Scene[]|Object.<string,Scene>,
 *     tools: undefined|(string|Tool)[],
 *     primaryTool: undefined|string|Tool,
 *     secondaryTool: undefined|string|Tool,
 *     tertiaryTool: undefined|string|Tool,
 *     disableRestart: undefined|boolean,
 *     disableStartStop: undefined|boolean,
 *     disableImport: undefined|boolean,
 *     disableExport: undefined|boolean,
 *     disableSizeChange: undefined|boolean,
 *     disableSceneSelection: undefined|boolean,
 *     errorReporter: undefined|function(type:string,message:string,controller:Controller),
 * }}
 * @returns {Controller}
 *
 * @author Patrik Harag
 * @version 2024-03-24
 */
export function init(root, config) {
    if (config === undefined) {
        config = {};
    }

    let controller;

    const {width, height, scale} = SizeUtils.determineOptimalSizes(root, config.canvas);

    const init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        version: config.version
    };

    const enableDebug = config.debug === true;
    const enableAutoStart = config.autoStart === undefined || config.autoStart === true;
    const enableRestart = !(config.disableRestart === true);
    const enableStartStop = !(config.disableStartStop === true);
    const enableImport = !(config.disableImport === true);
    const enableExport = !(config.disableExport === true);
    const enableSizeChange = !(config.disableSizeChange === true);
    const enableSceneSelection = !(config.disableSceneSelection === true);
    const enableUserErrorReporting = config.errorReporter !== undefined;

    const errorReporter = config.errorReporter;

    // resolve scene list

    let scenes;
    let customScenes;
    if (Array.isArray(config.scenes)) {
        scenes = {};
        for (let i = 0; i < config.scenes.length; i++) {
            scenes['scene_' + i] = config.scenes[i];
        }
        customScenes = true;
    } else if (typeof config.scenes === "object") {
        scenes = config.scenes;
        customScenes = true;
    } else {
        // build-in scenes
        scenes = SceneDefs.SCENES;
        customScenes = false;
    }

    // resolve current scene

    let scene;
    let sceneName;
    if (typeof config.scene === 'string') {
        // from scene list
        sceneName = config.scene;
        scene = scenes[sceneName];
        if (scene === undefined) {
            throw 'Scene not found: ' + sceneName;
        }
    } else if (typeof config.scene === 'object') {
        // custom scene
        sceneName = 'n/a';
        const sceneFunc = (typeof config.scene.init === 'function')
            ? (sandGame) => config.scene.init(sandGame, controller)
            : () => {};
        scene = Scenes.custom('n/a', sceneFunc);
    } else {
        // default scene
        if (customScenes) {
            // select first
            sceneName = Object.keys(scenes)[0];
            scene = Object.values(scenes)[0];
        } else {
            if (enableDebug) {
                sceneName = 'landscape_1';  // always the same
            } else {
                sceneName = (Math.random() > 0.1) ? 'landscape_1' : 'landscape_2';
            }
            scene = scenes[sceneName];
        }
    }

    // resolve tools

    function resolveTool(t, defaultTool = null) {
        if (typeof t === 'string') {
            let tool = ToolDefs.byCodeName(t);
            if (tool !== null) {
                return tool;
            } else if (enableDebug) {
                throw 'Tool not found: ' + t;
            }
            return defaultTool;
        } else if (typeof t === 'object' && t instanceof Tool) {
            return t;
        } else {
            if (enableDebug) {
                throw 'Unexpected tool type';
            }
            return defaultTool;
        }
    }

    let tools;
    if (Array.isArray(config.tools)) {
        tools = [];
        for (let t of config.tools) {
            let tool = resolveTool(t, null);
            if (tool !== null) {
                tools.push(tool);
            }
        }
    } else {
        tools = ToolDefs.DEFAULT_TOOLS;
    }

    let primaryTool;
    if (config.primaryTool === undefined || (primaryTool = resolveTool(config.primaryTool)) === null) {
        primaryTool = ToolDefs.SAND;
    }

    let secondaryTool;
    if (config.secondaryTool === undefined || (secondaryTool = resolveTool(config.secondaryTool)) === null) {
        secondaryTool = ToolDefs.ERASE;
    }

    let tertiaryTool;
    if (config.tertiaryTool === undefined || (tertiaryTool = resolveTool(config.tertiaryTool)) === null) {
        tertiaryTool = ToolDefs.METEOR;
    }

    // init controller

    const dialogAnchorNode = DomBuilder.div({ class: 'sand-game-dialog-anchor sand-game-component' });
    document.body.prepend(dialogAnchorNode);
    const toolManager = new ServiceToolManager(primaryTool, secondaryTool, tertiaryTool);
    controller = new Controller(init, dialogAnchorNode, toolManager);

    // init error reporting

    if (errorReporter !== undefined) {
        controller.addOnFailure((type, message) => errorReporter(type, message, controller));
    }

    // init components

    const mainComponent = new ComponentContainer('sand-game-component', [
        new ComponentViewTools(tools, enableImport),
        new ComponentViewCanvas(),
        new ComponentContainer('sand-game-options', [
            new ComponentContainer('sand-game-options-left', [
                (enableImport) ? new ComponentButton('Import', ComponentButton.CLASS_LIGHT, new ActionIOImport()) : null,
                (enableExport) ? new ComponentButton('Export', ComponentButton.CLASS_LIGHT, new ActionIOExport()) : null,
                (enableRestart && !enableSceneSelection) ? new ComponentButtonRestart(ComponentButton.CLASS_LIGHT) : null,
                (enableStartStop) ? new ComponentButtonStartStop(ComponentButton.CLASS_LIGHT) : null,
                new ComponentStatusIndicator((enableSizeChange)
                        ? DomBuilder.element('span', null, [DomBuilder.element('br'), 'Tip: adjust scale if needed'])
                        : null),
            ]),
            new ComponentContainer('sand-game-options-right', [
                (enableUserErrorReporting) ? new ComponentButtonReport(ComponentButton.CLASS_LIGHT, errorReporter) : null,
            ]),
        ]),
        new ComponentContainer('sand-game-views', [
            (enableSizeChange || enableSceneSelection) ? new ComponentContainer(null, [
                (enableSizeChange) ? new ComponentButtonAdjustScale() : null,
                (enableSceneSelection) ? new ComponentSimple(DomBuilder.span('Scenes', { class: 'scenes-label' })) : null,
                (enableSceneSelection) ? new ComponentViewSceneSelection(controller, scenes, sceneName) : null,
            ]) : null,
            (enableDebug) ? new ComponentViewTestTools() : null,
        ])
    ]);

    // build HTML nodes and start

    const node = mainComponent.createNode(controller);
    root.innerHTML = '';
    root.append(node);

    controller.setup(scene);
    if (enableImport) {
        controller.getIOManager().initFileDragAndDrop(node);
    }
    controller.enableGlobalShortcuts();
    if (enableAutoStart) {
        controller.start();
    }

    Analytics.triggerFeatureUsed(Analytics.FEATURE_APP_INITIALIZED);

    return controller;
}