import { DomBuilder } from "./DomBuilder";
import { TemplateDefs } from "../def/TemplateDefs";
import { Resources } from "../core/Resources";
import { Tools } from "../core/Tools";
import { Component } from "./Component";
import { ToolInfo } from "../core/ToolInfo";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export class ComponentViewTemplateSelection extends Component {

    createNode(controller) {
        let buttons = [];

        let templateDefinitions = [
            TemplateDefs.ROCK_SM,
            TemplateDefs.ROCK_MD,
            TemplateDefs.ROCK_LG,
            TemplateDefs.CABIN,
        ];

        for (const toolDefinition of templateDefinitions) {
            const name = toolDefinition.info.displayName;
            let loadedTool = null;

            let button = DomBuilder.button(name, { class: 'btn btn-light template-button', 'data-bs-dismiss': 'modal'}, () => {
                if (loadedTool !== null) {

                    const toolManager = controller.getToolManager();
                    const revert = toolManager.createRevertAction();

                    toolManager.setPrimaryTool(loadedTool);
                    toolManager.setSecondaryTool(Tools.actionTool(new ToolInfo(), revert));

                } else {
                    // this should not happen
                }
            });
            button.style.backgroundImage = `url(${ toolDefinition.info.icon.imageData })`;

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
