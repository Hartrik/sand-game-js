import { DomBuilder } from "./DomBuilder";
import { Action } from "./Action";
import { ActionsTest } from "./ActionsTest";
import { ActionBenchmark } from "./ActionBenchmark";
import { Component } from "./Component";
import { ComponentButton } from "./ComponentButton";
import { Tools } from "../def/Tools";
import { SandGame } from "../core/SandGame";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentViewTestTools extends Component {

    static COMPONENTS = [
        new ComponentButton("Tree spawn", ComponentButton.CLASS_SECONDARY, ActionsTest.TREE_SPAWN_TEST),
        new ComponentButton("Tree grow", ComponentButton.CLASS_SECONDARY, ActionsTest.TREE_GROW_TEST),

        new ComponentButton("Chunks", ComponentButton.CLASS_INFO, Action.createToggle(false, (c, v) => c.setShowActiveChunks(v))),
        new ComponentButton("M/classic", ComponentButton.CLASS_INFO, Action.create(c => c.setRenderingMode(SandGame.RENDERING_MODE_CLASSIC))),
        new ComponentButton("M/heatmap", ComponentButton.CLASS_INFO, Action.create(c => c.setRenderingMode(SandGame.RENDERING_MODE_HEATMAP))),
        new ComponentButton("M/element_type", ComponentButton.CLASS_INFO, Action.create(c => c.setRenderingMode(SandGame.RENDERING_MODE_ELEMENT_TYPE))),
        new ComponentButton("Pixelated", ComponentButton.CLASS_INFO, Action.createToggle(true, (c, v) => c.setCanvasImageRenderingStyle(v ? 'pixelated' : 'auto'))),

        new ComponentButton("Benchmark", ComponentButton.CLASS_WARNING, new ActionBenchmark()),
    ];


    createNode(controller) {
        let content = DomBuilder.div({ class: 'test-tools' }, []);

        let components = [...ComponentViewTestTools.COMPONENTS];
        for (let tool of Tools.TEST_TOOLS) {
            let action = Action.create(c => c.getToolManager().setPrimaryTool(tool));
            components.push(new ComponentButton(tool.getDisplayName(), ComponentButton.CLASS_SUCCESS, action));
        }

        for (let component of components) {
            content.append(component.createNode(controller));
        }
        return content;
    }
}
