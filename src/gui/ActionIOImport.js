import { Action } from "./Action";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ActionIOImport extends Action {

    performAction(controller) {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            controller.getIOManager().loadFromFiles(e.target.files);
        }
        input.click();
    }
}
