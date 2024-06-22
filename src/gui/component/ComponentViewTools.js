// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DomBuilder from "../DomBuilder";
import Component from "./Component";
import ActionDialogTemplateSelection from "../action/ActionDialogTemplateSelection";
import ToolDefs from "../../def/ToolDefs";
import TemplateSelectionFakeTool from "../../core/tool/TemplateSelectionFakeTool";
import GlobalActionTool from "../../core/tool/GlobalActionTool";
import SelectionFakeTool from "../../core/tool/SelectionFakeTool";
import Resources from "../../io/Resources";
import Tools from "../../core/tool/Tools";

/**
 *
 * @author Patrik Harag
 * @version 2024-06-22
 */
export default class ComponentViewTools extends Component {

    static #BUTTON_TYPE = 'btn-sand-game-tool';

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
            const info = tool.getInfo();
            let codeName = info.getCodeName();
            let badgeStyle = info.getBadgeStyle();

            if (tool instanceof SelectionFakeTool) {

                const ulContent = [];
                for (const innerTool of tool.getTools()) {
                    const innerInfo = innerTool.getInfo();
                    const innerButton = this.#createButton(innerTool, innerInfo, controller, true)
                    ulContent.push(DomBuilder.element('li', null, innerButton));
                }

                const buttonContent = this.#createButtonContent(info);
                const button = DomBuilder.div({ class: 'btn-group' }, [
                    DomBuilder.button(buttonContent, {
                        class: 'btn btn-secondary dropdown-toggle ' + ComponentViewTools.#BUTTON_TYPE + ' ' + codeName,
                        style: badgeStyle,
                        'data-bs-toggle': 'dropdown',
                        'aria-expanded': 'false'
                    }),
                    DomBuilder.element('ul', {
                        class: 'dropdown-menu ' + (ulContent.length > 10 ? 'sand-game-column-count-2' : '')
                    }, ulContent)
                ]);

                buttons.push(button);

            } else {
                const button = this.#createButton(tool, info, controller, false);
                buttons.push(button);
            }
        }

        return DomBuilder.div({ class: 'sand-game-tools' }, buttons);
    }

    #createButton(tool, info, controller, dropdown) {
        const codeName = info.getCodeName();
        const badgeStyle = info.getBadgeStyle();

        const buttonAttributes = {
            class: 'btn btn-secondary ' + ComponentViewTools.#BUTTON_TYPE,
            style: badgeStyle
        };
        const buttonContent = this.#createButtonContent(info);

        let button;
        if (dropdown) {
            const ovContent = DomBuilder.span(buttonContent, buttonAttributes)
            const ovAttributes = {
                class: 'dropdown-item',
            };
            button = DomBuilder.button(ovContent, ovAttributes);
        } else {
            button = DomBuilder.button(buttonContent, buttonAttributes);
        }

        // init button

        button.addEventListener('click', () => {
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

        // input disabled
        controller.getToolManager().addOnInputDisabledChanged(disabled => {
            button.disabled = disabled;
        });

        return button;
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
            const templateDefinitions = tool.getTemplateDefinitions();
            if (Array.isArray(templateDefinitions)) {
                // multiple templates
                const action = new ActionDialogTemplateSelection(templateDefinitions, additionalInfo);
                action.performAction(controller);
            } else {
                // single template
                Resources.parseToolDefinition(templateDefinitions).then(tool => {
                    const toolManager = controller.getToolManager();
                    const revert = toolManager.createRevertAction();
                    toolManager.setPrimaryTool(tool);
                    toolManager.setSecondaryTool(Tools.actionTool(revert));
                }).catch(e => {
                    console.warn('Template loading failed: ' + e);
                });
            }
        } else if (tool instanceof GlobalActionTool) {
            const handler = tool.getHandler();
            const sandGame = controller.getSandGame();
            if (sandGame !== null) {
                handler(sandGame);
            }
        } else {
            controller.getToolManager().setPrimaryTool(tool);
            controller.getToolManager().setSecondaryTool(ToolDefs.ERASE);
        }
    }

    #createButtonContent(info) {
        let displayName = info.getDisplayName();
        const svgIcon = info.getSvgIcon();
        if (svgIcon !== undefined) {
            return [ DomBuilder.create(svgIcon),  displayName ];
        } else {
            return displayName;
        }
    }
}
