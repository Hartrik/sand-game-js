
import { SizeUtils } from "./gui/SizeUtils";
import { Analytics } from "./Analytics";
import { DomBuilder } from "./gui/DomBuilder";
import { Controller } from "./gui/Controller";
import { BrushDefs } from "./def/BrushDefs";
import { SceneDefs } from "./def/SceneDefs";
import { Tool } from "./core/tool/Tool";
import { ToolDefs} from "./def/ToolDefs";
import { ComponentViewTools } from "./gui/component/ComponentViewTools";
import { ComponentViewCanvas } from "./gui/component/ComponentViewCanvas";
import { ComponentButtonAdjustScale } from "./gui/component/ComponentButtonAdjustScale";
import { ComponentViewSceneSelection } from "./gui/component/ComponentViewSceneSelection";
import { ComponentViewTestTools } from "./gui/component/ComponentViewTestTools";
import { ComponentContainer } from "./gui/component/ComponentContainer";
import { ComponentSimple } from "./gui/component/ComponentSimple";
import { ComponentButton } from "./gui/component/ComponentButton";
import { ComponentButtonStartStop } from "./gui/component/ComponentButtonStartStop";
import { ComponentStatusIndicator } from "./gui/component/ComponentStatusIndicator";
import { ActionIOImport } from "./gui/action/ActionIOImport";
import { ActionIOExport } from "./gui/action/ActionIOExport";
import { SceneImplHardcoded } from "./core/scene/SceneImplHardcoded";
import { ServiceToolManager } from "./gui/ServiceToolManager";

export { Tools } from "./core/tool/Tools";
export { Brushes } from "./core/brush/Brushes";

export { ToolDefs} from "./def/ToolDefs";
export { BrushDefs } from "./def/BrushDefs";
export { PredicateDefs } from "./def/PredicateDefs";

export const brushes = BrushDefs._LIST;
export const tools = ToolDefs._LIST;

/**
 * Initialize Sand Game JS.
 *
 * @param root {HTMLElement}
 * @param config {{
 *     version: undefined|string,
 *     debug: undefined|boolean,
 *     autoStart: undefined|boolean,
 *     scene: undefined|string|{sceneDefinition:(function(SandGame):Promise<any>|any)},
 *     tools: undefined|(string|Tool)[],
 *     primaryTool: undefined|string|Tool,
 *     secondaryTool: undefined|string|Tool,
 *     tertiaryTool: undefined|string|Tool,
 *     disableStartStop: undefined|boolean,
 *     disableImport: undefined|boolean,
 *     disableExport: undefined|boolean,
 *     disableSizeChange: undefined|boolean,
 *     disableSceneSelection: undefined|boolean,
 * }}
 * @returns {Controller}
 *
 * @author Patrik Harag
 * @version 2024-01-10
 */
export function init(root, config) {
    if (config === undefined) {
        config = {};
    }

    const {width, height, scale} = SizeUtils.determineOptimalSizes(root);

    const init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        version: config.version
    };

    const enableDebug = config.debug === true;
    const enableAutoStart = config.autoStart === undefined || config.autoStart === true;
    const enableStartStop = !(config.disableStartStop === true);
    const enableImport = !(config.disableImport === true);
    const enableExport = !(config.disableExport === true);
    const enableSizeChange = !(config.disableSizeChange === true);
    const enableSceneSelection = !(config.disableSceneSelection === true);

    // resolve scene

    let scene;
    let sceneName;
    if (typeof config.scene === 'string') {
        // build-in scene
        sceneName = config.scene;
        scene = SceneDefs.SCENES[sceneName];
    } else if (typeof config.scene === 'object') {
        // custom scene
        sceneName = 'n/a';
        scene = new SceneImplHardcoded({
            name: 'n/a',
            description: 'n/a',
            apply: (typeof config.scene.init === 'function') ? config.scene.init : () => {}
        });
    } else {
        // default scene
        if (enableDebug) {
            sceneName = 'landscape_1';  // always the same
        } else {
            sceneName = (Math.random() > 0.1) ? 'landscape_1' : 'landscape_2';
        }
        scene = SceneDefs.SCENES[sceneName];
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
    let enableDefaultTemplates;
    if (Array.isArray(config.tools)) {
        enableDefaultTemplates = false;
        tools = [];
        for (let t of config.tools) {
            let tool = resolveTool(t, null);
            if (tool !== null) {
                tools.push(tool);
            }
        }
    } else {
        enableDefaultTemplates = true;
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
    const controller = new Controller(init, dialogAnchorNode, toolManager);

    // init components

    const mainComponent = new ComponentContainer('sand-game-component', [
        new ComponentViewTools(tools, enableDefaultTemplates),
        new ComponentViewCanvas(),
        new ComponentContainer('sand-game-options', [
            (enableImport) ? new ComponentButton('Import', ComponentButton.CLASS_LIGHT, new ActionIOImport()) : null,
            (enableExport) ? new ComponentButton('Export', ComponentButton.CLASS_LIGHT, new ActionIOExport()) : null,
            (enableStartStop) ? new ComponentButtonStartStop(ComponentButton.CLASS_LIGHT) : null,
            new ComponentStatusIndicator((enableSizeChange)
                    ? DomBuilder.element('span', null, [DomBuilder.element('br'), 'Tip: adjust scale if needed'])
                    : null),
        ]),
        new ComponentContainer('sand-game-views', [
            (enableSizeChange || enableSceneSelection) ? new ComponentContainer(null, [
                (enableSizeChange) ? new ComponentButtonAdjustScale() : null,
                (enableSceneSelection) ? new ComponentSimple(DomBuilder.span('Scenes', { class: 'scenes-label' })) : null,
                (enableSceneSelection) ? new ComponentViewSceneSelection(controller, SceneDefs.SCENES, sceneName) : null,
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