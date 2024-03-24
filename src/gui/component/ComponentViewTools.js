// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DomBuilder from "../DomBuilder";
import Component from "./Component";
import ActionDialogTemplateSelection from "../action/ActionDialogTemplateSelection";
import ToolDefs from "../../def/ToolDefs";
import TemplateSelectionFakeTool from "../../core/tool/TemplateSelectionFakeTool";
import GlobalActionTool from "../../core/tool/GlobalActionTool";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-13
 */
export default class ComponentViewTools extends Component {

    /** @type Tool[] */
    #tools;
    /** @type boolean */
    #importEnabled;

    /**
     * @param tools {Tool[]}
     * @param importEnabled {boolean}
     */
    constructor(tools, importEnabled = false) {
        super();
        this.#tools = tools;
        this.#importEnabled = importEnabled;
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
                this.#selectTool(tool, controller);
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

        return DomBuilder.div({ class: 'sand-game-tools' }, buttons);
    }

    #selectTool(tool, controller) {
        if (tool instanceof TemplateSelectionFakeTool) {
            let additionalInfo = null;
            if (this.#importEnabled) {
                additionalInfo = DomBuilder.div(null, [
                    DomBuilder.par(null, ""),
                    DomBuilder.par(null, "You can also create your own template using an image. See the Import button.")
                ]);
            }
            const action = new ActionDialogTemplateSelection(tool.getTemplateDefinitions(), additionalInfo);
            action.performAction(controller);
        } else if (tool instanceof GlobalActionTool) {
            const handler = tool.getHandler();
            handler(controller.getSandGame());
        } else {
            controller.getToolManager().setPrimaryTool(tool);
            controller.getToolManager().setSecondaryTool(ToolDefs.ERASE);
        }
    }
}
