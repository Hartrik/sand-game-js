import { DomBuilder } from "./DomBuilder";
import { Templates } from "../def/Templates";
import { Resources } from "../core/Resources";
import { Tool } from "../core/Tool";
import { Component } from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-20
 */
export class ComponentViewTemplateSelection extends Component {

    createNode(controller) {
        let buttons = [];

        let templateDefinitions = [
            Templates.ROCK_SM,
            Templates.ROCK_MD,
            Templates.ROCK_LG,
            Templates.CABIN,
        ];

        for (const toolDefinition of templateDefinitions) {
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

            Resources.parseToolDefinition(toolDefinition).then(tool => {
                loadedTool = tool;
            }).catch(e => {
                console.warn('Template loading failed: ' + e);
            });
        }

        return DomBuilder.div({ class: 'sand-game-templates' }, buttons);
    }
}
