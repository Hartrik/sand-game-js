// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Action from "./Action";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-05
 */
export default class ActionFill extends Action {

    performAction(controller) {
        const sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }
        const primaryTool = controller.getToolManager().getPrimaryTool();
        if (!primaryTool.isAreaModeEnabled()) {
            return;
        }
        primaryTool.applyArea(0, 0, sandGame.getWidth(), sandGame.getHeight(), sandGame.graphics(), false);
    }
}
