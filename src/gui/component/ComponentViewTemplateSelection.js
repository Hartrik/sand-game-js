// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DomBuilder from "../DomBuilder";
import Resources from "../../io/Resources";
import Tools from "../../core/tool/Tools";
import Component from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-08
 */
export default class ComponentViewTemplateSelection extends Component {

    #templateDefinitions;

    constructor(templateDefinitions) {
        super();
        this.#templateDefinitions = templateDefinitions;
    }

    createNode(controller) {
        let buttons = [];

        for (const toolDefinition of this.#templateDefinitions) {
            const name = toolDefinition.info.displayName;
            let loadedTool = null;

            let button = DomBuilder.button(name, { class: 'btn btn-light template-button', 'data-bs-dismiss': 'modal'}, () => {
                if (loadedTool !== null) {

                    const toolManager = controller.getToolManager();
                    const revert = toolManager.createRevertAction();

                    toolManager.setPrimaryTool(loadedTool);
                    toolManager.setSecondaryTool(Tools.actionTool(revert));

                } else {
                    // this should not happen
                }
            });
            if (toolDefinition.info.icon !== undefined) {
                button.style.backgroundImage = `url(${ toolDefinition.info.icon.imageData })`;
            }

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
