import { Action } from "./Action";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-05
 */
export class ActionFill extends Action {

    performAction(controller) {
        const sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }
        const primaryTool = controller.getToolManager().getPrimaryTool();
        if (!primaryTool.isSelectionEnabled()) {
            return;
        }
        primaryTool.applyArea(0, 0, sandGame.getWidth(), sandGame.getHeight(), sandGame.graphics(), false);
    }
}
