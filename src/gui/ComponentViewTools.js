import { DomBuilder } from "./DomBuilder";
import { Component } from "./Component";
import { ActionDialogTemplateSelection } from "./ActionDialogTemplateSelection";
import { ToolDefs } from "../def/ToolDefs";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentViewTools extends Component {

    /** @type Tool[] */
    #tools;

    /** @type boolean */
    #templates;

    /**
     * @param tools {Tool[]}
     * @param templates {boolean}
     */
    constructor(tools, templates) {
        super();
        this.#tools = tools;
        this.#templates = templates;
    }

    createNode(controller) {
        let buttons = [];

        for (let tool of this.#tools) {
            let cssName = tool.getCodeName();
            let displayName = tool.getDisplayName();
            let button = DomBuilder.button(displayName, { class: 'btn btn-secondary btn-sand-game-tool ' + cssName }, () => {
                controller.getToolManager().setPrimaryTool(tool);
                controller.getToolManager().setSecondaryTool(ToolDefs.byCodeName('air'));
            });

            controller.getToolManager().addOnPrimaryToolChanged(newTool => {
                if (newTool === tool) {
                    button.addClass('selected');
                } else {
                    button.removeClass('selected');
                }
            });

            // initial select
            if (tool === controller.getToolManager().getPrimaryTool()) {
                button.addClass('selected');
            }

            buttons.push(button);
        }

        if (this.#templates) {
            let button = DomBuilder.button('Template', { class: 'btn btn-secondary btn-sand-game-tool template'}, () => {
                new ActionDialogTemplateSelection().performAction(controller);
            });
            buttons.push(button);
        }

        return DomBuilder.div({ class: 'sand-game-tools' }, buttons);
    }
}
