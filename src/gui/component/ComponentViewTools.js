import { DomBuilder } from "../DomBuilder";
import { Component } from "./Component";
import { ActionDialogTemplateSelection } from "../action/ActionDialogTemplateSelection";
import { ToolDefs } from "../../def/ToolDefs";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
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
            let cssName = tool.getInfo().getCodeName();
            let displayName = tool.getInfo().getDisplayName();
            let badgeStyle = tool.getInfo().getBadgeStyle();

            let attributes = {
                class: 'btn btn-secondary btn-sand-game-tool ' + cssName,
                style: badgeStyle
            };
            let button = DomBuilder.button(displayName, attributes, () => {
                controller.getToolManager().setPrimaryTool(tool);
                controller.getToolManager().setSecondaryTool(ToolDefs.ERASE);
            });

            controller.getToolManager().addOnPrimaryToolChanged(newTool => {
                if (newTool === tool) {
                    button.classList.add('selected');
                } else {
                    button.classList.remove('selected');
                }
            });

            // initial select
            if (tool === controller.getToolManager().getPrimaryTool()) {
                button.classList.add('selected');
            }

            controller.getToolManager().addOnInputDisabledChanged(disabled => {
                button.disabled = disabled;
            });

            buttons.push(button);
        }

        if (this.#templates) {
            let button = DomBuilder.button('Template', { class: 'btn btn-secondary btn-sand-game-tool template'}, () => {
                new ActionDialogTemplateSelection().performAction(controller);
            });
            controller.getToolManager().addOnInputDisabledChanged(disabled => {
                button.disabled = disabled;
            });

            buttons.push(button);
        }

        return DomBuilder.div({ class: 'sand-game-tools' }, buttons);
    }
}
