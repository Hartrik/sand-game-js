// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DomBuilder from "../DomBuilder";
import Action from "../action/Action";
import Component from "./Component";
import ComponentButton from "./ComponentButton";
import RendererInitializerNull from "../../core/rendering/RendererInitializerNull";
import RenderingModeElementType from "../../core/rendering/RenderingModeElementType";
import RenderingModeHeatmap from "../../core/rendering/RenderingModeHeatmap";
import ActionRecord from "../action/ActionRecord";
import ActionScreenshot from "../action/ActionScreenshot";
import ActionBenchmark from "../action/ActionBenchmark";
import ActionFill from "../action/ActionFill";
import ToolDevDefs from "../../def/ToolDevDefs";
import ActionsDev from "../action/ActionsDev";

// Warning: dev tools only

const RendererInitializerDefs = window.SandGameJS.RendererInitializerDefs;
const BrushDefs = window.SandGameJS.BrushDefs;

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class ComponentViewDevTools extends Component {

    createNode(controller) {
        const BTN_SCENE = ComponentButton.CLASS_OUTLINE_SECONDARY;
        const BTN_RENDERING = ComponentButton.CLASS_OUTLINE_INFO;
        const BTN_TOOL = ComponentButton.CLASS_OUTLINE_PRIMARY;
        const BTN_BRUSH = ComponentButton.CLASS_OUTLINE_SUCCESS;

        let components = [
            new ComponentButton("All materials", BTN_SCENE, ActionsDev.ALL_MATERIALS),
            new ComponentButton("Tree spawn", BTN_SCENE, ActionsDev.TREE_SPAWN_TEST),
            new ComponentButton("Tree grow", BTN_SCENE, ActionsDev.treeGrowTest(0)),
            new ComponentButton("Tree grown", BTN_SCENE, ActionsDev.treeGrowTest(-1)),
            new ComponentButton("Fill", BTN_SCENE, new ActionFill()),

            new ComponentButton("Benchmark", BTN_TOOL, new ActionBenchmark()),
            new ComponentButton("Record (start/stop)", BTN_TOOL, new ActionRecord()),
            new ComponentButton("Screenshot", BTN_TOOL, new ActionScreenshot()),

            new ComponentButton("Chunks", BTN_RENDERING,
                Action.createToggle(false, (c, v) => c.setShowActiveChunks(v))),
            new ComponentButton("M/webgl", BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializerDefs.canvasWebGL()))),
            new ComponentButton("M/classic", BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializerDefs.canvas2d(null)))),
            new ComponentButton("M/heatmap", BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializerDefs.canvas2d(new RenderingModeHeatmap())))),
            new ComponentButton("M/type", BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializerDefs.canvas2d(new RenderingModeElementType())))),
            new ComponentButton("M/null", BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(new RendererInitializerNull()))),
            new ComponentButton("Pixelated", BTN_RENDERING,
                Action.createToggle(true, (c, v) => c.setCanvasImageRenderingStyle(v ? 'pixelated' : 'auto'))),
        ];
        for (let tool of ToolDevDefs.TEST_TOOLS) {
            let action = Action.create(c => c.getToolManager().setPrimaryTool(tool));
            components.push(new ComponentButton(tool.getInfo().getDisplayName(), BTN_BRUSH, action));
        }

        let content = DomBuilder.div({ class: 'test-tools' }, []);
        for (let component of components) {
            content.append(component.createNode(controller));
        }
        return content;
    }
}
