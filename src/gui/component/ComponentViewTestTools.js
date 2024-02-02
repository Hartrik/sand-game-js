import { DomBuilder } from "../DomBuilder";
import { Action } from "../action/Action";
import { ActionsTest } from "../action/ActionsTest";
import { ActionBenchmark } from "../action/ActionBenchmark";
import { Component } from "./Component";
import { ComponentButton } from "./ComponentButton";
import { ToolDefs } from "../../def/ToolDefs";
import { RendererInitializer } from "../../core/rendering/RendererInitializer";
import { ActionScreenshot } from "../action/ActionScreenshot";
import { ActionRecord } from "../action/ActionRecord";
import { ActionFill } from "../action/ActionFill";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-02
 */
export class ComponentViewTestTools extends Component {

    static #BTN_SCENE = ComponentButton.CLASS_OUTLINE_SECONDARY;
    static #BTN_RENDERING = ComponentButton.CLASS_OUTLINE_INFO;
    static #BTN_TOOL = ComponentButton.CLASS_OUTLINE_PRIMARY;
    static #BTN_BRUSH = ComponentButton.CLASS_OUTLINE_SUCCESS;

    static COMPONENTS = [
        new ComponentButton("All materials", ComponentViewTestTools.#BTN_SCENE, ActionsTest.ALL_MATERIALS),
        new ComponentButton("Tree spawn", ComponentViewTestTools.#BTN_SCENE, ActionsTest.TREE_SPAWN_TEST),
        new ComponentButton("Tree grow", ComponentViewTestTools.#BTN_SCENE, ActionsTest.treeGrowTest(0)),
        new ComponentButton("Tree grown", ComponentViewTestTools.#BTN_SCENE, ActionsTest.treeGrowTest(-1)),
        new ComponentButton("Fill", ComponentViewTestTools.#BTN_SCENE, new ActionFill()),

        new ComponentButton("Benchmark", ComponentViewTestTools.#BTN_TOOL, new ActionBenchmark()),
        new ComponentButton("Screenshot", ComponentViewTestTools.#BTN_TOOL, new ActionScreenshot()),
        new ComponentButton("Record (start/stop)", ComponentViewTestTools.#BTN_TOOL, new ActionRecord()),

        new ComponentButton("Chunks", ComponentViewTestTools.#BTN_RENDERING,
                Action.createToggle(false, (c, v) => c.setShowActiveChunks(v))),
        new ComponentButton("M/webgl", ComponentViewTestTools.#BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializer.canvasWebGL()))),
        new ComponentButton("M/classic", ComponentViewTestTools.#BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializer.canvas2d()))),
        new ComponentButton("M/heatmap", ComponentViewTestTools.#BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializer.canvas2dHeatmap()))),
        new ComponentButton("M/type", ComponentViewTestTools.#BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializer.canvas2dElementType()))),
        new ComponentButton("M/null", ComponentViewTestTools.#BTN_RENDERING,
                Action.create(c => c.setRendererInitializer(RendererInitializer.nullRenderer()))),
        new ComponentButton("Pixelated", ComponentViewTestTools.#BTN_RENDERING,
                Action.createToggle(true, (c, v) => c.setCanvasImageRenderingStyle(v ? 'pixelated' : 'auto'))),
    ];


    createNode(controller) {
        let content = DomBuilder.div({ class: 'test-tools' }, []);

        let components = [...ComponentViewTestTools.COMPONENTS];
        for (let tool of ToolDefs.TEST_TOOLS) {
            let action = Action.create(c => c.getToolManager().setPrimaryTool(tool));
            components.push(new ComponentButton(tool.getInfo().getDisplayName(), ComponentViewTestTools.#BTN_BRUSH, action));
        }

        for (let component of components) {
            content.append(component.createNode(controller));
        }
        return content;
    }
}
