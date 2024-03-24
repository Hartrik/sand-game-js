// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Action from "./Action";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-11-20
 */
export default class ActionScreenshot extends Action {

    performAction(controller) {
        const canvas = controller.getCanvas();
        if (canvas !== null) {
            canvas.toBlob((blob) => {
                FileSaver.saveAs(blob, this.#formatDate(new Date()) + '.png');
            });
        }
    }

    #formatDate(date) {
        let dd = String(date.getDate()).padStart(2, '0');
        let MM = String(date.getMonth() + 1).padStart(2, '0');  // January is 0!
        let yyyy = date.getFullYear();

        let hh = String(date.getHours()).padStart(2, '0');
        let mm = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${MM}-${dd}_${hh}-${mm}`;
    }
}
