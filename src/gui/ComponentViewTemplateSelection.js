import { DomBuilder } from "./DomBuilder";
import { Templates } from "../def/Templates";
import { ResourceIO } from "../core/ResourceIO";
import { Tool } from "../core/Tool";
import { Component } from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentViewTemplateSelection extends Component {

    createNode(controller) {
        let buttons = [];

        for (const toolDefinition of Templates.TOOLS) {
            const name = toolDefinition.name;
            let loadedTool = null;

            let button = DomBuilder.button(name, { class: 'btn btn-light template-button', 'data-bs-dismiss': 'modal'}, () => {
                if (loadedTool !== null) {

                    const toolManager = controller.getToolManager();
                    const revert = toolManager.createRevertAction();

                    toolManager.setPrimaryTool(loadedTool);
                    toolManager.setSecondaryTool(Tool.actionTool(null, null, null, revert));

                } else {
                    // this should not happen
                }
            });
            button.css('background-image', `url(${ toolDefinition.icon.imageData })`);

            buttons.push(button);

            ResourceIO.parseToolDefinition(toolDefinition).then(tool => {
                loadedTool = tool;
            }).catch(e => {
                console.warn('Template loading failed: ' + e);
            });
        }

        return DomBuilder.div({ class: 'sand-game-templates' }, buttons);
    }
}
