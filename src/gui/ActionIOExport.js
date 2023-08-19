import { Action } from "./Action";
import { Analytics } from "../Analytics";
import { ResourceIO } from "../core/ResourceIO";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ActionIOExport extends Action {

    performAction(controller) {
        const snapshot = controller.createSnapshot();
        const bytes = ResourceIO.createResourceFromSnapshot(snapshot);
        FileSaver.saveAs(new Blob([bytes]), this.#createFilename());
        Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_EXPORT);
    }

    #createFilename() {
        let date = new Date().toISOString().slice(0, 10);
        return `sand-game-js_${date}.sgjs`;
    }
}
